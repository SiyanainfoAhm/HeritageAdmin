# Heritage Site Upsert Function Guide

## Overview

The `upsertHeritageSiteWithTranslations` function provides a comprehensive solution for creating or updating heritage sites with full multi-language support. It automatically handles:

- **6 Languages**: English (EN), Hindi (HI), Gujarati (GU), Japanese (JA), Spanish (ES), French (FR)
- **Insert or Update**: Automatically determines whether to create a new site or update an existing one
- **Complete Data Management**: Handles site details, media, visiting hours, tickets, transportation, amenities, etiquettes, and translations

## Database Schema

### Main Tables

1. **heritage_site** - Core site information
2. **heritage_sitetranslation** - Multi-language translations (one row per language)
3. **heritage_sitemedia** - Media files (images, videos, audio guides)
4. **heritage_sitevisitinghours** - Opening hours schedule
5. **heritage_sitetickettype** - Ticket types and pricing
6. **heritage_sitetransportation** - Transportation options
7. **heritage_siteamenity** - Available amenities
8. **heritage_siteetiquette** - Cultural etiquettes and rules

## Function Signature

```typescript
static async upsertHeritageSiteWithTranslations(
  request: CreateHeritageSiteRequest,
  siteId?: number | null
): Promise<{ 
  success: boolean; 
  siteId?: number; 
  error?: any; 
  message?: string 
}>
```

### Parameters

- **request**: `CreateHeritageSiteRequest` - Complete heritage site data including:
  - `site`: Core site information
  - `media`: Array of media items
  - `visitingHours`: Array of opening hours
  - `ticketTypes`: Array of ticket types
  - `transportation`: Array of transport options
  - `amenities`: Array of amenities
  - `etiquettes`: Array of cultural etiquettes
  - `translations`: Array of translations for all languages

- **siteId**: `number | null` (optional) - If provided, updates existing site; otherwise creates new site

### Return Value

Returns an object with:
- `success`: Boolean indicating operation status
- `siteId`: ID of the created/updated site
- `error`: Error object if operation failed
- `message`: Descriptive message about the operation

## Usage Examples

### Example 1: Creating a New Heritage Site

```typescript
import { HeritageSiteService } from '@/services/heritageSite.service';

const newSiteData = {
  site: {
    name_default: 'Sun Temple, Modhera',
    short_desc_default: 'Ancient sun temple built in 1026 AD',
    full_desc_default: 'The Sun Temple is a Hindu temple dedicated to the solar deity Surya...',
    latitude: 23.5872,
    longitude: 72.1365,
    vr_link: 'https://example.com/vr-tour',
    is_active: true,
    location_address: 'Modhera, Gujarat',
    location_city: 'Modhera',
    location_state: 'Gujarat',
    location_country: 'India',
  },
  media: [
    {
      media_type: 'image',
      storage_url: 'https://example.com/images/temple1.jpg',
      is_primary: true,
      position: 1,
    },
    {
      media_type: 'image',
      storage_url: 'https://example.com/images/temple2.jpg',
      is_primary: false,
      position: 2,
    },
  ],
  visitingHours: [
    { day_of_week: 'Monday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Tuesday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Wednesday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Thursday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Friday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Saturday', is_open: true, opening_time: '09:00', closing_time: '18:00' },
    { day_of_week: 'Sunday', is_open: false, opening_time: null, closing_time: null },
  ],
  ticketTypes: [
    { visitor_type: 'Adult', amount: 150, currency: 'INR', notes: '18-60 years' },
    { visitor_type: 'Child', amount: 50, currency: 'INR', notes: '5-17 years' },
    { visitor_type: 'Senior', amount: 75, currency: 'INR', notes: '60+ years' },
  ],
  transportation: [
    {
      category: 'transport',
      mode: 'metro',
      name: 'Ahmedabad Metro',
      description: 'Nearest major metro connection',
      travel_time_minutes: 60,
    },
    {
      category: 'transport',
      mode: 'bus',
      name: 'Modhera Village Bus Stand',
      description: 'Frequent local buses available',
      travel_time_minutes: 5,
    },
  ],
  amenities: [
    { name: 'Wheelchair Access', icon: 'ri-wheelchair-line' },
    { name: 'Parking', icon: 'ri-parking-line' },
    { name: 'Restaurant', icon: 'ri-restaurant-line' },
    { name: 'Gift Shop', icon: 'ri-store-2-line' },
  ],
  etiquettes: [
    {
      rule_title: 'Remove footwear',
      rule_description: 'Please remove footwear before entering the temple premises',
      importance_level: 'high',
    },
    {
      rule_title: 'Dress modestly',
      rule_description: 'Cover shoulders and knees',
      importance_level: 'high',
    },
    {
      rule_title: 'No flash photography',
      rule_description: 'Flash is prohibited near ancient carvings',
      importance_level: 'normal',
    },
  ],
  translations: [
    // English
    {
      language_code: 'EN',
      name: 'Sun Temple, Modhera',
      short_desc: 'Ancient sun temple built in 1026 AD by King Bhima I',
      full_desc: 'The Sun Temple is a Hindu temple dedicated to the solar deity Surya located at Modhera in Gujarat, India. It was built in 1026 AD during the reign of King Bhima I of the Chaulukya dynasty.',
      address: 'Modhera, Gujarat',
      city: 'Modhera',
      state: 'Gujarat',
      country: 'India',
    },
    // Hindi
    {
      language_code: 'HI',
      name: 'सूर्य मंदिर, मोढेरा',
      short_desc: '1026 ईस्वी में राजा भीम प्रथम द्वारा निर्मित प्राचीन सूर्य मंदिर',
      full_desc: 'सूर्य मंदिर भारत के गुजरात में मोढेरा में स्थित सूर्य देवता को समर्पित एक हिंदू मंदिर है। इसे चालुक्य वंश के राजा भीम प्रथम के शासनकाल में 1026 ईस्वी में बनाया गया था।',
      address: 'मोढेरा, गुजरात',
      city: 'मोढेरा',
      state: 'गुजरात',
      country: 'भारत',
    },
    // Gujarati
    {
      language_code: 'GU',
      name: 'સૂર્ય મંદિર, મોઢેરા',
      short_desc: 'રાજા ભીમ પ્રથમ દ્વારા 1026 એડીમાં બાંધવામાં આવેલું પ્રાચીન સૂર્ય મંદિર',
      full_desc: 'સૂર્ય મંદિર ગુજરાત, ભારતમાં મોઢેરા ખાતે સ્થિત સૂર્ય દેવતાને સમર્પિત એક હિન્દુ મંદિર છે. તે ચાલુક્ય વંશના રાજા ભીમ પ્રથમના શાસનકાળ દરમિયાન 1026 એડીમાં બાંધવામાં આવ્યું હતું.',
      address: 'મોઢેરા, ગુજરાત',
      city: 'મોઢેરા',
      state: 'ગુજરાત',
      country: 'ભારત',
    },
    // Japanese
    {
      language_code: 'JA',
      name: '太陽寺院、モデーラ',
      short_desc: '1026年にビーマ1世によって建てられた古代の太陽寺院',
      full_desc: '太陽寺院は、インドのグジャラート州モデーラにある太陽神スーリヤに捧げられたヒンドゥー教の寺院です。チャウルキヤ王朝のビーマ1世の治世中の1026年に建てられました。',
      address: 'モデーラ、グジャラート',
      city: 'モデーラ',
      state: 'グジャラート',
      country: 'インド',
    },
    // Spanish
    {
      language_code: 'ES',
      name: 'Templo del Sol, Modhera',
      short_desc: 'Antiguo templo del sol construido en 1026 d.C. por el rey Bhima I',
      full_desc: 'El Templo del Sol es un templo hindú dedicado a la deidad solar Surya ubicado en Modhera, Gujarat, India. Fue construido en 1026 d.C. durante el reinado del rey Bhima I de la dinastía Chaulukya.',
      address: 'Modhera, Gujarat',
      city: 'Modhera',
      state: 'Gujarat',
      country: 'India',
    },
    // French
    {
      language_code: 'FR',
      name: 'Temple du Soleil, Modhera',
      short_desc: 'Ancien temple du soleil construit en 1026 après J.-C. par le roi Bhima I',
      full_desc: 'Le Temple du Soleil est un temple hindou dédié à la divinité solaire Surya situé à Modhera au Gujarat, en Inde. Il a été construit en 1026 après J.-C. sous le règne du roi Bhima I de la dynastie Chaulukya.',
      address: 'Modhera, Gujarat',
      city: 'Modhera',
      state: 'Gujarat',
      country: 'Inde',
    },
  ],
};

// Create new site
const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(newSiteData);

if (result.success) {
  console.log(`Success! Site ID: ${result.siteId}`);
  console.log(result.message);
} else {
  console.error('Failed:', result.message);
  console.error(result.error);
}
```

### Example 2: Updating an Existing Heritage Site

```typescript
// Update existing site with ID 123
const updatedData = {
  site: {
    name_default: 'Sun Temple, Modhera (Updated)',
    short_desc_default: 'Updated description',
    is_active: true,
  },
  translations: [
    {
      language_code: 'EN',
      name: 'Sun Temple, Modhera',
      short_desc: 'Updated English description',
    },
    {
      language_code: 'HI',
      name: 'सूर्य मंदिर, मोढेरा',
      short_desc: 'अद्यतन हिंदी विवरण',
    },
    // Other languages will be filled with existing data or defaults
  ],
  media: [],
  visitingHours: [],
  ticketTypes: [],
  transportation: [],
  amenities: [],
  etiquettes: [],
};

const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(
  updatedData,
  123 // Existing site ID
);

if (result.success) {
  console.log(result.message);
} else {
  console.error('Update failed:', result.message);
}
```

### Example 3: Minimal Required Fields

```typescript
// Minimum required data for creating a heritage site
const minimalSiteData = {
  site: {
    name_default: 'New Heritage Site',
    is_active: false, // Draft mode
  },
  translations: [
    {
      language_code: 'EN',
      name: 'New Heritage Site',
    },
    {
      language_code: 'HI',
      name: 'नया विरासत स्थल',
    },
    {
      language_code: 'GU',
      name: 'નવું વારસો સ્થળ',
    },
    {
      language_code: 'JA',
      name: '新しい遺産サイト',
    },
    {
      language_code: 'ES',
      name: 'Nuevo Sitio Patrimonial',
    },
    {
      language_code: 'FR',
      name: 'Nouveau Site Patrimonial',
    },
  ],
  media: [],
  visitingHours: [],
  ticketTypes: [],
  transportation: [],
  amenities: [],
  etiquettes: [],
};

const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(minimalSiteData);
```

## Key Features

### 1. Automatic Language Handling

The function automatically:
- Creates translation rows for ALL 6 supported languages
- Falls back to default values if translations are not provided
- Uses the site name as the default for missing language names
- Applies location data to all languages

### 2. Upsert Behavior

- **Without siteId**: Creates a new heritage site
- **With siteId**: Updates existing heritage site
- Automatically manages child records (delete + insert pattern)

### 3. Rollback on Error

If any operation fails during creation:
- Automatically deletes the created site record
- Returns detailed error message
- Maintains database consistency

### 4. Data Mapping

The function handles field name mapping between API and database:

| API Field | Database Field |
|-----------|---------------|
| `storage_url` | `media_url` |
| `visitor_type` | `ticket_name` |
| `amount` | `price` |
| `is_open` | `is_closed` (inverted) |
| `opening_time` | `open_time` |
| `closing_time` | `close_time` |
| `category + mode` | `transport_type` |

## Translation Fields

### heritage_sitetranslation Table Structure

Each language has one row with these fields:

- `translation_id` (auto-generated)
- `site_id` (foreign key)
- `language_code` ('EN', 'HI', 'GU', 'JA', 'ES', 'FR')
- `name` (site name in that language)
- `short_desc` (short description/overview)
- `full_desc` (full description/history)
- `address` (street address)
- `city` (city name)
- `state` (state/province name)
- `country` (country name)
- `meta_title` (SEO meta title)
- `meta_description` (SEO meta description)

## Best Practices

1. **Always Provide All Languages**: Even if content is the same, provide entries for all 6 languages
2. **Use Uppercase Language Codes**: EN, HI, GU, JA, ES, FR (function will convert automatically)
3. **Set Proper is_active Flag**: Use `false` for drafts, `true` for published sites
4. **Validate Data Before Submission**: Check required fields before calling the function
5. **Handle Errors Gracefully**: Always check `result.success` and display `result.message`

## Error Handling

```typescript
const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(data, siteId);

if (!result.success) {
  // Log detailed error
  console.error('Operation failed:', result.message);
  console.error('Error details:', result.error);
  
  // Display user-friendly message
  alert(result.message || 'Failed to save heritage site');
} else {
  console.log('Success:', result.message);
  console.log('Site ID:', result.siteId);
}
```

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| EN | English | 🇬🇧 |
| HI | Hindi | 🇮🇳 |
| GU | Gujarati | 🇮🇳 |
| JA | Japanese | 🇯🇵 |
| ES | Spanish | 🇪🇸 |
| FR | French | 🇫🇷 |

## Database Operations Flow

### Insert Operation (New Site)

1. Insert into `heritage_site` table
2. Get generated `site_id`
3. Insert into child tables:
   - `heritage_sitemedia`
   - `heritage_sitevisitinghours`
   - `heritage_sitetickettype`
   - `heritage_sitetransportation`
   - `heritage_siteamenity`
   - `heritage_siteetiquette`
   - `heritage_sitetranslation` (6 rows, one per language)
4. Return success with `site_id`

### Update Operation (Existing Site)

1. Update `heritage_site` table
2. For each child table:
   - Delete all existing rows for the site
   - Insert new rows
3. Return success

## Notes

- The function uses Supabase for database operations
- All timestamps are in ISO 8601 format
- Numeric IDs are of type `bigint` in the database
- Boolean fields use `true`/`false`
- Nullable fields accept `null` or `undefined`

## Troubleshooting

### Common Issues

1. **Missing site_id on update**: Ensure `siteId` parameter is a valid number
2. **Translation not appearing**: Check language code is uppercase and supported
3. **Data not saving**: Verify required fields are provided (`name_default`)
4. **Error on create**: Check for unique constraint violations or invalid foreign keys

### Debug Tips

```typescript
// Enable detailed logging
console.log('Upsert request:', JSON.stringify(request, null, 2));

const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(request, siteId);

console.log('Upsert result:', result);

if (!result.success) {
  console.error('Full error object:', result.error);
}
```

## Related Functions

- `getHeritageSiteDetails(siteId)`: Fetch complete site details with all related data
- `getHeritageSite(siteId)`: Fetch basic site information
- `getHeritageSites(filters)`: List all heritage sites with filtering
- `deleteHeritageSite(siteId)`: Delete a heritage site and all related records
- `toggleHeritageSiteStatus(siteId, isActive)`: Toggle active/inactive status

## Conclusion

The `upsertHeritageSiteWithTranslations` function provides a robust, all-in-one solution for managing heritage sites with multi-language support. It handles the complexity of managing related records across multiple tables while ensuring data consistency and providing clear error messages.

