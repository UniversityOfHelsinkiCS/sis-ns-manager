import 'dotenv/config'
import process from 'process'
export const DATABASE_URL = process.env.SIS_API_URL || ''
export const API_TOKEN = process.env.API_TOKEN || ''
export const inProduction = process.env.NODE_ENV === 'production' || false
export const inDevelopment = process.env.NODE_ENV === 'development'
export const DEV_PERSON_ID = process.env.DEV_PERSON_ID || 'hy-hlo-12345'

export const OKD_TEACHERS_GROUP = process.env.OKD_TEACHERS_GROUP || 'grp-okd-teachers'
// Name of the cluster this instance manages, shown in the frontend UI. Set per
// deployment overlay; falls back to a dev-friendly placeholder locally.
export const CLUSTER_NAME = process.env.CLUSTER_NAME || 'local'
// TODO: replace with the real demo account username once known.
export const DEMO_USER_USERNAME = process.env.DEMO_USER_USERNAME || 'lztest'


export const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret'
export const REDIS_HOST = process.env.REDIS_HOST || ''
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || ''
export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || ''
export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || ''
export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || ''
export const OIDC_ISSUER = process.env.OIDC_ISSUER || '' 

