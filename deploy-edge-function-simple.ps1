# Deploy Supabase Edge Function - Simple Version
# Run this script to deploy the updated chat-with-ai function to fix image upload issues

Write-Host "🚀 Deploying Supabase Edge Function..." -ForegroundColor Green

# Check if Supabase CLI is installed
Write-Host "🔍 Checking Supabase CLI..." -ForegroundColor Blue
if (Get-Command supabase -ErrorAction SilentlyContinue) {
    $supabaseVersion = supabase --version
    Write-Host "✅ Supabase CLI found: $supabaseVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Supabase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "npm install -g supabase" -ForegroundColor Yellow
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "supabase\functions\chat-with-ai\index.ts")) {
    Write-Host "❌ Please run this script from the project root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

Write-Host "📁 Project directory verified" -ForegroundColor Green

# Ask for project reference
$projectRef = Read-Host "Enter your Supabase project reference (find it in your Supabase dashboard URL)"

if ([string]::IsNullOrWhiteSpace($projectRef)) {
    Write-Host "❌ Project reference is required" -ForegroundColor Red
    exit 1
}

# Deploy the function
Write-Host "🔄 Deploying chat-with-ai function to project: $projectRef" -ForegroundColor Yellow

$deployCommand = "supabase functions deploy chat-with-ai --project-ref $projectRef"
Write-Host "Running: $deployCommand" -ForegroundColor Blue

Invoke-Expression $deployCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Edge Function deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. 📝 Set your OPENAI_API_KEY in Supabase dashboard" -ForegroundColor White
    Write-Host "2. 🌐 Go to: https://supabase.com/dashboard/project/$projectRef/functions" -ForegroundColor Blue
    Write-Host "3. 🧪 Test image uploads on your GitHub Pages site" -ForegroundColor White
} else {
    Write-Host "❌ Deployment failed!" -ForegroundColor Red
    Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
    Write-Host "   - Make sure you're logged in: supabase login" -ForegroundColor White
    Write-Host "   - Check your project reference is correct" -ForegroundColor White
    Write-Host "   - Ensure you have permissions to deploy functions" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 Done!" -ForegroundColor Green
