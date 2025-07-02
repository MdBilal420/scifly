import { createSlice, PayloadAction } from '@reduxjs/toolkit'

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
}

interface UserState {
  currentUser: UserProfile | null
  isOnboarded: boolean
  showOnboarding: boolean
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
  isOnboarded: false,
  showOnboarding: true,
  learningProfiles: {
    1: { name: 'Careful Explorer', detail: 'comprehensive', examples: 3, repeats: 2 },
    2: { name: 'Steady Learner', detail: 'detailed', examples: 2, repeats: 2 },
    3: { name: 'Balanced Student', detail: 'detailed', examples: 2, repeats: 1 },
    4: { name: 'Quick Thinker', detail: 'basic', examples: 1, repeats: 1 },
    5: { name: 'Lightning Fast', detail: 'basic', examples: 1, repeats: 0 }
  }
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    createUser: (state, action: PayloadAction<{ name: string; learningSpeed: 1 | 2 | 3 | 4 | 5 }>) => {
      const { name, learningSpeed } = action.payload
      const profile = state.learningProfiles[learningSpeed]
      
      state.currentUser = {
        id: `user_${Date.now()}`,
        name,
        learningSpeed,
        avatar: getAvatarForSpeed(learningSpeed),
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        preferences: {
          explanationDetail: profile.detail as 'basic' | 'detailed' | 'comprehensive',
          exampleCount: profile.examples,
          repeatCount: profile.repeats
        }
      }
      
      state.isOnboarded = true
      state.showOnboarding = false
      
      // Persist to localStorage
      localStorage.setItem('scifly_user', JSON.stringify(state.currentUser))
      localStorage.setItem('scifly_onboarded', 'true')
    },
    
    loadUser: (state) => {
      const savedUser = localStorage.getItem('scifly_user')
      const onboardedStatus = localStorage.getItem('scifly_onboarded')
      
      if (savedUser && onboardedStatus) {
        state.currentUser = JSON.parse(savedUser)
        state.isOnboarded = true
        state.showOnboarding = false
        
        // Update last active time
        if (state.currentUser) {
          state.currentUser.lastActiveAt = Date.now()
          localStorage.setItem('scifly_user', JSON.stringify(state.currentUser))
        }
      }
    },
    
    updateUserActivity: (state) => {
      if (state.currentUser) {
        state.currentUser.lastActiveAt = Date.now()
        localStorage.setItem('scifly_user', JSON.stringify(state.currentUser))
      }
    },
    
    resetUser: (state) => {
      state.currentUser = null
      state.isOnboarded = false
      state.showOnboarding = true
      localStorage.removeItem('scifly_user')
      localStorage.removeItem('scifly_onboarded')
    },
    
    hideOnboarding: (state) => {
      state.showOnboarding = false
    }
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

export const { createUser, loadUser, updateUserActivity, resetUser, hideOnboarding } = userSlice.actions
export default userSlice.reducer 