-- SciFly Seed Data
-- Copy and paste this entire script into your Supabase SQL Editor and execute it
-- This will populate your database with topics and achievements

-- =============================================
-- INSERT ACHIEVEMENTS DATA
-- =============================================

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
('daily_hero', 'Daily Hero', 'Achieve your daily goal 7 days in a row', '🌟', 'engagement', 7, '{"type": "daily_goals", "count": 7}')
ON CONFLICT (achievement_key) DO NOTHING;

-- =============================================
-- INSERT TOPICS DATA
-- =============================================

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
('ecosystems', 'Ecosystems & Environment', 'Learn how all living things depend on each other!', '🌍', 'teal', 'forest', 3, 16, '["Food webs and energy flow", "Predators and prey", "Environmental protection", "Human impact on nature"]')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- VERIFICATION QUERIES
-- =============================================

-- Check if data was inserted successfully
SELECT 'Achievements inserted:', COUNT(*) as count FROM achievements WHERE is_active = true;
SELECT 'Topics inserted:', COUNT(*) as count FROM topics WHERE is_active = true;

-- Show some sample data
SELECT 'Sample achievements:' as info;
SELECT achievement_key, title, category FROM achievements LIMIT 5;

SELECT 'Sample topics:' as info;
SELECT slug, title, difficulty FROM topics ORDER BY difficulty, title LIMIT 5;

-- Success message
SELECT '🎉 Seed data insertion completed successfully!' as status; 