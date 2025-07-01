// @ts-nocheck
// This file is designed for Deno runtime in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Chat with AI function called');
    
    // Parse request body
    const { messages }: ChatRequest = await req.json()
    
    console.log('📨 Received messages:', {
      count: messages?.length || 0,
      timestamp: new Date().toISOString()
    });

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required')
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('🔑 OpenAI API key found, making request...');

    // Add system message
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

    // Prepare messages for OpenAI
    const chatMessages = [systemMessage, ...messages];

    // Make request to OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: chatMessages,
        max_tokens: 500,
        temperature: 0.7,
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('❌ OpenAI API error:', {
        status: openaiResponse.status,
        error: errorData
      });
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorData}`)
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices[0]?.message?.content

    if (!assistantMessage) {
      throw new Error('No response from OpenAI')
    }

    console.log('✅ OpenAI response received:', {
      responseLength: assistantMessage.length,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        response: assistantMessage,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )

  } catch (error) {
    console.error('❌ Function error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
      },
    )
  }
})
