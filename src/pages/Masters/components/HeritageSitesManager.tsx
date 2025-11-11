import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { HeritageSite } from '@/types';
import { HeritageSiteService, HeritageSiteFilters, HeritageSitePayload, HeritageSiteExperience } from '@/services/heritageSite.service';
import HeritageSiteFormDialog, { HeritageSiteFormValues } from './HeritageSiteFormDialog';
import HeritageSiteViewDialog from './HeritageSiteViewDialog';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

const HeritageSitesManager: React.FC = () => {
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [experienceFilter, setExperienceFilter] = useState<HeritageSiteExperience | 'all'>('all');
  const [siteTypeFilter, setSiteTypeFilter] = useState<string>('all');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<HeritageSite | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const fetchSites = async (filters?: HeritageSiteFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await HeritageSiteService.getHeritageSites(filters);
      setSites(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load heritage sites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleApplyFilters = () => {
    fetchSites({
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      experience: experienceFilter,
      siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setExperienceFilter('all');
    setSiteTypeFilter('all');
    fetchSites();
  };

  const openCreateDialog = () => {
    setFormMode('create');
    setSelectedSite(null);
    setFormOpen(true);
  };

  const openEditDialog = (site: HeritageSite) => {
    setFormMode('edit');
    setSelectedSite(site);
    setFormOpen(true);
  };

  const openViewDialog = (site: HeritageSite) => {
    setSelectedSite(site);
    setViewDialogOpen(true);
  };

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFormSubmit = async (values: HeritageSiteFormValues) => {
    const payload: HeritageSitePayload = {
      name_default: values.name_default.trim(),
      short_desc_default: values.short_desc_default.trim(),
      full_desc_default: values.full_desc_default.trim(),
      site_type: values.site_type.trim() || null,
      latitude: values.latitude ? Number(values.latitude) : null,
      longitude: values.longitude ? Number(values.longitude) : null,
      vr_link: values.vr_link.trim() || null,
      qr_link: values.qr_link.trim() || null,
      meta_title_def: values.meta_title_def.trim() || null,
      meta_description_def: values.meta_description_def.trim() || null,
      is_active: values.is_active,
      entry_type: values.entry_type || null,
      entry_fee: values.entry_type === 'paid' ? Number(values.entry_fee || 0) : 0,
      experience: values.experience || null,
      accessibility: values.accessibility.trim() || null,
    };

    setActionLoading(true);
    try {
      let result;
      if (formMode === 'edit' && selectedSite) {
        result = await HeritageSiteService.updateHeritageSite(selectedSite.site_id, payload);
      } else {
        result = await HeritageSiteService.createHeritageSite(payload);
      }

      if (!result.success) {
        throw result.error || new Error('Failed to save heritage site.');
      }

      showSnackbar(`Heritage site ${formMode === 'create' ? 'created' : 'updated'} successfully.`);
      setFormOpen(false);
      await fetchSites({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        experience: experienceFilter,
        siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
      });
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to save heritage site.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(true);
    try {
      const result = await HeritageSiteService.deleteHeritageSite(deleteConfirm.site_id);
      if (!result.success) {
        throw result.error || new Error('Failed to delete heritage site.');
      }
      showSnackbar('Heritage site deleted successfully.');
      setDeleteConfirm(null);
      await fetchSites({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        experience: experienceFilter,
        siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
      });
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to delete heritage site.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (site: HeritageSite) => {
    setActionLoading(true);
    try {
      const result = await HeritageSiteService.toggleHeritageSiteStatus(site.site_id, !site.is_active);
      if (!result.success) {
        throw result.error || new Error('Failed to update status.');
      }
      showSnackbar(`Heritage site marked as ${site.is_active ? 'inactive' : 'active'}.`);
      await fetchSites({
        search: searchTerm || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        experience: experienceFilter,
        siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
      });
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const experienceOptions = useMemo(() => {
    const uniqueExperiences = new Set<HeritageSiteExperience>();
    sites.forEach((site) => {
      if (site.experience) {
        uniqueExperiences.add(site.experience as HeritageSiteExperience);
      }
    });
    return Array.from(uniqueExperiences);
  }, [sites]);

  const siteTypeOptions = useMemo(() => {
    const uniqueTypes = new Set<string>();
    sites.forEach((site) => {
      if (site.site_type) {
        uniqueTypes.add(site.site_type);
      }
    });
    return Array.from(uniqueTypes);
  }, [sites]);

  return (
    <Box sx={{ mt: 3 }}>
      <Paper
        sx={{
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(180deg, rgba(218,133,82,0.08) 0%, rgba(218,133,82,0) 100%)',
          mb: 3,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#3F3D56' }}>
              Heritage Site Library
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage the complete catalogue of heritage destinations showcased in the platform.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleResetFilters}
              sx={{ borderRadius: 999 }}
              disabled={loading}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateDialog}
              sx={{ borderRadius: 999, backgroundColor: '#DA8552', '&:hover': { backgroundColor: '#C06A36' } }}
            >
              Add Heritage Site
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              placeholder="Search by site name or description"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ flexGrow: 1 }}
              size="small"
            />
            <TextField
              select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | 'active' | 'inactive')}
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <TextField
              select
              label="Experience"
              value={experienceFilter}
              onChange={(event) => setExperienceFilter(event.target.value as HeritageSiteExperience | 'all')}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="all">All</MenuItem>
              {experienceOptions.map((experience) => (
                <MenuItem key={experience} value={experience}>
                  {experience.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Site Type"
              value={siteTypeFilter}
              onChange={(event) => setSiteTypeFilter(event.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All</MenuItem>
              {siteTypeOptions.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ borderRadius: 999, backgroundColor: '#3F3D56', '&:hover': { backgroundColor: '#2f2d43' } }}
              disabled={loading}
            >
              Apply
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fdf8f4' }}>
                <TableCell>Site</TableCell>
                <TableCell>Experience</TableCell>
                <TableCell>Entry</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No heritage sites found. Try adjusting filters or add a new entry.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sites.map((site) => (
                  <TableRow key={site.site_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {site.name_default}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {site.site_type || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={site.experience ? site.experience.replace(/_/g, ' ') : '—'}
                        size="small"
                        sx={{ backgroundColor: '#DA855210', color: '#DA8552', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {site.entry_type ? site.entry_type.toUpperCase() : '—'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {site.entry_type === 'paid' ? `₹${site.entry_fee ?? 0}` : 'Free Entry'}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={site.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                        label={site.is_active ? 'Active' : 'Inactive'}
                        color={site.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {site.updated_at ? new Date(site.updated_at).toLocaleDateString() : '—'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {site.updated_at ? new Date(site.updated_at).toLocaleTimeString() : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title={site.is_active ? 'Mark as Inactive' : 'Mark as Active'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleStatus(site)}
                            disabled={actionLoading}
                            color={site.is_active ? 'success' : 'default'}
                          >
                            {site.is_active ? <CheckCircleIcon /> : <CancelIcon />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View details">
                          <IconButton size="small" onClick={() => openViewDialog(site)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEditDialog(site)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteConfirm(site)} disabled={actionLoading}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <HeritageSiteFormDialog
        open={formOpen}
        mode={formMode}
        loading={actionLoading}
        initialValues={formMode === 'edit' ? selectedSite : undefined}
        onClose={() => {
          if (!actionLoading) {
            setFormOpen(false);
          }
        }}
        onSubmit={handleFormSubmit}
      />

      <HeritageSiteViewDialog open={viewDialogOpen} site={selectedSite} onClose={() => setViewDialogOpen(false)} />

      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Heritage Site</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteConfirm?.name_default}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button color="error" onClick={handleDelete} disabled={actionLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HeritageSitesManager;

