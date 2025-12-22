# Deploy FCM Edge Function

## Quick Deployment Guide

### Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Logged into Supabase: `supabase login`
3. Linked to your project: `supabase link --project-ref ecvqhfbiwqmqgiqfxheu`

### Step 1: Deploy the Edge Function

```bash
# Navigate to project root
cd /path/to/HeritageAdmin

# Deploy the function
supabase functions deploy heritage-send-fcm
```

### Step 2: Set Environment Secrets

After deployment, set the Firebase service account JSON as a Supabase secret:

**Linux/Mac:**
```bash
# Store the full service account JSON file as a single-line string
supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"
```

**Windows PowerShell:**
```powershell
# Store the full service account JSON file as a single-line string
supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(Get-Content .\service-account.json -Raw)"
```

**Manual (if needed):**
```bash
# Copy the entire JSON content (as a single line) and set it
supabase secrets set FCM_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"heritage-41197",...}'
```

**Important:** The service account JSON must include:
- `project_id`
- `client_email`
- `private_key`
- `token_uri`

### Step 3: Verify Deployment

Test the function:

```bash
supabase functions invoke heritage-send-fcm --body '{
  "token": "test-device-token",
  "title": "Test Notification",
  "body": "This is a test push notification"
}'
```

Or test via the URL:
```bash
curl -X POST https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-send-fcm \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "token": "test-device-token",
    "title": "Test",
    "body": "Test notification"
  }'
```

### Step 4: Check Function Status

View function logs:
```bash
supabase functions logs heritage-send-fcm
```

## Troubleshooting

### 404 Error
If you get a 404 error, the function is not deployed. Run:
```bash
supabase functions deploy heritage-send-fcm
```

### 500 Error - Credentials Not Configured
If you get "Missing secret: FCM_SERVICE_ACCOUNT_JSON", set the secret:
```bash
# Linux/Mac
supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(cat service-account.json)"

# Windows PowerShell
supabase secrets set FCM_SERVICE_ACCOUNT_JSON="$(Get-Content .\service-account.json -Raw)"
```

### UNREGISTERED Error
If you get "UNREGISTERED" error, this means:
- The FCM token is invalid or expired
- The device may have uninstalled the app
- The token needs to be refreshed

**Solution:** Update the token in `heritage_user_fcm_tokens` table:
- Mark old tokens as `is_active = false`
- Request new tokens from the mobile app
- Update the database with fresh tokens

### View Current Secrets
```bash
supabase secrets list
```

## Function URL

Once deployed, the function will be available at:
```
https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-send-fcm
```

This URL is already configured in `src/config/firebase.config.ts` as `FCM_EDGE_FUNCTION_URL`.

## Function Features

- ✅ CORS support for web browsers
- ✅ **FCM v1 API** (uses OAuth2 with service account)
- ✅ JWT signing for OAuth2 authentication
- ✅ Supports optional fields: `imageUrl`, `data`, `clickAction`
- ✅ Proper error handling with detailed error messages
- ✅ Handles UNREGISTERED token errors gracefully
- ✅ Converts data values to strings (FCM v1 requirement)

## Request Format

```json
{
  "token": "device-fcm-token",
  "title": "Notification Title",
  "body": "Notification body text",
  "imageUrl": "https://example.com/image.jpg",  // Optional
  "data": {                                      // Optional
    "screen": "BookingHistory",
    "orderId": "12345"
  },
  "clickAction": "FLUTTER_NOTIFICATION_CLICK"   // Optional
}
```

## Response Format

**Success:**
```json
{
  "success": true,
  "messageId": "projects/heritage-41197/messages/0:1234567890"
}
```

**Error:**
```json
{
  "success": false,
  "error": "FCM token is invalid or expired (UNREGISTERED)...",
  "status": 500,
  "raw": "{...error details...}"
}
```
