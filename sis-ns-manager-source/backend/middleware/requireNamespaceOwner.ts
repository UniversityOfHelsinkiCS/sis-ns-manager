import type { NextFunction, Request, Response } from 'express'
import type { User } from '../../common/types.ts'
import { getNamespaceProvisioner } from '../utils/okdClient.ts'

// Ensure the namespace :id was provisioned through this app by the current user,
// so a caller cannot mutate namespaces they do not own.
const requireNamespaceOwner = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = req.user as User
  const name = req.params.id

  if ((await getNamespaceProvisioner(name)) !== user.id) { // fix also here 
    res.status(403).json({ message: 'Not your namespace' })
    return
  }

  next()
}

export default requireNamespaceOwner
