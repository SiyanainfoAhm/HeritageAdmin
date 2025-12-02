# Quick Fix: CORS Error with Edge Function

## The Problem

```
Access to fetch at 'https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/send-email' 
from origin 'http://localhost:3000' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
It does not have HTTP ok status.
```

## Root Cause

The Edge Function either:
1. **Not deployed yet** - Most likely!
2. OPTIONS handler not returning proper status code
3. CORS headers missing

## Quick Fix Steps

### Step 1: Deploy the Edge Function

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref ecvqhfbiwqmqgiqfxheu

# Set secrets (replace with your actual credentials)
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here
supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com
supabase secrets set SENDGRID_FROM_NAME=Heritage Admin

# Deploy
supabase functions deploy send-email
```

### Step 2: Test the Function

```bash
npm run test-email-function
```

### Step 3: Verify in Dashboard

1. Go to Supabase Dashboard
2. Navigate to **Edge Functions**
3. Check if `send-email` function is listed
4. Click on it to see logs

## Alternative: Manual Deployment via Dashboard

If CLI doesn't work:

1. **Go to Supabase Dashboard** → **Edge Functions**
2. **Click "Create Function"** or **"New Function"**
3. **Name**: `send-email`
4. **Copy code** from `supabase/functions/send-email/index.ts`
5. **Paste** into the editor
6. **Set Secrets**:
   - Go to **Settings** → **Secrets**
   - Add:
     - `SENDGRID_API_KEY` = `your-sendgrid-api-key-here`
     - `SENDGRID_FROM_EMAIL` = `your-verified-sender-email@example.com`
     - `SENDGRID_FROM_NAME` = `Heritage Admin`
7. **Deploy** the function

## After Deployment

Once deployed, the CORS error should be gone because:
- ✅ Edge Function handles OPTIONS requests properly
- ✅ Returns 204 status for preflight
- ✅ Includes all CORS headers
- ✅ Supabase client automatically adds auth headers

## Test It

After deployment, try approving a verification again. The email should send successfully!

## Still Getting CORS Error?

1. **Check function is deployed**: Look in Supabase Dashboard → Edge Functions
2. **Check function name**: Must be exactly `send-email` (case-sensitive)
3. **Check browser console**: Look for the actual error message
4. **Test manually**: Run `npm run test-email-function`

