-- Feedback & Complaints table for admin reports.
-- Run this in Supabase SQL editor if the table does not exist.

CREATE TABLE IF NOT EXISTS heritage_feedback (
  feedback_id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES heritage_user(user_id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Complaint', 'Suggestion', 'Feedback')),
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

COMMENT ON TABLE heritage_feedback IS 'User feedback and complaints for admin reports; Entity is derived from user type (Tourist, Artisan, etc.).';
COMMENT ON COLUMN heritage_feedback.comments IS 'User comment/description shown in the Description column.';
COMMENT ON COLUMN heritage_feedback.status IS 'Open (default), In Progress, or Resolved.';

CREATE INDEX IF NOT EXISTS idx_heritage_feedback_user_id ON heritage_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_heritage_feedback_status ON heritage_feedback(status);
CREATE INDEX IF NOT EXISTS idx_heritage_feedback_type ON heritage_feedback(type);
CREATE INDEX IF NOT EXISTS idx_heritage_feedback_created_at ON heritage_feedback(created_at DESC);

-- Optional: trigger to set updated_at
CREATE OR REPLACE FUNCTION heritage_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_heritage_feedback_updated_at ON heritage_feedback;
CREATE TRIGGER trigger_heritage_feedback_updated_at
  BEFORE UPDATE ON heritage_feedback
  FOR EACH ROW EXECUTE PROCEDURE heritage_feedback_updated_at();
