// Quick test to isolate the issue
import { createClient } from '@supabase/supabase-js'

export async function quickSupabaseTest() {
  console.log('🚀 Starting quick Supabase test...');
  
  // Get environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('📋 Environment variables:');
  console.log('  URL:', supabaseUrl);
  console.log('  Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'MISSING');
  
  if (!supabaseUrl || !supabaseKey) {
    return { success: false, message: 'Missing environment variables' };
  }
  
  try {
    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase client created');
    
    // Test 1: Simple auth check
    console.log('🔍 Testing auth service...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    console.log('Auth result:', { data: authData, error: authError });
    
    // Test 2: Try to get session
    console.log('🔍 Testing session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    console.log('Session result:', { data: sessionData, error: sessionError });
    
    // Test 3: Try a simple database query
    console.log('🔍 Testing database query...');
    const { data: dbData, error: dbError } = await supabase
      .from('profiles') // common table name
      .select('*')
      .limit(1);
    console.log('Database result:', { data: dbData, error: dbError });
    
    return {
      success: true,
      message: 'Quick test completed',
      results: {
        auth: { data: authData, error: authError },
        session: { data: sessionData, error: sessionError },
        database: { data: dbData, error: dbError }
      }
    };
    
  } catch (error) {
    console.error('❌ Quick test failed:', error);
    return {
      success: false,
      message: 'Quick test failed',
      error: error
    };
  }
}
