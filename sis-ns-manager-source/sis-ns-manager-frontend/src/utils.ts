import type { Course } from '@common/types'

// Approximate end month/day for each academic period
const PERIOD_END: Record<string, [month: number, day: number]> = {
  I:   [10, 31],
  II:  [12, 20],
  III: [3,  15],
  IV:  [5,  15],
  V:   [7,  31],
}

export function getPeriodEnd(course: Course): Date {
  const [month, day] = PERIOD_END[course.period] ?? [5, 31]
  return new Date(course.year, month - 1, day)
}

export function getActiveUntil(course: Course): Date {
  const end = getPeriodEnd(course)
  end.setDate(end.getDate() + 30)
  return end
}

export function courseNsName(course: Course): string {
  const slug = course.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `tkt-cs-${slug}-${course.year}`
}

export function formatDate(iso: string | Date): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
