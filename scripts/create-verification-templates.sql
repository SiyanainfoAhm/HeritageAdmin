-- Create Verification Email Templates
-- This script creates email templates for verification approval and rejection
-- Run this in Supabase SQL Editor or via psql

-- Template for Verification Approval
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  is_critical,
  is_active
)
SELECT 
  'verification_approved',
  'Verification Approved',
  'Verification Approved - {{entityType}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Approved</h1>
    </div>
    <div class="content">
      <p>Dear {{userName}},</p>
      <p>We are pleased to inform you that your <strong>{{entityType}}</strong> verification has been approved!</p>
      <p>Your verification was approved on <strong>{{verificationDate}}</strong>.</p>
      <p>You can now access all features available for verified {{entityType}} accounts.</p>
      <p>If you have any questions or need assistance, please don''t hesitate to contact our support team.</p>
      <p>Thank you for being part of our community!</p>
      <p>Best regards,<br>The Heritage Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>',
  'Dear {{userName}},

We are pleased to inform you that your {{entityType}} verification has been approved!

Your verification was approved on {{verificationDate}}.

You can now access all features available for verified {{entityType}} accounts.

If you have any questions or need assistance, please don''t hesitate to contact our support team.

Thank you for being part of our community!

Best regards,
The Heritage Team',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM heritage_notification_templates WHERE template_key = 'verification_approved'
);

-- Template for Verification Rejection
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  is_critical,
  is_active
)
SELECT 
  'verification_rejected',
  'Verification Rejected',
  'Verification Status Update - {{entityType}}',
  '<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
    .button { display: inline-block; padding: 12px 30px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verification Status Update</h1>
    </div>
    <div class="content">
      <p>Dear {{userName}},</p>
      <p>We regret to inform you that your <strong>{{entityType}}</strong> verification request has been reviewed and could not be approved at this time.</p>
      <p>The review was completed on <strong>{{rejectionDate}}</strong>.</p>
      <div class="info-box">
        <p><strong>What''s Next?</strong></p>
        <p>Please review your submitted information and ensure all required documents are complete and accurate. You may resubmit your verification request after addressing any issues.</p>
      </div>
      <p>If you have any questions about this decision or need assistance with your application, please contact our support team.</p>
      <p>We appreciate your understanding and look forward to working with you in the future.</p>
      <p>Best regards,<br>The Heritage Team</p>
    </div>
    <div class="footer">
      <p>This is an automated email. Please do not reply to this message.</p>
    </div>
  </div>
</body>
</html>',
  'Dear {{userName}},

We regret to inform you that your {{entityType}} verification request has been reviewed and could not be approved at this time.

The review was completed on {{rejectionDate}}.

What''s Next?
Please review your submitted information and ensure all required documents are complete and accurate. You may resubmit your verification request after addressing any issues.

If you have any questions about this decision or need assistance with your application, please contact our support team.

We appreciate your understanding and look forward to working with you in the future.

Best regards,
The Heritage Team',
  true,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM heritage_notification_templates WHERE template_key = 'verification_rejected'
);

-- Verify templates were created
SELECT 
  template_key,
  template_name,
  is_active,
  created_at
FROM heritage_notification_templates
WHERE template_key IN ('verification_approved', 'verification_rejected')
ORDER BY template_key;

