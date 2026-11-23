import express from 'express'
import requireCourseOwner from '../middleware/requireCourseOwner.ts'
import { createSelfServiceCourse, createSelfServiceCourseResponsibility } from '../utils/dbService.ts'

const dbRouter = express.Router()

// makes the course self-provisionable
dbRouter.post('/allow-self-provisioning/:id', requireCourseOwner, async (
  req: express.Request, res: express.Response
) => {
  try {
    const { id: courseId } = req.params
    const {
        nsPrefix,
        usernames,
        courseName,
        startDate,
        endDate,
        demoOnly
    } = req.body
    if (typeof courseId !== 'string') {
        res.status(400).send({ success: false })
        return
    }
    await createSelfServiceCourse(courseId, courseName, startDate, endDate, true, demoOnly, nsPrefix)
    for (const username of usernames) {
        await createSelfServiceCourseResponsibility(courseId, username)
    }
    res.send({ success: true })
  } catch (err) {
    res.status(500).send({ success: false, error: (err as Error).message })
  }
})

export default dbRouter
