# Fix: Auto-Translation for Site Name

## Issue
The site name was not being auto-translated. All language entries in the `heritage_sitetranslation` table had the same name instead of translated versions.

## Root Cause
In `AddHeritageSite.tsx`, the `buildCreateRequest()` function was setting the same site name for ALL languages:

```typescript
name: formState.overview.siteName.trim(), // Same name for all languages!
```

When the frontend sent translations with the name already filled in, the backend merge logic would:
1. See that `existingTranslation.name` exists
2. Keep the existing name instead of using the auto-translated version
3. Result: All languages have the same name (not translated)

## Solution
Modified the frontend to **only set the name for the source language** when auto-translate is enabled:

```typescript
// If auto-translate is enabled, only set name for source language
// This allows backend to auto-translate the name field
const shouldSetName = !formState.autoTranslate.enabled || 
                     lang === formState.autoTranslate.sourceLanguage.toUpperCase();

const translation: HeritageSiteTranslationInput = {
  language_code: lang,
  name: shouldSetName ? formState.overview.siteName.trim() : undefined, // ✅ Fixed!
  short_desc: data.short_desc || undefined,
  full_desc: data.full_desc || undefined,
  // ...
};
```

## How It Works Now

### With Auto-Translate Enabled (Default)

**Frontend** → Backend:
```typescript
// Only source language has name
[
  { language_code: 'EN', name: 'Sun Temple', short_desc: '...' },
  { language_code: 'HI', name: undefined, short_desc: undefined },
  { language_code: 'GU', name: undefined, short_desc: undefined },
  { language_code: 'JA', name: undefined, short_desc: undefined },
  { language_code: 'ES', name: undefined, short_desc: undefined },
  { language_code: 'FR', name: undefined, short_desc: undefined },
]
```

**Backend** → Google Translate API:
```typescript
// Translates "Sun Temple" to all languages
{
  text: 'Sun Temple',
  target: ['hi', 'gu', 'ja', 'es', 'fr'],
  source: 'en'
}
```

**Backend** → Database:
```typescript
// Merges auto-translated names
[
  { language_code: 'EN', name: 'Sun Temple' },
  { language_code: 'HI', name: 'सूर्य मंदिर' },          // ✅ Auto-translated!
  { language_code: 'GU', name: 'સૂર્ય મંદિર' },         // ✅ Auto-translated!
  { language_code: 'JA', name: '太陽寺院' },             // ✅ Auto-translated!
  { language_code: 'ES', name: 'Templo del Sol' },     // ✅ Auto-translated!
  { language_code: 'FR', name: 'Temple du Soleil' },   // ✅ Auto-translated!
]
```

### With Auto-Translate Disabled

When auto-translate is disabled, the original behavior is preserved:
- Frontend sets the same name for all languages
- Backend stores as-is (no translation attempt)

## Testing

### Before Fix
```sql
SELECT language_code, name FROM heritage_sitetranslation WHERE site_id = 14;
```
Result:
```
EN | Test
HI | Test      ❌ Not translated
GU | Test      ❌ Not translated
JA | Test      ❌ Not translated
ES | Test      ❌ Not translated
FR | Test      ❌ Not translated
```

### After Fix
```sql
SELECT language_code, name FROM heritage_sitetranslation WHERE site_id = 15;
```
Expected Result:
```
EN | Sun Temple
HI | सूर्य मंदिर          ✅ Translated!
GU | સૂર્ય મંદિર           ✅ Translated!
JA | 太陽寺院               ✅ Translated!
ES | Templo del Sol       ✅ Translated!
FR | Temple du Soleil     ✅ Translated!
```

## Files Modified

1. **`src/pages/Masters/AddHeritageSite.tsx`**
   - Modified `buildCreateRequest()` function
   - Added conditional logic for setting translation name
   - Lines affected: ~1143-1157

## Backend Merge Logic (No Changes Needed)

The backend already had correct merge logic:

```typescript
// When existingTranslation.name is undefined:
name: existingTranslation.name || content.name  // Uses auto-translated content.name ✅
```

This means:
- If frontend provides name → use it (manual translation)
- If frontend provides `undefined` → use auto-translated name ✅

## Impact

✅ **Fixed**: Site names are now properly auto-translated  
✅ **Preserved**: Manual translations still work when auto-translate is disabled  
✅ **Backward Compatible**: No breaking changes to existing functionality  

## Quick Test

1. Go to `/masters/add`
2. Enter site name: "Test Monument"
3. Enable "Auto-Translation" in Review step
4. Select "English" as source language
5. Submit
6. Check database:
   ```sql
   SELECT language_code, name 
   FROM heritage_sitetranslation 
   WHERE site_id = (SELECT MAX(site_id) FROM heritage_site)
   ORDER BY language_code;
   ```
7. Should see 6 different translated names! ✅

## Related Files

- Frontend: `src/pages/Masters/AddHeritageSite.tsx`
- Backend Service: `src/services/heritageSite.service.ts` (no changes)
- Translation Service: `src/services/translation.service.ts` (no changes)
- Edge Function: Supabase edge function (no changes)

---

**Status**: ✅ FIXED  
**Date**: November 21, 2025  
**Impact**: Critical - Enables proper auto-translation functionality

