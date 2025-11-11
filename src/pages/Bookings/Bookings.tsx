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
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { BookingService, Booking, BookingFilters, BookingDetails } from '@/services/booking.service';
import BookingDetailsDialog from '@/components/bookings/BookingDetailsDialog';
import StatusUpdateDialog from '@/components/bookings/StatusUpdateDialog';
import { format } from 'date-fns';
import { getDefaultDateRange } from '@/utils/dateRange';

const MODULE_TYPES = [
  { value: '', label: 'All Modules' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'tour', label: 'Tours' },
  { value: 'event', label: 'Events' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'guide', label: 'Local Guides' },
];

const BOOKING_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payment Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const Bookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter states
  const [filters, setFilters] = useState<BookingFilters>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return {
      moduleType: '',
      status: '',
      paymentStatus: '',
      startDate,
      endDate,
      searchTerm: '',
    };
  });

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<BookingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await BookingService.getAllBookings(filters);
      setBookings(data);
      setFilteredBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (booking: Booking) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setSelectedBooking(booking);
    try {
      const details = await BookingService.getBookingDetails(booking.booking_id, booking.module_type);
      setSelectedBookingDetails(details);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch booking details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string, paymentStatus?: string) => {
    if (!selectedBooking) return;

    setUpdateLoading(true);
    try {
      // Update booking status
      const result = await BookingService.updateBookingStatus(
        selectedBooking.booking_id,
        selectedBooking.module_type,
        status
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to update booking status');
      }

      // Update payment status if provided
      if (paymentStatus) {
        const paymentResult = await BookingService.updatePaymentStatus(
          selectedBooking.booking_id,
          selectedBooking.module_type,
          paymentStatus
        );

        if (!paymentResult.success) {
          throw new Error(paymentResult.error || 'Failed to update payment status');
        }
      }

      setSuccess('Booking status updated successfully');
      fetchBookings();
      setStatusDialogOpen(false);
      setSelectedBooking(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
      throw err;
    } finally {
      setUpdateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
      case 'checked_in':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
      case 'no_show':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatModuleName = (module: string) => {
    const names: Record<string, string> = {
      hotel: 'Hotel',
      tour: 'Tour',
      event: 'Event',
      food: 'Food',
      guide: 'Guide',
      product: 'Product',
    };
    return names[module] || module;
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Bookings Management
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
            placeholder="Search by reference, name, email, or phone"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
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
            <InputLabel>Module</InputLabel>
            <Select
              value={filters.moduleType || ''}
              label="Module"
              onChange={(e) => setFilters({ ...filters, moduleType: e.target.value || undefined })}
            >
              {MODULE_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            >
              {BOOKING_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Payment Status</InputLabel>
            <Select
              value={filters.paymentStatus || ''}
              label="Payment Status"
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value || undefined })}
            >
              {PAYMENT_STATUSES.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
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
                <TableCell>Booking ID</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {bookings.length === 0 ? 'No bookings found' : 'No results match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={`${booking.module_type}-${booking.booking_id}`} hover>
                    <TableCell>{booking.booking_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.booking_reference}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatModuleName(booking.module_type)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.customer_name || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {booking.customer_email || ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={booking.payment_status}
                        color={getStatusColor(booking.payment_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {booking.currency} {booking.total_amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(booking.created_at), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(booking)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setStatusDialogOpen(true);
                        }}
                        title="Update Status"
                      >
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

      {/* Dialogs */}
      <BookingDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedBooking(null);
          setSelectedBookingDetails(null);
        }}
        booking={selectedBookingDetails}
        loading={detailsLoading}
      />

      <StatusUpdateDialog
        open={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setSelectedBooking(null);
        }}
        onUpdate={handleUpdateStatus}
        booking={selectedBooking}
        loading={updateLoading}
      />
    </Box>
  );
};

export default Bookings;

