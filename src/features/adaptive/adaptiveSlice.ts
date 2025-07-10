import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { getAdaptiveLesson, trackUserInteraction, suggestOptimalSpeed } from '../../services/adaptiveAPI'
import type { AdaptiveLessonRequest, UserInteraction } from '../../services/adaptiveAPI'

export interface AdaptedContent {
  lessonId: string
  userSpeed: number
  adaptedContent: any
  uiConfig: any
  trackingId: string
  cachedAt: number
  effectivenessScore?: number
}

export interface InteractionSummary {
  sessionId: string
  userId: string
  lessonId: string
  interactions: UserInteraction[]
  startTime: number
  endTime?: number
  totalEngagement: number
  completed: boolean
}

export interface SpeedRecommendation {
  suggestedSpeed: number
  currentSpeed: number
  reason: string
  confidence: number
  timestamp: number
}

interface AdaptiveState {
  // Content caching
  cachedContent: Record<string, AdaptedContent> // key: `${lessonId}-${userSpeed}`
  contentLoading: Record<string, boolean>
  
  // Current session
  currentSession: InteractionSummary | null
  currentLessonContent: AdaptedContent | null
  
  // Interaction tracking
  pendingInteractions: UserInteraction[]
  trackingEnabled: boolean
  
  // Speed recommendations
  speedRecommendations: SpeedRecommendation[]
  showSpeedSuggestion: boolean
  
  // UI state
  adaptiveMode: 'auto' | 'manual' | 'disabled'
  debugMode: boolean
  
  // Analytics
  sessionMetrics: {
    totalTime: number
    totalInteractions: number
    avgEngagement: number
    speedChanges: number
  }
  
  error: string | null
  isLoading: boolean
}

const initialState: AdaptiveState = {
  cachedContent: {},
  contentLoading: {},
  currentSession: null,
  currentLessonContent: null,
  pendingInteractions: [],
  trackingEnabled: true,
  speedRecommendations: [],
  showSpeedSuggestion: false,
  adaptiveMode: 'auto',
  debugMode: false,
  sessionMetrics: {
    totalTime: 0,
    totalInteractions: 0,
    avgEngagement: 0,
    speedChanges: 0
  },
  error: null,
  isLoading: false
}

// Async thunks
export const loadAdaptiveLesson = createAsyncThunk(
  'adaptive/loadAdaptiveLesson',
  async (request: AdaptiveLessonRequest, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { adaptive: AdaptiveState }
      const cacheKey = `${request.lessonId}-${request.userSpeed}`
      
      // Check if we have cached content that's still fresh (1 hour)
      const cached = state.adaptive.cachedContent[cacheKey]
      const isStale = cached ? (Date.now() - cached.cachedAt) > 3600000 : true
      
      if (cached && !isStale) {
        console.log('🎯 Using cached adaptive content for', cacheKey)
        return { ...cached, fromCache: true }
      }
      
      console.log('📡 Fetching adaptive lesson content for', cacheKey)
      const response = await getAdaptiveLesson(request)
      
      return {
        lessonId: request.lessonId,
        userSpeed: request.userSpeed,
        adaptedContent: response.adaptedContent,
        uiConfig: response.uiConfig,
        trackingId: response.trackingId,
        cachedAt: Date.now(),
        fromCache: false
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load adaptive lesson')
    }
  }
)

export const trackInteraction = createAsyncThunk(
  'adaptive/trackInteraction',
  async (interaction: UserInteraction, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { adaptive: AdaptiveState }
      
      // If tracking is disabled, just return
      if (!state.adaptive.trackingEnabled) {
        return { tracked: false, interaction }
      }
      
      await trackUserInteraction(interaction)
      return { tracked: true, interaction }
    } catch (error: any) {
      console.warn('Failed to track interaction:', error)
      // Don't fail the whole operation for tracking errors
      return { tracked: false, interaction, error: error.message }
    }
  }
)

export const requestSpeedRecommendation = createAsyncThunk(
  'adaptive/requestSpeedRecommendation',
  async (userId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { adaptive: AdaptiveState }
      
      // Don't request if we recently got a recommendation
      const lastRecommendation = state.adaptive.speedRecommendations[0]
      if (lastRecommendation && (Date.now() - lastRecommendation.timestamp) < 300000) { // 5 minutes
        return null
      }
      
      const recommendation = await suggestOptimalSpeed(userId)
      
      return {
        ...recommendation,
        timestamp: Date.now(),
        currentSpeed: state.adaptive.currentLessonContent?.userSpeed || 3
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get speed recommendation')
    }
  }
)

const adaptiveSlice = createSlice({
  name: 'adaptive',
  initialState,
  reducers: {
    // Session management
    startLearningSession: (state, action: PayloadAction<{ userId: string; lessonId: string }>) => {
      state.currentSession = {
        sessionId: `session_${Date.now()}`,
        userId: action.payload.userId,
        lessonId: action.payload.lessonId,
        interactions: [],
        startTime: Date.now(),
        totalEngagement: 0,
        completed: false
      }
      console.log('🎯 Started learning session:', state.currentSession.sessionId)
    },
    
    endLearningSession: (state, action: PayloadAction<{ completed: boolean }>) => {
      if (state.currentSession) {
        state.currentSession.endTime = Date.now()
        state.currentSession.completed = action.payload.completed
        
        // Update session metrics
        const totalTime = state.currentSession.endTime - state.currentSession.startTime
        state.sessionMetrics.totalTime += totalTime
        state.sessionMetrics.totalInteractions += state.currentSession.interactions.length
        
        if (state.currentSession.interactions.length > 0) {
          const avgEngagement = state.currentSession.interactions.reduce((sum, i) => sum + (i.engagementScore || 0), 0) / state.currentSession.interactions.length
          state.sessionMetrics.avgEngagement = ((state.sessionMetrics.avgEngagement * (state.sessionMetrics.totalInteractions - state.currentSession.interactions.length)) + (avgEngagement * state.currentSession.interactions.length)) / state.sessionMetrics.totalInteractions
        }
        
        console.log('📊 Session ended:', {
          sessionId: state.currentSession.sessionId,
          duration: totalTime,
          interactions: state.currentSession.interactions.length,
          completed: action.payload.completed
        })
        
        state.currentSession = null
      }
    },
    
    // Interaction tracking
    addInteraction: (state, action: PayloadAction<UserInteraction>) => {
      // Add to current session
      if (state.currentSession) {
        state.currentSession.interactions.push(action.payload)
        
        // Update total engagement
        if (action.payload.engagementScore) {
          state.currentSession.totalEngagement += action.payload.engagementScore
        }
      }
      
      // Add to pending interactions for batch processing
      state.pendingInteractions.push(action.payload)
    },
    
    clearPendingInteractions: (state) => {
      state.pendingInteractions = []
    },
    
    // Speed recommendations
    dismissSpeedSuggestion: (state) => {
      state.showSpeedSuggestion = false
    },
    
    acceptSpeedRecommendation: (state, action: PayloadAction<number>) => {
      state.showSpeedSuggestion = false
      state.sessionMetrics.speedChanges += 1
      
      // Clear cache for new speed
      Object.keys(state.cachedContent).forEach(key => {
        if (key.endsWith(`-${action.payload}`)) {
          delete state.cachedContent[key]
        }
      })
    },
    
    // Content management
    clearContentCache: (state, action: PayloadAction<{ lessonId?: string; userSpeed?: number }>) => {
      if (action.payload.lessonId && action.payload.userSpeed) {
        // Clear specific lesson-speed combination
        const key = `${action.payload.lessonId}-${action.payload.userSpeed}`
        delete state.cachedContent[key]
      } else if (action.payload.lessonId) {
        // Clear all cache for a lesson
        Object.keys(state.cachedContent).forEach(key => {
          if (key.startsWith(`${action.payload.lessonId}-`)) {
            delete state.cachedContent[key]
          }
        })
      } else {
        // Clear all cache
        state.cachedContent = {}
      }
    },
    
    // Settings
    setAdaptiveMode: (state, action: PayloadAction<'auto' | 'manual' | 'disabled'>) => {
      state.adaptiveMode = action.payload
    },
    
    setTrackingEnabled: (state, action: PayloadAction<boolean>) => {
      state.trackingEnabled = action.payload
    },
    
    setDebugMode: (state, action: PayloadAction<boolean>) => {
      state.debugMode = action.payload
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    // Analytics
    resetSessionMetrics: (state) => {
      state.sessionMetrics = {
        totalTime: 0,
        totalInteractions: 0,
        avgEngagement: 0,
        speedChanges: 0
      }
    }
  },
  extraReducers: (builder) => {
    // Load adaptive lesson
    builder
      .addCase(loadAdaptiveLesson.pending, (state, action) => {
        const cacheKey = `${action.meta.arg.lessonId}-${action.meta.arg.userSpeed}`
        state.contentLoading[cacheKey] = true
        state.isLoading = true
        state.error = null
      })
      .addCase(loadAdaptiveLesson.fulfilled, (state, action) => {
        if (action.payload) {
          const cacheKey = `${action.payload.lessonId}-${action.payload.userSpeed}`
          state.contentLoading[cacheKey] = false
          state.isLoading = false
          
          // Cache the content
          state.cachedContent[cacheKey] = {
            lessonId: action.payload.lessonId,
            userSpeed: action.payload.userSpeed,
            adaptedContent: action.payload.adaptedContent,
            uiConfig: action.payload.uiConfig,
            trackingId: action.payload.trackingId,
            cachedAt: action.payload.cachedAt
          }
          
          // Set as current content
          state.currentLessonContent = state.cachedContent[cacheKey]
          
          console.log('✅ Adaptive lesson loaded:', {
            lessonId: action.payload.lessonId,
            userSpeed: action.payload.userSpeed,
            fromCache: (action.payload as any).fromCache || false
          })
        }
      })
      .addCase(loadAdaptiveLesson.rejected, (state, action) => {
        const cacheKey = `${action.meta.arg.lessonId}-${action.meta.arg.userSpeed}`
        state.contentLoading[cacheKey] = false
        state.isLoading = false
        state.error = action.payload as string
      })
    
    // Track interaction
    builder
      .addCase(trackInteraction.fulfilled, (state, action) => {
        if (action.payload.tracked) {
          // Remove from pending interactions
          state.pendingInteractions = state.pendingInteractions.filter(
            i => i !== action.payload.interaction
          )
        }
      })
    
    // Speed recommendation
    builder
      .addCase(requestSpeedRecommendation.fulfilled, (state, action) => {
        if (action.payload) {
          // Add to recommendations (keep only last 5)
          state.speedRecommendations.unshift(action.payload)
          state.speedRecommendations = state.speedRecommendations.slice(0, 5)
          
          // Show suggestion if confidence is high enough and speed is different
          if (action.payload.confidence > 0.7 && action.payload.suggestedSpeed !== action.payload.currentSpeed) {
            state.showSpeedSuggestion = true
          }
        }
      })
      .addCase(requestSpeedRecommendation.rejected, (state, action) => {
        console.warn('Speed recommendation failed:', action.payload)
      })
  }
})

export const {
  startLearningSession,
  endLearningSession,
  addInteraction,
  clearPendingInteractions,
  dismissSpeedSuggestion,
  acceptSpeedRecommendation,
  clearContentCache,
  setAdaptiveMode,
  setTrackingEnabled,
  setDebugMode,
  clearError,
  resetSessionMetrics
} = adaptiveSlice.actions

export default adaptiveSlice.reducer 