# Deep Review: Heritage Site Table Structure (Site ID 1)

## Overview
This document provides a comprehensive review of how heritage site data is stored across all related tables, based on the actual database structure and code implementation.

## Tables Analyzed

### 1. `heritage_site` (Main Table)
**Purpose**: Core heritage site information

**Columns Being Used** (from code analysis):
- `site_id` (PRIMARY KEY, auto-generated)
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
- `entry_type` ✅ ('free' | 'paid')
- `experience` ✅
- `accessibility` ✅
- `created_at` ✅
- `updated_at` ✅

**Columns NOT in Database** (filtered out):
- `location_address` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_address')
- `location_area` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_area')
- `location_city` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_city')
- `location_state` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_state')
- `location_country` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_country')
- `location_postal_code` ❌ → Stored in `heritage_sitetranslation` (field_type: 'location_postal_code')
- `hero_image_url` ❌ → Stored in `heritage_sitemedia` (is_primary = true)
- `video_360_url` ❌ → Using `vr_link` instead
- `ar_mode_available` ❌
- `booking_url` ❌
- `booking_online_available` ❌
- `site_map_url` ❌
- `status` ❌ → Using `is_active` boolean instead
- `amenities` ❌ → Stored in `heritage_siteamenity` table
- `overview_translations` ❌ → Stored in `heritage_sitetranslation` table
- `history_translations` ❌ → Stored in `heritage_sitetranslation` table
- `cultural_etiquettes` ❌ → Stored in `heritage_siteetiquette` table

---

### 2. `heritage_sitemedia` (Media Table)
**Purpose**: Stores all media files (images, videos, audio, documents)

**Columns** (from code):
- `media_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY → heritage_site.site_id)
- `media_type` ✅ ('image' | 'audio' | 'video' | 'document')
- `storage_url` ✅
- `thumbnail_url` ✅
- `label` ✅
- `language_code` ✅
- `is_primary` ✅ (boolean - marks hero image)
- `duration_seconds` ❌ (NOT in database - filtered out)

**Data Source**:
- Gallery media from `formState.overview.media`
- Audio guides from `formState.audioGuides`

**Storage Logic**:
- Hero image: First media item or item with `is_primary = true`
- Audio guides: Stored with `media_type = 'audio'` and `language_code` set

---

### 3. `heritage_sitevisitinghours` (Visiting Hours Table)
**Purpose**: Opening hours for each day of the week

**Columns**:
- `visiting_hours_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `day_of_week` ✅ (string: 'Monday', 'Tuesday', etc.)
- `is_open` ✅ (boolean)
- `opening_time` ✅ (string, format: 'HH:MM:00')
- `closing_time` ✅ (string, format: 'HH:MM:00')
- `notes` ✅

**Data Source**: `formState.overview.openingHours.schedule`

**Storage Format**:
- Time format: `${time}:00` (e.g., '09:00:00')
- One record per day of week (7 records total)

---

### 4. `heritage_sitetickettype` (Ticket Types Table)
**Purpose**: Ticket pricing for different visitor types

**Columns**:
- `tickettype_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `visitor_type` ✅ (string, e.g., 'Adult (18-60 years)')
- `amount` ✅ (number)
- `currency` ✅ (string, default: 'INR')
- `notes` ✅

**Data Source**: `formState.ticketing.fees` (only when `entryType === 'paid'`)

**Storage Logic**:
- Only saved when `entry_type = 'paid'`
- Empty array when `entry_type = 'free'`

---

### 5. `heritage_sitetransportation` (Transportation & Attractions Table)
**Purpose**: Transportation options and nearby attractions

**Columns**:
- `transportation_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `category` ✅ ('transport' | 'attraction')
- `mode` ✅ (string, e.g., 'metro', 'bus', 'taxi')
- `name` ✅ (string)
- `description` ✅
- `distance_km` ✅ (number)
- `travel_time_minutes` ✅ (number)
- `notes` ✅
- `contact_info` ✅ (JSON object)

**Data Source**:
- Transport: `formState.transport` → `category: 'transport'`
- Attractions: `formState.nearbyAttractions` → `category: 'attraction'`

**Storage Logic**:
- Transport items: `mode` is set, `category = 'transport'`
- Attractions: `mode = null`, `category = 'attraction'`

---

### 6. `heritage_siteamenity` (Amenities Table)
**Purpose**: Site amenities (e.g., parking, wheelchair access)

**Columns**:
- `amenity_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `name` ✅ (string, required)
- `icon` ✅ (string, e.g., 'ri-wheelchair-line')
- `description` ✅

**Data Source**: `formState.overview.amenities`

**Storage Logic**:
- Filters out empty names
- Trims whitespace
- Icon and description are optional

---

### 7. `heritage_siteetiquette` (Cultural Etiquettes Table)
**Purpose**: Cultural etiquette guidelines for visitors

**Columns**:
- `etiquette_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `etiquette_text` ✅ (string, required)
- `display_order` ✅ (number, for ordering)

**Data Source**: `formState.culturalEtiquettes`

**Storage Logic**:
- Filters out empty texts
- Auto-assigns `display_order` based on array index (1, 2, 3...)
- Ordered by `display_order` when fetching

---

### 8. `heritage_sitetranslation` (Translations Table)
**Purpose**: Multi-language content for various fields

**Columns**:
- `translation_id` (PRIMARY KEY, auto-generated)
- `site_id` ✅ (FOREIGN KEY)
- `language_code` ✅ (string, e.g., 'en', 'gu', 'hi', 'es')
- `field_type` ✅ (string)
- `content` ✅ (string, required)

**Field Types Used**:
- `'overview'` - Overview translations
- `'history'` - History translations
- `'location_address'` - Address translations
- `'location_area'` - Area translations
- `'location_city'` - City translations
- `'location_state'` - State translations
- `'location_country'` - Country translations
- `'location_postal_code'` - Postal code translations

**Data Source**:
- Overview: `formState.translations.overview`
- History: `formState.translations.history`
- Location: `formState.overview.location*` fields (stored with language_code: 'en')

**Storage Logic**:
- Location fields stored with `language_code: 'en'` as default
- Each language/field combination = one record
- Filters out empty content

---

### 9. `heritage_sitefeedback` (Feedback Table)
**Purpose**: User feedback (user-generated, not created during site creation)

**Columns** (inferred from table name):
- `feedback_id` (PRIMARY KEY, auto-generated)
- `site_id` (FOREIGN KEY)
- Additional columns for feedback data

**Note**: This table is for user-generated feedback, not populated during site creation.

---

### 10. `heritage_sitereview` (Reviews Table)
**Purpose**: User reviews (user-generated, not created during site creation)

**Columns** (inferred from table name):
- `review_id` (PRIMARY KEY, auto-generated)
- `site_id` (FOREIGN KEY)
- Additional columns for review data

**Note**: This table is for user-generated reviews, not populated during site creation.

---

## Data Flow: Form → Database

### Step-by-Step Storage Process

1. **Main Site Record** (`heritage_site`)
   - Filters out non-database columns
   - Inserts core site data
   - Returns `site_id` for foreign key relationships

2. **Media Files** (`heritage_sitemedia`)
   - Combines gallery media + audio guides
   - Marks first item or explicitly marked item as `is_primary = true`
   - Stores with appropriate `media_type` and `language_code`

3. **Visiting Hours** (`heritage_sitevisitinghours`)
   - One record per day (7 records total)
   - Converts time format to 'HH:MM:00'

4. **Ticket Types** (`heritage_sitetickettype`)
   - Only saved if `entry_type = 'paid'`
   - Each fee structure = one record

5. **Transportation** (`heritage_sitetransportation`)
   - Transport options: `category = 'transport'`
   - Nearby attractions: `category = 'attraction'`

6. **Amenities** (`heritage_siteamenity`)
   - One record per amenity
   - Filters empty names

7. **Etiquettes** (`heritage_siteetiquette`)
   - One record per etiquette text
   - Auto-assigns display order

8. **Translations** (`heritage_sitetranslation`)
   - Overview translations: `field_type = 'overview'`
   - History translations: `field_type = 'history'`
   - Location fields: `field_type = 'location_*'` with `language_code = 'en'`

---

## Current Implementation Status

### ✅ Correctly Implemented
- Core site information storage
- Media files (images, audio, video)
- Visiting hours
- Ticket types
- Transportation & attractions
- Amenities
- Cultural etiquettes
- Translations (overview, history, location)

### ⚠️ Fields Not Saved (No Database Columns)
- `ar_mode_available` - Boolean flag
- `booking_url` - Booking URL string
- `booking_online_available` - Boolean flag
- `site_map_url` - Site map URL
- `status` - Status enum (using `is_active` instead)

### 📝 Notes
- `hero_image_url` is stored in `heritage_sitemedia` with `is_primary = true`
- Location fields are stored in `heritage_sitetranslation` table
- `duration_seconds` is filtered out from media (column doesn't exist)
- Feedback and Review tables are user-generated, not created during site creation

---

## Verification Checklist

To verify the implementation matches the database structure:

1. ✅ Run `npm run review-site` to fetch site_id 1 data
2. ✅ Compare actual database columns with code expectations
3. ✅ Verify all form fields map to correct tables
4. ✅ Check that filtered fields are not being inserted
5. ✅ Confirm foreign key relationships are correct
6. ✅ Validate data types match database schema

---

## Recommendations

1. **Add Missing Columns** (if needed):
   - `ar_mode_available` (boolean)
   - `booking_url` (text)
   - `booking_online_available` (boolean)
   - `site_map_url` (text)
   - `status` (enum: 'draft', 'pending_review', 'published', 'archived')

2. **Consider Adding**:
   - `duration_seconds` to `heritage_sitemedia` if audio/video duration tracking is needed

3. **Translation Enhancement**:
   - Currently location fields use 'en' as default
   - Consider supporting multi-language location data in future

---

## Running the Review Script

To review actual site_id 1 data:

```bash
npm run review-site
```

This will:
- Fetch all data from site_id 1
- Display column structures
- Show sample data
- Provide a summary of what's stored in each table

