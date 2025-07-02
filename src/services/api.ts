import { supabase } from '../config/supabase'
import type { 
  DatabaseUser, 
  DatabaseTopic, 
  UserProgress, 
  ChatMessage, 
  QuizAttempt, 
  Achievement, 
  UserAchievement 
} from '../config/supabase'

// ==========================================
// AUTHENTICATION & USER MANAGEMENT
// ==========================================

export const authAPI = {
  // Create new user account
  async signUp(email: string, password: string, userData: {
    name: string
    learning_speed: '1' | '2' | '3' | '4' | '5'
    avatar: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          learning_speed: userData.learning_speed,
          avatar: userData.avatar
        }
      }
    })
    
    if (error) throw error
    
    // Wait for session to be fully established
    if (data.user && data.session) {
      console.log('🔄 Waiting for session to be fully established...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify session is available
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.warn('⚠️ Session not immediately available, waiting longer...')
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    return data
  },

  // Sign in existing user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  // Sign out current user
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Get current user session
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// ==========================================
// USER PROFILE MANAGEMENT
// ==========================================

export const userAPI = {
  // Get user profile from database
  async getProfile(userId: string): Promise<DatabaseUser | null> {
    try {
      // Check current session before making the call
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session for profile fetch:', session ? 'Valid' : 'None')
      
      if (!session) {
        console.warn('No active session found for profile fetch')
        throw new Error('No active session - please sign in again')
      }
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
      
      if (error && error.code !== 'PGRST116') {
        console.error('Profile fetch error:', error)
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          userId: userId,
          hasSession: !!session
        })
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }
      
      return data?.[0] || null
    } catch (error: any) {
      // Handle network/other errors
      if (error.message?.includes('406')) {
        console.error('406 Not Acceptable error detected:', error)
        throw new Error('Authentication error - please try signing in again')
      }
      throw error
    }
  },

  // Create user profile after auth signup
  async createProfile(userId: string, profileData: {
    email: string
    name: string
    learning_speed: '1' | '2' | '3' | '4' | '5'
    avatar: string
    preferences?: {
      explanationDetail: 'basic' | 'detailed' | 'comprehensive'
      exampleCount: number
      repeatCount: number
    }
  }) {
    const defaultPreferences = {
      explanationDetail: 'detailed' as const,
      exampleCount: 2,
      repeatCount: 1
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: profileData.email,
        name: profileData.name,
        learning_speed: profileData.learning_speed,
        avatar: profileData.avatar,
        preferences: profileData.preferences || defaultPreferences
      })
      .select()
      .single()
    
    if (error) {
      console.error('Profile creation error:', error)
      throw new Error(`Failed to create profile: ${error.message}`)
    }
    return data
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<DatabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update last active timestamp
  async updateLastActive(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', userId)
    
    if (error) throw error
  },

  // Log user activity
  async logActivity(userId: string, activityType: string, activityData: Record<string, any> = {}) {
    const { error } = await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData
      })
    
    if (error) throw error
  }
}

// ==========================================
// TOPICS & CONTENT MANAGEMENT
// ==========================================

export const topicsAPI = {
  // Get all active topics
  async getAllTopics(): Promise<DatabaseTopic[]> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get topic by slug
  async getTopicBySlug(slug: string): Promise<DatabaseTopic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get topic by ID
  async getTopicById(topicId: string): Promise<DatabaseTopic | null> {
    const { data, error } = await supabase
      .from('topics')
      .select('*')
      .eq('id', topicId)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get lessons for topic and learning speed
  async getLessons(topicId: string, learningSpeed: string) {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('topic_id', topicId)
      .eq('learning_speed_target', learningSpeed)
      .order('section_number', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Save generated lesson content
  async saveLesson(lessonData: {
    topic_id: string
    section_number: number
    title: string
    content: string
    tip: string
    interactive_type: string
    image: string
    learning_speed_target: string
  }) {
    const { data, error } = await supabase
      .from('lessons')
      .insert(lessonData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ==========================================
// PROGRESS TRACKING
// ==========================================

export const progressAPI = {
  // Get all user progress
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        topics:topic_id (
          slug,
          title,
          icon,
          color
        )
      `)
      .eq('user_id', userId)
      .order('last_accessed_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get progress for specific topic
  async getTopicProgress(userId: string, topicId: string): Promise<UserProgress | null> {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update or create progress
  async updateProgress(userId: string, topicId: string, progressData: {
    progress_percentage: number
    completed?: boolean
    time_spent_seconds?: number
  }) {
    const updateData = {
      user_id: userId,
      topic_id: topicId,
      last_accessed_at: new Date().toISOString(),
      ...progressData
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(updateData)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Mark topic as completed
  async completeTopicStory(userId: string, topicId: string, timeSpent: number = 0) {
    return this.updateProgress(userId, topicId, {
      progress_percentage: 100,
      completed: true,
      time_spent_seconds: timeSpent
    })
  },

  // Get lesson progress
  async getLessonProgress(userId: string, lessonId: string) {
    const { data, error } = await supabase
      .from('lesson_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('lesson_id', lessonId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Update lesson progress
  async updateLessonProgress(userId: string, lessonId: string, progressData: {
    completed?: boolean
    progress_percentage?: number
    time_spent_seconds?: number
  }) {
    const updateData = {
      user_id: userId,
      lesson_id: lessonId,
      ...progressData
    }

    const { data, error } = await supabase
      .from('lesson_progress')
      .upsert(updateData)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// ==========================================
// CHAT SYSTEM
// ==========================================

export const chatAPI = {
  // Get chat history
  async getChatHistory(userId: string, topicId?: string): Promise<ChatMessage[]> {
    let query = supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (topicId) {
      query = query.eq('topic_id', topicId)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  // Send message
  async sendMessage(userId: string, message: string, sender: 'user' | 'simba', topicId?: string, metadata: Record<string, any> = {}) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        topic_id: topicId,
        message,
        sender,
        metadata
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Clear chat history
  async clearChatHistory(userId: string, topicId?: string) {
    let query = supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
    
    if (topicId) {
      query = query.eq('topic_id', topicId)
    }
    
    const { error } = await query
    if (error) throw error
  }
}

// ==========================================
// QUIZ SYSTEM
// ==========================================

export const quizAPI = {
  // Get quiz questions
  async getQuizQuestions(topicId: string, learningSpeed: string, limit: number = 5) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('topic_id', topicId)
      .eq('learning_speed_target', learningSpeed)
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Save quiz attempt
  async saveQuizAttempt(userId: string, quizData: {
    topic_id: string
    question_ids: string[]
    user_answers: Record<string, number>
    score: number
    total_questions: number
    completed: boolean
    time_spent_seconds: number
  }) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        ...quizData
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get quiz history
  async getQuizHistory(userId: string): Promise<QuizAttempt[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select(`
        *,
        topics:topic_id (
          title,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Get best quiz score for topic
  async getBestScore(userId: string, topicId: string) {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('score, total_questions')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .eq('completed', true)
      .order('score', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// ==========================================
// ACHIEVEMENTS SYSTEM
// ==========================================

export const achievementsAPI = {
  // Get all achievements
  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  // Get user achievements with progress
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select(`
        *,
        achievements:achievement_id (*)
      `)
      .eq('user_id', userId)
    
    if (error) throw error
    return data || []
  },

  // Update achievement progress
  async updateAchievementProgress(userId: string, achievementId: string, progress: number, unlocked: boolean = false) {
    const updateData: any = {
      user_id: userId,
      achievement_id: achievementId,
      current_progress: progress
    }
    
    if (unlocked) {
      updateData.unlocked = true
      updateData.unlocked_at = new Date().toISOString()
    }
    
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert(updateData)
      .select(`
        *,
        achievements:achievement_id (*)
      `)
      .single()
    
    if (error) throw error
    return data
  },

  // Get achievement by key
  async getAchievementByKey(achievementKey: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('achievement_key', achievementKey)
      .eq('is_active', true)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  }
}

// ==========================================
// DASHBOARD & ANALYTICS
// ==========================================

export const analyticsAPI = {
  // Get user dashboard data
  async getUserDashboard(userId: string) {
    const { data, error } = await supabase
      .from('user_dashboard')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Get recent activity
  async getRecentActivity(userId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data || []
  },

  // Get learning stats
  async getLearningStats(userId: string) {
    const [progressData, quizData, achievementData] = await Promise.all([
      progressAPI.getUserProgress(userId),
      quizAPI.getQuizHistory(userId),
      achievementsAPI.getUserAchievements(userId)
    ])

    return {
      totalTopics: progressData.length,
      completedTopics: progressData.filter(p => p.completed).length,
      totalQuizzes: quizData.length,
      averageScore: quizData.length > 0 
        ? quizData.reduce((sum, quiz) => sum + (quiz.score / quiz.total_questions * 100), 0) / quizData.length 
        : 0,
      unlockedAchievements: achievementData.filter(a => a.unlocked).length,
      totalTime: progressData.reduce((sum, p) => sum + p.time_spent_seconds, 0)
    }
  }
}

// ==========================================
// DAILY GOALS
// ==========================================

export const goalsAPI = {
  // Get today's goal
  async getTodaysGoal(userId: string) {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_date', today)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  // Set daily goal
  async setDailyGoal(userId: string, lessonsGoal: number) {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_goals')
      .upsert({
        user_id: userId,
        goal_date: today,
        lessons_goal: lessonsGoal,
        lessons_completed: 0,
        goal_achieved: false
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update daily progress
  async updateDailyProgress(userId: string, completedLessons: number) {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from('daily_goals')
      .upsert({
        user_id: userId,
        goal_date: today,
        lessons_completed: completedLessons
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Export all APIs
export default {
  auth: authAPI,
  user: userAPI,
  topics: topicsAPI,
  progress: progressAPI,
  chat: chatAPI,
  quiz: quizAPI,
  achievements: achievementsAPI,
  analytics: analyticsAPI,
  goals: goalsAPI
} 