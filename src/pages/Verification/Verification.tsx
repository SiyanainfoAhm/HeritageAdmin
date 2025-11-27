import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  Pagination,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { VerificationService, VerificationRecord } from '@/services/verification.service';

const ENTITY_OPTIONS = [
  'All',
  'Local Guide',
  'Event Operator',
  'Food Vendor',
  'Artisan',
  'Hotel',
  'Tour Operator',
];

const STATUS_OPTIONS: Array<'All' | VerificationRecord['status']> = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS_COLOR: Record<VerificationRecord['status'], 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

const TYPE_COLOR: Record<string, string> = {
  'Local Guide': '#00c49f',
  'Event Operator': '#ff9f43',
  'Food Vendor': '#ff6b6b',
  Artisan: '#f72585',
  Hotel: '#2196f3',
  'Tour Operator': '#845ef7',
};

const PAGE_SIZE = 9;

const Verification = () => {
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | VerificationRecord['status']>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [userDetails, setUserDetails] = useState<{ user: any; businessDetails: any; documents: any[] } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedBusinessDetails, setEditedBusinessDetails] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState<{ open: boolean; key: string; label: string }>({ open: false, key: '', label: '' });
  const [newItemValue, setNewItemValue] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await VerificationService.getVerificationRecords({
        entityType: entityFilter,
        status: statusFilter,
        search: searchTerm,
        dateFrom: dateFilter || undefined,
        dateTo: dateFilter || undefined,
      });
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [entityFilter, statusFilter, dateFilter, searchTerm]);

  const handleApprove = async (record: VerificationRecord) => {
    setActionLoading(record.id);
    const result = await VerificationService.approveEntity(record.entityType, record.id);
    if (result.success) {
      fetchRecords();
    } else {
      setError(result.error || 'Failed to approve');
    }
    setActionLoading(null);
  };

  const handleReject = async (record: VerificationRecord) => {
    setActionLoading(record.id);
    const result = await VerificationService.rejectEntity(record.entityType, record.id);
    if (result.success) {
      fetchRecords();
    } else {
      setError(result.error || 'Failed to reject');
    }
    setActionLoading(null);
  };

  const filteredData = useMemo(() => {
    return records;
  }, [records]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, page]);

  const handleClearFilters = () => {
    setEntityFilter('All');
    setStatusFilter('All');
    setDateFilter('');
    setSearchTerm('');
    setPage(1);
    fetchRecords();
  };

  const handleViewDetails = async (record: VerificationRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
    setDetailLoading(true);
    setEditMode(false);
    
    const details = await VerificationService.getUserDetails(record.id, record.entityType);
    setUserDetails(details);
    if (details?.businessDetails) {
      setEditedBusinessDetails({ ...details.businessDetails });
    }
    setDetailLoading(false);
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - restore original
      if (userDetails?.businessDetails) {
        setEditedBusinessDetails({ ...userDetails.businessDetails });
      }
    }
    setEditMode(!editMode);
  };

  const handleFieldChange = (key: string, value: any) => {
    setEditedBusinessDetails((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedRecord || !userDetails) return;
    
    setSaving(true);
    const result = await VerificationService.updateBusinessDetails(
      selectedRecord.entityType,
      selectedRecord.id,
      editedBusinessDetails
    );
    
    if (result.success) {
      // Refresh details
      const details = await VerificationService.getUserDetails(selectedRecord.id, selectedRecord.entityType);
      setUserDetails(details);
      if (details?.businessDetails) {
        setEditedBusinessDetails({ ...details.businessDetails });
      }
      setEditMode(false);
      fetchRecords(); // Refresh list as verification status may have changed
    } else {
      setError(result.error || 'Failed to save changes');
    }
    setSaving(false);
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    const result = await VerificationService.deleteDocument(docId);
    if (result.success) {
      // Refresh details
      if (selectedRecord) {
        const details = await VerificationService.getUserDetails(selectedRecord.id, selectedRecord.entityType);
        setUserDetails(details);
      }
      fetchRecords(); // Refresh list as verification status may have changed
    } else {
      setError(result.error || 'Failed to delete document');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Verification
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: '#ffffff',
          border: '1px solid #f0f0f0',
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                label="Entity Type"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                startAdornment={<FilterAltOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {ENTITY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Submitted On"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="text"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleClearFilters}
              sx={{ textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 260 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted On</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={`${record.entityType}-${record.id}`} hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: '#fdecef',
                          color: '#f08060',
                          fontWeight: 600,
                          width: 42,
                          height: 42,
                        }}
                      >
                        {record.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join('')
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {record.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.entityType}
                      sx={{
                        backgroundColor: `${TYPE_COLOR[record.entityType] || '#e0e0e0'}22`,
                        color: TYPE_COLOR[record.entityType] || '#616161',
                        fontWeight: 500,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {record.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={STATUS_COLOR[record.status]}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 500, minWidth: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{format(new Date(record.submittedOn), 'MMMM d, yyyy')}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => handleViewDetails(record)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(record)}
                          disabled={actionLoading === record.id || record.status === 'Approved'}
                        >
                          {actionLoading === record.id ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(record)}
                          disabled={actionLoading === record.id || record.status === 'Rejected'}
                        >
                          <HighlightOffOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No records found for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredData.length)}-
            {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
          </Typography>
          <Pagination
            count={Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedRecord?.name} - Details</Typography>
          <Stack direction="row" spacing={1}>
            {!editMode ? (
              <Tooltip title="Edit">
                <IconButton onClick={handleEditToggle} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Save">
                  <IconButton onClick={handleSaveChanges} color="success" disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton onClick={handleEditToggle} color="error">
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton onClick={() => setDetailOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    <Typography>{selectedRecord?.name}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    <Typography>{selectedRecord?.entityType}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={selectedRecord?.status} color={STATUS_COLOR[selectedRecord?.status || 'Pending']} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                    <Typography>{selectedRecord?.submittedOn}</Typography>
                  </Grid>
                  {userDetails?.user?.email && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography>{userDetails.user.email}</Typography>
                    </Grid>
                  )}
                  {userDetails?.user?.phone && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      <Typography>{userDetails.user.phone}</Typography>
                    </Grid>
                  )}
                  {userDetails?.user?.verified_on && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Verified On</Typography>
                      <Typography>{format(new Date(userDetails.user.verified_on), 'MMMM d, yyyy')}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Business Details */}
              {userDetails?.businessDetails && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Business Details {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(editMode ? editedBusinessDetails : userDetails.businessDetails).map(([key, value]) => {
                      // Skip system fields - not editable
                      if (['id', 'user_id', 'created_at', 'updated_at', 'profile_id', 'artisan_id', 'guide_id', 'business_id', 'is_verified', 'verification_status'].includes(key)) return null;
                      
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      const currentValue = editMode ? editedBusinessDetails[key] : value;
                      
                      // Known array fields that should always be treated as arrays
                      const knownArrayFields = ['awards', 'languages', 'specializations', 'certifications', 'service_areas', 'expertise', 'skills'];
                      const isKnownArrayField = knownArrayFields.includes(key);
                      
                      // Handle arrays - show as chips with add/remove in edit mode
                      // Also handle PostgreSQL text[] format which may come as string like '{"item1","item2"}'
                      const isArrayField = isKnownArrayField || Array.isArray(currentValue) || Array.isArray(value) || 
                        (typeof currentValue === 'string' && currentValue.startsWith('{') && currentValue.endsWith('}'));
                      
                      if (isArrayField) {
                        let arrValue: string[] = [];
                        if (Array.isArray(currentValue)) {
                          arrValue = currentValue;
                        } else if (typeof currentValue === 'string' && currentValue.startsWith('{') && currentValue.endsWith('}')) {
                          // Parse PostgreSQL array format: {"item1","item2"}
                          const inner = currentValue.slice(1, -1);
                          if (inner) {
                            arrValue = inner.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
                          }
                        } else if (typeof currentValue === 'string' && currentValue) {
                          // Handle comma-separated string as array
                          arrValue = currentValue.split(',').map(s => s.trim()).filter(Boolean);
                        } else if (Array.isArray(value)) {
                          if (typeof value === 'string' && value) {
                            arrValue = (value as unknown as string).split(',').map(s => s.trim()).filter(Boolean);
                          } else if (Array.isArray(value)) {
                            arrValue = value;
                          } else {
                            arrValue = [];
                          }
                        } else if (isKnownArrayField) {
                          arrValue = [];
                        }
                        return (
                          <Grid item xs={12} key={key}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
                              {arrValue.length > 0 ? arrValue.map((item, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={String(item)} 
                                  size="small" 
                                  variant="outlined"
                                  onDelete={editMode ? () => {
                                    const newArr = arrValue.filter((_, i) => i !== idx);
                                    handleFieldChange(key, newArr);
                                  } : undefined}
                                />
                              )) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                              {editMode && (
                                <Chip
                                  label="+ Add"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={() => {
                                    // Initialize array in editedBusinessDetails if not already
                                    if (!Array.isArray(editedBusinessDetails[key])) {
                                      handleFieldChange(key, arrValue);
                                    }
                                    setAddItemDialog({ open: true, key, label });
                                    setNewItemValue('');
                                  }}
                                  sx={{ cursor: 'pointer' }}
                                />
                              )}
                            </Stack>
                          </Grid>
                        );
                      }
                      
                      // Handle objects - show as JSON or null
                      if (typeof currentValue === 'object' && currentValue !== null) {
                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2">{JSON.stringify(currentValue)}</Typography>
                          </Grid>
                        );
                      }
                      
                      // Handle booleans - show as Yes/No chips or select in edit mode
                      if (typeof currentValue === 'boolean' || (typeof value === 'boolean')) {
                        if (editMode) {
                          return (
                            <Grid item xs={6} key={key}>
                              <FormControl fullWidth size="small">
                                <InputLabel>{label}</InputLabel>
                                <Select
                                  value={editedBusinessDetails[key] ? 'true' : 'false'}
                                  label={label}
                                  onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
                                >
                                  <MenuItem value="true">Yes</MenuItem>
                                  <MenuItem value="false">No</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          );
                        }
                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Chip label={currentValue ? 'Yes' : 'No'} size="small" color={currentValue ? 'success' : 'default'} />
                          </Grid>
                        );
                      }
                      
                      // Handle null/undefined - show "null" text
                      if (currentValue === null || currentValue === undefined || currentValue === '') {
                        return (
                          <Grid item xs={6} key={key}>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                label={label}
                                defaultValue={editedBusinessDetails[key] || ''}
                                onBlur={(e) => handleFieldChange(key, e.target.value)}
                              />
                            ) : (
                              <>
                                <Typography variant="body2" color="text.secondary">{label}</Typography>
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              </>
                            )}
                          </Grid>
                        );
                      }
                      
                      // Handle regular text/numbers
                      if (editMode) {
                        return (
                          <Grid item xs={6} key={key}>
                            <TextField
                              fullWidth
                              size="small"
                              label={label}
                              defaultValue={editedBusinessDetails[key] || ''}
                              onBlur={(e) => handleFieldChange(key, e.target.value)}
                            />
                          </Grid>
                        );
                      }
                      
                      return (
                        <Grid item xs={6} key={key}>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Typography>{String(currentValue)}</Typography>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* Documents */}
              {userDetails?.documents && userDetails.documents.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Documents ({userDetails.documents.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {userDetails.documents.map((doc) => (
                      <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card variant="outlined" sx={{ position: 'relative' }}>
                          {editMode && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id)}
                              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                          {doc.url && (doc.url.endsWith('.jpg') || doc.url.endsWith('.jpeg') || doc.url.endsWith('.png')) ? (
                            <CardMedia
                              component="img"
                              height="120"
                              image={doc.url}
                              alt={doc.document_name}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                              <Typography variant="body2" color="text.secondary">Document</Typography>
                            </Box>
                          )}
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {doc.document_type || doc.document_name}
                            </Typography>
                            {doc.url && (
                              <Link href={doc.url} target="_blank" rel="noopener" variant="caption">
                                View Document
                              </Link>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedRecord?.entityType === 'Artisan' && selectedRecord?.rawData && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Artisan Details
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedRecord.rawData.craft_type && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Craft Type</Typography>
                        <Typography>{selectedRecord.rawData.craft_type}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.rawData.short_bio && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Bio</Typography>
                        <Typography>{selectedRecord.rawData.short_bio}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedRecord && selectedRecord.status !== 'Approved' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApprove(selectedRecord);
                setDetailOpen(false);
              }}
            >
              Approve
            </Button>
          )}
          {selectedRecord && selectedRecord.status !== 'Rejected' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleReject(selectedRecord);
                setDetailOpen(false);
              }}
            >
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog.open} onClose={() => setAddItemDialog({ open: false, key: '', label: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Add {addItemDialog.label}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={`New ${addItemDialog.label}`}
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newItemValue.trim()) {
                const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                handleFieldChange(addItemDialog.key, [...arrValue, newItemValue.trim()]);
                setAddItemDialog({ open: false, key: '', label: '' });
                setNewItemValue('');
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemDialog({ open: false, key: '', label: '' })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (newItemValue.trim()) {
                const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                handleFieldChange(addItemDialog.key, [...arrValue, newItemValue.trim()]);
                setAddItemDialog({ open: false, key: '', label: '' });
                setNewItemValue('');
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verification;

