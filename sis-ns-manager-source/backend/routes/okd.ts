import express from 'express'
import type { User } from '../../common/types.ts'
import { getCourse, getStudentsByNumbers } from '../utils/sisService.ts'
import {
  PROVISIONER_ANNOTATION,
  END_DATE_ANNOTATION,
  COURSE_ANNOTATION,
  listNamespacesByAnnotation,
  createProject,
  patchNamespaceAnnotations,
  grantNamespaceAdmin,
} from '../utils/okdClient.ts'
import { isDemoUser, isValidNamespaceName } from '../utils/validations.ts'
import { demoNamespaces } from '../utils/demoData.ts'
import requireAllowed from '../middleware/requireAllowed.ts'
import requireNamespaceOwner from '../middleware/requireNamespaceOwner.ts'

const okdRouter = express.Router()

const toDateString = (d: Date) => d.toISOString().slice(0, 10)

// GET /api/okd/namespaces — namespaces provisioned by the current user.
okdRouter.get('/namespaces', async (req, res) => {
  const user = req.user as User

  // The demo user has no real cluster; serve a fixed set so the UI (incl. the
  // Manage modal) can be exercised in development.
  if (isDemoUser(user)) {
    res.json(demoNamespaces)
    return
  }

  const namespaces = await listNamespacesByAnnotation(PROVISIONER_ANNOTATION, user.username)

  res.json(
    namespaces.map((ns) => ({
      name: ns.metadata?.name,
      created: ns.metadata?.creationTimestamp,
      endDate: ns.metadata?.annotations?.[END_DATE_ANNOTATION] ?? null,
      course: ns.metadata?.annotations?.[COURSE_ANNOTATION] ?? null,
    })),
  )
})

// POST /api/okd/namespaces/:id — self-provision the namespace :id for a course.
// The course (looked up by body.courseId) supplies the end date, which is
// stamped as an annotation for the pruner to act on.
okdRouter.post('/namespaces/:id', requireAllowed, async (req, res) => {
  const user = req.user as User
  const name = req.params.id
  if (!isValidNamespaceName(name)) {
    res.status(400).json({
      message: 'Invalid namespace name: use 1–63 lowercase letters, digits and hyphens',
    })
    return
  }

  const { courseId } = req.body as { courseId?: string }
  if (!courseId) {
    res.status(400).json({ message: 'courseId is required' })
    return
  }

  const course = await getCourse(user, courseId)
  if (!course) {
    res.status(404).json({ message: 'Course not found' })
    return
  }

  const courseEndDate = new Date(course.activityPeriod.endDate as string)
  courseEndDate.setDate(courseEndDate.getDate() + 60)
  const endDate = toDateString(courseEndDate)

  // Demo user: skip the cluster, report success so the flow can be walked through.
  if (isDemoUser(user)) {
    res.status(201).json({ name, endDate })
    return
  }

  await createProject(name, name)
  await patchNamespaceAnnotations(name, {
    [PROVISIONER_ANNOTATION]: user.username,
    [END_DATE_ANNOTATION]: endDate,
    [COURSE_ANNOTATION]: courseId,
  })
  // Grant the provisioner admin in the namespace they just created. This covers
  // both a single course namespace and each group namespace (one POST per
  // group), so the teacher always has admin on everything they provision.
  await grantNamespaceAdmin(name, [user.username])

  res.status(201).json({ name, endDate })
})

// DELETE /api/okd/namespaces/:id — schedule deletion by setting the end date to
// tomorrow, so the pruner removes the namespace on its next run.
okdRouter.delete('/namespaces/:id', [requireAllowed, requireNamespaceOwner], async (req, res) => {
  const user = req.user as User
  const name = req.params.id

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const endDate = toDateString(tomorrow)

  if (isDemoUser(user)) {
    res.json({ name, endDate })
    return
  }

  await patchNamespaceAnnotations(name, { [END_DATE_ANNOTATION]: endDate })

  res.json({ name, endDate })
})

// POST /api/okd/namespaces/:id/users — grant the given students admin in the
// namespace. Students are identified by student number; their uid is derived
// from eduPersonPrincipalName (the part before '@').
okdRouter.post('/namespaces/:id/users', [requireAllowed, requireNamespaceOwner], async (req, res) => {
  const user = req.user as User
  const name = req.params.id

  const { studentNumbers } = req.body as { studentNumbers?: string[] }
  if (!Array.isArray(studentNumbers) || studentNumbers.length === 0) {
    res.status(400).json({ message: 'studentNumbers array is required' })
    return
  }

  const students = await getStudentsByNumbers(user, studentNumbers)
  const usernames = students
    .map((student) => student.eduPersonPrincipalName?.split('@')[0])
    .filter((uid): uid is string => Boolean(uid))

  if (!isDemoUser(user)) {
    await grantNamespaceAdmin(name, usernames)
  }

  res.status(201).json({ namespace: name, users: usernames })
})

export default okdRouter
