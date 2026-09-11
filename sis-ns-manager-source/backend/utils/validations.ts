import { OKD_TEACHERS_GROUP, DEMO_USER_USERNAME } from './config.ts'

type WithGroups = { hyGroupCn?: string[] }
type WithUsername = { username?: string }

export const isDemoUser = (user: WithUsername): boolean =>
  user.username === DEMO_USER_USERNAME

export const isAllowed = (user: WithGroups & WithUsername): boolean =>
  isDemoUser(user) || (user.hyGroupCn?.includes(OKD_TEACHERS_GROUP) ?? false)

// RFC 1123 label — Kubernetes' constraint on namespace / OpenShift project
// names. Validating a user-supplied name against this allowlist before it
// reaches the cluster API is what keeps the name safe to use (no path, header
// or object-name injection is possible with only [a-z0-9-]).
const NAMESPACE_NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/

export const isValidNamespaceName = (name: unknown): name is string =>
  typeof name === 'string' &&
  name.length >= 1 &&
  name.length <= 63 &&
  NAMESPACE_NAME_RE.test(name)
