import { supabase } from '@/config/supabase';

export interface Booking {
  booking_id: number;
  booking_reference: string;
  module_type: 'hotel' | 'tour' | 'event' | 'food' | 'guide' | 'product';
  status: string;
  payment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  updated_at?: string;
  // Customer info
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  // Module-specific fields
  hotel_id?: number;
  tour_id?: number;
  event_id?: number;
  food_id?: number;
  guide_id?: number;
  user_id?: number;
  // Additional fields
  [key: string]: any;
}

export interface BookingFilters {
  moduleType?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  searchTerm?: string;
}

export interface BookingDetails extends Booking {
  // Hotel specific
  check_in_date?: string;
  check_out_date?: string;
  num_guests?: number;
  num_rooms?: number;
  room_type?: string;
  // Tour specific
  selected_date?: string;
  num_travelers?: number;
  // Event specific
  event_date?: string;
  num_tickets?: number;
  // Food specific
  booking_date?: string;
  num_guests_food?: number;
  // Guide specific
  service_date?: string;
  service_duration?: number;
  // Common
  special_requests?: string;
  notes?: string;
  payment_method?: string;
  payment_reference?: string;
}

export class BookingService {
  /**
   * Get all bookings with filters
   */
  static async getAllBookings(filters?: BookingFilters): Promise<Booking[]> {
    try {
      const allBookings: Booking[] = [];

      // Fetch hotel bookings
      if (!filters?.moduleType || filters.moduleType === 'hotel') {
        let hotelQuery = supabase
          .from('heritage_hotelbooking')
          .select('*, hotel_id, user_id')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          hotelQuery = hotelQuery.eq('booking_status', filters.status);
        }
        if (filters?.paymentStatus) {
          hotelQuery = hotelQuery.eq('payment_status', filters.paymentStatus);
        }
        if (filters?.startDate) {
          hotelQuery = hotelQuery.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          hotelQuery = hotelQuery.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.searchTerm) {
          hotelQuery = hotelQuery.or(
            `booking_reference.ilike.%${filters.searchTerm}%,guest_full_name.ilike.%${filters.searchTerm}%,guest_email.ilike.%${filters.searchTerm}%,guest_phone.ilike.%${filters.searchTerm}%`
          );
        }

        const { data: hotelBookings } = await hotelQuery;
        hotelBookings?.forEach((b: any) => {
          allBookings.push({
            booking_id: b.booking_id,
            booking_reference: b.booking_reference || `HTL-${b.booking_id}`,
            module_type: 'hotel',
            status: b.booking_status || 'pending',
            payment_status: b.payment_status || 'pending',
            total_amount: b.total_amount || 0,
            currency: b.currency || 'INR',
            created_at: b.created_at,
            updated_at: b.updated_at,
            customer_name: b.guest_full_name,
            customer_email: b.guest_email,
            customer_phone: b.guest_phone,
            hotel_id: b.hotel_id,
            user_id: b.user_id,
            ...b,
          });
        });
      }

      // Fetch tour bookings
      if (!filters?.moduleType || filters.moduleType === 'tour') {
        let tourQuery = supabase
          .from('heritage_tour_booking')
          .select('*, tour_id, created_by as user_id')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          tourQuery = tourQuery.eq('status', filters.status);
        }
        if (filters?.paymentStatus) {
          tourQuery = tourQuery.eq('payment_status', filters.paymentStatus);
        }
        if (filters?.startDate) {
          tourQuery = tourQuery.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          tourQuery = tourQuery.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.searchTerm) {
          tourQuery = tourQuery.or(
            `booking_code.ilike.%${filters.searchTerm}%,contact_full_name.ilike.%${filters.searchTerm}%,contact_email.ilike.%${filters.searchTerm}%,contact_phone.ilike.%${filters.searchTerm}%`
          );
        }

        const { data: tourBookings } = await tourQuery;
        tourBookings?.forEach((b: any) => {
          allBookings.push({
            booking_id: b.booking_id,
            booking_reference: b.booking_code || `TOUR-${b.booking_id}`,
            module_type: 'tour',
            status: b.status || 'pending',
            payment_status: b.payment_status || 'pending',
            total_amount: b.total_amount || 0,
            currency: b.currency || 'INR',
            created_at: b.created_at,
            updated_at: b.updated_at,
            customer_name: b.contact_full_name,
            customer_email: b.contact_email,
            customer_phone: b.contact_phone,
            tour_id: b.tour_id,
            user_id: b.created_by,
            ...b,
          });
        });
      }

      // Fetch event bookings
      if (!filters?.moduleType || filters.moduleType === 'event') {
        let eventQuery = supabase
          .from('heritage_eventbooking')
          .select('*, event_id, user_id')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          eventQuery = eventQuery.eq('booking_status', filters.status);
        }
        if (filters?.paymentStatus) {
          eventQuery = eventQuery.eq('payment_status', filters.paymentStatus);
        }
        if (filters?.startDate) {
          eventQuery = eventQuery.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          eventQuery = eventQuery.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.searchTerm) {
          eventQuery = eventQuery.or(
            `booking_reference.ilike.%${filters.searchTerm}%,attendee_name.ilike.%${filters.searchTerm}%,attendee_email.ilike.%${filters.searchTerm}%`
          );
        }

        const { data: eventBookings } = await eventQuery;
        eventBookings?.forEach((b: any) => {
          allBookings.push({
            booking_id: b.booking_id,
            booking_reference: b.booking_reference || `EVT-${b.booking_id}`,
            module_type: 'event',
            status: b.booking_status || 'pending',
            payment_status: b.payment_status || 'pending',
            total_amount: b.total_amount || 0,
            currency: b.currency || 'INR',
            created_at: b.created_at,
            updated_at: b.updated_at,
            customer_name: b.attendee_name,
            customer_email: b.attendee_email,
            event_id: b.event_id,
            user_id: b.user_id,
            ...b,
          });
        });
      }

      // Fetch food bookings
      if (!filters?.moduleType || filters.moduleType === 'food') {
        let foodQuery = supabase
          .from('heritage_fv_foodbooking')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          foodQuery = foodQuery.eq('booking_status', filters.status);
        }
        if (filters?.startDate) {
          foodQuery = foodQuery.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          foodQuery = foodQuery.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.searchTerm) {
          foodQuery = foodQuery.or(
            `booking_reference.ilike.%${filters.searchTerm}%,customer_name.ilike.%${filters.searchTerm}%,customer_email.ilike.%${filters.searchTerm}%,customer_phone.ilike.%${filters.searchTerm}%`
          );
        }

        const { data: foodBookings } = await foodQuery;
        foodBookings?.forEach((b: any) => {
          allBookings.push({
            booking_id: b.booking_id,
            booking_reference: b.booking_reference || `FOOD-${b.booking_id}`,
            module_type: 'food',
            status: b.booking_status || 'pending',
            payment_status: b.payment_status || 'pending',
            total_amount: b.total_amount || 0,
            currency: b.currency || 'INR',
            created_at: b.created_at,
            updated_at: b.updated_at,
            customer_name: b.customer_name,
            customer_email: b.customer_email,
            customer_phone: b.customer_phone,
            food_id: b.restaurant_id,
            user_id: b.user_id,
            ...b,
          });
        });
      }

      // Fetch guide bookings
      if (!filters?.moduleType || filters.moduleType === 'guide') {
        let guideQuery = supabase
          .from('heritage_guide_booking')
          .select('*, guide_user_id, tourist_user_id as user_id')
          .order('created_at', { ascending: false });

        if (filters?.status) {
          guideQuery = guideQuery.eq('booking_status', filters.status);
        }
        if (filters?.paymentStatus) {
          guideQuery = guideQuery.eq('payment_status', filters.paymentStatus);
        }
        if (filters?.startDate) {
          guideQuery = guideQuery.gte('created_at', filters.startDate.toISOString());
        }
        if (filters?.endDate) {
          guideQuery = guideQuery.lte('created_at', filters.endDate.toISOString());
        }
        if (filters?.searchTerm) {
          guideQuery = guideQuery.or(
            `booking_reference.ilike.%${filters.searchTerm}%,customer_name.ilike.%${filters.searchTerm}%,customer_email.ilike.%${filters.searchTerm}%,customer_phone.ilike.%${filters.searchTerm}%`
          );
        }

        const { data: guideBookings } = await guideQuery;
        guideBookings?.forEach((b: any) => {
          allBookings.push({
            booking_id: b.booking_id,
            booking_reference: b.booking_reference || `GUIDE-${b.booking_id}`,
            module_type: 'guide',
            status: b.booking_status || 'pending',
            payment_status: b.payment_status || 'pending',
            total_amount: b.total_amount || 0,
            currency: b.currency || 'INR',
            created_at: b.created_at,
            updated_at: b.updated_at,
            customer_name: b.customer_name,
            customer_email: b.customer_email,
            customer_phone: b.customer_phone,
            guide_id: b.guide_user_id,
            user_id: b.tourist_user_id,
            ...b,
          });
        });
      }

      // Sort by created_at descending
      allBookings.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });

      return allBookings;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  /**
   * Get booking details by ID and module
   */
  static async getBookingDetails(bookingId: number, moduleType: string): Promise<BookingDetails | null> {
    try {
      let query;
      const tableMap: Record<string, string> = {
        hotel: 'heritage_hotelbooking',
        tour: 'heritage_tour_booking',
        event: 'heritage_eventbooking',
        food: 'heritage_fv_foodbooking',
        guide: 'heritage_guide_booking',
      };

      const table = tableMap[moduleType];
      if (!table) return null;

      query = supabase.from(table).select('*').eq('booking_id', bookingId).single();

      const { data, error } = await query;
      if (error || !data) return null;

      // Format the data based on module type
      const details: BookingDetails = {
        booking_id: data.booking_id,
        booking_reference: data.booking_reference || data.booking_code || `${moduleType.toUpperCase()}-${data.booking_id}`,
        module_type: moduleType as any,
        status: data.booking_status || data.status || 'pending',
        payment_status: data.payment_status || 'pending',
        total_amount: data.total_amount || 0,
        currency: data.currency || 'INR',
        created_at: data.created_at,
        updated_at: data.updated_at,
        ...data,
      };

      return details;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      return null;
    }
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(
    bookingId: number,
    moduleType: string,
    status: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tableMap: Record<string, string> = {
        hotel: 'heritage_hotelbooking',
        tour: 'heritage_tour_booking',
        event: 'heritage_eventbooking',
        food: 'heritage_fv_foodbooking',
        guide: 'heritage_guide_booking',
      };

      const table = tableMap[moduleType];
      if (!table) {
        return { success: false, error: 'Invalid module type' };
      }

      const statusField = moduleType === 'tour' ? 'status' : 'booking_status';

      const { error } = await supabase
        .from(table)
        .update({
          [statusField]: status,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update booking status' };
    }
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    bookingId: number,
    moduleType: string,
    paymentStatus: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const tableMap: Record<string, string> = {
        hotel: 'heritage_hotelbooking',
        tour: 'heritage_tour_booking',
        event: 'heritage_eventbooking',
        food: 'heritage_fv_foodbooking',
        guide: 'heritage_guide_booking',
      };

      const table = tableMap[moduleType];
      if (!table) {
        return { success: false, error: 'Invalid module type' };
      }

      if (moduleType === 'food') {
        return { success: false, error: 'Payment status updates are not supported for food bookings' };
      }

      const { error } = await supabase
        .from(table)
        .update({
          payment_status: paymentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('booking_id', bookingId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update payment status' };
    }
  }
}

