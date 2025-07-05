import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { adjustDifficulty, generateAdaptiveContent, personalizeContent } from './contentGenerationService'
// import { generateAdaptiveContent, personalizeContent, adjustDifficulty } from './contentGenerationService'

// Types
export interface AIGeneratedContent {
  id: string
  lessonId: string
  userId: string
  userSpeed: number
  originalContent: any
  adaptedContent: any
  personalizationLevel: number
  difficultyLevel: number
  generatedAt: number
  effectiveness?: number
}

export interface PersonalizationProfile {
  userId: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  interests: string[]
  strengths: string[]
  challenges: string[]
  preferredComplexity: number
  culturalContext: string
  accessibilityNeeds: string[]
  lastUpdated: number
}

export interface ContentAdaptation {
  adaptationId: string
  contentId: string
  adaptationType: 'difficulty' | 'style' | 'interest' | 'accessibility'
  beforeState: any
  afterState: any
  reasoning: string
  confidence: number
  timestamp: number
}

export interface AIContentState {
  // Generated content cache
  generatedContent: Record<string, AIGeneratedContent>
  contentLoading: Record<string, boolean>
  
  // Personalization
  personalizationProfiles: Record<string, PersonalizationProfile>
  
  // Content adaptation tracking
  adaptationHistory: ContentAdaptation[]
  activeAdaptations: Record<string, ContentAdaptation>
  
  // AI engine settings
  aiEnabled: boolean
  personalizationLevel: number // 0-100
  adaptationSpeed: 'slow' | 'medium' | 'fast'
  
  // Content generation queue
  generationQueue: Array<{
    lessonId: string
    userId: string
    priority: number
    requestedAt: number
  }>
  
  // Performance metrics
  contentMetrics: {
    totalGenerated: number
    averageGenerationTime: number
    effectivenessScore: number
    userSatisfaction: number
  }
  
  // Error handling
  error: string | null
  isGenerating: boolean
}

const initialState: AIContentState = {
  generatedContent: {},
  contentLoading: {},
  personalizationProfiles: {},
  adaptationHistory: [],
  activeAdaptations: {},
  aiEnabled: true,
  personalizationLevel: 70,
  adaptationSpeed: 'medium',
  generationQueue: [],
  contentMetrics: {
    totalGenerated: 0,
    averageGenerationTime: 0,
    effectivenessScore: 0,
    userSatisfaction: 0
  },
  error: null,
  isGenerating: false
}

// Async thunks
export const generateAIContent = createAsyncThunk(
  'aiContent/generateAIContent',
  async (request: {
    lessonId: string
    userId: string
    userSpeed: number
    originalContent: any
    personalizationLevel?: number
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { aiContent: AIContentState }
      const contentKey = `${request.lessonId}-${request.userId}`
      
      // Check if we already have recent content
      const existingContent = state.aiContent.generatedContent[contentKey]
      if (existingContent && (Date.now() - existingContent.generatedAt) < 300000) { // 5 minutes
        return existingContent
      }
      
      const startTime = Date.now()
      
      // Generate adaptive content
      const adaptedContent = await generateAdaptiveContent({
        originalContent: request.originalContent,
        userSpeed: request.userSpeed,
        personalizationLevel: request.personalizationLevel || state.aiContent.personalizationLevel,
        userProfile: state.aiContent.personalizationProfiles[request.userId]
      })
      
      const generationTime = Date.now() - startTime
      
      const generatedContent: AIGeneratedContent = {
        id: contentKey,
        lessonId: request.lessonId,
        userId: request.userId,
        userSpeed: request.userSpeed,
        originalContent: request.originalContent,
        adaptedContent,
        personalizationLevel: request.personalizationLevel || state.aiContent.personalizationLevel,
        difficultyLevel: adaptedContent.difficultyLevel,
        generatedAt: Date.now()
      }
      
      return { generatedContent, generationTime }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate AI content')
    }
  }
)

export const personalizeContentForUser = createAsyncThunk(
  'aiContent/personalizeContentForUser',
  async (request: {
    userId: string
    contentId: string
    personalizationUpdates: Partial<PersonalizationProfile>
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { aiContent: AIContentState }
      const existingProfile = state.aiContent.personalizationProfiles[request.userId]
      
      // Update personalization profile
      const updatedProfile: PersonalizationProfile = {
        ...existingProfile,
        ...request.personalizationUpdates,
        userId: request.userId,
        lastUpdated: Date.now()
      }
      
      // Re-personalize existing content
      const generatedContent = state.aiContent.generatedContent[request.contentId]
      if (generatedContent) {
        const personalizedContent = await personalizeContent(
          generatedContent.adaptedContent,
          updatedProfile
        )
        
        return {
          profile: updatedProfile,
          contentId: request.contentId,
          personalizedContent
        }
      }
      
      return { profile: updatedProfile }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to personalize content')
    }
  }
)

export const adjustContentDifficulty = createAsyncThunk(
  'aiContent/adjustContentDifficulty',
  async (request: {
    contentId: string
    difficultyAdjustment: number // -2 to +2
    reason: string
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { aiContent: AIContentState }
      const generatedContent = state.aiContent.generatedContent[request.contentId]
      
      if (!generatedContent) {
        throw new Error('Content not found for difficulty adjustment')
      }
      
      const adjustedContent = await adjustDifficulty(
        generatedContent.adaptedContent,
        request.difficultyAdjustment,
        request.reason
      )
      
      const adaptation: ContentAdaptation = {
        adaptationId: `adapt_${Date.now()}`,
        contentId: request.contentId,
        adaptationType: 'difficulty',
        beforeState: { difficultyLevel: generatedContent.difficultyLevel },
        afterState: { difficultyLevel: adjustedContent.difficultyLevel },
        reasoning: request.reason,
        confidence: adjustedContent.confidence,
        timestamp: Date.now()
      }
      
      return {
        contentId: request.contentId,
        adjustedContent,
        adaptation
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to adjust content difficulty')
    }
  }
)

const aiContentSlice = createSlice({
  name: 'aiContent',
  initialState,
  reducers: {
    // Content management
    addToGenerationQueue: (state, action: PayloadAction<{
      lessonId: string
      userId: string
      priority: number
    }>) => {
      state.generationQueue.push({
        ...action.payload,
        requestedAt: Date.now()
      })
      // Sort by priority (higher first)
      state.generationQueue.sort((a, b) => b.priority - a.priority)
    },
    
    removeFromGenerationQueue: (state, action: PayloadAction<string>) => {
      state.generationQueue = state.generationQueue.filter(
        item => `${item.lessonId}-${item.userId}` !== action.payload
      )
    },
    
    clearGeneratedContent: (state, action: PayloadAction<string>) => {
      delete state.generatedContent[action.payload]
    },
    
    // Personalization
    updatePersonalizationProfile: (state, action: PayloadAction<PersonalizationProfile>) => {
      state.personalizationProfiles[action.payload.userId] = action.payload
    },
    
    // Content adaptation
    recordContentAdaptation: (state, action: PayloadAction<ContentAdaptation>) => {
      state.adaptationHistory.push(action.payload)
      state.activeAdaptations[action.payload.contentId] = action.payload
      
      // Keep only last 100 adaptations
      if (state.adaptationHistory.length > 100) {
        state.adaptationHistory = state.adaptationHistory.slice(-100)
      }
    },
    
    // Content effectiveness tracking
    updateContentEffectiveness: (state, action: PayloadAction<{
      contentId: string
      effectiveness: number
    }>) => {
      if (state.generatedContent[action.payload.contentId]) {
        state.generatedContent[action.payload.contentId].effectiveness = action.payload.effectiveness
      }
    },
    
    // AI settings
    setAIEnabled: (state, action: PayloadAction<boolean>) => {
      state.aiEnabled = action.payload
    },
    
    setPersonalizationLevel: (state, action: PayloadAction<number>) => {
      state.personalizationLevel = Math.max(0, Math.min(100, action.payload))
    },
    
    setAdaptationSpeed: (state, action: PayloadAction<'slow' | 'medium' | 'fast'>) => {
      state.adaptationSpeed = action.payload
    },
    
    // Metrics
    updateContentMetrics: (state, action: PayloadAction<{
      generationTime?: number
      effectiveness?: number
      userSatisfaction?: number
    }>) => {
      if (action.payload.generationTime) {
        state.contentMetrics.totalGenerated += 1
        const currentAvg = state.contentMetrics.averageGenerationTime
        const newAvg = (currentAvg * (state.contentMetrics.totalGenerated - 1) + action.payload.generationTime) / state.contentMetrics.totalGenerated
        state.contentMetrics.averageGenerationTime = newAvg
      }
      
      if (action.payload.effectiveness) {
        state.contentMetrics.effectivenessScore = action.payload.effectiveness
      }
      
      if (action.payload.userSatisfaction) {
        state.contentMetrics.userSatisfaction = action.payload.userSatisfaction
      }
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    // Reset state
    resetAIContent: (state) => {
      state.generatedContent = {}
      state.contentLoading = {}
      state.adaptationHistory = []
      state.activeAdaptations = {}
      state.generationQueue = []
      state.error = null
      state.isGenerating = false
    }
  },
  extraReducers: (builder) => {
    // Generate AI content
    builder
      .addCase(generateAIContent.pending, (state, action) => {
        const contentKey = `${action.meta.arg.lessonId}-${action.meta.arg.userId}`
        state.contentLoading[contentKey] = true
        state.isGenerating = true
        state.error = null
      })
      .addCase(generateAIContent.fulfilled, (state, action) => {
        if (action.payload && 'generatedContent' in action.payload) {
          const contentKey = action.payload.generatedContent.id
          state.contentLoading[contentKey] = false
          state.isGenerating = false
          state.generatedContent[contentKey] = action.payload.generatedContent
          
          // Update metrics
          state.contentMetrics.totalGenerated += 1
          const currentAvg = state.contentMetrics.averageGenerationTime
          const newAvg = (currentAvg * (state.contentMetrics.totalGenerated - 1) + action.payload.generationTime) / state.contentMetrics.totalGenerated
          state.contentMetrics.averageGenerationTime = newAvg
          
          // Remove from queue
          state.generationQueue = state.generationQueue.filter(
            item => `${item.lessonId}-${item.userId}` !== contentKey
          )
        }
      })
      .addCase(generateAIContent.rejected, (state, action) => {
        const contentKey = `${action.meta.arg.lessonId}-${action.meta.arg.userId}`
        state.contentLoading[contentKey] = false
        state.isGenerating = false
        state.error = action.payload as string
      })
    
    // Personalize content
    builder
      .addCase(personalizeContentForUser.fulfilled, (state, action) => {
        state.personalizationProfiles[action.payload.profile.userId] = action.payload.profile
        
        if (action.payload.contentId && action.payload.personalizedContent) {
          const content = state.generatedContent[action.payload.contentId]
          if (content) {
            content.adaptedContent = action.payload.personalizedContent
            content.personalizationLevel = action.payload.profile.preferredComplexity || state.personalizationLevel
          }
        }
      })
      .addCase(personalizeContentForUser.rejected, (state, action) => {
        state.error = action.payload as string
      })
    
    // Adjust difficulty
    builder
      .addCase(adjustContentDifficulty.fulfilled, (state, action) => {
        const content = state.generatedContent[action.payload.contentId]
        if (content) {
          content.adaptedContent = action.payload.adjustedContent
          content.difficultyLevel = action.payload.adjustedContent.difficultyLevel
        }
        
        // Record adaptation
        state.adaptationHistory.push(action.payload.adaptation)
        state.activeAdaptations[action.payload.contentId] = action.payload.adaptation
      })
      .addCase(adjustContentDifficulty.rejected, (state, action) => {
        state.error = action.payload as string
      })
  }
})

export const {
  addToGenerationQueue,
  removeFromGenerationQueue,
  clearGeneratedContent,
  updatePersonalizationProfile,
  recordContentAdaptation,
  updateContentEffectiveness,
  setAIEnabled,
  setPersonalizationLevel,
  setAdaptationSpeed,
  updateContentMetrics,
  clearError,
  resetAIContent
} = aiContentSlice.actions

export default aiContentSlice.reducer 