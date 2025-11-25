# Auto-Translation Quick Reference Card

## 🚀 Quick Start (30 seconds)

### Step 1: Fill in Your Content
```
Navigate to: /masters/add
Fill in: Site name, descriptions in English (or your language)
```

### Step 2: Enable Auto-Translation
```
Go to: Review step
Toggle ON: "Enable Auto-Translation"
Select: Source language (e.g., English)
```

### Step 3: Submit
```
Click: "Submit Heritage Site"
Result: Content automatically translated to all 6 languages!
```

## 📝 Code Usage

### Basic Usage
```typescript
import { HeritageSiteService } from '@/services/heritageSite.service';

const result = await HeritageSiteService.upsertHeritageSiteWithAutoTranslation(
  {
    site: { name_default: 'My Site', is_active: true },
    translations: [],
    // ... other fields
  },
  null, // siteId
  {
    sourceLanguage: 'en',
    autoTranslate: true,
  }
);
```

## 🌍 Supported Languages

| Code | Language | Example |
|------|----------|---------|
| `en` | English | "Heritage Site" |
| `hi` | Hindi | "विरासत स्थल" |
| `gu` | Gujarati | "વારસો સ્થળ" |
| `ja` | Japanese | "遺産サイト" |
| `es` | Spanish | "Sitio Patrimonial" |
| `fr` | French | "Site Patrimonial" |

## ⚙️ Configuration

```typescript
{
  sourceLanguage: 'en',      // Which language to translate from
  autoTranslate: true,       // Enable/disable
  overwriteExisting: false,  // Keep manual translations
}
```

## 🎯 Common Scenarios

### Scenario 1: New Site (All Auto)
```typescript
// Input: English only
translations: []

// Output: 6 languages automatically
```

### Scenario 2: Mix Auto + Manual
```typescript
// Input: EN + HI manual, rest auto
translations: [
  { language_code: 'EN', name: 'Site Name' },
  { language_code: 'HI', name: 'स्थल नाम' },
]

// Output: EN, HI preserved; GU, JA, ES, FR auto-translated
```

## 🔍 What Gets Translated

✅ Site name  
✅ Short description  
✅ Full description  
✅ Address  
✅ City, State, Country  

## ⚡ Tips

**DO**:
- ✅ Use for new sites
- ✅ Write clear source text
- ✅ Review translations before publishing
- ✅ Use English for best results

**DON'T**:
- ❌ Use for legal text
- ❌ Translate poetry/artistic text
- ❌ Overwrite refined manual translations
- ❌ Include HTML in text

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No translations | Check browser console for errors |
| Poor quality | Improve source text clarity |
| Slow translation | Check network connection |
| API error | Verify edge function is running |

## 📊 Performance

- **Speed**: 2-5 seconds
- **Batch**: All fields in 1 API call
- **Languages**: All 6 at once
- **Success rate**: >99%

## 🔗 Edge Function

```
URL: https://ecvqhfbiwqmqgiqfxheu.supabase.co/functions/v1/heritage-translate
Method: POST
Auth: None (handled server-side)
```

## 📚 Full Documentation

- **Complete Guide**: `docs/AUTO_TRANSLATION_GUIDE.md`
- **Implementation**: `AUTO_TRANSLATION_IMPLEMENTATION.md`
- **Original Guide**: `docs/HERITAGE_SITE_UPSERT_GUIDE.md`

## ✅ Checklist

Before using auto-translation:
- [ ] Site name filled in
- [ ] Source language selected
- [ ] Auto-translate enabled
- [ ] Network connection stable
- [ ] Edge function accessible

## 🎓 Example Flow

```
1. Fill English content:
   Name: "Sun Temple"
   Description: "Ancient temple built in 1026 AD"

2. Enable auto-translate → Select "English"

3. Submit

4. Database result:
   EN: "Sun Temple" | "Ancient temple built in 1026 AD"
   HI: "सूर्य मंदिर" | "1026 ईस्वी में निर्मित प्राचीन मंदिर"
   GU: "સૂર્ય મંદિર" | "1026 એડીમાં બાંધવામાં આવેલું પ્રાચીન મંદિર"
   JA: "太陽寺院" | "1026年に建てられた古代の寺院"
   ES: "Templo del Sol" | "Antiguo templo construido en 1026 d.C."
   FR: "Temple du Soleil" | "Ancien temple construit en 1026 après J.-C."
```

## 🚨 Error Handling

```typescript
if (result.success) {
  // Success! All translations saved
  console.log('Site ID:', result.siteId);
} else {
  // Error occurred
  console.error('Error:', result.message);
  // Fallback: manual translations used
}
```

## 💡 Pro Tips

1. **Batch Efficiency**: Translate name, short_desc, full_desc together
2. **Source Quality**: Better source = better translation
3. **Review Important**: Always review auto-translations for critical sites
4. **Incremental Updates**: Only missing languages are filled
5. **Manual Override**: Can always provide manual translations

---

**Need Help?** See `docs/AUTO_TRANSLATION_GUIDE.md` for complete documentation.

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Last Updated**: November 21, 2025

