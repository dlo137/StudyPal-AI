# 🚀 Complete Edge Function Setup Guide

## Step 1: Get Your OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy the key (starts with `sk-`)

## Step 2: Set the OpenAI API Key in Supabase

**Option A: Using Supabase CLI (Recommended)**

```powershell
# First, update the supabase/.env file with your real OpenAI API key
# Then set the secret in Supabase:
npx supabase secrets set --env-file supabase/.env --project-ref xphgwzbxwwaqoaedfsoq
```

**Option B: Using Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/settings/functions)
2. Navigate to Edge Functions → Settings
3. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key

## Step 3: Deploy the Edge Function

```powershell
# Deploy the updated function
npx supabase functions deploy chat-with-ai --project-ref xphgwzbxwwaqoaedfsoq
```

## Step 4: Test the Function

```powershell
# Test the function locally first
npx supabase functions serve chat-with-ai

# Then test on production using the GitHub Pages frontend
```

## Step 5: Verify CORS and Production Setup

The function is already configured with proper CORS headers for GitHub Pages. If you still get CORS errors:

1. Check the Supabase function logs:
   ```powershell
   npx supabase functions logs chat-with-ai --project-ref xphgwzbxwwaqoaedfsoq
   ```

2. Verify the function URL in your frontend matches:
   ```
   https://xphgwzbxwwaqoaedfsoq.supabase.co/functions/v1/chat-with-ai
   ```

## Troubleshooting

### If you get "Edge Function returned a non-2xx status code":

1. **Check the function logs** for specific error messages
2. **Verify the OpenAI API key** is set correctly in Supabase secrets
3. **Check payload size** - large images might exceed limits
4. **Verify CORS** - the function should handle GitHub Pages origin

### If images aren't being analyzed:

1. The function automatically detects images and uses GPT-4 Vision
2. Check that the image is properly base64 encoded
3. Verify the OpenAI API key has access to GPT-4 Vision

## Function Features

✅ **CORS Support**: Handles GitHub Pages requests  
✅ **Image Analysis**: Automatically uses GPT-4 Vision for images  
✅ **Text Chat**: Uses GPT-3.5 Turbo for text messages  
✅ **Error Handling**: Comprehensive error logging and responses  
✅ **Preflight Support**: Handles OPTIONS requests properly  

## Next Steps After Setup

1. Set your real OpenAI API key in `supabase/.env`
2. Run the deployment commands above
3. Test image upload/analysis on your GitHub Pages site
4. Check function logs if any issues occur

---

**Current Status**: ✅ Function code is ready, ⏳ Needs OpenAI API key configuration
