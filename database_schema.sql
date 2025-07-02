-- SciFly Database Schema for Supabase
-- Run this script in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE learning_speed AS ENUM ('1', '2', '3', '4', '5');
CREATE TYPE sender_type AS ENUM ('user', 'simba');
CREATE TYPE activity_type AS ENUM ('lesson_start', 'lesson_complete', 'quiz_start', 'quiz_complete', 'achievement_unlock', 'chat_message', 'login', 'topic_select');

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    learning_speed learning_speed NOT NULL DEFAULT '3',
    avatar TEXT NOT NULL DEFAULT '🦁',
    preferences JSONB NOT NULL DEFAULT '{
        "explanationDetail": "detailed",
        "exampleCount": 2,
        "repeatCount": 1
    }',
    total_score INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- TOPICS TABLE
-- =============================================
CREATE TABLE topics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    background_theme TEXT NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
    estimated_time_minutes INTEGER NOT NULL,
    key_learning_points JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- LESSONS TABLE
-- =============================================
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    section_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tip TEXT NOT NULL,
    interactive_type TEXT NOT NULL,
    image TEXT NOT NULL,
    learning_speed_target learning_speed NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(topic_id, section_number, learning_speed_target)
);

-- =============================================
-- USER PROGRESS TABLE
-- =============================================
CREATE TABLE user_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    completed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    
    UNIQUE(user_id, topic_id)
);

-- =============================================
-- LESSON PROGRESS TABLE
-- =============================================
CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN NOT NULL DEFAULT false,
    progress_percentage INTEGER NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0,
    
    UNIQUE(user_id, lesson_id)
);

-- =============================================
-- QUIZ QUESTIONS TABLE
-- =============================================
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of 4 options
    correct_answer_index INTEGER NOT NULL CHECK (correct_answer_index BETWEEN 0 AND 3),
    explanation TEXT NOT NULL,
    difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 3),
    learning_speed_target learning_speed NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- QUIZ ATTEMPTS TABLE
-- =============================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    question_ids JSONB NOT NULL, -- Array of question IDs
    user_answers JSONB NOT NULL DEFAULT '{}', -- Object mapping question_id to answer_index
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    time_spent_seconds INTEGER NOT NULL DEFAULT 0
);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    achievement_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL,
    max_progress INTEGER NOT NULL DEFAULT 1,
    unlock_criteria JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- USER ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    current_progress INTEGER NOT NULL DEFAULT 0,
    unlocked BOOLEAN NOT NULL DEFAULT false,
    unlocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- CHAT MESSAGES TABLE
-- =============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    sender sender_type NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- USER ACTIVITIES TABLE
-- =============================================
CREATE TABLE user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type activity_type NOT NULL,
    activity_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- DAILY GOALS TABLE
-- =============================================
CREATE TABLE daily_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL,
    lessons_goal INTEGER NOT NULL DEFAULT 4,
    lessons_completed INTEGER NOT NULL DEFAULT 0,
    goal_achieved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, goal_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_users_learning_speed ON users(learning_speed);

-- Topics indexes
CREATE INDEX idx_topics_slug ON topics(slug);
CREATE INDEX idx_topics_difficulty ON topics(difficulty);
CREATE INDEX idx_topics_is_active ON topics(is_active);

-- Lessons indexes
CREATE INDEX idx_lessons_topic_id ON lessons(topic_id);
CREATE INDEX idx_lessons_learning_speed ON lessons(learning_speed_target);

-- User progress indexes
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_topic_id ON user_progress(topic_id);
CREATE INDEX idx_user_progress_completed ON user_progress(completed);
CREATE INDEX idx_user_progress_last_accessed ON user_progress(last_accessed_at);

-- Lesson progress indexes
CREATE INDEX idx_lesson_progress_user_id ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);

-- Quiz questions indexes
CREATE INDEX idx_quiz_questions_topic_id ON quiz_questions(topic_id);
CREATE INDEX idx_quiz_questions_learning_speed ON quiz_questions(learning_speed_target);

-- Quiz attempts indexes
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_quiz_attempts_topic_id ON quiz_attempts(topic_id);
CREATE INDEX idx_quiz_attempts_completed ON quiz_attempts(completed);

-- User achievements indexes
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked ON user_achievements(unlocked);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_topic_id ON chat_messages(topic_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- User activities indexes
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_type ON user_activities(activity_type);
CREATE INDEX idx_user_activities_created_at ON user_activities(created_at);

-- Daily goals indexes
CREATE INDEX idx_daily_goals_user_id ON daily_goals(user_id);
CREATE INDEX idx_daily_goals_date ON daily_goals(goal_date);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables that need updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Topics policies (public read)
CREATE POLICY "Topics are viewable by authenticated users" ON topics
    FOR SELECT TO authenticated USING (is_active = true);

-- Lessons policies (public read)
CREATE POLICY "Lessons are viewable by authenticated users" ON lessons
    FOR SELECT TO authenticated USING (true);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Lesson progress policies
CREATE POLICY "Users can view own lesson progress" ON lesson_progress
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Quiz questions policies (public read)
CREATE POLICY "Quiz questions are viewable by authenticated users" ON quiz_questions
    FOR SELECT TO authenticated USING (true);

-- Quiz attempts policies
CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Achievements policies (public read)
CREATE POLICY "Achievements are viewable by authenticated users" ON achievements
    FOR SELECT TO authenticated USING (is_active = true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR ALL USING (auth.uid()::text = user_id::text);

-- User activities policies
CREATE POLICY "Users can view own activities" ON user_activities
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Daily goals policies
CREATE POLICY "Users can view own daily goals" ON daily_goals
    FOR ALL USING (auth.uid()::text = user_id::text);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert achievements
INSERT INTO achievements (achievement_key, title, description, icon, category, max_progress, unlock_criteria) VALUES
('first_lesson', 'First Steps', 'Complete your first lesson', '🎯', 'learning', 1, '{"type": "lesson_complete", "count": 1}'),
('quiz_master', 'Quiz Master', 'Get 100% on a quiz', '🏆', 'quiz', 1, '{"type": "quiz_perfect", "count": 1}'),
('curious_mind', 'Curious Mind', 'Ask Simba 10 questions', '🤔', 'chat', 10, '{"type": "chat_message", "count": 10}'),
('streak_starter', 'Streak Starter', 'Learn for 3 days in a row', '🔥', 'engagement', 3, '{"type": "daily_streak", "count": 3}'),
('science_explorer', 'Science Explorer', 'Complete 5 different lessons', '🔬', 'learning', 5, '{"type": "topics_complete", "count": 5}'),
('speed_learner', 'Speed Learner', 'Complete a lesson in under 5 minutes', '⚡', 'performance', 1, '{"type": "lesson_speed", "time": 300}'),
('perfectionist', 'Perfectionist', 'Get 100% on 5 quizzes', '💎', 'quiz', 5, '{"type": "quiz_perfect", "count": 5}'),
('chat_champion', 'Chat Champion', 'Have 50 conversations with Simba', '💬', 'chat', 50, '{"type": "chat_message", "count": 50}'),
('knowledge_seeker', 'Knowledge Seeker', 'Complete all available topics', '📚', 'learning', 10, '{"type": "all_topics_complete", "count": 1}'),
('daily_hero', 'Daily Hero', 'Achieve your daily goal 7 days in a row', '🌟', 'engagement', 7, '{"type": "daily_goals", "count": 7}');

-- Insert sample topics
INSERT INTO topics (slug, title, description, icon, color, background_theme, difficulty, estimated_time_minutes, key_learning_points) VALUES
('solar-system', 'Solar System & Space', 'Explore planets, stars, and the mysteries of our solar system!', '🪐', 'purple', 'space', 2, 15, '["Learn about the 8 planets", "Understand the Sun and Moon", "Discover asteroids and comets", "Explore space exploration"]'),
('plants-photosynthesis', 'Plants & Photosynthesis', 'Discover how plants make their own food and help our planet!', '🌱', 'green', 'forest', 2, 12, '["How plants make food from sunlight", "Parts of a plant and their functions", "Why plants are important for Earth", "Different types of plants"]'),
('forces-motion', 'Forces & Motion', 'Learn about gravity, friction, and how things move!', '⚡', 'blue', 'laboratory', 2, 10, '["Understanding gravity and weight", "Friction and its effects", "Simple machines and levers", "Motion and speed"]'),
('water-cycle', 'Water Cycle & Weather', 'Follow water''s amazing journey through Earth''s atmosphere!', '🌧️', 'cyan', 'weather', 1, 8, '["Evaporation and condensation", "How clouds form", "Different types of weather", "Water conservation"]'),
('human-body', 'Human Body Systems', 'Explore the amazing systems that keep you healthy and strong!', '🫀', 'red', 'human-body', 3, 18, '["Circulatory and respiratory systems", "Digestive system and nutrition", "Skeletal and muscular systems", "How to stay healthy"]'),
('animals-habitats', 'Animals & Habitats', 'Meet amazing animals and discover where they live!', '🦁', 'orange', 'forest', 1, 10, '["Different animal habitats", "How animals adapt to their environment", "Food chains and ecosystems", "Protecting wildlife"]'),
('matter-materials', 'Matter & Materials', 'Discover the building blocks of everything around us!', '🧪', 'indigo', 'laboratory', 2, 14, '["Solids, liquids, and gases", "Properties of materials", "Changes in matter", "Mixing and separating materials"]'),
('earth-surface', 'Earth''s Surface', 'Explore mountains, valleys, and how Earth''s surface changes!', '🏔️', 'brown', 'earth', 2, 12, '["Landforms and their formation", "Rocks and minerals", "Erosion and weathering", "Earthquakes and volcanoes"]'),
('light-sound', 'Light & Sound', 'Discover how we see and hear the world around us!', '🔆', 'yellow', 'laboratory', 2, 11, '["How light travels and reflects", "Colors and the rainbow", "How sound is made and travels", "Using light and sound in technology"]'),
('ecosystems', 'Ecosystems & Environment', 'Learn how all living things depend on each other!', '🌍', 'teal', 'forest', 3, 16, '["Food webs and energy flow", "Predators and prey", "Environmental protection", "Human impact on nature"]');

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- User dashboard view
CREATE VIEW user_dashboard AS
SELECT 
    u.id,
    u.name,
    u.learning_speed,
    u.avatar,
    u.total_score,
    u.current_streak,
    u.longest_streak,
    COUNT(DISTINCT up.topic_id) FILTER (WHERE up.completed = true) as topics_completed,
    COUNT(DISTINCT qa.id) FILTER (WHERE qa.completed = true) as quizzes_completed,
    COUNT(DISTINCT ua.id) FILTER (WHERE ua.unlocked = true) as achievements_unlocked,
    AVG(qa.score::decimal / qa.total_questions * 100) FILTER (WHERE qa.completed = true) as average_quiz_score
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id
LEFT JOIN quiz_attempts qa ON u.id = qa.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.name, u.learning_speed, u.avatar, u.total_score, u.current_streak, u.longest_streak;

-- Topic progress view
CREATE VIEW topic_progress_summary AS
SELECT 
    t.id as topic_id,
    t.title,
    t.icon,
    t.difficulty,
    COUNT(DISTINCT up.user_id) as users_started,
    COUNT(DISTINCT up.user_id) FILTER (WHERE up.completed = true) as users_completed,
    AVG(up.progress_percentage) as avg_progress,
    AVG(up.time_spent_seconds) as avg_time_spent
FROM topics t
LEFT JOIN user_progress up ON t.id = up.topic_id
WHERE t.is_active = true
GROUP BY t.id, t.title, t.icon, t.difficulty;

-- Recent activity view
CREATE VIEW recent_user_activity AS
SELECT 
    ua.user_id,
    u.name,
    ua.activity_type,
    ua.activity_data,
    ua.created_at
FROM user_activities ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Add a comment to indicate successful completion
COMMENT ON SCHEMA public IS 'SciFly database schema created successfully. Ready for user authentication and data management.'; 