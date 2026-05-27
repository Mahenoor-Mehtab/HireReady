import mongoose from 'mongoose'

// Chat ka ek message kaisa dikhega
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false } // Har message ka alag ID mat banao
)

// Interview question kaisa dikhega
const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },
    suggestedAnswer: {
      type: String,
      required: true,
      trim: true
    }
  },
  { _id: false }
)

// Main Session Schema
const sessionSchema = new mongoose.Schema(
  {
    // Konse user ki session hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },

    // Is session mein konsa resume use hua
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      required: [true, 'Resume is required']
    },

    // JD text
    jdText: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true
    },

    // AI generated interview questions
    interviewQuestions: {
      type: [questionSchema],
      default: []
    },

    // Chatbot ki poori conversation history
    chatHistory: {
      type: [messageSchema],
      default: []
    },

    // Session active hai ya nahi
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

const Session = mongoose.model('Session', sessionSchema)

export default Session
