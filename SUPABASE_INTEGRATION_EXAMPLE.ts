// Example Supabase integration for SciFly
// This shows how to migrate from localStorage to Supabase database

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_API_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Example: Replace localStorage user with Supabase Auth
export const authService = {
  async signUp(email: string, password: string, userData: {
    name: string
    learning_speed: '1' | '2' | '3' | '4' | '5'
    avatar: string
  }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    
    if (error) throw error
    return data
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  }
}

// Example: Replace Redux progress with database
export const progressService = {
  async getProgress(userId: string, topicId: string) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('topic_id', topicId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateProgress(userId: string, topicId: string, percentage: number) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        topic_id: topicId,
        progress_percentage: percentage,
        last_accessed_at: new Date().toISOString()
      })
    
    if (error) throw error
    return data
  }
}

// Example: Chat history in database
export const chatService = {
  async saveMessage(userId: string, message: string, sender: 'user' | 'simba', topicId?: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userId,
        message,
        sender,
        topic_id: topicId
      })
    
    if (error) throw error
    return data
  },

  async getChatHistory(userId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data || []
  }
} 