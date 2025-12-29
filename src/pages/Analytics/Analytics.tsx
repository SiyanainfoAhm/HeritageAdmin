import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import { subDays } from 'date-fns';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import PieChartComponent from '@/components/reports/PieChart';
import RecentActivities from '@/components/dashboard/RecentActivities';
import {
  DashboardDateRange,
  DashboardEnhancedData,
  DashboardService,
  TrendData,
} from '@/services/dashboard.service';
import { getDefaultDateRange } from '@/utils/dateRange';
import FormattedDateInput from '@/components/common/FormattedDateInput';
import { formatDisplayDate } from '@/utils/dateTime.utils';

type RangePreset = '7d' | '14d' | '30d' | 'custom';

interface AnalyticsRangeState {
  start: string;
  end: string;
  preset: RangePreset;
}

const formatDateInput = (date: Date) => date.toISOString().split('T')[0];

const toServiceIsoString = (dateString: string, endOfDay: boolean = false) => {
  const date = new Date(`${dateString}T${endOfDay ? '23:59:59' : '00:00:00'}`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const getPresetRange = (days: number): Pick<AnalyticsRangeState, 'start' | 'end'> => {
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);
  return {
    start: formatDateInput(startDate),
    end: formatDateInput(endDate),
  };
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
    Math.max(value, 0)
  );

const formatNumber = (value: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.max(value, 0));

const formatChange = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

const transformTrendData = (data: TrendData[], key: string) =>
  data.map(({ date, value }) => ({ date, [key]: value }));

const Analytics = () => {
  const defaultRange = useMemo(() => {
    const { startDate, endDate } = getDefaultDateRange(30);
    return {
      start: formatDateInput(startDate),
      end: formatDateInput(endDate),
      preset: '30d' as RangePreset,
    };
  }, []);

  const [range, setRange] = useState<AnalyticsRangeState>(defaultRange);
  const [data, setData] = useState<DashboardEnhancedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildDashboardRange = (currentRange: AnalyticsRangeState): DashboardDateRange | undefined => {
    if (!currentRange.start || !currentRange.end) {
      return undefined;
    }

    const startIso = toServiceIsoString(currentRange.start);
    const endIso = toServiceIsoString(currentRange.end, true);

    if (!startIso || !endIso) {
      return undefined;
    }

    return {
      startDate: startIso,
      endDate: endIso,
    };
  };

  const fetchAnalyticsData = async () => {
    const serviceRange = buildDashboardRange(range);
    if (!serviceRange) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await DashboardService.getEnhancedDashboardData(serviceRange);
      setData(response);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.start, range.end]);

  const handlePresetChange = (days: number, preset: RangePreset) => {
    const presetRange = getPresetRange(days);
    setRange({
      ...presetRange,
      preset,
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setRange((prev) => ({
      ...prev,
      [field]: value,
      preset: 'custom',
    }));
  };

  const revenueTrend = useMemo(
    () => (data ? transformTrendData(data.revenueTrends, 'revenue') : []),
    [data]
  );
  const bookingTrend = useMemo(
    () => (data ? transformTrendData(data.bookingTrends, 'bookings') : []),
    [data]
  );
  const userGrowthTrend = useMemo(
    () => (data ? transformTrendData(data.userGrowth, 'users') : []),
    [data]
  );

  const statusDistribution = useMemo(
    () =>
      data?.statusDistribution.map((item) => ({
        name: item.status,
        value: item.count,
      })) ?? [],
    [data]
  );

  const moduleRevenue = useMemo(
    () =>
      data?.moduleRevenue.map((module) => ({
        module: module.module,
        revenue: module.revenue,
      })) ?? [],
    [data]
  );

  const moduleBookings = useMemo(
    () =>
      data?.moduleBookingCounts.map((module) => ({
        module: module.module,
        bookings: module.bookings,
      })) ?? [],
    [data]
  );

  const modulePerformance = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.moduleRevenue.map((module) => {
      const bookings = data.moduleBookingCounts.find((item) => item.module === module.module);
      return {
        module: module.module,
        revenue: module.revenue,
        bookings: bookings?.bookings ?? 0,
      };
    });
  }, [data]);

  const recentUsers = useMemo(() => data?.usersInRange.slice(0, 6) ?? [], [data]);

  const metrics = useMemo(() => {
    if (!data) {
      return [];
    }

    const {
      stats: { total_revenue: totalRevenue, total_bookings: totalBookings, total_users: totalUsers },
      comparisons,
    } = data;

    const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
    const previousAverageBookingValue =
      comparisons.bookings.previous > 0
        ? comparisons.revenue.previous / comparisons.bookings.previous
        : 0;
    const averageChange =
      previousAverageBookingValue === 0
        ? 0
        : ((averageBookingValue - previousAverageBookingValue) / previousAverageBookingValue) * 100;

    const conversionRate = totalUsers > 0 ? (totalBookings / totalUsers) * 100 : 0;
    const previousConversionRate =
      comparisons.users.previous > 0
        ? (comparisons.bookings.previous / comparisons.users.previous) * 100
        : 0;
    const conversionChange =
      previousConversionRate === 0
        ? conversionRate > 0
          ? 100
          : 0
        : ((conversionRate - previousConversionRate) / previousConversionRate) * 100;

    return [
      {
        label: 'Total Revenue',
        value: formatCurrency(totalRevenue),
        change: comparisons.revenue.changePercent,
        icon: MonetizationOnIcon,
      },
      {
        label: 'Total Bookings',
        value: formatNumber(totalBookings),
        change: comparisons.bookings.changePercent,
        icon: ShoppingCartIcon,
      },
      {
        label: 'Active Users',
        value: formatNumber(totalUsers),
        change: comparisons.users.changePercent,
        icon: PeopleAltIcon,
      },
      {
        label: 'Avg. Booking Value',
        value: formatCurrency(averageBookingValue),
        change: Number.isFinite(averageChange) ? averageChange : 0,
        icon: InsertChartIcon,
      },
      {
        label: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: Number.isFinite(conversionChange) ? conversionChange : 0,
        icon: TrendingUpIcon,
      },
    ];
  }, [data]);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2}>
        <Box>
          <Typography variant="h4" component="h1">
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor growth, revenue and engagement across all Heritage modules.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <ButtonGroup variant="outlined" size="small">
            <Button
              variant={range.preset === '7d' ? 'contained' : 'outlined'}
              onClick={() => handlePresetChange(7, '7d')}
            >
              7D
            </Button>
            <Button
              variant={range.preset === '14d' ? 'contained' : 'outlined'}
              onClick={() => handlePresetChange(14, '14d')}
            >
              14D
            </Button>
            <Button
              variant={range.preset === '30d' ? 'contained' : 'outlined'}
              onClick={() => handlePresetChange(30, '30d')}
            >
              30D
            </Button>
          </ButtonGroup>
          <Stack direction="row" spacing={2}>
            <FormattedDateInput
              label="Start Date"
              size="small"
              value={range.start}
              onChange={(value) => handleDateChange('start', value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormattedDateInput
              label="End Date"
              size="small"
              value={range.end}
              onChange={(value) => handleDateChange('end', value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading && !data ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {metrics.map((metric) => {
              const IconComponent = metric.icon;
              const changeColor: 'default' | 'success' | 'error' =
                metric.change > 0 ? 'success' : metric.change < 0 ? 'error' : 'default';

              return (
                <Grid key={metric.label} item xs={12} sm={6} md={4} lg={3}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          backgroundColor: '#f0806020',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f08060',
                        }}
                      >
                        <IconComponent />
                      </Box>
                      <Box>
                        <Typography variant="overline" sx={{ fontSize: '0.75rem', letterSpacing: 0.5 }}>
                          {metric.label}
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 0.5 }}>
                          {metric.value}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 2 }}>
                      <Chip size="small" label={formatChange(metric.change)} color={changeColor} />
                      <Typography variant="caption" color="text.secondary">
                        vs previous period
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TimelineIcon color="primary" />
                  <Typography variant="h6">Revenue Trend</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <LineChartComponent data={revenueTrend} dataKey="revenue" name="Revenue" color="#f08060" />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6">Booking Trend</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <LineChartComponent data={bookingTrend} dataKey="bookings" name="Bookings" color="#1976d2" />
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <PeopleAltIcon color="primary" />
                  <Typography variant="h6">User Growth</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : (
                  <LineChartComponent data={userGrowthTrend} dataKey="users" name="Users" color="#2e7d32" />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <InsertChartIcon color="primary" />
                  <Typography variant="h6">Status Distribution</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : statusDistribution.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No status data available for the selected range.
                  </Typography>
                ) : (
                  <PieChartComponent data={statusDistribution} />
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <MonetizationOnIcon color="primary" />
                  <Typography variant="h6">Module Revenue</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : moduleRevenue.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No revenue data available for the selected range.
                  </Typography>
                ) : (
                  <BarChartComponent data={moduleRevenue} dataKey="revenue" nameKey="module" name="Revenue" color="#f08060" />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <ShoppingCartIcon color="primary" />
                  <Typography variant="h6">Module Bookings</Typography>
                </Stack>
                {loading ? (
                  <Box display="flex" justifyContent="center" py={6}>
                    <CircularProgress size={24} />
                  </Box>
                ) : moduleBookings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No booking data available for the selected range.
                  </Typography>
                ) : (
                  <BarChartComponent data={moduleBookings} dataKey="bookings" nameKey="module" name="Bookings" color="#1976d2" />
                )}
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Module Performance
                </Typography>
                {modulePerformance.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No module performance data available for the selected range.
                  </Typography>
                ) : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Module</TableCell>
                        <TableCell align="right">Bookings</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {modulePerformance.map((module) => (
                        <TableRow key={module.module}>
                          <TableCell>{module.module}</TableCell>
                          <TableCell align="right">{formatNumber(module.bookings)}</TableCell>
                          <TableCell align="right">{formatCurrency(module.revenue)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Stack spacing={3} sx={{ height: '100%' }}>
                <RecentActivities activities={data?.recentActivities ?? []} loading={loading && !data?.recentActivities} />
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    New Users
                  </Typography>
                  {recentUsers.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No new users in the selected range.
                    </Typography>
                  ) : (
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Joined</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentUsers.map((user) => (
                          <TableRow key={user.user_id}>
                            <TableCell>{user.full_name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{formatDisplayDate(user.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </Paper>
              </Stack>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Analytics;


