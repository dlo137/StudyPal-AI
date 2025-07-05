// Manual Edge Function deployment script
const fs = require('fs');
const https = require('https');

console.log('🚀 Manual Edge Function Deployment\n');

// Read the function code
const functionCode = fs.readFileSync('./supabase/functions/chat-with-ai/index.ts', 'utf8');

console.log('✅ Function code loaded');
console.log(`📏 Code size: ${functionCode.length} characters\n`);

// For manual deployment, you need to:
console.log('📋 Manual deployment steps:');
console.log('1. Go to: https://supabase.com/dashboard/project/vtsmnrcjryizvnnxqvbz/functions');
console.log('2. Click on "chat-with-ai" function');
console.log('3. Click "Edit Function"');
console.log('4. Replace the code with the updated version');
console.log('5. Click "Deploy Function"\n');

console.log('🔧 Updated function code is ready in: ./supabase/functions/chat-with-ai/index.ts');
console.log('📝 Key changes made:');
console.log('   - Fixed CORS headers (added Access-Control-Allow-Methods)');
console.log('   - Updated OpenAI model from gpt-4-vision-preview to gpt-4o-mini');
console.log('   - Added proper error handling');

// Test if we can reach the function URL
console.log('\n🧪 Testing function accessibility...');
const req = https.request({
  hostname: 'vtsmnrcjryizvnnxqvbz.supabase.co',
  port: 443,
  path: '/functions/v1/chat-with-ai',
  method: 'OPTIONS',
  headers: {
    'Origin': 'https://dlo137.github.io',
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,authorization,apikey'
  }
}, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
