import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
  Select,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import MapIcon from '@mui/icons-material/Map';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TrainIcon from '@mui/icons-material/Train';
import AttractionIcon from '@mui/icons-material/Attractions';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ExploreIcon from '@mui/icons-material/Explore';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  HeritageSiteAttraction,
  HeritageSiteAudioGuide,
  HeritageSiteFeeBreakup,
  HeritageSiteOpeningDay,
  HeritageSiteOpeningHours,
  HeritageSiteTransportOption,
} from '@/types';
import {
  CreateHeritageSiteRequest,
  HeritageSiteCoreInput,
  HeritageSiteMediaInput,
  HeritageSiteService,
  HeritageSiteTicketTypeInput,
  HeritageSiteTranslationInput,
  HeritageSiteTransportationInput,
  HeritageSiteAttractionInput,
  HeritageSiteVisitingHoursInput,
  HeritageSiteEtiquetteInput,
} from '@/services/heritageSite.service';
import { TranslationService } from '@/services/translation.service';
import { StorageService } from '@/services/storage.service';
import { MasterDataService } from '@/services/masterData.service';
import { MasterData } from '@/types';
import { geocodeAddress } from '@/config/googleMaps';
import { useAuth } from '@/context/AuthContext';

type StepKey = 'overview' | 'about' | 'plan' | 'review';
type LanguageCode = 'en' | 'gu' | 'hi' | 'es' | 'ja' | 'fr';

interface LocalMediaItem {
  id: string;
  mediaId?: number; // Database media_id if item exists in DB
  file?: File;
  previewUrl?: string;
  label?: string;
  isPrimary?: boolean;
  isUploading?: boolean; // Track upload state
}

interface LocalAudioGuide extends HeritageSiteAudioGuide {
  file?: File;
  id: string;
}

interface TransportPreset {
  mode: string;
  icon: ReactNode;
  color: string;
}

interface AddHeritageSiteState {
  overview: {
    siteName: string;
    siteShortDescription: string;
    siteFullDescription: string;
    locationAddress: string;
    locationCity: string;
    locationState: string;
    locationCountry: string;
    locationPostalCode: string;
    latitude: string;
    longitude: string;
    media: LocalMediaItem[];
    video360Url: string;
    arModeAvailable: boolean;
    openingHours: HeritageSiteOpeningHours;
    accessibility: string[]; // Array of accessibility codes from masterdata
    siteType: string | null; // Single site type code from masterdata
    experience: string[]; // Array of experience codes from masterdata
    photographyAllowed: 'free' | 'paid' | 'restricted';
    photographyAmount: string;
  };
  translations: {
    siteName: Record<LanguageCode, string>;
    shortDescription: Record<LanguageCode, string>;
    fullDescription: Record<LanguageCode, string>;
    address: Record<LanguageCode, string>;
    city: Record<LanguageCode, string>;
    state: Record<LanguageCode, string>;
    country: Record<LanguageCode, string>;
    overview: Record<LanguageCode, string>;
    history: Record<LanguageCode, string>;
  };
  audioGuides: LocalAudioGuide[];
  siteMapFile?: File | null;
  siteMapPreviewUrl?: string | null;
  etiquettes: string[]; // Array of etiquette codes from masterdata (stored in etiquettes column as text[])
  ticketing: {
    entryType: 'free' | 'paid';
    bookingUrl: string;
    onlineBookingAvailable: boolean;
    fees: HeritageSiteFeeBreakup[];
  };
  transport: (HeritageSiteTransportOption & { route_info?: string; accessibility_notes?: string })[];
  nearbyAttractions: HeritageSiteAttraction[];
  transportTranslations: Record<number, Record<LanguageCode, { name?: string; route_info?: string; accessibility_notes?: string }>>; // Map of transport index -> language -> translations
  attractionTranslations: Record<number, Record<LanguageCode, { name?: string; notes?: string }>>; // Map of attraction index -> language -> translations
  admin: {
    saveOption: 'draft' | 'approval';
    notes: string;
  };
  autoTranslate: {
    enabled: boolean;
    sourceLanguage: LanguageCode;
  };
}

const STEP_CONFIG: { key: StepKey; label: string; subtitle: string }[] = [
  { key: 'overview', label: 'Overview', subtitle: 'Site information & media' },
  { key: 'about', label: 'About', subtitle: 'History, audio & etiquettes' },
  { key: 'plan', label: 'Plan Visit', subtitle: 'Tickets, transport & nearby' },
  { key: 'review', label: 'Review', subtitle: 'Verify before submitting' },
];

const LANGUAGES: { code: LanguageCode; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ja', label: 'Japanese', flag: '🇯🇵' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', label: 'French', flag: '🇫🇷' },
];

const TRANSPORT_PRESETS: TransportPreset[] = [
  { mode: 'metro', icon: <TrainIcon />, color: '#3F3D56' },
  { mode: 'bus', icon: <DirectionsBusIcon />, color: '#1976d2' },
  { mode: 'taxi', icon: <DirectionsCarIcon />, color: '#DA8552' },
];

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ADD_NEW_TICKET_TYPE_OPTION = '__add_new_ticket_type__';
const ADD_NEW_SITE_TYPE_OPTION = '__add_new_site_type__';
const ADD_NEW_EXPERIENCE_OPTION = '__add_new_experience__';
const LAT_LONG_INPUT_REGEX = /^-?\d*(\.\d*)?$/;
const PINCODE_INPUT_REGEX = /^\d*$/;

// Helper functions to sanitize pasted input
const sanitizeLatLong = (value: string): string => {
  // Extract only digits, decimal points, and minus signs
  let sanitized = value.replace(/[^\d.-]/g, '');
  
  // Handle minus sign: only allow at the start
  const hasMinus = sanitized.includes('-');
  if (hasMinus) {
    sanitized = sanitized.replace(/-/g, '');
    // Only add minus at start if original had it at start
    if (value.trim().startsWith('-')) {
      sanitized = '-' + sanitized;
    }
  }
  
  // Handle decimal point: only allow one
  const parts = sanitized.split('.');
  if (parts.length > 2) {
    sanitized = parts[0] + '.' + parts.slice(1).join('');
  }
  
  return sanitized;
};

const sanitizePostalCode = (value: string): string => {
  // Extract only digits
  return value.replace(/\D/g, '');
};

// Helper function to check if a visitor_type is "External Booking"
const isExternalBookingType = (visitorType: string): boolean => {
  if (!visitorType) return false;
  const lower = visitorType.toLowerCase();
  // Check if it contains "external" (which would match "External Booking", "external booking", etc.)
  return lower.includes('external');
};

// Helper function to determine onlineBookingAvailable based on fees
const calculateOnlineBookingAvailable = (fees: HeritageSiteFeeBreakup[], entryType: 'free' | 'paid'): boolean => {
  if (entryType === 'free') return false;
  // Only enable online booking when at least one non-external ticket exists
  const hasRegularTicket = fees.some(
    (fee) => fee.visitor_type && !isExternalBookingType(fee.visitor_type)
  );
  return hasRegularTicket;
};

const createInitialOpeningHours = (): HeritageSiteOpeningHours => ({
  schedule: DAY_ORDER.map<HeritageSiteOpeningDay>((day) => ({
    day,
    is_open: day !== 'Sunday',
    opening_time: '09:00',
    closing_time: '18:00',
  })),
  notes: null,
});

// Accessibility options will be loaded from masterdata

const initialFormState: AddHeritageSiteState = {
  overview: {
    siteName: '',
    siteShortDescription: '',
    siteFullDescription: '',
    locationAddress: '',
    locationCity: '',
    locationState: '',
    locationCountry: 'India',
    locationPostalCode: '',
    latitude: '',
    longitude: '',
    media: [],
    video360Url: '',
    arModeAvailable: false,
    openingHours: createInitialOpeningHours(),
    accessibility: [],
    siteType: null,
    experience: [],
    photographyAllowed: 'free',
    photographyAmount: '',
  },
  translations: {
    siteName: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    shortDescription: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    fullDescription: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    address: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    city: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    state: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    country: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    overview: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
    history: { en: '', hi: '', gu: '', ja: '', es: '', fr: '' },
  },
  audioGuides: LANGUAGES.map((lang) => ({
    language: lang.code,
    url: '',
    duration_seconds: null,
    file_name: null,
    file: undefined,
    id: `audio-${lang.code}`,
  })),
    siteMapFile: null,
    siteMapPreviewUrl: null,
    etiquettes: [],
    ticketing: {
    entryType: 'paid',
    bookingUrl: '',
    onlineBookingAvailable: true,
    fees: [
      { visitor_type: 'Adult (18-60 years)', amount: 150, notes: '' },
      { visitor_type: 'Child (5-17 years)', amount: 50, notes: '' },
    ],
  },
  transport: [
    { mode: 'metro', name: 'Ahmedabad Metro', distance_km: 35, notes: 'Nearest major metro connection', route_info: '', accessibility_notes: '' },
    { mode: 'bus', name: 'Modhera Village Bus Stand', distance_km: 0.5, notes: 'Frequent local buses available', route_info: '', accessibility_notes: '' },
    { mode: 'taxi', name: 'Modhera Village Auto Stand', distance_km: 0.3, notes: 'Taxi and auto services', route_info: '', accessibility_notes: '' },
  ],
  nearbyAttractions: [
    { name: 'Sun Temple Museum', distance_km: 0.2, notes: '' },
    { name: 'Maataji Temple', distance_km: 1.5, notes: '' },
  ],
  transportTranslations: {},
  attractionTranslations: {},
  admin: {
    saveOption: 'draft',
    notes: '',
  },
  autoTranslate: {
    enabled: true,
    sourceLanguage: 'en',
  },
};

const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return '';
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})(?:\?|&|$)/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  const shortMatch = url.match(/youtu\.be\/([0-9A-Za-z_-]{11})/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return url;
};

const AddHeritageSite = () => {
  const navigate = useNavigate();
  const { siteId: siteIdParam } = useParams();
  const numericSiteId = siteIdParam ? Number(siteIdParam) : null;
  const isEdit = Number.isFinite(numericSiteId);
  const { user } = useAuth(); // Get current logged-in user

  const [formState, setFormState] = useState<AddHeritageSiteState>(initialFormState);
  const [initialLoading, setInitialLoading] = useState<boolean>(Boolean(isEdit));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StepKey>('overview');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>(Boolean(isEdit) ? 'idle' : 'saved');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>(isEdit ? 'Loading site details…' : 'All changes saved');
  const [toastVisible, setToastVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [transportLanguageTab, setTransportLanguageTab] = useState<Record<number, LanguageCode>>({}); // Per-transport language tab
  const [attractionLanguageTab, setAttractionLanguageTab] = useState<Record<number, LanguageCode>>({}); // Per-attraction language tab
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const [uploadingMedia, setUploadingMedia] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadingVideo, setUploadingVideo] = useState<boolean>(false);
  const [accessibilityOptions, setAccessibilityOptions] = useState<MasterData[]>([]);
  const [showAddAccessibility, setShowAddAccessibility] = useState<boolean>(false);
  const [newAccessibilityTranslations, setNewAccessibilityTranslations] = useState<Record<LanguageCode, { displayName: string; description: string }>>({
    en: { displayName: '', description: '' },
    hi: { displayName: '', description: '' },
    gu: { displayName: '', description: '' },
    ja: { displayName: '', description: '' },
    es: { displayName: '', description: '' },
    fr: { displayName: '', description: '' },
  });
  const [creatingAccessibility, setCreatingAccessibility] = useState<boolean>(false);
  const [translatingAccessibility, setTranslatingAccessibility] = useState<boolean>(false);
  
  // Site Type and Experience options from masterdata
  const [siteTypeOptions, setSiteTypeOptions] = useState<MasterData[]>([]);
  const [experienceOptions, setExperienceOptions] = useState<MasterData[]>([]);
  const [showAddSiteType, setShowAddSiteType] = useState<boolean>(false);
  const [showAddExperience, setShowAddExperience] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<{ latitude: string; longitude: string; postalCode: string }>({
    latitude: '',
    longitude: '',
    postalCode: '',
  });
  const [geocoding, setGeocoding] = useState<boolean>(false);
  const [newSiteTypeTranslations, setNewSiteTypeTranslations] = useState<Record<LanguageCode, { displayName: string; description: string }>>({
    en: { displayName: '', description: '' },
    hi: { displayName: '', description: '' },
    gu: { displayName: '', description: '' },
    ja: { displayName: '', description: '' },
    es: { displayName: '', description: '' },
    fr: { displayName: '', description: '' },
  });
  const [newExperienceTranslations, setNewExperienceTranslations] = useState<Record<LanguageCode, { displayName: string; description: string }>>({
    en: { displayName: '', description: '' },
    hi: { displayName: '', description: '' },
    gu: { displayName: '', description: '' },
    ja: { displayName: '', description: '' },
    es: { displayName: '', description: '' },
    fr: { displayName: '', description: '' },
  });
  const [creatingSiteType, setCreatingSiteType] = useState<boolean>(false);
  const [creatingExperience, setCreatingExperience] = useState<boolean>(false);
  const [translatingSiteType, setTranslatingSiteType] = useState<boolean>(false);
  const [translatingExperience, setTranslatingExperience] = useState<boolean>(false);
  
  // Etiquette options from masterdata
  const [etiquetteOptions, setEtiquetteOptions] = useState<MasterData[]>([]);
  const [showAddEtiquette, setShowAddEtiquette] = useState<boolean>(false);
  const [newEtiquetteTranslations, setNewEtiquetteTranslations] = useState<Record<LanguageCode, { displayName: string; description: string }>>({
    en: { displayName: '', description: '' },
    hi: { displayName: '', description: '' },
    gu: { displayName: '', description: '' },
    ja: { displayName: '', description: '' },
    es: { displayName: '', description: '' },
    fr: { displayName: '', description: '' },
  });
  const [creatingEtiquette, setCreatingEtiquette] = useState<boolean>(false);
  const [translatingEtiquette, setTranslatingEtiquette] = useState<boolean>(false);

  // Ticket Type options from masterdata
  const [ticketTypeOptions, setTicketTypeOptions] = useState<MasterData[]>([]);
  const [showAddTicketType, setShowAddTicketType] = useState<boolean>(false);
  const [newTicketTypeTranslations, setNewTicketTypeTranslations] = useState<Record<LanguageCode, { displayName: string; description: string }>>({
    en: { displayName: '', description: '' },
    hi: { displayName: '', description: '' },
    gu: { displayName: '', description: '' },
    ja: { displayName: '', description: '' },
    es: { displayName: '', description: '' },
    fr: { displayName: '', description: '' },
  });
  const [creatingTicketType, setCreatingTicketType] = useState<boolean>(false);
  const [translatingTicketType, setTranslatingTicketType] = useState<boolean>(false);

  useEffect(() => {
    if (autoSaveStatus === 'saving') {
      const timer = setTimeout(() => {
        setAutoSaveStatus('saved');
        setAutoSaveMessage(`Auto-saved at ${format(new Date(), 'HH:mm:ss')}`);
        setToastVisible(true);
        const toastTimer = setTimeout(() => setToastVisible(false), 2500);
        return () => clearTimeout(toastTimer);
      }, 900);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [autoSaveStatus]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (markDirtyTimerRef.current) {
        clearTimeout(markDirtyTimerRef.current);
      }
      // Cleanup transport/attraction translation timers
      Object.values(transportAttractionTranslationTimerRef.current).forEach(timer => {
        if (timer) clearTimeout(timer);
      });
      // Cleanup accessibility translation timer
      if (accessibilityTranslationTimerRef.current) {
        clearTimeout(accessibilityTranslationTimerRef.current);
      }
    };
  }, []);

  // Debounce timer for auto-save to prevent focus loss
  const markDirtyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const markDirty = useCallback(() => {
    // Clear existing timer
    if (markDirtyTimerRef.current) {
      clearTimeout(markDirtyTimerRef.current);
    }
    
    // Set new timer - only mark as saving after user stops typing for 500ms
    markDirtyTimerRef.current = setTimeout(() => {
    setAutoSaveStatus('saving');
    }, 500);
  }, []);

  // Auto-translate function using Translation Service
  const autoTranslateText = useCallback(async (text: string, targetLang: LanguageCode, sourceLang: LanguageCode = 'en') => {
    if (!text || !text.trim() || targetLang === sourceLang) return text;
    
    try {
      console.log(`🔄 Translating "${text.substring(0, 50)}..." from ${sourceLang.toUpperCase()} to ${targetLang.toUpperCase()}`);
      
      const result = await TranslationService.translate(
        text,
        targetLang,
        sourceLang // source language
      );

      if (!result.success || !result.translations) {
        console.warn('Translation failed, using original text:', result.error);
        return text;
      }

      // Get the translated text for the target language
      const translated = result.translations[targetLang]?.[0];
      
      if (!translated) {
        console.warn(`No translation found for ${targetLang}, using original text`);
        return text;
      }

      console.log(`✅ Translation successful: "${translated.substring(0, 50)}..."`);
      return translated;
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  }, []);

  // Helper function to update translation for a specific field
  const updateTranslation = useCallback((field: keyof AddHeritageSiteState['translations'], lang: LanguageCode, value: string) => {
    setFormState(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [field]: {
          ...prev.translations[field],
          [lang]: value,
        },
      },
    }));
  }, []);

  // Debounce timer ref for translation
  const translationTimerRef = React.useRef<Record<string, NodeJS.Timeout>>({});
  
  // Debounce timer ref for transport/attraction translations
  const transportAttractionTranslationTimerRef = React.useRef<Record<string, NodeJS.Timeout>>({});
  
  // Debounce timer ref for accessibility translations
  const accessibilityTranslationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-translate a single field to all other languages (debounced)
  const autoTranslateField = useCallback((text: string, field: keyof AddHeritageSiteState['translations'], sourceLang: LanguageCode = 'en') => {
    if (!formState.autoTranslate.enabled || !text.trim()) return;
    
    // Clear existing timer for this field and language combination
    const timerKey = `${field}_${sourceLang}`;
    if (translationTimerRef.current[timerKey]) {
      clearTimeout(translationTimerRef.current[timerKey]);
    }

    // Set new timer - translate after 1 second of no typing
    translationTimerRef.current[timerKey] = setTimeout(async () => {
      // Get all languages except the source language
      const targetLanguages = LANGUAGES.filter(l => l.code !== sourceLang);
      
      // Always translate to all target languages when text changes
      // This ensures translations are updated when source text is modified
      if (targetLanguages.length === 0) {
        console.log(`⚠️ No target languages to translate for field "${field}"`);
        return;
      }

      // Mark field as translating
      setTranslatingFields(prev => new Set(prev).add(field));
      
      console.log(`🌐 Starting translation for field "${field}" from ${sourceLang.toUpperCase()} to ${targetLanguages.length} language(s)...`);
      
      // Translate to all target languages
      for (const lang of targetLanguages) {
        const translated = await autoTranslateText(text, lang.code, sourceLang);
        updateTranslation(field, lang.code, translated);
      }
      
      console.log(`✅ Translation complete for field "${field}" - updated ${targetLanguages.length} language(s)`);
      
      // Remove field from translating state
      setTranslatingFields(prev => {
        const next = new Set(prev);
        next.delete(field);
        return next;
      });
    }, 1000); // 1 second debounce
  }, [formState.autoTranslate.enabled, autoTranslateText, updateTranslation]);

  // Helper to check if all translations are complete for a field
  const areTranslationsComplete = useCallback((field: keyof AddHeritageSiteState['translations']): boolean => {
    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
    return targetLanguages.every(lang => {
      const translation = formState.translations[field][lang.code];
      return translation && translation.trim() !== '';
    });
  }, [formState.translations]);

  const pageTitle = isEdit ? 'Edit Heritage Site' : 'Add New Heritage Site';
  const submitButtonLabel = isEdit ? 'Update Heritage Site' : 'Submit Heritage Site';

  const hydrateStateFromDetails = useCallback(
    (details: Awaited<ReturnType<typeof HeritageSiteService.getHeritageSiteDetails>>['data']) => {
      if (!details || !details.site) return;

      const site = details.site;

      const baseOpening = createInitialOpeningHours();
      
      // Map day numbers (1-7) to day names for matching
      const dayNumberToName: Record<number, string> = {
        1: 'Monday',
        2: 'Tuesday',
        3: 'Wednesday',
        4: 'Thursday',
        5: 'Friday',
        6: 'Saturday',
        7: 'Sunday',
      };
      
      // Convert day_of_week from number to day name string for mapping
      console.log('🕐 Loading visiting hours from database:', {
        visitingHoursCount: details.visitingHours?.length || 0,
        visitingHours: details.visitingHours,
      });
      
      const visitingMap = new Map(
        (details.visitingHours || []).map((item) => {
          // day_of_week can be number (1-7) or string (day name)
          const dayName = typeof item.day_of_week === 'number' 
            ? dayNumberToName[item.day_of_week] || DAY_ORDER[item.day_of_week - 1]
            : item.day_of_week;
          console.log('🕐 Mapping day:', { original: item.day_of_week, mapped: dayName, item });
          return [dayName.toLowerCase(), item];
        })
      );

      const schedule = baseOpening.schedule.map((day) => {
        const match = visitingMap.get(day.day.toLowerCase());
        if (!match) {
          console.log(`🕐 No match for ${day.day}, setting to closed`);
          return { ...day, is_open: false, opening_time: '09:00', closing_time: '18:00' };
        }

        const formatTime = (value: string | null) => {
          if (!value) return '09:00';
          return value.slice(0, 5);
        };

        // Database has is_closed (inverted), but we need is_open
        // If is_closed exists, use !is_closed, otherwise check is_open
        const matchAny = match as any; // Type assertion to handle both old and new field names
        const isOpen = matchAny.is_closed !== undefined ? !matchAny.is_closed : (matchAny.is_open ?? true);
        
        // Map database field names: open_time -> opening_time, close_time -> closing_time
        // Use !== null/undefined check to handle '00:00:00' properly
        const openingTime = matchAny.open_time !== null && matchAny.open_time !== undefined 
          ? matchAny.open_time 
          : matchAny.opening_time;
        const closingTime = matchAny.close_time !== null && matchAny.close_time !== undefined 
          ? matchAny.close_time 
          : matchAny.closing_time;

        console.log(`🕐 Match for ${day.day}:`, { isOpen, openingTime, closingTime, matchAny });

        return {
          ...day,
          is_open: isOpen,
          opening_time: openingTime !== null && openingTime !== undefined ? formatTime(openingTime) : '09:00',
          closing_time: closingTime !== null && closingTime !== undefined ? formatTime(closingTime) : '18:00',
        };
      });
      
      console.log('🕐 Final schedule:', schedule);

      // Filter out audio, document, and sitemap types (site maps are shown in site map section)
      const galleryMedia = (details.media || []).filter((item) => 
        item.media_type !== 'audio' && item.media_type !== 'document' && item.media_type !== 'sitemap'
      );
      
      console.log('📸 Loading gallery media from database:', {
        totalMediaItems: details.media?.length || 0,
        galleryItems: galleryMedia.length,
        audioItems: (details.media || []).filter(item => item.media_type === 'audio').length,
        documentItems: (details.media || []).filter(item => item.media_type === 'document').length,
        sitemapItems: (details.media || []).filter(item => item.media_type === 'sitemap').length,
        sampleItem: galleryMedia[0] // Log first item to see structure
      });
      
      const mediaState = galleryMedia.map((item, index) => {
        // Database column is 'media_url', but interface might have 'storage_url' for compatibility
        const mediaUrl = item.media_url || item.storage_url || '';
        
        // Extract filename from URL for label since 'label' column doesn't exist in DB
        let label = 'Image';
        if (mediaUrl) {
          try {
            const urlParts = mediaUrl.split('/');
            const filename = urlParts[urlParts.length - 1];
            // Remove timestamp prefix if present (e.g., "1234567890_filename.jpg" -> "filename.jpg")
            label = filename.replace(/^\d+_/, '');
          } catch (e) {
            label = `Media ${item.media_id}`;
          }
        }
        
        return {
          id: String(item.media_id ?? `${item.media_type}-${index}`),
          mediaId: item.media_id ? Number(item.media_id) : undefined,
          file: undefined,
          previewUrl: mediaUrl,
          label: label,
          isPrimary: Boolean(item.is_primary),
        };
      });
      
      console.log('📸 Processed media state:', {
        count: mediaState.length,
        items: mediaState.map(m => ({
          id: m.id,
          mediaId: m.mediaId,
          label: m.label,
          hasUrl: !!m.previewUrl,
          isPrimary: m.isPrimary
        }))
      });

      if (mediaState.length > 0 && !mediaState.some((item) => item.isPrimary)) {
        mediaState[0].isPrimary = true;
      }

      // Load audio guides - match by language_code if available, otherwise try to match by position/order
      const audioMediaItems = (details.media || []).filter((item) => item.media_type === 'audio');
      
      console.log('🎵 Loading audio guides from database:', {
        totalAudioItems: audioMediaItems.length,
        audioItems: audioMediaItems.map(m => ({
          media_id: m.media_id,
          language_code: m.language_code,
          media_url: m.media_url?.substring(0, 50) + '...',
        }))
      });

      const audioGuidesState: LocalAudioGuide[] = LANGUAGES.map((lang) => {
        // First try to match by language_code (preferred method)
        let match = audioMediaItems.find(
          (item) => item.media_type === 'audio' && (item.language_code || '').toLowerCase() === lang.code
        );
        
        // If no match by language_code and this is the first language (en), try to match first audio item
        // This handles backward compatibility for old records without language_code
        if (!match && lang.code === 'en' && audioMediaItems.length > 0) {
          const unmatchedAudio = audioMediaItems.find(
            (item) => !LANGUAGES.some(l => (item.language_code || '').toLowerCase() === l.code)
          );
          if (unmatchedAudio) {
            match = unmatchedAudio;
            console.log(`⚠️ Audio file for ${lang.code} matched by position (no language_code found)`);
          }
        }

        // Database column is 'media_url', but interface might have 'storage_url' for compatibility
        const mediaUrl = match ? (match.media_url || match.storage_url || '') : '';
        
        // Extract filename from URL for file_name since 'label' column doesn't exist
        let fileName: string | null = null;
        if (mediaUrl) {
          try {
            const urlParts = mediaUrl.split('/');
            fileName = urlParts[urlParts.length - 1].replace(/^\d+_/, '');
          } catch (e) {
            fileName = `audio_${lang.code}.mp3`;
          }
        }

        return {
          id: `audio-${lang.code}`,
          language: lang.code,
          url: mediaUrl,
          duration_seconds: match?.duration_seconds ?? null,
          file_name: fileName,
          file: undefined,
        };
      });
      
      console.log('🎵 Processed audio guides state:', {
        count: audioGuidesState.length,
        items: audioGuidesState.map(g => ({
          language: g.language,
          hasUrl: !!g.url,
          fileName: g.file_name
        }))
      });

      // Load site map from both site.site_map_url AND media table (media_type === 'sitemap')
      let siteMapUrl: string | null = null;
      let siteMapPreviewUrl: string | null = null;
      
      // First check media table for sitemap
      const siteMapMedia = (details.media || []).find(
        (item) => item.media_type === 'sitemap'
      );
      
      if (siteMapMedia) {
        siteMapUrl = siteMapMedia.media_url || siteMapMedia.storage_url || null;
        siteMapPreviewUrl = siteMapUrl;
        console.log('📄 Loaded site map from media table:', siteMapUrl);
      } else if (site.site_map_url) {
        // Fallback to site table
        siteMapUrl = site.site_map_url;
        siteMapPreviewUrl = site.site_map_url;
        console.log('📄 Loaded site map from site table:', site.site_map_url);
      }

      // Map ticket types from database schema (heritage_sitetickettype table)
      // Note: These will only be used if entry_type is 'paid'
      // Extract "External Booking" ticket type and populate bookingUrl
      // Priority: 1) Extract from External Booking ticket type, 2) Use site.booking_url
      let extractedBookingUrl = site.booking_url || '';
      let hasExternalBooking = false;
      const ticketFees: HeritageSiteFeeBreakup[] = (details.ticketTypes || [])
        .filter((ticket: any) => {
          // Check if this is an "External Booking" ticket type
          const ticketName = (ticket.ticket_name || '').toLowerCase();
          if (ticketName.includes('external') || ticketName.includes('booking')) {
            hasExternalBooking = true;
            // Extract URL from description if it exists
            if (ticket.description) {
              // Try to match URL pattern first
              const urlMatch = ticket.description.match(/https?:\/\/[^\s]+/);
              if (urlMatch) {
                extractedBookingUrl = urlMatch[0];
                console.log('✅ Extracted booking URL from ticket type description (URL pattern):', extractedBookingUrl);
              } else if (ticket.description.includes('Book online at:')) {
                // Try to extract URL from the description format "Book online at: https://..."
                const urlPart = ticket.description.split('Book online at:')[1]?.trim();
                if (urlPart) {
                  extractedBookingUrl = urlPart;
                  console.log('✅ Extracted booking URL from ticket type description (format):', extractedBookingUrl);
                }
              } else {
                // If description doesn't have URL pattern, use the description itself as URL
                // (in case it's stored directly as URL)
                const trimmedDesc = ticket.description.trim();
                if (trimmedDesc.startsWith('http://') || trimmedDesc.startsWith('https://')) {
                  extractedBookingUrl = trimmedDesc;
                  console.log('✅ Extracted booking URL from ticket type description (direct):', extractedBookingUrl);
                }
              }
            }
            return false; // Don't include External Booking in fees list
          }
          return true; // Include all other ticket types
        })
        .map((ticket: any) => ({
        visitor_type: ticket.ticket_name || ticket.visitor_type || 'General Entry', // Map ticket_name to visitor_type
        amount: ticket.price ?? ticket.amount ?? 0, // Map price to amount
        notes: ticket.description || ticket.notes || '', // Map description to notes
      }));
      
      console.log('🔗 Final extracted booking URL:', extractedBookingUrl || '(none)');
      console.log('🎫 Has External Booking ticket type:', hasExternalBooking);
      console.log('🎫 Total ticket types:', (details.ticketTypes || []).length);

      // Map transportation from database schema (heritage_sitetransportation table)
      // Database has: transport_type, route_info, duration_minutes, cost_range, accessibility_notes
      const transportOptions: HeritageSiteTransportOption[] = (details.transportation || [])
        .filter((item: any) => {
          const transportType = item.transport_type || item.mode || '';
          // Filter for actual transport types (not attractions)
          return transportType !== 'attraction' && transportType.toLowerCase() !== 'attraction';
        })
        .map((item: any) => {
          const transportType = item.transport_type || item.mode || 'other';
          const routeInfo = item.route_info || item.name || '';
          
          // Extract distance from database field or route_info if it contains "km away"
          let distanceKm = item.distance_km;
          // Check if distance field exists (text type in database)
          if (!distanceKm && item.distance) {
            distanceKm = parseFloat(item.distance);
            // If parsing fails, set to undefined
            if (isNaN(distanceKm)) {
              distanceKm = undefined;
            }
          }
          // Fallback: extract from route_info if it contains "km away"
          if (!distanceKm && routeInfo) {
            const match = routeInfo.match(/(\d+(?:\.\d+)?)\s*km/i);
            if (match) {
              distanceKm = parseFloat(match[1]);
            }
          }
          
          // Extract name from route_info (before the dash or just use the whole thing)
          let name = routeInfo;
          if (routeInfo.includes(' - ')) {
            name = routeInfo.split(' - ')[0].trim();
          }
          
          return {
            mode: transportType,
            name: name,
            distance_km: distanceKm || undefined,
            notes: item.notes || '',
            route_info: item.route_info || '',
            accessibility_notes: item.accessibility_notes || '',
          };
        });

      // Load transportation translations
      const transportTranslationsMap: Record<number, Record<LanguageCode, { name?: string; route_info?: string; accessibility_notes?: string }>> = {};
      (details.transportation || []).forEach((transport: any, index: number) => {
        if (transport.transportation_id && transport.transport_type !== 'attraction') {
          const transportId = transport.transportation_id;
          const translations = (details.transportationTranslations || []).filter(
            (t: any) => t.transportation_id === transportId
          );
          
          const langMap: Record<LanguageCode, { name?: string; route_info?: string; accessibility_notes?: string }> = {} as any;
          LANGUAGES.forEach(lang => {
            const translation = translations.find((t: any) => (t.language_code || '').toUpperCase() === lang.code.toUpperCase());
            langMap[lang.code] = {
              name: translation?.name || undefined,
              route_info: translation?.route_info || undefined,
              accessibility_notes: translation?.accessibility_notes || undefined,
            };
          });
          
          transportTranslationsMap[index] = langMap;
        }
      });

      // Map nearby attractions from separate attractions table
      const nearbyAttractions: HeritageSiteAttraction[] = (details.attractions || []).map((item: any) => ({
        name: item.name || '',
        distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : undefined,
        notes: item.notes || '',
      }));

      // Load attraction translations
      const attractionTranslationsMap: Record<number, Record<LanguageCode, { name?: string; notes?: string }>> = {};
      (details.attractions || []).forEach((attraction: any, index: number) => {
        if (attraction.attraction_id) {
          const attractionId = attraction.attraction_id;
          const translations = (details.attractionTranslations || []).filter(
            (t: any) => t.attraction_id === attractionId
          );
          
          const langMap: Record<LanguageCode, { name?: string; notes?: string }> = {} as any;
          LANGUAGES.forEach(lang => {
            const translation = translations.find((t: any) => (t.language_code || '').toUpperCase() === lang.code.toUpperCase());
            langMap[lang.code] = {
              name: translation?.name || undefined,
              notes: translation?.notes || undefined,
            };
          });
          
          attractionTranslationsMap[index] = langMap;
        }
        });

      const overviewTranslations = {
        ...initialFormState.translations.overview,
        ...(site.overview_translations ?? {}),
      } as Record<LanguageCode, string>;

      const historyTranslations = {
        ...initialFormState.translations.history,
        ...(site.history_translations ?? {}),
      } as Record<LanguageCode, string>;

      // Initialize new translation structure
      const siteNameTranslations = { ...initialFormState.translations.siteName };
      const shortDescTranslations = { ...initialFormState.translations.shortDescription };
      const fullDescTranslations = { ...initialFormState.translations.fullDescription };
      const addressTranslations = { ...initialFormState.translations.address };
      const cityTranslations = { ...initialFormState.translations.city };
      const stateTranslations = { ...initialFormState.translations.state };
      const countryTranslations = { ...initialFormState.translations.country };

      // Load existing translations from database
      (details.translations || []).forEach((translation: any) => {
        const langCode = (translation.language_code || '').toLowerCase() as LanguageCode;
        
        if (!LANGUAGES.find(l => l.code === langCode)) return;

        // Map database fields to translation state
        if (translation.name) {
          siteNameTranslations[langCode] = translation.name;
        }
        if (translation.short_desc) {
          shortDescTranslations[langCode] = translation.short_desc;
        }
        if (translation.full_desc) {
          fullDescTranslations[langCode] = translation.full_desc;
        }
        if (translation.address) {
          addressTranslations[langCode] = translation.address;
        }
        if (translation.city) {
          cityTranslations[langCode] = translation.city;
        }
        if (translation.state) {
          stateTranslations[langCode] = translation.state;
        }
        if (translation.country) {
          countryTranslations[langCode] = translation.country;
        }
      });

      // Always sync English translations with main site data (main fields are the source of truth for English)
      // This ensures English translations are always connected to main fields
      if (site.name_default) {
        siteNameTranslations.en = site.name_default;
      }
      if (site.short_desc_default) {
        shortDescTranslations.en = site.short_desc_default;
      }
      if (site.full_desc_default) {
        fullDescTranslations.en = site.full_desc_default;
      }
      
      // Get English translation for location data as default
      // Cast to any since the translation type includes address, city, state, country fields
      const englishTranslation = (details.translations || []).find(
        (t: any) => t.language_code?.toUpperCase() === 'EN'
      ) as any;
      
      // Sync location fields with English translations from database
      if (englishTranslation) {
        if (englishTranslation.address) {
          addressTranslations.en = englishTranslation.address;
        }
        if (englishTranslation.city) {
          cityTranslations.en = englishTranslation.city;
        }
        if (englishTranslation.state) {
          stateTranslations.en = englishTranslation.state;
        }
        if (englishTranslation.country) {
          countryTranslations.en = englishTranslation.country;
        }
      }
      
      // Also sync from main location fields if translation is missing (main fields are source of truth)
      if (site.location_address && !addressTranslations.en) {
        addressTranslations.en = site.location_address;
      }
      if (site.location_city && !cityTranslations.en) {
        cityTranslations.en = site.location_city;
      }
      if (site.location_state && !stateTranslations.en) {
        stateTranslations.en = site.location_state;
      }
      if (site.location_country && !countryTranslations.en) {
        countryTranslations.en = site.location_country;
      }

      console.log('🌐 Loaded translations from database:', {
        siteName: siteNameTranslations,
        shortDesc: shortDescTranslations,
        fullDesc: fullDescTranslations,
        address: addressTranslations,
        city: cityTranslations,
        state: stateTranslations,
        country: countryTranslations,
      });
      
      console.log('🏤 English translation from database:', englishTranslation);
      console.log('🏤 Postal code from English translation:', englishTranslation?.postal_code);
      console.log('🏤 Postal code from site table:', site.location_postal_code);

      // Determine entry type: prioritize site.entry_type from database, fallback to ticket types if not set
      // If entry_type is explicitly set in database, use it; otherwise check ticket types
      const hasTicketTypes = (details.ticketTypes || []).length > 0;
      let entryType: 'free' | 'paid' = 'free';
      if (site.entry_type) {
        // Use the value directly from the database column
        entryType = (site.entry_type as 'free' | 'paid') || 'free';
      } else {
        // Fallback: if no entry_type in database, check if ticket types exist
        entryType = hasTicketTypes ? 'paid' : 'free';
      }
      
      console.log('🎫 Entry type determined:', {
        siteEntryType: site.entry_type,
        hasTicketTypes,
        finalEntryType: entryType
      });

      // Load accessibility codes from site.accessibility column (array of codes)
      // Parse accessibility as JSON array if it's a string, otherwise use as array
      let accessibilityCodes: string[] = [];
      if (site.accessibility) {
        if (typeof site.accessibility === 'string') {
          try {
            accessibilityCodes = JSON.parse(site.accessibility);
          } catch (e) {
            // If parsing fails, treat as comma-separated string
            accessibilityCodes = site.accessibility.split(',').map((code: string) => code.trim()).filter(Boolean);
          }
        } else if (Array.isArray(site.accessibility)) {
          accessibilityCodes = site.accessibility;
        }
      }

      // Load site_type code from site.site_type column (single code)
      const siteTypeCode = site.site_type || null;

      // Load experience codes from site.experience column (array of codes)
      // Parse experience as JSON array if it's a string, otherwise use as array
      let experienceCodes: string[] = [];
      if ((site as any).experience) {
        if (typeof (site as any).experience === 'string') {
          try {
            experienceCodes = JSON.parse((site as any).experience);
          } catch (e) {
            // If parsing fails, treat as comma-separated string or single value
            const experienceValue = (site as any).experience;
            if (experienceValue.includes(',')) {
              experienceCodes = experienceValue.split(',').map((code: string) => code.trim()).filter(Boolean);
            } else {
              experienceCodes = [experienceValue.trim()].filter(Boolean);
            }
          }
        } else if (Array.isArray((site as any).experience)) {
          experienceCodes = (site as any).experience;
        } else {
          // Fallback: if it's a single value, convert to array
          experienceCodes = [(site as any).experience].filter(Boolean);
        }
      }

      // Load etiquette codes from site.etiquettes column (array of codes)
      // Parse etiquettes as JSON array if it's a string, otherwise use as array
      let etiquetteCodes: string[] = [];
      if ((site as any).etiquettes) {
        if (typeof (site as any).etiquettes === 'string') {
          try {
            etiquetteCodes = JSON.parse((site as any).etiquettes);
          } catch (e) {
            // If parsing fails, treat as comma-separated string
            etiquetteCodes = (site as any).etiquettes.split(',').map((code: string) => code.trim()).filter(Boolean);
          }
        } else if (Array.isArray((site as any).etiquettes)) {
          etiquetteCodes = (site as any).etiquettes;
        }
      }

      const hydratedState: AddHeritageSiteState = {
        overview: {
          ...initialFormState.overview,
          siteName: site.name_default ?? '',
          siteShortDescription: site.short_desc_default ?? '',
          siteFullDescription: site.full_desc_default ?? '',
          // Use English translation as default if main site table doesn't have location data
          locationAddress: site.location_address || englishTranslation?.address || '',
          locationCity: site.location_city || englishTranslation?.city || '',
          locationState: site.location_state || englishTranslation?.state || '',
          locationCountry: site.location_country || englishTranslation?.country || '',
          locationPostalCode: site.location_postal_code || englishTranslation?.postal_code || '',
          latitude: site.latitude !== null && site.latitude !== undefined ? String(site.latitude) : '',
          longitude: site.longitude !== null && site.longitude !== undefined ? String(site.longitude) : '',
          media: mediaState,
          video360Url: site.video_360_url ?? site.vr_link ?? '',
          arModeAvailable: Boolean(site.ar_mode_available),
          openingHours: {
            schedule,
            notes: null,
          },
          accessibility: accessibilityCodes,
          siteType: siteTypeCode,
          experience: experienceCodes,
          photographyAllowed: (site.photography_allowed as 'free' | 'paid' | 'restricted') || 'free',
          photographyAmount: site.photograph_amount !== null && site.photograph_amount !== undefined ? String(site.photograph_amount) : '',
        },
        translations: {
          siteName: siteNameTranslations,
          shortDescription: shortDescTranslations,
          fullDescription: fullDescTranslations,
          address: addressTranslations,
          city: cityTranslations,
          state: stateTranslations,
          country: countryTranslations,
          overview: overviewTranslations,
          history: historyTranslations,
        },
        audioGuides: audioGuidesState,
        siteMapFile: null,
        siteMapPreviewUrl: siteMapPreviewUrl,
        etiquettes: etiquetteCodes,
        ticketing: {
          entryType,
          bookingUrl: extractedBookingUrl || site.booking_url || '',
          // Determine online booking availability:
          // - Enable only when at least one non-external ticket type exists
          // - For free entries, toggle should always be OFF
          fees: entryType === 'paid' 
            ? (ticketFees.length > 0 ? ticketFees : [])
              : [],
          onlineBookingAvailable: calculateOnlineBookingAvailable(
            entryType === 'paid' ? (ticketFees.length > 0 ? ticketFees : []) : [],
            entryType
          ),
        },
        transport: transportOptions,
        nearbyAttractions,
        transportTranslations: transportTranslationsMap,
        attractionTranslations: attractionTranslationsMap,
        admin: {
          saveOption: !site.is_active ? 'draft' : 'approval', // Use is_active instead of status
          notes: '',
        },
        autoTranslate: {
          enabled: true,
          sourceLanguage: 'en',
        },
      };

      setFormState(hydratedState);
      setAutoSaveStatus('saved');
      setAutoSaveMessage('All changes saved');
      setToastVisible(false);
      setInitialLoading(false);
      setLoadError(null);
    },
    []
  );

  // Fetch accessibility options from masterdata with English display names
  // The codes are stored in the database, but we display the English display_name from masterdata
  useEffect(() => {
    const fetchAccessibilityOptions = async () => {
      try {
        const options = await MasterDataService.getMasterDataByCategory('accessibility', 'EN');
        setAccessibilityOptions(options);
        console.log('✅ Loaded accessibility options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));
      } catch (error) {
        console.error('Error fetching accessibility options:', error);
      }
    };
    fetchAccessibilityOptions();
  }, []);

  // Fetch site type options from masterdata with English display names
  useEffect(() => {
    const fetchSiteTypeOptions = async () => {
      try {
        const options = await MasterDataService.getMasterDataByCategory('site_type', 'EN');
        setSiteTypeOptions(options);
        console.log('✅ Loaded site type options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));
      } catch (error) {
        console.error('Error fetching site type options:', error);
      }
    };
    fetchSiteTypeOptions();
  }, []);

  // Fetch experience options from masterdata with English display names
  useEffect(() => {
    const fetchExperienceOptions = async () => {
      try {
        const options = await MasterDataService.getMasterDataByCategory('experience', 'EN');
        setExperienceOptions(options);
        console.log('✅ Loaded experience options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));
      } catch (error) {
        console.error('Error fetching experience options:', error);
      }
    };
    fetchExperienceOptions();
  }, []);

  // Fetch etiquette options from masterdata with English display names
  useEffect(() => {
    const fetchEtiquetteOptions = async () => {
      try {
        const options = await MasterDataService.getMasterDataByCategory('etiquette', 'EN');
        setEtiquetteOptions(options);
        console.log('✅ Loaded etiquette options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));
      } catch (error) {
        console.error('Error fetching etiquette options:', error);
      }
    };
    fetchEtiquetteOptions();
  }, []);

  // Fetch ticket type options from masterdata with English display names
  useEffect(() => {
    const fetchTicketTypeOptions = async () => {
      try {
        const options = await MasterDataService.getMasterDataByCategory('ticket_type', 'EN');
        setTicketTypeOptions(options);
        console.log('✅ Loaded ticket type options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));
      } catch (error) {
        console.error('Error fetching ticket type options:', error);
      }
    };
    fetchTicketTypeOptions();
  }, []);

  useEffect(() => {
    if (!isEdit || numericSiteId === null) {
      setInitialLoading(false);
      return;
    }

    let isMounted = true;
    setInitialLoading(true);
    setLoadError(null);

    HeritageSiteService.getHeritageSiteDetails(numericSiteId)
      .then((response) => {
        if (!isMounted) return;
        if (!response.success || !response.data || !response.data.site) {
          const message = response.error?.message || 'Failed to load heritage site.';
          setLoadError(message);
          setInitialLoading(false);
          return;
        }
        hydrateStateFromDetails(response.data);
      })
      .catch((error) => {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : 'Failed to load heritage site.');
        setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isEdit, numericSiteId, hydrateStateFromDetails]);

  const handleStepChange = (step: StepKey) => {
    setCurrentStep(step);
  };

  const handleNext = () => {
    const currentIndex = STEP_CONFIG.findIndex((step) => step.key === currentStep);
    if (currentIndex < STEP_CONFIG.length - 1) {
      setCurrentStep(STEP_CONFIG[currentIndex + 1].key);
    }
  };

  const handlePrev = () => {
    const currentIndex = STEP_CONFIG.findIndex((step) => step.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(STEP_CONFIG[currentIndex - 1].key);
    }
  };

  // Helper to sync English translations with main fields
  const syncEnglishTranslation = (field: 'siteName' | 'siteShortDescription' | 'siteFullDescription' | 'locationAddress' | 'locationCity' | 'locationState' | 'locationCountry', value: string) => {
    const translationFieldMap: Record<typeof field, keyof AddHeritageSiteState['translations']> = {
      siteName: 'siteName',
      siteShortDescription: 'shortDescription',
      siteFullDescription: 'fullDescription',
      locationAddress: 'address',
      locationCity: 'city',
      locationState: 'state',
      locationCountry: 'country',
    };
    
    const translationField = translationFieldMap[field];
    if (translationField) {
      setFormState((prev) => ({
        ...prev,
        translations: {
          ...prev.translations,
          [translationField]: {
            ...prev.translations[translationField],
            en: value, // Always sync English translation with main field
          },
        },
      }));
    }
  };

  const updateOverviewField = <K extends keyof AddHeritageSiteState['overview']>(key: K, value: AddHeritageSiteState['overview'][K]) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        [key]: value,
      },
    }));
    
    // Sync English translations with main fields
    if (typeof value === 'string') {
      if (key === 'siteName') {
        syncEnglishTranslation('siteName', value);
      } else if (key === 'siteShortDescription') {
        syncEnglishTranslation('siteShortDescription', value);
      } else if (key === 'siteFullDescription') {
        syncEnglishTranslation('siteFullDescription', value);
      } else if (key === 'locationAddress') {
        syncEnglishTranslation('locationAddress', value);
      } else if (key === 'locationCity') {
        syncEnglishTranslation('locationCity', value);
      } else if (key === 'locationState') {
        syncEnglishTranslation('locationState', value);
      } else if (key === 'locationCountry') {
        syncEnglishTranslation('locationCountry', value);
      }
    }
  };

  const handleLatitudeChange = (value: string) => {
    // Sanitize the input to allow pasting
    const sanitized = sanitizeLatLong(value);
    if (sanitized === '' || LAT_LONG_INPUT_REGEX.test(sanitized)) {
      updateOverviewField('latitude', sanitized);
      setFieldErrors((prev) => ({ ...prev, latitude: '' }));
    }
  };

  const handleLongitudeChange = (value: string) => {
    // Sanitize the input to allow pasting
    const sanitized = sanitizeLatLong(value);
    if (sanitized === '' || LAT_LONG_INPUT_REGEX.test(sanitized)) {
      updateOverviewField('longitude', sanitized);
      setFieldErrors((prev) => ({ ...prev, longitude: '' }));
    }
  };

  const handlePostalCodeChange = (value: string) => {
    // Sanitize the input to allow pasting
    const sanitized = sanitizePostalCode(value);
    if (sanitized === '' || PINCODE_INPUT_REGEX.test(sanitized)) {
      updateOverviewField('locationPostalCode', sanitized);
      setFieldErrors((prev) => ({ ...prev, postalCode: '' }));
    }
  };

  const validateLatitude = () => {
    const value = formState.overview.latitude;
    if (!value) {
      setFieldErrors((prev) => ({ ...prev, latitude: '' }));
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < -90 || numeric > 90) {
      setFieldErrors((prev) => ({ ...prev, latitude: 'Latitude must be between -90 and 90.' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, latitude: '' }));
    }
  };

  const validateLongitude = () => {
    const value = formState.overview.longitude;
    if (!value) {
      setFieldErrors((prev) => ({ ...prev, longitude: '' }));
      return;
    }
    const numeric = Number(value);
    if (Number.isNaN(numeric) || numeric < -180 || numeric > 180) {
      setFieldErrors((prev) => ({ ...prev, longitude: 'Longitude must be between -180 and 180.' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, longitude: '' }));
    }
  };

  const validatePostalCode = () => {
    const value = formState.overview.locationPostalCode;
    if (!value) {
      setFieldErrors((prev) => ({ ...prev, postalCode: '' }));
      return;
    }
    if (!PINCODE_INPUT_REGEX.test(value)) {
      setFieldErrors((prev) => ({ ...prev, postalCode: 'Pincode must contain only digits.' }));
    } else {
      setFieldErrors((prev) => ({ ...prev, postalCode: '' }));
    }
  };

  const handlePinOnMap = async () => {
    const address = formState.overview.locationAddress.trim();
    if (!address) {
      alert('Please enter an address first');
      return;
    }

    setGeocoding(true);
    try {
      const result = await geocodeAddress(address);

      if (result) {
        const { lat, lng, city, state, postalCode } = result;

        // Update form state with geocoded data
        setFormState((prev) => ({
          ...prev,
          overview: {
            ...prev.overview,
            latitude: String(lat),
            longitude: String(lng),
            locationCity: city || prev.overview.locationCity,
            locationState: state || prev.overview.locationState,
            locationPostalCode: postalCode || prev.overview.locationPostalCode,
          },
        }));

        // Sync translations for city and state
        if (city) {
          syncEnglishTranslation('locationCity', city);
          autoTranslateField(city, 'city');
        }
        if (state) {
          syncEnglishTranslation('locationState', state);
          autoTranslateField(state, 'state');
        }

        markDirty();
        console.log('📍 Geocoded address:', { lat, lng, city, state, postalCode });
      } else {
        alert('Could not find location for this address. Please try a different address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to geocode address. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const updateOpeningDay = (day: string, updates: Partial<HeritageSiteOpeningDay>) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        openingHours: {
          ...prev.overview.openingHours,
          schedule: prev.overview.openingHours.schedule.map((item) =>
            item.day === day
              ? {
                  ...item,
                  ...updates,
                }
              : item
          ),
        },
      },
    }));
  };

  const toggleDay = (day: string) => {
    const target = formState.overview.openingHours.schedule.find((item) => item.day === day);
    if (!target) return;
    updateOpeningDay(day, {
      is_open: !target.is_open,
    });
  };

  const handleMediaFiles = async (files: FileList | File[]) => {
    if (files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate file sizes first
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];
    
    fileArray.forEach((file) => {
      const validation = StorageService.validateFileSize(file);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        invalidFiles.push(validation.error || `${file.name} is too large`);
      }
    });

    // Show error for invalid files
    if (invalidFiles.length > 0) {
      const errorMessage = invalidFiles.join('\n');
      alert(`⚠️ Some files were rejected:\n\n${errorMessage}\n\n${validFiles.length} valid file(s) will be staged for upload.`);
      
      if (validFiles.length === 0) {
        return; // No valid files to upload
      }
    }
    
    // Both add and edit mode: Just add to state with preview URLs (will upload on submit)
    const mapped: LocalMediaItem[] = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      label: file.name,
      isPrimary: false,
    }));

    markDirty();
    setFormState((prev) => {
      const shouldSetPrimary = prev.overview.media.length === 0 && mapped.length > 0;
      return {
        ...prev,
        overview: {
          ...prev.overview,
          media: [...prev.overview.media, ...mapped].map((item, index) =>
            shouldSetPrimary && index === 0
              ? {
                  ...item,
                  isPrimary: true,
                }
              : item
          ),
        },
      };
    });
  };

  const removeMediaItem = async (id: string) => {
    const item = formState.overview.media.find((m) => m.id === id);
    if (!item) return;

    // If item exists in database (has mediaId and no file), delete from storage and database immediately
    if (item.mediaId && !item.file && item.previewUrl && isEdit) {
      const confirmDelete = window.confirm(
        'Are you sure you want to delete this image? This action cannot be undone.'
      );
      
      if (!confirmDelete) return;

      setUploadingMedia(true);
      setUploadProgress('Deleting image from database...');

      try {
        const result = await StorageService.deleteMediaItem(item.mediaId, item.previewUrl);
        
        if (!result.success) {
          console.error('Failed to delete media:', result.error);
          alert('Failed to delete image. Please try again.');
          setUploadingMedia(false);
          setUploadProgress('');
          return;
        }

        console.log('✅ Media deleted successfully from database');
      } catch (error) {
        console.error('Error deleting media:', error);
        alert('Failed to delete image. Please try again.');
        setUploadingMedia(false);
        setUploadProgress('');
        return;
      } finally {
        setUploadingMedia(false);
        setUploadProgress('');
      }
    }

    // Remove from state (for both pending files and database items)
    markDirty();
    setFormState((prev) => {
      const filtered = prev.overview.media.filter((item) => item.id !== id);
      
      // Ensure at least one item is primary if items remain
      if (filtered.length > 0 && !filtered.some((item) => item.isPrimary)) {
        filtered[0].isPrimary = true;
        
        // Only update in database if it's an existing item (not a pending file)
        if (filtered[0].mediaId && !filtered[0].file && isEdit && numericSiteId) {
          StorageService.updatePrimaryMedia(numericSiteId, filtered[0].mediaId);
        }
      }
      
      return {
        ...prev,
        overview: {
          ...prev.overview,
          media: filtered,
        },
      };
    });
  };

  const togglePrimaryMedia = async (id: string) => {
    const item = formState.overview.media.find((m) => m.id === id);
    
    // Only update in database if it's an existing item (has mediaId and no pending file)
    if (item?.mediaId && !item.file && isEdit && numericSiteId) {
      setUploadingMedia(true);
      setUploadProgress('Updating primary image...');

      try {
        const result = await StorageService.updatePrimaryMedia(numericSiteId, item.mediaId);
        
        if (!result.success) {
          console.error('Failed to update primary media:', result.error);
          alert('Failed to update primary image. Please try again.');
          setUploadingMedia(false);
          setUploadProgress('');
          return;
        }

        console.log('✅ Primary media updated successfully in database');
      } catch (error) {
        console.error('Error updating primary media:', error);
        alert('Failed to update primary image. Please try again.');
      } finally {
        setUploadingMedia(false);
        setUploadProgress('');
      }
    }

    // Update state (for both pending files and database items)
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        media: prev.overview.media.map((item) => ({
          ...item,
          isPrimary: item.id === id,
        })),
      },
    }));
  };

  const updateAudioGuide = (language: LanguageCode, updates: Partial<LocalAudioGuide>) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      audioGuides: prev.audioGuides.map((guide) =>
        guide.language === language
          ? {
              ...guide,
              ...updates,
            }
          : guide
      ),
    }));
  };

  const handleAudioFile = (language: LanguageCode, fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    updateAudioGuide(language, {
      file,
      file_name: file.name,
      url: '',
    });
  };

  const removeAudioFile = (language: LanguageCode) => {
    updateAudioGuide(language, {
      file: undefined,
      file_name: null,
      url: '',
      duration_seconds: null,
    });
  };

  const toggleAccessibility = (code: string) => {
    markDirty();
    setFormState((prev) => {
      const currentCodes = prev.overview.accessibility || [];
      const isSelected = currentCodes.includes(code);
      return {
      ...prev,
      overview: {
        ...prev.overview,
          accessibility: isSelected
            ? currentCodes.filter((c) => c !== code)
            : [...currentCodes, code],
        },
      };
    });
  };

  const toggleEtiquette = (code: string) => {
    markDirty();
    setFormState((prev) => {
      const currentCodes = prev.etiquettes || [];
      const isSelected = currentCodes.includes(code);
      return {
        ...prev,
        etiquettes: isSelected
          ? currentCodes.filter((c) => c !== code)
          : [...currentCodes, code],
      };
    });
  };

  const handleCreateAccessibility = async () => {
    // Validate that English display name is provided
    if (!newAccessibilityTranslations.en.displayName.trim()) {
      alert('Please enter an English display name');
      return;
    }

    setCreatingAccessibility(true);
    try {
      // Auto-generate code from English display name
      const englishName = newAccessibilityTranslations.en.displayName.trim();
      const generatedCode = englishName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
      
      if (!generatedCode) {
        throw new Error('Unable to generate code from English display name. Please use alphanumeric characters.');
      }

      console.log('🔑 Auto-generated code from English name:', {
        englishName,
        generatedCode,
      });

      // Get the next display order
      const maxDisplayOrder = accessibilityOptions.length > 0
        ? Math.max(...accessibilityOptions.map(opt => opt.display_order || 0))
        : 0;

      // Get logged-in user ID
      const userId = user?.user_id || null;
      console.log('👤 Creating accessibility option with user ID:', userId);

      // Create master data item with logged-in user ID
      const createResult = await MasterDataService.createMasterData(
        'accessibility',
        generatedCode,
        maxDisplayOrder + 1,
        { icon: 'accessibility' }, // Default icon
        userId // Pass logged-in user ID
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error?.message || 'Failed to create accessibility option');
      }

      const masterId = createResult.data.master_id;

      // Create translations for all languages
      // If English translation exists, auto-translate to other languages if they're empty
      // Note: englishName is already declared above when generating the code
      const englishDesc = newAccessibilityTranslations.en.description.trim();
      
      const translationPromises = LANGUAGES.map(async lang => {
        let displayName: string;
        let description: string;
        
        if (lang.code === 'en') {
          // For English, ALWAYS use the explicitly entered English display name (never the code)
          displayName = englishName;
          description = englishDesc;
        } else {
          // For other languages, use translation if available, otherwise auto-translate
          const translation = newAccessibilityTranslations[lang.code];
          displayName = translation.displayName.trim();
          description = translation.description.trim();
          
          // If translation is empty and English exists, auto-translate
          if (!displayName && englishName) {
            try {
              displayName = await autoTranslateText(englishName, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate display name to ${lang.code}:`, error);
              displayName = englishName; // Fallback to English
            }
          }
          
          if (!description && englishDesc) {
            try {
              description = await autoTranslateText(englishDesc, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate description to ${lang.code}:`, error);
              description = englishDesc; // Fallback to English
            }
          }
        }
        
        // Only create translation if display name exists and is not empty
        if (displayName && displayName.trim()) {
          console.log(`📝 Creating translation for ${lang.code.toUpperCase()}:`, {
            masterId,
            languageCode: lang.code.toUpperCase(),
            displayName,
            description: description || '(empty)',
          });
          
          const result = await MasterDataService.upsertTranslation(
            masterId,
            lang.code.toUpperCase(),
            displayName,
            description || undefined
          );
          
          if (!result.success) {
            console.error(`❌ Failed to create translation for ${lang.code.toUpperCase()}:`, result.error);
          } else {
            console.log(`✅ Successfully created translation for ${lang.code.toUpperCase()}:`, result.data);
          }
          
          return result;
        } else {
          console.warn(`⚠️ Skipping translation for ${lang.code.toUpperCase()} - display name is empty`);
          return { success: true, data: null, error: null };
        }
      });

      const translationResults = await Promise.all(translationPromises);
      const failedTranslations = translationResults.filter(r => !r.success);
      
      if (failedTranslations.length > 0) {
        console.error('❌ Some translations failed:', failedTranslations);
        const errorMessages = failedTranslations
          .map(f => f.error ? (typeof f.error === 'object' && 'message' in f.error ? f.error.message : JSON.stringify(f.error)) : 'Unknown error')
          .join(', ');
        throw new Error(`Failed to create ${failedTranslations.length} translation(s): ${errorMessages}`);
      } else {
        console.log(`✅ All ${translationResults.length} translations created successfully`);
      }

      // Refresh accessibility options with English display names
      const options = await MasterDataService.getMasterDataByCategory('accessibility', 'EN');
      setAccessibilityOptions(options);
      console.log('✅ Refreshed accessibility options with English display names:', options.map(o => ({ code: o.code, display_name: o.display_name })));

      // Reset form
      setNewAccessibilityTranslations({
        en: { displayName: '', description: '' },
        hi: { displayName: '', description: '' },
        gu: { displayName: '', description: '' },
        ja: { displayName: '', description: '' },
        es: { displayName: '', description: '' },
        fr: { displayName: '', description: '' },
      });
      setShowAddAccessibility(false);

      // Auto-select the newly created option using the generated code
      toggleAccessibility(generatedCode);
    } catch (error) {
      console.error('Error creating accessibility option:', error);
      alert(`Failed to create accessibility option: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingAccessibility(false);
    }
  };

  const handleCreateSiteType = async () => {
    // Validate that English display name is provided
    if (!newSiteTypeTranslations.en.displayName.trim()) {
      alert('Please enter an English display name');
      return;
    }

    setCreatingSiteType(true);
    try {
      // Auto-generate code from English display name
      const englishName = newSiteTypeTranslations.en.displayName.trim();
      const generatedCode = englishName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      if (!generatedCode) {
        throw new Error('Unable to generate code from English display name. Please use alphanumeric characters.');
      }

      console.log('🔑 Auto-generated site type code from English name:', {
        englishName,
        generatedCode,
      });

      // Get the next display order
      const maxDisplayOrder = siteTypeOptions.length > 0
        ? Math.max(...siteTypeOptions.map(opt => opt.display_order || 0))
        : 0;

      // Get logged-in user ID
      const userId = user?.user_id || null;
      console.log('👤 Creating site type with user ID:', userId);

      // Create master data item
      const createResult = await MasterDataService.createMasterData(
        'site_type',
        generatedCode,
        maxDisplayOrder + 1,
        { icon: 'site_type' },
        userId
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error?.message || 'Failed to create site type');
      }

      const masterId = createResult.data.master_id;
      const englishDesc = newSiteTypeTranslations.en.description.trim();
      
      // Create translations for all languages
      const translationPromises = LANGUAGES.map(async lang => {
        let displayName: string;
        let description: string;
        
        if (lang.code === 'en') {
          displayName = englishName;
          description = englishDesc;
        } else {
          const translation = newSiteTypeTranslations[lang.code];
          displayName = translation.displayName.trim();
          description = translation.description.trim();
          
          if (!displayName && englishName) {
            try {
              displayName = await autoTranslateText(englishName, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate display name to ${lang.code}:`, error);
              displayName = englishName;
            }
          }
          
          if (!description && englishDesc) {
            try {
              description = await autoTranslateText(englishDesc, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate description to ${lang.code}:`, error);
              description = englishDesc;
            }
          }
        }
        
        if (displayName && displayName.trim()) {
          const result = await MasterDataService.upsertTranslation(
            masterId,
            lang.code.toUpperCase(),
            displayName,
            description || undefined
          );
          return result;
        } else {
          return { success: true, data: null, error: null };
        }
      });

      await Promise.all(translationPromises);

      // Refresh site type options
      const options = await MasterDataService.getMasterDataByCategory('site_type', 'EN');
      setSiteTypeOptions(options);

      // Reset form
      setNewSiteTypeTranslations({
        en: { displayName: '', description: '' },
        hi: { displayName: '', description: '' },
        gu: { displayName: '', description: '' },
        ja: { displayName: '', description: '' },
        es: { displayName: '', description: '' },
        fr: { displayName: '', description: '' },
      });
      setShowAddSiteType(false);

      // Auto-select the newly created option
      updateOverviewField('siteType', generatedCode);
    } catch (error) {
      console.error('Error creating site type:', error);
      alert(`Failed to create site type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingSiteType(false);
    }
  };

  const handleCreateExperience = async () => {
    // Validate that English display name is provided
    if (!newExperienceTranslations.en.displayName.trim()) {
      alert('Please enter an English display name');
      return;
    }

    setCreatingExperience(true);
    try {
      // Auto-generate code from English display name
      const englishName = newExperienceTranslations.en.displayName.trim();
      const generatedCode = englishName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      if (!generatedCode) {
        throw new Error('Unable to generate code from English display name. Please use alphanumeric characters.');
      }

      console.log('🔑 Auto-generated experience code from English name:', {
        englishName,
        generatedCode,
      });

      // Get the next display order
      const maxDisplayOrder = experienceOptions.length > 0
        ? Math.max(...experienceOptions.map(opt => opt.display_order || 0))
        : 0;

      // Get logged-in user ID
      const userId = user?.user_id || null;
      console.log('👤 Creating experience with user ID:', userId);

      // Create master data item
      const createResult = await MasterDataService.createMasterData(
        'experience',
        generatedCode,
        maxDisplayOrder + 1,
        { icon: 'experience' },
        userId
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error?.message || 'Failed to create experience');
      }

      const masterId = createResult.data.master_id;
      const englishDesc = newExperienceTranslations.en.description.trim();
      
      // Create translations for all languages
      const translationPromises = LANGUAGES.map(async lang => {
        let displayName: string;
        let description: string;
        
        if (lang.code === 'en') {
          displayName = englishName;
          description = englishDesc;
        } else {
          const translation = newExperienceTranslations[lang.code];
          displayName = translation.displayName.trim();
          description = translation.description.trim();
          
          if (!displayName && englishName) {
            try {
              displayName = await autoTranslateText(englishName, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate display name to ${lang.code}:`, error);
              displayName = englishName;
            }
          }
          
          if (!description && englishDesc) {
            try {
              description = await autoTranslateText(englishDesc, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate description to ${lang.code}:`, error);
              description = englishDesc;
            }
          }
        }
        
        if (displayName && displayName.trim()) {
          const result = await MasterDataService.upsertTranslation(
            masterId,
            lang.code.toUpperCase(),
            displayName,
            description || undefined
          );
          return result;
        } else {
          return { success: true, data: null, error: null };
        }
      });

      await Promise.all(translationPromises);

      // Refresh experience options
      const options = await MasterDataService.getMasterDataByCategory('experience', 'EN');
      setExperienceOptions(options);

      // Reset form
      setNewExperienceTranslations({
        en: { displayName: '', description: '' },
        hi: { displayName: '', description: '' },
        gu: { displayName: '', description: '' },
        ja: { displayName: '', description: '' },
        es: { displayName: '', description: '' },
        fr: { displayName: '', description: '' },
      });
      setShowAddExperience(false);

      // Auto-select the newly created option by adding it to the array
      setFormState((prev) => {
        const currentExperiences = prev.overview.experience || [];
        if (!currentExperiences.includes(generatedCode)) {
          markDirty();
          return {
            ...prev,
            overview: {
              ...prev.overview,
              experience: [...currentExperiences, generatedCode],
            },
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error creating experience:', error);
      alert(`Failed to create experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingExperience(false);
    }
  };

  const handleCreateEtiquette = async () => {
    // Validate that English display name is provided
    if (!newEtiquetteTranslations.en.displayName.trim()) {
      alert('Please enter an English display name');
      return;
    }

    setCreatingEtiquette(true);
    try {
      // Auto-generate code from English display name
      const englishName = newEtiquetteTranslations.en.displayName.trim();
      const generatedCode = englishName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      if (!generatedCode) {
        throw new Error('Unable to generate code from English display name. Please use alphanumeric characters.');
      }

      console.log('🔑 Auto-generated etiquette code from English name:', {
        englishName,
        generatedCode,
      });

      // Get the next display order
      const maxDisplayOrder = etiquetteOptions.length > 0
        ? Math.max(...etiquetteOptions.map(opt => opt.display_order || 0))
        : 0;

      // Get logged-in user ID
      const userId = user?.user_id || null;
      console.log('👤 Creating etiquette with user ID:', userId);

      // Create master data item
      const createResult = await MasterDataService.createMasterData(
        'etiquette',
        generatedCode,
        maxDisplayOrder + 1,
        { icon: 'etiquette' },
        userId
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error?.message || 'Failed to create etiquette');
      }

      const masterId = createResult.data.master_id;
      const englishDesc = newEtiquetteTranslations.en.description.trim();
      
      // Create translations for all languages
      const translationPromises = LANGUAGES.map(async lang => {
        let displayName: string;
        let description: string;
        
        if (lang.code === 'en') {
          displayName = englishName;
          description = englishDesc;
        } else {
          const translation = newEtiquetteTranslations[lang.code];
          displayName = translation.displayName.trim();
          description = translation.description.trim();
          
          if (!displayName && englishName) {
            try {
              displayName = await autoTranslateText(englishName, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate display name to ${lang.code}:`, error);
              displayName = englishName;
            }
          }
          
          if (!description && englishDesc) {
            try {
              description = await autoTranslateText(englishDesc, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate description to ${lang.code}:`, error);
              description = englishDesc;
            }
          }
        }
        
        if (displayName && displayName.trim()) {
          const result = await MasterDataService.upsertTranslation(
            masterId,
            lang.code.toUpperCase(),
            displayName,
            description || undefined
          );
          return result;
        } else {
          return { success: true, data: null, error: null };
        }
      });

      await Promise.all(translationPromises);

      // Refresh etiquette options
      const options = await MasterDataService.getMasterDataByCategory('etiquette', 'EN');
      setEtiquetteOptions(options);

      // Reset form
      setNewEtiquetteTranslations({
        en: { displayName: '', description: '' },
        hi: { displayName: '', description: '' },
        gu: { displayName: '', description: '' },
        ja: { displayName: '', description: '' },
        es: { displayName: '', description: '' },
        fr: { displayName: '', description: '' },
      });
      setShowAddEtiquette(false);

      // Auto-select the newly created option
      setFormState(prev => ({
        ...prev,
        etiquettes: [...(prev.etiquettes || []), generatedCode],
      }));
    } catch (error) {
      console.error('Error creating etiquette:', error);
      alert(`Failed to create etiquette: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingEtiquette(false);
    }
  };

  const handleCreateTicketType = async () => {
    // Validate that English display name is provided
    if (!newTicketTypeTranslations.en.displayName.trim()) {
      alert('Please enter an English display name');
      return;
    }

    setCreatingTicketType(true);
    try {
      // Auto-generate code from English display name
      const englishName = newTicketTypeTranslations.en.displayName.trim();
      const generatedCode = englishName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      if (!generatedCode) {
        throw new Error('Unable to generate code from English display name. Please use alphanumeric characters.');
      }

      console.log('🔑 Auto-generated ticket type code from English name:', {
        englishName,
        generatedCode,
      });

      // Get the next display order
      const maxDisplayOrder = ticketTypeOptions.length > 0
        ? Math.max(...ticketTypeOptions.map(opt => opt.display_order || 0))
        : 0;

      // Get logged-in user ID
      const userId = user?.user_id || null;
      console.log('👤 Creating ticket type with user ID:', userId);

      // Create master data item
      const createResult = await MasterDataService.createMasterData(
        'ticket_type',
        generatedCode,
        maxDisplayOrder + 1,
        { icon: 'ticket_type' },
        userId
      );

      if (!createResult.success || !createResult.data) {
        throw new Error(createResult.error?.message || 'Failed to create ticket type');
      }

      const masterId = createResult.data.master_id;
      const englishDesc = newTicketTypeTranslations.en.description.trim();
      
      // Create translations for all languages
      const translationPromises = LANGUAGES.map(async lang => {
        let displayName: string;
        let description: string;
        
        if (lang.code === 'en') {
          displayName = englishName;
          description = englishDesc;
        } else {
          const translation = newTicketTypeTranslations[lang.code];
          displayName = translation.displayName.trim();
          description = translation.description.trim();
          
          if (!displayName && englishName) {
            try {
              displayName = await autoTranslateText(englishName, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate display name to ${lang.code}:`, error);
              displayName = englishName;
            }
          }
          
          if (!description && englishDesc) {
            try {
              description = await autoTranslateText(englishDesc, lang.code, 'en');
            } catch (error) {
              console.warn(`Failed to auto-translate description to ${lang.code}:`, error);
              description = englishDesc;
            }
          }
        }
        
        if (displayName && displayName.trim()) {
          const result = await MasterDataService.upsertTranslation(
            masterId,
            lang.code.toUpperCase(),
            displayName,
            description || undefined
          );
          return result;
        } else {
          return { success: true, data: null, error: null };
        }
      });

      await Promise.all(translationPromises);

      // Refresh ticket type options
      const options = await MasterDataService.getMasterDataByCategory('ticket_type', 'EN');
      setTicketTypeOptions(options);

      // Reset form
      setNewTicketTypeTranslations({
        en: { displayName: '', description: '' },
        hi: { displayName: '', description: '' },
        gu: { displayName: '', description: '' },
        ja: { displayName: '', description: '' },
        es: { displayName: '', description: '' },
        fr: { displayName: '', description: '' },
      });
      setShowAddTicketType(false);
    } catch (error) {
      console.error('Error creating ticket type:', error);
      alert(`Failed to create ticket type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCreatingTicketType(false);
    }
  };

  const updateTicketField = <K extends keyof AddHeritageSiteState['ticketing']>(
    key: K,
    value: AddHeritageSiteState['ticketing'][K]
  ) => {
    // Update state immediately (no debounce here to prevent focus loss)
    setFormState((prev) => {
      const newTicketing = {
        ...prev.ticketing,
        [key]: value,
      };
      // If entryType changes, recalculate onlineBookingAvailable
      if (key === 'entryType') {
        newTicketing.onlineBookingAvailable = calculateOnlineBookingAvailable(
          newTicketing.fees,
          value as 'free' | 'paid'
        );
      }
      return {
        ...prev,
        ticketing: newTicketing,
      };
    });
    // Debounce markDirty to prevent focus loss
    markDirty();
  };

  const updateFee = (index: number, updates: Partial<HeritageSiteFeeBreakup>) => {
    // Update state immediately (no debounce here to prevent focus loss)
    setFormState((prev) => {
      const updatedFees = prev.ticketing.fees.map((fee, idx) => (idx === index ? { ...fee, ...updates } : fee));
      // Recalculate onlineBookingAvailable based on updated fees
      const newOnlineBookingAvailable = calculateOnlineBookingAvailable(updatedFees, prev.ticketing.entryType);
      return {
        ...prev,
        ticketing: {
          ...prev.ticketing,
          fees: updatedFees,
          onlineBookingAvailable: newOnlineBookingAvailable,
        },
      };
    });
    // Debounce markDirty to prevent focus loss
    markDirty();
  };

  const addFee = () => {
    markDirty();
    setFormState((prev) => {
      const updatedFees = [
        ...prev.ticketing.fees,
        {
          visitor_type: 'New visitor type',
          amount: 0,
          notes: '',
        },
      ];
      // Recalculate onlineBookingAvailable based on updated fees
      const newOnlineBookingAvailable = calculateOnlineBookingAvailable(updatedFees, prev.ticketing.entryType);
      return {
        ...prev,
        ticketing: {
          ...prev.ticketing,
          fees: updatedFees,
          onlineBookingAvailable: newOnlineBookingAvailable,
        },
      };
    });
  };

  const removeFee = (index: number) => {
    markDirty();
    setFormState((prev) => {
      const updatedFees = prev.ticketing.fees.filter((_, idx) => idx !== index);
      // Recalculate onlineBookingAvailable based on updated fees
      const newOnlineBookingAvailable = calculateOnlineBookingAvailable(updatedFees, prev.ticketing.entryType);
      return {
        ...prev,
        ticketing: {
          ...prev.ticketing,
          fees: updatedFees,
          onlineBookingAvailable: newOnlineBookingAvailable,
        },
      };
    });
  };

  const addTransport = () => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      transport: [
        ...prev.transport,
        { mode: 'custom', name: '', distance_km: null, notes: '', route_info: '', accessibility_notes: '' },
      ],
    }));
  };

  const updateTransport = (index: number, updates: Partial<HeritageSiteTransportOption & { route_info?: string; accessibility_notes?: string }>) => {
    // Update state immediately (no debounce here to prevent focus loss)
    setFormState((prev) => ({
      ...prev,
      transport: prev.transport.map((item, idx) => (idx === index ? { ...item, ...updates } : item)),
    }));
    // Debounce markDirty to prevent focus loss
    markDirty();
  };

  const removeTransport = (index: number) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      transport: prev.transport.filter((_, idx) => idx !== index),
    }));
  };

  const addNearbyAttraction = () => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: [
        ...prev.nearbyAttractions,
        { name: '', distance_km: null, notes: '' },
      ],
    }));
  };

  const updateNearbyAttraction = (index: number, updates: Partial<HeritageSiteAttraction>) => {
    // Update state immediately (no debounce here to prevent focus loss)
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.map((item, idx) =>
        idx === index ? { ...item, ...updates } : item
      ),
    }));
    // Debounce markDirty to prevent focus loss
    markDirty();
  };

  const removeNearbyAttraction = (index: number) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.filter((_, idx) => idx !== index),
    }));
  };

  const handleSiteMapUpload = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    markDirty();
    setFormState((prev) => ({
      ...prev,
      siteMapFile: file,
      siteMapPreviewUrl: URL.createObjectURL(file),
    }));
  };

  const handleVideoUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    try {
      setUploadingVideo(true);
      const targetFolder = isEdit && numericSiteId
        ? `sites/${numericSiteId}/vr-link`
        : `sites/new-${Date.now()}/vr-link`;
      const result = await StorageService.uploadFile(file, targetFolder);
      if (!result.success || !result.url) {
        throw new Error(result.error || 'Unable to upload video');
      }
      updateOverviewField('video360Url', result.url);
    } catch (error) {
      console.error('Video upload failed:', error);
      alert('Failed to upload video. Please try again.');
    } finally {
      setUploadingVideo(false);
    }
  };

  const clearSiteMap = () => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      siteMapFile: null,
      siteMapPreviewUrl: null,
    }));
  };

  const updateAdminField = <K extends keyof AddHeritageSiteState['admin']>(key: K, value: AddHeritageSiteState['admin'][K]) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      admin: {
        ...prev.admin,
        [key]: value,
      },
    }));
  };

  const completionSummary = useMemo(() => {
    const completed: string[] = [];
    const missing: string[] = [];

    if (formState.overview.siteName.trim()) {
      completed.push('Basic Information');
    } else {
      missing.push('Site name');
    }

    if (formState.overview.locationAddress.trim()) {
      completed.push('Location Details');
    } else {
      missing.push('Location address');
    }

    if (formState.overview.media.length > 0) {
      completed.push('Media Gallery');
    } else {
      missing.push('Upload at least one media item');
    }

    if (formState.overview.openingHours.schedule.some((day) => day.is_open)) {
      completed.push('Opening Hours');
    } else {
      missing.push('Opening hours schedule');
    }

    if (formState.ticketing.entryType === 'free' || formState.ticketing.fees.length > 0) {
      completed.push('Entry Fees');
    } else {
      missing.push('Entry fee structure');
    }

    const missingAudio = formState.audioGuides.filter((guide) => !guide.file && !guide.url);
    if (missingAudio.length === 0) {
      completed.push('Audio Guides');
    } else {
      missing.push(`${missingAudio.length} audio guides missing`);
    }

    return { completed, missing };
  }, [formState]);

  // Helper to build request with uploaded URLs (for add mode)
  const buildCreateRequestWithUrls = (
    uploadedUrls: Map<string, string>,
    uploadedAudioUrls?: Map<string, string>
  ): CreateHeritageSiteRequest => {
    const status = formState.admin.saveOption === 'draft' ? 'draft' : 'pending_review';
    const isActive = formState.admin.saveOption === 'approval';

    const galleryMedia: HeritageSiteMediaInput[] = formState.overview.media
      .map((item, index) => {
        const determineType = (): 'image' | 'audio' | 'video' | 'document' => {
          if (item.file) {
            if (item.file.type.startsWith('image/')) return 'image';
            if (item.file.type.startsWith('audio/')) return 'audio';
            if (item.file.type.startsWith('video/')) return 'video';
          }
          return 'image';
        };

        // Priority: 1) Uploaded URL from Supabase, 2) Existing previewUrl (from database)
        const uploadedUrl = uploadedUrls.get(item.id);
        const mediaUrl = uploadedUrl || item.previewUrl || '';
        
        if (uploadedUrl) {
          console.log(`✅ Using uploaded Supabase URL for ${item.label}:`, uploadedUrl.substring(0, 80) + '...');
        } else if (item.previewUrl && !item.previewUrl.startsWith('blob:')) {
          console.log(`✅ Using existing database URL for ${item.label}:`, item.previewUrl.substring(0, 80) + '...');
        } else if (item.previewUrl) {
          console.warn(`⚠️ Warning: Using local blob URL for ${item.label} - this should not happen!`);
        }

        return {
          media_type: determineType(),
          media_url: mediaUrl,
          thumbnail_url: mediaUrl || null,
          label: item.label || null,
          language_code: item.file?.type.startsWith('audio/') ? 'en' : null,
          duration_seconds: null,
          is_primary: item.isPrimary ?? index === 0,
          position: index + 1,
        };
      })
      .filter((item) => item.media_url && !item.media_url.startsWith('blob:'));

    // Build audio media items - use uploaded URLs if available, otherwise use existing URLs from state
    const audioMedia: HeritageSiteMediaInput[] = formState.audioGuides
      .map((guide, index) => {
        // Priority: 1) Uploaded URL from map, 2) Existing URL from state
        const uploadedAudioUrl = uploadedAudioUrls?.get(guide.language);
        const audioUrl = uploadedAudioUrl || guide.url || '';
        
        if (uploadedAudioUrl) {
          console.log(`✅ Using uploaded audio URL for ${guide.language}:`, uploadedAudioUrl.substring(0, 80) + '...');
        } else if (guide.url) {
          console.log(`✅ Using existing audio URL for ${guide.language}:`, guide.url.substring(0, 80) + '...');
        }
        
        return {
        media_type: 'audio' as const,
          media_url: audioUrl,
        thumbnail_url: null,
        label: guide.file?.name || guide.file_name || `Audio guide (${guide.language.toUpperCase()})`,
        language_code: guide.language,
        duration_seconds: guide.duration_seconds ?? null,
        is_primary: false,
        position: galleryMedia.length + index + 1,
        };
      })
      .filter((item) => item.media_url && item.media_url.length > 0 && !item.media_url.startsWith('blob:'));

    const mediaItems: HeritageSiteMediaInput[] = [...galleryMedia, ...audioMedia];

    // Add site map as a media item if it exists (for edit mode with existing site map)
    if (formState.siteMapPreviewUrl && !formState.siteMapFile && !formState.siteMapPreviewUrl.startsWith('blob:')) {
      // Check if site map is not already in media items (to avoid duplicates)
      const siteMapExists = mediaItems.some(m => m.media_url === formState.siteMapPreviewUrl);
      
      if (!siteMapExists) {
        console.log('📄 Adding existing site map to media items:', formState.siteMapPreviewUrl);
        mediaItems.push({
          media_type: 'sitemap',
          media_url: formState.siteMapPreviewUrl,
          thumbnail_url: null,
          label: 'Site Map',
          language_code: null,
          duration_seconds: null,
          is_primary: false,
          position: mediaItems.length + 1,
        });
      }
    }

    if (mediaItems.length > 0 && !mediaItems.some((item) => item.is_primary)) {
      mediaItems[0].is_primary = true;
    }

    console.log('📸 Media items being sent to backend (with uploaded URLs):', {
      count: mediaItems.length,
      galleryMedia: galleryMedia.length,
      audioMedia: audioMedia.length,
      uploadedFromMap: uploadedUrls.size,
      uploadedAudioFromMap: uploadedAudioUrls?.size || 0,
      items: mediaItems.map(m => ({ 
        type: m.media_type, 
        url: m.media_url?.substring(0, 80) + '...', 
        urlLength: m.media_url?.length,
        language: m.language_code,
        isPrimary: m.is_primary,
        position: m.position
      }))
    });

    if (mediaItems.length === 0) {
      console.warn('⚠️ No media items in request! Check if files were uploaded correctly.');
    }

    return buildRequestCore(mediaItems, status, isActive);
  };

  const buildCreateRequest = (): CreateHeritageSiteRequest => {
    const status = formState.admin.saveOption === 'draft' ? 'draft' : 'pending_review';
    const isActive = formState.admin.saveOption === 'approval';

    const galleryMedia: HeritageSiteMediaInput[] = formState.overview.media
      .map((item, index) => {
        const determineType = (): 'image' | 'audio' | 'video' | 'document' => {
          if (item.file) {
            if (item.file.type.startsWith('image/')) return 'image';
            if (item.file.type.startsWith('audio/')) return 'audio';
            if (item.file.type.startsWith('video/')) return 'video';
          }
          return 'image';
        };

        return {
          media_type: determineType(),
          media_url: item.previewUrl || '',
          thumbnail_url: item.previewUrl || null, // Not in database but kept for interface
          label: item.label || null, // Not in database but kept for interface
          language_code: item.file?.type.startsWith('audio/') ? 'en' : null, // Not in database but kept for interface
          duration_seconds: null, // Not in database
          is_primary: item.isPrimary ?? index === 0,
          position: index + 1, // Actual database column
        };
      })
      .filter((item) => item.media_url);

    const audioMedia: HeritageSiteMediaInput[] = formState.audioGuides
      .filter((guide) => Boolean(guide.url))
      .map((guide, index) => ({
        media_type: 'audio' as const,
        media_url: guide.url || '',
        thumbnail_url: null,
        label: guide.file?.name || guide.file_name || `Audio guide (${guide.language.toUpperCase()})`,
        language_code: guide.language,
        duration_seconds: guide.duration_seconds ?? null,
        is_primary: false,
        position: galleryMedia.length + index + 1, // Continue position numbering after gallery media
      }))
      .filter((item) => item.media_url);

    const mediaItems: HeritageSiteMediaInput[] = [...galleryMedia, ...audioMedia];

    // Add site map as a media item if it exists (for edit mode with existing site map)
    if (formState.siteMapPreviewUrl && !formState.siteMapFile && !formState.siteMapPreviewUrl.startsWith('blob:')) {
      // Check if site map is not already in media items (to avoid duplicates)
      const siteMapExists = mediaItems.some(m => m.media_url === formState.siteMapPreviewUrl);
      
      if (!siteMapExists) {
        console.log('📄 Adding existing site map to media items:', formState.siteMapPreviewUrl);
        mediaItems.push({
          media_type: 'sitemap',
          media_url: formState.siteMapPreviewUrl,
          thumbnail_url: null,
          label: 'Site Map',
          language_code: null,
          duration_seconds: null,
          is_primary: false,
          position: mediaItems.length + 1,
        });
      }
    }

    // Ensure at least one media item is marked as primary (hero image)
    if (mediaItems.length > 0 && !mediaItems.some((item) => item.is_primary)) {
      mediaItems[0].is_primary = true;
    }

    return buildRequestCore(mediaItems, status, isActive);
  };

  // Core function to build the request payload
  const buildRequestCore = (mediaItems: HeritageSiteMediaInput[], status: 'draft' | 'pending_review', isActive: boolean): CreateHeritageSiteRequest => {
    const site: HeritageSiteCoreInput = {
      name_default: formState.overview.siteName.trim(),
      short_desc_default: formState.overview.siteShortDescription.trim() || null,
      full_desc_default: formState.overview.siteFullDescription.trim() || null,
      // city, state, country are stored in heritage_sitetranslation table, NOT in main table
      city: formState.overview.locationCity.trim() || null,
      state: formState.overview.locationState.trim() || null,
      country: formState.overview.locationCountry.trim() || null,
      latitude: formState.overview.latitude ? Number(formState.overview.latitude) : null,
      longitude: formState.overview.longitude ? Number(formState.overview.longitude) : null,
      vr_link: formState.overview.video360Url.trim() || null,
      qr_link: null,
      meta_title_def: null,
      meta_description_def: null,
      is_active: isActive,
      // Store site_type and experience codes from masterdata
      // The codes are stored in the database, and English display names are fetched from masterdata for display
      site_type: formState.overview.siteType || null,
      // Store experience codes as text[] array (e.g., ["vr", "audio_guide"])
      // The codes are stored in the database as a PostgreSQL text[] array
      // English display names are fetched from masterdata for display in the UI
      experience: formState.overview.experience.length > 0 
        ? formState.overview.experience 
        : (null as string[] | null),
      // Store accessibility codes as text[] array (e.g., ["wheelchair", "sign_language"])
      // The codes are stored in the database as a PostgreSQL text[] array
      // English display names are fetched from masterdata for display in the UI
      accessibility: formState.overview.accessibility.length > 0 
        ? formState.overview.accessibility 
        : (null as string[] | null),
      entry_type: formState.ticketing.entryType,
      entry_fee: formState.ticketing.entryType === 'paid' ? Number(formState.ticketing.fees[0]?.amount ?? 0) : 0,
      status,
      video_360_url: formState.overview.video360Url.trim() || null,
      ar_mode_available: formState.overview.arModeAvailable,
      overview_translations: formState.translations.overview,
      history_translations: formState.translations.history,
      // Store booking_url:
      // - When Online Booking Available is disabled: Store in site.booking_url
      // - When Online Booking Available is enabled: Store in site.booking_url AND create external ticket type
      // This ensures the URL is always available in the site table for backward compatibility
      booking_url: formState.ticketing.bookingUrl.trim() || null,
      booking_online_available: formState.ticketing.onlineBookingAvailable,
      site_map_url: formState.siteMapPreviewUrl || null,
      // Store etiquette codes from masterdata as text[] array (e.g., ["remove_shoes", "dress_modestly"])
      // The codes are stored in the database as a PostgreSQL text[] array
      // English display names are fetched from masterdata for display in the UI
      etiquettes: formState.etiquettes.length > 0 
        ? formState.etiquettes 
        : (null as string[] | null),
      // Location fields for translation table
      location_address: formState.overview.locationAddress.trim() || null,
      location_city: formState.overview.locationCity.trim() || null,
      location_state: formState.overview.locationState.trim() || null,
      location_country: formState.overview.locationCountry.trim() || null,
      location_postal_code: formState.overview.locationPostalCode.trim() || null,
      // Photography policy fields
      photography_allowed: formState.overview.photographyAllowed,
      photograph_amount: formState.overview.photographyAllowed === 'paid' && formState.overview.photographyAmount.trim()
        ? Number(formState.overview.photographyAmount)
        : null,
    };

    const visitingHours: HeritageSiteVisitingHoursInput[] = formState.overview.openingHours.schedule.map((day) => ({
      day_of_week: day.day,
      is_open: day.is_open,
      opening_time: day.is_open && day.opening_time ? `${day.opening_time}:00` : null,
      closing_time: day.is_open && day.closing_time ? `${day.closing_time}:00` : null,
      notes: null,
    }));

    // Build ticket types based on Online Booking Available toggle
    const ticketTypes: HeritageSiteTicketTypeInput[] = [];
    
    console.log('🎫 Building ticket types:', {
      entryType: formState.ticketing.entryType,
      onlineBookingAvailable: formState.ticketing.onlineBookingAvailable,
      bookingUrl: formState.ticketing.bookingUrl,
      feesCount: formState.ticketing.fees.length,
      fees: formState.ticketing.fees,
    });
    
    if (formState.ticketing.entryType === 'paid') {
      // Always create External Booking ticket type if booking URL exists (regardless of toggle state)
      if (formState.ticketing.bookingUrl && formState.ticketing.bookingUrl.trim()) {
        ticketTypes.push({
          ticket_name: 'External Booking',
          description: `Book online at: ${formState.ticketing.bookingUrl.trim()}`,
          price: 0, // External booking doesn't have a fixed price
          currency: 'INR',
          age_group: null,
          includes_audio_guide: false,
          includes_guide: false,
          includes_vr_experience: false,
          is_active: true,
        });
        console.log('✅ Added External Booking ticket type with URL:', formState.ticketing.bookingUrl.trim());
      }
      
      // When Online Booking is enabled, also create ticket types from fees
      if (formState.ticketing.onlineBookingAvailable) {
        // Add regular fee-based ticket types
        const feeTicketTypes = formState.ticketing.fees
          .filter((fee) => fee.visitor_type && fee.visitor_type.trim())
            .map((fee) => ({
              ticket_name: fee.visitor_type.trim(), // Maps to ticket_name in database
              description: fee.notes?.trim() || null, // Maps to description
              price: Number(fee.amount) || 0, // Maps to price
              currency: 'INR',
              age_group: fee.visitor_type.toLowerCase().includes('child') ? 'child' 
                       : fee.visitor_type.toLowerCase().includes('senior') ? 'senior'
                       : fee.visitor_type.toLowerCase().includes('adult') ? 'adult' 
                       : null,
              includes_audio_guide: false,
              includes_guide: fee.visitor_type.toLowerCase().includes('guided'),
              includes_vr_experience: fee.visitor_type.toLowerCase().includes('vr'),
              is_active: true,
          }));
        
        ticketTypes.push(...feeTicketTypes);
        console.log(`✅ Added ${feeTicketTypes.length} fee-based ticket type(s)`);
      } else {
        console.log('ℹ️ Online Booking is disabled - only External Booking ticket type created (if URL provided)');
      }
    } else {
      console.log('ℹ️ Entry type is free - no ticket types will be created');
    }
    
    console.log(`🎫 Total ticket types being sent: ${ticketTypes.length}`, ticketTypes);

    const transportation: HeritageSiteTransportationInput[] = formState.transport
        .filter((item) => (item.name || '').trim())
        .map((item) => ({
          transport_type: item.mode || 'other', // Maps to transport_type in database
        route_info: item.route_info?.trim() || `${item.name?.trim()} - ${item.distance_km ? item.distance_km + 'km away' : 'Distance not specified'}`,
          duration_minutes: item.distance_km ? Math.round(item.distance_km * 2) : null, // Estimate: 2 min per km
          cost_range: null, // Can be enhanced later with actual cost data
        accessibility_notes: item.accessibility_notes?.trim() || null,
          is_active: true,
          // Legacy fields for backward compatibility
          category: 'transport' as const,
          mode: item.mode || null,
          name: item.name?.trim() || '',
          description: item.notes?.trim() || null,
          distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
          travel_time_minutes: null,
          notes: item.notes?.trim() || null,
          contact_info: null,
      }));

    const attractions: HeritageSiteAttractionInput[] = formState.nearbyAttractions
        .filter((item) => (item.name || '').trim())
      .map((item, index) => ({
          name: item.name.trim(),
          distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
          notes: item.notes?.trim() || null,
        position: index + 1,
        is_active: true,
      }));

    // Etiquettes are now stored as an array of codes in site.etiquettes column (text[])
    // No need to create separate etiquette records
    const etiquettes: HeritageSiteEtiquetteInput[] = [];

    // Convert translations to HeritageSiteTranslationInput format
    // Heritage_SiteTranslation: ONE ROW PER LANGUAGE with all fields
    // Support all 6 languages: EN, HI, GU, JA, ES, FR
    const translations: HeritageSiteTranslationInput[] = [];

    // All supported languages (must match backend)
    const SUPPORTED_LANGUAGES = ['EN', 'HI', 'GU', 'JA', 'ES', 'FR'];

    // Group by language and collect all fields
    const translationsByLang: Record<string, {
      name?: string;
      short_desc?: string;
      full_desc?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    }> = {};

    // Initialize all supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      translationsByLang[lang] = {};
    });

    // Add site name translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].name = formState.overview.siteName.trim();
    
    // Add other language translations
    Object.entries(formState.translations.siteName).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].name = content.trim();
      }
    });

    // Add short description translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].short_desc = formState.overview.siteShortDescription.trim();
    
    // Add other language translations
    Object.entries(formState.translations.shortDescription).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].short_desc = content.trim();
      }
    });

    // Add full description translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].full_desc = formState.overview.siteFullDescription.trim();
    
    // Add other language translations
    Object.entries(formState.translations.fullDescription).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].full_desc = content.trim();
      }
    });

    // Add address translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].address = formState.overview.locationAddress.trim();
    
    // Add other language translations
    Object.entries(formState.translations.address).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].address = content.trim();
      }
    });

    // Add city translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].city = formState.overview.locationCity.trim();
    
    // Add other language translations
    Object.entries(formState.translations.city).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].city = content.trim();
      }
    });

    // Add state translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].state = formState.overview.locationState.trim();
    
    // Add other language translations
    Object.entries(formState.translations.state).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].state = content.trim();
      }
    });

    // Add country translations
    // For English, always use main field value (source of truth)
    translationsByLang['EN'].country = formState.overview.locationCountry.trim();
    
    // Add other language translations
    Object.entries(formState.translations.country).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (langUpper === 'EN') return; // Skip English, already set above
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim()) {
        translationsByLang[langUpper].country = content.trim();
      }
    });

    // Add overview translations (backward compatibility)
    Object.entries(formState.translations.overview).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim() && !translationsByLang[langUpper].short_desc) {
        translationsByLang[langUpper].short_desc = content.trim();
      }
    });

    // Add history translations (backward compatibility)
    Object.entries(formState.translations.history).forEach(([lang, content]) => {
      const langUpper = lang.toUpperCase();
      if (!translationsByLang[langUpper]) {
        translationsByLang[langUpper] = {};
      }
      if (content && content.trim() && !translationsByLang[langUpper].full_desc) {
        translationsByLang[langUpper].full_desc = content.trim();
      }
    });

    // Add location fields to all translations (defaulting to EN values)
    console.log('🏤 Building translations - Postal Code from form:', formState.overview.locationPostalCode);
    
    SUPPORTED_LANGUAGES.forEach(lang => {
      if (!translationsByLang[lang]) {
        translationsByLang[lang] = {};
    }
    if (formState.overview.locationAddress.trim()) {
        translationsByLang[lang].address = translationsByLang[lang].address || formState.overview.locationAddress.trim();
    }
    if (formState.overview.locationCity.trim()) {
        translationsByLang[lang].city = translationsByLang[lang].city || formState.overview.locationCity.trim();
    }
    if (formState.overview.locationState.trim()) {
        translationsByLang[lang].state = translationsByLang[lang].state || formState.overview.locationState.trim();
    }
    if (formState.overview.locationCountry.trim()) {
        translationsByLang[lang].country = translationsByLang[lang].country || formState.overview.locationCountry.trim();
    }
      if (formState.overview.locationPostalCode.trim()) {
        const postalCode = formState.overview.locationPostalCode.trim();
        translationsByLang[lang].postal_code = translationsByLang[lang].postal_code || postalCode;
        console.log(`🏤 Setting postal_code for ${lang}:`, postalCode);
      }
    });

    // Convert to translation input format for ALL supported languages
    SUPPORTED_LANGUAGES.forEach(lang => {
      const data = translationsByLang[lang];
      
      // If auto-translate is enabled, only include source language translation
      // Let backend handle the rest via auto-translation
      if (formState.autoTranslate.enabled) {
        const isSourceLanguage = lang === formState.autoTranslate.sourceLanguage.toUpperCase();
        
        if (isSourceLanguage) {
          // Only send source language translation with ALL content
          // Use form defaults if translation fields are empty
          const postalCodeValue = formState.overview.locationPostalCode.trim() || undefined;
          console.log(`🏤 Creating translation for ${lang} (source language) - Postal Code:`, postalCodeValue);
          
      const translation: HeritageSiteTranslationInput = {
        language_code: lang,
            name: formState.overview.siteName.trim(),
            // Use translation if available, otherwise use form default
            short_desc: data.short_desc || formState.overview.siteShortDescription.trim() || undefined,
            full_desc: data.full_desc || formState.overview.siteFullDescription.trim() || undefined,
            // Location fields from form
            address: formState.overview.locationAddress.trim() || undefined,
            city: formState.overview.locationCity.trim() || undefined,
            state: formState.overview.locationState.trim() || undefined,
            country: formState.overview.locationCountry.trim() || undefined,
            postal_code: postalCodeValue,
          };
          console.log(`🏤 Final translation object for ${lang}:`, translation);
          translations.push(translation);
        }
        // Skip other languages - let backend auto-translate them
      } else {
        // Auto-translate disabled: send all languages as before
        const postalCodeValue = data.postal_code || undefined;
        console.log(`🏤 Creating translation for ${lang} (manual mode) - Postal Code:`, postalCodeValue);
        
        const translation: HeritageSiteTranslationInput = {
          language_code: lang,
          name: formState.overview.siteName.trim(),
        short_desc: data.short_desc || undefined,
        full_desc: data.full_desc || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
          postal_code: postalCodeValue,
      };
        console.log(`🏤 Final translation object for ${lang}:`, translation);
      translations.push(translation);
      }
    });
    
    console.log('🏤 All translations being sent to backend:', translations);

    // Build transportation translations
    // Note: transportation_id will be set after transportation records are inserted
    // For now, we use the array index as a placeholder (will be mapped to actual IDs in service)
    // Exclude English since English details are stored in main fields
    const transportationTranslations = formState.transport
      .map((_transport, transportIndex) => {
        const transportTranslations = formState.transportTranslations[transportIndex] || {};
        return LANGUAGES.filter(lang => lang.code !== 'en').map(lang => {
          const translation = transportTranslations[lang.code];
          if (!translation || (!translation.name && !translation.route_info && !translation.accessibility_notes)) {
            return null;
          }
          return {
            transportation_id: transportIndex, // Will be mapped to actual ID in service
            language_code: lang.code.toUpperCase(),
            name: translation.name?.trim() || null,
            route_info: translation.route_info?.trim() || null,
            accessibility_notes: translation.accessibility_notes?.trim() || null,
          };
        }).filter((t): t is NonNullable<typeof t> => t !== null);
      })
      .flat();

    // Build attraction translations
    // Note: attraction_id will be set after attraction records are inserted
    // Exclude English since English details are stored in main fields
    const attractionTranslations = formState.nearbyAttractions
      .map((_attraction, attractionIndex) => {
        const attractionTranslations = formState.attractionTranslations[attractionIndex] || {};
        return LANGUAGES.filter(lang => lang.code !== 'en').map(lang => {
          const translation = attractionTranslations[lang.code];
          if (!translation || (!translation.name && !translation.notes)) {
            return null;
          }
          return {
            attraction_id: attractionIndex, // Will be mapped to actual ID in service
            language_code: lang.code.toUpperCase(),
            name: translation.name?.trim() || null,
            notes: translation.notes?.trim() || null,
          };
        }).filter((t): t is NonNullable<typeof t> => t !== null);
      })
      .flat();

    console.log('🚌 Transportation translations being sent:', {
      count: transportationTranslations.length,
      items: transportationTranslations.map(t => ({
        transportIndex: t.transportation_id,
        language: t.language_code,
        hasName: !!t.name,
        hasRouteInfo: !!t.route_info,
        hasAccessibilityNotes: !!t.accessibility_notes,
        name: t.name?.substring(0, 30) || 'null',
        route_info: t.route_info?.substring(0, 30) || 'null',
        accessibility_notes: t.accessibility_notes?.substring(0, 30) || 'null',
      })),
      byLanguage: transportationTranslations.reduce((acc, t) => {
        const lang = t.language_code;
        if (!acc[lang]) acc[lang] = 0;
        acc[lang]++;
        return acc;
      }, {} as Record<string, number>),
      totalTransportItems: formState.transport.length,
      expectedTranslationsPerTransport: LANGUAGES.filter(l => l.code !== 'en').length,
      expectedTotal: formState.transport.length * LANGUAGES.filter(l => l.code !== 'en').length
    });

    console.log('🎯 Attraction translations being sent:', {
      count: attractionTranslations.length,
      items: attractionTranslations.map(t => ({
        attractionIndex: t.attraction_id,
        language: t.language_code,
        hasName: !!t.name,
        hasNotes: !!t.notes,
        name: t.name?.substring(0, 30) || 'null',
        notes: t.notes?.substring(0, 30) || 'null',
      })),
      byLanguage: attractionTranslations.reduce((acc, t) => {
        const lang = t.language_code;
        if (!acc[lang]) acc[lang] = 0;
        acc[lang]++;
        return acc;
      }, {} as Record<string, number>),
      totalAttractionItems: formState.nearbyAttractions.length,
      expectedTranslationsPerAttraction: LANGUAGES.filter(l => l.code !== 'en').length,
      expectedTotal: formState.nearbyAttractions.length * LANGUAGES.filter(l => l.code !== 'en').length
    });
    
    // Debug: Log what's in the form state
    console.log('🔍 Debug - Transport translations in form state:', {
      transportCount: formState.transport.length,
      translations: formState.transport.map((_, idx) => ({
        index: idx,
        languages: Object.keys(formState.transportTranslations[idx] || {}),
        data: formState.transportTranslations[idx]
      }))
    });
    
    console.log('🔍 Debug - Attraction translations in form state:', {
      attractionCount: formState.nearbyAttractions.length,
      translations: formState.nearbyAttractions.map((_, idx) => ({
        index: idx,
        languages: Object.keys(formState.attractionTranslations[idx] || {}),
        data: formState.attractionTranslations[idx]
      }))
    });

    return {
      site,
      media: mediaItems,
      visitingHours,
      ticketTypes,
      transportation,
      attractions,
      etiquettes,
      translations,
      transportationTranslations,
      attractionTranslations,
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Determine folder based on mode (used for all uploads)
      const folder = isEdit && numericSiteId 
        ? `sites/${numericSiteId}` 
        : `sites/new-${Date.now()}`;

      // Upload any pending media files (items with 'file' property) first and collect URLs
      const uploadedMediaUrls = new Map<string, string>(); // Map of item.id -> storage URL
      const filesToUpload = formState.overview.media.filter((item) => item.file);
      
      if (filesToUpload.length > 0) {
        setUploadProgress(`Uploading ${filesToUpload.length} media file(s) to Supabase storage...`);
        
        console.log(`📤 Uploading ${filesToUpload.length} media file(s) to Supabase storage folder: ${folder}`);
        
        for (let i = 0; i < filesToUpload.length; i++) {
          const item = filesToUpload[i];
          if (!item.file) continue;
          
          const sizeMB = (item.file.size / (1024 * 1024)).toFixed(2);
          setUploadProgress(`Uploading ${i + 1}/${filesToUpload.length}: ${item.file.name} (${sizeMB}MB)`);
          
          const uploadResult = await StorageService.uploadFile(item.file, folder);
          
          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(`Failed to upload ${item.file.name}: ${uploadResult.error || 'Unknown error'}`);
          }
          
          // Store the uploaded URL mapped to the item ID
          uploadedMediaUrls.set(item.id, uploadResult.url);
          
          console.log(`✅ Uploaded ${item.file.name} to Supabase storage:`, uploadResult.url);
        }
        
        setUploadProgress('Media files uploaded...');
        
        // Update state with uploaded URLs (for building request)
        setFormState((prev) => ({
          ...prev,
          overview: {
            ...prev.overview,
            media: prev.overview.media.map((m) => {
              const uploadedUrl = uploadedMediaUrls.get(m.id);
              return uploadedUrl
                ? { ...m, previewUrl: uploadedUrl, file: undefined }
                : m;
            }),
          },
        }));
        
        console.log(`✅ All ${uploadedMediaUrls.size} media file(s) uploaded successfully to storage`);
      }

      // Upload audio files to dedicated audio folder
      const uploadedAudioUrls = new Map<string, string>(); // Map of language code -> storage URL
      const audioFilesToUpload = formState.audioGuides.filter((guide) => guide.file);
      
      if (audioFilesToUpload.length > 0) {
        setUploadProgress(`Uploading ${audioFilesToUpload.length} audio file(s) to Supabase storage...`);
        
        // Audio files go to audio/{siteId} folder
        const audioFolder = isEdit && numericSiteId 
          ? `audio/${numericSiteId}` 
          : `audio/new-${Date.now()}`;
        
        console.log(`📤 Uploading ${audioFilesToUpload.length} audio file(s) to Supabase storage folder: ${audioFolder}`);
        
        for (let i = 0; i < audioFilesToUpload.length; i++) {
          const guide = audioFilesToUpload[i];
          if (!guide.file) continue;
          
          const sizeMB = (guide.file.size / (1024 * 1024)).toFixed(2);
          setUploadProgress(`Uploading audio ${i + 1}/${audioFilesToUpload.length}: ${guide.file.name} (${sizeMB}MB)`);
          
          const uploadResult = await StorageService.uploadFile(guide.file, audioFolder);
          
          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(`Failed to upload audio file ${guide.file.name}: ${uploadResult.error || 'Unknown error'}`);
          }
          
          // Store the uploaded URL mapped to the language code
          uploadedAudioUrls.set(guide.language, uploadResult.url);
          
          console.log(`✅ Uploaded ${guide.file.name} (${guide.language}) to Supabase storage:`, uploadResult.url);
        }
        
        setUploadProgress('Audio files uploaded...');
        
        // Update state with uploaded audio URLs
        setFormState((prev) => ({
          ...prev,
          audioGuides: prev.audioGuides.map((guide) => {
            const uploadedUrl = uploadedAudioUrls.get(guide.language);
            return uploadedUrl
              ? { ...guide, url: uploadedUrl, file: undefined }
              : guide;
          }),
        }));
        
        console.log(`✅ All ${uploadedAudioUrls.size} audio file(s) uploaded successfully to audio folder`);
      }

      // Upload site map if exists
      let uploadedSiteMapUrl: string | null = null;
      if (formState.siteMapFile) {
        setUploadProgress('Uploading site map...');
        
        // Site maps go to sitemaps/{siteId} folder, not sites folder
        const siteMapFolder = isEdit && numericSiteId 
          ? `sitemaps/${numericSiteId}` 
          : `sitemaps/new-${Date.now()}`;
        
        const sizeMB = (formState.siteMapFile.size / (1024 * 1024)).toFixed(2);
        console.log(`📤 Uploading site map: ${formState.siteMapFile.name} (${sizeMB}MB) to folder: ${siteMapFolder}`);
        
        const uploadResult = await StorageService.uploadFile(formState.siteMapFile, siteMapFolder);
        
        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(`Failed to upload site map: ${uploadResult.error || 'Unknown error'}`);
        }
        
        uploadedSiteMapUrl = uploadResult.url;
        
        // Update state with uploaded site map URL
        setFormState((prev) => ({
          ...prev,
          siteMapPreviewUrl: uploadedSiteMapUrl,
          siteMapFile: null, // Clear the file after upload
        }));
        
        console.log(`✅ Site map uploaded successfully to sitemaps folder:`, uploadedSiteMapUrl);
      }

      setUploadProgress('Preparing data...');

      // Build request - use uploaded URLs if any files were uploaded (works for both add and edit modes)
      let request: CreateHeritageSiteRequest;
      if (uploadedMediaUrls.size > 0 || uploadedAudioUrls.size > 0) {
        console.log(`📦 Building request with ${uploadedMediaUrls.size} uploaded media URL(s) and ${uploadedAudioUrls.size} uploaded audio URL(s) from Supabase storage`);
        request = buildCreateRequestWithUrls(uploadedMediaUrls, uploadedAudioUrls);
      } else {
        console.log('📦 Building request with existing URLs (no new uploads)');
        request = buildCreateRequest();
      }
      
      // Add site map to both site table AND media table if we just uploaded it
      if (uploadedSiteMapUrl) {
        request.site.site_map_url = uploadedSiteMapUrl;
        
        // Also add site map as a media item in heritage_sitemedia table
        const siteMapMediaItem: HeritageSiteMediaInput = {
          media_type: 'sitemap',
          media_url: uploadedSiteMapUrl,
          thumbnail_url: null,
          label: formState.siteMapFile?.name || 'Site Map',
          language_code: null,
          duration_seconds: null,
          is_primary: false,
          position: (request.media?.length || 0) + 1, // Add after all other media
        };
        
        request.media = [...(request.media || []), siteMapMediaItem];
        
        console.log('✅ Site map added to both site table and media table');
      }
      
      if (!request.site.name_default) {
        throw new Error('Site name is required before submitting.');
      }

      const siteMapInMedia = request.media?.find(m => m.media_type === 'sitemap') || null;
      
      const audioItems = request.media?.filter(m => m.media_type === 'audio') || [];
      console.log('📦 Request payload:', {
        siteName: request.site.name_default,
        mediaCount: request.media?.length || 0,
        audioCount: audioItems.length,
        accessibility: request.site.accessibility, // Log accessibility codes array
        accessibilityType: Array.isArray(request.site.accessibility) ? 'array' : typeof request.site.accessibility,
        accessibilityCount: Array.isArray(request.site.accessibility) ? request.site.accessibility.length : 0,
        audioItems: audioItems.map(m => ({
          language: m.language_code,
          url: m.media_url?.substring(0, 100) + '...',
          urlValid: !!m.media_url && m.media_url.length > 0 && !m.media_url.startsWith('blob:'),
        })),
        mediaDetails: request.media?.map(m => ({ 
          type: m.media_type,
          url: m.media_url?.substring(0, 100) + '...', // Show first 100 chars
          isSupabaseUrl: m.media_url?.includes('supabase.co') || false,
          isBlobUrl: m.media_url?.startsWith('blob:') || false,
          urlValid: !!m.media_url && m.media_url.length > 0 && !m.media_url.startsWith('blob:'),
          isPrimary: m.is_primary,
          position: m.position,
          label: m.label,
          language: m.language_code
        })) || [],
        siteMapUrl: request.site.site_map_url?.substring(0, 100) || 'None',
        siteMapIsSupabaseUrl: request.site.site_map_url?.includes('supabase.co') || false,
        siteMapInMediaTable: !!siteMapInMedia,
        bookingUrl: request.site.booking_url || 'None',
        bookingOnlineAvailable: request.site.booking_online_available,
        ticketTypesCount: request.ticketTypes?.length || 0,
        ticketTypes: request.ticketTypes?.map(t => ({
          name: t.ticket_name,
          description: t.description?.substring(0, 50) + '...',
          price: t.price
        })) || [],
        translationsCount: request.translations?.length || 0,
        visitingHoursCount: request.visitingHours?.length || 0,
        isEdit,
        hasUploadedMediaUrls: uploadedMediaUrls.size > 0,
        hasUploadedSiteMap: !!uploadedSiteMapUrl
      });

      // Validate that media items have proper URLs (not blob URLs)
      const invalidMedia = request.media?.filter(m => 
        !m.media_url || 
        m.media_url.trim() === '' || 
        m.media_url.startsWith('blob:')
      );
      if (invalidMedia && invalidMedia.length > 0) {
        console.error('❌ Found media items with invalid URLs:', invalidMedia);
        throw new Error(`${invalidMedia.length} media item(s) have invalid storage URLs (local blob URLs detected). Please try uploading again.`);
      }

      // Log what we're about to send
      if (request.media && request.media.length > 0) {
        console.log('✅ All media items have valid URLs, proceeding with submission...');
      }

      // Use auto-translation if enabled
      console.log('🚀 Submitting to backend...', {
        mode: isEdit ? 'UPDATE' : 'CREATE',
        siteId: isEdit ? numericSiteId : 'NEW',
        autoTranslate: formState.autoTranslate.enabled,
        dataIncluded: {
          site: !!request.site,
          media: request.media?.length || 0,
          translations: request.translations?.length || 0,
          visitingHours: request.visitingHours?.length || 0,
          ticketTypes: request.ticketTypes?.length || 0,
          transportation: request.transportation?.length || 0,
          etiquettes: request.etiquettes?.length || 0,
        }
      });

      const upsertResult = formState.autoTranslate.enabled
        ? await HeritageSiteService.upsertHeritageSiteWithAutoTranslation(
            request,
            isEdit && numericSiteId !== null ? numericSiteId : null,
            {
              sourceLanguage: formState.autoTranslate.sourceLanguage,
              autoTranslate: true,
              overwriteExisting: false, // Only fill in missing translations
            }
          )
        : await HeritageSiteService.upsertHeritageSiteWithTranslations(
            request,
            isEdit && numericSiteId !== null ? numericSiteId : null
          );

      if (!upsertResult.success) {
        const message = upsertResult.message || upsertResult.error?.message || 'Failed to save heritage site.';
          throw new Error(message);
      }

      const savedMediaCount = request.media?.length || 0;
      const savedSiteId = upsertResult.siteId || numericSiteId;
      
      console.log('✅ Heritage site saved successfully:', {
        siteId: savedSiteId,
        mediaCount: savedMediaCount,
        mediaWithUrls: request.media?.filter(m => m.media_url && m.media_url.length > 0).length || 0,
        audioFilesUploaded: uploadedAudioUrls.size,
        action: isEdit ? 'updated' : 'created'
      });

      // Show detailed success message
      const successMessage = upsertResult.message || 
        `Heritage site ${isEdit ? 'updated' : 'created'} successfully${formState.autoTranslate.enabled ? ' with auto-translations' : ''} for all languages.`;
      
      const mediaInfo = savedMediaCount > 0 
        ? ` ${savedMediaCount} image(s) have been uploaded to Supabase storage and saved to the database.`
        : ' No images were uploaded.';
      
      const audioInfo = uploadedAudioUrls.size > 0
        ? ` ${uploadedAudioUrls.size} audio file(s) have been uploaded to audio/${savedSiteId}/ folder.`
        : '';
      
      const siteMapInfo = uploadedSiteMapUrl 
        ? ` Site map has been uploaded to sitemaps/${savedSiteId}/ folder and added to media table.`
        : '';
      
      setSubmitSuccess(successMessage + mediaInfo + audioInfo + siteMapInfo);

      setTimeout(() => {
        navigate('/masters', { state: { heritageAction: isEdit ? 'updated' : 'created' } });
      }, 800);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save heritage site.');
    } finally {
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  const renderStepper = () => (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 3,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(63, 61, 86, 0.08)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 0 }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {STEP_CONFIG.map((step, index) => {
          const currentIndex = STEP_CONFIG.findIndex((s) => s.key === currentStep);
          const isCompleted = index < currentIndex;
          const isActive = step.key === currentStep;
          return (
            <Stack
              key={step.key}
              direction="row"
              alignItems="center"
              spacing={2}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <Stack direction="row" alignItems="center" spacing={2} onClick={() => handleStepChange(step.key)} sx={{ cursor: 'pointer' }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    backgroundColor: isActive || isCompleted ? '#DA8552' : '#E4E3EB',
                    color: isActive || isCompleted ? '#fff' : '#3F3D56',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 18,
                    transition: 'all 0.3s ease',
                  }}
                >
                  {index + 1}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: isActive || isCompleted ? '#3F3D56' : 'text.secondary',
                    }}
                  >
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.subtitle}
                  </Typography>
                </Box>
              </Stack>
              {index < STEP_CONFIG.length - 1 && (
                <Box
                  sx={{
                    width: { xs: '100%', md: 120 },
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: index < currentIndex ? '#DA8552' : '#E4E3EB',
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );

  const renderMediaGallery = () => (
    <Box>
      {isEdit && (
        <Alert severity="info" sx={{ mb: 2 }}>
        </Alert>
      )}
      
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body2">
          ⚠️ <strong>File Size Limit:</strong> Maximum allowed file size is <strong>50MB</strong>. 
          Files larger than 50MB will be automatically rejected.
        </Typography>
      </Alert>
      
      {uploadingMedia && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2">{uploadProgress}</Typography>
          </Stack>
        </Alert>
      )}
      
      <Paper
        variant="outlined"
        sx={{
          borderStyle: 'dashed',
          borderColor: uploadingMedia ? '#BDBDBD' : '#DA8552',
          borderWidth: 2,
          borderRadius: 4,
          p: 4,
          textAlign: 'center',
          backgroundColor: uploadingMedia ? 'rgba(189, 189, 189, 0.05)' : 'rgba(218, 133, 82, 0.05)',
          cursor: uploadingMedia ? 'not-allowed' : 'pointer',
          opacity: uploadingMedia ? 0.6 : 1,
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!uploadingMedia) {
            handleMediaFiles(event.dataTransfer.files);
          }
        }}
        onClick={() => {
          if (!uploadingMedia) {
            const input = document.getElementById('heritage-media-input');
            input?.click();
          }
        }}
      >
        <input
          id="heritage-media-input"
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          disabled={uploadingMedia}
          onChange={(event) => {
            if (event.target.files) {
              handleMediaFiles(event.target.files);
            }
          }}
        />
        <Stack spacing={2} alignItems="center">
          <CloudUploadIcon sx={{ fontSize: 48, color: uploadingMedia ? '#BDBDBD' : '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {uploadingMedia ? 'Uploading...' : 'Drag & drop files here'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {uploadingMedia 
              ? 'Please wait while files are being uploaded' 
              : 'or click to browse files (images, videos - max 50MB each)'}
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<CloudUploadIcon />} 
            sx={{ borderRadius: 6, backgroundColor: '#DA8552' }}
            disabled={uploadingMedia}
          >
            Browse Files
          </Button>
        </Stack>
      </Paper>

      {formState.overview.media.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Uploaded Media ({formState.overview.media.length})
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip 
                label={`${formState.overview.media.filter(m => m.mediaId && !m.file).length} saved`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip 
                label={`${formState.overview.media.filter(m => m.file).length} pending`}
                size="small"
                color="warning"
                variant="outlined"
              />
            </Stack>
          </Stack>
          {formState.overview.media.filter(m => m.file).length > 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>

            </Alert>
          )}
          <Grid container spacing={2}>
            {formState.overview.media.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    border: item.mediaId && !item.file ? '2px solid #4CAF50' : item.file ? '2px solid #FF9800' : undefined,
                  }}
                >
                  {item.mediaId && !item.file && (
                    <Chip
                      label="Saved"
                      size="small"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {item.file && (
                    <Chip
                      label="Pending"
                      size="small"
                      color="warning"
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {item.previewUrl ? (
                    <Box
                      component="img"
                      src={item.previewUrl}
                      alt={item.label}
                      sx={{ width: '100%', height: 160, objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: '100%',
                        height: 160,
                        backgroundColor: '#F5F5F5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <InsertDriveFileIcon sx={{ color: '#9E9E9E', fontSize: 48 }} />
                    </Box>
                  )}
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" noWrap title={item.label}>
                      {item.label}
                    </Typography>
                    {item.mediaId && !item.file && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        ID: {item.mediaId} • Saved in database
                      </Typography>
                    )}
                    {item.file && (
                      <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 0.5 }}>
                        Will be uploaded on submit
                      </Typography>
                    )}
                    {item.file && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Size: {(item.file.size / (1024 * 1024)).toFixed(2)} MB
                      </Typography>
                    )}
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <Chip
                        size="small"
                        label={item.isPrimary ? 'Primary' : 'Secondary'}
                        color={item.isPrimary ? 'success' : 'default'}
                        onClick={() => !uploadingMedia && togglePrimaryMedia(item.id)}
                        sx={{ fontWeight: 600, cursor: uploadingMedia ? 'not-allowed' : 'pointer' }}
                        disabled={uploadingMedia}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => !uploadingMedia && removeMediaItem(item.id)}
                        disabled={uploadingMedia}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );

  const renderOverviewStep = () => (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <ExploreIcon sx={{ color: '#DA8552', fontSize: 32 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
              Site Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Provide the heritage site name, detailed location, media gallery and amenities. Translations are auto-generated as you type.
            </Typography>
          </Box>
        </Stack>

        {/* Translation Status Summary for Edit Mode */}
        {isEdit && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Translation Status:
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {['siteName', 'shortDescription', 'fullDescription', 'address', 'city', 'state'].map((field) => {
                const fieldKey = field as keyof AddHeritageSiteState['translations'];
                const isComplete = areTranslationsComplete(fieldKey);
                const fieldLabel = field.replace(/([A-Z])/g, ' $1').trim();
                
                return (
                  <Chip
                    key={field}
                    size="small"
                    label={fieldLabel}
                    icon={isComplete ? <CheckCircleIcon /> : undefined}
                    color={isComplete ? 'success' : 'default'}
                    variant={isComplete ? 'filled' : 'outlined'}
                  />
                );
              })}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {areTranslationsComplete('siteName') && areTranslationsComplete('shortDescription') && areTranslationsComplete('fullDescription')
                ? '✅ All main translations are complete. Changes will only translate missing fields.'
                : '⚠️ Some translations are missing. They will be auto-generated when you edit the English fields.'
              }
            </Typography>
          </Alert>
        )}

        {/* Language Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentLanguageTab} 
            onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {LANGUAGES.map((lang) => {
              // Check if this language has translations
              const hasTranslations = lang.code === 'en' || (
                formState.translations.siteName[lang.code] ||
                formState.translations.shortDescription[lang.code] ||
                formState.translations.fullDescription[lang.code]
              );
              
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

        <Stack spacing={3}>
          {currentLanguageTab === 'en' ? (
            <>
              <TextField
                required
                label="Site Name"
                placeholder="Enter heritage site name"
                value={formState.overview.siteName}
                onChange={(event) => {
                  const value = event.target.value;
                  updateOverviewField('siteName', value);
                  autoTranslateField(value, 'siteName');
                }}
                fullWidth
                InputProps={{
                  endAdornment: translatingFields.has('siteName') ? (
                    <InputAdornment position="end">
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CircularProgress size={16} />
                        <Typography variant="caption" color="text.secondary">Translating...</Typography>
                      </Stack>
                    </InputAdornment>
                  ) : formState.overview.siteName ? (
                    <InputAdornment position="end">
                      <CheckCircleIcon color="success" />
                    </InputAdornment>
                  ) : undefined,
                }}
              />

              <TextField
                label="Site Short Description"
                placeholder="Provide a concise summary (shown in listings)"
                value={formState.overview.siteShortDescription}
                onChange={(event) => {
                  const value = event.target.value;
                  updateOverviewField('siteShortDescription', value);
                  autoTranslateField(value, 'shortDescription');
                }}
                fullWidth
                multiline
                minRows={2}
                helperText={translatingFields.has('shortDescription') ? 'Translating to other languages...' : `${formState.overview.siteShortDescription.length}/250`}
                inputProps={{ maxLength: 250 }}
              />

              <TextField
                label="Site Description"
                placeholder="Describe the heritage site in detail"
                value={formState.overview.siteFullDescription}
                onChange={(event) => {
                  const value = event.target.value;
                  updateOverviewField('siteFullDescription', value);
                  autoTranslateField(value, 'fullDescription');
                }}
                fullWidth
                multiline
                minRows={4}
                helperText={translatingFields.has('fullDescription') ? 'Translating to other languages...' : undefined}
              />
            </>
          ) : (
            <>
              <Alert 
                severity={translatingFields.size > 0 ? "warning" : "info"} 
                sx={{ mb: 2 }}
                icon={translatingFields.size > 0 ? <CircularProgress size={20} /> : undefined}
              >
                <Typography variant="body2">
                  {translatingFields.size > 0 
                    ? `⏳ Translating ${translatingFields.size} field${translatingFields.size > 1 ? 's' : ''}... Please wait.`
                    : 'These translations are auto-generated from English. You can edit them manually if needed.'
                  }
                </Typography>
              </Alert>

              <TextField
                label={`Site Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                placeholder="Translated site name"
                value={formState.translations.siteName[currentLanguageTab] || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  updateTranslation('siteName', currentLanguageTab, value);
                  autoTranslateField(value, 'siteName', currentLanguageTab);
                  markDirty();
                }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={`Site Short Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                placeholder="Translated short description"
                value={formState.translations.shortDescription[currentLanguageTab] || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  updateTranslation('shortDescription', currentLanguageTab, value);
                  autoTranslateField(value, 'shortDescription', currentLanguageTab);
                  markDirty();
                }}
                fullWidth
                multiline
                minRows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label={`Site Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                placeholder="Translated full description"
                value={formState.translations.fullDescription[currentLanguageTab] || ''}
                onChange={(event) => {
                  const value = event.target.value;
                  updateTranslation('fullDescription', currentLanguageTab, value);
                  autoTranslateField(value, 'fullDescription', currentLanguageTab);
                  markDirty();
                }}
                fullWidth
                multiline
                minRows={4}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                    </InputAdornment>
                  ),
                }}
              />

              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Location Translations
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label={`Full Address (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                    placeholder="Translated address"
                    value={formState.translations.address[currentLanguageTab] || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateTranslation('address', currentLanguageTab, value);
                      autoTranslateField(value, 'address', currentLanguageTab);
                      markDirty();
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label={`City (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                    placeholder="Translated city"
                    value={formState.translations.city[currentLanguageTab] || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateTranslation('city', currentLanguageTab, value);
                      autoTranslateField(value, 'city', currentLanguageTab);
                      markDirty();
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label={`State (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                    placeholder="Translated state"
                    value={formState.translations.state[currentLanguageTab] || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateTranslation('state', currentLanguageTab, value);
                      autoTranslateField(value, 'state', currentLanguageTab);
                      markDirty();
                    }}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {LANGUAGES.find(l => l.code === currentLanguageTab)?.flag}
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {currentLanguageTab === 'en' && (
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Full Address"
                    placeholder="Enter full address"
                    value={formState.overview.locationAddress}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateOverviewField('locationAddress', value);
                      autoTranslateField(value, 'address');
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={geocoding ? <CircularProgress size={18} /> : <MapIcon />}
                    sx={{ height: '100%', borderRadius: 3 }}
                    onClick={handlePinOnMap}
                    disabled={geocoding || !formState.overview.locationAddress.trim()}
                  >
                    {geocoding ? 'Finding...' : 'Pin on Map'}
                  </Button>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="City"
                    value={formState.overview.locationCity}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateOverviewField('locationCity', value);
                      autoTranslateField(value, 'city');
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="State"
                    value={formState.overview.locationState}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateOverviewField('locationState', value);
                      autoTranslateField(value, 'state');
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Postal Code"
                    value={formState.overview.locationPostalCode}
                    onChange={(event) => handlePostalCodeChange(event.target.value)}
                    onBlur={validatePostalCode}
                    error={Boolean(fieldErrors.postalCode)}
                    helperText={fieldErrors.postalCode || undefined}
                    fullWidth
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 6 }}
                  />
                </Grid>
                <Grid item xs={12} md={2.5}>
                  <TextField
                    label="Latitude"
                    value={formState.overview.latitude}
                    onChange={(event) => handleLatitudeChange(event.target.value)}
                    onBlur={validateLatitude}
                    error={Boolean(fieldErrors.latitude)}
                    helperText={fieldErrors.latitude }
                    fullWidth
                    inputProps={{ inputMode: 'decimal', pattern: '-?\\d*(\\.\\d*)?' }}
                  />
                </Grid>
                <Grid item xs={12} md={2.5}>
                  <TextField
                    label="Longitude"
                    value={formState.overview.longitude}
                    onChange={(event) => handleLongitudeChange(event.target.value)}
                    onBlur={validateLongitude}
                    error={Boolean(fieldErrors.longitude)}
                    helperText={fieldErrors.longitude}
                    fullWidth
                    inputProps={{ inputMode: 'decimal', pattern: '-?\\d*(\\.\\d*)?' }}
                  />
                </Grid>
                {formState.overview.latitude && formState.overview.longitude && (
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
                        src={`https://www.google.com/maps?q=${formState.overview.latitude},${formState.overview.longitude}&z=15&output=embed`}
                      />
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}

          <Box>{renderMediaGallery()}</Box>

          <Box>
              <Button
                variant="outlined"
              component="label"
              startIcon={uploadingVideo ? <CircularProgress size={18} /> : <CloudUploadIcon />}
              sx={{ borderRadius: 3 }}
              disabled={uploadingVideo}
            >
              {uploadingVideo ? 'Uploading...' : 'Upload 360° Video'}
              <input
                hidden
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const files = event.target.files;
                  handleVideoUpload(files);
                  event.target.value = '';
                }}
              />
              </Button>
          </Box>
          {formState.overview.video360Url && (
            <Box
              sx={{
                mt: 2,
                borderRadius: 2,
                border: '1px solid #E0E0E0',
                overflow: 'hidden',
                maxWidth: 420,
              }}
            >
              {/youtu\.?be|youtube|vimeo/i.test(formState.overview.video360Url) ? (
                <Box
                  component="iframe"
                  src={getYouTubeEmbedUrl(formState.overview.video360Url)}
                  title="360 video preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{ width: '100%', height: 236, border: 'none' }}
                />
              ) : (
                <Box
                  component="video"
                  src={formState.overview.video360Url}
                  controls
                  sx={{ width: '100%', height: 236, background: '#000' }}
                />
              )}
            </Box>
          )}

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                AR Mode Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enable AR mode to allow visitors to experience this heritage site in augmented reality through the mobile app.
              </Typography>
            </Box>
            <Switch
              checked={formState.overview.arModeAvailable}
              onChange={(_, value) => updateOverviewField('arModeAvailable', value)}
            />
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <AccessTimeIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Open Days & Hours
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {formState.overview.openingHours.schedule.map((day) => (
              <Chip
                key={day.day}
                label={day.day}
                onClick={() => toggleDay(day.day)}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  backgroundColor: day.is_open ? '#DA8552' : '#E0E0E0',
                  color: day.is_open ? '#fff' : '#3F3D56',
                  fontWeight: 600,
                }}
              />
            ))}
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Opening Time"
                type="time"
                value={formState.overview.openingHours.schedule.find(d => d.is_open)?.opening_time || formState.overview.openingHours.schedule[0]?.opening_time || ''}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => {
                  const value = event.target.value;
                  DAY_ORDER.forEach((day) => {
                    updateOpeningDay(day, { opening_time: value });
                  });
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Closing Time"
                type="time"
                value={formState.overview.openingHours.schedule.find(d => d.is_open)?.closing_time || formState.overview.openingHours.schedule[0]?.closing_time || ''}
                InputLabelProps={{ shrink: true }}
                onChange={(event) => {
                  const value = event.target.value;
                  DAY_ORDER.forEach((day) => {
                    updateOpeningDay(day, { closing_time: value });
                  });
                }}
              />
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <LocalOfferIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Site Type & Experience
          </Typography>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Site Type
              </Typography>
            </Stack>
            <FormControl fullWidth>
              <Select
                value={formState.overview.siteType || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === ADD_NEW_SITE_TYPE_OPTION) {
                    setShowAddSiteType(true);
                    return;
                  }
                  updateOverviewField('siteType', value || null);
                }}
                displayEmpty
              >
                <MenuItem value="">
                  <em>Select Site Type</em>
                </MenuItem>
                {siteTypeOptions.map((option) => (
                  <MenuItem key={option.master_id} value={option.code}>
                    {option.display_name || option.code}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem value={ADD_NEW_SITE_TYPE_OPTION}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AddIcon fontSize="small" />
                    <Typography variant="body2">Add New Site Type</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Experience
              </Typography>
            </Stack>
            <FormControl fullWidth>
              <InputLabel id="experience-select-label">Select Experiences</InputLabel>
              <Select
                labelId="experience-select-label"
                label="Select Experiences"
                multiple
                value={formState.overview.experience || []}
                onChange={(e) => {
                  const value = typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value;
                  if (value.includes(ADD_NEW_EXPERIENCE_OPTION)) {
                    setShowAddExperience(true);
                    const filtered = value.filter((code) => code !== ADD_NEW_EXPERIENCE_OPTION);
                    updateOverviewField('experience', filtered);
                    return;
                  }
                  updateOverviewField('experience', value);
                }}
                renderValue={(selected) => {
                  if ((selected as string[]).length === 0) {
                    return <em>Select Experiences</em>;
                  }
                  return (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((code) => {
                        const option = experienceOptions.find((opt) => opt.code === code);
                        return (
                          <Chip
                            key={code}
                            label={option?.display_name || option?.code || code}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  );
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                      width: 250,
                    },
                  },
                }}
              >
                {experienceOptions.map((option) => (
                  <MenuItem key={option.master_id} value={option.code}>
                    <Checkbox checked={formState.overview.experience?.indexOf(option.code) > -1} />
                    {option.display_name || option.code}
                  </MenuItem>
                ))}
                <Divider />
                <MenuItem value={ADD_NEW_EXPERIENCE_OPTION}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AddIcon fontSize="small" />
                    <Typography variant="body2">Add New Experience</Typography>
                  </Stack>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
          <CameraAltIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Photography Policy
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="photography-allowed-label">Photography Allowed</InputLabel>
              <Select
                labelId="photography-allowed-label"
                label="Photography Allowed"
                value={formState.overview.photographyAllowed}
                onChange={(e) => {
                  const value = e.target.value as 'free' | 'paid' | 'restricted';
                  updateOverviewField('photographyAllowed', value);
                  // Clear amount if not paid
                  if (value !== 'paid') {
                    updateOverviewField('photographyAmount', '');
                  }
                }}
              >
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="restricted">Restricted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {formState.overview.photographyAllowed === 'paid' && (
            <Grid item xs={12} md={6}>
              <TextField
                label="Photography Amount (₹)"
                type="number"
                value={formState.overview.photographyAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow positive numbers
                  if (value === '' || (!isNaN(Number(value)) && Number(value) >= 0)) {
                    updateOverviewField('photographyAmount', value);
                  }
                }}
                fullWidth
                inputProps={{ min: 0, step: 1 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
          <LocalOfferIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
              Accessibility
          </Typography>
          </Stack>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setShowAddAccessibility(true)}
            sx={{ borderRadius: 3 }}
          >
            Add New
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select accessibility features available at this heritage site. Options are loaded from master data.
                    </Typography>

        {accessibilityOptions.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              No accessibility options available. Click "Add New" to create one.
            </Typography>
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {accessibilityOptions.map((option) => {
              const isSelected = formState.overview.accessibility.includes(option.code);
              // Always show English display name (options are fetched with 'EN' language)
              const displayLabel = option.display_name || option.code;
              return (
                <Chip
                  key={option.master_id}
                  label={displayLabel}
                  onClick={() => toggleAccessibility(option.code)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  title={`Code: ${option.code}`}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              );
            })}
                  </Stack>
        )}
      </Paper>

      {/* Add New Accessibility Dialog */}
      <Dialog
        open={showAddAccessibility}
        onClose={() => !creatingAccessibility && setShowAddAccessibility(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <LocalOfferIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add New Accessibility Option
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Code will be auto-generated</strong> from the English display name when you click "Create". 
                The code will be created automatically (e.g., "Wheelchair Access" → "wheelchair_access").
              </Typography>
            </Alert>

            <Divider />

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Translations
            </Typography>

            {formState.autoTranslate.enabled && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Auto-translation is enabled. When you enter English text, it will automatically translate to other languages after you stop typing.
                </Typography>
              </Alert>
            )}

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={currentLanguageTab}
                onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {LANGUAGES.map((lang) => {
                  const hasTranslation = newAccessibilityTranslations[lang.code]?.displayName?.trim();
                  return (
                    <Tab
                      key={lang.code}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{lang.flag} {lang.label}</span>
                          {hasTranslation && lang.code !== 'en' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Stack>
                      }
                      value={lang.code}
                    />
                  );
                })}
              </Tabs>
            </Box>

          <TextField
              label={`Display Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter display name"
              value={newAccessibilityTranslations[currentLanguageTab].displayName}
              onChange={(e) => {
                const value = e.target.value;
                setNewAccessibilityTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    displayName: value,
                  },
                }));
                
                // Auto-translate when English display name is entered
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  // Clear existing timer
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  
                  // Set new timer - translate after 1 second of no typing
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingAccessibility(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    
                    console.log(`🌐 Auto-translating accessibility display name "${value}" to ${targetLanguages.length} language(s)...`);
                    
                    // Translate to all target languages
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewAccessibilityTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            displayName: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    
                    setTranslatingAccessibility(false);
                    console.log(`✅ Accessibility display name translation complete`);
                  }, 1000); // 1 second debounce
                }
              }}
            fullWidth
              required={currentLanguageTab === 'en'}
              helperText={
                currentLanguageTab === 'en' 
                  ? (translatingAccessibility ? 'Translating to other languages...' : 'English display name is required (will auto-translate to other languages)')
                  : 'Optional'
              }
              InputProps={{
                endAdornment: currentLanguageTab === 'en' && translatingAccessibility ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
            />

            <TextField
              label={`Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter description (optional)"
              value={newAccessibilityTranslations[currentLanguageTab].description}
              onChange={(e) => {
                const value = e.target.value;
                setNewAccessibilityTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    description: value,
                  },
                }));
                
                // Auto-translate when English description is entered
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  // Clear existing timer
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  
                  // Set new timer - translate after 1 second of no typing
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingAccessibility(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    
                    console.log(`🌐 Auto-translating accessibility description "${value}" to ${targetLanguages.length} language(s)...`);
                    
                    // Translate to all target languages
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewAccessibilityTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            description: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    
                    setTranslatingAccessibility(false);
                    console.log(`✅ Accessibility description translation complete`);
                  }, 1000); // 1 second debounce
                }
              }}
              fullWidth
              multiline
              minRows={2}
              helperText={
                currentLanguageTab === 'en' 
                  ? (translatingAccessibility ? 'Translating to other languages...' : 'Will auto-translate to other languages')
                  : 'Optional'
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              // Clear any pending translation timers
              if (accessibilityTranslationTimerRef.current) {
                clearTimeout(accessibilityTranslationTimerRef.current);
                accessibilityTranslationTimerRef.current = null;
              }
              setShowAddAccessibility(false);
              setNewAccessibilityTranslations({
                en: { displayName: '', description: '' },
                hi: { displayName: '', description: '' },
                gu: { displayName: '', description: '' },
                ja: { displayName: '', description: '' },
                es: { displayName: '', description: '' },
                fr: { displayName: '', description: '' },
              });
              setTranslatingAccessibility(false);
            }}
            disabled={creatingAccessibility}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateAccessibility}
            disabled={creatingAccessibility || !newAccessibilityTranslations.en.displayName.trim()}
            startIcon={creatingAccessibility ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{ backgroundColor: '#DA8552' }}
          >
            {creatingAccessibility ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Site Type Dialog */}
      <Dialog
        open={showAddSiteType}
        onClose={() => !creatingSiteType && setShowAddSiteType(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <LocalOfferIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add New Site Type
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Code will be auto-generated</strong> from the English display name when you click "Create".
              </Typography>
            </Alert>
            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Translations
            </Typography>
            {formState.autoTranslate.enabled && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Auto-translation is enabled. When you enter English text, it will automatically translate to other languages after you stop typing.
                </Typography>
              </Alert>
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={currentLanguageTab}
                onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {LANGUAGES.map((lang) => {
                  const hasTranslation = newSiteTypeTranslations[lang.code]?.displayName?.trim();
                  return (
                    <Tab
                      key={lang.code}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{lang.flag} {lang.label}</span>
                          {hasTranslation && lang.code !== 'en' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Stack>
                      }
                      value={lang.code}
                    />
                  );
                })}
              </Tabs>
            </Box>
            <TextField
              label={`Display Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter display name"
              value={newSiteTypeTranslations[currentLanguageTab].displayName}
              onChange={(e) => {
                const value = e.target.value;
                setNewSiteTypeTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    displayName: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingSiteType(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewSiteTypeTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            displayName: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingSiteType(false);
                  }, 1000);
                }
              }}
              fullWidth
              required={currentLanguageTab === 'en'}
              helperText={
                currentLanguageTab === 'en'
                  ? (translatingSiteType ? 'Translating to other languages...' : 'English display name is required')
                  : 'Optional'
              }
              InputProps={{
                endAdornment: currentLanguageTab === 'en' && translatingSiteType ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <TextField
              label={`Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter description (optional)"
              value={newSiteTypeTranslations[currentLanguageTab].description}
              onChange={(e) => {
                const value = e.target.value;
                setNewSiteTypeTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    description: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingSiteType(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewSiteTypeTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            description: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingSiteType(false);
                  }, 1000);
                }
              }}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (accessibilityTranslationTimerRef.current) {
                clearTimeout(accessibilityTranslationTimerRef.current);
                accessibilityTranslationTimerRef.current = null;
              }
              setShowAddSiteType(false);
              setNewSiteTypeTranslations({
                en: { displayName: '', description: '' },
                hi: { displayName: '', description: '' },
                gu: { displayName: '', description: '' },
                ja: { displayName: '', description: '' },
                es: { displayName: '', description: '' },
                fr: { displayName: '', description: '' },
              });
              setTranslatingSiteType(false);
            }}
            disabled={creatingSiteType}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateSiteType}
            disabled={creatingSiteType || !newSiteTypeTranslations.en.displayName.trim()}
            startIcon={creatingSiteType ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{ backgroundColor: '#DA8552' }}
          >
            {creatingSiteType ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Experience Dialog */}
      <Dialog
        open={showAddExperience}
        onClose={() => !creatingExperience && setShowAddExperience(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <LocalOfferIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add New Experience
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Code will be auto-generated</strong> from the English display name when you click "Create".
              </Typography>
            </Alert>
            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Translations
            </Typography>
            {formState.autoTranslate.enabled && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Auto-translation is enabled. When you enter English text, it will automatically translate to other languages after you stop typing.
                </Typography>
              </Alert>
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={currentLanguageTab}
                onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {LANGUAGES.map((lang) => {
                  const hasTranslation = newExperienceTranslations[lang.code]?.displayName?.trim();
                  return (
                    <Tab
                      key={lang.code}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{lang.flag} {lang.label}</span>
                          {hasTranslation && lang.code !== 'en' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Stack>
                      }
                      value={lang.code}
                    />
                  );
                })}
              </Tabs>
            </Box>
            <TextField
              label={`Display Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter display name"
              value={newExperienceTranslations[currentLanguageTab].displayName}
              onChange={(e) => {
                const value = e.target.value;
                setNewExperienceTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    displayName: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingExperience(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewExperienceTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            displayName: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingExperience(false);
                  }, 1000);
                }
              }}
              fullWidth
              required={currentLanguageTab === 'en'}
              helperText={
                currentLanguageTab === 'en'
                  ? (translatingExperience ? 'Translating to other languages...' : 'English display name is required')
                  : 'Optional'
              }
              InputProps={{
                endAdornment: currentLanguageTab === 'en' && translatingExperience ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <TextField
              label={`Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter description (optional)"
              value={newExperienceTranslations[currentLanguageTab].description}
              onChange={(e) => {
                const value = e.target.value;
                setNewExperienceTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    description: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingExperience(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewExperienceTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            description: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingExperience(false);
                  }, 1000);
                }
              }}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (accessibilityTranslationTimerRef.current) {
                clearTimeout(accessibilityTranslationTimerRef.current);
                accessibilityTranslationTimerRef.current = null;
              }
              setShowAddExperience(false);
              setNewExperienceTranslations({
                en: { displayName: '', description: '' },
                hi: { displayName: '', description: '' },
                gu: { displayName: '', description: '' },
                ja: { displayName: '', description: '' },
                es: { displayName: '', description: '' },
                fr: { displayName: '', description: '' },
              });
              setTranslatingExperience(false);
            }}
            disabled={creatingExperience}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateExperience}
            disabled={creatingExperience || !newExperienceTranslations.en.displayName.trim()}
            startIcon={creatingExperience ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{ backgroundColor: '#DA8552' }}
          >
            {creatingExperience ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const renderAboutStep = () => (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <VolumeUpIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Audio Guides
          </Typography>
        </Stack>
        

        
        
        
        <Grid container spacing={3}>
          {formState.audioGuides.map((guide) => {
            const languageMeta = LANGUAGES.find((lang) => lang.code === guide.language);
            return (
              <Grid item xs={12} md={6} key={guide.id}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'rgba(218,133,82,0.12)', color: '#DA8552' }}>{languageMeta?.flag}</Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {languageMeta?.label} Audio Guide
                    </Typography>
                  </Stack>
                  {guide.file ? (
                    <Stack spacing={2}>
                      <Chip
                        label="Pending Upload"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {guide.file.name} ({Math.round(guide.file.size / 1024 / 1024)} MB)
                      </Typography>
                      
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          sx={{ borderRadius: 3 }}
                          onClick={() => window.open(URL.createObjectURL(guide.file!), '_blank')}
                        >
                          Preview
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          sx={{ borderRadius: 3 }}
                          onClick={() => removeAudioFile(guide.language as LanguageCode)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  ) : guide.url ? (
                    <Stack spacing={2}>
                      <Chip
                        label="Uploaded"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600, alignSelf: 'flex-start' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {guide.file_name || `Audio guide (${guide.language.toUpperCase()})`}
                      </Typography>
                      {guide.duration_seconds && (
                        <Typography variant="caption" color="text.secondary">
                          Duration: {Math.floor(guide.duration_seconds / 60)}:{(guide.duration_seconds % 60).toString().padStart(2, '0')}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          sx={{ borderRadius: 3 }}
                          onClick={() => window.open(guide.url!, '_blank')}
                        >
                          Listen
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          sx={{ borderRadius: 3 }}
                          component="label"
                        >
                          Replace
                          <input
                            hidden
                            accept="audio/*"
                            type="file"
                            onChange={(event) => handleAudioFile(guide.language as LanguageCode, event.target.files)}
                          />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          sx={{ borderRadius: 3 }}
                          onClick={() => removeAudioFile(guide.language as LanguageCode)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 3 }}>
                      <CloudUploadIcon sx={{ fontSize: 36, color: '#BDBDBD' }} />
                      <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon />}
                        sx={{ borderRadius: 3, backgroundColor: '#DA8552' }}
                        component="label"
                      >
                        Upload Audio
                        <input
                          hidden
                          accept="audio/*"
                          type="file"
                          onChange={(event) => handleAudioFile(guide.language as LanguageCode, event.target.files)}
                        />
                      </Button>
                    </Stack>
                  )}
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <InsertDriveFileIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Site Map
          </Typography>
        </Stack>

        {formState.siteMapFile && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              📤 <strong>Pending upload:</strong> This file will be uploaded to storage when you submit the form.
            </Typography>
          </Alert>
        )}

        {!formState.siteMapFile && formState.siteMapPreviewUrl && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ✅ <strong>Saved:</strong> Site map is already uploaded to storage.
            </Typography>
          </Alert>
        )}

        <Box
          sx={{
            border: formState.siteMapFile ? '2px dashed #FF9800' : '2px dashed #C5C3D6',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            backgroundColor: formState.siteMapFile ? 'rgba(255, 152, 0, 0.05)' : 'rgba(63, 61, 86, 0.02)',
          }}
        >
          {formState.siteMapFile || formState.siteMapPreviewUrl ? (
            <Stack spacing={2} alignItems="center">
              <InsertDriveFileIcon sx={{ fontSize: 48, color: '#3F3D56' }} />
              <Typography variant="subtitle1">
                {formState.siteMapFile ? formState.siteMapFile.name : 'Uploaded Site Map'}
              </Typography>
              {formState.siteMapFile && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label="Pending Upload"
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    {(formState.siteMapFile.size / 1024 / 1024).toFixed(2)} MB
                  </Typography>
                </Stack>
              )}
              {!formState.siteMapFile && formState.siteMapPreviewUrl && (
                <Chip
                  label="Saved"
                  size="small"
                  color="success"
                  sx={{ fontWeight: 600 }}
                />
              )}
              <Stack direction="row" spacing={1}>
                {formState.siteMapPreviewUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => window.open(formState.siteMapPreviewUrl!, '_blank')}
                    sx={{ borderRadius: 3 }}
                  >
                    Preview
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  component="label"
                  sx={{ borderRadius: 3 }}
                >
                  Replace
                  <input hidden type="file" accept="application/pdf,image/*" onChange={(event) => handleSiteMapUpload(event.target.files)} />
                </Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} sx={{ borderRadius: 3 }} onClick={clearSiteMap}>
                  Remove
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center">
              <InsertDriveFileIcon sx={{ fontSize: 48, color: '#BDBDBD' }} />
              <Typography variant="body2" color="text.secondary">
                Upload a PDF or image of the site map
              </Typography>
              <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                component="label"
                sx={{ borderRadius: 3, backgroundColor: '#DA8552' }}
              >
                Upload Site Map
                <input hidden type="file" accept="application/pdf,image/*" onChange={(event) => handleSiteMapUpload(event.target.files)} />
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
              Cultural Etiquettes
            </Typography>
          </Stack>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setShowAddEtiquette(true)}
            sx={{ borderRadius: 3 }}
          >
            Add New
          </Button>
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select cultural etiquette guidelines available at this heritage site. Options are loaded from master data.
        </Typography>

        {etiquetteOptions.length === 0 ? (
          <Alert severity="info">
            <Typography variant="body2">
              No etiquette options available. Click "Add New" to create one.
            </Typography>
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {etiquetteOptions.map((option) => {
              const isSelected = formState.etiquettes.includes(option.code);
              // Always show English display name (options are fetched with 'EN' language)
              const displayLabel = option.display_name || option.code;
              return (
                <Chip
                  key={option.master_id}
                  label={displayLabel}
                  onClick={() => toggleEtiquette(option.code)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  title={`Code: ${option.code}`}
                  sx={{
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 400,
                  }}
                />
              );
            })}
          </Stack>
        )}
      </Paper>

      {/* Add New Etiquette Dialog */}
      <Dialog
        open={showAddEtiquette}
        onClose={() => !creatingEtiquette && setShowAddEtiquette(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add New Etiquette
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Code will be auto-generated</strong> from the English display name when you click "Create".
              </Typography>
            </Alert>
            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Translations
            </Typography>
            {formState.autoTranslate.enabled && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Auto-translation is enabled. When you enter English text, it will automatically translate to other languages after you stop typing.
                </Typography>
              </Alert>
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={currentLanguageTab}
                onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {LANGUAGES.map((lang) => {
                  const hasTranslation = newEtiquetteTranslations[lang.code]?.displayName?.trim();
                  return (
                    <Tab
                      key={lang.code}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{lang.flag} {lang.label}</span>
                          {hasTranslation && lang.code !== 'en' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Stack>
                      }
                      value={lang.code}
                    />
                  );
                })}
              </Tabs>
            </Box>
            <TextField
              label={`Display Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter display name"
              value={newEtiquetteTranslations[currentLanguageTab].displayName}
              onChange={(e) => {
                const value = e.target.value;
                setNewEtiquetteTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    displayName: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingEtiquette(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewEtiquetteTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            displayName: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingEtiquette(false);
                  }, 1000);
                }
              }}
              fullWidth
              required={currentLanguageTab === 'en'}
              helperText={
                currentLanguageTab === 'en'
                  ? (translatingEtiquette ? 'Translating to other languages...' : 'English display name is required')
                  : 'Optional'
              }
              InputProps={{
                endAdornment: currentLanguageTab === 'en' && translatingEtiquette ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <TextField
              label={`Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter description (optional)"
              value={newEtiquetteTranslations[currentLanguageTab].description}
              onChange={(e) => {
                const value = e.target.value;
                setNewEtiquetteTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    description: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingEtiquette(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewEtiquetteTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            description: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingEtiquette(false);
                  }, 1000);
                }
              }}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (accessibilityTranslationTimerRef.current) {
                clearTimeout(accessibilityTranslationTimerRef.current);
                accessibilityTranslationTimerRef.current = null;
              }
              setShowAddEtiquette(false);
              setNewEtiquetteTranslations({
                en: { displayName: '', description: '' },
                hi: { displayName: '', description: '' },
                gu: { displayName: '', description: '' },
                ja: { displayName: '', description: '' },
                es: { displayName: '', description: '' },
                fr: { displayName: '', description: '' },
              });
              setTranslatingEtiquette(false);
            }}
            disabled={creatingEtiquette}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateEtiquette}
            disabled={creatingEtiquette || !newEtiquetteTranslations.en.displayName.trim()}
            startIcon={creatingEtiquette ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{ backgroundColor: '#DA8552' }}
          >
            {creatingEtiquette ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const renderPlanStep = () => (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <LocalOfferIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Ticketing Information
          </Typography>
        </Stack>

        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <FormControl>
              <FormLabel>Entry Type</FormLabel>
              <RadioGroup
                row
                value={formState.ticketing.entryType}
                onChange={(event) => updateTicketField('entryType', event.target.value as 'free' | 'paid')}
              >
                <FormControlLabel value="free" control={<Radio />} label="Free Entry" />
                <FormControlLabel value="paid" control={<Radio />} label="Paid Entry" />
              </RadioGroup>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formState.ticketing.onlineBookingAvailable}
                  onChange={(_, value) => updateTicketField('onlineBookingAvailable', value)}
                />
              }
              label="Online Booking Available"
            />
          </Stack>

          {/* Show booking URL field only when Online Booking is disabled */}
          {!formState.ticketing.onlineBookingAvailable && (
              <TextField
              label="Booking URL"
                placeholder="https://"
                value={formState.ticketing.bookingUrl}
                onChange={(event) => updateTicketField('bookingUrl', event.target.value)}
                fullWidth
              helperText="Enter the external booking URL"
              />
          )}

          {/* Show fee structure only when Online Booking is enabled and entry type is paid */}
          {formState.ticketing.onlineBookingAvailable && formState.ticketing.entryType === 'paid' && (
            <>
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead" sx={{ backgroundColor: '#F7F5FA' }}>
                    <Box component="tr">
                      <Box component="th" sx={{ textAlign: 'left', p: 2 }}>Visitor Type</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2 }}>Fee (₹)</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2 }}>Notes</Box>
                      <Box component="th" sx={{ textAlign: 'right', p: 2 }}>Actions</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {formState.ticketing.fees.map((fee, index) => (
                      <Box component="tr" key={`fee-${index}`} sx={{ borderTop: '1px solid #E0E0E0' }}>
                        <Box component="td" sx={{ p: 2, width: '30%' }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <FormControl fullWidth size="small">
                              <InputLabel id={`ticket-type-label-${index}`}>Ticket Type</InputLabel>
                              <Select
                                labelId={`ticket-type-label-${index}`}
                                label="Ticket Type"
                                value={fee.visitor_type || ''}
                                onChange={(e) => {
                                  const value = e.target.value as string;
                                  if (value === ADD_NEW_TICKET_TYPE_OPTION) {
                                    setShowAddTicketType(true);
                                    return;
                                  }
                                  updateFee(index, { visitor_type: value });
                                }}
                                displayEmpty
                              >
                                <MenuItem value="">
                                  <em>Select Ticket Type</em>
                                </MenuItem>
                                {ticketTypeOptions.map((option) => (
                                  <MenuItem key={option.master_id} value={option.code}>
                                    {option.display_name || option.code}
                                  </MenuItem>
                                ))}
                                <MenuItem value={ADD_NEW_TICKET_TYPE_OPTION}>
                                  <Stack direction="row" alignItems="center" spacing={1}>
                                    <AddIcon fontSize="small" />
                                    <Typography variant="body2">Add New</Typography>
                                  </Stack>
                                </MenuItem>
                              </Select>
                            </FormControl>
                          </Stack>
                        </Box>
                        <Box component="td" sx={{ p: 2, width: '15%' }}>
                          <TextField
                            type="number"
                            value={fee.amount}
                            onChange={(event) => updateFee(index, { amount: Number(event.target.value) })}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <TextField
                            value={fee.notes || ''}
                            onChange={(event) => updateFee(index, { notes: event.target.value })}
                            fullWidth
                            size="small"
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, textAlign: 'right' }}>
                          <IconButton color="error" onClick={() => removeFee(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                sx={{ borderRadius: 3, width: { xs: '100%', sm: 'auto' } }}
                onClick={addFee}
              >
                Add New Fee Type
              </Button>
            </>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <DirectionsBusIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Transportation Information
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            💡 <strong>Translations:</strong> Enter basic details in English, then use the language tabs below to add translations for each transportation option.
          </Typography>
        </Alert>

        <Grid container spacing={3}>
          {formState.transport.map((item, index) => {
            const preset = TRANSPORT_PRESETS.find((presetItem) => presetItem.mode === item.mode);
            return (
              <Grid item xs={12} md={6} key={`transport-${index}`}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: preset?.color || '#E0E0E0', color: '#fff' }}>{preset?.icon || <DirectionsCarIcon />}</Avatar>
                    <TextField
                      label="Name / Station"
                      value={item.name || ''}
                      onChange={(event) => {
                        const value = event.target.value;
                        updateTransport(index, { name: value });
                        
                        // Auto-translate transportation name to other languages (debounced)
                        if (formState.autoTranslate.enabled && value.trim()) {
                          const timerKey = `transport-name-${index}`;
                          
                          // Clear existing timer
                          if (transportAttractionTranslationTimerRef.current[timerKey]) {
                            clearTimeout(transportAttractionTranslationTimerRef.current[timerKey]);
                          }
                          
                          // Set new timer - translate after 1 second of no typing
                          transportAttractionTranslationTimerRef.current[timerKey] = setTimeout(async () => {
                            const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                            
                            console.log(`🌐 Translating transport name "${value}" to ${targetLanguages.length} language(s)...`);
                            
                            // Translate to all target languages
                            for (const lang of targetLanguages) {
                              const translated = await autoTranslateText(value, lang.code, 'en');
                              setFormState(prev => ({
                                ...prev,
                                transportTranslations: {
                                  ...prev.transportTranslations,
                                  [index]: {
                                    ...(prev.transportTranslations[index] || {}),
                                    [lang.code]: {
                                      ...(prev.transportTranslations[index]?.[lang.code] || {}),
                                      name: translated,
                                    },
                                  },
                                },
                              }));
                            }
                            
                            console.log(`✅ Transport name translation complete`);
                          }, 1000); // 1 second debounce
                        }
                      }}
                      fullWidth
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Mode"
                        value={item.mode}
                        onChange={(event) => updateTransport(index, { mode: event.target.value })}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Distance (km)"
                        type="number"
                        value={item.distance_km ?? ''}
                        onChange={(event) => updateTransport(index, { distance_km: Number(event.target.value) })}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Route Information"
                    value={item.route_info || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateTransport(index, { route_info: value });
                      
                      // Auto-translate route information to other languages (debounced)
                      if (formState.autoTranslate.enabled && value.trim()) {
                        const timerKey = `transport-route-${index}`;
                        
                        // Clear existing timer
                        if (transportAttractionTranslationTimerRef.current[timerKey]) {
                          clearTimeout(transportAttractionTranslationTimerRef.current[timerKey]);
                        }
                        
                        // Set new timer - translate after 1 second of no typing
                        transportAttractionTranslationTimerRef.current[timerKey] = setTimeout(async () => {
                          const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                          
                          console.log(`🌐 Translating transport route info "${value}" to ${targetLanguages.length} language(s)...`);
                          
                          // Translate to all target languages
                          for (const lang of targetLanguages) {
                            const translated = await autoTranslateText(value, lang.code, 'en');
                            setFormState(prev => ({
                              ...prev,
                              transportTranslations: {
                                ...prev.transportTranslations,
                                [index]: {
                                  ...(prev.transportTranslations[index] || {}),
                                  [lang.code]: {
                                    ...(prev.transportTranslations[index]?.[lang.code] || {}),
                                    route_info: translated,
                                  },
                                },
                              },
                            }));
                          }
                          
                          console.log(`✅ Transport route info translation complete`);
                        }, 1000); // 1 second debounce
                      }
                    }}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                  />
                  <TextField
                    label="Accessibility Notes"
                    value={item.accessibility_notes || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateTransport(index, { accessibility_notes: value });
                      
                      // Auto-translate accessibility notes to other languages (debounced)
                      if (formState.autoTranslate.enabled && value.trim()) {
                        const timerKey = `transport-accessibility-${index}`;
                        
                        // Clear existing timer
                        if (transportAttractionTranslationTimerRef.current[timerKey]) {
                          clearTimeout(transportAttractionTranslationTimerRef.current[timerKey]);
                        }
                        
                        // Set new timer - translate after 1 second of no typing
                        transportAttractionTranslationTimerRef.current[timerKey] = setTimeout(async () => {
                          const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                          
                          console.log(`🌐 Translating transport accessibility notes "${value}" to ${targetLanguages.length} language(s)...`);
                          
                          // Translate to all target languages
                          for (const lang of targetLanguages) {
                            const translated = await autoTranslateText(value, lang.code, 'en');
                            setFormState(prev => ({
                              ...prev,
                              transportTranslations: {
                                ...prev.transportTranslations,
                                [index]: {
                                  ...(prev.transportTranslations[index] || {}),
                                  [lang.code]: {
                                    ...(prev.transportTranslations[index]?.[lang.code] || {}),
                                    accessibility_notes: translated,
                                  },
                                },
                              },
                            }));
                          }
                          
                          console.log(`✅ Transport accessibility notes translation complete`);
                        }, 1000); // 1 second debounce
                      }
                    }}
                    fullWidth
                    multiline
                    minRows={2}
                    sx={{ mt: 2 }}
                  />
                  
                  {/* Transportation Translations */}
                  <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Translations
                    </Typography>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs 
                        value={transportLanguageTab[index] || LANGUAGES.find(l => l.code !== 'en')?.code || 'hi'} 
                        onChange={(_, newValue) => {
                          setTransportLanguageTab(prev => ({
                            ...prev,
                            [index]: newValue as LanguageCode,
                          }));
                        }}
                        variant="scrollable"
                        scrollButtons="auto"
                      >
                        {LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => (
                          <Tab 
                            key={lang.code} 
                            label={`${lang.flag} ${lang.label}`}
                            value={lang.code}
                          />
                        ))}
                      </Tabs>
                    </Box>
                    {(() => {
                      const currentLang = transportLanguageTab[index] || LANGUAGES.find(l => l.code !== 'en')?.code || 'hi';
                      return (
                      <Stack spacing={2}>
                        <TextField
                          label={`Name / Station (${LANGUAGES.find(l => l.code === currentLang)?.label})`}
                          value={formState.transportTranslations[index]?.[currentLang]?.name || ''}
                          onChange={(event) => {
                            const lang = currentLang;
                            setFormState(prev => ({
                              ...prev,
                              transportTranslations: {
                                ...prev.transportTranslations,
                                [index]: {
                                  ...(prev.transportTranslations[index] || {}),
                                  [lang]: {
                                    ...(prev.transportTranslations[index]?.[lang] || {}),
                                    name: event.target.value,
                                  },
                                },
                              },
                            }));
                            markDirty();
                          }}
                          fullWidth
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {LANGUAGES.find(l => l.code === currentLang)?.flag}
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label={`Route Information (${LANGUAGES.find(l => l.code === currentLang)?.label})`}
                          value={formState.transportTranslations[index]?.[currentLang]?.route_info || ''}
                          onChange={(event) => {
                            const lang = currentLang;
                            setFormState(prev => ({
                              ...prev,
                              transportTranslations: {
                                ...prev.transportTranslations,
                                [index]: {
                                  ...(prev.transportTranslations[index] || {}),
                                  [lang]: {
                                    ...(prev.transportTranslations[index]?.[lang] || {}),
                                    route_info: event.target.value,
                                  },
                                },
                              },
                            }));
                            markDirty();
                          }}
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {LANGUAGES.find(l => l.code === currentLang)?.flag}
                              </InputAdornment>
                            ),
                          }}
                        />
                        <TextField
                          label={`Accessibility Notes (${LANGUAGES.find(l => l.code === currentLang)?.label})`}
                          value={formState.transportTranslations[index]?.[currentLang]?.accessibility_notes || ''}
                          onChange={(event) => {
                            const lang = currentLang;
                            setFormState(prev => ({
                              ...prev,
                              transportTranslations: {
                                ...prev.transportTranslations,
                                [index]: {
                                  ...(prev.transportTranslations[index] || {}),
                                  [lang]: {
                                    ...(prev.transportTranslations[index]?.[lang] || {}),
                                    accessibility_notes: event.target.value,
                                  },
                                },
                              },
                            }));
                            markDirty();
                          }}
                          fullWidth
                          multiline
                          minRows={2}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {LANGUAGES.find(l => l.code === currentLang)?.flag}
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Stack>
                      );
                    })()}
                  </Box>

                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="text"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      removeTransport(index);
                      // Also remove translations and language tab state for this transport
                      setFormState(prev => {
                        const newTransportTranslations = { ...prev.transportTranslations };
                        delete newTransportTranslations[index];
                        // Reindex remaining translations
                        const reindexed: typeof newTransportTranslations = {};
                        Object.keys(newTransportTranslations).forEach((key, newIndex) => {
                          if (Number(key) > index) {
                            reindexed[newIndex] = newTransportTranslations[Number(key)];
                          } else if (Number(key) < index) {
                            reindexed[newIndex] = newTransportTranslations[Number(key)];
                          }
                        });
                        return {
                          ...prev,
                          transportTranslations: reindexed,
                        };
                      });
                      // Clean up language tab state
                      setTransportLanguageTab(prev => {
                        const newTabs = { ...prev };
                        delete newTabs[index];
                        // Reindex remaining tabs
                        const reindexed: typeof newTabs = {};
                        Object.keys(newTabs).forEach((key) => {
                          const keyNum = Number(key);
                          if (keyNum > index) {
                            reindexed[keyNum - 1] = newTabs[keyNum];
                          } else if (keyNum < index) {
                            reindexed[keyNum] = newTabs[keyNum];
                          }
                        });
                        return reindexed;
                      });
                    }}
                  >
                    Remove
                  </Button>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          sx={{ mt: 2, borderRadius: 3, width: { xs: '100%', sm: 'auto' } }}
          onClick={addTransport}
        >
          Add Transport Option
        </Button>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <AttractionIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Nearby Attractions
          </Typography>
        </Stack>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            💡 <strong>Translations:</strong> Enter basic details in English, then use the language tabs below to add translations for each attraction.
          </Typography>
        </Alert>

        <Stack spacing={2}>
          {formState.nearbyAttractions.map((attraction, index) => (
            <Paper variant="outlined" key={`attraction-${index}`} sx={{ p: 2.5, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Attraction Name"
                    value={attraction.name}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateNearbyAttraction(index, { name: value });
                      
                      // Auto-translate attraction name to other languages (debounced)
                      if (formState.autoTranslate.enabled && value.trim()) {
                        const timerKey = `attraction-name-${index}`;
                        
                        // Clear existing timer
                        if (transportAttractionTranslationTimerRef.current[timerKey]) {
                          clearTimeout(transportAttractionTranslationTimerRef.current[timerKey]);
                        }
                        
                        // Set new timer - translate after 1 second of no typing
                        transportAttractionTranslationTimerRef.current[timerKey] = setTimeout(async () => {
                          const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                          
                          console.log(`🌐 Translating attraction name "${value}" to ${targetLanguages.length} language(s)...`);
                          
                          // Translate to all target languages
                          for (const lang of targetLanguages) {
                            const translated = await autoTranslateText(value, lang.code, 'en');
                            setFormState(prev => ({
                              ...prev,
                              attractionTranslations: {
                                ...prev.attractionTranslations,
                                [index]: {
                                  ...(prev.attractionTranslations[index] || {}),
                                  [lang.code]: {
                                    ...(prev.attractionTranslations[index]?.[lang.code] || {}),
                                    name: translated,
                                  },
                                },
                              },
                            }));
                          }
                          
                          console.log(`✅ Attraction name translation complete`);
                        }, 1000); // 1 second debounce
                      }
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Distance (km)"
                    type="number"
                    value={attraction.distance_km ?? ''}
                    onChange={(event) => updateNearbyAttraction(index, { distance_km: Number(event.target.value) })}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Notes"
                    value={attraction.notes || ''}
                    onChange={(event) => {
                      const value = event.target.value;
                      updateNearbyAttraction(index, { notes: value });
                      
                      // Auto-translate attraction notes to other languages (debounced)
                      if (formState.autoTranslate.enabled && value.trim()) {
                        const timerKey = `attraction-notes-${index}`;
                        
                        // Clear existing timer
                        if (transportAttractionTranslationTimerRef.current[timerKey]) {
                          clearTimeout(transportAttractionTranslationTimerRef.current[timerKey]);
                        }
                        
                        // Set new timer - translate after 1 second of no typing
                        transportAttractionTranslationTimerRef.current[timerKey] = setTimeout(async () => {
                          const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                          
                          console.log(`🌐 Translating attraction notes "${value}" to ${targetLanguages.length} language(s)...`);
                          
                          // Translate to all target languages
                          for (const lang of targetLanguages) {
                            const translated = await autoTranslateText(value, lang.code, 'en');
                            setFormState(prev => ({
                              ...prev,
                              attractionTranslations: {
                                ...prev.attractionTranslations,
                                [index]: {
                                  ...(prev.attractionTranslations[index] || {}),
                                  [lang.code]: {
                                    ...(prev.attractionTranslations[index]?.[lang.code] || {}),
                                    notes: translated,
                                  },
                                },
                              },
                            }));
                          }
                          
                          console.log(`✅ Attraction notes translation complete`);
                        }, 1000); // 1 second debounce
                      }
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>

              {/* Attraction Translations */}
              <Box sx={{ mt: 2, borderTop: 1, borderColor: 'divider', pt: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Translations
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs 
                    value={attractionLanguageTab[index] || LANGUAGES.find(l => l.code !== 'en')?.code || 'hi'} 
                    onChange={(_, newValue) => {
                      setAttractionLanguageTab(prev => ({
                        ...prev,
                        [index]: newValue as LanguageCode,
                      }));
                    }}
                    variant="scrollable"
                    scrollButtons="auto"
                  >
                    {LANGUAGES.filter(lang => lang.code !== 'en').map((lang) => (
                      <Tab 
                        key={lang.code} 
                        label={`${lang.flag} ${lang.label}`}
                        value={lang.code}
                      />
                    ))}
                  </Tabs>
                </Box>
                {(() => {
                  const currentLang = attractionLanguageTab[index] || LANGUAGES.find(l => l.code !== 'en')?.code || 'hi';
                  return (
                  <Stack spacing={2}>
                    <TextField
                      label={`Attraction Name (${LANGUAGES.find(l => l.code === currentLang)?.label})`}
                      value={formState.attractionTranslations[index]?.[currentLang]?.name || ''}
                      onChange={(event) => {
                        const lang = currentLang;
                        setFormState(prev => ({
                          ...prev,
                          attractionTranslations: {
                            ...prev.attractionTranslations,
                            [index]: {
                              ...(prev.attractionTranslations[index] || {}),
                              [lang]: {
                                ...(prev.attractionTranslations[index]?.[lang] || {}),
                                name: event.target.value,
                              },
                            },
                          },
                        }));
                        markDirty();
                      }}
                      fullWidth
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {LANGUAGES.find(l => l.code === currentLang)?.flag}
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label={`Notes (${LANGUAGES.find(l => l.code === currentLang)?.label})`}
                      value={formState.attractionTranslations[index]?.[currentLang]?.notes || ''}
                      onChange={(event) => {
                        const lang = currentLang;
                        setFormState(prev => ({
                          ...prev,
                          attractionTranslations: {
                            ...prev.attractionTranslations,
                            [index]: {
                              ...(prev.attractionTranslations[index] || {}),
                              [lang]: {
                                ...(prev.attractionTranslations[index]?.[lang] || {}),
                                notes: event.target.value,
                              },
                            },
                          },
                        }));
                        markDirty();
                      }}
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {LANGUAGES.find(l => l.code === currentLang)?.flag}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Stack>
                  );
                })()}
              </Box>

              <Stack alignItems="flex-end" sx={{ mt: 2 }}>
                <Button 
                  startIcon={<DeleteIcon />} 
                  color="error" 
                  variant="text" 
                  onClick={() => {
                    removeNearbyAttraction(index);
                    // Also remove translations and language tab state for this attraction
                    setFormState(prev => {
                      const newAttractionTranslations = { ...prev.attractionTranslations };
                      delete newAttractionTranslations[index];
                      // Reindex remaining translations
                      const reindexed: typeof newAttractionTranslations = {};
                      Object.keys(newAttractionTranslations).forEach((key, newIndex) => {
                        if (Number(key) > index) {
                          reindexed[newIndex] = newAttractionTranslations[Number(key)];
                        } else if (Number(key) < index) {
                          reindexed[newIndex] = newAttractionTranslations[Number(key)];
                        }
                      });
                      return {
                        ...prev,
                        attractionTranslations: reindexed,
                      };
                    });
                    // Clean up language tab state
                    setAttractionLanguageTab(prev => {
                      const newTabs = { ...prev };
                      delete newTabs[index];
                      // Reindex remaining tabs
                      const reindexed: typeof newTabs = {};
                      Object.keys(newTabs).forEach((key) => {
                        const keyNum = Number(key);
                        if (keyNum > index) {
                          reindexed[keyNum - 1] = newTabs[keyNum];
                        } else if (keyNum < index) {
                          reindexed[keyNum] = newTabs[keyNum];
                        }
                      });
                      return reindexed;
                    });
                  }}
                >
                  Remove
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
        <Button startIcon={<AddIcon />} variant="outlined" sx={{ mt: 2, borderRadius: 3, width: { xs: '100%', sm: 'auto' } }} onClick={addNearbyAttraction}>
          Add Nearby Attraction
        </Button>
      </Paper>

      {/* Add New Ticket Type Dialog */}
      <Dialog
        open={showAddTicketType}
        onClose={() => !creatingTicketType && setShowAddTicketType(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <CheckCircleIcon sx={{ color: '#DA8552' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add New Ticket Type
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Code will be auto-generated</strong> from the English display name when you click "Create".
              </Typography>
            </Alert>
            <Divider />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Translations
            </Typography>
            {formState.autoTranslate.enabled && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Auto-translation is enabled. When you enter English text, it will automatically translate to other languages after you stop typing.
                </Typography>
              </Alert>
            )}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
              <Tabs
                value={currentLanguageTab}
                onChange={(_, newValue) => setCurrentLanguageTab(newValue as LanguageCode)}
                variant="scrollable"
                scrollButtons="auto"
              >
                {LANGUAGES.map((lang) => {
                  const hasTranslation = newTicketTypeTranslations[lang.code]?.displayName?.trim();
                  return (
                    <Tab
                      key={lang.code}
                      label={
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <span>{lang.flag} {lang.label}</span>
                          {hasTranslation && lang.code !== 'en' && (
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          )}
                        </Stack>
                      }
                      value={lang.code}
                    />
                  );
                })}
              </Tabs>
            </Box>
            <TextField
              label={`Display Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter display name (required for English)"
              value={newTicketTypeTranslations[currentLanguageTab].displayName}
              onChange={(e) => {
                const value = e.target.value;
                setNewTicketTypeTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    displayName: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingTicketType(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewTicketTypeTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            displayName: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingTicketType(false);
                  }, 1000);
                }
              }}
              fullWidth
              required={currentLanguageTab === 'en'}
              error={currentLanguageTab === 'en' && !newTicketTypeTranslations.en.displayName.trim()}
              helperText={
                currentLanguageTab === 'en'
                  ? (translatingTicketType ? 'Translating to other languages...' : 'English display name is required')
                  : ''
              }
              InputProps={{
                endAdornment: currentLanguageTab === 'en' && translatingTicketType ? (
                  <InputAdornment position="end">
                    <CircularProgress size={16} />
                  </InputAdornment>
                ) : undefined,
              }}
            />
            <TextField
              label={`Description (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
              placeholder="Enter description (optional)"
              value={newTicketTypeTranslations[currentLanguageTab].description}
              onChange={(e) => {
                const value = e.target.value;
                setNewTicketTypeTranslations(prev => ({
                  ...prev,
                  [currentLanguageTab]: {
                    ...prev[currentLanguageTab],
                    description: value,
                  },
                }));
                if (currentLanguageTab === 'en' && value.trim() && formState.autoTranslate.enabled) {
                  if (accessibilityTranslationTimerRef.current) {
                    clearTimeout(accessibilityTranslationTimerRef.current);
                  }
                  accessibilityTranslationTimerRef.current = setTimeout(async () => {
                    setTranslatingTicketType(true);
                    const targetLanguages = LANGUAGES.filter(l => l.code !== 'en');
                    for (const lang of targetLanguages) {
                      try {
                        const translated = await autoTranslateText(value, lang.code, 'en');
                        setNewTicketTypeTranslations(prev => ({
                          ...prev,
                          [lang.code]: {
                            ...prev[lang.code],
                            description: translated,
                          },
                        }));
                      } catch (error) {
                        console.error(`Failed to translate to ${lang.code}:`, error);
                      }
                    }
                    setTranslatingTicketType(false);
                  }, 1000);
                }
              }}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              if (accessibilityTranslationTimerRef.current) {
                clearTimeout(accessibilityTranslationTimerRef.current);
                accessibilityTranslationTimerRef.current = null;
              }
              setShowAddTicketType(false);
              setNewTicketTypeTranslations({
                en: { displayName: '', description: '' },
                hi: { displayName: '', description: '' },
                gu: { displayName: '', description: '' },
                ja: { displayName: '', description: '' },
                es: { displayName: '', description: '' },
                fr: { displayName: '', description: '' },
              });
              setTranslatingTicketType(false);
            }}
            disabled={creatingTicketType}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCreateTicketType}
            disabled={creatingTicketType || !newTicketTypeTranslations.en.displayName.trim()}
            startIcon={creatingTicketType ? <CircularProgress size={18} /> : <AddIcon />}
            sx={{ backgroundColor: '#DA8552' }}
          >
            {creatingTicketType ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );

  const renderReviewStep = () => (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <VisibilityIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Preview
          </Typography>
        </Stack>

        <Stack spacing={2}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {formState.overview.siteName || 'Site name not provided'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formState.overview.locationAddress || 'Location details pending'}
          </Typography>
          
          {/* Media Preview Section */}
          {formState.overview.media.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Card sx={{ bgcolor: 'rgba(218, 133, 82, 0.05)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <CloudUploadIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Media Gallery ({formState.overview.media.length} {formState.overview.media.length === 1 ? 'image' : 'images'})
                    </Typography>
                  </Stack>
                  <Grid container spacing={1}>
                    {formState.overview.media.slice(0, 4).map((item) => (
                      <Grid item xs={6} sm={3} key={item.id}>
                        <Box
                          component="img"
                          src={item.previewUrl}
                          alt={item.label}
                          sx={{
                            width: '100%',
                            height: 80,
                            objectFit: 'cover',
                            borderRadius: 2,
                            border: item.isPrimary ? '2px solid #4CAF50' : '1px solid #E0E0E0',
                          }}
                        />
                        {item.isPrimary && (
                          <Chip
                            label="Primary"
                            size="small"
                            color="success"
                            sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                          />
                        )}
                      </Grid>
                    ))}
                  </Grid>
                  {formState.overview.media.length > 4 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      + {formState.overview.media.length - 4} more image(s)
                    </Typography>
                  )}
                  {formState.overview.media.filter(m => m.file).length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        📤 {formState.overview.media.filter(m => m.file).length} pending image(s) will be uploaded when you submit this form.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          {/* Site Map Preview Section */}
          {(formState.siteMapFile || formState.siteMapPreviewUrl) && (
            <>
              <Divider sx={{ my: 2 }} />
              <Card sx={{ bgcolor: 'rgba(218, 133, 82, 0.05)' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <InsertDriveFileIcon color="primary" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Site Map
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <InsertDriveFileIcon sx={{ fontSize: 40, color: '#3F3D56' }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        {formState.siteMapFile ? formState.siteMapFile.name : 'Uploaded Site Map'}
                      </Typography>
                      {formState.siteMapFile && (
                        <Typography variant="caption" color="text.secondary">
                          {(formState.siteMapFile.size / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      )}
                    </Box>
                    {formState.siteMapFile ? (
                      <Chip
                        label="Pending"
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 600 }}
                      />
                    ) : (
                      <Chip
                        label="Saved"
                        size="small"
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                  {formState.siteMapFile && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        📤 Site map will be uploaded when you submit this form.
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </>
          )}
          
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AccessTimeIcon color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Opening Hours
                  </Typography>
                </Stack>
                <Stack spacing={0.5} sx={{ mt: 2 }}>
                  {formState.overview.openingHours.schedule.map((day) => (
                    <Typography key={day.day} variant="body2">
                      <strong>{day.day}:</strong> {day.is_open ? `${day.opening_time} - ${day.closing_time}` : 'Closed'}
                    </Typography>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalOfferIcon color="primary" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Entry Fees
                  </Typography>
                </Stack>
                <Stack spacing={0.5} sx={{ mt: 2 }}>
                  {formState.ticketing.entryType === 'free' ? (
                    <Typography variant="body2">Free entry for all visitors.</Typography>
                  ) : (
                    formState.ticketing.fees.map((fee) => (
                      <Typography key={fee.visitor_type} variant="body2">
                        <strong>{fee.visitor_type}</strong>: ₹{fee.amount}
                      </Typography>
                    ))
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56', mb: 2 }}>
          Completion Status
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(76, 175, 80, 0.3)', backgroundColor: 'rgba(76, 175, 80, 0.08)' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#2E7D32', mb: 1 }}>
                Completed Sections
              </Typography>
              <Stack spacing={1}>
                {completionSummary.completed.map((item) => (
                  <Stack direction="row" spacing={1} alignItems="center" key={item}>
                    <CheckCircleIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
                {completionSummary.completed.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No sections completed yet. Fill in the form to see progress.
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3, borderColor: 'rgba(255, 193, 7, 0.3)', backgroundColor: 'rgba(255, 193, 7, 0.08)' }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#F9A825', mb: 1 }}>
                Missing Information
              </Typography>
              <Stack spacing={1}>
                {completionSummary.missing.map((item) => (
                  <Stack direction="row" spacing={1} alignItems="center" key={item}>
                    <ErrorOutlineIcon fontSize="small" sx={{ color: '#FFB300' }} />
                    <Typography variant="body2">{item}</Typography>
                  </Stack>
                ))}
                {completionSummary.missing.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    All required sections look good!
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>


      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56', mb: 2 }}>
          Save Options
        </Typography>

        <RadioGroup
          row
          value={formState.admin.saveOption}
          onChange={(event) => updateAdminField('saveOption', event.target.value as 'draft' | 'approval')}
        >
          <FormControlLabel value="draft" control={<Radio />} label="Save as Draft" />
          <FormControlLabel value="approval" control={<Radio />} label="Submit for Approval" />
        </RadioGroup>

        <TextField
          label="Admin Notes (Optional)"
          multiline
          minRows={4}
          value={formState.admin.notes}
          onChange={(event) => updateAdminField('notes', event.target.value)}
          fullWidth
          sx={{ mt: 2 }}
          placeholder="Add any notes for the admin review team..."
        />
      </Paper>

      {submitError && (
        <Alert severity="error" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      )}
      {submitSuccess && (
        <Alert severity="success" onClose={() => setSubmitSuccess(null)}>
          {submitSuccess}
        </Alert>
      )}
    </Stack>
  );

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/masters')}>
          Back to Heritage Sites
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, pb: 6 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="outlined"
          sx={{ borderRadius: 3 }}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#3F3D56', flexGrow: 1 }}>
          {pageTitle}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" color={autoSaveStatus === 'saved' ? 'text.secondary' : '#DA8552'}>
            {autoSaveMessage}
          </Typography>
          <Button
            startIcon={<SaveIcon />}
            variant="outlined"
            sx={{ borderRadius: 3 }}
            onClick={() => updateAdminField('saveOption', 'draft')}
          >
            Save as Draft
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={3}>
        {renderStepper()}

        {currentStep === 'overview' && renderOverviewStep()}
        {currentStep === 'about' && renderAboutStep()}
        {currentStep === 'plan' && renderPlanStep()}
        {currentStep === 'review' && renderReviewStep()}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            sx={{ borderRadius: 3 }}
            onClick={handlePrev}
            disabled={currentStep === 'overview'}
          >
            Previous
          </Button>
          {currentStep !== 'review' ? (
            <Button
              variant="contained"
              endIcon={<ArrowBackIcon sx={{ transform: 'rotate(180deg)' }} />}
              sx={{ borderRadius: 3, backgroundColor: '#DA8552' }}
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
              sx={{ borderRadius: 3, backgroundColor: '#3F3D56' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitButtonLabel}
            </Button>
          )}
        </Stack>
      </Stack>

      {toastVisible && (
        <Paper
          elevation={6}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            borderRadius: 3,
          }}
        >
          <Avatar sx={{ bgcolor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50' }}>
            <CheckIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Auto-saved
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Your changes have been saved
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AddHeritageSite;

