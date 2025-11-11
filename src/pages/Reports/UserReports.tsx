import { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, CircularProgress, Alert } from '@mui/material';
import { ReportsService, UserReportData, DateRange } from '@/services/reports.service';
import DateRangeFilter from '@/components/reports/DateRangeFilter';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';
import PieChartComponent from '@/components/reports/PieChart';
import { getDefaultDateRange } from '@/utils/dateRange';

const UserReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<UserReportData | null>(null);
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
      const reportData = await ReportsService.getUserReportData(dateRange);
      setData(reportData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user report data');
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

  const pieData = [
    { name: 'Active', value: data.activeUsers },
    { name: 'Inactive', value: data.inactiveUsers },
  ];

  const barData = data.usersByType.map((item) => ({
    type: item.type,
    count: item.count,
  }));

  return (
    <Box>
      <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Total Users
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {data.totalUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Active Users
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }} color="success.main">
              {data.activeUsers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              Inactive Users
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }} color="error.main">
              {data.inactiveUsers}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Registration Trends
            </Typography>
            <LineChartComponent
              data={data.registrationTrends}
              dataKey="count"
              name="New Registrations"
              color="#1976d2"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Active vs Inactive Users
            </Typography>
            <PieChartComponent data={pieData} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Users by Type
            </Typography>
            <BarChartComponent
              data={barData}
              dataKey="count"
              nameKey="type"
              name="Users"
              color="#00C49F"
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserReports;

