-- Minimal Migration: Essential Tables Only
-- This migration adds only the core tables needed for generative UI

-- =============================================
-- 1. Add basic columns to existing tables
-- =============================================

-- Add columns to lessons table
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS base_content JSONB DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_metadata JSONB DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS adaptive_variants JSONB DEFAULT '{}';

-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS speed_adaptation_data JSONB DEFAULT '{}';

-- =============================================
-- 2. Create essential new tables
-- =============================================

-- Content adaptations table (core functionality)
CREATE TABLE IF NOT EXISTS content_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    adapted_content JSONB NOT NULL,
    adaptation_type TEXT NOT NULL DEFAULT 'auto',
    effectiveness_score FLOAT DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User interactions table (analytics)
CREATE TABLE IF NOT EXISTS user_content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    adaptation_id UUID,
    session_id UUID,
    interaction_type TEXT NOT NULL DEFAULT 'view',
    interaction_data JSONB DEFAULT '{}',
    engagement_score FLOAT,
    time_spent_seconds INTEGER DEFAULT 0,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- UI configurations table
CREATE TABLE IF NOT EXISTS ui_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    lesson_type TEXT NOT NULL DEFAULT 'default',
    config_data JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- User speed performance table
CREATE TABLE IF NOT EXISTS user_speed_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    learning_speed INTEGER NOT NULL CHECK (learning_speed BETWEEN 1 AND 5),
    total_lessons INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    avg_engagement_score FLOAT DEFAULT 0,
    avg_completion_time INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    last_lesson_date TIMESTAMP WITH TIME ZONE,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. Add basic indexes
-- =============================================

-- Indexes for content_adaptations
CREATE INDEX IF NOT EXISTS idx_content_adaptations_lesson_speed 
ON content_adaptations(lesson_id, user_speed);

-- Indexes for user_content_interactions
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id 
ON user_content_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_lesson_id 
ON user_content_interactions(lesson_id);

-- Indexes for ui_configurations
CREATE INDEX IF NOT EXISTS idx_ui_configs_speed_type 
ON ui_configurations(user_speed, lesson_type);

-- Indexes for user_speed_performance
CREATE INDEX IF NOT EXISTS idx_user_speed_performance_user_id 
ON user_speed_performance(user_id);

-- =============================================
-- 4. Insert default UI configurations
-- =============================================

INSERT INTO ui_configurations (user_speed, lesson_type, config_data) VALUES
(1, 'default', '{"layout": "single-column-large", "fontSize": "large", "animations": "slow"}'),
(2, 'default', '{"layout": "single-column-large", "fontSize": "large", "animations": "standard"}'),
(3, 'default', '{"layout": "balanced-layout", "fontSize": "standard", "animations": "standard"}'),
(4, 'default', '{"layout": "text-focused", "fontSize": "standard", "animations": "quick"}'),
(5, 'default', '{"layout": "chat-interface", "fontSize": "compact", "animations": "quick"}')
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Minimal migration completed successfully!' as status; 