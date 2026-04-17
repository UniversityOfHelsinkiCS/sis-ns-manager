import express from 'express'
const okdRouter = express.Router()

okdRouter.get('/', (_, res) => {
  res.sendStatus(404)
})

okdRouter.get('/courses', (req, res) => {
  res.sendStatus(404).json({ message: "Missing user"})
})



export default okdRouter