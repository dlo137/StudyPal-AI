# Deploy Supabase Edge Function
# Run this script to deploy the updated chat-with-ai function to fix image upload issues

Write-Host "🚀 Deploying Supabase Edge Function..." -ForegroundColor Green

# Check if Supabase CLI is installed
try {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "supabase\functions\chat-with-ai\index.ts")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Blue

# Deploy the function
Write-Host "🔄 Deploying chat-with-ai function..." -ForegroundColor Yellow
try {
    supabase functions deploy chat-with-ai --project-ref YOUR_PROJECT_REF
    Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
    Write-Host "📝 Don't forget to set your OPENAI_API_KEY in Supabase dashboard" -ForegroundColor Yellow
    Write-Host "🌐 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT_REF/functions" -ForegroundColor Blue
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure you're logged in: supabase login" -ForegroundColor Yellow
    Write-Host "💡 And have initialized the project: supabase init" -ForegroundColor Yellow
}

Write-Host "🎉 Done!" -ForegroundColor Green
