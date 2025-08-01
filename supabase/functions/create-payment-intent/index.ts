import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface PaymentRequest {
  amount: number;
  currency: string;
  planType: 'gold' | 'diamond';
  userEmail?: string;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🚀 Edge Function called:', req.method, req.url)
    
    // Validate request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    console.log('🔧 Environment check:', {
      hasStripeKey: !!stripeSecretKey,
      stripeKeyPrefix: stripeSecretKey?.substring(0, 8),
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })

    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY missing')
      throw new Error('Stripe secret key not configured')
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Supabase configuration missing')
      throw new Error('Supabase configuration missing')
    }

    // Parse request body
    const requestBody: PaymentRequest = await req.json()
    console.log('📦 Request body:', requestBody)
    
    // Validate request
    if (!requestBody.amount || !requestBody.currency || !requestBody.planType) {
      console.error('❌ Missing required fields:', requestBody)
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate plan type and amount
    const validPlans = {
      gold: 50, // $0.50 in cents (temporarily reduced for testing)
      diamond: 50 // $0.50 in cents (temporarily reduced for testing)
    }

    if (!validPlans[requestBody.planType] || requestBody.amount !== validPlans[requestBody.planType]) {
      return new Response(
        JSON.stringify({ error: 'Invalid plan or amount' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create Stripe payment intent
    console.log('💳 Creating Stripe payment intent...')
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: requestBody.amount.toString(),
        currency: requestBody.currency,
        'metadata[planType]': requestBody.planType,
        'metadata[userEmail]': requestBody.userEmail || '',
        'metadata[userId]': requestBody.userId || '',
      }),
    })

    console.log('📡 Stripe response status:', stripeResponse.status)

    if (!stripeResponse.ok) {
      const errorData = await stripeResponse.text()
      console.error('❌ Stripe API error status:', stripeResponse.status)
      console.error('❌ Stripe API error data:', errorData)
      
      // Try to parse error for more details
      try {
        const errorJson = JSON.parse(errorData)
        console.error('❌ Stripe parsed error:', errorJson)
        throw new Error(`Stripe error: ${errorJson.error?.message || errorData}`)
      } catch {
        throw new Error(`Stripe API error (${stripeResponse.status}): ${errorData}`)
      }
    }

    const paymentIntent = await stripeResponse.json()
    console.log('✅ Payment intent created successfully:', paymentIntent.id)

    // Log the payment intent creation (optional)
    console.log(`Payment intent created: ${paymentIntent.id} for plan: ${requestBody.planType}`)

    // Return the client secret
    return new Response(
      JSON.stringify({
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
