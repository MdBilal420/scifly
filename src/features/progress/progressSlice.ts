import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { progressAPI, goalsAPI, userAPI, analyticsAPI } from '../../services/api'
import { UserProgress } from '../../config/supabase'

interface Lesson {
  id: string
  title: string
  completed: boolean
  progress: number
}

interface ProgressState {
  currentLesson: string | null
  lessons: Lesson[]
  userProgress: UserProgress[]
  dailyGoal: number
  dailyProgress: number
  totalScore: number
  streak: number
  isLoading: boolean
  error: string | null
  learningStats: {
    totalTopics: number
    completedTopics: number
    totalQuizzes: number
    averageScore: number
    unlockedAchievements: number
    totalTime: number
  } | null
}

const initialState: ProgressState = {
  currentLesson: null,
  lessons: [
    { id: 'gravity', title: 'What is Gravity?', completed: false, progress: 0 },
    { id: 'solar-system', title: 'Our Solar System', completed: false, progress: 0 },
    { id: 'water-cycle', title: 'The Water Cycle', completed: false, progress: 0 },
    { id: 'plants', title: 'How Plants Grow', completed: false, progress: 0 },
  ],
  userProgress: [],
  dailyGoal: 4,
  dailyProgress: 0,
  totalScore: 0,
  streak: 0,
  isLoading: false,
  error: null,
  learningStats: null
}

// Async thunks for progress management
export const loadUserProgress = createAsyncThunk(
  'progress/loadUserProgress',
  async (userId: string, { rejectWithValue }) => {
    try {
      const progress = await progressAPI.getUserProgress(userId)
      return progress
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user progress')
    }
  }
)

export const updateTopicProgress = createAsyncThunk(
  'progress/updateTopicProgress',
  async ({ 
    userId, 
    topicId, 
    progressData 
  }: { 
    userId: string; 
    topicId: string; 
    progressData: {
      progress_percentage: number;
      completed?: boolean;
      time_spent_seconds?: number;
    }
  }, { rejectWithValue, getState }) => {
    try {
      await progressAPI.updateProgress(userId, topicId, progressData)
      
      // If topic completed, update user activity and daily progress
      if (progressData.completed) {
        await userAPI.logActivity(userId, 'lesson_complete', { topicId })
        
        // Get current daily progress and increment it
        const state = getState() as any
        const currentDailyProgress = state.progress.dailyProgress
        await goalsAPI.updateDailyProgress(userId, currentDailyProgress + 1)
      }
      
      return { topicId, ...progressData }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update topic progress')
    }
  }
)

export const updateLessonProgress = createAsyncThunk(
  'progress/updateLessonProgress',
  async ({ 
    userId, 
    lessonId, 
    progressData 
  }: { 
    userId: string; 
    lessonId: string; 
    progressData: {
      completed?: boolean;
      progress_percentage?: number;
      time_spent_seconds?: number;
    }
  }, { rejectWithValue }) => {
    try {
      await progressAPI.updateLessonProgress(userId, lessonId, progressData)
      
      // Log lesson activity
      await userAPI.logActivity(userId, 'lesson_complete', { 
        lessonId, 
        progress: progressData.progress_percentage 
      })
      
      return { lessonId, ...progressData }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update lesson progress')
    }
  }
)

export const loadDailyGoal = createAsyncThunk(
  'progress/loadDailyGoal',
  async (userId: string, { rejectWithValue }) => {
    try {
      const goal = await goalsAPI.getTodaysGoal(userId)
      return goal
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load daily goal')
    }
  }
)

export const updateDailyGoal = createAsyncThunk(
  'progress/updateDailyGoal',
  async ({ userId, lessonsGoal }: { userId: string; lessonsGoal: number }, { rejectWithValue }) => {
    try {
      await goalsAPI.setDailyGoal(userId, lessonsGoal)
      return lessonsGoal
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update daily goal')
    }
  }
)

export const updateDailyProgress = createAsyncThunk(
  'progress/updateDailyProgress',
  async ({ userId, completedLessons }: { userId: string; completedLessons: number }, { rejectWithValue }) => {
    try {
      await goalsAPI.updateDailyProgress(userId, completedLessons)
      return completedLessons
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update daily progress')
    }
  }
)

export const loadLearningStats = createAsyncThunk(
  'progress/loadLearningStats',
  async (userId: string, { rejectWithValue }) => {
    try {
      const stats = await analyticsAPI.getLearningStats(userId)
      return stats
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load learning stats')
    }
  }
)

export const completeTopicStory = createAsyncThunk(
  'progress/completeTopicStory',
  async ({ userId, topicId, timeSpent }: { userId: string; topicId: string; timeSpent: number }, { rejectWithValue, getState }) => {
    try {
      await progressAPI.completeTopicStory(userId, topicId, timeSpent)
      
      // Log completion activity
      await userAPI.logActivity(userId, 'lesson_complete', { 
        topicId, 
        timeSpent 
      })
      
      // Update daily progress
      const state = getState() as any
      const currentDailyProgress = state.progress.dailyProgress
      await goalsAPI.updateDailyProgress(userId, currentDailyProgress + 1)
      
      return { topicId, timeSpent }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to complete topic story')
    }
  }
)

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<string>) => {
      state.currentLesson = action.payload
    },
    
    // Local lesson progress update (for real-time UI updates)
    updateLessonProgressLocal: (state, action: PayloadAction<{ lessonId: string; progress: number }>) => {
      const lesson = state.lessons.find(l => l.id === action.payload.lessonId)
      if (lesson) {
        lesson.progress = action.payload.progress
        if (action.payload.progress >= 100) {
          lesson.completed = true
          state.dailyProgress += 1
          state.totalScore += 10
        }
      }
    },
    
    incrementStreak: (state) => {
      state.streak += 1
    },
    
    resetDailyProgress: (state) => {
      state.dailyProgress = 0
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Update local progress from database data
    setUserProgress: (state, action: PayloadAction<UserProgress[]>) => {
      state.userProgress = action.payload
      // Update calculated fields
      state.totalScore = action.payload.reduce((sum, p) => sum + (p.completed ? 100 : p.progress_percentage), 0)
      state.dailyProgress = action.payload.filter(p => {
        const today = new Date().toDateString()
        const accessedToday = new Date(p.last_accessed_at).toDateString() === today
        return accessedToday && p.progress_percentage > 0
      }).length
    }
  },
  extraReducers: (builder) => {
    // Load user progress
    builder
      .addCase(loadUserProgress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadUserProgress.fulfilled, (state, action) => {
        state.isLoading = false
        state.userProgress = action.payload
        
        // Update calculated fields
        const newTotalScore = action.payload.reduce((sum, p) => sum + (p.completed ? 100 : p.progress_percentage), 0)
        const today = new Date().toDateString()
        const newDailyProgress = action.payload.filter(p => {
          const accessedToday = new Date(p.last_accessed_at).toDateString() === today
          const qualifies = accessedToday && p.progress_percentage > 0
          return qualifies
        }).length
        
        state.totalScore = newTotalScore
        state.dailyProgress = newDailyProgress
      })
      .addCase(loadUserProgress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update topic progress
    builder
      .addCase(updateTopicProgress.fulfilled, (state, action) => {
        const { topicId } = action.payload
        const existingProgress = state.userProgress.find(p => p.topic_id === topicId)
        
        if (existingProgress) {
          const wasCompleted = existingProgress.completed
          existingProgress.progress_percentage = action.payload.progress_percentage
          existingProgress.completed = action.payload.completed || false
          if (action.payload.time_spent_seconds) {
            existingProgress.time_spent_seconds += action.payload.time_spent_seconds
          }
          existingProgress.last_accessed_at = new Date().toISOString()
          
          // If topic was just completed (wasn't completed before but is now), increment daily progress
          if (!wasCompleted && existingProgress.completed) {
            state.dailyProgress += 1
            state.totalScore += 10
          }
        }
      })

    // Update lesson progress
    builder
      .addCase(updateLessonProgress.fulfilled, (state, action) => {
        const { lessonId } = action.payload
        const lesson = state.lessons.find(l => l.id === lessonId)
        
        if (lesson) {
          lesson.progress = action.payload.progress_percentage || lesson.progress
          lesson.completed = action.payload.completed || lesson.completed
        }
      })

    // Load daily goal
    builder
      .addCase(loadDailyGoal.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadDailyGoal.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          const newDailyGoal = action.payload.lessons_goal || 4
          const newDailyProgress = action.payload.completed_lessons || 0
          state.dailyGoal = newDailyGoal
          state.dailyProgress = newDailyProgress
        } else {
          state.dailyGoal = 4
          state.dailyProgress = 0
        }
      })
      .addCase(loadDailyGoal.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.dailyGoal = 4
        state.dailyProgress = 0
      })

    // Update daily goal
    builder
      .addCase(updateDailyGoal.fulfilled, (state, action) => {
        state.dailyGoal = action.payload
      })

    // Update daily progress
    builder
      .addCase(updateDailyProgress.fulfilled, (state, action) => {
        state.dailyProgress = action.payload
      })

    // Load learning stats
    builder
      .addCase(loadLearningStats.fulfilled, (state, action) => {
        state.learningStats = action.payload
      })

    // Complete topic story
    builder
      .addCase(completeTopicStory.fulfilled, (state, action) => {
        const { topicId } = action.payload
        const progress = state.userProgress.find(p => p.topic_id === topicId)
        
        if (progress) {
          const wasCompleted = progress.completed
          progress.completed = true
          progress.progress_percentage = 100
          progress.completed_at = new Date().toISOString()
          if (action.payload.timeSpent) {
            progress.time_spent_seconds += action.payload.timeSpent
          }
          
          // If topic was just completed (wasn't completed before), increment daily progress
          if (!wasCompleted) {
            state.dailyProgress += 1
            state.totalScore += 10
          }
        }
      })

    // Handle errors for all async actions
    builder
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('progress/'),
        (state, action: any) => {
          state.isLoading = false
          state.error = action.payload as string
        }
      )
  }
})

export const { 
  setCurrentLesson, 
  updateLessonProgressLocal, 
  incrementStreak, 
  resetDailyProgress, 
  clearError,
  setUserProgress 
} = progressSlice.actions

export default progressSlice.reducer 