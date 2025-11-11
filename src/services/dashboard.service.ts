import { supabase } from '@/config/supabase';
import { DashboardStats, DashboardKpiComparisons } from '@/types';
import { differenceInCalendarDays, endOfDay, format, startOfDay, subDays } from 'date-fns';

export interface TrendData {
  date: string;
  value: number;
}

export interface ModuleRevenue {
  module: string;
  revenue: number;
}

export interface ModuleBookingCount {
  module: string;
  bookings: number;
}

export interface StatusDistribution {
  status: string;
  count: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'user' | 'payment';
  title: string;
  description: string;
  timestamp: string;
  module?: string;
  amount?: number;
}

export interface DashboardUserDetail {
  user_id: number;
  full_name: string;
  email: string;
  created_at: string;
}

export interface DashboardEnhancedData {
  stats: DashboardStats;
  comparisons: DashboardKpiComparisons;
  revenueTrends: TrendData[];
  bookingTrends: TrendData[];
  userGrowth: TrendData[];
  moduleRevenue: ModuleRevenue[];
  moduleBookingCounts: ModuleBookingCount[];
  statusDistribution: StatusDistribution[];
  recentActivities: RecentActivity[];
  usersInRange: DashboardUserDetail[];
}

export interface DashboardDateRange {
  startDate: string;
  endDate: string;
}

const applyDateRange = (
  query: any,
  range?: DashboardDateRange,
  column: string = 'created_at'
) => {
  if (!range) return query;
  let filtered = query;
  if (range.startDate) {
    filtered = filtered.gte(column, range.startDate);
  }
  if (range.endDate) {
    filtered = filtered.lte(column, range.endDate);
  }
  return filtered;
};

export class DashboardService {
  private static normalizeRange(range?: DashboardDateRange): DashboardDateRange {
    const now = new Date();
    const end = range ? endOfDay(new Date(range.endDate || now)) : endOfDay(now);
    const start = range ? startOfDay(new Date(range.startDate || now)) : startOfDay(subDays(end, 13));
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }

  private static getPreviousRange(range: DashboardDateRange): DashboardDateRange {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    const days = Math.max(differenceInCalendarDays(end, start) + 1, 1);
    const prevEnd = endOfDay(subDays(start, 1));
    const prevStart = startOfDay(subDays(prevEnd, days - 1));
    return { startDate: prevStart.toISOString(), endDate: prevEnd.toISOString() };
  }

  private static calculatePercentChange(current: number, previous: number): number {
    if (previous === 0) {
      if (current === 0) return 0;
      return 100;
    }
    return ((current - previous) / previous) * 100;
  }

  private static buildComparison(current: number, previous: number) {
    return {
      current,
      previous,
      changePercent: this.calculatePercentChange(current, previous),
    };
  }

  private static async fetchStatSnapshot(range: DashboardDateRange) {
    const [
      totalUsers,
      hotelBookings,
      tourBookings,
      eventBookings,
      foodBookings,
      guideBookings,
      hotelRevenue,
      tourRevenue,
      eventRevenue,
      foodRevenue,
      guideRevenue,
      activeVendors,
      pendingBookings,
      completedBookings,
    ] = await Promise.all([
      applyDateRange(supabase.from('heritage_user').select('*', { count: 'exact', head: true }), range),
      applyDateRange(supabase.from('heritage_hotelbooking').select('booking_id', { count: 'exact', head: true }), range),
      applyDateRange(supabase.from('heritage_tour_booking').select('booking_id', { count: 'exact', head: true }), range),
      applyDateRange(supabase.from('heritage_eventbooking').select('booking_id', { count: 'exact', head: true }), range),
      applyDateRange(supabase.from('heritage_fv_foodbooking').select('booking_id', { count: 'exact', head: true }), range),
      applyDateRange(supabase.from('heritage_guide_booking').select('booking_id', { count: 'exact', head: true }), range),
      applyDateRange(
        supabase.from('heritage_hotelbooking').select('total_amount, created_at').eq('payment_status', 'paid'),
        range
      ),
      applyDateRange(
        supabase.from('heritage_tour_booking').select('total_amount, created_at').eq('payment_status', 'paid'),
        range
      ),
      applyDateRange(
        supabase.from('heritage_eventbooking').select('total_amount, created_at').eq('payment_status', 'paid'),
        range
      ),
      applyDateRange(supabase.from('heritage_fv_foodbooking').select('total_amount, created_at'), range),
      applyDateRange(
        supabase.from('heritage_guide_booking').select('total_amount, created_at').eq('payment_status', 'paid'),
        range
      ),
      applyDateRange(
        supabase
          .from('heritage_user')
          .select('*', { count: 'exact', head: true })
          .in('user_type_id', [6, 7, 9, 10, 11, 13])
          .eq('is_verified', true),
        range
      ),
      applyDateRange(
        supabase.from('heritage_hotelbooking').select('*', { count: 'exact', head: true }).eq('booking_status', 'pending'),
        range
      ),
      applyDateRange(
        supabase.from('heritage_hotelbooking').select('*', { count: 'exact', head: true }).eq('booking_status', 'completed'),
        range
      ),
    ]);

    const totalBookings =
      (hotelBookings.count || 0) +
      (tourBookings.count || 0) +
      (eventBookings.count || 0) +
      (foodBookings.count || 0) +
      (guideBookings.count || 0);

    const totalRevenue =
      (hotelRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
      (tourRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
      (eventRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
      (foodRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) +
      (guideRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0);

    return {
      totalUsers: totalUsers.count || 0,
      totalBookings,
      totalRevenue,
      activeVendors: activeVendors.count || 0,
      pendingBookings: pendingBookings.count || 0,
      completedBookings: completedBookings.count || 0,
    };
  }

  /**
   * Get dashboard statistics (optimized with parallel queries)
   */
  static async getDashboardStats(
    range?: DashboardDateRange
  ): Promise<{ stats: DashboardStats; comparisons: DashboardKpiComparisons }> {
    try {
      const normalizedRange = this.normalizeRange(range);
      const previousRange = this.getPreviousRange(normalizedRange);

      const [currentSnapshot, previousSnapshot] = await Promise.all([
        this.fetchStatSnapshot(normalizedRange),
        this.fetchStatSnapshot(previousRange),
      ]);

      const stats: DashboardStats = {
        total_users: currentSnapshot.totalUsers,
        total_bookings: currentSnapshot.totalBookings,
        total_revenue: currentSnapshot.totalRevenue,
        active_vendors: currentSnapshot.activeVendors,
        pending_bookings: currentSnapshot.pendingBookings,
        completed_bookings: currentSnapshot.completedBookings,
      };

      const comparisons: DashboardKpiComparisons = {
        users: this.buildComparison(currentSnapshot.totalUsers, previousSnapshot.totalUsers),
        bookings: this.buildComparison(currentSnapshot.totalBookings, previousSnapshot.totalBookings),
        revenue: this.buildComparison(currentSnapshot.totalRevenue, previousSnapshot.totalRevenue),
      };

      return { stats, comparisons };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      const zeroStats: DashboardStats = {
        total_users: 0,
        total_bookings: 0,
        total_revenue: 0,
        active_vendors: 0,
        pending_bookings: 0,
        completed_bookings: 0,
      };
      const zeroComparisons: DashboardKpiComparisons = {
        users: { current: 0, previous: 0, changePercent: 0 },
        bookings: { current: 0, previous: 0, changePercent: 0 },
        revenue: { current: 0, previous: 0, changePercent: 0 },
      };
      return { stats: zeroStats, comparisons: zeroComparisons };
    }
  }

  /**
   * Get revenue trends (last 14 days - optimized)
   */
  static async getRevenueTrends(range?: DashboardDateRange): Promise<TrendData[]> {
    try {
      const endDate = range ? endOfDay(new Date(range.endDate)) : new Date();
      const startDate = range ? new Date(range.startDate) : subDays(endDate, 13);
      const days = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Fetch all paid bookings from all modules in parallel
      const [hotelBookings, tourBookings, eventBookings, foodBookings, guideBookings] = await Promise.all([
        supabase
          .from('heritage_hotelbooking')
          .select('total_amount, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_tour_booking')
          .select('total_amount, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_eventbooking')
          .select('total_amount, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_fv_foodbooking')
          .select('total_amount, created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_guide_booking')
          .select('total_amount, created_at')
          .eq('payment_status', 'paid')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
      ]);

      // Combine all bookings
      const allBookings = [
        ...(hotelBookings.data || []),
        ...(tourBookings.data || []),
        ...(eventBookings.data || []),
        ...(foodBookings.data || []),
        ...(guideBookings.data || []),
      ];

      // Group by date
      const dailyRevenue: Record<string, number> = {};
      allBookings.forEach((booking: any) => {
        const dateStr = format(new Date(booking.created_at), 'yyyy-MM-dd');
        dailyRevenue[dateStr] = (dailyRevenue[dateStr] || 0) + (booking.total_amount || 0);
      });

      // Generate trends array for last 14 days
      const trends: TrendData[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - i - 1);
        const dateStr = format(date, 'yyyy-MM-dd');
        trends.push({
          date: dateStr,
          value: Math.round((dailyRevenue[dateStr] || 0) * 100) / 100,
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching revenue trends:', error);
      return [];
    }
  }

  /**
   * Get booking trends (last 14 days - optimized)
   */
  static async getBookingTrends(range?: DashboardDateRange): Promise<TrendData[]> {
    try {
      const endDate = range ? endOfDay(new Date(range.endDate)) : new Date();
      const startDate = range ? new Date(range.startDate) : subDays(endDate, 13);
      const days = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Fetch all bookings from all modules in parallel
      const [hotelBookings, tourBookings, eventBookings, foodBookings, guideBookings] = await Promise.all([
        supabase
          .from('heritage_hotelbooking')
          .select('created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_tour_booking')
          .select('created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_eventbooking')
          .select('created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_fv_foodbooking')
          .select('created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
        supabase
          .from('heritage_guide_booking')
          .select('created_at')
          .gte('created_at', `${startDateStr}T00:00:00`)
          .lte('created_at', `${endDateStr}T23:59:59`),
      ]);

      // Combine all bookings
      const allBookings = [
        ...(hotelBookings.data || []),
        ...(tourBookings.data || []),
        ...(eventBookings.data || []),
        ...(foodBookings.data || []),
        ...(guideBookings.data || []),
      ];

      // Group by date
      const dailyCounts: Record<string, number> = {};
      allBookings.forEach((booking: any) => {
        const dateStr = format(new Date(booking.created_at), 'yyyy-MM-dd');
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      });

      // Generate trends array for last 14 days
      const trends: TrendData[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - i - 1);
        const dateStr = format(date, 'yyyy-MM-dd');
        trends.push({
          date: dateStr,
          value: dailyCounts[dateStr] || 0,
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching booking trends:', error);
      return [];
    }
  }

  /**
   * Get user growth trends (last 14 days - optimized)
   */
  static async getUserGrowth(range?: DashboardDateRange): Promise<TrendData[]> {
    try {
      const endDate = range ? endOfDay(new Date(range.endDate)) : new Date();
      const startDate = range ? new Date(range.startDate) : subDays(endDate, 13);
      const days = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1);
      const startDateStr = format(startDate, 'yyyy-MM-dd');
      const endDateStr = format(endDate, 'yyyy-MM-dd');

      // Fetch all users created in the last 14 days
      const { data: users } = await supabase
        .from('heritage_user')
        .select('created_at')
        .gte('created_at', `${startDateStr}T00:00:00`)
        .lte('created_at', `${endDateStr}T23:59:59`);

      // Group by date
      const dailyCounts: Record<string, number> = {};
      users?.forEach((user: any) => {
        const dateStr = format(new Date(user.created_at), 'yyyy-MM-dd');
        dailyCounts[dateStr] = (dailyCounts[dateStr] || 0) + 1;
      });

      // Generate trends array for last 14 days
      const trends: TrendData[] = [];
      for (let i = 0; i < days; i++) {
        const date = subDays(endDate, days - i - 1);
        const dateStr = format(date, 'yyyy-MM-dd');
        trends.push({
          date: dateStr,
          value: dailyCounts[dateStr] || 0,
        });
      }

      return trends;
    } catch (error) {
      console.error('Error fetching user growth:', error);
      return [];
    }
  }

  /**
   * Get module-wise revenue (optimized with parallel queries)
   */
  static async getModuleRevenue(range?: DashboardDateRange): Promise<ModuleRevenue[]> {
    try {
      // Fetch all revenues in parallel
      const [hotelRevenue, tourRevenue, eventRevenue, foodRevenue, guideRevenue] = await Promise.all([
        applyDateRange(
          supabase
            .from('heritage_hotelbooking')
            .select('total_amount, created_at')
            .eq('payment_status', 'paid'),
          range
        ),
        applyDateRange(
          supabase
            .from('heritage_tour_booking')
            .select('total_amount, created_at')
            .eq('payment_status', 'paid'),
          range
        ),
        applyDateRange(
          supabase
            .from('heritage_eventbooking')
            .select('total_amount, created_at')
            .eq('payment_status', 'paid'),
          range
        ),
        applyDateRange(supabase.from('heritage_fv_foodbooking').select('total_amount, created_at'), range),
        applyDateRange(
          supabase
            .from('heritage_guide_booking')
            .select('total_amount, created_at')
            .eq('payment_status', 'paid'),
          range
        ),
      ]);

      const modules: ModuleRevenue[] = [
        {
          module: 'Hotels',
          revenue: Math.round((hotelRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) * 100) / 100,
        },
        {
          module: 'Tours',
          revenue: Math.round((tourRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) * 100) / 100,
        },
        {
          module: 'Events',
          revenue: Math.round((eventRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) * 100) / 100,
        },
        {
          module: 'Food & Beverages',
          revenue: Math.round((foodRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) * 100) / 100,
        },
        {
          module: 'Local Guides',
          revenue: Math.round((guideRevenue.data?.reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0) * 100) / 100,
        },
      ];

      return modules.filter((m) => m.revenue > 0);
    } catch (error) {
      console.error('Error fetching module revenue:', error);
      return [];
    }
  }

  /**
   * Get module-wise booking counts
   */
  static async getModuleBookingCounts(range?: DashboardDateRange): Promise<ModuleBookingCount[]> {
    try {
      const normalizedRange = this.normalizeRange(range);
      const [hotel, tour, event, food, guide] = await Promise.all([
        applyDateRange(
          supabase.from('heritage_hotelbooking').select('booking_id', { count: 'exact', head: true }),
          normalizedRange
        ),
        applyDateRange(
          supabase.from('heritage_tour_booking').select('booking_id', { count: 'exact', head: true }),
          normalizedRange
        ),
        applyDateRange(
          supabase.from('heritage_eventbooking').select('booking_id', { count: 'exact', head: true }),
          normalizedRange
        ),
        applyDateRange(
          supabase.from('heritage_fv_foodbooking').select('booking_id', { count: 'exact', head: true }),
          normalizedRange
        ),
        applyDateRange(
          supabase.from('heritage_guide_booking').select('booking_id', { count: 'exact', head: true }),
          normalizedRange
        ),
      ]);

      return [
        { module: 'Hotels', bookings: hotel.count || 0 },
        { module: 'Tours', bookings: tour.count || 0 },
        { module: 'Events', bookings: event.count || 0 },
        { module: 'Food & Beverages', bookings: food.count || 0 },
        { module: 'Local Guides', bookings: guide.count || 0 },
      ];
    } catch (error) {
      console.error('Error fetching module booking counts:', error);
      return [];
    }
  }

  /**
   * Get user details created within range
   */
  static async getUsersInRange(range?: DashboardDateRange): Promise<DashboardUserDetail[]> {
    try {
      const normalizedRange = this.normalizeRange(range);
      const { data } = await applyDateRange(
        supabase.from('heritage_user').select('user_id, full_name, email, created_at').order('created_at', { ascending: false }),
        normalizedRange
      );
      return (data || []) as DashboardUserDetail[];
    } catch (error) {
      console.error('Error fetching users in range:', error);
      return [];
    }
  }

  /**
   * Get booking status distribution (optimized with parallel queries)
   */
  static async getStatusDistribution(range?: DashboardDateRange): Promise<StatusDistribution[]> {
    try {
      const statusCounts: Record<string, number> = {};

      // Fetch all statuses in parallel
      const [hotelBookings, tourBookings, eventBookings, foodBookings, guideBookings] = await Promise.all([
        applyDateRange(supabase.from('heritage_hotelbooking').select('booking_status, created_at'), range),
        applyDateRange(supabase.from('heritage_tour_booking').select('status, created_at'), range),
        applyDateRange(supabase.from('heritage_eventbooking').select('booking_status, created_at'), range),
        applyDateRange(supabase.from('heritage_fv_foodbooking').select('booking_status, created_at'), range),
        applyDateRange(supabase.from('heritage_guide_booking').select('booking_status, created_at'), range),
      ]);

      // Count statuses
      hotelBookings.data?.forEach((b: any) => {
        const status = b.booking_status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      tourBookings.data?.forEach((b: any) => {
        const status = b.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      eventBookings.data?.forEach((b: any) => {
        const status = b.booking_status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      foodBookings.data?.forEach((b: any) => {
        const status = b.booking_status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      guideBookings.data?.forEach((b: any) => {
        const status = b.booking_status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

      return Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
        count,
      }));
    } catch (error) {
      console.error('Error fetching status distribution:', error);
      return [];
    }
  }

  /**
   * Get recent activities
   */
  static async getRecentActivities(limit: number = 10, range?: DashboardDateRange): Promise<RecentActivity[]> {
    try {
      const activities: RecentActivity[] = [];

      // Get recent bookings
      const { data: recentBookings } = await applyDateRange(
        supabase
          .from('heritage_hotelbooking')
          .select('booking_id, booking_reference, booking_status, total_amount, created_at, guest_full_name')
          .order('created_at', { ascending: false })
          .limit(5),
        range
      );

      recentBookings?.forEach((b: any) => {
        activities.push({
          id: `booking-${b.booking_id}`,
          type: 'booking',
          title: `New ${b.booking_status} booking`,
          description: `${b.guest_full_name} - ${b.booking_reference || `HTL-${b.booking_id}`}`,
          timestamp: b.created_at,
          module: 'hotel',
          amount: b.total_amount,
        });
      });

      // Get recent user registrations
      const { data: recentUsers } = await applyDateRange(
        supabase
          .from('heritage_user')
          .select('user_id, full_name, email, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
        range
      );

      recentUsers?.forEach((u: any) => {
        activities.push({
          id: `user-${u.user_id}`,
          type: 'user',
          title: 'New user registration',
          description: `${u.full_name} (${u.email})`,
          timestamp: u.created_at,
        });
      });

      // Sort by timestamp and limit
      activities.sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return dateB - dateA;
      });

      return activities.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  }

  /**
   * Get all enhanced dashboard data
   */
  static async getEnhancedDashboardData(range?: DashboardDateRange): Promise<DashboardEnhancedData> {
    try {
      const [
        { stats, comparisons },
        revenueTrends,
        bookingTrends,
        userGrowth,
        moduleRevenue,
        statusDistribution,
        recentActivities,
        moduleBookingCounts,
        usersInRange,
        usersInPreviousRange,
      ] = await Promise.all([
        this.getDashboardStats(range),
        this.getRevenueTrends(range),
        this.getBookingTrends(range),
        this.getUserGrowth(range),
        this.getModuleRevenue(range),
        this.getStatusDistribution(range),
        this.getRecentActivities(10, range),
        this.getModuleBookingCounts(range),
        this.getUsersInRange(range),
        this.getUsersInRange(range ? this.getPreviousRange(this.normalizeRange(range)) : undefined),
      ]);

      const usersCurrentCount = usersInRange.length;
      const usersPreviousCount = usersInPreviousRange.length;

      const updatedStats: DashboardStats = {
        ...stats,
        total_users: usersCurrentCount,
      };

      const updatedComparisons: DashboardKpiComparisons = {
        ...comparisons,
        users: {
          current: usersCurrentCount,
          previous: usersPreviousCount,
          changePercent: this.calculatePercentChange(usersCurrentCount, usersPreviousCount),
        },
      };

      return {
        stats: updatedStats,
        comparisons: updatedComparisons,
        revenueTrends,
        bookingTrends,
        userGrowth,
        moduleRevenue,
        moduleBookingCounts,
        statusDistribution,
        recentActivities,
        usersInRange,
      };
    } catch (error) {
      console.error('Error fetching enhanced dashboard data:', error);
      return {
        stats: {
          total_users: 0,
          total_bookings: 0,
          total_revenue: 0,
          active_vendors: 0,
          pending_bookings: 0,
          completed_bookings: 0,
        },
        comparisons: {
          users: { current: 0, previous: 0, changePercent: 0 },
          bookings: { current: 0, previous: 0, changePercent: 0 },
          revenue: { current: 0, previous: 0, changePercent: 0 },
        },
        revenueTrends: [],
        bookingTrends: [],
        userGrowth: [],
        moduleRevenue: [],
        moduleBookingCounts: [],
        statusDistribution: [],
        recentActivities: [],
        usersInRange: [],
      };
    }
  }

  /**
   * Check system health
   */
  static async checkSystemHealth(): Promise<{ status: 'healthy' | 'warning' | 'error'; message: string }> {
    try {
      const startTime = Date.now();
      const { error } = await supabase.from('heritage_user').select('user_id').limit(1);
      const responseTime = Date.now() - startTime;

      if (error) {
        return { status: 'error', message: 'Database connection failed' };
      }

      if (responseTime > 2000) {
        return { status: 'warning', message: `Slow response time: ${responseTime}ms` };
      }

      return { status: 'healthy', message: `Response time: ${responseTime}ms` };
    } catch (error) {
      return { status: 'error', message: 'System health check failed' };
    }
  }
}
