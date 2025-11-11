import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { HeritageSite } from '@/types';
import { HeritageSiteEntryType, HeritageSiteExperience } from '@/services/heritageSite.service';

export interface HeritageSiteFormValues {
  name_default: string;
  short_desc_default: string;
  full_desc_default: string;
  site_type: string;
  latitude: string;
  longitude: string;
  vr_link: string;
  qr_link: string;
  meta_title_def: string;
  meta_description_def: string;
  entry_type: HeritageSiteEntryType;
  entry_fee: string;
  experience: HeritageSiteExperience;
  accessibility: string;
  is_active: boolean;
}

const steps = ['Overview', 'Content', 'Links & Settings', 'Review'];

const DEFAULT_VALUES: HeritageSiteFormValues = {
  name_default: '',
  short_desc_default: '',
  full_desc_default: '',
  site_type: '',
  latitude: '',
  longitude: '',
  vr_link: '',
  qr_link: '',
  meta_title_def: '',
  meta_description_def: '',
  entry_type: 'free',
  entry_fee: '',
  experience: 'vr',
  accessibility: '',
  is_active: true,
};

const EXPERIENCE_OPTIONS: { label: string; value: HeritageSiteExperience }[] = [
  { label: 'VR', value: 'vr' },
  { label: 'Audio Guide', value: 'audio_guide' },
  { label: 'Guided Tour', value: 'guided_tour' },
  { label: 'Interactive', value: 'interactive' },
];

const ENTRY_TYPE_OPTIONS: { label: string; value: HeritageSiteEntryType }[] = [
  { label: 'Free Entry', value: 'free' },
  { label: 'Paid Entry', value: 'paid' },
];

interface HeritageSiteFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  loading?: boolean;
  initialValues?: HeritageSite | null;
  onClose: () => void;
  onSubmit: (values: HeritageSiteFormValues) => Promise<void>;
}

const HeritageSiteFormDialog: React.FC<HeritageSiteFormDialogProps> = ({
  open,
  mode,
  loading = false,
  initialValues,
  onClose,
  onSubmit,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formValues, setFormValues] = useState<HeritageSiteFormValues>(DEFAULT_VALUES);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setActiveStep(0);
      if (mode === 'edit' && initialValues) {
        setFormValues({
          name_default: initialValues.name_default || '',
          short_desc_default: initialValues.short_desc_default || '',
          full_desc_default: initialValues.full_desc_default || '',
          site_type: initialValues.site_type || '',
          latitude: initialValues.latitude !== null && initialValues.latitude !== undefined ? String(initialValues.latitude) : '',
          longitude: initialValues.longitude !== null && initialValues.longitude !== undefined ? String(initialValues.longitude) : '',
          vr_link: initialValues.vr_link || '',
          qr_link: initialValues.qr_link || '',
          meta_title_def: initialValues.meta_title_def || '',
          meta_description_def: initialValues.meta_description_def || '',
          entry_type: (initialValues.entry_type as HeritageSiteEntryType) || 'free',
          entry_fee: initialValues.entry_fee !== null && initialValues.entry_fee !== undefined ? String(initialValues.entry_fee) : '',
          experience: (initialValues.experience as HeritageSiteExperience) || 'vr',
          accessibility: initialValues.accessibility || '',
          is_active: initialValues.is_active,
        });
      } else {
        setFormValues(DEFAULT_VALUES);
      }
      setErrors({});
    }
  }, [open, mode, initialValues]);

  const reviewData = useMemo(
    () => [
      { label: 'Site Name', value: formValues.name_default || '—' },
      { label: 'Short Description', value: formValues.short_desc_default || '—' },
      { label: 'Full Description', value: formValues.full_desc_default || '—' },
      { label: 'Site Type', value: formValues.site_type || '—' },
      { label: 'Experience', value: EXPERIENCE_OPTIONS.find((opt) => opt.value === formValues.experience)?.label || '—' },
      { label: 'Entry Type', value: ENTRY_TYPE_OPTIONS.find((opt) => opt.value === formValues.entry_type)?.label || '—' },
      {
        label: 'Entry Fee',
        value:
          formValues.entry_type === 'paid'
            ? formValues.entry_fee
              ? `₹${formValues.entry_fee}`
              : '₹0'
            : 'Free Entry',
      },
      { label: 'Latitude', value: formValues.latitude || '—' },
      { label: 'Longitude', value: formValues.longitude || '—' },
      { label: 'VR Link', value: formValues.vr_link || '—' },
      { label: 'QR Link', value: formValues.qr_link || '—' },
      { label: 'Meta Title', value: formValues.meta_title_def || '—' },
      { label: 'Meta Description', value: formValues.meta_description_def || '—' },
      { label: 'Accessibility', value: formValues.accessibility || '—' },
      { label: 'Status', value: formValues.is_active ? 'Active' : 'Inactive' },
    ],
    [formValues]
  );

  const handleChange = (field: keyof HeritageSiteFormValues, value: any) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number) => {
    const stepErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formValues.name_default.trim()) {
        stepErrors.name_default = 'Site name is required';
      }
      if (!formValues.short_desc_default.trim()) {
        stepErrors.short_desc_default = 'Short description is required';
      }
      if (!formValues.site_type.trim()) {
        stepErrors.site_type = 'Site type is required';
      }
      if (formValues.latitude && Number.isNaN(Number(formValues.latitude))) {
        stepErrors.latitude = 'Latitude must be a valid number';
      }
      if (formValues.longitude && Number.isNaN(Number(formValues.longitude))) {
        stepErrors.longitude = 'Longitude must be a valid number';
      }
    }

    if (step === 1) {
      if (!formValues.full_desc_default.trim()) {
        stepErrors.full_desc_default = 'Full description is required';
      }
    }

    if (step === 2) {
      if (formValues.entry_type === 'paid' && !formValues.entry_fee.trim()) {
        stepErrors.entry_fee = 'Entry fee is required for paid entry';
      }
      if (formValues.entry_type === 'paid' && Number.isNaN(Number(formValues.entry_fee))) {
        stepErrors.entry_fee = 'Entry fee must be a valid number';
      }
    }

    setErrors(stepErrors);

    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (validateStep(activeStep)) {
      await onSubmit(formValues);
    }
  };

  const renderOverview = () => (
    <Stack spacing={3}>
      <TextField
        label="Site Name"
        value={formValues.name_default}
        onChange={(event) => handleChange('name_default', event.target.value)}
        required
        error={Boolean(errors.name_default)}
        helperText={errors.name_default}
      />

      <FormControl fullWidth>
        <TextField
          label="Site Type"
          value={formValues.site_type}
          onChange={(event) => handleChange('site_type', event.target.value)}
          placeholder="e.g. Heritage Site, Stepwell, Fort"
          error={Boolean(errors.site_type)}
          helperText={errors.site_type}
        />
      </FormControl>

      <TextField
        label="Short Description"
        value={formValues.short_desc_default}
        onChange={(event) => handleChange('short_desc_default', event.target.value)}
        multiline
        rows={3}
        required
        error={Boolean(errors.short_desc_default)}
        helperText={errors.short_desc_default}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Latitude"
          value={formValues.latitude}
          onChange={(event) => handleChange('latitude', event.target.value)}
          error={Boolean(errors.latitude)}
          helperText={errors.latitude}
          fullWidth
        />
        <TextField
          label="Longitude"
          value={formValues.longitude}
          onChange={(event) => handleChange('longitude', event.target.value)}
          error={Boolean(errors.longitude)}
          helperText={errors.longitude}
          fullWidth
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <FormControl fullWidth>
          <InputLabel id="experience-label">Experience Type</InputLabel>
          <Select
            labelId="experience-label"
            value={formValues.experience}
            label="Experience Type"
            onChange={(event) => handleChange('experience', event.target.value as HeritageSiteExperience)}
          >
            {EXPERIENCE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="entry-type-label">Entry Type</InputLabel>
          <Select
            labelId="entry-type-label"
            value={formValues.entry_type}
            label="Entry Type"
            onChange={(event) => handleChange('entry_type', event.target.value as HeritageSiteEntryType)}
          >
            {ENTRY_TYPE_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {formValues.entry_type === 'paid' && (
        <TextField
          label="Entry Fee (₹)"
          value={formValues.entry_fee}
          onChange={(event) => handleChange('entry_fee', event.target.value)}
          error={Boolean(errors.entry_fee)}
          helperText={errors.entry_fee}
        />
      )}

      <FormControlLabel
        control={<Switch checked={formValues.is_active} onChange={(event) => handleChange('is_active', event.target.checked)} />}
        label={formValues.is_active ? 'Active (visible to users)' : 'Inactive (hidden from users)'}
      />
    </Stack>
  );

  const renderContent = () => (
    <Stack spacing={3}>
      <TextField
        label="Full Description"
        value={formValues.full_desc_default}
        onChange={(event) => handleChange('full_desc_default', event.target.value)}
        multiline
        rows={6}
        required
        error={Boolean(errors.full_desc_default)}
        helperText={errors.full_desc_default}
      />

      <TextField
        label="Meta Title"
        value={formValues.meta_title_def}
        onChange={(event) => handleChange('meta_title_def', event.target.value)}
        placeholder="Used for SEO purposes"
      />

      <TextField
        label="Meta Description"
        value={formValues.meta_description_def}
        onChange={(event) => handleChange('meta_description_def', event.target.value)}
        multiline
        rows={3}
        placeholder="Short summary used for meta description"
      />

      <TextField
        label="Accessibility Information"
        value={formValues.accessibility}
        onChange={(event) => handleChange('accessibility', event.target.value)}
        placeholder="e.g. Wheelchair access, ramps, audio descriptions"
      />
    </Stack>
  );

  const renderLinks = () => (
    <Stack spacing={3}>
      <TextField
        label="VR Experience Link"
        value={formValues.vr_link}
        onChange={(event) => handleChange('vr_link', event.target.value)}
        placeholder="https://..."
      />

      <TextField
        label="QR Code Landing Link"
        value={formValues.qr_link}
        onChange={(event) => handleChange('qr_link', event.target.value)}
        placeholder="https://..."
      />
    </Stack>
  );

  const renderReview = () => (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
        Review Heritage Site Details
      </Typography>
      <Stack spacing={1.5}>
        {reviewData.map((item) => (
          <Box
            key={item.label}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              gap: 1,
              backgroundColor: '#fdf8f4',
              borderRadius: 2,
              px: 2,
              py: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: { sm: 180 } }}>
              {item.label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderOverview();
      case 1:
        return renderContent();
      case 2:
        return renderLinks();
      case 3:
        return renderReview();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        {mode === 'create' ? 'Add New Heritage Site' : 'Edit Heritage Site'}
        <Typography variant="body2" color="text.secondary">
          Provide detailed information to showcase this heritage site across the platform.
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: '#fdf8f4' }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ px: { xs: 0, sm: 1 } }}>{renderStepContent()}</Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ width: '100%' }} justifyContent="space-between">
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Box>
            <Button onClick={handleBack} disabled={activeStep === 0 || loading} sx={{ mr: 1 }}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext} disabled={loading}>
                Next
              </Button>
            ) : (
              <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                {mode === 'create' ? 'Create Heritage Site' : 'Update Heritage Site'}
              </Button>
            )}
          </Box>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

export default HeritageSiteFormDialog;

