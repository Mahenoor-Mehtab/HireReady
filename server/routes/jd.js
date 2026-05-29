import express from 'express'
import {
  analyzeJobDescription,
  saveJD,
  getSessions,
  getSessionById,
  deleteSession
} from '../controllers/jdController.js'
import protect from '../middleware/authMiddleware.js'

const router = express.Router()

// Saare routes protected hain
router.use(protect)

router.post('/analyze', analyzeJobDescription)
router.post('/save', saveJD)
router.get('/sessions', getSessions)
router.get('/sessions/:id', getSessionById)
router.delete('/sessions/:id', deleteSession)

export default router
