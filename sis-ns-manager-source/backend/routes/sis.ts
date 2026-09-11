import express from 'express'
import type { User } from '../../common/types.ts'
import { getCourses, getStudents } from '../utils/sisService.ts'
import requireCourseOwner from '../middleware/requireCourseOwner.ts'

const sisRouter = express.Router()

// gets the courses per the authenticated user, cannot be queried/
// does not work without valid authentication
sisRouter.get('/courses', async (req, res) => {
  const user = req.user as User
  res.send(await getCourses(user))
})

// also uses authenticated user, but the parameter is also verified against
// the user in the service
sisRouter.get('/courses/:id/students', requireCourseOwner, async (req, res) => {
  const user = req.user as User
  res.send(await getStudents(user, req.params.id))
})

export default sisRouter
