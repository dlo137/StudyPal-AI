# Supabase Configuration

This directory contains Supabase Edge Functions for StudyPal AI.

## Edge Functions

### chat-with-ai

A secure server-side function that handles OpenAI API calls, solving CORS issues when deploying to GitHub Pages.

#### Setup Instructions

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Deploy the function**:
   ```bash
   supabase functions deploy chat-with-ai
   ```

3. **Set environment variables**:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Test the function**:
   ```bash
   supabase functions invoke chat-with-ai --data '{"messages":[{"role":"user","content":"Hello!"}]}'
   ```

#### Environment Variables Required

- `OPENAI_API_KEY`: Your OpenAI API key (starts with 'sk-')

#### How it Works

1. The client sends messages to the Supabase Edge Function
2. The Edge Function makes a secure server-side call to OpenAI
3. The response is returned to the client
4. This avoids CORS issues and keeps API keys secure

#### Benefits

- ✅ Works on GitHub Pages
- ✅ Keeps API keys secure (server-side only)
- ✅ No CORS issues
- ✅ Scalable and fast
- ✅ Built-in logging and monitoring
