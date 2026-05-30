import express from 'express'
import {
  sendMessage,
  getChatHistory,
  clearChatHistory
} from '../controllers/chatController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(protect)

router.post('/send', sendMessage)
router.get('/:sessionId', getChatHistory)
router.delete('/:sessionId/clear', clearChatHistory)

export default router 
