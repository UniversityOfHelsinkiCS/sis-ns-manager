import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import router from './routes/router.ts'
import passport from 'passport'
import mockUserMiddleware from './middleware/mock_user.ts'
import { inDevelopment } from './utils/config.ts'






const PORT = process.env.PORT ?? 3001

const app = express()

app.use(passport.initialize())

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
