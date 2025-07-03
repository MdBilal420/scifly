import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@supabase/supabase-js'
import { authAPI, userAPI } from '../../services/api'
import { DatabaseUser, supabase } from '../../config/supabase'

export interface UserProfile {
  id: string
  name: string
  learningSpeed: 1 | 2 | 3 | 4 | 5 // 1 = slow learner, 5 = quick learner
  avatar: string
  joinedAt: number
  lastActiveAt: number
  preferences: {
    explanationDetail: 'basic' | 'detailed' | 'comprehensive'
    exampleCount: number
    repeatCount: number
  }
  email?: string
  currentStreak?: number
  totalScore?: number
}

interface UserState {
  currentUser: UserProfile | null
  authUser: User | null
  isOnboarded: boolean
  showOnboarding: boolean
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
  learningProfiles: {
    1: { name: 'Careful Explorer', detail: 'comprehensive', examples: 3, repeats: 2 }
    2: { name: 'Steady Learner', detail: 'detailed', examples: 2, repeats: 2 }
    3: { name: 'Balanced Student', detail: 'detailed', examples: 2, repeats: 1 }
    4: { name: 'Quick Thinker', detail: 'basic', examples: 1, repeats: 1 }
    5: { name: 'Lightning Fast', detail: 'basic', examples: 1, repeats: 0 }
  }
}

const initialState: UserState = {
  currentUser: null,
  authUser: null,
  isOnboarded: false,
  showOnboarding: true,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  learningProfiles: {
    1: { name: 'Careful Explorer', detail: 'comprehensive', examples: 3, repeats: 2 },
    2: { name: 'Steady Learner', detail: 'detailed', examples: 2, repeats: 2 },
    3: { name: 'Balanced Student', detail: 'detailed', examples: 2, repeats: 1 },
    4: { name: 'Quick Thinker', detail: 'basic', examples: 1, repeats: 1 },
    5: { name: 'Lightning Fast', detail: 'basic', examples: 1, repeats: 0 }
  }
}

// Helper function to convert DatabaseUser to UserProfile
function mapDatabaseUserToProfile(dbUser: DatabaseUser): UserProfile {
  return {
    id: dbUser.id,
    name: dbUser.name,
    learningSpeed: parseInt(dbUser.learning_speed) as 1 | 2 | 3 | 4 | 5,
    avatar: dbUser.avatar,
    joinedAt: new Date(dbUser.created_at).getTime(),
    lastActiveAt: new Date(dbUser.last_active_at).getTime(),
    preferences: {
      explanationDetail: dbUser.preferences.explanationDetail,
      exampleCount: dbUser.preferences.exampleCount,
      repeatCount: dbUser.preferences.repeatCount
    },
    email: dbUser.email,
    currentStreak: dbUser.current_streak,
    totalScore: dbUser.total_score
  }
}

// Async thunks for authentication and user management
export const signUpUser = createAsyncThunk(
  'user/signUpUser',
  async ({ email, password, name, learningSpeed }: { 
    email: string; 
    password: string; 
    name: string; 
    learningSpeed: 1 | 2 | 3 | 4 | 5 
  }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState }
      const profile = state.user.learningProfiles[learningSpeed]
      
      const { user } = await authAPI.signUp(email, password, {
        name,
        learning_speed: learningSpeed.toString() as '1' | '2' | '3' | '4' | '5',
        avatar: getAvatarForSpeed(learningSpeed)
      })
      
      if (!user) throw new Error('Failed to create user')
      
      console.log('✅ Auth user created successfully:', user.id)
      
      // Try to create profile, but handle case where it might already exist
      let userProfile
      try {
        userProfile = await userAPI.createProfile(user.id, {
          email,
          name,
          learning_speed: learningSpeed.toString() as '1' | '2' | '3' | '4' | '5',
          avatar: getAvatarForSpeed(learningSpeed),
          preferences: {
            explanationDetail: profile.detail as 'basic' | 'detailed' | 'comprehensive',
            exampleCount: profile.examples,
            repeatCount: profile.repeats
          }
        })
      } catch (profileError: any) {
        // If profile creation fails, try to get existing profile
        if (profileError.message?.includes('duplicate') || profileError.code === '23505') {
          userProfile = await userAPI.getProfile(user.id)
          if (!userProfile) throw new Error('Failed to create or retrieve user profile')
        } else {
          throw profileError
        }
      }
      
      return { authUser: user, profile: mapDatabaseUserToProfile(userProfile) }
    } catch (error: any) {
      console.error('Signup error:', error)
      return rejectWithValue(error.message || 'Failed to sign up')
    }
  }
)

export const signInUser = createAsyncThunk(
  'user/signInUser',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { user, session } = await authAPI.signIn(email, password)
      if (!user || !session) throw new Error('Failed to sign in')
      
      console.log('Sign in successful, session established:', !!session)
      
      // Wait longer for the session to be fully established and available for REST calls
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify session is available in the Supabase client
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      console.log('Session available for REST calls:', !!currentSession)
      
      if (!currentSession) {
        console.warn('Session not available after sign in, waiting longer...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Retry logic for profile fetch in case of 406/auth issues
      let profile
      let retries = 3
      while (retries > 0) {
        try {
          profile = await userAPI.getProfile(user.id)
          console.log('Profile fetch successful')
          break // Success, exit retry loop
        } catch (error: any) {
          retries--
          console.log(`Profile fetch attempt failed:`, error.message)
          if (error.message?.includes('406') || error.message?.includes('Unauthorized') || error.message?.includes('session')) {
            if (retries > 0) {
              console.log(`Profile fetch failed, retrying... (${retries} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, 500))
              continue
            }
          }
          throw error // Re-throw if not a retry-able error or out of retries
        }
      }
      
      if (!profile) throw new Error('User profile not found')
      
      return { authUser: user, profile: mapDatabaseUserToProfile(profile) }
    } catch (error: any) {
      console.error('Sign in error:', error)
      return rejectWithValue(error.message || 'Failed to sign in')
    }
  }
)

export const signOutUser = createAsyncThunk(
  'user/signOutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.signOut()
      return null
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to sign out')
    }
  }
)

export const loadCurrentUser = createAsyncThunk(
  'user/loadCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authAPI.getCurrentUser()
      if (!user) return null
      
      // Retry logic for profile fetch in case of 406/auth issues  
      let profile
      let retries = 3
      while (retries > 0) {
        try {
          profile = await userAPI.getProfile(user.id)
          break // Success, exit retry loop
        } catch (error: any) {
          retries--
          if (error.message?.includes('406') || error.message?.includes('Unauthorized')) {
            if (retries > 0) {
              console.log(`Profile fetch failed, retrying... (${retries} attempts left)`)
              await new Promise(resolve => setTimeout(resolve, 200))
              continue
            }
          }
          throw error // Re-throw if not a retry-able error or out of retries
        }
      }
      
      if (!profile) return null
      
      // Update last active time
      try {
        await userAPI.updateLastActive(user.id)
      } catch (error) {
        console.warn('Failed to update last active time:', error)
        // Don't fail the whole operation for this
      }
      
      return { authUser: user, profile: mapDatabaseUserToProfile(profile) }
    } catch (error: any) {
      console.error('Load user error:', error)
      return rejectWithValue(error.message || 'Failed to load user')
    }
  }
)

export const createUserProfile = createAsyncThunk(
  'user/createUserProfile',
  async ({ name, learningSpeed }: { name: string; learningSpeed: 1 | 2 | 3 | 4 | 5 }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState }
      const authUser = state.user.authUser
      
      if (!authUser) throw new Error('No authenticated user')
      
      const profile = state.user.learningProfiles[learningSpeed]
      
      const userProfile = await userAPI.createProfile(authUser.id, {
        email: authUser.email || '',
        name,
        learning_speed: learningSpeed.toString() as '1' | '2' | '3' | '4' | '5',
        avatar: getAvatarForSpeed(learningSpeed),
        preferences: {
          explanationDetail: profile.detail as 'basic' | 'detailed' | 'comprehensive',
          exampleCount: profile.examples,
          repeatCount: profile.repeats
        }
      })
      
      return mapDatabaseUserToProfile(userProfile)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create profile')
    }
  }
)

export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (updates: Partial<DatabaseUser>, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState }
      const currentUser = state.user.currentUser
      
      if (!currentUser) throw new Error('No current user')
      
      const updatedProfile = await userAPI.updateProfile(currentUser.id, updates)
      return mapDatabaseUserToProfile(updatedProfile)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update profile')
    }
  }
)

export const updateUserActivity = createAsyncThunk(
  'user/updateUserActivity',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState }
      const currentUser = state.user.currentUser
      
      if (!currentUser) return null
      
      await userAPI.updateLastActive(currentUser.id)
      return Date.now()
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update activity')
    }
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setAuthUser: (state, action: PayloadAction<any>) => {
      state.authUser = action.payload
      state.isAuthenticated = !!action.payload
    },
    
    hideOnboarding: (state) => {
      state.showOnboarding = false
      localStorage.setItem('scifly_onboarded', 'true')
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    createLocalUser: (state, action: PayloadAction<{ name: string; learningSpeed: 1 | 2 | 3 | 4 | 5 }>) => {
      const userId = `user_${Date.now()}`
      const profile = state.learningProfiles[action.payload.learningSpeed]
      
      const newUser: UserProfile = {
        id: userId,
        name: action.payload.name,
        learningSpeed: action.payload.learningSpeed,
        avatar: getAvatarForSpeed(action.payload.learningSpeed),
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        preferences: {
          explanationDetail: profile.detail as 'basic' | 'detailed' | 'comprehensive',
          exampleCount: profile.examples,
          repeatCount: profile.repeats
        }
      }
      
      state.currentUser = newUser
      state.isOnboarded = true
      state.showOnboarding = false
      localStorage.setItem('scifly_user', JSON.stringify(newUser))
      localStorage.setItem('scifly_onboarded', 'true')
    },
    
    loadLocalUser: (state) => {
      const savedUser = localStorage.getItem('scifly_user')
      const onboarded = localStorage.getItem('scifly_onboarded')
      
      if (savedUser) {
        state.currentUser = JSON.parse(savedUser)
        state.isOnboarded = !!onboarded
        state.showOnboarding = !onboarded
      }
    },
    
    resetUser: (state) => {
      state.currentUser = null
      state.authUser = null
      state.isOnboarded = false
      state.showOnboarding = true
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('scifly_user')
      localStorage.removeItem('scifly_onboarded')
    }
  },
  extraReducers: (builder) => {
    // Sign up user
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.authUser = action.payload.authUser
        state.currentUser = action.payload.profile
        state.isAuthenticated = true
        state.isOnboarded = false
        state.showOnboarding = true
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Sign in user
    builder
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.authUser = action.payload.authUser
        state.currentUser = action.payload.profile
        state.isAuthenticated = true
        state.isOnboarded = true
        state.showOnboarding = false
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Sign out user
    builder
      .addCase(signOutUser.fulfilled, (state) => {
        state.currentUser = null
        state.authUser = null
        state.isAuthenticated = false
        state.isOnboarded = false
        state.showOnboarding = true
        state.error = null
      })

    // Load current user
    builder
      .addCase(loadCurrentUser.pending, (state) => {
        state.isLoading = true
      })
      .addCase(loadCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.authUser = action.payload.authUser
          state.currentUser = action.payload.profile
          state.isAuthenticated = true
          state.isOnboarded = true
          state.showOnboarding = false
        } else {
          // No authenticated user, try loading from localStorage
          const savedUser = localStorage.getItem('scifly_user')
          const onboarded = localStorage.getItem('scifly_onboarded')
          
          if (savedUser) {
            state.currentUser = JSON.parse(savedUser)
            state.isOnboarded = !!onboarded
            state.showOnboarding = !onboarded
            state.isAuthenticated = false // Local user, not database authenticated
          } else {
            state.isAuthenticated = false
            state.showOnboarding = true
          }
        }
      })
      .addCase(loadCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.isAuthenticated = false
        // Try loading from localStorage as fallback
        const savedUser = localStorage.getItem('scifly_user')
        const onboarded = localStorage.getItem('scifly_onboarded')
        
        if (savedUser) {
          state.currentUser = JSON.parse(savedUser)
          state.isOnboarded = !!onboarded
          state.showOnboarding = !onboarded
        }
      })

    // Create user profile
    builder
      .addCase(createUserProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createUserProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.isOnboarded = true
        state.showOnboarding = false
      })
      .addCase(createUserProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Update user profile
    builder
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.currentUser = action.payload
      })

    // Update user activity
    builder
      .addCase(updateUserActivity.fulfilled, (state, action) => {
        if (state.currentUser && action.payload) {
          state.currentUser.lastActiveAt = action.payload
        }
      })
  }
})

function getAvatarForSpeed(speed: number): string {
  const avatars = {
    1: '🐢', // Turtle - slow and steady
    2: '🐨', // Koala - thoughtful
    3: '🦁', // Lion - balanced (our mascot!)
    4: '🐎', // Horse - quick
    5: '🚀'  // Rocket - super fast
  }
  return avatars[speed as keyof typeof avatars] || '🦁'
}

// Setup auth state listener
export const setupAuthListener = () => (dispatch: any) => {
  let isInitialized = false
  
  const { data: { subscription } } = authAPI.onAuthStateChange((event: string, session: any) => {
    const user = session?.user || null
    dispatch(setAuthUser(user))
    
    // Only handle auth state changes after initial load to prevent duplicate calls
    if (isInitialized) {
      if (user && event === 'SIGNED_IN') {
        dispatch(loadCurrentUser())
      } else if (!user && event === 'SIGNED_OUT') {
        dispatch(resetUser())
      }
    }
    
    // Mark as initialized after first event
    if (!isInitialized) {
      isInitialized = true
    }
  })
  
  // Return unsubscribe function
  return () => subscription?.unsubscribe()
}

export const { 
  setAuthUser, 
  hideOnboarding, 
  clearError, 
  createLocalUser, 
  loadLocalUser, 
  resetUser 
} = userSlice.actions

export default userSlice.reducer 