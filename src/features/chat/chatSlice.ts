import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'

interface ChatMessage {
  id: string
  text: string
  sender: 'user' | 'simba'
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isTyping: boolean
  suggestedQuestions: string[]
  isLoading: boolean
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
}

// Async thunk for simulating AI response
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simple response logic - in real app this would call your AI API
    const responses = [
      "That's a fantastic question! Let me explain...",
      "Great thinking! Here's what happens...",
      "I love your curiosity! Science is amazing because...",
      "Wow, that's a really smart question! The answer is...",
      "You're thinking like a real scientist! Here's the scoop..."
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    return `${randomResponse} ${generateScientificResponse(message)}`
  }
)

function generateScientificResponse(question: string): string {
  if (question.toLowerCase().includes('gravity')) {
    return "Gravity is like an invisible force that pulls everything toward the center of Earth! It's what keeps us on the ground and makes things fall down instead of floating away."
  }
  if (question.toLowerCase().includes('plant')) {
    return "Plants are like nature's solar panels! They use sunlight, water, and air to make their own food through photosynthesis. Pretty cool, right?"
  }
  if (question.toLowerCase().includes('sky') || question.toLowerCase().includes('blue')) {
    return "The sky looks blue because of the way sunlight bounces around in our atmosphere! Blue light gets scattered more than other colors."
  }
  return "That's such an interesting topic! Science helps us understand how our amazing world works. Keep asking questions - that's how great scientists are made!"
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
    clearChat: (state) => {
      state.messages = [initialState.messages[0]]
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true
        state.isTyping = true
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const message: ChatMessage = {
          id: Date.now().toString(),
          text: action.payload,
          sender: 'simba',
          timestamp: Date.now()
        }
        state.messages.push(message)
        state.isLoading = false
        state.isTyping = false
      })
      .addCase(sendMessage.rejected, (state) => {
        state.isLoading = false
        state.isTyping = false
      })
  },
})

export const { addUserMessage, setTyping, clearChat } = chatSlice.actions
export default chatSlice.reducer 