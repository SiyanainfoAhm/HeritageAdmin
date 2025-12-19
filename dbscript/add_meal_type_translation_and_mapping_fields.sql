-- Migration: Add translation table for meal types and update mapping table
-- Purpose: 
--   1. Create translation table for heritage_meal_type to support multi-language meal type names
--   2. Add number_of_guests, start_time, and end_time columns to heritage_food_meal_type_mapping
-- Date: 2025-01-XX

-- ============================================================================
-- PART 1: Create translation table for meal types
-- ============================================================================

-- Create translation table for meal types
CREATE TABLE IF NOT EXISTS heritage_meal_typetranslation (
  translation_id SERIAL PRIMARY KEY,
  meal_type_id INTEGER NOT NULL REFERENCES heritage_meal_type(meal_type_id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  meal_type_name TEXT NOT NULL, -- Translated meal type name (e.g., "Breakfast", "Lunch", "Dinner")
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meal_type_id, language_code)
);

-- Add comment to document the table
COMMENT ON TABLE heritage_meal_typetranslation IS 'Stores multi-language translations for meal types (Breakfast, Lunch, Dinner, etc.)';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_meal_type_translation_meal_type_id 
ON heritage_meal_typetranslation(meal_type_id);

CREATE INDEX IF NOT EXISTS idx_meal_type_translation_language_code 
ON heritage_meal_typetranslation(language_code);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_meal_type_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_meal_type_translation_timestamp
BEFORE UPDATE ON heritage_meal_typetranslation
FOR EACH ROW
EXECUTE FUNCTION update_meal_type_translation_updated_at();

-- ============================================================================
-- PART 2: Add columns to heritage_food_meal_type_mapping table
-- ============================================================================

-- Add number_of_guests column (Maximum guests per booking for this meal type)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'heritage_food_meal_type_mapping' 
    AND column_name = 'number_of_guests'
  ) THEN
    ALTER TABLE heritage_food_meal_type_mapping 
    ADD COLUMN number_of_guests INTEGER;
    
    COMMENT ON COLUMN heritage_food_meal_type_mapping.number_of_guests IS 'Maximum number of guests allowed per booking for this meal type';
  END IF;
END $$;

-- Add start_time column (Start time for this meal type availability)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'heritage_food_meal_type_mapping' 
    AND column_name = 'start_time'
  ) THEN
    ALTER TABLE heritage_food_meal_type_mapping 
    ADD COLUMN start_time TIME;
    
    COMMENT ON COLUMN heritage_food_meal_type_mapping.start_time IS 'Start time for meal availability (format: HH:MM:SS)';
  END IF;
END $$;

-- Add end_time column (End time for this meal type availability)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'heritage_food_meal_type_mapping' 
    AND column_name = 'end_time'
  ) THEN
    ALTER TABLE heritage_food_meal_type_mapping 
    ADD COLUMN end_time TIME;
    
    COMMENT ON COLUMN heritage_food_meal_type_mapping.end_time IS 'End time for meal availability (format: HH:MM:SS)';
  END IF;
END $$;

-- ============================================================================
-- Verification Queries (Optional - uncomment to verify)
-- ============================================================================

-- Verify translation table structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'heritage_meal_typetranslation'
-- ORDER BY ordinal_position;

-- Verify mapping table has new columns
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'heritage_food_meal_type_mapping'
-- ORDER BY ordinal_position;