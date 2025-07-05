// Test your Supabase Edge Function directly
// Paste this in browser console to test the payment intent creation

async function testPaymentIntent() {
  const supabaseUrl = 'https://xphgwzbxwwaqoaedfsoq.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGd3emJ4d3dhcW9hZWRmc29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjU0ODgsImV4cCI6MjA2NjgwMTQ4OH0.J6lqFQjg41BsaA1i0yWeIkAR_yN2ia7_FgkTnxmdzLU';
  
  try {
    console.log('🧪 Testing Supabase Edge Function...');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify({
        amount: 999, // $9.99 in cents
        currency: 'usd',
        planType: 'gold',
        userEmail: 'test@example.com',
        userId: 'test-user-123',
      }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', [...response.headers.entries()]);
    
    const responseText = await response.text();
    console.log('📡 Response body:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Success! Payment intent created:', data);
    } else {
      console.log('❌ Error response:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Network/fetch error:', error);
  }
}

// Run the test
testPaymentIntent();
