import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug environment variables
console.log('🔍 Supabase Environment Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
  keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING',
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  timestamp: new Date().toISOString()
});

// Create Supabase client only if environment variables are available
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    })
  : null

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => Boolean(supabase)

// Helper function to clear invalid auth tokens
export const clearInvalidTokens = async () => {
  if (!supabase) return
  
  try {
    // Clear potentially corrupted session data
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.warn('⚠️ Error during signout:', error.message)
    }
    
    // Clear localStorage auth data
    localStorage.removeItem('supabase.auth.token')
    localStorage.removeItem('sb-' + supabaseUrl?.split('//')[1]?.split('.')[0] + '-auth-token')
    
    console.log('🧹 Cleared authentication tokens')
  } catch (error) {
    console.warn('⚠️ Error clearing tokens:', error)
  }
}
