// Simple utility to test Supabase connection
import { supabase } from './supabase'

export async function testSupabaseConnection() {
  console.log('🔗 Testing Supabase connection...')
  
  try {
    // Test 1: Basic client setup
    console.log('✅ Supabase client initialized')
    
    if (!supabase) {
      console.error('❌ Supabase client is not initialized')
      return false
    }
    
    // Test 2: Check if we can connect to the database
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('❌ Database connection failed:', error.message)
      return false
    }
    
    console.log('✅ Database connection successful')
    console.log('📊 Test data:', data)
    
    // Test 3: Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Current user:', user ? `${user.email} (${user.id})` : 'Not logged in')
    
    return true
  } catch (err) {
    console.error('❌ Connection test failed:', err)
    return false
  }
}

// Auto-run test in development
if (import.meta.env.DEV) {
  testSupabaseConnection()
}
