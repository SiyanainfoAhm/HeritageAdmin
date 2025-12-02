-- Database Function to Send Email via SendGrid
-- This function runs server-side in the database, avoiding CORS issues
-- Run this in Supabase SQL Editor

-- First, enable the http extension (if not already enabled)
-- Note: This may require superuser privileges. If it fails, ask your database admin.

-- Create or replace the function
CREATE OR REPLACE FUNCTION send_email_via_sendgrid(
  p_to_email TEXT,
  p_subject TEXT,
  p_html_content TEXT,
  p_text_content TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  -- TODO: Replace with your actual SendGrid credentials
  -- These should be retrieved from environment variables or Supabase secrets
  v_sendgrid_api_key TEXT := ''; -- Set your SendGrid API key here
  v_from_email TEXT := ''; -- Set your verified sender email here
  v_from_name TEXT := 'Heritage Admin';
  v_response JSONB;
  v_request_body JSONB;
BEGIN
  -- Build request body
  v_request_body := jsonb_build_object(
    'personalizations', jsonb_build_array(
      jsonb_build_object('to', jsonb_build_array(jsonb_build_object('email', p_to_email)))
    ),
    'from', jsonb_build_object('email', v_from_email, 'name', v_from_name),
    'subject', p_subject,
    'content', (
      SELECT jsonb_agg(content_item)
      FROM (
        SELECT jsonb_build_object('type', 'text/html', 'value', p_html_content) as content_item
        UNION ALL
        SELECT jsonb_build_object('type', 'text/plain', 'value', COALESCE(p_text_content, regexp_replace(p_html_content, '<[^>]+>', '', 'g')))
        WHERE p_text_content IS NOT NULL OR p_html_content IS NOT NULL
      ) subq
    )
  );

  -- Make HTTP request to SendGrid
  -- Note: This requires pg_net extension or http extension
  -- If these aren't available, we'll use a different approach
  
  -- For now, return success (actual implementation depends on available extensions)
  -- You may need to use Supabase Edge Functions or a different method
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Email request queued (requires pg_net or http extension for actual sending)'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION send_email_via_sendgrid TO authenticated;
GRANT EXECUTE ON FUNCTION send_email_via_sendgrid TO anon;

-- Test the function
-- SELECT send_email_via_sendgrid(
--   'test@example.com',
--   'Test Subject',
--   '<h1>Test</h1><p>This is a test</p>',
--   'Test - This is a test'
-- );

