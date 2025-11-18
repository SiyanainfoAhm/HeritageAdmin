import { supabase } from '@/config/supabase';
import { HeritageSite, HeritageSiteAmenity, HeritageSiteTranslationMap } from '@/types';

export type HeritageSiteExperience = 'vr' | 'audio_guide' | 'guided_tour' | 'interactive' | string;
export type HeritageSiteEntryType = 'free' | 'paid' | string;

export interface HeritageSiteFilters {
  search?: string;
  status?: 'active' | 'inactive';
  experience?: HeritageSiteExperience | 'all';
  siteType?: string;
}

export interface HeritageSitePayload {
  name_default: string;
  short_desc_default?: string | null;
  full_desc_default?: string | null;
  // city, state, country are stored in heritage_sitetranslation table, not in main table
  city?: string | null; // Stored in heritage_sitetranslation table
  state?: string | null; // Stored in heritage_sitetranslation table
  country?: string | null; // Stored in heritage_sitetranslation table
  latitude?: number | null;
  longitude?: number | null;
  vr_link?: string | null;
  qr_link?: string | null;
  meta_title_def?: string | null;
  meta_description_def?: string | null;
  is_active?: boolean;
  // Legacy fields (not in actual database - filtered out)
  site_type?: string | null;
  entry_fee?: number | null;
  entry_type?: HeritageSiteEntryType | null;
  experience?: HeritageSiteExperience | null;
  accessibility?: string | null;
  location_address?: string | null;
  location_area?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  location_postal_code?: string | null;
  hero_image_url?: string | null;
  video_360_url?: string | null;
  ar_mode_available?: boolean | null;
  amenities?: HeritageSiteAmenity[] | null;
  overview_translations?: HeritageSiteTranslationMap | null;
  history_translations?: HeritageSiteTranslationMap | null;
  booking_url?: string | null;
  booking_online_available?: boolean | null;
  site_map_url?: string | null;
  cultural_etiquettes?: string[] | null;
}

export type HeritageSiteStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export type HeritageSiteMediaType = 'image' | 'audio' | 'video' | 'document';

export interface HeritageSiteCoreInput extends HeritageSitePayload {
  status?: HeritageSiteStatus;
}

export interface HeritageSiteMediaInput {
  media_type: HeritageSiteMediaType;
  storage_url: string; // Will be mapped to media_url
  thumbnail_url?: string | null; // Not in database
  label?: string | null; // Not in database
  language_code?: string | null; // Not in database
  duration_seconds?: number | null; // Not in database
  is_primary?: boolean;
  position?: number | null; // Actual database column
}

export interface HeritageSiteVisitingHoursInput {
  day_of_week: string | number; // Database uses number (1-7), code uses string
  is_open: boolean; // Will be mapped to is_closed (inverted)
  opening_time?: string | null; // Will be mapped to open_time
  closing_time?: string | null; // Will be mapped to close_time
  notes?: string | null; // Will be mapped to special_notes
}

export interface HeritageSiteTicketTypeInput {
  visitor_type: string; // Will be mapped to ticket_name
  amount: number; // Will be mapped to price
  currency?: string;
  notes?: string | null; // Will be mapped to description
  age_group?: string | null;
  includes_guide?: boolean;
  includes_audio_guide?: boolean;
  includes_vr_experience?: boolean;
}

export interface HeritageSiteTransportationInput {
  category: 'transport' | 'attraction'; // Will be mapped to transport_type
  mode?: string | null; // Not in database
  name: string; // Will be mapped to route_info
  description?: string | null; // Will be mapped to route_info (combined)
  distance_km?: number | null; // Not in database (use cost_range instead)
  travel_time_minutes?: number | null; // Will be mapped to duration_minutes
  notes?: string | null; // Will be mapped to accessibility_notes
  contact_info?: Record<string, any> | null; // Not in database
}

export interface HeritageSiteEtiquetteInput {
  rule_title: string; // Maps to rule_title in database
  rule_description?: string | null; // Maps to rule_description
  icon_name?: string | null;
  importance_level?: 'low' | 'normal' | 'high' | 'critical' | null;
  // Legacy field (for backward compatibility)
  etiquette_text?: string; // Will be mapped to rule_title if rule_title not provided
}

export interface HeritageSiteTranslationInput {
  language_code: string; // Uppercase: 'EN', 'HI', 'GU', 'JA', 'ES', 'FR'
  name?: string | null;
  short_desc?: string | null;
  full_desc?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  // Legacy field_type approach (for backward compatibility)
  field_type?: 'overview' | 'history' | 'location_address' | 'location_area' | 'location_city' | 'location_state' | 'location_country' | 'location_postal_code';
  content?: string; // Used when field_type is provided
}

export interface CreateHeritageSiteRequest {
  site: HeritageSiteCoreInput;
  media?: HeritageSiteMediaInput[];
  visitingHours?: HeritageSiteVisitingHoursInput[];
  ticketTypes?: HeritageSiteTicketTypeInput[];
  transportation?: HeritageSiteTransportationInput[];
  amenities?: HeritageSiteAmenity[];
  etiquettes?: HeritageSiteEtiquetteInput[];
  translations?: HeritageSiteTranslationInput[];
}

export interface HeritageSiteDetails {
  site: HeritageSite | null;
  media: Array<{
    media_id: number | string;
    site_id: number;
    media_type: HeritageSiteMediaType;
    storage_url: string;
    thumbnail_url: string | null;
    label: string | null;
    language_code: string | null;
    duration_seconds: number | null;
    is_primary: boolean | null;
  }>;
  visitingHours: Array<{
    visiting_hours_id?: number | string;
    day_of_week: number | string; // Database returns number (1-7), but can be string in some cases
    is_open?: boolean; // Legacy field
    is_closed?: boolean; // Actual database field (inverted)
    opening_time?: string | null; // Legacy field
    closing_time?: string | null; // Legacy field
    open_time?: string | null; // Actual database field
    close_time?: string | null; // Actual database field
    notes?: string | null; // Legacy field
    special_notes?: string | null; // Actual database field
  }>;
  ticketTypes: Array<{
    tickettype_id?: number | string;
    visitor_type: string;
    amount: number;
    currency: string | null;
    notes: string | null;
  }>;
  transportation: Array<{
    transportation_id?: number | string;
    category: 'transport' | 'attraction';
    mode: string | null;
    name: string;
    description: string | null;
    distance_km: number | null;
    travel_time_minutes: number | null;
    notes: string | null;
    contact_info: Record<string, any> | null;
  }>;
  amenities: Array<{
    amenity_id?: number | string;
    site_id: number;
    name: string;
    icon: string | null;
    description: string | null;
  }>;
  etiquettes: Array<{
    etiquette_id?: number | string;
    site_id: number;
    etiquette_text: string;
    display_order: number | null;
  }>;
  translations: Array<{
    translation_id?: number | string;
    site_id: number;
    language_code: string;
    field_type: string;
    content: string;
  }>;
}

export class HeritageSiteService {
  // Helper function to filter out non-database columns from payload
  // Based on actual database structure - city/state/country are in heritage_sitetranslation, not main table
  private static filterDatabaseColumns(payload: Partial<HeritageSitePayload | HeritageSiteCoreInput>): Record<string, any> {
    const {
      // Non-database columns (stored elsewhere or not yet implemented)
      amenities,                    // Array - stored in heritage_siteamenity table
      overview_translations,         // Object - stored in heritage_sitetranslation table
      history_translations,          // Object - stored in heritage_sitetranslation table
      cultural_etiquettes,          // Array - stored in heritage_siteetiquette table
      ar_mode_available,            // Boolean - column doesn't exist
      booking_online_available,      // Boolean - column doesn't exist
      booking_url,                  // String - column doesn't exist
      video_360_url,                // String - column doesn't exist (using vr_link instead)
      site_map_url,                 // String - column doesn't exist
      hero_image_url,               // String - column doesn't exist (stored in heritage_sitemedia)
      status,                       // String - column doesn't exist (using is_active instead)
      // Location fields - ALL stored in heritage_sitetranslation table (city, state, country, address)
      city,                         // String - stored in heritage_sitetranslation.city (NOT in main table)
      state,                        // String - stored in heritage_sitetranslation.state (NOT in main table)
      country,                      // String - stored in heritage_sitetranslation.country (NOT in main table)
      location_address,             // String - stored in heritage_sitetranslation.address
      location_area,                // String - not in database
      location_city,                // String - stored in heritage_sitetranslation.city
      location_state,               // String - stored in heritage_sitetranslation.state
      location_country,            // String - stored in heritage_sitetranslation.country
      location_postal_code,         // String - not in database
      // Legacy fields not in actual database
      site_type,                    // Not in heritage_site table
      entry_fee,                    // Not in heritage_site table
      entry_type,                   // Not in heritage_site table
      experience,                   // Not in heritage_site table
      accessibility,                // Not in heritage_site table
      ...dbColumns
    } = payload;
    return dbColumns;
  }

  static async getHeritageSites(filters?: HeritageSiteFilters): Promise<HeritageSite[]> {
    try {
      let query = supabase
        .from('heritage_site')
        .select('*')
        .order('updated_at', { ascending: false });

      if (filters?.search) {
        query = query.ilike('name_default', `%${filters.search}%`);
      }

      if (filters?.status) {
        query = query.eq('is_active', filters.status === 'active');
      }

      if (filters?.experience && filters.experience !== 'all') {
        query = query.eq('experience', filters.experience);
      }

      if (filters?.siteType && filters.siteType !== 'all') {
        query = query.eq('site_type', filters.siteType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching heritage sites:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching heritage sites:', error);
      return [];
    }
  }

  static async getHeritageSite(siteId: number): Promise<HeritageSite | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_site')
        .select('*')
        .eq('site_id', siteId)
        .single();

      if (error) {
        console.error('Error fetching heritage site:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception fetching heritage site:', error);
      return null;
    }
  }

  static async getHeritageSiteDetails(siteId: number): Promise<{ success: boolean; data?: HeritageSiteDetails; error?: any }> {
    try {
      const [siteResult, mediaResult, visitingResult, ticketResult, transportResult, amenitiesResult, etiquettesResult, translationsResult] = await Promise.all([
        supabase.from('heritage_site').select('*').eq('site_id', siteId).single(),
        supabase.from('heritage_sitemedia').select('*').eq('site_id', siteId),
        supabase.from('heritage_sitevisitinghours').select('*').eq('site_id', siteId).order('day_of_week', { ascending: true }),
        supabase.from('heritage_sitetickettype').select('*').eq('site_id', siteId),
        supabase.from('heritage_sitetransportation').select('*').eq('site_id', siteId),
        supabase.from('heritage_siteamenity').select('*').eq('site_id', siteId),
        supabase.from('heritage_siteetiquette').select('*').eq('site_id', siteId),
        supabase.from('heritage_sitetranslation').select('*').eq('site_id', siteId),
      ]);

      if (siteResult.error) {
        return { success: false, error: siteResult.error };
      }

      if (mediaResult.error) {
        return { success: false, error: mediaResult.error };
      }

      if (visitingResult.error) {
        return { success: false, error: visitingResult.error };
      }

      if (ticketResult.error) {
        return { success: false, error: ticketResult.error };
      }

      if (transportResult.error) {
        return { success: false, error: transportResult.error };
      }

      if (amenitiesResult.error) {
        return { success: false, error: amenitiesResult.error };
      }

      if (etiquettesResult.error) {
        return { success: false, error: etiquettesResult.error };
      }

      if (translationsResult.error) {
        return { success: false, error: translationsResult.error };
      }

      return {
        success: true,
        data: {
          site: siteResult.data ?? null,
          media: mediaResult.data ?? [],
          visitingHours: visitingResult.data ?? [],
          ticketTypes: ticketResult.data ?? [],
          transportation: transportResult.data ?? [],
          amenities: amenitiesResult.data ?? [],
          etiquettes: etiquettesResult.data ?? [],
          translations: translationsResult.data ?? [],
        },
      };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async createHeritageSite(payload: HeritageSitePayload): Promise<{ success: boolean; data?: HeritageSite; error?: any }> {
    try {
      const dbPayload = this.filterDatabaseColumns(payload);
      const { data, error } = await supabase
        .from('heritage_site')
        .insert({
          ...dbPayload,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data: data as HeritageSite };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async createHeritageSiteWithDetails(request: CreateHeritageSiteRequest): Promise<{ success: boolean; siteId?: number; error?: any }> {
    const { site, media = [], visitingHours = [], ticketTypes = [], transportation = [], amenities = [], etiquettes = [], translations = [] } = request;

    try {
      const timestamp = new Date().toISOString();
      const dbPayload = this.filterDatabaseColumns(site);
      const { data: siteInsert, error: siteError } = await supabase
        .from('heritage_site')
        .insert({
          ...dbPayload,
          created_at: timestamp,
          updated_at: timestamp,
        })
        .select('site_id')
        .single();

      if (siteError || !siteInsert) {
        return { success: false, error: siteError };
      }

      const siteId = siteInsert.site_id as number;

      const rollback = async () => {
        await supabase.from('heritage_site').delete().eq('site_id', siteId);
      };

      if (media.length > 0) {
        const mediaRows = media
          .filter((item) => item.storage_url)
          .map((item, index) => ({
            site_id: siteId,
            media_type: item.media_type,
            media_url: item.storage_url, // Map storage_url to media_url
            position: item.position ?? index + 1, // Use position from input or index
            is_primary: item.is_primary ?? index === 0,
            // Note: thumbnail_url, label, language_code, duration_seconds not in database
          }));

        if (mediaRows.length > 0) {
          const { error: mediaError } = await supabase.from('heritage_sitemedia').insert(mediaRows);
          if (mediaError) {
            await rollback();
            return { success: false, error: mediaError };
          }
        }
      }

      if (visitingHours.length > 0) {
        // Map day names to numbers (Monday=1, Tuesday=2, etc.)
        const dayMap: Record<string, number> = {
          'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
          'Friday': 5, 'Saturday': 6, 'Sunday': 7
        };

        const visitingRows = visitingHours.map((item) => {
          const dayOfWeek = typeof item.day_of_week === 'number' 
            ? item.day_of_week 
            : dayMap[item.day_of_week] || 1;

          return {
            site_id: siteId,
            day_of_week: dayOfWeek,
            is_closed: !item.is_open, // Invert: is_open → is_closed
            open_time: item.opening_time ?? null, // Map opening_time to open_time
            close_time: item.closing_time ?? null, // Map closing_time to close_time
            special_notes: item.notes ?? null, // Map notes to special_notes
          };
        });

        const { error: visitingError } = await supabase.from('heritage_sitevisitinghours').insert(visitingRows);
        if (visitingError) {
          await rollback();
          return { success: false, error: visitingError };
        }
      }

      if (ticketTypes.length > 0) {
        const ticketRows = ticketTypes.map((item) => ({
          site_id: siteId,
          ticket_name: item.visitor_type, // Map visitor_type to ticket_name
          price: item.amount, // Map amount to price
          currency: item.currency ?? 'INR',
          description: item.notes ?? null, // Map notes to description
          age_group: item.age_group ?? null,
          includes_guide: item.includes_guide ?? false,
          includes_audio_guide: item.includes_audio_guide ?? false,
          includes_vr_experience: item.includes_vr_experience ?? false,
          is_active: true,
        }));

        const { error: ticketError } = await supabase.from('heritage_sitetickettype').insert(ticketRows);
        if (ticketError) {
          await rollback();
          return { success: false, error: ticketError };
        }
      }

      if (transportation.length > 0) {
        const transportRows = transportation.map((item) => {
          // Combine name and description into route_info
          const routeInfo = item.description 
            ? `${item.name}${item.description ? ` - ${item.description}` : ''}`
            : item.name;

          return {
            site_id: siteId,
            transport_type: item.category === 'transport' ? item.mode || 'other' : 'attraction', // Map category/mode to transport_type
            route_info: routeInfo, // Map name/description to route_info
            duration_minutes: item.travel_time_minutes ?? null, // Map travel_time_minutes to duration_minutes
            cost_range: item.distance_km ? `₹${item.distance_km}` : null, // Map distance_km to cost_range (approximate)
            accessibility_notes: item.notes ?? null, // Map notes to accessibility_notes
            is_active: true,
            // Note: contact_info, distance_km not in database
          };
        });

        const { error: transportError } = await supabase.from('heritage_sitetransportation').insert(transportRows);
        if (transportError) {
          await rollback();
          return { success: false, error: transportError };
        }
      }

      if (amenities.length > 0) {
        const amenityRows = amenities
          .filter((item) => item.name && item.name.trim())
          .map((item) => ({
            site_id: siteId,
            amenity_name: item.name.trim(), // Map name to amenity_name
            icon_name: item.icon?.trim() || null, // Map icon to icon_name
            description: item.description?.trim() || null,
            amenity_type: 'facility', // Default type
            is_available: true,
          }));

        if (amenityRows.length > 0) {
          const { error: amenityError } = await supabase.from('heritage_siteamenity').insert(amenityRows);
          if (amenityError) {
            await rollback();
            return { success: false, error: amenityError };
          }
        }
      }

      if (etiquettes.length > 0) {
        // Heritage_SiteEtiquette uses rule_title/rule_description fields
        const etiquetteRows = etiquettes
          .filter((item) => {
            return (item.rule_title && item.rule_title.trim()) || (item.etiquette_text && item.etiquette_text.trim());
          })
          .map((item) => ({
            site_id: siteId,
            rule_title: item.rule_title?.trim() || item.etiquette_text?.trim() || '',
            rule_description: item.rule_description?.trim() || null,
            icon_name: item.icon_name?.trim() || null,
            importance_level: item.importance_level || 'normal',
            is_active: true,
          }));

        if (etiquetteRows.length > 0) {
          const { error: etiquetteError } = await supabase.from('heritage_siteetiquette').insert(etiquetteRows);
          if (etiquetteError) {
            await rollback();
            return { success: false, error: etiquetteError };
          }
        }
      }

      if (translations.length > 0) {
        // Heritage_SiteTranslation: ONE ROW PER LANGUAGE (not per field_type)
        // Columns: name, short_desc, full_desc, meta_title, meta_description, address, city, state, country
        // Group translations by language_code (uppercase)
        const translationsByLang: Record<string, {
          name?: string;
          short_desc?: string;
          full_desc?: string;
          meta_title?: string;
          meta_description?: string;
          address?: string;
          city?: string;
          state?: string;
          country?: string;
        }> = {};

        translations.forEach((item) => {
          const langCode = item.language_code.toUpperCase(); // Ensure uppercase
          if (!translationsByLang[langCode]) {
            translationsByLang[langCode] = {};
          }

          // Support both new format (direct fields) and legacy (field_type/content)
          if (item.field_type && item.content) {
            // Legacy field_type approach
            switch (item.field_type) {
              case 'overview':
                translationsByLang[langCode].short_desc = item.content.trim();
                break;
              case 'history':
                translationsByLang[langCode].full_desc = item.content.trim();
                break;
              case 'location_address':
                translationsByLang[langCode].address = item.content.trim();
                break;
              case 'location_city':
                translationsByLang[langCode].city = item.content.trim();
                break;
              case 'location_state':
                translationsByLang[langCode].state = item.content.trim();
                break;
              case 'location_country':
                translationsByLang[langCode].country = item.content.trim();
                break;
            }
          } else {
            // New direct field approach
            if (item.name) translationsByLang[langCode].name = item.name.trim();
            if (item.short_desc) translationsByLang[langCode].short_desc = item.short_desc.trim();
            if (item.full_desc) translationsByLang[langCode].full_desc = item.full_desc.trim();
            if (item.address) translationsByLang[langCode].address = item.address.trim();
            if (item.city) translationsByLang[langCode].city = item.city.trim();
            if (item.state) translationsByLang[langCode].state = item.state.trim();
            if (item.country) translationsByLang[langCode].country = item.country.trim();
            if (item.meta_title) translationsByLang[langCode].meta_title = item.meta_title.trim();
            if (item.meta_description) translationsByLang[langCode].meta_description = item.meta_description.trim();
          }
        });

        // Create translation rows - one per language
        const translationRows = Object.entries(translationsByLang).map(([lang, data]) => ({
          site_id: siteId,
          language_code: lang, // Already uppercase
          name: data.name || site.name_default || '', // Fallback to site name
          short_desc: data.short_desc || null,
          full_desc: data.full_desc || null,
          meta_title: data.meta_title || null,
          meta_description: data.meta_description || null,
          address: data.address || site.location_address || null,
          // city, state, country from translation data or from site object (which comes from location fields)
          city: data.city || site.city || site.location_city || null,
          state: data.state || site.state || site.location_state || null,
          country: data.country || site.country || site.location_country || 'India',
        }));

        if (translationRows.length > 0) {
          const { error: translationError } = await supabase.from('heritage_sitetranslation').insert(translationRows);
          if (translationError) {
            await rollback();
            return { success: false, error: translationError };
          }
        }
      }

      return { success: true, siteId };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async updateHeritageSiteWithDetails(siteId: number, request: CreateHeritageSiteRequest): Promise<{ success: boolean; error?: any }> {
    const { site, media = [], visitingHours = [], ticketTypes = [], transportation = [], amenities = [], etiquettes = [], translations = [] } = request;

    try {
      const timestamp = new Date().toISOString();
      const dbPayload = this.filterDatabaseColumns(site);

      const { error: siteError } = await supabase
        .from('heritage_site')
        .update({
          ...dbPayload,
          updated_at: timestamp,
        })
        .eq('site_id', siteId);

      if (siteError) {
        return { success: false, error: siteError };
      }

      // Map day names to numbers for visiting hours
      const dayMap: Record<string, number> = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
        'Friday': 5, 'Saturday': 6, 'Sunday': 7
      };

      // Group translations by language for heritage_sitetranslation table
      const translationsByLang: Record<string, {
        name?: string;
        short_desc?: string;
        full_desc?: string;
        meta_title?: string;
        meta_description?: string;
        address?: string;
        city?: string;
        state?: string;
        country?: string;
      }> = {};

      translations.forEach((item) => {
        const langCode = item.language_code.toUpperCase(); // Ensure uppercase
        if (!translationsByLang[langCode]) {
          translationsByLang[langCode] = {};
        }

        // Support both new format (direct fields) and legacy (field_type/content)
        if (item.field_type && item.content) {
          // Legacy field_type approach
          switch (item.field_type) {
            case 'overview':
              translationsByLang[langCode].short_desc = item.content.trim();
              break;
            case 'history':
              translationsByLang[langCode].full_desc = item.content.trim();
              break;
            case 'location_address':
              translationsByLang[langCode].address = item.content.trim();
              break;
            case 'location_city':
              translationsByLang[langCode].city = item.content.trim();
              break;
            case 'location_state':
              translationsByLang[langCode].state = item.content.trim();
              break;
            case 'location_country':
              translationsByLang[langCode].country = item.content.trim();
              break;
          }
        } else {
          // New direct field approach
          if (item.name) translationsByLang[langCode].name = item.name.trim();
          if (item.short_desc) translationsByLang[langCode].short_desc = item.short_desc.trim();
          if (item.full_desc) translationsByLang[langCode].full_desc = item.full_desc.trim();
          if (item.address) translationsByLang[langCode].address = item.address.trim();
          if (item.city) translationsByLang[langCode].city = item.city.trim();
          if (item.state) translationsByLang[langCode].state = item.state.trim();
          if (item.country) translationsByLang[langCode].country = item.country.trim();
          if (item.meta_title) translationsByLang[langCode].meta_title = item.meta_title.trim();
          if (item.meta_description) translationsByLang[langCode].meta_description = item.meta_description.trim();
        }
      });

      const childOperations: Array<{
        table: string;
        rows: any[];
      }> = [
        {
          table: 'heritage_sitemedia',
          rows: media
            .filter((item) => item.storage_url)
            .map((item, index) => ({
              site_id: siteId,
              media_type: item.media_type,
              media_url: item.storage_url, // Map storage_url to media_url
              position: item.position ?? index + 1,
              is_primary: item.is_primary ?? index === 0,
            })),
        },
        {
          table: 'heritage_sitevisitinghours',
          rows: visitingHours.map((item) => {
            const dayOfWeek = typeof item.day_of_week === 'number' 
              ? item.day_of_week 
              : dayMap[item.day_of_week] || 1;
            return {
              site_id: siteId,
              day_of_week: dayOfWeek,
              is_closed: !item.is_open,
              open_time: item.opening_time ?? null,
              close_time: item.closing_time ?? null,
              special_notes: item.notes ?? null,
            };
          }),
        },
        {
          table: 'heritage_sitetickettype',
          rows: ticketTypes.map((item) => ({
            site_id: siteId,
            ticket_name: item.visitor_type,
            price: item.amount,
            currency: item.currency ?? 'INR',
            description: item.notes ?? null,
            age_group: item.age_group ?? null,
            includes_guide: item.includes_guide ?? false,
            includes_audio_guide: item.includes_audio_guide ?? false,
            includes_vr_experience: item.includes_vr_experience ?? false,
            is_active: true,
          })),
        },
        {
          table: 'heritage_sitetransportation',
          rows: transportation.map((item) => {
            const routeInfo = item.description 
              ? `${item.name}${item.description ? ` - ${item.description}` : ''}`
              : item.name;
            return {
              site_id: siteId,
              transport_type: item.category === 'transport' ? item.mode || 'other' : 'attraction',
              route_info: routeInfo,
              duration_minutes: item.travel_time_minutes ?? null,
              cost_range: item.distance_km ? `₹${item.distance_km}` : null,
              accessibility_notes: item.notes ?? null,
              is_active: true,
            };
          }),
        },
        {
          table: 'heritage_siteamenity',
          rows: amenities
            .filter((item) => item.name && item.name.trim())
            .map((item) => ({
              site_id: siteId,
              amenity_name: item.name.trim(),
              icon_name: item.icon?.trim() || null,
              description: item.description?.trim() || null,
              amenity_type: 'facility',
              is_available: true,
            })),
        },
        {
          table: 'heritage_siteetiquette',
          rows: etiquettes
            .filter((item) => {
              return (item.rule_title && item.rule_title.trim()) || (item.etiquette_text && item.etiquette_text.trim());
            })
            .map((item) => ({
              site_id: siteId,
              rule_title: item.rule_title?.trim() || item.etiquette_text?.trim() || '',
              rule_description: item.rule_description?.trim() || null,
              icon_name: item.icon_name?.trim() || null,
              importance_level: item.importance_level || 'normal',
              is_active: true,
            })),
        },
        {
          table: 'heritage_sitetranslation',
          rows: Object.entries(translationsByLang).map(([lang, data]) => ({
            site_id: siteId,
            language_code: lang, // Already uppercase
            name: data.name || site.name_default || '',
            short_desc: data.short_desc || null,
            full_desc: data.full_desc || null,
            meta_title: data.meta_title || null,
            meta_description: data.meta_description || null,
            address: data.address || null,
            // city, state, country from translation data or from site object (which comes from location fields)
            city: data.city || site.city || site.location_city || null,
            state: data.state || site.state || site.location_state || null,
            country: data.country || site.country || site.location_country || 'India',
          })),
        },
      ];

      for (const operation of childOperations) {
        const { error: deleteError } = await supabase.from(operation.table).delete().eq('site_id', siteId);
        if (deleteError) {
          return { success: false, error: deleteError };
        }

        if (operation.rows.length > 0) {
          const { error: insertError } = await supabase.from(operation.table).insert(operation.rows);
          if (insertError) {
            return { success: false, error: insertError };
          }
        }
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async updateHeritageSite(
    siteId: number,
    payload: HeritageSitePayload
  ): Promise<{ success: boolean; data?: HeritageSite; error?: any }> {
    try {
      const dbPayload = this.filterDatabaseColumns(payload);
      const { data, error } = await supabase
        .from('heritage_site')
        .update({
          ...dbPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('site_id', siteId)
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data: data as HeritageSite };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async deleteHeritageSite(siteId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase.from('heritage_site').delete().eq('site_id', siteId);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  static async toggleHeritageSiteStatus(siteId: number, isActive: boolean): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('heritage_site')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('site_id', siteId);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }
}

