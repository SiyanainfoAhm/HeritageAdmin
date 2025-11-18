# Actual Database Table Structure (Based on Site ID 1)

## Critical Differences Found

### 1. `heritage_sitemedia`
**Code Expects:**
- `storage_url`, `thumbnail_url`, `label`, `language_code`, `is_primary`

**Database Has:**
- `media_url` (not `storage_url`)
- `position` (not `thumbnail_url`)
- `is_primary` ✅
- `uploaded_at` ✅
- NO `thumbnail_url`, `label`, `language_code`

### 2. `heritage_sitevisitinghours`
**Code Expects:**
- `day_of_week` (string: 'Monday', 'Tuesday', etc.)
- `opening_time`, `closing_time`, `notes`

**Database Has:**
- `day_of_week` (number: 1-7, where 1=Monday)
- `open_time` (not `opening_time`)
- `close_time` (not `closing_time`)
- `is_closed` (boolean)
- `special_notes` (not `notes`)

### 3. `heritage_sitetickettype`
**Code Expects:**
- `visitor_type`, `amount`, `currency`, `notes`

**Database Has:**
- `ticket_name` (not `visitor_type`)
- `price` (not `amount`)
- `currency` ✅
- `description` (not `notes`)
- `age_group`, `includes_guide`, `includes_audio_guide`, `includes_vr_experience`, `is_active`

### 4. `heritage_sitetransportation`
**Code Expects:**
- `category`, `mode`, `name`, `description`, `distance_km`, `travel_time_minutes`, `notes`, `contact_info`

**Database Has:**
- `transport_type` (not `category` or `mode`)
- `route_info` (not `name` or `description`)
- `duration_minutes` (not `travel_time_minutes`)
- `cost_range` (not `distance_km`)
- `accessibility_notes` (not `notes`)
- `is_active` ✅
- NO `contact_info`, `distance_km`, `category`, `mode`, `name`

### 5. `heritage_siteamenity`
**Code Expects:**
- `name`, `icon`, `description`

**Database Has:**
- `amenity_name` (not `name`)
- `icon_name` (not `icon`)
- `description` ✅
- `amenity_type`, `is_available`

### 6. `heritage_siteetiquette`
**Error:** `display_order` column doesn't exist
**Need to check actual columns**

### 7. `heritage_sitetranslation`
**Code Expects:**
- `field_type`, `content` (one row per field_type per language)

**Database Has:**
- `name`, `short_desc`, `full_desc`, `meta_title`, `meta_description`
- `address`, `city`, `state`, `country`
- **ONE ROW PER LANGUAGE** (not per field_type)
- NO `field_type` or `content` columns

## Action Required

The code needs to be updated to match the actual database structure!

