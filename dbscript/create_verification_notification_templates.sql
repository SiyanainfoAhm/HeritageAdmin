-- Create notification templates for verification approved/rejected for all entity types
-- Entity types: user (Local Guide, Event Operator, Tour Operator, Food Vendor, Artisan, Hotel), event, tour, hotel, food, artwork

-- User Verification Templates (for different user types)
-- Local Guide
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'local_guide_verification_approved',
  'Local Guide Verification Approved',
  'Verification Approved',
  'Congratulations! Your Local Guide verification has been approved. You can now start offering your services.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'local_guide_verification_rejected',
  'Local Guide Verification Rejected',
  'Verification Rejected',
  'Your Local Guide verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Event Operator
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_operator_verification_approved',
  'Event Operator Verification Approved',
  'Verification Approved',
  'Congratulations! Your Event Operator verification has been approved. You can now create and manage events.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_operator_verification_rejected',
  'Event Operator Verification Rejected',
  'Verification Rejected',
  'Your Event Operator verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Tour Operator
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_operator_verification_approved',
  'Tour Operator Verification Approved',
  'Verification Approved',
  'Congratulations! Your Tour Operator verification has been approved. You can now create and manage tours.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_operator_verification_rejected',
  'Tour Operator Verification Rejected',
  'Verification Rejected',
  'Your Tour Operator verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Food Vendor
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_vendor_verification_approved',
  'Food Vendor Verification Approved',
  'Verification Approved',
  'Congratulations! Your Food Vendor verification has been approved. You can now create and manage food listings.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_vendor_verification_rejected',
  'Food Vendor Verification Rejected',
  'Verification Rejected',
  'Your Food Vendor verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Artisan
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artisan_verification_approved',
  'Artisan Verification Approved',
  'Verification Approved',
  'Congratulations! Your Artisan verification has been approved. You can now create and manage your artwork listings.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artisan_verification_rejected',
  'Artisan Verification Rejected',
  'Verification Rejected',
  'Your Artisan verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Hotel
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_approved',
  'Hotel Verification Approved',
  'Verification Approved',
  'Congratulations! Your Hotel verification has been approved. You can now create and manage hotel listings.',
  'heritage://verification/approved',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_rejected',
  'Hotel Verification Rejected',
  'Verification Rejected',
  'Your Hotel verification request has been reviewed and could not be approved. Reason: {{rejectionReason}}',
  'heritage://verification/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Event (table entity)
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_verification_approved',
  'Event Verification Approved',
  'Event Approved',
  'Your event "{{entityName}}" has been approved and is now published.',
  'heritage://events/{{entityId}}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'event_verification_rejected',
  'Event Verification Rejected',
  'Event Rejected',
  'Your event "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://events/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Tour (table entity)
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_verification_approved',
  'Tour Verification Approved',
  'Tour Approved',
  'Your tour "{{entityName}}" has been approved and is now published.',
  'heritage://tours/{{entityId}}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'tour_verification_rejected',
  'Tour Verification Rejected',
  'Tour Rejected',
  'Your tour "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://tours/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Hotel (table entity)
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_approved',
  'Hotel Listing Approved',
  'Hotel Approved',
  'Your hotel listing "{{entityName}}" has been approved and is now published.',
  'heritage://hotels/{{entityId}}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'hotel_verification_rejected',
  'Hotel Listing Rejected',
  'Hotel Rejected',
  'Your hotel listing "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://hotels/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Food (table entity)
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_verification_approved',
  'Food Listing Approved',
  'Food Approved',
  'Your food listing "{{entityName}}" has been approved and is now published.',
  'heritage://food/{{entityId}}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'food_verification_rejected',
  'Food Listing Rejected',
  'Food Rejected',
  'Your food listing "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://food/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Artwork (table entity)
INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artwork_verification_approved',
  'Artwork Listing Approved',
  'Artwork Approved',
  'Your artwork "{{entityName}}" has been approved and is now published.',
  'heritage://artwork/{{entityId}}',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

INSERT INTO heritage_notification_templates (
  template_key,
  template_name,
  push_title,
  push_body,
  push_action_url,
  is_active,
  created_at,
  updated_at
) VALUES (
  'artwork_verification_rejected',
  'Artwork Listing Rejected',
  'Artwork Rejected',
  'Your artwork "{{entityName}}" has been rejected. Reason: {{rejectionReason}}',
  'heritage://artwork/rejected',
  true,
  NOW(),
  NOW()
) ON CONFLICT (template_key) DO UPDATE SET
  template_name = EXCLUDED.template_name,
  push_title = EXCLUDED.push_title,
  push_body = EXCLUDED.push_body,
  push_action_url = EXCLUDED.push_action_url,
  updated_at = NOW();

-- Verify templates were created
SELECT 
  template_key,
  template_name,
  is_active,
  created_at
FROM heritage_notification_templates
WHERE template_key LIKE '%_verification_%'
ORDER BY template_key;
