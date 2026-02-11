import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  Link,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  MoreHoriz as MoreHorizIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  CalendarMonth as CalendarMonthIcon,
  StarRounded as StarRoundedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ArchiveOutlined as ArchiveOutlinedIcon,
  ReplyOutlined as ReplyOutlinedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import {
  FeedbackService,
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FEEDBACK_CATEGORY_LABELS,
} from '@/services/feedback.service';

type TabKey =
  | 'booking'
  | 'activity'
  | 'vendors'
  | 'feedback'
  | 'comments'
  | 'events'
  | 'footfall'
  | 'sentiment'
  | 'authentication'
  | 'ads';

const TAB_ORDER: Array<{ key: TabKey; label: string }> = [
  { key: 'booking', label: 'Booking Reports' },
  { key: 'activity', label: 'User Activity' },
  { key: 'vendors', label: 'Vendor Reports' },
  { key: 'feedback', label: 'Feedback & Complaints' },
  { key: 'comments', label: 'Comments' },
  { key: 'events', label: 'Event Reports' },
  { key: 'footfall', label: 'Footfall Logs' },
  { key: 'sentiment', label: 'Sentiment Reports' },
  { key: 'authentication', label: 'Authentication Report' },
  { key: 'ads', label: 'Ad Performance' },
];

const today = new Date('2025-06-13T10:45:00');

const Reports2 = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('booking');
  const [eventView, setEventView] = useState<'month' | 'year'>('month');

  const handleTabChange = (_event: React.SyntheticEvent, value: TabKey) => {
    setActiveTab(value);
  };

  const renderTabContent = useMemo(() => {
    const components: Record<TabKey, JSX.Element> = {
      booking: <BookingReportsSection />,
      activity: <UserActivitySection />,
      vendors: <VendorReportsSection />,
      feedback: <FeedbackSection />,
      comments: <CommentsSection />,
      events: <EventReportsSection view={eventView} onViewChange={setEventView} />,
      footfall: <FootfallLogsSection />,
      sentiment: <SentimentReportsSection />,
      authentication: <AuthenticationSection />,
      ads: <AdPerformanceSection />,
    };

    return components[activeTab];
  }, [activeTab, eventView]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" component="h1">
            Reports 2
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Deep-dive into platform analytics, user activity, events, and marketing performance.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<DownloadIcon />}>
          Export All
        </Button>
      </Box>

      <Breadcrumbs sx={{ mb: 3 }} separator="›" aria-label="breadcrumb">
        <Link color="inherit" underline="hover" onClick={(event) => event.preventDefault()} sx={{ cursor: 'default' }}>
          Admin
        </Link>
        <Typography color="text.primary">Reports 2</Typography>
      </Breadcrumbs>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          {TAB_ORDER.map((tab) => (
            <Tab key={tab.key} label={tab.label} value={tab.key} />
          ))}
        </Tabs>
      </Paper>

      {renderTabContent}
    </Box>
  );
};

const TableTitle = ({ title, subtitle }: { title: string; subtitle?: string }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" component="h2">
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    )}
  </Box>
);

const BookingReportsSection = () => {
  const bookings = [
    {
      id: '#BK-78942',
      date: today,
      user: 'Rahul Kumar',
      entity: 'Taj Mahal Heritage Tour',
      vendor: 'Agra Heritage Walks',
      status: 'Confirmed',
      paymentMode: 'UPI',
      amount: 2499,
    },
    {
      id: '#BK-78941',
      date: new Date('2025-06-12T16:30:00'),
      user: 'Ananya Patel',
      entity: 'Mysore Palace Evening Light Show',
      vendor: 'Karnataka Tourism',
      status: 'Confirmed',
      paymentMode: 'Credit Card',
      amount: 1200,
    },
    {
      id: '#BK-78940',
      date: new Date('2025-06-12T13:15:00'),
      user: 'Vikram Reddy',
      entity: 'Rajasthan Heritage Hotel Package',
      vendor: 'Royal Retreats',
      status: 'Cancelled',
      paymentMode: 'Wallet',
      amount: 12500,
    },
    {
      id: '#BK-78939',
      date: new Date('2025-06-11T11:20:00'),
      user: 'Shreya Desai',
      entity: 'Kerala Backwaters Houseboat',
      vendor: 'Alleppey Cruises',
      status: 'Refunded',
      paymentMode: 'UPI',
      amount: 8750,
    },
    {
      id: '#BK-78938',
      date: new Date('2025-06-10T09:45:00'),
      user: 'Priya Joshi',
      entity: 'Varanasi Ganga Aarti Experience',
      vendor: 'Banaras Cultural Tours',
      status: 'Confirmed',
      paymentMode: 'Debit Card',
      amount: 1850,
    },
  ];

  const statusColorMap: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
    Confirmed: 'success',
    Cancelled: 'error',
    Refunded: 'warning',
  };

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Booking Reports" subtitle="Overview of the latest reservations and payment statuses." />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Booking ID</TableCell>
            <TableCell>Date &amp; Time</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Entity</TableCell>
            <TableCell>Vendor/Guide</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Payment Mode</TableCell>
            <TableCell align="right">Amount (₹)</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bookings.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell>
                <Link underline="hover" color="primary">
                  {row.id}
                </Link>
              </TableCell>
              <TableCell>{format(row.date, 'MMM dd, yyyy · hh:mm a')}</TableCell>
              <TableCell>{row.user}</TableCell>
              <TableCell>{row.entity}</TableCell>
              <TableCell>{row.vendor}</TableCell>
              <TableCell>
                <Chip size="small" label={row.status} color={statusColorMap[row.status] ?? 'default'} />
              </TableCell>
              <TableCell>{row.paymentMode}</TableCell>
              <TableCell align="right">{row.amount.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More">
                  <IconButton>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing 1–5 of 42 bookings
        </Typography>
        <PaginationSummary />
      </Box>
    </Paper>
  );
};

const UserActivitySection = () => {
  const activities = [
    {
      user: 'Rahul Kumar',
      role: 'Tourist',
      activity: 'Booking',
      target: 'Taj Mahal Heritage Tour',
      device: 'iPhone 15 Pro · iOS 18.1',
      ip: '103.25.178.45 · Delhi',
      timestamp: today,
    },
    {
      user: 'Ananya Patel',
      role: 'Tourist',
      activity: 'Login',
      target: 'Mobile App',
      device: 'Samsung Galaxy S23 · Android 14',
      ip: '45.118.132.89 · Mumbai',
      timestamp: new Date('2025-06-13T09:30:00'),
    },
    {
      user: 'Priya Joshi',
      role: 'Tourist',
      activity: 'Wishlist',
      target: 'Rajasthan Heritage Hotel Package',
      device: 'MacBook Pro · macOS 15.2',
      ip: '122.176.47.98 · Bangalore',
      timestamp: new Date('2025-06-12T20:15:00'),
    },
    {
      user: 'Vikram Reddy',
      role: 'Tourist',
      activity: 'Review',
      target: 'Kerala Backwaters Houseboat',
      device: 'iPad Air · iPadOS 18.0',
      ip: '59.92.114.76 · Hyderabad',
      timestamp: new Date('2025-06-12T18:40:00'),
    },
    {
      user: 'Shreya Desai',
      role: 'Tourist',
      activity: 'Booking',
      target: 'Varanasi Ganga Aarti Experience',
      device: 'OnePlus 12 · Android 14',
      ip: '117.242.35.188 · Kolkata',
      timestamp: new Date('2025-06-12T17:20:00'),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle
        title="User Activity"
        subtitle="Track critical interactions across destinations, marketing funnels, and user journeys."
      />

      <ControlChips items={['All', 'Bookings', 'Logins', 'Reviews', 'Wishlist']} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User Name</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Page/Target</TableCell>
            <TableCell>Device &amp; OS</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Timestamp</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((row) => (
            <TableRow key={row.user} hover>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar>{row.user.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Avatar>
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {row.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.role}
                    </Typography>
                  </Box>
                </Box>
              </TableCell>
              <TableCell>{row.activity}</TableCell>
              <TableCell>{row.target}</TableCell>
              <TableCell>{row.device}</TableCell>
              <TableCell>{row.ip}</TableCell>
              <TableCell>{format(row.timestamp, 'MMM dd, yyyy · hh:mm a')}</TableCell>
              <TableCell align="right">
                <Button variant="contained" size="small">
                  View Session
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Showing 1–5 of 124 activities
        </Typography>
        <PaginationSummary totalPages={25} />
      </Box>
    </Paper>
  );
};

const VendorReportsSection = () => {
  const vendors = [
    {
      name: 'Agra Heritage Walks',
      type: 'Local Guide',
      tag: 'Heritage',
      totalBookings: 248,
      revenue: 620000,
      rating: 4.8,
      complaints: 2,
      lastActive: today,
    },
    {
      name: 'Karnataka Tourism',
      type: 'Event Organizer',
      tag: 'Government',
      totalBookings: 412,
      revenue: 845000,
      rating: 4.6,
      complaints: 5,
      lastActive: new Date('2025-06-12T16:30:00'),
    },
    {
      name: 'Royal Retreats',
      type: 'Hotel',
      tag: 'Luxury',
      totalBookings: 156,
      revenue: 1950000,
      rating: 4.9,
      complaints: 1,
      lastActive: new Date('2025-06-12T13:15:00'),
    },
    {
      name: 'Alleppey Cruises',
      type: 'Tour Operator',
      tag: 'Eco-Tourism',
      totalBookings: 203,
      revenue: 1775000,
      rating: 4.7,
      complaints: 3,
      lastActive: new Date('2025-06-11T11:20:00'),
    },
    {
      name: 'Banaras Cultural Tours',
      type: 'Local Guide',
      tag: 'Religious',
      totalBookings: 175,
      revenue: 325000,
      rating: 4.5,
      complaints: 4,
      lastActive: new Date('2025-06-10T09:45:00'),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Vendor Reports" subtitle="Monitor partner performance, satisfaction, and experience quality." />

      <ControlChips items={['All Vendors', 'Artisans', 'Hotels', 'Event Organizers', 'Local Guides', 'Food Vendors']} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Vendor Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Category Tag</TableCell>
            <TableCell align="right">Total Bookings</TableCell>
            <TableCell align="right">Revenue Generated (₹)</TableCell>
            <TableCell align="right">Avg. Rating</TableCell>
            <TableCell align="right">Complaint Count</TableCell>
            <TableCell>Last Active Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vendors.map((vendor) => (
            <TableRow key={vendor.name} hover>
              <TableCell>{vendor.name}</TableCell>
              <TableCell>{vendor.type}</TableCell>
              <TableCell>
                <Chip size="small" label={vendor.tag} color="default" />
              </TableCell>
              <TableCell align="right">{vendor.totalBookings}</TableCell>
              <TableCell align="right">{vendor.revenue.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">
                <RatingDisplay rating={vendor.rating} />
              </TableCell>
              <TableCell align="right">{vendor.complaints}</TableCell>
              <TableCell>{format(vendor.lastActive, 'MMM dd, yyyy · hh:mm a')}</TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More">
                  <IconButton>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 78 vendors" totalPages={16} />
    </Paper>
  );
};

const FEEDBACK_CATEGORY_CHIPS: Array<{ label: string; value: FeedbackCategory | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'UI/UX', value: 'uiux' },
  { label: 'Bug Report', value: 'bug' },
  { label: 'Performance', value: 'performance' },
  { label: 'Other', value: 'other' },
];

const STATUS_COLORS: Record<FeedbackStatus, 'default' | 'primary' | 'success' | 'warning'> = {
  Open: 'primary',
  'In Progress': 'warning',
  Resolved: 'success',
};

const FeedbackSection = () => {
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'All'>('All');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await FeedbackService.getFeedbackList({
        type: categoryFilter === 'All' ? undefined : categoryFilter,
        page,
        limit,
      });
      setItems(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, page, limit]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleResolve = async (item: FeedbackItem) => {
    const result = await FeedbackService.updateStatus(item.feedback_id, 'Resolved');
    if (result.success) fetchFeedback();
  };

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const summary = total === 0 ? 'No items' : `Showing ${from}–${to} of ${total} items`;

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Feedback & Complaints" subtitle="Central log of all user feedback with actionable context." />

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {FEEDBACK_CATEGORY_CHIPS.map((chip) => (
          <Chip
            key={chip.value}
            label={chip.label}
            variant={categoryFilter === chip.value ? 'filled' : 'outlined'}
            color={categoryFilter === chip.value ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(chip.value)}
            sx={{ cursor: 'pointer' }}
          />
        ))}
      </Box>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No feedback yet. Data comes from the database.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.feedback_id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar>
                          {item.user_name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)}
                        </Avatar>
                        <Typography variant="body2">{item.user_name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{FEEDBACK_CATEGORY_LABELS[item.type] ?? item.type}</TableCell>
                    <TableCell>{item.user_type_name}</TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.comments || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={item.status}
                        color={STATUS_COLORS[item.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(item.created_at), 'MMM dd, yyyy')}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="View">
                        <IconButton>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Resolve">
                        <IconButton onClick={() => handleResolve(item)} disabled={item.status === 'Resolved'}>
                          <CheckCircleOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Archive">
                        <IconButton>
                          <ArchiveOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              {summary}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button size="small" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Typography variant="caption" color="text.secondary">
                Page {page} of {totalPages || 1}
              </Typography>
              <Button
                size="small"
                disabled={page >= (totalPages || 1)}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  );
};

const CommentsSection = () => {
  const comments = [
    {
      name: 'Aditya Mehta',
      type: 'Heritage Site',
      entity: 'Taj Mahal',
      preview: 'The architecture is breathtaking! The intricate marble work and the symmetry of the building...',
      rating: 5,
      date: new Date('2025-06-15'),
    },
    {
      name: 'Sanjay Kumar',
      type: 'Vendor',
      entity: 'Royal Retreats',
      preview: 'Excellent hospitality and authentic Rajasthani experience. The staff was very courteous and...',
      rating: 4.5,
      date: new Date('2025-06-14'),
    },
    {
      name: 'Riya Patel',
      type: 'Event',
      entity: 'Mysore Dasara Festival',
      preview: 'The grand procession was spectacular! The elephant parade and cultural performances were...',
      rating: 4.8,
      date: new Date('2025-06-13'),
    },
    {
      name: 'Vikram Khanna',
      type: 'Local Guide',
      entity: 'Kerala Backwaters Tour',
      preview: 'Our guide was extremely knowledgeable about the local ecosystem and culture. He made the...',
      rating: 5,
      date: new Date('2025-06-12'),
    },
    {
      name: 'Neha Sharma',
      type: 'Heritage Site',
      entity: 'Hampi Ruins',
      preview: 'The historical significance and architectural brilliance of Hampi is awe-inspiring. The stone...',
      rating: 4.7,
      date: new Date('2025-06-11'),
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Comments" subtitle="Moderate public feedback across heritage sites, partners, and events." />

      <ControlChips items={['All', 'Heritage Sites', 'Vendors', 'Events', 'Local Guides', 'Food']} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Entity Name</TableCell>
            <TableCell>Comment Preview</TableCell>
            <TableCell align="right">Rating</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {comments.map((comment) => (
            <TableRow key={`${comment.name}-${comment.entity}`} hover>
              <TableCell>{comment.name}</TableCell>
              <TableCell>
                <Chip size="small" label={comment.type} />
              </TableCell>
              <TableCell>{comment.entity}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Typography variant="body2" color="text.secondary">
                  {comment.preview}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <RatingDisplay rating={comment.rating} />
              </TableCell>
              <TableCell>{format(comment.date, 'MMM dd, yyyy')}</TableCell>
              <TableCell align="right">
                <Tooltip title="View full">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reply">
                  <IconButton>
                    <ReplyOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 48 comments" totalPages={10} />
    </Paper>
  );
};

const EventReportsSection = ({
  view,
  onViewChange,
}: {
  view: 'month' | 'year';
  onViewChange: (view: 'month' | 'year') => void;
}) => {
  const events = [
    { date: '2025-06-02', title: 'Classical Dance Festival', type: 'Cultural' },
    { date: '2025-06-06', title: 'World Heritage Day', type: 'Global' },
    { date: '2025-06-13', title: 'Rajasthan Folk Festival', type: 'Event' },
    { date: '2025-06-13', title: 'Artisan Exhibition', type: 'Artisans' },
    { date: '2025-06-14', title: 'Taj Mahal Special Tour', type: 'Heritage' },
    { date: '2025-06-25', title: 'Varanasi Cultural Event', type: 'Festival' },
    { date: '2025-06-29', title: 'Eco Tourism Workshop', type: 'Sustainability' },
  ];

  const monthGrid = generateMonthGrid(6, 2025, events);

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Event Reports" subtitle="Calendar of heritage events, festivals, and partner activations." />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          mb: 3,
        }}
      >
        <ToggleButtonGroup
          exclusive
          value={view}
          onChange={(_event, value) => value && onViewChange(value)}
          size="small"
        >
          <ToggleButton value="month">Month View</ToggleButton>
          <ToggleButton value="year">Year View</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            June 2025
          </Typography>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export PDF
          </Button>
        </Box>
      </Box>

      <Grid container spacing={1}>
        {monthGrid.map((week, index) => (
          <Grid item xs={12} key={index}>
            <Grid container columns={7}>
              {week.map((day) => (
                <Grid
                  key={day.dateKey}
                  item
                  xs={12 / 7}
                  sx={{
                    border: '1px solid #f0f0f0',
                    minHeight: 110,
                    p: 1,
                    backgroundColor: day.isToday ? '#fde6df' : 'transparent',
                  }}
                >
                  <Typography variant="caption" fontWeight={600}>
                    {day.label}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    {day.events.map((event) => (
                      <Chip
                        key={`${day.dateKey}-${event.title}`}
                        size="small"
                        label={event.title}
                        icon={<CalendarMonthIcon fontSize="small" />}
                        sx={{
                          alignSelf: 'flex-start',
                          backgroundColor: '#f0806020',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

const FootfallLogsSection = () => {
  const sites = [
    {
      site: 'Taj Mahal',
      date: new Date('2025-08-07'),
      totalVisitors: 12458,
      peakHours: '09:00 – 11:00',
      domestic: 8945,
      international: 3513,
      revenue: 2491600,
    },
    {
      site: 'Mysore Palace',
      date: new Date('2025-08-07'),
      totalVisitors: 8756,
      peakHours: '10:00 – 12:00',
      domestic: 7234,
      international: 1522,
      revenue: 1313400,
    },
    {
      site: 'Hampi Ruins',
      date: new Date('2025-08-07'),
      totalVisitors: 4567,
      peakHours: '08:00 – 10:00',
      domestic: 3890,
      international: 677,
      revenue: 685050,
    },
    {
      site: 'Khajuraho Temples',
      date: new Date('2025-08-07'),
      totalVisitors: 3245,
      peakHours: '09:30 – 11:30',
      domestic: 2567,
      international: 678,
      revenue: 486750,
    },
    {
      site: 'Sun Temple',
      date: new Date('2025-08-07'),
      totalVisitors: 2890,
      peakHours: '07:00 – 09:00',
      domestic: 2345,
      international: 545,
      revenue: 433500,
    },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Footfall Logs" subtitle="Monitor visitor traffic, dwell time, and revenue contribution per site." />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <Button variant="outlined">All Sites</Button>
        <Button variant="outlined" startIcon={<CalendarMonthIcon />}>
          mm/dd/yyyy
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />}>
          Export Data
        </Button>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Site Name</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total Visitors</TableCell>
            <TableCell>Peak Hours</TableCell>
            <TableCell align="right">Domestic</TableCell>
            <TableCell align="right">International</TableCell>
            <TableCell align="right">Revenue (₹)</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sites.map((site) => (
            <TableRow key={site.site} hover>
              <TableCell>{site.site}</TableCell>
              <TableCell>{format(site.date, 'MMM dd, yyyy')}</TableCell>
              <TableCell align="right">{site.totalVisitors.toLocaleString('en-IN')}</TableCell>
              <TableCell>{site.peakHours}</TableCell>
              <TableCell align="right">{site.domestic.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">{site.international.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">{site.revenue.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Download">
                  <IconButton>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 25 sites" totalPages={5} />
    </Paper>
  );
};

const SentimentReportsSection = () => {
  const sentiments = [
    {
      date: new Date('2025-08-07'),
      source: 'Review',
      category: 'Service',
      feedback: 'The guide was extremely knowledgeable and made the tour very engaging...',
      sentiment: 'Positive',
      site: 'Taj Mahal',
      user: 'Rahul Kumar',
    },
    {
      date: new Date('2025-08-07'),
      source: 'Feedback',
      category: 'Facilities',
      feedback: 'The restroom facilities need improvement and better maintenance...',
      sentiment: 'Negative',
      site: 'Mysore Palace',
      user: 'Ananya Patel',
    },
    {
      date: new Date('2025-08-07'),
      source: 'Review',
      category: 'Experience',
      feedback: 'The site was well-maintained but the crowd management could be better...',
      sentiment: 'Neutral',
      site: 'Hampi Ruins',
      user: 'Vikram Reddy',
    },
    {
      date: new Date('2025-08-07'),
      source: 'Feedback',
      category: 'Accessibility',
      feedback: 'The new ramp installations have made it much easier for wheelchair access...',
      sentiment: 'Positive',
      site: 'Khajuraho Temples',
      user: 'Shreya Desai',
    },
    {
      date: new Date('2025-08-07'),
      source: 'Review',
      category: 'Value',
      feedback: 'The entry fee is quite reasonable considering the historical significance...',
      sentiment: 'Positive',
      site: 'Sun Temple',
      user: 'Priya Joshi',
    },
  ];

  const sentimentColor: Record<string, 'success' | 'default' | 'warning' | 'error'> = {
    Positive: 'success',
    Neutral: 'default',
    Negative: 'error',
  };

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle
        title="Sentiment Reports"
        subtitle="Blend of qualitative user feedback segmented by platform, category, and location."
      />

      <ControlChips items={['All', 'Positive', 'Neutral', 'Negative']} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>Source</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Feedback</TableCell>
            <TableCell>Sentiment</TableCell>
            <TableCell>Site</TableCell>
            <TableCell>User</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sentiments.map((item, index) => (
            <TableRow key={index} hover>
              <TableCell>{format(item.date, 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <Chip size="small" label={item.source} />
              </TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Typography variant="body2" color="text.secondary">
                  {item.feedback}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip size="small" label={item.sentiment} color={sentimentColor[item.sentiment] ?? 'default'} />
              </TableCell>
              <TableCell>{item.site}</TableCell>
              <TableCell>{item.user}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 42 reports" totalPages={9} />
    </Paper>
  );
};

const AuthenticationSection = () => {
  const activities = [
    {
      user: 'Sanjay Kumar',
      role: 'Admin',
      activity: 'Login',
      device: 'MacBook Pro · macOS 15.2',
      ip: '103.25.178.45',
      location: 'Mumbai, India',
      status: 'Success',
      timestamp: today,
    },
    {
      user: 'Riya Patel',
      role: 'Manager',
      activity: 'Logout',
      device: 'iPhone 15 Pro · iOS 18.1',
      ip: '45.118.132.89',
      location: 'Delhi, India',
      status: 'Success',
      timestamp: new Date('2025-08-07T10:30:00'),
    },
    {
      user: 'Amit Kumar',
      role: 'Vendor',
      activity: 'Login',
      device: 'Samsung Galaxy S23 · Android 14',
      ip: '122.176.47.98',
      location: 'Bangalore, India',
      status: 'Failed',
      timestamp: new Date('2025-08-07T10:15:00'),
    },
    {
      user: 'Neha Sharma',
      role: 'Staff',
      activity: 'Login',
      device: 'Windows 11 · Chrome',
      ip: '59.92.114.76',
      location: 'Hyderabad, India',
      status: 'Success',
      timestamp: new Date('2025-08-07T10:00:00'),
    },
    {
      user: 'Vikram Khanna',
      role: 'Tourist',
      activity: 'Logout',
      device: 'iPad Air · iPadOS 18.0',
      ip: '117.242.35.188',
      location: 'Kolkata, India',
      status: 'Success',
      timestamp: new Date('2025-08-07T09:45:00'),
    },
  ];

  const statusColor: Record<string, 'success' | 'error'> = {
    Success: 'success',
    Failed: 'error',
  };

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle title="Authentication Report" subtitle="Audit trail of privileged access across roles and devices." />

      <ControlChips items={['All Roles', 'Admin', 'Manager', 'Vendor', 'Staff', 'Tourist']} />

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Activity</TableCell>
            <TableCell>Device &amp; OS</TableCell>
            <TableCell>IP Address</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>DateTime</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={`${activity.user}-${activity.timestamp.toISOString()}`} hover>
              <TableCell>{activity.user}</TableCell>
              <TableCell>
                <Chip size="small" variant="outlined" label={activity.role} />
              </TableCell>
              <TableCell>{activity.activity}</TableCell>
              <TableCell>{activity.device}</TableCell>
              <TableCell>{activity.ip}</TableCell>
              <TableCell>{activity.location}</TableCell>
              <TableCell>{format(activity.timestamp, 'MMM dd, yyyy · hh:mm a')}</TableCell>
              <TableCell>
                <Chip size="small" color={statusColor[activity.status]} label={activity.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 156 activities" totalPages={32} />
    </Paper>
  );
};

const AdPerformanceSection = () => {
  const ads = [
    {
      name: 'Taj Mahal Special Tour',
      campaign: 'Heritage Campaign',
      platform: 'Website',
      views: 12458,
      clicks: 845,
      ctr: 6.78,
      budget: 25000,
      spent: 18750,
      status: 'Active',
    },
    {
      name: 'Kerala Backwaters',
      campaign: 'Summer Escape',
      platform: 'Mobile App',
      views: 8956,
      clicks: 623,
      ctr: 6.96,
      budget: 20000,
      spent: 15400,
      status: 'Paused',
    },
    {
      name: 'Rajasthan Desert Safari',
      campaign: 'Adventure Series',
      platform: 'Website',
      views: 15789,
      clicks: 1245,
      ctr: 7.89,
      budget: 30000,
      spent: 30000,
      status: 'Completed',
    },
    {
      name: 'Varanasi Spiritual Tour',
      campaign: 'Cultural Experience',
      platform: 'Mobile App',
      views: 9845,
      clicks: 756,
      ctr: 7.68,
      budget: 22000,
      spent: 16500,
      status: 'Active',
    },
    {
      name: 'Hampi Heritage Walk',
      campaign: 'History Unveiled',
      platform: 'Website',
      views: 7856,
      clicks: 534,
      ctr: 6.8,
      budget: 18000,
      spent: 12600,
      status: 'Active',
    },
  ];

  const statusColor: Record<string, 'success' | 'warning' | 'default'> = {
    Active: 'success',
    Paused: 'warning',
    Completed: 'default',
  };

  return (
    <Paper sx={{ p: 3 }}>
      <TableTitle
        title="Ad Performance"
        subtitle="Evaluate marketing ROI across platforms, creatives, and conversion funnels."
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item>
          <Button variant="outlined">All Platforms</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined">All Status</Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" startIcon={<CalendarMonthIcon />}>
            mm/dd/yyyy
          </Button>
        </Grid>
        <Grid item>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            Export Report
          </Button>
        </Grid>
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Ad Name</TableCell>
            <TableCell>Campaign</TableCell>
            <TableCell>Platform</TableCell>
            <TableCell align="right">Views</TableCell>
            <TableCell align="right">Clicks</TableCell>
            <TableCell align="right">CTR</TableCell>
            <TableCell align="right">Budget</TableCell>
            <TableCell align="right">Spent</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ads.map((ad) => (
            <TableRow key={ad.name} hover>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ad.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ad.campaign}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{ad.campaign}</TableCell>
              <TableCell>{ad.platform}</TableCell>
              <TableCell align="right">{ad.views.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">{ad.clicks.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">{ad.ctr.toFixed(2)}%</TableCell>
              <TableCell align="right">₹{ad.budget.toLocaleString('en-IN')}</TableCell>
              <TableCell align="right">₹{ad.spent.toLocaleString('en-IN')}</TableCell>
              <TableCell>
                <Chip size="small" color={statusColor[ad.status]} label={ad.status} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit">
                  <IconButton>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={ad.status === 'Paused' ? 'Resume' : 'Pause'}>
                  <IconButton>
                    {ad.status === 'Paused' ? <PlayArrowIcon fontSize="small" /> : <PauseIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PaginationFooter summary="Showing 1–5 of 24 ads" totalPages={5} />
    </Paper>
  );
};

const ControlChips = ({ items }: { items: string[] }) => (
  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
    {items.map((item, index) => (
      <Chip key={item} label={item} variant={index === 0 ? 'filled' : 'outlined'} color={index === 0 ? 'primary' : 'default'} />
    ))}
  </Box>
);

const RatingDisplay = ({ rating }: { rating: number }) => {
  const stars = Math.round(rating);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Typography variant="body2">{rating.toFixed(1)}</Typography>
      <Box sx={{ display: 'flex', gap: 0.25 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <StarRoundedIcon key={index} sx={{ fontSize: '1rem', color: index < stars ? '#FFB300' : '#E0E0E0' }} />
        ))}
      </Box>
    </Box>
  );
};

const PaginationSummary = ({ totalPages = 9 }: { totalPages?: number }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <Typography variant="caption" color="text.secondary">
      1
    </Typography>
    <Chip label="1" size="small" color="primary" sx={{ fontWeight: 600 }} />
    <Typography variant="caption" color="text.secondary">
      2 3 4 … {totalPages}
    </Typography>
  </Box>
);

const PaginationFooter = ({ summary, totalPages }: { summary: string; totalPages: number }) => (
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
    <Typography variant="caption" color="text.secondary">
      {summary}
    </Typography>
    <PaginationSummary totalPages={totalPages} />
  </Box>
);

interface EventItem {
  dateKey: string;
  label: string;
  isToday: boolean;
  events: Array<{ title: string; type: string }>;
}

const generateMonthGrid = (month: number, year: number, events: Array<{ date: string; title: string; type: string }>) => {
  const weeks: EventItem[][] = [];
  const firstDay = new Date(year, month - 1, 1);
  const startDay = firstDay.getDay();
  const totalDays = new Date(year, month, 0).getDate();

  let currentDay = 1 - startDay;
  for (let weekIndex = 0; weekIndex < 6; weekIndex++) {
    const week: EventItem[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = new Date(year, month - 1, currentDay);
      const dateKey = format(date, 'yyyy-MM-dd');
      const isCurrentMonth = date.getMonth() === month - 1;
      const label = isCurrentMonth ? date.getDate().toString() : '';

      const dayEvents = events.filter((event) => event.date === dateKey);

      week.push({
        dateKey,
        label,
        isToday: dateKey === format(new Date('2025-06-13'), 'yyyy-MM-dd'),
        events: dayEvents,
      });

      currentDay += 1;
    }
    weeks.push(week);
    if (currentDay > totalDays && weekIndex >= 4) {
      break;
    }
  }

  return weeks;
};

export default Reports2;


