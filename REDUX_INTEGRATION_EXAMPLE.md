# Redux + Supabase Integration Examples

This document shows how to use the updated Redux slices with Supabase database integration in your React components.

## Table of Contents
1. [App Initialization](#app-initialization)  
2. [User Authentication](#user-authentication)
3. [Key Integration Points](#key-integration-points)

## App Initialization

### Setting up the store and auth listener

```tsx
// src/App.tsx
import React, { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from './hooks/redux'
import { setupAuthListener, loadCurrentUser } from './features/user/userSlice'
import { fetchTopics } from './features/topics/topicsSlice'

function App() {
  const dispatch = useAppDispatch()
  const { currentUser, isAuthenticated, isLoading } = useAppSelector(state => state.user)

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = dispatch(setupAuthListener())
    
    // Try to load current user on app start
    dispatch(loadCurrentUser())
    
    // Load topics data
    dispatch(fetchTopics())

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [dispatch])

  if (isLoading) {
    return <div>Loading SciFly...</div>
  }

  return (
    <div className="App">
      {!isAuthenticated ? <AuthScreen /> : <MainApp />}
    </div>
  )
}
```

## User Authentication

### Sign Up Component

```tsx
// src/components/SignUpForm.tsx
import React, { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { signUpUser } from '../features/user/userSlice'

export const SignUpForm: React.FC = () => {
  const dispatch = useAppDispatch()
  const { isLoading, error } = useAppSelector(state => state.user)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    learningSpeed: 3 as 1 | 2 | 3 | 4 | 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(signUpUser(formData)).unwrap()
    } catch (error) {
      console.error('Sign up failed:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        placeholder="Password"
        required
      />
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Your name"
        required
      />
      <select 
        value={formData.learningSpeed}
        onChange={(e) => setFormData({...formData, learningSpeed: parseInt(e.target.value) as 1 | 2 | 3 | 4 | 5})}
      >
        <option value={1}>Careful Explorer</option>
        <option value={2}>Steady Learner</option>
        <option value={3}>Balanced Student</option>
        <option value={4}>Quick Thinker</option>
        <option value={5}>Lightning Fast</option>
      </select>
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

## Key Integration Points

### 1. Authentication Flow
- Use `setupAuthListener()` to monitor auth state changes
- Call `loadCurrentUser()` on app start  
- Use `signUpUser()` and `signInUser()` for authentication

### 2. Data Loading Pattern
- Load data when component mounts and user is authenticated
- Use loading states to show appropriate UI
- Handle errors gracefully with error states

### 3. Real-time Updates
- Local state updates happen immediately for UI responsiveness
- Database updates happen in background
- Use optimistic updates for better UX

This integration provides a seamless transition from localStorage to a full database-backed system.
