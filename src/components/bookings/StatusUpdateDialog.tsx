import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { Booking } from '@/services/booking.service';

interface StatusUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (status: string, paymentStatus?: string) => Promise<void>;
  booking: Booking | null;
  loading?: boolean;
}

const BOOKING_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'completed', label: 'Completed' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
];

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const StatusUpdateDialog: React.FC<StatusUpdateDialogProps> = ({
  open,
  onClose,
  onUpdate,
  booking,
  loading = false,
}) => {
  const [status, setStatus] = useState(booking?.status || 'pending');
  const [paymentStatus, setPaymentStatus] = useState(booking?.payment_status || 'pending');
  const [error, setError] = useState('');

  // Update state when booking changes
  useEffect(() => {
    if (booking) {
      setStatus(booking.status || 'pending');
      setPaymentStatus(booking.payment_status || 'pending');
      setError('');
    }
  }, [booking]);

  const handleSubmit = async () => {
    setError('');
    try {
      await onUpdate(status, paymentStatus);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update booking status');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Booking Status</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {booking && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Booking Reference: {booking.booking_reference}
            </Typography>
          </Box>
        )}

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Booking Status</InputLabel>
          <Select value={status} label="Booking Status" onChange={(e) => setStatus(e.target.value)}>
            {BOOKING_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Payment Status</InputLabel>
          <Select
            value={paymentStatus}
            label="Payment Status"
            onChange={(e) => setPaymentStatus(e.target.value)}
          >
            {PAYMENT_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StatusUpdateDialog;

