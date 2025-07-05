# Authentication & Payment System Troubleshooting Guide

## Current Issues You're Experiencing

### 1. **Stripe Payment Error**
```
❌ VITE_STRIPE_PUBLISHABLE_KEY is not defined
Payment system failed to load. Please check your internet connection and try again.
```

### 2. **Supabase Authentication Error**
```
AuthApiError: Invalid Refresh Token: Refresh Token Not Found
Failed to load resource: the server responded with a status of 400 ()
```

## Quick Fixes

### 🔧 **Fix 1: Clear Stale Authentication Tokens**

The Supabase errors are caused by corrupted refresh tokens in your browser storage. 

**In your browser console, run:**
```javascript
clearAllAuthData()
```

Then refresh the page. This will clear all stale authentication data.

### 🔧 **Fix 2: Set Up GitHub Repository Secrets**

The Stripe error is because environment variables aren't configured for GitHub Pages.

**Follow these steps:**

1. **Go to your GitHub repository:** `https://github.com/YOUR_USERNAME/StudyPal-AI`

2. **Navigate to Settings:**
   - Click "Settings" tab → "Secrets and variables" → "Actions"

3. **Add these secrets:**
   ```
   Name: VITE_STRIPE_PUBLISHABLE_KEY
   Value: pk_test_51RgCVxI3Uf0Ofl4lhQOEdzFq5xB3xyoHRdGS6t1t9UeFaXOrhl4jD6Y4YC6jqfAC8l49KMf54Yo0t1SnXBnQOBef00yTloj2Ba
   
   Name: VITE_STRIPE_GOLD_PRICE_ID  
   Value: price_1RgGnbI3Uf0Ofl4l1VzlJydJ
   
   Name: VITE_STRIPE_DIAMOND_PRICE_ID
   Value: price_1RgGnuI3Uf0Ofl4lfILb4Q90
   
   Name: VITE_SUPABASE_URL
   Value: https://xphgwzbxwwaqoaedfsoq.supabase.co
   
   Name: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGd3emJ4d3dhcW9hZWRmc29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjU0ODgsImV4cCI6MjA2NjgwMTQ4OH0.J6lqFQjg41BsaA1i0yWeIkAR_yN2ia7_FgkTnxmdzLU
   ```

4. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "Test GitHub secrets configuration"
   git push origin main
   ```

## Detailed Troubleshooting

### 🔍 **Diagnose Issues**

In your browser console, run:
```javascript
diagnoseAuthIssues()
```

This will check for common configuration problems and suggest fixes.

### 🧹 **Clear All Browser Data (Nuclear Option)**

If issues persist:

1. **Open Developer Tools** (F12)
2. **Go to Application/Storage tab**
3. **Clear all localStorage and sessionStorage**
4. **Clear cookies for your domain**
5. **Refresh the page**

### 📊 **Verify GitHub Secrets Are Working**

After setting up GitHub secrets:

1. **Check the build log:**
   - Go to your repository → "Actions" tab
   - Click the latest workflow run
   - Look for the "Build" step
   - You should see "SET" instead of "MISSING" for all environment variables

2. **Check the deployed site:**
   - Open browser console on your GitHub Pages site
   - Look for the Stripe debug logs
   - Should show key exists and proper length

## Expected Working State

### ✅ **Stripe Payment Working:**
- Card input is interactive and responsive
- No "Payment system failed to load" errors
- Console shows: `✅ Stripe Key Debug: { keyExists: true, keyLength: 107, ... }`

### ✅ **Supabase Authentication Working:**
- No refresh token errors in console
- User can sign up/sign in without issues
- Console shows: `✅ VITE_SUPABASE_URL is configured`

## Prevention

### 🔒 **For Future Development:**

1. **Always use GitHub secrets for production environment variables**
2. **Keep .env.local for local development only**
3. **Clear browser storage when switching between environments**
4. **Monitor console for authentication errors**

### 🚀 **Testing Checklist:**

- [ ] GitHub secrets are properly configured
- [ ] Build log shows "SET" for all environment variables
- [ ] Browser console shows no authentication errors
- [ ] Payment modal opens with functional card input
- [ ] Authentication flow works without token errors

## Debug Commands

These functions are available in your browser console:

```javascript
// Clear all authentication data
clearAllAuthData()

// Diagnose common issues  
diagnoseAuthIssues()

// Check environment variables
console.log(import.meta.env)
```

## Need More Help?

If issues persist after following this guide:

1. **Check the detailed logs in GitHub Actions**
2. **Verify your Stripe keys are valid in Stripe Dashboard**
3. **Ensure your Supabase project is active and accessible**
4. **Try testing in an incognito/private browser window**

The authentication and payment systems should work smoothly once the GitHub secrets are properly configured and stale tokens are cleared!
