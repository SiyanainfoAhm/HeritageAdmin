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
}

export class CallRequestService {
  /**
   * Get all call support requests with filters
   */
  static async getAllCallRequests(filters?: CallRequestFilters): Promise<CallSupportRequest[]> {
    try {
      let query = supabase
        .from('heritage_callsupportrequest')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('request_status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }

      if (filters?.searchTerm) {
        query = query.or(
          `phone_number.ilike.%${filters.searchTerm}%,full_phone_number.ilike.%${filters.searchTerm}%,user_name.ilike.%${filters.searchTerm}%,user_email.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
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

