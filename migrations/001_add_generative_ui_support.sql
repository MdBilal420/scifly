-- Migration: Add Generative UI Support
-- This migration adds the necessary database changes to support adaptive content generation

-- =============================================
-- 1. Enhance existing lessons table
-- =============================================

-- Add columns for base content and metadata
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS base_content JSONB DEFAULT '{}';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_metadata JSONB DEFAULT '{
  "reading_level": 5,
  "concept_count": 1,
  "interaction_types": [],
  "visual_assets": [],
  "duration_estimate": 600,
  "complexity_score": 3
}';
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS adaptive_variants JSONB DEFAULT '{}';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_lessons_content_metadata ON lessons USING GIN (content_metadata);

-- =============================================
-- 2. Content adaptations table
-- =============================================

CREATE TABLE IF NOT EXISTS content_adaptations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    adapted_content JSONB NOT NULL,
    adaptation_type TEXT NOT NULL CHECK (adaptation_type IN ('auto', 'manual', 'ai_generated')),
    effectiveness_score FLOAT DEFAULT 0 CHECK (effectiveness_score BETWEEN 0 AND 1),
    usage_count INTEGER DEFAULT 0,
    generation_metadata JSONB DEFAULT '{}', -- Track how content was generated
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Ensure unique adaptations per lesson-speed combination for auto type
    UNIQUE(lesson_id, user_speed, adaptation_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_adaptations_lesson_speed ON content_adaptations(lesson_id, user_speed);
CREATE INDEX IF NOT EXISTS idx_content_adaptations_effectiveness ON content_adaptations(effectiveness_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_adaptations_usage ON content_adaptations(usage_count DESC);

-- =============================================
-- 3. User content interactions table
-- =============================================

CREATE TABLE IF NOT EXISTS user_content_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    adaptation_id UUID REFERENCES content_adaptations(id) ON DELETE SET NULL,
    session_id UUID, -- Track learning sessions
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'click', 'complete', 'skip', 'pause', 'replay', 'help_request')),
    interaction_data JSONB DEFAULT '{}',
    engagement_score FLOAT CHECK (engagement_score BETWEEN 0 AND 1),
    time_spent_seconds INTEGER DEFAULT 0,
    device_type TEXT, -- mobile, tablet, desktop
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries (created after table is confirmed to exist)
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_content_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_lesson_id ON user_content_interactions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON user_content_interactions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_interactions_engagement ON user_content_interactions(engagement_score DESC) WHERE engagement_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_interactions_session ON user_content_interactions(session_id) WHERE session_id IS NOT NULL;

-- =============================================
-- 4. UI configurations table
-- =============================================

CREATE TABLE IF NOT EXISTS ui_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_speed INTEGER NOT NULL CHECK (user_speed BETWEEN 1 AND 5),
    lesson_type TEXT NOT NULL, -- 'visual', 'text', 'interactive', etc.
    topic_category TEXT, -- 'science', 'math', etc.
    config_data JSONB NOT NULL,
    performance_metrics JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ui_configs_speed_type ON ui_configurations(user_speed, lesson_type);
CREATE INDEX IF NOT EXISTS idx_ui_configs_performance ON ui_configurations USING GIN (performance_metrics);

-- =============================================
-- 5. Enhanced user preferences and tracking
-- =============================================

-- Add speed adaptation data to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS speed_adaptation_data JSONB DEFAULT '{
  "auto_adjust": true,
  "preferred_modes": ["visual"],
  "adaptation_history": [],
  "performance_by_speed": {},
  "last_speed_change": null,
  "total_adaptations": 0
}';

-- Create speed history tracking table
CREATE TABLE IF NOT EXISTS user_speed_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    old_speed INTEGER CHECK (old_speed BETWEEN 1 AND 5),
    new_speed INTEGER NOT NULL CHECK (new_speed BETWEEN 1 AND 5),
    change_reason TEXT NOT NULL CHECK (change_reason IN ('user_choice', 'auto_suggestion', 'performance_based', 'onboarding')),
    performance_data JSONB DEFAULT '{}',
    trigger_metrics JSONB DEFAULT '{}', -- What metrics triggered the change
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_speed_history_user_id ON user_speed_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_speed_history_created_at ON user_speed_history(created_at);

-- =============================================
-- 6. Learning analytics tables
-- =============================================

-- Aggregated performance metrics by user and speed
CREATE TABLE IF NOT EXISTS user_speed_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    learning_speed INTEGER NOT NULL CHECK (learning_speed BETWEEN 1 AND 5),
    total_lessons INTEGER DEFAULT 0,
    completed_lessons INTEGER DEFAULT 0,
    avg_engagement_score FLOAT DEFAULT 0,
    avg_completion_time INTEGER DEFAULT 0,
    total_time_spent INTEGER DEFAULT 0,
    last_lesson_date TIMESTAMP WITH TIME ZONE,
    performance_trend TEXT, -- 'improving', 'declining', 'stable'
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(user_id, learning_speed)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_speed_performance_user_id ON user_speed_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_speed_performance_speed ON user_speed_performance(learning_speed);

-- =============================================
-- 7. Content generation queue (for async processing)
-- =============================================

CREATE TABLE IF NOT EXISTS content_generation_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    target_speed INTEGER NOT NULL CHECK (target_speed BETWEEN 1 AND 5),
    generation_type TEXT NOT NULL CHECK (generation_type IN ('auto', 'ai_enhanced', 'manual_review')),
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    processing_started_at TIMESTAMP WITH TIME ZONE,
    processing_completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_gen_queue_status ON content_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_content_gen_queue_priority ON content_generation_queue(priority DESC);

-- =============================================
-- 8. Triggers for updated_at timestamps
-- =============================================

-- Trigger for content_adaptations
CREATE TRIGGER update_content_adaptations_updated_at 
    BEFORE UPDATE ON content_adaptations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for ui_configurations
CREATE TRIGGER update_ui_configurations_updated_at 
    BEFORE UPDATE ON ui_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. Views for analytics
-- =============================================

-- View: Content adaptation effectiveness
CREATE OR REPLACE VIEW content_adaptation_analytics AS
SELECT 
    ca.lesson_id,
    ca.user_speed,
    ca.adaptation_type,
    ca.effectiveness_score,
    ca.usage_count,
    COUNT(uci.id) as total_interactions,
    AVG(uci.engagement_score) as avg_engagement,
    AVG(uci.time_spent_seconds) as avg_time_spent,
    l.title as lesson_title,
    t.title as topic_title
FROM content_adaptations ca
LEFT JOIN user_content_interactions uci ON ca.id = uci.adaptation_id
LEFT JOIN lessons l ON ca.lesson_id = l.id
LEFT JOIN topics t ON l.topic_id = t.id
GROUP BY ca.id, ca.lesson_id, ca.user_speed, ca.adaptation_type, 
         ca.effectiveness_score, ca.usage_count, l.title, t.title;

-- View: User speed performance summary
CREATE OR REPLACE VIEW user_speed_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.learning_speed as current_speed,
    usp.learning_speed as performance_speed,
    usp.completed_lessons,
    usp.avg_engagement_score,
    usp.avg_completion_time,
    usp.performance_trend,
    CASE 
        WHEN usp.avg_engagement_score > 0.8 THEN 'excellent'
        WHEN usp.avg_engagement_score > 0.6 THEN 'good'
        WHEN usp.avg_engagement_score > 0.4 THEN 'average'
        ELSE 'needs_attention'
    END as performance_category
FROM users u
LEFT JOIN user_speed_performance usp ON u.id = usp.user_id AND u.learning_speed = usp.learning_speed;

-- =============================================
-- 10. Row Level Security (RLS) policies
-- =============================================

-- Enable RLS on new tables
ALTER TABLE content_adaptations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_content_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ui_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_speed_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_speed_performance ENABLE ROW LEVEL SECURITY;

-- Policies for content_adaptations (public read, admin write)
CREATE POLICY "content_adaptations_read" ON content_adaptations
    FOR SELECT TO authenticated USING (true);

-- Policies for user_content_interactions (user owns their data)
CREATE POLICY "user_interactions_own_data" ON user_content_interactions
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Policies for user_speed_history (user owns their data)
CREATE POLICY "user_speed_history_own_data" ON user_speed_history
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Policies for user_speed_performance (user owns their data)
CREATE POLICY "user_speed_performance_own_data" ON user_speed_performance
    FOR ALL USING (auth.uid()::text = user_id::text);

-- =============================================
-- 11. Functions for common operations
-- =============================================

-- Function to calculate engagement score
CREATE OR REPLACE FUNCTION calculate_engagement_score(
    interaction_type TEXT,
    time_spent_seconds INTEGER,
    expected_time_seconds INTEGER DEFAULT 300
) RETURNS FLOAT AS $$
BEGIN
    CASE interaction_type
        WHEN 'complete' THEN
            -- Higher score for completing in reasonable time
            RETURN GREATEST(0, LEAST(1, 1.0 - ABS(time_spent_seconds - expected_time_seconds)::FLOAT / expected_time_seconds));
        WHEN 'skip' THEN
            RETURN 0.1;
        WHEN 'help_request' THEN
            RETURN 0.5;
        WHEN 'pause' THEN
            RETURN 0.3;
        WHEN 'replay' THEN
            RETURN 0.7;
        ELSE
            -- For view, click, etc.
            RETURN LEAST(1, time_spent_seconds::FLOAT / expected_time_seconds);
    END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update user speed performance
CREATE OR REPLACE FUNCTION update_user_speed_performance(
    p_user_id UUID,
    p_learning_speed INTEGER,
    p_engagement_score FLOAT,
    p_completion_time INTEGER
) RETURNS VOID AS $$
BEGIN
    INSERT INTO user_speed_performance (
        user_id, 
        learning_speed, 
        total_lessons, 
        completed_lessons,
        avg_engagement_score,
        avg_completion_time,
        total_time_spent,
        last_lesson_date
    ) VALUES (
        p_user_id,
        p_learning_speed,
        1,
        CASE WHEN p_engagement_score > 0.7 THEN 1 ELSE 0 END,
        p_engagement_score,
        p_completion_time,
        p_completion_time,
        NOW()
    )
    ON CONFLICT (user_id, learning_speed) DO UPDATE SET
        total_lessons = user_speed_performance.total_lessons + 1,
        completed_lessons = CASE 
            WHEN p_engagement_score > 0.7 
            THEN user_speed_performance.completed_lessons + 1 
            ELSE user_speed_performance.completed_lessons 
        END,
        avg_engagement_score = (
            user_speed_performance.avg_engagement_score * user_speed_performance.total_lessons + p_engagement_score
        ) / (user_speed_performance.total_lessons + 1),
        avg_completion_time = (
            user_speed_performance.avg_completion_time * user_speed_performance.total_lessons + p_completion_time
        ) / (user_speed_performance.total_lessons + 1),
        total_time_spent = user_speed_performance.total_time_spent + p_completion_time,
        last_lesson_date = NOW(),
        calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 12. Initial data for UI configurations
-- =============================================

-- Insert default UI configurations for each speed
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

-- =============================================
-- Migration complete
-- =============================================

COMMENT ON SCHEMA public IS 'SciFly database with generative UI support - Migration 001 completed'; 