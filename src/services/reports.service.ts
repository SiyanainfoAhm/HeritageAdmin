import { supabase } from '@/config/supabase';
import { format, subDays, startOfDay, endOfDay, parseISO } from 'date-fns';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export interface UserReportData {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByType: Array<{ type: string; count: number }>;
  registrationTrends: Array<{ date: string; count: number }>;
}

export interface BookingReportData {
  totalBookings: number;
  bookingsByStatus: Array<{ status: string; count: number }>;
  bookingsByModule: Array<{ module: string; count: number }>;
  bookingTrends: Array<{ date: string; count: number }>;
}

export interface RevenueReportData {
  totalRevenue: number;
  revenueByModule: Array<{ module: string; revenue: number }>;
  revenueTrends: Array<{ date: string; revenue: number }>;
  revenueByPaymentStatus: Array<{ status: string; revenue: number }>;
}

export interface ModuleReportData {
  module: string;
  totalBookings: number;
  totalRevenue: number;
  bookingsByStatus: Array<{ status: string; count: number }>;
  revenueTrends: Array<{ date: string; revenue: number }>;
}

export class ReportsService {
  /**
   * Get user report data
   */
  static async getUserReportData(dateRange?: DateRange): Promise<UserReportData> {
    try {
      let userQuery = supabase.from('heritage_user').select('user_id, user_type_id, is_verified, created_at');

      // Apply date filter if provided
      if (dateRange?.startDate) {
        userQuery = userQuery.gte('created_at', dateRange.startDate.toISOString());
      }
      if (dateRange?.endDate) {
        userQuery = userQuery.lte('created_at', dateRange.endDate.toISOString());
      }

      const { data: users, error } = await userQuery;

      if (error) {
        console.error('Error fetching users:', error);
        return this.getEmptyUserReport();
      }

      const totalUsers = users?.length || 0;
      const activeUsers = users?.filter((u) => u.is_verified)?.length || 0;
      const inactiveUsers = totalUsers - activeUsers;

      // Get user types
      const { data: userTypes } = await supabase.from('heritage_usertype').select('user_type_id, type_name');

      const usersByType = (userTypes || []).map((type) => ({
        type: type.type_name || `Type ${type.user_type_id}`,
        count: users?.filter((u) => u.user_type_id === type.user_type_id)?.length || 0,
      }));

      // Registration trends (last 30 days by default)
      const trends = this.calculateRegistrationTrends(users || [], dateRange);

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        usersByType: usersByType.filter((ut) => ut.count > 0),
        registrationTrends: trends,
      };
    } catch (error) {
      console.error('Exception in getUserReportData:', error);
      return this.getEmptyUserReport();
    }
  }

  /**
   * Get booking report data
   */
  static async getBookingReportData(dateRange?: DateRange): Promise<BookingReportData> {
    try {
      const bookings = await this.getAllBookings(dateRange);

      const totalBookings = bookings.length;

      // Bookings by status
      const statusCounts: Record<string, number> = {};
      bookings.forEach((b) => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      });

      const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: this.formatStatus(status),
        count,
      }));

      // Bookings by module
      const moduleCounts: Record<string, number> = {};
      bookings.forEach((b) => {
        moduleCounts[b.module] = (moduleCounts[b.module] || 0) + 1;
      });

      const bookingsByModule = Object.entries(moduleCounts).map(([module, count]) => ({
        module: this.formatModuleName(module),
        count,
      }));

      // Booking trends
      const trends = this.calculateBookingTrends(bookings, dateRange);

      return {
        totalBookings,
        bookingsByStatus,
        bookingsByModule,
        bookingTrends: trends,
      };
    } catch (error) {
      console.error('Exception in getBookingReportData:', error);
      return this.getEmptyBookingReport();
    }
  }

  /**
   * Get revenue report data
   */
  static async getRevenueReportData(dateRange?: DateRange): Promise<RevenueReportData> {
    try {
      const bookings = await this.getAllBookings(dateRange);

      // Filter only paid bookings
      const paidBookings = bookings.filter((b) => b.payment_status === 'paid');

      const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Revenue by module
      const moduleRevenue: Record<string, number> = {};
      paidBookings.forEach((b) => {
        moduleRevenue[b.module] = (moduleRevenue[b.module] || 0) + (b.total_amount || 0);
      });

      const revenueByModule = Object.entries(moduleRevenue).map(([module, revenue]) => ({
        module: this.formatModuleName(module),
        revenue: Math.round(revenue * 100) / 100,
      }));

      // Revenue trends
      const trends = this.calculateRevenueTrends(paidBookings, dateRange);

      // Revenue by payment status
      const statusRevenue: Record<string, number> = {};
      bookings.forEach((b) => {
        const status = b.payment_status || 'pending';
        statusRevenue[status] = (statusRevenue[status] || 0) + (b.total_amount || 0);
      });

      const revenueByPaymentStatus = Object.entries(statusRevenue).map(([status, revenue]) => ({
        status: this.formatStatus(status),
        revenue: Math.round(revenue * 100) / 100,
      }));

      return {
        totalRevenue,
        revenueByModule,
        revenueTrends: trends,
        revenueByPaymentStatus,
      };
    } catch (error) {
      console.error('Exception in getRevenueReportData:', error);
      return this.getEmptyRevenueReport();
    }
  }

  /**
   * Get module-specific report data
   */
  static async getModuleReportData(module: string, dateRange?: DateRange): Promise<ModuleReportData> {
    try {
      const bookings = await this.getBookingsByModule(module, dateRange);

      const totalBookings = bookings.length;
      const totalRevenue = bookings
        .filter((b) => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      // Bookings by status
      const statusCounts: Record<string, number> = {};
      bookings.forEach((b) => {
        statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
      });

      const bookingsByStatus = Object.entries(statusCounts).map(([status, count]) => ({
        status: this.formatStatus(status),
        count,
      }));

      // Revenue trends
      const paidBookings = bookings.filter((b) => b.payment_status === 'paid');
      const trends = this.calculateRevenueTrends(paidBookings, dateRange);

      return {
        module: this.formatModuleName(module),
        totalBookings,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        bookingsByStatus,
        revenueTrends: trends,
      };
    } catch (error) {
      console.error('Exception in getModuleReportData:', error);
      return this.getEmptyModuleReport(module);
    }
  }

  // Helper methods
  private static async getAllBookings(dateRange?: DateRange) {
    const bookings: Array<{
      module: string;
      status: string;
      payment_status: string;
      total_amount: number;
      created_at: string;
    }> = [];

    // Hotel bookings
    let hotelQuery = supabase.from('heritage_hotelbooking').select('booking_status, payment_status, total_amount, created_at');
    if (dateRange?.startDate) hotelQuery = hotelQuery.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) hotelQuery = hotelQuery.lte('created_at', dateRange.endDate.toISOString());
    const { data: hotelBookings } = await hotelQuery;
    hotelBookings?.forEach((b) => {
      bookings.push({
        module: 'hotel',
        status: b.booking_status || 'pending',
        payment_status: b.payment_status || 'pending',
        total_amount: b.total_amount || 0,
        created_at: b.created_at,
      });
    });

    // Tour bookings
    let tourQuery = supabase.from('heritage_tour_booking').select('status, payment_status, total_amount, created_at');
    if (dateRange?.startDate) tourQuery = tourQuery.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) tourQuery = tourQuery.lte('created_at', dateRange.endDate.toISOString());
    const { data: tourBookings } = await tourQuery;
    tourBookings?.forEach((b) => {
      bookings.push({
        module: 'tour',
        status: b.status || 'pending',
        payment_status: b.payment_status || 'pending',
        total_amount: b.total_amount || 0,
        created_at: b.created_at,
      });
    });

    // Event bookings
    let eventQuery = supabase.from('heritage_eventbooking').select('booking_status, payment_status, total_amount, created_at');
    if (dateRange?.startDate) eventQuery = eventQuery.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) eventQuery = eventQuery.lte('created_at', dateRange.endDate.toISOString());
    const { data: eventBookings } = await eventQuery;
    eventBookings?.forEach((b) => {
      bookings.push({
        module: 'event',
        status: b.booking_status || 'pending',
        payment_status: b.payment_status || 'pending',
        total_amount: b.total_amount || 0,
        created_at: b.created_at,
      });
    });

    // Food bookings
    let foodQuery = supabase.from('heritage_fv_foodbooking').select('booking_status, total_amount, created_at');
    if (dateRange?.startDate) foodQuery = foodQuery.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) foodQuery = foodQuery.lte('created_at', dateRange.endDate.toISOString());
    const { data: foodBookings } = await foodQuery;
    foodBookings?.forEach((b) => {
      bookings.push({
        module: 'food',
        status: b.booking_status || 'pending',
        payment_status: b.payment_status || 'pending',
        total_amount: b.total_amount || 0,
        created_at: b.created_at,
      });
    });

    // Guide bookings
    let guideQuery = supabase.from('heritage_guide_booking').select('booking_status, payment_status, total_amount, created_at');
    if (dateRange?.startDate) guideQuery = guideQuery.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) guideQuery = guideQuery.lte('created_at', dateRange.endDate.toISOString());
    const { data: guideBookings } = await guideQuery;
    guideBookings?.forEach((b) => {
      bookings.push({
        module: 'guide',
        status: b.booking_status || 'pending',
        payment_status: b.payment_status || 'pending',
        total_amount: b.total_amount || 0,
        created_at: b.created_at,
      });
    });

    return bookings;
  }

  private static async getBookingsByModule(module: string, dateRange?: DateRange) {
    const tableMap: Record<string, string> = {
      hotel: 'heritage_hotelbooking',
      tour: 'heritage_tour_booking',
      event: 'heritage_eventbooking',
      food: 'heritage_fv_foodbooking',
      guide: 'heritage_guide_booking',
    };

    const table = tableMap[module];
    if (!table) return [];

    let query = supabase.from(table).select('*');
    if (dateRange?.startDate) query = query.gte('created_at', dateRange.startDate.toISOString());
    if (dateRange?.endDate) query = query.lte('created_at', dateRange.endDate.toISOString());

    const { data } = await query;
    return (data || []).map((b: any) => ({
      module,
      status: b.booking_status || b.status || 'pending',
      payment_status: b.payment_status || 'pending',
      total_amount: b.total_amount || 0,
      created_at: b.created_at,
    }));
  }

  private static calculateRegistrationTrends(users: any[], dateRange?: DateRange) {
    const days = dateRange ? this.getDaysBetween(dateRange.startDate!, dateRange.endDate!) : 30;
    const trends: Array<{ date: string; count: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dateRange?.endDate
        ? subDays(dateRange.endDate, i)
        : subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const count = users.filter((u) => {
        const userDate = format(parseISO(u.created_at), 'yyyy-MM-dd');
        return userDate === dateStr;
      }).length;

      trends.push({ date: dateStr, count });
    }

    return trends;
  }

  private static calculateBookingTrends(bookings: any[], dateRange?: DateRange) {
    const days = dateRange ? this.getDaysBetween(dateRange.startDate!, dateRange.endDate!) : 30;
    const trends: Array<{ date: string; count: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dateRange?.endDate
        ? subDays(dateRange.endDate, i)
        : subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const count = bookings.filter((b) => {
        const bookingDate = format(parseISO(b.created_at), 'yyyy-MM-dd');
        return bookingDate === dateStr;
      }).length;

      trends.push({ date: dateStr, count });
    }

    return trends;
  }

  private static calculateRevenueTrends(bookings: any[], dateRange?: DateRange) {
    const days = dateRange ? this.getDaysBetween(dateRange.startDate!, dateRange.endDate!) : 30;
    const trends: Array<{ date: string; revenue: number }> = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = dateRange?.endDate
        ? subDays(dateRange.endDate, i)
        : subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const revenue = bookings
        .filter((b) => {
          const bookingDate = format(parseISO(b.created_at), 'yyyy-MM-dd');
          return bookingDate === dateStr;
        })
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);

      trends.push({ date: dateStr, revenue: Math.round(revenue * 100) / 100 });
    }

    return trends;
  }

  private static getDaysBetween(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  private static formatStatus(status: string): string {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private static formatModuleName(module: string): string {
    const names: Record<string, string> = {
      hotel: 'Hotels',
      tour: 'Tours',
      event: 'Events',
      food: 'Food & Beverages',
      guide: 'Local Guides',
      product: 'Products',
    };
    return names[module] || module;
  }

  private static getEmptyUserReport(): UserReportData {
    return {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0,
      usersByType: [],
      registrationTrends: [],
    };
  }

  private static getEmptyBookingReport(): BookingReportData {
    return {
      totalBookings: 0,
      bookingsByStatus: [],
      bookingsByModule: [],
      bookingTrends: [],
    };
  }

  private static getEmptyRevenueReport(): RevenueReportData {
    return {
      totalRevenue: 0,
      revenueByModule: [],
      revenueTrends: [],
      revenueByPaymentStatus: [],
    };
  }

  private static getEmptyModuleReport(module: string): ModuleReportData {
    return {
      module: this.formatModuleName(module),
      totalBookings: 0,
      totalRevenue: 0,
      bookingsByStatus: [],
      revenueTrends: [],
    };
  }
}

