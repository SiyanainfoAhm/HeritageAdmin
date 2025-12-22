import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

interface RejectionDialogProps {
  open: boolean;
  entityName: string;
  entityType: string;
  onClose: () => void;
  onConfirm: (rejectionReason: string) => void;
  loading?: boolean;
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  open,
  entityName,
  entityType,
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleConfirm = () => {
    if (rejectionReason.trim()) {
      onConfirm(rejectionReason.trim());
      setRejectionReason('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRejectionReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Reject {entityType}</Typography>
        <IconButton onClick={handleClose} disabled={loading} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You are about to reject <strong>{entityName}</strong> ({entityType}).
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Please provide a reason for rejection. This reason will be included in the notification sent to the user.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="Rejection Reason"
            placeholder="Enter the reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            disabled={loading}
            required
            error={!rejectionReason.trim() && rejectionReason.length > 0}
            helperText={
              !rejectionReason.trim() && rejectionReason.length > 0
                ? 'Rejection reason is required'
                : 'This reason will be sent to the user via notification'
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={!rejectionReason.trim() || loading}
        >
          {loading ? 'Rejecting...' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionDialog;
