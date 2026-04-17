import express from 'express'
import sisRouter from './sis.ts'
import okdRouter from './okd.ts'


const router = express.Router({mergeParams: true})

router.use(express.json())

router.use('/sis', sisRouter)
router.use('/okd', okdRouter)

export default router