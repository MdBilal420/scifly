import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { analyzeError, generateFeedback, generateHint, generateQuestion } from './hintGenerator'
// import { generateHint, generateQuestion, generateFeedback, analyzeError } from './hintGenerator'

// Types
export interface Hint {
  id: string
  contentId: string
  userId: string
  hintText: string
  hintType: 'conceptual' | 'procedural' | 'strategic' | 'metacognitive'
  difficulty: number
  timestamp: number
  effectiveness?: number
  used: boolean
}

export interface AdaptiveQuestion {
  id: string
  questionText: string
  questionType: 'multiple-choice' | 'open-ended' | 'true-false' | 'fill-blank'
  difficulty: number
  options?: string[]
  correctAnswer?: string
  explanation?: string
  followUpQuestions?: string[]
  timestamp: number
}

export interface PersonalizedFeedback {
  id: string
  userId: string
  contentId: string
  feedbackText: string
  feedbackType: 'positive' | 'corrective' | 'encouraging' | 'strategic'
  isCorrect: boolean
  improvementSuggestions: string[]
  timestamp: number
}

export interface ErrorAnalysis {
  id: string
  errorType: 'misconception' | 'procedural' | 'careless' | 'knowledge-gap'
  errorDescription: string
  suggestedRemediation: string[]
  confidence: number
  timestamp: number
}

export interface TutorSession {
  sessionId: string
  userId: string
  lessonId: string
  startTime: number
  endTime?: number
  hintsUsed: Hint[]
  questionsAsked: AdaptiveQuestion[]
  feedbackGiven: PersonalizedFeedback[]
  errorsAnalyzed: ErrorAnalysis[]
  learningProgress: {
    conceptsMastered: string[]
    strugglingAreas: string[]
    improvementAreas: string[]
  }
}

export interface SmartTutorState {
  // Active session
  currentSession: TutorSession | null
  
  // Hint system
  availableHints: Record<string, Hint[]> // key: contentId
  hintsLoading: Record<string, boolean>
  
  // Adaptive questioning
  generatedQuestions: AdaptiveQuestion[]
  currentQuestion: AdaptiveQuestion | null
  questionHistory: AdaptiveQuestion[]
  
  // Personalized feedback
  feedbackHistory: PersonalizedFeedback[]
  pendingFeedback: PersonalizedFeedback[]
  
  // Error analysis
  errorAnalyses: ErrorAnalysis[]
  commonMisconceptions: Record<string, string[]>
  
  // Tutor settings
  tutorEnabled: boolean
  hintFrequency: 'low' | 'medium' | 'high'
  feedbackStyle: 'gentle' | 'direct' | 'encouraging' | 'detailed'
  questionDifficulty: 'adaptive' | 'progressive' | 'fixed'
  
  // Performance metrics
  tutorMetrics: {
    totalHintsProvided: number
    hintEffectiveness: number
    averageQuestionDifficulty: number
    feedbackPositivity: number
    errorReductionRate: number
  }
  
  // UI state
  showHintPanel: boolean
  showFeedbackPanel: boolean
  showQuestionPanel: boolean
  
  error: string | null
  isProcessing: boolean
}

const initialState: SmartTutorState = {
  currentSession: null,
  availableHints: {},
  hintsLoading: {},
  generatedQuestions: [],
  currentQuestion: null,
  questionHistory: [],
  feedbackHistory: [],
  pendingFeedback: [],
  errorAnalyses: [],
  commonMisconceptions: {},
  tutorEnabled: true,
  hintFrequency: 'medium',
  feedbackStyle: 'encouraging',
  questionDifficulty: 'adaptive',
  tutorMetrics: {
    totalHintsProvided: 0,
    hintEffectiveness: 0,
    averageQuestionDifficulty: 0,
    feedbackPositivity: 0,
    errorReductionRate: 0
  },
  showHintPanel: false,
  showFeedbackPanel: false,
  showQuestionPanel: false,
  error: null,
  isProcessing: false
}

// Async thunks
export const generateSmartHint = createAsyncThunk(
  'smartTutor/generateSmartHint',
  async (request: {
    contentId: string
    userId: string
    struggleContext: string
    userSpeed: number
    previousHints?: string[]
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { smartTutor: SmartTutorState }
      
      // Generate contextual hint
      const hint = await generateHint({
        contentId: request.contentId,
        userId: request.userId,
        struggleContext: request.struggleContext,
        userSpeed: request.userSpeed,
        previousHints: request.previousHints || [],
        hintStyle: state.smartTutor.feedbackStyle,
        difficulty: calculateHintDifficulty(request.userSpeed)
      })
      
      const smartHint: Hint = {
        id: `hint_${Date.now()}`,
        contentId: request.contentId,
        userId: request.userId,
        hintText: hint.text,
        hintType: hint.type,
        difficulty: hint.difficulty,
        timestamp: Date.now(),
        used: false
      }
      
      return smartHint
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate hint')
    }
  }
)

export const generateAdaptiveQuestion = createAsyncThunk(
  'smartTutor/generateAdaptiveQuestion',
  async (request: {
    contentId: string
    userId: string
    currentProgress: number
    userSpeed: number
    previousQuestions?: string[]
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { smartTutor: SmartTutorState }
      
      const question = await generateQuestion({
        contentId: request.contentId,
        userId: request.userId,
        currentProgress: request.currentProgress,
        userSpeed: request.userSpeed,
        previousQuestions: request.previousQuestions || [],
        difficultyMode: state.smartTutor.questionDifficulty
      })
      
      const adaptiveQuestion: AdaptiveQuestion = {
        id: `question_${Date.now()}`,
        questionText: question.questionText,
        questionType: question.questionType,
        difficulty: question.difficulty,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        followUpQuestions: question.followUpQuestions,
        timestamp: Date.now()
      }
      
      return adaptiveQuestion
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate question')
    }
  }
)

export const generatePersonalizedFeedback = createAsyncThunk(
  'smartTutor/generatePersonalizedFeedback',
  async (request: {
    userId: string
    contentId: string
    userSpeed: number
    recentPerformance: any
    feedbackStyle: string
  }, { getState, rejectWithValue }) => {
    try {
        //   const state = getState() as { smartTutor: SmartTutorState }
      
      const feedback = await generateFeedback({
        userId: request.userId,
        contentId: request.contentId,
        userResponse: 'Generated based on performance',
        correctAnswer: 'Performance-based feedback',
        isCorrect: request.recentPerformance.accuracy > 70,
        attemptNumber: 1
      })
      
      const personalizedFeedback: PersonalizedFeedback = {
        id: `feedback_${Date.now()}`,
        userId: request.userId,
        contentId: request.contentId,
        feedbackText: feedback.feedbackText,
        feedbackType: feedback.feedbackType,
        isCorrect: request.recentPerformance.accuracy > 70,
        improvementSuggestions: feedback.improvementSuggestions,
        timestamp: Date.now()
      }
      
      return personalizedFeedback
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate feedback')
    }
  }
)

export const analyzeUserError = createAsyncThunk(
  'smartTutor/analyzeUserError',
  async (request: {
    userId: string
    contentId: string
    userResponse: string
    correctAnswer: string
    context: string
  }, { rejectWithValue }) => {
    try {
      const analysis = await analyzeError({
        userResponse: request.userResponse,
        correctAnswer: request.correctAnswer,
        context: request.context,
        previousErrors: []
      })
      
      const errorAnalysis: ErrorAnalysis = {
        id: `error_${Date.now()}`,
        errorType: analysis.errorType,
        errorDescription: analysis.errorDescription,
        suggestedRemediation: analysis.suggestedRemediation,
        confidence: analysis.confidence,
        timestamp: Date.now()
      }
      
      return errorAnalysis
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to analyze error')
    }
  }
)

// Helper functions
function calculateHintDifficulty(userSpeed: number): number {
  // Higher speed = more challenging hints
  const difficultyMap = {
    1: 0.2, // Very simple hints
    2: 0.4, // Simple hints
    3: 0.6, // Moderate hints
    4: 0.8, // Challenging hints
    5: 1.0  // Advanced hints
  }
  return difficultyMap[userSpeed as keyof typeof difficultyMap] || 0.6
}

const smartTutorSlice = createSlice({
  name: 'smartTutor',
  initialState,
  reducers: {
    // Session management
    startTutorSession: (state, action: PayloadAction<{
      userId: string
      lessonId: string
    }>) => {
      state.currentSession = {
        sessionId: `tutor_session_${Date.now()}`,
        userId: action.payload.userId,
        lessonId: action.payload.lessonId,
        startTime: Date.now(),
        hintsUsed: [],
        questionsAsked: [],
        feedbackGiven: [],
        errorsAnalyzed: [],
        learningProgress: {
          conceptsMastered: [],
          strugglingAreas: [],
          improvementAreas: []
        }
      }
    },
    
    endTutorSession: (state) => {
      if (state.currentSession) {
        state.currentSession.endTime = Date.now()
        state.currentSession = null
      }
    },
    
    // Hint management
    useHint: (state, action: PayloadAction<string>) => {
      const contentId = action.payload
      const hints = state.availableHints[contentId] || []
      const hint = hints.find(h => !h.used)
      
      if (hint) {
        hint.used = true
        if (state.currentSession) {
          state.currentSession.hintsUsed.push(hint)
        }
        state.tutorMetrics.totalHintsProvided += 1
      }
    },
    
    rateHintEffectiveness: (state, action: PayloadAction<{
      hintId: string
      effectiveness: number
    }>) => {
      const { hintId, effectiveness } = action.payload
      
      // Find and update hint
      Object.values(state.availableHints).forEach(hints => {
        const hint = hints.find(h => h.id === hintId)
        if (hint) {
          hint.effectiveness = effectiveness
        }
      })
      
      // Update metrics
      const currentEffectiveness = state.tutorMetrics.hintEffectiveness
      state.tutorMetrics.hintEffectiveness = (currentEffectiveness + effectiveness) / 2
    },
    
    // Question management
    setCurrentQuestion: (state, action: PayloadAction<AdaptiveQuestion | null>) => {
      state.currentQuestion = action.payload
      if (action.payload && state.currentSession) {
        state.currentSession.questionsAsked.push(action.payload)
      }
    },
    
    // Feedback management
    addFeedback: (state, action: PayloadAction<PersonalizedFeedback>) => {
      state.feedbackHistory.push(action.payload)
      if (state.currentSession) {
        state.currentSession.feedbackGiven.push(action.payload)
      }
    },
    
    // Learning progress
    updateLearningProgress: (state, action: PayloadAction<{
      conceptsMastered?: string[]
      strugglingAreas?: string[]
      improvementAreas?: string[]
    }>) => {
      if (state.currentSession) {
        const progress = state.currentSession.learningProgress
        if (action.payload.conceptsMastered) {
          progress.conceptsMastered = Array.from(new Set([...progress.conceptsMastered, ...action.payload.conceptsMastered]))
        }
        if (action.payload.strugglingAreas) {
          progress.strugglingAreas = Array.from(new Set([...progress.strugglingAreas, ...action.payload.strugglingAreas]))
        }
        if (action.payload.improvementAreas) {
          progress.improvementAreas = Array.from(new Set([...progress.improvementAreas, ...action.payload.improvementAreas]))
        }
      }
    },
    
    // Settings
    setTutorEnabled: (state, action: PayloadAction<boolean>) => {
      state.tutorEnabled = action.payload
    },
    
    setHintFrequency: (state, action: PayloadAction<'low' | 'medium' | 'high'>) => {
      state.hintFrequency = action.payload
    },
    
    setFeedbackStyle: (state, action: PayloadAction<'gentle' | 'direct' | 'encouraging' | 'detailed'>) => {
      state.feedbackStyle = action.payload
    },
    
    setQuestionDifficulty: (state, action: PayloadAction<'adaptive' | 'progressive' | 'fixed'>) => {
      state.questionDifficulty = action.payload
    },
    
    // UI state
    toggleHintPanel: (state) => {
      state.showHintPanel = !state.showHintPanel
    },
    
    toggleFeedbackPanel: (state) => {
      state.showFeedbackPanel = !state.showFeedbackPanel
    },
    
    toggleQuestionPanel: (state) => {
      state.showQuestionPanel = !state.showQuestionPanel
    },
    
    // Error handling
    clearError: (state) => {
      state.error = null
    },
    
    // Reset state
    resetSmartTutor: (state) => {
      state.currentSession = null
      state.availableHints = {}
      state.generatedQuestions = []
      state.currentQuestion = null
      state.questionHistory = []
      state.feedbackHistory = []
      state.pendingFeedback = []
      state.errorAnalyses = []
      state.error = null
      state.isProcessing = false
    }
  },
  extraReducers: (builder) => {
    // Generate hint
    builder
      .addCase(generateSmartHint.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(generateSmartHint.fulfilled, (state, action) => {
        state.isProcessing = false
        const hint = action.payload
        if (!state.availableHints[hint.contentId]) {
          state.availableHints[hint.contentId] = []
        }
        state.availableHints[hint.contentId].push(hint)
      })
      .addCase(generateSmartHint.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload as string
      })
    
    // Generate question
    builder
      .addCase(generateAdaptiveQuestion.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(generateAdaptiveQuestion.fulfilled, (state, action) => {
        state.isProcessing = false
        const question = action.payload
        state.generatedQuestions.push(question)
        state.currentQuestion = question
        state.questionHistory.push(question)
      })
      .addCase(generateAdaptiveQuestion.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload as string
      })
    
    // Generate feedback
    builder
      .addCase(generatePersonalizedFeedback.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(generatePersonalizedFeedback.fulfilled, (state, action) => {
        state.isProcessing = false
        const feedback = action.payload
        state.feedbackHistory.push(feedback)
        if (state.currentSession) {
          state.currentSession.feedbackGiven.push(feedback)
        }
      })
      .addCase(generatePersonalizedFeedback.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload as string
      })
    
    // Analyze error
    builder
      .addCase(analyzeUserError.pending, (state) => {
        state.isProcessing = true
        state.error = null
      })
      .addCase(analyzeUserError.fulfilled, (state, action) => {
        state.isProcessing = false
        const analysis = action.payload
        state.errorAnalyses.push(analysis)
        if (state.currentSession) {
          state.currentSession.errorsAnalyzed.push(analysis)
        }
      })
      .addCase(analyzeUserError.rejected, (state, action) => {
        state.isProcessing = false
        state.error = action.payload as string
      })
  }
})

export const {
  startTutorSession,
  endTutorSession,
  useHint,
  rateHintEffectiveness,
  setCurrentQuestion,
  addFeedback,
  updateLearningProgress,
  setTutorEnabled,
  setHintFrequency,
  setFeedbackStyle,
  setQuestionDifficulty,
  toggleHintPanel,
  toggleFeedbackPanel,
  toggleQuestionPanel,
  clearError,
  resetSmartTutor
} = smartTutorSlice.actions

export default smartTutorSlice.reducer 