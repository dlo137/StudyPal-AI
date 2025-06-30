import { useState, useEffect } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
