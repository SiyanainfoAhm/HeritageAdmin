# Critical Database Structure Mismatch

## Summary
The code expects a different database structure than what actually exists. Major updates are required.

## Detailed Mismatches

### 1. `heritage_sitemedia` ❌
**Code expects:**
- `storage_url`, `thumbnail_url`, `label`, `language_code`, `is_primary`

**Database has:**
- `media_url` (not `storage_url`)
- `position` (not `thumbnail_url`)
- `is_primary` ✅
- `uploaded_at` ✅
- NO: `thumbnail_url`, `label`, `language_code`

### 2. `heritage_sitevisitinghours` ❌
**Code expects:**
- `day_of_week` (string: 'Monday', 'Tuesday')
- `opening_time`, `closing_time`, `notes`

**Database has:**
- `day_of_week` (number: 1-7, 1=Monday)
- `open_time` (not `opening_time`)
- `close_time` (not `closing_time`)
- `is_closed` (boolean)
- `special_notes` (not `notes`)

### 3. `heritage_sitetickettype` ❌
**Code expects:**
- `visitor_type`, `amount`, `currency`, `notes`

**Database has:**
- `ticket_name` (not `visitor_type`)
- `price` (not `amount`)
- `currency` ✅
- `description` (not `notes`)
- Additional: `age_group`, `includes_guide`, `includes_audio_guide`, `includes_vr_experience`, `is_active`

### 4. `heritage_sitetransportation` ❌
**Code expects:**
- `category`, `mode`, `name`, `description`, `distance_km`, `travel_time_minutes`, `notes`, `contact_info`

**Database has:**
- `transport_type` (not `category`/`mode`)
- `route_info` (not `name`/`description`)
- `duration_minutes` (not `travel_time_minutes`)
- `cost_range` (not `distance_km`)
- `accessibility_notes` (not `notes`)
- `is_active` ✅
- NO: `contact_info`, `distance_km`, `category`, `mode`, `name`

### 5. `heritage_siteamenity` ❌
**Code expects:**
- `name`, `icon`, `description`

**Database has:**
- `amenity_name` (not `name`)
- `icon_name` (not `icon`)
- `description` ✅
- Additional: `amenity_type`, `is_available`

### 6. `heritage_siteetiquette` ❌
**Error:** `display_order` column doesn't exist
**Need to check actual columns**

### 7. `heritage_sitetranslation` ❌ COMPLETELY DIFFERENT
**Code expects:**
- `field_type`, `content` (one row per field_type per language)

**Database has:**
- ONE ROW PER LANGUAGE (not per field_type)
- Columns: `name`, `short_desc`, `full_desc`, `meta_title`, `meta_description`, `address`, `city`, `state`, `country`
- NO: `field_type` or `content` columns

## Action Required

**URGENT:** All insert/update operations need to be updated to match actual database structure!

