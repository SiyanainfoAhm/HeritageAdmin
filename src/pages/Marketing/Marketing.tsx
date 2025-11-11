import { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Stack,
  TextField,
  Button,
  Menu,
  MenuItem,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  Visibility as VisibilityIcon,
  PauseCircleOutline as PauseIcon,
  PlayCircleOutline as PlayIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';

type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';
type MessageStatus = 'Draft' | 'Scheduled' | 'Sent';
type MarketingTab = 'campaigns' | 'notifications' | 'whatsapp' | 'mail';

interface Campaign {
  id: number;
  name: string;
  description: string;
  audience: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  createdOn: string;
  createdBy: string;
}

interface Message {
  id: number;
  title: string;
  body: string;
  audience: string;
  date: string;
  status: MessageStatus;
  type: 'Event' | 'Offer' | 'Announcement';
}

const STATUS_COLORS: Record<CampaignStatus, string> = {
  Draft: '#9CA3AF',
  Active: '#047857',
  Paused: '#B45309',
  Completed: '#1D4ED8',
};

const MESSAGE_STATUS_COLORS: Record<MessageStatus, string> = {
  Draft: '#9CA3AF',
  Scheduled: '#B45309',
  Sent: '#047857',
};

const AUDIENCE_OPTIONS = ['All Users', 'Only Tourists', 'Only Vendors', 'Only Guides'];
const STATUS_OPTIONS: CampaignStatus[] = ['Draft', 'Active', 'Paused', 'Completed'];

const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'Summer Heritage Walk',
    description: 'Special guided tours across heritage sites during summer weekends.',
    audience: 'All Users',
    startDate: '2025-06-20',
    endDate: '2025-08-31',
    status: 'Active',
    createdOn: '2025-06-15',
    createdBy: 'Ananya Patel',
  },
  {
    id: 2,
    name: 'Monsoon Festival Discount',
    description: '20% off on all tour packages during the monsoon.',
    audience: 'Only Tourists',
    startDate: '2025-07-01',
    endDate: '2025-07-31',
    status: 'Draft',
    createdOn: '2025-06-28',
    createdBy: 'Rahul Sharma',
  },
  {
    id: 3,
    name: 'Artisan Spotlight',
    description: 'Featuring local artisans with stories and product showcases.',
    audience: 'Only Vendors',
    startDate: '2025-06-15',
    endDate: '2025-06-30',
    status: 'Paused',
    createdOn: '2025-06-10',
    createdBy: 'Priya Desai',
  },
  {
    id: 4,
    name: 'Guide Certification Program',
    description: 'Professional development for heritage guides.',
    audience: 'Only Guides',
    startDate: '2025-05-01',
    endDate: '2025-06-15',
    status: 'Completed',
    createdOn: '2025-04-18',
    createdBy: 'Vikram Mehta',
  },
];

const NOTIFICATIONS: Message[] = [
  {
    id: 1,
    title: 'Summer Heritage Walk Launch',
    body: 'Join us for special guided tours of Ahmedabad’s heritage sites this summer.',
    audience: 'All Users',
    date: '2025-06-16',
    status: 'Sent',
    type: 'Event',
  },
  {
    id: 2,
    title: 'Monsoon Festival Discount',
    body: 'Enjoy 20% off on all heritage tour packages during the monsoon season.',
    audience: 'Only Tourists',
    date: '2025-06-15',
    status: 'Sent',
    type: 'Offer',
  },
  {
    id: 3,
    title: 'Artisan Spotlight Registration',
    body: 'Register now to be featured in our Artisan Spotlight program.',
    audience: 'Only Vendors',
    date: '2025-06-10',
    status: 'Sent',
    type: 'Announcement',
  },
];

const WHATSAPP_MESSAGES: Message[] = [
  {
    id: 1,
    title: 'Heritage Walk Reminder',
    body: 'Join us for the Heritage Walk this weekend! Experience the rich history of our city.',
    audience: 'All Users',
    date: '2025-08-07',
    status: 'Sent',
    type: 'Event',
  },
  {
    id: 2,
    title: 'Exclusive Discount',
    body: 'Get 15% off on the upcoming Monsoon Festival packages. Book now!',
    audience: 'Only Tourists',
    date: '2025-08-05',
    status: 'Sent',
    type: 'Offer',
  },
];

const StatusChip = ({ status }: { status: CampaignStatus }) => (
  <Chip
    label={status}
    size="small"
    sx={{
      fontWeight: 600,
      bgcolor: alpha(STATUS_COLORS[status], 0.12),
      color: STATUS_COLORS[status],
      borderRadius: '999px',
      px: 1.5,
    }}
  />
);

const MessageStatusChip = ({ status }: { status: MessageStatus }) => (
  <Chip
    label={status}
    size="small"
    sx={{
      fontWeight: 600,
      bgcolor: alpha(MESSAGE_STATUS_COLORS[status], 0.12),
      color: MESSAGE_STATUS_COLORS[status],
      borderRadius: '999px',
      px: 1.5,
    }}
  />
);

const FilterMenu = ({
  anchorEl,
  open,
  onClose,
  options,
  selected,
  onChange,
  title,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  options: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  title: string;
}) => {
  const toggleOption = (option: string) => {
    const exists = selected.includes(option);
    if (exists) {
      onChange(selected.filter((value) => value !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose} keepMounted>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
      </Box>
      <Divider />
      {options.map((option) => (
        <MenuItem key={option} onClick={() => toggleOption(option)}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: 1,
                border: '2px solid',
                borderColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: selected.includes(option) ? 'primary.main' : 'transparent',
              }}
            >
              {selected.includes(option) && (
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 12,
                    border: 'solid white',
                    borderWidth: '0 2px 2px 0',
                    transform: 'rotate(45deg)',
                    display: 'inline-block',
                  }}
                />
              )}
            </Box>
            <Typography variant="body2">{option}</Typography>
          </Stack>
        </MenuItem>
      ))}
      <Divider />
      <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" onClick={onClose}>
          Done
        </Button>
      </Box>
    </Menu>
  );
};

const CampaignDetailsDialog = ({
  open,
  onClose,
  campaign,
}: {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
}) => {
  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Campaign Details
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#fdf8f4' }}>
        <Stack spacing={3}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                bgcolor: alpha('#DA8552', 0.12),
                color: '#DA8552',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32,
              }}
            >
              <i className="ri-megaphone-line" />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {campaign.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <Chip label={campaign.audience} size="small" sx={{ fontWeight: 600 }} />
                <StatusChip status={campaign.status} />
              </Stack>
            </Box>
          </Stack>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Description
            </Typography>
            <Typography variant="body2">{campaign.description}</Typography>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Campaign Information
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>
                <Typography variant="body2">
                  {format(new Date(campaign.startDate), 'MMMM d, yyyy')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  End Date
                </Typography>
                <Typography variant="body2">
                  {format(new Date(campaign.endDate), 'MMMM d, yyyy')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created On
                </Typography>
                <Typography variant="body2">
                  {format(new Date(campaign.createdOn), 'MMMM d, yyyy')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Created By
                </Typography>
                <Typography variant="body2">{campaign.createdBy}</Typography>
              </Box>
            </Box>
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Performance Snapshot
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Performance analytics coming soon.
            </Typography>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const Marketing = () => {
  const theme = useTheme();
  const [tab, setTab] = useState<MarketingTab>('campaigns');
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus[]>([]);
  const [audienceAnchor, setAudienceAnchor] = useState<HTMLElement | null>(null);
  const [statusAnchor, setStatusAnchor] = useState<HTMLElement | null>(null);
  const [dateAnchor, setDateAnchor] = useState<HTMLElement | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const filterButtonSx = {
    borderRadius: '999px',
    backgroundColor: alpha('#DA8552', 0.08),
    borderColor: 'transparent',
    color: '#C0652F',
    fontWeight: 500,
    textTransform: 'none' as const,
    px: 2.5,
    '&:hover': {
      backgroundColor: alpha('#DA8552', 0.16),
      borderColor: 'transparent',
    },
  };
  const clearButtonSx = {
    textTransform: 'none',
    color: '#DA8552',
    fontWeight: 500,
    '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
  };
  const searchFieldSx = {
    width: { xs: '100%', md: 280 },
    '& .MuiOutlinedInput-root': {
      borderRadius: '999px',
      backgroundColor: '#FFFFFF',
      px: 1.5,
      '& fieldset': {
        borderColor: alpha('#DA8552', 0.16),
      },
      '&:hover fieldset': {
        borderColor: '#DA8552',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#DA8552',
      },
    },
  };
  const addButtonSx = {
    borderRadius: '999px',
    textTransform: 'none',
    px: 3,
    backgroundColor: '#DA8552',
    fontWeight: 600,
    boxShadow: 'none',
    '&:hover': {
      backgroundColor: '#C0602A',
      boxShadow: 'none',
    },
  };
  const exportButtonSx = {
    borderRadius: '999px',
    textTransform: 'none',
    fontWeight: 500,
    borderColor: alpha('#DA8552', 0.32),
    color: '#C0652F',
    px: 2.5,
    '&:hover': {
      borderColor: '#DA8552',
      backgroundColor: alpha('#DA8552', 0.08),
    },
  };

  const handleTabChange = (_event: React.SyntheticEvent, value: MarketingTab) => {
    setTab(value);
    setSearch('');
    setAudienceFilter([]);
    setStatusFilter([]);
  };

  const filteredCampaigns = useMemo(() => {
    return CAMPAIGNS.filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(search.toLowerCase()) ||
        campaign.description.toLowerCase().includes(search.toLowerCase());
      const matchesAudience = audienceFilter.length === 0 || audienceFilter.includes(campaign.audience);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(campaign.status);
      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [search, audienceFilter, statusFilter]);

  const filteredNotifications = useMemo(() => {
    return NOTIFICATIONS.filter((notification) =>
      notification.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const filteredWhatsapp = useMemo(() => {
    return WHATSAPP_MESSAGES.filter((message) =>
      message.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const renderSearchPlaceholder = () => {
    switch (tab) {
      case 'campaigns':
        return 'Search campaigns...';
      case 'notifications':
        return 'Search notifications...';
      case 'whatsapp':
        return 'Search WhatsApp messages...';
      case 'mail':
        return 'Search mail notifications...';
      default:
        return 'Search...';
    }
  };

  const renderCampaignTable = () => (
    <Paper sx={{ mt: 4, borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
          <TableRow>
            <TableCell>Campaign</TableCell>
            <TableCell>Audience</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>End Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCampaigns.map((campaign) => (
            <TableRow key={campaign.id} hover>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {campaign.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {campaign.description}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={campaign.audience} size="small" />
              </TableCell>
              <TableCell>{format(new Date(campaign.startDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{format(new Date(campaign.endDate), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <StatusChip status={campaign.status} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton onClick={() => setSelectedCampaign(campaign)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Toggle status">
                  <IconButton color={campaign.status === 'Active' ? 'warning' : 'success'}>
                    {campaign.status === 'Active' ? (
                      <PauseIcon fontSize="small" />
                    ) : (
                      <PlayIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredCampaigns.length} results
        </Typography>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Stack>
    </Paper>
  );

  const renderNotificationTable = (data: Message[]) => (
    <Paper sx={{ mt: 4, borderRadius: 3, overflow: 'hidden' }}>
      <Table>
        <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.04) }}>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Message Preview</TableCell>
            <TableCell>Audience</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((message) => (
            <TableRow key={message.id} hover>
              <TableCell>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {message.title}
                </Typography>
              </TableCell>
              <TableCell sx={{ maxWidth: 320 }}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {message.body}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={message.audience} size="small" />
              </TableCell>
              <TableCell>{format(new Date(message.date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                <MessageStatusChip status={message.status} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="View">
                  <IconButton>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {data.length} results
        </Typography>
        <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
          Export
        </Button>
      </Stack>
    </Paper>
  );

  const renderFilters = () => (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      spacing={2}
      alignItems={{ xs: 'stretch', lg: 'center' }}
      justifyContent="space-between"
      sx={{ mt: 1 }}
    >
      <Stack direction="row" spacing={1.5} flexWrap="wrap">
        <Button
          variant="outlined"
          startIcon={<FilterListIcon fontSize="small" />}
          sx={filterButtonSx}
          onClick={(event) => setAudienceAnchor(event.currentTarget)}
        >
          Audience
        </Button>
        <Button variant="outlined" sx={filterButtonSx} onClick={(event) => setStatusAnchor(event.currentTarget)}>
          Status
        </Button>
        <Button variant="outlined" sx={filterButtonSx} onClick={(event) => setDateAnchor(event.currentTarget)}>
          Date
        </Button>
        <Button
          variant="text"
          sx={clearButtonSx}
          onClick={() => {
            setAudienceFilter([]);
            setStatusFilter([]);
            setSearch('');
          }}
        >
          Clear Filters
        </Button>
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <TextField
          size="small"
          placeholder={renderSearchPlaceholder()}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: '#DA8552' }} />,
          }}
          sx={searchFieldSx}
        />
        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<DownloadIcon />} sx={exportButtonSx}>
            Export
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} sx={addButtonSx}>
            {tab === 'campaigns'
              ? 'Add Campaign'
              : tab === 'notifications'
              ? 'Add Notification'
              : tab === 'whatsapp'
              ? 'Add WhatsApp Message'
              : 'Add Mail Notification'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );

  const renderTabContent = () => {
    switch (tab) {
      case 'campaigns':
        return renderCampaignTable();
      case 'notifications':
        return renderNotificationTable(filteredNotifications);
      case 'whatsapp':
        return renderNotificationTable(filteredWhatsapp);
      case 'mail':
        return (
          <Paper sx={{ mt: 4, borderRadius: 3, p: 4, textAlign: 'center', color: 'text.secondary' }}>
            Email notification management is coming soon.
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 4, backgroundColor: '#fdf8f4', minHeight: '100%' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
        Marketing
      </Typography>

      <Paper sx={{ mt: 3, borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_event, value) => handleTabChange(_event, value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            px: 3,
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
              backgroundColor: '#DA8552',
            },
          }}
        >
          <Tab label="Campaigns" value="campaigns" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Notifications" value="notifications" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="WhatsApp" value="whatsapp" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Mail" value="mail" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {renderFilters()}
          {renderTabContent()}
        </Box>
      </Paper>

      <FilterMenu
        anchorEl={audienceAnchor}
        open={Boolean(audienceAnchor)}
        onClose={() => setAudienceAnchor(null)}
        options={AUDIENCE_OPTIONS}
        selected={audienceFilter}
        onChange={setAudienceFilter}
        title="Audience"
      />
      <FilterMenu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        options={STATUS_OPTIONS}
        selected={statusFilter}
        onChange={(values) => setStatusFilter(values as CampaignStatus[])}
        title="Status"
      />
      <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
        <MenuItem onClick={() => setDateAnchor(null)}>Today</MenuItem>
        <MenuItem onClick={() => setDateAnchor(null)}>Last 7 days</MenuItem>
        <MenuItem onClick={() => setDateAnchor(null)}>Last 30 days</MenuItem>
      </Menu>

      <CampaignDetailsDialog
        open={Boolean(selectedCampaign)}
        onClose={() => setSelectedCampaign(null)}
        campaign={selectedCampaign}
      />
    </Box>
  );
};

export default Marketing;
