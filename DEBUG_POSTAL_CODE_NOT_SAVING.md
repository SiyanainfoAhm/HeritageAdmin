# 🔍 DEBUG: Postal Code Not Saving to Database

## ✅ Column Type Fixed
The database column `postal_code` in `heritage_sitetranslation` table is now correctly set to **`text`** type (as shown in your screenshot).

## 🐛 Current Issue
Even though the column type is correct, **postal_code values are still showing as `NULL`** in all rows. This means the data is not reaching the database.

---

## 🔍 Frontend Debugging Added

I've added **comprehensive console logging** to trace the postal_code data flow through the frontend. Here's what will be logged:

### **1. When Loading (Edit Mode)**
**Location:** Lines ~488-491 in `hydrateStateFromDetails()`

```typescript
console.log('🏤 English translation from database:', englishTranslation);
console.log('🏤 Postal code from English translation:', englishTranslation?.postal_code);
console.log('🏤 Postal code from site table:', site.location_postal_code);
```

**What to check:**
- Does `englishTranslation` exist?
- Is `postal_code` field present in the English translation?
- Is the postal code being read correctly?

### **2. When Building Translations for Submission**
**Location:** Lines ~1225-1248

```typescript
console.log('🏤 Building translations - Postal Code from form:', formState.overview.locationPostalCode);
console.log(`🏤 Setting postal_code for ${lang}:`, postalCode);
```

**What to check:**
- Is the postal code value present in the form state?
- Is it being added to each language's translation object?

### **3. When Creating Final Translation Objects**
**Location:** Lines ~1260-1307

```typescript
console.log(`🏤 Creating translation for ${lang} - Postal Code:`, postalCodeValue);
console.log(`🏤 Final translation object for ${lang}:`, translation);
console.log('🏤 All translations being sent to backend:', translations);
```

**What to check:**
- Is `postal_code` included in the translation object?
- Is the value correct (not undefined/null)?
- Are all translation objects containing the postal_code?

---

## 🧪 How to Test & Debug

### **Step 1: Test Creating a New Site**
1. Open the **"Add Heritage Site"** form
2. Fill in the **Postal Code** field (e.g., "382715" or "A1B 2C3")
3. Fill in other required fields
4. Open **Browser DevTools** (Press F12) → **Console** tab
5. Click **Submit**
6. Look for logs with 🏤 emoji

### **Step 2: Test Editing an Existing Site**
1. Edit an existing heritage site
2. Open **Browser DevTools** → **Console** tab
3. Look for logs that show:
   - `🏤 English translation from database:`
   - `🏤 Postal code from English translation:`
   - If these are `null` or `undefined`, the issue is in the **backend database retrieval**

### **Step 3: Check What's Being Sent to Backend**
Look for this log:
```
🏤 All translations being sent to backend: [...]
```

**Expand the array and check each translation object:**
- Does it have a `postal_code` field?
- Is the value correct?

---

## 🎯 Likely Root Cause

Based on the symptoms (column type is correct, but data is NULL), the issue is likely in **one of these places**:

### **Scenario A: Backend Not Handling postal_code** 🔴 **MOST LIKELY**
The backend service layer might not be including `postal_code` in the database INSERT/UPDATE operations.

**Solution:** Check the backend service file (likely `heritageSite.service.ts` on the server side or the Supabase SQL query) to ensure:
1. `postal_code` is included in the INSERT statement for `heritage_sitetranslation`
2. `postal_code` is included in the UPDATE statement
3. The column name matches exactly (`postal_code`, not `postalCode`)

### **Scenario B: Frontend Not Sending postal_code**
The frontend might not be including the postal_code in the request.

**How to Confirm:**
1. Run the test above
2. Check the console log: `🏤 All translations being sent to backend:`
3. If `postal_code` is **present** in the log → **Backend issue**
4. If `postal_code` is **missing** → **Frontend issue** (but this is unlikely based on my code review)

### **Scenario C: Database Constraint or Trigger**
There might be a database constraint or trigger preventing the insert/update.

**How to Confirm:**
- Check Supabase logs for any errors during insert/update operations
- Try manually inserting a row with postal_code via SQL:
  ```sql
  UPDATE heritage_sitetranslation 
  SET postal_code = '382715' 
  WHERE translation_id = 11;
  ```
- If this works, the issue is in the application code, not the database

---

## 📋 Next Steps

### **1. Run the Debugging Test**
Follow the steps above and collect the console logs.

### **2. Share the Logs**
Look for these specific logs and share them:
```
🏤 Building translations - Postal Code from form: "______"
🏤 All translations being sent to backend: [...]
```

### **3. Check Backend Service Code**
If the frontend logs show postal_code is being sent correctly, the issue is in the **backend**. Check:
- `src/services/heritageSite.service.ts` (server-side if different from client)
- Supabase Edge Functions
- Database INSERT/UPDATE queries

Specifically, look for code that handles `HeritageSiteTranslationInput` and makes sure it's mapping the `postal_code` field to the database column.

---

## 🔧 Quick Backend Fix (If Needed)

If the backend is the issue, you'll need to ensure the service layer includes postal_code. The fix would look something like this in your backend service:

```typescript
// When inserting translations
const translationData = {
  site_id: siteId,
  language_code: translation.language_code,
  name: translation.name,
  short_desc: translation.short_desc,
  full_desc: translation.full_desc,
  address: translation.address,
  city: translation.city,
  state: translation.state,
  country: translation.country,
  postal_code: translation.postal_code, // ← Make sure this line exists!
};
```

---

## ✅ Summary

1. **Column type is fixed** ✓ (now `text`)
2. **Frontend code looks correct** ✓ (sending postal_code)
3. **Debugging logs added** ✓ (will confirm data flow)
4. **Next action**: Run the test and check console logs to identify where postal_code is being lost

The issue is **most likely in the backend service layer** not handling the `postal_code` field during database operations.

