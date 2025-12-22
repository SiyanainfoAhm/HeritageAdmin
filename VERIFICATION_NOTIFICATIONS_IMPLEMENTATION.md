# Verification Notifications Implementation

## Overview
This implementation adds email and push notification support for verification approval and rejection across all entity types (user, event, tour, hotel, food, artwork).

## Features Implemented

### 1. Rejection Dialog
- A rejection dialog appears when rejecting any entity (user or table entity)
- The dialog requires a rejection reason before confirming
- The rejection reason is stored and included in notifications

### 2. Email Templates
- Created comprehensive email templates for all entity types
- Each template includes:
  - `email_subject` - Email subject line
  - `email_body_html` - HTML email body with styling
  - `email_body_text` - Plain text version
  - `push_title` - Push notification title
  - `push_body` - Push notification body
  - `push_action_url` - Deep link URL

### 3. Template Coverage
Templates created for:
- **User Verifications:**
  - Local Guide (approved/rejected)
  - Event Operator (approved/rejected)
  - Tour Operator (approved/rejected)
  - Food Vendor (approved/rejected)
  - Artisan (approved/rejected)
  - Hotel (approved/rejected)

- **Table Entities:**
  - Event (approved/rejected)
  - Tour (approved/rejected)
  - Hotel Listing (approved/rejected) - Note: Uses `hotel_listing_verification_*` to avoid conflict with hotel user verification
  - Food (approved/rejected)
  - Artwork (approved/rejected)

### 4. Email Notifications
- Email notifications are automatically sent when:
  - A user verification is approved/rejected
  - An event, tour, hotel, food, or artwork is approved/rejected
- Email includes personalized content with template variables

### 5. Push Notifications
- Push notifications continue to work as before
- Sent to all registered device tokens for the user

## Template Variables

Templates support the following variables:
- `{{userName}}` - User's full name (for user verifications)
- `{{entityName}}` - Name of the entity (for table entities)
- `{{entityType}}` - Type of entity (e.g., "Event", "Tour", "Artwork")
- `{{verificationDate}}` - Date when verification was approved
- `{{rejectionDate}}` - Date when verification was rejected
- `{{rejectionReason}}` - Reason for rejection (provided by admin)
- `{{entityId}}` - ID of the entity (for table entities)

## Files Modified

### 1. `src/pages/Verification/Verification.tsx`
- Added `rejectionDialogOpen` and `rejectionRecord` state variables
- Added reject button for product (artwork) tab
- Rejection dialog already integrated and working

### 2. `src/services/verification.service.ts`
- Updated `approveEntity()` to send email notifications
- Updated `rejectEntity()` to send email notifications
- Updated `approveTableEntity()` to send email notifications
- Updated `rejectTableEntity()` to send email notifications
- Fixed template key conflict: Hotel table entities use `hotel_listing_verification_*` keys

### 3. `dbscript/create_verification_notification_templates_with_email.sql`
- New comprehensive SQL script with email templates
- Includes all entity types (user and table entities)
- Uses `ON CONFLICT` to update existing templates

## Database Setup

To set up the templates, run the SQL script:

```sql
\i dbscript/create_verification_notification_templates_with_email.sql
```

Or execute it directly in your Supabase SQL editor.

## How It Works

### Approval Flow
1. Admin clicks "Approve" button
2. Entity status is updated in database
3. System fetches user email and device tokens
4. Email notification is sent using the appropriate template
5. Push notification is sent to all device tokens
6. Notifications include personalized content with variables replaced

### Rejection Flow
1. Admin clicks "Reject" button
2. Rejection dialog appears
3. Admin enters rejection reason (required)
4. Admin confirms rejection
5. Entity status is updated in database
6. Rejection reason is stored
7. System fetches user email and device tokens
8. Email notification is sent with rejection reason
9. Push notification is sent with rejection reason

## Template Key Naming Convention

- User verifications: `{entity_type}_verification_{status}`
  - Example: `local_guide_verification_approved`
  
- Table entities: `{entity_type}_verification_{status}`
  - Example: `event_verification_approved`
  - Exception: Hotel listings use `hotel_listing_verification_{status}` to avoid conflict

## Testing

To test the implementation:
1. Run the SQL script to create/update templates
2. Approve or reject a verification record
3. Check that:
   - Rejection dialog appears when rejecting
   - Email is sent to user's email address
   - Push notification is sent to user's devices
   - Rejection reason is included in notifications

## Notes

- Email notifications are sent asynchronously and won't block the approval/rejection process
- If email sending fails, it's logged but doesn't fail the operation
- Templates use HTML for rich email formatting
- All templates support variable replacement for personalization
