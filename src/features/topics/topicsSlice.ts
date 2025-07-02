import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Topic } from '../../data/topics'
import { LessonContent, QuizQuestion } from '../../services/groqAPI'
import groqAPI from '../../services/groqAPI'
import { RootState } from '../../store'

interface TopicsState {
  currentTopic: Topic | null
  lessonContent: LessonContent[]
  quizQuestions: QuizQuestion[]
  isGeneratingContent: boolean
  isGeneratingQuiz: boolean
  contentError: string | null
  quizError: string | null
}

const initialState: TopicsState = {
  currentTopic: null,
  lessonContent: [],
  quizQuestions: [],
  isGeneratingContent: false,
  isGeneratingQuiz: false,
  contentError: null,
  quizError: null
}

// Async thunks for API calls
export const generateLessonContent = createAsyncThunk(
  'topics/generateLessonContent',
  async (topic: Topic, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const userProfile = state.user.currentUser
      const content = await groqAPI.generateLessonContent(topic, userProfile || undefined)
      return content
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate lesson content')
    }
  }
)

export const generateQuizQuestions = createAsyncThunk(
  'topics/generateQuizQuestions',
  async (topic: Topic, { rejectWithValue }) => {
    try {
      const questions = await groqAPI.generateQuizQuestions(topic, 5)
      return questions
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate quiz questions')
    }
  }
)

const topicsSlice = createSlice({
  name: 'topics',
  initialState,
  reducers: {
    setCurrentTopic: (state, action: PayloadAction<Topic>) => {
      state.currentTopic = action.payload
      // Clear previous content when switching topics
      state.lessonContent = []
      state.quizQuestions = []
      state.contentError = null
      state.quizError = null
    },
    clearCurrentTopic: (state) => {
      state.currentTopic = null
      state.lessonContent = []
      state.quizQuestions = []
      state.contentError = null
      state.quizError = null
    },
    clearErrors: (state) => {
      state.contentError = null
      state.quizError = null
    }
  },
  extraReducers: (builder) => {
    // Generate lesson content
    builder
      .addCase(generateLessonContent.pending, (state) => {
        state.isGeneratingContent = true
        state.contentError = null
      })
      .addCase(generateLessonContent.fulfilled, (state, action) => {
        state.isGeneratingContent = false
        state.lessonContent = action.payload
      })
      .addCase(generateLessonContent.rejected, (state, action) => {
        state.isGeneratingContent = false
        state.contentError = action.payload as string
      })

    // Generate quiz questions
    builder
      .addCase(generateQuizQuestions.pending, (state) => {
        state.isGeneratingQuiz = true
        state.quizError = null
      })
      .addCase(generateQuizQuestions.fulfilled, (state, action) => {
        state.isGeneratingQuiz = false
        state.quizQuestions = action.payload
      })
      .addCase(generateQuizQuestions.rejected, (state, action) => {
        state.isGeneratingQuiz = false
        state.quizError = action.payload as string
      })
  }
})

export const { setCurrentTopic, clearCurrentTopic, clearErrors } = topicsSlice.actions
export default topicsSlice.reducer 