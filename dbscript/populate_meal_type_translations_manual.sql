-- Alternative: Manual insertion of meal type translations
-- Use this script if you want more control over the translations
-- or if the automatic detection doesn't work correctly for your meal types
--
-- INSTRUCTIONS:
-- 1. Replace the meal_type_id values with your actual meal type IDs
-- 2. Adjust translations as needed
-- 3. Run this script after creating the translation table

-- ============================================================================
-- Breakfast Translations
-- Replace meal_type_id = 1 with actual Breakfast meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (1, 'EN', 'Breakfast'),
  (1, 'HI', 'नाश्ता'),
  (1, 'GU', 'નાસ્તો'),
  (1, 'JA', '朝食'),
  (1, 'ES', 'Desayuno'),
  (1, 'FR', 'Petit-déjeuner')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Brunch Translations
-- Replace meal_type_id = 2 with actual Brunch meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (2, 'EN', 'Brunch'),
  (2, 'HI', 'ब्रंच'),
  (2, 'GU', 'બ્રંચ'),
  (2, 'JA', 'ブランチ'),
  (2, 'ES', 'Brunch'),
  (2, 'FR', 'Brunch')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Lunch Translations
-- Replace meal_type_id = 3 with actual Lunch meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (3, 'EN', 'Lunch'),
  (3, 'HI', 'दोपहर का भोजन'),
  (3, 'GU', 'લંચ'),
  (3, 'JA', '昼食'),
  (3, 'ES', 'Almuerzo'),
  (3, 'FR', 'Déjeuner')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- High Tea Translations
-- Replace meal_type_id = 4 with actual High Tea meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (4, 'EN', 'High Tea'),
  (4, 'HI', 'हाई टी'),
  (4, 'GU', 'હાઈ ટી'),
  (4, 'JA', 'ハイティー'),
  (4, 'ES', 'Té de la tarde'),
  (4, 'FR', 'Thé de l''après-midi')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Dinner Translations
-- Replace meal_type_id = 5 with actual Dinner meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (5, 'EN', 'Dinner'),
  (5, 'HI', 'रात का खाना'),
  (5, 'GU', 'રાત્રિભોજન'),
  (5, 'JA', '夕食'),
  (5, 'ES', 'Cena'),
  (5, 'FR', 'Dîner')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Snacks Translations
-- Replace meal_type_id = 6 with actual Snacks meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (6, 'EN', 'Snacks'),
  (6, 'HI', 'नाश्ता'),
  (6, 'GU', 'નાસ્તા'),
  (6, 'JA', '軽食'),
  (6, 'ES', 'Aperitivos'),
  (6, 'FR', 'Collation')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Beverages Translations
-- Replace meal_type_id = 7 with actual Beverages meal_type_id
-- ============================================================================

INSERT INTO heritage_meal_typetranslation (meal_type_id, language_code, meal_type_name)
VALUES 
  (7, 'EN', 'Beverages'),
  (7, 'HI', 'पेय'),
  (7, 'GU', 'પીણાં'),
  (7, 'JA', '飲み物'),
  (7, 'ES', 'Bebidas'),
  (7, 'FR', 'Boissons')
ON CONFLICT (meal_type_id, language_code) 
DO UPDATE SET meal_type_name = EXCLUDED.meal_type_name, updated_at = NOW();

-- ============================================================================
-- Verification Query
-- ============================================================================

-- Uncomment to verify all translations were inserted
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