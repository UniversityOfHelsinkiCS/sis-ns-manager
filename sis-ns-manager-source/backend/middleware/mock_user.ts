import type { Request, Response, NextFunction } from 'express'
import type { User } from '../../common/types.ts'
import { DEV_PERSON_ID, DEV_PERSON_NAME } from '../utils/config.ts'

export const mockUser: User = {
  id: 'hy-hlo-12345',
  username: DEV_PERSON_NAME,
  hyPersonSisuId: DEV_PERSON_ID,
  hyGroupCn: ['grp-okd-teachers'],
}

const mockUserMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.path.includes('/login')) return next()
  req.user = mockUser
  return next()
}


export default mockUserMiddleware