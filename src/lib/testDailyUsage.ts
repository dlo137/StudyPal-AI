import { supabase } from './supabase'

export async function testDailyUsageTable() {
  try {
    console.log('Testing daily_usage table connection...')
    
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }
    
    // Test if the table exists by trying to select from it
    const { data, error } = await supabase
      .from('daily_usage')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Daily usage table test failed:', error)
      return {
        success: false,
        error: error.message,
        tableExists: false
      }
    }
    
    console.log('Daily usage table test successful:', data)
    return {
      success: true,
      tableExists: true,
      data
    }
  } catch (err) {
    console.error('Daily usage table test error:', err)
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      tableExists: false
    }
  }
}

export async function getCurrentUser() {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized')
    }
    
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting current user:', error)
      return { user: null, error }
    }
    
    console.log('Current user:', user)
    return { user, error: null }
  } catch (err) {
    console.error('Error in getCurrentUser:', err)
    return { user: null, error: err }
  }
}
