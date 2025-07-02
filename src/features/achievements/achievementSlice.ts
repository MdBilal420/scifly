import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { achievementsAPI, userAPI } from '../../services/api'
import { Achievement as DatabaseAchievement, UserAchievement as DatabaseUserAchievement } from '../../config/supabase'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
  progress: number
  maxProgress: number
  category: string
  achievementKey: string
}

interface AchievementState {
  achievements: Achievement[]
  allAchievements: DatabaseAchievement[]
  userAchievements: DatabaseUserAchievement[]
  totalUnlocked: number
  recentlyUnlocked: string[]
  isLoading: boolean
  error: string | null
}

const initialState: AchievementState = {
  achievements: [],
  allAchievements: [],
  userAchievements: [],
  totalUnlocked: 0,
  recentlyUnlocked: [],
  isLoading: false,
  error: null
}

// Helper function to merge achievement data
function mergeAchievementData(
  allAchievements: DatabaseAchievement[], 
  userAchievements: DatabaseUserAchievement[]
): Achievement[] {
  return allAchievements.map(achievement => {
    const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.id)
    
    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      unlocked: userProgress?.unlocked || false,
      unlockedAt: userProgress?.unlocked_at ? new Date(userProgress.unlocked_at).getTime() : undefined,
      progress: userProgress?.current_progress || 0,
      maxProgress: achievement.max_progress,
      category: achievement.category,
      achievementKey: achievement.achievement_key
    }
  })
}

// Async thunks for achievement management
export const loadAllAchievements = createAsyncThunk(
  'achievements/loadAllAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const achievements = await achievementsAPI.getAllAchievements()
      return achievements
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load achievements')
    }
  }
)

export const loadUserAchievements = createAsyncThunk(
  'achievements/loadUserAchievements',
  async (userId: string, { rejectWithValue }) => {
    try {
      const userAchievements = await achievementsAPI.getUserAchievements(userId)
      return userAchievements
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to load user achievements')
    }
  }
)

export const initializeAchievements = createAsyncThunk(
  'achievements/initializeAchievements',
  async (userId: string, { dispatch, rejectWithValue }) => {
    try {
      // Load both all achievements and user progress
      const [allAchievements, userAchievements] = await Promise.all([
        dispatch(loadAllAchievements()).unwrap(),
        dispatch(loadUserAchievements(userId)).unwrap()
      ])

      return {
        allAchievements,
        userAchievements,
        mergedAchievements: mergeAchievementData(allAchievements, userAchievements)
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize achievements')
    }
  }
)

export const updateAchievementProgress = createAsyncThunk(
  'achievements/updateAchievementProgress',
  async ({ 
    userId, 
    achievementKey, 
    progress 
  }: { 
    userId: string; 
    achievementKey: string; 
    progress: number 
  }, { getState, rejectWithValue }) => {
    try {
      // Get achievement by key
      const achievement = await achievementsAPI.getAchievementByKey(achievementKey)
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementKey}`)
      }

      const unlocked = progress >= achievement.max_progress
      
      // Update progress in database
      const updatedUserAchievement = await achievementsAPI.updateAchievementProgress(
        userId,
        achievement.id,
        progress,
        unlocked
      )

      // Log achievement activity
      if (unlocked) {
        await userAPI.logActivity(userId, 'achievement_unlocked', {
          achievementId: achievement.id,
          achievementKey,
          progress
        })
      } else {
        await userAPI.logActivity(userId, 'achievement_progress', {
          achievementId: achievement.id,
          achievementKey,
          progress
        })
      }

      return {
        achievementId: achievement.id,
        achievementKey,
        progress,
        unlocked,
        unlockedAt: unlocked ? Date.now() : undefined
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update achievement progress')
    }
  }
)

export const unlockAchievement = createAsyncThunk(
  'achievements/unlockAchievement',
  async ({ 
    userId, 
    achievementKey 
  }: { 
    userId: string; 
    achievementKey: string 
  }, { rejectWithValue }) => {
    try {
      // Get achievement by key
      const achievement = await achievementsAPI.getAchievementByKey(achievementKey)
      if (!achievement) {
        throw new Error(`Achievement not found: ${achievementKey}`)
      }

      // Unlock achievement
      const updatedUserAchievement = await achievementsAPI.updateAchievementProgress(
        userId,
        achievement.id,
        achievement.max_progress,
        true
      )

      // Log unlock activity
      await userAPI.logActivity(userId, 'achievement_unlocked', {
        achievementId: achievement.id,
        achievementKey
      })

      return {
        achievementId: achievement.id,
        achievementKey,
        progress: achievement.max_progress,
        unlocked: true,
        unlockedAt: Date.now()
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to unlock achievement')
    }
  }
)

// Convenience thunks for common achievement triggers
export const incrementAchievementProgress = createAsyncThunk(
  'achievements/incrementAchievementProgress',
  async ({ 
    userId, 
    achievementKey, 
    incrementBy = 1 
  }: { 
    userId: string; 
    achievementKey: string; 
    incrementBy?: number 
  }, { getState, dispatch }) => {
    const state = getState() as { achievements: AchievementState }
    const achievement = state.achievements.achievements.find(a => a.achievementKey === achievementKey)
    
    if (!achievement) return null

    const newProgress = Math.min(achievement.progress + incrementBy, achievement.maxProgress)
    
    return dispatch(updateAchievementProgress({
      userId,
      achievementKey,
      progress: newProgress
    }))
  }
)

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    clearRecentlyUnlocked: (state) => {
      state.recentlyUnlocked = []
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    // Local progress update for real-time UI
    updateLocalProgress: (state, action: PayloadAction<{ achievementId: string; progress: number }>) => {
      const achievement = state.achievements.find(a => a.id === action.payload.achievementId)
      if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(action.payload.progress, achievement.maxProgress)
        
        if (achievement.progress >= achievement.maxProgress) {
          achievement.unlocked = true
          achievement.unlockedAt = Date.now()
          state.totalUnlocked += 1
          state.recentlyUnlocked.push(achievement.id)
        }
      }
    }
  },
  extraReducers: (builder) => {
    // Load all achievements
    builder
      .addCase(loadAllAchievements.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loadAllAchievements.fulfilled, (state, action) => {
        state.isLoading = false
        state.allAchievements = action.payload
      })
      .addCase(loadAllAchievements.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Load user achievements
    builder
      .addCase(loadUserAchievements.fulfilled, (state, action) => {
        state.userAchievements = action.payload
        state.totalUnlocked = action.payload.filter(ua => ua.unlocked).length
      })

    // Initialize achievements
    builder
      .addCase(initializeAchievements.fulfilled, (state, action) => {
        state.allAchievements = action.payload.allAchievements
        state.userAchievements = action.payload.userAchievements
        state.achievements = action.payload.mergedAchievements
        state.totalUnlocked = action.payload.userAchievements.filter(ua => ua.unlocked).length
      })

    // Update achievement progress
    builder
      .addCase(updateAchievementProgress.fulfilled, (state, action) => {
        const { achievementId, progress, unlocked, unlockedAt } = action.payload
        
        // Update in achievements array
        const achievement = state.achievements.find(a => a.id === achievementId)
        if (achievement) {
          achievement.progress = progress
          if (unlocked && !achievement.unlocked) {
            achievement.unlocked = true
            achievement.unlockedAt = unlockedAt
            state.totalUnlocked += 1
            state.recentlyUnlocked.push(achievementId)
          }
        }

        // Update in userAchievements array
        const userAchievement = state.userAchievements.find(ua => ua.achievement_id === achievementId)
        if (userAchievement) {
          userAchievement.current_progress = progress
          if (unlocked) {
            userAchievement.unlocked = true
            userAchievement.unlocked_at = new Date().toISOString()
          }
        }
      })

    // Unlock achievement
    builder
      .addCase(unlockAchievement.fulfilled, (state, action) => {
        const { achievementId, progress, unlockedAt } = action.payload
        
        // Update in achievements array
        const achievement = state.achievements.find(a => a.id === achievementId)
        if (achievement && !achievement.unlocked) {
          achievement.progress = progress
          achievement.unlocked = true
          achievement.unlockedAt = unlockedAt
          state.totalUnlocked += 1
          state.recentlyUnlocked.push(achievementId)
        }

        // Update in userAchievements array
        const userAchievement = state.userAchievements.find(ua => ua.achievement_id === achievementId)
        if (userAchievement) {
          userAchievement.current_progress = progress
          userAchievement.unlocked = true
          userAchievement.unlocked_at = new Date().toISOString()
        }
      })

    // Handle errors for async actions
    builder
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('achievements/'),
        (state, action: any) => {
          state.isLoading = false
          state.error = action.payload as string
        }
      )
  }
})

export const { 
  clearRecentlyUnlocked, 
  clearError, 
  updateLocalProgress 
} = achievementSlice.actions

export default achievementSlice.reducer 