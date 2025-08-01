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

// Additional debugging for the promise creation
console.log('🔄 Stripe Promise Creation:', {
  hasKey: !!stripePublishableKey,
  keyValue: stripePublishableKey,
  willCreatePromise: !!stripePublishableKey
});

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey).then(stripe => {
  console.log('✅ Stripe loaded successfully:', !!stripe);
  if (!stripe) {
    console.error('❌ Stripe returned null - invalid publishable key?');
  }
  return stripe;
}).catch(error => {
  console.error('❌ Stripe failed to load:', error);
  return null;
}) : null;

// Log the promise result
console.log('✨ Stripe Promise Result:', {
  promiseExists: !!stripePromise,
  promiseType: typeof stripePromise
});

export { stripePromise };

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'usd',
  plans: {
    gold: {
      name: 'Gold Plan',
      price: 199, // $1.99 in cents
      priceId: import.meta.env.VITE_STRIPE_GOLD_PRICE_ID, // You'll need to create this in Stripe
      features: [
        '150 Requests/Monthly',
        'Email Support',
        'Priority Access to New Features'
      ]
    },
    diamond: {
      name: 'Diamond Plan',
      price: 499, // $4.99 in cents
      priceId: import.meta.env.VITE_STRIPE_DIAMOND_PRICE_ID, // You'll need to create this in Stripe
      features: [
        '500 Requests/Monthly',
        'Email Support',
        'Priority Access to New Features',
        'Priority Support'
      ]
    }
  }
};
