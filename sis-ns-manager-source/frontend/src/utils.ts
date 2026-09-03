import type { CourseUnitRealisation } from '@common/types'

// OKD CS admins — contact address for access requests and advanced management
// that this UI doesn't cover.
export const ADMIN_EMAIL = 'grp-okd-cs-admins@helsinki.fi'

export function getCourseEndDate(course: CourseUnitRealisation): Date {
  return new Date(course.activityPeriod.endDate as string)
}

export function getActiveUntil(course: CourseUnitRealisation): Date {
  const end = getCourseEndDate(course)
  end.setDate(end.getDate() + 30)
  return end
}

export function courseNsName(course: CourseUnitRealisation): string {
  const name = (course.name.fi ?? course.name.en ?? course.id) as string
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  const year = new Date(course.activityPeriod.startDate as string).getFullYear()
  return `tkt-cs-${slug}-${year}`
}

// RFC 1123 label — the constraint Kubernetes puts on namespace / OpenShift
// project names. Mirrors isValidNamespaceName on the backend, which is the
// authoritative check; this one is just for inline form feedback.
export const NS_NAME_MAX = 63
const NS_NAME_RE = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/

export function validateNsName(name: string): string | null {
  const n = name.trim()
  if (!n) return 'Required'
  if (n.length > NS_NAME_MAX) return `Too long (max ${NS_NAME_MAX} characters)`
  if (!NS_NAME_RE.test(n)) return 'Use lowercase letters, digits and hyphens only'
  return null
}

export function formatDate(iso: string | Date): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
