// User Types
export interface User {
  user_id: number;
  full_name: string;
  email: string;
  phone?: string;
  user_type_id: number;
  user_type_name?: string;
  is_verified: boolean;
  language_code: string;
  created_at: string;
  updated_at?: string;
}

export interface UserType {
  user_type_id: number;
  type_key: string;
  type_name: string;
  description?: string;
}

// Master Data Types
export interface MasterData {
  master_id: number;
  category: string;
  code: string;
  display_name: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  metadata?: Record<string, any>;
}

export interface MasterDataTranslation {
  translation_id: number;
  master_id: number;
  language_code: string;
  display_name: string;
  description?: string;
}

export type MasterDataCategory = 
  | 'language'
  | 'site_type'
  | 'preference'
  | 'report_reason'
  | 'age_group'
  | 'travel_purpose'
  | 'relation'
  | 'accessibility'
  | 'experience'
  | 'etiquette'
  | 'ticket_type';

// Booking Types
export interface Booking {
  booking_id: number;
  booking_reference: string;
  module_type: 'hotel' | 'tour' | 'event' | 'food' | 'guide' | 'product';
  user_id: number;
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

// Dashboard Types
export interface DashboardStats {
  total_users: number;
  total_bookings: number;
  total_revenue: number;
  active_vendors: number;
  pending_bookings: number;
  completed_bookings: number;
}

export interface DashboardComparison {
  current: number;
  previous: number;
  changePercent: number;
}

export interface DashboardKpiComparisons {
  users: DashboardComparison;
  bookings: DashboardComparison;
  revenue: DashboardComparison;
}

export interface DashboardUserDetail {
  user_id: number;
  full_name: string;
  email: string;
  created_at: string;
}

// Report Types
export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  moduleType?: string;
  status?: string;
  userTypeId?: number;
}

// Heritage Site Types
export interface HeritageSiteMediaItem {
  url: string;
  type: 'image' | 'video' | 'document';
  label?: string;
  is_primary?: boolean;
  thumbnail_url?: string | null;
}

export interface HeritageSiteAmenity {
  name: string;
  icon?: string | null;
  description?: string | null;
}

export interface HeritageSiteOpeningDay {
  day: string;
  is_open: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
}

export interface HeritageSiteOpeningHours {
  schedule: HeritageSiteOpeningDay[];
  notes?: string | null;
}

export interface HeritageSiteAudioGuide {
  language: string;
  url?: string | null;
  duration_seconds?: number | null;
  file_name?: string | null;
}

export interface HeritageSiteTransportOption {
  mode: string;
  name?: string | null;
  distance_km?: number | null;
  notes?: string | null;
}

export interface HeritageSiteAttraction {
  name: string;
  distance_km?: number | null;
  notes?: string | null;
}

export interface HeritageSiteFeeBreakup {
  visitor_type: string;
  amount: number;
  notes?: string | null;
}

export type HeritageSiteTranslationMap = Record<string, string>;

export interface HeritageSite {
  site_id: number;
  name_default: string;
  short_desc_default?: string | null;
  full_desc_default?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  vr_link?: string | null;
  qr_link?: string | null;
  meta_title_def?: string | null;
  meta_description_def?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  site_type?: string | null;
  entry_fee?: number | null;
  entry_type?: 'free' | 'paid' | null;
  experience?: string | string[] | null; // Can be string (legacy) or array (new format)
  accessibility?: string | string[] | null; // Can be string (legacy) or array (new format)
  location_address?: string | null;
  location_area?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  location_country?: string | null;
  location_postal_code?: string | null;
  hero_image_url?: string | null;
  media_gallery?: HeritageSiteMediaItem[] | null;
  video_360_url?: string | null;
  ar_mode_available?: boolean | null;
  opening_hours?: HeritageSiteOpeningHours | null;
  amenities?: HeritageSiteAmenity[] | null;
  overview_translations?: HeritageSiteTranslationMap | null;
  history_translations?: HeritageSiteTranslationMap | null;
  audio_guides?: HeritageSiteAudioGuide[] | null;
  entry_fee_structure?: HeritageSiteFeeBreakup[] | null;
  booking_url?: string | null;
  booking_online_available?: boolean | null;
  site_map_url?: string | null;
  cultural_etiquettes?: string[] | null;
  transport_options?: HeritageSiteTransportOption[] | null;
  nearby_attractions?: HeritageSiteAttraction[] | null;
  photography_allowed?: string | null; // Database column: varchar - stores 'free', 'paid', or 'restricted'
  photograph_amount?: number | null; // Database column: numeric - stores amount if photography is paid
}

