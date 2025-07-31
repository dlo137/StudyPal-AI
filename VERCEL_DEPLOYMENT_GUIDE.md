# Deploy StudyPal-AI to Vercel

## Step 1: Prepare Your Repository

1. **Make sure your code is pushed to GitHub**
2. **Ensure your build works locally:**
   ```bash
   npm run build
   npm run preview
   ```

## Step 2: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. **Sign up with GitHub** (recommended)
3. **Authorize Vercel** to access your repositories

## Step 3: Import Your Project

1. **Click "New Project"**
2. **Select your StudyPal-AI repository**
3. **Configure build settings:**
   - Framework Preset: **Vite**
   - Root Directory: **LEAVE EMPTY** (don't put `.` or `./`)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

## Step 4: Set Environment Variables

In Vercel dashboard, add these environment variables:

### **Required Environment Variables:**
```
VITE_SUPABASE_URL=https://xphgwzbxwwaqoaedfsoq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwaGd3emJ4d3dhcW9hZWRmc29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjU0ODgsImV4cCI6MjA2NjgwMTQ4OH0.J6lqFQjg41BsaA1i0yWeIkAR_yN2ia7_FgkTnxmdzLU
VITE_OPENAI_API_KEY=sk-proj-YOUR_OPENAI_KEY_HERE
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51RgCVxI3Uf0Ofl4lDYoyPZlcSWrGgHwuUw1UP3YbErpKcBeu4eqLLjCVSxezyH8oIPZSA2iG0tRmEeGzNHUnM0mL00KDz5HAML
VITE_STRIPE_GOLD_PRICE_ID=price_1RgGV9I3Uf0Ofl4lXGpTYeqE
VITE_STRIPE_DIAMOND_PRICE_ID=price_1RgGX0I3Uf0Ofl4l0OsBGZq0
```

## Step 5: Configure Build Settings

If needed, create `vercel.json` in your project root:

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": "dist"
}
```

## Step 6: Deploy

1. **Click "Deploy"**
2. **Wait for build to complete**
3. **Get your live URL** (e.g., `studypal-ai.vercel.app`)

### 🚨 **If you see a blank page:**

1. **Check browser console** (F12 → Console tab)
2. **Look for error messages** (red text)
3. **Common issues:**
   - Missing environment variables
   - JavaScript errors
   - Routing problems

**Quick fix steps:**
1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. **Make sure ALL environment variables are added**
3. **Redeploy** if variables were missing

## Step 7: Custom Domain (Optional)

1. **Buy a domain** (e.g., `studypal-ai.com`)
2. **In Vercel dashboard:** Settings → Domains
3. **Add your custom domain**
4. **Update DNS records** as instructed

## Step 8: Update Supabase URLs

1. **Go to Supabase Dashboard**
2. **Authentication → URL Configuration**
3. **Add your new Vercel URL** to allowed origins:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)

## Benefits of Vercel vs GitHub Pages

### ✅ **Vercel Advantages:**
- **Environment variables** built-in (no more GitHub secrets hassle)
- **Automatic HTTPS** on custom domains
- **Better performance** with global CDN
- **Serverless functions** support
- **Real-time analytics**
- **Branch previews** for testing
- **No build artifacts** in your repo

### ❌ **GitHub Pages Limitations:**
- No environment variables support
- Static hosting only
- Limited custom domain options
- No serverless functions

## Troubleshooting

### **Build Errors:**
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Test build locally first

### **Runtime Errors:**
- Check browser console
- Verify environment variables are loaded
- Check Supabase URLs are updated

### **Domain Issues:**
- DNS propagation can take 24-48 hours
- Use DNS checker tools to verify

## Cost

- **Free tier:** Perfect for your app
- **Pro:** $20/month (only if you need more)
- **Custom domains:** Free on all plans

Your StudyPal-AI app is perfect for Vercel's free tier!
