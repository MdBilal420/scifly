import { configureStore } from '@reduxjs/toolkit'
import progressReducer from './features/progress/progressSlice'
import quizReducer from './features/quiz/quizSlice'
import chatReducer from './features/chat/chatSlice'
import achievementReducer from './features/achievements/achievementSlice'

export const store = configureStore({
  reducer: {
    progress: progressReducer,
    quiz: quizReducer,
    chat: chatReducer,
    achievements: achievementReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 