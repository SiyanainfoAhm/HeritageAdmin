import { useEffect, useMemo, useState, useRef, ReactElement } from 'react';
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import StarIcon from '@mui/icons-material/Star';
import ImageIcon from '@mui/icons-material/Image';
import { format } from 'date-fns';
import { formatDisplayDate, formatDisplayTime, getCurrentDate } from '../../utils/dateTime.utils';
import FormattedDateInput from '../../components/common/FormattedDateInput';
import FormattedTimeInput from '../../components/common/FormattedTimeInput';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import MapIcon from '@mui/icons-material/Map';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import WifiIcon from '@mui/icons-material/Wifi';
import LocalParkingIcon from '@mui/icons-material/LocalParking';
import AccessibleIcon from '@mui/icons-material/Accessible';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AddIcon from '@mui/icons-material/Add';
import { VerificationService, VerificationRecord } from '@/services/verification.service';
import { UserService } from '@/services/user.service';
import { TranslationService } from '@/services/translation.service';
import { StorageService } from '@/services/storage.service';
import { MasterData } from '@/types';
import { supabase } from '@/config/supabase';
import { geocodeAddress } from '@/config/googleMaps';
import HotelDetailsDialog from './components/HotelDetailsDialog';
import FoodDetailsDialog from './components/FoodDetailsDialog';
import ArtworkDetailsDialog from './components/ArtworkDetailsDialog';
import RejectionDialog from './components/RejectionDialog';

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

// Translatable fields for event details
const EVENT_TRANSLATABLE_FIELDS = [
  'event_name',
  'short_description',
  'full_description',
  'highlights',
  'venue_name',
  'venue_address',
  'organizer_name',
  'dress_code',
  'what_to_bring',
  'prohibited_items',
  'city',
  'state',
  'nearest_metro',
  'nearest_bus_stop',
];

// Translatable fields for tour details
const TOUR_TRANSLATABLE_FIELDS = [
  'tour_name',
  'short_description',
  'full_description',
  'city',
  'state',
  'area_or_zone',
  'route_name',
  'meeting_point',
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

const VERIFICATION_STATUS_OPTIONS: Array<'All' | VerificationRecord['status']> = ['All', 'Pending', 'Approved', 'Rejected'];
const TABLE_STATUS_OPTIONS: Array<'All' | 'draft' | 'published' | 'rejected'> = ['All', 'draft', 'published', 'rejected'];
const PRODUCT_STATUS_OPTIONS: Array<'All' | 'published' | 'draft'> = ['All', 'published', 'draft']; // published = active, draft = inactive

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

type VerificationTab = 'user' | 'event' | 'tour' | 'hotel' | 'food' | 'product';

const TAB_CONFIG: { key: VerificationTab; label: string; tableName?: string }[] = [
  { key: 'user', label: 'User Verification' },
  { key: 'event', label: 'Event', tableName: 'heritage_event' },
  { key: 'tour', label: 'Tour', tableName: 'heritage_tour' },
  { key: 'hotel', label: 'Hotel', tableName: 'heritage_hotel' },
  { key: 'food', label: 'Food', tableName: 'heritage_food' },
  { key: 'product', label: 'Product', tableName: 'heritage_artwork' },
];

// Helper function to get icon component from icon name string
const getIconFromName = (iconName: string | null | undefined): ReactElement | undefined => {
  if (!iconName) return undefined;
  
  const iconMap: Record<string, ReactElement> = {
    'whatshot': <WhatshotIcon />,
    'family_restroom': <FamilyRestroomIcon />,
    'thumb_up': <ThumbUpIcon />,
    'local_fire_department': <LocalFireDepartmentIcon />,
    'dark_mode': <DarkModeIcon />,
    'wifi': <WifiIcon />,
    'parking': <LocalParkingIcon />,
    'wheelchair': <AccessibleIcon />,
    'restroom': <FamilyRestroomIcon />,
    'restaurant': <RestaurantIcon />,
    'photo_spot': <PhotoCameraIcon />,
    'photo': <PhotoCameraIcon />,
  };
  
  const normalizedName = iconName.toLowerCase().trim().replace(/[_-]/g, '');
  return iconMap[normalizedName] || iconMap[iconName.toLowerCase().trim()];
};

const Verification = () => {

  const [currentTab, setCurrentTab] = useState<VerificationTab>('user');
  const [entityFilter, setEntityFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | VerificationRecord['status'] | 'draft' | 'published'>('Pending');
  const [dateFilter, setDateFilter] = useState<string>(getCurrentDate());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [records, setRecords] = useState<VerificationRecord[]>([]);
  const [tableData, setTableData] = useState<any[]>([]); // For Event, Tour, Hotel, Food tables
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VerificationRecord | null>(null);
  const [selectedTableRecord, setSelectedTableRecord] = useState<any | null>(null); // For Event, Tour, Hotel, Food
  const [userDetails, setUserDetails] = useState<{ user: any; businessDetails: any; documents: any[] } | null>(null);
  const [eventDetails, setEventDetails] = useState<any | null>(null); // For Event details from RPC
  const [tourDetails, setTourDetails] = useState<any | null>(null); // For Tour details from RPC
  const [hotelDialogOpen, setHotelDialogOpen] = useState(false);
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  const [foodDialogOpen, setFoodDialogOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [artworkDialogOpen, setArtworkDialogOpen] = useState(false);
  const [selectedArtworkId, setSelectedArtworkId] = useState<number | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUserInfo, setEditedUserInfo] = useState<{ full_name?: string; email?: string; phone?: string; user_type_id?: number } | null>(null);
  const [editedBusinessDetails, setEditedBusinessDetails] = useState<Record<string, any>>({});
  const [editedEventDetails, setEditedEventDetails] = useState<Record<string, any>>({});
  const [editedTourDetails, setEditedTourDetails] = useState<Record<string, any>>({});
  const [editedEventMedia, setEditedEventMedia] = useState<Array<{ media_id?: number; media_type: string; media_url: string; media_title?: string; media_description?: string; media_order?: number; is_featured?: boolean; is_public?: boolean; file?: File }>>([]);
  const [editedTourMedia, setEditedTourMedia] = useState<Array<{ media_id?: number; media_type: string; media_url: string; alt_text?: string; media_order?: number; file?: File }>>([]);
  const [tourHeroImage, setTourHeroImage] = useState<string | null>(null);
  const [tourHeroImageFile, setTourHeroImageFile] = useState<File | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [tourTags, setTourTags] = useState<Array<{ tag_id: number; key: string; name: string; name_en: string; color: string; icon: string }>>([]);
  const [tourTagTranslations, setTourTagTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  const [tourItineraryDays, setTourItineraryDays] = useState<Array<{ day_id: number; tour_id: number; day_number: number; day_title: string }>>([]);
  const [tourTicketTypes, setTourTicketTypes] = useState<Array<{ ticket_type_id: number; tour_id: number; ticket_name: string; description?: string | null; price: number; currency: string; age_min?: number | null; age_max?: number | null; includes_features?: string[] | null; max_quantity_per_booking?: number | null; is_active?: boolean | null; tax_percentage?: number | null }>>([]);
  const [tourItineraryTranslations, setTourItineraryTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  const [tourItineraryItems, setTourItineraryItems] = useState<Array<{ item_id: number; tour_id: number; day_id: number; start_time: string | null; end_time: string | null; title: string; description?: string | null }>>([]);
  const [tourItineraryItemTranslations, setTourItineraryItemTranslations] = useState<Record<number, Record<LanguageCode, { title: string; description: string }>>>({});
  const [tourScheduleType, setTourScheduleType] = useState<string>('always_available');
  const [tourScheduleConfig, setTourScheduleConfig] = useState<any>({});
  const [tourBookingCutoffHours, setTourBookingCutoffHours] = useState<number>(24);
  const [tourMaxAdvanceBookingDays, setTourMaxAdvanceBookingDays] = useState<number>(90);
  const [availableTags, setAvailableTags] = useState<Array<{ tag_id: number; tag_key: string; tag_name: string; tag_color: string; tag_icon: string }>>([]);
  const [tagDialog, setTagDialog] = useState<{ open: boolean }>({ open: false });
  const [loadingTags, setLoadingTags] = useState(false);
  // Event sessions and ticket types
  const [eventSessions, setEventSessions] = useState<Array<{ session_id: number; event_id: number; session_name: string; description?: string | null; session_date: string; start_time: string; end_time?: string | null; max_capacity?: number | null; current_bookings?: number | null; is_active?: boolean | null }>>([]);
  const [eventSessionTranslations, setEventSessionTranslations] = useState<Record<number | string, Record<LanguageCode, { session_name: string; description: string }>>>({});
  const [eventTicketTypes, setEventTicketTypes] = useState<Array<{ ticket_type_id: number; event_id: number; ticket_name: string; description?: string | null; price: number; currency: string; is_active?: boolean | null }>>([]);
  const [ticketTypeMasters, setTicketTypeMasters] = useState<MasterData[]>([]);
  const [ticketTypeMasterTranslations, setTicketTypeMasterTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  const [eventFeatures, setEventFeatures] = useState<Array<{ feature_id?: number; event_id: number; feature_name: string; feature_description?: string | null; feature_icon?: string | null; is_included: boolean; additional_cost: number; is_highlighted: boolean }>>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Array<{ amenity_id: number; name: string; icon: string | null; user_id: number | null }>>([]);
  const [amenityTranslations, setAmenityTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  const [loadingAmenities, setLoadingAmenities] = useState(false);
  const [customAmenityDialog, setCustomAmenityDialog] = useState<{ open: boolean }>({ open: false });
  const [amenitySelectionDialog, setAmenitySelectionDialog] = useState<{ open: boolean }>({ open: false });
  const [newAmenityData, setNewAmenityData] = useState<{ name: string; icon: string; translations: Record<LanguageCode, string> }>({
    name: '',
    icon: 'amenity',
    translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
  });
  const [creatingAmenity, setCreatingAmenity] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: (() => void) | null }>({
    open: false,
    message: '',
    onConfirm: null,
  });
  //Test
  const [mediaDialog, setMediaDialog] = useState<{ open: boolean; media?: any; index?: number }>({ open: false });
  const [newMediaData, setNewMediaData] = useState<{ media_type: string; media_url: string; media_title: string; media_description: string; media_order: number; is_featured: boolean; is_public: boolean; file?: File }>({
    media_type: 'media',
    media_url: '',
    media_title: '',
    media_description: '',
    media_order: 0,
    is_featured: false,
    is_public: true,
  });
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState<{ open: boolean; key: string; label: string }>({ open: false, key: '', label: '' });
  const [newItemValue, setNewItemValue] = useState(''); // For Local Guide and other non-event array fields
  const [newEventItemValues, setNewEventItemValues] = useState<Record<string, string>>({
    highlights: '',
    what_to_bring: '',
    prohibited_items: '',
  });
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
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [rejectionRecord, setRejectionRecord] = useState<{ record: VerificationRecord | any; type: 'user' | 'table' } | null>(null);

  // Fetch verification records (for User Verification tab)
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

  // Fetch table data for Event, Tour, Hotel, Food tabs
  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    setError('');
    try {
      let query = supabase.from(tableName).select('*');
      
      // Apply search filter if searchTerm exists
      if (searchTerm) {
        // Search in common fields - adjust based on actual table structure
        if (tableName === 'heritage_event') {
          query = query.or(`event_name.ilike.%${searchTerm}%,event_key.ilike.%${searchTerm}%`);
        } else if (tableName === 'heritage_tour') {
          query = query.or(`tour_name.ilike.%${searchTerm}%,tour_key.ilike.%${searchTerm}%`);
        } else if (tableName === 'heritage_hotel') {
          query = query.or(`hotel_name.ilike.%${searchTerm}%,hotel_key.ilike.%${searchTerm}%`);
        } else if (tableName === 'heritage_food') {
          query = query.or(`food_name.ilike.%${searchTerm}%,food_key.ilike.%${searchTerm}%`);
        } else if (tableName === 'heritage_artwork') {
          query = query.or(`artwork_name.ilike.%${searchTerm}%`);
        }
      }

      // Apply date filter if dateFilter exists
      // Use updated_at for tour, event, hotel, food, artwork tables
      if (dateFilter) {
        const dateColumn = ['heritage_tour', 'heritage_event', 'heritage_hotel', 'heritage_food', 'heritage_artwork'].includes(tableName)
          ? 'updated_at'
          : 'created_at';
        query = query.gte(dateColumn, `${dateFilter}T00:00:00`).lte(dateColumn, `${dateFilter}T23:59:59`);
      }

      // Apply status filter if statusFilter is not 'All'
      if (statusFilter !== 'All') {
        // For artwork table, use is_active instead of status
        if (tableName === 'heritage_artwork') {
          const isActive = statusFilter === 'published' ? true : false;
          query = query.eq('is_active', isActive);
        } else {
          // For other table data, status values are lowercase: 'draft' or 'published'
          const statusValue = statusFilter.toLowerCase();
          query = query.eq('status', statusValue);
        }
      }

      // Use updated_at for ordering tour, event, hotel, food, artwork tables
      const orderColumn = ['heritage_tour', 'heritage_event', 'heritage_hotel', 'heritage_food', 'heritage_artwork'].includes(tableName)
        ? 'updated_at'
        : 'created_at';
      const { data, error: fetchError } = await query.order(orderColumn, { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setTableData(data || []);
    } catch (err: any) {
      setError(err.message || `Failed to fetch ${tableName} data`);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Reset filters when tab changes
  useEffect(() => {
    setPage(1);
    setSearchTerm('');
    setDateFilter(getCurrentDate());
    // Set appropriate default status based on tab
    if (currentTab === 'user') {
      setEntityFilter('All');
      setStatusFilter('Pending');
    } else if (currentTab === 'product') {
      setStatusFilter('published'); // Default to 'published' (active) for Product tab
    } else {
      setStatusFilter('draft'); // Default to 'draft' for Event, Tour, Hotel, Food tabs
    }
  }, [currentTab]);

  // Fetch data based on current tab
  useEffect(() => {
    if (currentTab === 'user') {
      fetchRecords();
    } else {
      const tabConfig = TAB_CONFIG.find(tab => tab.key === currentTab);
      if (tabConfig?.tableName) {
        fetchTableData(tabConfig.tableName);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab, entityFilter, statusFilter, dateFilter, searchTerm]);

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

  const handleReject = (record: VerificationRecord) => {
    setRejectionRecord({ record, type: 'user' });
    setRejectionDialogOpen(true);
  };

  const handleRejectTableRecord = (record: any) => {
    setRejectionRecord({ record, type: 'table' });
    setRejectionDialogOpen(true);
  };

  const handleConfirmRejection = async (rejectionReason: string) => {
    if (!rejectionRecord) return;

    const { record, type } = rejectionRecord;
    
    if (type === 'user') {
      const userRecord = record as VerificationRecord;
      setActionLoading(userRecord.id);
      try {
        const result = await VerificationService.rejectEntity(
          userRecord.entityType,
          userRecord.id,
          rejectionReason
        );
        if (result.success) {
          fetchRecords();
          setRejectionDialogOpen(false);
          setRejectionRecord(null);
        } else {
          setError(result.error || 'Failed to reject');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to reject');
      } finally {
        setActionLoading(null);
      }
    } else {
      // Handle table record rejection (event, tour, hotel, food, artwork)
      const recordId = record.event_id || record.tour_id || record.hotel_id || record.food_id || record.artwork_id || record.id;
      const tabConfig = TAB_CONFIG.find(tab => tab.key === currentTab);
      if (!tabConfig?.tableName || !recordId) return;

      // Type guard: ensure currentTab is a table entity type (not 'user')
      if (currentTab === 'user') {
        setError('Invalid tab for table entity rejection');
        return;
      }

      // Narrow the type after the guard
      const tableEntityTab = currentTab as Exclude<VerificationTab, 'user'>;
      
      setActionLoading(recordId);
      try {
        const result = await VerificationService.rejectTableEntity(
          tableEntityTab,
          recordId,
          rejectionReason
        );
        if (result.success) {
          await fetchTableData(tabConfig.tableName);
          setRejectionDialogOpen(false);
          setRejectionRecord(null);
        } else {
          setError(result.error || 'Failed to reject');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to reject');
      } finally {
        setActionLoading(null);
      }
    }
  };

  // Handle publishing event/tour/hotel/food/product (set status to 'published' or toggle is_active for product)
  const handlePublishTableRecord = async (record: any) => {
    const recordId = record.event_id || record.tour_id || record.hotel_id || record.food_id || record.artwork_id || record.id;
    const tabConfig = TAB_CONFIG.find(tab => tab.key === currentTab);
    if (!tabConfig?.tableName || !recordId) return;

    // Determine the ID column name based on table
    let idColumn = '';
    if (currentTab === 'event') idColumn = 'event_id';
    else if (currentTab === 'tour') idColumn = 'tour_id';
    else if (currentTab === 'hotel') idColumn = 'hotel_id';
    else if (currentTab === 'food') idColumn = 'food_id';
    else if (currentTab === 'product') idColumn = 'artwork_id';
    else return;

    setActionLoading(recordId);
    try {
      // For product (artwork), toggle is_active; for others, set status to 'published'
      const updateData = currentTab === 'product' 
        ? { is_active: !record.is_active }
        : { status: 'published' };

      const { error } = await supabase
        .from(tabConfig.tableName)
        .update(updateData)
        .eq(idColumn, recordId);

      if (error) {
        throw error;
      }

      // Send push notification for approval (only if status changed to published/active)
      if ((currentTab === 'product' && !record.is_active) || (currentTab !== 'product' && record.status !== 'published')) {
        try {
          await VerificationService.approveTableEntity(currentTab as 'event' | 'tour' | 'hotel' | 'food' | 'product', recordId);
        } catch (notifError) {
          console.error('Error sending approval notification:', notifError);
          // Don't fail the publish if notification fails
        }
      }

      // Refresh table data
      await fetchTableData(tabConfig.tableName);
    } catch (err: any) {
      setError(err.message || 'Failed to update');
    } finally {
      setActionLoading(null);
    }
  };

  // Filter and sort verification records (for User Verification tab)
  const filteredData = useMemo(() => {
    if (currentTab !== 'user') return [];
    
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
  }, [records, sortBy, sortOrder, currentTab]);

  // Filter and sort table data (for Event, Tour, Hotel, Food tabs)
  const filteredTableData = useMemo(() => {
    if (currentTab === 'user') return [];
    
    let filtered = [...tableData];
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'name':
          // Try common name fields
          aValue = (a.event_name || a.tour_name || a.hotel_name || a.food_name || a.artwork_name || a.name || '').toLowerCase();
          bValue = (b.event_name || b.tour_name || b.hotel_name || b.food_name || b.artwork_name || b.name || '').toLowerCase();
          break;
        case 'status':
          aValue = (a.status || '').toLowerCase();
          bValue = (b.status || '').toLowerCase();
          break;
        case 'submittedOn':
        case 'createdAt':
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [tableData, sortBy, sortOrder, currentTab]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    const data = currentTab === 'user' ? filteredData : filteredTableData;
    return data.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredData, filteredTableData, page, currentTab]);

  const totalRecords = useMemo(() => {
    return currentTab === 'user' ? filteredData.length : filteredTableData.length;
  }, [filteredData, filteredTableData, currentTab]);

  const handleClearFilters = () => {
    setEntityFilter('All');
    // Set appropriate default status based on current tab
    if (currentTab === 'user') {
      setStatusFilter('Pending');
    } else if (currentTab === 'product') {
      setStatusFilter('published'); // Default to 'published' (active) for Product tab
    } else {
      setStatusFilter('draft');
    }
    setDateFilter(getCurrentDate());
    setSearchTerm('');
    setPage(1);
    // Data will be refetched by useEffect
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
      const dataToExport = currentTab === 'user' ? filteredData : filteredTableData;
      
      // Prepare data for export with proper date formatting for Excel
      const exportData = dataToExport.map((record: any) => {
        if (currentTab === 'user') {
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
        } else {
          // Export for Event, Tour, Hotel, Food, Product tables
          const nameField = record.event_name || record.tour_name || record.hotel_name || record.food_name || record.artwork_name || record.name || '';
          const keyField = record.event_key || record.tour_key || record.hotel_key || record.food_key || '';
          let formattedDate = '';
          
          if (record.created_at) {
            try {
              const date = new Date(record.created_at);
              if (!isNaN(date.getTime())) {
                formattedDate = format(date, 'MM/dd/yyyy');
              }
            } catch (error) {
              formattedDate = String(record.created_at || '');
            }
          }
          
          return {
            Name: nameField,
            Key: keyField,
            Status: record.status || '',
            'Created At': formattedDate,
          };
        }
      });

      // Create CSV content (Excel can open CSV files)
      if (exportData.length === 0) {
        setExportLoading(false);
        return;
      }
      
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = row?.[header as keyof typeof row];
              if (value === null || value === undefined || value === '') return '';
              const stringValue = String(value);
              // For dates, always quote them to ensure Excel recognizes them
              if (header === 'Submitted On' || header === 'Created At') {
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

  // Fetch event details using RPC function
  const fetchEventDetails = async (eventId: number) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('heritage_get_event_details', {
        p_event_id: eventId,
        p_language_code: 'EN',
        p_user_id: null,
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  };

  // Load event translations from database
  const loadEventTranslations = async (eventId: number) => {
    try {
      const { data: translationsData, error } = await supabase
        .from('heritage_eventtranslation')
        .select('*')
        .eq('event_id', eventId);

      if (error) {
        console.error('Error loading event translations:', error);
        return {};
      }

      const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
      EVENT_TRANSLATABLE_FIELDS.forEach(field => {
        loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
      });

      if (translationsData && Array.isArray(translationsData)) {
        translationsData.forEach((trans: any) => {
          const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
          if (langCode && LANGUAGES.some(l => l.code === langCode)) {
            EVENT_TRANSLATABLE_FIELDS.forEach(field => {
              if (trans[field] !== null && trans[field] !== undefined) {
                // Handle array fields (highlights, what_to_bring, prohibited_items)
                if (Array.isArray(trans[field])) {
                  loadedTranslations[field][langCode] = trans[field].join(', ');
                } else {
                  loadedTranslations[field][langCode] = String(trans[field] || '');
                }
              }
            });
          }
        });
      }

      return loadedTranslations;
    } catch (error) {
      console.error('Error loading event translations:', error);
      return {};
    }
  };

  // Load event sessions from database
  const loadEventSessions = async (eventId: number) => {
    try {
      const { data: sessionsData, error } = await supabase
        .from('heritage_eventsession')
        .select('*')
        .eq('event_id', eventId)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Error loading event sessions:', error);
        setEventSessions([]);
        setEventSessionTranslations({});
        return;
      }

      const sessions = sessionsData || [];
      setEventSessions(sessions);

      // Load session translations
      const sessionTranslations: Record<number, Record<LanguageCode, { session_name: string; description: string }>> = {};
      
      for (const session of sessions) {
        if (session.session_id) {
          sessionTranslations[session.session_id] = {
            en: { session_name: session.session_name || '', description: session.description || '' },
            hi: { session_name: '', description: '' },
            gu: { session_name: '', description: '' },
            ja: { session_name: '', description: '' },
            es: { session_name: '', description: '' },
            fr: { session_name: '', description: '' },
          };

          // Load translations from database
          try {
            const { data: transData, error: transError } = await supabase
              .from('heritage_eventsessiontranslation')
              .select('*')
              .eq('session_id', session.session_id);

            if (!transError && transData) {
              transData.forEach((trans: any) => {
                const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                  sessionTranslations[session.session_id][langCode] = {
                    session_name: String(trans.session_name || ''),
                    description: String(trans.description || ''),
                  };
                }
              });
            }
          } catch (err) {
            console.error(`Error loading translations for session ${session.session_id}:`, err);
          }
        }
      }

      setEventSessionTranslations(sessionTranslations);
    } catch (error) {
      console.error('Error loading event sessions:', error);
      setEventSessions([]);
      setEventSessionTranslations({});
    }
  };

  // Load ticket type masters from heritage_masterdata
  const loadTicketTypeMasters = async () => {
    try {
      // Load masters (base data)
      const { data: masterData, error: masterError } = await supabase
        .from('heritage_masterdata')
        .select('master_id, category, code, display_order, is_active, metadata')
        .eq('category', 'ticket_type')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (masterError) {
        console.error('Error loading ticket type masters:', masterError);
        setTicketTypeMasters([]);
        setTicketTypeMasterTranslations({});
        return;
      }

      if (!masterData || masterData.length === 0) {
        setTicketTypeMasters([]);
        setTicketTypeMasterTranslations({});
        return;
      }

      const masterIds = masterData.map((m: any) => m.master_id);
      const translationsMap: Record<number, Record<LanguageCode, string>> = {};

      // Load translations for all languages
      for (const lang of LANGUAGES) {
        const langCode = lang.code.toUpperCase();
        const { data: translations, error: transError } = await supabase
          .from('heritage_masterdatatranslation')
          .select('master_id, display_name')
          .in('master_id', masterIds)
          .eq('language_code', langCode);

        if (!transError && translations) {
          translations.forEach((trans: any) => {
            if (!translationsMap[trans.master_id]) {
              translationsMap[trans.master_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            }
            translationsMap[trans.master_id][lang.code] = trans.display_name || '';
          });
        }
      }

      // Combine with English display names for the list
      const mastersWithNames = masterData.map((m: any) => {
        const trans = translationsMap[m.master_id];
        return {
          master_id: m.master_id,
          category: m.category,
          code: m.code,
          display_name: trans?.en || m.code,
          description: '',
          display_order: m.display_order,
          is_active: m.is_active,
          metadata: m.metadata || {},
        };
      });

      setTicketTypeMasters(mastersWithNames);
      setTicketTypeMasterTranslations(translationsMap);
    } catch (error) {
      console.error('Error loading ticket type masters:', error);
      setTicketTypeMasters([]);
      setTicketTypeMasterTranslations({});
    }
  };

  // Load event ticket types from database
  const loadEventTicketTypes = async (eventId: number) => {
    try {
      const { data: ticketTypesData, error } = await supabase
        .from('heritage_eventtickettype')
        .select('*')
        .eq('event_id', eventId)
        .order('ticket_type_id', { ascending: true });

      if (error) {
        console.error('Error loading event ticket types:', error);
        setEventTicketTypes([]);
        return;
      }

      const ticketTypes = ticketTypesData || [];
      setEventTicketTypes(ticketTypes);
    } catch (error) {
      console.error('Error loading event ticket types:', error);
      setEventTicketTypes([]);
    }
  };

  // Load tour ticket types from database
  const loadTourTicketTypes = async (tourId: number) => {
    try {
      const { data: ticketTypesData, error } = await supabase
        .from('heritage_tourtickettype')
        .select('*')
        .eq('tour_id', tourId)
        .order('ticket_type_id', { ascending: true });

      if (error) {
        console.error('Error loading tour ticket types:', error);
        setTourTicketTypes([]);
        return;
      }

      const ticketTypes = ticketTypesData || [];
      setTourTicketTypes(ticketTypes);
    } catch (error) {
      console.error('Error loading tour ticket types:', error);
      setTourTicketTypes([]);
    }
  };

  // Load available amenities from database (filtered by user_id null or created_by = login user_id)
  // Also loads translations for each amenity
  const loadAvailableAmenities = async () => {
    try {
      setLoadingAmenities(true);
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id ? parseInt(user.id) : null;

      let query = supabase
        .from('heritage_amenity')
        .select('amenity_id, name, icon, user_id')
        .order('name', { ascending: true });

      // Filter: user_id is null OR user_id equals current user_id
      if (userId) {
        query = query.or(`user_id.is.null,user_id.eq.${userId}`);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error loading amenities:', error);
        setAvailableAmenities([]);
        setAmenityTranslations({});
        return;
      }

      const amenities = data || [];
      setAvailableAmenities(amenities);

      // Load translations for all amenities
      if (amenities.length > 0) {
        const amenityIds = amenities.map(a => a.amenity_id);
        const { data: translationsData, error: transError } = await supabase
          .from('heritage_amenitytranslation')
          .select('*')
          .in('amenity_id', amenityIds);

        if (transError) {
          console.error('Error loading amenity translations:', transError);
          setAmenityTranslations({});
        } else {
          const translations: Record<number, Record<LanguageCode, string>> = {};
          
          // Initialize translations for all amenities
          amenities.forEach(amenity => {
            translations[amenity.amenity_id] = {
              en: amenity.name || '',
              hi: '',
              gu: '',
              ja: '',
              es: '',
              fr: '',
            };
          });

          // Populate translations from database
          if (translationsData && Array.isArray(translationsData)) {
            translationsData.forEach((trans: any) => {
              const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
              if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.amenity_id) {
                if (!translations[trans.amenity_id]) {
                  translations[trans.amenity_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                }
                translations[trans.amenity_id][langCode] = String(trans.name || '');
              }
            });
      }

          setAmenityTranslations(translations);
        }
      } else {
        setAmenityTranslations({});
      }
    } catch (error) {
      console.error('Error loading amenities:', error);
      setAvailableAmenities([]);
      setAmenityTranslations({});
    } finally {
      setLoadingAmenities(false);
    }
  };

  // Insert amenity with translations
  const insertAmenityWithTranslations = async (
    name: string,
    icon: string | null,
    translations: Record<LanguageCode, string>,
    userId?: number | null
  ) => {
    try {
      // Insert the amenity
      const amenityData: any = {
        name: name,
        icon: icon || null,
        user_id: userId || null,
      };

      const { data: newAmenity, error: insertError } = await supabase
        .from('heritage_amenity')
        .insert(amenityData)
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to insert amenity: ${insertError.message}`);
      }

      if (!newAmenity || !newAmenity.amenity_id) {
        throw new Error('Failed to get amenity ID after insert');
      }

      // Insert translations for all languages
      const translationPayloads: any[] = [];
      LANGUAGES.forEach(lang => {
        const langCode = lang.code.toUpperCase();
        const translatedName = translations[lang.code]?.trim();
        if (translatedName) {
          translationPayloads.push({
            amenity_id: newAmenity.amenity_id,
            language_code: langCode,
            name: translatedName,
          });
        }
      });

      if (translationPayloads.length > 0) {
        const { error: transError } = await supabase
          .from('heritage_amenitytranslation')
          .insert(translationPayloads);

        if (transError) {
          console.error('Error inserting amenity translations:', transError);
          // Don't throw - amenity was created, translations can be added later
        }
      }

      // Reload amenities to include the new one
      await loadAvailableAmenities();

      return { success: true, amenity: newAmenity };
    } catch (error: any) {
      console.error('Error inserting amenity with translations:', error);
      return { success: false, error: error.message || 'Failed to insert amenity' };
    }
  };

  // Load event features from database
  const loadEventFeatures = async (eventId: number) => {
    try {
      const { data: featuresData, error } = await supabase
        .from('heritage_eventfeature')
        .select('*')
        .eq('event_id', eventId)
        .order('is_highlighted', { ascending: false })
        .order('feature_name', { ascending: true });

      if (error) {
        console.error('Error loading event features:', error);
        setEventFeatures([]);
        return;
      }

      const features = featuresData || [];
      // Deduplicate features based on feature_name only (case-insensitive)
      const uniqueFeatures = new Map<string, any>();
      features.forEach((f: any) => {
        const normalizedName = ((f.feature_name || '') + '').toLowerCase().trim();
        // Keep the first occurrence (prefer one with feature_id if available)
        if (!uniqueFeatures.has(normalizedName) || (f.feature_id && !uniqueFeatures.get(normalizedName).feature_id)) {
          uniqueFeatures.set(normalizedName, {
            feature_id: f.feature_id,
            event_id: f.event_id,
            feature_name: (f.feature_name || '').trim(),
            feature_description: f.feature_description || null,
            feature_icon: (f.feature_icon || 'amenity').trim(),
            is_included: f.is_included !== false,
            additional_cost: f.additional_cost || 0,
            is_highlighted: f.is_highlighted || false,
          });
        }
      });
      setEventFeatures(Array.from(uniqueFeatures.values()));
    } catch (error) {
      console.error('Error loading event features:', error);
      setEventFeatures([]);
    }
  };

  // Fetch tour details using RPC function
  const fetchTourDetails = async (tourId: number) => {
    try {
      const { data, error: rpcError } = await supabase.rpc('heritage_get_tour_details', {
        p_tour_id: tourId,
        p_language_code: 'EN',
      });

      if (rpcError) {
        throw rpcError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching tour details:', error);
      throw error;
    }
  };

  // Load tour translations from database
  const loadTourTranslations = async (tourId: number) => {
    try {
      const { data: translationsData, error } = await supabase
        .from('heritage_tourtranslation')
        .select('*')
        .eq('tour_id', tourId);

      if (error) {
        console.error('Error loading tour translations:', error);
        return {};
      }

      const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
      TOUR_TRANSLATABLE_FIELDS.forEach(field => {
        loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
      });

      if (translationsData && Array.isArray(translationsData)) {
        translationsData.forEach((trans: any) => {
          const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
          if (langCode && LANGUAGES.some(l => l.code === langCode)) {
            TOUR_TRANSLATABLE_FIELDS.forEach(field => {
              if (trans[field] !== null && trans[field] !== undefined) {
                loadedTranslations[field][langCode] = String(trans[field] || '');
              }
            });
          }
        });
      }

      return loadedTranslations;
    } catch (error) {
      console.error('Error loading tour translations:', error);
      return {};
    }
  };

  // Fetch all available tags
  const fetchAvailableTags = async () => {
    setLoadingTags(true);
    try {
      const { data, error } = await supabase
        .from('heritage_tourtag')
        .select('*')
        .order('tag_name', { ascending: true });

      if (error) {
        throw error;
      }

      setAvailableTags(data || []);
    } catch (err: any) {
      console.error('Error fetching available tags:', err);
      setError(err.message || 'Failed to fetch available tags');
    } finally {
      setLoadingTags(false);
    }
  };

  const handleViewDetails = async (record: VerificationRecord) => {
    try {
      setSelectedRecord(record);
      setSelectedTableRecord(null);
      setDetailOpen(true);
      setDetailLoading(true);
      setEditMode(false);
      setCurrentLanguageTab('en');
      
      const details = await VerificationService.getUserDetails(record.id, record.entityType);
      setUserDetails(details);
      setEventDetails(null);
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

  // Handle viewing Event/Tour/Hotel/Food details
  const handleViewTableDetails = async (record: any) => {
    try {
      setSelectedTableRecord(record);
      setSelectedRecord(null);
      setDetailOpen(true);
      setDetailLoading(true);
      setEditMode(false);
      setCurrentLanguageTab('en');

      if (currentTab === 'event') {
        const eventId = record.event_id || record.id;
        if (!eventId) {
          throw new Error('Event ID not found');
        }

        // Fetch event details
        const details = await fetchEventDetails(eventId);
        setEventDetails(details);
        setUserDetails(null);

        // Initialize edited event details from the event object
        if (details?.event) {
          const eventData = details.event;
          setEditedEventDetails({
            event_name: eventData.event_name || '',
            short_description: eventData.short_description || '',
            full_description: eventData.full_description || '',
            highlights: Array.isArray(eventData.highlights) ? eventData.highlights : [],
            venue_name: eventData.venue_name || '',
            venue_address: eventData.venue_address || '',
            organizer_name: eventData.organizer_name || '',
            dress_code: eventData.dress_code || '',
            what_to_bring: Array.isArray(eventData.what_to_bring) ? eventData.what_to_bring : [],
            prohibited_items: Array.isArray(eventData.prohibited_items) ? eventData.prohibited_items : [],
            city: eventData.city || '',
            state: eventData.state || '',
            pincode: eventData.pincode || '',
            nearest_metro: eventData.nearest_metro || '',
            nearest_bus_stop: eventData.nearest_bus_stop || '',
          });

          // Load translations
          const loadedTranslations = await loadEventTranslations(eventId);
          
          // Set English values from event data
          EVENT_TRANSLATABLE_FIELDS.forEach(field => {
            if (!loadedTranslations[field]) {
              loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            }
            if (eventData[field] !== null && eventData[field] !== undefined) {
              if (Array.isArray(eventData[field])) {
                loadedTranslations[field].en = eventData[field].join(', ');
              } else {
                loadedTranslations[field].en = String(eventData[field] || '');
              }
            }
          });

          setTranslations(loadedTranslations);
          
          // Load event media - heroes and media are arrays directly, not items arrays
          const allMedia: any[] = [];
          
          // Handle heroes array (can be array directly or have items property)
          if (details.heroes) {
            const heroesArray = Array.isArray(details.heroes) ? details.heroes : (details.heroes.items || []);
            if (Array.isArray(heroesArray) && heroesArray.length > 0) {
              allMedia.push(...heroesArray.map((h: any) => ({ ...h, media_type: h.type || 'hero' })));
            }
          }
          
          // Handle media array (can be array directly or have items property)
          if (details.media) {
            const mediaArray = Array.isArray(details.media) ? details.media : (details.media.items || []);
            if (Array.isArray(mediaArray) && mediaArray.length > 0) {
              allMedia.push(...mediaArray);
            }
          }
          
          // Sort by order
          allMedia.sort((a, b) => (a.order || a.media_order || 0) - (b.order || b.media_order || 0));
          
          // Normalize media data structure
          const normalizedMedia = allMedia.map((m: any) => ({
            media_id: m.media_id,
            media_type: m.type || m.media_type || 'media',
            media_url: m.url || m.media_url || '',
            media_title: m.title || m.media_title || '',
            media_description: m.description || m.media_description || '',
            media_order: m.order || m.media_order || 0,
            is_featured: m.is_featured !== undefined ? m.is_featured : false,
            is_public: m.is_public !== undefined ? m.is_public : true,
          }));
          setEditedEventMedia(normalizedMedia);
          
          // Load event sessions
          await loadEventSessions(eventId);
          
          // Load event ticket types
          await loadEventTicketTypes(eventId);
          
          // Load ticket type masters for dropdown
          await loadTicketTypeMasters();
          
          // Load event features from eventDetails first (from RPC response)
          if (details?.features) {
            const featuresArray = Array.isArray(details.features) ? details.features : (details.features.items || []);
            if (Array.isArray(featuresArray) && featuresArray.length > 0) {
              // Deduplicate features from RPC response by name only
              const uniqueFeaturesMap = new Map<string, any>();
              featuresArray.forEach((f: any) => {
                const normalizedName = ((f.name || f.feature_name || '') + '').toLowerCase().trim();
                // Keep the first occurrence (prefer one with feature_id if available)
                if (!uniqueFeaturesMap.has(normalizedName) || (f.feature_id && !uniqueFeaturesMap.get(normalizedName)?.feature_id)) {
                  uniqueFeaturesMap.set(normalizedName, {
                    feature_id: f.feature_id,
                    event_id: eventId,
                    feature_name: ((f.name || f.feature_name || '') + '').trim(),
                    feature_description: f.description || f.feature_description || null,
                    feature_icon: ((f.icon || f.feature_icon || 'amenity') + '').trim(),
                    is_included: f.is_included !== false,
                    additional_cost: f.additional_cost || 0,
                    is_highlighted: f.is_highlighted || false,
                  });
                }
              });
              setEventFeatures(Array.from(uniqueFeaturesMap.values()));
            } else {
              // If no features in RPC response, load from database
              await loadEventFeatures(eventId);
            }
          } else {
            // If no features in RPC response, load from database
            await loadEventFeatures(eventId);
          }
          
          // Load available amenities
          await loadAvailableAmenities();
        } else {
          setEditedEventDetails({});
          setTranslations({});
          setEditedEventMedia([]);
          setEventSessions([]);
          setEventSessionTranslations({});
          setEventTicketTypes([]);
          setEventFeatures([]);
        }
      } else if (currentTab === 'hotel') {
        const hotelId = record.hotel_id || record.id;
        if (!hotelId) {
          throw new Error('Hotel ID not found');
        }

        // Open hotel dialog
        setSelectedHotelId(hotelId);
        setHotelDialogOpen(true);
        setDetailOpen(false);
        setDetailLoading(false);
        return;
      } else if (currentTab === 'food') {
        const foodId = record.food_id || record.id;
        if (!foodId) {
          throw new Error('Food ID not found');
        }

        // Open food dialog
        setSelectedFoodId(foodId);
        setFoodDialogOpen(true);
        setDetailOpen(false);
        setDetailLoading(false);
        return;
      } else if (currentTab === 'product') {
        const artworkId = record.artwork_id || record.id;
        if (!artworkId) {
          throw new Error('Artwork ID not found');
        }

        // Open artwork dialog
        setSelectedArtworkId(artworkId);
        setArtworkDialogOpen(true);
        setDetailOpen(false);
        setDetailLoading(false);
        return;
      } else if (currentTab === 'tour') {
        const tourId = record.tour_id || record.id;
        if (!tourId) {
          throw new Error('Tour ID not found');
        }

        // Fetch tour details
        const details = await fetchTourDetails(tourId);
        setTourDetails(details);
        setEventDetails(null);
        setUserDetails(null);

        // Initialize edited tour details from the tour object
        if (details?.tour) {
          const tourData = details.tour;
          setEditedTourDetails({
            tour_name: tourData.tour_name || '',
            short_description: tourData.short_description || '',
            full_description: tourData.full_description || '',
            city: tourData.city || '',
            state: tourData.state || '',
            area_or_zone: tourData.area_or_zone || '',
            route_name: tourData.route_name || '',
            meeting_point: tourData.meeting_point || '',
          });

          // Initialize schedule data
          setTourScheduleType(tourData.tour_schedule_type || 'always_available');
          setTourScheduleConfig(tourData.schedule_config || {});
          setTourBookingCutoffHours(tourData.booking_cutoff_hours ?? 24);
          setTourMaxAdvanceBookingDays(tourData.max_advance_booking_days ?? 90);

          // Load translations
          const loadedTranslations = await loadTourTranslations(tourId);
          
          // Set English values from tour data
          TOUR_TRANSLATABLE_FIELDS.forEach(field => {
            if (!loadedTranslations[field]) {
              loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            }
            if (tourData[field] !== null && tourData[field] !== undefined) {
              loadedTranslations[field].en = String(tourData[field] || '');
            }
          });

          setTranslations(loadedTranslations);
          
          // Load tour media from heritage_tourmedia table
          try {
            const { data: tourMediaData, error: tourMediaError } = await supabase
              .from('heritage_tourmedia')
              .select('*')
              .eq('tour_id', tourId)
              .order('media_order', { ascending: true });
            
            if (!tourMediaError && tourMediaData) {
              // Separate hero and gallery
              const heroMedia = tourMediaData.find((m: any) => m.media_type === 'hero');
              const galleryMedia = tourMediaData.filter((m: any) => m.media_type === 'gallery' || !m.media_type);
              
              // Set hero image
              if (heroMedia) {
                setTourHeroImage(heroMedia.media_url || null);
              } else {
                setTourHeroImage(null);
              }
              
              // Set gallery media
              const normalizedMedia = galleryMedia.map((m: any) => ({
            media_id: m.media_id,
                media_type: m.media_type || 'gallery',
                media_url: m.media_url || '',
            alt_text: m.alt_text || '',
                media_order: m.media_order || 0,
          }));
          setEditedTourMedia(normalizedMedia);
            } else {
              setTourHeroImage(null);
              setEditedTourMedia([]);
            }
          } catch (err) {
            console.error('Error loading tour media:', err);
            setTourHeroImage(null);
            setEditedTourMedia([]);
          }
          
          // Load itinerary days
          try {
            const { data: itineraryData, error: itineraryError } = await supabase
              .from('heritage_touritineraryday')
              .select('*')
              .eq('tour_id', tourId)
              .order('day_number', { ascending: true });
            
            if (!itineraryError && itineraryData) {
              setTourItineraryDays(itineraryData);
              
              // Load itinerary translations
              const itineraryTranslations: Record<number, Record<LanguageCode, string>> = {};
              for (const day of itineraryData) {
                if (day.day_id) {
                  itineraryTranslations[day.day_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                  // Set English title from main table
                  itineraryTranslations[day.day_id].en = day.day_title || '';
                  
                  // Load translations from database
                  try {
                    const { data: dayTransData, error: dayTransError } = await supabase
                      .from('heritage_touritinerarydaytranslation')
                      .select('*')
                      .eq('day_id', day.day_id);
                    
                    if (!dayTransError && dayTransData) {
                      dayTransData.forEach((trans: any) => {
                        const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                        if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.day_title) {
                          itineraryTranslations[day.day_id][langCode] = String(trans.day_title || '');
                        }
                      });
                    }
                  } catch (err) {
                    console.error(`Error loading translations for itinerary day ${day.day_id}:`, err);
                  }
                }
              }
              setTourItineraryTranslations(itineraryTranslations);
              
              // Load itinerary items for all days
              try {
                const { data: itemsData, error: itemsError } = await supabase
                  .from('heritage_touritineraryitem')
                  .select('*')
                  .eq('tour_id', tourId)
                  .order('day_id', { ascending: true })
                  .order('start_time', { ascending: true });
                
                if (!itemsError && itemsData) {
                  setTourItineraryItems(itemsData);
                  
                  // Load translations for all items
                  const itemTranslations: Record<number, Record<LanguageCode, { title: string; description: string }>> = {};
                  for (const item of itemsData) {
                    if (item.item_id) {
                      itemTranslations[item.item_id] = {
                        en: { title: item.title || '', description: item.description || '' },
                        hi: { title: '', description: '' },
                        gu: { title: '', description: '' },
                        ja: { title: '', description: '' },
                        es: { title: '', description: '' },
                        fr: { title: '', description: '' },
                      };
                      
                      // Load translations from database
                      try {
                        const { data: itemTransData, error: itemTransError } = await supabase
                          .from('heritage_touritineraryitemtranslation')
                          .select('*')
                          .eq('item_id', item.item_id);
                        
                        if (!itemTransError && itemTransData) {
                          itemTransData.forEach((trans: any) => {
                            const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                            if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                              itemTranslations[item.item_id][langCode] = {
                                title: String(trans.title || ''),
                                description: String(trans.description || ''),
                              };
                            }
                          });
                        }
                      } catch (err) {
                        console.error(`Error loading translations for itinerary item ${item.item_id}:`, err);
                      }
                    }
                  }
                  setTourItineraryItemTranslations(itemTranslations);
                } else {
                  setTourItineraryItems([]);
                  setTourItineraryItemTranslations({});
                }
              } catch (err) {
                console.error('Error loading itinerary items:', err);
                setTourItineraryItems([]);
                setTourItineraryItemTranslations({});
              }
            } else {
              setTourItineraryDays([]);
              setTourItineraryTranslations({});
              setTourItineraryItems([]);
              setTourItineraryItemTranslations({});
            }
          } catch (err) {
            console.error('Error loading itinerary:', err);
            setTourItineraryDays([]);
            setTourItineraryTranslations({});
            setTourItineraryItems([]);
            setTourItineraryItemTranslations({});
          }
          
          // Load tour ticket types
          await loadTourTicketTypes(tourId);
          
          // Load ticket type masters for dropdown (if not already loaded)
          if (ticketTypeMasters.length === 0) {
            await loadTicketTypeMasters();
          }
          
          // Load tour tags
          const tagsArray = Array.isArray(details.tags) ? details.tags : (details.tags?.items || []);
          setTourTags(tagsArray);
          
          // Load tag translations
          const tagTranslations: Record<number, Record<LanguageCode, string>> = {};
          if (tagsArray.length > 0) {
            for (const tag of tagsArray) {
              if (tag.tag_id) {
                tagTranslations[tag.tag_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                // Set English name
                tagTranslations[tag.tag_id].en = tag.name_en || tag.name || '';
                
                // Load translations from database
                try {
                  const { data: tagTransData, error: tagTransError } = await supabase
                    .from('heritage_tourtagtranslation')
                    .select('*')
                    .eq('tag_id', tag.tag_id);
                  
                  if (!tagTransError && tagTransData) {
                    tagTransData.forEach((trans: any) => {
                      const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                      if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.tag_name) {
                        tagTranslations[tag.tag_id][langCode] = String(trans.tag_name || '');
                      }
                    });
                  }
                } catch (err) {
                  console.error(`Error loading translations for tag ${tag.tag_id}:`, err);
                }
              }
            }
          }
          setTourTagTranslations(tagTranslations);
        } else {
          setEditedTourDetails({});
          setTranslations({});
          setEditedTourMedia([]);
          setTourHeroImage(null);
          setTourTags([]);
          setTourTagTranslations({});
          setTourItineraryDays([]);
          setTourItineraryTranslations({});
          setTourItineraryItems([]);
          setTourItineraryItemTranslations({});
          setTourTicketTypes([]);
          setTourScheduleType('always_available');
          setTourScheduleConfig({});
          setTourBookingCutoffHours(24);
          setTourMaxAdvanceBookingDays(90);
        }
      } else {
        // For Hotel, Food - just show basic info for now
        setEventDetails(null);
        setTourDetails(null);
        setUserDetails(null);
        setEditedEventDetails({});
        setEditedTourDetails({});
        setTranslations({});
        setEditedEventMedia([]);
        setEditedTourMedia([]);
        setTourHeroImage(null);
        setTourItineraryDays([]);
        setTourItineraryTranslations({});
        setTourItineraryItems([]);
        setTourItineraryItemTranslations({});
        setTourScheduleType('always_available');
        setTourScheduleConfig({});
        setTourBookingCutoffHours(24);
        setTourMaxAdvanceBookingDays(90);
      }
    } catch (error: any) {
      console.error('Error loading table details:', error);
      setError(error.message || 'Failed to load details. Please try again.');
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
    if (currentLanguageTab === 'en') {
      setEditedBusinessDetails((prev) => ({ ...prev, [key]: value }));
    }
    
    // Update translation for current language if it's a translatable field
    const translatableFieldsForEntity = getTranslatableFieldsForEntity(selectedRecord?.entityType || '');
    if (translatableFieldsForEntity.includes(key)) {
      if (currentLanguageTab === 'en') {
        setTranslations(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            en: value || '',
          },
        }));
      } else {
        setTranslations(prev => ({
          ...prev,
          [key]: {
            ...prev[key],
            [currentLanguageTab]: value || '',
          },
        }));
      }
      
      // Auto-translate from any language to all others
      if (typeof value === 'string' && value && value.trim()) {
        autoTranslateField(value, key);
      }
    }
  };

  // Auto-translate amenity name to all other languages with debounce
  const autoTranslateAmenityName = async (text: string) => {
    if (!text || !text.trim()) return;
    
    try {
      const timerKey = 'translate_amenity_name';
      // Clear existing timer if user is still typing
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      // Set new timer to translate after user stops typing (1 second delay)
      translationTimerRef.current[timerKey] = setTimeout(async () => {
        const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add('amenity_name'));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text.trim(), lang.code, 'en');
              if (result.success && result.translations && result.translations[lang.code]) {
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setNewAmenityData(prev => ({
                  ...prev,
                  translations: {
                    ...prev.translations,
                    [lang.code]: translatedText,
                  },
                }));
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
              // Continue with other languages even if one fails
            }
          }
        } catch (error) {
          console.error('Error translating amenity name:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete('amenity_name');
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error setting up amenity name translation:', error);
    }
  };

  // Auto-translate a field to all other languages - works from any language
  const autoTranslateField = async (text: string, field: string) => {
    if (!text || !text.trim() || !field) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_${field}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(field));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, sourceLanguage);
              if (result.success && result.translations && result.translations[lang.code]) {
                // Extract the translated text from the result
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setTranslations(prev => ({
                  ...prev,
                  [field]: {
                    ...(prev[field] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                    [sourceLanguage]: text, // Update source language with current text
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

  // Auto-translate itinerary day title - works from any language
  const autoTranslateItineraryDay = async (text: string, dayId: number) => {
    if (!text || !text.trim() || !dayId) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_itinerary_day_${dayId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`itinerary_day_${dayId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, sourceLanguage);
              if (result.success && result.translations && result.translations[lang.code]) {
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setTourItineraryTranslations(prev => ({
                  ...prev,
                  [dayId]: {
                    ...(prev[dayId] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                    [sourceLanguage]: text, // Update source language with current text
                    [lang.code]: translatedText,
                  },
                }));
              } else {
                console.warn(`Translation failed for ${lang.code}:`, result.error);
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(`itinerary_day_${dayId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Auto-translate itinerary item title only - works from any language
  const autoTranslateItineraryItemTitle = async (title: string, itemId: number) => {
    if (!itemId || !title || !title.trim()) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_itinerary_item_title_${itemId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`itinerary_item_title_${itemId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const titleResult = await TranslationService.translate(title, lang.code, sourceLanguage);
              if (titleResult.success && titleResult.translations && titleResult.translations[lang.code]) {
                const translatedTitle = Array.isArray(titleResult.translations[lang.code]) 
                  ? titleResult.translations[lang.code][0] 
                  : String(titleResult.translations[lang.code] || '');
                
                setTourItineraryItemTranslations(prev => ({
                  ...prev,
                  [itemId]: {
                    ...(prev[itemId] || {
                      en: { title: '', description: '' },
                      hi: { title: '', description: '' },
                      gu: { title: '', description: '' },
                      ja: { title: '', description: '' },
                      es: { title: '', description: '' },
                      fr: { title: '', description: '' },
                    }),
                    [sourceLanguage]: {
                      ...(prev[itemId]?.[sourceLanguage] || { title: '', description: '' }),
                      title: title, // Update source language with current text
                    },
                    [lang.code]: {
                      ...(prev[itemId]?.[lang.code] || { title: '', description: '' }),
                      title: translatedTitle,
                    },
                  },
                }));
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(`itinerary_item_title_${itemId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Auto-translate itinerary item description only - works from any language
  const autoTranslateItineraryItemDescription = async (description: string, itemId: number) => {
    if (!itemId || !description || !description.trim()) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_itinerary_item_description_${itemId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`itinerary_item_description_${itemId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const descResult = await TranslationService.translate(description, lang.code, sourceLanguage);
              if (descResult.success && descResult.translations && descResult.translations[lang.code]) {
                const translatedDesc = Array.isArray(descResult.translations[lang.code]) 
                  ? descResult.translations[lang.code][0] 
                  : String(descResult.translations[lang.code] || '');
                
                setTourItineraryItemTranslations(prev => ({
                  ...prev,
                  [itemId]: {
                    ...(prev[itemId] || {
                      en: { title: '', description: '' },
                      hi: { title: '', description: '' },
                      gu: { title: '', description: '' },
                      ja: { title: '', description: '' },
                      es: { title: '', description: '' },
                      fr: { title: '', description: '' },
                    }),
                    [sourceLanguage]: {
                      ...(prev[itemId]?.[sourceLanguage] || { title: '', description: '' }),
                      description: description, // Update source language with current text
                    },
                    [lang.code]: {
                      ...(prev[itemId]?.[lang.code] || { title: '', description: '' }),
                      description: translatedDesc,
                    },
                  },
                }));
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(`itinerary_item_description_${itemId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  // Auto-translate a tag name to all other languages - works from any language
  // Auto-translate session name - works from any language
  const autoTranslateSessionName = async (text: string, sessionId: number | string) => {
    if (!sessionId || !text || !text.trim()) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_session_name_${sessionId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`session_name_${sessionId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, sourceLanguage);
              if (result.success && result.translations && result.translations[lang.code]) {
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setEventSessionTranslations(prev => {
                  const sessionIdKey = typeof sessionId === 'number' ? sessionId : Number(sessionId) || sessionId;
                  const current = prev[sessionIdKey] || {
                    en: { session_name: '', description: '' },
                    hi: { session_name: '', description: '' },
                    gu: { session_name: '', description: '' },
                    ja: { session_name: '', description: '' },
                    es: { session_name: '', description: '' },
                    fr: { session_name: '', description: '' },
                  };
                  
                  return {
                    ...prev,
                    [sessionIdKey]: {
                      ...current,
                      [sourceLanguage]: {
                        ...(current[sourceLanguage] || { session_name: '', description: '' }),
                        session_name: text, // Update source language with current text
                      },
                      [lang.code]: {
                        ...(current[lang.code] || { session_name: '', description: '' }),
                        session_name: translatedText,
                      },
                    },
                  };
                });
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(`session_name_${sessionId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error setting up translation:', error);
    }
  };

  // Auto-translate session description - works from any language
  const autoTranslateSessionDescription = async (text: string, sessionId: number | string) => {
    if (!sessionId || !text || !text.trim()) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_session_description_${sessionId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`session_description_${sessionId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, sourceLanguage);
              if (result.success && result.translations && result.translations[lang.code]) {
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setEventSessionTranslations(prev => {
                  const sessionIdKey = typeof sessionId === 'number' ? sessionId : Number(sessionId) || sessionId;
                  const current = prev[sessionIdKey] || {
                    en: { session_name: '', description: '' },
                    hi: { session_name: '', description: '' },
                    gu: { session_name: '', description: '' },
                    ja: { session_name: '', description: '' },
                    es: { session_name: '', description: '' },
                    fr: { session_name: '', description: '' },
                  };
                  
                  return {
                    ...prev,
                    [sessionIdKey]: {
                      ...current,
                      [sourceLanguage]: {
                        ...(current[sourceLanguage] || { session_name: '', description: '' }),
                        description: text, // Update source language with current text
                      },
                      [lang.code]: {
                        ...(current[lang.code] || { session_name: '', description: '' }),
                        description: translatedText,
                      },
                    },
                  };
                });
              }
            } catch (langError) {
              console.error(`Translation error for ${lang.code}:`, langError);
            }
          }
        } catch (error) {
          console.error('Translation error:', error);
        } finally {
          setTranslatingFields(prev => {
            const next = new Set(prev);
            next.delete(`session_description_${sessionId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error setting up translation:', error);
    }
  };

  const autoTranslateTagName = async (text: string, tagId: number) => {
    if (!text || !text.trim() || !tagId) return;
    
    try {
      const sourceLanguage = currentLanguageTab;
      const timerKey = `translate_tag_${tagId}_${sourceLanguage}`;
      if (translationTimerRef.current[timerKey]) {
        clearTimeout(translationTimerRef.current[timerKey]);
      }

      translationTimerRef.current[timerKey] = setTimeout(async () => {
        // Get all languages except the current one
        const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
        if (targetLanguages.length === 0) return;

        setTranslatingFields(prev => new Set(prev).add(`tag_${tagId}`));
        
        try {
          for (const lang of targetLanguages) {
            try {
              const result = await TranslationService.translate(text, lang.code, sourceLanguage);
              if (result.success && result.translations && result.translations[lang.code]) {
                // Extract the translated text from the result
                const translatedText = Array.isArray(result.translations[lang.code]) 
                  ? result.translations[lang.code][0] 
                  : String(result.translations[lang.code] || '');
                
                setTourTagTranslations(prev => ({
                  ...prev,
                  [tagId]: {
                    ...(prev[tagId] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                    [sourceLanguage]: text, // Update source language with current text
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
            next.delete(`tag_${tagId}`);
            return next;
          });
        }
      }, 1000); // 1 second debounce
    } catch (error) {
      console.error('Error setting up tag translation:', error);
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
    setConfirmDialog({
      open: true,
      message: 'Are you sure you want to delete this document?',
      onConfirm: async () => {
        setConfirmDialog({ open: false, message: '', onConfirm: null });
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
      },
    });
  };

  // Save event changes including translations
  const handleSaveEventChanges = async () => {
    if (!selectedTableRecord || !eventDetails) return;
    
    setSaving(true);
    const eventId = selectedTableRecord.event_id || selectedTableRecord.id;
    
    try {
      // First, update base event fields if changed
      const baseFieldsToUpdate: Record<string, any> = {};
      EVENT_TRANSLATABLE_FIELDS.forEach(field => {
        if (currentLanguageTab === 'en' && editedEventDetails[field] !== undefined) {
          const val = editedEventDetails[field];
          if (['highlights', 'what_to_bring', 'prohibited_items'].includes(field)) {
            // Array fields - ensure they're arrays
            baseFieldsToUpdate[field] = Array.isArray(val) ? val : (typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : []);
          } else {
            // For string fields, save even if empty (to allow clearing values)
            baseFieldsToUpdate[field] = val !== null && val !== undefined ? String(val) : null;
          }
        }
      });
      
      // Also update pincode, nearest_metro, and nearest_bus_stop in main table
      // These should always be saved to the main table when in English tab
      if (currentLanguageTab === 'en') {
        // Pincode (not translatable)
        if (editedEventDetails.pincode !== undefined) {
          baseFieldsToUpdate.pincode = editedEventDetails.pincode !== null && editedEventDetails.pincode !== undefined 
            ? String(editedEventDetails.pincode) 
            : null;
        }
        // nearest_metro and nearest_bus_stop (translatable but also stored in main table)
        // They're already in EVENT_TRANSLATABLE_FIELDS so handled above, but ensure they're saved
        if (editedEventDetails.nearest_metro !== undefined) {
          baseFieldsToUpdate.nearest_metro = editedEventDetails.nearest_metro !== null && editedEventDetails.nearest_metro !== undefined 
            ? String(editedEventDetails.nearest_metro) 
            : null;
        }
        if (editedEventDetails.nearest_bus_stop !== undefined) {
          baseFieldsToUpdate.nearest_bus_stop = editedEventDetails.nearest_bus_stop !== null && editedEventDetails.nearest_bus_stop !== undefined 
            ? String(editedEventDetails.nearest_bus_stop) 
            : null;
        }
      }

      // Update base event record if there are changes
      if (Object.keys(baseFieldsToUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('heritage_event')
          .update(baseFieldsToUpdate)
          .eq('event_id', eventId);

        if (updateError) {
          throw new Error(`Failed to update event: ${updateError.message}`);
        }
      }

      // Save translations for all languages
      const translationPayloads: any[] = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
        const langCode = lang.code.toUpperCase();
        const row: any = {
          event_id: eventId,
          language_code: langCode,
        };
        let hasData = false;

        EVENT_TRANSLATABLE_FIELDS.forEach((field) => {
          const val = translations[field]?.[lang.code];
          if (val && String(val).trim()) {
            // Handle array fields
            if (['highlights', 'what_to_bring', 'prohibited_items'].includes(field)) {
              const arr = String(val).split(',').map(s => s.trim()).filter(Boolean);
              if (arr.length > 0) {
                row[field] = arr;
                hasData = true;
              }
            } else {
              row[field] = String(val).trim();
              hasData = true;
            }
          }
        });

        return hasData ? row : null;
      }).filter(Boolean) as any[];

      // Also save English translations (if they differ from base)
      const enTranslation: any = {
        event_id: eventId,
        language_code: 'EN',
      };
      let enHasData = false;
      EVENT_TRANSLATABLE_FIELDS.forEach((field) => {
        const enVal = translations[field]?.en;
        if (enVal && String(enVal).trim()) {
          if (['highlights', 'what_to_bring', 'prohibited_items'].includes(field)) {
            const arr = String(enVal).split(',').map(s => s.trim()).filter(Boolean);
            if (arr.length > 0) {
              enTranslation[field] = arr;
              enHasData = true;
            }
          } else {
            enTranslation[field] = String(enVal).trim();
            enHasData = true;
          }
        }
      });

      if (enHasData) {
        translationPayloads.push(enTranslation);
      }

      // Upsert all translations
      if (translationPayloads.length > 0) {
        for (const payload of translationPayloads) {
          try {
            const { event_id, language_code, ...fields } = payload;
            const { error: upsertErr } = await supabase
              .from('heritage_eventtranslation')
              .upsert(
                {
                  event_id,
                  language_code,
                  ...fields,
                },
                {
                  onConflict: 'event_id,language_code',
                }
              );

            if (upsertErr) {
              console.error('Error saving event translation row:', upsertErr);
              setError(`Failed to save event translations: ${upsertErr.message}`);
            }
          } catch (rowErr) {
            console.error('Error during event translation upsert:', rowErr);
          }
        }
      }

      // Save event media
      setUploadingMedia(true);
      const folder = `events/${eventId}`;
      
      if (editedEventMedia.length > 0) {
        // First, get current media from database to identify files to delete
        const { data: currentMedia } = await supabase
          .from('heritage_eventmedia')
          .select('media_id, media_url')
          .eq('event_id', eventId);

        const existingMediaIds = editedEventMedia
          .filter(m => m.media_id)
          .map(m => m.media_id);

        // Delete media files from storage that are no longer in the list
        if (currentMedia) {
          const mediaIdsToDelete = currentMedia
            .map((m: any) => m.media_id)
            .filter((id: number) => !existingMediaIds.includes(id));

          if (mediaIdsToDelete.length > 0) {
            // Delete from database
            const { error: deleteError } = await supabase
              .from('heritage_eventmedia')
              .delete()
              .in('media_id', mediaIdsToDelete);

            if (deleteError) {
              console.error('Error deleting removed media:', deleteError);
            }

            // Delete files from storage
            for (const mediaToDelete of currentMedia.filter((m: any) => mediaIdsToDelete.includes(m.media_id))) {
              if (mediaToDelete.media_url) {
                try {
                  await StorageService.deleteFile(mediaToDelete.media_url);
                } catch (deleteFileErr) {
                  console.error('Error deleting file from storage:', deleteFileErr);
                }
              }
            }
          }
        }

        // Upsert all media items
        for (const media of editedEventMedia) {
          try {
            let mediaUrl = media.media_url || '';
            
            // Upload new file if provided
            if (media.file) {
              // If updating existing media and it has a URL (and it's not a blob URL), delete the old file first
              if (media.media_id && media.media_url && !media.media_url.startsWith('blob:')) {
                try {
                  await StorageService.deleteFile(media.media_url);
                } catch (deleteFileErr) {
                  console.error('Error deleting old file:', deleteFileErr);
                }
              }
              
              const uploadResult = await StorageService.uploadFile(media.file, folder);
              
              if (!uploadResult.success || !uploadResult.url) {
                console.error(`Failed to upload media: ${uploadResult.error}`);
                setError(`Failed to upload ${media.file.name}: ${uploadResult.error || 'Unknown error'}`);
                continue;
              }
              
              mediaUrl = uploadResult.url;
              
              // Revoke the blob URL to free memory after upload
              if (media.media_url && media.media_url.startsWith('blob:')) {
                URL.revokeObjectURL(media.media_url);
              }
            }

            const mediaData: any = {
              event_id: eventId,
              media_type: media.media_type || 'media',
              media_url: mediaUrl,
              media_title: media.media_title || null,
              media_description: media.media_description || null,
              media_order: media.media_order || 0,
              is_featured: media.is_featured || false,
              is_public: media.is_public !== false,
            };

            if (media.media_id) {
              // Update existing
              const { error: updateError } = await supabase
                .from('heritage_eventmedia')
                .update(mediaData)
                .eq('media_id', media.media_id);

              if (updateError) {
                console.error('Error updating media:', updateError);
                setError(`Failed to update media: ${updateError.message}`);
              }
            } else {
              // Insert new
              const { error: insertError } = await supabase
                .from('heritage_eventmedia')
                .insert(mediaData);

              if (insertError) {
                console.error('Error inserting media:', insertError);
                setError(`Failed to insert media: ${insertError.message}`);
              }
            }
          } catch (mediaErr) {
            console.error('Error during media upsert:', mediaErr);
          }
        }
      } else {
        // If no media, delete all existing media for this event
        const { data: allMedia } = await supabase
          .from('heritage_eventmedia')
          .select('media_url')
          .eq('event_id', eventId);

        if (allMedia) {
          // Delete files from storage
          for (const media of allMedia) {
            if (media.media_url) {
              try {
                await StorageService.deleteFile(media.media_url);
              } catch (deleteFileErr) {
                console.error('Error deleting file from storage:', deleteFileErr);
              }
            }
          }
        }

        const { error: deleteAllError } = await supabase
          .from('heritage_eventmedia')
          .delete()
          .eq('event_id', eventId);

        if (deleteAllError) {
          console.error('Error deleting all media:', deleteAllError);
        }
      }
      
      setUploadingMedia(false);

      // Save event sessions
      if (eventSessions.length > 0) {
        for (const session of eventSessions) {
          try {
            const sessionData: any = {
              event_id: eventId,
              session_name: session.session_name || '',
              description: session.description || null,
              session_date: session.session_date || '',
              start_time: session.start_time || '',
              end_time: session.end_time || null,
              max_capacity: session.max_capacity || null,
              current_bookings: session.current_bookings || null,
              is_active: session.is_active !== undefined ? session.is_active : true,
            };

            if (session.session_id && session.session_id > 0) {
              // Update existing session
              const { error: updateError } = await supabase
                .from('heritage_eventsession')
                .update(sessionData)
                .eq('session_id', session.session_id);

              if (updateError) {
                console.error('Error updating session:', updateError);
                setError(`Failed to update session: ${updateError.message}`);
              } else {
                // Save session translations (including English for consistency)
                const sessionTrans = eventSessionTranslations[session.session_id];
                if (sessionTrans) {
                  // Save all language translations
                  for (const lang of LANGUAGES) {
                    const langCode = lang.code.toUpperCase();
                    const transData = sessionTrans[lang.code];
                    if (transData && (transData.session_name || transData.description)) {
                      const { error: transError } = await supabase
                        .from('heritage_eventsessiontranslation')
                        .upsert(
                          {
                            session_id: session.session_id,
                            language_code: langCode,
                            session_name: transData.session_name || null,
                            description: transData.description || null,
                          },
                          {
                            onConflict: 'session_id,language_code',
                          }
                        );

                      if (transError) {
                        console.error(`Error saving session translation for ${langCode}:`, transError);
                      }
                    }
                  }
                }
              }
            } else {
              // Insert new session
              const { data: newSession, error: insertError } = await supabase
                .from('heritage_eventsession')
                .insert(sessionData)
                .select()
                .single();

              if (insertError) {
                console.error('Error inserting session:', insertError);
                setError(`Failed to insert session: ${insertError.message}`);
              } else if (newSession) {
                // Save session translations for new session
                const tempId = session.session_id; // This was the temporary ID
                const sessionTrans = eventSessionTranslations[tempId];
                if (sessionTrans) {
                  // Update the translations map to use the new real ID
                  const newTrans = { ...eventSessionTranslations };
                  delete newTrans[tempId];
                  newTrans[newSession.session_id] = sessionTrans;
                  setEventSessionTranslations(newTrans);
                  
                  // Save all language translations (including English for consistency)
                  for (const lang of LANGUAGES) {
                    const langCode = lang.code.toUpperCase();
                    const transData = sessionTrans[lang.code];
                    if (transData && (transData.session_name || transData.description)) {
                      const { error: transError } = await supabase
                        .from('heritage_eventsessiontranslation')
                        .upsert(
                          {
                            session_id: newSession.session_id,
                            language_code: langCode,
                            session_name: transData.session_name || null,
                            description: transData.description || null,
                          },
                          {
                            onConflict: 'session_id,language_code',
                          }
                        );

                      if (transError) {
                        console.error(`Error saving session translation for ${langCode}:`, transError);
                      }
                    }
                  }
                }
              }
            }
          } catch (sessionErr) {
            console.error('Error during session upsert:', sessionErr);
          }
        }
      }

      // Save event ticket types
      if (eventTicketTypes.length > 0) {
        for (const ticketType of eventTicketTypes) {
          try {
            const ticketData: any = {
              event_id: eventId,
              ticket_name: ticketType.ticket_name || '',
              description: ticketType.description || null,
              price: ticketType.price || 0,
              currency: ticketType.currency || 'INR',
              is_active: ticketType.is_active !== undefined ? ticketType.is_active : true,
            };

            if (ticketType.ticket_type_id) {
              // Update existing ticket type
              const { error: updateError } = await supabase
                .from('heritage_eventtickettype')
                .update(ticketData)
                .eq('ticket_type_id', ticketType.ticket_type_id);

              if (updateError) {
                console.error('Error updating ticket type:', updateError);
                setError(`Failed to update ticket type: ${updateError.message}`);
              }
            } else {
              // Insert new ticket type
              const { error: insertError } = await supabase
                .from('heritage_eventtickettype')
                .insert(ticketData);

              if (insertError) {
                console.error('Error inserting ticket type:', insertError);
                setError(`Failed to insert ticket type: ${insertError.message}`);
              }
            }
          } catch (ticketErr) {
            console.error('Error during ticket type upsert:', ticketErr);
          }
        }
      }

      // Save event features
      // Deduplicate features before saving by name only (case-insensitive)
      const uniqueFeaturesMap = new Map<string, typeof eventFeatures[0]>();
      eventFeatures.forEach(feature => {
        const normalizedName = ((feature.feature_name || '') + '').toLowerCase().trim();
        // Keep the first occurrence (prefer one with feature_id if available)
        if (!uniqueFeaturesMap.has(normalizedName) || (feature.feature_id && !uniqueFeaturesMap.get(normalizedName)?.feature_id)) {
          uniqueFeaturesMap.set(normalizedName, {
            ...feature,
            feature_name: (feature.feature_name || '').trim(),
            feature_icon: (feature.feature_icon || 'amenity').trim(),
          });
        }
      });
      const deduplicatedFeatures = Array.from(uniqueFeaturesMap.values());

      // First, get current features from database to identify features to delete
      const { data: currentFeatures } = await supabase
        .from('heritage_eventfeature')
        .select('feature_id')
        .eq('event_id', eventId);

      const existingFeatureIds = deduplicatedFeatures
        .filter(f => f.feature_id)
        .map(f => f.feature_id);

      // Delete features that are no longer in the list
      if (currentFeatures) {
        const featureIdsToDelete = currentFeatures
          .map((f: any) => f.feature_id)
          .filter((id: number) => !existingFeatureIds.includes(id));

        if (featureIdsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('heritage_eventfeature')
            .delete()
            .in('feature_id', featureIdsToDelete);

          if (deleteError) {
            console.error('Error deleting removed features:', deleteError);
          }
        }
      }

      // Upsert all features
      if (deduplicatedFeatures.length > 0) {
        for (const feature of deduplicatedFeatures) {
          try {
            const featureData: any = {
              event_id: eventId,
              feature_name: feature.feature_name || '',
              feature_description: feature.feature_description || null,
              feature_icon: feature.feature_icon || null,
              is_included: feature.is_included !== false,
              additional_cost: feature.additional_cost || 0,
              is_highlighted: feature.is_highlighted || false,
            };

            if (feature.feature_id) {
              // Update existing feature
              const { error: updateError } = await supabase
                .from('heritage_eventfeature')
                .update(featureData)
                .eq('feature_id', feature.feature_id);

              if (updateError) {
                console.error('Error updating feature:', updateError);
                setError(`Failed to update feature: ${updateError.message}`);
              }
            } else {
              // Insert new feature
              const { error: insertError } = await supabase
                .from('heritage_eventfeature')
                .insert(featureData);

              if (insertError) {
                console.error('Error inserting feature:', insertError);
                setError(`Failed to insert feature: ${insertError.message}`);
              }
            }
          } catch (featureErr) {
            console.error('Error during feature upsert:', featureErr);
          }
        }
      } else {
        // If no features, delete all existing features for this event
        const { error: deleteAllError } = await supabase
          .from('heritage_eventfeature')
          .delete()
          .eq('event_id', eventId);

        if (deleteAllError) {
          console.error('Error deleting all features:', deleteAllError);
        }
      }

      // Refresh event details
      const refreshedDetails = await fetchEventDetails(eventId);
      setEventDetails(refreshedDetails);
      
      // Reload translations
      const refreshedTranslations = await loadEventTranslations(eventId);
      
      // Update English values from refreshed event data
      if (refreshedDetails?.event) {
        const eventData = refreshedDetails.event;
        EVENT_TRANSLATABLE_FIELDS.forEach(field => {
          if (!refreshedTranslations[field]) {
            refreshedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
          }
          if (eventData[field] !== null && eventData[field] !== undefined) {
            if (Array.isArray(eventData[field])) {
              refreshedTranslations[field].en = eventData[field].join(', ');
            } else {
              refreshedTranslations[field].en = String(eventData[field] || '');
            }
          }
        });
      }
      
      setTranslations(refreshedTranslations);

      // Update edited event details
      if (refreshedDetails?.event) {
        const eventData = refreshedDetails.event;
        setEditedEventDetails({
          event_name: eventData.event_name || '',
          short_description: eventData.short_description || '',
          full_description: eventData.full_description || '',
          highlights: Array.isArray(eventData.highlights) ? eventData.highlights : [],
          venue_name: eventData.venue_name || '',
          venue_address: eventData.venue_address || '',
          organizer_name: eventData.organizer_name || '',
          dress_code: eventData.dress_code || '',
          what_to_bring: Array.isArray(eventData.what_to_bring) ? eventData.what_to_bring : [],
          prohibited_items: Array.isArray(eventData.prohibited_items) ? eventData.prohibited_items : [],
          city: eventData.city || '',
          state: eventData.state || '',
          pincode: eventData.pincode || '',
          nearest_metro: eventData.nearest_metro || '',
          nearest_bus_stop: eventData.nearest_bus_stop || '',
        });
      }
      
      // Reload sessions, ticket types, and features
      await loadEventSessions(eventId);
      await loadEventTicketTypes(eventId);
      await loadEventFeatures(eventId);

      // Reload event media - heroes and media are arrays directly, not items arrays
      const allMedia: any[] = [];
      
      // Handle heroes array (can be array directly or have items property)
      if (refreshedDetails.heroes) {
        const heroesArray = Array.isArray(refreshedDetails.heroes) ? refreshedDetails.heroes : (refreshedDetails.heroes.items || []);
        if (Array.isArray(heroesArray) && heroesArray.length > 0) {
          allMedia.push(...heroesArray.map((h: any) => ({ ...h, media_type: h.type || 'hero' })));
        }
      }
      
      // Handle media array (can be array directly or have items property)
      if (refreshedDetails.media) {
        const mediaArray = Array.isArray(refreshedDetails.media) ? refreshedDetails.media : (refreshedDetails.media.items || []);
        if (Array.isArray(mediaArray) && mediaArray.length > 0) {
          allMedia.push(...mediaArray);
        }
      }
      
      allMedia.sort((a, b) => (a.order || a.media_order || 0) - (b.order || b.media_order || 0));
      const normalizedMedia = allMedia.map((m: any) => ({
        media_id: m.media_id,
        media_type: m.type || m.media_type || 'media',
        media_url: m.url || m.media_url || '',
        media_title: m.title || m.media_title || '',
        media_description: m.description || m.media_description || '',
        media_order: m.order || m.media_order || 0,
        is_featured: m.is_featured !== undefined ? m.is_featured : false,
        is_public: m.is_public !== undefined ? m.is_public : true,
      }));
      setEditedEventMedia(normalizedMedia);

      setEditMode(false);
      
      // Refresh table data
      const tabConfig = TAB_CONFIG.find(tab => tab.key === currentTab);
      if (tabConfig?.tableName) {
        await fetchTableData(tabConfig.tableName);
      }
    } catch (error: any) {
      console.error('Error saving event changes:', error);
      setError(error.message || 'Failed to save event changes');
    } finally {
      setSaving(false);
    }
  };

  // Save tour changes including translations
  const handleSaveTourChanges = async () => {
    if (!selectedTableRecord || !tourDetails) return;
    
    setSaving(true);
    const tourId = selectedTableRecord.tour_id || selectedTableRecord.id;
    
    try {
      // First, update base tour fields if changed
      // Exclude columns that are not required: tax_percentage, base_price, currency, duration_days, duration_hours
      const excludedFields = ['tax_percentage', 'base_price', 'currency', 'duration_days', 'duration_hours'];
      const baseFieldsToUpdate: Record<string, any> = {};
      TOUR_TRANSLATABLE_FIELDS.forEach(field => {
        if (currentLanguageTab === 'en' && editedTourDetails[field] !== undefined && !excludedFields.includes(field)) {
          baseFieldsToUpdate[field] = editedTourDetails[field];
        }
      });

      // Ensure excluded fields are never included in the update
      excludedFields.forEach(field => {
        delete baseFieldsToUpdate[field];
      });

      // Add schedule fields
      baseFieldsToUpdate.tour_schedule_type = tourScheduleType;
      baseFieldsToUpdate.schedule_config = tourScheduleConfig;
      baseFieldsToUpdate.booking_cutoff_hours = tourBookingCutoffHours;
      baseFieldsToUpdate.max_advance_booking_days = tourMaxAdvanceBookingDays;

      // Update base tour record if there are changes
      if (Object.keys(baseFieldsToUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('heritage_tour')
          .update(baseFieldsToUpdate)
          .eq('tour_id', tourId);

        if (updateError) {
          throw new Error(`Failed to update tour: ${updateError.message}`);
        }
      }

      // Save translations for all languages
      const translationPayloads: any[] = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
        const langCode = lang.code.toUpperCase();
        const row: any = {
          tour_id: tourId,
          language_code: langCode,
        };
        let hasData = false;

        TOUR_TRANSLATABLE_FIELDS.forEach((field) => {
          const val = translations[field]?.[lang.code];
          if (val && String(val).trim()) {
            row[field] = String(val).trim();
            hasData = true;
          }
        });

        return hasData ? row : null;
      }).filter(Boolean) as any[];

      // Also save English translations (if they differ from base)
      const enTranslation: any = {
        tour_id: tourId,
        language_code: 'EN',
      };
      let enHasData = false;
      TOUR_TRANSLATABLE_FIELDS.forEach((field) => {
        const enVal = translations[field]?.en;
        if (enVal && String(enVal).trim()) {
          enTranslation[field] = String(enVal).trim();
          enHasData = true;
        }
      });

      if (enHasData) {
        translationPayloads.push(enTranslation);
      }

      // Upsert all translations
      if (translationPayloads.length > 0) {
        for (const payload of translationPayloads) {
          try {
            const { tour_id, language_code, ...fields } = payload;
            const { error: upsertErr } = await supabase
              .from('heritage_tourtranslation')
              .upsert(
                {
                  tour_id,
                  language_code,
                  ...fields,
                },
                {
                  onConflict: 'tour_id,language_code',
                }
              );

            if (upsertErr) {
              console.error('Error saving tour translation row:', upsertErr);
              setError(`Failed to save tour translations: ${upsertErr.message}`);
            }
          } catch (rowErr) {
            console.error('Error during tour translation upsert:', rowErr);
          }
        }
      }

      // Save tour hero image to heritage_tourmedia with type 'hero'
      // First, get existing hero media
      const { data: existingHeroMedia } = await supabase
        .from('heritage_tourmedia')
        .select('media_id')
        .eq('tour_id', tourId)
        .eq('media_type', 'hero')
        .single();

      // Upload hero image file if provided
      let heroImageUrl = tourHeroImage;
      if (tourHeroImageFile) {
        setUploadingHero(true);
        try {
          const folder = `touroperators/tours`;
          const uploadResult = await StorageService.uploadFile(tourHeroImageFile, folder);
          
          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(`Failed to upload hero image: ${uploadResult.error || 'Unknown error'}`);
          }
          
          heroImageUrl = uploadResult.url;
          setTourHeroImage(heroImageUrl);
          setTourHeroImageFile(null);
        } catch (error: any) {
          console.error('Error uploading hero image:', error);
          setError(`Failed to upload hero image: ${error.message}`);
          setUploadingHero(false);
          return;
        } finally {
          setUploadingHero(false);
        }
      }

      // Save or update hero image in heritage_tourmedia
      if (heroImageUrl) {
        const heroMediaData: any = {
          tour_id: tourId,
          media_type: 'hero',
          media_url: heroImageUrl,
          alt_text: null,
          media_order: 0,
        };

        if (existingHeroMedia?.media_id) {
          // Update existing hero
          const { error: heroUpdateError } = await supabase
            .from('heritage_tourmedia')
            .update(heroMediaData)
            .eq('media_id', existingHeroMedia.media_id);

          if (heroUpdateError) {
            console.error('Error updating hero image:', heroUpdateError);
            setError(`Failed to update hero image: ${heroUpdateError.message}`);
          }
        } else {
          // Insert new hero
          const { error: heroInsertError } = await supabase
            .from('heritage_tourmedia')
            .insert(heroMediaData);

          if (heroInsertError) {
            console.error('Error inserting hero image:', heroInsertError);
            setError(`Failed to insert hero image: ${heroInsertError.message}`);
          }
        }
      } else if (existingHeroMedia?.media_id) {
        // Delete hero if it was removed - first delete from storage, then from database
        // Get the media URL before deleting
        const { data: heroMediaData } = await supabase
          .from('heritage_tourmedia')
          .select('media_url')
          .eq('media_id', existingHeroMedia.media_id)
          .single();

        if (heroMediaData?.media_url) {
          // Delete file from storage
          const deleteResult = await StorageService.deleteFile(heroMediaData.media_url);
          if (!deleteResult.success) {
            console.error('Error deleting hero image from storage:', deleteResult.error);
          }
        }

        // Delete from database
        const { error: heroDeleteError } = await supabase
          .from('heritage_tourmedia')
          .delete()
          .eq('media_id', existingHeroMedia.media_id);

        if (heroDeleteError) {
          console.error('Error deleting hero image from database:', heroDeleteError);
        }
      }

      // Save tour media (gallery items)
      if (editedTourMedia.length > 0) {
        // First, delete media that are no longer in the list (if they have media_id)
        const existingMediaIds = editedTourMedia
          .filter(m => m.media_id)
          .map(m => m.media_id);
        
        // Get current gallery media from database (exclude hero)
        const { data: currentMedia } = await supabase
          .from('heritage_tourmedia')
          .select('media_id, media_url')
          .eq('tour_id', tourId)
          .eq('media_type', 'gallery');

        if (currentMedia) {
          const mediaIdsToDelete = currentMedia
            .map((m: any) => m.media_id)
            .filter((id: number) => !existingMediaIds.includes(id));

          if (mediaIdsToDelete.length > 0) {
            // Get media URLs for files to delete from storage
            const mediaToDelete = currentMedia.filter((m: any) => mediaIdsToDelete.includes(m.media_id));
            
            // Delete files from storage
            for (const media of mediaToDelete) {
              if (media.media_url) {
                const deleteResult = await StorageService.deleteFile(media.media_url);
                if (!deleteResult.success) {
                  console.error(`Error deleting media file from storage (media_id: ${media.media_id}):`, deleteResult.error);
                }
              }
            }

            // Delete from database
            const { error: deleteError } = await supabase
              .from('heritage_tourmedia')
              .delete()
              .in('media_id', mediaIdsToDelete);

            if (deleteError) {
              console.error('Error deleting removed media from database:', deleteError);
            }
          }
        }

        // Upload and upsert all gallery media items
        setUploadingGallery(true);
        const folder = `touroperators/tours`;
        
        for (const media of editedTourMedia) {
          try {
            let mediaUrl = media.media_url;
            
            // Upload file if provided
            if (media.file) {
              const uploadResult = await StorageService.uploadFile(media.file, folder);
              
              if (!uploadResult.success || !uploadResult.url) {
                console.error(`Failed to upload gallery image: ${uploadResult.error}`);
                setError(`Failed to upload ${media.file.name}: ${uploadResult.error || 'Unknown error'}`);
                continue;
              }
              
              mediaUrl = uploadResult.url;
            }
            
            const mediaData: any = {
              tour_id: tourId,
              media_type: 'gallery',
              media_url: mediaUrl || '',
              alt_text: media.alt_text || null,
              media_order: media.media_order || 0,
            };

            if (media.media_id) {
              // Update existing
              const { error: updateError } = await supabase
                .from('heritage_tourmedia')
                .update(mediaData)
                .eq('media_id', media.media_id);

              if (updateError) {
                console.error('Error updating media:', updateError);
                setError(`Failed to update media: ${updateError.message}`);
              }
            } else {
              // Insert new
              const { error: insertError } = await supabase
                .from('heritage_tourmedia')
                .insert(mediaData);

              if (insertError) {
                console.error('Error inserting media:', insertError);
                setError(`Failed to insert media: ${insertError.message}`);
              }
            }
          } catch (mediaErr) {
            console.error('Error during media upsert:', mediaErr);
          }
        }
        
        setUploadingGallery(false);
      } else {
        // If no media, delete all existing gallery media for this tour (but keep hero)
        // First, get all gallery media URLs to delete from storage
        const { data: allGalleryMedia } = await supabase
          .from('heritage_tourmedia')
          .select('media_id, media_url')
          .eq('tour_id', tourId)
          .eq('media_type', 'gallery');

        if (allGalleryMedia && allGalleryMedia.length > 0) {
          // Delete all files from storage
          for (const media of allGalleryMedia) {
            if (media.media_url) {
              const deleteResult = await StorageService.deleteFile(media.media_url);
              if (!deleteResult.success) {
                console.error(`Error deleting gallery media file from storage (media_id: ${media.media_id}):`, deleteResult.error);
              }
            }
          }
        }

        // Delete from database
        const { error: deleteAllError } = await supabase
          .from('heritage_tourmedia')
          .delete()
          .eq('tour_id', tourId)
          .eq('media_type', 'gallery');

        if (deleteAllError) {
          console.error('Error deleting all gallery media from database:', deleteAllError);
        }
      }

      // Save itinerary days and translations
      if (tourItineraryDays.length > 0) {
        // Get current itinerary days from database
        const { data: currentItineraryDays } = await supabase
          .from('heritage_touritineraryday')
          .select('day_id')
          .eq('tour_id', tourId);

        const currentDayIds = (currentItineraryDays || []).map((d: any) => d.day_id);
        const newDayIds = tourItineraryDays.filter(d => d.day_id).map(d => d.day_id);
        
        // Delete removed days
        const daysToDelete = currentDayIds.filter((id: number) => !newDayIds.includes(id));
        if (daysToDelete.length > 0) {
          const { error: deleteDaysError } = await supabase
            .from('heritage_touritineraryday')
            .delete()
            .in('day_id', daysToDelete);

          if (deleteDaysError) {
            console.error('Error deleting removed itinerary days:', deleteDaysError);
          }
        }

        // Upsert itinerary days
        const dayIdMapping: Record<number, number> = {}; // Maps old temp IDs to new IDs
        for (const day of tourItineraryDays) {
          try {
            const dayData: any = {
              tour_id: tourId,
              day_number: day.day_number || 0,
              day_title: day.day_title || '',
            };

            let finalDayId = day.day_id;
            
            if (day.day_id && day.day_id > 0) {
              // Update existing
              const { error: updateDayError } = await supabase
                .from('heritage_touritineraryday')
                .update(dayData)
                .eq('day_id', day.day_id);

              if (updateDayError) {
                console.error('Error updating itinerary day:', updateDayError);
              }
            } else {
              // Insert new
              const { data: insertedDay, error: insertDayError } = await supabase
                .from('heritage_touritineraryday')
                .insert(dayData)
                .select()
                .single();

              if (insertDayError) {
                console.error('Error inserting itinerary day:', insertDayError);
                continue; // Skip translation saving for failed insert
              } else if (insertedDay) {
                finalDayId = insertedDay.day_id;
                // Map old temp ID to new ID for translation lookup
                if (day.day_id && day.day_id < 0) {
                  dayIdMapping[day.day_id] = finalDayId;
                }
              }
            }

            // Save translations for this day
            // Use mapping if this was a new day, otherwise use the day_id
            const translationKey = finalDayId;
            const translationSourceKey = (day.day_id && day.day_id < 0 && dayIdMapping[day.day_id]) 
              ? dayIdMapping[day.day_id] 
              : day.day_id;
            
            if (translationKey && translationSourceKey && tourItineraryTranslations[translationSourceKey]) {
              const dayTrans = tourItineraryTranslations[translationSourceKey];
              
              for (const lang of LANGUAGES) {
                const langCode = lang.code.toUpperCase();
                const translatedTitle = dayTrans[lang.code];
                
                if (translatedTitle && String(translatedTitle).trim()) {
                  try {
                    const { error: dayTransError } = await supabase
                      .from('heritage_touritinerarydaytranslation')
                      .upsert(
                        {
                          day_id: translationKey,
                          language_code: langCode,
                          day_title: String(translatedTitle).trim(),
                        },
                        {
                          onConflict: 'day_id,language_code',
                        }
                      );

                    if (dayTransError) {
                      console.error(`Error saving itinerary day translation for ${langCode}:`, dayTransError);
                    }
                  } catch (dayTransErr) {
                    console.error(`Error during itinerary day translation upsert for ${langCode}:`, dayTransErr);
                  }
                }
              }
            }
          } catch (dayErr) {
            console.error('Error during itinerary day upsert:', dayErr);
          }
        }
      } else {
        // If no itinerary days, delete all existing days for this tour
        const { error: deleteAllDaysError } = await supabase
          .from('heritage_touritineraryday')
          .delete()
          .eq('tour_id', tourId);

        if (deleteAllDaysError) {
          console.error('Error deleting all itinerary days:', deleteAllDaysError);
        }
      }

      // Save itinerary items and translations
      if (tourItineraryItems.length > 0) {
        // Get current items from database
        const { data: currentItems } = await supabase
          .from('heritage_touritineraryitem')
          .select('item_id')
          .eq('tour_id', tourId);

        const currentItemIds = (currentItems || []).map((i: any) => i.item_id);
        const newItemIds = tourItineraryItems.filter(i => i.item_id && i.item_id > 0).map(i => i.item_id);
        
        // Delete removed items
        const itemsToDelete = currentItemIds.filter((id: number) => !newItemIds.includes(id));
        if (itemsToDelete.length > 0) {
          const { error: deleteItemsError } = await supabase
            .from('heritage_touritineraryitem')
            .delete()
            .in('item_id', itemsToDelete);

          if (deleteItemsError) {
            console.error('Error deleting removed itinerary items:', deleteItemsError);
          }
        }

        // Upsert itinerary items
        const itemIdMapping: Record<number, number> = {}; // Maps old temp IDs to new IDs
        for (const item of tourItineraryItems) {
          try {
            const itemData: any = {
              tour_id: tourId,
              day_id: item.day_id || null,
              start_time: item.start_time || null,
              end_time: item.end_time || null,
              title: item.title || '',
              description: item.description || null,
            };

            let finalItemId = item.item_id;
            
            if (item.item_id && item.item_id > 0) {
              // Update existing
              const { error: updateItemError } = await supabase
                .from('heritage_touritineraryitem')
                .update(itemData)
                .eq('item_id', item.item_id);

              if (updateItemError) {
                console.error('Error updating itinerary item:', updateItemError);
              }
            } else {
              // Insert new
              const { data: insertedItem, error: insertItemError } = await supabase
                .from('heritage_touritineraryitem')
                .insert(itemData)
                .select()
                .single();

              if (insertItemError) {
                console.error('Error inserting itinerary item:', insertItemError);
                continue; // Skip translation saving for failed insert
              } else if (insertedItem) {
                finalItemId = insertedItem.item_id;
                // Map old temp ID to new ID for translation lookup
                if (item.item_id && item.item_id < 0) {
                  itemIdMapping[item.item_id] = finalItemId;
                }
              }
            }

            // Save translations for this item
            const translationKey = finalItemId;
            const translationSourceKey = (item.item_id && item.item_id < 0 && itemIdMapping[item.item_id])
              ? itemIdMapping[item.item_id]
              : item.item_id;
            
            if (translationKey && translationSourceKey && tourItineraryItemTranslations[translationSourceKey]) {
              const itemTrans = tourItineraryItemTranslations[translationSourceKey];
              
              for (const lang of LANGUAGES) {
                const langCode = lang.code.toUpperCase();
                const translatedTitle = itemTrans[lang.code]?.title;
                const translatedDescription = itemTrans[lang.code]?.description;
                
                if ((translatedTitle && String(translatedTitle).trim()) || (translatedDescription && String(translatedDescription).trim())) {
                  try {
                    const { error: itemTransError } = await supabase
                      .from('heritage_touritineraryitemtranslation')
                      .upsert(
                        {
                          item_id: translationKey,
                          language_code: langCode,
                          title: translatedTitle ? String(translatedTitle).trim() : null,
                          description: translatedDescription ? String(translatedDescription).trim() : null,
                        },
                        {
                          onConflict: 'item_id,language_code',
                        }
                      );

                    if (itemTransError) {
                      console.error(`Error saving itinerary item translation for ${langCode}:`, itemTransError);
                    }
                  } catch (itemTransErr) {
                    console.error(`Error during itinerary item translation upsert for ${langCode}:`, itemTransErr);
                  }
                }
              }
            }
          } catch (itemErr) {
            console.error('Error during itinerary item upsert:', itemErr);
          }
        }
      } else {
        // If no items, delete all existing items for this tour
        const { error: deleteAllItemsError } = await supabase
          .from('heritage_touritineraryitem')
          .delete()
          .eq('tour_id', tourId);

        if (deleteAllItemsError) {
          console.error('Error deleting all itinerary items:', deleteAllItemsError);
        }
      }

      // Save tour ticket types
      if (tourTicketTypes.length > 0) {
        for (const ticketType of tourTicketTypes) {
          try {
            const ticketData: any = {
              tour_id: tourId,
              ticket_name: ticketType.ticket_name || '',
              description: ticketType.description || null,
              price: ticketType.price || 0,
              currency: ticketType.currency || 'INR',
              age_min: ticketType.age_min || null,
              age_max: ticketType.age_max || null,
              includes_features: ticketType.includes_features || null,
              max_quantity_per_booking: ticketType.max_quantity_per_booking || null,
              is_active: ticketType.is_active !== undefined ? ticketType.is_active : true,
              tax_percentage: ticketType.tax_percentage || null,
            };

            if (ticketType.ticket_type_id && ticketType.ticket_type_id > 0) {
              // Update existing ticket type
              const { error: updateError } = await supabase
                .from('heritage_tourtickettype')
                .update(ticketData)
                .eq('ticket_type_id', ticketType.ticket_type_id);

              if (updateError) {
                console.error('Error updating tour ticket type:', updateError);
                setError(`Failed to update ticket type: ${updateError.message}`);
              }
            } else {
              // Insert new ticket type
              const { error: insertError } = await supabase
                .from('heritage_tourtickettype')
                .insert(ticketData);

              if (insertError) {
                console.error('Error inserting tour ticket type:', insertError);
                setError(`Failed to insert ticket type: ${insertError.message}`);
              }
            }
          } catch (ticketErr) {
            console.error('Error during tour ticket type upsert:', ticketErr);
          }
        }
      } else {
        // If no ticket types, delete all existing ticket types for this tour
        const { error: deleteAllTicketTypesError } = await supabase
          .from('heritage_tourtickettype')
          .delete()
          .eq('tour_id', tourId);

        if (deleteAllTicketTypesError) {
          console.error('Error deleting all tour ticket types:', deleteAllTicketTypesError);
        }
      }

      // Save tour tags
      // First, get current tag mappings
      const { data: currentTagMappings } = await supabase
        .from('heritage_tourtagmapping')
        .select('tag_id')
        .eq('tour_id', tourId);

      const currentTagIds = (currentTagMappings || []).map((m: any) => m.tag_id);
      const newTagIds = tourTags.map(t => t.tag_id);
      
      // Delete removed tags
      const tagsToDelete = currentTagIds.filter(id => !newTagIds.includes(id));
      if (tagsToDelete.length > 0) {
        const { error: deleteTagsError } = await supabase
          .from('heritage_tourtagmapping')
          .delete()
          .eq('tour_id', tourId)
          .in('tag_id', tagsToDelete);

        if (deleteTagsError) {
          console.error('Error deleting removed tags:', deleteTagsError);
        }
      }

      // Add new tags
      const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id));
      if (tagsToAdd.length > 0) {
        const tagMappingsToInsert = tagsToAdd.map(tagId => ({
          tour_id: tourId,
          tag_id: tagId,
        }));

        const { error: insertTagsError } = await supabase
          .from('heritage_tourtagmapping')
          .insert(tagMappingsToInsert);

        if (insertTagsError) {
          console.error('Error inserting tags:', insertTagsError);
          setError(`Failed to save tags: ${insertTagsError.message}`);
        }
      }

      // Save tag translations
      for (const tag of tourTags) {
        if (tag.tag_id && tourTagTranslations[tag.tag_id]) {
          const tagTrans = tourTagTranslations[tag.tag_id];
          
          // Save translations for all languages
          for (const lang of LANGUAGES) {
            const langCode = lang.code.toUpperCase();
            const translatedName = tagTrans[lang.code];
            
            if (translatedName && String(translatedName).trim() && lang.code !== 'en') {
              try {
                const { error: tagTransError } = await supabase
                  .from('heritage_tourtagtranslation')
                  .upsert(
                    {
                      tag_id: tag.tag_id,
                      language_code: langCode,
                      tag_name: String(translatedName).trim(),
                    },
                    {
                      onConflict: 'tag_id,language_code',
                    }
                  );

                if (tagTransError) {
                  console.error(`Error saving tag translation for ${langCode}:`, tagTransError);
                }
              } catch (tagTransErr) {
                console.error(`Error during tag translation upsert for ${langCode}:`, tagTransErr);
              }
            }
          }
        }
      }

      // Refresh tour details
      const refreshedDetails = await fetchTourDetails(tourId);
      setTourDetails(refreshedDetails);
      
      // Reload translations
      const refreshedTranslations = await loadTourTranslations(tourId);
      
      // Update English values from refreshed tour data
      if (refreshedDetails?.tour) {
        const tourData = refreshedDetails.tour;
        TOUR_TRANSLATABLE_FIELDS.forEach(field => {
          if (!refreshedTranslations[field]) {
            refreshedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
          }
          if (tourData[field] !== null && tourData[field] !== undefined) {
            refreshedTranslations[field].en = String(tourData[field] || '');
          }
        });
      }
      
      setTranslations(refreshedTranslations);

      // Update edited tour details
      if (refreshedDetails?.tour) {
        const tourData = refreshedDetails.tour;
        setEditedTourDetails({
          tour_name: tourData.tour_name || '',
          short_description: tourData.short_description || '',
          full_description: tourData.full_description || '',
          city: tourData.city || '',
          state: tourData.state || '',
          area_or_zone: tourData.area_or_zone || '',
          route_name: tourData.route_name || '',
          meeting_point: tourData.meeting_point || '',
        });

        // Reload schedule data
        setTourScheduleType(tourData.tour_schedule_type || 'always_available');
        setTourScheduleConfig(tourData.schedule_config || {});
        setTourBookingCutoffHours(tourData.booking_cutoff_hours ?? 24);
        setTourMaxAdvanceBookingDays(tourData.max_advance_booking_days ?? 90);
      }

      // Reload tour media from heritage_tourmedia table
      try {
        const { data: tourMediaData, error: tourMediaError } = await supabase
          .from('heritage_tourmedia')
          .select('*')
          .eq('tour_id', tourId)
          .order('media_order', { ascending: true });
        
        if (!tourMediaError && tourMediaData) {
          // Separate hero and gallery
          const heroMedia = tourMediaData.find((m: any) => m.media_type === 'hero');
          const galleryMedia = tourMediaData.filter((m: any) => m.media_type === 'gallery' || !m.media_type);
          
          // Set hero image
          if (heroMedia) {
            setTourHeroImage(heroMedia.media_url || null);
          } else {
            setTourHeroImage(null);
          }
          
          // Set gallery media
          const normalizedMedia = galleryMedia.map((m: any) => ({
        media_id: m.media_id,
            media_type: m.media_type || 'gallery',
            media_url: m.media_url || '',
        alt_text: m.alt_text || '',
            media_order: m.media_order || 0,
      }));
      setEditedTourMedia(normalizedMedia);
        } else {
          setTourHeroImage(null);
          setEditedTourMedia([]);
        }
      } catch (err) {
        console.error('Error reloading tour media:', err);
        setTourHeroImage(null);
        setEditedTourMedia([]);
      }
      
      // Reload itinerary days
      try {
        const { data: itineraryData, error: itineraryError } = await supabase
          .from('heritage_touritineraryday')
          .select('*')
          .eq('tour_id', tourId)
          .order('day_number', { ascending: true });
        
        if (!itineraryError && itineraryData) {
          setTourItineraryDays(itineraryData);
          
          // Reload itinerary translations
          const itineraryTranslations: Record<number, Record<LanguageCode, string>> = {};
          for (const day of itineraryData) {
            if (day.day_id) {
              itineraryTranslations[day.day_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
              // Set English title from main table
              itineraryTranslations[day.day_id].en = day.day_title || '';
              
              // Load translations from database
              try {
                const { data: dayTransData, error: dayTransError } = await supabase
                  .from('heritage_touritinerarydaytranslation')
                  .select('*')
                  .eq('day_id', day.day_id);
                
                if (!dayTransError && dayTransData) {
                  dayTransData.forEach((trans: any) => {
                    const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                    if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.day_title) {
                      itineraryTranslations[day.day_id][langCode] = String(trans.day_title || '');
                    }
                  });
                }
              } catch (err) {
                console.error(`Error loading translations for itinerary day ${day.day_id}:`, err);
              }
            }
          }
          setTourItineraryTranslations(itineraryTranslations);
          
          // Reload itinerary items
          try {
            const { data: itemsData, error: itemsError } = await supabase
              .from('heritage_touritineraryitem')
              .select('*')
              .eq('tour_id', tourId)
              .order('day_id', { ascending: true })
              .order('start_time', { ascending: true });
            
            if (!itemsError && itemsData) {
              setTourItineraryItems(itemsData);
              
              // Reload translations for all items
              const itemTranslations: Record<number, Record<LanguageCode, { title: string; description: string }>> = {};
              for (const item of itemsData) {
                if (item.item_id) {
                  itemTranslations[item.item_id] = {
                    en: { title: item.title || '', description: item.description || '' },
                    hi: { title: '', description: '' },
                    gu: { title: '', description: '' },
                    ja: { title: '', description: '' },
                    es: { title: '', description: '' },
                    fr: { title: '', description: '' },
                  };
                  
                  // Load translations from database
                  try {
                    const { data: itemTransData, error: itemTransError } = await supabase
                      .from('heritage_touritineraryitemtranslation')
                      .select('*')
                      .eq('item_id', item.item_id);
                    
                    if (!itemTransError && itemTransData) {
                      itemTransData.forEach((trans: any) => {
                        const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                        if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                          itemTranslations[item.item_id][langCode] = {
                            title: String(trans.title || ''),
                            description: String(trans.description || ''),
                          };
                        }
                      });
                    }
                  } catch (err) {
                    console.error(`Error loading translations for itinerary item ${item.item_id}:`, err);
                  }
                }
              }
              setTourItineraryItemTranslations(itemTranslations);
            } else {
              setTourItineraryItems([]);
              setTourItineraryItemTranslations({});
            }
          } catch (err) {
            console.error('Error reloading itinerary items:', err);
            setTourItineraryItems([]);
            setTourItineraryItemTranslations({});
          }
        } else {
          setTourItineraryDays([]);
          setTourItineraryTranslations({});
          setTourItineraryItems([]);
          setTourItineraryItemTranslations({});
        }
      } catch (err) {
        console.error('Error reloading itinerary:', err);
        setTourItineraryDays([]);
        setTourItineraryTranslations({});
        setTourItineraryItems([]);
        setTourItineraryItemTranslations({});
      }
      
      // Reload tour ticket types
      await loadTourTicketTypes(tourId);

      // Reload tour tags
      const tagsArray = Array.isArray(refreshedDetails.tags) ? refreshedDetails.tags : (refreshedDetails.tags?.items || []);
      setTourTags(tagsArray);
      
      // Reload tag translations
      const tagTranslations: Record<number, Record<LanguageCode, string>> = {};
      if (tagsArray.length > 0) {
        for (const tag of tagsArray) {
          if (tag.tag_id) {
            tagTranslations[tag.tag_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
            // Set English name
            tagTranslations[tag.tag_id].en = tag.name_en || tag.name || '';
            
            // Load translations from database
            try {
              const { data: tagTransData, error: tagTransError } = await supabase
                .from('heritage_tourtagtranslation')
                .select('*')
                .eq('tag_id', tag.tag_id);
              
              if (!tagTransError && tagTransData) {
                tagTransData.forEach((trans: any) => {
                  const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                  if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.tag_name) {
                    tagTranslations[tag.tag_id][langCode] = String(trans.tag_name || '');
                  }
                });
              }
            } catch (err) {
              console.error(`Error loading translations for tag ${tag.tag_id}:`, err);
            }
          }
        }
      }
      setTourTagTranslations(tagTranslations);

      setEditMode(false);
      
      // Refresh table data
      const tabConfig = TAB_CONFIG.find(tab => tab.key === currentTab);
      if (tabConfig?.tableName) {
        await fetchTableData(tabConfig.tableName);
      }
    } catch (error: any) {
      console.error('Error saving tour changes:', error);
      setError(error.message || 'Failed to save tour changes');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to add items to event array fields (highlights, what_to_bring, prohibited_items)
  // Works from any language - translates to all other languages
  const handleAddArrayItem = async (field: string, currentArr: string[], newItem: string) => {
    if (!newItem.trim()) return;
    
    const newArr = [...currentArr, newItem.trim()];
    const sourceLanguage = currentLanguageTab;
    
    if (currentLanguageTab === 'en') {
      setEditedEventDetails(prev => ({ ...prev, [field]: newArr }));
      setTranslations(prev => ({
        ...prev,
        [field]: { ...prev[field], en: newArr.join(', ') }
      }));
    } else {
      setTranslations(prev => ({
        ...prev,
        [field]: { ...prev[field], [currentLanguageTab]: newArr.join(', ') }
      }));
    }
    
    // Auto-translate the new item to all other languages from any source language
    setTranslatingFields(prev => new Set(prev).add(field));
    try {
      const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLanguage);
      for (const lang of targetLanguages) {
        try {
          const result = await TranslationService.translate(newItem.trim(), lang.code, sourceLanguage);
          if (result.success && result.translations && result.translations[lang.code]) {
            const translatedText = Array.isArray(result.translations[lang.code]) 
              ? result.translations[lang.code][0] 
              : String(result.translations[lang.code] || '');
            
            const existingLangArr = (translations[field]?.[lang.code] || '').split(',').map(s => s.trim()).filter(Boolean);
            const updatedLangArr = [...existingLangArr, translatedText];
            
            setTranslations(prev => ({
              ...prev,
              [field]: {
                ...(prev[field] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                [lang.code]: updatedLangArr.join(', '),
              },
            }));
          }
        } catch (langError) {
          console.error(`Translation error for ${lang.code}:`, langError);
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
        {/* Tabs for Entity Types */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => {
              setCurrentTab(newValue as VerificationTab);
              setPage(1);
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            {TAB_CONFIG.map((tab) => (
              <Tab key={tab.key} label={tab.label} value={tab.key} />
            ))}
          </Tabs>
        </Box>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between" alignItems="center">
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            {/* Entity Type dropdown - only for User Verification tab */}
            {currentTab === 'user' && (
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  label="Entity Type"
                  value={entityFilter}
                  onChange={(e) => {
                    setEntityFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  {ENTITY_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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
                {(currentTab === 'user' 
                  ? VERIFICATION_STATUS_OPTIONS 
                  : currentTab === 'product' 
                    ? PRODUCT_STATUS_OPTIONS 
                    : TABLE_STATUS_OPTIONS).map((option) => (
                  <MenuItem key={option} value={option}>
                    {currentTab === 'product' 
                      ? (option === 'published' ? 'Active' : option === 'draft' ? 'Inactive' : option)
                      : (option === 'draft' ? 'Draft' : option === 'published' ? 'Published' : option)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormattedDateInput
              size="small"
              label={currentTab === 'user' ? 'Submitted On' : 'Created On'}
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value);
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
              disabled={exportLoading || totalRecords === 0}
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
                {currentTab === 'user' ? (
                  <>
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
                  </>
                ) : (
                  <>
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
                    <TableCell sx={{ fontWeight: 600 }}>
                      {currentTab === 'product' ? 'Category' : 'Key'}
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
                      onClick={() => handleSort('createdAt')}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <span>Created On</span>
                        {sortBy === 'createdAt' && (
                          sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {currentTab === 'user' ? (
                paginatedData.map((record: VerificationRecord) => (
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
                      <Typography variant="body2">{formatDisplayDate(record.submittedOn)}</Typography>
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
                ))
              ) : (
                paginatedData.map((record: any, index: number) => {
                  const nameField = record.event_name || record.tour_name || record.hotel_name || record.food_name || record.artwork_name || record.name || '';
                  const keyField = currentTab === 'product' 
                    ? (record.category || '—')
                    : (record.event_key || record.tour_key || record.hotel_key || record.food_key || '');
                  const recordId = record.event_id || record.tour_id || record.hotel_id || record.food_id || record.artwork_id || record.id || index;
                  
                  // For artwork, use is_active; for others, use status
                  const statusValue = currentTab === 'product' 
                    ? (record.is_active ? 'Active' : 'Inactive')
                    : (record.status === 'published' ? 'Published' 
                       : record.status === 'draft' ? 'Draft' 
                       : record.status === 'rejected' ? 'Rejected' 
                       : (record.status || '—'));
                  const statusColor = currentTab === 'product'
                    ? (record.is_active ? 'success' : 'default')
                    : (record.status === 'published' ? 'success' 
                       : record.status === 'draft' ? 'warning' 
                       : record.status === 'rejected' ? 'error' 
                       : 'default');
                  
                  return (
                    <TableRow key={`${currentTab}-${recordId}`} hover sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {nameField || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {keyField || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusValue}
                          color={statusColor}
                          variant="filled"
                          size="small"
                          sx={{ fontWeight: 500, minWidth: 90 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDisplayDate(record.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {(currentTab === 'event' || currentTab === 'tour' || currentTab === 'hotel' || currentTab === 'food' || currentTab === 'product') && (
                            <Tooltip title="View details">
                              <IconButton size="small" onClick={() => handleViewTableDetails(record)}>
                                <VisibilityOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {currentTab === 'product' ? (
                            <>
                              <Tooltip title={record.is_active ? "Deactivate" : "Activate"}>
                                <IconButton
                                  size="small"
                                  color={record.is_active ? "error" : "success"}
                                  onClick={() => handlePublishTableRecord(record)}
                                  disabled={actionLoading === recordId}
                                >
                                  {actionLoading === recordId ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejectTableRecord(record)}
                                  disabled={actionLoading === recordId || !record.is_active}
                                >
                                  {actionLoading === recordId ? <CircularProgress size={16} /> : <HighlightOffOutlinedIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip title="Approve/Publish">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handlePublishTableRecord(record)}
                                  disabled={actionLoading === recordId || record.status === 'published'}
                                >
                                  {actionLoading === recordId ? <CircularProgress size={16} /> : <CheckCircleOutlineIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRejectTableRecord(record)}
                                  disabled={actionLoading === recordId || record.status === 'rejected'}
                                >
                                  {actionLoading === recordId ? <CircularProgress size={16} /> : <HighlightOffOutlinedIcon fontSize="small" />}
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
              {loading && (
                <TableRow>
                  <TableCell colSpan={currentTab === 'user' ? 6 : 5} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paginatedData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={currentTab === 'user' ? 6 : 5} align="center">
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
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalRecords)}-
            {Math.min(page * PAGE_SIZE, totalRecords)} of {totalRecords} results
          </Typography>
          <Pagination
            count={Math.max(1, Math.ceil(totalRecords / PAGE_SIZE))}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      </Paper>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={() => {
        setDetailOpen(false);
        // Reset features when dialog closes
        setEventFeatures([]);
        setAvailableAmenities([]);
        setAmenityTranslations({});
      }} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedRecord?.name || 
             (selectedTableRecord && currentTab === 'event' 
               ? (selectedTableRecord.event_name || selectedTableRecord.name || 'Event Details')
               : selectedTableRecord && currentTab === 'tour'
               ? (selectedTableRecord.tour_name || selectedTableRecord.name || 'Tour Details')
               : selectedTableRecord?.name || 'Details')} - Details
          </Typography>
          <Stack direction="row" spacing={1}>
            {selectedRecord && !editMode ? (
              <Tooltip title="Edit">
                <IconButton onClick={handleEditToggle} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : selectedTableRecord && (currentTab === 'event' || currentTab === 'tour') && !editMode ? (
              <Tooltip title="Edit">
                <IconButton onClick={() => setEditMode(true)} color="primary">
                  <EditIcon />
                </IconButton>
              </Tooltip>
            ) : null}
            {editMode && (
              <>
                <Tooltip title="Save">
                  <IconButton onClick={() => {
                    if (currentTab === 'event' && selectedTableRecord) {
                      handleSaveEventChanges();
                    } else if (currentTab === 'tour' && selectedTableRecord) {
                      handleSaveTourChanges();
                    } else {
                      handleSaveChanges();
                    }
                  }} color="success" disabled={saving || uploadingMedia}>
                    {(saving || uploadingMedia) ? <CircularProgress size={20} /> : <SaveIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Cancel">
                  <IconButton onClick={() => {
                    setEditMode(false);
                    if (currentTab === 'event' && selectedTableRecord) {
                      // Restore original event details
                      if (eventDetails?.event) {
                        const eventData = eventDetails.event;
                        setEditedEventDetails({
                          event_name: eventData.event_name || '',
                          short_description: eventData.short_description || '',
                          full_description: eventData.full_description || '',
                          highlights: Array.isArray(eventData.highlights) ? eventData.highlights : [],
                          venue_name: eventData.venue_name || '',
                          venue_address: eventData.venue_address || '',
                          organizer_name: eventData.organizer_name || '',
                          dress_code: eventData.dress_code || '',
                          what_to_bring: Array.isArray(eventData.what_to_bring) ? eventData.what_to_bring : [],
                          prohibited_items: Array.isArray(eventData.prohibited_items) ? eventData.prohibited_items : [],
                          city: eventData.city || '',
                          state: eventData.state || '',
                          pincode: eventData.pincode || '',
                          nearest_metro: eventData.nearest_metro || '',
                          nearest_bus_stop: eventData.nearest_bus_stop || '',
                        });
                      }
                    } else if (currentTab === 'tour' && selectedTableRecord) {
                      // Restore original tour details
                      if (tourDetails?.tour) {
                        const tourData = tourDetails.tour;
                        setEditedTourDetails({
                          tour_name: tourData.tour_name || '',
                          short_description: tourData.short_description || '',
                          full_description: tourData.full_description || '',
                          city: tourData.city || '',
                          state: tourData.state || '',
                          area_or_zone: tourData.area_or_zone || '',
                          route_name: tourData.route_name || '',
                          meeting_point: tourData.meeting_point || '',
                        });
                      }
                      // Restore tags
                      const tagsArray = Array.isArray(tourDetails.tags) ? tourDetails.tags : (tourDetails.tags?.items || []);
                      setTourTags(tagsArray);
                      
                      // Restore tag translations
                      const tagTranslations: Record<number, Record<LanguageCode, string>> = {};
                      if (tagsArray.length > 0) {
                        tagsArray.forEach((tag: any) => {
                          if (tag.tag_id) {
                            tagTranslations[tag.tag_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                            tagTranslations[tag.tag_id].en = tag.name_en || tag.name || '';
                          }
                        });
                      }
                      setTourTagTranslations(tagTranslations);
                    } else {
                      handleEditToggle();
                    }
                  }} color="error">
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <IconButton onClick={() => {
              setDetailOpen(false);
              setEditMode(false);
              setSelectedRecord(null);
              setSelectedTableRecord(null);
              setEventDetails(null);
              setTourDetails(null);
            }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
    </Box>
          ) : currentTab === 'event' && selectedTableRecord && eventDetails ? (
            // Event Details Dialog
            <Stack spacing={3}>
              {/* Translation Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={currentLanguageTab} 
                  onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {LANGUAGES.map((lang) => {
                    const hasTranslations = lang.code === 'en' || EVENT_TRANSLATABLE_FIELDS.some(field => {
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
                      EVENT_TRANSLATABLE_FIELDS.some(field => translatingFields.has(field));
                    
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

              {/* Event Basic Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Event Information {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
                </Typography>
                <Grid container spacing={2}>
                  {EVENT_TRANSLATABLE_FIELDS.map((field) => {
                    const label = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    const isArrayField = ['highlights', 'what_to_bring', 'prohibited_items'].includes(field);
                    
                    let currentValue: any = '';
                    if (editMode) {
                      if (currentLanguageTab === 'en') {
                        currentValue = editedEventDetails[field] || '';
                        if (isArrayField && Array.isArray(currentValue)) {
                          currentValue = currentValue.join(', ');
                        }
                      } else {
                        currentValue = translations[field]?.[currentLanguageTab] || '';
                      }
                    } else {
                      if (currentLanguageTab === 'en') {
                        const val = eventDetails?.event?.[field];
                        if (isArrayField && Array.isArray(val)) {
                          currentValue = val.join(', ');
                        } else {
                          currentValue = val || '';
                        }
                      } else {
                        currentValue = translations[field]?.[currentLanguageTab] || '';
                      }
                    }

                    if (isArrayField) {
                      // Handle array fields with translation support
                      const arrValue = typeof currentValue === 'string' 
                        ? currentValue.split(',').map(s => s.trim()).filter(Boolean)
                        : Array.isArray(currentValue) ? currentValue : [];

                      // Get English array for reference when translating
                      let englishArr: string[] = [];
                      if (currentLanguageTab === 'en') {
                        englishArr = arrValue;
                      } else {
                        const enValue = editMode 
                          ? (editedEventDetails[field] || [])
                          : (eventDetails?.event?.[field] || []);
                        englishArr = Array.isArray(enValue) ? enValue : (typeof enValue === 'string' ? enValue.split(',').map(s => s.trim()).filter(Boolean) : []);
                      }

                      return (
                        <Grid item xs={12} key={field}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {label}
                            </Typography>
                            <Chip 
                              label={LANGUAGES.find(l => l.code === currentLanguageTab)?.label || currentLanguageTab.toUpperCase()} 
                              size="small" 
                              color={currentLanguageTab === 'en' ? 'primary' : 'default'}
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                            {currentLanguageTab === 'en' && editMode && (
                              <Chip 
                                label="Auto-translate enabled" 
                                size="small" 
                                color="info"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            )}
                          </Stack>
                          {editMode ? (
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                                {arrValue.length > 0 ? (
                                  arrValue.map((item, idx) => (
                                    <Chip
                                      key={idx}
                                      label={String(item)}
                                      size="small"
                                      color={currentLanguageTab === 'en' ? 'primary' : 'default'}
                                      variant={currentLanguageTab === 'en' ? 'filled' : 'outlined'}
                                      onDelete={() => {
                                        const newArr = arrValue.filter((_, i) => i !== idx);
                                        if (currentLanguageTab === 'en') {
                                          setEditedEventDetails(prev => ({ ...prev, [field]: newArr }));
                                          setTranslations(prev => ({
                                            ...prev,
                                            [field]: { ...prev[field], en: newArr.join(', ') }
                                          }));
                                          // Remove from all other language translations by index (since items are translated, string comparison won't work)
                                          LANGUAGES.filter(l => l.code !== 'en').forEach(lang => {
                                            const langArr = (translations[field]?.[lang.code] || '').split(',').map(s => s.trim()).filter(Boolean);
                                            // Remove item at the same index
                                            if (idx < langArr.length) {
                                              const filteredLangArr = langArr.filter((_, i) => i !== idx);
                                              setTranslations(prev => ({
                                                ...prev,
                                                [field]: { ...prev[field], [lang.code]: filteredLangArr.join(', ') }
                                              }));
                                            }
                                          });
                                        } else {
                                          // For non-English, remove from current language translation
                                          setTranslations(prev => ({
                                            ...prev,
                                            [field]: { ...prev[field], [currentLanguageTab]: newArr.join(', ') }
                                          }));
                                        }
                                      }}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                    No items added yet for {LANGUAGES.find(l => l.code === currentLanguageTab)?.label || currentLanguageTab}
                                  </Typography>
                                )}
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder={`Add ${label.toLowerCase()} in ${LANGUAGES.find(l => l.code === currentLanguageTab)?.label || currentLanguageTab}`}
                                  value={newEventItemValues[field] || ''}
                                  onChange={(e) => setNewEventItemValues(prev => ({ ...prev, [field]: e.target.value }))}
                                  onKeyDown={async (e) => {
                                    const currentValue = newEventItemValues[field] || '';
                                    if (e.key === 'Enter' && currentValue.trim()) {
                                      await handleAddArrayItem(field, arrValue, currentValue.trim());
                                      setNewEventItemValues(prev => ({ ...prev, [field]: '' }));
                                    }
                                  }}
                                  InputProps={{
                                    endAdornment: translatingFields.has(field) ? (
                                      <InputAdornment position="end">
                                        <CircularProgress size={16} />
                                      </InputAdornment>
                                    ) : undefined,
                                  }}
                                />
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={async () => {
                                    const currentValue = newEventItemValues[field] || '';
                                    if (currentValue.trim()) {
                                      await handleAddArrayItem(field, arrValue, currentValue.trim());
                                      setNewEventItemValues(prev => ({ ...prev, [field]: '' }));
                                    }
                                  }}
                                  disabled={!newEventItemValues[field]?.trim() || (currentLanguageTab === 'en' && translatingFields.has(field))}
                                  sx={{ minWidth: 80 }}
                                >
                                  Add
                                </Button>
                              </Stack>
                              {currentLanguageTab !== 'en' && englishArr.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                                  English reference: {englishArr.join(', ')}
                                </Typography>
                              )}
                            </Stack>
                          ) : (
                            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                              {arrValue.length > 0 ? (
                                arrValue.map((item, idx) => (
                                  <Chip 
                                    key={idx} 
                                    label={String(item)} 
                                    size="small"
                                    color={currentLanguageTab === 'en' ? 'primary' : 'default'}
                                    variant={currentLanguageTab === 'en' ? 'filled' : 'outlined'}
                                  />
                                ))
                              ) : (
                                <Typography variant="body2" color="text.disabled">—</Typography>
                              )}
                            </Stack>
                          )}
                        </Grid>
                      );
                    }

                    // Regular text fields
                    const isMultiline = ['short_description', 'full_description', 'venue_address'].includes(field);
                    
                    return (
                      <Grid item xs={field === 'full_description' ? 12 : 6} key={field}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {label} ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={currentValue || ''}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              if (currentLanguageTab === 'en') {
                                setEditedEventDetails(prev => ({ ...prev, [field]: newVal }));
                                setTranslations(prev => ({
                                  ...prev,
                                  [field]: { ...prev[field], en: newVal }
                                }));
                              } else {
                                setTranslations(prev => ({
                                  ...prev,
                                  [field]: { ...prev[field], [currentLanguageTab]: newVal }
                                }));
                              }
                              // Auto-translate from any language to all others
                              if (newVal && newVal.trim()) {
                                autoTranslateField(newVal, field);
                              }
                            }}
                            multiline={isMultiline}
                            minRows={isMultiline ? 3 : undefined}
                            maxRows={isMultiline ? 6 : undefined}
                            InputProps={{
                              endAdornment: translatingFields.has(field) ? (
                                <InputAdornment position="end">
                                  <CircularProgress size={16} />
                                </InputAdornment>
                              ) : undefined,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {currentValue || '—'}
                          </Typography>
                        )}
                      </Grid>
                    );
                  })}
                  
                  {/* Pincode field (non-translatable) */}
                  <Grid item xs={6} key="pincode">
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Pincode
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        value={editedEventDetails.pincode || ''}
                        onChange={(e) => {
                          setEditedEventDetails(prev => ({ ...prev, pincode: e.target.value }));
                        }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {eventDetails?.event?.pincode || '—'}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Event Media Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Event Media ({editedEventMedia.length})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setNewMediaData({
                          media_type: 'media',
                          media_url: '',
                          media_title: '',
                          media_description: '',
                          media_order: editedEventMedia.length,
                          is_featured: false,
                          is_public: true,
                        });
                        setMediaDialog({ open: true });
                      }}
                    >
                      Add Media
                    </Button>
                  )}
                </Stack>
                <Grid container spacing={2}>
                  {editedEventMedia.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No media added yet
                      </Typography>
                    </Grid>
                  ) : (
                    editedEventMedia.map((media, index) => (
                      <Grid item xs={12} sm={6} md={4} key={media.media_id || index}>
                        <Card variant="outlined" sx={{ position: 'relative', height: '100%' }}>
                          {editMode && (
                            <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                              <IconButton
                                size="small"
                                color={media.media_type === 'hero' ? 'primary' : 'default'}
                                onClick={() => {
                                  // Toggle between hero and gallery
                                  setEditedEventMedia(prev => prev.map((m, i) => 
                                    i === index 
                                      ? { ...m, media_type: m.media_type === 'hero' ? 'media' : 'hero' }
                                      : m
                                  ));
                                }}
                                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' } }}
                                title={media.media_type === 'hero' ? 'Set as Gallery' : 'Set as Hero'}
                              >
                                {media.media_type === 'hero' ? <StarIcon fontSize="small" /> : <ImageIcon fontSize="small" />}
                              </IconButton>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => {
                                  setNewMediaData({
                                    media_type: media.media_type || 'media',
                                    media_url: media.media_url || '',
                                    media_title: media.media_title || '',
                                    media_description: media.media_description || '',
                                    media_order: media.media_order || index,
                                    is_featured: media.is_featured || false,
                                    is_public: media.is_public !== false,
                                    file: undefined,
                                  });
                                  setMediaDialog({ open: true, media, index });
                                }}
                                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to delete this media? This will also delete the file from storage.',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      const newMedia = editedEventMedia.filter((_, i) => i !== index);
                                      setEditedEventMedia(newMedia);
                                    },
                                  });
                                }}
                                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                          {(() => {
                            // Get display URL - use media_url if available (could be blob URL for preview or actual URL)
                            // If file exists but no URL, create preview (shouldn't happen but handle it)
                            const displayUrl = media.media_url || (media.file ? URL.createObjectURL(media.file) : null);
                            
                            if (!displayUrl) return null;
                            
                            const isImage = displayUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) || (media.file && media.file.type.startsWith('image/'));
                            const isVideo = displayUrl.match(/\.(mp4|mov|m4v|webm|avi|mkv)$/i) || (media.file && media.file.type.startsWith('video/'));
                            
                            if (isImage) {
                              return (
                                <CardMedia
                                  component="img"
                                  height="180"
                                  image={displayUrl}
                                  alt={media.media_title || 'Event media'}
                                  sx={{ objectFit: 'cover' }}
                                />
                              );
                            } else if (isVideo) {
                              return (
                                <Box sx={{ height: 180, bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <video
                                    src={displayUrl}
                                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    controls
                                  />
                                </Box>
                              );
                            } else {
                              return (
                                <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                  <Typography variant="body2" color="text.secondary">Media</Typography>
                                </Box>
                              );
                            }
                          })()}
                          <Box sx={{ p: 1.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Chip
                                label={media.media_type || 'media'}
                                size="small"
                                color={media.media_type === 'hero' ? 'primary' : 'default'}
                                sx={{ fontSize: '0.7rem' }}
                              />
                              {media.is_featured && (
                                <Chip label="Featured" size="small" color="secondary" sx={{ fontSize: '0.7rem' }} />
                              )}
                            </Stack>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ mb: 0.5 }}>
                              {media.media_title || 'Untitled'}
                            </Typography>
                            {media.media_description && (
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {media.media_description}
                              </Typography>
                            )}
                            {media.media_url && (
                              <Link href={media.media_url} target="_blank" rel="noopener" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                View Media
                              </Link>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>

              {/* Event Sessions Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Event Sessions ({eventSessions.length})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const tempId = -Date.now(); // Use negative timestamp as temporary ID
                        const newSession = {
                          session_id: tempId,
                          event_id: selectedTableRecord.event_id || selectedTableRecord.id,
                          session_name: '',
                          description: null,
                          session_date: new Date().toISOString().split('T')[0],
                          start_time: '00:00:00',
                          end_time: null,
                          max_capacity: null,
                          current_bookings: null,
                          is_active: true,
                        };
                        setEventSessions(prev => [...prev, newSession]);
                        setEventSessionTranslations(prev => ({
                          ...prev,
                          [tempId]: {
                            en: { session_name: '', description: '' },
                            hi: { session_name: '', description: '' },
                            gu: { session_name: '', description: '' },
                            ja: { session_name: '', description: '' },
                            es: { session_name: '', description: '' },
                            fr: { session_name: '', description: '' },
                          },
                        }));
                      }}
                    >
                      Add Session
                    </Button>
                  )}
                </Stack>
                {eventSessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No sessions added yet
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {eventSessions.map((session, index) => {
                      const sessionId = session.session_id || index;
                      const sessionTrans = eventSessionTranslations[sessionId];
                      // Display translated session name based on current language tab
                      const displayName = currentLanguageTab !== 'en' && sessionTrans?.[currentLanguageTab]?.session_name
                        ? sessionTrans[currentLanguageTab].session_name
                        : session.session_name || '';
                      // Display translated description based on current language tab
                      const displayDesc = currentLanguageTab !== 'en' && sessionTrans?.[currentLanguageTab]?.description
                        ? sessionTrans[currentLanguageTab].description
                        : session.description || '';

                      return (
                        <Card key={sessionId} variant="outlined">
                          <Box sx={{ p: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={600}>
                                {displayName || `Session ${index + 1}`}
                              </Typography>
                              {editMode && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => {
                                    setConfirmDialog({
                                      open: true,
                                      message: 'Are you sure you want to delete this session?',
                                      onConfirm: () => {
                                        setConfirmDialog({ open: false, message: '', onConfirm: null });
                                        setEventSessions(prev => prev.filter((_, i) => i !== index));
                                        const sessionId = session.session_id || index;
                                        const newTrans = { ...eventSessionTranslations };
                                        delete newTrans[sessionId];
                                        setEventSessionTranslations(newTrans);
                                      },
                                    });
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Stack>
                            {editMode ? (
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Session Name"
                                    value={currentLanguageTab === 'en' ? (session.session_name || '') : (sessionTrans?.[currentLanguageTab]?.session_name || '')}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      const sessionId = session.session_id || index;
                                      
                                      if (currentLanguageTab === 'en') {
                                        setEventSessions(prev => prev.map((s, i) => 
                                          i === index ? { ...s, session_name: newValue } : s
                                        ));
                                        // Also update English translation
                                        const newTrans = { ...eventSessionTranslations };
                                        if (!newTrans[sessionId]) {
                                          newTrans[sessionId] = {
                                            en: { session_name: '', description: session.description || '' },
                                            hi: { session_name: '', description: '' },
                                            gu: { session_name: '', description: '' },
                                            ja: { session_name: '', description: '' },
                                            es: { session_name: '', description: '' },
                                            fr: { session_name: '', description: '' },
                                          };
                                        }
                                        newTrans[sessionId].en = {
                                          ...newTrans[sessionId].en,
                                          session_name: newValue,
                                        };
                                        setEventSessionTranslations(newTrans);
                                      } else {
                                        const newTrans = { ...eventSessionTranslations };
                                        if (!newTrans[sessionId]) {
                                          newTrans[sessionId] = {
                                            en: { session_name: session.session_name || '', description: session.description || '' },
                                            hi: { session_name: '', description: '' },
                                            gu: { session_name: '', description: '' },
                                            ja: { session_name: '', description: '' },
                                            es: { session_name: '', description: '' },
                                            fr: { session_name: '', description: '' },
                                          };
                                        }
                                        newTrans[sessionId][currentLanguageTab] = {
                                          ...newTrans[sessionId][currentLanguageTab],
                                          session_name: newValue,
                                        };
                                        setEventSessionTranslations(newTrans);
                                      }
                                      
                                      // Auto-translate to all other languages
                                      if (newValue && newValue.trim()) {
                                        autoTranslateSessionName(newValue, sessionId);
                                      }
                                    }}
                                    InputProps={{
                                      endAdornment: translatingFields.has(`session_name_${sessionId}`) ? (
                                        <InputAdornment position="end">
                                          <CircularProgress size={16} />
                                        </InputAdornment>
                                      ) : undefined,
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormattedDateInput
                                    fullWidth
                                    size="small"
                                    label="Session Date"
                                    value={session.session_date || ''}
                                    onChange={(value) => {
                                      setEventSessions(prev => prev.map((s, i) => 
                                        i === index ? { ...s, session_date: value } : s
                                      ));
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormattedTimeInput
                                    fullWidth
                                    size="small"
                                    label="Start Time"
                                    value={session.start_time || ''}
                                    onChange={(value) => {
                                      setEventSessions(prev => prev.map((s, i) => 
                                        i === index ? { ...s, start_time: value } : s
                                      ));
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormattedTimeInput
                                    fullWidth
                                    size="small"
                                    label="End Time"
                                    value={session.end_time || ''}
                                    onChange={(value) => {
                                      setEventSessions(prev => prev.map((s, i) => 
                                        i === index ? { ...s, end_time: value || null } : s
                                      ));
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Max Capacity"
                                    type="number"
                                    value={session.max_capacity || ''}
                                    onChange={(e) => {
                                      setEventSessions(prev => prev.map((s, i) => 
                                        i === index ? { ...s, max_capacity: e.target.value ? parseInt(e.target.value) : null } : s
                                      ));
                                    }}
                                  />
                                </Grid>
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    size="small"
                                    label="Description"
                                    multiline
                                    minRows={2}
                                    value={currentLanguageTab === 'en' ? (session.description || '') : (sessionTrans?.[currentLanguageTab]?.description || '')}
                                    onChange={(e) => {
                                      const newValue = e.target.value;
                                      const sessionId = session.session_id || index;
                                      
                                      if (currentLanguageTab === 'en') {
                                        setEventSessions(prev => prev.map((s, i) => 
                                          i === index ? { ...s, description: newValue || null } : s
                                        ));
                                        // Also update English translation
                                        const newTrans = { ...eventSessionTranslations };
                                        if (!newTrans[sessionId]) {
                                          newTrans[sessionId] = {
                                            en: { session_name: session.session_name || '', description: '' },
                                            hi: { session_name: '', description: '' },
                                            gu: { session_name: '', description: '' },
                                            ja: { session_name: '', description: '' },
                                            es: { session_name: '', description: '' },
                                            fr: { session_name: '', description: '' },
                                          };
                                        }
                                        newTrans[sessionId].en = {
                                          ...newTrans[sessionId].en,
                                          description: newValue,
                                        };
                                        setEventSessionTranslations(newTrans);
                                      } else {
                                        const newTrans = { ...eventSessionTranslations };
                                        if (!newTrans[sessionId]) {
                                          newTrans[sessionId] = {
                                            en: { session_name: session.session_name || '', description: session.description || '' },
                                            hi: { session_name: '', description: '' },
                                            gu: { session_name: '', description: '' },
                                            ja: { session_name: '', description: '' },
                                            es: { session_name: '', description: '' },
                                            fr: { session_name: '', description: '' },
                                          };
                                        }
                                        newTrans[sessionId][currentLanguageTab] = {
                                          ...newTrans[sessionId][currentLanguageTab],
                                          description: newValue,
                                        };
                                        setEventSessionTranslations(newTrans);
                                      }
                                      
                                      // Auto-translate to all other languages
                                      if (newValue && newValue.trim()) {
                                        autoTranslateSessionDescription(newValue, sessionId);
                                      }
                                    }}
                                    InputProps={{
                                      endAdornment: translatingFields.has(`session_description_${sessionId}`) ? (
                                        <InputAdornment position="end">
                                          <CircularProgress size={16} />
                                        </InputAdornment>
                                      ) : undefined,
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            ) : (
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Date:</strong> {formatDisplayDate(session.session_date)} | <strong>Time:</strong> {formatDisplayTime(session.start_time)} {session.end_time ? ` - ${formatDisplayTime(session.end_time)}` : ''}
                                </Typography>
                                {session.max_capacity && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Capacity:</strong> {session.max_capacity} | <strong>Bookings:</strong> {session.current_bookings || 0}
                                  </Typography>
                                )}
                                {displayDesc && (
                                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                    {displayDesc}
                                  </Typography>
                                )}
                              </Stack>
                            )}
                          </Box>
                        </Card>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              {/* Event Ticket Types Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ticket Types ({eventTicketTypes.length})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // Get first master as default if available
                        const defaultMasterCode = ticketTypeMasters.length > 0 ? ticketTypeMasters[0].code : '';
                        const newTicketType = {
                          ticket_type_id: 0,
                          event_id: selectedTableRecord.event_id || selectedTableRecord.id,
                          ticket_name: defaultMasterCode,
                          description: null,
                          price: 0,
                          currency: 'INR',
                          is_active: true,
                        };
                        setEventTicketTypes(prev => [...prev, newTicketType]);
                      }}
                    >
                      Add Ticket Type
                    </Button>
                  )}
                </Stack>
                {eventTicketTypes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No ticket types added yet
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {eventTicketTypes.map((ticketType, index) => (
                      <Card key={ticketType.ticket_type_id || index} variant="outlined">
                        <Box sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {(() => {
                                // Find master by code and display translated name
                                const master = ticketTypeMasters.find(m => m.code === ticketType.ticket_name);
                                if (master) {
                                  const masterTrans = ticketTypeMasterTranslations[master.master_id];
                                  const displayName = masterTrans && masterTrans[currentLanguageTab] 
                                    ? masterTrans[currentLanguageTab] 
                                    : (currentLanguageTab === 'en' ? master.display_name : (masterTrans?.en || master.code));
                                  return displayName;
                                }
                                return ticketType.ticket_name || `Ticket Type ${index + 1}`;
                              })()}
                            </Typography>
                            {editMode && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to delete this ticket type?',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      setEventTicketTypes(prev => prev.filter((_, i) => i !== index));
                                    },
                                  });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                          {editMode ? (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Ticket Type</InputLabel>
                                  <Select
                                  value={ticketType.ticket_name || ''}
                                    label="Ticket Type"
                                  onChange={(e) => {
                                    setEventTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, ticket_name: e.target.value } : t
                                    ));
                                  }}
                                  >
                                    {ticketTypeMasters.map((master) => {
                                      // Get translated name based on current language tab
                                      const masterTrans = ticketTypeMasterTranslations[master.master_id];
                                      const displayName = masterTrans && masterTrans[currentLanguageTab] 
                                        ? masterTrans[currentLanguageTab] 
                                        : (currentLanguageTab === 'en' ? master.display_name : (masterTrans?.en || master.code));
                                      return (
                                        <MenuItem key={master.master_id} value={master.code}>
                                          {displayName}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Price"
                                  type="number"
                                  value={ticketType.price || 0}
                                  onChange={(e) => {
                                    setEventTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, price: parseFloat(e.target.value) || 0 } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Currency"
                                  value={ticketType.currency || 'INR'}
                                  onChange={(e) => {
                                    setEventTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, currency: e.target.value } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Description"
                                  multiline
                                  minRows={2}
                                  value={ticketType.description || ''}
                                  onChange={(e) => {
                                    setEventTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, description: e.target.value || null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                            </Grid>
                          ) : (
                            <Stack spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Ticket Type:</strong> {(() => {
                                  // Find master by code and display translated name
                                  const master = ticketTypeMasters.find(m => m.code === ticketType.ticket_name);
                                  if (master) {
                                    const masterTrans = ticketTypeMasterTranslations[master.master_id];
                                    const displayName = masterTrans && masterTrans[currentLanguageTab] 
                                      ? masterTrans[currentLanguageTab] 
                                      : (currentLanguageTab === 'en' ? master.display_name : (masterTrans?.en || master.code));
                                    return displayName;
                                  }
                                  return ticketType.ticket_name || '—';
                                })()}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Price:</strong> {ticketType.currency} {ticketType.price || 0}
                              </Typography>
                              {ticketType.description && (
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {ticketType.description}
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Event Features Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Features ({eventFeatures.length})
                  </Typography>
                </Stack>
                {editMode ? (
                  // Edit mode: Show all available amenities as choice chips (selected and unselected) + Custom button
                  loadingAmenities ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : availableAmenities.length === 0 ? (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', py: 2 }}>
                        No amenities available. Click "Custom" to create one.
                      </Typography>
                      {/* Custom amenity button with + icon */}
                      <Chip
                        icon={<AddIcon />}
                        label="Custom"
                        onClick={async () => {
                          // Load amenities if not already loaded
                          if (availableAmenities.length === 0) {
                            await loadAvailableAmenities();
                          }
                          // Open custom amenity creation dialog
                          setNewAmenityData({
                            name: '',
                            icon: 'amenity',
                            translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                          });
                          setCustomAmenityDialog({ open: true });
                        }}
                        color="default"
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          borderStyle: 'dashed',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {availableAmenities.map((amenity) => {
                        const iconComponent = getIconFromName(amenity.icon);
                        // Normalize amenity name for comparison (compare by name only, not icon)
                        const normalizedAmenityName = (amenity.name || '').toLowerCase().trim();
                        // Check if this amenity is already in features (compare by name only)
                        const isSelected = eventFeatures.some(f => {
                          const fName = (f.feature_name || '').toLowerCase().trim();
                          return fName === normalizedAmenityName;
                        });
                        const amenityTrans = amenityTranslations[amenity.amenity_id];
                        const displayName = amenityTrans && amenityTrans[currentLanguageTab] 
                          ? amenityTrans[currentLanguageTab] 
                          : (currentLanguageTab === 'en' ? amenity.name : amenityTrans?.en || amenity.name);
                        return (
                          <Chip
                            key={amenity.amenity_id}
                            icon={iconComponent ? (
                              <Box 
                                sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center',
                                  '& svg': {
                                    color: isSelected ? 'white' : 'inherit',
                                  }
                                }}
                              >
                                {iconComponent}
                              </Box>
                            ) : undefined}
                            label={displayName}
                            onClick={() => {
                              if (isSelected) {
                                // Remove all matching features by name only (in case of duplicates)
                                setEventFeatures(prev => {
                                  return prev.filter(f => {
                                    const fName = (f.feature_name || '').toLowerCase().trim();
                                    return fName !== normalizedAmenityName;
                                  });
                                });
                              } else {
                                // Check again before adding to prevent duplicates - compare by name only
                                const alreadyExists = eventFeatures.some(f => {
                                  const fName = (f.feature_name || '').toLowerCase().trim();
                                  return fName === normalizedAmenityName;
                                });
                                if (!alreadyExists) {
                                  // Add feature
                                  const eventId = selectedTableRecord?.event_id || selectedTableRecord?.id;
                                  const newFeature = {
                                    feature_id: undefined,
                                    event_id: eventId || 0,
                                    feature_name: amenity.name.trim(),
                                    feature_description: 'Included amenity',
                                    feature_icon: amenity.icon || 'amenity',
                                    is_included: true,
                                    additional_cost: 0,
                                    is_highlighted: false,
                                  };
                                  setEventFeatures(prev => [...prev, newFeature]);
                                }
                              }
                            }}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{
                              cursor: 'pointer',
                              bgcolor: isSelected ? 'primary.main' : 'background.paper',
                              color: isSelected ? 'white !important' : 'text.primary',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              borderWidth: isSelected ? 2 : 1,
                              borderStyle: 'solid',
                              fontWeight: isSelected ? 600 : 400,
                              '& .MuiChip-label': {
                                color: isSelected ? 'white !important' : 'text.primary',
                              },
                              '& .MuiChip-icon': {
                                color: isSelected ? 'white !important' : 'text.secondary',
                              },
                              '&:hover': {
                                bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                                borderColor: isSelected ? 'primary.dark' : 'primary.main',
                              },
                            }}
                          />
                        );
                      })}
                      {/* Custom amenity button with + icon */}
                      <Chip
                        icon={<AddIcon />}
                        label="Custom"
                        onClick={async () => {
                          // Load amenities if not already loaded
                          if (availableAmenities.length === 0) {
                            await loadAvailableAmenities();
                          }
                          // Open custom amenity creation dialog
                          setNewAmenityData({
                            name: '',
                            icon: 'amenity',
                            translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                          });
                          setCustomAmenityDialog({ open: true });
                        }}
                        color="default"
                        variant="outlined"
                        sx={{
                          cursor: 'pointer',
                          borderStyle: 'dashed',
                          '&:hover': {
                            bgcolor: 'action.hover',
                            borderColor: 'primary.main',
                          },
                        }}
                      />
                    </Box>
                  )
                ) : (
                  // View mode: Show only selected features as chips
                  eventFeatures.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No features added yet
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {eventFeatures.map((feature) => {
                        const iconComponent = getIconFromName(feature.feature_icon || 'amenity');
                        const matchingAmenity = availableAmenities.find(a => a.name === feature.feature_name);
                        const amenityTrans = matchingAmenity ? amenityTranslations[matchingAmenity.amenity_id] : null;
                        const displayFeatureName = amenityTrans && amenityTrans[currentLanguageTab] 
                          ? amenityTrans[currentLanguageTab] 
                          : (currentLanguageTab === 'en' ? feature.feature_name : (amenityTrans?.en || feature.feature_name));
                        return (
                          <Chip
                            key={feature.feature_id || feature.feature_name}
                            icon={iconComponent ? <Box sx={{ display: 'flex', alignItems: 'center' }}>{iconComponent}</Box> : undefined}
                            label={displayFeatureName}
                            color="primary"
                            variant="filled"
                          />
                        );
                      })}
                    </Box>
                  )
                )}
              </Box>
            </Stack>
          ) : currentTab === 'tour' && selectedTableRecord && tourDetails ? (
            // Tour Details Dialog
            <Stack spacing={3}>
              {/* Translation Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                  value={currentLanguageTab} 
                  onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {LANGUAGES.map((lang) => {
                    const hasTranslations = lang.code === 'en' || TOUR_TRANSLATABLE_FIELDS.some(field => {
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
                      TOUR_TRANSLATABLE_FIELDS.some(field => translatingFields.has(field));
                    
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

              {/* Tour Basic Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Tour Information {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
                </Typography>
                <Grid container spacing={2}>
                  {TOUR_TRANSLATABLE_FIELDS.map((field) => {
                    const label = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    
                    let currentValue: any = '';
                    if (editMode) {
                      if (currentLanguageTab === 'en') {
                        currentValue = editedTourDetails[field] || '';
                      } else {
                        currentValue = translations[field]?.[currentLanguageTab] || '';
                      }
                    } else {
                      if (currentLanguageTab === 'en') {
                        currentValue = tourDetails?.tour?.[field] || '';
                      } else {
                        currentValue = translations[field]?.[currentLanguageTab] || '';
                      }
                    }

                    // Regular text fields
                    const isMultiline = ['short_description', 'full_description'].includes(field);
                    
                    return (
                      <Grid item xs={field === 'full_description' ? 12 : 6} key={field}>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {label} ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                        </Typography>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            value={currentValue || ''}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              // Exclude columns that are not required: tax_percentage, base_price, currency, duration_days, duration_hours
                              const excludedFields = ['tax_percentage', 'base_price', 'currency', 'duration_days', 'duration_hours'];
                              if (currentLanguageTab === 'en' && !excludedFields.includes(field)) {
                                setEditedTourDetails(prev => ({ ...prev, [field]: newVal }));
                                setTranslations(prev => ({
                                  ...prev,
                                  [field]: { ...prev[field], en: newVal }
                                }));
                              } else if (!excludedFields.includes(field)) {
                                setTranslations(prev => ({
                                  ...prev,
                                  [field]: { ...prev[field], [currentLanguageTab]: newVal }
                                }));
                              }
                              // Auto-translate from any language to all others
                              if (newVal && newVal.trim()) {
                                autoTranslateField(newVal, field);
                              }
                            }}
                            multiline={isMultiline}
                            minRows={isMultiline ? 3 : undefined}
                            maxRows={isMultiline ? 6 : undefined}
                            InputProps={{
                              endAdornment: translatingFields.has(field) ? (
                                <InputAdornment position="end">
                                  <CircularProgress size={16} />
                                </InputAdornment>
                              ) : undefined,
                            }}
                          />
                        ) : (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {currentValue || '—'}
                          </Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              {/* Tour Schedule Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  Tour Schedule {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Schedule Type
                    </Typography>
                    {editMode ? (
                      <FormControl fullWidth size="small">
                        <Select
                          value={tourScheduleType}
                          onChange={(e) => {
                            setTourScheduleType(e.target.value);
                            // Reset config when changing schedule type
                            if (e.target.value === 'always_available') {
                              setTourScheduleConfig({});
                            } else if (e.target.value === 'weekly') {
                              setTourScheduleConfig({ day_of_week: 1, time: '09:00' });
                            } else if (e.target.value === 'monthly') {
                              setTourScheduleConfig({ day_of_month: 1, day_of_week: 6, time: '09:00' });
                            } else if (e.target.value === 'yearly') {
                              setTourScheduleConfig({ month: 3, day: 15, time: '09:00' });
                            } else if (e.target.value === 'custom_dates') {
                              setTourScheduleConfig({ dates: [], times: ['09:00'] });
                            }
                          }}
                        >
                          <MenuItem value="always_available">Always Available</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                          <MenuItem value="custom_dates">Custom Dates</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2">
                        {tourScheduleType === 'always_available' ? 'Always Available' :
                         tourScheduleType === 'weekly' ? 'Weekly' :
                         tourScheduleType === 'monthly' ? 'Monthly' :
                         tourScheduleType === 'yearly' ? 'Yearly' :
                         tourScheduleType === 'custom_dates' ? 'Custom Dates' : tourScheduleType}
                      </Typography>
                    )}
                  </Grid>

                  {/* Schedule Configuration based on type */}
                  {tourScheduleType !== 'always_available' && (
                    <>
                      {tourScheduleType === 'weekly' && (
                        <>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Day of Week
                            </Typography>
                            {editMode ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  value={tourScheduleConfig.day_of_week || 1}
                                  onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, day_of_week: e.target.value })}
                                >
                                  <MenuItem value={1}>Monday</MenuItem>
                                  <MenuItem value={2}>Tuesday</MenuItem>
                                  <MenuItem value={3}>Wednesday</MenuItem>
                                  <MenuItem value={4}>Thursday</MenuItem>
                                  <MenuItem value={5}>Friday</MenuItem>
                                  <MenuItem value={6}>Saturday</MenuItem>
                                  <MenuItem value={7}>Sunday</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Typography variant="body2">
                                {['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][tourScheduleConfig.day_of_week || 1]}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Time
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="time"
                                value={tourScheduleConfig.time || '09:00'}
                                onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, time: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body2">
                                {tourScheduleConfig.time || '—'}
                              </Typography>
                            )}
                          </Grid>
                        </>
                      )}

                      {tourScheduleType === 'monthly' && (
                        <>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Day of Month
                            </Typography>
                            {editMode ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  value={tourScheduleConfig.day_of_month || 1}
                                  onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, day_of_month: e.target.value })}
                                >
                                  <MenuItem value={1}>1st</MenuItem>
                                  <MenuItem value={2}>2nd</MenuItem>
                                  <MenuItem value={3}>3rd</MenuItem>
                                  <MenuItem value={4}>4th</MenuItem>
                                  <MenuItem value={5}>5th</MenuItem>
                                  <MenuItem value={6}>6th</MenuItem>
                                  <MenuItem value={7}>7th</MenuItem>
                                  <MenuItem value={8}>8th</MenuItem>
                                  <MenuItem value={9}>9th</MenuItem>
                                  <MenuItem value={10}>10th</MenuItem>
                                  <MenuItem value={15}>15th</MenuItem>
                                  <MenuItem value={20}>20th</MenuItem>
                                  <MenuItem value={25}>25th</MenuItem>
                                  <MenuItem value={28}>28th</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Typography variant="body2">
                                {tourScheduleConfig.day_of_month ? (() => {
                                  const day = tourScheduleConfig.day_of_month;
                                  const suffix = day % 10 === 1 && day % 100 !== 11 ? 'st' :
                                                day % 10 === 2 && day % 100 !== 12 ? 'nd' :
                                                day % 10 === 3 && day % 100 !== 13 ? 'rd' : 'th';
                                  return `${day}${suffix}`;
                                })() : '—'}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Day of Week
                            </Typography>
                            {editMode ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  value={tourScheduleConfig.day_of_week || 6}
                                  onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, day_of_week: e.target.value })}
                                >
                                  <MenuItem value={1}>Monday</MenuItem>
                                  <MenuItem value={2}>Tuesday</MenuItem>
                                  <MenuItem value={3}>Wednesday</MenuItem>
                                  <MenuItem value={4}>Thursday</MenuItem>
                                  <MenuItem value={5}>Friday</MenuItem>
                                  <MenuItem value={6}>Saturday</MenuItem>
                                  <MenuItem value={7}>Sunday</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Typography variant="body2">
                                {['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][tourScheduleConfig.day_of_week || 6]}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Time
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="time"
                                value={tourScheduleConfig.time || '09:00'}
                                onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, time: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body2">
                                {tourScheduleConfig.time || '—'}
                              </Typography>
                            )}
                          </Grid>
                        </>
                      )}

                      {tourScheduleType === 'yearly' && (
                        <>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Month
                            </Typography>
                            {editMode ? (
                              <FormControl fullWidth size="small">
                                <Select
                                  value={tourScheduleConfig.month || 3}
                                  onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, month: e.target.value })}
                                >
                                  <MenuItem value={1}>January</MenuItem>
                                  <MenuItem value={2}>February</MenuItem>
                                  <MenuItem value={3}>March</MenuItem>
                                  <MenuItem value={4}>April</MenuItem>
                                  <MenuItem value={5}>May</MenuItem>
                                  <MenuItem value={6}>June</MenuItem>
                                  <MenuItem value={7}>July</MenuItem>
                                  <MenuItem value={8}>August</MenuItem>
                                  <MenuItem value={9}>September</MenuItem>
                                  <MenuItem value={10}>October</MenuItem>
                                  <MenuItem value={11}>November</MenuItem>
                                  <MenuItem value={12}>December</MenuItem>
                                </Select>
                              </FormControl>
                            ) : (
                              <Typography variant="body2">
                                {['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][tourScheduleConfig.month || 3]}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Day
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="number"
                                inputProps={{ min: 1, max: 31 }}
                                value={tourScheduleConfig.day || 15}
                                onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, day: parseInt(e.target.value) || 15 })}
                              />
                            ) : (
                              <Typography variant="body2">
                                {tourScheduleConfig.day || '—'}
                              </Typography>
                            )}
                          </Grid>
                          <Grid item xs={12} md={3}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Time
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="time"
                                value={tourScheduleConfig.time || '09:00'}
                                onChange={(e) => setTourScheduleConfig({ ...tourScheduleConfig, time: e.target.value })}
                              />
                            ) : (
                              <Typography variant="body2">
                                {tourScheduleConfig.time || '—'}
                              </Typography>
                            )}
                          </Grid>
                        </>
                      )}

                      {tourScheduleType === 'custom_dates' && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Custom Dates & Times
                          </Typography>
                          {editMode ? (
                            <Box>
                              {((tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : []).map((date: string, idx: number) => (
                                <Stack key={idx} direction="row" spacing={2} sx={{ mb: 1 }} alignItems="center">
                                  <TextField
                                    size="small"
                                    type="date"
                                    label="Date"
                                    value={date}
                                    onChange={(e) => {
                                      const currentDates = (tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : [];
                                      const newDates = [...currentDates];
                                      newDates[idx] = e.target.value;
                                      setTourScheduleConfig({ ...tourScheduleConfig, dates: newDates });
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <TextField
                                    size="small"
                                    type="time"
                                    label="Time"
                                    value={((tourScheduleConfig.times && Array.isArray(tourScheduleConfig.times)) ? tourScheduleConfig.times : ['09:00'])[idx] || '09:00'}
                                    onChange={(e) => {
                                      const currentTimes = (tourScheduleConfig.times && Array.isArray(tourScheduleConfig.times)) ? tourScheduleConfig.times : ['09:00'];
                                      const newTimes = [...currentTimes];
                                      newTimes[idx] = e.target.value;
                                      setTourScheduleConfig({ ...tourScheduleConfig, times: newTimes });
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => {
                                      const currentDates = (tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : [];
                                      const currentTimes = (tourScheduleConfig.times && Array.isArray(tourScheduleConfig.times)) ? tourScheduleConfig.times : ['09:00'];
                                      const newDates = [...currentDates];
                                      const newTimes = [...currentTimes];
                                      newDates.splice(idx, 1);
                                      newTimes.splice(idx, 1);
                                      setTourScheduleConfig({ ...tourScheduleConfig, dates: newDates, times: newTimes });
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              ))}
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  const currentDates = (tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : [];
                                  const currentTimes = (tourScheduleConfig.times && Array.isArray(tourScheduleConfig.times)) ? tourScheduleConfig.times : ['09:00'];
                                  const newDates = [...currentDates, ''];
                                  const newTimes = [...currentTimes, '09:00'];
                                  setTourScheduleConfig({ ...tourScheduleConfig, dates: newDates, times: newTimes });
                                }}
                              >
                                Add Date
                              </Button>
                            </Box>
                          ) : (
                            <Box>
                              {((tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : []).length > 0 ? (
                                ((tourScheduleConfig.dates && Array.isArray(tourScheduleConfig.dates)) ? tourScheduleConfig.dates : []).map((date: string, idx: number) => (
                                  <Typography key={idx} variant="body2" sx={{ mb: 0.5 }}>
                                    {date} at {((tourScheduleConfig.times && Array.isArray(tourScheduleConfig.times)) ? tourScheduleConfig.times : ['09:00'])[idx] || '09:00'}
                                  </Typography>
                                ))
                              ) : (
                                <Typography variant="body2" color="text.secondary">No custom dates set</Typography>
                              )}
                            </Box>
                          )}
                        </Grid>
                      )}
                    </>
                  )}

                  {/* Booking Settings */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Booking Cutoff (Hours)
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={tourBookingCutoffHours}
                        onChange={(e) => setTourBookingCutoffHours(parseInt(e.target.value) || 24)}
                        helperText="Hours before tour start when booking closes"
                      />
                    ) : (
                      <Typography variant="body2">
                        {tourBookingCutoffHours} hours
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Max Advance Booking (Days)
                    </Typography>
                    {editMode ? (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 1 }}
                        value={tourMaxAdvanceBookingDays}
                        onChange={(e) => setTourMaxAdvanceBookingDays(parseInt(e.target.value) || 90)}
                        helperText="Maximum days in advance users can book"
                      />
                    ) : (
                      <Typography variant="body2">
                        {tourMaxAdvanceBookingDays} days
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </Box>

              {/* Tour Hero Image Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Hero Image
                  </Typography>
                  {editMode && (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="hero-image-upload"
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setTourHeroImageFile(file);
                            // Create preview URL
                            const previewUrl = URL.createObjectURL(file);
                            setTourHeroImage(previewUrl);
                          }
                        }}
                      />
                      <label htmlFor="hero-image-upload">
                        <Button
                          variant="outlined"
                          size="small"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingHero}
                        >
                          {uploadingHero ? 'Uploading...' : (tourHeroImage ? 'Change' : 'Upload')} Hero Image
                        </Button>
                      </label>
                    </>
                  )}
                </Stack>
                {tourHeroImage ? (
                  <Card variant="outlined">
                    <CardMedia
                      component="img"
                      height="300"
                      image={tourHeroImage}
                      alt="Tour hero image"
                      sx={{ objectFit: 'cover' }}
                    />
                    {editMode && (
                      <Box sx={{ p: 1.5 }}>
                        {uploadingHero && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <CircularProgress size={16} />
                            <Typography variant="caption" color="text.secondary">
                              Uploading hero image...
                            </Typography>
                          </Box>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setConfirmDialog({
                              open: true,
                              message: 'Are you sure you want to remove the hero image?',
                              onConfirm: () => {
                                setConfirmDialog({ open: false, message: '', onConfirm: null });
                                setTourHeroImage(null);
                                setTourHeroImageFile(null);
                              },
                            });
                          }}
                        >
                          Remove Hero Image
                        </Button>
                      </Box>
                    )}
                  </Card>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No hero image added yet
                  </Typography>
                )}
              </Box>

              {/* Tour Gallery Media Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Gallery Images ({editedTourMedia.length})
                  </Typography>
                  {editMode && (
                    <>
                      <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="gallery-image-upload"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          if (files.length > 0) {
                            const newMediaItems = files.map((file, idx) => {
                              const previewUrl = URL.createObjectURL(file);
                              return {
                                media_id: undefined,
                                media_type: 'gallery',
                                media_url: previewUrl,
                                alt_text: '',
                                media_order: editedTourMedia.length + idx,
                                file: file,
                              };
                            });
                            setEditedTourMedia([...editedTourMedia, ...newMediaItems]);
                          }
                        }}
                      />
                      <label htmlFor="gallery-image-upload">
                        <Button
                          variant="outlined"
                          size="small"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                          disabled={uploadingGallery}
                        >
                          {uploadingGallery ? 'Uploading...' : 'Upload Gallery Images'}
                        </Button>
                      </label>
                    </>
                  )}
                </Stack>
                {uploadingGallery && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <CircularProgress size={16} />
                    <Typography variant="caption" color="text.secondary">
                      Uploading gallery images...
                    </Typography>
                  </Box>
                )}
                <Grid container spacing={2}>
                  {editedTourMedia.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        No gallery images added yet
                      </Typography>
                    </Grid>
                  ) : (
                    editedTourMedia.map((media, index) => (
                      <Grid item xs={12} sm={6} md={4} key={media.media_id || index}>
                        <Card variant="outlined" sx={{ position: 'relative', height: '100%' }}>
                          {editMode && (
                            <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                              <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id={`gallery-edit-${index}`}
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const previewUrl = URL.createObjectURL(file);
                                    const newMedia = [...editedTourMedia];
                                    newMedia[index] = { ...newMedia[index], media_url: previewUrl, file: file };
                                    setEditedTourMedia(newMedia);
                                  }
                                }}
                              />
                              <label htmlFor={`gallery-edit-${index}`}>
                                <IconButton
                                  size="small"
                                  color="primary"
                                  component="span"
                                  sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#e3f2fd' } }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </label>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to delete this image?',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      const newMedia = editedTourMedia.filter((_, i) => i !== index);
                                      setEditedTourMedia(newMedia);
                                    },
                                  });
                                }}
                                sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          )}
                          {media.media_url && (
                            media.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || media.file ? (
                              <CardMedia
                                component="img"
                                height="180"
                                image={media.media_url}
                                alt={media.alt_text || 'Tour gallery image'}
                                sx={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }}>
                                <Typography variant="body2" color="text.secondary">Media</Typography>
                              </Box>
                            )
                          )}
                          <Box sx={{ p: 1.5 }}>
                            {editMode && (
                              <TextField
                                fullWidth
                                size="small"
                                label="Alt Text"
                                value={media.alt_text || ''}
                                onChange={(e) => {
                                  const newMedia = [...editedTourMedia];
                                  newMedia[index] = { ...newMedia[index], alt_text: e.target.value };
                                  setEditedTourMedia(newMedia);
                                }}
                                sx={{ mb: 1 }}
                              />
                            )}
                            {!editMode && media.alt_text && (
                              <Typography variant="caption" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}>
                                {media.alt_text}
                              </Typography>
                            )}
                            {media.media_url && !media.file && (
                              <Link href={media.media_url} target="_blank" rel="noopener" variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                                View Image
                              </Link>
                            )}
                            {media.file && (
                              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                                New file: {media.file.name}
                              </Typography>
                            )}
                          </Box>
                        </Card>
                      </Grid>
                    ))
                  )}
                </Grid>
              </Box>

              {/* Tour Itinerary Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Itinerary ({tourItineraryDays.length} {tourItineraryDays.length === 1 ? 'day' : 'days'})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        const dayNumber = tourItineraryDays.length > 0 
                          ? Math.max(...tourItineraryDays.map(d => d.day_number || 0)) + 1 
                          : 1;
                        // Generate unique negative temporary ID for new days
                        const tempId = Math.min(...tourItineraryDays.map(d => d.day_id || 0).filter(id => id < 0), 0) - 1;
                        const newDay = {
                          day_id: tempId, // Temporary negative ID for new days
                          tour_id: selectedTableRecord?.tour_id || selectedTableRecord?.id || 0,
                          day_number: dayNumber,
                          day_title: '',
                        };
                        setTourItineraryDays([...tourItineraryDays, newDay]);
                        setTourItineraryTranslations({
                          ...tourItineraryTranslations,
                          [tempId]: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                        });
                      }}
                    >
                      Add Day
                    </Button>
                  )}
                </Stack>
                {tourItineraryDays.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No itinerary days added yet
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {tourItineraryDays
                      .sort((a, b) => (a.day_number || 0) - (b.day_number || 0))
                      .map((day, index) => {
                        const dayTitle = currentLanguageTab === 'en'
                          ? (day.day_title || '')
                          : (tourItineraryTranslations[day.day_id]?.[currentLanguageTab] || '');
                        
                        // Get items for this day
                        const dayItems = tourItineraryItems
                          .filter(item => item.day_id === day.day_id)
                          .sort((a, b) => {
                            if (a.start_time && b.start_time) {
                              return a.start_time.localeCompare(b.start_time);
                            }
                            return 0;
                          });
                        
                        return (
                          <Card key={day.day_id || index} variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={2}>
                              <Stack direction="row" spacing={2} alignItems="flex-start">
                                <Box sx={{ minWidth: 60, textAlign: 'center' }}>
                                  <Typography variant="h6" color="primary" fontWeight={600}>
                                    Day {day.day_number || index + 1}
                                  </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  {editMode ? (
                                    <>
                                      {currentLanguageTab === 'en' ? (
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label="Day Title"
                                          value={day.day_title || ''}
                                          onChange={(e) => {
                                            const newVal = e.target.value;
                                            if (currentLanguageTab === 'en') {
                                              const newDays = [...tourItineraryDays];
                                              newDays[index] = { ...newDays[index], day_title: newVal };
                                              setTourItineraryDays(newDays);
                                            }
                                            // Update translation for current language
                                            setTourItineraryTranslations(prev => ({
                                              ...prev,
                                              [day.day_id]: {
                                                ...(prev[day.day_id] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                                                [currentLanguageTab]: newVal,
                                              },
                                            }));
                                            // Auto-translate from any language to all others
                                            if (newVal && newVal.trim()) {
                                              autoTranslateItineraryDay(newVal, day.day_id);
                                            }
                                          }}
                                          InputProps={{
                                            endAdornment: translatingFields.has(`itinerary_day_${day.day_id}`) ? (
                                              <InputAdornment position="end">
                                                <CircularProgress size={16} />
                                              </InputAdornment>
                                            ) : undefined,
                                          }}
                                          sx={{ mb: 1 }}
                                        />
                                      ) : (
                                        <TextField
                                          fullWidth
                                          size="small"
                                          label={`Day Title (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                          value={dayTitle}
                                          onChange={(e) => {
                                            const newVal = e.target.value;
                                            setTourItineraryTranslations(prev => ({
                                              ...prev,
                                              [day.day_id]: {
                                                ...(prev[day.day_id] || { en: day.day_title || '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                                                [currentLanguageTab]: newVal,
                                              },
                                            }));
                                            // Auto-translate from any language to all others
                                            if (newVal && newVal.trim()) {
                                              autoTranslateItineraryDay(newVal, day.day_id);
                                            }
                                          }}
                                          InputProps={{
                                            endAdornment: translatingFields.has(`itinerary_day_${day.day_id}`) ? (
                                              <InputAdornment position="end">
                                                <CircularProgress size={16} />
                                              </InputAdornment>
                                            ) : undefined,
                                          }}
                                          sx={{ mb: 1 }}
                                        />
                                      )}
                                      <Stack direction="row" spacing={1}>
                                        <TextField
                                          size="small"
                                          type="number"
                                          label="Day Number"
                                          value={day.day_number || ''}
                                          onChange={(e) => {
                                            const newDays = [...tourItineraryDays];
                                            newDays[index] = { ...newDays[index], day_number: parseInt(e.target.value) || 0 };
                                            setTourItineraryDays(newDays);
                                          }}
                                          sx={{ width: 120 }}
                                        />
                                        <Button
                                          variant="outlined"
                                          color="error"
                                          size="small"
                                          onClick={() => {
                                            setConfirmDialog({
                                              open: true,
                                              message: 'Are you sure you want to delete this day?',
                                              onConfirm: () => {
                                                setConfirmDialog({ open: false, message: '', onConfirm: null });
                                                const newDays = tourItineraryDays.filter((_, i) => i !== index);
                                                setTourItineraryDays(newDays);
                                                const newTranslations = { ...tourItineraryTranslations };
                                                delete newTranslations[day.day_id];
                                                setTourItineraryTranslations(newTranslations);
                                                // Also delete items for this day
                                                const newItems = tourItineraryItems.filter(item => item.day_id !== day.day_id);
                                                setTourItineraryItems(newItems);
                                              },
                                            });
                                          }}
                                        >
                                          Delete Day
                                        </Button>
                                      </Stack>
                                    </>
                                  ) : (
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', fontWeight: 600 }}>
                                      {dayTitle || '—'}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                              
                              {/* Itinerary Items for this Day */}
                              <Box sx={{ pl: 8 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="subtitle2" color="text.secondary">
                                    Items ({dayItems.length})
                                  </Typography>
                                  {editMode && (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => {
                                        const tempItemId = Math.min(...tourItineraryItems.map(i => i.item_id || 0).filter(id => id < 0), 0) - 1;
                                        const newItem = {
                                          item_id: tempItemId,
                                          tour_id: selectedTableRecord?.tour_id || selectedTableRecord?.id || 0,
                                          day_id: day.day_id,
                                          start_time: null,
                                          end_time: null,
                                          title: '',
                                          description: null,
                                        };
                                        setTourItineraryItems([...tourItineraryItems, newItem]);
                                        setTourItineraryItemTranslations({
                                          ...tourItineraryItemTranslations,
                                          [tempItemId]: {
                                            en: { title: '', description: '' },
                                            hi: { title: '', description: '' },
                                            gu: { title: '', description: '' },
                                            ja: { title: '', description: '' },
                                            es: { title: '', description: '' },
                                            fr: { title: '', description: '' },
                                          },
                                        });
                                      }}
                                    >
                                      Add Item
                                    </Button>
                                  )}
                                </Stack>
                                
                                {dayItems.length === 0 ? (
                                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No items for this day
                                  </Typography>
                                ) : (
                                  <Stack spacing={1.5}>
                                    {dayItems.map((item, itemIndex) => {
                                      const itemTitle = currentLanguageTab === 'en'
                                        ? (item.title || '')
                                        : (tourItineraryItemTranslations[item.item_id]?.[currentLanguageTab]?.title || '');
                                      const itemDescription = currentLanguageTab === 'en'
                                        ? (item.description || '')
                                        : (tourItineraryItemTranslations[item.item_id]?.[currentLanguageTab]?.description || '');
                                      
                                      return (
                                        <Card key={item.item_id || itemIndex} variant="outlined" sx={{ p: 1.5, bgcolor: '#f9f9f9' }}>
                                          <Stack spacing={1}>
                                            {editMode ? (
                                              <>
                                                <Stack direction="row" spacing={1}>
                                                  <FormattedTimeInput
                                                    size="small"
                                                    label="Start Time"
                                                    value={item.start_time || ''}
                                                    onChange={(value) => {
                                                      const newItems = [...tourItineraryItems];
                                                      const idx = newItems.findIndex(i => i.item_id === item.item_id);
                                                      if (idx >= 0) {
                                                        newItems[idx] = { ...newItems[idx], start_time: value || null };
                                                        setTourItineraryItems(newItems);
                                                      }
                                                    }}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ width: 150 }}
                                                  />
                                                  <FormattedTimeInput
                                                    size="small"
                                                    label="End Time"
                                                    value={item.end_time || ''}
                                                    onChange={(value) => {
                                                      const newItems = [...tourItineraryItems];
                                                      const idx = newItems.findIndex(i => i.item_id === item.item_id);
                                                      if (idx >= 0) {
                                                        newItems[idx] = { ...newItems[idx], end_time: value || null };
                                                        setTourItineraryItems(newItems);
                                                      }
                                                    }}
                                                    InputLabelProps={{ shrink: true }}
                                                    sx={{ width: 150 }}
                                                  />
                                                  <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    onClick={() => {
                                                      setConfirmDialog({
                                                        open: true,
                                                        message: 'Are you sure you want to delete this item?',
                                                        onConfirm: () => {
                                                          setConfirmDialog({ open: false, message: '', onConfirm: null });
                                                          const newItems = tourItineraryItems.filter(i => i.item_id !== item.item_id);
                                                          setTourItineraryItems(newItems);
                                                          const newItemTranslations = { ...tourItineraryItemTranslations };
                                                          delete newItemTranslations[item.item_id];
                                                          setTourItineraryItemTranslations(newItemTranslations);
                                                        },
                                                      });
                                                    }}
                                                  >
                                                    Delete
                                                  </Button>
                                                </Stack>
                                                {currentLanguageTab === 'en' ? (
                                                  <>
                                                    <TextField
                                                      fullWidth
                                                      size="small"
                                                      label="Item Title"
                                                      value={item.title || ''}
                                                      onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        if (currentLanguageTab === 'en') {
                                                          const newItems = [...tourItineraryItems];
                                                          const idx = newItems.findIndex(i => i.item_id === item.item_id);
                                                          if (idx >= 0) {
                                                            newItems[idx] = { ...newItems[idx], title: newVal };
                                                            setTourItineraryItems(newItems);
                                                          }
                                                        }
                                                        // Update translation for current language
                                                        setTourItineraryItemTranslations(prev => {
                                                          const updatedTranslations = {
                                                            ...prev,
                                                            [item.item_id]: {
                                                              ...(prev[item.item_id] || {
                                                                en: { title: '', description: '' },
                                                                hi: { title: '', description: '' },
                                                                gu: { title: '', description: '' },
                                                                ja: { title: '', description: '' },
                                                                es: { title: '', description: '' },
                                                                fr: { title: '', description: '' },
                                                              }),
                                                              [currentLanguageTab]: {
                                                                title: newVal,
                                                                description: prev[item.item_id]?.[currentLanguageTab]?.description || (currentLanguageTab === 'en' ? item.description || '' : ''),
                                                              },
                                                            },
                                                          };
                                                          return updatedTranslations;
                                                        });
                                                        // Auto-translate from any language to all others
                                                        if (newVal && newVal.trim()) {
                                                          autoTranslateItineraryItemTitle(newVal, item.item_id);
                                                        }
                                                      }}
                                                      InputProps={{
                                                        endAdornment: translatingFields.has(`itinerary_item_title_${item.item_id}`) ? (
                                                          <InputAdornment position="end">
                                                            <CircularProgress size={16} />
                                                          </InputAdornment>
                                                        ) : undefined,
                                                      }}
                                                    />
                                                    <TextField
                                                      fullWidth
                                                      size="small"
                                                      label="Item Description"
                                                      value={item.description || ''}
                                                      onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        if (currentLanguageTab === 'en') {
                                                          const newItems = [...tourItineraryItems];
                                                          const idx = newItems.findIndex(i => i.item_id === item.item_id);
                                                          if (idx >= 0) {
                                                            newItems[idx] = { ...newItems[idx], description: newVal || null };
                                                            setTourItineraryItems(newItems);
                                                          }
                                                        }
                                                        // Update translation for current language
                                                        setTourItineraryItemTranslations(prev => {
                                                          const updatedTranslations = {
                                                            ...prev,
                                                            [item.item_id]: {
                                                              ...(prev[item.item_id] || {
                                                                en: { title: '', description: '' },
                                                                hi: { title: '', description: '' },
                                                                gu: { title: '', description: '' },
                                                                ja: { title: '', description: '' },
                                                                es: { title: '', description: '' },
                                                                fr: { title: '', description: '' },
                                                              }),
                                                              [currentLanguageTab]: {
                                                                title: prev[item.item_id]?.[currentLanguageTab]?.title || (currentLanguageTab === 'en' ? item.title || '' : ''),
                                                                description: newVal || '',
                                                              },
                                                            },
                                                          };
                                                          return updatedTranslations;
                                                        });
                                                        // Auto-translate from any language to all others
                                                        if (newVal && newVal.trim()) {
                                                          autoTranslateItineraryItemDescription(newVal, item.item_id);
                                                        }
                                                      }}
                                                      InputProps={{
                                                        endAdornment: translatingFields.has(`itinerary_item_description_${item.item_id}`) ? (
                                                          <InputAdornment position="end">
                                                            <CircularProgress size={16} />
                                                          </InputAdornment>
                                                        ) : undefined,
                                                      }}
                                                      multiline
                                                      minRows={2}
                                                      maxRows={4}
                                                    />
                                                  </>
                                                ) : (
                                                  <>
                                                    <TextField
                                                      fullWidth
                                                      size="small"
                                                      label={`Item Title (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                                      value={itemTitle}
                                                      onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setTourItineraryItemTranslations(prev => ({
                                                          ...prev,
                                                          [item.item_id]: {
                                                            ...(prev[item.item_id] || {
                                                              en: { title: item.title || '', description: item.description || '' },
                                                              hi: { title: '', description: '' },
                                                              gu: { title: '', description: '' },
                                                              ja: { title: '', description: '' },
                                                              es: { title: '', description: '' },
                                                              fr: { title: '', description: '' },
                                                            }),
                                                            [currentLanguageTab]: {
                                                              title: newVal,
                                                              description: prev[item.item_id]?.[currentLanguageTab]?.description || '',
                                                            },
                                                          },
                                                        }));
                                                        // Auto-translate from any language to all others
                                                        if (newVal && newVal.trim()) {
                                                          autoTranslateItineraryItemTitle(newVal, item.item_id);
                                                        }
                                                      }}
                                                      InputProps={{
                                                        endAdornment: translatingFields.has(`itinerary_item_title_${item.item_id}`) ? (
                                                          <InputAdornment position="end">
                                                            <CircularProgress size={16} />
                                                          </InputAdornment>
                                                        ) : undefined,
                                                      }}
                                                    />
                                                    <TextField
                                                      fullWidth
                                                      size="small"
                                                      label={`Item Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                                      value={itemDescription}
                                                      onChange={(e) => {
                                                        const newVal = e.target.value;
                                                        setTourItineraryItemTranslations(prev => ({
                                                          ...prev,
                                                          [item.item_id]: {
                                                            ...(prev[item.item_id] || {
                                                              en: { title: item.title || '', description: item.description || '' },
                                                              hi: { title: '', description: '' },
                                                              gu: { title: '', description: '' },
                                                              ja: { title: '', description: '' },
                                                              es: { title: '', description: '' },
                                                              fr: { title: '', description: '' },
                                                            }),
                                                            [currentLanguageTab]: {
                                                              title: prev[item.item_id]?.[currentLanguageTab]?.title || '',
                                                              description: newVal,
                                                            },
                                                          },
                                                        }));
                                                        // Auto-translate from any language to all others
                                                        if (newVal && newVal.trim()) {
                                                          autoTranslateItineraryItemDescription(newVal, item.item_id);
                                                        }
                                                      }}
                                                      InputProps={{
                                                        endAdornment: translatingFields.has(`itinerary_item_description_${item.item_id}`) ? (
                                                          <InputAdornment position="end">
                                                            <CircularProgress size={16} />
                                                          </InputAdornment>
                                                        ) : undefined,
                                                      }}
                                                      multiline
                                                      minRows={2}
                                                      maxRows={4}
                                                    />
                                                  </>
                                                )}
                                              </>
                                            ) : (
                                              <>
                                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                                  {item.start_time && (
                                                    <Typography variant="caption" color="primary" sx={{ fontWeight: 600, minWidth: 80 }}>
                                                      {formatDisplayTime(item.start_time)}
                                                      {item.end_time && ` - ${formatDisplayTime(item.end_time)}`}
                                                    </Typography>
                                                  )}
                                                  <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" fontWeight={500}>
                                                      {itemTitle || '—'}
                                                    </Typography>
                                                    {itemDescription && (
                                                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                        {itemDescription}
                                                      </Typography>
                                                    )}
                                                  </Box>
                                                </Stack>
                                              </>
                                            )}
                                          </Stack>
                                        </Card>
                                      );
                                    })}
                                  </Stack>
                                )}
                              </Box>
                            </Stack>
                          </Card>
                        );
                      })}
                  </Stack>
                )}
              </Box>

              {/* Tour Ticket Types Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Ticket Types ({tourTicketTypes.length})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        // Get first master as default if available
                        const defaultMasterCode = ticketTypeMasters.length > 0 ? ticketTypeMasters[0].code : '';
                        const newTicketType = {
                          ticket_type_id: 0,
                          tour_id: selectedTableRecord?.tour_id || selectedTableRecord?.id || 0,
                          ticket_name: defaultMasterCode,
                          description: null,
                          price: 0,
                          currency: 'INR',
                          age_min: null,
                          age_max: null,
                          includes_features: null,
                          max_quantity_per_booking: null,
                          is_active: true,
                          tax_percentage: null,
                        };
                        setTourTicketTypes(prev => [...prev, newTicketType]);
                      }}
                    >
                      Add Ticket Type
                    </Button>
                  )}
                </Stack>
                {tourTicketTypes.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                    No ticket types added yet
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {tourTicketTypes.map((ticketType, index) => (
                      <Card key={ticketType.ticket_type_id || index} variant="outlined">
                        <Box sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {(() => {
                                // Find master by code and display translated name
                                const master = ticketTypeMasters.find(m => m.code === ticketType.ticket_name);
                                if (master) {
                                  const masterTrans = ticketTypeMasterTranslations[master.master_id];
                                  const displayName = masterTrans && masterTrans[currentLanguageTab] 
                                    ? masterTrans[currentLanguageTab] 
                                    : (currentLanguageTab === 'en' ? master.display_name : (masterTrans?.en || master.code));
                                  return displayName;
                                }
                                return ticketType.ticket_name || `Ticket Type ${index + 1}`;
                              })()}
                            </Typography>
                            {editMode && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to delete this ticket type?',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      setTourTicketTypes(prev => prev.filter((_, i) => i !== index));
                                    },
                                  });
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                          {editMode ? (
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={6}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Ticket Type</InputLabel>
                                  <Select
                                    value={ticketType.ticket_name || ''}
                                    label="Ticket Type"
                                    onChange={(e) => {
                                      setTourTicketTypes(prev => prev.map((t, i) => 
                                        i === index ? { ...t, ticket_name: e.target.value } : t
                                      ));
                                    }}
                                  >
                                    {ticketTypeMasters.map((master) => {
                                      // Get translated name based on current language tab
                                      const masterTrans = ticketTypeMasterTranslations[master.master_id];
                                      const displayName = masterTrans && masterTrans[currentLanguageTab] 
                                        ? masterTrans[currentLanguageTab] 
                                        : (currentLanguageTab === 'en' ? master.display_name : (masterTrans?.en || master.code));
                                      return (
                                        <MenuItem key={master.master_id} value={master.code}>
                                          {displayName}
                                        </MenuItem>
                                      );
                                    })}
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Price"
                                  type="number"
                                  value={ticketType.price || 0}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, price: parseFloat(e.target.value) || 0 } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={3}>
                                <FormControl fullWidth size="small">
                                  <InputLabel>Currency</InputLabel>
                                  <Select
                                    value={ticketType.currency || 'INR'}
                                    label="Currency"
                                    onChange={(e) => {
                                      setTourTicketTypes(prev => prev.map((t, i) => 
                                        i === index ? { ...t, currency: e.target.value } : t
                                      ));
                                    }}
                                  >
                                    <MenuItem value="INR">INR</MenuItem>
                                    <MenuItem value="USD">USD</MenuItem>
                                    <MenuItem value="EUR">EUR</MenuItem>
                                    <MenuItem value="GBP">GBP</MenuItem>
                                    <MenuItem value="JPY">JPY</MenuItem>
                                  </Select>
                                </FormControl>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Min Age"
                                  type="number"
                                  value={ticketType.age_min || ''}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, age_min: e.target.value ? parseInt(e.target.value) : null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Max Age"
                                  type="number"
                                  value={ticketType.age_max || ''}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, age_max: e.target.value ? parseInt(e.target.value) : null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Max Quantity per Booking"
                                  type="number"
                                  value={ticketType.max_quantity_per_booking || ''}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, max_quantity_per_booking: e.target.value ? parseInt(e.target.value) : null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Tax Percentage"
                                  type="number"
                                  inputProps={{ step: 0.01 }}
                                  value={ticketType.tax_percentage || ''}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, tax_percentage: e.target.value ? parseFloat(e.target.value) : null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={ticketType.is_active !== false}
                                      onChange={(e) => {
                                        setTourTicketTypes(prev => prev.map((t, i) => 
                                          i === index ? { ...t, is_active: e.target.checked } : t
                                        ));
                                      }}
                                    />
                                  }
                                  label="Active"
                                />
                              </Grid>
                              <Grid item xs={12}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Description"
                                  multiline
                                  minRows={2}
                                  value={ticketType.description || ''}
                                  onChange={(e) => {
                                    setTourTicketTypes(prev => prev.map((t, i) => 
                                      i === index ? { ...t, description: e.target.value || null } : t
                                    ));
                                  }}
                                />
                              </Grid>
                            </Grid>
                          ) : (
                            <Stack spacing={1}>
                              <Typography variant="body2" color="text.secondary">
                                <strong>Price:</strong> {ticketType.currency} {ticketType.price || 0}
                                {ticketType.tax_percentage && ` (Tax: ${ticketType.tax_percentage}%)`}
                              </Typography>
                              {(ticketType.age_min || ticketType.age_max) && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Age Range:</strong> {ticketType.age_min || 'Any'} - {ticketType.age_max || 'Any'}
                                </Typography>
                              )}
                              {ticketType.max_quantity_per_booking && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Max per Booking:</strong> {ticketType.max_quantity_per_booking}
                                </Typography>
                              )}
                              {ticketType.description && (
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                  {ticketType.description}
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </Box>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Tour Tags Section */}
              <Box>
                <Divider sx={{ my: 2 }} />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Tour Tags ({tourTags.length})
                  </Typography>
                  {editMode && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={async () => {
                        await fetchAvailableTags();
                        setTagDialog({ open: true });
                      }}
                    >
                      Add Tag
                    </Button>
                  )}
                </Stack>
                {tourTags.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No tags added yet
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {tourTags.map((tag) => {
                      // Get translated name, ensuring we only show the translation, not the key
                      let tagName = currentLanguageTab === 'en' 
                        ? (tag.name_en || tag.name || '')
                        : (tourTagTranslations[tag.tag_id]?.[currentLanguageTab] || tag.name || '');
                      
                      // Remove key from tagName if it's included - handle all cases
                      if (tag.key && tagName) {
                        // If tagName is just the key, use the English name instead
                        if (tagName.trim() === tag.key.trim()) {
                          tagName = tag.name_en || tag.name || '';
                        } else {
                          // Remove the key from anywhere in the string
                          // Handle: "key name", "name key", "key name key", etc.
                          const keyPattern = new RegExp(`\\b${tag.key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                          tagName = tagName.replace(keyPattern, '').trim();
                          // Clean up multiple spaces
                          tagName = tagName.replace(/\s+/g, ' ').trim();
                        }
                      }
                      
                      // Fallback: if tagName is empty or just whitespace, use English name
                      if (!tagName || tagName.trim() === '') {
                        tagName = tag.name_en || tag.name || '';
                      }
                      
                      return (
                        <Grid item xs={12} sm={6} key={tag.tag_id}>
                          <Card variant="outlined" sx={{ p: 1.5 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={tagName}
                                size="small"
                                sx={{
                                  backgroundColor: tag.color || '#e0e0e0',
                                  color: '#ffffff',
                                  fontWeight: 500,
                                  '& .MuiChip-icon': {
                                    color: '#ffffff',
                                  },
                                }}
                                icon={getIconFromName(tag.icon)}
                                onDelete={editMode ? () => {
                                  const newTags = tourTags.filter(t => t.tag_id !== tag.tag_id);
                                  setTourTags(newTags);
                                  const newTranslations = { ...tourTagTranslations };
                                  delete newTranslations[tag.tag_id];
                                  setTourTagTranslations(newTranslations);
                                } : undefined}
                              />
                            </Stack>
                            {editMode && currentLanguageTab !== 'en' && (
                              <TextField
                                fullWidth
                                size="small"
                                label={`Tag Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                value={tagName}
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  // Update translation
                                  setTourTagTranslations(prev => ({
                                    ...prev,
                                    [tag.tag_id]: {
                                      ...(prev[tag.tag_id] || { en: tag.name_en || tag.name || '', hi: '', gu: '', ja: '', es: '', fr: '' }),
                                      [currentLanguageTab]: newVal,
                                    },
                                  }));
                                  // Auto-translate from any language to all others
                                  if (newVal && newVal.trim()) {
                                    autoTranslateTagName(newVal, tag.tag_id);
                                  }
                                }}
                                InputProps={{
                                  endAdornment: translatingFields.has(`tag_${tag.tag_id}`) ? (
                                    <InputAdornment position="end">
                                      <CircularProgress size={16} />
                                    </InputAdornment>
                                  ) : undefined,
                                }}
                                sx={{ mt: 1 }}
                              />
                            )}
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                )}
              </Box>
            </Stack>
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
                      <Typography>{formatDisplayDate(userDetails.user.verified_on)}</Typography>
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
                                  translatingFields.has('city') ? (
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
                                  translatingFields.has('state') ? (
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
                              <FormattedTimeInput
                                fullWidth
                                size="small"
                                label={labelMap[key] || label}
                                value={timeValue}
                                onChange={(value) => handleFieldChange(key, value)}
                                InputLabelProps={{ shrink: true }}
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
                              {formatDisplayTime(currentValue)}
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
                              <FormattedDateInput
                                fullWidth
                                size="small"
                                label={label}
                                value={dateValue}
                                onChange={(value) => {
                                  // For timestamp fields, convert date to ISO timestamp
                                  if (isTimestampField && value) {
                                    const date = new Date(value);
                                    date.setHours(0, 0, 0, 0);
                                    handleFieldChange(key, date.toISOString());
                                  } else {
                                    handleFieldChange(key, value);
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
                            <Typography>{formatDisplayDate(dateValue ? dateValue + 'T00:00:00' : null)}</Typography>
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
                                  endAdornment: isTranslatableField && translatingFields.has(key) ? (
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
                                endAdornment: isTranslatableField && translatingFields.has(key) ? (
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
          {addItemDialog.key !== 'amenity' && (
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
          )}
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
          {addItemDialog.key !== 'amenity' && (
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
          )}
        </DialogActions>
      </Dialog>

      {/* Custom Amenity Creation Dialog */}
      <Dialog 
        open={customAmenityDialog.open} 
        onClose={() => {
          if (!creatingAmenity) {
            setCustomAmenityDialog({ open: false });
            setNewAmenityData({
              name: '',
              icon: 'amenity',
              translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
            });
          }
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Create Custom Amenity</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              label="Amenity Name (English)"
              value={newAmenityData.name}
              onChange={(e) => {
                const name = e.target.value;
                setNewAmenityData(prev => ({
                  ...prev,
                  name,
                  translations: { ...prev.translations, en: name },
                }));
                // Auto-translate to other languages after user stops typing (debounced)
                if (name && name.trim()) {
                  autoTranslateAmenityName(name);
                } else {
                  // Clear translations if name is empty
                  setNewAmenityData(prev => ({
                    ...prev,
                    translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                  }));
                }
              }}
              InputProps={{
                endAdornment: translatingFields.has('amenity_name') ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
              required
            />
            <TextField
              fullWidth
              size="small"
              label="Icon (e.g., wifi, parking, restaurant)"
              value={newAmenityData.icon}
              onChange={(e) => setNewAmenityData(prev => ({ ...prev, icon: e.target.value }))}
              helperText="Enter icon name (will be used to display icon)"
            />
            {getIconFromName(newAmenityData.icon) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2">Icon Preview:</Typography>
                <Box sx={{ color: 'primary.main' }}>
                  {getIconFromName(newAmenityData.icon)}
                </Box>
              </Box>
            )}
            <Divider />
            <Typography variant="subtitle2" fontWeight={600}>
              Translations
            </Typography>
            {LANGUAGES.filter(l => l.code !== 'en').map(lang => (
              <TextField
                key={lang.code}
                fullWidth
                size="small"
                label={`${lang.label} Translation`}
                value={newAmenityData.translations[lang.code] || ''}
                onChange={(e) => {
                  setNewAmenityData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      [lang.code]: e.target.value,
                    },
                  }));
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (!creatingAmenity) {
                setCustomAmenityDialog({ open: false });
                setNewAmenityData({
                  name: '',
                  icon: 'amenity',
                  translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                });
              }
            }}
            disabled={creatingAmenity}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={creatingAmenity || !newAmenityData.name.trim()}
            startIcon={creatingAmenity ? <CircularProgress size={16} /> : undefined}
            onClick={async () => {
              if (!newAmenityData.name.trim() || creatingAmenity) return;
              
              setCreatingAmenity(true);
              try {
                const { data: { user } } = await supabase.auth.getUser();
                const userId = user?.id ? parseInt(user.id) : null;

                // Insert amenity with translations
                const result = await insertAmenityWithTranslations(
                  newAmenityData.name.trim(),
                  newAmenityData.icon || null,
                  newAmenityData.translations,
                  userId
                );

                if (result.success && result.amenity) {
                  // Add as feature automatically
                  const eventId = selectedTableRecord?.event_id || selectedTableRecord?.id;
                  const newFeature = {
                    feature_id: undefined,
                    event_id: eventId || 0,
                    feature_name: newAmenityData.name.trim(),
                    feature_description: 'Included amenity',
                    feature_icon: newAmenityData.icon || 'amenity',
                    is_included: true,
                    additional_cost: 0,
                    is_highlighted: false,
                  };
                  setEventFeatures(prev => [...prev, newFeature]);
                  
                  // Close both dialogs
                  setCustomAmenityDialog({ open: false });
                  setAddItemDialog({ open: false, key: '', label: '' });
                  setNewAmenityData({
                    name: '',
                    icon: 'amenity',
                    translations: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
                  });
                } else {
                  setError(result.error || 'Failed to create amenity');
                }
              } catch (error: any) {
                console.error('Error creating custom amenity:', error);
                setError(error.message || 'Failed to create amenity');
              } finally {
                setCreatingAmenity(false);
              }
            }}
          >
            {creatingAmenity ? 'Creating...' : 'Create & Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Amenity Selection Dialog */}
      <Dialog 
        open={amenitySelectionDialog.open} 
        onClose={() => setAmenitySelectionDialog({ open: false })} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Amenities</DialogTitle>
        <DialogContent dividers>
          {loadingAmenities ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : availableAmenities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No amenities available. Click "Custom" to create one.
            </Typography>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, py: 2 }}>
              {availableAmenities.map((amenity) => {
                const iconComponent = getIconFromName(amenity.icon);
                const normalizedIcon = amenity.icon || 'amenity';
                const isSelected = eventFeatures.some(f => {
                  const fIcon = f.feature_icon || 'amenity';
                  return f.feature_name === amenity.name && fIcon === normalizedIcon;
                });
                const amenityTrans = amenityTranslations[amenity.amenity_id];
                const displayName = amenityTrans && amenityTrans[currentLanguageTab] 
                  ? amenityTrans[currentLanguageTab] 
                  : (currentLanguageTab === 'en' ? amenity.name : amenityTrans?.en || amenity.name);
                return (
                  <Chip
                    key={amenity.amenity_id}
                    icon={iconComponent ? <Box sx={{ display: 'flex', alignItems: 'center' }}>{iconComponent}</Box> : undefined}
                    label={displayName}
                    onClick={() => {
                      if (isSelected) {
                        setEventFeatures(prev => prev.filter(f => {
                          const fIcon = f.feature_icon || 'amenity';
                          return !(f.feature_name === amenity.name && fIcon === normalizedIcon);
                        }));
                      } else {
                        const alreadyExists = eventFeatures.some(f => {
                          const fIcon = f.feature_icon || 'amenity';
                          return f.feature_name === amenity.name && fIcon === normalizedIcon;
                        });
                        if (!alreadyExists) {
                          const eventId = selectedTableRecord?.event_id || selectedTableRecord?.id;
                          const newFeature = {
                            feature_id: undefined,
                            event_id: eventId || 0,
                            feature_name: amenity.name,
                            feature_description: 'Included amenity',
                            feature_icon: normalizedIcon,
                            is_included: true,
                            additional_cost: 0,
                            is_highlighted: false,
                          };
                          setEventFeatures(prev => [...prev, newFeature]);
                        }
                      }
                    }}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  />
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAmenitySelectionDialog({ open: false })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Media Edit Dialog */}
      <Dialog open={mediaDialog.open} onClose={() => setMediaDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mediaDialog.media ? 'Edit Media' : 'Add Media'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Media Type</InputLabel>
              <Select
                value={newMediaData.media_type}
                label="Media Type"
                onChange={(e) => setNewMediaData(prev => ({ ...prev, media_type: e.target.value }))}
              >
                <MenuItem value="hero">Hero</MenuItem>
                <MenuItem value="media">Media</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="event-media-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Create preview URL for immediate display
                    const previewUrl = URL.createObjectURL(file);
                    setNewMediaData(prev => ({ ...prev, file, media_url: previewUrl }));
                  }
                }}
              />
              <label htmlFor="event-media-upload">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  {newMediaData.file ? `Selected: ${newMediaData.file.name}` : 'Upload File'}
                </Button>
              </label>
              {newMediaData.file && (
                <Button
                  size="small"
                  onClick={() => setNewMediaData(prev => ({ ...prev, file: undefined }))}
                  sx={{ mb: 1 }}
                >
                  Clear File
                </Button>
              )}
              <TextField
                fullWidth
                size="small"
                label="Or Enter Media URL"
                value={newMediaData.media_url}
                onChange={(e) => setNewMediaData(prev => ({ ...prev, media_url: e.target.value, file: undefined }))}
                disabled={!!newMediaData.file}
                sx={{ mt: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              size="small"
              label="Title"
              value={newMediaData.media_title}
              onChange={(e) => setNewMediaData(prev => ({ ...prev, media_title: e.target.value }))}
            />
            <TextField
              fullWidth
              size="small"
              label="Description"
              value={newMediaData.media_description}
              onChange={(e) => setNewMediaData(prev => ({ ...prev, media_description: e.target.value }))}
              multiline
              minRows={2}
            />
            <TextField
              fullWidth
              size="small"
              label="Order"
              type="number"
              value={newMediaData.media_order}
              onChange={(e) => setNewMediaData(prev => ({ ...prev, media_order: parseInt(e.target.value) || 0 }))}
            />
            <FormControl fullWidth size="small">
              <InputLabel>Featured</InputLabel>
              <Select
                value={newMediaData.is_featured ? 'true' : 'false'}
                label="Featured"
                onChange={(e) => setNewMediaData(prev => ({ ...prev, is_featured: e.target.value === 'true' }))}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Public</InputLabel>
              <Select
                value={newMediaData.is_public ? 'true' : 'false'}
                label="Public"
                onChange={(e) => setNewMediaData(prev => ({ ...prev, is_public: e.target.value === 'true' }))}
              >
                <MenuItem value="true">Yes</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setMediaDialog({ open: false });
            setNewMediaData({
              media_type: 'media',
              media_url: '',
              media_title: '',
              media_description: '',
              media_order: editedEventMedia.length,
              is_featured: false,
              is_public: true,
              file: undefined,
            });
          }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!newMediaData.media_url.trim() && !newMediaData.file) {
                setError('Please upload a file or enter a media URL');
                return;
              }
              if (mediaDialog.index !== undefined && mediaDialog.index >= 0) {
                // Update existing
                const updated = [...editedEventMedia];
                // If file is selected, create preview URL
                const mediaToAdd = newMediaData.file && !newMediaData.media_url.match(/^blob:/)
                  ? { ...newMediaData, media_url: URL.createObjectURL(newMediaData.file) }
                  : newMediaData;
                updated[mediaDialog.index] = {
                  ...updated[mediaDialog.index],
                  ...mediaToAdd,
                };
                setEditedEventMedia(updated);
              } else {
                // Add new - create preview URL if file is selected
                const mediaToAdd = newMediaData.file && !newMediaData.media_url.match(/^blob:/)
                  ? { ...newMediaData, media_url: URL.createObjectURL(newMediaData.file) }
                  : newMediaData;
                setEditedEventMedia([...editedEventMedia, mediaToAdd]);
              }
              setMediaDialog({ open: false });
              setNewMediaData({
                media_type: 'media',
                media_url: '',
                media_title: '',
                media_description: '',
                media_order: editedEventMedia.length,
                is_featured: false,
                is_public: true,
                file: undefined,
              });
            }}
            disabled={!newMediaData.media_url.trim() && !newMediaData.file}
          >
            {mediaDialog.media ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag Selection Dialog */}
      <Dialog open={tagDialog.open} onClose={() => setTagDialog({ open: false })} maxWidth="sm" fullWidth>
        <DialogTitle>Select Tags</DialogTitle>
        <DialogContent dividers>
          {loadingTags ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2} sx={{ mt: 1 }}>
              {availableTags.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No tags available
                </Typography>
              ) : (
                availableTags.map((tag) => {
                  const isSelected = tourTags.some(t => t.tag_id === tag.tag_id);
                  
                  // Clean tag name to remove icon key if present
                  let displayName = tag.tag_name || '';
                  if (tag.tag_key && displayName) {
                    // If tagName is just the key, use the name
                    if (displayName.trim() === tag.tag_key.trim()) {
                      displayName = tag.tag_name || '';
                    } else {
                      // Remove the key from anywhere in the string
                      const keyPattern = new RegExp(`\\b${tag.tag_key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                      displayName = displayName.replace(keyPattern, '').trim();
                      // Clean up multiple spaces
                      displayName = displayName.replace(/\s+/g, ' ').trim();
                    }
                  }
                  
                  // Fallback: if displayName is empty, use tag_name
                  if (!displayName || displayName.trim() === '') {
                    displayName = tag.tag_name || '';
                  }
                  
                  return (
                    <Chip
                      key={tag.tag_id}
                      label={displayName}
                      sx={{
                        backgroundColor: isSelected ? (tag.tag_color || '#e0e0e0') : 'transparent',
                        color: isSelected ? '#ffffff' : (tag.tag_color || '#616161'),
                        border: `1px solid ${tag.tag_color || '#e0e0e0'}`,
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: isSelected ? (tag.tag_color || '#e0e0e0') : `${tag.tag_color || '#e0e0e0'}22`,
                        },
                        '& .MuiChip-icon': {
                          color: isSelected ? '#ffffff' : (tag.tag_color || '#616161'),
                        },
                      }}
                      icon={getIconFromName(tag.tag_icon)}
                      onClick={() => {
                        if (isSelected) {
                          // Remove tag
                          const newTags = tourTags.filter(t => t.tag_id !== tag.tag_id);
                          setTourTags(newTags);
                          const newTranslations = { ...tourTagTranslations };
                          delete newTranslations[tag.tag_id];
                          setTourTagTranslations(newTranslations);
                        } else {
                          // Add tag
                          const newTag = {
                            tag_id: tag.tag_id,
                            key: tag.tag_key,
                            name: tag.tag_name,
                            name_en: tag.tag_name,
                            color: tag.tag_color || '#e0e0e0',
                            icon: tag.tag_icon || '',
                          };
                          setTourTags([...tourTags, newTag]);
                          
                          // Initialize translations for this tag
                          const tagTrans: Record<LanguageCode, string> = { en: tag.tag_name, hi: '', gu: '', ja: '', es: '', fr: '' };
                          
                          // Load existing translations for this tag
                          (async () => {
                            try {
                              const { data: tagTransData, error: tagTransError } = await supabase
                                .from('heritage_tourtagtranslation')
                                .select('*')
                                .eq('tag_id', tag.tag_id);
                              
                              if (!tagTransError && tagTransData) {
                                tagTransData.forEach((trans: any) => {
                                  const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                                  if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.tag_name) {
                                    tagTrans[langCode] = String(trans.tag_name || '');
                                  }
                                });
                              }
                            } catch (err) {
                              console.error(`Error loading translations for tag ${tag.tag_id}:`, err);
                            }
                            
                            setTourTagTranslations(prev => ({
                              ...prev,
                              [tag.tag_id]: tagTrans,
                            }));
                          })();
                        }
                      }}
                    />
                  );
                })
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTagDialog({ open: false })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog({ open: false, message: '', onConfirm: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (confirmDialog.onConfirm) {
                confirmDialog.onConfirm();
              }
            }}
            color="error"
            variant="contained"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hotel Details Dialog */}
      <HotelDetailsDialog
        open={hotelDialogOpen}
        hotelId={selectedHotelId}
        onClose={() => {
          setHotelDialogOpen(false);
          setSelectedHotelId(null);
        }}
      />

      {/* Food Details Dialog */}
      <FoodDetailsDialog
        open={foodDialogOpen}
        foodId={selectedFoodId}
        onClose={() => {
          setFoodDialogOpen(false);
          setSelectedFoodId(null);
        }}
      />

      {/* Artwork Details Dialog */}
      <ArtworkDetailsDialog
        open={artworkDialogOpen}
        artworkId={selectedArtworkId}
        onClose={() => {
          setArtworkDialogOpen(false);
          setSelectedArtworkId(null);
        }}
      />

      {/* Rejection Dialog */}
      {rejectionRecord && (
        <RejectionDialog
          open={rejectionDialogOpen}
          entityName={
            rejectionRecord.type === 'user'
              ? (rejectionRecord.record as VerificationRecord).name
              : rejectionRecord.record.event_name ||
                rejectionRecord.record.tour_name ||
                rejectionRecord.record.hotel_name ||
                rejectionRecord.record.food_name ||
                rejectionRecord.record.artwork_name ||
                rejectionRecord.record.name ||
                'Record'
          }
          entityType={
            rejectionRecord.type === 'user'
              ? (rejectionRecord.record as VerificationRecord).entityType
              : currentTab === 'event'
              ? 'Event'
              : currentTab === 'tour'
              ? 'Tour'
              : currentTab === 'hotel'
              ? 'Hotel'
              : currentTab === 'food'
              ? 'Food'
              : currentTab === 'product'
              ? 'Artwork'
              : 'Record'
          }
          onClose={() => {
            if (!actionLoading) {
              setRejectionDialogOpen(false);
              setRejectionRecord(null);
            }
          }}
          onConfirm={handleConfirmRejection}
          loading={actionLoading !== null}
        />
      )}
    </Box>
  );
};

export default Verification;

