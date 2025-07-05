import { configureStore } from '@reduxjs/toolkit'
import progressReducer from './features/progress/progressSlice'
import quizReducer from './features/quiz/quizSlice'
import chatReducer from './features/chat/chatSlice'
import achievementReducer from './features/achievements/achievementSlice'
import topicsReducer from './features/topics/topicsSlice'
import userReducer from './features/user/userSlice'
import adaptiveReducer from './features/adaptive/adaptiveSlice'
import aiContentReducer from './features/aiContent/aiContentSlice'
import smartTutorReducer from './features/smartTutor/smartTutorSlice'

// Interaction tracking middleware
const interactionTrackingMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action)
  
  // Track certain actions as user interactions
  if (action.type && store.getState().adaptive?.trackingEnabled) {
    const userInteractionActions = [
      'quiz/submitAnswer',
      'progress/updateProgress', 
      'chat/sendMessage',
      'user/updateUserSpeed'
    ]
    
    if (userInteractionActions.some(type => action.type.includes(type))) {
      const state = store.getState()
      const currentUser = state.user?.currentUser
      const currentSession = state.adaptive?.currentSession
      
      if (currentUser && currentSession) {
        const interaction = {
          userId: currentUser.id,
          lessonId: currentSession.lessonId,
          adaptationId: state.adaptive?.currentLessonContent?.trackingId,
          interactionType: action.type.includes('submit') ? 'complete' : 'click',
          interactionData: {
            actionType: action.type,
            payload: action.payload
          },
          timeSpentSeconds: Math.floor((Date.now() - currentSession.startTime) / 1000)
        }
        
        // Dispatch tracking action
        store.dispatch({ type: 'adaptive/addInteraction', payload: interaction })
      }
    }
  }
  
  return result
}

export const store = configureStore({
  reducer: {
    progress: progressReducer,
    quiz: quizReducer,
    chat: chatReducer,
    achievements: achievementReducer,
    topics: topicsReducer,
    user: userReducer,
    adaptive: adaptiveReducer,
    aiContent: aiContentReducer,
    smartTutor: smartTutorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(interactionTrackingMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch 