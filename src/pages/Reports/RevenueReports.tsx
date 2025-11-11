import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { ReportsService, RevenueReportData, DateRange } from '@/services/reports.service';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import PieChartComponent from '@/components/reports/PieChart';
import { getDefaultDateRange } from '@/utils/dateRange';

const RevenueReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<RevenueReportData | null>(null);
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
      const reportData = await ReportsService.getRevenueReportData(dateRange);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revenue report data');
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

  const moduleBarData = data.revenueByModule.map((item) => ({
    module: item.module,
    revenue: item.revenue,
  }));

  const paymentStatusPieData = data.revenueByPaymentStatus.map((item) => ({
    name: item.status,
    value: item.revenue,
  }));

  return (
    <Box>
      <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Revenue
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }} color="success.main">
              ₹{data.totalRevenue.toLocaleString()}
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
              color="#00C49F"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Payment Status
            </Typography>
            <PieChartComponent data={paymentStatusPieData} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Revenue by Module
            </Typography>
            <BarChartComponent
              data={moduleBarData}
              dataKey="revenue"
              nameKey="module"
              name="Revenue (₹)"
              color="#FF8042"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RevenueReports;

