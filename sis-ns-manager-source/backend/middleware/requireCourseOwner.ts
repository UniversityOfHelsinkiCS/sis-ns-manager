import type { NextFunction, Request, Response } from 'express'
import type { User } from '../../common/types.ts'
import { getCourse } from '../utils/sisService.ts'

// Ensure the course :id belongs to the current user. getCourse is scoped to the
// user's own course_unit_realisations, so a course they don't teach resolves to
// undefined and the request is rejected.
const requireCourseOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as User
  const course = await getCourse(user, req.params.id)

  if (!course) {
    res.status(403).json({ message: 'Not your course' })
    return
  }

  next()
}

export default requireCourseOwner
