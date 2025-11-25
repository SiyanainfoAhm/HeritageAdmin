# Language Code Migration for Heritage Site Media

## Overview
This migration adds the `language_code` column to the `heritage_sitemedia` table to properly store and filter audio guides by language.

## Problem
The `heritage_sitemedia` table was missing the `language_code` column, which is required to:
- Store the language code (EN, HI, GU, JA, ES, FR) for audio guide files
- Filter audio guides by language when loading heritage sites
- Maintain proper language associations for audio files

## Solution
Run the SQL migration script to add the `language_code` column to the database.

## Migration Steps

### 1. Run the Migration Script
Execute the SQL script in your Supabase SQL editor or database client:

```sql
-- File: dbscript/add_language_code_to_media.sql
```

Or run it via command line:
```bash
psql -U your_user -d your_database -f dbscript/add_language_code_to_media.sql
```

### 2. Verify the Column Was Added
Check that the column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'heritage_sitemedia' 
AND column_name = 'language_code';
```

### 3. Test the Application
After running the migration:
1. Try uploading an audio guide for a heritage site
2. Verify that the `language_code` is saved correctly
3. Edit the site and verify the audio guide loads with the correct language code

## What the Migration Does

1. **Adds `language_code` column**: 
   - Type: `TEXT`
   - Nullable: `YES` (NULL for non-audio media types)
   - Purpose: Stores language codes like 'EN', 'HI', 'GU', 'JA', 'ES', 'FR'

2. **Creates an index**: 
   - Index on `language_code` for faster filtering
   - Only indexes non-NULL values (partial index)

3. **Adds documentation**: 
   - Column comment explaining its purpose

## Code Changes

The following code changes have been made to support `language_code`:

1. **`src/services/heritageSite.service.ts`**:
   - `createHeritageSiteWithDetails`: Includes `language_code` when inserting audio media
   - `updateHeritageSiteWithDetails`: Includes `language_code` when updating audio media
   - `upsertHeritageSiteWithTranslations`: Includes `language_code` when upserting audio media
   - Added error handling to detect if column is missing

2. **`src/pages/Masters/AddHeritageSite.tsx`**:
   - `buildCreateRequestWithUrls`: Sets `language_code` for audio files
   - `buildCreateRequest`: Sets `language_code` for audio files
   - `hydrateStateFromDetails`: Loads audio guides by matching `language_code`

## Error Handling

If the `language_code` column doesn't exist, the application will:
1. Log a clear error message
2. Display a user-friendly error indicating the migration needs to be run
3. Provide the path to the migration script

## Rollback (if needed)

If you need to remove the column:
```sql
ALTER TABLE heritage_sitemedia DROP COLUMN IF EXISTS language_code;
DROP INDEX IF EXISTS idx_heritage_sitemedia_language_code;
```

## Notes

- The `language_code` is stored in **uppercase** (EN, HI, GU, etc.) for consistency
- Only audio media types (`media_type = 'audio'`) will have a `language_code` value
- Other media types (images, videos, documents) will have `NULL` for `language_code`
- The migration uses `IF NOT EXISTS` to prevent errors if run multiple times

