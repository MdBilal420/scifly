import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { chatAPI, userAPI } from '../../services/api'
import { ChatMessage as DatabaseChatMessage } from '../../config/supabase'
import groqAPI from '../../services/groqAPI'
import { Topic } from '../../data/topics'
import { RootState } from '../../store'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'simba'
  timestamp: number
  topicId?: string
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  suggestedQuestions: string[]
  isLoading: boolean
  isSendingMessage: boolean
  error: string | null
  currentTopic?: Topic
}

const initialSuggestedQuestions = [
  "How does gravity work?",
  "Why do plants need sunlight?",
  "What makes the sky blue?",
  "How do birds fly?",
  "Why does ice float on water?"
]

const initialState: ChatState = {
  messages: [
    {
      id: '1',
      text: "Hi there! I'm Simba, your science buddy! 🦁 What would you like to explore today?",
      sender: 'simba',
      timestamp: Date.now()
    }
  ],
  isTyping: false,
  suggestedQuestions: initialSuggestedQuestions,
  isLoading: false,
  isSendingMessage: false,
  error: null
}

// Helper function to convert DatabaseChatMessage to ChatMessage
function mapDatabaseMessageToMessage(dbMessage: DatabaseChatMessage): ChatMessage {
  return {
    id: dbMessage.id,
    text: dbMessage.message,
    sender: dbMessage.sender,
    timestamp: new Date(dbMessage.created_at).getTime(),
    topicId: dbMessage.topic_id || undefined
  }
}

// Async thunks for chat management
export const loadChatHistory = createAsyncThunk(
  'chat/loadChatHistory',
  async ({ userId, topicId }: { userId: string; topicId?: string }, { rejectWithValue }) => {
    try {
      const messages = await chatAPI.getChatHistory(userId, topicId)
      return messages.map(mapDatabaseMessageToMessage)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load chat history')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ 
    userId, 
    message, 
    topicId 
  }: { 
    userId: string; 
    message: string; 
    topicId?: string 
  }, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const currentTopic = state.chat.currentTopic

      // Save user message to database
      await chatAPI.sendMessage(userId, message, 'user', topicId, {
        messageLength: message.length,
        timestamp: Date.now()
      })

      // Generate AI response
      let simbaResponse: string
      if (currentTopic) {
        // Get conversation history for context
        const conversationHistory = state.chat.messages
          .slice(-5) // Last 5 messages for context
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))

        simbaResponse = await groqAPI.generateChatResponse(currentTopic, message, conversationHistory)
      } else {
        // Fallback response if no topic context
        simbaResponse = generateSimpleResponse(message)
      }

      // Save Simba's response to database
      await chatAPI.sendMessage(userId, simbaResponse, 'simba', topicId, {
        generatedResponse: true,
        originalQuery: message,
        responseLength: simbaResponse.length,
        timestamp: Date.now()
      })

      // Log chat activity
      await userAPI.logActivity(userId, 'chat_message', {
        topicId,
        messageLength: message.length,
        responseLength: simbaResponse.length
      })

      return {
        userMessage: {
          id: `user_${Date.now()}`,
          text: message,
          sender: 'user' as const,
          timestamp: Date.now(),
          topicId
        },
        simbaResponse: {
          id: `simba_${Date.now()}`,
          text: simbaResponse,
          sender: 'simba' as const,
          timestamp: Date.now() + 1000,
          topicId
        }
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message')
    }
  }
)

export const clearChatHistory = createAsyncThunk(
  'chat/clearChatHistory',
  async ({ userId, topicId }: { userId: string; topicId?: string }, { rejectWithValue }) => {
    try {
      await chatAPI.clearChatHistory(userId, topicId)
      
      // Log clear activity
      await userAPI.logActivity(userId, 'chat_message', { topicId, action: 'cleared' })
      
      return topicId
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear chat history')
    }
  }
)

// Generate simple response when no topic context is available
function generateSimpleResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Roar! Hello there, young scientist! 🦁 I'm excited to explore science with you today!"
  }
  
  if (lowerMessage.includes('help')) {
    return "I'm here to help you learn about amazing science topics! Pick a topic to explore, or ask me any science question!"
  }
  
  if (lowerMessage.includes('thank')) {
    return "You're very welcome! Keep that curiosity roaring! 🦁✨"
  }
  
  // Default responses for various science topics
  if (lowerMessage.includes('gravity')) {
    return "Gravity is like an invisible force that pulls everything toward Earth! It's what keeps us on the ground instead of floating away! 🌍"
  }
  
  if (lowerMessage.includes('plant')) {
    return "Plants are amazing! They use sunlight, water, and air to make their own food through photosynthesis. They're like nature's solar panels! 🌱☀️"
  }
  
  if (lowerMessage.includes('space') || lowerMessage.includes('planet')) {
    return "Space is incredible! Our solar system has 8 amazing planets, each with unique features. Which planet would you like to visit? 🪐🚀"
  }
  
  return "That's a fantastic question! Science helps us understand our amazing world. Choose a topic to explore together and I'll give you detailed answers! 🦁🔬"
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addUserMessage: (state, action: PayloadAction<string>) => {
      const message: ChatMessage = {
        id: Date.now().toString(),
        text: action.payload,
        sender: 'user',
        timestamp: Date.now()
      }
      state.messages.push(message)
    },
    
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload
    },
    
    setCurrentTopic: (state, action: PayloadAction<Topic | undefined>) => {
      state.currentTopic = action.payload
      // Update suggested questions based on topic
      if (action.payload) {
        state.suggestedQuestions = [
          `Tell me about ${action.payload.title}`,
          `What's the most interesting thing about ${action.payload.title.toLowerCase()}?`,
          `How does ${action.payload.title.toLowerCase()} work?`,
          `Can you give me an example of ${action.payload.title.toLowerCase()}?`,
          "Why is this important to learn about?"
        ]
      } else {
        state.suggestedQuestions = initialSuggestedQuestions
      }
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Local message handling for real-time UI updates
    addLocalMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload)
    },
    
    // Reset to initial state but keep current topic
    resetChat: (state) => {
      state.messages = [initialState.messages[0]]
      state.isTyping = false
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Load chat history
    builder
      .addCase(loadChatHistory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadChatHistory.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload.length > 0) {
          state.messages = action.payload
        }
      })
      .addCase(loadChatHistory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Send message
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isSendingMessage = true
        state.isTyping = true
        state.error = null
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isSendingMessage = false
        state.isTyping = false
        
        // Add both user message and Simba's response immediately
        // The UI will handle the delay effect with animations
        state.messages.push(action.payload.userMessage)
        state.messages.push(action.payload.simbaResponse)
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isSendingMessage = false
        state.isTyping = false
        state.error = action.payload as string
        
        // Add error message from Simba
        const errorMessage: ChatMessage = {
          id: `error_${Date.now()}`,
          text: "Roar! I'm having trouble thinking right now. Try asking me something else about science! 🦁",
          sender: 'simba',
          timestamp: Date.now()
        }
        state.messages.push(errorMessage)
      })

    // Clear chat history
    builder
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.messages = [initialState.messages[0]]
      })
      .addCase(clearChatHistory.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const { 
  addUserMessage, 
  setTyping, 
  setCurrentTopic, 
  clearError, 
  addLocalMessage, 
  resetChat 
} = chatSlice.actions

export default chatSlice.reducer 