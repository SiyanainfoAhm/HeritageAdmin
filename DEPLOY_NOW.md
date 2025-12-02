# 🚨 URGENT: Deploy Edge Function to Fix CORS Error

## The Problem

The error shows: **"Requested function was not found"** (404)
- The `send-email` Edge Function is **NOT deployed** yet
- That's why you're getting CORS errors

## ✅ Solution: Deploy the Function NOW

### Quick Deployment Steps:

#### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

#### Step 2: Login
```bash
supabase login
```

#### Step 3: Link to Project
```bash
supabase link --project-ref ecvqhfbiwqmqgiqfxheu
```

#### Step 4: Set Secrets
```bash
# Replace with your actual SendGrid credentials
supabase secrets set SENDGRID_API_KEY=your-sendgrid-api-key-here
supabase secrets set SENDGRID_FROM_EMAIL=your-verified-sender-email@example.com
supabase secrets set SENDGRID_FROM_NAME=Heritage Admin
```

#### Step 5: Deploy Function
```bash
supabase functions deploy send-email
```

### After Deployment:

1. **Test the function**:
   ```bash
   npm run test-email-function
   ```

2. **Try approving/rejecting a verification again** - email should work!

## Alternative: Deploy via Supabase Dashboard

If CLI doesn't work:

1. **Go to**: https://supabase.com/dashboard/project/ecvqhfbiwqmqgiqfxheu/functions
2. **Click**: "Create Function" or "New Function"
3. **Name**: `send-email` (exactly this name)
4. **Copy code** from: `supabase/functions/send-email/index.ts`
5. **Paste** into the editor
6. **Go to Settings** → **Secrets** → Add:
   - `SENDGRID_API_KEY` = `your-sendgrid-api-key-here`
   - `SENDGRID_FROM_EMAIL` = `your-verified-sender-email@example.com`
   - `SENDGRID_FROM_NAME` = `Heritage Admin`
7. **Click Deploy**

## Verify Deployment

After deploying, test with:
```bash
curl -X OPTIONS https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/send-email -H "Origin: http://localhost:3000" -v
```

**Should return**: `204 No Content` (not 404!)

## Once Deployed

- ✅ CORS error will be gone
- ✅ Email sending will work
- ✅ Verification emails will be sent automatically

**The function MUST be deployed for emails to work!**

