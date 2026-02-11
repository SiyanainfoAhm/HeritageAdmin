-- Add status and updated_at to existing heritage_app_feedback table.
-- Run in Supabase SQL editor. Safe to run multiple times (IF NOT EXISTS).

-- Add status column if not exists (default Open; allowed: Open, In Progress, Resolved)
ALTER TABLE heritage_app_feedback
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'Open';

-- Add constraint only if we need to restrict values (optional; run once)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'heritage_app_feedback_status_check'
    AND conrelid = 'heritage_app_feedback'::regclass
  ) THEN
    ALTER TABLE heritage_app_feedback
      ADD CONSTRAINT heritage_app_feedback_status_check
      CHECK (status IN ('Open', 'In Progress', 'Resolved'));
  END IF;
END $$;

-- Add updated_at column if not exists
ALTER TABLE heritage_app_feedback
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;

-- Index for status (optional, for filtering)
CREATE INDEX IF NOT EXISTS idx_heritage_app_feedback_status ON heritage_app_feedback(status);

-- Trigger to set updated_at on row update
CREATE OR REPLACE FUNCTION heritage_app_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_heritage_app_feedback_updated_at ON heritage_app_feedback;
CREATE TRIGGER trigger_heritage_app_feedback_updated_at
  BEFORE UPDATE ON heritage_app_feedback
  FOR EACH ROW EXECUTE PROCEDURE heritage_app_feedback_updated_at();

COMMENT ON COLUMN heritage_app_feedback.status IS 'Open (default), In Progress, or Resolved.';
COMMENT ON COLUMN heritage_app_feedback.updated_at IS 'Set automatically on row update.';
