import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Topic } from '../../data/topics'
import { LessonContent, QuizQuestion } from '../../services/groqAPI'
import groqAPI from '../../services/groqAPI'
import { topicsAPI, progressAPI, quizAPI } from '../../services/api'
import { DatabaseTopic } from '../../config/supabase'
import { RootState } from '../../store'

interface TopicsState {
  topics: DatabaseTopic[]
  currentTopic: Topic | null
  lessonContent: LessonContent[]
  quizQuestions: QuizQuestion[]
  isGeneratingContent: boolean
  isGeneratingQuiz: boolean
  isLoadingTopics: boolean
  contentError: string | null
  quizError: string | null
  topicsError: string | null
}

const initialState: TopicsState = {
  topics: [],
  currentTopic: null,
  lessonContent: [],
  quizQuestions: [],
  isGeneratingContent: false,
  isGeneratingQuiz: false,
  isLoadingTopics: false,
  contentError: null,
  quizError: null,
  topicsError: null
}

// Helper function to convert DatabaseTopic to Topic
function mapDatabaseTopicToTopic(dbTopic: DatabaseTopic): Topic {
  return {
    id: dbTopic.id,
    title: dbTopic.title,
    description: dbTopic.description,
    icon: dbTopic.icon,
    color: dbTopic.color,
    backgroundTheme: dbTopic.background_theme as 'space' | 'forest' | 'ocean' | 'weather' | 'laboratory' | 'human-body' | 'earth',
    difficulty: dbTopic.difficulty as 1 | 2 | 3,
    estimatedTime: dbTopic.estimated_time_minutes,
    keyLearningPoints: dbTopic.key_learning_points
  }
}

// Async thunks for topics
export const fetchTopics = createAsyncThunk(
  'topics/fetchTopics',
  async (_, { rejectWithValue }) => {
    try {
      const topics = await topicsAPI.getAllTopics()
      return topics
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch topics')
    }
  }
)

export const fetchTopicBySlug = createAsyncThunk(
  'topics/fetchTopicBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const topic = await topicsAPI.getTopicBySlug(slug)
      if (!topic) throw new Error('Topic not found')
      return mapDatabaseTopicToTopic(topic)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch topic')
    }
  }
)

export const loadSavedLessons = createAsyncThunk(
  'topics/loadSavedLessons',
  async ({ topicId, learningSpeed }: { topicId: string; learningSpeed: string }, { rejectWithValue }) => {
    try {
      const lessons = await topicsAPI.getLessons(topicId, learningSpeed)
      
      // Convert database lessons to LessonContent format
      const lessonContent: LessonContent[] = lessons.map((lesson: any, index: number) => ({
        id: index + 1,
        title: lesson.title,
        content: lesson.content,
        tip: lesson.tip,
        interactive: lesson.interactive_type,
        image: lesson.image
      }))
      
      return lessonContent
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load saved lessons')
    }
  }
)

export const generateLessonContent = createAsyncThunk(
  'topics/generateLessonContent',
  async (topic: Topic, { rejectWithValue, getState, dispatch }) => {
    try {
      const state = getState() as RootState
      const userProfile = state.user.currentUser
      
      if (!userProfile) {
        throw new Error('User profile not found')
      }

      // First, try to load existing lessons from database
      const learningSpeed = userProfile.learningSpeed.toString()
      await dispatch(loadSavedLessons({ topicId: topic.id, learningSpeed }))
      
      const currentState = getState() as RootState
      if (currentState.topics.lessonContent.length > 0) {
        return currentState.topics.lessonContent
      }

      // If no saved lessons, generate new content
      const content = await groqAPI.generateLessonContent(topic, userProfile)
      
      // Save generated lessons to database
      if (userProfile.id && content.length > 0) {
        for (const lesson of content) {
          await topicsAPI.saveLesson({
            topic_id: topic.id,
            section_number: lesson.id,
            title: lesson.title,
            content: lesson.content,
            tip: lesson.tip,
            interactive_type: lesson.interactive,
            image: lesson.image,
            learning_speed_target: learningSpeed
          })
        }
      }
      
      return content
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate lesson content')
    }
  }
)

export const generateQuizQuestions = createAsyncThunk(
  'topics/generateQuizQuestions',
  async (topic: Topic, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState
      const userProfile = state.user.currentUser
      
      if (!userProfile) {
        throw new Error('User profile not found')
      }

      // Check if we have saved quiz questions first
      const savedQuestions = await quizAPI.getQuizQuestions(
        topic.id, 
        userProfile.learningSpeed.toString(), 
        5
      )
      
      if (savedQuestions.length > 0) {
        // Convert database questions to QuizQuestion format
        const quizQuestions: QuizQuestion[] = savedQuestions.map((q: any) => ({
          id: q.id,
          question: q.question_text,
          options: q.options,
          correctAnswer: q.correct_answer,
          explanation: q.explanation
        }))
        return quizQuestions
      }

      // Generate new questions if none exist
      const questions = await groqAPI.generateQuizQuestions(topic, 5)
      
      // Note: You might want to save generated quiz questions to database here
      // This would require extending the quizAPI to save quiz questions
      
      return questions
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate quiz questions')
    }
  }
)

export const startTopicLearning = createAsyncThunk(
  'topics/startTopicLearning',
  async ({ topicId, userId }: { topicId: string; userId: string }, { rejectWithValue }) => {
    try {
      // Create or update progress record
      await progressAPI.updateProgress(userId, topicId, {
        progress_percentage: 0,
        completed: false,
        time_spent_seconds: 0
      })
      
      return { topicId, userId }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to start topic learning')
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
      state.topicsError = null
    },
    // Add lesson content to state (for real-time generation)
    addLessonContent: (state, action: PayloadAction<LessonContent[]>) => {
      state.lessonContent = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch topics
    builder
      .addCase(fetchTopics.pending, (state) => {
        state.isLoadingTopics = true
        state.topicsError = null
      })
      .addCase(fetchTopics.fulfilled, (state, action) => {
        state.isLoadingTopics = false
        state.topics = action.payload
      })
      .addCase(fetchTopics.rejected, (state, action) => {
        state.isLoadingTopics = false
        state.topicsError = action.payload as string
      })

    // Fetch topic by slug
    builder
      .addCase(fetchTopicBySlug.fulfilled, (state, action) => {
        state.currentTopic = action.payload
      })
      .addCase(fetchTopicBySlug.rejected, (state, action) => {
        state.topicsError = action.payload as string
      })

    // Load saved lessons
    builder
      .addCase(loadSavedLessons.fulfilled, (state, action) => {
        state.lessonContent = action.payload
      })
      .addCase(loadSavedLessons.rejected, (state, action) => {
        state.contentError = action.payload as string
      })

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

    // Start topic learning
    builder
      .addCase(startTopicLearning.fulfilled, (state) => {
        // Topic learning started successfully
      })
      .addCase(startTopicLearning.rejected, (state, action) => {
        state.topicsError = action.payload as string
      })
  }
})

export const { 
  setCurrentTopic, 
  clearCurrentTopic, 
  clearErrors, 
  addLessonContent 
} = topicsSlice.actions

export default topicsSlice.reducer 