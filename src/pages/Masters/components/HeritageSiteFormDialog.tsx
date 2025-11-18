import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button } from '@mui/material';
import { HeritageSite } from '@/types';
import { HeritageSitePayload } from '@/services/heritageSite.service';

export type HeritageSiteFormValues = HeritageSitePayload;

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  loading?: boolean;
  initialValues?: HeritageSite | null;
  onClose: () => void;
  onSubmit: (payload: HeritageSiteFormValues) => Promise<void>;
}

const HeritageSiteFormDialog: React.FC<Props> = ({ open, mode, loading = false, onClose }) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
    <DialogTitle>{mode === 'create' ? 'Add Heritage Site' : 'Edit Heritage Site'}</DialogTitle>
    <DialogContent dividers>
      <Typography variant="body2" color="text.secondary">
        The heritage site editor is temporarily unavailable while we transition to the new full-page experience.
        Please close this dialog and use the latest workflow once it is available.
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} disabled={loading}>
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default HeritageSiteFormDialog;

