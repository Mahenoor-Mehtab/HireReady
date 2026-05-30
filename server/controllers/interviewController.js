import Session from '../models/Session.js'
import Resume from '../models/Resume.js'
import { generateInterviewQuestions } from '../services/aiService.js'

const generateQuestions = async (req, res, next) => {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      res.status(400)
      throw new Error('Session ID is required')
    }

    // Security check — sirf apni session
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    })

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    // Resume bhi chahiye AI ko
    const resume = await Resume.findOne({
      _id: session.resumeId,
      userId: req.user._id
    })

    if (!resume) {
      res.status(404)
      throw new Error('Resume not found')
    }

    if (!resume.generatedResume) {
      res.status(400)
      throw new Error('Please generate ATS resume first')
    }

    // AI se questions generate karo
    const questions = await generateInterviewQuestions(
      { jobTitle: session.jdText.substring(0, 100) },
      resume.generatedResume
    )

    // Session mein save karo
    session.interviewQuestions = questions
    await session.save()

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    })

  } catch (error) {
    next(error)
  }
}

const getQuestions = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    })

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    if (!session.interviewQuestions.length) {
      res.status(400)
      throw new Error('No questions found — please generate first')
    }

    res.status(200).json({
      success: true,
      count: session.interviewQuestions.length,
      data: session.interviewQuestions
    })

  } catch (error) {
    next(error)
  }
}

export { generateQuestions, getQuestions }
