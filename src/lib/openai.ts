import OpenAI from 'openai';

// Initialize OpenAI client only if API key is available
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, use Supabase Edge Functions instead
}) : null;

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendMessageToOpenAI(messages: ChatMessage[]): Promise<string> {
  // If no OpenAI client available, return a helpful message
  if (!openai) {
    return "I'm StudyPal AI! 🤖\n\nTo enable AI responses, you'll need to set up an OpenAI API key. For now, I'm running in demo mode.\n\nI can help you with:\n- Study planning and organization\n- Academic questions and explanations\n- Learning strategies and tips\n- Research assistance\n\nTo get started with full AI capabilities, please contact your administrator to configure the OpenAI integration.";
  }

  try {
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

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // You can change to 'gpt-4' if you have access
      messages: chatMessages,
      max_tokens: 500, // Adjust based on your needs
      temperature: 0.7, // Controls creativity (0-1)
      stream: false
    });

    const response = completion.choices[0]?.message?.content;
    
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return response;
  } catch (error) {
    console.error('OpenAI API Error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('OpenAI API key is invalid or missing. Please check your environment variables.');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI API quota exceeded. Please check your usage or billing.');
      } else if (error.message.includes('rate limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again in a moment.');
      }
    }
    
    throw new Error('Failed to get response from AI. Please try again.');
  }
}

// Validation function to check if OpenAI is properly configured
export function validateOpenAIConfig(): { valid: boolean; error?: string } {
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    return {
      valid: false,
      error: 'OpenAI API key is not configured. Please add VITE_OPENAI_API_KEY to your .env.local file.'
    };
  }

  if (!import.meta.env.VITE_OPENAI_API_KEY.startsWith('sk-')) {
    return {
      valid: false,
      error: 'OpenAI API key appears to be invalid. It should start with "sk-".'
    };
  }

  return { valid: true };
}
