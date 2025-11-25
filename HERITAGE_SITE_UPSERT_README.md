# Heritage Site Upsert Function - Quick Reference

## 🎯 What's New

A comprehensive upsert function for heritage sites with **full multi-language support** for 6 languages:
- 🇬🇧 English (EN)
- 🇮🇳 Hindi (HI)
- 🇮🇳 Gujarati (GU)
- 🇯🇵 Japanese (JA)
- 🇪🇸 Spanish (ES)
- 🇫🇷 French (FR)

## 🚀 Quick Start

### Using the Upsert Function

```typescript
import { HeritageSiteService } from '@/services/heritageSite.service';

// Create new site
const result = await HeritageSiteService.upsertHeritageSiteWithTranslations({
  site: {
    name_default: 'My Heritage Site',
    is_active: true,
  },
  translations: [
    { language_code: 'EN', name: 'My Heritage Site' },
    { language_code: 'HI', name: 'मेरा विरासत स्थल' },
    { language_code: 'GU', name: 'મારું વારસો સ્થળ' },
    { language_code: 'JA', name: '私の遺産サイト' },
    { language_code: 'ES', name: 'Mi Sitio Patrimonial' },
    { language_code: 'FR', name: 'Mon Site Patrimonial' },
  ],
  media: [],
  visitingHours: [],
  ticketTypes: [],
  transportation: [],
  amenities: [],
  etiquettes: [],
});

// Update existing site (pass siteId as second parameter)
const updateResult = await HeritageSiteService.upsertHeritageSiteWithTranslations(
  data,
  123 // siteId
);

// Check result
if (result.success) {
  console.log('Success!', result.message);
  console.log('Site ID:', result.siteId);
} else {
  console.error('Error:', result.message);
}
```

## 📚 Documentation

### Complete Documentation
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - Overview of all changes
- **[Comprehensive Guide](docs/HERITAGE_SITE_UPSERT_GUIDE.md)** - Detailed API documentation with examples
- **[Code Examples](src/examples/heritage-site-upsert-example.ts)** - Practical usage examples

### Key Files Modified
- `src/services/heritageSite.service.ts` - Added upsert function
- `src/pages/Masters/AddHeritageSite.tsx` - Updated to support all 6 languages

## ✨ Key Features

### ✅ Single Function for Create & Update
No need to check if it's an edit or create - the function handles both!

```typescript
// Automatically determines create vs update based on siteId parameter
await upsertHeritageSiteWithTranslations(data, siteId);
```

### ✅ Automatic Language Handling
All 6 languages are automatically included, even if you don't provide translations for all of them.

### ✅ Complete Data Management
Handles all related tables in one call:
- Main site information
- Media files
- Visiting hours
- Ticket types
- Transportation options
- Amenities
- Cultural etiquettes
- **Translations for all 6 languages**

### ✅ Error Handling & Rollback
- Detailed error messages
- Automatic rollback on failure during creation
- Type-safe TypeScript implementation

## 🗄️ Database Schema

### heritage_sitetranslation Table
One row per language per site with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `translation_id` | bigint | Primary key (auto) |
| `site_id` | bigint | Foreign key to heritage_site |
| `language_code` | varchar(10) | 'EN', 'HI', 'GU', 'JA', 'ES', 'FR' |
| `name` | varchar(180) | Site name in that language |
| `short_desc` | varchar(500) | Short description |
| `full_desc` | text | Full description/history |
| `address` | varchar(500) | Street address |
| `city` | varchar(100) | City name |
| `state` | varchar(100) | State/province |
| `country` | varchar(100) | Country name |
| `meta_title` | varchar(200) | SEO title |
| `meta_description` | varchar(500) | SEO description |

## 📋 Function Signature

```typescript
static async upsertHeritageSiteWithTranslations(
  request: CreateHeritageSiteRequest,
  siteId?: number | null
): Promise<{ 
  success: boolean;
  siteId?: number;
  error?: any;
  message?: string;
}>
```

### Parameters

- **request** (`CreateHeritageSiteRequest`) - Complete site data including:
  - `site` - Core site information
  - `media` - Array of media items
  - `visitingHours` - Opening hours schedule
  - `ticketTypes` - Ticket pricing
  - `transportation` - Transport options
  - `amenities` - Available facilities
  - `etiquettes` - Cultural rules
  - `translations` - Multi-language content

- **siteId** (`number | null`, optional) - If provided, updates existing site; otherwise creates new

### Returns

Object with:
- `success` - Boolean indicating success/failure
- `siteId` - ID of created/updated site
- `error` - Error object if failed
- `message` - Descriptive message

## 🔧 Frontend Integration

The AddHeritageSite component now supports all 6 languages:

```typescript
// Language selector updated
const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
];

// Form submission uses upsert
const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(
  request,
  isEdit && numericSiteId ? numericSiteId : null
);
```

## 💡 Usage Tips

### 1. Always Provide All Languages
Even if the content is the same, provide entries for all 6 languages:

```typescript
translations: [
  { language_code: 'EN', name: 'Temple' },
  { language_code: 'HI', name: 'मंदिर' },
  { language_code: 'GU', name: 'મંદિર' },
  { language_code: 'JA', name: 'テンプル' },
  { language_code: 'ES', name: 'Templo' },
  { language_code: 'FR', name: 'Temple' },
]
```

### 2. Use Draft Mode for Incomplete Data
Set `is_active: false` while building content:

```typescript
site: {
  name_default: 'Work in Progress',
  is_active: false, // Draft mode
}
```

### 3. Check Result Status
Always verify the operation succeeded:

```typescript
if (result.success) {
  // Handle success
  navigate(`/sites/${result.siteId}`);
} else {
  // Show error message
  alert(result.message);
}
```

## 🧪 Testing

### Manual Test
1. Navigate to `/masters/add`
2. Fill in site details
3. Add translations in multiple languages
4. Submit form
5. Verify in database:
   ```sql
   SELECT language_code, name 
   FROM heritage_sitetranslation 
   WHERE site_id = <your_site_id>;
   ```
6. Should see 6 rows (one per language)

### Verify All Languages Present
```sql
SELECT 
  site_id,
  COUNT(*) as translation_count,
  STRING_AGG(language_code, ', ' ORDER BY language_code) as languages
FROM heritage_sitetranslation
WHERE site_id = <your_site_id>
GROUP BY site_id;
```

Expected: `translation_count = 6`, `languages = 'EN, ES, FR, GU, HI, JA'`

## 🐛 Troubleshooting

### Issue: Translations not saving
**Solution**: Ensure language codes are uppercase ('EN' not 'en')

### Issue: Missing translations in database
**Solution**: The function automatically creates all 6 language rows. Check for errors in `result.error`

### Issue: Update not working
**Solution**: Verify `siteId` is passed as second parameter and is a valid number

## 📞 Support

- View detailed examples: `src/examples/heritage-site-upsert-example.ts`
- Read full guide: `docs/HERITAGE_SITE_UPSERT_GUIDE.md`
- Check implementation: `IMPLEMENTATION_SUMMARY.md`

## ✅ Checklist

Before using the function, ensure:
- [ ] All required dependencies are installed (`npm install`)
- [ ] Supabase connection is configured
- [ ] Database tables exist with correct schema
- [ ] At least `name_default` is provided in site object
- [ ] Language codes are valid (EN, HI, GU, JA, ES, FR)

## 🎉 That's It!

You're now ready to create and update heritage sites with full multi-language support!

---

**Need Help?** Check the comprehensive documentation in:
- `IMPLEMENTATION_SUMMARY.md`
- `docs/HERITAGE_SITE_UPSERT_GUIDE.md`
- `src/examples/heritage-site-upsert-example.ts`

