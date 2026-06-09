import type { CourseUnitRealisation } from '@common/types'

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

export function formatDate(iso: string | Date): string {
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${dd}-${mm}-${yyyy}`
}
