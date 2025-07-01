// API Environment Detection and Configuration
export interface ApiEnvironment {
  isProduction: boolean;
  isDevelopment: boolean;
  isGitHubPages: boolean;
  canMakeDirectOpenAICalls: boolean;
  shouldUseProxy: boolean;
  baseUrl: string;
}

export function getApiEnvironment(): ApiEnvironment {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const isDev = import.meta.env.DEV;
  const isGitHubPages = hostname.includes('github.io') || hostname.includes('github.com');
  
  console.log('🌍 API Environment Detection:', {
    hostname,
    protocol,
    isDev,
    isGitHubPages,
    userAgent: navigator.userAgent.substring(0, 50) + '...'
  });

  return {
    isProduction: !isDev,
    isDevelopment: isDev,
    isGitHubPages,
    canMakeDirectOpenAICalls: !isGitHubPages, // GitHub Pages may have CORS issues
    shouldUseProxy: isGitHubPages,
    baseUrl: window.location.origin
  };
}

export function getOpenAIConfiguration(): {
  canUseOpenAI: boolean;
  reason: string;
  suggestion: string;
} {
  const env = getApiEnvironment();
  const hasApiKey = !!import.meta.env.VITE_OPENAI_API_KEY;
  const isValidKey = import.meta.env.VITE_OPENAI_API_KEY?.startsWith('sk-') || false;

  console.log('🔑 OpenAI Configuration Check:', {
    hasApiKey,
    isValidKey,
    environment: env
  });

  if (!hasApiKey) {
    return {
      canUseOpenAI: false,
      reason: 'No OpenAI API key configured',
      suggestion: 'Add VITE_OPENAI_API_KEY to your environment variables'
    };
  }

  if (!isValidKey) {
    return {
      canUseOpenAI: false,
      reason: 'Invalid OpenAI API key format',
      suggestion: 'Ensure your API key starts with "sk-"'
    };
  }

  // If we're on GitHub Pages but have Supabase configured, we can use OpenAI via Edge Functions
  if (env.isGitHubPages) {
    // Check if Supabase is available for Edge Function fallback
    const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (hasSupabase) {
      return {
        canUseOpenAI: true, // We can use it via Edge Functions
        reason: 'Using Supabase Edge Functions for GitHub Pages',
        suggestion: 'Edge Functions provide secure server-side API access'
      };
    }
    
    return {
      canUseOpenAI: false,
      reason: 'GitHub Pages CORS restrictions',
      suggestion: 'Deploy Supabase Edge Functions to enable AI functionality'
    };
  }

  return {
    canUseOpenAI: true,
    reason: 'Configuration valid',
    suggestion: ''
  };
}
