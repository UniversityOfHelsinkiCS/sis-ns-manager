import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import passport from 'passport'
import * as openidClient from 'openid-client'
import router from './routes/router.ts'
import mockUserMiddleware from './middleware/mock_user.ts'
import { redis } from './utils/redis.ts'
import { getClient, oidcParams, verifyLogin } from './utils/oidc.ts'
import { inDevelopment, inProduction, SESSION_SECRET } from './utils/config.ts'

const PORT = process.env.PORT ?? 3001

const app = express()

// Behind the OpenShift route (TLS terminated at the edge) so Express trusts the
// forwarded protocol when setting secure cookies.
if (inProduction) app.set('trust proxy', 1)

// Server-side session stored in Redis; the cookie holds only the session id.
// 8 hour lifetime.
app.use(
  session({
    store: new RedisStore({ client: redis }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 8 * 60 * 60 * 1000,
      httpOnly: true,
      secure: inProduction,
      sameSite: 'lax',
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

// Passport wiring: serializers + the 'oidc' strategy registered on the global
// passport singleton. The whole user object is stored in the session.
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user: Express.User, done) => done(null, user))

// OIDC discovery only runs in production. Local runs have no secrets (and use
// the mock user instead), and discovering an empty issuer crashes inside
// openid-client, so skip the strategy entirely outside production.
if (inProduction) {
  const client = await getClient()
  passport.use('oidc', new openidClient.Strategy({ client, params: oidcParams }, verifyLogin))
}

if (inDevelopment) {
  app.use(mockUserMiddleware)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next()
  })
}

app.use('/api', router)
app.use('/api', (_, res) => {
  res.sendStatus(404)
})

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const distPath = path.join(__dirname, '..', 'frontend', 'dist')
  app.use(express.static(distPath))
  app.get('/{*path}', (_, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
