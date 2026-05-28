import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const MODEL = 'llama-3.3-70b-versatile'

// ═══════════════════════════════════════
// 1. JD Analyze karo — Skills extract karo
// ═══════════════════════════════════════
const analyzeJD = async (jdText) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.3,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS (Applicant Tracking System) analyzer. 
          Analyze job descriptions and extract key information.
          Always respond in valid JSON format only. No extra text.`
        },
        {
          role: 'user',
          content: `Analyze this job description and return JSON:
          {
            "requiredSkills": ["skill1", "skill2"],
            "preferredSkills": ["skill1", "skill2"],
            "experience": "X years",
            "jobTitle": "title",
            "keyResponsibilities": ["resp1", "resp2"],
            "educationRequired": "degree"
          }
          
          Job Description:
          ${jdText}`
        }
      ]
    })

    const content = response.choices[0].message.content
    return JSON.parse(content)

  } catch (error) {
    throw new Error(`JD Analysis failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 2. ATS Resume Generate karo
// ═══════════════════════════════════════
const generateATSResume = async (originalResume, jdAnalysis) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: `You are an expert ATS resume writer. 
          Create ATS-optimized resumes that pass applicant tracking systems.
          Rules:
          - Use simple formatting, no tables or columns
          - Include keywords from job description naturally
          - Use strong action verbs
          - Keep it clean and scannable
          - Return plain text only`
        },
        {
          role: 'user',
          content: `Create an ATS-optimized resume based on:
          
          Original Resume:
          ${originalResume}
          
          Job Requirements:
          - Required Skills: ${jdAnalysis.requiredSkills.join(', ')}
          - Job Title: ${jdAnalysis.jobTitle}
          - Key Responsibilities: ${jdAnalysis.keyResponsibilities.join(', ')}
          
          Make sure to naturally include the required keywords.`
        }
      ]
    })

    return response.choices[0].message.content

  } catch (error) {
    throw new Error(`Resume generation failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 3. ATS Score Calculate karo
// ═══════════════════════════════════════
const calculateATSScore = async (generatedResume, jdAnalysis) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are an ATS scoring system.
          Analyze resumes against job requirements and give accurate scores.
          Always respond in valid JSON format only. No extra text.`
        },
        {
          role: 'user',
          content: `Score this resume against job requirements.
          Return JSON:
          {
            "overallScore": 85,
            "skillsScore": 90,
            "experienceScore": 80,
            "matchedSkills": ["skill1", "skill2"],
            "missingSkills": ["skill1", "skill2"],
            "suggestions": ["suggestion1", "suggestion2"]
          }
          
          Resume:
          ${generatedResume}
          
          Required Skills: ${jdAnalysis.requiredSkills.join(', ')}
          Preferred Skills: ${jdAnalysis.preferredSkills.join(', ')}
          Experience Required: ${jdAnalysis.experience}`
        }
      ]
    })

    const content = response.choices[0].message.content
    return JSON.parse(content)

  } catch (error) {
    throw new Error(`ATS scoring failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 4. Interview Questions Generate karo
// ═══════════════════════════════════════
const generateInterviewQuestions = async (jdAnalysis, resumeText) => {
  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: `You are an expert interview coach.
          Generate relevant interview questions with detailed answers.
          Always respond in valid JSON format only. No extra text.`
        },
        {
          role: 'user',
          content: `Generate 10 interview questions with answers.
          Return JSON:
          {
            "questions": [
              {
                "question": "question here",
                "suggestedAnswer": "detailed answer here"
              }
            ]
          }
          
          Job Title: ${jdAnalysis.jobTitle}
          Required Skills: ${jdAnalysis.requiredSkills.join(', ')}
          Candidate Resume Summary: ${resumeText.substring(0, 500)}`
        }
      ]
    })

    const content = response.choices[0].message.content
    const parsed = JSON.parse(content)
    return parsed.questions

  } catch (error) {
    throw new Error(`Interview questions generation failed: ${error.message}`)
  }
}

// ═══════════════════════════════════════
// 5. Chatbot — Context Aware
// ═══════════════════════════════════════
const chatWithAI = async (userMessage, chatHistory, context) => {
  try {
    // Chat history ko Groq format mein convert karo
    const formattedHistory = chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content
    }))

    const response = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content: `You are HireReady AI assistant — an expert career coach.
          You help users with resume improvement, interview preparation, and job search.
          
          Current User Context:
          - Job Title Applying For: ${context.jobTitle || 'Not specified'}
          - Required Skills for Job: ${context.requiredSkills?.join(', ') || 'Not specified'}
          - User ATS Score: ${context.atsScore || 'Not calculated yet'}
          - Missing Skills: ${context.missingSkills?.join(', ') || 'None'}
          
          Be helpful, specific, and encouraging.
          Give actionable advice based on the user's context.`
        },
        ...formattedHistory,
        {
          role: 'user',
          content: userMessage
        }
      ]
    })

    return response.choices[0].message.content

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
