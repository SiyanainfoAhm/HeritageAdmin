import { supabase } from '@/config/supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: any;
}

export interface DeleteResult {
  success: boolean;
  error?: any;
}

export class StorageService {
  private static readonly BUCKET_NAME = 'heritage';
  private static readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

  /**
   * Validate file size before upload
   * @param file - The file to validate
   * @returns Validation result
   */
  static validateFileSize(file: File): { valid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (this.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File "${file.name}" is ${sizeMB}MB. Maximum allowed size is ${maxMB}MB.`,
      };
    }
    return { valid: true };
  }

  /**
   * Upload a file to Supabase storage
   * @param file - The file to upload
   * @param folder - The folder path (e.g., 'sites/123')
   * @returns Upload result with public URL
   */
  static async uploadFile(file: File, folder: string = 'sites'): Promise<UploadResult> {
    try {
      // Validate file size
      const validation = this.validateFileSize(file);
      if (!validation.valid) {
        console.error(`❌ File too large: ${validation.error}`);
        return { success: false, error: validation.error };
      }

      // Generate unique filename with timestamp to avoid conflicts
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${folder}/${timestamp}_${sanitizedFileName}`;

      console.log(`📤 Uploading file to: ${filePath} (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        return { success: false, error };
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        console.error('❌ Failed to get public URL');
        return { success: false, error: 'Failed to get public URL' };
      }

      console.log(`✅ Upload successful: ${urlData.publicUrl}`);

      return {
        success: true,
        url: urlData.publicUrl,
        path: filePath,
      };
    } catch (error) {
      console.error('❌ Upload error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete a file from Supabase storage
   * @param url - The public URL of the file
   * @returns Delete result
   */
  static async deleteFile(url: string): Promise<DeleteResult> {
    try {
      // Extract file path from URL
      const filePath = this.extractPathFromUrl(url);
      
      if (!filePath) {
        console.warn('⚠️ Could not extract file path from URL:', url);
        return { success: false, error: 'Invalid URL' };
      }

      console.log(`🗑️ Deleting file: ${filePath}`);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete failed:', error);
        return { success: false, error };
      }

      console.log(`✅ File deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete error:', error);
      return { success: false, error };
    }
  }

  /**
   * Delete multiple files from Supabase storage
   * @param urls - Array of public URLs
   * @returns Delete result
   */
  static async deleteFiles(urls: string[]): Promise<DeleteResult> {
    try {
      const paths = urls
        .map((url) => this.extractPathFromUrl(url))
        .filter((path): path is string => path !== null);

      if (paths.length === 0) {
        return { success: true };
      }

      console.log(`🗑️ Deleting ${paths.length} files`);

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(paths);

      if (error) {
        console.error('❌ Bulk delete failed:', error);
        return { success: false, error };
      }

      console.log(`✅ ${paths.length} files deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Bulk delete error:', error);
      return { success: false, error };
    }
  }

  /**
   * Extract file path from Supabase storage public URL
   * @param url - The public URL
   * @returns The file path or null
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
      const bucketPrefix = `/storage/v1/object/public/${this.BUCKET_NAME}/`;
      const index = url.indexOf(bucketPrefix);
      
      if (index === -1) {
        return null;
      }

      return url.substring(index + bucketPrefix.length);
    } catch (error) {
      console.error('Error extracting path from URL:', error);
      return null;
    }
  }

  /**
   * Upload multiple files with progress tracking
   * @param files - Array of files to upload
   * @param folder - The folder path
   * @param onProgress - Progress callback (current, total)
   * @returns Array of upload results
   */
  static async uploadFiles(
    files: File[],
    folder: string = 'sites',
    onProgress?: (current: number, total: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await this.uploadFile(file, folder);
      results.push(result);

      if (onProgress) {
        onProgress(i + 1, files.length);
      }
    }

    return results;
  }

  /**
   * Delete a media item from database and storage
   * @param mediaId - The media_id from heritage_sitemedia table
   * @param storageUrl - The storage URL to delete from storage
   * @returns Delete result
   */
  static async deleteMediaItem(mediaId: number, storageUrl: string): Promise<DeleteResult> {
    try {
      console.log(`🗑️ Deleting media item ${mediaId} from database and storage`);

      // Delete from storage first
      const storageResult = await this.deleteFile(storageUrl);
      if (!storageResult.success) {
        console.warn('⚠️ Storage deletion failed, continuing with database deletion');
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('heritage_sitemedia')
        .delete()
        .eq('media_id', mediaId);

      if (dbError) {
        console.error('❌ Database deletion failed:', dbError);
        return { success: false, error: dbError };
      }

      console.log(`✅ Media item deleted successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Delete media item error:', error);
      return { success: false, error };
    }
  }

  /**
   * Add a new media item to the database
   * @param siteId - The heritage site ID
   * @param mediaType - Type of media
   * @param storageUrl - Storage URL
   * @param position - Position/order
   * @param isPrimary - Is primary media
   * @returns The created media_id or null
   */
  static async addMediaItem(
    siteId: number,
    mediaType: 'image' | 'audio' | 'video' | 'document',
    storageUrl: string,
    position: number,
    isPrimary: boolean = false
  ): Promise<{ success: boolean; mediaId?: number; error?: any }> {
    try {
      // First verify the site exists
      console.log(`🔍 Verifying site ${siteId} exists...`);
      const { data: siteData, error: siteError } = await supabase
        .from('heritage_site')
        .select('site_id')
        .eq('site_id', siteId)
        .single();

      if (siteError || !siteData) {
        console.error('❌ Site not found:', siteError);
        return { 
          success: false, 
          error: `Site with ID ${siteId} not found in database. Please save the site first before uploading media.` 
        };
      }

      console.log(`✅ Site ${siteId} exists, proceeding with media insert`);
      
      console.log(`➕ Adding media item to database for site ${siteId}`, {
        table: 'heritage_sitemedia',
        data: {
          site_id: siteId,
          media_type: mediaType,
          media_url: storageUrl,
          position,
          is_primary: isPrimary,
        }
      });

      const { data, error } = await supabase
        .from('heritage_sitemedia')
        .insert({
          site_id: siteId,
          media_type: mediaType,
          media_url: storageUrl,
          position,
          is_primary: isPrimary,
        })
        .select('media_id')
        .single();

      if (error) {
        console.error('❌ Database insert failed:', {
          error,
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { success: false, error };
      }

      if (!data || !data.media_id) {
        console.error('❌ No data returned from insert');
        return { success: false, error: 'No data returned from insert' };
      }

      console.log(`✅ Media item added with ID: ${data.media_id}`);
      return { success: true, mediaId: data.media_id };
    } catch (error) {
      console.error('❌ Add media item exception:', error);
      return { success: false, error };
    }
  }

  /**
   * Update the position/order of media items
   * @param updates - Array of {mediaId, position} objects
   * @returns Update result
   */
  static async updateMediaPositions(
    updates: Array<{ mediaId: number; position: number }>
  ): Promise<DeleteResult> {
    try {
      console.log(`🔄 Updating positions for ${updates.length} media items`);

      // Update each media item's position
      const promises = updates.map(({ mediaId, position }) =>
        supabase
          .from('heritage_sitemedia')
          .update({ position })
          .eq('media_id', mediaId)
      );

      const results = await Promise.all(promises);
      const failed = results.filter((r) => r.error);

      if (failed.length > 0) {
        console.error('❌ Some position updates failed:', failed);
        return { success: false, error: failed[0].error };
      }

      console.log(`✅ Positions updated successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Update positions error:', error);
      return { success: false, error };
    }
  }

  /**
   * Update primary status of media items
   * @param siteId - The site ID
   * @param mediaId - The media ID to set as primary
   * @returns Update result
   */
  static async updatePrimaryMedia(siteId: number, mediaId: number): Promise<DeleteResult> {
    try {
      console.log(`🔄 Setting media ${mediaId} as primary for site ${siteId}`);

      // First, unset all other media items as primary
      await supabase
        .from('heritage_sitemedia')
        .update({ is_primary: false })
        .eq('site_id', siteId);

      // Then set the target media as primary
      const { error } = await supabase
        .from('heritage_sitemedia')
        .update({ is_primary: true })
        .eq('media_id', mediaId);

      if (error) {
        console.error('❌ Primary update failed:', error);
        return { success: false, error };
      }

      console.log(`✅ Primary media updated successfully`);
      return { success: true };
    } catch (error) {
      console.error('❌ Update primary error:', error);
      return { success: false, error };
    }
  }
}

