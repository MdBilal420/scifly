import { useEffect } from 'react'

// TypeScript declaration for Clarity
declare global {
  interface Window {
    clarity: {
      (command: string, ...args: any[]): void
      q?: any[]
    }
  }
}

export const useClarity = () => {
  useEffect(() => {
    // Ensure Clarity is loaded
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      console.log('Microsoft Clarity is loaded and ready')
    }
  }, [])

  const trackEvent = (eventName: string, data?: any) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('event', eventName, data)
    }
  }

  const setUserId = (userId: string) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('identify', userId)
    }
  }

  const setUserProperties = (properties: Record<string, any>) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('set', 'user_properties', properties)
    }
  }

  const consent = (consent: boolean) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity('consent', consent)
    }
  }

  return {
    trackEvent,
    setUserId,
    setUserProperties,
    consent,
    isLoaded: typeof window !== 'undefined' && typeof window.clarity === 'function'
  }
}

// Predefined events for SciFly
export const clarityEvents = {
  // User authentication events
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGNED_OUT: 'user_signed_out',
  
  // Learning events
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  QUIZ_STARTED: 'quiz_started',
  QUIZ_COMPLETED: 'quiz_completed',
  FLASHCARD_REVIEWED: 'flashcard_reviewed',
  SIMULATION_STARTED: 'simulation_started',
  SIMULATION_COMPLETED: 'simulation_completed',
  
  // AI interaction events
  AI_CHAT_STARTED: 'ai_chat_started',
  AI_QUESTION_ASKED: 'ai_question_asked',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  PROGRESS_MILESTONE: 'progress_milestone',
  
  // Navigation events
  TOPIC_SELECTED: 'topic_selected',
  ACTIVITY_SELECTED: 'activity_selected',
  
  // Speed adaptation events
  LEARNING_SPEED_CHANGED: 'learning_speed_changed',
  ADAPTIVE_CONTENT_SHOWN: 'adaptive_content_shown',
  
  // Game events
  GAME_STARTED: 'game_started',
  GAME_COMPLETED: 'game_completed',
  GAME_SCORE_ACHIEVED: 'game_score_achieved'
}
