import Session from '../models/Session.js'
import { chatWithAI } from '../services/aiService.js'

const sendMessage = async (req, res, next) => {
  try {
    const { sessionId, message } = req.body

    // Input validate karo
    if (!sessionId) {
      res.status(400)
      throw new Error('Session ID is required')
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400)
      throw new Error('Message cannot be empty')
    }

    if (message.trim().length > 1000) {
      res.status(400)
      throw new Error('Message is too long — max 1000 characters')
    }

    // Security check — sirf apni session
    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id,
      isActive: true
    }).populate('resumeId', 'atsScore missingSkills extractedSkills')

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    // AI ko context do — JD + Resume info
    const context = {
      jobTitle: session.jdText
        ? session.jdText.substring(0, 100)
        : 'Not specified',
      requiredSkills: session.resumeId?.extractedSkills || [],
      atsScore: session.resumeId?.atsScore || 0,
      missingSkills: session.resumeId?.missingSkills || []
    }

    // AI se response lo
    const aiResponse = await chatWithAI(
      message.trim(),
      session.chatHistory,
      context
    )

    // Dono messages session mein save karo
    session.chatHistory.push(
      { role: 'user', content: message.trim() },
      { role: 'assistant', content: aiResponse }
    )

    await session.save()

    res.status(200).json({
      success: true,
      data: {
        message: aiResponse,
        // Frontend ko history bhi do
        chatHistory: session.chatHistory
      }
    })

  } catch (error) {
    next(error)
  }
}

const getChatHistory = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      userId: req.user._id,
      isActive: true
    }).select('chatHistory')

    if (!session) {
      res.status(404)
      throw new Error('Session not found')
    }

    res.status(200).json({
      success: true,
      count: session.chatHistory.length,
      data: session.chatHistory
    })

  } catch (error) {
    next(error)
  }
}

const clearChatHistory = async (req, res, next) => {
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

    // History clear karo
    session.chatHistory = []
    await session.save()

    res.status(200).json({
      success: true,
      message: 'Chat history cleared'
    })

  } catch (error) {
    next(error)
  }
}

export { sendMessage, getChatHistory, clearChatHistory } 
