# SciFly Supabase Database Setup Guide

## Overview

This guide explains the database schema design for SciFly's user-based personalized learning system. The schema supports multiple users, progress tracking, achievements, chat history, and analytics.

## Database Tables to Create

### Core User Management
1. **`users`** - User profiles with learning preferences
2. **`user_activities`** - Activity tracking (logins, interactions, etc.)
3. **`daily_goals`** - Daily learning goals and progress

### Content Management
4. **`topics`** - Science topics (replaces static data)
5. **`lessons`** - Generated lesson content per topic/learning speed
6. **`quiz_questions`** - Quiz questions per topic/learning speed

### Progress Tracking
7. **`user_progress`** - Overall topic progress per user
8. **`lesson_progress`** - Individual lesson completion
9. **`quiz_attempts`** - Quiz results and scores

### Gamification
10. **`achievements`** - Available achievements
11. **`user_achievements`** - User-specific achievement progress

### Communication
12. **`chat_messages`** - Chat history with Simba

## Key Database Features

### 🔒 Security Features
- **Row Level Security (RLS)** on all tables
- Users can only access their own data
- Public read access for topics, lessons, achievements
- Secure authentication with Supabase Auth

### ⚡ Performance Optimizations
- Strategic indexes on frequently queried columns
- Composite indexes for complex queries
- Materialized views for dashboard data

### 🎯 User Personalization
- Learning speed enum (1-5) with targeted content
- JSONB preferences for flexible user settings
- Activity tracking for behavior analysis

### 📊 Analytics & Insights
- User engagement metrics
- Learning progress analytics
- Achievement unlock patterns
- Time-based learning statistics

## Setup Instructions

### 1. Create Supabase Project
```bash
# Visit https://supabase.com and create a new project
# Note your project URL and anon key
```

### 2. Run Schema Script
```sql
-- Copy and paste the entire supabase_schema.sql file
-- into your Supabase SQL Editor and execute
```

### 3. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 4. Configure Environment Variables
```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_API_KEY=your_anon_key
```

## Database Schema Relationships

```
users (1) ←→ (many) user_progress
users (1) ←→ (many) lesson_progress  
users (1) ←→ (many) quiz_attempts
users (1) ←→ (many) user_achievements
users (1) ←→ (many) chat_messages
users (1) ←→ (many) user_activities
users (1) ←→ (many) daily_goals

topics (1) ←→ (many) lessons
topics (1) ←→ (many) quiz_questions
topics (1) ←→ (many) user_progress
topics (1) ←→ (many) quiz_attempts

achievements (1) ←→ (many) user_achievements
lessons (1) ←→ (many) lesson_progress
```

## Migration Strategy from Local Storage

### Phase 1: Dual Mode (Recommended)
1. Keep existing Redux state for immediate functionality
2. Add Supabase client configuration
3. Create sync functions that save to both localStorage and Supabase
4. Test with new user registrations

### Phase 2: Database Integration
1. Replace user creation with Supabase Auth
2. Migrate progress tracking to database
3. Replace chat history with database storage
4. Update achievement system

### Phase 3: Complete Migration
1. Remove localStorage dependencies
2. Implement offline-first with sync
3. Add advanced analytics
4. Scale for multiple users

## Required Environment Setup

### 1. Supabase Configuration File
Create `src/config/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_API_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 2. Database Types
Generate TypeScript types:
```bash
npx supabase gen types typescript --project-id your_project_id > src/types/database.ts
```

### 3. Authentication Integration
```typescript
// Replace current user system with Supabase Auth
import { supabase } from '../config/supabase'

// Sign up
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      name: userName,
      learning_speed: selectedSpeed,
      avatar: avatarForSpeed(selectedSpeed)
    }
  }
})
```

## Benefits of This Database Design

### 🚀 Scalability
- Supports unlimited users
- Horizontal scaling with Supabase
- Efficient queries with proper indexing

### 🎮 Enhanced Gamification
- Real-time achievement tracking
- Leaderboards and social features
- Personalized learning paths

### 📈 Advanced Analytics
- User engagement metrics
- Learning effectiveness tracking
- A/B testing capabilities

### 🔄 Real-time Features
- Live progress updates
- Collaborative learning
- Real-time chat with Simba

### 💾 Data Persistence
- No data loss on browser clear
- Cross-device synchronization
- Backup and recovery

## Next Steps

1. **Run the SQL schema** in your Supabase project
2. **Install dependencies** and configure environment
3. **Implement authentication** with Supabase Auth
4. **Migrate user profiles** from localStorage
5. **Add progress tracking** to database
6. **Test thoroughly** with multiple users

## Support & Maintenance

### Regular Tasks
- Monitor user activity and engagement
- Analyze learning patterns for content optimization
- Update achievement criteria based on user behavior
- Backup critical data regularly

### Performance Monitoring
- Query performance analysis
- Index optimization
- Database size management
- User experience metrics

This schema provides a solid foundation for SciFly's growth from a single-user app to a multi-user educational platform with advanced personalization and analytics capabilities. 