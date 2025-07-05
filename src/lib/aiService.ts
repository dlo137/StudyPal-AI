import { supabase, isSupabaseConfigured } from './supabase';
import { getApiEnvironment, getOpenAIConfiguration } from './apiEnvironment';
import { sendMessageToOpenAI as sendDirectToOpenAI, type ChatMessage } from './openai';

// Enhanced AI service that handles both direct OpenAI calls and Supabase Edge Functions
export async function sendMessageToAI(messages: ChatMessage[]): Promise<string> {
  console.log('🧠 AI Service: Determining best approach...', {
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
    location: window.location.href
  });

  const environment = getApiEnvironment();
  const openaiConfig = getOpenAIConfiguration();

  console.log('🔍 AI Service Analysis:', {
    environment,
    openaiConfig,
    hasSupabase: isSupabaseConfigured()
  });

  // Strategy 1: Use Supabase Edge Function for GitHub Pages (recommended for production)
  if (environment.isGitHubPages && isSupabaseConfigured()) {
    console.log('🌐 Using Supabase Edge Function strategy for GitHub Pages...');
    try {
      return await sendMessageViaSupabase(messages);
    } catch (error) {
      console.error('❌ Supabase Edge Function failed:', error);
      
      // If Edge Function fails, show helpful error message instead of falling back
      throw new Error(`Edge Function error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your Supabase Edge Function deployment.`);
    }
  }

  // Strategy 2: Direct OpenAI call (for development or when Supabase isn't available)
  if (openaiConfig.canUseOpenAI && !environment.isGitHubPages) {
    console.log('🚀 Using direct OpenAI call strategy...');
    return await sendDirectToOpenAI(messages);
  }

  // Strategy 3: Use Supabase Edge Function as fallback even in development
  if (isSupabaseConfigured()) {
    console.log('🆘 Using Supabase Edge Function as fallback...');
    try {
      return await sendMessageViaSupabase(messages);
    } catch (error) {
      console.error('❌ Supabase fallback failed:', error);
      throw new Error('All AI service strategies failed. Please check your configuration.');
    }
  }

  // Strategy 4: Demo mode
  console.warn('⚠️ All strategies unavailable, using demo mode');
  return getDemoResponse();
}

async function sendMessageViaSupabase(messages: ChatMessage[]): Promise<string> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  console.log('📡 Calling Supabase Edge Function...', {
    messageCount: messages.length,
    hasImages: messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(part => part.type === 'image_url')
    ),
    timestamp: new Date().toISOString(),
    environment: window.location.hostname
  });

  // Log detailed message info for debugging
  messages.forEach((msg, index) => {
    if (Array.isArray(msg.content)) {
      const textParts = msg.content.filter(part => part.type === 'text');
      const imageParts = msg.content.filter(part => part.type === 'image_url');
      console.log(`📝 Message ${index}:`, {
        role: msg.role,
        textParts: textParts.length,
        imageParts: imageParts.length,
        imageSize: imageParts.length > 0 ? imageParts[0].image_url?.url?.length : 0
      });
    }
  });

  try {
    const { data, error } = await supabase.functions.invoke('chat-with-ai', {
      body: { messages }
    });

    // Enhanced error logging
    if (error) {
      console.error('❌ Supabase Edge Function error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        status: error.status,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
        fullError: error
      });
      
      // Try to extract more specific error information
      let errorMessage = error.message;
      
      if (error.message?.includes('413') || error.message?.includes('too large') || error.message?.includes('Payload Too Large')) {
        errorMessage = 'Image too large for processing. Please use a smaller image.';
      } else if (error.message?.includes('401') || error.message?.includes('unauthorized')) {
        errorMessage = 'Authentication error. Please try refreshing the page.';
      } else if (error.message?.includes('404') || error.message?.includes('not found')) {
        errorMessage = 'AI service temporarily unavailable. Please try again.';
      } else if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        errorMessage = 'Server error occurred. Please try again in a moment.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try with a smaller image.';
      }
      
      throw new Error(`Edge Function error: ${errorMessage}`);
    }

    if (!data?.response) {
      console.error('❌ No response from Edge Function:', data);
      throw new Error('No response from AI service');
    }

    console.log('✅ Supabase Edge Function response received:', {
      responseLength: data.response.length,
      timestamp: data.timestamp || new Date().toISOString()
    });

    return data.response;
  } catch (networkError) {
    console.error('❌ Network/Request error:', {
      error: networkError,
      message: networkError instanceof Error ? networkError.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
    throw networkError;
  }
}

function getDemoResponse(): string {
  const environment = getApiEnvironment();
  const demoResponses = [
    "I'm StudyPal AI! 🤖 I'd love to help you study, but I'm currently in demo mode.",
    "Hello! I'm your study companion. To enable full AI responses, please configure the OpenAI integration.",
    "Hi there! I'm StudyPal AI. While I'm in demo mode, I can still offer some study tips: break down complex topics into smaller parts!",
    "Greetings! I'm here to help with your studies. For full AI capabilities, please set up the proper configuration.",
  ];

  const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
  
  let environmentInfo = "";
  if (environment.isGitHubPages) {
    environmentInfo = "\n\n🌐 **Running on GitHub Pages**: For full functionality, consider setting up Supabase Edge Functions.";
  } else if (environment.isDevelopment) {
    environmentInfo = "\n\n🔧 **Development Mode**: Add your OpenAI API key to enable AI responses.";
  }

  return randomResponse + environmentInfo + "\n\n💡 **Study Tip**: Always review your notes within 24 hours to improve retention!";
}

// Export for backwards compatibility
export { sendMessageToOpenAI, validateOpenAIConfig } from './openai';
export type { ChatMessage } from './openai';
