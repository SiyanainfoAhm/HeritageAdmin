import { useEffect, useMemo, useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Stack,
  Pagination,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardMedia,
  Link,
  Tabs,
  Tab,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltOutlinedIcon from '@mui/icons-material/FilterAltOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { VerificationService, VerificationRecord } from '@/services/verification.service';
import { UserService } from '@/services/user.service';
import { TranslationService } from '@/services/translation.service';
import { supabase } from '@/config/supabase';

type LanguageCode = 'en' | 'hi' | 'gu' | 'ja' | 'es' | 'fr';

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
];

// Translatable fields for vendor business details
const TRANSLATABLE_FIELDS = ['business_name', 'business_address', 'city', 'state', 'business_description'];

// Field order for vendor business details
const VENDOR_FIELD_ORDER = [
  'business_name',
  'business_description',
  'business_email',
  'license_number',
  'license_expiry',
  'gstin',
  'business_address',
  'city',
  'state',
  'pincode',
  'facebook_page',
  'twitter_handle',
  'instagram_handle',
  'linkedin_profile',
  'verification_date',
  // Additional fields (will appear after ordered fields)
  'business_phone',
  'website',
  'youtube_channel',
  'business_type',
  'show_contact_info',
  'verification_notes',
];

// Date fields that should use date picker
const DATE_FIELDS = ['license_expiry', 'verification_date'];

const ENTITY_OPTIONS = [
  'All',
  'Local Guide',
  'Event Operator',
  'Food Vendor',
  'Artisan',
  'Hotel',
  'Tour Operator',
];

const STATUS_OPTIONS: Array<'All' | VerificationRecord['status']> = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS_COLOR: Record<VerificationRecord['status'], 'warning' | 'success' | 'error'> = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'error',
};

const TYPE_COLOR: Record<string, string> = {
  'Local Guide': '#00c49f',
  'Event Operator': '#ff9f43',
  'Food Vendor': '#ff6b6b',
  Artisan: '#f72585',
  Hotel: '#2196f3',
  'Tour Operator': '#845ef7',
};

const PAGE_SIZE = 9;

const Verification = () => {
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | VerificationRecord['status']>('All');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [userDetails, setUserDetails] = useState<{ user: any; businessDetails: any; documents: any[] } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState<{ full_name?: string; email?: string; phone?: string; user_type_id?: number } | null>(null);
  const [editedBusinessDetails, setEditedBusinessDetails] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState<{ open: boolean; key: string; label: string }>({ open: false, key: '', label: '' });
  const [newItemValue, setNewItemValue] = useState('');
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [userTypes, setUserTypes] = useState<Array<{ user_type_id: number; type_name: string }>>([]);

  const fetchRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await VerificationService.getVerificationRecords({
        entityType: entityFilter,
        status: statusFilter,
        search: searchTerm,
        dateFrom: dateFilter || undefined,
        dateTo: dateFilter || undefined,
      });
      setRecords(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [entityFilter, statusFilter, dateFilter, searchTerm]);

  // Load user types once for the user-type dropdown
  useEffect(() => {
    const loadUserTypes = async () => {
      const types = await UserService.getUserTypes();
      setUserTypes(types);
    };
    loadUserTypes();
  }, []);

  const handleApprove = async (record: VerificationRecord) => {
    setActionLoading(record.id);
    const result = await VerificationService.approveEntity(record.entityType, record.id);
    if (result.success) {
      fetchRecords();
    } else {
      setError(result.error || 'Failed to approve');
    }
    setActionLoading(null);
  };

  const handleReject = async (record: VerificationRecord) => {
    setActionLoading(record.id);
    const result = await VerificationService.rejectEntity(record.entityType, record.id);
    if (result.success) {
      fetchRecords();
    } else {
      setError(result.error || 'Failed to reject');
    }
    setActionLoading(null);
  };

  const filteredData = useMemo(() => {
    return records;
  }, [records]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, page]);

  const handleClearFilters = () => {
    setEntityFilter('All');
    setStatusFilter('All');
    setDateFilter('');
    setSearchTerm('');
    setPage(1);
    fetchRecords();
  };

  const handleViewDetails = async (record: VerificationRecord) => {
    try {
      setSelectedRecord(record);
      setDetailOpen(true);
      setDetailLoading(true);
      setEditMode(false);
      setCurrentLanguageTab('en');
      
      const details = await VerificationService.getUserDetails(record.id, record.entityType);
      setUserDetails(details);
      if (details?.user) {
        setEditedUserInfo({
          full_name: details.user.full_name || '',
          email: details.user.email || '',
          phone: details.user.phone || '',
          user_type_id: details.user.user_type_id,
        });
      } else {
        setEditedUserInfo(null);
      }
      if (details?.businessDetails) {
        setEditedBusinessDetails({ ...details.businessDetails });
        
        // Load translations if available
        const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
        if (vendorEntityTypes.includes(record.entityType)) {
          const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
          TRANSLATABLE_FIELDS.forEach(field => {
            loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            // Set English value from main business details
            if (details.businessDetails[field]) {
              loadedTranslations[field].en = String(details.businessDetails[field] || '');
            }
            // Load other language translations
            if (details.businessDetails._translations && Array.isArray(details.businessDetails._translations)) {
              details.businessDetails._translations.forEach((trans: any) => {
                if (trans && trans.language_code) {
                  const langCode = String(trans.language_code).toLowerCase() as LanguageCode;
                  if (langCode && LANGUAGES.some(l => l.code === langCode) && trans[field]) {
                    loadedTranslations[field][langCode] = String(trans[field] || '');
                  }
                }
              });
            }
          });
          setTranslations(loadedTranslations);
        } else {
          // Initialize empty translations for non-vendor entities
          setTranslations({});
        }
      } else {
        setTranslations({});
      }
    } catch (error) {
      console.error('Error loading details:', error);
      setError('Failed to load details. Please try again.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleEditToggle = () => {
    if (editMode) {
      // Cancel edit - restore original
      if (userDetails?.businessDetails) {
        setEditedBusinessDetails({ ...userDetails.businessDetails });
        // Restore translations
        const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
        if (vendorEntityTypes.includes(selectedRecord?.entityType || '')) {
          const restoredTranslations: Record<string, Record<LanguageCode, string>> = {};
          TRANSLATABLE_FIELDS.forEach(field => {
            restoredTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            if (userDetails.businessDetails[field]) {
              restoredTranslations[field].en = userDetails.businessDetails[field];
            }
            if (userDetails.businessDetails._translations) {
              userDetails.businessDetails._translations.forEach((trans: any) => {
                const langCode = trans.language_code?.toLowerCase() as LanguageCode;
                if (langCode && trans[field]) {
                  restoredTranslations[field][langCode] = trans[field] || '';
                }
              });
            }
          });
          setTranslations(restoredTranslations);
        }
      }
      if (userDetails?.user) {
        setEditedUserInfo({
          full_name: userDetails.user.full_name || '',
          email: userDetails.user.email || '',
          phone: userDetails.user.phone || '',
          user_type_id: userDetails.user.user_type_id,
        });
      } else {
        setEditedUserInfo(null);
      }
    }
    setEditMode(!editMode);
  };

  const handleFieldChange = (key: string, value: any) => {
    setEditedBusinessDetails((prev) => ({ ...prev, [key]: value }));
    
    // Auto-translate if it's a translatable field and we're editing English
    const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
    if (vendorEntityTypes.includes(selectedRecord?.entityType || '') && 
        TRANSLATABLE_FIELDS.includes(key) && 
        currentLanguageTab === 'en' && 
        typeof value === 'string') {
      autoTranslateField(value, key);
    }
    
    // Update English translation when editing English tab
    if (currentLanguageTab === 'en' && TRANSLATABLE_FIELDS.includes(key)) {
      setTranslations(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          en: value || '',
        },
      }));
    }
  };

  // Auto-translate a field to all other languages
  const autoTranslateField = async (text: string, field: string) => {
    if (!text || !text.trim() || !field) return;
    
    try {
      const timerKey = `translate_${field}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(field));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, 'en');
              if (result.success && result.translations && result.translations[lang.code]) {
                // Extract the translated text from the result
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setTranslations(prev => ({
                  ...prev,
                  [field]: {
                    ...(prev[field] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                    [lang.code]: translatedText,
                  },
                }));
              } else {
                console.warn(`Translation failed for ${lang.code}:`, result.error);
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
              // Continue with other languages even if one fails
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(field);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error setting up translation:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedRecord || !userDetails) return;
    
    setSaving(true);

    // First, update basic user info (heritage_user)
    if (editedUserInfo) {
      const userUpdateResult = await VerificationService.updateUserInfo(selectedRecord.id, {
        full_name: editedUserInfo.full_name,
        email: editedUserInfo.email,
        phone: editedUserInfo.phone,
        user_type_id: editedUserInfo.user_type_id,
      });

      if (!userUpdateResult.success) {
        setError(userUpdateResult.error || 'Failed to update user information');
        setSaving(false);
        return;
      }
    }

    // Prepare data for saving - convert date strings to timestamps for verification_date
    const dataToSave = { ...editedBusinessDetails };
    if (dataToSave.verification_date && typeof dataToSave.verification_date === 'string' && dataToSave.verification_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Convert date string to ISO timestamp
      const date = new Date(dataToSave.verification_date);
      date.setHours(0, 0, 0, 0);
      dataToSave.verification_date = date.toISOString();
    }
    
    // Save business details
    const result = await VerificationService.updateBusinessDetails(
      selectedRecord.entityType,
      selectedRecord.id,
      dataToSave
    );
    
    if (result.success) {
      // Save translations if applicable
      const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
      if (vendorEntityTypes.includes(selectedRecord.entityType)) {
        // Get business_id - fetch from database after update
        let businessId: number | null = null;
        try {
          const { data: vendorData, error: vendorError } = await supabase
            .from('heritage_vendorbusinessdetails')
            .select('business_id')
            .eq('user_id', selectedRecord.id)
            .single();
          if (vendorData && !vendorError) {
            businessId = vendorData.business_id;
          } else {
            // Fallback to existing business_id
            businessId = editedBusinessDetails.business_id || userDetails.businessDetails?.business_id || null;
          }
        } catch (err) {
          console.error('Error fetching business_id:', err);
          // Fallback to existing business_id
          businessId = editedBusinessDetails.business_id || userDetails.businessDetails?.business_id || null;
        }
        
        if (businessId) {
          // Prepare translations array - include all languages that have at least one translation
          const translationsArray = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
            const trans: any = { language_code: lang.code };
            let hasData = false;
            TRANSLATABLE_FIELDS.forEach(field => {
              const translationValue = translations[field]?.[lang.code];
              if (translationValue && String(translationValue).trim()) {
                trans[field] = String(translationValue).trim();
                hasData = true;
              }
            });
            return hasData ? trans : null;
          }).filter(t => t !== null && Object.keys(t).length > 1); // Only include if has at least one field

          if (translationsArray.length > 0) {
            try {
              const { data: transResult, error: transError } = await supabase.rpc(
                'heritage_upsert_vendor_business_translations_bulk',
                {
                  p_business_id: businessId,
                  p_translations: translationsArray,
                }
              );
              if (transError) {
                console.error('Error saving translations:', transError);
                setError(`Failed to save translations: ${transError.message}`);
              } else {
                console.log('Translations saved successfully:', transResult);
              }
            } catch (err: any) {
              console.error('Error saving translations:', err);
              setError(`Failed to save translations: ${err.message || 'Unknown error'}`);
            }
          } else {
            console.log('No translations to save');
          }
        } else {
          console.warn('Business ID not found, cannot save translations');
        }
      }
      
      // Refresh details
      const details = await VerificationService.getUserDetails(selectedRecord.id, selectedRecord.entityType);
      setUserDetails(details);
      if (details?.businessDetails) {
        setEditedBusinessDetails({ ...details.businessDetails });
        // Reload translations
        if (vendorEntityTypes.includes(selectedRecord.entityType)) {
          const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
          TRANSLATABLE_FIELDS.forEach(field => {
            loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            if (details.businessDetails[field]) {
              loadedTranslations[field].en = String(details.businessDetails[field] || '');
            }
            if (details.businessDetails._translations && Array.isArray(details.businessDetails._translations)) {
              details.businessDetails._translations.forEach((trans: any) => {
                if (trans && trans.language_code) {
                  const langCode = String(trans.language_code).toLowerCase() as LanguageCode;
                  if (langCode && LANGUAGES.some(l => l.code === langCode) && trans[field]) {
                    loadedTranslations[field][langCode] = String(trans[field] || '');
                  }
                }
              });
            }
          });
          setTranslations(loadedTranslations);
        }
      }
      setEditMode(false);
      fetchRecords(); // Refresh list as verification status may have changed
      // Also refresh user info in dialog state
      if (editedUserInfo && userDetails?.user) {
        setUserDetails({
          ...userDetails,
          user: {
            ...userDetails.user,
            full_name: editedUserInfo.full_name ?? userDetails.user.full_name,
            email: editedUserInfo.email ?? userDetails.user.email,
            phone: editedUserInfo.phone ?? userDetails.user.phone,
            user_type_id: editedUserInfo.user_type_id ?? userDetails.user.user_type_id,
          },
        });
      }
    } else {
      setError(result.error || 'Failed to save changes');
    }
    setSaving(false);
  };

  const handleDeleteDocument = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    
    const result = await VerificationService.deleteDocument(docId);
    if (result.success) {
      // Refresh details
      if (selectedRecord) {
        const details = await VerificationService.getUserDetails(selectedRecord.id, selectedRecord.entityType);
        setUserDetails(details);
      }
      fetchRecords(); // Refresh list as verification status may have changed
    } else {
      setError(result.error || 'Failed to delete document');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Verification
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          background: '#ffffff',
          border: '1px solid #f0f0f0',
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Entity Type</InputLabel>
              <Select
                label="Entity Type"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setPage(1);
                }}
                startAdornment={<FilterAltOutlinedIcon sx={{ mr: 1, color: 'text.secondary' }} />}
              >
                {ENTITY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setPage(1);
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Submitted On"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="text"
              color="primary"
              startIcon={<RefreshIcon />}
              onClick={handleClearFilters}
              sx={{ textTransform: 'none' }}
            >
              Clear Filters
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search by name or type..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ minWidth: 260 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadOutlinedIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              Export
            </Button>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Submitted On</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((record) => (
                <TableRow key={`${record.entityType}-${record.id}`} hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: '#fdecef',
                          color: '#f08060',
                          fontWeight: 600,
                          width: 42,
                          height: 42,
                        }}
                      >
                        {record.name
                          .split(' ')
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((word) => word[0])
                          .join('')
                          .toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {record.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {record.subtitle}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.entityType}
                      sx={{
                        backgroundColor: `${TYPE_COLOR[record.entityType] || '#e0e0e0'}22`,
                        color: TYPE_COLOR[record.entityType] || '#616161',
                        fontWeight: 500,
                      }}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {record.location}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={record.status}
                      color={STATUS_COLOR[record.status]}
                      variant="filled"
                      size="small"
                      sx={{ fontWeight: 500, minWidth: 90 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{format(new Date(record.submittedOn), 'MMMM d, yyyy')}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="View details">
                        <IconButton size="small" onClick={() => handleViewDetails(record)}>
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Approve">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleApprove(record)}
                          disabled={actionLoading === record.id || record.status === 'Approved'}
                        >
                          {actionLoading === record.id ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Reject">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleReject(record)}
                          disabled={actionLoading === record.id || record.status === 'Rejected'}
                        >
                          <HighlightOffOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No records found for the selected filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filteredData.length)}-
            {Math.min(page * PAGE_SIZE, filteredData.length)} of {filteredData.length} results
          </Typography>
          <Pagination
            count={Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{selectedRecord?.name} - Details</Typography>
          <Stack direction="row" spacing={1}>
            {!editMode ? (
              <Tooltip title="Edit">
                <IconButton onClick={handleEditToggle} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="Save">
                  <IconButton onClick={handleSaveChanges} color="success" disabled={saving}>
                    {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton onClick={handleEditToggle} color="error">
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton onClick={() => setDetailOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Name</Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editedUserInfo?.full_name ?? ''}
                        onChange={(e) =>
                          setEditedUserInfo((prev) => ({
                            ...(prev || {}),
                            full_name: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      <Typography>{userDetails?.user?.full_name || selectedRecord?.name}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Type</Typography>
                    {editMode ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={editedUserInfo?.user_type_id ?? ''}
                          onChange={(e) =>
                            setEditedUserInfo((prev) => ({
                              ...(prev || {}),
                              user_type_id: Number(e.target.value),
                            }))
                          }
                        >
                          {userTypes.map((type) => (
                            <MenuItem key={type.user_type_id} value={type.user_type_id}>
                              {type.type_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography>
                        {(() => {
                          if (userDetails?.user?.user_type_id && userTypes.length) {
                            const t = userTypes.find((ut) => ut.user_type_id === userDetails.user.user_type_id);
                            return t?.type_name || selectedRecord?.entityType;
                          }
                          return selectedRecord?.entityType;
                        })()}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Chip label={selectedRecord?.status} color={STATUS_COLOR[selectedRecord?.status || 'Pending']} size="small" />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                    <Typography>{selectedRecord?.submittedOn}</Typography>
                  </Grid>
                  {userDetails?.user?.email && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={editedUserInfo?.email ?? ''}
                          onChange={(e) =>
                            setEditedUserInfo((prev) => ({
                              ...(prev || {}),
                              email: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Typography>{userDetails.user.email}</Typography>
                      )}
                    </Grid>
                  )}
                  {userDetails?.user?.phone && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Phone</Typography>
                      {editMode ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={editedUserInfo?.phone ?? ''}
                          onChange={(e) =>
                            setEditedUserInfo((prev) => ({
                              ...(prev || {}),
                              phone: e.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Typography>{userDetails.user.phone}</Typography>
                      )}
                    </Grid>
                  )}
                  {userDetails?.user?.verified_on && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Verified On</Typography>
                      <Typography>{format(new Date(userDetails.user.verified_on), 'MMMM d, yyyy')}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {/* Business Details */}
              {userDetails?.businessDetails && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Business Details {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
                  </Typography>
                  
                  {/* Translation Tabs - Only show for vendor business details */}
                  {['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'].includes(selectedRecord?.entityType || '') && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 2 }}>
                      <Tabs 
                        value={currentLanguageTab} 
                        onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {LANGUAGES.map((lang) => {
                          const hasTranslations = lang.code === 'en' || TRANSLATABLE_FIELDS.some(field => {
                            const fieldTranslations = translations[field];
                            return fieldTranslations && fieldTranslations[lang.code] && String(fieldTranslations[lang.code]).trim();
                          });
                          
                          return (
                            <Tab 
                              key={lang.code} 
                              label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <span>{lang.flag} {lang.label}</span>
                                  {hasTranslations && lang.code !== 'en' && (
                                    <CheckCircleIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                                  )}
                                </Stack>
                              }
                              value={lang.code}
                            />
                          );
                        })}
                      </Tabs>
                    </Box>
                  )}
                  
                  <Grid container spacing={2}>
                    {(() => {
                      // Get all entries
                      const entries = Object.entries(editMode ? editedBusinessDetails : userDetails.businessDetails);
                      
                      // Filter out system fields
                      const filteredEntries = entries.filter(([key]) => 
                        !['id', 'user_id', 'created_at', 'updated_at', 'profile_id', 'artisan_id', 'guide_id', 'business_id', 'is_verified', 'verification_status', '_translations'].includes(key)
                      );
                      
                      // Check if this is a vendor business type
                      const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
                      const isVendorBusiness = vendorEntityTypes.includes(selectedRecord?.entityType || '');
                      
                      // Sort entries by field order if vendor business
                      const sortedEntries = isVendorBusiness
                        ? [...filteredEntries].sort(([keyA], [keyB]) => {
                            const indexA = VENDOR_FIELD_ORDER.indexOf(keyA);
                            const indexB = VENDOR_FIELD_ORDER.indexOf(keyB);
                            // If both are in order, sort by index
                            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                            // If only A is in order, A comes first
                            if (indexA !== -1) return -1;
                            // If only B is in order, B comes first
                            if (indexB !== -1) return 1;
                            // If neither is in order, maintain original order
                            return 0;
                          })
                        : filteredEntries;
                      
                      return sortedEntries.map(([key, value]) => {
                      
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      
                      // Check if this is a translatable field and we're viewing a vendor business
                      const vendorEntityTypes = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'];
                      const isTranslatableField = TRANSLATABLE_FIELDS.includes(key) && 
                                                  vendorEntityTypes.includes(selectedRecord?.entityType || '');
                      
                      // Helper function to extract string from value (handles JSON objects)
                      const extractStringValue = (val: any): string => {
                        if (val === null || val === undefined) return '';
                        if (typeof val === 'string') {
                          // Check if it's a JSON string and try to parse it
                          if (val.trim().startsWith('{') && val.trim().endsWith('}')) {
                            try {
                              const parsed = JSON.parse(val);
                              // If it's a translation result, extract the text
                              if (parsed.success && parsed.translations) {
                                // Try to get the first available translation
                                const langCodes = Object.keys(parsed.translations);
                                if (langCodes.length > 0 && Array.isArray(parsed.translations[langCodes[0]])) {
                                  return parsed.translations[langCodes[0]][0] || '';
                                }
                              }
                              // If it's just a JSON object, return empty string
                              return '';
                            } catch {
                              // Not valid JSON, return as is
                              return val;
                            }
                          }
                          return val;
                        }
                        return String(val);
                      };

                      // Get the value based on language tab for translatable fields
                      let currentValue = editMode ? editedBusinessDetails[key] : value;
                      if (isTranslatableField && !editMode) {
                        // In view mode, show translation for selected language
                        if (currentLanguageTab === 'en') {
                          currentValue = extractStringValue(value);
                        } else {
                          currentValue = (translations[key] && translations[key][currentLanguageTab]) ? translations[key][currentLanguageTab] : '';
                        }
                      } else if (isTranslatableField && editMode) {
                        // In edit mode, show translation for selected language
                        if (currentLanguageTab === 'en') {
                          currentValue = extractStringValue(editedBusinessDetails[key] || '');
                        } else {
                          currentValue = (translations[key] && translations[key][currentLanguageTab]) ? translations[key][currentLanguageTab] : '';
                        }
                      } else {
                        // For non-translatable fields, extract string value
                        currentValue = extractStringValue(currentValue);
                      }
                      
                      // Known array fields that should always be treated as arrays
                      const knownArrayFields = ['awards', 'languages', 'specializations', 'certifications', 'service_areas', 'expertise', 'skills'];
                      const isKnownArrayField = knownArrayFields.includes(key);
                      
                      // Handle arrays - show as chips with add/remove in edit mode
                      // Also handle PostgreSQL text[] format which may come as string like '{"item1","item2"}'
                      const isArrayField = isKnownArrayField || Array.isArray(currentValue) || Array.isArray(value) || 
                        (typeof currentValue === 'string' && currentValue.startsWith('{') && currentValue.endsWith('}'));
                      
                      if (isArrayField) {
                        let arrValue: string[] = [];
                        if (Array.isArray(currentValue)) {
                          arrValue = currentValue;
                        } else if (typeof currentValue === 'string' && currentValue.startsWith('{') && currentValue.endsWith('}')) {
                          // Parse PostgreSQL array format: {"item1","item2"}
                          const inner = currentValue.slice(1, -1);
                          if (inner) {
                            arrValue = inner.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
                          }
                        } else if (typeof currentValue === 'string' && currentValue) {
                          // Handle comma-separated string as array
                          arrValue = currentValue.split(',').map(s => s.trim()).filter(Boolean);
                        } else if (Array.isArray(value)) {
                          if (typeof value === 'string' && value) {
                            arrValue = (value as unknown as string).split(',').map(s => s.trim()).filter(Boolean);
                          } else if (Array.isArray(value)) {
                            arrValue = value;
                          } else {
                            arrValue = [];
                          }
                        } else if (isKnownArrayField) {
                          arrValue = [];
                        }
                        return (
                          <Grid item xs={12} key={key}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
                              {arrValue.length > 0 ? arrValue.map((item, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={String(item)} 
                                  size="small" 
                                  variant="outlined"
                                  onDelete={editMode ? () => {
                                    const newArr = arrValue.filter((_, i) => i !== idx);
                                    handleFieldChange(key, newArr);
                                  } : undefined}
                                />
                              )) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                              {editMode && (
                                <Chip
                                  label="+ Add"
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  onClick={() => {
                                    // Initialize array in editedBusinessDetails if not already
                                    if (!Array.isArray(editedBusinessDetails[key])) {
                                      handleFieldChange(key, arrValue);
                                    }
                                    setAddItemDialog({ open: true, key, label });
                                    setNewItemValue('');
                                  }}
                                  sx={{ cursor: 'pointer' }}
                                />
                              )}
                            </Stack>
                          </Grid>
                        );
                      }
                      
                      // Handle objects - show as JSON or null
                      if (typeof currentValue === 'object' && currentValue !== null) {
                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="body2">{JSON.stringify(currentValue)}</Typography>
                          </Grid>
                        );
                      }
                      
                      // Handle booleans - show as Yes/No chips or select in edit mode
                      if (typeof currentValue === 'boolean' || (typeof value === 'boolean')) {
                        if (editMode) {
                          return (
                            <Grid item xs={6} key={key}>
                              <FormControl fullWidth size="small">
                                <InputLabel>{label}</InputLabel>
                                <Select
                                  value={editedBusinessDetails[key] ? 'true' : 'false'}
                                  label={label}
                                  onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
                                >
                                  <MenuItem value="true">Yes</MenuItem>
                                  <MenuItem value="false">No</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          );
                        }
                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Chip label={currentValue ? 'Yes' : 'No'} size="small" color={currentValue ? 'success' : 'default'} />
                          </Grid>
                        );
                      }
                      
                      // Check if this is a date field
                      const isDateField = DATE_FIELDS.includes(key);
                      const isTimestampField = key === 'verification_date';
                      
                      // Handle date fields
                      if (isDateField) {
                        let dateValue: string = '';
                        if (editMode) {
                          if (editedBusinessDetails[key]) {
                            const val = editedBusinessDetails[key];
                            if (typeof val === 'string') {
                              // If it's already a date string (YYYY-MM-DD), use it
                              if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                dateValue = val;
                              } else {
                                // If it's a timestamp, extract date part
                                dateValue = val.split('T')[0];
                              }
                            } else if (val instanceof Date) {
                              dateValue = val.toISOString().split('T')[0];
                            }
                          }
                        } else {
                          if (value) {
                            const val = value;
                            if (typeof val === 'string') {
                              if (val.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                dateValue = val;
                              } else {
                                dateValue = val.split('T')[0];
                              }
                            } else if (val instanceof Date) {
                              dateValue = val.toISOString().split('T')[0];
                            }
                          }
                        }
                        
                        if (editMode) {
                          return (
                            <Grid item xs={6} key={key}>
                              <TextField
                                fullWidth
                                size="small"
                                label={label}
                                type="date"
                                value={dateValue}
                                onChange={(e) => {
                                  // For timestamp fields, convert date to ISO timestamp
                                  if (isTimestampField && e.target.value) {
                                    const date = new Date(e.target.value);
                                    date.setHours(0, 0, 0, 0);
                                    handleFieldChange(key, date.toISOString());
                                  } else {
                                    handleFieldChange(key, e.target.value);
                                  }
                                }}
                                InputLabelProps={{ shrink: true }}
                              />
                            </Grid>
                          );
                        }
                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography>{dateValue ? format(new Date(dateValue + 'T00:00:00'), 'MMMM d, yyyy') : '—'}</Typography>
                          </Grid>
                        );
                      }
                      
                      // Handle null/undefined - show "null" text
                      if (currentValue === null || currentValue === undefined || currentValue === '') {
                        return (
                          <Grid item xs={6} key={key}>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                label={`${label}${isTranslatableField ? ` (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})` : ''}`}
                                value={isTranslatableField && currentLanguageTab !== 'en' 
                                  ? ((translations[key] && translations[key][currentLanguageTab]) ? translations[key][currentLanguageTab] : '')
                                  : (editedBusinessDetails[key] || '')}
                                onChange={(e) => {
                                  if (isTranslatableField && currentLanguageTab !== 'en') {
                                    // Update translation
                                    setTranslations(prev => ({
                                      ...prev,
                                      [key]: {
                                        ...prev[key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                                        [currentLanguageTab]: e.target.value,
                                      },
                                    }));
                                  } else {
                                    handleFieldChange(key, e.target.value);
                                  }
                                }}
                                InputProps={{
                                  endAdornment: isTranslatableField && currentLanguageTab === 'en' && translatingFields.has(key) ? (
                                    <InputAdornment position="end">
                                      <CircularProgress size={16} />
                                    </InputAdornment>
                                  ) : undefined,
                                }}
                              />
                            ) : (
                              <>
                                <Typography variant="body2" color="text.secondary">{label}</Typography>
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              </>
                            )}
                          </Grid>
                        );
                      }
                      
                      // Handle regular text/numbers
                      if (editMode) {
                        return (
                          <Grid item xs={6} key={key}>
                            <TextField
                              fullWidth
                              size="small"
                              label={`${label}${isTranslatableField ? ` (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})` : ''}`}
                              value={isTranslatableField && currentLanguageTab !== 'en' 
                                ? ((translations[key] && translations[key][currentLanguageTab]) ? translations[key][currentLanguageTab] : '')
                                : (editedBusinessDetails[key] || '')}
                              onChange={(e) => {
                                if (isTranslatableField && currentLanguageTab !== 'en') {
                                  // Update translation
                                  setTranslations(prev => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                                      [currentLanguageTab]: e.target.value,
                                    },
                                  }));
                                } else {
                                  handleFieldChange(key, e.target.value);
                                }
                              }}
                              InputProps={{
                                endAdornment: isTranslatableField && currentLanguageTab === 'en' && translatingFields.has(key) ? (
                                  <InputAdornment position="end">
                                    <CircularProgress size={16} />
                                  </InputAdornment>
                                ) : undefined,
                              }}
                            />
                          </Grid>
                        );
                      }
                      
                      return (
                        <Grid item xs={6} key={key}>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Typography>{String(currentValue)}</Typography>
                        </Grid>
                      );
                    })})()}
                  </Grid>
                </Box>
              )}

              {/* Documents */}
              {userDetails?.documents && userDetails.documents.length > 0 && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Documents ({userDetails.documents.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {userDetails.documents.map((doc) => (
                      <Grid item xs={12} sm={6} md={4} key={doc.id}>
                        <Card variant="outlined" sx={{ position: 'relative' }}>
                          {editMode && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteDocument(doc.id)}
                              sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                          {doc.url && (doc.url.endsWith('.jpg') || doc.url.endsWith('.jpeg') || doc.url.endsWith('.png')) ? (
                            <CardMedia
                              component="img"
                              height="120"
                              image={doc.url}
                              alt={doc.document_name}
                              sx={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <Box sx={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                              <Typography variant="body2" color="text.secondary">Document</Typography>
                            </Box>
                          )}
                          <Box sx={{ p: 1 }}>
                            <Typography variant="body2" fontWeight={500} noWrap>
                              {doc.document_type || doc.document_name}
                            </Typography>
                            {doc.url && (
                              <Link href={doc.url} target="_blank" rel="noopener" variant="caption">
                                View Document
                              </Link>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {selectedRecord?.entityType === 'Artisan' && selectedRecord?.rawData && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Artisan Details
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedRecord.rawData.craft_type && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Craft Type</Typography>
                        <Typography>{selectedRecord.rawData.craft_type}</Typography>
                      </Grid>
                    )}
                    {selectedRecord.rawData.short_bio && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">Bio</Typography>
                        <Typography>{selectedRecord.rawData.short_bio}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
          {selectedRecord && selectedRecord.status !== 'Approved' && (
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                handleApprove(selectedRecord);
                setDetailOpen(false);
              }}
            >
              Approve
            </Button>
          )}
          {selectedRecord && selectedRecord.status !== 'Rejected' && (
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleReject(selectedRecord);
                setDetailOpen(false);
              }}
            >
              Reject
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog.open} onClose={() => setAddItemDialog({ open: false, key: '', label: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Add {addItemDialog.label}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={`New ${addItemDialog.label}`}
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newItemValue.trim()) {
                const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                handleFieldChange(addItemDialog.key, [...arrValue, newItemValue.trim()]);
                setAddItemDialog({ open: false, key: '', label: '' });
                setNewItemValue('');
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddItemDialog({ open: false, key: '', label: '' })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (newItemValue.trim()) {
                const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                handleFieldChange(addItemDialog.key, [...arrValue, newItemValue.trim()]);
                setAddItemDialog({ open: false, key: '', label: '' });
                setNewItemValue('');
              }
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verification;

