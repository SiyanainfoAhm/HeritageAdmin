-- Migration: Add language_code column to heritage_sitemedia table
-- Purpose: Store language code for audio guides to enable filtering by language
-- Date: 2025-01-XX

-- Add language_code column to heritage_sitemedia table
-- This column will store the language code (e.g., 'EN', 'HI', 'GU', 'JA', 'ES', 'FR') for audio files
ALTER TABLE heritage_sitemedia
ADD COLUMN IF NOT EXISTS language_code TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN heritage_sitemedia.language_code IS 'Language code for audio guides (e.g., EN, HI, GU, JA, ES, FR). NULL for non-audio media types.';

-- Optional: Create an index for faster filtering by language_code
CREATE INDEX IF NOT EXISTS idx_heritage_sitemedia_language_code 
ON heritage_sitemedia(language_code) 
WHERE language_code IS NOT NULL;

-- Optional: Add a check constraint to ensure language_code is uppercase for audio files
-- Uncomment if you want to enforce uppercase language codes
-- ALTER TABLE heritage_sitemedia
-- ADD CONSTRAINT chk_audio_language_code_uppercase 
-- CHECK (
--   (media_type != 'audio') OR 
--   (media_type = 'audio' AND language_code IS NULL) OR 
--   (media_type = 'audio' AND language_code = UPPER(language_code))
-- );

