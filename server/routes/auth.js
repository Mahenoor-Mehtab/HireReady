import express from 'express'
import {
  registerUser,
  loginUser,
  getMe
} from '../controllers/authController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

// Public Routes — Koi bhi access kar sakta hai
router.post('/register', registerUser)
router.post('/login', loginUser)

// Private Route — Sirf logged in user
router.get('/me', protect, getMe)

export default router 
