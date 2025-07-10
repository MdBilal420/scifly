import { Topic } from '../data/topics'
import { UserProfile } from '../features/user/userSlice'

// Groq API configuration
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY 

export interface LessonContent {
  id: number
  title: string
  content: string
  tip: string
  interactive: "tap-to-reveal" | "drag-to-learn" | "animation" | "celebration"
  image: string
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface FlashcardData {
  id: number
  type: 'qa' | 'term_definition' | 'image_description' | 'fill_blank'
  front: string
  back: string
  hint?: string
  image?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

class GroqAPIService {
  private async makeRequest(messages: any[], maxRetries: number = 3): Promise<string> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        
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
            model: 'llama3-8b-8192', // Use the model that works in our test
            temperature: 0.7,
            max_tokens: 4000, // Increase for flashcard generation to prevent truncation
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
        
        const content = data.choices[0].message.content
        
        return content
        
      } catch (error: any) {
        
        // Don't retry for client errors (400-499, except 429)
        if (error.message.includes('Groq API error:') && 
            !error.message.includes('TIMEOUT') && 
            !error.message.includes('RATE_LIMIT') && 
            !error.message.includes('SERVER_ERROR')) {
          throw error
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          throw error
        }
        
        // Exponential backoff: wait longer between retries
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000) // 1s, 2s, 4s max
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
- image: "single emoji in quotes"

Cover: ${topic.keyLearningPoints.slice(0, 2).join(', ')}${userProfile?.name ? `. Address ${userProfile.name} in tips.` : ''}`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert teacher skilled in developing detailed lesson plans that are meaningfully connected to learning outcomes for your students. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      // Parse the JSON response with robust handling
      let cleanResponse = response.replace(/```json|```/g, '').trim()

      let lessonContent: any[]
      
      try {
        // Attempt 1: Direct parse
        lessonContent = JSON.parse(cleanResponse)
      } catch (e1) {
        // Attempt 2: Extract JSON array from surrounding text
        const jsonMatch = cleanResponse.match(/(\[[\s\S]*\])/)
        
        if (jsonMatch && jsonMatch[0]) {
          const extractedJson = jsonMatch[0]
          try {
            lessonContent = JSON.parse(extractedJson)
          } catch (e2) {
            // Attempt 3: Repair common JSON issues and parse again
            try {
              // This regex will find "image": emoji (without quotes) and add quotes
              const repairedJson = extractedJson.replace(/(['"])?image\1?\s*:\s*([^"'{}\[\]\s,]+)/g, '"image": "$2"');
              lessonContent = JSON.parse(repairedJson)
            } catch (e3) {
              throw new Error('Failed to parse lesson content from LLM after multiple attempts.')
            }
          }
        } else {
          throw new Error('Failed to parse lesson content, no JSON array found in response.')
        }
      }
      
      if (!Array.isArray(lessonContent)) {
        throw new Error('Lesson JSON is not an array')
      }      
      
      // Generate images for each lesson
      return lessonContent
    } catch (error) {
      console.error('Failed to generate lesson content:', error)
      // Return fallback content
      return this.getFallbackLessonContent(topic, userProfile)
    }
  }





  async generateQuizQuestions(topic: Topic, count: number = 5): Promise<QuizQuestion[]> {
    const prompt = `Create exactly ${count} Grade 5 quiz questions about "${topic.title}".

IMPORTANT: You must respond with ONLY a valid JSON array. No explanations, no markdown, no other text.

Required JSON format:
[
  {
    "question": "What is the main function of...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "This is correct because..."
  }
]

Rules:
- correctAnswer must be 0, 1, 2, or 3 (index of correct option)
- Each question must have exactly 4 options
- Focus on: ${topic.keyLearningPoints.slice(0, 2).join(', ')}
- Use age-appropriate language for 10-11 year olds`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are a JSON-only quiz generator. You must respond with ONLY valid JSON array. No markdown, no explanations, no other text. If you cannot generate valid JSON, respond with an empty array [].'
        },
        {
          role: 'user',
          content: prompt
        }
      ], 2) // Reduce retries for quiz generation

      // Parse the JSON response with better error handling
      let cleanResponse = response.replace(/```json|```/g, '').trim()
      
      // Try to fix common JSON issues
      try {
        // First attempt: direct parse
        const questions = JSON.parse(cleanResponse) as QuizQuestion[]
        return this.validateAndProcessQuizQuestions(questions, count, topic)
      } catch (parseError: any) {
        // Second attempt: try to extract JSON array from the response
        const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const questions = JSON.parse(jsonMatch[0]) as QuizQuestion[]
            return this.validateAndProcessQuizQuestions(questions, count, topic)
          } catch (extractError: any) {
            // Continue to next attempt
          }
        }
        
        // Third attempt: try to repair common JSON issues
        try {
          const repairedResponse = this.repairQuizJSON(cleanResponse)
          const questions = JSON.parse(repairedResponse) as QuizQuestion[]
          return this.validateAndProcessQuizQuestions(questions, count, topic)
        } catch (repairError: any) {
          // Continue to next attempt
        }
        
        // If all parsing attempts fail, throw the original error
        throw parseError
      }
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
    const topicTitle = topic.title.toLowerCase()
    const keyPoints = topic.keyLearningPoints
    
    // Generate topic-specific fallback questions
    const fallbackQuestions: QuizQuestion[] = [
      {
        question: `What is the main focus of ${topic.title}?`,
        options: [
          keyPoints[0] || "Learning about science concepts",
          "Playing games and having fun",
          "Reading books and stories",
          "Watching videos and movies"
        ],
        correctAnswer: 0,
        explanation: `That's right! ${topic.title} focuses on ${keyPoints[0] || "understanding important science concepts"}.`
      },
      {
        question: "Why is it important to learn about science?",
        options: [
          "It's boring and difficult",
          "It helps us understand the world around us",
          "It's only for adults",
          "It's not important at all"
        ],
        correctAnswer: 1,
        explanation: "Science helps us understand how everything works in our amazing world!"
      },
      {
        question: `Which of these is most related to ${topic.title}?`,
        options: [
          "Playing video games",
          keyPoints[1] || "Understanding natural processes",
          "Watching cartoons",
          "Eating food"
        ],
        correctAnswer: 1,
        explanation: `${topic.title} is all about ${keyPoints[1] || "understanding how things work in nature"}!`
      },
      {
        question: "What do scientists do?",
        options: [
          "Only work in laboratories",
          "Ask questions and find answers about the world",
          "Only study animals",
          "Only work with computers"
        ],
        correctAnswer: 1,
        explanation: "Scientists ask questions and use evidence to find answers about how our world works!"
      },
      {
        question: `How can you learn more about ${topic.title}?`,
        options: [
          "Only by reading textbooks",
          "By observing, asking questions, and doing experiments",
          "Only by watching TV",
          "Only by playing outside"
        ],
        correctAnswer: 1,
        explanation: "The best way to learn about science is by observing, asking questions, and exploring!"
      }
    ]

    return fallbackQuestions
  }

  private validateAndProcessQuizQuestions(questions: QuizQuestion[], count: number, topic: Topic): QuizQuestion[] {
    // Ensure we have the right number of questions
    if (!Array.isArray(questions)) {
      return this.getFallbackQuizQuestions(topic)
    }

    // Validate and process each question
    const validQuestions = questions
      .filter((q, index) => {
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          return false
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          return false
        }
        return true
      })
      .map((q, index) => ({
        ...q,
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        explanation: q.explanation?.trim() || `That's correct! ${q.options[q.correctAnswer]} is the right answer.`
      }))
      .slice(0, count)

    // If we don't have enough valid questions, add fallback questions
    if (validQuestions.length < count) {
      const fallbackQuestions = this.getFallbackQuizQuestions(topic)
      validQuestions.push(...fallbackQuestions.slice(0, count - validQuestions.length))
    }

    return validQuestions
  }

  private repairQuizJSON(response: string): string {
    // Remove any text before the first [
    const startIndex = response.indexOf('[')
    if (startIndex === -1) {
      throw new Error('No JSON array found in response')
    }
    
    let jsonPart = response.substring(startIndex)
    
    // Find the matching closing bracket
    let bracketCount = 0
    let endIndex = -1
    
    for (let i = 0; i < jsonPart.length; i++) {
      if (jsonPart[i] === '[') bracketCount++
      if (jsonPart[i] === ']') bracketCount--
      if (bracketCount === 0) {
        endIndex = i + 1
        break
      }
    }
    
    if (endIndex === -1) {
      throw new Error('Unmatched brackets in JSON')
    }
    
    return jsonPart.substring(0, endIndex)
  }

  async generateFlashcards(topic: Topic, userProfile: UserProfile): Promise<FlashcardData[]> {
    const userSpeed = userProfile.learningSpeed
    const deckSize = userSpeed <= 2 ? (userSpeed === 1 ? 10 : 15) : 12
    const gradeLevel = userSpeed === 1 ? 'elementary school' : userSpeed === 2 ? 'middle school' : 'high school'
    
    const prompt = `You are a diligent ${gradeLevel} student, skilled in creating excellent study materials that help you achieve academic success.

Your task is to create ${deckSize} flashcards about "${topic.title}" for ${gradeLevel} level students.

Create a mix of these flashcard types:
1. Q&A (Question → Answer)
2. Term → Definition 
3. Image Description (Describe → Term/Concept)
4. Fill-in-the-blank (Sentence with ___ blank → Missing word/phrase)

${userSpeed === 1 ? `
For elementary students, focus on:
- Simple, clear language
- Basic concepts and vocabulary
- Easy to remember facts
- Visual and concrete examples
` : `
For middle school students, include:
- Slightly more complex vocabulary
- Cause and effect relationships
- Process steps and sequences
- Connections between concepts
`}

Topic Description: ${topic.description}
Key Learning Points: ${topic.keyLearningPoints.join(', ')}

Format each flashcard as JSON with this structure:
{
  "id": number,
  "type": "qa" | "term_definition" | "image_description" | "fill_blank",
  "front": "Question/Term/Description/Sentence with ___ blank",
  "back": "Answer/Definition/Term/Missing word or phrase",
  "hint": "Optional helpful hint (1-2 words)",
  "difficulty": "easy" | "medium" | "hard"
}

Return ONLY a valid JSON array of ${deckSize} flashcards. No other text.`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert elementary educator creating flashcards for grade school students. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ])

      // Parse the JSON response with better error handling
      let cleanResponse = response.replace(/```json|```/g, '').trim()
      
      // Try to fix common JSON issues
      try {
        // First attempt: direct parse
        const flashcards = JSON.parse(cleanResponse) as FlashcardData[]
        return this.validateAndProcessFlashcards(flashcards, deckSize, topic)
      } catch (parseError: any) {
        // Second attempt: try to extract JSON array from the response
        const jsonMatch = cleanResponse.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          try {
            const flashcards = JSON.parse(jsonMatch[0]) as FlashcardData[]
            return this.validateAndProcessFlashcards(flashcards, deckSize, topic)
          } catch (extractError: any) {
            // Continue to next attempt
          }
        }
        
        // Third attempt: try to fix common JSON syntax issues
        try {
          // Remove trailing commas and fix common issues
          let fixedResponse = cleanResponse
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/,\s*}/g, '}') // Remove trailing commas before closing braces
            .replace(/,\s*]/g, ']') // Remove trailing commas before closing brackets
          
          const flashcards = JSON.parse(fixedResponse) as FlashcardData[]
          return this.validateAndProcessFlashcards(flashcards, deckSize, topic)
        } catch (fixError: any) {
          // Fourth attempt: try to repair truncated JSON
          try {
            const repairedResponse = this.repairTruncatedJSON(cleanResponse)
            const flashcards = JSON.parse(repairedResponse) as FlashcardData[]
            return this.validateAndProcessFlashcards(flashcards, deckSize, topic)
          } catch (repairError: any) {
            throw new Error(`JSON parsing failed after multiple attempts: ${parseError.message}`)
          }
        }
      }
    } catch (error: any) {
      // Better fallback: Create more diverse flashcards from topic learning points
      const fallbackCards: FlashcardData[] = topic.keyLearningPoints.slice(0, deckSize).map((point: string, index: number) => {
        const cardTypes = ['qa', 'term_definition', 'fill_blank'] as const
        const cardType = cardTypes[index % cardTypes.length]
        
        switch (cardType) {
          case 'qa':
            return {
              id: index + 1,
              type: 'qa' as const,
              front: `What do you know about ${point}?`,
              back: `${point} - This is an important concept in ${topic.title}.`,
              difficulty: 'medium' as const
            }
          case 'term_definition':
            return {
              id: index + 1,
              type: 'term_definition' as const,
              front: point,
              back: `A key concept related to ${topic.title}.`,
              difficulty: 'medium' as const
            }
          case 'fill_blank':
            return {
              id: index + 1,
              type: 'fill_blank' as const,
              front: `${topic.title} involves understanding ___.`,
              back: point,
              difficulty: 'medium' as const
            }
          default:
            return {
              id: index + 1,
              type: 'qa' as const,
              front: `Tell me about ${point}.`,
              back: point,
              difficulty: 'medium' as const
            }
        }
      })

      // Add additional basic cards if we need more
      while (fallbackCards.length < deckSize) {
        const index = fallbackCards.length
        fallbackCards.push({
          id: index + 1,
          type: 'qa' as const,
          front: `What makes ${topic.title} interesting?`,
          back: topic.description,
          difficulty: 'easy' as const
        })
      }

      return fallbackCards.slice(0, deckSize)
    }
  }

  private validateAndProcessFlashcards(flashcards: FlashcardData[], deckSize: number, topic: Topic): FlashcardData[] {
    // Validate and ensure we have the right number of cards
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error(`Invalid flashcard format received: expected array, got ${typeof flashcards}`)
    }

    // Ensure each flashcard has required fields
    const validatedFlashcards = flashcards.slice(0, deckSize).map((card: FlashcardData, index: number) => ({
      id: index + 1,
      type: card.type || 'qa',
      front: card.front || `Question ${index + 1}`,
      back: card.back || `Answer ${index + 1}`,
      hint: card.hint,
      difficulty: card.difficulty || 'medium'
    }))

    return validatedFlashcards
  }

  private repairTruncatedJSON(response: string): string {
    // Find the last complete flashcard object
    const flashcardPattern = /\{[^}]*"id":\s*\d+[^}]*\}/g
    const matches = response.match(flashcardPattern)
    
    if (!matches || matches.length === 0) {
      throw new Error('No valid flashcard objects found in response')
    }
    
    // Take all complete flashcard objects
    const completeFlashcards = matches.slice(0, -1) // Remove the last one as it might be incomplete
    
    // If we have enough complete flashcards, use them
    if (completeFlashcards.length >= 5) {
      const repairedJSON = `[${completeFlashcards.join(',')}]`
      return repairedJSON
    }
    
    // Try to complete the last flashcard if it's mostly complete
    const lastMatch = matches[matches.length - 1]
    if (lastMatch && lastMatch.includes('"id"') && lastMatch.includes('"type"') && lastMatch.includes('"front"')) {
      // Check if it has the essential fields
      const hasBack = lastMatch.includes('"back"')
      const hasDifficulty = lastMatch.includes('"difficulty"')
      
      if (hasBack) {
        // Complete the last flashcard with missing fields
        let completedLast = lastMatch
        if (!hasDifficulty) {
          completedLast = completedLast.replace(/}$/, ', "difficulty": "medium"}')
        }
        if (!completedLast.includes('"hint"')) {
          completedLast = completedLast.replace(/}$/, ', "hint": "help"}')
        }
        
        const repairedJSON = `[${completeFlashcards.join(',')},${completedLast}]`
        return repairedJSON
      }
    }
    
    // If we can't repair, use what we have
    if (completeFlashcards.length > 0) {
      const repairedJSON = `[${completeFlashcards.join(',')}]`
      return repairedJSON
    }
    
    throw new Error('Could not repair truncated JSON')
  }
}

export const groqAPI = new GroqAPIService()
export default groqAPI 