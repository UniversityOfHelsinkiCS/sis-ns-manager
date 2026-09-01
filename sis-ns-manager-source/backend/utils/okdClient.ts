import {
  KubeConfig,
  CoreV1Api,
  CustomObjectsApi,
  RbacAuthorizationV1Api,
  PatchStrategy,
  setHeaderOptions,
  type V1Namespace,
} from '@kubernetes/client-node'

// Annotations stamped on namespaces we provision.
export const PROVISIONER_ANNOTATION = 'sis-ns-manager/provisioner'
export const END_DATE_ANNOTATION = 'sis-ns-manager/endDate'

let cached: {
  core: CoreV1Api
  custom: CustomObjectsApi
  rbac: RbacAuthorizationV1Api
} | null = null

// Load in-cluster config lazily so importing this module does not fail when the
// server runs outside the cluster (e.g. local dev with the mock user). The
// in-cluster service account credentials are mounted into the pod.
const clients = () => {
  if (!cached) {
    const kc = new KubeConfig()
    kc.loadFromCluster()
    cached = {
      core: kc.makeApiClient(CoreV1Api),
      custom: kc.makeApiClient(CustomObjectsApi),
      rbac: kc.makeApiClient(RbacAuthorizationV1Api),
    }
  }
  return cached
}

export const listNamespacesByAnnotation = async (
  key: string,
  value: string,
): Promise<V1Namespace[]> => {
  const { core } = clients()
  const list = await core.listNamespace()
  return list.items.filter((ns) => ns.metadata?.annotations?.[key] === value)
}

// Self-provision a new OKD project via a ProjectRequest. This goes through the
// cluster's project-request template so the namespace inherits org-wide policy
// (quotas, limit ranges, network policies, default role bindings).
export const createProject = async (name: string, displayName?: string) => {
  const { custom } = clients()
  await custom.createClusterCustomObject({
    group: 'project.openshift.io',
    version: 'v1',
    plural: 'projectrequests',
    body: {
      apiVersion: 'project.openshift.io/v1',
      kind: 'ProjectRequest',
      metadata: { name },
      displayName,
    },
  })
}

// Merge-patch annotations onto an existing namespace (leaves other annotations
// such as the project-request defaults intact).
export const patchNamespaceAnnotations = async (
  name: string,
  annotations: Record<string, string>,
) => {
  const { core } = clients()
  await core.patchNamespace(
    { name, body: { metadata: { annotations } } },
    setHeaderOptions('Content-Type', PatchStrategy.MergePatch),
  )
}

// Returns the provisioner annotation of a namespace, or null if the namespace
// does not exist or carries no provisioner. Used to verify ownership before
// mutating a namespace, so a caller cannot target namespaces they did not
// provision through this app.
export const getNamespaceProvisioner = async (
  name: string,
): Promise<string | null> => {
  const { core } = clients()
  try {
    const ns = await core.readNamespace({ name })
    return ns.metadata?.annotations?.[PROVISIONER_ANNOTATION] ?? null
  } catch (err) {
    const status = (err as { code?: number; statusCode?: number }).code
      ?? (err as { statusCode?: number }).statusCode
    if (status === 404) return null
    throw err
  }
}

// Grant each user `admin` within the namespace via a per-user RoleBinding to the
// OpenShift `admin` ClusterRole. Idempotent: an already-existing binding (409)
// is ignored, so re-running to add more students is safe.
export const grantNamespaceAdmin = async (
  namespace: string,
  usernames: string[],
) => {
  const { rbac } = clients()

  for (const username of usernames) {
    const body = {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: 'RoleBinding',
      metadata: { name: `sis-ns-manager-admin-  `, namespace },
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: 'ClusterRole',
        name: 'admin',
      },
      subjects: [
        { apiGroup: 'rbac.authorization.k8s.io', kind: 'User', name: username },
      ],
    }

    try {
      await rbac.createNamespacedRoleBinding({ namespace, body })
    } catch (err) {
      const status = (err as { code?: number; statusCode?: number }).code
        ?? (err as { statusCode?: number }).statusCode
      if (status !== 409) throw err
    }
  }
}
