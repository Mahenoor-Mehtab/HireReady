import express from 'express'
import multer from 'multer'
import {
  uploadResume,
  createResumeFromForm,
  generateResume,
  getATSScore,
  getAllResumes,
  getResumeById
} from '../controllers/resumeController.js'
import protect from '../middleware/authMiddleware.js'

// Multer setup — file memory mein rakho
// Disk pe save mat karo directly
const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max 5MB
  fileFilter: (req, file, cb) => {
    // Sirf PDF allow karo
    if (file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Only PDF files are allowed'), false)
    }
  }
})

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400)
      return next(new Error('File size cannot exceed 5MB'))
    }
    res.status(400)
    return next(new Error(err.message))
  }
  if (err) {
    res.status(400)
    return next(new Error(err.message))
  }
  next()
}

const router = express.Router()

router.use(protect)

router.post('/upload', upload.single('resume'), handleMulterError, uploadResume)
router.post('/form', createResumeFromForm)
router.post('/generate', generateResume)
router.get('/score/:id', getATSScore)
router.get('/', getAllResumes)
router.get('/:id', getResumeById)

export default router