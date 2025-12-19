-- Migration: Populate meal type translations for all languages
-- Purpose: Insert translations for all meal types in EN, HI, GU, JA, ES, FR
-- Date: 2025-01-XX
--
-- This script populates the heritage_meal_typetranslation table with translations
-- for all existing meal types. It uses the default meal_type_name as the English translation
-- and adds translations for other languages.

-- ============================================================================
-- Step 1: Insert English translations (from default meal_type_name)
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
SELECT 
  meal_type_id,
  'EN' AS language_code,
  meal_type_name
FROM heritage_meal_type
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET 
  meal_type_name = EXCLUDED.meal_type_name,
  updated_at = NOW();

-- ============================================================================
-- Step 2: Insert translations for all other languages
-- ============================================================================

-- Define translation mappings for common meal types
-- This uses a CTE to map meal type names to their translations
WITH meal_type_translations AS (
  SELECT 
    mt.meal_type_id,
    mt.meal_type_key,
    mt.meal_type_name,
    CASE 
      -- Breakfast translations
      WHEN LOWER(mt.meal_type_name) LIKE '%breakfast%' OR LOWER(mt.meal_type_key) LIKE '%breakfast%' THEN
        jsonb_build_object(
          'HI', 'नाश्ता',
          'GU', 'નાસ્તો',
          'JA', '朝食',
          'ES', 'Desayuno',
          'FR', 'Petit-déjeuner'
        )
      -- Brunch translations
      WHEN LOWER(mt.meal_type_name) LIKE '%brunch%' OR LOWER(mt.meal_type_key) LIKE '%brunch%' THEN
        jsonb_build_object(
          'HI', 'ब्रंच',
          'GU', 'બ્રંચ',
          'JA', 'ブランチ',
          'ES', 'Brunch',
          'FR', 'Brunch'
        )
      -- Lunch translations
      WHEN LOWER(mt.meal_type_name) LIKE '%lunch%' OR LOWER(mt.meal_type_key) LIKE '%lunch%' THEN
        jsonb_build_object(
          'HI', 'दोपहर का भोजन',
          'GU', 'લંચ',
          'JA', '昼食',
          'ES', 'Almuerzo',
          'FR', 'Déjeuner'
        )
      -- High Tea translations
      WHEN LOWER(mt.meal_type_name) LIKE '%high tea%' OR LOWER(mt.meal_type_name) LIKE '%tea%' OR LOWER(mt.meal_type_key) LIKE '%tea%' THEN
        jsonb_build_object(
          'HI', 'हाई टी',
          'GU', 'હાઈ ટી',
          'JA', 'ハイティー',
          'ES', 'Té de la tarde',
          'FR', 'Thé de l''après-midi'
        )
      -- Dinner translations
      WHEN LOWER(mt.meal_type_name) LIKE '%dinner%' OR LOWER(mt.meal_type_key) LIKE '%dinner%' THEN
        jsonb_build_object(
          'HI', 'रात का खाना',
          'GU', 'રાત્રિભોજન',
          'JA', '夕食',
          'ES', 'Cena',
          'FR', 'Dîner'
        )
      -- Snacks translations
      WHEN LOWER(mt.meal_type_name) LIKE '%snack%' OR LOWER(mt.meal_type_key) LIKE '%snack%' THEN
        jsonb_build_object(
          'HI', 'नाश्ता',
          'GU', 'નાસ્તા',
          'JA', '軽食',
          'ES', 'Aperitivos',
          'FR', 'Collation'
        )
      -- Beverages translations
      WHEN LOWER(mt.meal_type_name) LIKE '%beverage%' OR LOWER(mt.meal_type_name) LIKE '%drink%' OR LOWER(mt.meal_type_key) LIKE '%beverage%' OR LOWER(mt.meal_type_key) LIKE '%drink%' THEN
        jsonb_build_object(
          'HI', 'पेय',
          'GU', 'પીણાં',
          'JA', '飲み物',
          'ES', 'Bebidas',
          'FR', 'Boissons'
        )
      -- Default fallback (use English name if no match)
      ELSE
        jsonb_build_object(
          'HI', mt.meal_type_name,
          'GU', mt.meal_type_name,
          'JA', mt.meal_type_name,
          'ES', mt.meal_type_name,
          'FR', mt.meal_type_name
        )
    END AS translations
  FROM heritage_meal_type mt
)
INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
SELECT 
  mtt.meal_type_id,
  lang_code AS language_code,
  mtt.translations->>lang_code AS meal_type_name
FROM meal_type_translations mtt
CROSS JOIN unnest(ARRAY['HI', 'GU', 'JA', 'ES', 'FR']) AS lang_code
WHERE mtt.translations->>lang_code IS NOT NULL
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET 
  meal_type_name = EXCLUDED.meal_type_name,
  updated_at = NOW();

-- ============================================================================
-- Verification: Check inserted translations
-- ============================================================================

-- Uncomment to verify translations were inserted correctly
/*
SELECT 
  mt.meal_type_id,
  mt.meal_type_name AS default_name,
  mt.meal_type_key,
  json_object_agg(
    t.language_code ORDER BY t.language_code,
    t.meal_type_name
  ) FILTER (WHERE t.meal_type_name IS NOT NULL) AS translations
FROM heritage_meal_type mt
LEFT JOIN heritage_meal_typetranslation t ON mt.meal_type_id = t.meal_type_id
GROUP BY mt.meal_type_id, mt.meal_type_name, mt.meal_type_key
ORDER BY mt.meal_type_id;
*/

-- Count translations per language
/*
SELECT 
  language_code,
  COUNT(*) AS translation_count
FROM heritage_meal_typetranslation
GROUP BY language_code
ORDER BY language_code;
*/