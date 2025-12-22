-- Create/Update notification templates for verification approved/rejected for all entity types
-- Entity types: user (Local Guide, Event Operator, Tour Operator, Food Vendor, Artisan, Hotel), event, tour, hotel, food, artwork
-- This script includes email_subject and email_body_html for email notifications

-- User Verification Templates (for different user types)
-- Local Guide Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'local_guide_verification_approved',
  'Local Guide Verification Approved',
  'Your Local Guide Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Local Guide verification has been approved on {{verificationDate}}.</p><p>You can now start offering your services and connecting with travelers.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Local Guide verification has been approved on {{verificationDate}}.\n\nYou can now start offering your services and connecting with travelers.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Local Guide verification has been approved. You can now start offering your services.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Local Guide Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'local_guide_verification_rejected',
  'Local Guide Verification Rejected',
  'Your Local Guide Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Local Guide verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Local Guide verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Local Guide verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Event Operator Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_operator_verification_approved',
  'Event Operator Verification Approved',
  'Your Event Operator Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Event Operator verification has been approved on {{verificationDate}}.</p><p>You can now create and manage events on our platform.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Event Operator verification has been approved on {{verificationDate}}.\n\nYou can now create and manage events on our platform.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Event Operator verification has been approved. You can now create and manage events.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Event Operator Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_operator_verification_rejected',
  'Event Operator Verification Rejected',
  'Your Event Operator Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Event Operator verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Event Operator verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Event Operator verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Tour Operator Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_operator_verification_approved',
  'Tour Operator Verification Approved',
  'Your Tour Operator Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Tour Operator verification has been approved on {{verificationDate}}.</p><p>You can now create and manage tours on our platform.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Tour Operator verification has been approved on {{verificationDate}}.\n\nYou can now create and manage tours on our platform.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Tour Operator verification has been approved. You can now create and manage tours.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Tour Operator Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_operator_verification_rejected',
  'Tour Operator Verification Rejected',
  'Your Tour Operator Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Tour Operator verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Tour Operator verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Tour Operator verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Food Vendor Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_vendor_verification_approved',
  'Food Vendor Verification Approved',
  'Your Food Vendor Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Food Vendor verification has been approved on {{verificationDate}}.</p><p>You can now create and manage food listings on our platform.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Food Vendor verification has been approved on {{verificationDate}}.\n\nYou can now create and manage food listings on our platform.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Food Vendor verification has been approved. You can now create and manage food listings.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Food Vendor Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_vendor_verification_rejected',
  'Food Vendor Verification Rejected',
  'Your Food Vendor Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Food Vendor verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Food Vendor verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Food Vendor verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Artisan Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artisan_verification_approved',
  'Artisan Verification Approved',
  'Your Artisan Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Artisan verification has been approved on {{verificationDate}}.</p><p>You can now create and manage your artwork listings on our platform.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Artisan verification has been approved on {{verificationDate}}.\n\nYou can now create and manage your artwork listings on our platform.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Artisan verification has been approved. You can now create and manage your artwork listings.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Artisan Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artisan_verification_rejected',
  'Artisan Verification Rejected',
  'Your Artisan Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Artisan verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Artisan verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Artisan verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Hotel (User) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_approved',
  'Hotel Verification Approved',
  'Your Hotel Verification Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Verification Approved!</h2><p>Dear {{userName}},</p><p>Congratulations! Your Hotel verification has been approved on {{verificationDate}}.</p><p>You can now create and manage hotel listings on our platform.</p><p>Thank you for being part of our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nCongratulations! Your Hotel verification has been approved on {{verificationDate}}.\n\nYou can now create and manage hotel listings on our platform.\n\nThank you for being part of our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Verification Approved',
  'Congratulations! Your Hotel verification has been approved. You can now create and manage hotel listings.',
  'heritage://verification/approved',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Hotel (User) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_rejected',
  'Hotel Verification Rejected',
  'Your Hotel Verification Request',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Verification Update</h2><p>Dear {{userName}},</p><p>We have reviewed your Hotel verification request submitted on {{rejectionDate}}.</p><p>Unfortunately, we are unable to approve your verification at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your verification, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Dear {{userName}},\n\nWe have reviewed your Hotel verification request submitted on {{rejectionDate}}.\n\nUnfortunately, we are unable to approve your verification at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your verification, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Verification Rejected',
  'Your Hotel verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Event (Table Entity) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_verification_approved',
  'Event Verification Approved',
  'Your Event "{{entityName}}" Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Event Approved!</h2><p>Great news! Your event "<strong>{{entityName}}</strong>" has been approved and is now published on our platform.</p><p>Visitors can now view and book your event.</p><p>Thank you for contributing to our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Great news! Your event "{{entityName}}" has been approved and is now published on our platform.\n\nVisitors can now view and book your event.\n\nThank you for contributing to our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Event Approved',
  'Your event "{{entityName}}" has been approved and is now published.',
  'heritage://events/{{entityId}}',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Event (Table Entity) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_verification_rejected',
  'Event Verification Rejected',
  'Your Event "{{entityName}}" Submission Update',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Event Submission Update</h2><p>We have reviewed your event submission "<strong>{{entityName}}</strong>".</p><p>Unfortunately, we are unable to approve this event at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your event, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'We have reviewed your event submission "{{entityName}}".\n\nUnfortunately, we are unable to approve this event at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your event, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Event Rejected',
  'Your event "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://events/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Tour (Table Entity) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_verification_approved',
  'Tour Verification Approved',
  'Your Tour "{{entityName}}" Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Tour Approved!</h2><p>Great news! Your tour "<strong>{{entityName}}</strong>" has been approved and is now published on our platform.</p><p>Visitors can now view and book your tour.</p><p>Thank you for contributing to our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Great news! Your tour "{{entityName}}" has been approved and is now published on our platform.\n\nVisitors can now view and book your tour.\n\nThank you for contributing to our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Tour Approved',
  'Your tour "{{entityName}}" has been approved and is now published.',
  'heritage://tours/{{entityId}}',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Tour (Table Entity) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_verification_rejected',
  'Tour Verification Rejected',
  'Your Tour "{{entityName}}" Submission Update',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Tour Submission Update</h2><p>We have reviewed your tour submission "<strong>{{entityName}}</strong>".</p><p>Unfortunately, we are unable to approve this tour at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your tour, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'We have reviewed your tour submission "{{entityName}}".\n\nUnfortunately, we are unable to approve this tour at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your tour, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Tour Rejected',
  'Your tour "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://tours/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Hotel (Table Entity) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_listing_verification_approved',
  'Hotel Listing Verification Approved',
  'Your Hotel Listing "{{entityName}}" Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Hotel Listing Approved!</h2><p>Great news! Your hotel listing "<strong>{{entityName}}</strong>" has been approved and is now published on our platform.</p><p>Visitors can now view and book your hotel.</p><p>Thank you for contributing to our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Great news! Your hotel listing "{{entityName}}" has been approved and is now published on our platform.\n\nVisitors can now view and book your hotel.\n\nThank you for contributing to our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Hotel Approved',
  'Your hotel listing "{{entityName}}" has been approved and is now published.',
  'heritage://hotels/{{entityId}}',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Hotel (Table Entity) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_listing_verification_rejected',
  'Hotel Listing Verification Rejected',
  'Your Hotel Listing "{{entityName}}" Submission Update',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Hotel Listing Submission Update</h2><p>We have reviewed your hotel listing submission "<strong>{{entityName}}</strong>".</p><p>Unfortunately, we are unable to approve this hotel listing at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your hotel listing, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'We have reviewed your hotel listing submission "{{entityName}}".\n\nUnfortunately, we are unable to approve this hotel listing at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your hotel listing, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Hotel Rejected',
  'Your hotel listing "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://hotels/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Food (Table Entity) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_verification_approved',
  'Food Listing Verification Approved',
  'Your Food Listing "{{entityName}}" Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Food Listing Approved!</h2><p>Great news! Your food listing "<strong>{{entityName}}</strong>" has been approved and is now published on our platform.</p><p>Visitors can now view and order your food items.</p><p>Thank you for contributing to our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Great news! Your food listing "{{entityName}}" has been approved and is now published on our platform.\n\nVisitors can now view and order your food items.\n\nThank you for contributing to our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Food Approved',
  'Your food listing "{{entityName}}" has been approved and is now published.',
  'heritage://food/{{entityId}}',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Food (Table Entity) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_verification_rejected',
  'Food Listing Verification Rejected',
  'Your Food Listing "{{entityName}}" Submission Update',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Food Listing Submission Update</h2><p>We have reviewed your food listing submission "<strong>{{entityName}}</strong>".</p><p>Unfortunately, we are unable to approve this food listing at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your food listing, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'We have reviewed your food listing submission "{{entityName}}".\n\nUnfortunately, we are unable to approve this food listing at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your food listing, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Food Rejected',
  'Your food listing "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://food/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Artwork (Table Entity) Approved
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artwork_verification_approved',
  'Artwork Listing Verification Approved',
  'Your Artwork "{{entityName}}" Has Been Approved',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #4CAF50;">Artwork Approved!</h2><p>Great news! Your artwork "<strong>{{entityName}}</strong>" has been approved and is now published on our platform.</p><p>Visitors can now view and purchase your artwork.</p><p>Thank you for contributing to our heritage community!</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'Great news! Your artwork "{{entityName}}" has been approved and is now published on our platform.\n\nVisitors can now view and purchase your artwork.\n\nThank you for contributing to our heritage community!\n\nBest regards,\nThe Heritage Team',
  'Artwork Approved',
  'Your artwork "{{entityName}}" has been approved and is now published.',
  'heritage://artwork/{{entityId}}',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Artwork (Table Entity) Rejected
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  email_subject,
  email_body_html,
  email_body_text,
  push_title,
  push_body,
  push_action_url,
  is_critical,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artwork_verification_rejected',
  'Artwork Listing Verification Rejected',
  'Your Artwork "{{entityName}}" Submission Update',
  '<!DOCTYPE html><html><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2 style="color: #f44336;">Artwork Submission Update</h2><p>We have reviewed your artwork submission "<strong>{{entityName}}</strong>".</p><p>Unfortunately, we are unable to approve this artwork at this time.</p><p><strong>Reason:</strong> {{rejectionReason}}</p><p>If you have any questions or would like to resubmit your artwork, please contact our support team.</p><p>Best regards,<br>The Heritage Team</p></div></body></html>',
  'We have reviewed your artwork submission "{{entityName}}".\n\nUnfortunately, we are unable to approve this artwork at this time.\n\nReason: {{rejectionReason}}\n\nIf you have any questions or would like to resubmit your artwork, please contact our support team.\n\nBest regards,\nThe Heritage Team',
  'Artwork Rejected',
  'Your artwork "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://artwork/rejected',
  false,
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  email_subject = EXCLUDED.email_subject,
  email_body_html = EXCLUDED.email_body_html,
  email_body_text = EXCLUDED.email_body_text,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  is_critical = EXCLUDED.is_critical,
  updated_at = NOW();

-- Verify templates were created/updated
SELECT 
  template_key,
  template_name,
  email_subject IS NOT NULL as has_email,
  push_title IS NOT NULL as has_push,
  is_active,
  created_at
FROM heritage_notification_templates
WHERE template_key LIKE '%_verification_%'
ORDER BY template_key;
