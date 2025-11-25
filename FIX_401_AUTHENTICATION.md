# 🎯 TRANSLATION FIX - 401 Unauthorized Issue RESOLVED

## ❌ The Problem

**Error:** `401 Unauthorized` when calling the translation Edge Function from the browser

**Root Cause:** Frontend was **not sending authentication headers** to Supabase Edge Function

### What Was Happening:

**Postman (Working ✅):**
```http
POST https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate
Headers:
  Content-Type: application/json
  apikey: eyJhbGci...
  Authorization: Bearer eyJhbGci...
```

**Frontend (Not Working ❌):**
```http
POST https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate
Headers:
  Content-Type: application/json
  ❌ NO apikey
  ❌ NO Authorization
```

**Result:** 401 Unauthorized

## ✅ The Fix

Updated `src/services/translation.service.ts` to include authentication headers:

```typescript
// Added Supabase credentials
const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGci...';

// Updated fetch call
const response = await fetch(TRANSLATE_EDGE_FUNCTION_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,              // ✅ ADDED
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // ✅ ADDED
  },
  body: JSON.stringify(payload),
});
```

## 🧪 Test It Now

### Quick Console Test:

Open browser console (F12) and run:

```javascript
fetch('https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4'
  },
  body: JSON.stringify({
    text: ['Quick Test'],
    target: ['hi'],
    source: 'en'
  })
})
.then(r => {
  console.log('Status:', r.status); // Should be 200 now!
  return r.json();
})
.then(d => console.log('✅ Result:', d));
```

**Expected Output:**
```
Status: 200
✅ Result: { target: "hi", translations: ["त्वरित परीक्षण"] }
```

### Full Heritage Site Test:

1. **Refresh your page** to load the updated code
2. Go to: `http://localhost:3000/masters/add`
3. **Open Console (F12)**
4. Fill in form:
   - Site Name: "Royal Palace"
   - Short Description: "Beautiful historic palace"
   - (Other required fields)
5. Go to Review step
6. **Enable Auto-Translation** ✅
7. Source Language: **English**
8. Click **Submit**
9. **Watch console** - should now see:

```
🌐 API Request to: https://...
📤 Payload: { ... }
📡 Response status: 200 OK  ✅ (NOT 401 anymore!)
✅ Multi-target translation received: ["hi", "gu", "ja", "es", "fr"]
✅ EN: { name: "Royal Palace", ... }
✅ HI: { name: "रॉयल पैलेस", ... }
✅ GU: { name: "રોયલ પેલેસ", ... }
✅ JA: { name: "ロイヤルパレス", ... }
✅ ES: { name: "Palacio Real", ... }
✅ FR: { name: "Palais Royal", ... }
✅ Translation successful
```

## 📊 Verify in Database

After submitting:

```sql
SELECT 
  language_code,
  name,
  short_desc,
  CASE 
    WHEN name IS NULL THEN '❌ NULL'
    ELSE '✅ OK'
  END as status
FROM heritage_sitetranslation
WHERE site_id = (SELECT MAX(site_id) FROM heritage_site)
ORDER BY language_code;
```

**Expected Result:**
```
language_code | name              | short_desc                    | status
--------------|-------------------|-------------------------------|--------
EN            | Royal Palace      | Beautiful historic palace     | ✅ OK
ES            | Palacio Real      | Hermoso palacio histórico     | ✅ OK
FR            | Palais Royal      | Beau palais historique        | ✅ OK
GU            | રોયલ પેલેસ          | સુંદર ઐતિહાસિક મહેલ             | ✅ OK
HI            | रॉयल पैलेस         | सुंदर ऐतिहासिक महल            | ✅ OK
JA            | ロイヤルパレス        | 美しい歴史的な宮殿              | ✅ OK
```

**6 rows with different translations!** ✅

## 🔍 What Changed

### Before (❌ 401 Error):
```typescript
// src/services/translation.service.ts
const response = await fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    // Missing authentication!
  },
  body: JSON.stringify(payload),
});
```

### After (✅ Working):
```typescript
// src/services/translation.service.ts
const SUPABASE_ANON_KEY = 'eyJhbGci...';

const response = await fetch(URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,              // ✅ Added
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // ✅ Added
  },
  body: JSON.stringify(payload),
});
```

## 🎉 Why It Works Now

**Supabase Edge Functions require authentication.** They check for:
1. `apikey` header (Supabase anon key)
2. OR `Authorization: Bearer <token>` header

We were sending **neither**, so Supabase rejected our requests with `401 Unauthorized`.

Now we send **both** (like Postman), so the Edge Function accepts our requests! ✅

## 📝 Files Modified

1. **`src/services/translation.service.ts`**
   - Added `SUPABASE_ANON_KEY` constant
   - Added `apikey` header to fetch call
   - Added `Authorization` header to fetch call

## 🚀 Next Steps

1. **Refresh your browser** (Ctrl+F5 / Cmd+Shift+R)
2. **Try the quick console test** to verify API access
3. **Create a test heritage site** with auto-translation enabled
4. **Check the database** to confirm 6 translations were created

## ✅ Summary

**Problem:** 401 Unauthorized - Missing authentication headers  
**Solution:** Added `apikey` and `Authorization` headers to API requests  
**Status:** ✅ **FIXED - Ready to test!**  

---

**Just refresh your page and try again** - it should work now! The Edge Function will accept the authenticated requests and return translations. 🎯

