import express from 'express'
import type { User } from '../../common/types.ts'
import { isAllowed } from '../utils/validations.ts'
import { getCourse, getStudentsByNumbers } from '../utils/sisService.ts'
import {
  PROVISIONER_ANNOTATION,
  END_DATE_ANNOTATION,
  listNamespacesByAnnotation,
  createProject,
  patchNamespaceAnnotations,
  getNamespaceProvisioner,
  grantNamespaceAdmin,
} from '../utils/okdClient.ts'

const okdRouter = express.Router()

const toDateString = (d: Date) => d.toISOString().slice(0, 10)

// True only when the namespace was provisioned through this app by this user,
// so a caller cannot mutate namespaces they do not own.
const ownsNamespace = async (userId: string, name: string) =>
  (await getNamespaceProvisioner(name)) === userId

// GET /api/okd/namespaces — namespaces provisioned by the current user.
okdRouter.get('/namespaces', async (req, res) => {
  const user = req.user as User
  const namespaces = await listNamespacesByAnnotation(PROVISIONER_ANNOTATION, user.id)

  res.json(
    namespaces.map((ns) => ({
      name: ns.metadata?.name,
      created: ns.metadata?.creationTimestamp,
      endDate: ns.metadata?.annotations?.[END_DATE_ANNOTATION] ?? null,
    })),
  )
})

// POST /api/okd/namespaces/:id — self-provision the namespace :id for a course.
// The course (looked up by body.courseId) supplies the end date, which is
// stamped as an annotation for the pruner to act on.
okdRouter.post('/namespaces/:id', async (req, res) => {
  const user = req.user as User
  if (!isAllowed(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const name = req.params.id
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

  const endDate = toDateString(new Date(course.activityPeriod.endDate as string))

  await createProject(name, name)
  await patchNamespaceAnnotations(name, {
    [PROVISIONER_ANNOTATION]: user.id,
    [END_DATE_ANNOTATION]: endDate,
  })

  res.status(201).json({ name, endDate })
})

// DELETE /api/okd/namespaces/:id — schedule deletion by setting the end date to
// tomorrow, so the pruner removes the namespace on its next run.
okdRouter.delete('/namespaces/:id', async (req, res) => {
  const user = req.user as User
  if (!isAllowed(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const name = req.params.id
  if (!(await ownsNamespace(user.id, name))) {
    res.status(403).json({ message: 'Not your namespace' })
    return
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const endDate = toDateString(tomorrow)

  await patchNamespaceAnnotations(name, { [END_DATE_ANNOTATION]: endDate })

  res.json({ name, endDate })
})

// POST /api/okd/namespaces/:id/users — grant the given students admin in the
// namespace. Students are identified by student number; their uid is derived
// from eduPersonPrincipalName (the part before '@').
okdRouter.post('/namespaces/:id/users', async (req, res) => {
  const user = req.user as User
  if (!isAllowed(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  const name = req.params.id
  if (!(await ownsNamespace(user.id, name))) {
    res.status(403).json({ message: 'Not your namespace' })
    return
  }

  const { studentNumbers } = req.body as { studentNumbers?: string[] }
  if (!Array.isArray(studentNumbers) || studentNumbers.length === 0) {
    res.status(400).json({ message: 'studentNumbers array is required' })
    return
  }

  const students = await getStudentsByNumbers(user, studentNumbers)
  const usernames = students
    .map((student) => student.eduPersonPrincipalName?.split('@')[0])
    .filter((uid): uid is string => Boolean(uid))

  await grantNamespaceAdmin(name, usernames)

  res.status(201).json({ namespace: name, users: usernames })
})

export default okdRouter
