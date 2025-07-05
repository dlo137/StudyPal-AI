// Utility to help debug and fix authentication issues

export const clearAllAuthData = () => {
  try {
    console.log('🧹 Clearing all authentication data...')
    
    // Clear localStorage
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        keysToRemove.push(key)
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      console.log(`  ✅ Removed: ${key}`)
    })
    
    // Clear sessionStorage
    const sessionKeysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
        sessionKeysToRemove.push(key)
      }
    }
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key)
      console.log(`  ✅ Removed from session: ${key}`)
    })
    
    console.log('✅ Authentication data cleared. Please refresh the page.')
    
    return true
  } catch (error) {
    console.error('❌ Error clearing auth data:', error)
    return false
  }
}

// Function to diagnose common authentication issues
export const diagnoseAuthIssues = () => {
  console.log('🔍 Diagnosing authentication issues...')
  
  const issues = []
  const fixes = []
  
  // Check for Supabase environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  if (!supabaseUrl) {
    issues.push('❌ VITE_SUPABASE_URL is not defined')
    fixes.push('Set VITE_SUPABASE_URL in GitHub secrets or .env.local')
  } else {
    console.log('✅ VITE_SUPABASE_URL is configured')
  }
  
  if (!supabaseKey) {
    issues.push('❌ VITE_SUPABASE_ANON_KEY is not defined')
    fixes.push('Set VITE_SUPABASE_ANON_KEY in GitHub secrets or .env.local')
  } else {
    console.log('✅ VITE_SUPABASE_ANON_KEY is configured')
  }
  
  // Check for stale auth tokens
  const authKeys = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('supabase') || key.includes('auth') || key.includes('sb-'))) {
      authKeys.push(key)
    }
  }
  
  if (authKeys.length > 0) {
    console.log('🔑 Found authentication tokens:', authKeys)
    fixes.push('If you see refresh token errors, run clearAllAuthData() to clear stale tokens')
  }
  
  // Report findings
  if (issues.length > 0) {
    console.error('🚨 Issues found:')
    issues.forEach(issue => console.error(`  ${issue}`))
    console.log('🔧 Suggested fixes:')
    fixes.forEach(fix => console.log(`  • ${fix}`))
  } else {
    console.log('✅ No obvious authentication configuration issues found')
  }
  
  return { issues, fixes }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllAuthData = clearAllAuthData;
  (window as any).diagnoseAuthIssues = diagnoseAuthIssues;
}
