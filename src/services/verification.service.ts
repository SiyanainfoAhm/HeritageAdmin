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
      // Fetch Heritage Sites
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Heritage Site') {
        const { data: sites } = await supabase
          .from('heritage_site')
          .select('site_id, name_default, short_desc_default, meta_description_def, is_active, created_at')
          .order('created_at', { ascending: false });

        if (sites) {
          for (const site of sites) {
            records.push({
              id: site.site_id,
              name: site.name_default || 'Unnamed Site',
              subtitle: site.short_desc_default || site.meta_description_def || '',
              entityType: 'Heritage Site',
              status: mapStatus(site.is_active),
              location: 'India',
              submittedOn: site.created_at?.split('T')[0] || '',
              rawData: site,
            });
          }
        }
      }

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

      // Fetch Hotels
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Hotel') {
        const { data: hotels } = await supabase
          .from('heritage_hotel')
          .select('hotel_id, hotel_name, subtitle, status, created_at')
          .order('created_at', { ascending: false });

        if (hotels) {
          for (const hotel of hotels) {
            records.push({
              id: hotel.hotel_id,
              name: hotel.hotel_name || 'Unnamed Hotel',
              subtitle: hotel.subtitle || 'Hotel',
              entityType: 'Hotel',
              status: mapStatus(hotel.status),
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

      // Fetch Food Vendors
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Food Vendor') {
        const { data: vendors } = await supabase
          .from('heritage_food')
          .select('food_id, food_name, subtitle, status, created_at')
          .order('created_at', { ascending: false });

        if (vendors) {
          for (const vendor of vendors) {
            records.push({
              id: vendor.food_id,
              name: vendor.food_name || 'Unnamed Vendor',
              subtitle: vendor.subtitle || 'Food Vendor',
              entityType: 'Food Vendor',
              status: mapStatus(vendor.status),
              location: 'India',
              submittedOn: vendor.created_at?.split('T')[0] || '',
              rawData: vendor,
            });
          }
        }
      }

      // Fetch Artisans
      if (!filters?.entityType || filters.entityType === 'All' || filters.entityType === 'Artisan') {
        const { data: artisans } = await supabase
          .from('heritage_artisan')
          .select('artisan_id, artisan_name, short_bio, craft_type, is_verified, created_at')
          .order('created_at', { ascending: false });

        if (artisans) {
          for (const artisan of artisans) {
            records.push({
              id: artisan.artisan_id,
              name: artisan.artisan_name || 'Unnamed Artisan',
              subtitle: artisan.short_bio || artisan.craft_type || 'Artisan',
              entityType: 'Artisan',
              status: mapStatus(artisan.is_verified),
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
        'Heritage Site': { table: 'heritage_site', idField: 'site_id', statusField: 'is_active', approveValue: true },
        'Local Guide': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        Hotel: { table: 'heritage_hotel', idField: 'hotel_id', statusField: 'status', approveValue: 'published' },
        'Event Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        'Tour Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', approveValue: true },
        'Food Vendor': { table: 'heritage_food', idField: 'food_id', statusField: 'status', approveValue: 'published' },
        Artisan: { table: 'heritage_artisan', idField: 'artisan_id', statusField: 'is_verified', approveValue: true },
      };

      const config = tableMap[entityType];
      if (!config) {
        return { success: false, error: `Unknown entity type: ${entityType}` };
      }

      const { error } = await supabase
        .from(config.table)
        .update({ [config.statusField]: config.approveValue })
        .eq(config.idField, id);

      if (error) throw error;
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
        'Heritage Site': { table: 'heritage_site', idField: 'site_id', statusField: 'is_active', rejectValue: false },
        'Local Guide': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        Hotel: { table: 'heritage_hotel', idField: 'hotel_id', statusField: 'status', rejectValue: 'draft' },
        'Event Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        'Tour Operator': { table: 'heritage_user', idField: 'user_id', statusField: 'user_type_verified', rejectValue: false },
        'Food Vendor': { table: 'heritage_food', idField: 'food_id', statusField: 'status', rejectValue: 'pending' },
        Artisan: { table: 'heritage_artisan', idField: 'artisan_id', statusField: 'is_verified', rejectValue: false },
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
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to reject entity' };
    }
  }
}

