# Database Mapping Updates - Complete Summary

## Overview
Updated all service methods to match the **actual database structure** based on site_id 1 analysis.

## Critical Changes Made

### 1. `heritage_sitemedia` ✅
**Before:**
- `storage_url`, `thumbnail_url`, `label`, `language_code`, `duration_seconds`, `is_primary`

**After:**
- `media_url` (mapped from `storage_url`)
- `position` (auto-assigned based on index)
- `is_primary` ✅
- Removed: `thumbnail_url`, `label`, `language_code`, `duration_seconds`

### 2. `heritage_sitevisitinghours` ✅
**Before:**
- `day_of_week` (string: 'Monday', 'Tuesday')
- `is_open`, `opening_time`, `closing_time`, `notes`

**After:**
- `day_of_week` (number: 1-7, where 1=Monday)
- `is_closed` (inverted from `is_open`)
- `open_time` (mapped from `opening_time`)
- `close_time` (mapped from `closing_time`)
- `special_notes` (mapped from `notes`)

**Mapping Logic:**
- Day names converted to numbers using dayMap
- `is_open: true` → `is_closed: false`
- Time format: 'HH:MM:00'

### 3. `heritage_sitetickettype` ✅
**Before:**
- `visitor_type`, `amount`, `currency`, `notes`

**After:**
- `ticket_name` (mapped from `visitor_type`)
- `price` (mapped from `amount`)
- `currency` ✅
- `description` (mapped from `notes`)
- Additional: `age_group`, `includes_guide`, `includes_audio_guide`, `includes_vr_experience`, `is_active`

### 4. `heritage_sitetransportation` ✅
**Before:**
- `category`, `mode`, `name`, `description`, `distance_km`, `travel_time_minutes`, `notes`, `contact_info`

**After:**
- `transport_type` (mapped from `category` + `mode`)
- `route_info` (combined from `name` + `description`)
- `duration_minutes` (mapped from `travel_time_minutes`)
- `cost_range` (approximated from `distance_km`)
- `accessibility_notes` (mapped from `notes`)
- `is_active` ✅
- Removed: `contact_info`, `distance_km`, `category`, `mode`, `name`

**Mapping Logic:**
- Transport: `transport_type = mode || 'other'`
- Attraction: `transport_type = 'attraction'`
- `route_info = name + (description ? ' - ' + description : '')`

### 5. `heritage_siteamenity` ✅
**Before:**
- `name`, `icon`, `description`

**After:**
- `amenity_name` (mapped from `name`)
- `icon_name` (mapped from `icon`)
- `description` ✅
- Additional: `amenity_type` (default: 'facility'), `is_available` (default: true)

### 6. `heritage_siteetiquette` ✅
**Before:**
- `etiquette_text`, `display_order`

**After:**
- `etiquette_text` ✅
- Removed: `display_order` (column doesn't exist)

### 7. `heritage_sitetranslation` ✅ MAJOR CHANGE
**Before:**
- One row per `field_type` per language
- Columns: `field_type`, `content`

**After:**
- **ONE ROW PER LANGUAGE** (not per field_type)
- Columns: `name`, `short_desc`, `full_desc`, `meta_title`, `meta_description`, `address`, `city`, `state`, `country`

**Mapping Logic:**
- `field_type: 'overview'` → `short_desc`
- `field_type: 'history'` → `full_desc`
- `field_type: 'location_address'` → `address`
- `field_type: 'location_city'` → `city`
- `field_type: 'location_state'` → `state`
- `field_type: 'location_country'` → `country`
- `name` = `site.name_default` (for each language)

## Form Updates

### Media Items
- Added `position` field (auto-incremented)
- Gallery media: position 1, 2, 3...
- Audio guides: continue numbering after gallery

### Visiting Hours
- Day names remain as strings in form
- Converted to numbers (1-7) in service layer

### Translations
- Form still uses field_type approach
- Service groups by language and maps to database columns

## Files Modified

1. ✅ `src/services/heritageSite.service.ts`
   - Updated all insert/update operations
   - Fixed column mappings
   - Updated translation handling

2. ✅ `src/pages/Masters/AddHeritageSite.tsx`
   - Added `position` to media items
   - Fixed type errors
   - Removed unused imports

## Verification

Run the review script to verify:
```bash
npm run review-site
```

This will show the actual database structure for site_id 1.

## Status

✅ **All table mappings updated to match actual database structure**
✅ **All linting errors fixed**
✅ **Form data correctly mapped to database columns**

The "Add New Heritage Site" form should now correctly save data to all tables according to the actual database schema.

