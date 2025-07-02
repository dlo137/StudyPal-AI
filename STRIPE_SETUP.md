# Stripe Integration Setup Guide

This guide will help you set up Stripe payments for StudyPal AI.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Node.js and npm installed
3. Your StudyPal AI application running

## Step 1: Get Your Stripe Keys

1. Log in to your Stripe Dashboard
2. Go to **Developers** > **API keys**
3. Copy your **Publishable key** (starts with `pk_test_`)
4. Copy your **Secret key** (starts with `sk_test_`)

## Step 2: Create Products and Prices

1. In Stripe Dashboard, go to **Products**
2. Create two products:

### Gold Plan
- Name: "StudyPal Gold Plan"
- Description: "50 requests daily, email & chat support"
- Price: $9.99 USD (recurring monthly)
- Copy the **Price ID** (starts with `price_`)

### Diamond Plan
- Name: "StudyPal Diamond Plan" 
- Description: "150 requests daily, priority support, export history"
- Price: $19.99 USD (recurring monthly)
- Copy the **Price ID** (starts with `price_`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Stripe keys:

```bash
# Stripe Configuration (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_STRIPE_GOLD_PRICE_ID=price_your_actual_gold_price_id
VITE_STRIPE_DIAMOND_PRICE_ID=price_your_actual_diamond_price_id

# Stripe Configuration (Backend)
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

## Step 4: Set Up Webhooks (Optional but Recommended)

1. In Stripe Dashboard, go to **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `http://localhost:3001/api/webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Copy the **Webhook signing secret** (starts with `whsec_`)
6. Add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_your_actual_webhook_secret
```

## Step 5: Run the Application

1. Start the backend server:
   ```bash
   npm run server:dev
   ```

2. In a new terminal, start the frontend:
   ```bash
   npm run dev
   ```

3. Navigate to the Premium Features page and test payments with Stripe test cards:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Step 6: Test the Integration

1. Go to `/premium` in your app
2. Click "Choose Gold" or "Choose Diamond"
3. Fill out the payment form with test card details
4. Verify the payment completes successfully

## Production Setup

When ready for production:

1. Switch to live mode in Stripe Dashboard
2. Get your live API keys (they'll start with `pk_live_` and `sk_live_`)
3. Update your environment variables
4. Update webhook endpoint to your production URL
5. Test with real payment methods

## Troubleshooting

- **Payment fails**: Check browser console and server logs
- **Webhook errors**: Verify endpoint URL and signing secret
- **CORS issues**: Ensure your frontend URL is allowed in server CORS config

## Security Notes

- Never commit `.env.local` to version control
- Use environment variables for all sensitive keys
- Enable webhook signature verification in production
- Use HTTPS in production
