# Redux Integration Guide

## Overview

This guide shows how to integrate your new Supabase APIs with the existing Redux slices in SciFly. We'll maintain backward compatibility while adding database functionality.

## 🔄 Integration Strategy

### Phase 1: Dual Mode (Current + Database)
- Keep existing localStorage functionality
- Add database operations alongside
- Gradual migration without breaking changes

### Phase 2: Database Primary
- Replace localStorage with database calls
- Keep localStorage as backup/offline cache
- Full user authentication integration

## 📝 Step-by-Step Integration

### 1. Update User Slice

```typescript
// src/features/user/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, userAPI } from '../../services/api'

// Async thunks for database operations
export const signUpUser = createAsyncThunk(
  'user/signUp',
  async (userData: {
    email: string
    password: string
    name: string
    learningSpeed: string
    avatar: string
  }) => {
    const authResult = await authAPI.signUp(userData.email, userData.password, {
      name: userData.name,
      learning_speed: userData.learningSpeed as any,
      avatar: userData.avatar
    })
    
    if (authResult.user) {
      const profile = await userAPI.createProfile(authResult.user.id, {
        email: userData.email,
        name: userData.name,
        learning_speed: userData.learningSpeed as any,
        avatar: userData.avatar
      })
      return profile
    }
    
    throw new Error('Failed to create user')
  }
)

export const signInUser = createAsyncThunk(
  'user/signIn',
  async (credentials: { email: string; password: string }) => {
    const authResult = await authAPI.signIn(credentials.email, credentials.password)
    
    if (authResult.user) {
      const profile = await userAPI.getProfile(authResult.user.id)
      return profile
    }
    
    throw new Error('Failed to sign in')
  }
)
```

### 2. Update Topics Slice

```typescript
// src/features/topics/topicsSlice.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { topicsAPI, progressAPI } from '../../services/api'

// Load topics from database
export const loadTopicsFromDB = createAsyncThunk(
  'topics/loadFromDB',
  async () => {
    return await topicsAPI.getAllTopics()
  }
)

// Update progress in database
export const updateTopicProgressDB = createAsyncThunk(
  'topics/updateProgressDB',
  async ({ userId, topicId, progress }: { 
    userId: string; 
    topicId: string; 
    progress: number 
  }) => {
    return await progressAPI.updateProgress(userId, topicId, {
      progress_percentage: progress,
      completed: progress >= 100
    })
  }
)
```

### 3. Component Integration

```typescript
// In your components
import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { loadTopicsFromDB } from '../features/topics/topicsSlice'

function HomeScreen() {
  const dispatch = useDispatch()
  const { isAuthenticated, userId } = useSelector(state => state.user)
  
  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(loadTopicsFromDB())
    }
  }, [isAuthenticated, userId, dispatch])
  
  return (
    // Your JSX here
  )
}
```

## 🚀 Next Steps

1. **Add Seed Data**: Insert topics and achievements in Supabase
2. **Implement Authentication UI**: Sign up/sign in forms
3. **Migrate Features**: One Redux slice at a time
4. **Test Integration**: Ensure data flows correctly

Your API foundation is ready! 🎉 