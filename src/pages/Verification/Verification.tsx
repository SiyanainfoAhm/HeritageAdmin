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
import MapIcon from '@mui/icons-material/Map';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { VerificationService, VerificationRecord } from '@/services/verification.service';
import { UserService } from '@/services/user.service';
import { TranslationService } from '@/services/translation.service';
import { supabase } from '@/config/supabase';
import { geocodeAddress } from '@/config/googleMaps';

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
const VENDOR_TRANSLATABLE_FIELDS = ['business_name', 'business_address', 'city', 'state', 'business_description'];

// Translatable fields for local guide profile
const LOCAL_GUIDE_TRANSLATABLE_FIELDS = [
  'guide_name',
  'bio',
  'primary_city',
  'primary_state',
  'service_areas',
  'specializations',
];

// Translatable fields for artisan details
const ARTISAN_TRANSLATABLE_FIELDS = [
  'artisan_name',
  'short_bio',
  'full_bio',
  'craft_title',
  'craft_specialty',
  'awards',
];

// Preferred display order for artisan fields
const ARTISAN_FIELD_ORDER = [
  'artisan_name',
  'short_bio',
  'full_bio',
  'craft_title',
  'craft_specialty',
  'experience_years',
  'generation_number',
  'verified_by',
  'awards',
  'intro_video_url',
  'is_active',
];

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

const VENDOR_ENTITY_TYPES = ['Tour Operator', 'Hotel', 'Event Operator', 'Food Vendor'] as const;
const ARTISAN_ENTITY_TYPES = ['Artisan'] as const;
const LOCAL_GUIDE_ENTITY_TYPES = ['Local Guide'] as const;

const getTranslatableFieldsForEntity = (entityType?: string | null): string[] => {
  if (!entityType) return [];
  if ((VENDOR_ENTITY_TYPES as readonly string[]).includes(entityType)) {
    return VENDOR_TRANSLATABLE_FIELDS;
  }
  if ((ARTISAN_ENTITY_TYPES as readonly string[]).includes(entityType)) {
    // For artisans, we support translations for BOTH vendor-style business fields and artisan-specific fields
    return [...VENDOR_TRANSLATABLE_FIELDS, ...ARTISAN_TRANSLATABLE_FIELDS];
  }
  if ((LOCAL_GUIDE_ENTITY_TYPES as readonly string[]).includes(entityType)) {
    return LOCAL_GUIDE_TRANSLATABLE_FIELDS;
  }
  return [];
};

// Helper to safely extract a displayable string from possible JSON/string values
const extractStringValue = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    // Check if it's a JSON string and try to parse it
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        // If it's a translation result, extract the text
        if (parsed.success && parsed.translations) {
          const langCodes = Object.keys(parsed.translations);
          if (langCodes.length > 0 && Array.isArray(parsed.translations[langCodes[0]])) {
            return parsed.translations[langCodes[0]][0] || '';
          }
        }
        // If it's just a JSON object, return empty string to avoid showing raw JSON
        return '';
      } catch {
        // Not valid JSON, return as-is
        return val;
      }
    }
    return val;
  }
  return String(val);
};

const Verification = () => {
  // Get current date in YYYY-MM-DD format for default date filter
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | VerificationRecord['status']>('Pending');
  const [dateFilter, setDateFilter] = useState<string>(getCurrentDate());
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
  const [newAwardText, setNewAwardText] = useState('');
  const [addingItem, setAddingItem] = useState(false);
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  const [userTypes, setUserTypes] = useState<Array<{ user_type_id: number; type_name: string }>>([]);
  const [geocodingLocation, setGeocodingLocation] = useState(false);
  const [sortBy, setSortBy] = useState<string>('submittedOn');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [exportLoading, setExportLoading] = useState(false);

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
    let filtered = [...records];
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'entityType':
          aValue = a.entityType?.toLowerCase() || '';
          bValue = b.entityType?.toLowerCase() || '';
          break;
        case 'location':
          aValue = a.location?.toLowerCase() || '';
          bValue = b.location?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status?.toLowerCase() || '';
          bValue = b.status?.toLowerCase() || '';
          break;
        case 'submittedOn':
          aValue = new Date(a.submittedOn).getTime();
          bValue = new Date(b.submittedOn).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [records, sortBy, sortOrder]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, page]);

  const handleClearFilters = () => {
    setEntityFilter('All');
    setStatusFilter('Pending');
    setDateFilter(getCurrentDate());
    setSearchTerm('');
    setPage(1);
    fetchRecords();
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const handleExport = () => {
    setExportLoading(true);
    try {
      // Prepare data for export with proper date formatting for Excel
      const exportData = filteredData.map((record) => {
        let formattedDate = '';
        
        // Handle date formatting with proper error handling
        if (record.submittedOn && record.submittedOn.trim()) {
          try {
            // submittedOn comes as YYYY-MM-DD format from the service
            const dateStr = record.submittedOn.trim();
            
            // Check if it's already in YYYY-MM-DD format
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              const [year, month, day] = dateStr.split('-');
              // Format as MM/DD/YYYY for Excel
              formattedDate = `${month}/${day}/${year}`;
            } else {
              // Try parsing as Date object
              const date = new Date(record.submittedOn);
              if (!isNaN(date.getTime())) {
                // Format date as MM/DD/YYYY for Excel recognition
                formattedDate = format(date, 'MM/dd/yyyy');
              } else {
                // If date parsing fails, use the original value
                formattedDate = dateStr;
              }
            }
          } catch (error) {
            // If formatting fails, use the original value
            formattedDate = String(record.submittedOn || '');
          }
        }
        
        return {
          Name: record.name || '',
          Type: record.entityType || '',
          Location: record.location || '',
          Status: record.status || '',
          'Submitted On': formattedDate,
        };
      });

      // Create CSV content (Excel can open CSV files)
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row[header as keyof typeof row];
              if (value === null || value === undefined || value === '') return '';
              const stringValue = String(value);
              // For dates, always quote them to ensure Excel recognizes them
              if (header === 'Submitted On') {
                return `"${stringValue}"`;
              }
              if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(',')
        ),
      ].join('\n');

      // Add BOM for UTF-8 Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `verification_records_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export data');
    } finally {
      setExportLoading(false);
    }
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
        
        // Load translations if available (vendor + artisan)
        const translatableFieldsForEntity = getTranslatableFieldsForEntity(record.entityType);
        if (translatableFieldsForEntity.length > 0) {
          const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
          translatableFieldsForEntity.forEach(field => {
            loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            // Set English value from main business details
            if (details.businessDetails[field]) {
              loadedTranslations[field].en = String(details.businessDetails[field] || '');
            }
            // Load other language translations from _translations array (combined vendor/artisan)
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
        // Restore translations (vendor + artisan)
        const translatableFieldsForEntity = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');
        if (translatableFieldsForEntity.length > 0) {
          const restoredTranslations: Record<string, Record<LanguageCode, string>> = {};
          translatableFieldsForEntity.forEach(field => {
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
    const translatableFieldsForEntity = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');
    if (translatableFieldsForEntity.includes(key) && 
        currentLanguageTab === 'en' && 
        typeof value === 'string') {
      autoTranslateField(value, key);
    }
    
    // Update English translation when editing English tab
    if (currentLanguageTab === 'en' && translatableFieldsForEntity.includes(key)) {
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

  // Geocode business address for vendor-style entities and update lat/long + city/state/pincode
  const handlePinOnMap = async () => {
    if (!userDetails?.businessDetails) return;

    const currentDetails = editMode ? editedBusinessDetails : userDetails.businessDetails;

    // Use the address exactly as shown in the current language tab
    let address = '';
    if (currentLanguageTab === 'en') {
      address = String(currentDetails.business_address || '').trim();
    } else {
      const translatedAddress = translations['business_address']?.[currentLanguageTab];
      address = String(translatedAddress || '').trim();
    }

    // Fallback to base address if translation is empty
    if (!address) {
      address = String(currentDetails.business_address || '').trim();
    }

    if (!address) {
      alert('Please enter Business Address first');
      return;
    }

    setGeocodingLocation(true);
    try {
      const result = await geocodeAddress(address);
      if (result) {
        const { lat, lng, city, state, postalCode, formattedAddress } = result;

        const newAddress = formattedAddress || currentDetails.business_address || address;

        const updated: Record<string, any> = {
          ...currentDetails,
          business_address: newAddress,
          city: city || currentDetails.city,
          state: state || currentDetails.state,
          pincode: postalCode || currentDetails.pincode,
          latitude: String(lat),
          longitude: String(lng),
        };

        setEditedBusinessDetails((prev) => ({
          ...prev,
          ...updated,
        }));

        // Trigger auto-translate for address/city/state since they are translatable vendor fields
        if (newAddress) {
          autoTranslateField(newAddress, 'business_address');
          setTranslations((prev) => ({
            ...prev,
            business_address: {
              ...(prev.business_address || {
                en: '',
                hi: '',
                gu: '',
                ja: '',
                es: '',
                fr: '',
              }),
              en: newAddress,
            },
          }));
        }
        if (city) {
          autoTranslateField(city, 'city');
        }
        if (state) {
          autoTranslateField(state, 'state');
        }
      } else {
        alert('Could not find location for this address. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error in Verification:', error);
      alert('Failed to geocode address. Please try again.');
    } finally {
      setGeocodingLocation(false);
    }
  };

  // Geocode service area for Local Guide and populate primary_city/primary_state with translations
  const handlePinServiceAreaOnMap = async (serviceArea: string) => {
    if (!serviceArea || !serviceArea.trim()) {
      alert('Please select a service area first');
      return;
    }

    setGeocodingLocation(true);
    try {
      const result = await geocodeAddress(serviceArea.trim());
      if (result) {
        const { lat, lng, city, state, formattedAddress } = result;

        // Update primary_city, primary_state, and add lat/long for map display
        const updated: Record<string, any> = {
          ...editedBusinessDetails,
          primary_city: city || editedBusinessDetails.primary_city,
          primary_state: state || editedBusinessDetails.primary_state,
          latitude: String(lat),
          longitude: String(lng),
        };

        // If service_areas exists, update the first one with the formatted address
        if (Array.isArray(editedBusinessDetails.service_areas) && editedBusinessDetails.service_areas.length > 0) {
          updated.service_areas = [formattedAddress || serviceArea, ...editedBusinessDetails.service_areas.slice(1)];
        }

        setEditedBusinessDetails((prev) => ({
          ...prev,
          ...updated,
        }));

        // Trigger auto-translate for primary_city/primary_state since they are translatable
        if (city) {
          autoTranslateField(city, 'primary_city');
        }
        if (state) {
          autoTranslateField(state, 'primary_state');
        }
      } else {
        alert('Could not find location for this service area. Please try a different area.');
      }
    } catch (error) {
      console.error('Geocoding error for service area:', error);
      alert('Failed to geocode service area. Please try again.');
    } finally {
      setGeocodingLocation(false);
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
      const isVendorEntity = (VENDOR_ENTITY_TYPES as readonly string[]).includes(selectedRecord.entityType) || selectedRecord.entityType === 'Artisan';
      const isArtisanEntity = selectedRecord.entityType === 'Artisan';
      const isLocalGuideEntity = selectedRecord.entityType === 'Local Guide';

      if (isVendorEntity) {
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
            VENDOR_TRANSLATABLE_FIELDS.forEach(field => {
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

      // Save artisan translations (heritage_artisantranslation) if applicable
      if (isArtisanEntity) {
        try {
          // First, fetch artisan_id for this user
          const { data: artisanRow, error: artisanErr } = await supabase
            .from('heritage_artisan')
            .select('artisan_id')
            .eq('user_id', selectedRecord.id)
            .single();

          if (artisanErr) {
            console.error('Error fetching artisan_id for translations:', artisanErr);
          } else if (artisanRow?.artisan_id) {
            const artisanId = artisanRow.artisan_id;

            // Build per-language translation payloads from translations state
            const translationPayloads: any[] = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
              const langCode = lang.code;
              const row: any = {
                artisan_id: artisanId,
                language_code: langCode,
              };
              let hasData = false;

              ARTISAN_TRANSLATABLE_FIELDS.forEach((field) => {
                let val = translations[field]?.[langCode];

                // Awards column is text[] - send as an actual array, not a plain string
                if (field === 'awards') {
                  // If no explicit translation string for this lang, skip
                  if (!val || !String(val).trim()) return;

                  const baseStr = String(val).trim();
                  const awardsArr = baseStr
                    .split(/[,،、]/)
                    .map((s: string) => s.trim())
                    .filter(Boolean);

                  if (awardsArr.length > 0) {
                    row.awards = awardsArr;
                    hasData = true;
                  }
                  return;
                }

                if (val && String(val).trim()) {
                  row[field] = String(val).trim();
                  hasData = true;
                }
              });

              return hasData ? row : null;
            }).filter(Boolean) as any[];

            if (translationPayloads.length > 0) {
              // Upsert each language row individually (no RPC available in client)
              for (const payload of translationPayloads) {
                try {
                  const { artisan_id, language_code, ...fields } = payload;
                  const { error: upsertErr } = await supabase
                    .from('heritage_artisantranslation')
                    .upsert(
                      {
                        artisan_id,
                        language_code,
                        ...fields,
                      },
                      {
                        onConflict: 'artisan_id,language_code',
                      }
                    );

                  if (upsertErr) {
                    console.error('Error saving artisan translation row:', upsertErr);
                    setError(`Failed to save artisan translations: ${upsertErr.message}`);
                  }
                } catch (rowErr) {
                  console.error('Error during artisan translation upsert:', rowErr);
                }
              }
            }
          }
        } catch (artisanSaveErr: any) {
          console.error('Error saving artisan translations:', artisanSaveErr);
          setError(`Failed to save artisan translations: ${artisanSaveErr.message || 'Unknown error'}`);
        }
      }

      // Save Local Guide translations (heritage_local_guide_profile_translations) if applicable
      if (isLocalGuideEntity) {
        try {
          // Fetch profile_id for this local guide
          const { data: profileRow, error: profileErr } = await supabase
            .from('heritage_local_guide_profile')
            .select('profile_id')
            .eq('user_id', selectedRecord.id)
            .single();

          if (profileErr) {
            console.error('Error fetching local guide profile_id for translations:', profileErr);
          } else if (profileRow?.profile_id) {
            const profileId = profileRow.profile_id;

            const arrayFields = ['service_areas', 'specializations'] as const;

            const translationPayloads: any[] = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
              const langCode = lang.code;
              const row: any = {
                profile_id: profileId,
                language_code: langCode,
              };
              let hasData = false;

              LOCAL_GUIDE_TRANSLATABLE_FIELDS.forEach((field) => {
                let val = translations[field]?.[langCode];
                if (!val || !String(val).trim()) return;

                if (arrayFields.includes(field as any)) {
                  const arr = String(val)
                    .split(/[,،،、]/)
                    .map((s: string) => s.trim())
                    .filter(Boolean);
                  if (arr.length > 0) {
                    row[field] = arr;
                    hasData = true;
                  }
                } else {
                  row[field] = String(val).trim();
                  hasData = true;
                }
              });

              return hasData ? row : null;
            }).filter(Boolean) as any[];

            if (translationPayloads.length > 0) {
              for (const payload of translationPayloads) {
                try {
                  const { profile_id, language_code, ...fields } = payload;
                  const { error: upsertErr } = await supabase
                    .from('heritage_local_guide_profile_translations')
                    .upsert(
                      {
                        profile_id,
                        language_code,
                        ...fields,
                      },
                      {
                        onConflict: 'profile_id,language_code',
                      }
                    );

                  if (upsertErr) {
                    console.error('Error saving local guide translation row:', upsertErr);
                    setError(`Failed to save local guide translations: ${upsertErr.message}`);
                  }
                } catch (rowErr) {
                  console.error('Error during local guide translation upsert:', rowErr);
                }
              }
            }
          }
        } catch (guideSaveErr: any) {
          console.error('Error saving local guide translations:', guideSaveErr);
          setError(`Failed to save local guide translations: ${guideSaveErr.message || 'Unknown error'}`);
        }
      }

      // Refresh details
      const details = await VerificationService.getUserDetails(selectedRecord.id, selectedRecord.entityType);
      setUserDetails(details);
      if (details?.businessDetails) {
        setEditedBusinessDetails({ ...details.businessDetails });

        // Reload translations for the current entity (vendor + artisan)
        const translatableFieldsForEntity = getTranslatableFieldsForEntity(selectedRecord.entityType);
        if (translatableFieldsForEntity.length > 0) {
          const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
          translatableFieldsForEntity.forEach((field) => {
            loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            // English/base value from main business details
            if (details.businessDetails[field]) {
              loadedTranslations[field].en = String(details.businessDetails[field] || '');
            }
            // Other languages from combined _translations array
            if (details.businessDetails._translations && Array.isArray(details.businessDetails._translations)) {
              details.businessDetails._translations.forEach((trans: any) => {
                if (trans && trans.language_code) {
                  const langCode = String(trans.language_code).toLowerCase() as LanguageCode;
                  if (langCode && LANGUAGES.some((l) => l.code === langCode) && trans[field]) {
                    loadedTranslations[field][langCode] = String(trans[field] || '');
                  }
                }
              });
            }
          });
          setTranslations(loadedTranslations);
        } else {
          setTranslations({});
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
              startIcon={exportLoading ? <CircularProgress size={16} /> : <DownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={exportLoading || filteredData.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              {exportLoading ? 'Exporting...' : 'Export'}
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
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Name</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('entityType')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Type</span>
                    {sortBy === 'entityType' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('location')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Location</span>
                    {sortBy === 'location' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('status')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Status</span>
                    {sortBy === 'status' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('submittedOn')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Submitted On</span>
                    {sortBy === 'submittedOn' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
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
<<<<<<< HEAD
                          {userTypes
                            .filter((type) => {
                              const typeNameLower = type.type_name.toLowerCase();
                              return typeNameLower !== 'retailer' && typeNameLower !== 'administrator' && typeNameLower !== 'admin';
                            })
                            .map((type) => (
                              <MenuItem key={type.user_type_id} value={type.user_type_id}>
                                {type.type_name}
                              </MenuItem>
                            ))}
=======
                          {userTypes.map((type) => (
                            <MenuItem key={type.user_type_id} value={type.user_type_id}>
                              {type.type_name}
                            </MenuItem>
                          ))}
>>>>>>> 72d600407866d23d817e42c0179eff39d218f6ed
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
                  
                  {/* Translation Tabs - Show for vendor business details & artisan details */}
                  {getTranslatableFieldsForEntity(selectedRecord?.entityType || '').length > 0 && (
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 2 }}>
                      <Tabs 
                        value={currentLanguageTab} 
                        onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {LANGUAGES.map((lang) => {
                          const entityTransFields = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');

                          const hasTranslations = lang.code === 'en' || entityTransFields.some(field => {
                            const fieldTranslations = translations[field];
                            return (
                              fieldTranslations &&
                              fieldTranslations[lang.code] &&
                              String(fieldTranslations[lang.code]).trim() &&
                              !translatingFields.has(field)
                            );
                          });

                          const isTranslatingForLang =
                            lang.code !== 'en' &&
                            entityTransFields.some(field => translatingFields.has(field));
                          
                          return (
                            <Tab 
                              key={lang.code} 
                              label={
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <span>{lang.flag} {lang.label}</span>
                                  {isTranslatingForLang ? (
                                    <CircularProgress size={14} />
                                  ) : (
                                    hasTranslations &&
                                    lang.code !== 'en' && (
                                      <CheckCircleIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                                    )
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
                  
                  {/* Vendor location block with Pin on Map + embedded map */}
                  {(VENDOR_ENTITY_TYPES as readonly string[]).includes(selectedRecord?.entityType || '') && (
                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Location
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={8}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label={`Business Address${
                                LANGUAGES.find((l) => l.code === currentLanguageTab)?.label
                                  ? ` (${LANGUAGES.find((l) => l.code === currentLanguageTab)?.label})`
                                  : ''
                              }`}
                              value={
                                currentLanguageTab === 'en'
                                  ? editedBusinessDetails.business_address || ''
                                  : (translations['business_address'] &&
                                      translations['business_address'][currentLanguageTab]) ||
                                    ''
                              }
                              onChange={(e) => {
                                const newVal = e.target.value;
                                if (currentLanguageTab === 'en') {
                                  // Update base field and English translation
                                  handleFieldChange('business_address', newVal);
                                  setTranslations((prev) => ({
                                    ...prev,
                                    business_address: {
                                      ...(prev.business_address || {
                                        en: '',
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      }),
                                      en: newVal,
                                    },
                                  }));
                                } else {
                                  // Only update translation for current non-English language
                                  setTranslations((prev) => ({
                                    ...prev,
                                    business_address: {
                                      ...(prev.business_address || {
                                        en: String(
                                          editedBusinessDetails.business_address ??
                                            userDetails.businessDetails.business_address ??
                                            ''
                                        ),
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      }),
                                      [currentLanguageTab]: newVal,
                                    },
                                  }));
                                }
                              }}
                              InputProps={{
                                endAdornment:
                                  currentLanguageTab === 'en' &&
                                  translatingFields.has('business_address') ? (
                                    <InputAdornment position="end">
                                      <CircularProgress size={16} />
                                    </InputAdornment>
                                  ) : undefined,
                              }}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Business Address
                              </Typography>
                              <Typography variant="body2">
                                {currentLanguageTab === 'en'
                                  ? userDetails.businessDetails.business_address || '—'
                                  : (translations['business_address'] &&
                                      translations['business_address'][currentLanguageTab]) ||
                                    userDetails.businessDetails.business_address ||
                                    '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          {editMode && (
                            <Button
                              fullWidth
                              variant="outlined"
                              startIcon={geocodingLocation ? <CircularProgress size={18} /> : <MapIcon />}
                              sx={{ height: '100%', borderRadius: 3 }}
                              onClick={handlePinOnMap}
                              disabled={
                                geocodingLocation ||
                                !String(
                                  currentLanguageTab === 'en'
                                    ? editedBusinessDetails.business_address ??
                                      userDetails.businessDetails.business_address ??
                                      ''
                                    : (translations['business_address'] &&
                                        translations['business_address'][currentLanguageTab]) ||
                                      editedBusinessDetails.business_address ||
                                      userDetails.businessDetails.business_address ||
                                      ''
                                ).trim()
                              }
                            >
                              {geocodingLocation ? 'Finding...' : 'Pin on Map'}
                            </Button>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label={`City${
                                LANGUAGES.find((l) => l.code === currentLanguageTab)?.label
                                  ? ` (${LANGUAGES.find((l) => l.code === currentLanguageTab)?.label})`
                                  : ''
                              }`}
                              value={
                                currentLanguageTab === 'en'
                                  ? editedBusinessDetails.city || ''
                                  : (translations['city'] && translations['city'][currentLanguageTab]) || ''
                              }
                              onChange={(e) => {
                                const newVal = e.target.value;
                                if (currentLanguageTab === 'en') {
                                  handleFieldChange('city', newVal);
                                } else {
                                  setTranslations((prev) => ({
                                    ...prev,
                                    city: {
                                      ...(prev.city || {
                                        en: String(
                                          editedBusinessDetails.city ??
                                            userDetails.businessDetails.city ??
                                            ''
                                        ),
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      }),
                                      [currentLanguageTab]: newVal,
                                    },
                                  }));
                                }
                              }}
                              InputProps={{
                                endAdornment:
                                  currentLanguageTab === 'en' && translatingFields.has('city') ? (
                                    <InputAdornment position="end">
                                      <CircularProgress size={16} />
                                    </InputAdornment>
                                  ) : undefined,
                              }}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                City
                              </Typography>
                              <Typography variant="body2">
                                {currentLanguageTab === 'en'
                                  ? userDetails.businessDetails.city || '—'
                                  : (translations['city'] &&
                                      translations['city'][currentLanguageTab]) ||
                                    userDetails.businessDetails.city ||
                                    '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label={`State${
                                LANGUAGES.find((l) => l.code === currentLanguageTab)?.label
                                  ? ` (${LANGUAGES.find((l) => l.code === currentLanguageTab)?.label})`
                                  : ''
                              }`}
                              value={
                                currentLanguageTab === 'en'
                                  ? editedBusinessDetails.state || ''
                                  : (translations['state'] && translations['state'][currentLanguageTab]) || ''
                              }
                              onChange={(e) => {
                                const newVal = e.target.value;
                                if (currentLanguageTab === 'en') {
                                  handleFieldChange('state', newVal);
                                } else {
                                  setTranslations((prev) => ({
                                    ...prev,
                                    state: {
                                      ...(prev.state || {
                                        en: String(
                                          editedBusinessDetails.state ??
                                            userDetails.businessDetails.state ??
                                            ''
                                        ),
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      }),
                                      [currentLanguageTab]: newVal,
                                    },
                                  }));
                                }
                              }}
                              InputProps={{
                                endAdornment:
                                  currentLanguageTab === 'en' && translatingFields.has('state') ? (
                                    <InputAdornment position="end">
                                      <CircularProgress size={16} />
                                    </InputAdornment>
                                  ) : undefined,
                              }}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                State
                              </Typography>
                              <Typography variant="body2">
                                {currentLanguageTab === 'en'
                                  ? userDetails.businessDetails.state || '—'
                                  : (translations['state'] &&
                                      translations['state'][currentLanguageTab]) ||
                                    userDetails.businessDetails.state ||
                                    '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        <Grid item xs={12} md={4}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label="Pincode"
                              value={editedBusinessDetails.pincode || ''}
                              onChange={(e) => handleFieldChange('pincode', e.target.value)}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Pincode
                              </Typography>
                              <Typography variant="body2">
                                {userDetails.businessDetails.pincode || '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        <Grid item xs={12} md={3}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label="Latitude"
                              value={editedBusinessDetails.latitude || ''}
                              onChange={(e) => handleFieldChange('latitude', e.target.value)}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Latitude
                              </Typography>
                              <Typography variant="body2">
                                {userDetails.businessDetails.latitude || '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        <Grid item xs={12} md={3}>
                          {editMode ? (
                            <TextField
                              fullWidth
                              size="small"
                              label="Longitude"
                              value={editedBusinessDetails.longitude || ''}
                              onChange={(e) => handleFieldChange('longitude', e.target.value)}
                            />
                          ) : (
                            <>
                              <Typography variant="body2" color="text.secondary">
                                Longitude
                              </Typography>
                              <Typography variant="body2">
                                {userDetails.businessDetails.longitude || '—'}
                              </Typography>
                            </>
                          )}
                        </Grid>
                        {((editMode ? editedBusinessDetails.latitude : userDetails.businessDetails.latitude) &&
                          (editMode ? editedBusinessDetails.longitude : userDetails.businessDetails.longitude)) && (
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                borderRadius: 3,
                                overflow: 'hidden',
                                border: '1px solid #E0E0E0',
                                height: 240,
                                position: 'relative',
                              }}
                            >
                              <iframe
                                title="Location Map"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${
                                  editMode ? editedBusinessDetails.latitude : userDetails.businessDetails.latitude
                                },${
                                  editMode ? editedBusinessDetails.longitude : userDetails.businessDetails.longitude
                                }&z=15&output=embed`}
                              />
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>
                  )}
                  
                  <Grid container spacing={2}>
                    {(() => {
                      // Get all entries
                      const entries = Object.entries(editMode ? editedBusinessDetails : userDetails.businessDetails);
                      
                      // Filter out system / internal fields
                      let filteredEntries = entries.filter(([key]) => 
                        ![
                          'id',
                          'user_id',
                          'created_at',
                          'updated_at',
                          'profile_id',
                          'artisan_id',
                          'guide_id',
                          'business_id',
                          'is_verified',
                          'verification_status',
                          '_translations',
                          // Hide certifications from generic view
                          'certifications',
                          // Hide bio_language field
                          'bio_language',
                        ].includes(key)
                      );

                      const isArtisan = selectedRecord?.entityType === 'Artisan';
                      const isPureVendorEntity = (VENDOR_ENTITY_TYPES as readonly string[]).includes(selectedRecord?.entityType || '');
                      const isLocalGuide = selectedRecord?.entityType === 'Local Guide';

                      // For artisans, Business Details should only display vendor-style fields
                      if (isArtisan) {
                        const vendorFieldSet = new Set<string>([
                          ...VENDOR_FIELD_ORDER,
                          'latitude',
                          'longitude',
                        ]);
                        filteredEntries = filteredEntries.filter(([key]) => vendorFieldSet.has(key));
                      }
                      
                      // For pure vendor entities, Location fields are handled separately with map,
                      // so remove them from the generic grid
                      if (isPureVendorEntity) {
                        const locationFieldSet = new Set<string>([
                          'business_address',
                          'city',
                          'state',
                          'pincode',
                          'latitude',
                          'longitude',
                        ]);
                        filteredEntries = filteredEntries.filter(([key]) => !locationFieldSet.has(key));
                      }
                      
                      // Check if this is a vendor business type (also treat artisan as vendor-style for ordering)
                      const isVendorBusiness = (VENDOR_ENTITY_TYPES as readonly string[]).includes(selectedRecord?.entityType || '') || isArtisan;
                      
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
                      
                      // Helper: parse availability_days for Local Guide
                      let availabilityDaysSet = new Set<string>();
                      if (isLocalGuide) {
                        const availRaw = editMode ? editedBusinessDetails.availability_days : userDetails.businessDetails.availability_days;
                        if (Array.isArray(availRaw)) {
                          availabilityDaysSet = new Set(availRaw.map(String));
                        } else if (typeof availRaw === 'string') {
                          // Handle comma separated or PostgreSQL array format
                          if (availRaw.startsWith('{') && availRaw.endsWith('}')) {
                            const inner = availRaw.slice(1, -1);
                            if (inner) {
                              availabilityDaysSet = new Set(
                                inner.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean)
                              );
                            }
                          } else {
                            availabilityDaysSet = new Set(
                              availRaw.split(',').map(s => s.trim()).filter(Boolean)
                            );
                          }
                        }
                      }

                      const weekendSelected =
                        isLocalGuide &&
                        (availabilityDaysSet.has('Saturday') || availabilityDaysSet.has('Sunday'));

                      return sortedEntries.map(([key, value]) => {
                      
                      const label = key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                      
                      // Check if this is a translatable field for the current entity
                      const entityTransFields = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');
                      const isTranslatableField = entityTransFields.includes(key);

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
                      
                      // Local Guide: custom UI for availability_days
                      if (isLocalGuide && key === 'availability_days') {
                        const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                        const selectedDays = Array.from(availabilityDaysSet);
                        const selectedSet = new Set(selectedDays);

                        const toggleDay = (day: string) => {
                          if (!editMode) return;
                          const next = selectedSet.has(day)
                            ? selectedDays.filter(d => d !== day)
                            : [...selectedDays, day];
                          handleFieldChange('availability_days', next);
                        };

                        return (
                          <Grid item xs={12} key={key}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {label}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
                              {DAYS.map((day) => {
                                const isSelected = selectedSet.has(day);
                                return (
                                  <Chip
                                    key={day}
                                    label={day}
                                    size="small"
                                    color={isSelected ? 'primary' : 'default'}
                                    variant={isSelected ? 'filled' : 'outlined'}
                                    onClick={editMode ? () => toggleDay(day) : undefined}
                                  />
                                );
                              })}
                            </Stack>
                          </Grid>
                        );
                      }

                      // Local Guide: custom UI for service_areas with Pin on Map
                      if (isLocalGuide && key === 'service_areas') {
                        let serviceAreasArr: string[] = [];
                        if (Array.isArray(currentValue)) {
                          serviceAreasArr = currentValue;
                        } else if (typeof currentValue === 'string' && currentValue.startsWith('{') && currentValue.endsWith('}')) {
                          const inner = currentValue.slice(1, -1);
                          if (inner) {
                            serviceAreasArr = inner.split(',').map(s => s.replace(/^"|"$/g, '').trim()).filter(Boolean);
                          }
                        } else if (typeof currentValue === 'string' && currentValue) {
                          serviceAreasArr = currentValue.split(',').map(s => s.trim()).filter(Boolean);
                        } else if (Array.isArray(value)) {
                          serviceAreasArr = value;
                        }

                        const handleRemoveServiceArea = (idx: number) => {
                          if (!editMode) return;
                          const itemToRemove = serviceAreasArr[idx];
                          const newArr = serviceAreasArr.filter((_, i) => i !== idx);
                          handleFieldChange(key, newArr);
                          
                          // Remove from all language translations
                          if (translations[key]) {
                            const updatedTranslations: Record<LanguageCode, string> = { ...translations[key] };
                            LANGUAGES.forEach(lang => {
                              if (updatedTranslations[lang.code]) {
                                const langArr = String(updatedTranslations[lang.code])
                                  .split(/[,،،、]/)
                                  .map(s => s.trim())
                                  .filter(Boolean);
                                const filteredLangArr = langArr.filter(item => item !== itemToRemove);
                                updatedTranslations[lang.code] = filteredLangArr.join(', ');
                              }
                            });
                            setTranslations(prev => ({
                              ...prev,
                              [key]: updatedTranslations,
                            }));
                          }
                        };

                        return (
                          <Grid item xs={12} key={key}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} alignItems="center">
                              {serviceAreasArr.length > 0 ? serviceAreasArr.map((item, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={String(item)} 
                                  size="small" 
                                  variant="outlined"
                                  onDelete={editMode ? () => handleRemoveServiceArea(idx) : undefined}
                                />
                              )) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                              {editMode && (
                                <>
                                  <Chip
                                    label="+ Add"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    onClick={() => {
                                      if (!Array.isArray(editedBusinessDetails[key])) {
                                        handleFieldChange(key, serviceAreasArr);
                                      }
                                      setAddItemDialog({ open: true, key, label });
                                      setNewItemValue('');
                                    }}
                                    sx={{ cursor: 'pointer' }}
                                  />
                                  {serviceAreasArr.length > 0 && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={geocodingLocation ? <CircularProgress size={16} /> : <MapIcon />}
                                      onClick={() => {
                                        // Use the first service area for geocoding
                                        const firstArea = serviceAreasArr[0];
                                        if (firstArea) {
                                          handlePinServiceAreaOnMap(firstArea);
                                        }
                                      }}
                                      disabled={geocodingLocation || serviceAreasArr.length === 0}
                                    >
                                      {geocodingLocation ? 'Finding...' : 'Pin on Map'}
                                    </Button>
                                  )}
                                </>
                              )}
                            </Stack>
                            {/* Map display for Local Guide when lat/long are available */}
                            {isLocalGuide && 
                             ((editMode ? editedBusinessDetails.latitude : userDetails.businessDetails.latitude) &&
                              (editMode ? editedBusinessDetails.longitude : userDetails.businessDetails.longitude)) && (
                              <Box
                                sx={{
                                  mt: 2,
                                  borderRadius: 3,
                                  overflow: 'hidden',
                                  border: '1px solid #E0E0E0',
                                  height: 240,
                                  position: 'relative',
                                }}
                              >
                                <iframe
                                  title="Service Area Map"
                                  width="100%"
                                  height="100%"
                                  style={{ border: 0 }}
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  src={`https://www.google.com/maps?q=${
                                    editMode ? editedBusinessDetails.latitude : userDetails.businessDetails.latitude
                                  },${
                                    editMode ? editedBusinessDetails.longitude : userDetails.businessDetails.longitude
                                  }&z=15&output=embed`}
                                />
                              </Box>
                            )}
                          </Grid>
                        );
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
                        // For Local Guide translatable array fields (service_areas, specializations), handle removal from all languages
                        const isLocalGuideTranslatableArray = isLocalGuide && (key === 'service_areas' || key === 'specializations');
                        const handleRemoveArrayItem = (idx: number) => {
                          if (!editMode) return;
                          const itemToRemove = arrValue[idx];
                          const newArr = arrValue.filter((_, i) => i !== idx);
                          handleFieldChange(key, newArr);
                          
                          // Remove from all language translations for Local Guide translatable arrays
                          if (isLocalGuideTranslatableArray && translations[key]) {
                            const updatedTranslations: Record<LanguageCode, string> = { ...translations[key] };
                            LANGUAGES.forEach(lang => {
                              if (updatedTranslations[lang.code]) {
                                const langArr = String(updatedTranslations[lang.code])
                                  .split(/[,،،、]/)
                                  .map(s => s.trim())
                                  .filter(Boolean);
                                const filteredLangArr = langArr.filter(item => item !== itemToRemove);
                                updatedTranslations[lang.code] = filteredLangArr.join(', ');
                              }
                            });
                            setTranslations(prev => ({
                              ...prev,
                              [key]: updatedTranslations,
                            }));
                          }
                        };

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
                                  onDelete={editMode ? () => handleRemoveArrayItem(idx) : undefined}
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
                      
                      // Local Guide: custom time pickers for weekday/weekend start/end times
                      if (
                        isLocalGuide &&
                        ['weekday_start_time', 'weekday_end_time', 'weekend_start_time', 'weekend_end_time'].includes(
                          key
                        )
                      ) {
                        const labelMap: Record<string, string> = {
                          weekday_start_time: 'Weekday Start Time',
                          weekday_end_time: 'Weekday End Time',
                          weekend_start_time: 'Weekend Start Time',
                          weekend_end_time: 'Weekend End Time',
                        };

                        // Hide weekend fields if Saturday/Sunday not selected
                        if (
                          (key === 'weekend_start_time' || key === 'weekend_end_time') &&
                          !weekendSelected
                        ) {
                          return null;
                        }

                        const timeValue =
                          typeof currentValue === 'string'
                            ? currentValue.slice(0, 5) // HH:MM from HH:MM:SS
                            : '';

                        if (editMode) {
                          return (
                            <Grid item xs={6} key={key}>
                              <TextField
                                fullWidth
                                size="small"
                                label={labelMap[key] || label}
                                type="time"
                                value={timeValue}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 60 }}
                              />
                            </Grid>
                          );
                        }

                        return (
                          <Grid item xs={6} key={key}>
                            <Typography variant="body2" color="text.secondary">
                              {labelMap[key] || label}
                            </Typography>
                            <Typography variant="body2">
                              {currentValue ? String(currentValue) : '—'}
                            </Typography>
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

              {selectedRecord?.entityType === 'Artisan' && userDetails?.businessDetails && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Artisan Details
                  </Typography>
                  <Grid container spacing={2}>
                    {ARTISAN_FIELD_ORDER.map((fieldKey) => {
                      if (!(fieldKey in userDetails.businessDetails)) return null;

                      const rawVal = userDetails.businessDetails[fieldKey];
                      const label = fieldKey.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

                      // Layout: make Full Bio span full width, others half width
                      const gridSize = fieldKey === 'full_bio' ? 12 : 6;

                      const isTranslatableField = ARTISAN_TRANSLATABLE_FIELDS.includes(fieldKey);
                      const entityTransFields = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');
                      const isEntityTranslatable = isTranslatableField && entityTransFields.includes(fieldKey);

                      let currentValue: any = editMode ? editedBusinessDetails[fieldKey] ?? rawVal : rawVal;

                      if (isEntityTranslatable && !editMode) {
                        if (currentLanguageTab === 'en') {
                          currentValue = extractStringValue(rawVal);
                        } else {
                          currentValue =
                            (translations[fieldKey] && translations[fieldKey][currentLanguageTab]) ||
                            '';
                        }
                      } else if (isEntityTranslatable && editMode) {
                        if (currentLanguageTab === 'en') {
                          currentValue = extractStringValue(editedBusinessDetails[fieldKey] ?? rawVal ?? '');
                        } else {
                          currentValue =
                            (translations[fieldKey] && translations[fieldKey][currentLanguageTab]) ||
                            '';
                        }
                      } else {
                        currentValue = extractStringValue(currentValue);
                      }

                      const isBoolean = typeof rawVal === 'boolean';

                      // Special handling for Awards as choice chips with add/remove and translations
                      if (fieldKey === 'awards') {
                        const langCode = currentLanguageTab;
                        // Determine base string for this language
                        let baseStr = '';
                        if (isEntityTranslatable) {
                          if (langCode === 'en') {
                            baseStr = String(
                              (editMode ? editedBusinessDetails[fieldKey] : rawVal) || ''
                            );
                          } else {
                            baseStr =
                              (translations[fieldKey] &&
                                translations[fieldKey][langCode]) ||
                              '';
                          }
                        } else {
                          baseStr = String(
                            (editMode ? editedBusinessDetails[fieldKey] : rawVal) || ''
                          );
                        }

                        // Parse awards as list; support both normal comma and Japanese comma "、"
                        const awardsArr =
                          baseStr
                            .split(/[,、]/)
                            .map((s: string) => s.trim())
                            .filter(Boolean) || [];

                        const updateAwardsForLang = (nextAwards: string[]) => {
                          const separator = langCode === 'ja' ? '、 ' : ', ';
                          const joined = nextAwards.join(separator);

                          if (isEntityTranslatable) {
                            if (langCode === 'en') {
                              // Update base field and English translation
                              handleFieldChange(fieldKey, joined);
                              setTranslations((prev) => ({
                                ...prev,
                                [fieldKey]: {
                                  ...(prev[fieldKey] || {
                                    en: '',
                                    hi: '',
                                    gu: '',
                                    ja: '',
                                    es: '',
                                    fr: '',
                                  }),
                                  en: joined,
                                },
                              }));
                            } else {
                              // Only update translation for current non-English language
                              setTranslations((prev) => ({
                                ...prev,
                                [fieldKey]: {
                                  ...(prev[fieldKey] || {
                                    en: String(
                                      (editedBusinessDetails[fieldKey] ?? rawVal ?? '') || ''
                                    ),
                                    hi: '',
                                    gu: '',
                                    ja: '',
                                    es: '',
                                    fr: '',
                                  }),
                                  [langCode]: joined,
                                },
                              }));
                            }
                          } else {
                            handleFieldChange(fieldKey, joined);
                          }
                        };

                        if (!editMode) {
                          return (
                            <Grid item xs={12} key={fieldKey}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                {label}
                              </Typography>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {awardsArr.length > 0 ? (
                                  awardsArr.map((item, idx) => (
                                    <Chip key={idx} label={item} size="small" />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.disabled">
                                    —
                                  </Typography>
                                )}
                              </Stack>
                            </Grid>
                          );
                        }

                        // Edit mode UI: selectable chips + add new
                        return (
                          <Grid item xs={12} key={fieldKey}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {label}
                              {isEntityTranslatable &&
                                ` (${LANGUAGES.find((l) => l.code === langCode)?.label})`}
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                              {awardsArr.map((item, idx) => (
                                <Chip
                                  key={`${item}-${idx}`}
                                  label={item}
                                  size="small"
                                  color="primary"
                                  variant="filled"
                                  onClick={() => {
                                    // Toggle off (unselect) by removing from list
                                    const next = awardsArr.filter((_, i) => i !== idx);
                                    updateAwardsForLang(next);
                                  }}
                                />
                              ))}
                              {awardsArr.length === 0 && (
                                <Typography variant="body2" color="text.disabled">
                                  No awards added yet.
                                </Typography>
                              )}
                            </Stack>
                            <Stack direction="row" spacing={1}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Add award"
                                value={newAwardText}
                                onChange={(e) => setNewAwardText(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newAwardText.trim()) {
                                    const next = [...awardsArr, newAwardText.trim()];
                                    updateAwardsForLang(next);
                                    setNewAwardText('');
                                  }
                                }}
                              />
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => {
                                  if (!newAwardText.trim()) return;
                                  const next = [...awardsArr, newAwardText.trim()];
                                  updateAwardsForLang(next);
                                  setNewAwardText('');
                                }}
                              >
                                Add
                              </Button>
                            </Stack>
                          </Grid>
                        );
                      }

                      if (!editMode) {
                        return (
                          <Grid item xs={gridSize} key={fieldKey}>
                            <Typography variant="body2" color="text.secondary">
                              {label}
                            </Typography>
                            {isBoolean ? (
                              <Chip
                                label={currentValue ? 'Yes' : 'No'}
                                size="small"
                                color={currentValue ? 'success' : 'default'}
                              />
                            ) : (
                              <Typography variant="body2" color={currentValue ? 'text.primary' : 'text.disabled'}>
                                {currentValue || '—'}
                              </Typography>
                            )}
                          </Grid>
                        );
                      }

                      // Edit mode
                      if (isBoolean) {
                        return (
                          <Grid item xs={gridSize} key={fieldKey}>
                            <FormControl fullWidth size="small">
                              <InputLabel>{label}</InputLabel>
                              <Select
                                label={label}
                                value={editedBusinessDetails[fieldKey] ? 'true' : 'false'}
                                onChange={(e) => handleFieldChange(fieldKey, e.target.value === 'true')}
                              >
                                <MenuItem value="true">Yes</MenuItem>
                                <MenuItem value="false">No</MenuItem>
                              </Select>
                            </FormControl>
                          </Grid>
                        );
                      }

                      const isMultiline = fieldKey === 'short_bio' || fieldKey === 'full_bio';

                      return (
                        <Grid item xs={gridSize} key={fieldKey}>
                          <TextField
                            fullWidth
                            size="small"
                            label={`${label}${
                              isEntityTranslatable
                                ? ` (${LANGUAGES.find((l) => l.code === currentLanguageTab)?.label})`
                                : ''
                            }`}
                            value={currentValue || ''}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              if (isEntityTranslatable && currentLanguageTab !== 'en') {
                                // Update translation state only for non-English
                                setTranslations((prev) => ({
                                  ...prev,
                                  [fieldKey]: {
                                    ...(prev[fieldKey] || {
                                      en: '',
                                      hi: '',
                                      gu: '',
                                      ja: '',
                                      es: '',
                                      fr: '',
                                    }),
                                    [currentLanguageTab]: newVal,
                                  },
                                }));
                              } else {
                                handleFieldChange(fieldKey, newVal);
                              }
                            }}
                            multiline={isMultiline}
                            minRows={isMultiline ? 3 : undefined}
                            maxRows={isMultiline ? 6 : undefined}
                            InputProps={{
                              endAdornment:
                                isEntityTranslatable &&
                                currentLanguageTab === 'en' &&
                                translatingFields.has(fieldKey) ? (
                                  <InputAdornment position="end">
                                    <CircularProgress size={16} />
                                  </InputAdornment>
                                ) : undefined,
                            }}
                          />
                        </Grid>
                      );
                    })}
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
      <Dialog 
        open={addItemDialog.open} 
        onClose={() => {
          if (!addingItem) {
            setAddItemDialog({ open: false, key: '', label: '' });
            setNewItemValue('');
            setAddingItem(false);
          }
        }} 
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle>Add {addItemDialog.label}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label={`New ${addItemDialog.label}`}
            value={newItemValue}
            onChange={(e) => setNewItemValue(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && newItemValue.trim() && !addingItem) {
                setAddingItem(true);
                try {
                  const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                  const newItem = newItemValue.trim();
                  handleFieldChange(addItemDialog.key, [...arrValue, newItem]);
                  
                  // For Local Guide translatable arrays (service_areas, specializations), translate the new item
                  const isLocalGuideTranslatableArray = selectedRecord?.entityType === 'Local Guide' && 
                    (addItemDialog.key === 'service_areas' || addItemDialog.key === 'specializations');
                  if (isLocalGuideTranslatableArray) {
                    // Translate the new item and append to existing translations
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    setTranslatingFields(prev => new Set(prev).add(addItemDialog.key));
                    
                    try {
                      // Collect all translations first, then update state once
                      const currentTranslations = translations[addItemDialog.key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                      
                      // Initialize with current translations
                      const translationUpdates: Record<LanguageCode, string> = {
                        en: currentTranslations.en || '',
                        hi: currentTranslations.hi || '',
                        gu: currentTranslations.gu || '',
                        ja: currentTranslations.ja || '',
                        es: currentTranslations.es || '',
                        fr: currentTranslations.fr || '',
                      };
                      
                      // Update English translation first
                      const existingEnArr = translationUpdates.en ? translationUpdates.en.split(/[,，،、]/).map(s => s.trim()).filter(Boolean) : [];
                      translationUpdates.en = [...existingEnArr, newItem].join(', ');
                      
                      // Translate to other languages
                      for (const lang of targetLanguages) {
                        try {
                          const result = await TranslationService.translate(newItem, lang.code, 'en');
                          if (result.success && result.translations && result.translations[lang.code]) {
                            const translatedText = Array.isArray(result.translations[lang.code]) 
                              ? result.translations[lang.code][0] 
                              : String(result.translations[lang.code] || '');
                            
                            const existingLangArr = translationUpdates[lang.code] 
                              ? translationUpdates[lang.code].split(/[,，،、]/).map(s => s.trim()).filter(Boolean) 
                              : [];
                            translationUpdates[lang.code] = [...existingLangArr, translatedText].join(', ');
                          }
                        } catch (langError) {
                          console.error(`Translation error for ${lang.code}:`, langError);
                          // Keep existing translation if new translation fails
                          translationUpdates[lang.code] = currentTranslations[lang.code] || '';
                        }
                      }
                      
                      // Update all translations in a single state update
                      setTranslations(prev => ({
                        ...prev,
                        [addItemDialog.key]: translationUpdates,
                      }));
                    } catch (error) {
                      console.error('Translation error:', error);
                    } finally {
                      setTranslatingFields(prev => {
                        const next = new Set(prev);
                        next.delete(addItemDialog.key);
                        return next;
                      });
                    }
                  }
                  
                  setAddItemDialog({ open: false, key: '', label: '' });
                  setNewItemValue('');
                } catch (error) {
                  console.error('Error adding item:', error);
                  // Still close dialog even if translation fails
                  setAddItemDialog({ open: false, key: '', label: '' });
                  setNewItemValue('');
                } finally {
                  setAddingItem(false);
                }
              }
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (!addingItem) {
                setAddItemDialog({ open: false, key: '', label: '' });
                setNewItemValue('');
              }
            }}
            disabled={addingItem}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={addingItem || !newItemValue.trim()}
            startIcon={addingItem ? <CircularProgress size={16} /> : undefined}
            onClick={async () => {
              if (newItemValue.trim() && !addingItem) {
                setAddingItem(true);
                try {
                  const arrValue = Array.isArray(editedBusinessDetails[addItemDialog.key]) ? editedBusinessDetails[addItemDialog.key] : [];
                  const newItem = newItemValue.trim();
                  handleFieldChange(addItemDialog.key, [...arrValue, newItem]);
                  
                  // For Local Guide translatable arrays (service_areas, specializations), translate the new item
                  const isLocalGuideTranslatableArray = selectedRecord?.entityType === 'Local Guide' && 
                    (addItemDialog.key === 'service_areas' || addItemDialog.key === 'specializations');
                  if (isLocalGuideTranslatableArray) {
                    // Translate the new item and append to existing translations
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    setTranslatingFields(prev => new Set(prev).add(addItemDialog.key));
                    
                    try {
                      // Collect all translations first, then update state once
                      const currentTranslations = translations[addItemDialog.key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                      
                      // Initialize with current translations
                      const translationUpdates: Record<LanguageCode, string> = {
                        en: currentTranslations.en || '',
                        hi: currentTranslations.hi || '',
                        gu: currentTranslations.gu || '',
                        ja: currentTranslations.ja || '',
                        es: currentTranslations.es || '',
                        fr: currentTranslations.fr || '',
                      };
                      
                      // Update English translation first
                      const existingEnArr = translationUpdates.en ? translationUpdates.en.split(/[,，،、]/).map(s => s.trim()).filter(Boolean) : [];
                      translationUpdates.en = [...existingEnArr, newItem].join(', ');
                      
                      // Translate to other languages
                      for (const lang of targetLanguages) {
                        try {
                          const result = await TranslationService.translate(newItem, lang.code, 'en');
                          if (result.success && result.translations && result.translations[lang.code]) {
                            const translatedText = Array.isArray(result.translations[lang.code]) 
                              ? result.translations[lang.code][0] 
                              : String(result.translations[lang.code] || '');
                            
                            const existingLangArr = translationUpdates[lang.code] 
                              ? translationUpdates[lang.code].split(/[,，،、]/).map(s => s.trim()).filter(Boolean) 
                              : [];
                            translationUpdates[lang.code] = [...existingLangArr, translatedText].join(', ');
                          }
                        } catch (langError) {
                          console.error(`Translation error for ${lang.code}:`, langError);
                          // Keep existing translation if new translation fails
                          translationUpdates[lang.code] = currentTranslations[lang.code] || '';
                        }
                      }
                      
                      // Update all translations in a single state update
                      setTranslations(prev => ({
                        ...prev,
                        [addItemDialog.key]: translationUpdates,
                      }));
                    } catch (error) {
                      console.error('Translation error:', error);
                    } finally {
                      setTranslatingFields(prev => {
                        const next = new Set(prev);
                        next.delete(addItemDialog.key);
                        return next;
                      });
                    }
                  }
                  
                  setAddItemDialog({ open: false, key: '', label: '' });
                  setNewItemValue('');
                } catch (error) {
                  console.error('Error adding item:', error);
                  // Still close dialog even if translation fails
                  setAddItemDialog({ open: false, key: '', label: '' });
                  setNewItemValue('');
                } finally {
                  setAddingItem(false);
                }
              }
            }}
          >
            {addingItem ? 'Adding...' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Verification;

