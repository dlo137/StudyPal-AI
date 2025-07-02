import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

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
