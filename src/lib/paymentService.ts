import { stripePromise, STRIPE_CONFIG } from './stripe';

export interface PaymentIntent {
  client_secret: string;
  id: string;
}

export interface CreatePaymentRequest {
  planType: 'gold' | 'diamond';
  userEmail?: string;
  userId?: string;
}

export interface PaymentResult {
  success: boolean;
  error?: string;
  paymentIntent?: PaymentIntent;
}

// Input validation helper
function validatePaymentRequest(request: CreatePaymentRequest): string | null {
  if (!request.planType || !['gold', 'diamond'].includes(request.planType)) {
    return 'Invalid plan type';
  }
  
  if (request.userEmail && !/\S+@\S+\.\S+/.test(request.userEmail)) {
    return 'Invalid email format';
  }
  
  return null;
}

// Create a payment intent using Supabase Edge Function
export async function createPaymentIntent(request: CreatePaymentRequest): Promise<PaymentResult> {
  try {
    // Client-side validation
    const validationError = validatePaymentRequest(request);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    const plan = STRIPE_CONFIG.plans[request.planType];
    
    // Use Supabase Edge Function instead of local API
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Payment system configuration error');
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        amount: plan.price,
        currency: STRIPE_CONFIG.currency,
        planType: request.planType,
        userEmail: request.userEmail,
        userId: request.userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      paymentIntent: data
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Don't expose sensitive error details to users
    const userFriendlyError = error instanceof Error && error.message.includes('network')
      ? 'Network error. Please check your connection and try again.'
      : 'Unable to process payment request. Please try again later.';
    
    return {
      success: false,
      error: userFriendlyError
    };
  }
}

// Confirm payment with Stripe
export async function confirmPayment(
  clientSecret: string,
  paymentMethodId: string
): Promise<PaymentResult> {
  try {
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Payment system not available');
    }

    // Input validation
    if (!clientSecret || !paymentMethodId) {
      throw new Error('Invalid payment information');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId
    });

    if (error) {
      // Handle specific Stripe error types
      let userFriendlyError = 'Payment failed. Please try again.';
      
      switch (error.type) {
        case 'card_error':
          userFriendlyError = error.message || 'Your card was declined.';
          break;
        case 'validation_error':
          userFriendlyError = 'Please check your payment information.';
          break;
        case 'api_connection_error':
          userFriendlyError = 'Network error. Please try again.';
          break;
        case 'rate_limit_error':
          userFriendlyError = 'Too many requests. Please wait a moment and try again.';
          break;
        default:
          userFriendlyError = 'Payment failed. Please try again later.';
      }

      return {
        success: false,
        error: userFriendlyError
      };
    }

    return {
      success: true,
      paymentIntent: paymentIntent as any
    };
  } catch (error) {
    console.error('Error confirming payment:', error);
    return {
      success: false,
      error: 'Payment confirmation failed. Please try again.'
    };
  }
}

// Get plan details
export function getPlanDetails(planType: 'gold' | 'diamond') {
  return STRIPE_CONFIG.plans[planType];
}

// Format price for display
export function formatPrice(priceInCents: number): string {
  return `$${(priceInCents / 100).toFixed(2)}`;
}

// Validate card number format (basic client-side check)
export function validateCardNumber(cardNumber: string): boolean {
  // Remove spaces and hyphens
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if it's all digits and reasonable length
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }
  
  // Basic Luhn algorithm check
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Security helper: Sanitize user input
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
