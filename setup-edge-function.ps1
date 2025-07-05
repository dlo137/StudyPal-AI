# 🚀 Edge Function Setup and Deployment Script
# This script helps set up the OpenAI API key and deploy the Edge Function

Write-Host "🔧 StudyPal AI Edge Function Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if Supabase CLI is available
Write-Host "📋 Checking Supabase CLI..." -ForegroundColor Yellow
try {
    $supabaseVersion = npx supabase --version 2>$null
    if ($supabaseVersion) {
        Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
        npm install -g supabase
    }
} catch {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Red
    npm install -g supabase
}

Write-Host ""
Write-Host "🔑 IMPORTANT: You need to set up your OpenAI API key!" -ForegroundColor Red
Write-Host ""
Write-Host "Steps to get your OpenAI API key:" -ForegroundColor White
Write-Host "1. Go to: https://platform.openai.com/api-keys" -ForegroundColor Gray
Write-Host "2. Create a new API key" -ForegroundColor Gray
Write-Host "3. Copy the key (starts with 'sk-')" -ForegroundColor Gray
Write-Host ""

# Prompt for OpenAI API key
$openaiKey = Read-Host "Enter your OpenAI API key (or press Enter to skip and set manually later)"

if ($openaiKey -and $openaiKey.StartsWith("sk-")) {
    Write-Host "✅ Setting OpenAI API key..." -ForegroundColor Green
    
    # Update the supabase/.env file
    $envContent = @"
# Supabase Edge Function Environment Variables
# This file contains secrets for Supabase Edge Functions

# OpenAI API Key for the chat-with-ai Edge Function
OPENAI_API_KEY=$openaiKey
"@
    
    $envContent | Out-File -FilePath "supabase\.env" -Encoding UTF8
    Write-Host "✅ Updated supabase/.env file" -ForegroundColor Green
    
    # Set secrets in Supabase
    Write-Host "🔄 Setting secrets in Supabase..." -ForegroundColor Yellow
    try {
        npx supabase secrets set --env-file supabase/.env --project-ref xphgwzbxwwaqoaedfsoq
        Write-Host "✅ Secrets set successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to set secrets. You can set them manually in the Supabase dashboard." -ForegroundColor Red
        Write-Host "Dashboard: https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/settings/functions" -ForegroundColor Gray
    }
} else {
    Write-Host "⏭️  Skipping API key setup. You'll need to set it manually." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To set manually:" -ForegroundColor White
    Write-Host "1. Edit supabase/.env and replace 'your_openai_api_key_here' with your actual key" -ForegroundColor Gray
    Write-Host "2. Run: npx supabase secrets set --env-file supabase/.env --project-ref xphgwzbxwwaqoaedfsoq" -ForegroundColor Gray
    Write-Host "OR set in dashboard: https://supabase.com/dashboard/project/xphgwzbxwwaqoaedfsoq/settings/functions" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Deploying Edge Function..." -ForegroundColor Yellow

try {
    npx supabase functions deploy chat-with-ai --project-ref xphgwzbxwwaqoaedfsoq
    Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Setup Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your Edge Function is now available at:" -ForegroundColor White
    Write-Host "https://xphgwzbxwwaqoaedfsoq.supabase.co/functions/v1/chat-with-ai" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Features enabled:" -ForegroundColor Green
    Write-Host "  • Image analysis with GPT-4 Vision" -ForegroundColor Gray
    Write-Host "  • Text chat with GPT-3.5 Turbo" -ForegroundColor Gray
    Write-Host "  • CORS support for GitHub Pages" -ForegroundColor Gray
    Write-Host "  • Comprehensive error handling" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🧪 Test your function on GitHub Pages!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Deployment failed. Check the error above." -ForegroundColor Red
    Write-Host ""
    Write-Host "Common solutions:" -ForegroundColor White
    Write-Host "1. Make sure you are logged into Supabase CLI" -ForegroundColor Gray
    Write-Host "2. Verify your project ref is correct: xphgwzbxwwaqoaedfsoq" -ForegroundColor Gray
    Write-Host "3. Check your internet connection" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📚 For troubleshooting, see: EDGE_FUNCTION_SETUP.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
