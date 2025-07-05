#!/usr/bin/env node

// Test script to verify the correct Supabase anon key
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xphgwzbxwwaqoaedfsoq.supabase.co';

// Test both anon keys to see which one works properly
const ANON_KEY_1 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGd3emJ4d3dhcW9hZWRmc29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5MTQwNjQsImV4cCI6MjA1MDQ5MDA2NH0.nzJEAEfGUr6L8x3d2SgLZE9V9Dh3FwM2t7O9ZGSjGGU'; // Original from tests
const ANON_KEY_2 = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGd3emJ4d3dhcW9hZWRmc29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjU0ODgsImV4cCI6MjA2NjgwMTQ4OH0.J6lqFQjg41BsaA1i0yWeIkAR_yN2ia7_FgkTnxmdzLU'; // From .env.production

async function testAnonKey(keyName, anonKey) {
  console.log(`\n🧪 Testing ${keyName}...`);
  
  try {
    const supabase = createClient(SUPABASE_URL, anonKey);
    
    // Test Edge Function call
    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: {
        messages: [
          { role: 'user', content: `Test with ${keyName}` }
        ]
      }
    });

    if (error) {
      console.log(`❌ ${keyName} failed:`, error.message);
      return false;
    }

    if (data?.response) {
      console.log(`✅ ${keyName} works! Response:`, data.response.substring(0, 100) + '...');
      return true;
    } else {
      console.log(`⚠️ ${keyName} returned unexpected data:`, data);
      return false;
    }
    
  } catch (err) {
    console.log(`❌ ${keyName} error:`, err.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Testing Supabase Anon Keys for Edge Function Access...\n');
  
  const key1Works = await testAnonKey('ANON_KEY_1 (from tests)', ANON_KEY_1);
  const key2Works = await testAnonKey('ANON_KEY_2 (from .env.production)', ANON_KEY_2);
  
  console.log('\n📊 Results Summary:');
  console.log(`ANON_KEY_1: ${key1Works ? '✅ WORKS' : '❌ FAILS'}`);
  console.log(`ANON_KEY_2: ${key2Works ? '✅ WORKS' : '❌ FAILS'}`);
  
  if (key1Works && key2Works) {
    console.log('\n💡 Both keys work! Use ANON_KEY_1 for consistency.');
    console.log('\n🔧 Update your GitHub Secrets with:');
    console.log(`VITE_SUPABASE_ANON_KEY=${ANON_KEY_1}`);
  } else if (key1Works) {
    console.log('\n💡 Use ANON_KEY_1 in your GitHub Secrets');
    console.log(`VITE_SUPABASE_ANON_KEY=${ANON_KEY_1}`);
  } else if (key2Works) {
    console.log('\n💡 Use ANON_KEY_2 in your GitHub Secrets');
    console.log(`VITE_SUPABASE_ANON_KEY=${ANON_KEY_2}`);
  } else {
    console.log('\n❌ Neither key works! Check your Supabase project settings.');
  }
}

main().catch(console.error);
