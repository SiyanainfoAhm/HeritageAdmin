# PowerShell script to deploy SendGrid Email Edge Function
# Run: .\scripts\deploy-email-function.ps1

Write-Host "🚀 Deploying SendGrid Email Edge Function..." -ForegroundColor Cyan
Write-Host ""

# Check if supabase CLI is installed
if (-not (Get-Command supabase -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Supabase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g supabase
}

# Set secrets (replace with your actual credentials)
Write-Host "📝 Setting environment variables..." -ForegroundColor Cyan
Write-Host "⚠️  Please update this script with your actual SendGrid credentials!" -ForegroundColor Yellow
# Uncomment and update with your actual values:
# supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here
# supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com
# supabase secrets set SENDGRID_FROM_NAME=Heritage Admin

# Deploy function
Write-Host ""
Write-Host "📦 Deploying function..." -ForegroundColor Cyan
supabase functions deploy send-email

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Test the function with:" -ForegroundColor Yellow
Write-Host 'supabase functions invoke send-email --body ''{"to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'''

