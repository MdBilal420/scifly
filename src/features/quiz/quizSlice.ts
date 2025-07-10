import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { quizAPI, userAPI } from '../../services/api'
import { QuizAttempt } from '../../config/supabase'

interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizState {
  currentQuiz: string | null
  questions: QuizQuestion[]
  currentQuestionIndex: number
  answers: { [questionId: string]: number }
  score: number
  totalQuestions: number
  isCompleted: boolean
  showResults: boolean
  isLoading: boolean
  isSaving: boolean
  error: string | null
  quizHistory: QuizAttempt[]
  bestScore: { score: number; total: number } | null
  timeSpent: number
  startTime: number | null
}

const initialState: QuizState = {
  currentQuiz: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  totalQuestions: 0,
  isCompleted: false,
  showResults: false,
  isLoading: false,
  isSaving: false,
  error: null,
  quizHistory: [],
  bestScore: null,
  timeSpent: 0,
  startTime: null
}

// Async thunks for quiz management
export const loadQuizQuestions = createAsyncThunk(
  'quiz/loadQuizQuestions',
  async ({ 
    topicId, 
    learningSpeed, 
    limit = 5 
  }: { 
    topicId: string; 
    learningSpeed: string; 
    limit?: number 
  }, { rejectWithValue }) => {
    try {
      const questions = await quizAPI.getQuizQuestions(topicId, learningSpeed, limit)
      
      // Convert database questions to QuizQuestion format
      const quizQuestions: QuizQuestion[] = questions.map((q: any) => ({
        id: q.id,
        question: q.question,
        options: q.options,
        correctAnswer: q.correct_answer_index,
        explanation: q.explanation
      }))
      
      return quizQuestions
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load quiz questions')
    }
  }
)

export const saveQuizAttempt = createAsyncThunk(
  'quiz/saveQuizAttempt',
  async ({ 
    userId, 
    topicId, 
    questionIds, 
    userAnswers, 
    score, 
    totalQuestions, 
    completed, 
    timeSpent 
  }: {
    userId: string
    topicId: string
    questionIds: string[]
    userAnswers: Record<string, number>
    score: number
    totalQuestions: number
    completed: boolean
    timeSpent: number
  }, { rejectWithValue }) => {
    try {
      // Save quiz attempt to database
      const quizAttempt = await quizAPI.saveQuizAttempt(userId, {
        topic_id: topicId,
        question_ids: questionIds,
        user_answers: userAnswers,
        score,
        total_questions: totalQuestions,
        completed,
        time_spent_seconds: timeSpent
      })

      // Log quiz activity
      await userAPI.logActivity(userId, 'quiz_complete', {
        topicId,
        score,
        totalQuestions,
        percentage: Math.round((score / totalQuestions) * 100),
        timeSpent
      })

      return quizAttempt
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to save quiz attempt')
    }
  }
)

export const loadQuizHistory = createAsyncThunk(
  'quiz/loadQuizHistory',
  async (userId: string, { rejectWithValue }) => {
    try {
      const history = await quizAPI.getQuizHistory(userId)
      return history
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load quiz history')
    }
  }
)

export const loadBestScore = createAsyncThunk(
  'quiz/loadBestScore',
  async ({ userId, topicId }: { userId: string; topicId: string }, { rejectWithValue }) => {
    try {
      const bestScore = await quizAPI.getBestScore(userId, topicId)
      return bestScore
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load best score')
    }
  }
)

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    answerQuestion: (state, action: PayloadAction<{ questionId: string; answer: number }>) => {
      state.answers[action.payload.questionId] = action.payload.answer
      
      const question = state.questions.find(q => q.id === action.payload.questionId)
      if (question && action.payload.answer === question.correctAnswer) {
        state.score += 1
      }
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1
      } else {
        state.isCompleted = true
        state.showResults = true
        // Calculate time spent
        if (state.startTime) {
          state.timeSpent = Math.round((Date.now() - state.startTime) / 1000)
        }
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1
      }
    },
    
    resetQuiz: (state) => {
      state.currentQuestionIndex = 0
      state.answers = {}
      state.score = 0
      state.isCompleted = false
      state.showResults = false
      state.timeSpent = 0
      state.startTime = null
      state.error = null
    },
    
    setShowResults: (state, action: PayloadAction<boolean>) => {
      state.showResults = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Update timer
    updateTimeSpent: (state) => {
      if (state.startTime && !state.isCompleted) {
        state.timeSpent = Math.round((Date.now() - state.startTime) / 1000)
      }
    }
  },
  extraReducers: (builder) => {
    // Load quiz questions
    builder
      .addCase(loadQuizQuestions.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadQuizQuestions.fulfilled, (state, action) => {
        state.isLoading = false
        state.questions = action.payload
        state.totalQuestions = action.payload.length
        state.startTime = Date.now()
      })
      .addCase(loadQuizQuestions.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Save quiz attempt
    builder
      .addCase(saveQuizAttempt.pending, (state) => {
        state.isSaving = true
        state.error = null
      })
      .addCase(saveQuizAttempt.fulfilled, (state, action) => {
        state.isSaving = false
        // Add to quiz history
        state.quizHistory.unshift(action.payload)
      })
      .addCase(saveQuizAttempt.rejected, (state, action) => {
        state.isSaving = false
        state.error = action.payload as string
      })

    // Load quiz history
    builder
      .addCase(loadQuizHistory.fulfilled, (state, action) => {
        state.quizHistory = action.payload
      })

    // Load best score
    builder
      .addCase(loadBestScore.fulfilled, (state, action) => {
        if (action.payload) {
          state.bestScore = {
            score: action.payload.score,
            total: action.payload.total_questions
          }
        }
      })
  }
})

export const { 
  answerQuestion, 
  nextQuestion, 
  previousQuestion, 
  resetQuiz, 
  setShowResults, 
  clearError, 
  updateTimeSpent 
} = quizSlice.actions
export default quizSlice.reducer 