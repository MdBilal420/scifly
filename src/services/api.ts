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
import { generateContentForSpeed, generateUIConfig } from '../utils/generativeUI'

// Helper function to resolve topic slug to UUID
async function resolveTopicId(topicIdOrSlug: string): Promise<string> {
  // Check if the provided ID looks like a UUID
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(topicIdOrSlug)
  
  if (isUUID) {
    return topicIdOrSlug
  }
  
  // It's likely a slug, so resolve it to UUID
  const { data: topicData, error: topicError } = await supabase
    .from('topics')
    .select('id')
    .eq('slug', topicIdOrSlug)
    .single()
  
  if (topicError || !topicData) {
    throw new Error(`Topic not found for slug: ${topicIdOrSlug}`)
  }
  
  return topicData.id
}

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
  async getLessons(topicIdOrSlug: string, learningSpeed: string) {
    const topicId = await resolveTopicId(topicIdOrSlug)
    
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
    const topicId = await resolveTopicId(lessonData.topic_id)
    
    // Use UPSERT to handle duplicate lessons gracefully
    const { data, error } = await supabase
      .from('lessons')
      .upsert({
        ...lessonData,
        topic_id: topicId
      }, {
        onConflict: 'topic_id,section_number,learning_speed_target',
        ignoreDuplicates: false // Update existing records
      })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully (lesson already exists)
      if (error.code === '23505') {
        console.log(`ℹ️ Lesson already exists: topic=${topicId}, section=${lessonData.section_number}, speed=${lessonData.learning_speed_target}`)
        // Return a mock response indicating the lesson exists (the actual lesson will be loaded by getLessons)
        return { 
          id: 'existing-lesson',
          topic_id: topicId,
          section_number: lessonData.section_number,
          title: lessonData.title,
          content: lessonData.content,
          tip: lessonData.tip,
          interactive_type: lessonData.interactive_type,
          image: lessonData.image,
          learning_speed_target: lessonData.learning_speed_target,
          created_at: new Date().toISOString()
        }
      }
      
      console.error('Failed to save lesson:', error.message)
      throw error
    }
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
  async getTopicProgress(userId: string, topicIdOrSlug: string): Promise<UserProgress | null> {
    const topicId = await resolveTopicId(topicIdOrSlug)
    
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
  async updateProgress(userId: string, topicIdOrSlug: string, progressData: {
    progress_percentage: number
    completed?: boolean
    time_spent_seconds?: number
  }) {
    const topicId = await resolveTopicId(topicIdOrSlug)
    
    const updateData = {
      user_id: userId,
      topic_id: topicId,
      last_accessed_at: new Date().toISOString(),
      ...progressData
    }

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(updateData, {
        onConflict: 'user_id,topic_id',
        ignoreDuplicates: false // Update existing records
      })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully (progress record already exists)
      if (error.code === '23505') {
        console.log(`ℹ️ Progress record already exists: user=${userId}, topic=${topicId}`)
        // Return a mock response indicating the record exists
        return { 
          id: 'existing-progress',
          user_id: userId,
          topic_id: topicId,
          progress_percentage: progressData.progress_percentage,
          completed: progressData.completed || false,
          time_spent_seconds: progressData.time_spent_seconds || 0,
          last_accessed_at: new Date().toISOString(),
          started_at: new Date().toISOString()
        }
      }
      
      console.error('Failed to update progress:', error.message)
      throw error
    }
    return data
  },

  // Mark topic as completed
  async completeTopicStory(userId: string, topicIdOrSlug: string, timeSpent: number = 0) {
    return this.updateProgress(userId, topicIdOrSlug, {
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
      .upsert(updateData, {
        onConflict: 'user_id,lesson_id',
        ignoreDuplicates: false // Update existing records
      })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully (lesson progress already exists)
      if (error.code === '23505') {
        console.log(`ℹ️ Lesson progress already exists: user=${userId}, lesson=${lessonId}`)
        // Return a mock response indicating the record exists
        return { 
          id: 'existing-lesson-progress',
          user_id: userId,
          lesson_id: lessonId,
          completed: progressData.completed || false,
          progress_percentage: progressData.progress_percentage || 0,
          time_spent_seconds: progressData.time_spent_seconds || 0,
          started_at: new Date().toISOString()
        }
      }
      
      console.error('Failed to update lesson progress:', error.message)
      throw error
    }
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
  async getQuizQuestions(topicIdOrSlug: string, learningSpeed: string, limit: number = 5) {
    const topicId = await resolveTopicId(topicIdOrSlug)
    
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
    const topicId = await resolveTopicId(quizData.topic_id)
    
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        ...quizData,
        topic_id: topicId
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
  async getBestScore(userId: string, topicIdOrSlug: string) {
    const topicId = await resolveTopicId(topicIdOrSlug)
    
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
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
      
      if (error) {
        console.error('Achievements API error:', error)
        // Return empty array if achievements table doesn't exist or has issues
        if (error.code === '42P01' || error.code === '406' || error.message.includes('relation') || error.message.includes('table')) {
          console.warn('⚠️ Achievements table not found or inaccessible. Please run the seed data script.')
          return []
        }
        throw error
      }
      return data || []
    } catch (error: any) {
      console.error('Failed to load achievements:', error)
      // Return empty array as fallback to prevent app crashes
      return []
    }
  },

  // Get user achievements with progress
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievements:achievement_id (*)
        `)
        .eq('user_id', userId)
      
      if (error) {
        console.error('User achievements API error:', error)
        // Return empty array if table doesn't exist or has issues
        if (error.code === '42P01' || error.code === '406' || error.message.includes('relation') || error.message.includes('table')) {
          console.warn('⚠️ User achievements table not found or inaccessible.')
          return []
        }
        throw error
      }
      return data || []
    } catch (error: any) {
      console.error('Failed to load user achievements:', error)
      // Return empty array as fallback
      return []
    }
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
      .upsert(updateData, {
        onConflict: 'user_id,achievement_id',
        ignoreDuplicates: false // Update existing records
      })
      .select(`
        *,
        achievements:achievement_id (*)
      `)
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully
      if (error.code === '23505') {
        console.log(`ℹ️ Achievement progress already exists: user=${userId}, achievement=${achievementId}`)
        // Return minimal response to avoid breaking the flow
        return {
          id: 'existing-achievement',
          user_id: userId,
          achievement_id: achievementId,
          current_progress: progress,
          unlocked: unlocked,
          unlocked_at: unlocked ? new Date().toISOString() : null
        }
      }
      
      console.error('Failed to update achievement progress:', error.message)
      throw error
    }
    return data
  },

  // Get achievement by key
  async getAchievementByKey(achievementKey: string): Promise<Achievement | null> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('achievement_key', achievementKey)
        .eq('is_active', true)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No matching record found
          console.warn(`⚠️ Achievement not found: ${achievementKey}`)
          return null
        }
        if (error.code === '42P01' || error.code === '406' || error.message.includes('relation') || error.message.includes('table')) {
          console.warn('⚠️ Achievements table not found or inaccessible.')
          return null
        }
        throw error
      }
      return data
    } catch (error: any) {
      console.error(`Failed to get achievement ${achievementKey}:`, error)
      // Return null as fallback
      return null
    }
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
      }, {
        onConflict: 'user_id,goal_date',
        ignoreDuplicates: false // Update existing records
      })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully
      if (error.code === '23505') {
        console.log(`ℹ️ Daily goal already exists: user=${userId}, date=${today}`)
        // Return minimal response to avoid breaking the flow
        return {
          id: 'existing-goal',
          user_id: userId,
          goal_date: today,
          lessons_goal: lessonsGoal,
          lessons_completed: 0,
          goal_achieved: false
        }
      }
      
      console.error('Failed to set daily goal:', error.message)
      throw error
    }
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
      }, {
        onConflict: 'user_id,goal_date',
        ignoreDuplicates: false // Update existing records
      })
      .select()
      .single()
    
    if (error) {
      // Handle duplicate key errors gracefully
      if (error.code === '23505') {
        console.log(`ℹ️ Daily progress already exists: user=${userId}, date=${today}`)
        // Return minimal response to avoid breaking the flow
        return {
          id: 'existing-progress',
          user_id: userId,
          goal_date: today,
          lessons_completed: completedLessons,
          goal_achieved: false
        }
      }
      
      console.error('Failed to update daily progress:', error.message)
      throw error
    }
    return data
  }
}

// ==========================================
// ADAPTIVE LEARNING
// ==========================================

export const adaptiveAPI = {
  // Get lesson with adaptive content
  async getAdaptiveLesson(lessonId: string, userId: string, userSpeed: number) {
    try {
      // 1. Get base lesson data
      const { data: lesson, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', lessonId)
        .single()

      if (lessonError) throw lessonError

      // 2. Check for cached adaptation
      let adaptedContent = await this.getCachedAdaptation(lessonId, userSpeed)
      
      // 3. Generate new adaptation if none exists
      if (!adaptedContent) {
        adaptedContent = generateContentForSpeed(lesson.content, userSpeed)
        await this.cacheAdaptation(lessonId, userSpeed, adaptedContent)
      }

      // 4. Generate UI configuration
      const uiConfig = generateUIConfig(userSpeed)

      // 5. Create tracking record
      const trackingId = await this.createTrackingRecord(userId, lessonId, userSpeed)

      return {
        lesson: {
          ...lesson,
          adaptedContent
        },
        adaptedContent,
        uiConfig,
        trackingId
      }
    } catch (error: any) {
      console.error('Error getting adaptive lesson:', error)
      throw error
    }
  },

  // Get cached content adaptation
  async getCachedAdaptation(lessonId: string, userSpeed: number) {
    try {
      const { data, error } = await supabase
        .from('content_adaptations')
        .select('adapted_content, effectiveness_score')
        .eq('lesson_id', lessonId)
        .eq('user_speed', userSpeed)
        .eq('adaptation_type', 'auto')
        .order('effectiveness_score', { ascending: false })
        .limit(1)

      if (error || !data.length) return null
      return data[0].adapted_content
    } catch (error) {
      console.warn('Failed to get cached adaptation:', error)
      return null
    }
  },

  // Cache generated adaptation
  async cacheAdaptation(lessonId: string, userSpeed: number, adaptedContent: any) {
    try {
      await supabase
        .from('content_adaptations')
        .insert({
          lesson_id: lessonId,
          user_speed: userSpeed,
          adapted_content: adaptedContent,
          adaptation_type: 'auto',
          effectiveness_score: 0,
          usage_count: 0
        })
    } catch (error) {
      console.warn('Failed to cache adaptation:', error)
      // Don't throw - caching failure shouldn't break the main flow
    }
  },

  // Create tracking record
  async createTrackingRecord(userId: string, lessonId: string, userSpeed: number) {
    try {
      const { data, error } = await supabase
        .from('user_content_interactions')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          interaction_type: 'view',
          interaction_data: {
            user_speed: userSpeed,
            timestamp: Date.now()
          },
          time_spent_seconds: 0
        })
        .select('id')
        .single()

      if (error) throw error
      return data.id
    } catch (error) {
      console.warn('Failed to create tracking record:', error)
      return `fallback_${Date.now()}`
    }
  },

  // Track user interaction
  async trackUserInteraction(interaction: {
    userId: string
    lessonId: string
    adaptationId?: string
    interactionType: string
    interactionData: any
    engagementScore?: number
    timeSpentSeconds: number
  }) {
    try {
      await supabase
        .from('user_content_interactions')
        .insert({
          user_id: interaction.userId,
          lesson_id: interaction.lessonId,
          adaptation_id: interaction.adaptationId,
          interaction_type: interaction.interactionType,
          interaction_data: interaction.interactionData,
          engagement_score: interaction.engagementScore,
          time_spent_seconds: interaction.timeSpentSeconds
        })

      // Update adaptation effectiveness if applicable
      if (interaction.adaptationId && interaction.engagementScore) {
        await this.updateAdaptationEffectiveness(interaction.adaptationId, interaction.engagementScore)
      }
    } catch (error) {
      console.error('Error tracking interaction:', error)
      // Don't throw - tracking failure shouldn't break user experience
    }
  },

  // Update adaptation effectiveness
  async updateAdaptationEffectiveness(adaptationId: string, engagementScore: number) {
    try {
      // Get current stats
      const { data: adaptation } = await supabase
        .from('content_adaptations')
        .select('effectiveness_score, usage_count')
        .eq('id', adaptationId)
        .single()

      if (!adaptation) return

      // Calculate new effectiveness score (weighted average)
      const currentScore = adaptation.effectiveness_score || 0
      const currentCount = adaptation.usage_count || 0
      const newCount = currentCount + 1
      const newScore = ((currentScore * currentCount) + engagementScore) / newCount

      // Update the record
      await supabase
        .from('content_adaptations')
        .update({
          effectiveness_score: newScore,
          usage_count: newCount
        })
        .eq('id', adaptationId)
    } catch (error) {
      console.warn('Failed to update adaptation effectiveness:', error)
    }
  },

  // Get lessons adapted for specific user speed
  async getLessonsForSpeed(topicIdOrSlug: string, userSpeed: number) {
    try {
      const topicId = await resolveTopicId(topicIdOrSlug)
      
      const { data: lessons, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', topicId)
        .order('section_number')

      if (error) throw error

      // Adapt each lesson for the user's speed
      const adaptedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          const adaptedContent = await this.getCachedAdaptation(lesson.id, userSpeed) ||
                                generateContentForSpeed(lesson.content, userSpeed)
          
          return {
            ...lesson,
            adaptedContent,
            uiConfig: generateUIConfig(userSpeed)
          }
        })
      )

      return adaptedLessons
    } catch (error: any) {
      console.error('Error getting lessons for speed:', error)
      throw error
    }
  },

  // Suggest optimal learning speed
  async suggestOptimalSpeed(userId: string) {
    try {
      // Get user's recent performance data (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      
      const { data: interactions, error } = await supabase
        .from('user_content_interactions')
        .select('*, lessons!inner(learning_speed_target)')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Analyze performance by speed
      const performanceBySpeed = this.analyzePerformanceBySpeed(interactions)
      
      // Find optimal speed
      return this.findOptimalSpeed(performanceBySpeed)
    } catch (error: any) {
      console.error('Error suggesting optimal speed:', error)
      return { suggestedSpeed: 3, reason: 'Default recommendation', confidence: 0.5 }
    }
  },

  // Analyze user performance across different speeds
  analyzePerformanceBySpeed(interactions: any[]) {
    const speedStats: Record<number, any> = {}

    interactions.forEach(interaction => {
      const speed = interaction.interaction_data?.user_speed || 3
      
      if (!speedStats[speed]) {
        speedStats[speed] = {
          totalInteractions: 0,
          totalEngagement: 0,
          totalTime: 0,
          completions: 0
        }
      }

      speedStats[speed].totalInteractions++
      speedStats[speed].totalEngagement += interaction.engagement_score || 0
      speedStats[speed].totalTime += interaction.time_spent_seconds || 0
      
      if (interaction.interaction_type === 'complete') {
        speedStats[speed].completions++
      }
    })

    // Calculate averages and rates
    Object.keys(speedStats).forEach(speed => {
      const stats = speedStats[Number(speed)]
      stats.avgEngagement = stats.totalEngagement / stats.totalInteractions
      stats.avgTime = stats.totalTime / stats.totalInteractions
      stats.completionRate = stats.completions / stats.totalInteractions
    })

    return speedStats
  },

  // Find optimal learning speed
  findOptimalSpeed(performanceBySpeed: Record<number, any>) {
    let bestSpeed = 3
    let bestScore = 0
    let reason = 'Balanced recommendation'
    
    Object.entries(performanceBySpeed).forEach(([speed, stats]) => {
      // Composite score considering engagement, completion rate, and time efficiency
      const score = (stats.avgEngagement * 0.4) + 
                    (stats.completionRate * 0.4) + 
                    (Math.min(stats.avgTime / 300, 1) * 0.2) // Normalize time (5 min baseline)

      if (score > bestScore) {
        bestScore = score
        bestSpeed = Number(speed)
        reason = `Best performance at speed ${speed} (${(score * 100).toFixed(1)}% effectiveness)`
      }
    })

    const confidence = Math.min(bestScore, 0.95) // Cap confidence at 95%

    return { suggestedSpeed: bestSpeed, reason, confidence }
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
  goals: goalsAPI,
  adaptive: adaptiveAPI
} 