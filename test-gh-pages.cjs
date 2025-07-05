// Simple test to check what's happening with GitHub Pages
// Run this locally to simulate the GitHub Pages environment

console.log('🧪 Testing GitHub Pages Configuration...\n');

// Test 1: Check if environment variables would be available in production build
const envVars = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  VITE_OPENAI_API_KEY: process.env.VITE_OPENAI_API_KEY
};

console.log('🔍 Environment Variables Check:');
Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: Set (${value.substring(0, 20)}...)`);
  } else {
    console.log(`❌ ${key}: Missing`);
  }
});

// Test 2: Simulate Supabase client creation
try {
  const { createClient } = require('@supabase/supabase-js');
  
  if (envVars.VITE_SUPABASE_URL && envVars.VITE_SUPABASE_ANON_KEY) {
    const supabase = createClient(envVars.VITE_SUPABASE_URL, envVars.VITE_SUPABASE_ANON_KEY);
    console.log('✅ Supabase client creation: Success');
    
    // Test Edge Function call
    console.log('\n🧪 Testing Edge Function call...');
    supabase.functions.invoke('chat-with-ai', {
      body: {
        messages: [{ role: 'user', content: 'Test from local simulation' }]
      }
    }).then(({ data, error }) => {
      if (error) {
        console.log('❌ Edge Function test failed:', error.message);
      } else {
        console.log('✅ Edge Function test succeeded:', data?.response?.substring(0, 50) + '...');
      }
    }).catch(err => {
      console.log('❌ Edge Function test error:', err.message);
    });
    
  } else {
    console.log('❌ Supabase client creation: Failed (missing env vars)');
  }
} catch (err) {
  console.log('❌ Supabase test error:', err.message);
}

console.log('\n💡 Next steps:');
console.log('1. Check your GitHub repository secrets at:');
console.log('   https://github.com/dlo137/StudyPal-AI/settings/secrets/actions');
console.log('2. Verify the GitHub Actions build logs');
console.log('3. Check if the deployment completed successfully');
