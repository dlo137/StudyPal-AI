// @ts-nocheck
// This file is designed for Deno runtime in Supabase Edge Functions
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{
    type: 'text' | 'image_url';
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
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
    
    // Validate request method
    if (req.method !== 'POST') {
      console.error('❌ Invalid method:', req.method);
      return new Response(
        JSON.stringify({ 
          error: 'Method not allowed. Only POST requests are supported.',
          timestamp: new Date().toISOString()
        }),
        {
          status: 405,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }

    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }
    
    const { messages }: ChatRequest = requestBody;
    
    // Check request size (Supabase Edge Functions have ~6MB limit)
    const requestSizeBytes = JSON.stringify(requestBody).length;
    const maxSizeBytes = 6 * 1024 * 1024; // 6MB
    
    if (requestSizeBytes > maxSizeBytes) {
      console.error('❌ Request too large:', {
        size: requestSizeBytes,
        maxSize: maxSizeBytes,
        timestamp: new Date().toISOString()
      });
      return new Response(
        JSON.stringify({ 
          error: `Request too large (${Math.round(requestSizeBytes / 1024 / 1024 * 10) / 10}MB). Please use a smaller image or compress it.`,
          timestamp: new Date().toISOString()
        }),
        {
          status: 413, // Payload Too Large
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }
    
    console.log('📨 Received messages:', {
      count: messages?.length || 0,
      timestamp: new Date().toISOString(),
      hasImages: messages?.some(msg => 
        Array.isArray(msg.content) && 
        msg.content.some(part => part.type === 'image_url')
      ) || false,
      requestSizeMB: Math.round(requestSizeBytes / 1024 / 1024 * 10) / 10
    });

    if (!messages || !Array.isArray(messages)) {
      console.error('❌ Invalid messages format:', { messages, type: typeof messages });
      return new Response(
        JSON.stringify({ 
          error: 'Messages array is required and must be an array',
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }

    if (messages.length === 0) {
      console.error('❌ Empty messages array');
      return new Response(
        JSON.stringify({ 
          error: 'At least one message is required',
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }

    // Get OpenAI API key from environment
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('❌ OpenAI API key not found in environment');
      return new Response(
        JSON.stringify({ 
          error: 'OpenAI API key not configured in Edge Function environment',
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

    console.log('🔑 OpenAI API key found, making request...');

    // Detect if we have images and choose appropriate model
    const hasImages = messages.some(msg => 
      Array.isArray(msg.content) && 
      msg.content.some(part => part.type === 'image_url')
    );
    
    const modelToUse = hasImages ? 'gpt-4o-mini' : 'gpt-4o-mini';
    const maxTokens = hasImages ? 1000 : 500;
    
    console.log('🤖 Model selection:', { hasImages, modelToUse, maxTokens });

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
        model: modelToUse,
        messages: chatMessages,
        max_tokens: maxTokens,
        temperature: 0.7,
        stream: false
      }),
    })

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text()
      console.error('❌ OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData,
        modelUsed: modelToUse
      });
      return new Response(
        JSON.stringify({ 
          error: `OpenAI API error: ${openaiResponse.status} - ${errorData}`,
          timestamp: new Date().toISOString()
        }),
        {
          status: openaiResponse.status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
        },
      )
    }

    const data = await openaiResponse.json()
    const assistantMessage = data.choices?.[0]?.message?.content

    if (!assistantMessage) {
      console.error('❌ No response from OpenAI:', { data, choices: data.choices });
      return new Response(
        JSON.stringify({ 
          error: 'No response from OpenAI - please try again',
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
    console.error('❌ Function error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        debug: Deno.env.get('ENVIRONMENT') === 'development' ? {
          stack: error instanceof Error ? error.stack : undefined
        } : undefined
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
