import { supabase } from '@/config/supabase';
import { User } from '@/types';
import { Booking } from './booking.service';

export interface UserDetails extends User {
  avatar_url?: string;
  tags?: string[];
  is_facebook_connected?: boolean;
  is_instagram_connected?: boolean;
  is_twitter_connected?: boolean;
  user_type_name?: string;
}

export interface UserFilters {
  userTypeId?: number;
  isVerified?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  searchTerm?: string;
  isActive?: boolean;
}

export interface UserUpdateData {
  full_name?: string;
  email?: string;
  phone?: string;
  is_verified?: boolean;
  language_code?: string;
  user_type_id?: number;
}

export class UserService {
  /**
   * Get all users with filters
   */
  static async getAllUsers(filters?: UserFilters): Promise<User[]> {
    try {
      let query = supabase
        .from('heritage_user')
        .select(
          `*,
          user_type:heritage_usertype!fk_user_type(
            user_type_id,
            type_key,
            translations:heritage_usertypetranslation!fk_user_type_translation(type_name, language_code)
          )`
        )
        .order('created_at', { ascending: false });

      if (filters?.userTypeId) {
        query = query.eq('user_type_id', filters.userTypeId);
      }
      if (filters?.isVerified !== undefined) {
        query = query.eq('is_verified', filters.isVerified);
      }
      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate.toISOString());
      }
      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate.toISOString());
      }
      if (filters?.searchTerm) {
        query = query.or(
          `full_name.ilike.%${filters.searchTerm}%,email.ilike.%${filters.searchTerm}%,phone.ilike.%${filters.searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return (data || []).map((user: any) => {
        const translations = user.user_type?.translations || [];
        const translation =
          translations.find((t: any) => t.language_code === 'EN') || translations[0];
        const userTypeName =
          translation?.type_name || user.user_type?.type_key || `Type ${user.user_type_id}`;

        const { user_type, ...rest } = user;

        return {
          ...rest,
          user_type_name: userTypeName,
        };
      });
    } catch (error) {
      console.error('Exception fetching users:', error);
      return [];
    }
  }

  /**
   * Get user details by ID
   */
  static async getUserDetails(userId: number): Promise<UserDetails | null> {
    try {
      // Get user with profile
      const { data: userData, error: userError } = await supabase
        .from('heritage_user')
        .select(
          `*,
          heritage_user_profile(*),
          user_type:heritage_usertype!fk_user_type(
            user_type_id,
            type_key,
            translations:heritage_usertypetranslation!fk_user_type_translation(type_name, language_code)
          )`
        )
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user details:', userError);
        return null;
      }

      const profile = userData.heritage_user_profile || {};
      const translations = userData.user_type?.translations || [];
      const translation =
        translations.find((t: any) => t.language_code === 'EN') || translations[0];
      const userTypeName =
        translation?.type_name || userData.user_type?.type_key || `Type ${userData.user_type_id}`;

      return {
        user_id: userData.user_id,
        full_name: userData.full_name,
        email: userData.email,
        phone: userData.phone,
        user_type_id: userData.user_type_id,
        user_type_name: userTypeName,
        is_verified: userData.is_verified,
        language_code: userData.language_code,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        avatar_url: profile.avatar_url,
        tags: profile.tags || [],
        is_facebook_connected: profile.is_facebook_connected || false,
        is_instagram_connected: profile.is_instagram_connected || false,
        is_twitter_connected: profile.is_twitter_connected || false,
      };
    } catch (error) {
      console.error('Exception fetching user details:', error);
      return null;
    }
  }

  /**
   * Get user bookings
   */
  static async getUserBookings(userId: number): Promise<Booking[]> {
    try {
      const bookings: Booking[] = [];

      // Hotel bookings
      const { data: hotelBookings } = await supabase
        .from('heritage_hotelbooking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      hotelBookings?.forEach((b: any) => {
        bookings.push({
          booking_id: b.booking_id,
          booking_reference: b.booking_reference || `HTL-${b.booking_id}`,
          module_type: 'hotel',
          status: b.booking_status || 'pending',
          payment_status: b.payment_status || 'pending',
          total_amount: b.total_amount || 0,
          currency: b.currency || 'INR',
          created_at: b.created_at,
          customer_name: b.guest_full_name,
          customer_email: b.guest_email,
          customer_phone: b.guest_phone,
          user_id: b.user_id,
          ...b,
        });
      });

      // Tour bookings
      const { data: tourBookings } = await supabase
        .from('heritage_tour_booking')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      tourBookings?.forEach((b: any) => {
        bookings.push({
          booking_id: b.booking_id,
          booking_reference: b.booking_code || `TOUR-${b.booking_id}`,
          module_type: 'tour',
          status: b.status || 'pending',
          payment_status: b.payment_status || 'pending',
          total_amount: b.total_amount || 0,
          currency: b.currency || 'INR',
          created_at: b.created_at,
          customer_name: b.contact_full_name,
          customer_email: b.contact_email,
          customer_phone: b.contact_phone,
          user_id: b.created_by,
          ...b,
        });
      });

      // Event bookings
      const { data: eventBookings } = await supabase
        .from('heritage_eventbooking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      eventBookings?.forEach((b: any) => {
        bookings.push({
          booking_id: b.booking_id,
          booking_reference: b.booking_reference || `EVT-${b.booking_id}`,
          module_type: 'event',
          status: b.booking_status || 'pending',
          payment_status: b.payment_status || 'pending',
          total_amount: b.total_amount || 0,
          currency: b.currency || 'INR',
          created_at: b.created_at,
          customer_name: b.attendee_name,
          customer_email: b.attendee_email,
          user_id: b.user_id,
          ...b,
        });
      });

      // Food bookings
      const { data: foodBookings } = await supabase
        .from('heritage_fv_foodbooking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      foodBookings?.forEach((b: any) => {
        bookings.push({
          booking_id: b.booking_id,
          booking_reference: b.booking_reference || `FOOD-${b.booking_id}`,
          module_type: 'food',
          status: b.booking_status || 'pending',
          payment_status: b.payment_status || 'pending',
          total_amount: b.total_amount || 0,
          currency: b.currency || 'INR',
          created_at: b.created_at,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_phone: b.customer_phone,
          user_id: b.user_id,
          ...b,
        });
      });

      // Guide bookings
      const { data: guideBookings } = await supabase
        .from('heritage_guide_booking')
        .select('*')
        .eq('tourist_user_id', userId)
        .order('created_at', { ascending: false });

      guideBookings?.forEach((b: any) => {
        bookings.push({
          booking_id: b.booking_id,
          booking_reference: b.booking_reference || `GUIDE-${b.booking_id}`,
          module_type: 'guide',
          status: b.booking_status || 'pending',
          payment_status: b.payment_status || 'pending',
          total_amount: b.total_amount || 0,
          currency: b.currency || 'INR',
          created_at: b.created_at,
          customer_name: b.customer_name,
          customer_email: b.customer_email,
          customer_phone: b.customer_phone,
          user_id: b.tourist_user_id,
          ...b,
        });
      });

      // Sort by created_at descending
      bookings.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      return bookings;
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  /**
   * Update user information
   */
  static async updateUser(userId: number, updates: UserUpdateData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('heritage_user')
        .update({
          ...updates,
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update user' };
    }
  }

  /**
   * Activate/Deactivate user (toggle verification)
   */
  static async toggleUserVerification(userId: number, isVerified: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('heritage_user')
        .update({
          is_verified: isVerified,
        })
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update user verification' };
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from('heritage_user').delete().eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete user' };
    }
  }

  /**
   * Get user types
   */
  static async getUserTypes(): Promise<Array<{ user_type_id: number; type_name: string }>> {
    try {
      const { data: typesData, error: typesError } = await supabase
        .from('heritage_usertype')
        .select('user_type_id, type_key')
        .eq('is_active', true)
        .order('display_order');

      if (typesError) {
        console.error('Error fetching user types:', typesError);
        return [];
      }

      const typeIds = (typesData || []).map((type) => type.user_type_id);

      let translationsData: Array<{ user_type_id: number; type_name: string; language_code: string }> = [];

      if (typeIds.length > 0) {
        const { data: translations, error: translationsError } = await supabase
          .from('heritage_usertypetranslation')
          .select('user_type_id, type_name, language_code')
          .in('user_type_id', typeIds);

        if (translationsError) {
          console.error('Error fetching user type translations:', translationsError);
        } else if (translations) {
          translationsData = translations;
        }
      }

      const translationMap = new Map<number, { type_name: string; language_code: string }>();
      translationsData.forEach((translation) => {
        const existing = translationMap.get(translation.user_type_id);
        if (!existing || existing.language_code !== 'EN') {
          translationMap.set(translation.user_type_id, translation);
        }
      });

      return (typesData || []).map((type: any) => ({
        user_type_id: type.user_type_id,
        type_name:
          translationMap.get(type.user_type_id)?.type_name ||
          type.type_key ||
          `Type ${type.user_type_id}`,
      }));
    } catch (error) {
      console.error('Exception fetching user types:', error);
      return [];
    }
  }
}

