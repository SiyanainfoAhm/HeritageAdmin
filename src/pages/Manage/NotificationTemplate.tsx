import { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Code as CodeIcon,
  Preview as PreviewIcon,
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
    subject_template: '',
    body_template: '',
    is_critical: false,
    is_active: true,
  });

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Editor mode: 'code' or 'preview'
  const [editorMode, setEditorMode] = useState<'code' | 'preview'>('code');

  // Logs pagination and filters
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(20);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsFilters, setLogsFilters] = useState({
    notification_type: '',
    channel: '',
    status: '',
  });

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
      subject_template: '',
      body_template: '',
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
      subject_template: template.subject_template,
      body_template: template.body_template,
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

  const handleDelete = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    setDeleteLoading(true);
    try {
      const result = await NotificationTemplateService.deleteEmailTemplate(selectedTemplate.id);
      if (result.success) {
        setSuccess('Template deleted successfully');
        fetchTemplates();
        setDeleteDialogOpen(false);
      } else {
        setError(result.error?.message || 'Failed to delete template');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setDeleteLoading(false);
    }
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
                <TableCell>Template Key</TableCell>
                <TableCell>Template Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Critical</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No templates found
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((template) => (
                  <TableRow key={template.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {template.template_key}
                      </Typography>
                    </TableCell>
                    <TableCell>{template.template_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 200 }}>
                        {template.subject_template}
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
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(template)}
                        title="Delete"
                      >
                        <DeleteIcon fontSize="small" />
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
                  <TableCell>ID</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
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
          <Tab label="Email Templates" value="templates" />
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
        <DialogContent>
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
              label="Subject Template"
              value={
                dialogMode === 'view'
                  ? selectedTemplate?.subject_template
                  : formData.subject_template
              }
              onChange={(e) => setFormData({ ...formData, subject_template: e.target.value })}
              disabled={dialogMode === 'view'}
              fullWidth
              required
            />
            {/* Body Template with Code/Preview Toggle */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Body Template (HTML) *
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
                    dialogMode === 'view' ? selectedTemplate?.body_template : formData.body_template
                  }
                  onChange={(e) => setFormData({ ...formData, body_template: e.target.value })}
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
                          ? selectedTemplate?.body_template || ''
                          : formData.body_template,
                    }}
                  />
                </Paper>
              )}
            </Box>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the template "{selectedTemplate?.template_name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationTemplate;

