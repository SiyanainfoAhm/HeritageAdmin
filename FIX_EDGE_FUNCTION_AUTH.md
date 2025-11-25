# Fix Edge Function 401 Error

## ❌ Current Issue

Headers ARE being sent correctly now, but Edge Function returns 401 Unauthorized.

**Possible Causes:**
1. Edge Function not configured to accept anon key
2. Edge Function doesn't handle auth headers properly
3. Supabase Edge Function permissions issue

## ✅ Solution: Update Edge Function

Your Edge Function at `https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate` needs to be updated.

### Option 1: Remove Auth Check (Simplest)

Edge Functions by default require authentication. If you want to allow anonymous access:

```typescript
// At the top of your Edge Function
import { serve } from "https://deno.land/std/http/server.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey", // ✅ Add apikey
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // ✅ Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // ✅ No auth check needed - Supabase handles it
  
  try {
    // ... your translation logic
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "internal_error" }), 
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
```

### Option 2: Validate Auth (More Secure)

If you want to validate the key:

```typescript
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    // ✅ Get the authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    // ✅ Verify with Supabase (optional)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // ... your translation logic
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || "internal_error" }), 
      { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
```

### Option 3: Make Edge Function Public (Easiest)

In Supabase Dashboard:

1. Go to **Edge Functions** → `heritage-translate`
2. Click **Settings** or **Edit**
3. Look for **"Verify JWT"** option
4. **Disable** JWT verification (makes it public)

OR

Set function configuration in `supabase/functions/heritage-translate/index.ts`:

```typescript
// deno-lint-ignore-file
/// <reference types="https://deno.land/x/supabase@1.0.0/functions/mod.ts" />

Deno.serve({
  onListen: ({ hostname, port }) => {
    console.log(`Server started at http://${hostname}:${port}`);
  },
  // ✅ Add this to bypass auth
  onRequest: (req) => {
    // Skip JWT verification
    return undefined;
  }
}, handler);
```

## 🧪 Quick Test

After updating the Edge Function, test it:

```bash
curl -X POST https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate \
  -H "Content-Type: application/json" \
  -d '{"text":"test","target":"hi","source":"en"}'
```

**Should return:** `{ "target": "hi", "translations": ["परीक्षण"] }` (no 401)

## 🔍 Check Edge Function Logs

In Supabase Dashboard:
1. Go to **Edge Functions** → `heritage-translate`
2. Click **Logs**
3. Look for errors like:
   - "Invalid JWT"
   - "Authentication required"
   - "Missing authorization"

## 📝 Current Edge Function Code

Based on what you shared earlier, your function looks like this:

```typescript
import { serve } from "https://deno.land/std/http/server.ts";
import { TranslationServiceClient } from "npm:@google-cloud/translate@^7.0.0";

const raw = Deno.env.get("GOOGLE_TRANSLATE_CREDENTIALS");
if (!raw) throw new Error("Missing GOOGLE_TRANSLATE_CREDENTIALS secret");
const credentials = JSON.parse(raw);

const projectId = credentials.project_id as string;
const location = "global";
const client = new TranslationServiceClient({ credentials });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") 
    return new Response(null, { status: 204, headers: CORS });

  try {
    const body = await req.json();
    const texts = Array.isArray(body.text) ? body.text : [body.text];
    const targets = Array.isArray(body.target) ? body.target : [body.target];

    // ... translation logic
    
    return new Response(JSON.stringify({ results }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "internal_error" }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
```

## ✅ Update Needed

Change CORS headers to include `apikey`:

```typescript
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey", // ✅ Add apikey
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
```

## 🚀 Alternative: Use Service Role Key (Not Recommended for Frontend)

If you want the function to always work without user auth:

**In Supabase Dashboard:**
1. Go to **Settings** → **API**
2. Copy **service_role** key (⚠️ Keep secret!)
3. Set it as environment variable in Edge Function

**Then in Edge Function:**
```typescript
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
// Use this to bypass auth
```

⚠️ **Warning:** Don't expose service_role key to frontend!

## 📊 Summary

**Issue:** Edge Function rejecting authenticated requests  
**Cause:** Function expecting different auth or JWT validation failing  
**Fix:** Update Edge Function to:
1. Include `apikey` in CORS headers
2. Either disable JWT verification or properly validate it
3. Check Supabase Dashboard for function permissions

**Next Step:** Update the Edge Function code in Supabase Dashboard and redeploy it.

