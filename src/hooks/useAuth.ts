import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, clearInvalidTokens } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If Supabase is not configured, set loading to false immediately
    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false)
      return
    }

    // Get initial session with error handling
    const initializeAuth = async () => {
      if (!supabase) return
      
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.warn('⚠️ Session error:', error.message)
          // If it's a refresh token error, clear invalid tokens
          if (error.message.includes('refresh') || error.message.includes('token')) {
            await clearInvalidTokens()
          }
          setSession(null)
          setUser(null)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.warn('⚠️ Auth initialization error:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔐 Auth state change:', event)
      
      if (event === 'TOKEN_REFRESHED') {
        console.log('✅ Token refreshed successfully')
      } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
        setSession(null)
        setUser(null)
      } else if (event === 'SIGNED_IN') {
        console.log('👤 User signed in')
        setSession(session)
        setUser(session?.user ?? null)
      }
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { 
        data: null, 
        error: { message: 'Demo Mode: Sign up is not available without Supabase configuration.' }
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured() || !supabase) {
      return { 
        data: null, 
        error: { message: 'Demo Mode: Sign in is not available without Supabase configuration.' }
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  // Sign out
  const signOut = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      return { error: { message: 'Demo Mode: Sign out is not available without Supabase configuration.' } }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }
}
