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

  // Strategy 1: Use Supabase Edge Function (recommended for production)
  if (isSupabaseConfigured() && environment.isGitHubPages) {
    console.log('🌐 Using Supabase Edge Function strategy...');
    try {
      return await sendMessageViaSupabase(messages);
    } catch (error) {
      console.error('❌ Supabase Edge Function failed:', error);
      // Fall back to direct call if edge function fails
      if (openaiConfig.canUseOpenAI) {
        console.log('🔄 Falling back to direct OpenAI call...');
        return await sendDirectToOpenAI(messages);
      }
      throw error;
    }
  }

  // Strategy 2: Direct OpenAI call (for development or when Supabase isn't available)
  if (openaiConfig.canUseOpenAI) {
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

  console.log('📡 Calling Supabase Edge Function...');

  const { data, error } = await supabase.functions.invoke('chat-with-ai', {
    body: { messages }
  });

  if (error) {
    console.error('❌ Supabase Edge Function error:', error);
    throw new Error(`Edge Function error: ${error.message}`);
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
