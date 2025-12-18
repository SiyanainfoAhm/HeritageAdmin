-- Migration: Create marketing mail notifications table
-- Purpose: Store mail notifications/messages for marketing campaigns
-- Date: 2025-01-XX

-- ============================================================================
-- Create marketing mail notifications table
-- ============================================================================

CREATE TABLE IF NOT EXISTS heritage_marketing_mail (
  mail_id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'All Users',
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Scheduled', 'Sent')),
  type TEXT NOT NULL DEFAULT 'Announcement' CHECK (type IN ('Event', 'Offer', 'Announcement')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to document the table and columns
COMMENT ON TABLE heritage_marketing_mail IS 'Stores mail notifications/messages for marketing campaigns';
COMMENT ON COLUMN heritage_marketing_mail.mail_id IS 'Primary key, auto-generated mail notification ID';
COMMENT ON COLUMN heritage_marketing_mail.title IS 'Title/subject of the mail notification';
COMMENT ON COLUMN heritage_marketing_mail.body IS 'Body content of the mail notification';
COMMENT ON COLUMN heritage_marketing_mail.audience IS 'Target audience: All Users, Only Tourists, Only Vendors, Only Guides';
COMMENT ON COLUMN heritage_marketing_mail.date IS 'Date when the mail notification is scheduled or sent';
COMMENT ON COLUMN heritage_marketing_mail.status IS 'Status: Draft, Scheduled, or Sent';
COMMENT ON COLUMN heritage_marketing_mail.type IS 'Type of notification: Event, Offer, or Announcement';
COMMENT ON COLUMN heritage_marketing_mail.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN heritage_marketing_mail.created_by IS 'User who created the mail notification';
COMMENT ON COLUMN heritage_marketing_mail.updated_at IS 'Timestamp when the record was last updated';

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_marketing_mail_status ON heritage_marketing_mail(status);
CREATE INDEX IF NOT EXISTS idx_marketing_mail_type ON heritage_marketing_mail(type);
CREATE INDEX IF NOT EXISTS idx_marketing_mail_audience ON heritage_marketing_mail(audience);
CREATE INDEX IF NOT EXISTS idx_marketing_mail_date ON heritage_marketing_mail(date);
CREATE INDEX IF NOT EXISTS idx_marketing_mail_created_at ON heritage_marketing_mail(created_at DESC);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketing_mail_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_marketing_mail_timestamp
BEFORE UPDATE ON heritage_marketing_mail
FOR EACH ROW
EXECUTE FUNCTION update_marketing_mail_updated_at();

-- ============================================================================
-- Verification Queries (Optional - uncomment to verify)
-- ============================================================================

-- Verify table structure
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'heritage_marketing_mail'
-- ORDER BY ordinal_position;

-- Verify indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'heritage_marketing_mail';
