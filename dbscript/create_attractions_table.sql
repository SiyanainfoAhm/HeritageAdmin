-- Migration: Create separate table for nearby attractions
-- Purpose: Store nearby attractions in a dedicated table separate from transportation
-- Date: 2025-01-XX

-- Create nearby attractions table
CREATE TABLE IF NOT EXISTS heritage_siteattraction (
  attraction_id SERIAL PRIMARY KEY,
  site_id INTEGER NOT NULL REFERENCES heritage_site(site_id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Attraction name (default language, usually English)
  distance_km NUMERIC(10, 2), -- Distance from heritage site in kilometers
  notes TEXT, -- Additional notes/description (default language)
  position INTEGER DEFAULT 0, -- Display order
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to document the table
COMMENT ON TABLE heritage_siteattraction IS 'Stores nearby attractions for heritage sites. Separate from transportation table.';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attraction_site_id 
ON heritage_siteattraction(site_id);

CREATE INDEX IF NOT EXISTS idx_attraction_position 
ON heritage_siteattraction(site_id, position);

-- Create translation table for attractions
CREATE TABLE IF NOT EXISTS heritage_siteattractiontranslation (
  translation_id SERIAL PRIMARY KEY,
  attraction_id INTEGER NOT NULL REFERENCES heritage_siteattraction(attraction_id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT, -- Translated attraction name
  notes TEXT, -- Translated notes/description
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attraction_id, language_code)
);

-- Add comment to document the table
COMMENT ON TABLE heritage_siteattractiontranslation IS 'Stores multi-language translations for nearby attractions';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_attraction_translation_attraction_id 
ON heritage_siteattractiontranslation(attraction_id);

CREATE INDEX IF NOT EXISTS idx_attraction_translation_language_code 
ON heritage_siteattractiontranslation(language_code);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_attraction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_attraction_timestamp
BEFORE UPDATE ON heritage_siteattraction
FOR EACH ROW
EXECUTE FUNCTION update_attraction_updated_at();

CREATE TRIGGER update_attraction_translation_timestamp
BEFORE UPDATE ON heritage_siteattractiontranslation
FOR EACH ROW
EXECUTE FUNCTION update_attraction_updated_at();

