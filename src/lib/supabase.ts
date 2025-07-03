import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create Supabase client only if environment variables are available
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
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
