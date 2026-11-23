import { SelfServiceCourse } from '../db/models/SelfServiceCourse.ts'
import { SelfServiceCourseResponsibility } from '../db/models/SelfServiceCourseResponsibility.ts'

export const createSelfServiceCourse = async (
    course_unit_realisation_code: string,
    source_course_name: string,
    start_date: string,
    end_date: string,
    self_service_enabled: boolean,
    demo_only: boolean,
    ns_prefix: string
): Promise<void> => {
  const now = new Date()
  await SelfServiceCourse.create({
    course_unit_realisation_code,
    source_course_name,
    start_date,
    end_date,
    self_service_enabled,
    demo_only,
    ns_prefix,
    created_at: now,
    updated_at: now
  })
}

export const createSelfServiceCourseResponsibility = async (
    course_unit_realisation_code: string,
    responsibility: string,
    demo_only: boolean
): Promise<void> => {
  const now = new Date()
  await SelfServiceCourseResponsibility.create({
    course_unit_realisation_code,
    responsibility,
    demo_only,
    created_at: now,
    updated_at: now
  })
}
