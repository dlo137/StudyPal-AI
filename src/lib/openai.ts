import OpenAI from 'openai';
import { getApiEnvironment, getOpenAIConfiguration } from './apiEnvironment';

// Add comprehensive logging for debugging
console.log('🔧 OpenAI Module Loading...');
console.log('🌍 Environment:', {
  isDev: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  host: window.location.host,
  protocol: window.location.protocol
});

// Check environment and configuration
const apiEnvironment = getApiEnvironment();
const openaiConfig = getOpenAIConfiguration();

console.log('🔧 API Environment:', apiEnvironment);
console.log('🔧 OpenAI Configuration:', openaiConfig);

// Initialize OpenAI client only if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
console.log('🔑 API Key Check:', {
  hasApiKey: !!apiKey,
  keyLength: apiKey?.length || 0,
  keyPrefix: apiKey?.substring(0, 8) || 'none',
  keyValid: apiKey?.startsWith('sk-') || false
});

const openai = (apiKey && openaiConfig.canUseOpenAI) ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, use Supabase Edge Functions instead
}) : null;

console.log('🤖 OpenAI Client:', {
  initialized: !!openai,
  canUseOpenAI: openaiConfig.canUseOpenAI,
  reason: openaiConfig.reason,
  timestamp: new Date().toISOString()
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessageToOpenAI(messages: ChatMessage[]): Promise<string> {
  console.log('📤 Sending message to OpenAI...', {
    timestamp: new Date().toISOString(),
    messageCount: messages.length,
    hasOpenAI: !!openai,
    location: window.location.href
  });

  // If no OpenAI client available, return environment-specific message
  if (!openai) {
    console.warn('⚠️ No OpenAI client available');
    
    const config = getOpenAIConfiguration();
    if (config.reason === 'GitHub Pages CORS restrictions') {
      return `I'm StudyPal AI! 🤖\n\n⚠️ **Running on GitHub Pages**\n\nDue to browser security restrictions, I can't make direct API calls to OpenAI from GitHub Pages. This works fine in development but requires a backend server in production.\n\n**Solutions:**\n1. Use Supabase Edge Functions (recommended)\n2. Deploy with a backend server\n3. Use a CORS proxy service\n\n**For now, I'm in demo mode.** I can help you with:\n- Study planning and organization\n- Academic questions and explanations\n- Learning strategies and tips\n- Research assistance\n\nTo enable full AI capabilities, please implement one of the solutions above.`;
    }
    
    return `I'm StudyPal AI! 🤖\n\n⚠️ **Configuration Issue**\n\nReason: ${config.reason}\nSuggestion: ${config.suggestion}\n\nFor now, I'm running in demo mode. I can help you with:\n- Study planning and organization\n- Academic questions and explanations\n- Learning strategies and tips\n- Research assistance\n\nTo get started with full AI capabilities, please fix the configuration issue above.`;
  }

  try {
    console.log('🔄 Making OpenAI API request...');
    
    // Add a system message to set the context for StudyPal
    const systemMessage: ChatMessage = {
      role: 'system',
      content: `You are StudyPal AI, a helpful study assistant. You help students with:
- Answering academic questions
- Explaining concepts clearly
- Providing study tips and strategies
- Helping with homework and assignments
- Breaking down complex topics into understandable parts

Be friendly, encouraging, and educational in your responses. Keep answers concise but thorough.`
    };

    // Prepare messages for OpenAI (include system message first)
    const chatMessages = [systemMessage, ...messages].map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    console.log('📝 Prepared messages for OpenAI:', {
      totalMessages: chatMessages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change to 'gpt-4' if you have access
      messages: chatMessages,
      max_tokens: 500, // Adjust based on your needs
      temperature: 0.7, // Controls creativity (0-1)
      stream: false
    });

    console.log('✅ OpenAI API response received:', {
      timestamp: new Date().toISOString(),
      hasResponse: !!completion.choices[0]?.message?.content,
      usage: completion.usage
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      console.error('❌ No response content from OpenAI');
      throw new Error('No response from OpenAI');
    }

    console.log('📨 OpenAI response ready:', {
      responseLength: response.length,
      timestamp: new Date().toISOString()
    });

    return response;
  } catch (error) {
    console.error('❌ OpenAI API Error:', {
      error,
      timestamp: new Date().toISOString(),
      errorType: error?.constructor?.name,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      location: window.location.href
    });
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.error('🔑 API Key Error detected');
        throw new Error('OpenAI API key is invalid or missing. Please check your environment variables.');
      } else if (error.message.includes('quota')) {
        console.error('💰 Quota Error detected');
        throw new Error('OpenAI API quota exceeded. Please check your usage or billing.');
      } else if (error.message.includes('rate limit')) {
        console.error('⏱️ Rate Limit Error detected');
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      } else if (error.message.includes('CORS') || error.message.includes('network')) {
        console.error('🌐 Network/CORS Error detected');
        throw new Error('Network error: Unable to connect to OpenAI. This may be due to CORS restrictions on GitHub Pages.');
      }
    }
    
    throw new Error('Failed to get response from AI. Please try again.');
  }
}

// Validation function to check if OpenAI is properly configured
export function validateOpenAIConfig(): { valid: boolean; error?: string } {
  console.log('🔍 Validating OpenAI configuration...');
  
  const config = getOpenAIConfiguration();
  
  if (!config.canUseOpenAI) {
    console.error('❌ OpenAI configuration invalid:', config.reason);
    return {
      valid: false,
      error: `${config.reason}. ${config.suggestion}`
    };
  }

  console.log('✅ OpenAI configuration is valid');
  return { valid: true };
}
