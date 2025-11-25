import { supabase, API_ENDPOINTS, DB_FUNCTIONS } from '@/config/supabase';
import { MasterData, MasterDataCategory } from '@/types';

export class MasterDataService {
  /**
   * Get master data by category
   */
  static async getMasterDataByCategory(
    category: MasterDataCategory,
    languageCode: string = 'EN'
  ): Promise<MasterData[]> {
    try {
      const { data, error } = await supabase.rpc(DB_FUNCTIONS.getMasterData, {
        p_category: category,
        p_language_code: languageCode.toUpperCase(),
      });

      if (error) {
        console.error('Error fetching master data:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching master data:', error);
      return [];
    }
  }

  /**
   * Get all master data categories
   */
  static async getMasterCategories(): Promise<Array<{ category: string; count: number }>> {
    try {
      const { data, error } = await supabase.rpc(DB_FUNCTIONS.getMasterCategories);

      if (error) {
        console.error('Error fetching master categories:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Exception fetching master categories:', error);
      return [];
    }
  }

  /**
   * Create master data item
   */
  static async createMasterData(
    category: string,
    code: string,
    displayOrder: number = 0,
    metadata?: Record<string, any>,
    createdBy?: number | null
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_masterdata')
        .insert({
          category,
          code,
          display_order: displayOrder,
          metadata: metadata || {},
          is_active: true,
          created_by: createdBy || null,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Update master data item
   */
  static async updateMasterData(
    masterId: number,
    updates: {
      code?: string;
      display_order?: number;
      is_active?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const { data, error } = await supabase
        .from('heritage_masterdata')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('master_id', masterId)
        .select()
        .single();

      if (error) {
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Delete master data item
   */
  static async deleteMasterData(masterId: number): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase
        .from('heritage_masterdata')
        .delete()
        .eq('master_id', masterId);

      if (error) {
        return { success: false, error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  }

  /**
   * Create or update translation
   * Note: created_by column does not exist in heritage_masterdatatranslation table
   */
  static async upsertTranslation(
    masterId: number,
    languageCode: string,
    displayName: string,
    description?: string
  ): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      const langCodeUpper = languageCode.toUpperCase();
      
      // First, check if translation already exists
      const { data: existing, error: checkError } = await supabase
        .from('heritage_masterdatatranslation')
        .select('translation_id')
        .eq('master_id', masterId)
        .eq('language_code', langCodeUpper)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" which is OK
        console.error('Error checking existing translation:', checkError);
        return { success: false, error: checkError };
      }

      const translationData: any = {
        master_id: masterId,
        language_code: langCodeUpper,
        display_name: displayName,
        description: description || null,
      };

      let result;
      if (existing) {
        // Update existing translation
        const { data, error } = await supabase
          .from('heritage_masterdatatranslation')
          .update({
            display_name: displayName,
            description: description || null,
            updated_at: new Date().toISOString(),
          })
          .eq('translation_id', existing.translation_id)
          .select()
          .single();

        if (error) {
          console.error('Error updating translation:', {
            masterId,
            languageCode: langCodeUpper,
            displayName,
            error: error.message,
            details: error,
          });
          return { success: false, error };
        }

        result = { data, error: null };
      } else {
        // Insert new translation
        const { data, error } = await supabase
          .from('heritage_masterdatatranslation')
          .insert(translationData)
          .select()
          .single();

        if (error) {
          console.error('Error inserting translation:', {
            masterId,
            languageCode: langCodeUpper,
            displayName,
            error: error.message,
            details: error,
          });
          return { success: false, error };
        }

        result = { data, error: null };
      }

      console.log('✅ Translation upserted successfully:', {
        masterId,
        languageCode: langCodeUpper,
        translationId: result.data?.translation_id,
        action: existing ? 'updated' : 'created',
      });

      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Exception upserting translation:', error);
      return { success: false, error: error?.message || error };
    }
  }
}

