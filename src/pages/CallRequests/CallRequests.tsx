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
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Menu,
} from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  MoreVert as MoreVertIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import TablePagination from '@mui/material/TablePagination';
import { CallRequestService, CallSupportRequest, CallRequestFilters } from '@/services/callRequest.service';
import { UserService } from '@/services/user.service';
import { formatDisplayDate, formatDisplayTime } from '@/utils/dateTime.utils';
import { format } from 'date-fns';
import { getDefaultDateRange } from '@/utils/dateRange';

const REQUEST_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'working', label: 'Working' },
  { value: 'closed', label: 'Closed' },
];

const CallRequests = () => {
  const [requests, setRequests] = useState<CallSupportRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userTypes, setUserTypes] = useState<Array<{ user_type_id: number; type_name: string }>>([]);

  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  // Filter states
  const [filters, setFilters] = useState<CallRequestFilters>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return {
      status: 'pending',
      startDate,
      endDate,
      searchTerm: '',
      userTypeId: undefined,
      page: 1,
      limit: 10,
    };
  });

  // Dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CallSupportRequest | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');
  const [newStatus, setNewStatus] = useState<string>('');

  // Menu anchor for action menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    fetchRequests();
  }, [filters.status, filters.searchTerm, filters.startDate, filters.endDate, filters.userTypeId, page, rowsPerPage]);

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const types = await UserService.getUserTypes();
      // Filter out Administrator and retailer user types
      const filteredTypes = types.filter(
        (type) =>
          type.type_name.toLowerCase() !== 'administrator' &&
          type.type_name.toLowerCase() !== 'retailer'
      );
      setUserTypes(filteredTypes);
    } catch (err) {
      console.error('Error fetching user types:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Ensure status is always set to 'pending' if not provided
      const status = filters.status || 'pending';
      const response = await CallRequestService.getAllCallRequests({
        status: status,
        searchTerm: filters.searchTerm,
        startDate: filters.startDate,
        endDate: filters.endDate,
        userTypeId: filters.userTypeId,
        page: page + 1, // page is 0-indexed in MUI, but 1-indexed in API
        limit: rowsPerPage,
      });
      setRequests(response.data);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch call requests');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsCalled = async (requestId: number) => {
    setUpdateLoading(true);
    try {
      const result = await CallRequestService.updateCallInformation(requestId);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to mark as called');
      }

      setSuccess('Request marked as called successfully');
      fetchRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to mark as called');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, request: CallSupportRequest) => {
    setAnchorEl(event.currentTarget);
    setSelectedRequest(request);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (request: CallSupportRequest, status: string) => {
    setSelectedRequest(request);
    setNewStatus(status);
    setStatusNotes('');
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseRequest = (request: CallSupportRequest) => {
    setSelectedRequest(request);
    setStatusNotes('');
    setCloseDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdateStatus = async () => {
    if (!selectedRequest || !newStatus) return;

    setUpdateLoading(true);
    try {
      const result = await CallRequestService.updateRequestStatus(
        selectedRequest.request_id,
        newStatus,
        statusNotes || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update request status');
      }

      setSuccess(`Request status updated to ${newStatus} successfully`);
      fetchRequests();
      setStatusDialogOpen(false);
      setSelectedRequest(null);
      setStatusNotes('');
      setNewStatus('');
    } catch (err: any) {
      setError(err.message || 'Failed to update request status');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCloseRequestConfirm = async () => {
    if (!selectedRequest) return;

    setUpdateLoading(true);
    try {
      const result = await CallRequestService.closeRequest(
        selectedRequest.request_id,
        statusNotes || undefined
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to close request');
      }

      setSuccess('Request closed successfully');
      fetchRequests();
      setCloseDialogOpen(false);
      setSelectedRequest(null);
      setStatusNotes('');
    } catch (err: any) {
      setError(err.message || 'Failed to close request');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'closed':
        return 'success';
      case 'working':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Call Support Requests
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by phone, name, or email"
            value={filters.searchTerm || ''}
            onChange={(e) => {
              setFilters({ ...filters, searchTerm: e.target.value });
              setPage(0); // Reset to first page when search changes
            }}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || 'pending'}
              label="Status"
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value as string });
                setPage(0); // Reset to first page when filter changes
              }}
            >
              {REQUEST_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              value={filters.userTypeId || ''}
              label="User Type"
              onChange={(e) => {
                setFilters({
                  ...filters,
                  userTypeId: e.target.value ? Number(e.target.value) : undefined,
                });
                setPage(0); // Reset to first page when filter changes
              }}
            >
              <MenuItem value="">All Types</MenuItem>
              {userTypes.map((type) => (
                <MenuItem key={type.user_type_id} value={type.user_type_id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              setFilters({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : null,
              });
              setPage(0); // Reset to first page when filter changes
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) => {
              setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : null,
              });
              setPage(0); // Reset to first page when filter changes
            }}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Language</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Called At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {loading ? 'Loading...' : 'No call requests found'}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request) => (
                  <TableRow key={request.request_id} hover>
                    <TableCell>{request.request_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {request.user_name || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.user_email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{request.full_phone_number || request.phone_number}</Typography>
                    </TableCell>
                    <TableCell>{request.preferred_language || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip
                        label={request.request_status || 'pending'}
                        color={getStatusColor(request.request_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDisplayDate(request.created_at)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDisplayTime(request.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {request.called_at ? (
                        <>
                          <Typography variant="body2">
                            {formatDisplayDate(request.called_at)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDisplayTime(request.called_at)}
                            {request.call_duration_seconds && ` (${Math.floor(request.call_duration_seconds / 60)}m)`}
                          </Typography>
                        </>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Not called
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, request)}
                        title="More actions"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedRequest && !selectedRequest.called_at && (
          <MenuItem
            onClick={() => {
              handleMarkAsCalled(selectedRequest.request_id);
              handleMenuClose();
            }}
            disabled={updateLoading}
          >
            <PhoneIcon sx={{ mr: 1, fontSize: 20 }} />
            Mark as Called
          </MenuItem>
        )}
        {selectedRequest && selectedRequest.request_status !== 'working' && (
          <MenuItem onClick={() => handleStatusChange(selectedRequest, 'working')}>
            <WorkIcon sx={{ mr: 1, fontSize: 20 }} />
            Set to Working
          </MenuItem>
        )}
        {selectedRequest && selectedRequest.request_status !== 'closed' && (
          <MenuItem onClick={() => handleCloseRequest(selectedRequest)}>
            <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
            Close Request
          </MenuItem>
        )}
      </Menu>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Request Status</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Change request status to <strong>{newStatus}</strong>?
          </DialogContentText>
          <TextField
            label="Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Add any notes about this status change..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} disabled={updateLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateStatus} variant="contained" disabled={updateLoading}>
            {updateLoading ? <CircularProgress size={20} /> : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Close Request Dialog */}
      <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Close Request</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to close this request? This action cannot be undone.
          </DialogContentText>
          <TextField
            label="Closing Notes (Optional)"
            multiline
            rows={4}
            fullWidth
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="Add any notes about closing this request..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseDialogOpen(false)} disabled={updateLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCloseRequestConfirm}
            variant="contained"
            color="error"
            disabled={updateLoading}
          >
            {updateLoading ? <CircularProgress size={20} /> : 'Close Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CallRequests;