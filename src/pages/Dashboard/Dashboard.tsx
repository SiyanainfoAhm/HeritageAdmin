import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  IconButton,
  Alert,
  Button,
  ButtonGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Switch,
  FormControlLabel,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  DialogContentText,
} from '@mui/material';
import {
  People as PeopleIcon,
  BookOnline as BookOnlineIcon,
  AttachMoney as AttachMoneyIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useAuth } from '@/context/AuthContext';
import {
  DashboardService,
  DashboardEnhancedData,
  DashboardDateRange,
  TrendData,
  DashboardUserDetail,
} from '@/services/dashboard.service';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import PieChartComponent from '@/components/reports/PieChart';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subWeeks,
  subMonths,
  format as formatDate,
  subDays,
} from 'date-fns';

type DashboardPeriod = 'today' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

interface CustomDateRange {
  startDate: Date;
  endDate: Date;
}

const StatCard = memo(({
  title,
  value,
  changePercent,
  icon,
  iconBgColor,
  onClick,
}: {
  title: string;
  value: number | string;
  changePercent?: number;
  icon: React.ReactNode;
  iconBgColor: string;
  onClick?: () => void;
}) => {
  const hasChange = changePercent !== undefined && changePercent !== null && !Number.isNaN(changePercent);
  const changeColor = !hasChange
    ? '#9e9e9e'
    : changePercent > 0
    ? '#4caf50'
    : changePercent < 0
    ? '#f44336'
    : '#9e9e9e';
  const ChangeIconComponent = !hasChange ? TrendingUpIcon : changePercent < 0 ? TrendingDownIcon : TrendingUpIcon;
  const formattedChange = hasChange ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%` : null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        backgroundColor: '#ffffff',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? {
              boxShadow: '0px 8px 24px rgba(0,0,0,0.08)',
              transform: 'translateY(-2px)',
            }
          : undefined,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#424242',
              fontFamily: 'sans-serif',
              fontSize: '0.875rem',
              mb: 1,
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: '#212121',
              fontFamily: 'sans-serif',
              fontSize: '1.75rem',
            }}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          {formattedChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 0.5 }}>
              <ChangeIconComponent sx={{ fontSize: 16, color: changeColor }} />
              <Typography
                variant="caption"
                sx={{
                  color: changeColor,
                  fontFamily: 'sans-serif',
                  fontWeight: 500,
                }}
              >
                {formattedChange}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: '#9e9e9e',
                  fontFamily: 'sans-serif',
                  ml: 0.5,
                }}
              >
                vs previous period
              </Typography>
            </Box>
          )}
        </Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: iconBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
});
StatCard.displayName = 'StatCard';

interface CustomRangeDialogProps {
  open: boolean;
  onClose: () => void;
  onApply: (range: CustomDateRange) => void;
  initialRange?: CustomDateRange | null;
}

const CustomRangeDialog: React.FC<CustomRangeDialogProps> = ({ open, onClose, onApply, initialRange }) => {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      if (initialRange) {
        setStart(formatDate(initialRange.startDate, 'yyyy-MM-dd'));
        setEnd(formatDate(initialRange.endDate, 'yyyy-MM-dd'));
      } else {
        const now = new Date();
        setEnd(formatDate(now, 'yyyy-MM-dd'));
        setStart(formatDate(subDays(now, 29), 'yyyy-MM-dd'));
      }
    }
  }, [open, initialRange]);

  const handleApply = () => {
    if (!start || !end) {
      setError('Please select both start and end dates.');
      return;
    }
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (startDate > endDate) {
      setError('Start date must be before end date.');
      return;
    }
    onApply({ startDate, endDate });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select Custom Date Range</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Start Date"
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApply}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type DrilldownType =
  | 'users'
  | 'bookings'
  | 'revenue'
  | 'bookingStatus'
  | 'bookingTrend'
  | 'userGrowth'
  | 'moduleRevenue';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardEnhancedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>('today');
  const [customRange, setCustomRange] = useState<CustomDateRange | null>(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [widgetVisibility, setWidgetVisibility] = useState({
    statusShare: true,
    bookingTrend: true,
    userGrowth: true,
    moduleRevenue: true,
  });
  const [drilldownType, setDrilldownType] = useState<DrilldownType | null>(null);
  const { user } = useAuth();
  const dashboardRef = useRef<HTMLDivElement>(null);

  const getRangeForPeriod = useCallback(
    (period: DashboardPeriod, customOverride?: CustomDateRange | null): DashboardDateRange => {
      const now = new Date();
      let start: Date;
      let end: Date;

      switch (period) {
        case 'today':
          start = startOfDay(now);
          end = endOfDay(now);
          break;
        case 'thisWeek':
          start = startOfWeek(now, { weekStartsOn: 1 });
          end = endOfWeek(now, { weekStartsOn: 1 });
          break;
        case 'lastWeek': {
          const lastWeekDate = subWeeks(now, 1);
          start = startOfWeek(lastWeekDate, { weekStartsOn: 1 });
          end = endOfWeek(lastWeekDate, { weekStartsOn: 1 });
          break;
        }
        case 'thisMonth':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'lastMonth': {
          const lastMonthDate = subMonths(now, 1);
          start = startOfMonth(lastMonthDate);
          end = endOfMonth(lastMonthDate);
          break;
        }
        case 'custom': {
          const source = customOverride ?? customRange;
          if (source) {
            start = startOfDay(source.startDate);
            end = endOfDay(source.endDate);
          } else {
            end = endOfDay(now);
            start = startOfDay(subDays(end, 29));
          }
          break;
        }
        default:
          start = startOfDay(now);
          end = endOfDay(now);
      }

      return {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
    },
    [customRange]
  );

  const fetchDashboardData = useCallback(
    async (isRefresh = false, periodOverride?: DashboardPeriod, customOverride?: CustomDateRange | null) => {
      const periodToUse = periodOverride ?? selectedPeriod;
      const range =
        periodToUse === 'custom'
          ? getRangeForPeriod(periodToUse, customOverride ?? customRange)
          : getRangeForPeriod(periodToUse);

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      try {
        const data = await DashboardService.getEnhancedDashboardData(range);
        setDashboardData(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedPeriod, customRange, getRangeForPeriod]
  );

  useEffect(() => {
    fetchDashboardData(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Memoize computed data to avoid recalculation on re-renders
  // IMPORTANT: All hooks must be called before any conditional returns
  const statusPieData = useMemo(() => {
    const statusDistribution = dashboardData?.statusDistribution || [];
    return statusDistribution.map((item) => ({
      name: item.status,
      value: item.count,
    }));
  }, [dashboardData?.statusDistribution]);

  const moduleBarData = useMemo(() => {
    const moduleRevenue = dashboardData?.moduleRevenue || [];
    return moduleRevenue.map((item) => ({
      module: item.module,
      revenue: item.revenue,
    }));
  }, [dashboardData?.moduleRevenue]);

  const stats = dashboardData?.stats;
  const comparisons = dashboardData?.comparisons;
  const moduleBookingCounts = dashboardData?.moduleBookingCounts || [];
  const usersInRange = dashboardData?.usersInRange || [];

  const formatNumber = (value?: number | null) =>
    value !== null && value !== undefined ? value.toLocaleString() : '0';

  const formatPercent = (value?: number | null) =>
    value !== null && value !== undefined && !Number.isNaN(value)
      ? `${value > 0 ? '+' : ''}${value.toFixed(1)}%`
      : '0%';
  const renderTrendTable = (data: TrendData[], valueLabel: string) => (
    <Table size="small" sx={{ mt: 2 }}>
      <TableHead>
        <TableRow>
          <TableCell>Date</TableCell>
          <TableCell align="right">{valueLabel}</TableCell>
        </TableRow>
      </TableHead>
        <TableBody>
          {data.length > 0 ? (
            data.map((item) => (
              <TableRow key={item.date}>
                <TableCell>{formatDate(new Date(item.date), 'dd MMM yyyy')}</TableCell>
              <TableCell align="right">{formatNumber(item.value)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={2} align="center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
    </Table>
  );

  const renderDrilldownContent = () => {
    switch (drilldownType) {
      case 'users':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                User Summary
              </Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Total Users</TableCell>
                    <TableCell align="right">{formatNumber(stats?.total_users)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Active Vendors</TableCell>
                    <TableCell align="right">{formatNumber(stats?.active_vendors)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Pending Bookings</TableCell>
                    <TableCell align="right">{formatNumber(stats?.pending_bookings)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Completed Bookings</TableCell>
                    <TableCell align="right">{formatNumber(stats?.completed_bookings)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Change vs previous period</TableCell>
                    <TableCell align="right">
                      {comparisons ? formatPercent(comparisons.users.changePercent) : '0%'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Users listed below</TableCell>
                    <TableCell align="right">{formatNumber(usersInRange.length)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>

            <Divider />

            {userGrowth.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  User Growth Trend
                </Typography>
                <LineChartComponent data={userGrowth} dataKey="value" name="New Users" color="#FF8042" />
                {renderTrendTable(userGrowth, 'New Users')}
              </Box>
            )}

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Users Created in Selected Period
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="right">Created At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersInRange.length > 0 ? (
                      usersInRange.slice(0, 50).map((user) => (
                        <TableRow key={user.user_id}>
                          <TableCell>{user.full_name || '—'}</TableCell>
                          <TableCell>{user.email || '—'}</TableCell>
                          <TableCell align="right">
                            {formatDate(new Date(user.created_at), 'dd MMM yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          No users created in this period.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              {usersInRange.length > 50 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Showing latest 50 of {usersInRange.length.toLocaleString()} users.
                </Typography>
              )}
            </Box>
          </Stack>
        );
      case 'bookings':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bookings by Module
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    <TableCell align="right">Bookings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {moduleBookingCounts.length > 0 ? (
                    moduleBookingCounts.map((item) => (
                      <TableRow key={item.module}>
                        <TableCell>{item.module}</TableCell>
                        <TableCell align="right">{formatNumber(item.bookings)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No booking data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Bookings by Status
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dashboardData?.statusDistribution || []).length > 0 ? (
                    dashboardData?.statusDistribution.map((item) => (
                      <TableRow key={item.status}>
                        <TableCell>{item.status}</TableCell>
                        <TableCell align="right">{formatNumber(item.count)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No status distribution data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {bookingTrends.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Booking Trend
                </Typography>
                <LineChartComponent data={bookingTrends} dataKey="value" name="Bookings" color="#1976d2" />
                {renderTrendTable(bookingTrends, 'Bookings')}
              </Box>
            )}
          </Stack>
        );
      case 'bookingStatus':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Booking Status Distribution
              </Typography>
              {statusPieData.length > 0 ? (
                <PieChartComponent data={statusPieData} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available
                </Typography>
              )}
              <Table size="small" sx={{ mt: 2 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dashboardData?.statusDistribution || []).length > 0 ? (
                    dashboardData?.statusDistribution.map((item) => (
                      <TableRow key={item.status}>
                        <TableCell>{item.status}</TableCell>
                        <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No status distribution data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Stack>
        );
      case 'bookingTrend':
        return (
          <Stack spacing={3}>
            {bookingTrends.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Booking Trend
                </Typography>
                <LineChartComponent data={bookingTrends} dataKey="value" name="Bookings" color="#1976d2" />
                {renderTrendTable(bookingTrends, 'Bookings')}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No booking trend data available
              </Typography>
            )}
          </Stack>
        );
      case 'userGrowth':
        return (
          <Stack spacing={3}>
            {userGrowth.length > 0 ? (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  User Growth Trend
                </Typography>
                <LineChartComponent data={userGrowth} dataKey="value" name="New Users" color="#FF8042" />
                {renderTrendTable(userGrowth, 'New Users')}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No user growth data available
              </Typography>
            )}
          </Stack>
        );
      case 'moduleRevenue':
      case 'revenue':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Revenue by Module
              </Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    <TableCell align="right">Revenue (₹)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(dashboardData?.moduleRevenue || []).length > 0 ? (
                    dashboardData?.moduleRevenue.map((item) => (
                      <TableRow key={item.module}>
                        <TableCell>{item.module}</TableCell>
                        <TableCell align="right">{formatNumber(item.revenue)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        No revenue data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>

            {moduleBarData.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Revenue Distribution
                </Typography>
                <BarChartComponent
                  data={moduleBarData}
                  dataKey="revenue"
                  nameKey="module"
                  name="Revenue (₹)"
                  color="#9c27b0"
                />
              </Box>
            )}

            {revenueTrends.length > 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Revenue Trend
                </Typography>
                <LineChartComponent data={revenueTrends} dataKey="value" name="Revenue (₹)" color="#007aff" />
                {renderTrendTable(revenueTrends, 'Revenue (₹)')}
              </Box>
            )}
          </Stack>
        );
      default:
        return null;
    }
  };

  const getDrilldownTitle = () => {
    switch (drilldownType) {
      case 'users':
        return 'User Drill-down';
      case 'bookings':
        return 'Bookings Drill-down';
      case 'bookingStatus':
        return 'Booking Status Details';
      case 'bookingTrend':
        return 'Booking Trend Details';
      case 'userGrowth':
        return 'User Growth Details';
      case 'moduleRevenue':
      case 'revenue':
        return 'Revenue Drill-down';
      default:
        return '';
    }
  };
  const revenueTrends = dashboardData?.revenueTrends || [];
  const bookingTrends = dashboardData?.bookingTrends || [];
  const userGrowth = dashboardData?.userGrowth || [];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const periodOptions: Array<{ value: DashboardPeriod; label: string; icon?: typeof CalendarIcon }> = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'custom', label: 'Custom', icon: CalendarIcon },
  ];

  const handleDownload = async () => {
    if (!dashboardRef.current) return;
    try {
      setDownloading(true);
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(dashboardRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `dashboard-${selectedPeriod}-${formatDate(new Date(), 'yyyyMMddHHmmss')}.png`;
      link.click();
    } catch (downloadError) {
      console.error('Failed to capture dashboard image:', downloadError);
      setError('Unable to download dashboard snapshot. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleWidgetToggle = (key: keyof typeof widgetVisibility) => (event: ChangeEvent<HTMLInputElement>) => {
    setWidgetVisibility((prev) => ({
      ...prev,
      [key]: event.target.checked,
    }));
  };

  const handlePeriodSelection = (value: DashboardPeriod) => {
    if (value === 'custom') {
      setCustomDialogOpen(true);
      return;
    }
    setSelectedPeriod(value);
  };

  const handleApplyCustomRange = (range: CustomDateRange) => {
    setCustomRange(range);
    setSelectedPeriod('custom');
    setCustomDialogOpen(false);
  };

  return (
    <Box ref={dashboardRef} sx={{ backgroundColor: '#fafafa', minHeight: '100vh', p: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 'bold',
            color: '#212121',
            fontFamily: 'sans-serif',
            mb: 1,
          }}
        >
          Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: '#757575',
            fontFamily: 'sans-serif',
            mb: 2,
          }}
        >
          Welcome back, {user?.full_name || 'Admin'}! Here's what's happening with your heritage app
        </Typography>

      </Box>

      {/* Period Selector */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <ButtonGroup variant="outlined" size="small">
            {periodOptions.map((period) => {
              const IconComponent = period.icon;
              const isActive = selectedPeriod === period.value;
              return (
                <Button
                  key={period.value}
                  onClick={() => handlePeriodSelection(period.value)}
                  startIcon={IconComponent ? <IconComponent /> : undefined}
                  sx={{
                    backgroundColor: isActive ? '#f08060' : 'transparent',
                    color: isActive ? '#ffffff' : '#424242',
                    borderColor: '#e0e0e0',
                    textTransform: 'none',
                    fontFamily: 'sans-serif',
                    '&:hover': {
                      backgroundColor: isActive ? '#f08060' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: '#e0e0e0',
                    },
                  }}
                >
                  {period.label}
                </Button>
              );
            })}
          </ButtonGroup>
          {selectedPeriod === 'custom' && customRange && (
            <Typography variant="caption" color="text.secondary">
              {`${formatDate(customRange.startDate, 'dd MMM yyyy')} - ${formatDate(customRange.endDate, 'dd MMM yyyy')}`}
            </Typography>
          )}
        </Stack>
        <Box>
          <IconButton
            size="small"
            onClick={handleDownload}
            disabled={downloading}
            sx={{ mr: 1 }}
            title="Download current data"
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            sx={{ mr: 1 }}
            title="Refresh data"
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => setSettingsDialogOpen(true)} title="Dashboard settings">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Users"
            value={stats?.total_users || 0}
            changePercent={comparisons?.users.changePercent}
            icon={<PeopleIcon sx={{ color: '#ffffff' }} />}
            iconBgColor="#ff3b30"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Bookings"
            value={stats?.total_bookings || 0}
            changePercent={comparisons?.bookings.changePercent}
            icon={<BookOnlineIcon sx={{ color: '#ffffff' }} />}
            iconBgColor="#34c759"
            onClick={() => setDrilldownType('bookings')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Revenue"
            value={`₹${(stats?.total_revenue || 0).toLocaleString()}`}
            changePercent={comparisons?.revenue.changePercent}
            icon={<AttachMoneyIcon sx={{ color: '#ffffff' }} />}
            iconBgColor="#007aff"
            onClick={() => setDrilldownType('revenue')}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {widgetVisibility.statusShare && (
          <Grid item xs={12} md={widgetVisibility.bookingTrend ? 6 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#ffffff',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#212121',
                  fontFamily: 'sans-serif',
                  mb: 2,
                }}
              >
                Booking Status Share
              </Typography>
              {statusPieData.length > 0 ? (
                <PieChartComponent data={statusPieData} />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
        {widgetVisibility.bookingTrend && (
          <Grid item xs={12} md={widgetVisibility.statusShare ? 6 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#ffffff',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#212121',
                  fontFamily: 'sans-serif',
                  mb: 2,
                }}
              >
                Booking Growth Trend
              </Typography>
              {bookingTrends.length > 0 ? (
                <LineChartComponent data={bookingTrends} dataKey="value" name="Bookings" color="#1976d2" />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No data available
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Charts Row 2 - User Growth */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {widgetVisibility.userGrowth && (
          <Grid item xs={12} md={widgetVisibility.moduleRevenue ? 6 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#ffffff',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#212121',
                  fontFamily: 'sans-serif',
                  mb: 2,
                }}
              >
                User Growth
              </Typography>
              {userGrowth.length > 0 ? (
                <LineChartComponent data={userGrowth} dataKey="value" name="New Users" color="#FF8042" />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No user growth data available
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
        {widgetVisibility.moduleRevenue && (
          <Grid item xs={12} md={widgetVisibility.userGrowth ? 6 : 12}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                backgroundColor: '#ffffff',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 500,
                  color: '#212121',
                  fontFamily: 'sans-serif',
                  mb: 2,
                }}
              >
                Revenue by Module
              </Typography>
              {moduleBarData.length > 0 ? (
                <BarChartComponent
                  data={moduleBarData}
                  dataKey="revenue"
                  nameKey="module"
                  name="Revenue (₹)"
                  color="#9c27b0"
                />
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No module revenue data available
                </Typography>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>

      <CustomRangeDialog
        open={customDialogOpen}
        onClose={() => setCustomDialogOpen(false)}
        onApply={handleApplyCustomRange}
        initialRange={customRange}
      />

      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>Dashboard Settings</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Choose which widgets should be displayed for the Application dashboard.
          </DialogContentText>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Switch checked={widgetVisibility.statusShare} onChange={handleWidgetToggle('statusShare')} />}
              label="Show Booking Status Share"
            />
            <FormControlLabel
              control={<Switch checked={widgetVisibility.bookingTrend} onChange={handleWidgetToggle('bookingTrend')} />}
              label="Show Booking Growth Trend"
            />
            <FormControlLabel
              control={<Switch checked={widgetVisibility.userGrowth} onChange={handleWidgetToggle('userGrowth')} />}
              label="Show User Growth"
            />
            <FormControlLabel
              control={
                <Switch checked={widgetVisibility.moduleRevenue} onChange={handleWidgetToggle('moduleRevenue')} />
              }
              label="Show Revenue by Module"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(drilldownType)}
        onClose={() => setDrilldownType(null)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>{getDrilldownTitle()}</DialogTitle>
        <DialogContent dividers>
          {drilldownType === 'bookings' && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bookings by Module
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="right">Bookings</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {moduleBookingCounts.length > 0 ? (
                      moduleBookingCounts.map((item) => (
                        <TableRow key={item.module}>
                          <TableCell>{item.module}</TableCell>
                          <TableCell align="right">{item.bookings.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No booking data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>

              <Divider />

              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Bookings by Status
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.statusDistribution || []).length > 0 ? (
                      dashboardData?.statusDistribution.map((item) => (
                        <TableRow key={item.status}>
                          <TableCell>{item.status}</TableCell>
                          <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No status distribution data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>

              {bookingTrends.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Booking Trend
                  </Typography>
                  <LineChartComponent data={bookingTrends} dataKey="value" name="Bookings" color="#1976d2" />
                </Box>
              )}
            </Stack>
          )}

          {drilldownType === 'revenue' && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Revenue by Module
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Module</TableCell>
                      <TableCell align="right">Revenue (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(dashboardData?.moduleRevenue || []).length > 0 ? (
                      dashboardData?.moduleRevenue.map((item) => (
                        <TableRow key={item.module}>
                          <TableCell>{item.module}</TableCell>
                          <TableCell align="right">{item.revenue.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} align="center">
                          No revenue data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Box>

              {revenueTrends.length > 0 && (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Revenue Trend
                  </Typography>
                  <LineChartComponent data={revenueTrends} dataKey="value" name="Revenue (₹)" color="#007aff" />
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrilldownType(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;

