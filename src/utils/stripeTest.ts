// Quick test to debug Stripe loading issues
import { loadStripe } from '@stripe/stripe-js';

// Test Stripe loading directly
const testStripeLoading = async () => {
  console.log('🧪 Testing Stripe Loading...');
  
  const testKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  console.log('Test key:', {
    exists: !!testKey,
    length: testKey?.length,
    prefix: testKey?.substring(0, 10),
    isValidFormat: testKey?.startsWith('pk_')
  });
  
  if (!testKey) {
    console.error('❌ No Stripe key available for testing');
    return;
  }
  
  try {
    console.log('🔄 Attempting to load Stripe...');
    const stripe = await loadStripe(testKey);
    console.log('✅ Stripe loaded successfully:', stripe);
    return stripe;
  } catch (error) {
    console.error('❌ Error loading Stripe:', error);
    return null;
  }
};

// Run the test
testStripeLoading().then(result => {
  console.log('🏁 Test result:', result);
});

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).testStripeLoading = testStripeLoading;
}
