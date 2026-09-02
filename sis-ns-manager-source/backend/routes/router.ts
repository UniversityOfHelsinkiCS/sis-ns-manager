import express from 'express'
import sisRouter from './sis.ts'
import okdRouter from './okd.ts'
import passport from 'passport'
import type { User } from '../../common/types.ts'
import { isAllowed } from '../utils/validations.ts'
import { CLUSTER_NAME } from '../utils/config.ts'
import requireUser from '../middleware/requireUser.ts'


const router = express.Router({mergeParams: true})

router.use(express.json())

router.use('/sis', requireUser, sisRouter)
router.use('/okd', requireUser, okdRouter)

// Public: no auth, so the cluster name can be shown on the login screen too.
router.get('/config', (_req, res) => {
  res.json({ clusterName: CLUSTER_NAME })
})

router.get('/user', requireUser, (req, res) => {
  const user = req.user as User
  const returnData = {
    username: user.username,
    isAllowed: isAllowed(user),
  }
  res.json(returnData)
})

router.get('/login', passport.authenticate('oidc')) 

router.get('/login/callback',
  passport.authenticate('oidc', { failureRedirect: '/' }),
  async (_req, res) => {
    res.redirect('/')
  }
)

router.get('/logout', requireUser, (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/') 
  })
})

export default router 