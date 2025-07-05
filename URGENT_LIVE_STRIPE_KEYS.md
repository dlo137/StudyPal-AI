# 🚨 CRITICAL: Switch to Live Stripe Keys

## Current Issue
Your production site is using TEST Stripe keys, which means:
- ❌ Fake card numbers work (like 4242424242424242)
- ❌ No real money is collected
- ❌ Customers think they've paid but haven't

## Immediate Action Required

### 1. Get Live Stripe Keys
1. Go to https://dashboard.stripe.com/
2. **Toggle from "Test mode" to "Live mode"** (switch in top right)
3. Go to "Developers" → "API keys"
4. Copy your LIVE keys:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

### 2. Update GitHub Repository Secrets
1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Update these secrets with LIVE keys:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = your live publishable key
   - `STRIPE_SECRET_KEY` = your live secret key (for backend/webhooks)

### 3. Update Price IDs (if needed)
In live mode, you may need to create new products/prices:
- `VITE_STRIPE_GOLD_PRICE_ID`
- `VITE_STRIPE_DIAMOND_PRICE_ID`

### 4. Verify Webhook Endpoints
If using webhooks, update the endpoint URL in Stripe dashboard:
- Test mode webhooks ≠ Live mode webhooks
- Update webhook secret: `STRIPE_WEBHOOK_SECRET`

## ⚠️ CRITICAL ISSUE IDENTIFIED

### Your Current Status:
- ✅ Frontend (GitHub Pages): Using live Stripe keys
- ❌ Backend (Supabase): Still using test Stripe keys

This causes the 404 error you're seeing when confirming payments.

### 5. Update Supabase Edge Function Environment Variables

**URGENT**: Your Supabase Edge Function needs the live Stripe secret key:

1. Go to https://supabase.com/dashboard/project/[your-project-id]
2. Navigate to **Settings** → **Edge Functions** → **Environment Variables**
3. Update or add:
   - `STRIPE_SECRET_KEY` = your **live** secret key (starts with `sk_live_`)

### 6. Redeploy Edge Function (if needed)
```bash
# If you have Supabase CLI installed
supabase functions deploy create-payment-intent
```

OR manually redeploy through the Supabase dashboard.

### 7. Test Payment Flow
After updating the Supabase environment variable:
1. Try a test payment with a real card
2. Check Stripe dashboard for the payment intent
3. Verify no more 404 errors in browser console

## Security Checklist
- ✅ Never commit live keys to git
- ✅ Use GitHub secrets for production
- ✅ Keep test keys for local development
- ✅ Test with real card in live mode carefully

## Test Cards (Only work in TEST mode)
- `4242424242424242` - Visa success
- `4000000000000002` - Declined card
- These should NOT work in live mode!

## Warning Signs You're Still in Test Mode
- Random card numbers work
- Payments show as "succeeded" but no real money moves
- Stripe dashboard shows test transactions
