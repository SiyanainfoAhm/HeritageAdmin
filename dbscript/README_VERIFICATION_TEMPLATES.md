# Verification Notification Templates

This script creates notification templates for verification approval and rejection for all entity types.

## Entity Types Covered

### User Verification Types:
- Local Guide
- Event Operator
- Tour Operator
- Food Vendor
- Artisan
- Hotel

### Table Entities:
- Event
- Tour
- Hotel
- Food
- Artwork

## Template Keys

Each entity type has two templates:
- `{entity_type}_verification_approved` - For approved verifications
- `{entity_type}_verification_rejected` - For rejected verifications

### Examples:
- `local_guide_verification_approved`
- `local_guide_verification_rejected`
- `event_verification_approved`
- `event_verification_rejected`
- `artwork_verification_approved`
- `artwork_verification_rejected`

## Template Variables

Templates support the following variables:
- `{{userName}}` - User's full name (for user verifications)
- `{{entityName}}` - Name of the entity (for table entities)
- `{{entityType}}` - Type of entity (e.g., "Event", "Tour", "Artwork")
- `{{verificationDate}}` - Date when verification was approved
- `{{rejectionDate}}` - Date when verification was rejected
- `{{rejectionReason}}` - Reason for rejection (provided by admin)
- `{{entityId}}` - ID of the entity (for table entities)

## Usage

1. Run the SQL script to create all templates:
   ```sql
   \i dbscript/create_verification_notification_templates.sql
   ```

2. The templates will be automatically used when:
   - A user verification is approved/rejected
   - An event, tour, hotel, food, or artwork is approved/rejected

3. Push notifications are sent automatically when status changes.

4. Email notifications will be implemented later (as per user request).

## Template Structure

Each template includes:
- `template_key` - Unique identifier
- `template_name` - Human-readable name
- `push_title` - Title for push notification
- `push_body` - Body text for push notification (supports variables)
- `push_action_url` - Deep link URL when notification is clicked
- `is_active` - Whether the template is active

## Notes

- Templates use `ON CONFLICT (template_key) DO UPDATE` to prevent duplicates
- If an entity-specific template doesn't exist, the system falls back to generic templates:
  - `verification_approved` (generic)
  - `verification_rejected` (generic)
- Rejection reason is collected via a dialog in the verification screen
- Rejection reason is stored in `verification_notes` field for vendor business types
