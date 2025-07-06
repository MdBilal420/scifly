import { Topic } from '../data/topics'
import { UserProfile } from '../features/user/userSlice'

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || 'YOUR_GROQ_API_KEY'

export interface LessonContent {
  id: number
  title: string
  content: string
  tip: string
  interactive: string
  image: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

class GroqAPIService {
  private async makeRequest(messages: any[], maxRetries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🤖 Groq API attempt ${attempt}/${maxRetries}`)
        
        // Create AbortController for timeout handling
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
        
        const response = await fetch(GROQ_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages,
            model: 'llama-3.1-8b-instant', // Fast and capable model
            temperature: 0.7,
            max_tokens: 800, // Reduced from 1000 to minimize timeout risk
            top_p: 1,
            stream: false
          }),
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          
          // Handle specific error codes
          if (response.status === 524 || response.status === 504) {
            throw new Error(`TIMEOUT: Gateway timeout (${response.status})`)
          } else if (response.status === 429) {
            throw new Error(`RATE_LIMIT: Too many requests (${response.status})`)
          } else if (response.status >= 500) {
            throw new Error(`SERVER_ERROR: Groq server error (${response.status})`)
          } else {
            throw new Error(`Groq API error: ${response.status} - ${errorText}`)
          }
        }

        const data = await response.json()
        
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error('Invalid response format from Groq API')
        }
        
        console.log('✅ Groq API request successful')
        return data.choices[0].message.content
        
      } catch (error: any) {
        console.warn(`❌ Groq API attempt ${attempt} failed:`, error.message)
        
        // Don't retry for client errors (400-499, except 429)
        if (error.message.includes('Groq API error:') && 
            !error.message.includes('TIMEOUT') && 
            !error.message.includes('RATE_LIMIT') && 
            !error.message.includes('SERVER_ERROR')) {
          throw error
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          console.error('🚨 All Groq API attempts failed')
          throw error
        }
        
        // Exponential backoff: wait longer between retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // 1s, 2s, 4s max
        console.log(`⏳ Retrying in ${delay/1000}s...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    throw new Error('All retry attempts exhausted')
  }

  async generateLessonContent(topic: Topic, userProfile?: UserProfile): Promise<LessonContent[]> {
    // Determine content style based on user's learning speed
    let contentStyle = 'balanced with 2-3 sentences'
    let tipStyle = 'encouraging'
    let exampleCount = 2
    
    if (userProfile) {
      const { preferences } = userProfile
      
      switch (preferences.explanationDetail) {
        case 'comprehensive':
          contentStyle = 'detailed with 4-5 sentences and multiple examples'
          tipStyle = 'detailed and thorough'
          exampleCount = preferences.exampleCount
          break
        case 'detailed':
          contentStyle = 'well-explained with 3-4 sentences and good examples'
          tipStyle = 'helpful and informative'
          exampleCount = preferences.exampleCount
          break
        case 'basic':
          contentStyle = 'concise with 1-2 sentences and clear points'
          tipStyle = 'quick and encouraging'
          exampleCount = preferences.exampleCount
          break
      }
    }

    const prompt = `Create 4 lesson sections for Grade 5 about "${topic.title}".

LEARNING PROFILE: ${userProfile ? `${userProfile.name}, Speed ${userProfile.learningSpeed}/5, Style: ${contentStyle}` : 'Default student'}

Return JSON array with:
- id: 1-4
- title: engaging title  
- content: ${contentStyle}
- tip: ${tipStyle} tip from Simba
- interactive: "tap-to-reveal"|"drag-to-learn"|"animation"|"celebration"
- image: single emoji

Cover: ${topic.keyLearningPoints.slice(0, 2).join(', ')}${userProfile?.name ? `. Address ${userProfile.name} in tips.` : ''}`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert teacher skilled in developing detailed lesson plans that are meaningfully connected to learning outcomes for your students. Your task is to generate a list of 5 lesson objectives for my fifth grade science class. Each objective should begin with “Students will be able to” and align to the 5th grade Next Generation Science Standards. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      // Parse the JSON response
      const cleanResponse = response.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      console.error('Failed to generate lesson content:', error)
      // Return fallback content
      return this.getFallbackLessonContent(topic, userProfile)
    }
  }

  async generateQuizQuestions(topic: Topic, count: number = 5): Promise<QuizQuestion[]> {
    const prompt = `Create ${count} Grade 5 quiz questions about "${topic.title}".

JSON format:
- question: clear question
- options: 4 answer choices  
- correctAnswer: index 0-3
- explanation: simple why explanation

Age 10-11, engaging language. Focus: ${topic.keyLearningPoints.slice(0, 2).join(', ')}`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert elementary science educator creating Grade 5 quiz questions. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      const cleanResponse = response.replace(/```json|```/g, '').trim()
      return JSON.parse(cleanResponse)
    } catch (error) {
      console.error('Failed to generate quiz questions:', error)
      return this.getFallbackQuizQuestions(topic)
    }
  }

  async generateChatResponse(topic: Topic, userMessage: string, conversationHistory: any[]): Promise<string> {
    const systemPrompt = `You are Simba, a friendly lion teaching Grade 5 students about "${topic.title}". Be enthusiastic, use simple language, lion expressions ("Roar-some!"), and relate to real-world examples. Keep responses 1-2 sentences.`

    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ]

      const response = await this.makeRequest(messages)
      return response
    } catch (error) {
      console.error('Failed to generate chat response:', error)
      return "Roar! I'm having trouble thinking right now. Try asking me something else about science! 🦁"
    }
  }

  private getFallbackLessonContent(topic: Topic, userProfile?: UserProfile): LessonContent[] {
    const userName = userProfile?.name || 'young scientist'
    const contentLength = userProfile?.preferences.explanationDetail === 'comprehensive' ? 'detailed explanation' : 
                         userProfile?.preferences.explanationDetail === 'basic' ? 'simple overview' : 'good explanation'
    
    return [
      {
        id: 1,
        title: `What is ${topic.title}?`,
        content: `${topic.description} Let's explore this amazing topic together${userProfile?.name ? `, ${userProfile.name}` : ''}!`,
        tip: `Great question${userProfile?.name ? `, ${userProfile.name}` : ''}! Let's discover the basics first! 🦁`,
        interactive: "tap-to-reveal",
        image: topic.icon
      },
      {
        id: 2,
        title: "How it Works",
        content: "This is a fascinating process that happens all around us in nature!",
        tip: "Science is everywhere - even in your backyard!",
        interactive: "drag-to-learn",
        image: "🔬"
      },
      {
        id: 3,
        title: "Real World Examples",
        content: "You can see examples of this concept in your daily life!",
        tip: "Look around - science is happening right now!",
        interactive: "animation",
        image: "🌟"
      },
      {
        id: 4,
        title: "Fun Facts",
        content: "Here are some amazing facts that will surprise you!",
        tip: "You've learned so much! Keep being curious! 🎉",
        interactive: "celebration",
        image: "🎊"
      }
    ]
  }

  private getFallbackQuizQuestions(topic: Topic): QuizQuestion[] {
    return [
      {
        question: `What is the main focus of ${topic.title}?`,
        options: [
          topic.keyLearningPoints[0] || "Learning about science",
          "Playing games",
          "Reading books",
          "Watching TV"
        ],
        correctAnswer: 0,
        explanation: `That's right! ${topic.title} focuses on ${topic.keyLearningPoints[0] || "understanding science concepts"}.`
      },
      {
        question: "Why is it important to learn about science?",
        options: [
          "It's boring",
          "It helps us understand the world around us",
          "It's too difficult",
          "Only for adults"
        ],
        correctAnswer: 1,
        explanation: "Science helps us understand how everything works in our amazing world!"
      }
    ]
  }
}

export const groqAPI = new GroqAPIService()
export default groqAPI 