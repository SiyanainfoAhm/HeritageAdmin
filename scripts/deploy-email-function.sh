#!/bin/bash

# Deploy SendGrid Email Edge Function
# This script deploys the send-email Edge Function to Supabase

echo "🚀 Deploying SendGrid Email Edge Function..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Set secrets (replace with your actual values)
echo "📝 Setting environment variables..."
echo "⚠️  Please set your SendGrid credentials:"
echo "   supabase secrets set SENDGRID_API_KEY=your-api-key-here"
echo "   supabase secrets set SENDGRID_FROM_EMAIL=your-email@example.com"
echo "   supabase secrets set SENDGRID_FROM_NAME=Heritage Admin"
# Uncomment and update with your actual values:
# supabase secrets set SENDGRID_API_KEY=your-api-key-here
# supabase secrets set SENDGRID_FROM_EMAIL=your-email@example.com
# supabase secrets set SENDGRID_FROM_NAME=Heritage Admin

# Deploy function
echo ""
echo "📦 Deploying function..."
supabase functions deploy send-email

echo ""
echo "✅ Deployment complete!"
echo ""
echo "Test the function with:"
echo "supabase functions invoke send-email --body '{\"to\":\"test@example.com\",\"subject\":\"Test\",\"html\":\"<p>Test</p>\"}'"

