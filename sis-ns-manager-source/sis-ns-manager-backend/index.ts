import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.join(__dirname, '..', 'sis-ns-manager-frontend', 'dist')

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(express.json())

app.use(express.static(distPath))

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
