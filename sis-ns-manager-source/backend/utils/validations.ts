import { OKD_TEACHERS_GROUP, DEMO_USER_USERNAME } from './config.ts'

type WithGroups = { hyGroupCn?: string[] }
type WithUsername = { username?: string }

export const isDemoUser = (user: WithUsername): boolean =>
  user.username === DEMO_USER_USERNAME

export const isAllowed = (user: WithGroups & WithUsername): boolean =>
  isDemoUser(user) || (user.hyGroupCn?.includes(OKD_TEACHERS_GROUP) ?? false)
