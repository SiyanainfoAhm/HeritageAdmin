import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Radio,
  RadioGroup,
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
import { useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  HeritageSiteAmenity,
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
  HeritageSiteEtiquetteInput,
  HeritageSiteMediaInput,
  HeritageSiteService,
  HeritageSiteTicketTypeInput,
  HeritageSiteTranslationInput,
  HeritageSiteTransportationInput,
  HeritageSiteVisitingHoursInput,
} from '@/services/heritageSite.service';

type StepKey = 'overview' | 'about' | 'plan' | 'review';
type LanguageCode = 'en' | 'gu' | 'hi' | 'es';

interface LocalMediaItem {
  id: string;
  file?: File;
  previewUrl?: string;
  label?: string;
  isPrimary?: boolean;
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
    locationArea: string;
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
    amenities: HeritageSiteAmenity[];
    newAmenityIcon: string;
  };
  translations: {
    overview: Record<LanguageCode, string>;
    history: Record<LanguageCode, string>;
  };
  audioGuides: LocalAudioGuide[];
  siteMapFile?: File | null;
  siteMapPreviewUrl?: string | null;
  culturalEtiquettes: string[];
  ticketing: {
    entryType: 'free' | 'paid';
    bookingUrl: string;
    onlineBookingAvailable: boolean;
    fees: HeritageSiteFeeBreakup[];
  };
  transport: HeritageSiteTransportOption[];
  nearbyAttractions: HeritageSiteAttraction[];
  admin: {
    saveOption: 'draft' | 'approval';
    notes: string;
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
  { code: 'gu', label: 'Gujarati', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', flag: '🇪🇸' },
];

const TRANSPORT_PRESETS: TransportPreset[] = [
  { mode: 'metro', icon: <TrainIcon />, color: '#3F3D56' },
  { mode: 'bus', icon: <DirectionsBusIcon />, color: '#1976d2' },
  { mode: 'taxi', icon: <DirectionsCarIcon />, color: '#DA8552' },
];

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const createInitialOpeningHours = (): HeritageSiteOpeningHours => ({
  schedule: DAY_ORDER.map<HeritageSiteOpeningDay>((day) => ({
    day,
    is_open: day !== 'Sunday',
    opening_time: '09:00',
    closing_time: '18:00',
  })),
  notes: null,
});

const INITIAL_AMENITIES: HeritageSiteAmenity[] = [
  { name: 'Wheelchair Access', icon: 'ri-wheelchair-line' },
  { name: 'Parking', icon: 'ri-parking-line' },
  { name: 'Restaurant', icon: 'ri-restaurant-line' },
  { name: 'Gift Shop', icon: 'ri-store-2-line' },
];

const initialFormState: AddHeritageSiteState = {
  overview: {
    siteName: '',
    siteShortDescription: '',
    siteFullDescription: '',
    locationAddress: '',
    locationArea: '',
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
    amenities: INITIAL_AMENITIES,
    newAmenityIcon: 'ri-apps-line',
  },
  translations: {
    overview: {
      en: '',
      gu: '',
      hi: '',
      es: '',
    },
    history: {
      en: '',
      gu: '',
      hi: '',
      es: '',
    },
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
  culturalEtiquettes: [
    'Remove footwear before entering the temple premises',
    'Dress modestly, covering shoulders and knees',
    'Photography is allowed in most areas, but flash is prohibited near carvings',
    'Maintain silence and respect the religious significance of the site',
  ],
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
    { mode: 'metro', name: 'Ahmedabad Metro', distance_km: 35, notes: 'Nearest major metro connection' },
    { mode: 'bus', name: 'Modhera Village Bus Stand', distance_km: 0.5, notes: 'Frequent local buses available' },
    { mode: 'taxi', name: 'Modhera Village Auto Stand', distance_km: 0.3, notes: 'Taxi and auto services' },
  ],
  nearbyAttractions: [
    { name: 'Sun Temple Museum', distance_km: 0.2, notes: '' },
    { name: 'Maataji Temple', distance_km: 1.5, notes: '' },
  ],
  admin: {
    saveOption: 'draft',
    notes: '',
  },
};

const AddHeritageSite = () => {
  const navigate = useNavigate();
  const { siteId: siteIdParam } = useParams();
  const numericSiteId = siteIdParam ? Number(siteIdParam) : null;
  const isEdit = Number.isFinite(numericSiteId);

  const [formState, setFormState] = useState<AddHeritageSiteState>(initialFormState);
  const [initialLoading, setInitialLoading] = useState<boolean>(Boolean(isEdit));
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<StepKey>('overview');
  const [overviewLang, setOverviewLang] = useState<LanguageCode>('en');
  const [historyLang, setHistoryLang] = useState<LanguageCode>('en');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>(Boolean(isEdit) ? 'idle' : 'saved');
  const [autoSaveMessage, setAutoSaveMessage] = useState<string>(isEdit ? 'Loading site details…' : 'All changes saved');
  const [toastVisible, setToastVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

  const markDirty = useCallback(() => {
    setAutoSaveStatus('saving');
  }, []);

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
      const visitingMap = new Map(
        (details.visitingHours || []).map((item) => {
          // day_of_week can be number (1-7) or string (day name)
          const dayName = typeof item.day_of_week === 'number' 
            ? dayNumberToName[item.day_of_week] || DAY_ORDER[item.day_of_week - 1]
            : item.day_of_week;
          return [dayName.toLowerCase(), item];
        })
      );

      const schedule = baseOpening.schedule.map((day) => {
        const match = visitingMap.get(day.day.toLowerCase());
        if (!match) {
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
        const openingTime = matchAny.open_time || matchAny.opening_time;
        const closingTime = matchAny.close_time || matchAny.closing_time;

        return {
          ...day,
          is_open: isOpen,
          opening_time: openingTime ? formatTime(openingTime) : '09:00',
          closing_time: closingTime ? formatTime(closingTime) : '18:00',
        };
      });

      const galleryMedia = (details.media || []).filter((item) => item.media_type !== 'audio');
      const mediaState = galleryMedia.map((item, index) => ({
        id: String(item.media_id ?? `${item.media_type}-${index}`),
        file: undefined,
        previewUrl: item.storage_url,
        label: item.label ?? undefined,
        isPrimary: Boolean(item.is_primary),
      }));

      if (mediaState.length > 0 && !mediaState.some((item) => item.isPrimary)) {
        mediaState[0].isPrimary = true;
      }

      const audioGuidesState: LocalAudioGuide[] = LANGUAGES.map((lang) => {
        const match = (details.media || []).find(
          (item) => item.media_type === 'audio' && (item.language_code || '').toLowerCase() === lang.code
        );

        return {
          id: `audio-${lang.code}`,
          language: lang.code,
          url: match?.storage_url || '',
          duration_seconds: match?.duration_seconds ?? null,
          file_name: match?.label ?? null,
          file: undefined,
        };
      });

      const ticketFees: HeritageSiteFeeBreakup[] = (details.ticketTypes || []).map((ticket) => ({
        visitor_type: ticket.visitor_type,
        amount: ticket.amount,
        notes: ticket.notes,
      }));

      const transportOptions: HeritageSiteTransportOption[] = (details.transportation || [])
        .filter((item) => item.category === 'transport')
        .map((item) => ({
          mode: item.mode ?? '',
          name: item.name,
          distance_km: item.distance_km ?? undefined,
          notes: item.notes ?? undefined,
        }));

      const nearbyAttractions: HeritageSiteAttraction[] = (details.transportation || [])
        .filter((item) => item.category === 'attraction')
        .map((item) => ({
          name: item.name,
          distance_km: item.distance_km ?? undefined,
          notes: item.notes ?? undefined,
        }));

      const overviewTranslations = {
        ...initialFormState.translations.overview,
        ...(site.overview_translations ?? {}),
      } as Record<LanguageCode, string>;

      const historyTranslations = {
        ...initialFormState.translations.history,
        ...(site.history_translations ?? {}),
      } as Record<LanguageCode, string>;

      const entryType = (site.entry_type as 'free' | 'paid') ?? 'free';

      const hydratedState: AddHeritageSiteState = {
        overview: {
          ...initialFormState.overview,
          siteName: site.name_default ?? '',
          siteShortDescription: site.short_desc_default ?? '',
          siteFullDescription: site.full_desc_default ?? '',
          locationAddress: site.location_address ?? '',
          locationArea: site.location_area ?? '',
          locationCity: site.location_city ?? '',
          locationState: site.location_state ?? '',
          locationCountry: site.location_country ?? '',
          locationPostalCode: site.location_postal_code ?? '',
          latitude: site.latitude !== null && site.latitude !== undefined ? String(site.latitude) : '',
          longitude: site.longitude !== null && site.longitude !== undefined ? String(site.longitude) : '',
          media: mediaState,
          video360Url: site.video_360_url ?? site.vr_link ?? '',
          arModeAvailable: Boolean(site.ar_mode_available),
          openingHours: {
            schedule,
            notes: null,
          },
          amenities: site.amenities ?? [],
          newAmenityIcon: initialFormState.overview.newAmenityIcon,
        },
        translations: {
          overview: overviewTranslations,
          history: historyTranslations,
        },
        audioGuides: audioGuidesState,
        siteMapFile: null,
        siteMapPreviewUrl: site.site_map_url ?? null,
        culturalEtiquettes: site.cultural_etiquettes ?? [],
        ticketing: {
          entryType,
          bookingUrl: site.booking_url ?? '',
          onlineBookingAvailable: Boolean(site.booking_online_available),
          fees:
            entryType === 'paid'
              ? ticketFees.length > 0
                ? ticketFees
                : initialFormState.ticketing.fees
              : [],
        },
        transport: transportOptions,
        nearbyAttractions,
        admin: {
          saveOption: !site.is_active ? 'draft' : 'approval', // Use is_active instead of status
          notes: '',
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

  const updateOverviewField = <K extends keyof AddHeritageSiteState['overview']>(key: K, value: AddHeritageSiteState['overview'][K]) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        [key]: value,
      },
    }));
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

  const handleMediaFiles = (files: FileList | File[]) => {
    const mapped: LocalMediaItem[] = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      label: file.name,
      isPrimary: false,
    }));

    if (mapped.length === 0) return;
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

  const removeMediaItem = (id: string) => {
    markDirty();
    setFormState((prev) => {
      const filtered = prev.overview.media.filter((item) => item.id !== id);
      if (filtered.length > 0 && !filtered.some((item) => item.isPrimary)) {
        filtered[0].isPrimary = true;
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

  const togglePrimaryMedia = (id: string) => {
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

  const updateTranslation = (type: 'overview' | 'history', lang: LanguageCode, value: string) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [type]: {
          ...prev.translations[type],
          [lang]: value,
        },
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

  const addAmenity = (name: string) => {
    if (!name.trim()) return;
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        amenities: [
          ...prev.overview.amenities,
          {
            name: name.trim(),
            icon: prev.overview.newAmenityIcon || undefined,
          },
        ],
      },
    }));
  };

  const removeAmenity = (index: number) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        amenities: prev.overview.amenities.filter((_, idx) => idx !== index),
      },
    }));
  };

  const addCulturalEtiquette = (value: string) => {
    if (!value.trim()) return;
    markDirty();
    setFormState((prev) => ({
      ...prev,
      culturalEtiquettes: [...prev.culturalEtiquettes, value.trim()],
    }));
  };

  const removeCulturalEtiquette = (index: number) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      culturalEtiquettes: prev.culturalEtiquettes.filter((_, idx) => idx !== index),
    }));
  };

  const updateTicketField = <K extends keyof AddHeritageSiteState['ticketing']>(
    key: K,
    value: AddHeritageSiteState['ticketing'][K]
  ) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      ticketing: {
        ...prev.ticketing,
        [key]: value,
      },
    }));
  };

  const updateFee = (index: number, updates: Partial<HeritageSiteFeeBreakup>) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      ticketing: {
        ...prev.ticketing,
        fees: prev.ticketing.fees.map((fee, idx) => (idx === index ? { ...fee, ...updates } : fee)),
      },
    }));
  };

  const addFee = () => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      ticketing: {
        ...prev.ticketing,
        fees: [
          ...prev.ticketing.fees,
          {
            visitor_type: 'New visitor type',
            amount: 0,
            notes: '',
          },
        ],
      },
    }));
  };

  const removeFee = (index: number) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      ticketing: {
        ...prev.ticketing,
        fees: prev.ticketing.fees.filter((_, idx) => idx !== index),
      },
    }));
  };

  const addTransport = () => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      transport: [
        ...prev.transport,
        { mode: 'custom', name: '', distance_km: null, notes: '' },
      ],
    }));
  };

  const updateTransport = (index: number, updates: Partial<HeritageSiteTransportOption>) => {
    markDirty();
    setFormState((prev) => ({
      ...prev,
      transport: prev.transport.map((item, idx) => (idx === index ? { ...item, ...updates } : item)),
    }));
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
    markDirty();
    setFormState((prev) => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.map((item, idx) =>
        idx === index ? { ...item, ...updates } : item
      ),
    }));
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

    if (Object.values(formState.translations.overview).some((value) => value.trim())) {
      completed.push('Overview Translations');
    } else {
      missing.push('Overview translations');
    }

    if (Object.values(formState.translations.history).some((value) => value.trim())) {
      completed.push('History Translations');
    } else {
      missing.push('History translations');
    }

    const missingAudio = formState.audioGuides.filter((guide) => !guide.file && !guide.url);
    if (missingAudio.length === 0) {
      completed.push('Audio Guides');
    } else {
      missing.push(`${missingAudio.length} audio guides missing`);
    }

    return { completed, missing };
  }, [formState]);

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
          storage_url: item.previewUrl || '',
          thumbnail_url: item.previewUrl || null, // Not in database but kept for interface
          label: item.label || null, // Not in database but kept for interface
          language_code: item.file?.type.startsWith('audio/') ? 'en' : null, // Not in database but kept for interface
          duration_seconds: null, // Not in database
          is_primary: item.isPrimary ?? index === 0,
          position: index + 1, // Actual database column
        };
      })
      .filter((item) => item.storage_url);

    const audioMedia: HeritageSiteMediaInput[] = formState.audioGuides
      .filter((guide) => Boolean(guide.url))
      .map((guide, index) => ({
        media_type: 'audio' as const,
        storage_url: guide.url || '',
        thumbnail_url: null,
        label: guide.file?.name || guide.file_name || `Audio guide (${guide.language.toUpperCase()})`,
        language_code: guide.language,
        duration_seconds: guide.duration_seconds ?? null,
        is_primary: false,
        position: galleryMedia.length + index + 1, // Continue position numbering after gallery media
      }))
      .filter((item) => item.storage_url);

    const mediaItems: HeritageSiteMediaInput[] = [...galleryMedia, ...audioMedia];

    // Ensure at least one media item is marked as primary (hero image)
    if (mediaItems.length > 0 && !mediaItems.some((item) => item.is_primary)) {
      mediaItems[0].is_primary = true;
    }

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
      // Legacy fields (filtered out but kept for interface compatibility)
      site_type: null,
      experience: null,
      accessibility: null,
      entry_type: formState.ticketing.entryType,
      entry_fee: formState.ticketing.entryType === 'paid' ? Number(formState.ticketing.fees[0]?.amount ?? 0) : 0,
      status,
      video_360_url: formState.overview.video360Url.trim() || null,
      ar_mode_available: formState.overview.arModeAvailable,
      amenities: formState.overview.amenities,
      overview_translations: formState.translations.overview,
      history_translations: formState.translations.history,
      booking_url: formState.ticketing.bookingUrl.trim() || null,
      booking_online_available: formState.ticketing.onlineBookingAvailable,
      site_map_url: formState.siteMapPreviewUrl || null,
      cultural_etiquettes: formState.culturalEtiquettes,
      // Location fields for translation table
      location_address: formState.overview.locationAddress.trim() || null,
      location_area: formState.overview.locationArea.trim() || null,
      location_city: formState.overview.locationCity.trim() || null,
      location_state: formState.overview.locationState.trim() || null,
      location_country: formState.overview.locationCountry.trim() || null,
      location_postal_code: formState.overview.locationPostalCode.trim() || null,
    };

    const visitingHours: HeritageSiteVisitingHoursInput[] = formState.overview.openingHours.schedule.map((day) => ({
      day_of_week: day.day,
      is_open: day.is_open,
      opening_time: day.is_open && day.opening_time ? `${day.opening_time}:00` : null,
      closing_time: day.is_open && day.closing_time ? `${day.closing_time}:00` : null,
      notes: null,
    }));

    const ticketTypes: HeritageSiteTicketTypeInput[] =
      formState.ticketing.entryType === 'paid'
        ? formState.ticketing.fees
            .filter((fee) => fee.visitor_type.trim())
            .map((fee) => ({
              visitor_type: fee.visitor_type.trim(),
              amount: Number(fee.amount) || 0,
              currency: 'INR',
              notes: fee.notes?.trim() || null,
            }))
        : [];

    const transportation: HeritageSiteTransportationInput[] = [
      ...formState.transport
        .filter((item) => (item.name || '').trim())
        .map((item) => ({
          category: 'transport' as const,
          mode: item.mode || null,
          name: item.name?.trim() || '',
          description: item.notes?.trim() || null,
          distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
          travel_time_minutes: null,
          notes: item.notes?.trim() || null,
          contact_info: null,
        })),
      ...formState.nearbyAttractions
        .filter((item) => (item.name || '').trim())
        .map((item) => ({
          category: 'attraction' as const,
          mode: null,
          name: item.name.trim(),
          description: item.notes?.trim() || null,
          distance_km: item.distance_km !== undefined && item.distance_km !== null ? Number(item.distance_km) : null,
          travel_time_minutes: null,
          notes: item.notes?.trim() || null,
          contact_info: null,
        })),
    ];

    // Convert cultural etiquettes to HeritageSiteEtiquetteInput format
    // Heritage_SiteEtiquette uses rule_title and rule_description
    const etiquettes = formState.culturalEtiquettes
      .filter((etiquette) => etiquette.trim())
      .map((etiquette) => ({
        rule_title: etiquette.trim(), // Use etiquette text as rule title
        rule_description: null, // Can be enhanced later
        icon_name: null,
        importance_level: 'normal' as const,
        // Legacy support
        etiquette_text: etiquette.trim(),
      }));

    // Convert translations to HeritageSiteTranslationInput format
    // Heritage_SiteTranslation: ONE ROW PER LANGUAGE with all fields
    const translations: HeritageSiteTranslationInput[] = [];

    // Group by language and collect all fields
    const translationsByLang: Record<string, {
      name?: string;
      short_desc?: string;
      full_desc?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }> = {};

    // Add overview translations (maps to short_desc)
    Object.entries(formState.translations.overview).forEach(([lang, content]) => {
      if (content && content.trim()) {
        const langUpper = lang.toUpperCase();
        if (!translationsByLang[langUpper]) {
          translationsByLang[langUpper] = {};
        }
        translationsByLang[langUpper].short_desc = content.trim();
      }
    });

    // Add history translations (maps to full_desc)
    Object.entries(formState.translations.history).forEach(([lang, content]) => {
      if (content && content.trim()) {
        const langUpper = lang.toUpperCase();
        if (!translationsByLang[langUpper]) {
          translationsByLang[langUpper] = {};
        }
        translationsByLang[langUpper].full_desc = content.trim();
      }
    });

    // Add location fields to English translation
    if (!translationsByLang['EN']) {
      translationsByLang['EN'] = {};
    }
    if (formState.overview.locationAddress.trim()) {
      translationsByLang['EN'].address = formState.overview.locationAddress.trim();
    }
    if (formState.overview.locationCity.trim()) {
      translationsByLang['EN'].city = formState.overview.locationCity.trim();
    }
    if (formState.overview.locationState.trim()) {
      translationsByLang['EN'].state = formState.overview.locationState.trim();
    }
    if (formState.overview.locationCountry.trim()) {
      translationsByLang['EN'].country = formState.overview.locationCountry.trim();
    }

    // Convert to translation input format
    Object.entries(translationsByLang).forEach(([lang, data]) => {
      const translation: HeritageSiteTranslationInput = {
        language_code: lang,
        name: formState.overview.siteName.trim(), // Use site name for all languages
        short_desc: data.short_desc || undefined,
        full_desc: data.full_desc || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        country: data.country || undefined,
      };
      translations.push(translation);
    });

    return {
      site,
      media: mediaItems,
      visitingHours,
      ticketTypes,
      transportation,
      amenities: formState.overview.amenities,
      etiquettes,
      translations,
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const request = buildCreateRequest();
      if (!request.site.name_default) {
        throw new Error('Site name is required before submitting.');
      }
      if (isEdit && numericSiteId !== null) {
        const updateResult = await HeritageSiteService.updateHeritageSiteWithDetails(numericSiteId, request);
        if (!updateResult.success) {
          const message = updateResult.error?.message || 'Failed to update heritage site.';
          throw new Error(message);
        }
        setSubmitSuccess('Heritage site updated successfully.');
      } else {
        const createResult = await HeritageSiteService.createHeritageSiteWithDetails(request);
        if (!createResult.success) {
          const message = createResult.error?.message || 'Failed to create heritage site.';
          throw new Error(message);
        }
        setSubmitSuccess('Heritage site created successfully.');
      }

      setTimeout(() => {
        navigate('/masters', { state: { heritageAction: isEdit ? 'updated' : 'created' } });
      }, 800);
    } catch (error: any) {
      setSubmitError(error?.message || 'Failed to save heritage site.');
    } finally {
      setSubmitting(false);
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
      <Paper
        variant="outlined"
        sx={{
          borderStyle: 'dashed',
          borderColor: '#DA8552',
          borderWidth: 2,
          borderRadius: 4,
          p: 4,
          textAlign: 'center',
          backgroundColor: 'rgba(218, 133, 82, 0.05)',
          cursor: 'pointer',
        }}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          handleMediaFiles(event.dataTransfer.files);
        }}
        onClick={() => {
          const input = document.getElementById('heritage-media-input');
          input?.click();
        }}
      >
        <input
          id="heritage-media-input"
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(event) => {
            if (event.target.files) {
              handleMediaFiles(event.target.files);
            }
          }}
        />
        <Stack spacing={2} alignItems="center">
          <CloudUploadIcon sx={{ fontSize: 48, color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Drag & drop files here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            or click to browse files (images, videos)
          </Typography>
          <Button variant="contained" startIcon={<CloudUploadIcon />} sx={{ borderRadius: 6, backgroundColor: '#DA8552' }}>
            Browse Files
          </Button>
        </Stack>
      </Paper>

      {formState.overview.media.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
            Uploaded Media ({formState.overview.media.length})
          </Typography>
          <Grid container spacing={2}>
            {formState.overview.media.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.id}>
                <Card
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
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
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                      <Chip
                        size="small"
                        label={item.isPrimary ? 'Primary' : 'Secondary'}
                        color={item.isPrimary ? 'success' : 'default'}
                        onClick={() => togglePrimaryMedia(item.id)}
                        sx={{ fontWeight: 600 }}
                      />
                      <IconButton size="small" onClick={() => removeMediaItem(item.id)}>
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
              Provide the heritage site name, detailed location, media gallery and amenities.
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={3}>
          <TextField
            required
            label="Site Name"
            placeholder="Enter heritage site name"
            value={formState.overview.siteName}
            onChange={(event) => updateOverviewField('siteName', event.target.value)}
            fullWidth
            InputProps={{
              endAdornment: formState.overview.siteName ? (
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
            onChange={(event) => updateOverviewField('siteShortDescription', event.target.value)}
            fullWidth
            multiline
            minRows={2}
            helperText={`${formState.overview.siteShortDescription.length}/250`}
            inputProps={{ maxLength: 250 }}
          />

          <TextField
            label="Site Description"
            placeholder="Describe the heritage site in detail"
            value={formState.overview.siteFullDescription}
            onChange={(event) => updateOverviewField('siteFullDescription', event.target.value)}
            fullWidth
            multiline
            minRows={4}
          />

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
                  onChange={(event) => updateOverviewField('locationAddress', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MapIcon />}
                  sx={{ height: '100%', borderRadius: 3 }}
                >
                  Pin on Map
                </Button>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Area"
                  value={formState.overview.locationArea}
                  onChange={(event) => updateOverviewField('locationArea', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="City"
                  value={formState.overview.locationCity}
                  onChange={(event) => updateOverviewField('locationCity', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="State"
                  value={formState.overview.locationState}
                  onChange={(event) => updateOverviewField('locationState', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Country"
                  value={formState.overview.locationCountry}
                  onChange={(event) => updateOverviewField('locationCountry', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Postal Code"
                  value={formState.overview.locationPostalCode}
                  onChange={(event) => updateOverviewField('locationPostalCode', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  label="Latitude"
                  value={formState.overview.latitude}
                  onChange={(event) => updateOverviewField('latitude', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={2.5}>
                <TextField
                  label="Longitude"
                  value={formState.overview.longitude}
                  onChange={(event) => updateOverviewField('longitude', event.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <Box
                  sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                    height: 240,
                    backgroundImage:
                      "url('https://public.readdy.ai/gen_page/map_placeholder_1280x720.png')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box>{renderMediaGallery()}</Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label="360° Video Link"
                placeholder="Paste YouTube or Vimeo embed link"
                value={formState.overview.video360Url}
                onChange={(event) => updateOverviewField('video360Url', event.target.value)}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ height: '100%', borderRadius: 3 }}
              >
                Upload Video
              </Button>
            </Grid>
          </Grid>

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
                value={formState.overview.openingHours.schedule[0]?.opening_time || ''}
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
                value={formState.overview.openingHours.schedule[0]?.closing_time || ''}
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
            Amenities
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          {formState.overview.amenities.map((amenity, index) => (
            <Grid item xs={12} sm={6} md={3} key={`${amenity.name}-${index}`}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Stack spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(218,133,82,0.12)', color: '#DA8552', width: 64, height: 64, fontSize: 24 }}>
                      {amenity.name.charAt(0)}
                    </Avatar>
                    <Typography variant="subtitle2" textAlign="center" sx={{ fontWeight: 600 }}>
                      {amenity.name}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="small" color="error" onClick={() => removeAmenity(index)}>
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
          <TextField
            label="Add new amenity"
            placeholder="Amenity name"
            fullWidth
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const value = (event.target as HTMLInputElement).value;
                addAmenity(value);
                (event.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ borderRadius: 3, backgroundColor: '#DA8552' }}
            onClick={() => {
              const input = document.getElementById('amenity-input') as HTMLInputElement | null;
              if (input && input.value) {
                addAmenity(input.value);
                input.value = '';
              }
            }}
          >
            Add Amenity
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56', mb: 2 }}>
          Overview Text
        </Typography>

        <Tabs
          value={overviewLang}
          onChange={(_event, value) => setOverviewLang(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              value={lang.code}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{lang.flag}</span>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {lang.label}
                  </Typography>
                </Stack>
              }
              sx={{
                textTransform: 'none',
                fontWeight: overviewLang === lang.code ? 700 : 500,
              }}
            />
          ))}
        </Tabs>

        <TextField
          multiline
          minRows={6}
          fullWidth
          value={formState.translations.overview[overviewLang]}
          onChange={(event) => updateTranslation('overview', overviewLang, event.target.value)}
          placeholder={`Enter overview text in ${LANGUAGES.find((lang) => lang.code === overviewLang)?.label}`}
        />
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Characters: {formState.translations.overview[overviewLang].length}/1000
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Fields with translations are marked with 🌐
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );

  const renderAboutStep = () => (
    <Stack spacing={3}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <ExploreIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            History & Architecture
          </Typography>
        </Stack>

        <Tabs
          value={historyLang}
          onChange={(_event, value) => setHistoryLang(value)}
          variant="scrollable"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          {LANGUAGES.map((lang) => (
            <Tab
              key={lang.code}
              value={lang.code}
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{lang.flag}</span>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {lang.label}
                  </Typography>
                </Stack>
              }
              sx={{ textTransform: 'none', fontWeight: 600 }}
            />
          ))}
        </Tabs>

        <TextField
          multiline
          minRows={10}
          fullWidth
          value={formState.translations.history[historyLang]}
          onChange={(event) => updateTranslation('history', historyLang, event.target.value)}
          placeholder={`Enter detailed history and architecture information in ${LANGUAGES.find((lang) => lang.code === historyLang)?.label}`}
        />
      </Paper>

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

        <Box
          sx={{
            border: '2px dashed #C5C3D6',
            borderRadius: 3,
            p: 4,
            textAlign: 'center',
            backgroundColor: 'rgba(63, 61, 86, 0.02)',
          }}
        >
          {formState.siteMapFile ? (
            <Stack spacing={2} alignItems="center">
              <InsertDriveFileIcon sx={{ fontSize: 48, color: '#3F3D56' }} />
              <Typography variant="subtitle1">{formState.siteMapFile.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {(formState.siteMapFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
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
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <CheckCircleIcon sx={{ color: '#DA8552' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#3F3D56' }}>
            Cultural Etiquettes
          </Typography>
        </Stack>

        <Stack spacing={1.5}>
          {formState.culturalEtiquettes.map((item, index) => (
            <Paper variant="outlined" key={`${item}-${index}`} sx={{ p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body2">{item}</Typography>
              <IconButton color="error" onClick={() => removeCulturalEtiquette(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))}
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            placeholder="Add new etiquette point..."
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                const value = (event.target as HTMLInputElement).value;
                addCulturalEtiquette(value);
                (event.target as HTMLInputElement).value = '';
              }
            }}
          />
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ borderRadius: 3, backgroundColor: '#DA8552' }}
            onClick={() => {
              const input = document.getElementById('etiquette-input') as HTMLInputElement | null;
              if (input && input.value) {
                addCulturalEtiquette(input.value);
                input.value = '';
              }
            }}
          >
            Add Etiquette
          </Button>
        </Stack>
      </Paper>
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

          {formState.ticketing.entryType === 'paid' && (
            <>
              <TextField
                label="Booking URL (Optional)"
                placeholder="https://"
                value={formState.ticketing.bookingUrl}
                onChange={(event) => updateTicketField('bookingUrl', event.target.value)}
                fullWidth
              />
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
                      <Box component="tr" key={`${fee.visitor_type}-${index}`} sx={{ borderTop: '1px solid #E0E0E0' }}>
                        <Box component="td" sx={{ p: 2, width: '30%' }}>
                          <TextField
                            value={fee.visitor_type}
                            onChange={(event) => updateFee(index, { visitor_type: event.target.value })}
                            fullWidth
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2, width: '15%' }}>
                          <TextField
                            type="number"
                            value={fee.amount}
                            onChange={(event) => updateFee(index, { amount: Number(event.target.value) })}
                            fullWidth
                          />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <TextField
                            value={fee.notes || ''}
                            onChange={(event) => updateFee(index, { notes: event.target.value })}
                            fullWidth
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

        <Grid container spacing={3}>
          {formState.transport.map((item, index) => {
            const preset = TRANSPORT_PRESETS.find((presetItem) => presetItem.mode === item.mode);
            return (
              <Grid item xs={12} md={4} key={`${item.mode}-${index}-${item.name}`}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: preset?.color || '#E0E0E0', color: '#fff' }}>{preset?.icon || <DirectionsCarIcon />}</Avatar>
                    <TextField
                      label="Name / Station"
                      value={item.name || ''}
                      onChange={(event) => updateTransport(index, { name: event.target.value })}
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
                    label="Notes"
                    value={item.notes || ''}
                    onChange={(event) => updateTransport(index, { notes: event.target.value })}
                    fullWidth
                    sx={{ mt: 2 }}
                  />
                  <Button
                    startIcon={<DeleteIcon />}
                    color="error"
                    variant="text"
                    sx={{ mt: 1 }}
                    onClick={() => removeTransport(index)}
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

        <Stack spacing={2}>
          {formState.nearbyAttractions.map((attraction, index) => (
            <Paper variant="outlined" key={`${attraction.name}-${index}`} sx={{ p: 2.5, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    label="Attraction Name"
                    value={attraction.name}
                    onChange={(event) => updateNearbyAttraction(index, { name: event.target.value })}
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
                    onChange={(event) => updateNearbyAttraction(index, { notes: event.target.value })}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Stack alignItems="flex-end" sx={{ mt: 1 }}>
                <Button startIcon={<DeleteIcon />} color="error" variant="text" onClick={() => removeNearbyAttraction(index)}>
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

