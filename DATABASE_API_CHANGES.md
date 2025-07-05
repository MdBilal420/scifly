# Database & API Changes for Generative UI Implementation

## 🎯 **Overview**

This document outlines all database schema changes and API modifications required to support the generative UI approach in SciFly, where learning content adapts dynamically based on user's learning speed (1-5) and associated learning modes.

## 📊 **Database Schema Changes**

### **1. Enhanced Existing Tables**

#### **`lessons` table modifications:**
```sql
-- Add new columns for content adaptation
ALTER TABLE lessons ADD COLUMN base_content JSONB DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN content_metadata JSONB DEFAULT '{
  "reading_level": 5,
  "concept_count": 1,
  "interaction_types": [],
  "visual_assets": [],
  "duration_estimate": 600,
  "complexity_score": 3
}';
ALTER TABLE lessons ADD COLUMN adaptive_variants JSONB DEFAULT '{}';
```

#### **`users` table modifications:**
```sql
-- Add speed adaptation tracking
ALTER TABLE users ADD COLUMN speed_adaptation_data JSONB DEFAULT '{
  "auto_adjust": true,
  "preferred_modes": ["visual"],
  "adaptation_history": [],
  "performance_by_speed": {},
  "last_speed_change": null,
  "total_adaptations": 0
}';
```

### **2. New Tables**

#### **`content_adaptations`** - Store generated content variations
- **Purpose**: Cache content adapted for different speeds/modes
- **Key fields**: `lesson_id`, `user_speed`, `adapted_content`, `effectiveness_score`
- **Performance**: Indexed for fast retrieval by lesson+speed combination

#### **`user_content_interactions`** - Track all user interactions
- **Purpose**: Detailed analytics on user engagement with adaptive content
- **Key fields**: `user_id`, `lesson_id`, `interaction_type`, `engagement_score`, `time_spent_seconds`
- **Analytics**: Powers adaptive recommendations and effectiveness tracking

#### **`ui_configurations`** - Store UI layout configurations
- **Purpose**: Define how interface should adapt for each speed
- **Key fields**: `user_speed`, `lesson_type`, `config_data`
- **Flexibility**: Allows UI customization without code changes

#### **`user_speed_history`** - Track speed changes over time
- **Purpose**: Understand user learning journey and auto-adjustment triggers
- **Key fields**: `user_id`, `old_speed`, `new_speed`, `change_reason`

#### **`user_speed_performance`** - Aggregated performance metrics
- **Purpose**: Quick access to performance data for recommendations
- **Key fields**: `user_id`, `learning_speed`, `avg_engagement_score`, `completion_rate`

#### **`content_generation_queue`** - Async content processing
- **Purpose**: Queue system for AI-generated content adaptations
- **Key fields**: `lesson_id`, `target_speed`, `status`, `priority`

### **3. Analytics Views**

#### **`content_adaptation_analytics`**
- Combines adaptation effectiveness with user interaction data
- Powers content optimization decisions

#### **`user_speed_summary`**
- Consolidated view of user performance across all speeds
- Enables quick performance category classification

### **4. Database Functions**

#### **`calculate_engagement_score()`**
- Standardized engagement scoring based on interaction type and time
- Ensures consistent metrics across the platform

#### **`update_user_speed_performance()`**
- Efficiently updates aggregated performance metrics
- Handles upsert logic for performance tracking

## 🔌 **API Changes**

### **1. New API Endpoints**

#### **Adaptive Content API (`/src/services/adaptiveAPI.ts`)**

**Core Functions:**
- `getAdaptiveLesson(request)` - Get lesson adapted for user's speed
- `trackUserInteraction(interaction)` - Record user interactions
- `getLessonsForSpeed(topicId, speed)` - Get all lessons for a topic adapted to speed
- `suggestOptimalSpeed(userId)` - AI-powered speed recommendations

**Features:**
- Content caching for performance
- Real-time adaptation generation
- Engagement tracking and analytics
- Performance-based recommendations

### **2. Enhanced Existing APIs**

#### **Lessons API modifications:**
```typescript
// Before: Simple lesson retrieval
GET /api/lessons/:id

// After: Adaptive lesson retrieval
GET /api/lessons/:id?userId=:userId&speed=:speed
```

#### **User API modifications:**
```typescript
// New endpoints for speed management
POST /api/users/:id/speed-change
GET /api/users/:id/performance-analysis
GET /api/users/:id/speed-recommendations
```

#### **Analytics API additions:**
```typescript
// New analytics endpoints
GET /api/analytics/content-effectiveness
GET /api/analytics/user-engagement/:userId
GET /api/analytics/speed-performance/:userId
```

## 🔄 **Data Flow Architecture**

### **1. Content Adaptation Flow**
```
User requests lesson
    ↓
Check cached adaptation (content_adaptations)
    ↓
Generate new adaptation if needed (generativeUI.ts)
    ↓
Cache adaptation for future use
    ↓
Return adapted content + UI config
    ↓
Track interaction (user_content_interactions)
```

### **2. Performance Tracking Flow**
```
User completes interaction
    ↓
Calculate engagement score
    ↓
Update aggregated performance (user_speed_performance)
    ↓
Check if speed adjustment needed
    ↓
Suggest optimal speed if applicable
```

## 📈 **Performance Optimizations**

### **1. Database Indexes**
- `idx_content_adaptations_lesson_speed` - Fast adaptation lookup
- `idx_user_interactions_user_id` - User analytics queries
- `idx_lessons_content_metadata` - Content search optimization
- `idx_user_speed_performance_user_id` - Performance data retrieval

### **2. Caching Strategy**
- **Content Adaptations**: Cache generated content to avoid regeneration
- **UI Configurations**: Cache UI layouts for each speed
- **Performance Metrics**: Pre-aggregated data for quick access

### **3. Async Processing**
- **Content Generation Queue**: Generate adaptations in background
- **Analytics Updates**: Process interaction data asynchronously
- **Performance Calculations**: Batch update aggregated metrics

## 🛡️ **Security Considerations**

### **1. Row Level Security (RLS)**
- Users can only access their own interaction data
- Content adaptations are readable by all authenticated users
- Performance data is user-specific

### **2. Data Privacy**
- User interaction data is anonymized for analytics
- Performance metrics are aggregated before sharing
- Speed change history tracks reasons for transparency

## 🚀 **Implementation Priority**

### **Phase 1: Core Infrastructure** (Week 1-2)
1. ✅ Run database migration (`001_add_generative_ui_support.sql`)
2. ✅ Implement adaptive API service (`adaptiveAPI.ts`)
3. ✅ Update existing API endpoints to support speed parameter
4. ✅ Set up basic content adaptation caching

### **Phase 2: Analytics & Tracking** (Week 3-4)
1. Implement interaction tracking system
2. Set up performance aggregation functions
3. Create analytics views and queries
4. Build speed recommendation engine

### **Phase 3: Advanced Features** (Week 5-6)
1. Implement async content generation queue
2. Add AI-powered content adaptation
3. Build comprehensive analytics dashboard
4. Optimize performance with advanced caching

## 📋 **Migration Checklist**

### **Before Frontend Implementation:**
- [ ] ✅ Database migration executed
- [ ] ✅ Adaptive API service created
- [ ] ✅ Basic content adaptation working
- [ ] ✅ UI configuration system ready
- [ ] Interaction tracking implemented
- [ ] Performance aggregation working
- [ ] Speed recommendation system active

### **Post-Migration Validation:**
- [ ] All new tables created successfully
- [ ] Indexes performing as expected
- [ ] RLS policies active and tested
- [ ] API endpoints returning correct data
- [ ] Content adaptation caching working
- [ ] Analytics views providing insights

## 🔧 **Development Tools**

### **Database Management**
- Use Supabase dashboard for table management
- SQL queries for data validation
- Performance monitoring for query optimization

### **API Testing**
- Postman collection for endpoint testing
- Unit tests for adaptation logic
- Integration tests for user flows

### **Monitoring**
- Performance metrics for API response times
- Database query performance monitoring
- User engagement analytics tracking

---

**Status**: ✅ **Database & API architecture complete - Ready for frontend implementation**

**Next Steps**: Begin Phase 1 frontend implementation with confidence that all backend infrastructure is properly designed and ready to support the generative UI approach. 