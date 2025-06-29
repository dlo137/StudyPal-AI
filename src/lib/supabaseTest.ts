import { supabase } from '../lib/supabase'

export async function testSupabaseConnection() {
  const results = {
    clientInitialized: false,
    databaseConnected: false,
    authServiceAccessible: false,
    environmentVariables: false,
    currentSession: false,
    errors: {} as any
  };

  try {
    console.log('🔄 Testing Supabase connection...')
    
    // Test 1: Check if client is initialized
    results.clientInitialized = !!supabase;
    console.log('✅ Supabase client initialized:', results.clientInitialized);

    // Test 2: Check environment variables first
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    results.environmentVariables = !!(url && key);
    
    console.log('📝 Environment check:');
    console.log('  - URL:', url || 'MISSING');
    console.log('  - Key:', key ? `${key.substring(0, 20)}...` : 'MISSING');
    console.log('✅ Environment variables loaded:', results.environmentVariables);

    // Test 3: Test database connection with detailed error handling
    try {
      console.log('🔍 Testing database connection...');
      const { data, error } = await supabase
        .from('test_table')
        .select('*')
        .limit(1);
      
      console.log('📝 Database response:', { data, error });
      
      // Consider it successful if we get any response (even table not found)
      results.databaseConnected = !error || 
        error.code === 'PGRST116' || 
        error.message?.includes('relation') || 
        error.message?.includes('does not exist');
        
      if (error && !results.databaseConnected) {
        results.errors.database = {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        };
      }
      
      console.log('✅ Database connection test:', results.databaseConnected);
    } catch (dbError: any) {
      console.log('❌ Database connection error:', dbError);
      results.errors.database = {
        message: dbError.message || 'Unknown database error',
        stack: dbError.stack
      };
      results.databaseConnected = false;
    }

    // Test 4: Test auth service with detailed error handling
    try {
      console.log('🔍 Testing auth service...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      console.log('📝 Auth response:', { session: !!session, error: authError });
      
      results.authServiceAccessible = !authError;
      results.currentSession = !!session;
      
      if (authError) {
        results.errors.auth = {
          message: authError.message,
          status: authError.status
        };
      }
      
      console.log('✅ Auth service accessible:', results.authServiceAccessible);
      console.log('📝 Current session:', session ? 'Logged in' : 'Not logged in');
    } catch (authError: any) {
      console.log('❌ Auth service error:', authError);
      results.errors.auth = {
        message: authError.message || 'Unknown auth error',
        stack: authError.stack
      };
      results.authServiceAccessible = false;
    }

    // Test 5: Additional connectivity test - try to fetch from REST API directly
    try {
      console.log('🔍 Testing direct REST API connectivity...');
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      
      console.log('📝 REST API response status:', response.status);
      results.errors.restApi = response.status !== 200 ? `Status: ${response.status}` : null;
    } catch (restError: any) {
      console.log('❌ REST API error:', restError);
      results.errors.restApi = restError.message;
    }

    const allTestsPassed = results.clientInitialized && 
                          results.environmentVariables && 
                          results.databaseConnected && 
                          results.authServiceAccessible;

    return {
      success: allTestsPassed,
      message: allTestsPassed 
        ? '🎉 All Supabase tests passed! Your setup is working correctly.'
        : '🚨 Supabase setup has issues',
      details: results
    };

  } catch (error: any) {
    console.error('❌ Supabase test failed with unexpected error:', error);
    return {
      success: false,
      message: '🚨 Supabase test failed with unexpected error',
      error: error.message || 'Unknown error',
      details: {
        ...results,
        unexpectedError: {
          message: error.message,
          stack: error.stack
        }
      }
    };
  }
}
