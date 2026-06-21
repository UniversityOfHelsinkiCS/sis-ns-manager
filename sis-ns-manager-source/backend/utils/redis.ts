import Redis from 'ioredis'

import { REDIS_HOST, REDIS_PASSWORD } from './config.ts'

export const redis = new Redis({
  host: REDIS_HOST,
  port: 6379,
  password: REDIS_PASSWORD || undefined,
})
