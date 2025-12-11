import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Tabs,
  Tab,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import {
  NotificationTemplateService,
  EmailTemplate,
  NotificationLog,
} from '@/services/notificationTemplate.service';

const NotificationTemplate = () => {
  const [activeTab, setActiveTab] = useState<'templates' | 'logs'>('templates');
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Template dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    template_key: '',
    template_name: '',
    email_subject: '',
    email_body_html: '',
    email_body_text: '',
    sms_body: '',
    whatsapp_body: '',
    whatsapp_template_id: '',
    push_title: '',
    push_body: '',
    push_image_url: '',
    push_action_url: '',
    is_critical: false,
    is_active: true,
  });

  // Editor mode: 'code' or 'preview'
  const [editorMode, setEditorMode] = useState<'code' | 'preview'>('code');

  // Templates sorting
  const [templatesSortBy, setTemplatesSortBy] = useState<'key' | 'name' | 'subject' | 'critical' | 'status'>('key');
  const [templatesSortOrder, setTemplatesSortOrder] = useState<'asc' | 'desc'>('asc');

  // Logs pagination and filters
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(20);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsFilters, setLogsFilters] = useState({
    notification_type: '',
    channel: '',
    status: '',
  });
  const [logsSortBy, setLogsSortBy] = useState<'id' | 'type' | 'channel' | 'recipient' | 'status' | 'created'>('created');
  const [logsSortOrder, setLogsSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (activeTab === 'templates') {
      fetchTemplates();
    } else {
      fetchLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [logsPage, logsRowsPerPage, logsFilters]);

  const fetchTemplates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await NotificationTemplateService.getEmailTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const filters: any = {};
      if (logsFilters.notification_type) filters.notification_type = logsFilters.notification_type;
      if (logsFilters.channel) filters.channel = logsFilters.channel;
      if (logsFilters.status) filters.status = logsFilters.status;

      const result = await NotificationTemplateService.getNotificationLogs(
        logsPage + 1,
        logsRowsPerPage,
        Object.keys(filters).length > 0 ? filters : undefined
      );
      setLogs(result.data);
      setLogsTotal(result.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      template_key: '',
      template_name: '',
      email_subject: '',
      email_body_html: '',
      email_body_text: '',
      sms_body: '',
      whatsapp_body: '',
      whatsapp_template_id: '',
      push_title: '',
      push_body: '',
      push_image_url: '',
      push_action_url: '',
      is_critical: false,
      is_active: true,
    });
    setSelectedTemplate(null);
    setDialogMode('add');
    setDialogOpen(true);
  };

  const handleEdit = (template: EmailTemplate) => {
    setFormData({
      template_key: template.template_key,
      template_name: template.template_name,
      email_subject: template.email_subject,
      email_body_html: template.email_body_html,
      email_body_text: template.email_body_text || '',
      sms_body: template.sms_body || '',
      whatsapp_body: template.whatsapp_body || '',
      whatsapp_template_id: template.whatsapp_template_id || '',
      push_title: template.push_title || '',
      push_body: template.push_body || '',
      push_image_url: template.push_image_url || '',
      push_action_url: template.push_action_url || '',
      is_critical: template.is_critical,
      is_active: template.is_active,
    });
    setSelectedTemplate(template);
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleView = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (dialogMode === 'add') {
        const result = await NotificationTemplateService.createEmailTemplate(formData);
        if (result.success) {
          setSuccess('Template created successfully');
          fetchTemplates();
          setDialogOpen(false);
        } else {
          setError(result.error?.message || 'Failed to create template');
        }
      } else if (dialogMode === 'edit' && selectedTemplate) {
        const result = await NotificationTemplateService.updateEmailTemplate(
          selectedTemplate.id,
          formData
        );
        if (result.success) {
          setSuccess('Template updated successfully');
          fetchTemplates();
          setDialogOpen(false);
        } else {
          setError(result.error?.message || 'Failed to update template');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      case 'skipped':
        return 'default';
      default:
        return 'default';
    }
  };

  // Sort templates
  const sortedTemplates = useMemo(() => {
    const sorted = [...templates];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (templatesSortBy) {
        case 'key':
          aValue = a.template_key?.toLowerCase() || '';
          bValue = b.template_key?.toLowerCase() || '';
          break;
        case 'name':
          aValue = a.template_name?.toLowerCase() || '';
          bValue = b.template_name?.toLowerCase() || '';
          break;
        case 'subject':
          aValue = a.email_subject?.toLowerCase() || '';
          bValue = b.email_subject?.toLowerCase() || '';
          break;
        case 'critical':
          aValue = a.is_critical ? 1 : 0;
          bValue = b.is_critical ? 1 : 0;
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return templatesSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return templatesSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [templates, templatesSortBy, templatesSortOrder]);

  const handleTemplatesSort = (column: 'key' | 'name' | 'subject' | 'critical' | 'status') => {
    if (templatesSortBy === column) {
      setTemplatesSortOrder(templatesSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTemplatesSortBy(column);
      setTemplatesSortOrder('asc');
    }
  };

  // Sort logs
  const sortedLogs = useMemo(() => {
    const sorted = [...logs];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (logsSortBy) {
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
        case 'type':
          aValue = a.notification_type?.toLowerCase() || '';
          bValue = b.notification_type?.toLowerCase() || '';
          break;
        case 'channel':
          aValue = a.channel?.toLowerCase() || '';
          bValue = b.channel?.toLowerCase() || '';
          break;
        case 'recipient':
          aValue = a.recipient?.toLowerCase() || '';
          bValue = b.recipient?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'created':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return logsSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return logsSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [logs, logsSortBy, logsSortOrder]);

  const handleLogsSort = (column: 'id' | 'type' | 'channel' | 'recipient' | 'status' | 'created') => {
    if (logsSortBy === column) {
      setLogsSortOrder(logsSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setLogsSortBy(column);
      setLogsSortOrder('asc');
    }
  };

  const renderTemplatesTab = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Add Template
        </Button>
      </Box>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleTemplatesSort('key')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Template Key</span>
                    {templatesSortBy === 'key' && (
                      templatesSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleTemplatesSort('name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Template Name</span>
                    {templatesSortBy === 'name' && (
                      templatesSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleTemplatesSort('subject')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Subject</span>
                    {templatesSortBy === 'subject' && (
                      templatesSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleTemplatesSort('critical')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Critical</span>
                    {templatesSortBy === 'critical' && (
                      templatesSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleTemplatesSort('status')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Status</span>
                    {templatesSortBy === 'status' && (
                      templatesSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                sortedTemplates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {template.template_key}
                      </Typography>
                    </TableCell>
                    <TableCell>{template.template_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {template.email_subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.is_critical ? 'Yes' : 'No'}
                        color={template.is_critical ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={template.is_active ? 'Active' : 'Inactive'}
                        color={template.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleView(template)} title="View">
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleEdit(template)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>
    </>
  );

  const renderLogsTab = () => (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={logsFilters.notification_type}
              label="Type"
              onChange={(e) =>
                setLogsFilters({ ...logsFilters, notification_type: e.target.value })
              }
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="otp">OTP</MenuItem>
              <MenuItem value="booking">Booking</MenuItem>
              <MenuItem value="payment">Payment</MenuItem>
              <MenuItem value="reminder">Reminder</MenuItem>
              <MenuItem value="welcome">Welcome</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Channel</InputLabel>
            <Select
              value={logsFilters.channel}
              label="Channel"
              onChange={(e) => setLogsFilters({ ...logsFilters, channel: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="sms">SMS</MenuItem>
              <MenuItem value="push">Push</MenuItem>
              <MenuItem value="whatsapp">WhatsApp</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={logsFilters.status}
              label="Status"
              onChange={(e) => setLogsFilters({ ...logsFilters, status: e.target.value })}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="sent">Sent</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="skipped">Skipped</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('id')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>ID</span>
                      {logsSortBy === 'id' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('type')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Type</span>
                      {logsSortBy === 'type' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('channel')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Channel</span>
                      {logsSortBy === 'channel' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('recipient')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Recipient</span>
                      {logsSortBy === 'recipient' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('status')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Status</span>
                      {logsSortBy === 'status' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => handleLogsSort('created')}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Created At</span>
                      {logsSortBy === 'created' && (
                        logsSortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.id}</TableCell>
                      <TableCell>
                        <Chip label={log.notification_type} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{log.channel}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                          {log.recipient}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {log.subject || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={log.status}
                          color={getStatusColor(log.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={logsTotal}
              page={logsPage}
              onPageChange={(_, newPage) => setLogsPage(newPage)}
              rowsPerPage={logsRowsPerPage}
              onRowsPerPageChange={(e) => {
                setLogsRowsPerPage(parseInt(e.target.value, 10));
                setLogsPage(0);
              }}
            />
          </>
        )}
      </TableContainer>
    </>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Notification Templates
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Notification Templates" value="templates" />
          <Tab label="Notification Logs" value="logs" />
        </Tabs>
      </Paper>

      {activeTab === 'templates' ? renderTemplatesTab() : renderLogsTab()}

      {/* Add/Edit/View Template Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add'
            ? 'Add New Template'
            : dialogMode === 'edit'
            ? 'Edit Template'
            : 'View Template'}
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Template Key"
              value={dialogMode === 'view' ? selectedTemplate?.template_key : formData.template_key}
              onChange={(e) => setFormData({ ...formData, template_key: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              required
            />
            <TextField
              label="Template Name"
              value={dialogMode === 'view' ? selectedTemplate?.template_name : formData.template_name}
              onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              required
            />
            <TextField
              label="Email Subject"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.email_subject
                  : formData.email_subject
              }
              onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              required
            />
            {/* Email Body HTML with Code/Preview Toggle */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email Body (HTML) *
                </Typography>
                <ToggleButtonGroup
                  value={editorMode}
                  exclusive
                  onChange={(_, value) => value && setEditorMode(value)}
                  size="small"
                >
                  <ToggleButton value="code">
                    <CodeIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Code
                  </ToggleButton>
                  <ToggleButton value="preview">
                    <PreviewIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Preview
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {editorMode === 'code' ? (
                <TextField
                  value={
                    dialogMode === 'view' ? selectedTemplate?.email_body_html : formData.email_body_html
                  }
                  onChange={(e) => setFormData({ ...formData, email_body_html: e.target.value })}
                  disabled={dialogMode === 'view'}
                  fullWidth
                  multiline
                  rows={12}
                  placeholder="Enter HTML template..."
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '13px',
                    },
                  }}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    minHeight: 300,
                    maxHeight: 400,
                    overflow: 'auto',
                    backgroundColor: '#fff',
                  }}
                >
                  <Box
                    dangerouslySetInnerHTML={{
                      __html:
                        dialogMode === 'view'
                          ? selectedTemplate?.email_body_html || ''
                          : formData.email_body_html,
                    }}
                  />
                </Paper>
              )}
            </Box>
            
            {/* Email Body Text */}
            <TextField
              label="Email Body (Plain Text)"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.email_body_text || ''
                  : formData.email_body_text
              }
              onChange={(e) => setFormData({ ...formData, email_body_text: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              multiline
              rows={4}
              placeholder="Enter plain text version..."
            />
            
            {/* SMS Body */}
            <TextField
              label="SMS Body"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.sms_body || ''
                  : formData.sms_body
              }
              onChange={(e) => setFormData({ ...formData, sms_body: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter SMS content..."
              helperText="Maximum 160 characters recommended"
            />
            
            {/* WhatsApp Body */}
            <TextField
              label="WhatsApp Body"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.whatsapp_body || ''
                  : formData.whatsapp_body
              }
              onChange={(e) => setFormData({ ...formData, whatsapp_body: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              multiline
              rows={4}
              placeholder="Enter WhatsApp content..."
            />
            
            {/* WhatsApp Template ID */}
            <TextField
              label="WhatsApp Template ID"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.whatsapp_template_id || ''
                  : formData.whatsapp_template_id
              }
              onChange={(e) => setFormData({ ...formData, whatsapp_template_id: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              placeholder="Enter WhatsApp template ID..."
            />
            
            {/* Push Notification Title */}
            <TextField
              label="Push Notification Title"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.push_title || ''
                  : formData.push_title
              }
              onChange={(e) => setFormData({ ...formData, push_title: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              placeholder="Enter push notification title..."
            />
            
            {/* Push Notification Body */}
            <TextField
              label="Push Notification Body"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.push_body || ''
                  : formData.push_body
              }
              onChange={(e) => setFormData({ ...formData, push_body: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              multiline
              rows={3}
              placeholder="Enter push notification body..."
            />
            
            {/* Push Image URL */}
            <TextField
              label="Push Image URL"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.push_image_url || ''
                  : formData.push_image_url
              }
              onChange={(e) => setFormData({ ...formData, push_image_url: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              placeholder="Enter push notification image URL..."
            />
            
            {/* Push Action URL */}
            <TextField
              label="Push Action URL (Deep Link)"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.push_action_url || ''
                  : formData.push_action_url
              }
              onChange={(e) => setFormData({ ...formData, push_action_url: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              placeholder="Enter push notification deep link URL..."
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      dialogMode === 'view' ? selectedTemplate?.is_critical : formData.is_critical
                    }
                    onChange={(e) => setFormData({ ...formData, is_critical: e.target.checked })}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Critical (Always Send)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={
                      dialogMode === 'view' ? selectedTemplate?.is_active : formData.is_active
                    }
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={dialogMode === 'view'}
                  />
                }
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {dialogMode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {dialogMode !== 'view' && (
            <Button onClick={handleSave} variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationTemplate;

