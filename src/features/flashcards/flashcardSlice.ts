import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { FlashcardData } from '../../services/groqAPI'
import groqAPI from '../../services/groqAPI'
import { Topic } from '../../data/topics'
import { UserProfile } from '../user/userSlice'
import { RootState } from '../../store'

export interface FlashcardSession {
  sessionId: string
  topicId: string
  startTime: string // ISO string instead of Date
  endTime?: string // ISO string instead of Date
  totalCards: number
  completedCards: number
  timeSpent: number
}

interface FlashcardState {
  flashcards: FlashcardData[]
  currentCardIndex: number
  isFlipped: boolean
  showingResults: boolean
  session: FlashcardSession | null
  completionStats: {
    totalCards: number
    timeSpent: number
  } | null
  isGenerating: boolean
  error: string | null
}

const initialState: FlashcardState = {
  flashcards: [],
  currentCardIndex: 0,
  isFlipped: false,
  showingResults: false,
  session: null,
  completionStats: null,
  isGenerating: false,
  error: null
}

// Async thunks
export const generateFlashcards = createAsyncThunk(
  'flashcards/generateFlashcards',
  async ({ topic, userProfile }: { topic: Topic; userProfile: UserProfile }, { rejectWithValue }) => {
    try {
      const flashcards = await groqAPI.generateFlashcards(topic, userProfile)
      return { flashcards, topicId: topic.id }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate flashcards')
    }
  }
)

export const startFlashcardSession = createAsyncThunk(
  'flashcards/startSession',
  async ({ topicId, totalCards }: { topicId: string; totalCards: number }) => {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const startTime = new Date().toISOString()
    
    return {
      sessionId,
      topicId,
      startTime,
      totalCards,
      completedCards: 0,
      timeSpent: 0
    }
  }
)

export const endFlashcardSession = createAsyncThunk(
  'flashcards/endSession',
  async (_, { getState }) => {
    const state = getState() as RootState
    const { session, flashcards } = state.flashcards
    
    if (!session) return null

    const startTimeMs = new Date(session.startTime).getTime()
    const currentTimeMs = Date.now()
    let timeSpent = Math.floor((currentTimeMs - startTimeMs) / 1000)
    
    // Ensure minimum time spent is at least 1 second
    if (timeSpent < 1) {
      timeSpent = 1
    }

    return {
      ...session,
      endTime: new Date().toISOString(),
      completedCards: flashcards.length,
      timeSpent
    }
  }
)

const flashcardSlice = createSlice({
  name: 'flashcards',
  initialState,
  reducers: {
    flipCard: (state) => {
      state.isFlipped = !state.isFlipped
    },
    
    nextCard: (state) => {
      if (state.currentCardIndex < state.flashcards.length - 1) {
        state.currentCardIndex += 1
        state.isFlipped = false
      } else {
        state.showingResults = true
      }
    },
    
    previousCard: (state) => {
      if (state.currentCardIndex > 0) {
        state.currentCardIndex -= 1
        state.isFlipped = false
      }
    },
    
    shuffleCards: (state) => {
      for (let i = state.flashcards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [state.flashcards[i], state.flashcards[j]] = [state.flashcards[j], state.flashcards[i]]
      }
      state.currentCardIndex = 0
      state.isFlipped = false
    },
    
    resetSession: (state) => {
      state.currentCardIndex = 0
      state.isFlipped = false
      state.showingResults = false
      state.session = null
      state.completionStats = null
    },
    
    clearFlashcards: (state) => {
      state.flashcards = [];
      state.currentCardIndex = 0;
      state.isFlipped = false;
      state.showingResults = false;
      state.session = null;
      state.completionStats = null;
      state.isGenerating = false;
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      .addCase(generateFlashcards.pending, (state) => {
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateFlashcards.fulfilled, (state, action) => {
        state.isGenerating = false
        state.flashcards = action.payload.flashcards
        state.currentCardIndex = 0
        state.isFlipped = false
      })
      .addCase(generateFlashcards.rejected, (state, action) => {
        state.isGenerating = false
        state.error = action.payload as string
      })
      
      .addCase(startFlashcardSession.fulfilled, (state, action) => {
        state.session = action.payload
      })
      
      .addCase(endFlashcardSession.fulfilled, (state, action) => {
        if (action.payload) {
          state.session = action.payload
          state.completionStats = {
            totalCards: action.payload.totalCards,
            timeSpent: action.payload.timeSpent
          }
        }
      })
  }
})

export const {
  flipCard,
  nextCard,
  previousCard,
  shuffleCards,
  resetSession,
  clearFlashcards
} = flashcardSlice.actions

export default flashcardSlice.reducer 