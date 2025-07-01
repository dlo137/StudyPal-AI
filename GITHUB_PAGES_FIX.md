# 🚀 StudyPal AI - GitHub Pages Production Deployment Guide

## 🔧 Current Issue & Solution

Your AI API works locally but fails on GitHub Pages due to **CORS restrictions**. Here's the complete fix:

## ✅ Quick Fix Steps

### 1. GitHub Secrets Configuration

Go to your GitHub repository → Settings → Secrets and variables → Actions → Repository secrets

Add these secrets:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 2. Deploy Supabase Edge Function (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy the edge function
supabase functions deploy chat-with-ai

# Set the OpenAI API key as a secret
supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Test Your Deployment

1. Push your changes to the `main` branch
2. Wait for GitHub Actions to complete
3. Visit your GitHub Pages URL
4. Click the 🐛 debug button (bottom right) to see detailed diagnostics
5. Test the AI chat functionality

## 🔍 Debugging Tools Added

### Debug Panel Features:
- **Environment Detection**: Shows if running on GitHub Pages
- **API Configuration**: Validates OpenAI and Supabase setup
- **Network Information**: Browser and connection details
- **Live API Testing**: Test button to verify AI functionality
- **Console Logging**: Comprehensive logs for troubleshooting

### Access Debug Panel:
1. Open your deployed app
2. Look for the 🐛 button in the bottom-right corner
3. Click to open the debug panel
4. Use "Test AI Connection" to verify functionality

## 🌍 Environment Detection

The app now automatically detects:
- **Development Mode**: Uses direct OpenAI calls
- **GitHub Pages**: Falls back to Supabase Edge Functions
- **Configuration Issues**: Shows helpful error messages

## 📋 Console Logging

Check browser console for detailed logs:
- `🔧 OpenAI Module Loading...`
- `🌍 Environment: {...}`
- `🔑 API Key Check: {...}`
- `📤 Sending message to OpenAI...`
- `✅/❌ Status indicators`

## 🚨 Common Issues & Solutions

### Issue 1: "GitHub Pages CORS restrictions"
**Solution**: Deploy Supabase Edge Function (see step 2 above)

### Issue 2: "OpenAI API key not configured"
**Solution**: Add `VITE_OPENAI_API_KEY` to GitHub Secrets

### Issue 3: "No response from AI"
**Solution**: 
1. Check GitHub Actions build logs
2. Verify secrets are set correctly
3. Use debug panel to test connection

### Issue 4: Build fails
**Solution**: 
1. Check GitHub Actions logs
2. Ensure all dependencies are in package.json
3. Verify environment variables are set

## 🔄 Fallback Strategy

The app uses a smart fallback system:

1. **Primary**: Supabase Edge Function (production-safe)
2. **Secondary**: Direct OpenAI calls (development)
3. **Tertiary**: Demo mode with helpful messages

## 📱 Testing Checklist

- [ ] GitHub Secrets configured
- [ ] Supabase Edge Function deployed
- [ ] GitHub Actions build successful
- [ ] App loads on GitHub Pages
- [ ] Debug panel shows green status
- [ ] AI chat responds correctly
- [ ] No console errors

## 🆘 Still Having Issues?

1. **Check GitHub Actions logs**: Go to Actions tab in your repo
2. **Use Debug Panel**: Click 🐛 button and copy debug info
3. **Check Browser Console**: Look for error messages
4. **Verify Secrets**: Ensure all GitHub Secrets are set correctly

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs/guides/functions
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Vite Environment Variables**: https://vitejs.dev/guide/env-and-mode.html

---

**Next Steps**: After following this guide, your AI should work perfectly on GitHub Pages! 🎉
