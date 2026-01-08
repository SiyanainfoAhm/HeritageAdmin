import { supabase } from '@/config/supabase';

export interface CallSupportRequest {
  request_id: number;
  id: number;
  user_id: number;
  phone_number: string;
  country_code: string;
  full_phone_number: string;
  user_name?: string;
  user_email?: string;
  preferred_language?: string;
  request_status?: string;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
  support_notes?: string;
  assigned_to?: number;
  called_at?: string;
  call_duration_seconds?: number;
}

export interface CallRequestFilters {
  status?: string;
  searchTerm?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  userTypeId?: number;
  page?: number;
  limit?: number;
}

export interface CallRequestResponse {
  data: CallSupportRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CallRequestService {
  /**
   * Get all call support requests with filters and pagination
   */
  static async getAllCallRequests(filters?: CallRequestFilters): Promise<CallRequestResponse> {
    try {
      const page = filters?.page || 1;
      const limit = filters?.limit || 10;
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      // If filtering by user type, first get all user IDs with that user type
      let userIds: number[] | undefined;
      if (filters?.userTypeId) {
        const { data: usersData, error: usersError } = await supabase
          .from('heritage_user')
          .select('user_id')
          .eq('user_type_id', filters.userTypeId);

        if (usersError) {
          throw new Error(`Failed to fetch users by type: ${usersError.message}`);
        }

        userIds = (usersData || []).map((user) => user.user_id);

        // If no users found with this type, return empty result
        if (userIds.length === 0) {
          return {
            data: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }
      }

      // Build count query for total
      let countQuery = supabase
        .from('heritage_callsupportrequest')
        .select('*', { count: 'exact', head: true });

      // Build data query
      let query = supabase
        .from('heritage_callsupportrequest')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to);

      // Filter by user IDs if user type filter is applied
      if (userIds && userIds.length > 0) {
        query = query.in('user_id', userIds);
        countQuery = countQuery.in('user_id', userIds);
      }

      if (filters?.status) {
        query = query.eq('request_status', filters.status);
        countQuery = countQuery.eq('request_status', filters.status);
      }

      if (filters?.startDate) {
        const startDateStr = filters.startDate.toISOString();
        query = query.gte('created_at', startDateStr);
        countQuery = countQuery.gte('created_at', startDateStr);
      }

      if (filters?.endDate) {
        const endDateStr = filters.endDate.toISOString();
        query = query.lte('created_at', endDateStr);
        countQuery = countQuery.lte('created_at', endDateStr);
      }

      if (filters?.searchTerm) {
        const searchPattern = `%${filters.searchTerm}%`;
        query = query.or(
          `phone_number.ilike.${searchPattern},full_phone_number.ilike.${searchPattern},user_name.ilike.${searchPattern},user_email.ilike.${searchPattern}`
        );
        countQuery = countQuery.or(
          `phone_number.ilike.${searchPattern},full_phone_number.ilike.${searchPattern},user_name.ilike.${searchPattern},user_email.ilike.${searchPattern}`
        );
      }

      // Execute both queries
      const [dataResult, countResult] = await Promise.all([
        query,
        countQuery,
      ]);

      if (dataResult.error) {
        throw new Error(dataResult.error.message);
      }

      if (countResult.error) {
        throw new Error(countResult.error.message);
      }

      const total = countResult.count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: dataResult.data || [],
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      console.error('Error fetching call requests:', error);
      throw new Error(error.message || 'Failed to fetch call requests');
    }
  }

  /**
   * Get call request by ID
   */
  static async getCallRequestById(requestId: number): Promise<CallSupportRequest | null> {
    try {
      const { data, error } = await supabase
        .from('heritage_callsupportrequest')
        .select('*')
        .eq('request_id', requestId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching call request:', error);
      throw new Error(error.message || 'Failed to fetch call request');
    }
  }

  /**
   * Update call request status
   */
  static async updateRequestStatus(
    requestId: number,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        request_status: status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'closed' && !notes) {
        updateData.completed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.support_notes = notes;
      }

      const { error } = await supabase
        .from('heritage_callsupportrequest')
        .update(updateData)
        .eq('request_id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update request status' };
    }
  }

  /**
   * Update call information (when a call is made)
   */
  static async updateCallInformation(
    requestId: number,
    callDuration?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        called_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (callDuration !== undefined) {
        updateData.call_duration_seconds = callDuration;
      }

      const { error } = await supabase
        .from('heritage_callsupportrequest')
        .update(updateData)
        .eq('request_id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update call information' };
    }
  }

  /**
   * Close call request
   */
  static async closeRequest(
    requestId: number,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {
        request_status: 'closed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (notes) {
        updateData.support_notes = notes;
      }

      const { error } = await supabase
        .from('heritage_callsupportrequest')
        .update(updateData)
        .eq('request_id', requestId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to close request' };
    }
  }
}

