import express from 'express'
import type { User } from '../../common/types.ts'
import requireCourseOwner from '../middleware/requireCourseOwner.ts'
import { demoOnly } from '../utils/config.ts'
import {
  createSelfServiceCourse,
  deleteSelfServiceCourse,
  createSelfServiceCourseResponsibility
} from '../utils/dbService.ts'

const dbRouter = express.Router()

// makes the course self-provisionable
dbRouter.post('/allow-self-provisioning/:id', requireCourseOwner, async (
  req: express.Request, res: express.Response
) => {
  try {
    const user = req.user as User
    const { id: courseId } = req.params
    const {
      nsPrefix,
      usernames,
      courseName,
      startDate,
      endDate
    } = req.body
    if (typeof courseId !== 'string') {
      console.error('Expected course ID as a string')
      res.status(400).send({ success: false, error: 'Expected course ID as a string' })
      return
    }
    let selfServiceCourseId: number
    try {
      selfServiceCourseId = await createSelfServiceCourse(courseId, courseName, startDate, endDate, true, demoOnly, nsPrefix)
    } catch (err) {
      console.error(err)
      res.status(500).send({ success: false, error: (err as Error).message })
      return
    }
    try {
      for (const username of usernames) {
        await createSelfServiceCourseResponsibility(selfServiceCourseId, username, demoOnly)
      }
      await createSelfServiceCourseResponsibility(selfServiceCourseId, user.username, demoOnly)
      res.send({ success: true })
    } catch (err) {
      await deleteSelfServiceCourse(selfServiceCourseId)
      console.error(err)
      res.status(500).send({ success: false, error: (err as Error).message })
      return
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({ success: false, error: (err as Error).message })
  }
})

export default dbRouter
