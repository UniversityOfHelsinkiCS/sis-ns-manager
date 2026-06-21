type WithGroups = { hyGroupCn?: string[] }
type WithUsername = { username?: string }

export const OKD_TEACHERS_GROUP = 'grp-okd-teachers'

// TODO: replace with the real demo account username once known.
export const DEMO_USER_USERNAME = 'lztest'

export const isDemoUser = (user: WithUsername): boolean =>
  user.username === DEMO_USER_USERNAME

export const isAllowed = (user: WithGroups & WithUsername): boolean =>
  isDemoUser(user) || (user.hyGroupCn?.includes(OKD_TEACHERS_GROUP) ?? false)
