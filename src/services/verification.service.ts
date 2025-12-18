import { supabase } from '@/config/supabase';
import { NotificationTemplateService } from './notificationTemplate.service';

export interface VerificationRecord {
  id: number;
  name: string;
  subtitle: string;
  entityType: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  location: string;
  submittedOn: string;
  rawData?: any;
}

export interface VerificationFilters {
  entityType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// Map database status values to UI status
const mapStatus = (status: string | boolean | null | undefined): 'Pending' | 'Approved' | 'Rejected' => {
  if (typeof status === 'boolean') {
    return status ? 'Approved' : 'Pending';
  }
  const statusStr = (status || '').toLowerCase();
  if (statusStr === 'approved' || statusStr === 'active' || statusStr === 'published') return 'Approved';
  if (statusStr === 'rejected' || statusStr === 'cancelled' || statusStr === 'archived') return 'Rejected';
  return 'Pending';
};

export class VerificationService {
  /**
   * Fetch all verification records from multiple entity tables
   */
  static async getVerificationRecords(filters?: VerificationFilters): Promise<VerificationRecord[]> {
    const records: VerificationRecord[] = [];

    try {
      // Fetch Local Guides (user_type_id = 11)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Local Guide') {
        const { data: guides } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 11)
          .order('created_at', { ascending: false });

        if (guides) {
          for (const guide of guides) {
            records.push({
              id: guide.user_id,
              name: guide.full_name || 'Unnamed Guide',
              subtitle: 'Local Guide',
              entityType: 'Local Guide',
              status: mapStatus(guide.user_type_verified),
              location: 'India',
              submittedOn: guide.created_at?.split('T')[0] || '',
              rawData: guide,
            });
          }
        }
      }

      // Fetch Hotels (user_type_id = 7)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Hotel') {
        const { data: hotels } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 7)
          .order('created_at', { ascending: false });

        if (hotels) {
          for (const hotel of hotels) {
            records.push({
              id: hotel.user_id,
              name: hotel.full_name || 'Unnamed Hotel',
              subtitle: 'Hotel',
              entityType: 'Hotel',
              status: mapStatus(hotel.user_type_verified),
              location: 'India',
              submittedOn: hotel.created_at?.split('T')[0] || '',
              rawData: hotel,
            });
          }
        }
      }

      // Fetch Event Operators (user_type_id = 13)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Event Operator') {
        const { data: events } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 13)
          .order('created_at', { ascending: false });

        if (events) {
          for (const event of events) {
            records.push({
              id: event.user_id,
              name: event.full_name || 'Unnamed Event Operator',
              subtitle: 'Event Operator',
              entityType: 'Event Operator',
              status: mapStatus(event.user_type_verified),
              location: 'India',
              submittedOn: event.created_at?.split('T')[0] || '',
              rawData: event,
            });
          }
        }
      }

      // Fetch Tour Operators (user_type_id = 10)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Tour Operator') {
        const { data: tours } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 10)
          .order('created_at', { ascending: false });

        if (tours) {
          for (const tour of tours) {
            records.push({
              id: tour.user_id,
              name: tour.full_name || 'Unnamed Tour Operator',
              subtitle: 'Tour Operator',
              entityType: 'Tour Operator',
              status: mapStatus(tour.user_type_verified),
              location: 'India',
              submittedOn: tour.created_at?.split('T')[0] || '',
              rawData: tour,
            });
          }
        }
      }

      // Fetch Food Vendors (user_type_id = 6)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Food Vendor') {
        const { data: vendors } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 6)
          .order('created_at', { ascending: false });

        if (vendors) {
          for (const vendor of vendors) {
            records.push({
              id: vendor.user_id,
              name: vendor.full_name || 'Unnamed Food Vendor',
              subtitle: 'Food Vendor',
              entityType: 'Food Vendor',
              status: mapStatus(vendor.user_type_verified),
              location: 'India',
              submittedOn: vendor.created_at?.split('T')[0] || '',
              rawData: vendor,
            });
          }
        }
      }

      // Fetch Artisans (user_type_id = 9)
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Artisan') {
        const { data: artisans } = await supabase
          .from('heritage_user')
          .select('user_id, full_name, user_type_verified, created_at')
          .eq('user_type_id', 9)
          .order('created_at', { ascending: false });

        if (artisans) {
          for (const artisan of artisans) {
            records.push({
              id: artisan.user_id,
              name: artisan.full_name || 'Unnamed Artisan',
              subtitle: 'Artisan',
              entityType: 'Artisan',
              status: mapStatus(artisan.user_type_verified),
              location: 'India',
              submittedOn: artisan.created_at?.split('T')[0] || '',
              rawData: artisan,
            });
          }
        }
      }

      // Apply filters
      let filtered = records;

      if (filters?.status && filters.status !== 'All') {
        filtered = filtered.filter((r) => r.status === filters.status);
      }

      if (filters?.search && filters.search.trim()) {
        const searchLower = filters.search.toLowerCase().trim();
        filtered = filtered.filter(
          (r) =>
            r.name.toLowerCase().includes(searchLower) ||
            r.subtitle.toLowerCase().includes(searchLower) ||
            r.entityType.toLowerCase().includes(searchLower)
        );
      }

      if (filters?.dateFrom && filters.dateFrom.trim()) {
        filtered = filtered.filter((r) => r.submittedOn && r.submittedOn >= filters.dateFrom!);
      }

      if (filters?.dateTo && filters.dateTo.trim()) {
        filtered = filtered.filter((r) => r.submittedOn && r.submittedOn <= filters.dateTo!);
      }

      // Sort by submitted date descending
      filtered.sort((a, b) => b.submittedOn.localeCompare(a.submittedOn));

      return filtered;
    } catch (error) {
      console.error('Error fetching verification records:', error);
      return [];
    }
  }

  /**
   * Approve an entity
   */
  static async approveEntity(entityType: string, id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user details before updating (for email notification)
      const { data: userData } = await supabase
        .from('heritage_user')
        .select('user_id, full_name, email')
        .eq('user_id', id)
        .single();

      const tableMap: Record<string, { table: string; idField: string; statusField: string; approveValue: any }> = {
        'Local Guide': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        Hotel: { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        'Event Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        'Tour Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        'Food Vendor': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        Artisan: { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
      };

      const config = tableMap[entityType];
      if (!config) {
        return { success: false, error: `Unknown entity type: ${entityType}` };
      }

      const { error } = await supabase
        .from(config.table)
        .update({ 
          [config.statusField]: config.approveValue,
          verified_on: new Date().toISOString()
        })
        .eq(config.idField, id);

      if (error) throw error;

      // For Artisan, also update is_verified in heritage_artisan table
      if (entityType === 'Artisan') {
        await supabase
          .from('heritage_artisan')
          .update({ is_verified: true })
          .eq('user_id', id);
      }

      // For Local Guide, also update verification_status in heritage_local_guide_profile
      if (entityType === 'Local Guide') {
        await supabase
          .from('heritage_local_guide_profile')
          .update({ verification_status: 'verified' })
          .eq('user_id', id);
      }

      // For vendor business types (Hotel, Event Operator, Tour Operator, Food Vendor)
      // Update is_verified and verification_date in heritage_vendorbusinessdetails
      const vendorEntityTypes = ['Hotel', 'Event Operator', 'Tour Operator', 'Food Vendor'];
      if (vendorEntityTypes.includes(entityType)) {
        const currentTimestamp = new Date().toISOString();
        const { error: vendorError } = await supabase
          .from('heritage_vendorbusinessdetails')
          .update({ 
            is_verified: true,
            verification_date: currentTimestamp
          })
          .eq('user_id', id);
        
        if (vendorError) {
          console.error('Error updating vendor business verification:', vendorError);
          // Don't fail the entire approval if vendor update fails, but log it
        }
      }

      // Prepare notification variables
      const verificationDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const notificationVariables = {
        userName: userData?.full_name || 'User',
        entityType: entityType,
        verificationDate: verificationDate,
      };

      // Send email notification for approval
      if (userData?.email) {
        try {
          console.log(`📧 Attempting to send approval email to: ${userData.email}`);
          const emailResult = await NotificationTemplateService.sendEmailNotification(
            id,
            'verification_approved',
            userData.email,
            notificationVariables
          );

          if (emailResult.success) {
            console.log(`✅ Email notification logged successfully for: ${userData.email}`);
          } else {
            console.error(`❌ Email notification failed: ${emailResult.error}`);
          }
        } catch (emailError: any) {
          console.error('❌ Error sending approval email notification:', emailError);
          console.error('Error details:', emailError.message || emailError);
          // Don't fail the approval if email fails, but log it
        }
      } else {
        console.warn(`⚠️  No email found for user ID ${id}. Email notification skipped.`);
      }

      // Send push notification for approval
      try {
        const deviceTokens = await this.getUserDeviceTokens(id);
        if (deviceTokens && deviceTokens.length > 0) {
          console.log(`📱 Attempting to send approval push notification to ${deviceTokens.length} device(s) for user ID: ${id}`);
          
          // Send push notification to all device tokens
          const pushPromises = deviceTokens.map(async (deviceToken) => {
            try {
              const pushResult = await NotificationTemplateService.sendPushNotification(
                id,
                'verification_approved',
                deviceToken,
                notificationVariables
              );

              if (pushResult.success) {
                console.log(`✅ Push notification sent successfully to device: ${deviceToken.substring(0, 20)}...`);
              } else {
                console.error(`❌ Push notification failed for device ${deviceToken.substring(0, 20)}...: ${pushResult.error}`);
              }
            } catch (pushError: any) {
              console.error(`❌ Error sending push notification to device ${deviceToken.substring(0, 20)}...:`, pushError);
            }
          });

          await Promise.allSettled(pushPromises);
        } else {
          console.log(`ℹ️  No device tokens found for user ID ${id}. Push notification skipped.`);
        }
      } catch (pushError: any) {
        console.error('❌ Error sending approval push notification:', pushError);
        // Don't fail the approval if push notification fails, but log it
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to approve entity' };
    }
  }

  /**
   * Reject an entity
   */
  static async rejectEntity(entityType: string, id: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user details before updating (for email notification)
      const { data: userData } = await supabase
        .from('heritage_user')
        .select('user_id, full_name, email')
        .eq('user_id', id)
        .single();

      const tableMap: Record<string, { table: string; idField: string; statusField: string; rejectValue: any }> = {
        'Local Guide': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        Hotel: { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        'Event Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        'Tour Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        'Food Vendor': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        Artisan: { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
      };

      const config = tableMap[entityType];
      if (!config) {
        return { success: false, error: `Unknown entity type: ${entityType}` };
      }

      const { error } = await supabase
        .from(config.table)
        .update({ [config.statusField]: config.rejectValue })
        .eq(config.idField, id);

      if (error) throw error;

      // For Artisan, also update is_verified in heritage_artisan table
      if (entityType === 'Artisan') {
        await supabase
          .from('heritage_artisan')
          .update({ is_verified: false })
          .eq('user_id', id);
      }

      // For Local Guide, also update verification_status in heritage_local_guide_profile
      if (entityType === 'Local Guide') {
        await supabase
          .from('heritage_local_guide_profile')
          .update({ verification_status: 'pending' })
          .eq('user_id', id);
      }

      // Prepare notification variables
      const rejectionDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      const notificationVariables = {
        userName: userData?.full_name || 'User',
        entityType: entityType,
        rejectionDate: rejectionDate,
      };

      // Send email notification for rejection
      if (userData?.email) {
        try {
          console.log(`📧 Attempting to send rejection email to: ${userData.email}`);
          await NotificationTemplateService.sendEmailNotification(
            id,
            'verification_rejected',
            userData.email,
            notificationVariables
          );
        } catch (emailError) {
          console.error('Error sending rejection email notification:', emailError);
          // Don't fail the rejection if email fails, but log it
        }
      }

      // Send push notification for rejection
      try {
        const deviceTokens = await this.getUserDeviceTokens(id);
        if (deviceTokens && deviceTokens.length > 0) {
          console.log(`📱 Attempting to send rejection push notification to ${deviceTokens.length} device(s) for user ID: ${id}`);
          
          // Send push notification to all device tokens
          const pushPromises = deviceTokens.map(async (deviceToken) => {
            try {
              const pushResult = await NotificationTemplateService.sendPushNotification(
                id,
                'verification_rejected',
                deviceToken,
                notificationVariables
              );

              if (pushResult.success) {
                console.log(`✅ Push notification sent successfully to device: ${deviceToken.substring(0, 20)}...`);
              } else {
                console.error(`❌ Push notification failed for device ${deviceToken.substring(0, 20)}...: ${pushResult.error}`);
              }
            } catch (pushError: any) {
              console.error(`❌ Error sending push notification to device ${deviceToken.substring(0, 20)}...:`, pushError);
            }
          });

          await Promise.allSettled(pushPromises);
        } else {
          console.log(`ℹ️  No device tokens found for user ID ${id}. Push notification skipped.`);
        }
      } catch (pushError: any) {
        console.error('❌ Error sending rejection push notification:', pushError);
        // Don't fail the rejection if push notification fails, but log it
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reject entity' };
    }
  }

  /**
   * Get user details with business info and documents
   */
  static async getUserDetails(userId: number, entityType: string): Promise<{
    user: any;
    businessDetails: any;
    documents: any[];
  } | null> {
    try {
      // Fetch user basic info
      const { data: user } = await supabase
        .from('heritage_user')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!user) return null;

      let businessDetails = null;
      const documents: any[] = [];

      // Entity types that use vendor business details
      const vendorBusinessEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];

      // All vendor business detail fields we care about in the admin UI
      const vendorBusinessFields = [
        'business_name',
        'business_type',
        'gstin',
        'business_phone',
        'business_email',
        'business_address',
        'city',
        'state',
        'pincode',
        'business_description',
        'license_number',
        'license_expiry',
        'website',
        'instagram_handle',
        'facebook_page',
        'twitter_handle',
        'linkedin_profile',
        'youtube_channel',
        'show_contact_info',
        'verification_date',
        'verification_notes',
        'latitude',
        'longitude',
      ];

      // Fetch vendor business details if applicable (with translations)
      if (vendorBusinessEntityTypes.includes(entityType)) {
        try {
          const { data: vendorData, error: vendorError } = await supabase.rpc(
            'heritage_get_vendor_business_details',
            {
              p_user_id: userId,
              p_language_code: 'en',
              p_include_all_translations: true
            }
          );

          if (!vendorError && vendorData && vendorData.success) {
            // Extract the business details from the JSONB response
            const vendorDetails: any = { ...vendorData };
            delete vendorDetails.success;
            delete vendorDetails.error;

            // Ensure all important vendor fields exist as keys (even if null) so UI can render blank inputs
            vendorBusinessFields.forEach((field) => {
              if (!(field in vendorDetails)) {
                vendorDetails[field] = null;
              }
            });
            
            // Merge translations if available
            if (vendorDetails.translations) {
              vendorDetails._translations = vendorDetails.translations;
              delete vendorDetails.translations;
            }
            
            businessDetails = vendorDetails;
          }
        } catch (vendorErr) {
          console.warn('Error fetching vendor business details:', vendorErr);
        }
      }

      // Fetch business details based on entity type (fallback or additional data)
      const businessTableMap: Record<string, string> = {
        'Local Guide': 'heritage_local_guide_profile',
        'Event Operator': 'heritage_eventorganizer_business_details',
        'Tour Operator': 'heritage_tour_operator_businessdetails',
        'Food Vendor': 'heritage_foodvendorbusinessdetails',
        Hotel: 'heritage_hotelownerbusinessdetails',
      };

      // Also try alternate table names
      const altBusinessTableMap: Record<string, string> = {
        'Tour Operator': 'heritage_touroperator_businessdetails',
      };

      const businessTable = businessTableMap[entityType];
      if (businessTable && !vendorBusinessEntityTypes.includes(entityType) && entityType !== 'Artisan') {
        // Only fetch from old tables if not using vendor business details
        const { data: business, error: bizError } = await supabase
          .from(businessTable)
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (business) {
          businessDetails = business;
        } else if (bizError && altBusinessTableMap[entityType]) {
          // Try alternate table name
          const { data: altBusiness } = await supabase
            .from(altBusinessTableMap[entityType])
            .select('*')
            .eq('user_id', userId)
            .single();
          businessDetails = altBusiness;
        }
      } else if (businessTable && vendorBusinessEntityTypes.includes(entityType) && !businessDetails) {
        // If vendor business details not found, try old table as fallback
        const { data: business, error: bizError } = await supabase
          .from(businessTable)
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (business) {
          businessDetails = business;
        } else if (bizError && altBusinessTableMap[entityType]) {
          const { data: altBusiness } = await supabase
            .from(altBusinessTableMap[entityType])
            .select('*')
            .eq('user_id', userId)
            .single();
          businessDetails = altBusiness;
        }
      }

      // For Local Guide, load profile translations from heritage_local_guide_profile_translations
      if (entityType === 'Local Guide' && businessDetails && businessDetails.profile_id) {
        try {
          const { data: guideTranslations, error: guideTransError } = await supabase
            .from('heritage_local_guide_profile_translations')
            .select('*')
            .eq('profile_id', businessDetails.profile_id);

          if (!guideTransError && Array.isArray(guideTranslations) && guideTranslations.length > 0) {
            // Attach raw translations; UI will map per-field by language_code
            (businessDetails as any)._translations = guideTranslations;
          }
        } catch (guideTransErr) {
          console.warn('Error fetching local guide translations:', guideTransErr);
        }
      }

      // For Artisan, fetch from heritage_artisan table + vendor business/location & translations
      if (entityType === 'Artisan') {
        const { data: artisanData } = await supabase
          .from('heritage_artisan')
          .select('*')
          .eq('user_id', userId)
          .single();

          if (artisanData) {
          // Start with artisan core fields
          const combinedDetails: any = { ...artisanData };

          // Try to fetch vendor business/location details (city, state, address, lat/long) with translations
          let vendorTranslations: any[] = [];
          try {
            const { data: vendorData, error: vendorError } = await supabase.rpc(
              'heritage_get_vendor_business_details',
              {
                p_user_id: userId,
                p_language_code: 'en',
                p_include_all_translations: true,
              }
            );

            if (!vendorError && vendorData && (vendorData as any).success) {
              const vendorDetails: any = { ...(vendorData as any) };
              delete vendorDetails.success;
              delete vendorDetails.error;

              // Ensure all location-related vendor fields exist so UI shows editable blanks
              const locationFields = ['business_address', 'city', 'state', 'pincode', 'latitude', 'longitude'];
              locationFields.forEach((field) => {
                if (!(field in vendorDetails)) {
                  vendorDetails[field] = null;
                }
              });

              // Attach vendor location fields onto artisan details
              locationFields.forEach((field) => {
                if (vendorDetails[field] !== undefined) {
                  combinedDetails[field] = vendorDetails[field];
                }
              });

              if (Array.isArray(vendorDetails.translations)) {
                vendorTranslations = vendorDetails.translations;
              }
            }
          } catch (vendorErr) {
            console.warn('Error fetching vendor business/location details for artisan:', vendorErr);
          }

          // Fetch artisan-specific translations
          let artisanTranslations: any[] = [];
          try {
            if (artisanData.artisan_id) {
              const { data: artisanTransData } = await supabase
                .from('heritage_artisantranslation')
                .select('*')
                .eq('artisan_id', artisanData.artisan_id);

              artisanTranslations = artisanTransData || [];
            }
          } catch (artisanTransErr) {
            console.warn('Error fetching artisan translations:', artisanTransErr);
          }

          // Merge artisan + vendor translations into a single _translations array grouped by language_code
          const translationsByLang: Record<string, any> = {};
          const mergeRows = (rows: any[]) => {
            rows.forEach((row) => {
              if (!row) return;
              const langCodeRaw = row.language_code || row.lang || row.lang_code;
              if (!langCodeRaw) return;
              const langCode = String(langCodeRaw).toLowerCase();
              if (!translationsByLang[langCode]) {
                translationsByLang[langCode] = { language_code: langCode };
              }

              Object.keys(row).forEach((key) => {
                if (['language_code', 'lang', 'lang_code', 'artisan_id', 'business_id', 'id', 'created_at', 'updated_at'].includes(key)) {
                  return;
                }
                if (row[key] !== null && row[key] !== undefined && row[key] !== '') {
                  translationsByLang[langCode][key] = row[key];
                }
              });
            });
          };

          mergeRows(vendorTranslations);
          mergeRows(artisanTranslations);

          if (Object.keys(translationsByLang).length > 0) {
            combinedDetails._translations = Object.values(translationsByLang);
          }

          businessDetails = combinedDetails;
        }
      }

      // Fetch documents
      const { data: docs } = await supabase
        .from('heritage_user_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      return {
        user,
        businessDetails,
        documents: docs || [],
      };
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  /**
   * Update business details for an entity
   */
  static async updateBusinessDetails(
    entityType: string,
    userId: number,
    data: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Entity types that use vendor business details
      const vendorBusinessEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];

      // Handle vendor business details updates
      if (vendorBusinessEntityTypes.includes(entityType)) {
        // Remove fields that shouldn't be updated, but keep verification_date to handle separately
        const {
          id,
          user_id,
          created_at,
          updated_at,
          profile_id,
          artisan_id,
          business_id,
          is_verified,
          verification_notes,
          _translations,
          ...updateData
        } = data;
        
        // Extract verification_date separately as it needs special handling
        const verificationDate = data.verification_date;

        // Check if vendor business details exist
        const { data: checkResult, error: checkError } = await supabase.rpc(
          'heritage_check_vendor_business_details_exists',
          { p_user_id: userId }
        );

        if (checkError) {
          console.warn('Error checking vendor business details:', checkError);
        }

        // If vendor business details exist, update using the upsert function
        if (checkResult && checkResult.exists) {
          // Handle license_expiry - convert date string to date if needed
          let licenseExpiry = updateData.license_expiry || null;
          if (licenseExpiry && typeof licenseExpiry === 'string') {
            // If it's a date string (YYYY-MM-DD), keep it as is (DATE type)
            if (licenseExpiry.match(/^\d{4}-\d{2}-\d{2}$/)) {
              // Keep as date string for DATE type
              licenseExpiry = licenseExpiry;
            } else if (licenseExpiry.includes('T')) {
              // If it's a timestamp, extract date part
              licenseExpiry = licenseExpiry.split('T')[0];
            }
          }
          
          const { data: updateResult, error: updateError } = await supabase.rpc(
            'heritage_upsert_vendor_business_details',
            {
              p_user_id: userId,
              p_business_name: updateData.business_name || null,
              p_business_type: updateData.business_type || 'Vendor/Business',
              p_gstin: updateData.gstin || null,
              p_business_phone: updateData.business_phone || null,
              p_business_email: updateData.business_email || null,
              p_business_address: updateData.business_address || null,
              p_city: updateData.city || null,
              p_state: updateData.state || null,
              p_pincode: updateData.pincode || null,
              p_business_description: updateData.business_description || null,
              p_license_number: updateData.license_number || null,
              p_license_expiry: licenseExpiry,
              p_website: updateData.website || null,
              p_instagram_handle: updateData.instagram_handle || null,
              p_facebook_page: updateData.facebook_page || null,
              p_twitter_handle: updateData.twitter_handle || null,
              p_linkedin_profile: updateData.linkedin_profile || null,
              p_youtube_channel: updateData.youtube_channel || null,
              p_show_contact_info: updateData.show_contact_info !== undefined ? updateData.show_contact_info : true,
            }
          );
          
          if (updateError) throw updateError;
          if (updateResult && !updateResult.success) {
            return { success: false, error: updateResult.error || 'Failed to update vendor business details' };
          }
          
          // Update verification_date separately if it exists (not in the upsert function parameters)
          if (verificationDate !== undefined) {
            try {
              // Convert date string to timestamp if needed
              let dateValue: string | null = null;
              if (verificationDate) {
                if (typeof verificationDate === 'string') {
                  // If it's already an ISO timestamp, use it
                  if (verificationDate.includes('T') || verificationDate.includes('Z')) {
                    dateValue = verificationDate;
                  } else if (verificationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    // If it's a date string, convert to ISO timestamp
                    const date = new Date(verificationDate);
                    date.setHours(0, 0, 0, 0);
                    dateValue = date.toISOString();
                  } else {
                    dateValue = verificationDate;
                  }
                } else if (verificationDate instanceof Date) {
                  dateValue = verificationDate.toISOString();
                }
              }
              
              await supabase
                .from('heritage_vendorbusinessdetails')
                .update({ verification_date: dateValue })
                .eq('user_id', userId);
            } catch (err) {
              console.error('Error updating verification_date:', err);
            }
          }
        } else {
          // If vendor business details don't exist, try to create them
          // Fetch user name for default business name
          let defaultBusinessName = 'Business';
          try {
            const { data: userData } = await supabase
              .from('heritage_user')
              .select('full_name')
              .eq('user_id', userId)
              .single();
            if (userData?.full_name) {
              defaultBusinessName = userData.full_name;
            }
          } catch (err) {
            // Ignore error, use default
          }

          // Handle license_expiry for create path
          let licenseExpiry = updateData.license_expiry || null;
          if (licenseExpiry && typeof licenseExpiry === 'string') {
            if (licenseExpiry.match(/^\d{4}-\d{2}-\d{2}$/)) {
              licenseExpiry = licenseExpiry;
            } else if (licenseExpiry.includes('T')) {
              licenseExpiry = licenseExpiry.split('T')[0];
            }
          }
          
          const { data: createResult, error: createError } = await supabase.rpc(
            'heritage_upsert_vendor_business_details',
            {
              p_user_id: userId,
              p_business_name: updateData.business_name || defaultBusinessName,
              p_business_type: updateData.business_type || 'Vendor/Business',
              p_gstin: updateData.gstin || null,
              p_business_phone: updateData.business_phone || null,
              p_business_email: updateData.business_email || null,
              p_business_address: updateData.business_address || null,
              p_city: updateData.city || null,
              p_state: updateData.state || null,
              p_pincode: updateData.pincode || null,
              p_business_description: updateData.business_description || null,
              p_license_number: updateData.license_number || null,
              p_license_expiry: licenseExpiry,
              p_website: updateData.website || null,
              p_instagram_handle: updateData.instagram_handle || null,
              p_facebook_page: updateData.facebook_page || null,
              p_twitter_handle: updateData.twitter_handle || null,
              p_linkedin_profile: updateData.linkedin_profile || null,
              p_youtube_channel: updateData.youtube_channel || null,
              p_show_contact_info: updateData.show_contact_info !== undefined ? updateData.show_contact_info : true,
            }
          );

          if (createError) throw createError;
          if (createResult && !createResult.success) {
            return { success: false, error: createResult.error || 'Failed to create vendor business details' };
          }
          
          // Update verification_date separately if it exists (for create path too)
          if (verificationDate !== undefined) {
            try {
              let dateValue: string | null = null;
              if (verificationDate) {
                if (typeof verificationDate === 'string') {
                  if (verificationDate.includes('T') || verificationDate.includes('Z')) {
                    dateValue = verificationDate;
                  } else if (verificationDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    const date = new Date(verificationDate);
                    date.setHours(0, 0, 0, 0);
                    dateValue = date.toISOString();
                  } else {
                    dateValue = verificationDate;
                  }
                } else if (verificationDate instanceof Date) {
                  dateValue = verificationDate.toISOString();
                }
              }
              
              await supabase
                .from('heritage_vendorbusinessdetails')
                .update({ verification_date: dateValue })
                .eq('user_id', userId);
            } catch (err) {
              console.error('Error updating verification_date:', err);
            }
          }
        }

        return { success: true };
      }

      // Handle other entity types (Local Guide, Artisan, etc.)
      const tableMap: Record<string, string> = {
        'Local Guide': 'heritage_local_guide_profile',
        'Event Operator': 'heritage_eventorganizer_business_details',
        'Tour Operator': 'heritage_tour_operator_businessdetails',
        'Food Vendor': 'heritage_foodvendorbusinessdetails',
        Hotel: 'heritage_hotelownerbusinessdetails',
        Artisan: 'heritage_artisan',
      };

      const table = tableMap[entityType];
      if (!table) {
        return { success: false, error: 'Unknown entity type' };
      }

      // Artisan has vendor-style fields merged in memory; only persist actual artisan columns
      if (entityType === 'Artisan') {
        const {
          id,
          user_id,
          created_at,
          updated_at,
          profile_id,
          artisan_id,
          _translations,
          business_address,
          city,
          state,
          pincode,
          latitude,
          longitude,
          business_name,
          business_email,
          business_phone,
          business_description,
          license_number,
          license_expiry,
          website,
          instagram_handle,
          facebook_page,
          twitter_handle,
          linkedin_profile,
          youtube_channel,
          show_contact_info,
          verification_date,
          verification_notes,
          ...rest
        } = data;

        // Whitelist known artisan columns to avoid referencing non-existent columns
        const allowedFields = [
          'artisan_name',
          'short_bio',
          'full_bio',
          'craft_title',
          'craft_specialty',
          'experience_years',
          'generation_number',
          'verified_by',
          'intro_video_url',
          'is_active',
        ];

        const artisanUpdateData: Record<string, any> = {};
        allowedFields.forEach((field) => {
          if (rest[field] !== undefined) {
            artisanUpdateData[field] = rest[field];
          }
        });

        const { error } = await supabase
          .from(table)
          .update(artisanUpdateData)
          .eq('user_id', userId);

        if (error) throw error;
        return { success: true };
      }

      // Other non-vendor entities: strip system/virtual fields like _translations
      const { id, user_id, created_at, updated_at, profile_id, artisan_id, _translations, ...updateData } = data;

      const { error } = await supabase
        .from(table)
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating business details:', error);
      return { success: false, error: error.message || 'Failed to update' };
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('heritage_user_documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message || 'Failed to delete document' };
    }
  }

  /**
   * Get user device tokens for push notifications
   * Fetches active FCM tokens from heritage_user_fcm_tokens table
   */
  static async getUserDeviceTokens(userId: number): Promise<string[]> {
    try {
      const deviceTokens: string[] = [];

      // Fetch active FCM tokens from heritage_user_fcm_tokens table
      const { data: fcmTokens, error: fcmTokensError } = await supabase
        .from('heritage_user_fcm_tokens')
        .select('fcm_token')
        .eq('user_id', userId)
        .eq('is_active', true);

      if (fcmTokensError) {
        if (fcmTokensError.code === '42P01') {
          // Table doesn't exist - return empty array
          console.log(`ℹ️  heritage_user_fcm_tokens table does not exist. No push notifications will be sent.`);
          return [];
        }
        console.warn('Warning fetching heritage_user_fcm_tokens:', fcmTokensError.message);
        return [];
      }

      if (fcmTokens && fcmTokens.length > 0) {
        fcmTokens.forEach((row: any) => {
          const token = row?.fcm_token;
          if (token && typeof token === 'string' && token.trim()) {
            deviceTokens.push(token.trim());
          }
        });
      }

      return deviceTokens;
    } catch (error) {
      console.error('Error fetching device tokens:', error);
      return [];
    }
  }

  /**
   * Update user basic info (heritage_user table)
   */
  static async updateUserInfo(
    userId: number,
    data: { full_name?: string; phone?: string; email?: string; user_type_id?: number }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: Record<string, any> = {};

      if (data.full_name !== undefined) updateData.full_name = data.full_name;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.user_type_id !== undefined) updateData.user_type_id = data.user_type_id;

      if (Object.keys(updateData).length === 0) {
        return { success: true };
      }

      const { error } = await supabase
        .from('heritage_user')
        .update(updateData)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user info:', error);
      return { success: false, error: error.message || 'Failed to update user' };
    }
  }
}


