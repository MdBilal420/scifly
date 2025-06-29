import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Lesson {
  id: string
  title: string
  completed: boolean
  progress: number
}

interface ProgressState {
  currentLesson: string | null
  lessons: Lesson[]
  dailyGoal: number
  dailyProgress: number
  totalScore: number
  streak: number
}

const initialState: ProgressState = {
  currentLesson: null,
  lessons: [
    { id: 'gravity', title: 'What is Gravity?', completed: false, progress: 0 },
    { id: 'solar-system', title: 'Our Solar System', completed: false, progress: 0 },
    { id: 'water-cycle', title: 'The Water Cycle', completed: false, progress: 0 },
    { id: 'plants', title: 'How Plants Grow', completed: false, progress: 0 },
  ],
  dailyGoal: 4,
  dailyProgress: 0,
  totalScore: 0,
  streak: 0,
}

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<string>) => {
      state.currentLesson = action.payload
    },
    updateLessonProgress: (state, action: PayloadAction<{ lessonId: string; progress: number }>) => {
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
  },
})

export const { setCurrentLesson, updateLessonProgress, incrementStreak, resetDailyProgress } = progressSlice.actions
export default progressSlice.reducer 