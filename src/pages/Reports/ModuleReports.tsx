import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ReportsService, ModuleReportData, DateRange } from '@/services/reports.service';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import { getDefaultDateRange } from '@/utils/dateRange';

const MODULES = [
  { value: 'hotel', label: 'Hotels' },
  { value: 'tour', label: 'Tours' },
  { value: 'event', label: 'Events' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'guide', label: 'Local Guides' },
];

const ModuleReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModule, setSelectedModule] = useState('hotel');
  const [data, setData] = useState<ModuleReportData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return { startDate, endDate };
  });

  useEffect(() => {
    fetchData();
  }, [selectedModule, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const reportData = await ReportsService.getModuleReportData(selectedModule, dateRange);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch module report data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!data) return null;

  const statusBarData = data.bookingsByStatus.map((item) => ({
    status: item.status,
    count: item.count,
  }));

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Select Module</InputLabel>
          <Select
            value={selectedModule}
            label="Select Module"
            onChange={(e) => setSelectedModule(e.target.value)}
          >
            {MODULES.map((module) => (
              <MenuItem key={module.value} value={module.value}>
                {module.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Bookings
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {data.totalBookings}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }} color="success.main">
              ₹{data.totalRevenue.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Module
            </Typography>
            <Typography variant="h5" sx={{ mt: 1 }}>
              {data.module}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue Trends
            </Typography>
            <LineChartComponent
              data={data.revenueTrends}
              dataKey="revenue"
              name="Revenue (₹)"
              color="#1976d2"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bookings by Status
            </Typography>
            <BarChartComponent
              data={statusBarData}
              dataKey="count"
              nameKey="status"
              name="Bookings"
              color="#00C49F"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ModuleReports;

