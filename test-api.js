// Test script for SciFly API integration
// Run with: node test-api.js

require('dotenv').config();

// Import our API (using require for Node.js compatibility)
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// API TEST FUNCTIONS
// ==========================================

async function testTopicsAPI() {
  console.log('🔍 Testing Topics API...\n');
  
  try {
    // Test: Get all topics
    const { data: topics, error } = await supabase
      .from('topics')
      .select('*')
      .eq('is_active', true)
      .order('difficulty', { ascending: true });
    
    if (error) {
      console.log('❌ Failed to fetch topics:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${topics.length} topics:`);
    topics.slice(0, 3).forEach(topic => {
      console.log(`   - ${topic.title} (${topic.slug}) - Difficulty: ${topic.difficulty}`);
    });
    
    if (topics.length > 3) {
      console.log(`   ... and ${topics.length - 3} more topics`);
    }
    
    // Test: Get topic by slug
    if (topics.length > 0) {
      const firstTopic = topics[0];
      const { data: topicBySlug, error: slugError } = await supabase
        .from('topics')
        .select('*')
        .eq('slug', firstTopic.slug)
        .single();
      
      if (slugError) {
        console.log('❌ Failed to fetch topic by slug:', slugError.message);
        return false;
      }
      
      console.log(`✅ Successfully fetched topic by slug: ${topicBySlug.title}`);
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Topics API test failed:', error.message);
    return false;
  }
}

async function testAchievementsAPI() {
  console.log('🏆 Testing Achievements API...\n');
  
  try {
    // Test: Get all achievements
    const { data: achievements, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('category', { ascending: true });
    
    if (error) {
      console.log('❌ Failed to fetch achievements:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${achievements.length} achievements:`);
    achievements.slice(0, 3).forEach(achievement => {
      console.log(`   - ${achievement.title} (${achievement.category})`);
    });
    
    if (achievements.length > 3) {
      console.log(`   ... and ${achievements.length - 3} more achievements`);
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ Achievements API test failed:', error.message);
    return false;
  }
}

async function testUserOperations() {
  console.log('👤 Testing User Operations...\n');
  
  try {
    // Test: Check if we can query users table (should be empty or return RLS error)
    const { data, error } = await supabase
      .from('users')
      .select('count(*)', { count: 'exact' })
      .limit(1);
    
    // This might fail due to RLS, which is expected
    if (error && error.code === '42501') {
      console.log('✅ Row Level Security is working (RLS blocking access)');
    } else if (error) {
      console.log('⚠️  Unexpected error:', error.message);
    } else {
      console.log('✅ Users table accessible (this is normal if RLS allows it)');
    }
    
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ User operations test failed:', error.message);
    return false;
  }
}

async function testDatabaseSchema() {
  console.log('📋 Testing Database Schema...\n');
  
  const tables = [
    'users', 'topics', 'achievements', 'user_progress', 
    'chat_messages', 'quiz_attempts'
  ];
  
  let allGood = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error && error.code !== '42501') { // Ignore RLS errors
        console.log(`❌ Table "${table}" has issues:`, error.message);
        allGood = false;
      } else {
        console.log(`✅ Table "${table}" accessible`);
      }
    } catch (error) {
      console.log(`❌ Error with table "${table}":`, error.message);
      allGood = false;
    }
  }
  
  console.log('');
  return allGood;
}

async function testAPIIntegration() {
  console.log('🔗 Testing API Integration Patterns...\n');
  
  try {
    // Test: Topics with progress join (simulated)
    const { data: topicsWithDetails, error } = await supabase
      .from('topics')
      .select(`
        id,
        slug,
        title,
        icon,
        difficulty,
        estimated_time_minutes
      `)
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      console.log('❌ Failed to fetch topics with details:', error.message);
      return false;
    }
    
    console.log('✅ Successfully fetched topics with selected fields');
    console.log(`   Example: ${topicsWithDetails[0]?.title || 'No topics found'}`);
    
    // Test: Achievement categories
    const { data: achievementCategories, error: catError } = await supabase
      .from('achievements')
      .select('category')
      .eq('is_active', true);
    
    if (catError) {
      console.log('❌ Failed to fetch achievement categories:', catError.message);
      return false;
    }
    
    const uniqueCategories = [...new Set(achievementCategories.map(a => a.category))];
    console.log(`✅ Found ${uniqueCategories.length} achievement categories:`, uniqueCategories.join(', '));
    
    console.log('');
    return true;
  } catch (error) {
    console.log('❌ API Integration test failed:', error.message);
    return false;
  }
}

// ==========================================
// MAIN TEST RUNNER
// ==========================================

async function runAPITests() {
  console.log('🚀 SciFly API Integration Tests\n');
  console.log('=' .repeat(50) + '\n');
  
  const tests = [
    { name: 'Database Schema', fn: testDatabaseSchema },
    { name: 'Topics API', fn: testTopicsAPI },
    { name: 'Achievements API', fn: testAchievementsAPI },
    { name: 'User Operations', fn: testUserOperations },
    { name: 'API Integration', fn: testAPIIntegration }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const result = await test.fn();
    results.push({ name: test.name, passed: result });
  }
  
  // Summary
  console.log('📊 Test Results:');
  console.log('=' .repeat(30));
  
  results.forEach(result => {
    console.log(`${result.passed ? '✅' : '❌'} ${result.name}`);
  });
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  console.log(`\n🎯 ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All API tests passed! Your database integration is ready.');
    console.log('💡 Next steps:');
    console.log('   1. Integrate APIs with your Redux slices');
    console.log('   2. Replace localStorage calls with database calls');
    console.log('   3. Add authentication to your UI');
    console.log('   4. Test user registration and login flows\n');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Check your database setup.`);
    console.log('💡 Troubleshooting:');
    console.log('   1. Ensure all seed data is loaded');
    console.log('   2. Check your Supabase configuration');
    console.log('   3. Verify RLS policies are working\n');
  }
}

// Run the tests
runAPITests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
}); 