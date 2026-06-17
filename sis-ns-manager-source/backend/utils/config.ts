import 'dotenv/config'
import process from 'process'
export const DATABASE_URL = process.env.SIS_API_URL || ''
export const inProduction = process.env.NODE_ENV === 'production' || false
export const inDevelopment = process.env.NODE_ENV === 'development'
export const DEV_PERSON_NAME = process.env.DEV_PERSON_NAME || 'test-user'
export const DEV_PERSON_ID = process.env.DEV_PERSON_ID || 'hy-hlo-12345'


export const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret'
export const OIDC_CLIENT_ID = process.env.OIDC_CLIENT_ID || ''
export const OIDC_CLIENT_SECRET = process.env.OIDC_CLIENT_SECRET || ''
export const OIDC_REDIRECT_URI = process.env.OIDC_REDIRECT_URI || ''
export const OIDC_ISSUER = process.env.OIDC_ISSUER || '' 