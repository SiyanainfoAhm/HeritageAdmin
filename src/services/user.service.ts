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
  user_type_verified?: boolean;
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
          ),
          heritage_user_profile(avatar_url)`
        )
        .order('created_at', { ascending: false });

      if (filters?.userTypeId) {
        query = query.eq('user_type_id', filters.userTypeId);
      }
      if (filters?.isVerified !== undefined) {
        // Filter by user_type_verified instead of is_verified for status
        query = query.eq('user_type_verified', filters.isVerified);
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

        const { user_type, heritage_user_profile, ...rest } = user;
        const profile = Array.isArray(heritage_user_profile) 
          ? heritage_user_profile[0] 
          : heritage_user_profile;

        return {
          ...rest,
          // Explicitly ensure is_verified is properly mapped as boolean (only true if explicitly true)
          is_verified: rest.is_verified === true,
          // Include user_type_verified for status display - preserve the value as-is
          user_type_verified: rest.user_type_verified,
          user_type_name: userTypeName,
          avatar_url: profile?.avatar_url || undefined,
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
        user_type_verified: userData.user_type_verified,
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
   * @param userId - The user ID
   * @param userTypeName - Optional user type name to filter bookings from business owner perspective
   */
  static async getUserBookings(userId: number, userTypeName?: string): Promise<Booking[]> {
    try {
      const bookings: Booking[] = [];
      const userType = (userTypeName || '').toLowerCase();
      const isHotelOwner = userType.includes('hotel') || userType.includes('accommodation');
      const isFoodVendor = userType.includes('food') || userType.includes('beverage') || userType.includes('vendor');
      const isEventOrganizer = userType.includes('event') || userType.includes('organizer');
      const isTourOperator = userType.includes('tour') || userType.includes('operator');
      const isGuide = userType.includes('guide') || userType.includes('local');
      const isArtisan = userType.includes('artisan') || userType.includes('artist');

      // Hotel bookings - from owner's perspective if hotel owner, otherwise customer perspective
      if (isHotelOwner) {
        // Get hotels owned by this user, then get bookings for those hotels
        const { data: userHotels } = await supabase
          .from('heritage_hotel')
          .select('hotel_id')
          .eq('created_by', userId);

        if (userHotels && userHotels.length > 0) {
          const hotelIds = userHotels.map((h) => h.hotel_id);
          const { data: hotelBookings } = await supabase
            .from('heritage_hotelbooking')
            .select('*, hotel:heritage_hotel!hotel_id(hotel_id)')
            .in('hotel_id', hotelIds)
            .order('created_at', { ascending: false });

          // Fetch English translations for hotels
          const { data: hotelTranslations } = await supabase
            .from('heritage_hoteltranslation')
            .select('hotel_id, hotel_name')
            .in('hotel_id', hotelIds)
            .eq('language_code', 'EN');

          const hotelNameMap = new Map<number, string>();
          hotelTranslations?.forEach((t: any) => {
            hotelNameMap.set(t.hotel_id, t.hotel_name);
          });

          hotelBookings?.forEach((b: any) => {
            const hotel = Array.isArray(b.hotel) ? b.hotel[0] : b.hotel;
            const hotelId = hotel?.hotel_id || b.hotel_id;
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
              entity_name: hotelNameMap.get(hotelId) || 'Unknown Hotel',
              ...b,
            });
          });
        }
      } else {
        // Customer perspective
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
      }

      // Tour bookings - from operator's perspective if tour operator, otherwise customer perspective
      if (isTourOperator) {
        // Get tours operated by this user, then get bookings for those tours
        const { data: userTours } = await supabase
          .from('heritage_tour')
          .select('tour_id')
          .eq('user_id', userId);

        if (userTours && userTours.length > 0) {
          const tourIds = userTours.map((t) => t.tour_id);
          const { data: tourBookings } = await supabase
            .from('heritage_tour_booking')
            .select('*, tour:heritage_tour!tour_id(tour_id)')
            .in('tour_id', tourIds)
            .order('created_at', { ascending: false });

          // Fetch English translations for tours
          const { data: tourTranslations } = await supabase
            .from('heritage_tourtranslation')
            .select('tour_id, tour_name')
            .in('tour_id', tourIds)
            .eq('language_code', 'EN');

          const tourNameMap = new Map<number, string>();
          tourTranslations?.forEach((t: any) => {
            tourNameMap.set(t.tour_id, t.tour_name);
          });

          tourBookings?.forEach((b: any) => {
            const tour = Array.isArray(b.tour) ? b.tour[0] : b.tour;
            const tourId = tour?.tour_id || b.tour_id;
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
              entity_name: tourNameMap.get(tourId) || 'Unknown Tour',
              ...b,
            });
          });
        }
      } else {
        // Customer perspective
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
      }

      // Event bookings - from organizer's perspective if event organizer, otherwise customer perspective
      if (isEventOrganizer) {
        // Get events organized by this user, then get bookings for those events
        const { data: userEvents } = await supabase
          .from('heritage_event')
          .select('event_id')
          .eq('user_id', userId);

        if (userEvents && userEvents.length > 0) {
          const eventIds = userEvents.map((e) => e.event_id);
          const { data: eventBookings } = await supabase
            .from('heritage_eventbooking')
            .select('*')
            .in('event_id', eventIds)
            .order('created_at', { ascending: false });

          // Fetch English translations for events
          const { data: eventTranslations } = await supabase
            .from('heritage_eventtranslation')
            .select('event_id, event_name')
            .in('event_id', eventIds)
            .eq('language_code', 'EN');

          // Fetch event_name from heritage_event table as fallback
          const { data: eventData } = await supabase
            .from('heritage_event')
            .select('event_id, event_name')
            .in('event_id', eventIds);

          const eventNameMap = new Map<number, string>();
          
          // First, populate from translations
          eventTranslations?.forEach((t: any) => {
            if (t.event_name) {
              eventNameMap.set(t.event_id, t.event_name);
            }
          });

          // Then, fill in missing ones from heritage_event table
          eventData?.forEach((e: any) => {
            if (!eventNameMap.has(e.event_id) && e.event_name) {
              eventNameMap.set(e.event_id, e.event_name);
            }
          });

          eventBookings?.forEach((b: any) => {
            const eventId = b.event_id;
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
              entity_name: eventNameMap.get(eventId) || 'Unknown Event',
              ...b,
            });
          });
        }
      } else {
        // Customer perspective
      const { data: eventBookings } = await supabase
        .from('heritage_eventbooking')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

        if (eventBookings && eventBookings.length > 0) {
          // Get unique event IDs from bookings
          const eventIds = [...new Set(eventBookings.map((b: any) => b.event_id).filter(Boolean))];

          // Fetch English translations for events
          const { data: eventTranslations } = await supabase
            .from('heritage_eventtranslation')
            .select('event_id, event_name')
            .in('event_id', eventIds)
            .eq('language_code', 'EN');

          // Fetch event_name from heritage_event table as fallback
          const { data: eventData } = await supabase
            .from('heritage_event')
            .select('event_id, event_name')
            .in('event_id', eventIds);

          const eventNameMap = new Map<number, string>();
          
          // First, populate from translations
          eventTranslations?.forEach((t: any) => {
            if (t.event_name) {
              eventNameMap.set(t.event_id, t.event_name);
            }
          });

          // Then, fill in missing ones from heritage_event table
          eventData?.forEach((e: any) => {
            if (!eventNameMap.has(e.event_id) && e.event_name) {
              eventNameMap.set(e.event_id, e.event_name);
            }
          });

      eventBookings?.forEach((b: any) => {
            const eventId = b.event_id;
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
              entity_name: eventNameMap.get(eventId) || 'Unknown Event',
          ...b,
        });
      });
        }
      }

      // Food bookings - from vendor's perspective if food vendor, otherwise customer perspective
      if (isFoodVendor) {
        // Get restaurants owned by this user, then get bookings for those restaurants
        const { data: userRestaurants } = await supabase
          .from('heritage_food')
          .select('food_id')
          .eq('created_by', userId);

        if (userRestaurants && userRestaurants.length > 0) {
          const restaurantIds = userRestaurants.map((r) => r.food_id);
          const { data: foodBookings } = await supabase
            .from('heritage_fv_foodbooking')
            .select('*, restaurant:heritage_food!restaurant_id(food_id)')
            .in('restaurant_id', restaurantIds)
            .order('created_at', { ascending: false });

          // Fetch English translations for food/restaurants
          const { data: foodTranslations } = await supabase
            .from('heritage_foodtranslation')
            .select('food_id, food_name')
            .in('food_id', restaurantIds)
            .eq('language_code', 'EN');

          const foodNameMap = new Map<number, string>();
          foodTranslations?.forEach((t: any) => {
            foodNameMap.set(t.food_id, t.food_name);
          });

          foodBookings?.forEach((b: any) => {
            const restaurant = Array.isArray(b.restaurant) ? b.restaurant[0] : b.restaurant;
            const foodId = restaurant?.food_id || b.restaurant_id;
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
              entity_name: foodNameMap.get(foodId) || 'Unknown Restaurant',
              ...b,
            });
          });
        }
      } else {
        // Customer perspective
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
      }

      // Guide bookings - from guide's perspective if guide, otherwise customer perspective
      let guideBookings;
      if (isGuide) {
        const { data } = await supabase
          .from('heritage_guide_booking')
          .select('*')
          .eq('guide_user_id', userId)
          .order('created_at', { ascending: false });
        guideBookings = data;
      } else {
        const { data } = await supabase
        .from('heritage_guide_booking')
        .select('*')
        .eq('tourist_user_id', userId)
        .order('created_at', { ascending: false });
        guideBookings = data;
      }

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
          user_id: isGuide ? b.guide_user_id : b.tourist_user_id,
          ...b,
        });
      });

      // Product/Artisan Artwork purchases - from artisan's perspective if artisan, otherwise buyer perspective
      if (isArtisan) {
        try {
          // Get artworks created by this artisan, then get purchases for those artworks
          const { data: artisanData } = await supabase
            .from('heritage_artisan')
            .select('artisan_id')
            .eq('user_id', userId)
            .single();

          if (artisanData) {
            const { data: userArtworks } = await supabase
              .from('heritage_artwork')
              .select('artwork_id')
              .eq('artisan_id', artisanData.artisan_id);

            if (userArtworks && userArtworks.length > 0) {
              const artworkIds = userArtworks.map((a) => a.artwork_id);
              const { data: artworkPurchases } = await supabase
                .from('heritage_artworkpurchase')
                .select('*')
                .in('artwork_id', artworkIds)
                .order('created_at', { ascending: false });

              // Fetch English translations for artworks
              const { data: artworkTranslations } = await supabase
                .from('heritage_artworktranslation')
                .select('artwork_id, artwork_name')
                .in('artwork_id', artworkIds)
                .eq('language_code', 'EN');

              const artworkNameMap = new Map<number, string>();
              artworkTranslations?.forEach((t: any) => {
                artworkNameMap.set(t.artwork_id, t.artwork_name);
              });

              artworkPurchases?.forEach((b: any) => {
                const artworkId = b.artwork_id;
                bookings.push({
                  booking_id: b.purchase_id || 0,
                  booking_reference: b.purchase_reference || `ART-${b.purchase_id || 0}`,
                  module_type: 'product',
                  status: b.status || 'completed',
                  payment_status: b.payment_status || 'paid',
                  total_amount: b.total_amount || b.price || 0,
                  currency: b.currency || 'INR',
                  created_at: b.created_at || b.purchase_date,
                  customer_name: b.buyer_name,
                  customer_email: b.buyer_email,
                  user_id: b.buyer_id,
                  entity_name: artworkNameMap.get(artworkId) || 'Unknown Artwork',
                  ...b,
                });
              });
            }
          }
        } catch (productError) {
          console.warn('Artwork purchases table not found or error:', productError);
        }
      } else {
        // Buyer perspective
        try {
          const { data: artworkPurchases } = await supabase
            .from('heritage_artworkpurchase')
            .select('*')
            .eq('buyer_id', userId)
            .order('created_at', { ascending: false });

          if (artworkPurchases && artworkPurchases.length > 0) {
            // Get unique artwork IDs from purchases
            const artworkIds = [...new Set(artworkPurchases.map((p: any) => p.artwork_id).filter(Boolean))];

            // Fetch English translations for artworks
            const { data: artworkTranslations } = await supabase
              .from('heritage_artworktranslation')
              .select('artwork_id, artwork_name')
              .in('artwork_id', artworkIds)
              .eq('language_code', 'EN');

            const artworkNameMap = new Map<number, string>();
            artworkTranslations?.forEach((t: any) => {
              artworkNameMap.set(t.artwork_id, t.artwork_name);
            });

            artworkPurchases?.forEach((b: any) => {
              const artworkId = b.artwork_id;
              bookings.push({
                booking_id: b.purchase_id || 0,
                booking_reference: b.purchase_reference || `ART-${b.purchase_id || 0}`,
                module_type: 'product',
                status: b.status || 'completed',
                payment_status: b.payment_status || 'paid',
                total_amount: b.total_amount || b.price || 0,
                currency: b.currency || 'INR',
                created_at: b.created_at || b.purchase_date,
                customer_name: b.buyer_name,
                customer_email: b.buyer_email,
                user_id: b.buyer_id,
                entity_name: artworkNameMap.get(artworkId) || 'Unknown Artwork',
                ...b,
              });
            });
          }
        } catch (productError) {
          // Table might not exist, silently continue
          console.warn('Artwork purchases table not found or error:', productError);
        }
      }

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
      // Prepare update data
      const updateData: any = { ...updates };
      
      // If user_type_verified is being set to true, also set verified_on
      if (updates.user_type_verified === true) {
        // Set verified_on to current date in YYYY-MM-DD format
        const today = new Date();
        updateData.verified_on = today.toISOString().split('T')[0];
      } else if (updates.user_type_verified === false) {
        // If setting to false, clear verified_on
        updateData.verified_on = null;
      }
      
      const { error } = await supabase
        .from('heritage_user')
        .update(updateData)
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

