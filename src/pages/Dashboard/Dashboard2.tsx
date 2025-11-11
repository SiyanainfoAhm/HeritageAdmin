import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  Apple as AppleIcon,
  Android as AndroidIcon,
  Public as PublicIcon,
  Download as DownloadIcon,
  CalendarMonth as CalendarMonthIcon,
  Group as GroupIcon,
  Insights as InsightsIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  Devices as DevicesIcon,
  ShoppingCartCheckout as ShoppingCartCheckoutIcon,
  Payments as PaymentsIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
} from '@mui/icons-material';

import PieChartComponent from '@/components/reports/PieChart';
import LineChartComponent from '@/components/reports/LineChart';
import BarChartComponent from '@/components/reports/BarChart';

type DashboardTab =
  | 'application'
  | 'tourist-behaviour'
  | 'heritage-health'
  | 'crowd-mgmt'
  | 'tourism-influx'
  | 'website'
  | 'revenue'
  | 'social';

type DateFilter = 'today' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'custom';

const primaryColor = '#DA8552';
const secondaryColor = '#3F3D56';

const cardStyle = {
  p: 3,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 4,
  backgroundColor: '#ffffff',
  boxShadow: '0 10px 30px rgba(63, 61, 86, 0.06)',
};

const Dashboard2 = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('application');
  const [activeDateFilter, setActiveDateFilter] = useState<DateFilter>('today');

  const applicationSummary = useMemo(
    () => [
      {
        title: 'iOS Downloads',
        value: '24,892',
        delta: '+12.4%',
        icon: <AppleIcon fontSize="small" />,
        chipColor: primaryColor,
        helper: 'vs. previous period',
        accent: 'primary',
      },
      {
        title: 'Android Downloads',
        value: '31,547',
        delta: '+18.7%',
        icon: <AndroidIcon fontSize="small" />,
        chipColor: '#2CA870',
        helper: 'vs. previous period',
        accent: 'success',
      },
      {
        title: 'WebApp Sessions',
        value: '42,105',
        delta: '+9.2%',
        icon: <PublicIcon fontSize="small" />,
        chipColor: '#4A6CF7',
        helper: 'vs. previous period',
        accent: 'info',
      },
    ],
    [],
  );

  const downloadShareData = useMemo(
    () => [
      { name: 'Android', value: 52 },
      { name: 'iOS', value: 41 },
      { name: 'Web', value: 7 },
    ],
    [],
  );

  const downloadShareColors = ['rgba(87,181,231,1)', 'rgba(141,211,199,1)', 'rgba(251,191,114,1)'];

  const downloadGrowthData = useMemo(
    () => [
      { date: '2025-01-01', ios: 14000, android: 18000, web: 32000 },
      { date: '2025-02-01', ios: 16500, android: 20500, web: 34500 },
      { date: '2025-03-01', ios: 18200, android: 23200, web: 36800 },
      { date: '2025-04-01', ios: 20100, android: 25800, web: 38900 },
      { date: '2025-05-01', ios: 22400, android: 28400, web: 40500 },
      { date: '2025-06-01', ios: 24900, android: 31500, web: 42100 },
    ],
    [],
  );

  const userGrowthData = useMemo(
    () => [
      { date: '2024-07-01', mau: 80000, newUsers: 12000 },
      { date: '2024-08-01', mau: 85000, newUsers: 13500 },
      { date: '2024-09-01', mau: 90000, newUsers: 14200 },
      { date: '2024-10-01', mau: 95000, newUsers: 15800 },
      { date: '2024-11-01', mau: 100000, newUsers: 16400 },
      { date: '2024-12-01', mau: 105000, newUsers: 17500 },
      { date: '2025-01-01', mau: 110000, newUsers: 18200 },
      { date: '2025-02-01', mau: 115000, newUsers: 19100 },
      { date: '2025-03-01', mau: 118000, newUsers: 20400 },
      { date: '2025-04-01', mau: 122000, newUsers: 21500 },
      { date: '2025-05-01', mau: 125000, newUsers: 22800 },
      { date: '2025-06-01', mau: 128000, newUsers: 24000 },
    ],
    [],
  );

  const userSignupData = useMemo(
    () => [
      { type: 'Tourist', value: 85000 },
      { type: 'Vendor', value: 12000 },
      { type: 'Guide', value: 8500 },
      { type: 'Artisan', value: 5200 },
      { type: 'Hotel', value: 4800 },
      { type: 'Operator', value: 3500 },
      { type: 'Organizer', value: 2800 },
    ],
    [],
  );

  const pageViewSparkData = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, index) => ({
        date: new Date(2025, 5, index + 1).toISOString(),
        value: 200 + index * 12,
      })),
    [],
  );

  const uniqueVisitorSparkData = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, index) => ({
        date: new Date(2025, 5, index + 1).toISOString(),
        value: 80 + index * 3,
      })),
    [],
  );

  const deviceShareData = useMemo(
    () => [
      { name: 'Mobile', value: 68 },
      { name: 'Desktop', value: 26 },
      { name: 'Tablet', value: 6 },
    ],
    [],
  );

  const revenueCategoryData = useMemo(
    () => [
      { name: 'Events', value: 32 },
      { name: 'Sites', value: 28 },
      { name: 'Packages', value: 22 },
      { name: 'Hotels', value: 12 },
      { name: 'Retail', value: 6 },
    ],
    [],
  );

  const revenueTrendData = useMemo(
    () => [
      { date: '2025-06-01', value: 820000 },
      { date: '2025-06-02', value: 932000 },
      { date: '2025-06-03', value: 901000 },
      { date: '2025-06-04', value: 934000 },
      { date: '2025-06-05', value: 1290000 },
      { date: '2025-06-06', value: 1330000 },
      { date: '2025-06-07', value: 1320000 },
    ],
    [],
  );

  const socialPlatformRows = useMemo(
    () => [
      {
        platform: 'Instagram',
        icon: <InstagramIcon sx={{ color: '#E1306C' }} fontSize="small" />,
        followers: '128.4K',
        followersDelta: '+12.7%',
        engagement: '4.8%',
        engagementDelta: '+0.7%',
        reach: '342.5K',
        reachDelta: '+18.2%',
        growth: '+12.7%',
      },
      {
        platform: 'Facebook',
        icon: <FacebookIcon sx={{ color: '#1877F2' }} fontSize="small" />,
        followers: '95.7K',
        followersDelta: '+8.4%',
        engagement: '3.2%',
        engagementDelta: '+0.3%',
        reach: '215.3K',
        reachDelta: '+12.5%',
        growth: '+8.4%',
      },
      {
        platform: 'Twitter',
        icon: <TwitterIcon sx={{ color: '#000000' }} fontSize="small" />,
        followers: '78.2K',
        followersDelta: '+6.8%',
        engagement: '2.7%',
        engagementDelta: '-0.2%',
        reach: '184.7K',
        reachDelta: '+9.3%',
        growth: '+6.8%',
      },
      {
        platform: 'YouTube',
        icon: <YouTubeIcon sx={{ color: '#FF0000' }} fontSize="small" />,
        followers: '45.3K',
        followersDelta: '+15.2%',
        engagement: '6.4%',
        engagementDelta: '+1.2%',
        reach: '278.9K',
        reachDelta: '+22.7%',
        growth: '+15.2%',
      },
      {
        platform: 'LinkedIn',
        icon: <LinkedInIcon sx={{ color: '#0A66C2' }} fontSize="small" />,
        followers: '32.8K',
        followersDelta: '+10.5%',
        engagement: '4.1%',
        engagementDelta: '+0.6%',
        reach: '124.6K',
        reachDelta: '+14.8%',
        growth: '+10.5%',
      },
    ],
    [],
  );

  const engagementTrendData = useMemo(
    () => [
      { date: '2025-01-01', views: 320000, likes: 82000, comments: 22000, shares: 15000 },
      { date: '2025-02-01', views: 332000, likes: 93200, comments: 23200, shares: 17200 },
      { date: '2025-03-01', views: 301000, likes: 90100, comments: 20100, shares: 16100 },
      { date: '2025-04-01', views: 334000, likes: 93400, comments: 23400, shares: 18400 },
      { date: '2025-05-01', views: 390000, likes: 129000, comments: 29000, shares: 20000 },
      { date: '2025-06-01', views: 430000, likes: 133000, comments: 33000, shares: 24000 },
    ],
    [],
  );

  const dateFilterOptions: Array<{ label: string; value: DateFilter }> = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
    { label: 'Last Week', value: 'last-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'Last Month', value: 'last-month' },
    { label: 'Custom', value: 'custom' },
  ];

  const renderProgress = (value: number, color = primaryColor) => (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 5,
          backgroundColor: 'rgba(63, 61, 86, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 5,
          },
        }}
      />
    </Box>
  );

  const renderApplicationTab = () => (
    <Stack spacing={6}>
      <Grid container spacing={3}>
        {applicationSummary.map((item) => (
          <Grid item xs={12} md={4} key={item.title}>
            <Paper sx={cardStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                  {item.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(218,133,82,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                  }}
                >
                  {item.icon}
                </Box>
              </Stack>
              <Box display="flex" alignItems="baseline">
                <Typography variant="h4" fontWeight={700} color={secondaryColor}>
                  {item.value}
                </Typography>
                <Chip
                  label={item.delta}
                  size="small"
                  sx={{
                    ml: 2,
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    color: '#2CA870',
                    fontWeight: 600,
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" mt={1}>
                {item.helper}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Download Share
              </Typography>
              <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Export
              </Button>
            </Stack>
            <PieChartComponent data={downloadShareData} colors={downloadShareColors} />
            <Grid container spacing={2} mt={2}>
              {downloadShareData.map((item, index) => (
                <Grid item xs={12} sm={4} key={item.name}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: downloadShareColors[index % downloadShareColors.length],
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {item.name} ({item.value}%)
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Download Growth Trend
              </Typography>
              <Button size="small" startIcon={<TimelineIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                View trend
              </Button>
            </Stack>
            <Box sx={{ height: 320 }}>
              <LineChartComponent data={downloadGrowthData} dataKey="ios" name="iOS" color="#8DD3C7" />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Stack direction="row" spacing={1} alignItems="center">
                <AndroidIcon sx={{ color: '#57B5E7' }} />
                <Typography variant="body2" color="text.secondary">
                  Android
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <AppleIcon sx={{ color: '#8DD3C7' }} />
                <Typography variant="body2" color="text.secondary">
                  iOS
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <PublicIcon sx={{ color: '#FBBF72' }} />
                <Typography variant="body2" color="text.secondary">
                  Web
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            User Growth
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#57B5E7' }} />
              <Typography variant="caption" color="text.secondary">
                MAU
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#8DD3C7' }} />
              <Typography variant="caption" color="text.secondary">
                New Users
              </Typography>
            </Stack>
          </Stack>
        </Stack>
        <Box sx={{ height: 340 }}>
          <LineChartComponent data={userGrowthData} dataKey="mau" name="Monthly Active Users" color="#57B5E7" />
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {[
          {
            title: 'Monthly Active Users',
            value: '128,459',
            delta: '+15.3%',
            hint: 'vs. previous month',
            icon: <GroupIcon fontSize="small" />,
            progress: 85.6,
            progressLabel: 'Target: 150,000',
          },
          {
            title: 'Daily Active Users',
            value: '42,871',
            delta: '+8.7%',
            hint: 'vs. previous day',
            icon: <InsightsIcon fontSize="small" />,
            progress: 85.7,
            progressLabel: 'Target: 50,000',
          },
          {
            title: 'Retention Rate',
            value: '68.4%',
            delta: '+3.2%',
            hint: 'vs. previous month',
            icon: <TrendingUpIcon fontSize="small" />,
            progress: 91.2,
            progressLabel: 'Target: 75%',
          },
        ].map((card) => (
          <Grid item xs={12} md={4} key={card.title}>
            <Paper sx={cardStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(63, 61, 86, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color={secondaryColor}>
                {card.value}
              </Typography>
              <Chip
                label={card.delta}
                size="small"
                sx={{
                  mt: 1,
                  alignSelf: 'flex-start',
                  backgroundColor: 'rgba(40, 167, 69, 0.1)',
                  color: '#2CA870',
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={1}>
                {card.hint}
              </Typography>
              <Box mt={3}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {card.progressLabel}
                  </Typography>
                  <Typography variant="caption" fontWeight={600} color={secondaryColor}>
                    {card.progress.toFixed(1)}%
                  </Typography>
                </Stack>
                {renderProgress(card.progress)}
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            User Signups by Type
          </Typography>
          <Button size="small" startIcon={<VisibilityIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
            View details
          </Button>
        </Stack>
        <Box sx={{ height: 340 }}>
          <BarChartComponent data={userSignupData} dataKey="value" nameKey="type" name="Signups" color="#57B5E7" />
        </Box>
      </Paper>
    </Stack>
  );

  const renderWebsiteTab = () => (
    <Stack spacing={6}>
      <Grid container spacing={3}>
        {[
          {
            title: 'Page Views',
            value: '284,521',
            delta: '+18.3%',
            icon: <VisibilityIcon fontSize="small" />,
            spark: pageViewSparkData,
          },
          {
            title: 'Unique Visitors',
            value: '98,742',
            delta: '+12.7%',
            icon: <GroupIcon fontSize="small" />,
            spark: uniqueVisitorSparkData,
          },
        ].map((card) => (
          <Grid item xs={12} md={6} key={card.title}>
            <Paper sx={cardStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(218,133,82,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={1} mb={2}>
                <Typography variant="h4" fontWeight={700} color={secondaryColor}>
                  {card.value}
                </Typography>
                <Chip
                  size="small"
                  label={card.delta}
                  sx={{
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    color: '#2CA870',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" mb={3}>
                vs. previous period
              </Typography>
              <Box sx={{ height: 160 }}>
                <LineChartComponent data={card.spark} dataKey="value" name={card.title} color="#57B5E7" />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {[
          {
            title: 'Avg. Time on Site',
            value: '4m 32s',
            delta: '+8.4%',
            icon: <AccessTimeIcon fontSize="small" />,
          },
          {
            title: 'Bounce Rate',
            value: '32.8%',
            delta: '+2.1%',
            icon: <TimelineIcon fontSize="small" />,
            isNegative: true,
          },
        ].map((card) => (
          <Grid item xs={12} md={6} key={card.title}>
            <Paper sx={cardStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(63, 61, 86, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h4" fontWeight={700} color={secondaryColor}>
                  {card.value}
                </Typography>
                <Chip
                  size="small"
                  label={card.delta}
                  sx={{
                    backgroundColor: card.isNegative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                    color: card.isNegative ? '#EF4444' : '#2CA870',
                    fontWeight: 600,
                  }}
                />
              </Stack>
              <Typography variant="caption" color="text.secondary" mt={1}>
                vs. previous period
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Top Cities
              </Typography>
              <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Export
              </Button>
            </Stack>
            <Stack spacing={3}>
              {[
                { label: 'New Delhi', value: 24.5 },
                { label: 'Mumbai', value: 18.7 },
                { label: 'Bangalore', value: 15.2 },
                { label: 'Kolkata', value: 12.8 },
                { label: 'Chennai', value: 9.4 },
              ].map((row) => (
                <Box key={row.label}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                      {row.label}
                    </Typography>
                    <Typography variant="caption" fontWeight={600} color={secondaryColor}>
                      {row.value}%
                    </Typography>
                  </Stack>
                  {renderProgress(row.value)}
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Device Type
              </Typography>
              <Button size="small" startIcon={<DevicesIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Breakdown
              </Button>
            </Stack>
            <PieChartComponent data={deviceShareData} colors={downloadShareColors} />
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            Most Clicked Pages
          </Typography>
          <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
            Export
          </Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Page', 'Views', 'Avg. Time', 'Bounce Rate', 'Conversion'].map((header) => (
                  <TableCell key={header}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  page: 'Homepage',
                  path: '/',
                  views: '42,582',
                  time: '2m 15s',
                  bounce: '28.6%',
                  conversion: '4.8%',
                },
                {
                  page: 'Heritage Sites',
                  path: '/sites',
                  views: '36,127',
                  time: '3m 42s',
                  bounce: '22.3%',
                  conversion: '7.2%',
                },
                {
                  page: 'Events',
                  path: '/events',
                  views: '28,954',
                  time: '4m 08s',
                  bounce: '19.7%',
                  conversion: '8.5%',
                },
                {
                  page: 'Accommodations',
                  path: '/hotels',
                  views: '24,731',
                  time: '3m 27s',
                  bounce: '25.1%',
                  conversion: '6.3%',
                },
                {
                  page: 'Tour Guides',
                  path: '/guides',
                  views: '19,845',
                  time: '2m 56s',
                  bounce: '27.8%',
                  conversion: '5.7%',
                },
              ].map((row) => (
                <TableRow key={row.page} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                        {row.page}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.path}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.views}
                      </Typography>
                      <Typography variant="caption" color="#2CA870">
                        +12.4%
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.time}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.bounce}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.conversion}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );

  const renderRevenueTab = () => (
    <Stack spacing={6}>
      <Grid container spacing={3}>
        {[
          { title: 'Total Revenue', value: '₹24.8M', delta: '+18.7%', icon: <PaymentsIcon fontSize="small" /> },
          { title: 'Avg. Booking', value: '₹3,842', delta: '+7.2%', icon: <ShoppingCartCheckoutIcon fontSize="small" /> },
          { title: 'Success Rate', value: '94.2%', delta: '+2.1%', icon: <TrendingUpIcon fontSize="small" /> },
          { title: 'Refund Rate', value: '2.8%', delta: '+0.4%', icon: <TimelineIcon fontSize="small" />, negative: true },
        ].map((card) => (
          <Grid item xs={12} md={3} key={card.title}>
            <Paper sx={cardStyle}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(218,133,82,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: primaryColor,
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} color={secondaryColor}>
                {card.value}
              </Typography>
              <Chip
                size="small"
                label={card.delta}
                sx={{
                  mt: 2,
                  alignSelf: 'flex-start',
                  backgroundColor: card.negative ? 'rgba(239, 68, 68, 0.1)' : 'rgba(40, 167, 69, 0.1)',
                  color: card.negative ? '#EF4444' : '#2CA870',
                  fontWeight: 600,
                }}
              />
              <Typography variant="caption" color="text.secondary" mt={1}>
                vs. previous period
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Revenue by Category
              </Typography>
              <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Export
              </Button>
            </Stack>
            <PieChartComponent data={revenueCategoryData} colors={downloadShareColors} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Revenue Over Time
              </Typography>
              <ButtonGroup size="small" sx={{ borderRadius: 999 }}>
                {['Daily', 'Weekly', 'Monthly'].map((label) => (
                  <Button key={label} sx={{ textTransform: 'none' }}>
                    {label}
                  </Button>
                ))}
              </ButtonGroup>
            </Stack>
            <Box sx={{ height: 320 }}>
              <LineChartComponent data={revenueTrendData} dataKey="value" name="Revenue" color="#57B5E7" />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            Top Revenue Sources
          </Typography>
          <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
            Export
          </Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Source', 'Revenue', 'Bookings', 'Avg. Value', 'Growth'].map((header) => (
                  <TableCell key={header}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  title: 'Mobile App',
                  description: 'Direct bookings',
                  revenue: '₹9.2M',
                  bookings: '2,487',
                  avg: '₹3,699',
                  growth: '24.8%',
                },
                {
                  title: 'Website',
                  description: 'Direct bookings',
                  revenue: '₹6.7M',
                  bookings: '1,842',
                  avg: '₹3,637',
                  growth: '18.2%',
                },
                {
                  title: 'Partner Agencies',
                  description: 'Travel agents',
                  revenue: '₹4.3M',
                  bookings: '1,124',
                  avg: '₹3,825',
                  growth: '12.7%',
                },
                {
                  title: 'Google Ads',
                  description: 'PPC campaigns',
                  revenue: '₹2.8M',
                  bookings: '742',
                  avg: '₹3,774',
                  growth: '15.4%',
                },
                {
                  title: 'Social Media',
                  description: 'Instagram, Facebook',
                  revenue: '₹1.8M',
                  bookings: '487',
                  avg: '₹3,696',
                  growth: '22.1%',
                },
              ].map((row) => (
                <TableRow key={row.title} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                        {row.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.description}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.revenue}
                      </Typography>
                      <Typography variant="caption" color="#2CA870">
                        +{row.growth}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.bookings}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.avg}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.growth}
                      sx={{
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        color: '#2CA870',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Payment Methods
              </Typography>
              <Button size="small" startIcon={<PaymentsIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                Breakdown
              </Button>
            </Stack>
            <PieChartComponent
              data={[
                { name: 'UPI', value: 48 },
                { name: 'Cards', value: 32 },
                { name: 'Wallets', value: 12 },
                { name: 'NetBanking', value: 8 },
              ]}
              colors={downloadShareColors}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper sx={cardStyle}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
                Revenue by User Type
              </Typography>
              <Button size="small" startIcon={<GroupIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
                View details
              </Button>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {['User Type', 'Revenue', 'Share', 'Avg. Order', 'Growth'].map((header) => (
                      <TableCell key={header}>
                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                          {header}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      label: 'Tourists',
                      revenue: '₹14.2M',
                      share: 57,
                      avg: '₹3,842',
                      growth: '18.4%',
                    },
                    {
                      label: 'Tour Groups',
                      revenue: '₹6.8M',
                      share: 27,
                      avg: '₹12,754',
                      growth: '22.7%',
                    },
                    {
                      label: 'Corporate',
                      revenue: '₹2.5M',
                      share: 10,
                      avg: '₹8,542',
                      growth: '15.2%',
                    },
                    {
                      label: 'Educational',
                      revenue: '₹1.3M',
                      share: 6,
                      avg: '₹2,874',
                      growth: '8.7%',
                    },
                  ].map((row) => (
                    <TableRow key={row.label} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                          {row.label}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.revenue}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          {renderProgress(row.share)}
                          <Typography variant="caption" color="text.secondary">
                            {row.share}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {row.avg}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.growth}
                          sx={{
                            backgroundColor: 'rgba(40, 167, 69, 0.1)',
                            color: '#2CA870',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderSocialTab = () => (
    <Stack spacing={6}>
      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            Platform Stats
          </Typography>
          <Button size="small" startIcon={<DownloadIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
            Export
          </Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Platform', 'Followers', 'Engagement', 'Reach', 'Growth', 'Actions'].map((header) => (
                  <TableCell key={header}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {socialPlatformRows.map((row) => (
                <TableRow key={row.platform} hover>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(63, 61, 86, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {row.icon}
                      </Box>
                      <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                        {row.platform}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.followers}
                      </Typography>
                      <Typography variant="caption" color="#2CA870">
                        {row.followersDelta}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.engagement}
                      </Typography>
                      <Typography variant="caption" color={row.engagementDelta.startsWith('-') ? '#EF4444' : '#2CA870'}>
                        {row.engagementDelta}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2" fontWeight={600}>
                        {row.reach}
                      </Typography>
                      <Typography variant="caption" color="#2CA870">
                        {row.reachDelta}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.growth}
                      sx={{
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        color: '#2CA870',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" sx={{ textTransform: 'none', borderRadius: 999 }}>
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            Engagement Overview
          </Typography>
          <Stack direction="row" spacing={3}>
            {[
              { label: 'Views', color: '#57B5E7' },
              { label: 'Likes', color: '#8DD3C7' },
              { label: 'Comments', color: '#FBBF72' },
              { label: 'Shares', color: '#FC8D62' },
            ].map((legend) => (
              <Stack direction="row" spacing={1} alignItems="center" key={legend.label}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: legend.color }} />
                <Typography variant="caption" color="text.secondary">
                  {legend.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Box sx={{ height: 340 }}>
          <LineChartComponent data={engagementTrendData} dataKey="views" name="Views" color="#57B5E7" />
        </Box>
      </Paper>

      <Paper sx={cardStyle}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="subtitle1" fontWeight={600} color={secondaryColor}>
            Top Performing Content
          </Typography>
          <Button size="small" startIcon={<ShareIcon />} sx={{ borderRadius: 999, textTransform: 'none' }}>
            Share report
          </Button>
        </Stack>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {['Content', 'Platform', 'Post Type', 'Reach', 'Likes', 'Comments', 'Shares'].map((header) => (
                  <TableCell key={header}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      {header}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                {
                  title: 'Sunset at the Taj Mahal',
                  platform: 'Instagram',
                  type: 'Photo',
                  reach: '48.7K',
                  likes: '8,452',
                  comments: '342',
                  shares: '1,245',
                  icon: <InstagramIcon fontSize="small" sx={{ color: '#E1306C' }} />,
                },
                {
                  title: 'Kathakali Dance Performance',
                  platform: 'YouTube',
                  type: 'Video',
                  reach: '42.3K',
                  likes: '3,874',
                  comments: '287',
                  shares: '945',
                  icon: <YouTubeIcon fontSize="small" sx={{ color: '#FF0000' }} />,
                },
                {
                  title: 'Flavours of India: Spice Tour',
                  platform: 'Facebook',
                  type: 'Carousel',
                  reach: '35.8K',
                  likes: '2,954',
                  comments: '247',
                  shares: '876',
                  icon: <FacebookIcon fontSize="small" sx={{ color: '#1877F2' }} />,
                },
                {
                  title: 'Temple Architecture Guide',
                  platform: 'LinkedIn',
                  type: 'Article',
                  reach: '28.4K',
                  likes: '1,842',
                  comments: '124',
                  shares: '587',
                  icon: <LinkedInIcon fontSize="small" sx={{ color: '#0A66C2' }} />,
                },
                {
                  title: 'Holi Festival Guide 2025',
                  platform: 'Twitter',
                  type: 'Thread',
                  reach: '24.7K',
                  likes: '1,654',
                  comments: '187',
                  shares: '742',
                  icon: <TwitterIcon fontSize="small" sx={{ color: '#000000' }} />,
                },
              ].map((row) => (
                <TableRow key={row.title} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color={secondaryColor}>
                      {row.title}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {row.icon}
                      <Typography variant="body2">{row.platform}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip size="small" label={row.type} sx={{ textTransform: 'none', borderRadius: 999 }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.reach}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.likes}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.comments}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {row.shares}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );

  const renderPlaceholderTab = (label: string) => (
    <Paper sx={cardStyle}>
      <Stack spacing={2} alignItems="center" textAlign="center">
        <Typography variant="h5" fontWeight={700} color={secondaryColor}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={460}>
          This section is coming soon. We are working on surfacing the most relevant metrics and insights for this
          category based on your analytics data.
        </Typography>
        <Button variant="contained" sx={{ borderRadius: 999, textTransform: 'none' }}>
          Notify me
        </Button>
      </Stack>
    </Paper>
  );

  const tabConfig: Array<{ label: string; value: DashboardTab }> = [
    { label: 'Application', value: 'application' },
    { label: 'Tourist Behaviour', value: 'tourist-behaviour' },
    { label: 'Heritage Health', value: 'heritage-health' },
    { label: 'Crowd Management', value: 'crowd-mgmt' },
    { label: 'Tourism Influx', value: 'tourism-influx' },
    { label: 'Website', value: 'website' },
    { label: 'Revenue', value: 'revenue' },
    { label: 'Social Media', value: 'social' },
  ];

  const tabRenderer: Record<DashboardTab, JSX.Element> = {
    application: renderApplicationTab(),
    'tourist-behaviour': renderPlaceholderTab('Tourist Behaviour'),
    'heritage-health': renderPlaceholderTab('Heritage Health'),
    'crowd-mgmt': renderPlaceholderTab('Crowd Management'),
    'tourism-influx': renderPlaceholderTab('Tourism Influx'),
    website: renderWebsiteTab(),
    revenue: renderRevenueTab(),
    social: renderSocialTab(),
  };

  return (
    <Box sx={{ backgroundColor: '#FDF8F4', minHeight: '100vh', py: 6 }}>
      <Box sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, md: 4 } }}>
        <Box mb={4}>
          <Typography variant="h4" fontWeight={700} color={secondaryColor}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, Alexander! Here&apos;s what&apos;s happening with your heritage app.
          </Typography>
        </Box>

        <Box sx={{ borderBottom: '1px solid rgba(63, 61, 86, 0.1)', mb: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
            {tabConfig.map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                sx={{
                  borderRadius: 0,
                  borderBottom: activeTab === tab.value ? `3px solid ${primaryColor}` : '3px solid transparent',
                  color: activeTab === tab.value ? primaryColor : 'rgba(63, 61, 86, 0.6)',
                  fontWeight: activeTab === tab.value ? 700 : 500,
                  textTransform: 'none',
                  py: 2,
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>
        </Box>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          mb={4}
        >
          <Typography variant="subtitle2" color="text.secondary">
            Last synced: 5 mins ago
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <ButtonGroup variant="contained" sx={{ borderRadius: 999, backgroundColor: 'transparent' }}>
              {dateFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => setActiveDateFilter(option.value)}
                  startIcon={option.value === 'custom' ? <CalendarMonthIcon fontSize="small" /> : undefined}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: activeDateFilter === option.value ? primaryColor : '#ffffff',
                    color: activeDateFilter === option.value ? '#ffffff' : secondaryColor,
                    '&:hover': {
                      backgroundColor: activeDateFilter === option.value ? '#c9733f' : '#fff4ec',
                    },
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>
            {activeDateFilter === 'custom' && (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
                  01 Jun 2025
                </Button>
                <Button variant="outlined" sx={{ borderRadius: 999, textTransform: 'none' }}>
                  30 Jun 2025
                </Button>
                <Button variant="contained" sx={{ borderRadius: 999, textTransform: 'none' }}>
                  Apply
                </Button>
              </Stack>
            )}
            <Button variant="outlined" sx={{ borderRadius: '50%', minWidth: 44, minHeight: 44 }}>
              <DownloadIcon fontSize="small" />
            </Button>
          </Stack>
        </Stack>

        <Stack spacing={6}>{tabRenderer[activeTab]}</Stack>
      </Box>
    </Box>
  );
};

export default Dashboard2;

