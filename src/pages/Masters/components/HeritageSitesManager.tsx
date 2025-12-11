import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Checkbox,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import { HeritageSite, MasterData } from '@/types';
import { HeritageSiteService, HeritageSiteFilters, HeritageSitePayload, HeritageSiteExperience } from '@/services/heritageSite.service';
import { supabase } from '@/config/supabase';
import HeritageSiteFormDialog, { HeritageSiteFormValues } from './HeritageSiteFormDialog';
import HeritageSiteViewDialog from './HeritageSiteViewDialog';
import MobilePreviewDialog from './MobilePreviewDialog';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

const HeritageSitesManager: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [experienceFilter, setExperienceFilter] = useState<HeritageSiteExperience[]>([]);
  const [siteTypeFilter, setSiteTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'description' | 'experience' | 'entry' | 'status' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Master data for filters
  const [experienceMasterData, setExperienceMasterData] = useState<MasterData[]>([]);
  const [siteTypeMasterData, setSiteTypeMasterData] = useState<MasterData[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedSite, setSelectedSite] = useState<HeritageSite | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<HeritageSite | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [mobilePreviewSiteId, setMobilePreviewSiteId] = useState<number | null>(null);

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
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      // Query master data directly from the table
      const { data: experienceDataDirect, error: experienceError } = await supabase
        .from('heritage_masterdata')
        .select('*')
        .eq('category', 'experience')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      const { data: siteTypeDataDirect, error: siteTypeError } = await supabase
        .from('heritage_masterdata')
        .select('*')
        .eq('category', 'site_type')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (experienceError) {
        console.error('Error fetching experience master data:', experienceError);
      }
      if (siteTypeError) {
        console.error('Error fetching site type master data:', siteTypeError);
      }

      // Get translations for English
      if (experienceDataDirect && experienceDataDirect.length > 0) {
        const experienceIds = experienceDataDirect.map((item: any) => item.master_id);
        const { data: experienceTranslations } = await supabase
          .from('heritage_masterdatatranslation')
          .select('master_id, display_name')
          .in('master_id', experienceIds)
          .eq('language_code', 'EN');

        const experienceWithTranslations = experienceDataDirect.map((item: any) => {
          const translation = experienceTranslations?.find((t: any) => t.master_id === item.master_id);
          return {
            master_id: item.master_id,
            category: item.category,
            code: item.code,
            display_name: translation?.display_name || item.code,
            description: item.description,
            display_order: item.display_order,
            is_active: item.is_active,
            metadata: item.metadata,
          };
        });
        console.log('Experience master data loaded:', experienceWithTranslations);
        setExperienceMasterData(experienceWithTranslations || []);
      } else {
        console.warn('No experience master data found');
        setExperienceMasterData([]);
      }

      if (siteTypeDataDirect && siteTypeDataDirect.length > 0) {
        const siteTypeIds = siteTypeDataDirect.map((item: any) => item.master_id);
        const { data: siteTypeTranslations } = await supabase
          .from('heritage_masterdatatranslation')
          .select('master_id, display_name')
          .in('master_id', siteTypeIds)
          .eq('language_code', 'EN');

        const siteTypeWithTranslations = siteTypeDataDirect.map((item: any) => {
          const translation = siteTypeTranslations?.find((t: any) => t.master_id === item.master_id);
          return {
            master_id: item.master_id,
            category: item.category,
            code: item.code,
            display_name: translation?.display_name || item.code,
            description: item.description,
            display_order: item.display_order,
            is_active: item.is_active,
            metadata: item.metadata,
          };
        });
        console.log('Site type master data loaded:', siteTypeWithTranslations);
        setSiteTypeMasterData(siteTypeWithTranslations || []);
      } else {
        console.warn('No site type master data found');
        setSiteTypeMasterData([]);
      }
    } catch (err) {
      console.error('Failed to fetch master data:', err);
      setExperienceMasterData([]);
      setSiteTypeMasterData([]);
    }
  };

  // Helper function to get English label from code
  const getLabelFromCode = (code: string, masterData: MasterData[]): string => {
    const item = masterData.find((item) => item.code === code);
    return item?.display_name || code;
  };

  const handleApplyFilters = () => {
    fetchSites({
      search: searchTerm || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      experience: experienceFilter.length > 0 ? experienceFilter : 'all',
      siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setExperienceFilter([]);
    setSiteTypeFilter('all');
    fetchSites();
  };

  const openCreateDialog = () => {
    navigate('/masters/heritage-sites/new');
  };

  const openEditDialog = (site: HeritageSite) => {
    navigate(`/masters/heritage-sites/${site.site_id}/edit`);
  };

  const openViewDialog = (site: HeritageSite) => {
    setSelectedSite(site);
    setViewDialogOpen(true);
  };

  const openMobilePreview = (site: HeritageSite) => {
    setMobilePreviewSiteId(site.site_id);
    setMobilePreviewOpen(true);
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
        experience: experienceFilter.length > 0 ? experienceFilter : 'all',
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
        experience: experienceFilter.length > 0 ? experienceFilter : 'all',
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
        experience: experienceFilter.length > 0 ? experienceFilter : 'all',
        siteType: siteTypeFilter !== 'all' ? siteTypeFilter : undefined,
      });
    } catch (err: any) {
      showSnackbar(err?.message || 'Failed to update status.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Get experience options from master data (filter to only active ones)
  const experienceOptions = useMemo(() => {
    return experienceMasterData.filter((item) => item.is_active);
  }, [experienceMasterData]);

  // Get site type options from master data (filter to only active ones)
  const siteTypeOptions = useMemo(() => {
    return siteTypeMasterData.filter((item) => item.is_active);
  }, [siteTypeMasterData]);

  // Sort sites based on sortBy and sortOrder
  const sortedSites = useMemo(() => {
    const sorted = [...sites];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name_default?.toLowerCase() || '';
          bValue = b.name_default?.toLowerCase() || '';
          break;
        case 'description':
          aValue = a.short_desc_default?.toLowerCase() || a.full_desc_default?.toLowerCase() || '';
          bValue = b.short_desc_default?.toLowerCase() || b.full_desc_default?.toLowerCase() || '';
          break;
        case 'experience':
          // Get first experience and sort by first letter
          const aExp = Array.isArray(a.experience) 
            ? (a.experience.length > 0 ? getLabelFromCode(a.experience[0], experienceMasterData) : '')
            : (a.experience ? getLabelFromCode(a.experience, experienceMasterData) : '');
          const bExp = Array.isArray(b.experience)
            ? (b.experience.length > 0 ? getLabelFromCode(b.experience[0], experienceMasterData) : '')
            : (b.experience ? getLabelFromCode(b.experience, experienceMasterData) : '');
          aValue = aExp?.toLowerCase().charAt(0) || '';
          bValue = bExp?.toLowerCase().charAt(0) || '';
          break;
        case 'entry':
          // Custom sorting: Free Entry (0), External (1), Paid (2+ with amount)
          const getEntrySortValue = (site: HeritageSite) => {
            const firstTicketPrice = (site as any)._firstTicketPrice;
            const firstTicketName = ((site as any)._firstTicketName || '') as string;
            const hasExternalTicket = site.entry_type === 'paid' && firstTicketName.toLowerCase().includes('external');
            
            if (!site.entry_type || site.entry_type === 'free') {
              return { order: 0, amount: 0 }; // Free Entry comes first
            } else if (hasExternalTicket) {
              return { order: 1, amount: 0 }; // External comes second
            } else if (site.entry_type === 'paid') {
              const amount = firstTicketPrice !== null && firstTicketPrice !== undefined
                ? firstTicketPrice
                : (site.entry_fee !== null && site.entry_fee !== undefined ? site.entry_fee : 0);
              return { order: 2, amount: amount }; // Paid comes third, sorted by amount
            }
            return { order: 3, amount: 0 };
          };
          
          const aEntry = getEntrySortValue(a);
          const bEntry = getEntrySortValue(b);
          
          if (aEntry.order !== bEntry.order) {
            return sortOrder === 'asc' ? aEntry.order - bEntry.order : bEntry.order - aEntry.order;
          }
          // If same order (both paid), sort by amount
          aValue = aEntry.amount;
          bValue = bEntry.amount;
          break;
        case 'status':
          aValue = a.is_active ? 1 : 0;
          bValue = b.is_active ? 1 : 0;
          break;
        case 'updated':
          aValue = a.updated_at ? new Date(a.updated_at).getTime() : 0;
          bValue = b.updated_at ? new Date(b.updated_at).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [sites, sortBy, sortOrder, experienceMasterData]);

  const handleSort = (column: 'name' | 'description' | 'experience' | 'entry' | 'status' | 'updated') => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  useEffect(() => {
    const state = location.state as { heritageAction?: 'created' | 'updated' } | null;
    if (state?.heritageAction) {
      showSnackbar(`Heritage site ${state.heritageAction === 'updated' ? 'updated' : 'created'} successfully.`);
      fetchSites();
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

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
              onChange={(event) => {
                const value = event.target.value;
                setExperienceFilter(typeof value === 'string' ? value.split(',') : value);
              }}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                  if ((selected as string[]).length === 0) {
                    return 'All Experiences';
                  }
                  if ((selected as string[]).length <= 2) {
                    return (selected as string[])
                      .map((code) => {
                        const item = experienceOptions.find((opt) => opt.code === code);
                        return item?.display_name || code;
                      })
                      .join(', ');
                  }
                  return `${(selected as string[]).length} Experiences`;
                },
              }}
              size="small"
              sx={{ minWidth: 220 }}
            >
              {experienceOptions.map((item) => (
                <MenuItem key={item.code} value={item.code}>
                  <Checkbox checked={experienceFilter.indexOf(item.code) > -1} />
                  <ListItemText primary={item.display_name} />
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
              {siteTypeOptions.map((item) => (
                <MenuItem key={item.code} value={item.code}>
                  {item.display_name}
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
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Site</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('experience')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Experience</span>
                    {sortBy === 'experience' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('entry')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Entry</span>
                    {sortBy === 'entry' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  align="center"
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('status')}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('updated')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Updated</span>
                    {sortBy === 'updated' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedSites.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No heritage sites found. Try adjusting filters or add a new entry.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sortedSites.map((site) => {
                  const firstTicketPrice = (site as any)._firstTicketPrice;
                  const firstTicketName = ((site as any)._firstTicketName || '') as string;
                  const hasExternalTicket =
                    site.entry_type === 'paid' && firstTicketName.toLowerCase().includes('external');
                  const entryLabel = hasExternalTicket
                    ? 'EXTERNAL'
                    : site.entry_type
                    ? site.entry_type.toUpperCase()
                    : '—';
                  const entryDescription =
                    site.entry_type === 'paid'
                      ? hasExternalTicket
                        ? 'External booking'
                        : firstTicketPrice !== null && firstTicketPrice !== undefined
                        ? `₹${firstTicketPrice}`
                        : site.entry_fee !== null && site.entry_fee !== undefined
                        ? `₹${site.entry_fee}`
                        : '₹0'
                      : 'Free Entry';

                  return (
                    <TableRow key={site.site_id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {site.name_default}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {site.site_type ? getLabelFromCode(site.site_type, siteTypeMasterData) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {site.experience ? (
                        Array.isArray(site.experience) ? (
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            {site.experience.map((exp, idx) => (
                              <Chip
                                key={idx}
                                label={getLabelFromCode(exp, experienceMasterData)}
                                size="small"
                                sx={{ backgroundColor: '#DA855210', color: '#DA8552', fontWeight: 600 }}
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Chip
                            label={getLabelFromCode(site.experience, experienceMasterData)}
                            size="small"
                            sx={{ backgroundColor: '#DA855210', color: '#DA8552', fontWeight: 600 }}
                          />
                        )
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {entryLabel}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {entryDescription}
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
                        <Tooltip title="Mobile Preview">
                          <IconButton size="small" onClick={() => openMobilePreview(site)}>
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
                  );
                })
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

      <MobilePreviewDialog
        open={mobilePreviewOpen}
        siteId={mobilePreviewSiteId}
        onClose={() => {
          setMobilePreviewOpen(false);
          setMobilePreviewSiteId(null);
        }}
      />

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

