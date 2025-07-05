# GitHub Secrets Setup for Stripe Payment Integration

## Required GitHub Secrets

To fix the "VITE_STRIPE_PUBLISHABLE_KEY is not defined" error, you need to set up GitHub repository secrets.

### Step-by-Step Instructions

1. **Go to your GitHub repository**
   - Navigate to: `https://github.com/YOUR_USERNAME/StudyPal-AI`

2. **Access Repository Settings**
   - Click the "Settings" tab (at the top of the repository page)

3. **Navigate to Secrets and Variables**
   - In the left sidebar, click "Secrets and variables"
   - Click "Actions"

4. **Add Required Secrets**
   Click "New repository secret" for each of the following:

   **Secret Name:** `VITE_STRIPE_PUBLISHABLE_KEY`
   **Value:** Your Stripe publishable key (starts with `pk_test_` or `pk_live_`)
   
   **Secret Name:** `VITE_STRIPE_GOLD_PRICE_ID`
   **Value:** Your Stripe price ID for the Gold plan (starts with `price_`)
   
   **Secret Name:** `VITE_STRIPE_DIAMOND_PRICE_ID`
   **Value:** Your Stripe price ID for the Diamond plan (starts with `price_`)
   
   **Secret Name:** `VITE_SUPABASE_URL`
   **Value:** Your Supabase project URL
   
   **Secret Name:** `VITE_SUPABASE_ANON_KEY`
   **Value:** Your Supabase anonymous key

### Where to Find Your Stripe Keys

1. **Stripe Publishable Key:**
   - Go to your Stripe Dashboard
   - Navigate to "Developers" → "API keys"
   - Copy the "Publishable key" (starts with `pk_test_` for test mode)

2. **Stripe Price IDs:**
   - Go to your Stripe Dashboard
   - Navigate to "Products" 
   - Click on your Gold/Diamond plans
   - Copy the Price ID (starts with `price_`)

### Where to Find Your Supabase Keys

1. **Supabase URL and Anon Key:**
   - Go to your Supabase project dashboard
   - Navigate to "Settings" → "API"
   - Copy the "Project URL" and "anon public" key

### Verification

After adding all secrets:

1. **Trigger a new deployment:**
   ```bash
   git commit --allow-empty -m "Trigger deployment to test secrets"
   git push origin main
   ```

2. **Check the GitHub Actions build log:**
   - Go to the "Actions" tab in your repository
   - Click on the latest workflow run
   - Look for the "Build" step output
   - You should see "SET" for all environment variables instead of "MISSING"

3. **Test on your GitHub Pages site:**
   - Visit your deployed site
   - Try to purchase a plan
   - The card input should now be functional

### Troubleshooting

**If you still see "MISSING" in the build logs:**
- Double-check the secret names match exactly (case-sensitive)
- Ensure there are no extra spaces in the secret values
- Verify the secrets are set at the repository level, not organization level

**If the card input is still greyed out:**
- Open browser console and look for Stripe-related error messages
- Check that the secret values are correct Stripe keys
- Ensure you're using test keys for development/testing

### Security Notes

- ✅ Never commit these values to your repository
- ✅ Use test keys for development
- ✅ GitHub secrets are encrypted and only accessible during builds
- ✅ Only use live keys when you're ready for production payments

Once all secrets are properly configured, your Stripe payment integration will work correctly on GitHub Pages!
