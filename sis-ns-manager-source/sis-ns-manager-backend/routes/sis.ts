import express from 'express'
import axios from 'axios'
import type { User } from '../../sis-ns-manager-common/types.ts'
import { DATABASE_URL } from '../utils/config.ts'
const sisRouter = express.Router()

const api = axios.create({
  baseURL: DATABASE_URL,
})

sisRouter.get('/courses', async (req, res) => {
  const user = req.user as User
  const { data } = await api.get(`/employees/${user.hyPersonSisuId}/course_unit_realisations`)
  res.send(data)
})

sisRouter.get('/courses/:id/students', async (req, res) => {
  const { id } = req.params
  const { data } = await api.get(`/course_unit_realisations/${id}/enrolments`)
  res.send(data.map((e: { student: unknown }) => e.student))
})

sisRouter.get('/test',async (req, res) => {
  res.json(req.user)
})


export default sisRouter