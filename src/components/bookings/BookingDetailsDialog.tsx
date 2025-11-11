import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { BookingDetails } from '@/services/booking.service';
import { format } from 'date-fns';

interface BookingDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  booking: BookingDetails | null;
  loading?: boolean;
}

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({ open, onClose, booking, loading = false }) => {
  if (!booking) return null;

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
      food: 'Food & Beverage',
      guide: 'Local Guide',
      product: 'Product',
    };
    return names[module] || module;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Booking Details - {booking.booking_reference}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking ID
                </Typography>
                <Typography variant="body1">{booking.booking_id}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Module Type
                </Typography>
                <Typography variant="body1">{formatModuleName(booking.module_type)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Booking Status
                </Typography>
                <Chip
                  label={booking.status}
                  color={getStatusColor(booking.status) as any}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Payment Status
                </Typography>
                <Chip
                  label={booking.payment_status}
                  color={getStatusColor(booking.payment_status) as any}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Amount
                </Typography>
                <Typography variant="h6" color="success.main">
                  {booking.currency} {booking.total_amount.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {format(new Date(booking.created_at), 'PPpp')}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" gutterBottom>
              Customer Information
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{booking.customer_name || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{booking.customer_email || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{booking.customer_phone || '-'}</Typography>
              </Grid>
            </Grid>

            {/* Module-specific fields */}
            {booking.module_type === 'hotel' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Hotel Booking Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Check-in Date
                    </Typography>
                    <Typography variant="body1">
                      {booking.check_in_date ? format(new Date(booking.check_in_date), 'PP') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Check-out Date
                    </Typography>
                    <Typography variant="body1">
                      {booking.check_out_date ? format(new Date(booking.check_out_date), 'PP') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Number of Guests
                    </Typography>
                    <Typography variant="body1">{booking.num_guests || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Number of Rooms
                    </Typography>
                    <Typography variant="body1">{booking.num_rooms || '-'}</Typography>
                  </Grid>
                </Grid>
              </>
            )}

            {booking.module_type === 'tour' && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Tour Booking Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Selected Date
                    </Typography>
                    <Typography variant="body1">
                      {booking.selected_date ? format(new Date(booking.selected_date), 'PP') : '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Number of Travelers
                    </Typography>
                    <Typography variant="body1">{booking.num_travelers || '-'}</Typography>
                  </Grid>
                </Grid>
              </>
            )}

            {booking.special_requests && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Special Requests
                </Typography>
                <Typography variant="body2">{booking.special_requests}</Typography>
              </>
            )}

            {booking.payment_method && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Payment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1">{booking.payment_method}</Typography>
                  </Grid>
                  {booking.payment_reference && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Payment Reference
                      </Typography>
                      <Typography variant="body1">{booking.payment_reference}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;

