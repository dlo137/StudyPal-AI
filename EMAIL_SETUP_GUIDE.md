# Contact Form Email Setup

## Current Status
Your contact form is working but emails aren't being sent yet. Here are the setup options:

## Option 1: Resend (Recommended)
1. Sign up at https://resend.com (free: 3,000 emails/month)
2. Get your API key
3. Run this command in your project:
   ```bash
   npx supabase secrets set RESEND_API_KEY=re_your_actual_api_key_here
   ```

## Option 2: EmailJS (Free Alternative)
1. Sign up at https://emailjs.com
2. Create a service and template
3. Get your public key
4. Run:
   ```bash
   npx supabase secrets set EMAILJS_PUBLIC_KEY=your_public_key_here
   ```

## Option 3: Webhook (Zapier/Make.com)
1. Create a webhook in Zapier or Make.com
2. Set it to send emails to studypalhelpdesk@gmail.com
3. Run:
   ```bash
   npx supabase secrets set EMAIL_WEBHOOK_URL=your_webhook_url_here
   ```

## Current Fallback
Right now, all contact form submissions are being logged in the Supabase Edge Function logs.
You can view them at: https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/functions

## Test the Form
Once you set up any of the above options, the contact form will automatically start sending emails to studypalhelpdesk@gmail.com
