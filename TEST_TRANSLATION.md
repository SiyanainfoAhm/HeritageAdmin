# Translation Test & Debugging Guide

## ✅ Google Translate API is Working

Your Postman test confirms:
```json
Request: { "text": "Raja's shop", "target": "hi" }
Response: { "target": "hi", "translations": ["राजा की दुकान"] }
```

The Edge Function is **working perfectly**.

## 🔍 Debugging Steps

### Step 1: Test in Browser Console

Open your site and paste this in the browser console (F12):

```javascript
// Test 1: Direct API call
async function testDirectAPI() {
  console.log('🧪 Test 1: Direct API Call');
  const response = await fetch(
    'https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: ['Test Site', 'Test Description'],
        target: ['hi', 'gu', 'ja', 'es', 'fr'],
        source: 'en'
      })
    }
  );
  const data = await response.json();
  console.log('✅ API Response:', data);
  return data;
}

testDirectAPI();
```

**Expected Output**:
```json
{
  "results": {
    "hi": ["परीक्षण स्थल", "परीक्षण विवरण"],
    "gu": ["પરીક્ષણ સાઇટ", "પરીક્ષણ વર્ણન"],
    "ja": ["テストサイト", "テストの説明"],
    "es": ["Sitio de prueba", "Descripción de prueba"],
    "fr": ["Site de test", "Description du test"]
  }
}
```

### Step 2: Check What's Being Sent to Backend

Open browser console before submitting a heritage site:

1. Fill in the form:
   - Site Name: "Test Palace"
   - Short Description: "Beautiful palace"
   - Enable Auto-Translation: ✅
   - Source Language: English

2. Open Console (F12) → Network tab

3. Click Submit

4. Look for the logs - you should see:
   ```
   🔍 Translation check: { needsTranslation: true, hasName: true, ... }
   🌐 Auto-translating heritage site content...
   📝 Content to translate: { name: "Test Palace", short_desc: "Beautiful palace", ... }
   ✅ Translation successful
   📊 Translated to languages: ["EN", "HI", "GU", "JA", "ES", "FR"]
   ```

### Step 3: Common Issues & Fixes

#### Issue 1: "⏭️ Skipping translation" appears

**Cause**: Backend thinks translations already exist

**Fix**: Check that frontend is only sending source language
```javascript
// In browser console after filling form:
console.log('Translations being sent:', 
  document.querySelector('[data-translations]')?.value
);
```

#### Issue 2: "⚠️ Translation failed"

**Causes**:
- CORS error
- Network error  
- API quota exceeded
- Invalid API credentials

**Fix**: Check Network tab for failed requests

#### Issue 3: Translations return empty/null

**Cause**: API returns translations but they're not being mapped correctly

**Fix**: Check console for "📊 Translated to languages" log

### Step 4: Database Check

After submitting, check what was actually saved:

```sql
-- Get the latest heritage site
SELECT site_id, name_default FROM heritage_site 
ORDER BY created_at DESC LIMIT 1;

-- Check translations for that site (replace XXX with site_id)
SELECT 
  language_code,
  name,
  LEFT(short_desc, 50) as short_desc_preview,
  CASE 
    WHEN name IS NULL THEN '❌ NULL'
    WHEN name = name_default THEN '⚠️ SAME AS DEFAULT'
    ELSE '✅ TRANSLATED'
  END as status
FROM heritage_sitetranslation
WHERE site_id = XXX
ORDER BY language_code;
```

**Expected Result**:
```
EN | Test Palace      | Beautiful palace         | ✅ TRANSLATED
ES | Palacio de Prueba| Hermoso palacio         | ✅ TRANSLATED  
FR | Palais de Test   | Beau palais             | ✅ TRANSLATED
GU | ટેસ્ટ પેલેસ        | સુંદર મહેલ               | ✅ TRANSLATED
HI | टेस्ट पैलेस       | सुंदर महल               | ✅ TRANSLATED
JA | テストパレス        | 美しい宮殿               | ✅ TRANSLATED
```

## 🐛 Specific Issue Checks

### Check 1: Is source language being sent?

In `AddHeritageSite.tsx` around line 1156, verify:
```typescript
if (isSourceLanguage) {
  // Only send source language translation
  const translation: HeritageSiteTranslationInput = {
    language_code: lang,
    name: formState.overview.siteName.trim(),
    short_desc: data.short_desc || undefined,
    full_desc: data.full_desc || undefined,
    address: data.address || undefined,
    city: data.city || undefined,
    state: data.state || undefined,
    country: data.country || undefined,
  };
  translations.push(translation);
}
// ✅ Other languages should NOT be added
```

### Check 2: Is content populated?

The content to translate comes from:
```typescript
const contentToTranslate = {
  name: request.site.name_default || '',              // ✅ Must exist
  short_desc: request.site.short_desc_default || null,
  full_desc: request.site.full_desc_default || null,
  address: request.site.location_address || null,
  // ...
};
```

If `name` is empty, translation is skipped.

### Check 3: Is the translation response being parsed?

In `translation.service.ts`, check line 268:
```typescript
translationsByLanguage[lang.toUpperCase()] = langData;
```

Should produce:
```json
{
  "EN": { "name": "Test", "short_desc": "Test" },
  "HI": { "name": "परीक्षण", "short_desc": "परीक्षण" },
  "GU": { "name": "પરીક્ષણ", "short_desc": "પરીક્ષણ" },
  // ...
}
```

## 🚀 Quick Test Script

Run this in browser console on the Add Heritage Site page:

```javascript
async function quickTest() {
  console.log('🧪 Quick Translation Test');
  
  // Test 1: Check if form has data
  const siteName = document.querySelector('input[value*="Test"]');
  console.log('1️⃣ Site name found:', !!siteName, siteName?.value);
  
  // Test 2: Check auto-translate toggle
  const autoTranslate = document.querySelector('[type="checkbox"]');
  console.log('2️⃣ Auto-translate enabled:', autoTranslate?.checked);
  
  // Test 3: Test API directly
  try {
    const response = await fetch(
      'https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ['Quick Test'],
          target: ['hi'],
          source: 'en'
        })
      }
    );
    const data = await response.json();
    console.log('3️⃣ API Test:', response.ok ? '✅' : '❌', data);
  } catch (error) {
    console.log('3️⃣ API Test: ❌ Error:', error.message);
  }
  
  console.log('✅ Test complete - check results above');
}

quickTest();
```

## 📋 Checklist

Before submitting:
- [ ] Site name is filled in
- [ ] Auto-translate is **enabled**
- [ ] Source language is selected (English)
- [ ] Browser console is open (F12)
- [ ] Network tab is visible
- [ ] Console logs show "🌐 Auto-translating..."

After submitting:
- [ ] Console shows "✅ Translation successful"
- [ ] Console shows "📊 Translated to languages: [...]"
- [ ] No errors in Network tab
- [ ] Database has 6 rows in `heritage_sitetranslation`
- [ ] All 6 rows have different `name` values

## 🔧 If Still Not Working

Run the full diagnostic:

```javascript
// Full diagnostic script
async function fullDiagnostic() {
  console.log('🏥 Full Translation Diagnostic');
  console.log('================================');
  
  // 1. API Health Check
  console.log('\n1️⃣ API Health Check');
  try {
    const healthResponse = await fetch(
      'https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Health Check',
          target: 'hi',
          source: 'en'
        })
      }
    );
    const healthData = await healthResponse.json();
    console.log('   Status:', healthResponse.ok ? '✅ OK' : '❌ FAILED');
    console.log('   Response:', healthData);
  } catch (error) {
    console.log('   Status: ❌ ERROR');
    console.log('   Error:', error.message);
  }
  
  // 2. Multi-language test
  console.log('\n2️⃣ Multi-Language Test');
  try {
    const multiResponse = await fetch(
      'https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: ['Palace', 'Historic site'],
          target: ['hi', 'gu', 'ja', 'es', 'fr'],
          source: 'en'
        })
      }
    );
    const multiData = await multiResponse.json();
    console.log('   Status:', multiResponse.ok ? '✅ OK' : '❌ FAILED');
    console.log('   Languages:', multiData.results ? Object.keys(multiData.results) : 'none');
    console.log('   Sample (Hindi):', multiData.results?.hi);
  } catch (error) {
    console.log('   Status: ❌ ERROR');
    console.log('   Error:', error.message);
  }
  
  // 3. CORS Check
  console.log('\n3️⃣ CORS Check');
  console.log('   If you see CORS errors above, the API needs CORS configuration');
  
  // 4. Network Check
  console.log('\n4️⃣ Network Check');
  console.log('   Open Network tab and check for:');
  console.log('   - Request to /heritage-translate');
  console.log('   - Status code 200');
  console.log('   - Response with translations');
  
  console.log('\n================================');
  console.log('✅ Diagnostic complete');
}

fullDiagnostic();
```

---

**Next Steps**:
1. Run the Quick Test Script
2. Try submitting a test heritage site
3. Check console logs  
4. Share the console output if still not working

