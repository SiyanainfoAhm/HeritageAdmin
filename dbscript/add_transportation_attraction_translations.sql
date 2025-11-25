-- Migration: Add translation tables for transportation and attractions
-- Purpose: Store multi-language translations for transportation options and nearby attractions
-- Date: 2025-01-XX

-- Create translation table for transportation
CREATE TABLE IF NOT EXISTS heritage_sitetransportationtranslation (
  translation_id SERIAL PRIMARY KEY,
  transportation_id INTEGER NOT NULL REFERENCES heritage_sitetransportation(transportation_id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  name TEXT, -- Translated name/station name
  route_info TEXT, -- Translated route information
  accessibility_notes TEXT, -- Translated accessibility notes
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(transportation_id, language_code)
);

-- Add comment to document the table
COMMENT ON TABLE heritage_sitetransportationtranslation IS 'Stores multi-language translations for transportation options (bus, metro, taxi, etc.)';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_transportation_translation_transportation_id 
ON heritage_sitetransportationtranslation(transportation_id);

CREATE INDEX IF NOT EXISTS idx_transportation_translation_language_code 
ON heritage_sitetransportationtranslation(language_code);

-- NOTE: Attraction translation table is created in create_attractions_table.sql
-- This file only handles transportation translations
-- Run create_attractions_table.sql first to create the heritage_siteattraction table

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transportation_translation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transportation_translation_timestamp
BEFORE UPDATE ON heritage_sitetransportationtranslation
FOR EACH ROW
EXECUTE FUNCTION update_transportation_translation_updated_at();

-- NOTE: The trigger for heritage_siteattractiontranslation is created in create_attractions_table.sql
-- Do not create it here to avoid conflicts

