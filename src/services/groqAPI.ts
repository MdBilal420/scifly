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
  private async makeRequest(messages: any[]) {
    try {
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
          max_tokens: 1000,
          top_p: 1,
          stream: false
        })
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('Groq API request failed:', error)
      throw error
    }
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

    const prompt = `Create 4 educational lesson sections for Grade 5 students about "${topic.title}".
    
    USER LEARNING PROFILE:
    ${userProfile ? `- Name: ${userProfile.name}` : '- Default student'}
    ${userProfile ? `- Learning Speed: ${userProfile.learningSpeed}/5 (${userProfile.learningSpeed <= 2 ? 'methodical learner' : userProfile.learningSpeed >= 4 ? 'quick learner' : 'balanced learner'})` : ''}
    ${userProfile ? `- Content Style: ${contentStyle}` : ''}
    ${userProfile ? `- Examples Needed: ${exampleCount}` : ''}
    
    Adapt the content complexity and detail level to match this learning profile.
    
    Format as JSON array with these fields for each section:
    - id: number (1-4)
    - title: string (engaging title)
    - content: string (${contentStyle})
    - tip: string (${tipStyle} tip from Simba the lion mascot)
    - interactive: string (one of: "tap-to-reveal", "drag-to-learn", "animation", "celebration")
    - image: string (single emoji representing the concept)
    
    Key learning points to cover: ${topic.keyLearningPoints.join(', ')}
    
    ${userProfile?.name ? `Address the student as ${userProfile.name} occasionally in tips.` : ''}
    Make it fun, engaging, and perfectly matched to the learning style!`

    try {
      const response = await this.makeRequest([
        {
          role: 'system',
          content: 'You are an expert elementary science educator who creates engaging, age-appropriate content for Grade 5 students. Always respond with valid JSON.'
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
    const prompt = `Create ${count} multiple choice quiz questions for Grade 5 students about "${topic.title}".
    
    Format as JSON array with these fields for each question:
    - question: string (clear question)
    - options: array of 4 strings (possible answers)
    - correctAnswer: number (index 0-3 of correct option)
    - explanation: string (simple explanation of why the answer is correct)
    
    Make questions appropriate for 10-11 year olds, with engaging scenarios and clear language.
    Focus on: ${topic.keyLearningPoints.join(', ')}`

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
    const systemPrompt = `You are Simba, a friendly lion mascot who teaches Grade 5 students about science. 
    You're currently helping them learn about "${topic.title}".
    
    Personality:
    - Enthusiastic and encouraging
    - Uses simple, age-appropriate language
    - Often uses lion-related expressions like "Roar-some!" or "That's mane-ificent!"
    - Always supportive and patient
    - Relates concepts to real-world examples kids understand
    
    Keep responses to 1-2 sentences, make them engaging and educational.`

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