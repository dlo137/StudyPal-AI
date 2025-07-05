// Quick Stripe debug script - paste this in browser console
console.log('🔍 Debugging Stripe...');
console.log('Environment variables:');
console.log('VITE_STRIPE_PUBLISHABLE_KEY:', import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET');

// Test if Stripe script is loaded
console.log('Stripe global object:', typeof window.Stripe);

// Test loading Stripe
import('https://js.stripe.com/v3/').then(() => {
  console.log('✅ Stripe script loaded from CDN');
  if (window.Stripe && import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    const stripe = window.Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
    console.log('✅ Stripe instance created:', !!stripe);
  } else {
    console.log('❌ Cannot create Stripe instance');
  }
}).catch(err => {
  console.log('❌ Failed to load Stripe script:', err);
});
