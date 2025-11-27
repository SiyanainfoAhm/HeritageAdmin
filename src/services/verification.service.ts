import { supabase } from '@/config/supabase';

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

      // Fetch business details based on entity type
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
      if (businessTable) {
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
      }

      // For Artisan, fetch from heritage_artisan table
      if (entityType === 'Artisan') {
        const { data: artisanData } = await supabase
          .from('heritage_artisan')
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (artisanData) {
          businessDetails = artisanData;
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

      // Remove fields that shouldn't be updated
      const { id, user_id, created_at, updated_at, profile_id, artisan_id, ...updateData } = data;

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
   * Update user basic info
   */
  static async updateUserInfo(
    userId: number,
    data: { full_name?: string; phone?: string; email?: string }
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('heritage_user')
        .update(data)
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating user info:', error);
      return { success: false, error: error.message || 'Failed to update user' };
    }
  }
}

