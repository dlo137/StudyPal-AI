# Image Upload Error Troubleshooting Guide

## Problem
Getting "edge function error: edge function returned a non-2xx status code" when uploading images on GitHub Pages.

## Root Cause
The Supabase Edge Function was not properly handling image content in chat messages. Images are sent as base64 data URLs in the message content array, but the original function only expected text messages.

## Solution Applied

### 1. Updated Edge Function Interface
- Modified `ChatMessage` interface to support both string and array content (for images)
- Added support for `image_url` type in message content

### 2. Enhanced Error Handling
- Added proper HTTP status codes for different error types
- Improved request validation
- Better error messages for debugging

### 3. Model Selection Logic
- Automatically detects if messages contain images
- Uses `gpt-4-vision-preview` for image analysis
- Falls back to `gpt-3.5-turbo` for text-only messages
- Adjusts token limits based on content type

### 4. Improved Logging
- Better console logging for debugging
- Tracks whether messages contain images
- Logs model selection decisions

## How to Deploy the Fix

### Option 1: Using PowerShell Script (Recommended)
```powershell
# Run from project root
.\deploy-edge-function.ps1
```

### Option 2: Manual Deployment
```bash
# Login to Supabase (if not already)
supabase login

# Deploy the function
supabase functions deploy chat-with-ai --project-ref YOUR_PROJECT_REF
```

## Environment Variables Required
Make sure these are set in your Supabase project dashboard:

1. **OPENAI_API_KEY**: Your OpenAI API key with GPT-4 Vision access
2. **ENVIRONMENT**: Set to 'production' for production builds

## Verification Steps

1. **Deploy the function** using the commands above
2. **Test text-only messages** first to ensure basic functionality
3. **Test image uploads** - should now work without errors
4. **Check Supabase logs** in dashboard if issues persist

## Common Issues After Fix

### Issue: Still getting errors
**Solution**: 
- Verify the function deployed successfully
- Check Supabase logs in dashboard
- Ensure OPENAI_API_KEY is set correctly

### Issue: "Model not found" errors
**Solution**: 
- Verify your OpenAI account has access to GPT-4 Vision
- Check API key permissions
- Try upgrading your OpenAI plan if needed

### Issue: High response times
**Solution**: 
- This is normal for vision model processing
- Images take longer to analyze than text
- Consider optimizing image size before upload

## File Changes Made

1. **supabase/functions/chat-with-ai/index.ts**: Complete rewrite with image support
2. **deploy-edge-function.ps1**: New deployment script
3. **IMAGE_UPLOAD_FIX.md**: This troubleshooting guide

## Testing Your Fix

1. Go to your deployed GitHub Pages site
2. Try uploading an image without text
3. Try uploading an image with text
4. Try text-only messages
5. All should work without "non-2xx status code" errors

## Support Resources

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [OpenAI Vision API Docs](https://platform.openai.com/docs/guides/vision)
- [GitHub Pages Deployment Guide](https://docs.github.com/en/pages)

If you continue to experience issues, check the browser console and Supabase function logs for specific error messages.
