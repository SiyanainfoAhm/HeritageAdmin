import { supabase } from '@/config/supabase';
import { HeritageSite } from '@/types';

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
  latitude?: number | null;
  longitude?: number | null;
  vr_link?: string | null;
  qr_link?: string | null;
  meta_title_def?: string | null;
  meta_description_def?: string | null;
  is_active?: boolean;
  site_type?: string | null;
  entry_fee?: number | null;
  entry_type?: HeritageSiteEntryType | null;
  experience?: HeritageSiteExperience | null;
  accessibility?: string | null;
}

export class HeritageSiteService {
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

  static async createHeritageSite(payload: HeritageSitePayload): Promise<{ success: boolean; data?: HeritageSite; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_site')
        .insert({
          ...payload,
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

  static async updateHeritageSite(
    siteId: number,
    payload: HeritageSitePayload
  ): Promise<{ success: boolean; data?: HeritageSite; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_site')
        .update({
          ...payload,
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

