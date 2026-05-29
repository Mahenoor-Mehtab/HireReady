import Resume from '../models/Resume.js'
import pdfParse from 'pdf-parse'
import {
  generateATSResume,
  calculateATSScore,
  analyzeJD
} from '../services/aiService.js'

// PDF file se text extract  
const extractTextFromPDF = async (buffer) => {
     if (!buffer || buffer.length < 4) {
    throw new Error('Invalid file uploaded')
  }
  const pdfSignature = buffer.slice(0, 4).toString()
  if (pdfSignature !== '%PDF') {
    throw new Error('Uploaded file is not a valid PDF')
  }
  const data = await pdfParse(buffer)
  if (!data.text || data.text.trim().length < 50) {
    throw new Error('Could not extract text from PDF')
  }
  return data.text.trim()
}

const uploadResume = async (req, res, next) => {
  try {
    // Multer ne file attach ki hai req.file mein
    if (!req.file) {
      res.status(400)
      throw new Error('Please upload a PDF file')
    }

    // PDF se text nikalo
    const extractedText = await extractTextFromPDF(req.file.buffer)

    // Resume save   — abhi generate nahi hoga
    const resume = await Resume.create({
      userId: req.user._id,
      originalResume: extractedText,
      jdText: '',
      generatedResume: '',
      atsScore: 0,
      resumeType: 'upload'
    })

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume._id,
        resumeType: resume.resumeType,
        originalResume: resume.originalResume
      }
    })

  } catch (error) {
    next(error)
  }
}

const createResumeFromForm = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      location,
      summary,
      experience,
      education,
      skills,
      projects,
      certifications
    } = req.body

    // Required fields check
    if (!fullName || !email || !skills) {
      res.status(400)
      throw new Error('Full name, email and skills are required')
    }

    // Form data ko plain text mein convert  
    // AI ke liye readable format
    const resumeText = `
NAME: ${fullName}
EMAIL: ${email}
PHONE: ${phone || 'Not provided'}
LOCATION: ${location || 'Not provided'}

PROFESSIONAL SUMMARY:
${summary || 'Not provided'}

EXPERIENCE:
${experience || 'Not provided'}

EDUCATION:
${education || 'Not provided'}

SKILLS:
${Array.isArray(skills) ? skills.join(', ') : skills}

PROJECTS:
${projects || 'Not provided'}

CERTIFICATIONS:
${certifications || 'Not provided'}
    `.trim()

    const resume = await Resume.create({
      userId: req.user._id,
      originalResume: resumeText,
      jdText: '',
      generatedResume: '',
      atsScore: 0,
      resumeType: 'form'
    })

    res.status(201).json({
      success: true,
      data: {
        resumeId: resume._id,
        resumeType: resume.resumeType,
        originalResume: resume.originalResume
      }
    })

  } catch (error) {
    next(error)
  }
}

const generateResume = async (req, res, next) => {
  try {
    const { resumeId, jdText } = req.body

    if (!resumeId || !jdText) {
      res.status(400)
      throw new Error('Resume ID and job description are required')
    }

    // Security check — sirf apna resume use kar sakta hai
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    })

    if (!resume) {
      res.status(404)
      throw new Error('Resume not found')
    }

    // Pehle JD analyze  
    const jdAnalysis = await analyzeJD(jdText)

    // Phir ATS resume generate  
    const generatedResume = await generateATSResume(
      resume.originalResume,
      jdAnalysis
    )

    // Score calculate  
    const scoreData = await calculateATSScore(generatedResume, jdAnalysis)

    // Sab kuch resume mein save  
    resume.jdText = jdText
    resume.generatedResume = generatedResume
    resume.atsScore = scoreData.overallScore
    resume.extractedSkills = jdAnalysis.requiredSkills
    resume.missingSkills = scoreData.missingSkills
    await resume.save()

    res.status(200).json({
      success: true,
      data: {
        resumeId: resume._id,
        generatedResume,
        atsScore: scoreData.overallScore,
        skillsScore: scoreData.skillsScore,
        experienceScore: scoreData.experienceScore,
        matchedSkills: scoreData.matchedSkills,
        missingSkills: scoreData.missingSkills,
        suggestions: scoreData.suggestions
      }
    })

  } catch (error) {
    next(error)
  }
}

const getATSScore = async (req, res, next) => {
  try {
    // Security check
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!resume) {
      res.status(404)
      throw new Error('Resume not found')
    }

    if (!resume.generatedResume) {
      res.status(400)
      throw new Error('Generate resume first before checking ATS score')
    }

    res.status(200).json({
      success: true,
      data: {
        atsScore: resume.atsScore,
        extractedSkills: resume.extractedSkills,
        missingSkills: resume.missingSkills
      }
    })

  } catch (error) {
    next(error)
  }
}

const getAllResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      // Heavy fields skip   list mein
      .select('-originalResume -generatedResume')

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    })

  } catch (error) {
    next(error)
  }
}

const getResumeById = async (req, res, next) => {
  try {
    // Security check — dusre ka resume nahi dekh sakta
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    })

    if (!resume) {
      res.status(404)
      throw new Error('Resume not found')
    }

    res.status(200).json({
      success: true,
      data: resume
    })

  } catch (error) {
    next(error)
  }
}

export {
  uploadResume,
  createResumeFromForm,
  generateResume,
  getATSScore,
  getAllResumes,
  getResumeById
} 
