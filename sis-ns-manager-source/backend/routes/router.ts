import express from 'express'
import sisRouter from './sis.ts'
import okdRouter from './okd.ts'
import passport from 'passport'
import type { User } from '../../common/types.ts'
import { isAllowed } from '../utils/validations.ts'


const router = express.Router({mergeParams: true})

router.use(express.json())

router.use('/sis', sisRouter)
router.use('/okd', okdRouter)

router.get('/user', (req, res) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }
  const user = req.user as User
  const returnData: User = {
    ...user,
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

router.get('/logout', async (req, res, next) => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  req.logout((err) => {
    if (err) return next(err)
    res.redirect('/')
  })

  res.redirect('/')
})

export default router