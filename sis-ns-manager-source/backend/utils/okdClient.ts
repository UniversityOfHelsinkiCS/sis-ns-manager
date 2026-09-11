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
// SIS course id the namespace belongs to. Lets the UI associate namespaces with
// a course by annotation rather than by a derived name, so the name is free to
// be customised at creation time.
export const COURSE_ANNOTATION = 'sis-ns-manager/course'

const errStatus = (err: unknown): number | undefined =>
  (err as { code?: number }).code ?? (err as { statusCode?: number }).statusCode

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
    if (errStatus(err) === 404) return null
    throw err
  }
}

// One OpenShift Group per namespace holds everyone who should have namespace
// admin (the provisioner plus any students granted access); a single RoleBinding
// binds that group to the `admin` ClusterRole. This replaces the previous
// per-user RoleBindings.
const GROUP_API = { group: 'user.openshift.io', version: 'v1', plural: 'groups' }
const ADMIN_ROLEBINDING = 'sis-ns-manager-admin'
const adminGroupName = (namespace: string) => `sis-ns-manager-${namespace}`

// Create the namespace's admin Group with `usernames`, or add them to it if it
// already exists (membership is the union). The group is owned by the namespace,
// so it is garbage-collected when the namespace is deleted.
const ensureAdminGroup = async (namespace: string, usernames: string[]) => {
  const { core, custom } = clients()
  const name = adminGroupName(namespace)
  const wanted = [...new Set(usernames)]

  let current: string[] | null = null
  try {
    const group = (await custom.getClusterCustomObject({
      ...GROUP_API,
      name,
    })) as unknown as { users?: string[] }
    current = group.users ?? []
  } catch (err) {
    if (errStatus(err) !== 404) throw err
  }

  if (current === null) {
    const ns = await core.readNamespace({ name: namespace })
    await custom.createClusterCustomObject({
      ...GROUP_API,
      body: {
        apiVersion: 'user.openshift.io/v1',
        kind: 'Group',
        metadata: {
          name,
          ownerReferences: ns.metadata?.uid
            ? [{ apiVersion: 'v1', kind: 'Namespace', name: namespace, uid: ns.metadata.uid }]
            : undefined,
        },
        users: wanted,
      },
    })
    return
  }

  const merged = [...new Set([...current, ...wanted])]
  if (merged.length === current.length) return
  await custom.patchClusterCustomObject(
    { ...GROUP_API, name, body: { users: merged } },
    setHeaderOptions('Content-Type', PatchStrategy.MergePatch),
  )
}

// Bind the namespace's admin Group to the `admin` ClusterRole. Idempotent: an
// already-existing binding (409) is ignored.
const ensureGroupAdminBinding = async (namespace: string) => {
  const { rbac } = clients()
  try {
    await rbac.createNamespacedRoleBinding({
      namespace,
      body: {
        apiVersion: 'rbac.authorization.k8s.io/v1',
        kind: 'RoleBinding',
        metadata: { name: ADMIN_ROLEBINDING, namespace },
        roleRef: {
          apiGroup: 'rbac.authorization.k8s.io',
          kind: 'ClusterRole',
          name: 'admin',
        },
        subjects: [
          {
            apiGroup: 'rbac.authorization.k8s.io',
            kind: 'Group',
            name: adminGroupName(namespace),
          },
        ],
      },
    })
  } catch (err) {
    if (errStatus(err) !== 409) throw err
  }
}

// Grant namespace-level `admin` to each user by adding them to the namespace's
// admin Group (creating it on first use) and binding that group to the `admin`
// ClusterRole. Idempotent: safe to re-run to add more users.
export const grantNamespaceAdmin = async (
  namespace: string,
  usernames: string[],
) => {
  await ensureAdminGroup(namespace, usernames)
  await ensureGroupAdminBinding(namespace)
}
