import { loadStripe } from '@stripe/stripe-js';

// Get Stripe publishable key with debugging
const getStripePublishableKey = () => {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  // Debug logging
  console.log('🔑 Stripe Key Debug:', {
    keyExists: !!key,
    keyLength: key?.length || 0,
    keyPrefix: key?.substring(0, 7) || 'undefined',
    allEnvVars: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
  });
  
  if (!key) {
    console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY is not defined');
    console.error('Available environment variables:', Object.keys(import.meta.env));
    console.error('🔧 To fix this issue:');
    console.error('  1. For local development: Add VITE_STRIPE_PUBLISHABLE_KEY to .env.local');
    console.error('  2. For GitHub Pages: Set VITE_STRIPE_PUBLISHABLE_KEY in repository secrets');
    console.error('  3. Repository Settings → Secrets and variables → Actions → New repository secret');
    console.error('  4. Name: VITE_STRIPE_PUBLISHABLE_KEY, Value: your Stripe publishable key');
  }
  
  return key;
};

const stripePublishableKey = getStripePublishableKey();

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    gold: {
      name: 'Gold Plan',
      price: 999, // $9.99 in cents
      priceId: import.meta.env.VITE_STRIPE_GOLD_PRICE_ID, // You'll need to create this in Stripe
      features: [
        '50 Requests/Daily',
        '1.5K Requests/Monthly', 
        'Email Support',
        'Chat Support',
        '24/7 Available'
      ]
    },
    diamond: {
      name: 'Diamond Plan',
      price: 1999, // $19.99 in cents
      priceId: import.meta.env.VITE_STRIPE_DIAMOND_PRICE_ID, // You'll need to create this in Stripe
      features: [
        '150 Requests/Daily',
        '4.5K Requests/Monthly',
        'Email Support',
        'Export History',
        'Priority Support'
      ]
    }
  }
};
