import express from 'express'
import type { User } from '../../common/types.ts'
import { getCourses, getStudents } from '../utils/sisService.ts'

const sisRouter = express.Router()

sisRouter.get('/courses', async (req, res) => {
  const user = req.user as User
  res.send(await getCourses(user))
})

sisRouter.get('/courses/:id/students', async (req, res) => {
  const user = req.user as User
  res.send(await getStudents(user, req.params.id))
})

export default sisRouter
