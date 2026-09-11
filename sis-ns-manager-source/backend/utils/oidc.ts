// Applied from the similar usage in /apparaatti

import * as openidClient from 'openid-client'

import type { User } from '../../common/types.ts'
import {
  OIDC_ISSUER,
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_REDIRECT_URI,
} from './config.ts'

export const oidcParams = {
  scope: 'openid profile',
  claims: {
    id_token: {
      uid: { essential: true },
      hyPersonSisuId: { essential: true },
      hyGroupCn: { essential: true },
    },
    userinfo: {
      uid: { essential: true },
      hyPersonSisuId: { essential: true },
      hyGroupCn: { essential: true },
    },
  },
}

export const getClient = async () => {
  const issuer = await openidClient.Issuer.discover(OIDC_ISSUER)

  const client = new issuer.Client({
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uris: [OIDC_REDIRECT_URI],
    response_types: ['code'],
  })

  return client
}

// Maps the OIDC provider's claims onto our User. No DB upsert: with the
// cookie-only session the whole user object is stored in the session, so there
// is nothing to persist server-side.
export const verifyLogin = async (
  _tokenSet: unknown,
  userinfo: Record<string, unknown>,
  done: (err: unknown, user?: User) => void,
) => {

  const user: User = {
    id: userinfo.hyPersonSisuId as string,
    username: userinfo.uid as string,
    hyGroupCn: (userinfo.hyGroupCn as string[]) ?? null,
  }

  return done(null, user)
}
