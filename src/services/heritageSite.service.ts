import { supabase } from '@/config/supabase';
import { HeritageSite, HeritageSiteTranslationMap } from '@/types';
import { TranslationService } from './translation.service';

export type HeritageSiteExperience = 'vr' | 'audio_guide' | 'guided_tour' | 'interactive' | string;
export type HeritageSiteEntryType = 'free' | 'paid' | string;

export interface HeritageSiteFilters {
  search?: string;
  status?: 'active' | 'inactive';
  experience?: HeritageSiteExperience | HeritageSiteExperience[] | 'all';
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
  // Database columns in heritage_site table
  site_type?: string | null; // Database column: varchar - stores site type code from masterdata
  experience?: string[] | null; // Database column: text[] - stores array of experience codes from masterdata
  accessibility?: string[] | null; // text[] array in database
  entry_type?: HeritageSiteEntryType | null; // Database column: varchar - stores 'free' or 'paid'
  // Legacy fields (not in actual database - filtered out)
  entry_fee?: number | null;
  location_address?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  location_postal_code?: string | null;
  hero_image_url?: string | null;
  video_360_url?: string | null;
  ar_mode_available?: boolean | null;
  overview_translations?: HeritageSiteTranslationMap | null;
  history_translations?: HeritageSiteTranslationMap | null;
  booking_url?: string | null;
  booking_online_available?: boolean | null;
  site_map_url?: string | null;
  cultural_etiquettes?: string[] | null; // Legacy - kept for backward compatibility
  etiquettes?: string[] | null; // Database column: text[] - stores array of etiquette codes from masterdata
  photography_allowed?: string | null; // Database column: varchar - stores 'free', 'paid', or 'restricted'
  photograph_amount?: number | null; // Database column: numeric - stores amount if photography is paid
}

export type HeritageSiteStatus = 'draft' | 'pending_review' | 'published' | 'archived';

export type HeritageSiteMediaType = 'image' | 'audio' | 'video' | 'document' | 'sitemap';

export interface HeritageSiteCoreInput extends HeritageSitePayload {
  status?: HeritageSiteStatus;
}

export interface HeritageSiteMediaInput {
  media_type: HeritageSiteMediaType;
  media_url: string; // Database column
  thumbnail_url?: string | null; // Not in database - for UI only
  label?: string | null; // Not in database - for UI only
  language_code?: string | null; // Not in database - for UI only (used to identify audio guides)
  duration_seconds?: number | null; // Not in database - for UI only
  is_primary?: boolean; // Database column
  position?: number | null; // Database column - order of media items
}

export interface HeritageSiteVisitingHoursInput {
  day_of_week: string | number; // Database uses number (1-7), code uses string
  is_open: boolean; // Will be mapped to is_closed (inverted)
  opening_time?: string | null; // Will be mapped to open_time
  closing_time?: string | null; // Will be mapped to close_time
  notes?: string | null; // Will be mapped to special_notes
}

export interface HeritageSiteTicketTypeInput {
  // Database fields (heritage_sitetickettype table)
  ticket_name: string; // Maps to ticket_name column
  description?: string | null; // Maps to description column
  price: number; // Maps to price column
  currency?: string; // Maps to currency column (default: 'INR')
  age_group?: string | null; // Maps to age_group column ('child', 'adult', 'senior')
  includes_audio_guide?: boolean; // Maps to includes_audio_guide column
  includes_guide?: boolean; // Maps to includes_guide column
  includes_vr_experience?: boolean; // Maps to includes_vr_experience column
  is_active?: boolean; // Maps to is_active column
  // Legacy fields (for backward compatibility with old code)
  visitor_type?: string; // Legacy: will be mapped to ticket_name
  amount?: number; // Legacy: will be mapped to price
  notes?: string | null; // Legacy: will be mapped to description
}

export interface HeritageSiteTransportationInput {
  // Database fields (heritage_sitetransportation table)
  transport_type: string; // Maps to transport_type column ('bus', 'metro', 'taxi', 'walking', 'attraction', etc.)
  route_info?: string | null; // Maps to route_info column
  duration_minutes?: number | null; // Maps to duration_minutes column
  cost_range?: string | null; // Maps to cost_range column
  accessibility_notes?: string | null; // Maps to accessibility_notes column
  is_active?: boolean; // Maps to is_active column
  // Legacy fields (for backward compatibility with old code)
  category?: 'transport' | 'attraction'; // Legacy: will be used to determine transport_type
  mode?: string | null; // Legacy: alternative to transport_type
  name?: string; // Legacy: will be mapped to route_info
  description?: string | null; // Legacy: will be mapped to route_info (combined)
  distance_km?: number | null; // Legacy: used to calculate duration_minutes
  travel_time_minutes?: number | null; // Legacy: alternative to duration_minutes
  notes?: string | null; // Legacy: alternative to accessibility_notes
  contact_info?: Record<string, any> | null; // Legacy: not stored in database
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
  postal_code?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  // Legacy field_type approach (for backward compatibility)
  field_type?: 'overview' | 'history' | 'location_address' | 'location_city' | 'location_state' | 'location_country' | 'location_postal_code';
  content?: string; // Used when field_type is provided
}

export interface HeritageSiteTransportationTranslationInput {
  transportation_id: number; // ID of the transportation record
  language_code: string; // Uppercase: 'EN', 'HI', 'GU', 'JA', 'ES', 'FR'
  name?: string | null; // Translated name/station name
  route_info?: string | null; // Translated route information
  accessibility_notes?: string | null; // Translated accessibility notes
}

export interface HeritageSiteAttractionInput {
  name: string; // Attraction name (default language)
  distance_km?: number | null; // Distance from heritage site in kilometers
  notes?: string | null; // Additional notes/description (default language)
  position?: number | null; // Display order
  is_active?: boolean; // Whether the attraction is active
}

export interface HeritageSiteAttractionTranslationInput {
  attraction_id: number; // ID of the attraction record from heritage_siteattraction table
  language_code: string; // Uppercase: 'EN', 'HI', 'GU', 'JA', 'ES', 'FR'
  name?: string | null; // Translated attraction name
  notes?: string | null; // Translated notes/description
}

export interface CreateHeritageSiteRequest {
  site: HeritageSiteCoreInput;
  media?: HeritageSiteMediaInput[];
  visitingHours?: HeritageSiteVisitingHoursInput[];
  ticketTypes?: HeritageSiteTicketTypeInput[];
  transportation?: HeritageSiteTransportationInput[];
  attractions?: HeritageSiteAttractionInput[];
  etiquettes?: HeritageSiteEtiquetteInput[];
  translations?: HeritageSiteTranslationInput[];
  transportationTranslations?: HeritageSiteTransportationTranslationInput[];
  attractionTranslations?: HeritageSiteAttractionTranslationInput[];
}

export interface HeritageSiteDetails {
  site: HeritageSite | null;
  media: Array<{
    media_id: number | string;
    site_id: number;
    media_type: HeritageSiteMediaType;
    media_url: string; // Actual database column (was 'storage_url' in old interface)
    storage_url?: string; // Legacy - for backwards compatibility
    position: number | null;
    is_primary: boolean | null;
    uploaded_at?: string | null;
    // Legacy fields that don't exist in database but might be in old code
    thumbnail_url?: string | null;
    label?: string | null;
    language_code?: string | null;
    duration_seconds?: number | null;
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
    ticket_type_id?: number | string;
    site_id?: number;
    ticket_name: string; // Actual database column
    price: number; // Actual database column
    currency: string | null;
    description: string | null; // Actual database column
    age_group?: string | null;
    includes_audio_guide?: boolean;
    includes_guide?: boolean;
    includes_vr_experience?: boolean;
    is_active?: boolean;
    created_at?: string;
    // Legacy field names (for backward compatibility)
    visitor_type?: string; // Legacy: mapped from ticket_name
    amount?: number; // Legacy: mapped from price
    notes?: string | null; // Legacy: mapped from description
  }>;
  transportation: Array<{
    transportation_id?: number | string;
    site_id?: number;
    transport_type: string; // Actual database column
    route_info: string | null; // Actual database column
    duration_minutes: number | null; // Actual database column
    cost_range: string | null; // Actual database column
    accessibility_notes: string | null; // Actual database column
    is_active?: boolean;
    created_at?: string;
    // Legacy field names (for backward compatibility)
    category?: 'transport' | 'attraction'; // Legacy: derived from transport_type
    mode?: string | null; // Legacy: mapped from transport_type
    name?: string; // Legacy: extracted from route_info
    description?: string | null; // Legacy: extracted from route_info
    distance_km?: number | null; // Legacy: extracted from route_info
    travel_time_minutes?: number | null; // Legacy: same as duration_minutes
    notes?: string | null; // Legacy: mapped from accessibility_notes
    contact_info?: Record<string, any> | null; // Legacy: not in database
  }>;
  attractions?: Array<{
    attraction_id?: number | string;
    site_id?: number;
    name: string;
    distance_km?: number | null;
    notes?: string | null;
    position?: number | null;
    is_active?: boolean;
    created_at?: string;
  }>;
  etiquettes: Array<{
    etiquette_id?: number | string;
    site_id: number;
    rule_title: string; // Actual database column
    rule_description: string | null; // Actual database column
    icon_name: string | null; // Actual database column
    importance_level: string | null; // Actual database column
    is_active?: boolean;
    created_at?: string;
    // Legacy field names (for backward compatibility)
    etiquette_text?: string; // Legacy: mapped from rule_title
    display_order?: number | null; // Legacy: not in database
  }>;
  translations: Array<{
    translation_id?: number | string;
    site_id: number;
    language_code: string;
    field_type: string;
    content: string;
  }>;
  transportationTranslations?: Array<{
    translation_id?: number | string;
    transportation_id: number;
    language_code: string;
    name?: string | null;
    route_info?: string | null;
    accessibility_notes?: string | null;
  }>;
  attractionTranslations?: Array<{
    translation_id?: number | string;
    attraction_id: number;
    language_code: string;
    name?: string | null;
    notes?: string | null;
  }>;
}

export class HeritageSiteService {
  // Helper function to filter out non-database columns from payload
  // Based on actual database structure - city/state/country are in heritage_sitetranslation, not main table
  private static filterDatabaseColumns(payload: Partial<HeritageSitePayload | HeritageSiteCoreInput>): Record<string, any> {
    const {
      // Non-database columns (stored elsewhere or not yet implemented)
      overview_translations,         // Object - stored in heritage_sitetranslation table
      history_translations,          // Object - stored in heritage_sitetranslation table
      cultural_etiquettes,          // Legacy - Array - stored in heritage_siteetiquette table (deprecated)
      // etiquettes is in heritage_site table - keep it
      // ar_mode_available is now in heritage_site table - keep it
      booking_online_available,      // Boolean - column doesn't exist
      booking_url,                  // String - column doesn't exist
      video_360_url,                // String - column doesn't exist (using vr_link instead)
      site_map_url,                 // String - column doesn't exist
      hero_image_url,               // String - column doesn't exist (stored in heritage_sitemedia)
      // Location fields - ALL stored in heritage_sitetranslation table (city, state, country, address)
      city,                         // String - stored in heritage_sitetranslation.city (NOT in main table)
      state,                        // String - stored in heritage_sitetranslation.state (NOT in main table)
      country,                      // String - stored in heritage_sitetranslation.country (NOT in main table)
      location_address,             // String - stored in heritage_sitetranslation.address
      location_city,                // String - stored in heritage_sitetranslation.city
      location_state,               // String - stored in heritage_sitetranslation.state
      location_country,            // String - stored in heritage_sitetranslation.country
      location_postal_code,         // String - stored in heritage_sitetranslation.postal_code
      // Legacy fields not in actual database
      entry_fee,                    // Not in heritage_site table
      // entry_type is in heritage_site table - keep it
      // site_type and experience are in heritage_site table - keep them
      // accessibility is in heritage_site table as text[] - keep it
      ...dbColumns
    } = payload;
    
    // Explicitly remove properties that don't exist in the type but might be in the payload
    const { status, location_area, ...rest } = dbColumns as any;
    
    return rest;
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
        // Experience can be stored as text[] array
        // Handle both single value and array of values
        if (Array.isArray(filters.experience) && filters.experience.length > 0) {
          // For multiple experiences, use overlaps to find sites that have any of the selected experiences
          query = query.overlaps('experience', filters.experience);
        } else if (!Array.isArray(filters.experience)) {
          // Single experience value
          query = query.contains('experience', [filters.experience]);
        }
      }

      if (filters?.siteType && filters.siteType !== 'all') {
        query = query.eq('site_type', filters.siteType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching heritage sites:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Fetch ticket types for all sites
      const siteIds = data.map((site: any) => site.site_id);
      const { data: ticketData, error: ticketError } = await supabase
        .from('heritage_sitetickettype')
        .select('site_id, price, currency, ticket_name, is_active')
        .in('site_id', siteIds)
        .eq('is_active', true)
        .order('price', { ascending: true }); // Order by price to get cheapest first

      if (ticketError) {
        console.error('Error fetching ticket types:', ticketError);
        // Continue without ticket data if there's an error
      }

      // Map ticket prices to sites
      const ticketMap = new Map<number, { price: number; currency: string | null; ticket_name: string }>();
      if (ticketData) {
        ticketData.forEach((ticket: any) => {
          // Only store the first (cheapest) ticket for each site
          if (!ticketMap.has(ticket.site_id)) {
            ticketMap.set(ticket.site_id, {
              price: ticket.price,
              currency: ticket.currency || 'INR',
              ticket_name: ticket.ticket_name,
            });
          }
        });
      }

      // Attach ticket info to sites
      return data.map((site: any) => {
        const ticketInfo = ticketMap.get(site.site_id);
        return {
          ...site,
          // Add ticket price info for easy access
          _firstTicketPrice: ticketInfo?.price ?? null,
          _firstTicketCurrency: ticketInfo?.currency ?? null,
          _firstTicketName: ticketInfo?.ticket_name ?? null,
        };
      });
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
      const [siteResult, mediaResult, visitingResult, ticketResult, transportResult, attractionsResult, etiquettesResult, translationsResult] = await Promise.all([
        supabase.from('heritage_site').select('*').eq('site_id', siteId).single(),
        supabase.from('heritage_sitemedia').select('*').eq('site_id', siteId),
        supabase.from('heritage_sitevisitinghours').select('*').eq('site_id', siteId).order('day_of_week', { ascending: true }),
        supabase.from('heritage_sitetickettype').select('*').eq('site_id', siteId),
        supabase.from('heritage_sitetransportation').select('*').eq('site_id', siteId),
        supabase.from('heritage_siteattraction').select('*').eq('site_id', siteId).order('position', { ascending: true }),
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

      if (attractionsResult.error) {
        // Attractions table might not exist yet, log warning but don't fail
        console.warn('Error loading attractions (table may not exist):', attractionsResult.error);
      }

      if (etiquettesResult.error) {
        return { success: false, error: etiquettesResult.error };
      }

      if (translationsResult.error) {
        return { success: false, error: translationsResult.error };
      }

      // Get transportation and attraction translations
      const transportationIds = (transportResult.data || []).map(t => t.transportation_id).filter(Boolean);
      const attractionIds = (attractionsResult.data || []).map(a => a.attraction_id).filter(Boolean);

      const [transportTranslationsResult, attractionTranslationsResult] = await Promise.all([
        transportationIds.length > 0
          ? supabase.from('heritage_sitetransportationtranslation').select('*').in('transportation_id', transportationIds)
          : Promise.resolve({ data: [], error: null }),
        attractionIds.length > 0
          ? supabase.from('heritage_siteattractiontranslation').select('*').in('attraction_id', attractionIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (transportTranslationsResult.error) {
        console.warn('Error loading transportation translations:', transportTranslationsResult.error);
      }

      if (attractionTranslationsResult.error) {
        console.warn('Error loading attraction translations:', attractionTranslationsResult.error);
      }

      return {
        success: true,
        data: {
          site: siteResult.data ?? null,
          media: mediaResult.data ?? [],
          visitingHours: visitingResult.data ?? [],
          ticketTypes: ticketResult.data ?? [],
          transportation: transportResult.data ?? [],
          attractions: attractionsResult.data ?? [],
          etiquettes: etiquettesResult.data ?? [],
          translations: translationsResult.data ?? [],
          transportationTranslations: transportTranslationsResult.data ?? [],
          attractionTranslations: attractionTranslationsResult.data ?? [],
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
    const { site, media = [], visitingHours = [], ticketTypes = [], transportation = [], attractions = [], etiquettes = [], translations = [], transportationTranslations = [], attractionTranslations = [] } = request;

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
          .filter((item) => item.media_url)
          .map((item, index) => {
            const baseRow: any = {
              site_id: siteId,
              media_type: item.media_type,
              media_url: item.media_url,
              position: item.position ?? index + 1, // Use position from input or index
              is_primary: item.is_primary ?? index === 0,
            };
            
            // Include language_code for audio files (if column exists in database)
            // This is needed to identify which language each audio guide is for
            if (item.media_type === 'audio' && item.language_code) {
              baseRow.language_code = item.language_code.toUpperCase();
            }
            
            return baseRow;
          });

        if (mediaRows.length > 0) {
          // Log audio items with language_code for debugging
          const audioItems = mediaRows.filter(row => row.media_type === 'audio');
          if (audioItems.length > 0) {
            console.log('🎵 Inserting audio media with language_code:', audioItems.map(item => ({
              media_type: item.media_type,
              language_code: item.language_code,
              media_url: item.media_url?.substring(0, 50) + '...'
            })));
          }
          
          const { error: mediaError } = await supabase.from('heritage_sitemedia').insert(mediaRows);
          if (mediaError) {
            console.error('❌ Error inserting media:', mediaError);
            
            // Check if error is related to language_code column not existing
            if (mediaError.message?.includes('language_code') || mediaError.message?.includes('column') || mediaError.code === '42703') {
              console.error('⚠️ CRITICAL: language_code column does not exist in heritage_sitemedia table!');
              console.error('⚠️ Please run the migration script: dbscript/add_language_code_to_media.sql');
              await rollback();
              return { 
                success: false, 
                error: new Error(
                  `Database schema error: language_code column is missing from heritage_sitemedia table. ` +
                  `Please run the migration script: dbscript/add_language_code_to_media.sql. ` +
                  `Original error: ${mediaError.message}`
                )
              };
            }
            
            await rollback();
            return { success: false, error: mediaError };
          }
          
          console.log(`✅ Successfully inserted ${mediaRows.length} media item(s) (${audioItems.length} audio with language_code)`);
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
          ticket_name: item.ticket_name || item.visitor_type || 'General Ticket', // Support both new and legacy
          price: item.price ?? item.amount ?? 0, // Support both new and legacy
          currency: item.currency ?? 'INR',
          description: item.description ?? item.notes ?? null, // Support both new and legacy
          age_group: item.age_group ?? null,
          includes_guide: item.includes_guide ?? false,
          includes_audio_guide: item.includes_audio_guide ?? false,
          includes_vr_experience: item.includes_vr_experience ?? false,
          is_active: item.is_active ?? true,
        }));

        const { error: ticketError } = await supabase.from('heritage_sitetickettype').insert(ticketRows);
        if (ticketError) {
          await rollback();
          return { success: false, error: ticketError };
        }
      }

      if (transportation.length > 0) {
        const transportRows = transportation.map((item) => {
          // Support both new and legacy field names
          const transportType = item.transport_type 
            || (item.category === 'transport' ? item.mode || 'other' : 'attraction');
          
          const routeInfo = item.route_info 
            || (item.description ? `${item.name || ''}${item.description ? ` - ${item.description}` : ''}` : item.name || '');

          return {
            site_id: siteId,
            transport_type: transportType,
            route_info: routeInfo,
            duration_minutes: item.duration_minutes ?? item.travel_time_minutes ?? null,
            cost_range: item.cost_range ?? null,
            accessibility_notes: item.accessibility_notes ?? item.notes ?? null,
            distance: item.distance_km !== undefined && item.distance_km !== null ? String(item.distance_km) : null,
            is_active: item.is_active ?? true,
          };
        });

        const { data: insertedTransport, error: transportError } = await supabase.from('heritage_sitetransportation').insert(transportRows).select('transportation_id');
        if (transportError) {
          await rollback();
          return { success: false, error: transportError };
        }

        // Save transportation translations
        if (insertedTransport && transportationTranslations.length > 0) {
          // Map transportation array index to transportation_id
          // transportationTranslations use index as transportation_id before insertion
          const transportTranslationRows = transportationTranslations
            .map((t, index) => {
              // Find the corresponding transportation record by matching the index
              const transportRecord = insertedTransport[index];
              if (!transportRecord || !transportRecord.transportation_id) {
                return null;
              }
              
              return {
                transportation_id: transportRecord.transportation_id,
                language_code: t.language_code.toUpperCase(),
                name: t.name?.trim() || null,
                route_info: t.route_info?.trim() || null,
                accessibility_notes: t.accessibility_notes?.trim() || null,
              };
            })
            .filter((t): t is NonNullable<typeof t> => t !== null);

          if (transportTranslationRows.length > 0) {
            const { error: transportTranslationError } = await supabase
              .from('heritage_sitetransportationtranslation')
              .insert(transportTranslationRows);
            
            if (transportTranslationError) {
              console.warn('Error inserting transportation translations:', transportTranslationError);
              // Don't rollback, just log the error (translations are optional)
            } else {
              console.log(`✅ Inserted ${transportTranslationRows.length} transportation translation(s)`);
            }
          }
        }
      }

      // Save attractions to separate table
      if (attractions.length > 0) {
        const attractionRows = attractions
          .filter((item) => item.name && item.name.trim())
          .map((item, index) => ({
            site_id: siteId,
            name: item.name.trim(),
            distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
            notes: item.notes?.trim() || null,
            position: item.position ?? index + 1,
            is_active: item.is_active ?? true,
          }));

        const { data: insertedAttractions, error: attractionError } = await supabase
          .from('heritage_siteattraction')
          .insert(attractionRows)
          .select('attraction_id');
        
        if (attractionError) {
          console.warn('Error inserting attractions (table may not exist):', attractionError);
          // Don't rollback, just log the error (attractions table might not exist yet)
        } else if (insertedAttractions && attractionTranslations.length > 0) {
          // Save attraction translations
          const attractionTranslationRows = attractionTranslations
            .map((t, index) => {
              // Find the corresponding attraction record by matching the index
              const attractionRecord = insertedAttractions[index];
              if (!attractionRecord || !attractionRecord.attraction_id) {
                return null;
              }
              
              return {
                attraction_id: attractionRecord.attraction_id,
                language_code: t.language_code.toUpperCase(),
                name: t.name?.trim() || null,
                notes: t.notes?.trim() || null,
              };
            })
            .filter((t): t is NonNullable<typeof t> => t !== null);

          if (attractionTranslationRows.length > 0) {
            const { error: attractionTranslationError } = await supabase
              .from('heritage_siteattractiontranslation')
              .insert(attractionTranslationRows);
            
            if (attractionTranslationError) {
              console.warn('Error inserting attraction translations:', attractionTranslationError);
            } else {
              console.log(`✅ Inserted ${attractionTranslationRows.length} attraction translation(s)`);
            }
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
    const { site, media = [], visitingHours = [], ticketTypes = [], transportation = [], attractions = [], etiquettes = [], translations = [], transportationTranslations = [], attractionTranslations = [] } = request;

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
            .filter((item) => item.media_url)
            .map((item, index) => {
              const baseRow: any = {
                site_id: siteId,
                media_type: item.media_type,
                media_url: item.media_url,
                position: item.position ?? index + 1,
                is_primary: item.is_primary ?? index === 0,
              };
              
              // Include language_code for audio files (if column exists in database)
              // This is needed to identify which language each audio guide is for
              if (item.media_type === 'audio' && item.language_code) {
                baseRow.language_code = item.language_code.toUpperCase();
              }
              
              return baseRow;
            }),
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
            ticket_name: item.ticket_name || item.visitor_type || 'General Ticket',
            price: item.price ?? item.amount ?? 0,
            currency: item.currency ?? 'INR',
            description: item.description ?? item.notes ?? null,
            age_group: item.age_group ?? null,
            includes_guide: item.includes_guide ?? false,
            includes_audio_guide: item.includes_audio_guide ?? false,
            includes_vr_experience: item.includes_vr_experience ?? false,
            is_active: item.is_active ?? true,
          })),
        },
        {
          table: 'heritage_sitetransportation',
          rows: transportation.map((item) => {
            const transportType = item.transport_type 
              || (item.category === 'transport' ? item.mode || 'other' : 'other');
            const routeInfo = item.route_info 
              || (item.description ? `${item.name || ''}${item.description ? ` - ${item.description}` : ''}` : item.name || '');
            return {
              site_id: siteId,
              transport_type: transportType,
              route_info: routeInfo,
              duration_minutes: item.duration_minutes ?? item.travel_time_minutes ?? null,
              cost_range: item.cost_range ?? null,
              accessibility_notes: item.accessibility_notes ?? item.notes ?? null,
              distance: item.distance_km !== undefined && item.distance_km !== null ? String(item.distance_km) : null,
              is_active: item.is_active ?? true,
            };
          }),
        },
        {
          table: 'heritage_siteattraction',
          rows: attractions
            .filter((item) => item.name && item.name.trim())
            .map((item, index) => ({
              site_id: siteId,
              name: item.name.trim(),
              distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
              notes: item.notes?.trim() || null,
              position: item.position ?? index + 1,
              is_active: item.is_active ?? true,
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

      let insertedTransportIds: number[] = [];
      let insertedAttractionIds: number[] = [];

      for (const operation of childOperations) {
        const { error: deleteError } = await supabase.from(operation.table).delete().eq('site_id', siteId);
        if (deleteError) {
          return { success: false, error: deleteError };
        }

        if (operation.rows.length > 0) {
          // Log audio items with language_code for debugging (if this is media table)
          if (operation.table === 'heritage_sitemedia') {
            const audioItems = operation.rows.filter((row: any) => row.media_type === 'audio');
            if (audioItems.length > 0) {
              console.log('🎵 Updating audio media with language_code:', audioItems.map((item: any) => ({
                media_type: item.media_type,
                language_code: item.language_code,
                media_url: item.media_url?.substring(0, 50) + '...'
              })));
            }
          }
          
          // For transportation, we need to get the inserted IDs to save translations
          if (operation.table === 'heritage_sitetransportation') {
            const { data: insertedTransport, error: insertError } = await supabase
              .from(operation.table)
              .insert(operation.rows)
              .select('transportation_id, transport_type');
            
            if (insertError) {
              console.error(`❌ Error inserting into ${operation.table}:`, insertError);
              return { success: false, error: insertError };
            }
            
            if (insertedTransport) {
              insertedTransportIds = insertedTransport.map(t => t.transportation_id as number).filter(Boolean);
              console.log(`✅ Inserted ${insertedTransportIds.length} transportation record(s)`);
            }
          } else if (operation.table === 'heritage_siteattraction') {
            // For attractions, we need to get the inserted IDs to save translations
            const { data: insertedAttractions, error: insertError } = await supabase
              .from(operation.table)
              .insert(operation.rows)
              .select('attraction_id');
            
            if (insertError) {
              console.warn(`⚠️ Error inserting into ${operation.table} (table may not exist):`, insertError);
              // Don't fail, just log warning
            } else if (insertedAttractions) {
              insertedAttractionIds = insertedAttractions.map(a => a.attraction_id as number).filter(Boolean);
              console.log(`✅ Inserted ${insertedAttractionIds.length} attraction record(s)`);
            }
          } else {
            const { error: insertError } = await supabase.from(operation.table).insert(operation.rows);
            if (insertError) {
              console.error(`❌ Error inserting into ${operation.table}:`, insertError);
              
              // Check if error is related to language_code column not existing
              if (operation.table === 'heritage_sitemedia' && 
                  (insertError.message?.includes('language_code') || insertError.message?.includes('column') || insertError.code === '42703')) {
                console.error('⚠️ CRITICAL: language_code column does not exist in heritage_sitemedia table!');
                console.error('⚠️ Please run the migration script: dbscript/add_language_code_to_media.sql');
                return { 
                  success: false, 
                  error: new Error(
                    `Database schema error: language_code column is missing from heritage_sitemedia table. ` +
                    `Please run the migration script: dbscript/add_language_code_to_media.sql. ` +
                    `Original error: ${insertError.message}`
                  )
                };
              }
              
              return { success: false, error: insertError };
            }
          }
        }
      }

      // Save transportation and attraction translations after transportation records are created
      if (insertedTransportIds.length > 0) {
        // Get transportation records to identify which are attractions
        const { data: transportData } = await supabase
          .from('heritage_sitetransportation')
          .select('transportation_id, transport_type')
          .in('transportation_id', insertedTransportIds);
        
        const attractionIds = (transportData || [])
          .filter(t => t.transport_type === 'attraction')
          .map(t => t.transportation_id as number);

        // Delete existing translations for these transportation records
        if (insertedTransportIds.length > 0) {
          await Promise.all([
            supabase.from('heritage_sitetransportationtranslation')
              .delete()
              .in('transportation_id', insertedTransportIds),
            attractionIds.length > 0
              ? supabase.from('heritage_siteattractiontranslation')
                  .delete()
                  .in('attraction_id', attractionIds)
              : Promise.resolve({ error: null }),
          ]);
        }

        // Save transportation translations
        if (transportationTranslations.length > 0) {
          const transportTranslationRows = transportationTranslations
            .filter(t => insertedTransportIds.includes(t.transportation_id))
            .map(t => ({
              transportation_id: t.transportation_id,
              language_code: t.language_code.toUpperCase(),
              name: t.name?.trim() || null,
              route_info: t.route_info?.trim() || null,
              accessibility_notes: t.accessibility_notes?.trim() || null,
            }));

          if (transportTranslationRows.length > 0) {
            const { error: transportTranslationError } = await supabase
              .from('heritage_sitetransportationtranslation')
              .insert(transportTranslationRows);
            
            if (transportTranslationError) {
              console.warn('Error inserting transportation translations:', transportTranslationError);
            } else {
              console.log(`✅ Inserted ${transportTranslationRows.length} transportation translation(s)`);
            }
          }
        }

        // Save attraction translations
        if (attractionTranslations.length > 0 && attractionIds.length > 0) {
          const attractionTranslationRows = attractionTranslations
            .filter(t => attractionIds.includes(t.attraction_id))
            .map(t => ({
              attraction_id: t.attraction_id,
              language_code: t.language_code.toUpperCase(),
              name: t.name?.trim() || null,
              notes: t.notes?.trim() || null,
            }));

          if (attractionTranslationRows.length > 0) {
            const { error: attractionTranslationError } = await supabase
              .from('heritage_siteattractiontranslation')
              .insert(attractionTranslationRows);
            
            if (attractionTranslationError) {
              console.warn('Error inserting attraction translations:', attractionTranslationError);
            } else {
              console.log(`✅ Inserted ${attractionTranslationRows.length} attraction translation(s)`);
            }
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

  /**
   * Upsert heritage site with full details and translations for all languages
   * WITH AUTOMATIC TRANSLATION using Google Translate API
   * Supports: EN, HI, GU, JA, ES, FR
   * @param request - Complete heritage site data
   * @param siteId - Optional site ID for updates. If not provided, creates new site
   * @param options - Options for translation behavior
   * @returns Success status with site ID
   */
  static async upsertHeritageSiteWithAutoTranslation(
    request: CreateHeritageSiteRequest,
    siteId?: number | null,
    options?: {
      sourceLanguage?: string; // Default: 'en'
      autoTranslate?: boolean; // Default: true
      overwriteExisting?: boolean; // Default: false - only translate missing fields
    }
  ): Promise<{ success: boolean; siteId?: number; error?: any; message?: string }> {
    const { 
      sourceLanguage = 'en', 
      autoTranslate = true, 
      overwriteExisting = false 
    } = options || {};

    try {
      // If auto-translate is enabled, translate missing content
      if (autoTranslate) {
        const SUPPORTED_LANGUAGES = ['EN', 'HI', 'GU', 'JA', 'ES', 'FR'];

        // Prepare content for translation
        const contentToTranslate = {
          name: request.site.name_default || '',
          short_desc: request.site.short_desc_default || null,
          full_desc: request.site.full_desc_default || null,
          address: request.site.location_address || null,
          city: request.site.location_city || null,
          state: request.site.location_state || null,
          country: request.site.location_country || null,
          postal_code: request.site.location_postal_code || null,
        };

        // Check if we need to translate
        const existingTranslations = new Set(
          (request.translations || []).map(t => t.language_code.toUpperCase())
        );

        const needsTranslation = SUPPORTED_LANGUAGES.some(
          lang => !existingTranslations.has(lang) || overwriteExisting
        );

        console.log('🔍 Translation check:', {
          needsTranslation,
          hasName: !!contentToTranslate.name,
          existingTranslations: Array.from(existingTranslations),
          supportedLanguages: SUPPORTED_LANGUAGES,
          overwriteExisting
        });

        if (needsTranslation && contentToTranslate.name) {
          console.log('🌐 Auto-translating heritage site content...');
          console.log('📝 Content to translate:', JSON.stringify(contentToTranslate, null, 2));
          console.log('🌍 Source language:', sourceLanguage);
          console.log('📋 Existing translations:', Array.from(existingTranslations));

          const translationResult = await TranslationService.translateHeritageSiteContent(
            contentToTranslate,
            sourceLanguage
          );

          if (translationResult.success && translationResult.translations) {
            console.log('✅ Translation successful');
            console.log('📊 Translated to languages:', Object.keys(translationResult.translations));

            // Merge auto-translated content with provided translations
            const translationMap = new Map(
              (request.translations || []).map(t => [t.language_code.toUpperCase(), t])
            );

            // Add/update translations for each language
            Object.entries(translationResult.translations).forEach(([lang, content]) => {
              const existingTranslation = translationMap.get(lang);
              const contentAny = content as any; // Type assertion for postal_code

              if (!existingTranslation || overwriteExisting) {
                translationMap.set(lang, {
                  language_code: lang,
                  name: content.name,
                  short_desc: content.short_desc || undefined,
                  full_desc: content.full_desc || undefined,
                  address: content.address || undefined,
                  city: content.city || undefined,
                  state: content.state || undefined,
                  country: content.country || undefined,
                  postal_code: contentAny.postal_code || undefined,
                });
              } else {
                // Merge: keep existing non-empty fields, fill in missing ones
                translationMap.set(lang, {
                  language_code: lang,
                  name: existingTranslation.name || content.name,
                  short_desc: existingTranslation.short_desc || content.short_desc || undefined,
                  full_desc: existingTranslation.full_desc || content.full_desc || undefined,
                  address: existingTranslation.address || content.address || undefined,
                  city: existingTranslation.city || content.city || undefined,
                  state: existingTranslation.state || content.state || undefined,
                  country: existingTranslation.country || content.country || undefined,
                  postal_code: existingTranslation.postal_code || contentAny.postal_code || undefined,
                });
              }
            });

            // Update request with translated content
            request.translations = Array.from(translationMap.values());
          } else {
            console.warn('⚠️ Translation failed, proceeding with provided translations:', translationResult.error);
          }
        } else {
          console.log('⏭️ Skipping translation:', {
            reason: !needsTranslation ? 'All languages already translated' : 'No site name provided',
            needsTranslation,
            hasName: !!contentToTranslate.name
          });
        }
      } else {
        console.log('⏭️ Auto-translation disabled');
      }

      // Call the standard upsert function with (potentially translated) data
      return await this.upsertHeritageSiteWithTranslations(request, siteId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { 
        success: false, 
        error, 
        message: `Exception during upsert with auto-translation: ${errorMessage}` 
      };
    }
  }

  /**
   * Upsert heritage site with full details and translations for all languages
   * Supports: EN, HI, GU, JA, ES, FR
   * @param request - Complete heritage site data
   * @param siteId - Optional site ID for updates. If not provided, creates new site
   * @returns Success status with site ID
   */
  static async upsertHeritageSiteWithTranslations(
    request: CreateHeritageSiteRequest,
    siteId?: number | null
  ): Promise<{ success: boolean; siteId?: number; error?: any; message?: string }> {
    const { site, media = [], visitingHours = [], ticketTypes = [], transportation = [], attractions = [], etiquettes = [], translations = [], transportationTranslations = [], attractionTranslations = [] } = request;

    try {
      const timestamp = new Date().toISOString();
      const dbPayload = this.filterDatabaseColumns(site);
      
      // Supported languages
      const SUPPORTED_LANGUAGES = ['EN', 'HI', 'GU', 'JA', 'ES', 'FR'];
      
      let finalSiteId: number;
      let isUpdate = false;

      // Determine if this is an insert or update
      if (siteId && Number.isFinite(siteId)) {
        // UPDATE existing site
        isUpdate = true;
        const { error: siteError } = await supabase
          .from('heritage_site')
          .update({
            ...dbPayload,
            updated_at: timestamp,
          })
          .eq('site_id', siteId);

        if (siteError) {
          return { success: false, error: siteError, message: `Failed to update heritage site: ${siteError.message}` };
        }

        finalSiteId = siteId;
      } else {
        // INSERT new site
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
          return { success: false, error: siteError, message: `Failed to create heritage site: ${siteError?.message}` };
        }

        finalSiteId = siteInsert.site_id as number;
      }

      // Rollback function in case of errors
      const rollback = async () => {
        if (!isUpdate) {
          await supabase.from('heritage_site').delete().eq('site_id', finalSiteId);
        }
      };

      // Process translations - ensure all 6 languages are included
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
        postal_code?: string;
      }> = {};

      // Initialize all supported languages with empty objects
      SUPPORTED_LANGUAGES.forEach(lang => {
        translationsByLang[lang] = {};
      });

      // Process provided translations
      translations.forEach((item) => {
        const langCode = item.language_code.toUpperCase();
        
        // Only process supported languages
        if (!SUPPORTED_LANGUAGES.includes(langCode)) {
          console.warn(`Unsupported language code: ${langCode}. Skipping.`);
          return;
        }

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
          if (item.postal_code) translationsByLang[langCode].postal_code = item.postal_code.trim();
          if (item.meta_title) translationsByLang[langCode].meta_title = item.meta_title.trim();
          if (item.meta_description) translationsByLang[langCode].meta_description = item.meta_description.trim();
        }
      });

      // Create translation rows for ALL supported languages
      const translationRows = SUPPORTED_LANGUAGES.map(lang => ({
        site_id: finalSiteId,
        language_code: lang,
        name: translationsByLang[lang].name || site.name_default || '',
        short_desc: translationsByLang[lang].short_desc || null,
        full_desc: translationsByLang[lang].full_desc || null,
        meta_title: translationsByLang[lang].meta_title || null,
        meta_description: translationsByLang[lang].meta_description || null,
        address: translationsByLang[lang].address || site.location_address || null,
        city: translationsByLang[lang].city || site.city || site.location_city || null,
        state: translationsByLang[lang].state || site.state || site.location_state || null,
        country: translationsByLang[lang].country || site.country || site.location_country || 'India',
        postal_code: translationsByLang[lang].postal_code || site.location_postal_code || null,
      }));

      // Map day names to numbers for visiting hours
      const dayMap: Record<string, number> = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
        'Friday': 5, 'Saturday': 6, 'Sunday': 7
      };

      // Define all child table operations
      const childOperations: Array<{
        table: string;
        rows: any[];
      }> = [
        {
          table: 'heritage_sitemedia',
          rows: media
            .filter((item) => item.media_url)
            .map((item, index) => {
              const baseRow: any = {
                site_id: finalSiteId,
                media_type: item.media_type,
                media_url: item.media_url,
                position: item.position ?? index + 1,
                is_primary: item.is_primary ?? index === 0,
              };
              
              // Include language_code for audio files (if column exists in database)
              // This is needed to identify which language each audio guide is for
              if (item.media_type === 'audio' && item.language_code) {
                baseRow.language_code = item.language_code.toUpperCase();
              }
              
              return baseRow;
            }),
        },
        {
          table: 'heritage_sitevisitinghours',
          rows: visitingHours.map((item) => {
            const dayOfWeek = typeof item.day_of_week === 'number' 
              ? item.day_of_week 
              : dayMap[item.day_of_week] || 1;
            return {
              site_id: finalSiteId,
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
            site_id: finalSiteId,
            ticket_name: item.ticket_name || item.visitor_type || 'General Ticket',
            price: item.price ?? item.amount ?? 0,
            currency: item.currency ?? 'INR',
            description: item.description ?? item.notes ?? null,
            age_group: item.age_group ?? null,
            includes_guide: item.includes_guide ?? false,
            includes_audio_guide: item.includes_audio_guide ?? false,
            includes_vr_experience: item.includes_vr_experience ?? false,
            is_active: item.is_active ?? true,
          })),
        },
        {
          table: 'heritage_sitetransportation',
          rows: transportation.map((item) => {
            const transportType = item.transport_type 
              || (item.category === 'transport' ? item.mode || 'other' : 'other');
            const routeInfo = item.route_info 
              || (item.description ? `${item.name || ''}${item.description ? ` - ${item.description}` : ''}` : item.name || '');
            return {
              site_id: finalSiteId,
              transport_type: transportType,
              route_info: routeInfo,
              duration_minutes: item.duration_minutes ?? item.travel_time_minutes ?? null,
              cost_range: item.cost_range ?? null,
              accessibility_notes: item.accessibility_notes ?? item.notes ?? null,
              distance: item.distance_km !== undefined && item.distance_km !== null ? String(item.distance_km) : null,
              is_active: item.is_active ?? true,
            };
          }),
        },
        {
          table: 'heritage_siteattraction',
          rows: attractions
            .filter((item) => item.name && item.name.trim())
            .map((item, index) => ({
              site_id: finalSiteId,
              name: item.name.trim(),
              distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
              notes: item.notes?.trim() || null,
              position: item.position ?? index + 1,
              is_active: item.is_active ?? true,
            })),
        },
        {
          table: 'heritage_siteetiquette',
          rows: etiquettes
            .filter((item) => {
              return (item.rule_title && item.rule_title.trim()) || (item.etiquette_text && item.etiquette_text.trim());
            })
            .map((item) => ({
              site_id: finalSiteId,
              rule_title: item.rule_title?.trim() || item.etiquette_text?.trim() || '',
              rule_description: item.rule_description?.trim() || null,
              icon_name: item.icon_name?.trim() || null,
              importance_level: item.importance_level || 'normal',
              is_active: true,
            })),
        },
        {
          table: 'heritage_sitetranslation',
          rows: translationRows,
        },
      ];

      let insertedTransportIds: number[] = [];
      let insertedAttractionIds: number[] = [];

      // Delete existing child records and insert new ones (for upsert behavior)
      for (const operation of childOperations) {
        const { error: deleteError } = await supabase.from(operation.table).delete().eq('site_id', finalSiteId);
        if (deleteError) {
          await rollback();
          return { success: false, error: deleteError, message: `Failed to delete existing ${operation.table} records: ${deleteError.message}` };
        }

        if (operation.rows.length > 0) {
          // Log audio items with language_code for debugging (if this is media table)
          if (operation.table === 'heritage_sitemedia') {
            const audioItems = operation.rows.filter((row: any) => row.media_type === 'audio');
            if (audioItems.length > 0) {
              console.log('🎵 Upserting audio media with language_code:', audioItems.map((item: any) => ({
                media_type: item.media_type,
                language_code: item.language_code,
                media_url: item.media_url?.substring(0, 50) + '...'
              })));
            }
          }
          
          // For transportation, we need to get the inserted IDs to save translations
          if (operation.table === 'heritage_sitetransportation') {
            const { data: insertedTransport, error: insertError } = await supabase
              .from(operation.table)
              .insert(operation.rows)
              .select('transportation_id, transport_type');
            
            if (insertError) {
              console.error(`❌ Error inserting into ${operation.table}:`, insertError);
              await rollback();
              return { success: false, error: insertError, message: `Failed to insert ${operation.table} records: ${insertError.message}` };
            }
            
            if (insertedTransport) {
              insertedTransportIds = insertedTransport.map(t => t.transportation_id as number).filter(Boolean);
              console.log(`✅ Inserted ${insertedTransportIds.length} transportation record(s)`);
            }
          } else if (operation.table === 'heritage_siteattraction') {
            // For attractions, we need to get the inserted IDs to save translations
            const { data: insertedAttractions, error: insertError } = await supabase
              .from(operation.table)
              .insert(operation.rows)
              .select('attraction_id');
            
            if (insertError) {
              console.warn(`⚠️ Error inserting into ${operation.table} (table may not exist):`, insertError);
              // Don't fail, just log warning
            } else if (insertedAttractions) {
              insertedAttractionIds = insertedAttractions.map(a => a.attraction_id as number).filter(Boolean);
              console.log(`✅ Inserted ${insertedAttractionIds.length} attraction record(s)`);
            }
          } else {
            const { error: insertError } = await supabase.from(operation.table).insert(operation.rows);
            if (insertError) {
              console.error(`❌ Error inserting into ${operation.table}:`, insertError);
              
              // Check if error is related to language_code column not existing
              if (operation.table === 'heritage_sitemedia' && 
                  (insertError.message?.includes('language_code') || insertError.message?.includes('column') || insertError.code === '42703')) {
                console.error('⚠️ CRITICAL: language_code column does not exist in heritage_sitemedia table!');
                console.error('⚠️ Please run the migration script: dbscript/add_language_code_to_media.sql');
                await rollback();
                return { 
                  success: false, 
                  error: new Error(
                    `Database schema error: language_code column is missing from heritage_sitemedia table. ` +
                    `Please run the migration script: dbscript/add_language_code_to_media.sql. ` +
                    `Original error: ${insertError.message}`
                  ),
                  message: 'Database schema error: language_code column is missing. Please run the migration script.'
                };
              }
              
              await rollback();
              return { success: false, error: insertError, message: `Failed to insert ${operation.table} records: ${insertError.message}` };
            }
          }
        }
      }

      // Save transportation and attraction translations after transportation records are created
      if (insertedTransportIds.length > 0) {
        // Get transportation records to identify which are attractions
        const { data: transportData } = await supabase
          .from('heritage_sitetransportation')
          .select('transportation_id, transport_type')
          .in('transportation_id', insertedTransportIds);
        
        const attractionIds = (transportData || [])
          .filter(t => t.transport_type === 'attraction')
          .map(t => t.transportation_id as number);

        // Delete existing translations for these transportation records
        if (insertedTransportIds.length > 0) {
          await Promise.all([
            supabase.from('heritage_sitetransportationtranslation')
              .delete()
              .in('transportation_id', insertedTransportIds),
            attractionIds.length > 0
              ? supabase.from('heritage_siteattractiontranslation')
                  .delete()
                  .in('attraction_id', attractionIds)
              : Promise.resolve({ error: null }),
          ]);
        }

        // Save transportation translations
        if (transportationTranslations.length > 0) {
          // Map transportation array index to transportation_id
          // Note: t.transportation_id is the array index (0, 1, 2, etc.), not the database ID
          const transportTranslationRows = transportationTranslations
            .map((t) => {
              // t.transportation_id is the array index, use it to get the actual database ID
              const transportIndex = t.transportation_id as number;
              const actualTransportId = insertedTransportIds[transportIndex];
              
              if (actualTransportId === undefined || actualTransportId === null) {
                console.warn(`⚠️ No transportation_id found for transport index ${transportIndex}`);
                return null;
              }
              
              return {
                transportation_id: actualTransportId,
                language_code: t.language_code.toUpperCase(),
                name: t.name?.trim() || null,
                route_info: t.route_info?.trim() || null,
                accessibility_notes: t.accessibility_notes?.trim() || null,
              };
            })
            .filter((t): t is NonNullable<typeof t> => t !== null);

          if (transportTranslationRows.length > 0) {
            const { error: transportTranslationError } = await supabase
              .from('heritage_sitetransportationtranslation')
              .insert(transportTranslationRows);
            
            if (transportTranslationError) {
              console.warn('Error inserting transportation translations:', transportTranslationError);
            } else {
              console.log(`✅ Inserted ${transportTranslationRows.length} transportation translation(s)`);
            }
          }
        }

      }

      // Save attraction translations
      if (insertedAttractionIds.length > 0 && attractionTranslations.length > 0) {
        // Delete existing translations for these attraction records
        await supabase.from('heritage_siteattractiontranslation')
          .delete()
          .in('attraction_id', insertedAttractionIds);

        // Map attraction array index to attraction_id
        // Note: t.attraction_id is the array index (0, 1, 2, etc.), not the database ID
        const attractionTranslationRows = attractionTranslations
          .map((t) => {
            // t.attraction_id is the array index, use it to get the actual database ID
            const attractionIndex = t.attraction_id as number;
            const actualAttractionId = insertedAttractionIds[attractionIndex];
            
            if (actualAttractionId === undefined || actualAttractionId === null) {
              console.warn(`⚠️ No attraction_id found for attraction index ${attractionIndex}`);
              return null;
            }
            
            return {
              attraction_id: actualAttractionId,
              language_code: t.language_code.toUpperCase(),
              name: t.name?.trim() || null,
              notes: t.notes?.trim() || null,
            };
          })
          .filter((t): t is NonNullable<typeof t> => t !== null);

        if (attractionTranslationRows.length > 0) {
          const { error: attractionTranslationError } = await supabase
            .from('heritage_siteattractiontranslation')
            .insert(attractionTranslationRows);
          
          if (attractionTranslationError) {
            console.warn('Error inserting attraction translations:', attractionTranslationError);
          } else {
            console.log(`✅ Inserted ${attractionTranslationRows.length} attraction translation(s)`);
          }
        }
      }

      return { 
        success: true, 
        siteId: finalSiteId,
        message: isUpdate 
          ? `Heritage site updated successfully with translations for ${SUPPORTED_LANGUAGES.join(', ')}`
          : `Heritage site created successfully with translations for ${SUPPORTED_LANGUAGES.join(', ')}`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return { success: false, error, message: `Exception during upsert: ${errorMessage}` };
    }
  }
}

