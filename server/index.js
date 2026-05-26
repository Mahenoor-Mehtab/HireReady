import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import connectDB from './config/db.js'

dotenv.config()

connectDB()

const app = express()

// extra Security Headers provide karna unnecessary stuff ko block kr de
app.use(helmet())

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// 🔐 Rate Limiting — Ek IP se zyada requests block karo
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // max 100 requests per 15 min
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
})
app.use(limiter)

// Body Parser
app.use(express.json({ limit: '10kb' })) // 🔐 Body size limit

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'HireReady API is running...'
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})