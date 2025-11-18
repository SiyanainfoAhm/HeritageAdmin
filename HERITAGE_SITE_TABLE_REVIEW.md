# Heritage Site Table Structure Review

## Overview
This document provides a comprehensive review of the heritage_site table structure and data mapping for the "Add New Heritage Site" form.

## Database Tables Used

### 1. `heritage_site` (Main Table)
**Purpose**: Stores core heritage site information

**Columns Being Saved**:
- `site_id` (auto-generated)
- `name_default` ✅
- `short_desc_default` ✅
- `full_desc_default` ✅
- `site_type` ✅
- `latitude` ✅
- `longitude` ✅
- `vr_link` ✅
- `qr_link` ✅
- `meta_title_def` ✅
- `meta_description_def` ✅
- `is_active` ✅
- `entry_fee` ✅
- `entry_type` ✅
- `experience` ✅
- `accessibility` ✅
- `location_address` ✅
- `location_area` ✅
- `location_city` ✅
- `location_state` ✅
- `location_country` ✅
- `location_postal_code` ✅
- `hero_image_url` ✅
- `created_at` ✅
- `updated_at` ✅

**Columns NOT in Database (Filtered Out)**:
- `amenities` ❌ - Array data, needs separate table or JSON column
- `ar_mode_available` ❌ - Boolean, column doesn't exist
- `booking_online_available` ❌ - Boolean, column doesn't exist
- `booking_url` ❌ - String, column doesn't exist
- `video_360_url` ❌ - String, column doesn't exist (using `vr_link` instead)
- `site_map_url` ❌ - String, column doesn't exist
- `status` ❌ - String, column doesn't exist (using `is_active` instead)
- `overview_translations` ❌ - Object, needs separate table or JSON column
- `history_translations` ❌ - Object, needs separate table or JSON column
- `cultural_etiquettes` ❌ - Array, needs separate table or JSON column

### 2. `heritage_sitemedia` (Media Table)
**Purpose**: Stores media files (images, videos, audio, documents) associated with heritage sites

**Columns**:
- `media_id` (auto-generated)
- `site_id` ✅ (foreign key)
- `media_type` ✅ ('image' | 'audio' | 'video' | 'document')
- `storage_url` ✅
- `thumbnail_url` ✅
- `label` ✅
- `language_code` ✅
- `duration_seconds` ✅
- `is_primary` ✅

**Data Source**: 
- Gallery media from `formState.overview.media`
- Audio guides from `formState.audioGuides`

### 3. `heritage_sitevisitinghours` (Visiting Hours Table)
**Purpose**: Stores opening hours for each day of the week

**Columns**:
- `visiting_hours_id` (auto-generated)
- `site_id` ✅ (foreign key)
- `day_of_week` ✅
- `is_open` ✅
- `opening_time` ✅
- `closing_time` ✅
- `notes` ✅

**Data Source**: `formState.overview.openingHours.schedule`

### 4. `heritage_sitetickettype` (Ticket Types Table)
**Purpose**: Stores ticket pricing information for different visitor types

**Columns**:
- `tickettype_id` (auto-generated)
- `site_id` ✅ (foreign key)
- `visitor_type` ✅
- `amount` ✅
- `currency` ✅
- `notes` ✅

**Data Source**: `formState.ticketing.fees` (only when `entryType === 'paid'`)

### 5. `heritage_sitetransportation` (Transportation & Attractions Table)
**Purpose**: Stores transportation options and nearby attractions

**Columns**:
- `transportation_id` (auto-generated)
- `site_id` ✅ (foreign key)
- `category` ✅ ('transport' | 'attraction')
- `mode` ✅
- `name` ✅
- `description` ✅
- `distance_km` ✅
- `travel_time_minutes` ✅
- `notes` ✅
- `contact_info` ✅ (JSON)

**Data Source**: 
- Transport options from `formState.transport`
- Nearby attractions from `formState.nearbyAttractions`

## Form Data Mapping

### Overview Step
| Form Field | Database Column/Table | Status |
|-----------|----------------------|--------|
| `siteName` | `heritage_site.name_default` | ✅ Saved |
| `siteShortDescription` | `heritage_site.short_desc_default` | ✅ Saved |
| `siteFullDescription` | `heritage_site.full_desc_default` | ✅ Saved |
| `locationAddress` | `heritage_site.location_address` | ✅ Saved |
| `locationArea` | `heritage_site.location_area` | ✅ Saved |
| `locationCity` | `heritage_site.location_city` | ✅ Saved |
| `locationState` | `heritage_site.location_state` | ✅ Saved |
| `locationCountry` | `heritage_site.location_country` | ✅ Saved |
| `locationPostalCode` | `heritage_site.location_postal_code` | ✅ Saved |
| `latitude` | `heritage_site.latitude` | ✅ Saved |
| `longitude` | `heritage_site.longitude` | ✅ Saved |
| `media` | `heritage_sitemedia` table | ✅ Saved |
| `video360Url` | `heritage_site.vr_link` | ✅ Saved (mapped to vr_link) |
| `arModeAvailable` | N/A | ❌ Not saved (column doesn't exist) |
| `openingHours` | `heritage_sitevisitinghours` table | ✅ Saved |
| `amenities` | N/A | ❌ Not saved (column doesn't exist) |

### About Step
| Form Field | Database Column/Table | Status |
|-----------|----------------------|--------|
| `translations.overview` | N/A | ❌ Not saved (needs separate table) |
| `translations.history` | N/A | ❌ Not saved (needs separate table) |
| `audioGuides` | `heritage_sitemedia` table (media_type='audio') | ✅ Saved |
| `siteMapFile` | N/A | ❌ Not saved (column doesn't exist) |
| `culturalEtiquettes` | N/A | ❌ Not saved (needs separate table or JSON) |

### Plan Visit Step
| Form Field | Database Column/Table | Status |
|-----------|----------------------|--------|
| `ticketing.entryType` | `heritage_site.entry_type` | ✅ Saved |
| `ticketing.bookingUrl` | N/A | ❌ Not saved (column doesn't exist) |
| `ticketing.onlineBookingAvailable` | N/A | ❌ Not saved (column doesn't exist) |
| `ticketing.fees` | `heritage_sitetickettype` table | ✅ Saved |
| `transport` | `heritage_sitetransportation` table (category='transport') | ✅ Saved |
| `nearbyAttractions` | `heritage_sitetransportation` table (category='attraction') | ✅ Saved |

### Admin Step
| Form Field | Database Column/Table | Status |
|-----------|----------------------|--------|
| `admin.saveOption` | `heritage_site.is_active` | ✅ Saved (mapped) |
| `admin.notes` | N/A | ❌ Not saved (no admin notes column) |

## Data Not Being Saved

The following data is collected in the form but **NOT saved** to the database:

1. **Amenities** (`formState.overview.amenities`)
   - Type: Array of `HeritageSiteAmenity[]`
   - Recommendation: Create `heritage_siteamenities` table or add JSON column

2. **Overview Translations** (`formState.translations.overview`)
   - Type: `Record<LanguageCode, string>`
   - Recommendation: Create `heritage_sitetranslations` table

3. **History Translations** (`formState.translations.history`)
   - Type: `Record<LanguageCode, string>`
   - Recommendation: Create `heritage_sitetranslations` table

4. **Cultural Etiquettes** (`formState.culturalEtiquettes`)
   - Type: `string[]`
   - Recommendation: Create `heritage_siteculturaletiquettes` table or add JSON column

5. **AR Mode Available** (`formState.overview.arModeAvailable`)
   - Type: `boolean`
   - Recommendation: Add `ar_mode_available` column to `heritage_site` table

6. **Booking URL** (`formState.ticketing.bookingUrl`)
   - Type: `string`
   - Recommendation: Add `booking_url` column to `heritage_site` table

7. **Booking Online Available** (`formState.ticketing.onlineBookingAvailable`)
   - Type: `boolean`
   - Recommendation: Add `booking_online_available` column to `heritage_site` table

8. **Site Map URL** (`formState.siteMapPreviewUrl`)
   - Type: `string`
   - Recommendation: Add `site_map_url` column to `heritage_site` table

9. **Admin Notes** (`formState.admin.notes`)
   - Type: `string`
   - Recommendation: Add `admin_notes` column to `heritage_site` table or separate admin table

10. **Status** (`formState.admin.saveOption`)
    - Type: `'draft' | 'pending_review'`
    - Current: Mapped to `is_active` boolean
    - Recommendation: Add `status` column to `heritage_site` table for proper status tracking

## Recommendations

### Immediate Actions
1. ✅ **COMPLETED**: Updated `filterDatabaseColumns()` to exclude all non-database columns
2. ⚠️ **REQUIRED**: Add missing columns to `heritage_site` table:
   - `ar_mode_available` (boolean)
   - `booking_url` (text)
   - `booking_online_available` (boolean)
   - `site_map_url` (text)
   - `status` (enum: 'draft', 'pending_review', 'published', 'archived')

### Future Enhancements
1. Create `heritage_siteamenities` table:
   ```sql
   CREATE TABLE heritage_siteamenities (
     amenity_id SERIAL PRIMARY KEY,
     site_id INTEGER REFERENCES heritage_site(site_id),
     name VARCHAR(255) NOT NULL,
     icon VARCHAR(100),
     description TEXT,
     display_order INTEGER
   );
   ```

2. Create `heritage_sitetranslations` table:
   ```sql
   CREATE TABLE heritage_sitetranslations (
     translation_id SERIAL PRIMARY KEY,
     site_id INTEGER REFERENCES heritage_site(site_id),
     language_code VARCHAR(10) NOT NULL,
     field_type VARCHAR(50) NOT NULL, -- 'overview' or 'history'
     content TEXT NOT NULL
   );
   ```

3. Create `heritage_siteculturaletiquettes` table:
   ```sql
   CREATE TABLE heritage_siteculturaletiquettes (
     etiquette_id SERIAL PRIMARY KEY,
     site_id INTEGER REFERENCES heritage_site(site_id),
     etiquette_text TEXT NOT NULL,
     display_order INTEGER
   );
   ```

## Current Implementation Status

✅ **Working Correctly**:
- Core site information (name, descriptions, location)
- Media files (images, videos, audio)
- Visiting hours
- Ticket types
- Transportation options
- Nearby attractions

❌ **Not Saving** (but form collects):
- Amenities
- Translations (overview & history)
- Cultural etiquettes
- AR mode availability
- Booking URL and online booking flag
- Site map URL
- Admin notes
- Status (only mapped to is_active)

## Summary

The current implementation successfully saves most of the core heritage site data to the appropriate tables. However, several fields collected in the form are not being persisted due to missing database columns or tables. The `filterDatabaseColumns()` function has been updated to prevent errors when these fields are included in the payload.

To fully support all form data, the database schema needs to be extended with:
- Additional columns in `heritage_site` table
- New tables for amenities, translations, and cultural etiquettes

