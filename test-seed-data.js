// Test script to verify seed data was added successfully
// Run with: node test-seed-data.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSeedData() {
  console.log('🌱 SciFly Seed Data Verification\n');
  console.log('=' .repeat(50) + '\n');

  try {
    // Test Topics
    console.log('📚 Testing Topics Data...\n');
    
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('difficulty, title');

    if (topicsError) {
      console.log('❌ Failed to fetch topics:', topicsError.message);
      return false;
    }

    console.log(`✅ Found ${topics.length} topics:`);
    
    // Group by difficulty
    const difficulties = { 1: 'Easy', 2: 'Medium', 3: 'Hard' };
    const groupedTopics = topics.reduce((acc, topic) => {
      const level = difficulties[topic.difficulty] || 'Unknown';
      if (!acc[level]) acc[level] = [];
      acc[level].push(topic);
      return acc;
    }, {});

    Object.entries(groupedTopics).forEach(([level, topicList]) => {
      console.log(`\n   ${level} Topics:`);
      topicList.forEach(topic => {
        console.log(`   ${topic.icon} ${topic.title} (${topic.estimated_time_minutes} min)`);
      });
    });

    // Test Achievements
    console.log('\n🏆 Testing Achievements Data...\n');
    
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category, title');

    if (achievementsError) {
      console.log('❌ Failed to fetch achievements:', achievementsError.message);
      return false;
    }

    console.log(`✅ Found ${achievements.length} achievements:`);
    
    // Group by category
    const groupedAchievements = achievements.reduce((acc, achievement) => {
      const category = achievement.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(achievement);
      return acc;
    }, {});

    Object.entries(groupedAchievements).forEach(([category, achievementList]) => {
      console.log(`\n   ${category.charAt(0).toUpperCase() + category.slice(1)} Achievements:`);
      achievementList.forEach(achievement => {
        console.log(`   ${achievement.icon} ${achievement.title} (${achievement.max_progress} ${achievement.max_progress === 1 ? 'step' : 'steps'})`);
      });
    });

    // Test data integrity
    console.log('\n🔍 Testing Data Integrity...\n');
    
    const expectedTopics = [
      'solar-system', 'plants-photosynthesis', 'forces-motion', 'water-cycle',
      'human-body', 'animals-habitats', 'matter-materials', 'earth-surface',
      'light-sound', 'ecosystems'
    ];

    const expectedAchievements = [
      'first_lesson', 'quiz_master', 'curious_mind', 'streak_starter',
      'science_explorer', 'speed_learner', 'perfectionist', 'chat_champion',
      'knowledge_seeker', 'daily_hero'
    ];

    const foundTopicSlugs = topics.map(t => t.slug);
    const foundAchievementKeys = achievements.map(a => a.achievement_key);

    const missingTopics = expectedTopics.filter(slug => !foundTopicSlugs.includes(slug));
    const missingAchievements = expectedAchievements.filter(key => !foundAchievementKeys.includes(key));

    if (missingTopics.length === 0 && missingAchievements.length === 0) {
      console.log('✅ All expected data found!');
    } else {
      if (missingTopics.length > 0) {
        console.log('❌ Missing topics:', missingTopics.join(', '));
      }
      if (missingAchievements.length > 0) {
        console.log('❌ Missing achievements:', missingAchievements.join(', '));
      }
    }

    // Test JSON data
    console.log('\n📋 Testing JSON Data Fields...\n');
    
    const topicsWithValidJson = topics.filter(t => Array.isArray(t.key_learning_points));
    const achievementsWithValidJson = achievements.filter(a => typeof a.unlock_criteria === 'object');

    console.log(`✅ Topics with valid learning points: ${topicsWithValidJson.length}/${topics.length}`);
    console.log(`✅ Achievements with valid criteria: ${achievementsWithValidJson.length}/${achievements.length}`);

    // Summary
    console.log('\n📊 Seed Data Summary:');
    console.log('=' .repeat(30));
    console.log(`Topics: ${topics.length}/10 expected`);
    console.log(`Achievements: ${achievements.length}/10 expected`);
    console.log(`Difficulty levels: ${Object.keys(groupedTopics).length}`);
    console.log(`Achievement categories: ${Object.keys(groupedAchievements).length}`);

    const allGood = topics.length === 10 && 
                   achievements.length === 10 && 
                   missingTopics.length === 0 && 
                   missingAchievements.length === 0;

    if (allGood) {
      console.log('\n🎉 Seed data verification successful!');
      console.log('✨ Your SciFly database is ready for full functionality.');
      console.log('\n🚀 Next steps:');
      console.log('   1. Run the main API test: node test-api.js');
      console.log('   2. Start implementing user authentication');
      console.log('   3. Connect your UI to the database APIs\n');
    } else {
      console.log('\n⚠️  Some seed data may be missing or incomplete.');
      console.log('💡 Try running the seed script again: supabase_seed_data.sql\n');
    }

    return allGood;

  } catch (error) {
    console.log('❌ Seed data verification failed:', error.message);
    return false;
  }
}

// Run the test
testSeedData().catch(error => {
  console.error('💥 Test failed:', error);
  process.exit(1);
}); 