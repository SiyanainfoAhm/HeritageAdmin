# Send Email Edge Function

This Supabase Edge Function sends emails using SendGrid API.

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

```bash
# Set SendGrid API Key (replace with your actual key)
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here

# Set From Email (replace with your verified sender email)
supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com

# Set From Name
supabase secrets set SENDGRID_FROM_NAME=Heritage Admin
```

### 5. Deploy the Function

```bash
supabase functions deploy send-email
```

### 6. Test the Function

```bash
supabase functions invoke send-email --body '{
  "to": "test@example.com",
  "subject": "Test Email",
  "html": "<p>This is a test email</p>",
  "text": "This is a test email"
}'
```

## Usage

The function can be called from your frontend code:

```typescript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    to: 'recipient@example.com',
    subject: 'Email Subject',
    html: '<p>HTML content</p>',
    text: 'Plain text content'
  }
});
```

## Environment Variables

Set these in Supabase Dashboard > Edge Functions > Settings > Secrets:

- `SENDGRID_API_KEY`: Your SendGrid API key
- `SENDGRID_FROM_EMAIL`: Email address to send from
- `SENDGRID_FROM_NAME`: Display name for sender

