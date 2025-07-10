import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_API_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('supabaseUrl', supabaseUrl)
  console.log('supabaseAnonKey', supabaseAnonKey ? 'Present' : 'Missing')
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-web'
    }
  }
})

// Database types matching your current Redux state
export interface DatabaseUser {
  id: string
  email: string
  name: string
  learning_speed: '1' | '2' | '3' | '4' | '5'
  avatar: string
  preferences: {
    explanationDetail: 'basic' | 'detailed' | 'comprehensive'
    exampleCount: number
    repeatCount: number
  }
  total_score: number
  current_streak: number
  longest_streak: number
  is_active: boolean
  created_at: string
  last_active_at: string
  updated_at: string
  speed_adaptation_data?: {
    auto_adjust: boolean
    preferred_modes: string[]
    adaptation_history: Array<{
      old_speed: number
      new_speed: number
      reason: string
      timestamp: number
    }>
    performance_by_speed: Record<number, {
      total_lessons: number
      completed_lessons: number
      avg_engagement: number
      avg_completion_time: number
    }>
    last_speed_change: number | null
    total_adaptations: number
  }
}

export interface DatabaseTopic {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  background_theme: string
  difficulty: number
  estimated_time_minutes: number
  key_learning_points: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  topic_id: string
  progress_percentage: number
  completed: boolean
  started_at: string
  completed_at?: string
  last_accessed_at: string
  time_spent_seconds: number
}

export interface ChatMessage {
  id: string
  user_id: string
  topic_id?: string
  message: string
  sender: 'user' | 'simba'
  metadata: Record<string, any>
  created_at: string
}

export interface QuizAttempt {
  id: string
  user_id: string
  topic_id: string
  question_ids: string[]
  user_answers: Record<string, number>
  score: number
  total_questions: number
  completed: boolean
  started_at: string
  completed_at?: string
  time_spent_seconds: number
}

export interface Achievement {
  id: string
  achievement_key: string
  title: string
  description: string
  icon: string
  category: string
  max_progress: number
  unlock_criteria: Record<string, any>
  is_active: boolean
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  current_progress: number
  unlocked: boolean
  unlocked_at?: string
  created_at: string
  achievements?: Achievement
}

export interface DatabaseLesson {
  id: string
  topic_id: string
  section_number: number
  title: string
  content: string
  tip: string
  interactive_type: string
  image: string
  images: string[] // Array of image URLs from Supabase Storage
  learning_speed_target: string
  created_at: string
} 