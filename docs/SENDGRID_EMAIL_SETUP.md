# SendGrid Email Setup Guide

This guide explains how to set up email sending using SendGrid for verification notifications.

## Current Implementation

The email service has been integrated to send emails when verifications are approved or rejected.

## SendGrid Configuration

- **API Key**: Set via environment variable `VITE_SENDGRID_API_KEY` or Supabase secret `SENDGRID_API_KEY`
- **From Email**: Set via environment variable `VITE_SENDGRID_FROM_EMAIL` or Supabase secret `SENDGRID_FROM_EMAIL`
- **From Name**: Set via environment variable `VITE_SENDGRID_FROM_NAME` or Supabase secret `SENDGRID_FROM_NAME`

## Setup Options

### Option 1: Supabase Edge Function (Recommended)

1. **Deploy the Edge Function**:
   ```bash
   # Install Supabase CLI if not already installed
   npm install -g supabase
   
   # Login to Supabase
   supabase login
   
   # Link to your project
   supabase link --project-ref your-project-ref
   
   # Deploy the function
   supabase functions deploy send-email
   ```

2. **Set Environment Variables in Supabase**:
   - Go to Supabase Dashboard > Edge Functions > Settings
   - Add secrets:
     - `SENDGRID_API_KEY`: Your SendGrid API key
     - `SENDGRID_FROM_EMAIL`: Your verified sender email
     - `SENDGRID_FROM_NAME`: Display name for sender

3. **Test the Function**:
   ```bash
   supabase functions invoke send-email --body '{"to":"test@example.com","subject":"Test","html":"<p>Test email</p>"}'
   ```

### Option 2: Direct API Call (May have CORS issues)

The current implementation tries to call SendGrid API directly. This may fail due to CORS restrictions in the browser.

**To enable CORS for SendGrid** (if needed):
- SendGrid doesn't support CORS for browser requests
- You must use a backend service or Edge Function

### Option 3: Environment Variables (For Local Development)

Create a `.env` file in the project root:

```env
VITE_SENDGRID_API_KEY=your-sendgrid-api-key-here
VITE_SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com
VITE_SENDGRID_FROM_NAME=Heritage Admin
```

## How It Works

1. When a verification is approved/rejected:
   - The system fetches the email template
   - Replaces template variables ({{userName}}, {{entityType}}, etc.)
   - Calls `EmailService.sendEmail()`
   - Logs the result to `heritage_notification_log` table

2. Email sending flow:
   - Tries Supabase Edge Function first (if deployed)
   - Falls back to direct API call (may fail due to CORS)
   - Logs success/failure to database

## Testing

### Test Email Sending

1. **Check Notification Logs**:
   ```bash
   npm run check-notification-log saxena.jatin1987@gmail.com
   ```

2. **Verify Templates Exist**:
   ```bash
   npm run create-verification-templates
   ```

3. **Approve a Verification**:
   - Go to Verification page
   - Approve a hotel owner record
   - Check browser console for email sending logs
   - Check notification log table in database

## Troubleshooting

### Email Not Sending

1. **Check Browser Console**:
   - Look for email sending errors
   - Check if template was found
   - Verify user email exists

2. **Check Notification Log**:
   ```sql
   SELECT * FROM heritage_notification_log 
   WHERE recipient = 'saxena.jatin1987@gmail.com' 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Verify Template Exists**:
   ```sql
   SELECT * FROM heritage_notification_templates 
   WHERE template_key = 'verification_approved' AND is_active = true;
   ```

4. **Check SendGrid**:
   - Verify API key is correct
   - Check SendGrid dashboard for email activity
   - Verify sender email is verified in SendGrid

### Common Issues

- **CORS Error**: Use Supabase Edge Function instead of direct API call
- **Template Not Found**: Run `npm run create-verification-templates`
- **User Email Missing**: Verify email exists in `heritage_user` table
- **SendGrid API Error**: Check API key and sender verification

## Security Notes

⚠️ **Important**: 
- Never commit SendGrid API keys to version control
- Use environment variables for production
- Store secrets in Supabase Edge Function secrets (not in code)
- The API key in the code is for development only

## Next Steps

1. Deploy Supabase Edge Function for production
2. Set up environment variables properly
3. Test email sending with real verifications
4. Monitor SendGrid dashboard for delivery status

