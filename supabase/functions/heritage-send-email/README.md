# Heritage Send Email Edge Function

This Supabase Edge Function sends emails using SendGrid API directly. It's designed to bypass CORS restrictions when called from web browsers.

## Deployment

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref ecvqhfbiwqmqgiqfxheu
```

### 4. Set Environment Variables (Secrets)

Set these secrets in Supabase (never commit API keys to version control):

```bash
# Set SendGrid API Key (get from SendGrid dashboard)
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here

# Set From Email
supabase secrets set SENDGRID_FROM_EMAIL=jatin.saksena@siyanainfo.com

# Set From Name
supabase secrets set SENDGRID_FROM_NAME=Heritage Admin
```

**Note:** You can verify and manage secrets in:
- Supabase Dashboard > Project Settings > Edge Functions > Secrets

**Security:** Never commit API keys to version control. Always use Supabase secrets for sensitive credentials.

### 5. Deploy the Function

```bash
supabase functions deploy heritage-send-email
```

### 6. Test the Function

```bash
supabase functions invoke heritage-send-email --body '{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<p>This is a test email</p>",
  "text": "This is a test email"
}'
```

## Usage

The function is automatically called by the `EmailService` when:
- Running in a web browser (to bypass CORS)
- Direct SendGrid API call fails due to CORS
- `useEdgeFunction: true` is set in email options

### Manual Invocation

```typescript
const response = await fetch('https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-send-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'your-supabase-anon-key',
    'Authorization': 'Bearer your-supabase-anon-key',
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Email Subject',
    html: '<p>HTML content</p>',
    text: 'Plain text content',
    from: 'sender@example.com', // Optional, uses SENDGRID_FROM_EMAIL if not provided
    fromName: 'Sender Name' // Optional, uses SENDGRID_FROM_NAME if not provided
  })
});
```

## Request Body

```typescript
{
  to: string;           // Required: Recipient email address
  subject: string;      // Required: Email subject
  html: string;        // Required: HTML email content
  text?: string;        // Optional: Plain text version
  from?: string;        // Optional: Override sender email
  fromName?: string;    // Optional: Override sender name
}
```

## Response

### Success

```json
{
  "success": true,
  "messageId": "x-message-id-from-sendgrid"
}
```

### Error

```json
{
  "success": false,
  "error": "Error message",
  "status": 500
}
```

## Environment Variables

The function uses these environment variables (set as Supabase secrets):

- `SENDGRID_API_KEY`: Your SendGrid API key (required)
- `SENDGRID_FROM_EMAIL`: Default sender email (optional, defaults to `jatin.saksena@siyanainfo.com`)
- `SENDGRID_FROM_NAME`: Default sender name (optional, defaults to `Heritage Admin`)

## How It Works

1. **Receives request** from frontend with email details
2. **Reads SendGrid API key** from environment variables (Supabase secrets)
3. **Calls SendGrid API** directly: `https://api.sendgrid.com/v3/mail/send`
4. **Returns result** with success status and message ID

## CORS Handling

The function includes proper CORS headers to allow requests from web browsers:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Headers: authorization, x-client-info, apikey, content-type`
- `Access-Control-Allow-Methods: POST, OPTIONS`

## Logging

The function logs:
- Email sending attempts
- SendGrid API responses
- Errors and error details

Check logs in: Supabase Dashboard > Edge Functions > heritage-send-email > Logs

