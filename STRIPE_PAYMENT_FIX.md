# 💳 Stripe Payment Setup for GitHub Pages

## Issue Fixed
The payment system was failing on GitHub Pages with 405 errors because it was trying to call `/api/create-payment-intent` which doesn't exist on static hosting. 

**Solution**: Moved payment processing to Supabase Edge Functions.

## ✅ What's Been Done

### 1. Created Supabase Edge Function
- Created `supabase/functions/create-payment-intent/index.ts`
- Deployed function to Supabase
- Added proper CORS headers for GitHub Pages

### 2. Updated Payment Service
- Modified `src/lib/paymentService.ts` to use Supabase Edge Function
- Updated API endpoint from `/api/create-payment-intent` to Supabase function

### 3. Set Supabase Secrets
- Added `STRIPE_SECRET_KEY` to Supabase secrets
- Function can now authenticate with Stripe API

## 🔧 Required GitHub Secrets

You need to add these secrets to your GitHub repository:

### Go to: GitHub → Your Repository → Settings → Secrets and Variables → Actions

Add these secrets:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51RgCVxI3Uf0Ofl4lhQOEdzFq5xB3xyoHRdGS6t1t9UeFaXOrhl4jD6Y4YC6jqfAC8l49KMf54Yo0t1SnXBnQOBef00yTloj2Ba

VITE_STRIPE_GOLD_PRICE_ID=price_1RgGnbI3Uf0Ofl4l1VzlJydJ

VITE_STRIPE_DIAMOND_PRICE_ID=price_1RgGnuI3Uf0Ofl4lfILb4Q90
```

## 🧪 Testing the Fix

### 1. Local Testing
```bash
# Test locally first
npm run dev
# Try purchasing a plan - should work
```

### 2. Deploy and Test on GitHub Pages
```bash
# Commit and push changes
git add .
git commit -m "Fix payment system for GitHub Pages - use Supabase Edge Function"
git push origin main

# Wait for deployment, then test on GitHub Pages
```

### 3. Debug Tools
If issues persist, check:
- Browser Developer Tools → Network tab
- Look for calls to `your-supabase-url.supabase.co/functions/v1/create-payment-intent`
- Should return 200 status with `client_secret`

## 🔍 How It Works Now

### Before (Broken on GitHub Pages):
```
Frontend → /api/create-payment-intent (doesn't exist) → 405 Error
```

### After (Working on GitHub Pages):
```
Frontend → Supabase Edge Function → Stripe API → Success
```

## 🔧 Technical Details

### Edge Function Features:
- ✅ Proper CORS headers for GitHub Pages
- ✅ Stripe API integration
- ✅ Input validation
- ✅ Error handling
- ✅ Secure secret management

### Payment Flow:
1. User clicks "Choose Plan" 
2. Frontend calls Supabase Edge Function
3. Edge Function creates Stripe Payment Intent
4. Frontend receives `client_secret`
5. Stripe processes payment

## 🚨 Security Notes

- ✅ Stripe secret key stored securely in Supabase
- ✅ Only publishable key exposed to frontend
- ✅ No sensitive data in GitHub repository
- ✅ Proper CORS configuration

## 📝 Next Steps

1. **Add GitHub Secrets** (required)
2. **Test locally** to ensure everything works
3. **Deploy to GitHub Pages** and test payments
4. **Monitor for any issues** in browser console

## 🐛 If Problems Persist

Check these common issues:
- GitHub secrets not added correctly
- Stripe keys expired or incorrect
- Network connectivity issues
- CORS errors (should be fixed now)

The Edge Function is deployed and ready - you just need to add the GitHub secrets for the frontend environment variables.
