import express from 'express'
import {
  generateQuestions,
  getQuestions
} from '../controllers/interviewController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post('/generate', generateQuestions)
router.get('/:sessionId', getQuestions)

export default router 
