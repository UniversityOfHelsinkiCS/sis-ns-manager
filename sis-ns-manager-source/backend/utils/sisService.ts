import axios from 'axios'

import type { CourseUnitRealisation, Student, User } from '../../common/types.ts'
import { DATABASE_URL } from './config.ts'
import { isDemoUser } from './validations.ts'
import { demoCourses, getDemoStudents, getDemoStudentsByNumbers } from './demoData.ts'

const api = axios.create({ baseURL: DATABASE_URL })

export const getCourses = async (user: User): Promise<CourseUnitRealisation[]> => {
  if (isDemoUser(user)) return demoCourses

  const { data } = await api.get(
    `/employees/${user.hyPersonSisuId}/course_unit_realisations`,
  )
  return data
}

export const getCourse = async (
  user: User,
  id: string,
): Promise<CourseUnitRealisation | undefined> => {
  const courses = await getCourses(user)
  return courses.find((course) => course.id === id)
}

export const getStudents = async (
  user: User,
  courseId: string,
): Promise<Student[]> => {
  if (isDemoUser(user)) return getDemoStudents(courseId)

  const { data } = await api.get(`/course_unit_realisations/${courseId}/enrolments`)
  return data.map((e: { student: unknown }) => e.student)
}

// Looks up full person records by student number (POST /students). The returned
// records carry eduPersonPrincipalName, from which the uid is derived.
export const getStudentsByNumbers = async (
  user: User,
  studentNumbers: string[],
): Promise<Student[]> => {
  if (isDemoUser(user)) return getDemoStudentsByNumbers(studentNumbers)

  const { data } = await api.post('/students', { studentNumbers })
  return data
}
