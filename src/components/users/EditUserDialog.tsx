import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { User, UserType } from '@/types';
import { UserService, UserUpdateData } from '@/services/user.service';

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
  loading?: boolean;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ open, onClose, onSave, user, loading = false }) => {
  const [formData, setFormData] = useState<UserUpdateData>({
    full_name: '',
    email: '',
    phone: '',
    is_verified: false,
    language_code: 'EN',
    user_type_id: 1,
  });
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUserTypes();
      if (user) {
        setFormData({
          full_name: user.full_name,
          email: user.email,
          phone: user.phone || '',
          is_verified: user.is_verified,
          language_code: user.language_code || 'EN',
          user_type_id: user.user_type_id,
        });
      }
      setError('');
    }
  }, [open, user]);

  const fetchUserTypes = async () => {
    try {
      const types = await UserService.getUserTypes();
      setUserTypes(types.map((t) => ({ user_type_id: t.user_type_id, type_key: '', type_name: t.type_name })));
    } catch (err) {
      console.error('Error fetching user types:', err);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setError('');
    
    // Validation
    if (!formData.full_name?.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email?.trim()) {
      setError('Email is required');
      return;
    }

    setSaving(true);
    try {
      const result = await UserService.updateUser(user.user_id, formData);
      if (result.success) {
        onSave();
        onClose();
      } else {
        setError(result.error || 'Failed to update user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Full Name"
          value={formData.full_name || ''}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Phone"
          value={formData.phone || ''}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>User Type</InputLabel>
          <Select
            value={formData.user_type_id || 1}
            label="User Type"
            onChange={(e) => setFormData({ ...formData, user_type_id: e.target.value as number })}
          >
            {userTypes.map((type) => (
              <MenuItem key={type.user_type_id} value={type.user_type_id}>
                {type.type_name || `Type ${type.user_type_id}`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel>Language</InputLabel>
          <Select
            value={formData.language_code || 'EN'}
            label="Language"
            onChange={(e) => setFormData({ ...formData, language_code: e.target.value })}
          >
            <MenuItem value="EN">English</MenuItem>
            <MenuItem value="HI">Hindi</MenuItem>
            <MenuItem value="GU">Gujarati</MenuItem>
            <MenuItem value="JA">Japanese</MenuItem>
            <MenuItem value="ES">Spanish</MenuItem>
            <MenuItem value="FR">French</MenuItem>
          </Select>
        </FormControl>
        <FormControlLabel
          control={
            <Switch
              checked={formData.is_verified || false}
              onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
            />
          }
          label="Verified"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving || loading}>
          {saving ? <CircularProgress size={20} /> : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;

