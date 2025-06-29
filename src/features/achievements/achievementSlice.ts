import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: number
  progress: number
  maxProgress: number
}

interface AchievementState {
  achievements: Achievement[]
  totalUnlocked: number
  recentlyUnlocked: string[]
}

const initialAchievements: Achievement[] = [
  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'quiz-master',
    title: 'Quiz Master',
    description: 'Get 100% on a quiz',
    icon: '🏆',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  },
  {
    id: 'curious-mind',
    title: 'Curious Mind',
    description: 'Ask Simba 10 questions',
    icon: '🤔',
    unlocked: false,
    progress: 0,
    maxProgress: 10
  },
  {
    id: 'streak-starter',
    title: 'Streak Starter',
    description: 'Learn for 3 days in a row',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 3
  },
  {
    id: 'science-explorer',
    title: 'Science Explorer',
    description: 'Complete 5 different lessons',
    icon: '🔬',
    unlocked: false,
    progress: 0,
    maxProgress: 5
  },
  {
    id: 'gravity-guru',
    title: 'Gravity Guru',
    description: 'Master the gravity lesson',
    icon: '🌍',
    unlocked: false,
    progress: 0,
    maxProgress: 1
  }
]

const initialState: AchievementState = {
  achievements: initialAchievements,
  totalUnlocked: 0,
  recentlyUnlocked: [],
}

const achievementSlice = createSlice({
  name: 'achievements',
  initialState,
  reducers: {
    updateAchievementProgress: (state, action: PayloadAction<{ achievementId: string; progress: number }>) => {
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
    },
    unlockAchievement: (state, action: PayloadAction<string>) => {
      const achievement = state.achievements.find(a => a.id === action.payload)
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true
        achievement.unlockedAt = Date.now()
        achievement.progress = achievement.maxProgress
        state.totalUnlocked += 1
        state.recentlyUnlocked.push(achievement.id)
      }
    },
    clearRecentlyUnlocked: (state) => {
      state.recentlyUnlocked = []
    },
  },
})

export const { updateAchievementProgress, unlockAchievement, clearRecentlyUnlocked } = achievementSlice.actions
export default achievementSlice.reducer 