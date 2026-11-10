import axios from 'axios'
import type { Student } from '@common/types'

// Students enrolled on a course (the course roster).
export const getCourseStudents = async (courseId: string): Promise<Student[]> => {
  const { data } = await axios.get<Student[]>(
    `/api/sis/courses/${encodeURIComponent(courseId)}/students`,
  )
  return data
}
