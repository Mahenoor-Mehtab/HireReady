import Session from '../models/Session.js'
import Resume from '../models/Resume.js'
import { analyzeJD } from '../services/aiService.js'

// @desc    JD Analyze  
// @route   POST /api/jd/analyze
// @access  Private
const analyzeJobDescription = async (req, res, next) => {
  try {
    const { jdText } = req.body

    // 1. Input validate 
  if (!jdText || typeof jdText !== 'string' || jdText.trim().length < 50) {
      res.status(400)
      throw new Error('Please provide a valid job description')
    }

    // 2. JD analyze — AI se
    const jdAnalysis = await analyzeJD(jdText)

    res.status(200).json({
      success: true,
      data: {
        jdText,
        jdAnalysis
      }
    })

  } catch (error) {
    next(error)
  }
}

// @desc    Session mein JD save  
// @route   POST /api/jd/save
// @access  Private
const saveJD = async (req, res, next) => {
  try {
    const { jdText, resumeId } = req.body

    // 1. Input validate
    if (!jdText || jdText.trim().length < 50) {
      res.status(400)
      throw new Error('Please provide a valid job description')
    }

    if (!resumeId) {
      res.status(400)
      throw new Error('Resume ID is required')
    }

    // 2. Resume exist karta hai aur is user ka hai?
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    })

    if (!resume) {
      res.status(404)
      throw new Error('Resume not found')
    }

    // 3. Session
    const session = await Session.create({
      userId: req.user._id,
      resumeId,
      jdText,
      interviewQuestions: [],
      chatHistory: []
    })

    // 4. Response 
    res.status(201).json({
      success: true,
      data: session
    })

  } catch (error) {
    next(error)
  }
}

// @desc    User ki saari sessions lo
// @route   GET /api/jd/sessions
// @access  Private
const getSessions = async (req, res, next) => {
  try {
    const sessions = await Session.find({
      userId: req.user._id,
      isActive: true
    })
      .populate('resumeId', 'atsScore resumeType createdAt')
      .sort({ createdAt: -1 })
      .select('-chatHistory -interviewQuestions')

    res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    })

  } catch (error) {
    next(error)
  }
}

// @desc    Ek session ki detail lo
// @route   GET /api/jd/sessions/:id
// @access  Private
const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isActive: true
    }).populate('resumeId')

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    res.status(200).json({
      success: true,
      data: session
    })

  } catch (error) {
    next(error)
  }
}

// @desc    Session delete   (soft delete)
// @route   DELETE /api/jd/sessions/:id
// @access  Private
const deleteSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    // Hard delete nahi — sirf isActive false  
    session.isActive = false
    await session.save()

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}

export {
  analyzeJobDescription,
  saveJD,
  getSessions,
  getSessionById,
  deleteSession
} 
