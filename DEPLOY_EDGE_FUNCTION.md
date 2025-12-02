# Deploy SendGrid Email Edge Function

## Quick Setup Guide

Since SendGrid API has CORS restrictions, we need to use Supabase Edge Functions (server-side) to send emails.

### Step 1: Install Supabase CLI

```bash
npm install -g supabase
```

### Step 2: Login to Supabase

```bash
supabase login
```

### Step 3: Link to Your Project

```bash
supabase link --project-ref ecvqhfbiwqmqgiqfxheu
```

### Step 4: Set Secrets (Environment Variables)

```bash
# Set SendGrid API Key (replace with your actual key)
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here

# Set From Email (replace with your verified sender email)
supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com

# Set From Name  
supabase secrets set SENDGRID_FROM_NAME=Heritage Admin
```

### Step 5: Deploy the Function

```bash
supabase functions deploy send-email
```

### Step 6: Verify Deployment

Check in Supabase Dashboard:
- Go to Edge Functions
- You should see `send-email` function listed
- Check that secrets are set correctly

### Step 7: Test the Function

```bash
supabase functions invoke send-email --body '{
  "to": "saxena.jatin1987@gmail.com",
  "subject": "Test Email",
  "html": "<h1>Test</h1><p>This is a test email from Heritage Admin</p>",
  "text": "Test - This is a test email from Heritage Admin"
}'
```

## Alternative: Set Secrets via Supabase Dashboard

If CLI doesn't work, you can set secrets via Dashboard:

1. Go to Supabase Dashboard
2. Navigate to: **Edge Functions** > **Settings** > **Secrets**
3. Add these secrets (replace with your actual credentials):
   - `SENDGRID_API_KEY` = `your-sendgrid-api-key-here`
   - `SENDGRID_FROM_EMAIL` = `your-verified-sender-email@example.com`
   - `SENDGRID_FROM_NAME` = `Heritage Admin`

## After Deployment

Once deployed, the email service will automatically use the Edge Function instead of trying direct API calls.

Test by approving a verification - the email should be sent successfully!

## Troubleshooting

### Function Not Found Error
- Make sure you've deployed: `supabase functions deploy send-email`
- Check function name matches exactly: `send-email`

### Authentication Error
- Verify secrets are set correctly
- Check SendGrid API key is valid

### CORS Still Happening
- Edge Functions handle CORS automatically
- If you see CORS errors, the function might not be deployed correctly

