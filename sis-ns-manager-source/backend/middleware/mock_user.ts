import type { Request, Response, NextFunction } from 'express'
import type { User } from '../../common/types.ts'
import { DEV_PERSON_ID, DEMO_USER_USERNAME, OKD_TEACHERS_GROUP } from '../utils/config.ts'

export const mockUser: User = {
  id: 'hy-hlo-12345',
  username: DEMO_USER_USERNAME,
  hyPersonSisuId: DEV_PERSON_ID,
  hyGroupCn: [OKD_TEACHERS_GROUP],
}

const mockUserMiddleware = (req: Request, _: Response, next: NextFunction) => {
  if (req.path.includes('/login')) return next()
  req.user = mockUser
  return next()
}


export default mockUserMiddleware