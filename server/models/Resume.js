 import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema(
  {
    // Konse user ka resume hai
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    },

    // User ne jo JD paste ki
   jdText: {
  type: String,
  default: '',
  trim: true
},

    // User ka original resume (uploaded ya form se)
    originalResume: {
      type: String,
      required: [true, 'Original resume is required'],
      trim: true
    },

    // AI ne jo ATS resume banaya
    generatedResume: {
      type: String,
      default: ''
    },

    // ATS Score — 0 se 100 ke beech
    atsScore: {
      type: Number,
      default: 0,
      min: [0, 'Score cannot be less than 0'],
      max: [100, 'Score cannot be more than 100']
    },

    // JD se extract ki gayi top skills
    extractedSkills: {
      type: [String],
      default: []
    },

    // User ke resume mein jo skills missing hain
    missingSkills: {
      type: [String],
      default: []
    },

    // Resume upload tha ya form fill kiya
    resumeType: {
      type: String,
      enum: ['upload', 'form'],
      required: [true, 'Resume type is required']
    }
  },
  {
    timestamps: true
  }
)

const Resume = mongoose.model('Resume', resumeSchema)

export default Resume