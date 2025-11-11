import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import { MasterData, MasterDataCategory, MasterDataTranslation } from '@/types';
import { MasterDataService } from '@/services/masterData.service';
import { supabase } from '@/config/supabase';

interface MasterDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category: MasterDataCategory;
  masterData?: MasterData | null;
  mode: 'add' | 'edit';
}

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'HI', label: 'Hindi' },
  { code: 'GU', label: 'Gujarati' },
  { code: 'JA', label: 'Japanese' },
  { code: 'ES', label: 'Spanish' },
  { code: 'FR', label: 'French' },
];

const MasterDataDialog: React.FC<MasterDataDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  masterData,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Form state
  const [code, setCode] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, { displayName: string; description: string }>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && masterData) {
        setCode(masterData.code);
        setDisplayOrder(masterData.display_order);
        setIsActive(masterData.is_active);
        // Load translations
        loadTranslations(masterData.master_id);
      } else {
        // Reset form for add mode
        setCode('');
        setDisplayOrder(0);
        setIsActive(true);
        setTranslations({});
      }
      setError('');
    }
  }, [open, mode, masterData]);

  const loadTranslations = async (masterId: number) => {
    try {
      // Fetch translations for this master data item
      const { data, error } = await supabase
        .from('heritage_masterdatatranslation')
        .select('*')
        .eq('master_id', masterId);

      if (!error && data) {
        const transMap: Record<string, { displayName: string; description: string }> = {};
        data.forEach((trans: MasterDataTranslation) => {
          transMap[trans.language_code] = {
            displayName: trans.display_name,
            description: trans.description || '',
          };
        });
        setTranslations(transMap);
      }
    } catch (err) {
      console.error('Error loading translations:', err);
    }
  };

  const handleTranslationChange = (langCode: string, field: 'displayName' | 'description', value: string) => {
    setTranslations((prev) => ({
      ...prev,
      [langCode]: {
        ...prev[langCode],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!code.trim()) {
      setError('Code is required');
      return;
    }

    // At least one translation (display name) is required
    const hasTranslation = Object.values(translations).some((t) => t.displayName.trim());
    if (!hasTranslation) {
      setError('At least one translation (display name) is required');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'add') {
        // Create master data
        const result = await MasterDataService.createMasterData(
          category,
          code.trim(),
          displayOrder
        );

        if (!result.success) {
          setError(result.error?.message || 'Failed to create master data');
          setLoading(false);
          return;
        }

        const newMasterId = result.data?.master_id;

        // Create translations
        for (const [langCode, trans] of Object.entries(translations)) {
          if (trans.displayName.trim()) {
            await MasterDataService.upsertTranslation(
              newMasterId,
              langCode,
              trans.displayName.trim(),
              trans.description.trim() || undefined
            );
          }
        }
      } else if (mode === 'edit' && masterData) {
        // Update master data
        const result = await MasterDataService.updateMasterData(masterData.master_id, {
          code: code.trim(),
          display_order: displayOrder,
          is_active: isActive,
        });

        if (!result.success) {
          setError(result.error?.message || 'Failed to update master data');
          setLoading(false);
          return;
        }

        // Update translations
        for (const [langCode, trans] of Object.entries(translations)) {
          if (trans.displayName.trim()) {
            await MasterDataService.upsertTranslation(
              masterData.master_id,
              langCode,
              trans.displayName.trim(),
              trans.description.trim() || undefined
            );
          }
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Master Data' : 'Edit Master Data'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            margin="normal"
            required
            disabled={mode === 'edit'}
            helperText="Unique identifier for this master data item"
          />
          <TextField
            fullWidth
            label="Display Order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          {mode === 'edit' && (
            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
              label="Active"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Translations
        </Typography>

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          {LANGUAGES.map((lang) => (
            <Tab key={lang.code} label={lang.label} />
          ))}
        </Tabs>

        {LANGUAGES.map((lang, index) => (
          <Box key={lang.code} hidden={activeTab !== index} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={`Display Name (${lang.label})`}
              value={translations[lang.code]?.displayName || ''}
              onChange={(e) => handleTranslationChange(lang.code, 'displayName', e.target.value)}
              margin="normal"
              required={index === 0} // English is required
            />
            <TextField
              fullWidth
              label={`Description (${lang.label})`}
              value={translations[lang.code]?.description || ''}
              onChange={(e) => handleTranslationChange(lang.code, 'description', e.target.value)}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : mode === 'add' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MasterDataDialog;

