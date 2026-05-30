import 'dotenv/config'

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const MODEL = 'llama-3.3-70b-versatile'

// ═══════════════════════════════════════
// ✅ HELPER 1 — JSON Cleaner
// AI extra text ya markdown de toh strip 
// ═══════════════════════════════════════
const parseJSON = (content) => {
  if (!content) {
    throw new Error('AI returned empty response')
  }

  // ```json ``` markdown strip
  let cleaned = content
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim()

  // Pehla { ya [ dhundho
  const firstBrace = cleaned.indexOf('{')
  const firstBracket = cleaned.indexOf('[')

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON found in AI response')
  }

  // Konsa pehle aaya
  let startIndex
  if (firstBrace === -1) startIndex = firstBracket
  else if (firstBracket === -1) startIndex = firstBrace
  else startIndex = Math.min(firstBrace, firstBracket)

  cleaned = cleaned.substring(startIndex)

  // Last } ya ] tak hi rakho
  const lastBrace = cleaned.lastIndexOf('}')
  const lastBracket = cleaned.lastIndexOf(']')
  const endIndex = Math.max(lastBrace, lastBracket)

  if (endIndex === -1) {
    throw new Error('Incomplete JSON from AI')
  }

  cleaned = cleaned.substring(0, endIndex + 1)

  return JSON.parse(cleaned)
}

// ═══════════════════════════════════════
// ✅ HELPER 2 — Retry Logic
// Rate limit ya network fail pe retry
// ═══════════════════════════════════════
const callWithRetry = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error) {
      const isLastAttempt = i === retries - 1

      // Rate limit → wait karke retry
      if (error?.status === 429 && !isLastAttempt) {
        console.warn(`Rate limit hit, retrying in ${delay * (i + 1)}ms...`)
        await new Promise((res) => setTimeout(res, delay * (i + 1)))
        continue
      }

      // Network reset → retry
      if (error?.code === 'ECONNRESET' && !isLastAttempt) {
        await new Promise((res) => setTimeout(res, delay))
        continue
      }

      // Baaki errors → seedha throw
      throw error
    }
  }
}

// ═══════════════════════════════════════
// ✅ HELPER 3 — Common Groq Caller
// Ek jagah se saare Groq calls handle 
// ═══════════════════════════════════════
const callGroq = async (
  systemPrompt,
  userPrompt,
  temperature = 0.5,
  maxTokens = 2000
) => {
  const response = await callWithRetry(() =>
    groq.chat.completions.create({
      model: MODEL,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    })
  )

  // Null/undefined check
  const content = response?.choices?.[0]?.message?.content

  if (!content || content.trim() === '') {
    throw new Error('AI returned empty response')
  }

  return content
}

// ═══════════════════════════════════════
// 1. JD Analyze 
// ═══════════════════════════════════════
const analyzeJD = async (jdText) => {
  try {
    // Input validate 
    if (!jdText || jdText.trim().length < 50) {
      throw new Error('Job description is too short to analyze')
    }

    const content = await callGroq(
      `You are an expert ATS analyzer.
      Analyze job descriptions and extract key information.
      Always respond in valid JSON format only. 
      No extra text. No markdown. No code blocks.`,

      `Analyze this job description and return ONLY this JSON:
      {
        "requiredSkills": ["skill1", "skill2"],
        "preferredSkills": ["skill1", "skill2"],
        "experience": "X years",
        "jobTitle": "title",
        "keyResponsibilities": ["resp1", "resp2"],
        "educationRequired": "degree"
      }
      
      Job Description:
      ${jdText}`,
      0.3,
      1000
    )

    const parsed = parseJSON(content)

    // Missing fields ko default set 
    return {
      requiredSkills: Array.isArray(parsed.requiredSkills)
        ? parsed.requiredSkills
        : [],
      preferredSkills: Array.isArray(parsed.preferredSkills)
        ? parsed.preferredSkills
        : [],
      experience: parsed.experience || 'Not specified',
      jobTitle: parsed.jobTitle || 'Not specified',
      keyResponsibilities: Array.isArray(parsed.keyResponsibilities)
        ? parsed.keyResponsibilities
        : [],
      educationRequired: parsed.educationRequired || 'Not specified'
    }
  } catch (error) {
    throw new Error(`JD Analysis failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 2. ATS Resume Generate 
// ═══════════════════════════════════════
const generateATSResume = async (originalResume, jdAnalysis) => {
  try {
    // Inputs validate 
    if (!originalResume || originalResume.trim().length < 50) {
      throw new Error('Resume content is too short')
    }

    if (!jdAnalysis || !jdAnalysis.jobTitle) {
      throw new Error('JD analysis is required')
    }

    // Empty arrays handle 
    const requiredSkills = jdAnalysis.requiredSkills?.length
      ? jdAnalysis.requiredSkills.join(', ')
      : 'Not specified'

    const responsibilities = jdAnalysis.keyResponsibilities?.length
      ? jdAnalysis.keyResponsibilities.join(', ')
      : 'Not specified'

    const content = await callGroq(
      `You are an expert ATS resume writer.
      Create ATS-optimized resumes that pass applicant tracking systems.
      Rules:
      - Use simple formatting, no tables or columns
      - Include keywords from job description naturally
      - Use strong action verbs
      - Keep it clean and scannable
      - Return plain text only`,

      `Create an ATS-optimized resume based on:
      
      Original Resume:
      ${originalResume}
      
      Job Requirements:
      - Required Skills: ${requiredSkills}
      - Job Title: ${jdAnalysis.jobTitle}
      - Key Responsibilities: ${responsibilities}
      
      Naturally include required keywords.`,
      0.4,
      3000
    )

    // Generated resume too short check
    if (!content || content.trim().length < 100) {
      throw new Error('Generated resume is too short, please try again')
    }

    return content
  } catch (error) {
    throw new Error(`Resume generation failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 3. ATS Score Calculate
// ═══════════════════════════════════════
const calculateATSScore = async (generatedResume, jdAnalysis) => {
  try {
    // Input validate 
    if (!generatedResume || generatedResume.trim().length < 50) {
      throw new Error('Resume content is required for scoring')
    }

    const requiredSkills = jdAnalysis.requiredSkills?.length
      ? jdAnalysis.requiredSkills.join(', ')
      : 'Not specified'

    const preferredSkills = jdAnalysis.preferredSkills?.length
      ? jdAnalysis.preferredSkills.join(', ')
      : 'Not specified'

    const content = await callGroq(
      `You are an ATS scoring system.
      Analyze resumes against job requirements and give accurate scores.
      Always respond in valid JSON format only. 
      No extra text. No markdown. No code blocks.`,

      `Score this resume against job requirements.
      Return ONLY this JSON:
      {
        "overallScore": 85,
        "skillsScore": 90,
        "experienceScore": 80,
        "matchedSkills": ["skill1", "skill2"],
        "missingSkills": ["skill1", "skill2"],
        "suggestions": ["suggestion1", "suggestion2"]
      }
      
      Resume: ${generatedResume}
      Required Skills: ${requiredSkills}
      Preferred Skills: ${preferredSkills}
      Experience Required: ${jdAnalysis.experience || 'Not specified'}`,
      0.1,
      1000
    )

    const parsed = parseJSON(content)

    // Score 0-100 ke beech clamp 
    const clamp = (val) => Math.min(100, Math.max(0, Number(val) || 0))

    return {
      overallScore: clamp(parsed.overallScore),
      skillsScore: clamp(parsed.skillsScore),
      experienceScore: clamp(parsed.experienceScore),
      matchedSkills: Array.isArray(parsed.matchedSkills)
        ? parsed.matchedSkills
        : [],
      missingSkills: Array.isArray(parsed.missingSkills)
        ? parsed.missingSkills
        : [],
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : []
    }
  } catch (error) {
    throw new Error(`ATS scoring failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 4. Interview Questions Generate
// ═══════════════════════════════════════
const generateInterviewQuestions = async (jdAnalysis, resumeText) => {
  try {
    // resumeText null/undefined handle 
    const resumeSummary = resumeText?.trim()
      ? resumeText.substring(0, 500)
      : 'Resume not provided'

    const requiredSkills = jdAnalysis.requiredSkills?.length
      ? jdAnalysis.requiredSkills.join(', ')
      : 'General skills'

    const content = await callGroq(
      `You are an expert interview coach.
      Generate relevant interview questions with detailed answers.
      Always respond in valid JSON format only. 
      No extra text. No markdown. No code blocks.`,

      `Generate 10 interview questions with answers.
      Return ONLY this JSON:
      {
        "questions": [
          {
            "question": "question here",
            "suggestedAnswer": "detailed answer here"
          }
        ]
      }
      
      Job Title: ${jdAnalysis.jobTitle || 'Not specified'}
      Required Skills: ${requiredSkills}
      Resume Summary: ${resumeSummary}`,
      0.7,
      3000
    )

    const parsed = parseJSON(content)

    // Questions array validate
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error('Invalid questions format from AI')
    }

    // Har question validate — empty filter
    const validQuestions = parsed.questions.filter(
      (q) => q?.question?.trim() && q?.suggestedAnswer?.trim()
    )

    if (validQuestions.length === 0) {
      throw new Error('No valid questions generated, please try again')
    }

    return validQuestions
  } catch (error) {
    throw new Error(`Interview questions generation failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 5. Chatbot — Context Aware
// ═══════════════════════════════════════
const chatWithAI = async (userMessage, chatHistory, context) => {
  try {
    // Message validate
    if (!userMessage || userMessage.trim().length === 0) {
      throw new Error('Message cannot be empty')
    }

    // chatHistory null/undefined handle 
    const safeHistory = Array.isArray(chatHistory) ? chatHistory : []

    // Last 10 messages lo — context window limit
    const recentHistory = safeHistory.slice(-10)

    // Groq format mein convert 
    const formattedHistory = recentHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: String(msg.content || '')
    }))

    // Context null handle 
    const safeContext = context || {}

    const response = await callWithRetry(() =>
      groq.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are HireReady AI assistant — an expert career coach.
            You help users with resume improvement, interview preparation, and job search.
            
            Current User Context:
            - Job Title: ${safeContext.jobTitle || 'Not specified'}
            - Required Skills: ${safeContext.requiredSkills?.join(', ') || 'Not specified'}
            - ATS Score: ${safeContext.atsScore || 'Not calculated yet'}
            - Missing Skills: ${safeContext.missingSkills?.join(', ') || 'None'}
            
            Be helpful, specific, and encouraging.
            Give actionable advice based on the user context.`
          },
          ...formattedHistory,
          {
            role: 'user',
            content: userMessage.trim()
          }
        ]
      })
    )

    const content = response?.choices?.[0]?.message?.content

    // Empty response fallback
    if (!content || content.trim() === '') {
      return 'Sorry, I could not generate a response. Please try again.'
    }

    return content
  } catch (error) {
    throw new Error(`Chat failed: ${error.message}`)
  }
}

export {
  analyzeJD,
  generateATSResume,
  calculateATSScore,
  generateInterviewQuestions,
  chatWithAI
}