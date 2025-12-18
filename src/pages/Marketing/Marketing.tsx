import React, { useMemo, useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
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
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { format } from 'date-fns';
import { MarketingService, Campaign as CampaignType, MailService } from '@/services/marketing.service';

type CampaignStatus = 'Draft' | 'Active' | 'Paused' | 'Completed';
type MessageStatus = 'Draft' | 'Scheduled' | 'Sent';
type MarketingTab = 'campaigns' | 'notifications' | 'whatsapp' | 'mail';

// Campaign interface is now imported from marketing.service
type Campaign = CampaignType;

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

// Campaigns are now fetched from the database

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
  onSave,
  isNew = false,
}: {
  open: boolean;
  onClose: () => void;
  campaign: Campaign | null;
  onSave?: (campaign: Campaign) => void;
  isNew?: boolean;
}) => {
  const [editMode, setEditMode] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    audience: 'All Users',
    startDate: '',
    endDate: '',
    status: 'Draft' as CampaignStatus,
    createdOn: new Date().toISOString().split('T')[0],
    createdBy: 'Current User',
  });

  React.useEffect(() => {
    if (campaign) {
      setEditedCampaign({
        name: campaign.name,
        description: campaign.description,
        audience: campaign.audience,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status,
        createdOn: campaign.createdOn,
        createdBy: campaign.createdBy,
      });
    } else if (isNew) {
      setEditedCampaign({
        name: '',
        description: '',
        audience: 'All Users',
        startDate: '',
        endDate: '',
        status: 'Draft' as CampaignStatus,
        createdOn: new Date().toISOString().split('T')[0],
        createdBy: 'Current User',
      });
    }
    setEditMode(isNew);
  }, [campaign, isNew]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      const campaignToSave = isNew
        ? ({
            id: Date.now(), // Temporary ID, should be generated by backend
            ...editedCampaign,
          } as Campaign)
        : ({ ...campaign, ...editedCampaign } as Campaign);
      await onSave(campaignToSave);
      setEditMode(false);
      if (isNew) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving campaign:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!campaign && !isNew) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isNew ? 'Add Campaign' : editMode ? 'Edit Campaign' : 'Campaign Details'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!editMode ? (
            <Tooltip title="Edit">
              <IconButton onClick={() => setEditMode(true)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save">
                <IconButton onClick={handleSave} color="success" disabled={saving}>
                  {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={() => setEditMode(false)} color="error">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#fdf8f4' }}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Campaign Name"
                value={editMode ? editedCampaign.name || '' : (campaign?.name || '')}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, name: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={editMode ? editedCampaign.description || '' : (campaign?.description || '')}
                onChange={(e) => setEditedCampaign({ ...editedCampaign, description: e.target.value })}
                disabled={!editMode}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Audience</InputLabel>
                  <Select
                    value={editMode ? editedCampaign.audience || '' : (campaign?.audience || '')}
                    label="Audience"
                    onChange={(e) => setEditedCampaign({ ...editedCampaign, audience: e.target.value })}
                  >
                    {AUDIENCE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editMode ? editedCampaign.status || 'Draft' : (campaign?.status || 'Draft')}
                    label="Status"
                    onChange={(e) => setEditedCampaign({ ...editedCampaign, status: e.target.value as CampaignStatus })}
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={editMode ? editedCampaign.startDate || '' : (campaign?.startDate || '')}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, startDate: e.target.value })}
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="End Date"
                  type="date"
                  value={editMode ? editedCampaign.endDate || '' : (campaign?.endDate || '')}
                  onChange={(e) => setEditedCampaign({ ...editedCampaign, endDate: e.target.value })}
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              {!editMode && campaign && (
                <>
                  <Divider />
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                      gap: 2,
                    }}
                  >
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
                </>
              )}
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

const MessageEditDialog = ({
  open,
  onClose,
  message,
  onSave,
  type,
  isNew = false,
}: {
  open: boolean;
  onClose: () => void;
  message: Message | null;
  onSave?: (message: Message) => void;
  type: 'notifications' | 'whatsapp' | 'mail';
  isNew?: boolean;
}) => {
  const [editMode, setEditMode] = useState(isNew);
  const [saving, setSaving] = useState(false);
  const [editedMessage, setEditedMessage] = useState<Partial<Message>>({
    title: '',
    body: '',
    audience: 'All Users',
    date: new Date().toISOString().split('T')[0],
    status: 'Draft' as MessageStatus,
    type: 'Announcement',
  });

  React.useEffect(() => {
    if (message) {
      setEditedMessage({
        title: message.title,
        body: message.body,
        audience: message.audience,
        date: message.date,
        status: message.status,
        type: message.type,
      });
    } else if (isNew) {
      setEditedMessage({
        title: '',
        body: '',
        audience: 'All Users',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft' as MessageStatus,
        type: 'Announcement',
      });
    }
    setEditMode(isNew);
  }, [message, isNew]);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      const messageToSave = isNew
        ? ({
            id: Date.now(), // Temporary ID, should be generated by backend
            ...editedMessage,
          } as Message)
        : ({ ...message, ...editedMessage } as Message);
      await onSave(messageToSave);
      setEditMode(false);
      if (isNew) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving message:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!message && !isNew) return null;

  const typeLabels = {
    notifications: 'Notification',
    whatsapp: 'WhatsApp Message',
    mail: 'Mail Notification',
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isNew ? `Add ${typeLabels[type]}` : editMode ? `Edit ${typeLabels[type]}` : `${typeLabels[type]} Details`}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!editMode && message ? (
            <Tooltip title="Edit">
              <IconButton onClick={() => setEditMode(true)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save">
                <IconButton onClick={handleSave} color="success" disabled={saving}>
                  {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={() => {
                  setEditMode(false);
                  if (isNew) onClose();
                }} color="error">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers sx={{ backgroundColor: '#fdf8f4' }}>
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={editMode ? editedMessage.title || '' : (message?.title || '')}
                onChange={(e) => setEditedMessage({ ...editedMessage, title: e.target.value })}
                disabled={!editMode}
              />
              <TextField
                fullWidth
                label="Message Body"
                multiline
                rows={4}
                value={editMode ? editedMessage.body || '' : (message?.body || '')}
                onChange={(e) => setEditedMessage({ ...editedMessage, body: e.target.value })}
                disabled={!editMode}
              />
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                  gap: 2,
                }}
              >
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Audience</InputLabel>
                  <Select
                    value={editMode ? editedMessage.audience || '' : (message?.audience || '')}
                    label="Audience"
                    onChange={(e) => setEditedMessage({ ...editedMessage, audience: e.target.value })}
                  >
                    {AUDIENCE_OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={editMode ? editedMessage.type || 'Announcement' : (message?.type || 'Announcement')}
                    label="Type"
                    onChange={(e) => setEditedMessage({ ...editedMessage, type: e.target.value as Message['type'] })}
                  >
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Offer">Offer</MenuItem>
                    <MenuItem value="Announcement">Announcement</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth disabled={!editMode}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editMode ? editedMessage.status || 'Draft' : (message?.status || 'Draft')}
                    label="Status"
                    onChange={(e) => setEditedMessage({ ...editedMessage, status: e.target.value as MessageStatus })}
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Scheduled">Scheduled</MenuItem>
                    <MenuItem value="Sent">Sent</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Date"
                  type="date"
                  value={editMode ? editedMessage.date || '' : (message?.date || '')}
                  onChange={(e) => setEditedMessage({ ...editedMessage, date: e.target.value })}
                  disabled={!editMode}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Stack>
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
  const [selectedNotification, setSelectedNotification] = useState<Message | null>(null);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState<Message | null>(null);
  const [selectedMail, setSelectedMail] = useState<Message | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [notifications, setNotifications] = useState<Message[]>(NOTIFICATIONS);
  const [whatsappMessages, setWhatsappMessages] = useState<Message[]>(WHATSAPP_MESSAGES);
  const [mailMessages, setMailMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMail, setLoadingMail] = useState(false);
  const [error, setError] = useState('');
  const [mailError, setMailError] = useState('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  // Fetch campaigns from database
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await MarketingService.getCampaigns();
      setCampaigns(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch campaigns');
      setSnackbar({ open: true, message: err.message || 'Failed to fetch campaigns', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch mail messages from database
  const fetchMailMessages = useCallback(async () => {
    setLoadingMail(true);
    setMailError('');
    try {
      const data = await MailService.getMailMessages();
      // Convert MailMessage to Message format for compatibility
      const convertedMessages: Message[] = data.map((mail) => ({
        id: mail.id,
        title: mail.title,
        body: mail.body,
        audience: mail.audience,
        date: mail.date,
        status: mail.status,
        type: mail.type,
      }));
      setMailMessages(convertedMessages);
    } catch (err: any) {
      setMailError(err.message || 'Failed to fetch mail messages');
      setSnackbar({ open: true, message: err.message || 'Failed to fetch mail messages', severity: 'error' });
    } finally {
      setLoadingMail(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'campaigns') {
      fetchCampaigns();
    } else if (tab === 'mail') {
      fetchMailMessages();
    }
  }, [tab, fetchCampaigns, fetchMailMessages]);

  const handleTabChange = (_event: React.SyntheticEvent, value: MarketingTab) => {
    setTab(value);
    setSearch('');
    setAudienceFilter([]);
    setStatusFilter([]);
  };

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        campaign.name.toLowerCase().includes(search.toLowerCase()) ||
        campaign.description.toLowerCase().includes(search.toLowerCase());
      const matchesAudience = audienceFilter.length === 0 || audienceFilter.includes(campaign.audience);
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(campaign.status);
      return matchesSearch && matchesAudience && matchesStatus;
    });
  }, [campaigns, search, audienceFilter, statusFilter]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) =>
      notification.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [notifications, search]);

  const filteredWhatsapp = useMemo(() => {
    return whatsappMessages.filter((message) =>
      message.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [whatsappMessages, search]);

  const filteredMail = useMemo(() => {
    return mailMessages.filter((message) =>
      message.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [mailMessages, search]);

  const handleSaveCampaign = async (updatedCampaign: Campaign) => {
    setLoading(true);
    setError('');
    try {
      // Check if this is a new campaign (id is 0 or doesn't exist in campaigns list)
      const isNew = updatedCampaign.id === 0 || updatedCampaign.id === undefined || !campaigns.some((c) => c.id === updatedCampaign.id);
      
      let result;
      if (isNew) {
        // Create new campaign - exclude id, createdOn, createdBy from the payload
        const { name, description, audience, startDate, endDate, status } = updatedCampaign;
        result = await MarketingService.createCampaign({
          name: name || '',
          description: description || '',
          audience: audience || 'All Users',
          startDate: startDate || '',
          endDate: endDate || '',
          status: status || 'Draft',
        });
      } else {
        // Update existing campaign
        const { name, description, audience, startDate, endDate, status } = updatedCampaign;
        result = await MarketingService.updateCampaign(updatedCampaign.id, {
          name,
          description,
          audience,
          startDate,
          endDate,
          status,
        });
      }

      if (result.success && result.data) {
        // Refresh campaigns list
        await fetchCampaigns();
        setSelectedCampaign(null);
        setSnackbar({
          open: true,
          message: isNew ? 'Campaign created successfully' : 'Campaign updated successfully',
          severity: 'success',
        });
      } else {
        const errorMessage = result.error?.message || result.error || 'Failed to save campaign';
        throw new Error(errorMessage);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to save campaign';
      setError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMessage = async (updatedMessage: Message, type: 'notifications' | 'whatsapp' | 'mail') => {
    if (type === 'notifications') {
      const exists = notifications.some((m) => m.id === updatedMessage.id);
      if (exists) {
        setNotifications(notifications.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
      } else {
        setNotifications([...notifications, updatedMessage]);
      }
      setSelectedNotification(null);
    } else if (type === 'whatsapp') {
      const exists = whatsappMessages.some((m) => m.id === updatedMessage.id);
      if (exists) {
        setWhatsappMessages(whatsappMessages.map((m) => (m.id === updatedMessage.id ? updatedMessage : m)));
      } else {
        setWhatsappMessages([...whatsappMessages, updatedMessage]);
      }
      setSelectedWhatsApp(null);
    } else if (type === 'mail') {
      setLoadingMail(true);
      setMailError('');
      try {
        // Check if this is a new mail message (id is 0 or doesn't exist in mailMessages list)
        const isNew = updatedMessage.id === 0 || updatedMessage.id === undefined || !mailMessages.some((m) => m.id === updatedMessage.id);
        
        let result;
        if (isNew) {
          // Create new mail message
          const { title, body, audience, date, status, type: messageType } = updatedMessage;
          result = await MailService.createMailMessage({
            title: title || '',
            body: body || '',
            audience: audience || 'All Users',
            date: date || new Date().toISOString().split('T')[0],
            status: status || 'Draft',
            type: messageType || 'Announcement',
          });
        } else {
          // Update existing mail message
          const { title, body, audience, date, status, type: messageType } = updatedMessage;
          result = await MailService.updateMailMessage(updatedMessage.id, {
            title,
            body,
            audience,
            date,
            status,
            type: messageType,
          });
        }

        if (result.success && result.data) {
          // Refresh mail messages list
          await fetchMailMessages();
          setSelectedMail(null);
          setSnackbar({
            open: true,
            message: isNew ? 'Mail message created successfully' : 'Mail message updated successfully',
            severity: 'success',
          });
        } else {
          const errorMessage = result.error?.message || result.error || 'Failed to save mail message';
          throw new Error(errorMessage);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to save mail message';
        setMailError(errorMessage);
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
      } finally {
        setLoadingMail(false);
      }
    }
  };

  const handleAddClick = () => {
    if (tab === 'campaigns') {
      setSelectedCampaign({
        id: 0,
        name: '',
        description: '',
        audience: 'All Users',
        startDate: '',
        endDate: '',
        status: 'Draft',
        createdOn: new Date().toISOString().split('T')[0],
        createdBy: 'Current User',
      });
    } else if (tab === 'notifications') {
      setSelectedNotification({
        id: 0,
        title: '',
        body: '',
        audience: 'All Users',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        type: 'Announcement',
      });
    } else if (tab === 'whatsapp') {
      setSelectedWhatsApp({
        id: 0,
        title: '',
        body: '',
        audience: 'All Users',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        type: 'Announcement',
      });
    } else if (tab === 'mail') {
      setSelectedMail({
        id: 0,
        title: '',
        body: '',
        audience: 'All Users',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        type: 'Announcement',
      });
    }
  };

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
      {loading && campaigns.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && campaigns.length === 0 && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      {!loading && campaigns.length === 0 && !error && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No campaigns found. Click "Add Campaign" to create one.
          </Typography>
        </Box>
      )}
      {filteredCampaigns.length > 0 && (
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
              <TableCell>
                {campaign.startDate ? format(new Date(campaign.startDate), 'MMM dd, yyyy') : '-'}
              </TableCell>
              <TableCell>
                {campaign.endDate ? format(new Date(campaign.endDate), 'MMM dd, yyyy') : '-'}
              </TableCell>
              <TableCell>
                <StatusChip status={campaign.status} />
              </TableCell>
              <TableCell align="right">
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="View">
                    <IconButton onClick={() => setSelectedCampaign(campaign)}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => setSelectedCampaign(campaign)} color="primary">
                      <EditIcon fontSize="small" />
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
                </Stack>
              </TableCell>
            </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      {filteredCampaigns.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredCampaigns.length} results
          </Typography>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Stack>
      )}
    </Paper>
  );

  const renderNotificationTable = (data: Message[], isLoading?: boolean, errorMsg?: string) => (
    <Paper sx={{ mt: 4, borderRadius: 3, overflow: 'hidden' }}>
      {isLoading && data.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {errorMsg && data.length === 0 && (
        <Box sx={{ p: 2 }}>
          <Alert severity="error">{errorMsg}</Alert>
        </Box>
      )}
      {!isLoading && data.length === 0 && !errorMsg && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No messages found. Click "Add" to create one.
          </Typography>
        </Box>
      )}
      {data.length > 0 && (
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
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <Tooltip title="View">
                    <IconButton onClick={() => {
                      if (tab === 'notifications') setSelectedNotification(message);
                      else if (tab === 'whatsapp') setSelectedWhatsApp(message);
                      else if (tab === 'mail') setSelectedMail(message);
                    }}>
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton onClick={() => {
                      if (tab === 'notifications') setSelectedNotification(message);
                      else if (tab === 'whatsapp') setSelectedWhatsApp(message);
                      else if (tab === 'mail') setSelectedMail(message);
                    }} color="primary">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      )}
      {data.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {data.length} results
          </Typography>
          <Button size="small" variant="outlined" startIcon={<DownloadIcon />}>
            Export
          </Button>
        </Stack>
      )}
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
          <Button variant="contained" startIcon={<AddIcon />} sx={addButtonSx} onClick={handleAddClick}>
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
        return renderNotificationTable(filteredMail, loadingMail, mailError);
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
        onSave={handleSaveCampaign}
        isNew={selectedCampaign?.id === 0}
      />

      <MessageEditDialog
        open={Boolean(selectedNotification)}
        onClose={() => setSelectedNotification(null)}
        message={selectedNotification}
        onSave={(msg) => handleSaveMessage(msg, 'notifications')}
        type="notifications"
        isNew={selectedNotification?.id === 0}
      />

      <MessageEditDialog
        open={Boolean(selectedWhatsApp)}
        onClose={() => setSelectedWhatsApp(null)}
        message={selectedWhatsApp}
        onSave={(msg) => handleSaveMessage(msg, 'whatsapp')}
        type="whatsapp"
        isNew={selectedWhatsApp?.id === 0}
      />

      <MessageEditDialog
        open={Boolean(selectedMail)}
        onClose={() => setSelectedMail(null)}
        message={selectedMail}
        onSave={(msg) => handleSaveMessage(msg, 'mail')}
        type="mail"
        isNew={selectedMail?.id === 0}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Marketing;
