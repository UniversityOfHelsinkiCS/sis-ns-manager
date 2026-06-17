import express from 'express'
const okdRouter = express.Router()

okdRouter.get('/namespaces', async (req, res) => {
    res.send("testestestestestes")
})

export default okdRouter