# Meal Type Translation and Mapping Fields Migration

## Overview
This migration script adds translation support for meal types and extends the `heritage_food_meal_type_mapping` table to store booking-specific fields.

## What This Script Does

### 1. Creates `heritage_meal_typetranslation` Table
- Stores multi-language translations for meal type names
- Supports languages: EN, HI, GU, JA, ES, FR
- Each meal type can have translations in multiple languages
- Unique constraint on `(meal_type_id, language_code)` to prevent duplicates

**Table Structure:**
- `translation_id` - Primary key
- `meal_type_id` - Foreign key to `heritage_meal_type`
- `language_code` - Language code (EN, HI, GU, JA, ES, FR)
- `meal_type_name` - Translated meal type name
- `created_at`, `updated_at` - Timestamps

### 2. Adds Columns to `heritage_food_meal_type_mapping`
Adds three new columns to store booking configuration for each food-meal-type combination:

- **`number_of_guests`** (INTEGER)
  - Maximum number of guests allowed per booking for this meal type
  - Example: 8 guests for Dinner at a restaurant

- **`start_time`** (TIME)
  - Start time for meal availability
  - Format: HH:MM:SS (e.g., '09:00:00' for 9:00 AM)

- **`end_time`** (TIME)
  - End time for meal availability
  - Format: HH:MM:SS (e.g., '21:00:00' for 9:00 PM)

## Usage

### Running the Migration

```sql
-- Connect to your PostgreSQL database
\c your_database_name

-- Step 1: Run the migration script to create tables and add columns
\i dbscript/add_meal_type_translation_and_mapping_fields.sql

-- Step 2: Populate translations for all meal types
\i dbscript/populate_meal_type_translations.sql
```

Or execute the files directly:
```bash
# Step 1: Create tables and add columns
psql -U your_username -d your_database -f dbscript/add_meal_type_translation_and_mapping_fields.sql

# Step 2: Populate translations
psql -U your_username -d your_database -f dbscript/populate_meal_type_translations.sql
```

### Populating Translations

There are two scripts available for populating translations:

1. **`populate_meal_type_translations.sql`** (Automatic)
   - Automatically detects meal types by name/key
   - Uses pattern matching to assign translations
   - Recommended for initial setup

2. **`populate_meal_type_translations_manual.sql`** (Manual)
   - Requires you to know the meal_type_id values
   - More control over translations
   - Use if automatic detection doesn't work or you need custom translations

**To use the manual script:**
1. First, check your meal type IDs:
```sql
SELECT meal_type_id, meal_type_key, meal_type_name 
FROM heritage_meal_type 
ORDER BY meal_type_id;
```

2. Update the `meal_type_id` values in `populate_meal_type_translations_manual.sql`
3. Run the manual script

### Example Data

#### Inserting Meal Type Translations

```sql
-- Example: Add Hindi translation for Breakfast (assuming meal_type_id = 1)
INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES (1, 'HI', 'नाश्ता')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name;

-- Example: Add Gujarati translation for Lunch (assuming meal_type_id = 2)
INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES (2, 'GU', 'રાત્રિભોજન')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name;
```

#### Updating Food-Meal-Type Mapping with Booking Fields

```sql
-- Example: Update mapping for food_id=1, meal_type_id=3 (Dinner) with booking details
UPDATE heritage_food_meal_type_mapping
SET 
  number_of_guests = 8,
  start_time = '18:00:00',  -- 6:00 PM
  end_time = '22:00:00'     -- 10:00 PM
WHERE food_id = 1 AND meal_type_id = 3;

-- Or insert new mapping with booking fields
INSERT INTO heritage_food_meal_type_mapping (food_id, meal_type_id, number_of_guests, start_time, end_time)
VALUES (1, 3, 8, '18:00:00', '22:00:00')
ON CONFLICT (food_id, meal_type_id) 
DO UPDATE SET 
  number_of_guests = EXCLUDED.number_of_guests,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;
```

## Query Examples

### Get Meal Type with Translations

```sql
-- Get meal type with all translations
SELECT 
  mt.meal_type_id,
  mt.meal_type_key,
  mt.meal_type_name AS default_name,
  json_object_agg(
    t.language_code, 
    t.meal_type_name
  ) FILTER (WHERE t.meal_type_name IS NOT NULL) AS translations
FROM heritage_meal_type mt
LEFT JOIN heritage_meal_typetranslation t ON mt.meal_type_id = t.meal_type_id
GROUP BY mt.meal_type_id, mt.meal_type_key, mt.meal_type_name;
```

### Get Food with Meal Types and Booking Details

```sql
-- Get food item with all meal types and their booking configurations
SELECT 
  f.food_id,
  f.food_name,
  mt.meal_type_name,
  mapping.number_of_guests,
  mapping.start_time,
  mapping.end_time
FROM heritage_food f
JOIN heritage_food_meal_type_mapping mapping ON f.food_id = mapping.food_id
JOIN heritage_meal_type mt ON mapping.meal_type_id = mt.meal_type_id
WHERE f.food_id = 1;
```

### Get Meal Type Name in Specific Language

```sql
-- Get meal type name in Hindi (fallback to default if translation not available)
SELECT 
  mt.meal_type_id,
  COALESCE(t.meal_type_name, mt.meal_type_name) AS meal_type_name
FROM heritage_meal_type mt
LEFT JOIN heritage_meal_typetranslation t 
  ON mt.meal_type_id = t.meal_type_id 
  AND t.language_code = 'HI'
WHERE mt.meal_type_id = 1;
```

## Supported Languages

| Code | Language | Native Name |
|------|----------|-------------|
| EN | English | English |
| HI | Hindi | हिन्दी |
| GU | Gujarati | ગુજરાતી |
| JA | Japanese | 日本語 |
| ES | Spanish | Español |
| FR | French | Français |

## Notes

- The migration uses `IF NOT EXISTS` and `DO $$` blocks to make it idempotent (safe to run multiple times)
- All new columns are nullable to allow gradual migration
- The translation table follows the same pattern as other translation tables in the system
- Time values should be stored in 24-hour format (HH:MM:SS)

## Rollback

If you need to rollback this migration:

```sql
-- Remove columns from mapping table
ALTER TABLE heritage_food_meal_type_mapping 
DROP COLUMN IF EXISTS number_of_guests,
DROP COLUMN IF EXISTS start_time,
DROP COLUMN IF EXISTS end_time;

-- Drop translation table
DROP TABLE IF EXISTS heritage_meal_typetranslation CASCADE;

-- Drop trigger function
DROP FUNCTION IF EXISTS update_meal_type_translation_updated_at() CASCADE;
```