# Amenity Translation Implementation

## Overview
This implementation adds multi-language translation support for amenities in the Heritage Admin system. Amenities can now be displayed and managed in multiple languages (EN, HI, GU, JA, ES, FR).

## Database Changes

### 1. Translation Table
Created `heritage_amenitytranslation` table to store translations for amenity names.

**Table Structure:**
- `translation_id` - Primary key
- `amenity_id` - Foreign key to `heritage_amenity`
- `language_code` - Language code (EN, HI, GU, JA, ES, FR)
- `name` - Translated amenity name
- `created_at`, `updated_at` - Timestamps
- Unique constraint on `(amenity_id, language_code)`

**Migration Script:** `dbscript/create_amenity_translation_table.sql`

## Code Changes

### 1. State Management
- Added `amenityTranslations` state to store translations for all loaded amenities
- Structure: `Record<amenity_id, Record<LanguageCode, string>>`

### 2. Updated Functions

#### `loadAvailableAmenities()`
- Now loads amenities along with their translations
- Filters amenities by `user_id IS NULL` OR `created_by = current_user_id`
- Populates `amenityTranslations` state with translations from database
- Falls back to English name if translation is missing

#### `insertAmenityWithTranslations()`
- New function to insert an amenity with translations
- Parameters:
  - `name`: English name (base name)
  - `icon`: Icon identifier
  - `translations`: Object with translations for all languages
  - `userId`: Optional user ID
  - `createdBy`: Optional created_by user ID
- Inserts amenity first, then inserts all translations
- Reloads amenities after insertion

#### `updateAmenityTranslations()`
- New function to update translations for an existing amenity
- Parameters:
  - `amenityId`: ID of the amenity
  - `translations`: Object with translations for all languages
- Uses upsert to update or create translations
- Reloads amenities after update

### 3. UI Updates

#### Amenity Selection Dialog
- Displays translated amenity names based on current language tab
- Shows English name in parentheses when viewing non-English language
- Maintains existing functionality (click to add as feature)

#### Feature Display
- Features created from amenities now show translated names
- Matches feature name with amenity name to find translations
- Falls back to English if translation not available

## Usage

### Loading Amenities with Translations
```typescript
await loadAvailableAmenities();
// Amenities and translations are now loaded in state
```

### Inserting Amenity with Translations
```typescript
const result = await insertAmenityWithTranslations(
  'Wi-Fi', // English name
  'wifi', // Icon
  {
    en: 'Wi-Fi',
    hi: 'वाई-फाई',
    gu: 'વાય-ફાઇ',
    ja: 'Wi-Fi',
    es: 'Wi-Fi',
    fr: 'Wi-Fi'
  },
  userId,
  createdBy
);
```

### Updating Amenity Translations
```typescript
const result = await updateAmenityTranslations(
  amenityId,
  {
    en: 'Wi-Fi',
    hi: 'वाई-फाई',
    gu: 'વાય-ફાઇ',
    ja: 'Wi-Fi',
    es: 'Wi-Fi',
    fr: 'Wi-Fi'
  }
);
```

## Features

1. **Automatic Translation Loading**: Translations are loaded automatically when amenities are fetched
2. **Language-Aware Display**: Amenities show translated names based on current language tab
3. **Fallback Support**: Falls back to English if translation is missing
4. **Translation Management**: Helper functions for inserting and updating translations

## Database Migration

To apply the database changes, run:
```sql
\i dbscript/create_amenity_translation_table.sql
```

## Notes

- The `insertAmenityWithTranslations` and `updateAmenityTranslations` functions are available but not yet integrated into the UI. They can be used when adding amenity management functionality.
- Translations are automatically loaded when viewing event details and selecting amenities.
- Feature names from amenities are displayed in the current language when available.

