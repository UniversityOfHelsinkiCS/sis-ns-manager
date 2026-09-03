import type { NextFunction, Request, Response } from 'express'
import type { User } from '../../common/types.ts'
import { getNamespaceProvisioner } from '../utils/okdClient.ts'
import { isDemoUser, isValidNamespaceName } from '../utils/validations.ts'

// Ensure the namespace :id was provisioned through this app by the current user,
// so a caller cannot mutate namespaces they do not own.
const requireNamespaceOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as User
  const name = req.params.id

  if (!isValidNamespaceName(name)) {
    res.status(400).json({ message: 'Invalid namespace name' })
    return
  }

  // The demo user has no real cluster to query; treat its demo namespaces as
  // owned so the management flow can be exercised in development.
  if (isDemoUser(user)) {
    next()
    return
  }

  if ((await getNamespaceProvisioner(name)) !== user.username) {
    res.status(403).json({ message: 'Not your namespace' })
    return
  }

  next()
}

export default requireNamespaceOwner
