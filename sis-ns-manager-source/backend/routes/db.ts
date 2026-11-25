import express from 'express'
import type { User } from '../../common/types.ts'
import requireCourseOwner from '../middleware/requireCourseOwner.ts'
import { demoOnly } from '../utils/config.ts'
import {
  createSelfServiceCourse,
  deleteSelfServiceCourse,
  getSelfServiceCourseByCourseCode,
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
      res.status(400).send({ message: 'Course ID was expected as a string' })
      return
    }
    let selfServiceCourseId: number
    try {
      selfServiceCourseId = await createSelfServiceCourse(courseId, courseName, startDate, endDate, true, demoOnly, nsPrefix)
    } catch (err) {
      console.error(err)
      res.status(500).send({ message: (err as Error).message })
      return
    }
    try {
      for (const username of usernames) {
        await createSelfServiceCourseResponsibility(selfServiceCourseId, username, demoOnly)
      }
      await createSelfServiceCourseResponsibility(selfServiceCourseId, user.username, demoOnly)
      res.status(201).send({ nsPrefix, endDate })
    } catch (err) {
      await deleteSelfServiceCourse(selfServiceCourseId)
      console.error(err)
      res.status(500).send({ message: (err as Error).message })
      return
    }
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: (err as Error).message })
  }
})

dbRouter.get('/self-service-courses/:id', requireCourseOwner, async (
  req: express.Request, res: express.Response
) => {
  try {
    const { id: courseCode } = req.params
    if (typeof courseCode !== 'string') {
      console.error('Expected course code as a string')
      res.status(400).send({ message: 'Course code was expected as a string' })
      return
    }
    const selfServiceCourse = await getSelfServiceCourseByCourseCode(courseCode)
    if (!selfServiceCourse) {
      res.json({ selfServiceCourse: null })
      return
    }
    res.json({
      selfServiceCourse: {
        courseCode: selfServiceCourse.course_unit_realisation_code,
        nsPrefix: selfServiceCourse.ns_prefix,
        selfServiceEnabled: selfServiceCourse.self_service_enabled,
        demoOnly: selfServiceCourse.demo_only,
        startDate: selfServiceCourse.start_date,
        endDate: selfServiceCourse.end_date
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).send({ message: (err as Error).message })
  }
})

export default dbRouter
