import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Rate limiting store (in production, use Redis or a database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute per IP
}

function getRateLimitKey(request: NextRequest): string {
  // Get IP from various headers (for different deployment platforms)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0] || realIp || 'unknown'
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const userLimit = rateLimitStore.get(key)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT.windowMs,
    })
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 }
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  userLimit.count++
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - userLimit.count }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request)
    const { allowed, remaining } = checkRateLimit(rateLimitKey)

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT.windowMs),
          }
        }
      )
    }

    // Get request body
    const body = await request.json()
    const { message, portfolioContext } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message format' },
        { status: 400 }
      )
    }

    // Message length validation
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long. Please keep it under 500 characters.' },
        { status: 400 }
      )
    }

    // Get API key from environment variable
    const API_KEY = process.env.GEMINI_API_KEY

    if (!API_KEY) {
      console.error('Gemini API key not configured')
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      )
    }

    // Call Gemini API
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`

    const prompt = `
You are an AI assistant for a portfolio website. You have access to their complete professional information below. 
Answer questions about their background, experience, projects, skills, and contact information in a helpful and engaging way.
Be conversational and friendly, but professional. Keep responses SHORT and TO THE POINT - aim for 2-3 sentences maximum unless specifically asked for detailed information. If asked about something not in the portfolio data, politely mention that you only have information about their professional profile.

${portfolioContext}

User Question: ${message}

Please provide a helpful response based on the portfolio information above.
`

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to get response from AI service' },
        { status: 500 }
      )
    }

    const result = await response.json()
    // console.log('Gemini API response:', result)

    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const botResponse = result.candidates[0].content.parts[0].text
      
      return NextResponse.json(
        { message: botResponse },
        {
          headers: {
            'X-RateLimit-Remaining': String(remaining),
          }
        }
      )
    } else {
      throw new Error('Unexpected response format from Gemini API')
    }
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}