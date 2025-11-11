import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { ReportsService, BookingReportData, DateRange } from '@/services/reports.service';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import PieChartComponent from '@/components/reports/PieChart';
import { getDefaultDateRange } from '@/utils/dateRange';

const BookingReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<BookingReportData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return { startDate, endDate };
  });

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const reportData = await ReportsService.getBookingReportData(dateRange);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking report data');
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

  const statusPieData = data.bookingsByStatus.map((item) => ({
    name: item.status,
    value: item.count,
  }));

  const moduleBarData = data.bookingsByModule.map((item) => ({
    module: item.module,
    count: item.count,
  }));

  return (
    <Box>
      <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Bookings
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {data.totalBookings}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Booking Trends
            </Typography>
            <LineChartComponent
              data={data.bookingTrends}
              dataKey="count"
              name="Bookings"
              color="#1976d2"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bookings by Status
            </Typography>
            <PieChartComponent data={statusPieData} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bookings by Module
            </Typography>
            <BarChartComponent
              data={moduleBarData}
              dataKey="count"
              nameKey="module"
              name="Bookings"
              color="#00C49F"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BookingReports;

