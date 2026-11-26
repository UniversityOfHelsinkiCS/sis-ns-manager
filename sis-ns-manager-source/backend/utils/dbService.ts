import { SelfServiceCourse } from '../db/models/SelfServiceCourse.ts'
import { SelfServiceCourseResponsibility } from '../db/models/SelfServiceCourseResponsibility.ts'

export const createSelfServiceCourse = async (
    course_unit_realisation_code: string,
    source_course_name: string,
    start_date: string,
    end_date: string,
    self_service_enabled: boolean,
    allowing_teacher_username: string,
    demo_only: boolean,
    ns_prefix: string
): Promise<number> => {
  const now = new Date()
  const self_service_course = await SelfServiceCourse.create({
    course_unit_realisation_code,
    source_course_name,
    start_date,
    end_date,
    self_service_enabled,
    allowing_teacher_username,
    demo_only,
    ns_prefix,
    created_at: now,
    updated_at: now
  })
  return self_service_course.id
}

export const deleteSelfServiceCourse = async (
    self_service_course_id: number
): Promise<void> => {
  await SelfServiceCourse.destroy({
    where: { id: self_service_course_id }
  })
}

export const getSelfServiceCourseByCourseCode = async (
    course_code: string
): Promise<SelfServiceCourse|null> => {
  return await SelfServiceCourse.findOne({
    where: { course_unit_realisation_code: course_code }
  })
}

export const createSelfServiceCourseResponsibility = async (
    self_service_course_id: number,
    responsibility: string,
    demo_only: boolean
): Promise<number> => {
  const now = new Date()
  const self_service_course_responsibility = await SelfServiceCourseResponsibility.create({
    self_service_course_id,
    responsible_person_id: responsibility,
    demo_only,
    created_at: now,
    updated_at: now
  })
  return self_service_course_responsibility.id
}
