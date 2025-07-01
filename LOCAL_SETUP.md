# StudyPal AI - Local Development Setup

## Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Add your API keys to `.env.local`**:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Open browser**:
   - Go to http://localhost:5173
   - Click the 🐛 debug button to verify setup
   - Test the AI chat functionality

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `VITE_OPENAI_API_KEY` | Your OpenAI API key (starts with 'sk-') | Yes |

## Debugging

- **Debug Panel**: Click 🐛 button in bottom-right corner
- **Console Logs**: Open browser dev tools → Console tab
- **Network Tab**: Check for failed API requests

## Production Deployment

See `GITHUB_PAGES_FIX.md` for complete deployment instructions.
