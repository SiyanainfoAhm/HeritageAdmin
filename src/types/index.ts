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
  | 'relation';

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
  experience?: string | null;
  accessibility?: string | null;
}

