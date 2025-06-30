import { supabase, isSupabaseConfigured } from './supabase'
import type { AuthError, User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  firstName?: string
  lastName?: string
  fullName?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

// Helper to create a demo mode error
const createDemoModeError = (action: string): AuthError => {
  const error = new Error(`Demo Mode: ${action} is not available without Supabase configuration. Please set up your environment variables to enable authentication.`) as AuthError
  error.name = 'DemoModeError'
  return error
}

// Sign up a new user
export async function signUpUser(data: SignUpData): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      user: null,
      error: createDemoModeError('Sign up')
    }
  }

  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName || '',
          last_name: data.lastName || '',
          full_name: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.email
        }
      }
    })

    return {
      user: authData.user,
      error
    }
  } catch (error) {
    return {
      user: null,
      error: error as AuthError
    }
  }
}

// Log in an existing user
export async function loginUser(data: LoginData): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      user: null,
      error: createDemoModeError('Login')
    }
  }

  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    return {
      user: authData.user,
      error
    }
  } catch (error) {
    return {
      user: null,
      error: error as AuthError
    }
  }
}

// Log out the current user
export async function logoutUser(): Promise<{ error: AuthError | null }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: createDemoModeError('Logout') }
  }

  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}

// Get the current user
export async function getCurrentUser(): Promise<User | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

// Check if user is logged in
export async function isUserLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser()
  return !!user
}

// Get user profile from profiles table
export async function getUserProfile(userId: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return null
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(userId: string, updates: Record<string, unknown>) {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Demo Mode: Profile updates are not available without Supabase configuration.')
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}

// Social login helpers
export async function loginWithGoogle() {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: createDemoModeError('Google login') }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/chat`
    }
  })
  return { data, error }
}

export async function loginWithFacebook() {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: createDemoModeError('Facebook login') }
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo: `${window.location.origin}/chat`
    }
  })
  return { data, error }
}

// Password reset
export async function resetPassword(email: string) {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: createDemoModeError('Password reset') }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error }
  } catch (error) {
    return { error: error as AuthError }
  }
}
