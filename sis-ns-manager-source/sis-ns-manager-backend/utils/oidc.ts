// Applied from the similar usage in /apparaatti

import * as openidClient from 'openid-client'
import passport from 'passport'

import {
  OIDC_ISSUER,
  OIDC_CLIENT_ID,
  OIDC_CLIENT_SECRET,
  OIDC_REDIRECT_URI,
} from './config.ts'



const params = {
  scope: 'openid profile',
  claims: {
    id_token: {
      uid: { essential: true },
      username: {essential: true},
      hyPersonSisuId: { essential: true },
      hyGroupCn: { essential: true },
    },
  },
}

const getClient = async () => {
  const issuer = await  openidClient.Issuer.discover(OIDC_ISSUER)

  const client = new issuer.Client({
    client_id: OIDC_CLIENT_ID,
    client_secret: OIDC_CLIENT_SECRET,
    redirect_uris: [OIDC_REDIRECT_URI],
    response_types: ['code'],
  })
  
  return client
}