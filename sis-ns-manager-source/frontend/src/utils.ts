import type { CourseUnitRealisation, Student } from '@common/types'

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

// Lowercase a-z0-9 with hyphens, at most `max` characters. Accents are dropped
// rather than turned into hyphens (ä -> a, ö -> o): NFD splits "ä" into "a" +
// a combining mark, and the marks are then removed.
const slugify = (text: string, max: number): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .slice(0, max)
    .replace(/-+$/, '')

// Default namespace name, `<slug>-<year><suffix>` (suffix e.g. `-3` for group
// 3). The slug is shortened so the whole name fits NS_NAME_MAX — the year and
// suffix are always kept.
export function courseNsName(course: CourseUnitRealisation, suffix = ''): string {
  const name = (course.name.fi ?? course.name.en ?? course.id) as string
  const tail = `-${new Date(course.activityPeriod.startDate as string).getFullYear()}${suffix}`
  const max = NS_NAME_MAX - tail.length
  // Fall back to the course id if the name has no usable characters.
  const slug = slugify(name, max) || slugify(course.id, max)
  return `${slug}${tail}`
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

// Format guard for a manually-typed uid (e.g. a TA added by username rather
// than picked from the course roster). isValidUsername on the backend is the
// authoritative check (and allows up to 64 characters); this one is just for
// inline form feedback, capped tighter at 12 to match real uid lengths.
export const USERNAME_MAX = 12
const USERNAME_RE = /^[a-zA-Z0-9._-]{1,64}$/

export function validateUsername(name: string): string | null {
  const n = name.trim()
  if (!n) return 'Required'
  if (n.length > USERNAME_MAX) return `Too long (max ${USERNAME_MAX} characters)`
  if (!USERNAME_RE.test(n)) return 'Use letters, digits, dots, hyphens and underscores only'
  return null
}

// The uid (part of eduPersonPrincipalName before '@') — the same identifier the
// backend grants namespace access to. Falls back to the student number.
export const studentUsername = (s: Student): string =>
  s.eduPersonPrincipalName?.split('@')[0] || s.studentNumber

export const studentName = (s: Student): string =>
  [s.firstNames?.split(' ')[0], s.lastName].filter(Boolean).join(' ')

// Alphabetical by username — for a predictable roster order.
export const byStudentUsername = (a: Student, b: Student): number =>
  studentUsername(a).localeCompare(studentUsername(b))

export function formatDate(iso: string | Date): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
