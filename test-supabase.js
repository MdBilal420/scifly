// Test script to verify Supabase database setup
// Run with: node test-supabase.js

const { createClient } = require('@supabase/supabase-js');

// Configuration check
function checkEnvironment() {
  console.log('🔍 Checking environment configuration...\n');
  
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY;
  
  if (!supabaseUrl || supabaseUrl === 'https://your-project-ref.supabase.co') {
    console.log('❌ REACT_APP_SUPABASE_URL not configured');
    console.log('   Please create a .env file with your Supabase project URL\n');
    return false;
  }
  
  if (!supabaseKey || supabaseKey === 'your-anon-key-here') {
    console.log('❌ REACT_APP_SUPABASE_API_KEY not configured');
    console.log('   Please add your Supabase anon key to .env file\n');
    return false;
  }
  
  console.log('✅ Environment variables configured');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);
  
  return { supabaseUrl, supabaseKey };
}

// Test database connection
async function testConnection(supabase) {
  console.log('🔗 Testing database connection...\n');
  
  try {
    const { data, error, count } = await supabase
      .from('topics')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log(`   Found ${count || 0} topics in database\n`);
    return true;
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

// Test database schema
async function testSchema(supabase) {
  console.log('📋 Testing database schema...\n');
  
  const tables = [
    'users', 'topics', 'lessons', 'user_progress', 
    'lesson_progress', 'quiz_questions', 'quiz_attempts',
    'achievements', 'user_achievements', 'chat_messages',
    'user_activities', 'daily_goals'
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table "${table}" not found or accessible`);
        allTablesExist = false;
      } else {
        console.log(`✅ Table "${table}" exists`);
      }
    } catch (error) {
      console.log(`❌ Error checking table "${table}":`, error.message);
      allTablesExist = false;
    }
  }
  
  console.log('');
  return allTablesExist;
}

// Test seed data
async function testSeedData(supabase) {
  console.log('🌱 Testing seed data...\n');
  
  try {
    // Check topics
    const { data: topics, error: topicsError } = await supabase
      .from('topics')
      .select('slug, title');
    
    if (topicsError) {
      console.log('❌ Error fetching topics:', topicsError.message);
      return false;
    }
    
    console.log(`✅ Found ${topics.length} topics:`);
    topics.forEach(topic => {
      console.log(`   - ${topic.title} (${topic.slug})`);
    });
    
    // Check achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('achievement_key, title');
    
    if (achievementsError) {
      console.log('❌ Error fetching achievements:', achievementsError.message);
      return false;
    }
    
    console.log(`\n✅ Found ${achievements.length} achievements:`);
    achievements.forEach(achievement => {
      console.log(`   - ${achievement.title} (${achievement.achievement_key})`);
    });
    
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Error testing seed data:', error.message);
    return false;
  }
}

// Test user operations (create a test user)
async function testUserOperations(supabase) {
  console.log('👤 Testing user operations...\n');
  
  try {
    // Test if we can create a user (this might fail due to auth requirements)
    const testUserData = {
      email: 'test@example.com',
      name: 'Test User',
      learning_speed: '3',
      avatar: '🦁',
      preferences: {
        explanationDetail: 'detailed',
        exampleCount: 2,
        repeatCount: 1
      }
    };
    
    console.log('⚠️  User creation test skipped (requires authentication)');
    console.log('   This is normal - user creation happens through Supabase Auth\n');
    
    return true;
  } catch (error) {
    console.log('❌ Error in user operations test:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('🚀 SciFly Supabase Database Test\n');
  console.log('=' .repeat(50) + '\n');
  
  // Check environment
  const config = checkEnvironment();
  if (!config) {
    console.log('\n📝 Setup Instructions:');
    console.log('1. Create a .env file in your project root');
    console.log('2. Add these lines with your actual Supabase values:');
    console.log('   REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co');
    console.log('   REACT_APP_SUPABASE_API_KEY=your-anon-key-here');
    console.log('3. Get these values from: https://supabase.com/dashboard');
    console.log('   → Your Project → Settings → API\n');
    return;
  }
  
  // Initialize Supabase client
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);
  
  // Run tests
  const connectionOk = await testConnection(supabase);
  if (!connectionOk) {
    console.log('\n❌ Connection failed. Check your Supabase URL and key.\n');
    return;
  }
  
  const schemaOk = await testSchema(supabase);
  const seedDataOk = await testSeedData(supabase);
  const userOpsOk = await testUserOperations(supabase);
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('=' .repeat(30));
  console.log(`Environment: ✅`);
  console.log(`Connection: ${connectionOk ? '✅' : '❌'}`);
  console.log(`Schema: ${schemaOk ? '✅' : '❌'}`);
  console.log(`Seed Data: ${seedDataOk ? '✅' : '❌'}`);
  console.log(`User Operations: ${userOpsOk ? '✅' : '❌'}`);
  
  if (connectionOk && schemaOk && seedDataOk) {
    console.log('\n🎉 Supabase database setup is working correctly!');
    console.log('   You can now integrate it with your SciFly app.\n');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your Supabase setup.');
    console.log('   Ensure you ran the supabase_schema.sql script in your Supabase dashboard.\n');
  }
}

// Handle different environments
if (typeof module !== 'undefined' && module.exports) {
  // Node.js environment
  require('dotenv').config();
  runTests();
} else {
  // Browser environment
  console.log('This script is designed to run in Node.js');
}

module.exports = { runTests }; 