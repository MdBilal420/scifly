-- Safe Migration: Add Generative UI Support (Step-by-Step)
-- Run this migration in phases if the full migration fails

-- =============================================
-- PHASE 1: Add columns to existing tables
-- =============================================

-- First, add columns to lessons table (these should work independently)
DO $$
BEGIN
    -- Add base_content column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'base_content') THEN
        ALTER TABLE lessons ADD COLUMN base_content JSONB DEFAULT '{}';
    END IF;
    
    -- Add content_metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'content_metadata') THEN
        ALTER TABLE lessons ADD COLUMN content_metadata JSONB DEFAULT '{
          "reading_level": 5,
          "concept_count": 1,
          "interaction_types": [],
          "visual_assets": [],
          "duration_estimate": 600,
          "complexity_score": 3
        }';
    END IF;
    
    -- Add adaptive_variants column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'lessons' AND column_name = 'adaptive_variants') THEN
        ALTER TABLE lessons ADD COLUMN adaptive_variants JSONB DEFAULT '{}';
    END IF;
END $$;

-- Add columns to users table
DO $$
BEGIN
    -- Add speed_adaptation_data column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'speed_adaptation_data') THEN
        ALTER TABLE users ADD COLUMN speed_adaptation_data JSONB DEFAULT '{
          "auto_adjust": true,
          "preferred_modes": ["visual"],
          "adaptation_history": [],
          "performance_by_speed": {},
          "last_speed_change": null,
          "total_adaptations": 0
        }';
    END IF;
END $$;

-- =============================================
-- PHASE 2: Create new tables (no dependencies)
-- =============================================

-- Create content_adaptations table
CREATE TABLE IF NOT EXISTS content_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    adapted_content JSONB NOT NULL,
    adaptation_type TEXT NOT NULL CHECK (adaptation_type IN ('auto', 'manual', 'ai_generated')),
    effectiveness_score FLOAT DEFAULT 0 CHECK (effectiveness_score BETWEEN 0 AND 1),
    usage_count INTEGER DEFAULT 0,
    generation_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_speed_history table
CREATE TABLE IF NOT EXISTS user_speed_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    old_speed INTEGER CHECK (old_speed BETWEEN 1 AND 5),
    new_speed INTEGER NOT NULL CHECK (new_speed BETWEEN 1 AND 5),
    change_reason TEXT NOT NULL CHECK (change_reason IN ('user_choice', 'auto_suggestion', 'performance_based', 'onboarding')),
    performance_data JSONB DEFAULT '{}',
    trigger_metrics JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_speed_performance table
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
    performance_trend TEXT,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create ui_configurations table
CREATE TABLE IF NOT EXISTS ui_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    lesson_type TEXT NOT NULL,
    topic_category TEXT,
    config_data JSONB NOT NULL,
    performance_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create content_generation_queue table
CREATE TABLE IF NOT EXISTS content_generation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL,
    target_speed INTEGER NOT NULL CHECK (target_speed BETWEEN 1 AND 5),
    generation_type TEXT NOT NULL CHECK (generation_type IN ('auto', 'ai_enhanced', 'manual_review')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create user_content_interactions table
CREATE TABLE IF NOT EXISTS user_content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL,
    adaptation_id UUID,
    session_id UUID,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'complete', 'skip', 'pause', 'replay', 'help_request')),
    interaction_data JSONB DEFAULT '{}',
    engagement_score FLOAT CHECK (engagement_score BETWEEN 0 AND 1),
    time_spent_seconds INTEGER DEFAULT 0,
    device_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- PHASE 3: Add constraints and indexes
-- =============================================

-- Add unique constraints
DO $$
BEGIN
    -- Add unique constraint to content_adaptations if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'content_adaptations_lesson_id_user_speed_adaptation_type_key') THEN
        ALTER TABLE content_adaptations ADD CONSTRAINT content_adaptations_lesson_id_user_speed_adaptation_type_key 
        UNIQUE(lesson_id, user_speed, adaptation_type);
    END IF;
    
    -- Add unique constraint to user_speed_performance if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'user_speed_performance_user_id_learning_speed_key') THEN
        ALTER TABLE user_speed_performance ADD CONSTRAINT user_speed_performance_user_id_learning_speed_key 
        UNIQUE(user_id, learning_speed);
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_metadata ON lessons USING GIN (content_metadata);
CREATE INDEX IF NOT EXISTS idx_content_adaptations_lesson_speed ON content_adaptations(lesson_id, user_speed);
CREATE INDEX IF NOT EXISTS idx_content_adaptations_effectiveness ON content_adaptations(effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_lesson_id ON user_content_interactions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_content_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_speed_history_user_id ON user_speed_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_speed_performance_user_id ON user_speed_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_content_gen_queue_status ON content_generation_queue(status);

-- Add conditional indexes (only where values exist)
CREATE INDEX IF NOT EXISTS idx_user_interactions_engagement ON user_content_interactions(engagement_score DESC) 
WHERE engagement_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_content_interactions(session_id) 
WHERE session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_interactions_adaptation ON user_content_interactions(adaptation_id) 
WHERE adaptation_id IS NOT NULL;

-- =============================================
-- PHASE 4: Add foreign key constraints
-- =============================================

-- Add foreign key constraints (only if tables exist)
DO $$
BEGIN
    -- Add foreign key for content_adaptations -> lessons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'content_adaptations_lesson_id_fkey') THEN
            ALTER TABLE content_adaptations ADD CONSTRAINT content_adaptations_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for user_speed_history -> users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'user_speed_history_user_id_fkey') THEN
            ALTER TABLE user_speed_history ADD CONSTRAINT user_speed_history_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for user_speed_performance -> users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'user_speed_performance_user_id_fkey') THEN
            ALTER TABLE user_speed_performance ADD CONSTRAINT user_speed_performance_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for user_content_interactions -> users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'user_content_interactions_user_id_fkey') THEN
            ALTER TABLE user_content_interactions ADD CONSTRAINT user_content_interactions_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for user_content_interactions -> lessons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'user_content_interactions_lesson_id_fkey') THEN
            ALTER TABLE user_content_interactions ADD CONSTRAINT user_content_interactions_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Add foreign key for user_content_interactions -> content_adaptations
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'user_content_interactions_adaptation_id_fkey') THEN
        ALTER TABLE user_content_interactions ADD CONSTRAINT user_content_interactions_adaptation_id_fkey 
        FOREIGN KEY (adaptation_id) REFERENCES content_adaptations(id) ON DELETE SET NULL;
    END IF;
    
    -- Add foreign key for content_generation_queue -> lessons
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lessons') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                       WHERE constraint_name = 'content_generation_queue_lesson_id_fkey') THEN
            ALTER TABLE content_generation_queue ADD CONSTRAINT content_generation_queue_lesson_id_fkey 
            FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- =============================================
-- PHASE 5: Insert default data
-- =============================================

-- Insert default UI configurations
INSERT INTO ui_configurations (user_speed, lesson_type, config_data) VALUES
(1, 'default', '{
    "layout": "single-column-large",
    "fontSize": "large",
    "animations": "slow",
    "colors": "calming",
    "interactions": "simple",
    "navigation": "linear"
}'),
(2, 'default', '{
    "layout": "single-column-large",
    "fontSize": "large", 
    "animations": "standard",
    "colors": "calming",
    "interactions": "moderate",
    "navigation": "guided"
}'),
(3, 'default', '{
    "layout": "balanced-layout",
    "fontSize": "standard",
    "animations": "standard", 
    "colors": "vibrant",
    "interactions": "moderate",
    "navigation": "guided"
}'),
(4, 'default', '{
    "layout": "text-focused",
    "fontSize": "standard",
    "animations": "quick",
    "colors": "professional", 
    "interactions": "complex",
    "navigation": "free"
}'),
(5, 'default', '{
    "layout": "chat-interface",
    "fontSize": "compact",
    "animations": "quick",
    "colors": "professional",
    "interactions": "complex", 
    "navigation": "free"
}')
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully! All tables and constraints have been added safely.';
END $$; 