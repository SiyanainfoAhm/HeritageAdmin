-- Migration: Create translation table for amenities
-- Purpose: Store multi-language translations for amenity names
-- Date: 2025-01-XX

-- Create translation table for amenities
CREATE TABLE IF NOT EXISTS heritage_amenitytranslation (
  translation_id SERIAL PRIMARY KEY,
  amenity_id INTEGER NOT NULL REFERENCES heritage_amenity(amenity_id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT NOT NULL, -- Translated amenity name
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(amenity_id, language_code)
);

-- Add comment to document the table
COMMENT ON TABLE heritage_amenitytranslation IS 'Stores multi-language translations for amenity names (Wi-Fi, Parking, etc.)';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_amenity_translation_amenity_id 
ON heritage_amenitytranslation(amenity_id);

CREATE INDEX IF NOT EXISTS idx_amenity_translation_language_code 
ON heritage_amenitytranslation(language_code);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_amenity_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_amenity_translation_timestamp
BEFORE UPDATE ON heritage_amenitytranslation
FOR EACH ROW
EXECUTE FUNCTION update_amenity_translation_updated_at();

