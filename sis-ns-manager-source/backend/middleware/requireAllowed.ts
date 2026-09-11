import type { NextFunction, Request, Response } from 'express'
import type { User } from '../../common/types.ts'
import { isAllowed } from '../utils/validations.ts'

// Gate routes behind the app's authorization rules (teachers group / demo user).
const requireAllowed = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as User
  if (!isAllowed(user)) {
    res.status(403).json({ message: 'Forbidden' })
    return
  }

  next()
}

export default requireAllowed
