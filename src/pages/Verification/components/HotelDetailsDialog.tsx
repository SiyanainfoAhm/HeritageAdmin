import { useEffect, useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  IconButton,
  Stack,
  TextField,
  Grid,
  Card,
  CardMedia,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Divider,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AddIcon from '@mui/icons-material/Add';
import Checkbox from '@mui/material/Checkbox';
import * as Icons from '@mui/icons-material';
import { supabase } from '@/config/supabase';
import { StorageService } from '@/services/storage.service';
import { TranslationService } from '@/services/translation.service';

type LanguageCode = 'en' | 'hi' | 'gu' | 'ja' | 'es' | 'fr';

const LANGUAGES = [
  { code: 'en' as LanguageCode, label: 'English' },
  { code: 'hi' as LanguageCode, label: 'Hindi' },
  { code: 'gu' as LanguageCode, label: 'Gujarati' },
  { code: 'ja' as LanguageCode, label: 'Japanese' },
  { code: 'es' as LanguageCode, label: 'Spanish' },
  { code: 'fr' as LanguageCode, label: 'French' },
];

const HOTEL_TRANSLATABLE_FIELDS = [
  'hotel_name',
  'subtitle',
  'short_description',
  'full_description',
  'address_line1',
  'address_line2',
  'area_or_zone',
  'city',
  'state',
];

interface HotelDetailsDialogProps {
  open: boolean;
  hotelId: number | null;
  onClose: () => void;
}

interface RoomType {
  room_type_id?: number;
  room_category: string;
  room_name: string;
  short_description: string;
  base_price: number;
  currency: string;
  max_guests: number;
  area_sqft?: number | null;
  is_featured: boolean;
  is_active: boolean;
  tax_percentage: number;
  tax: number;
  translations?: Record<LanguageCode, { room_name: string; short_description: string }>;
  media?: Array<{ media_id?: number; media_url: string; alt_text?: string; position?: number; is_primary?: boolean; file?: File }>;
}

const HotelDetailsDialog: React.FC<HotelDetailsDialogProps> = ({ open, hotelId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [hotelData, setHotelData] = useState<any>(null);
  const [editedHotelDetails, setEditedHotelDetails] = useState<Record<string, any>>({});
  const [translations, setTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Hotel media
  const [hotelHeroImage, setHotelHeroImage] = useState<string | null>(null);
  const [hotelHeroImageFile, setHotelHeroImageFile] = useState<File | null>(null);
  const [hotelGalleryMedia, setHotelGalleryMedia] = useState<Array<{ media_id?: number; media_type: string; media_url: string; alt_text?: string; position?: number; is_primary?: boolean; file?: File }>>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Room types
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [roomTypeTranslations, setRoomTypeTranslations] = useState<Record<number, Record<LanguageCode, { room_name: string; short_description: string }>>>({});
  
  // Amenities
  const [amenities, setAmenities] = useState<Array<{ amenity_id: number; amenity_key: string; amenity_name: string; amenity_icon: string }>>([]);
  const [amenityTranslations, setAmenityTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  
  // Attractions
  const [attractions, setAttractions] = useState<Array<{ attraction_id?: number; name: string; subtitle: string; description: string; image_url: string; position: number; imageFile?: File }>>([]);
  const [attractionTranslations, setAttractionTranslations] = useState<Record<number, Record<LanguageCode, { name: string; subtitle: string; description: string }>>>({});
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: (() => void) | null }>({
    open: false,
    message: '',
    onConfirm: null,
  });

  // Amenity selection dialog
  const [amenityDialogOpen, setAmenityDialogOpen] = useState(false);
  const [allAvailableAmenities, setAllAvailableAmenities] = useState<Array<{ amenity_id: number; amenity_key: string; amenity_name: string; amenity_icon: string }>>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<Set<number>>(new Set());

  // Fetch hotel details
  const fetchHotelDetails = async (id: number) => {
    try {
      const { data, error } = await supabase.rpc('heritage_get_hotel_details_for_edit', {
        p_hotel_id: id,
        p_user_id: null,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      throw error;
    }
  };

  // Load hotel translations
  const loadHotelTranslations = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('heritage_hoteltranslation')
        .select('*')
        .eq('hotel_id', id);

      if (error) throw error;

      const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
      HOTEL_TRANSLATABLE_FIELDS.forEach(field => {
        loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
      });

      if (data) {
        data.forEach((trans: any) => {
          const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
          if (langCode && LANGUAGES.some(l => l.code === langCode)) {
            HOTEL_TRANSLATABLE_FIELDS.forEach(field => {
              if (trans[field] !== null && trans[field] !== undefined) {
                loadedTranslations[field][langCode] = String(trans[field] || '');
              }
            });
          }
        });
      }

      return loadedTranslations;
    } catch (error) {
      console.error('Error loading hotel translations:', error);
      return {};
    }
  };

  // Auto-translate field - works from any language to all other languages
  const autoTranslateField = async (text: string, field: string) => {
    if (!text || !text.trim()) return;

    const timerKey = `${field}_${currentLanguageTab}`;
    if (translationTimerRef.current[timerKey]) {
      clearTimeout(translationTimerRef.current[timerKey]);
    }

    translationTimerRef.current[timerKey] = setTimeout(async () => {
      setTranslatingFields(prev => new Set(prev).add(field));

      try {
        const sourceLanguage = currentLanguageTab;
        // Get all languages except the current one
        const targetLanguages: LanguageCode[] = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code);
        
        const translationPromises = targetLanguages.map(async (lang) => {
          try {
            const result = await TranslationService.translate(text, lang, sourceLanguage);
            if (result.success && result.translations && result.translations[lang]) {
              const translations = result.translations[lang];
              const translated = Array.isArray(translations) ? translations[0] : String(translations || '');
              return { lang, text: translated };
            }
            return { lang, text: '' };
          } catch (err) {
            console.error(`Translation error for ${lang}:`, err);
            return { lang, text: '' };
          }
        });

        const results = await Promise.all(translationPromises);
        setTranslations(prev => {
          const newTranslations = { ...prev };
          if (!newTranslations[field]) {
            newTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
          }
          // Update source language with current text
          newTranslations[field][sourceLanguage] = text;
          // Update all target languages with translations
          results.forEach(({ lang, text }) => {
            newTranslations[field][lang] = text;
          });
          return newTranslations;
        });
      } catch (error) {
        console.error('Error in auto-translation:', error);
      } finally {
        setTranslatingFields(prev => {
          const newSet = new Set(prev);
          newSet.delete(field);
          return newSet;
        });
      }
    }, 1000);
  };

  // Auto-translate attraction field - works from any language to all other languages
  const autoTranslateAttractionField = async (
    text: string,
    attractionId: number,
    field: 'name' | 'subtitle' | 'description'
  ) => {
    if (!text || !text.trim()) return;

    const timerKey = `attraction_${attractionId}_${field}_${currentLanguageTab}`;
    if (translationTimerRef.current[timerKey]) {
      clearTimeout(translationTimerRef.current[timerKey]);
    }

    translationTimerRef.current[timerKey] = setTimeout(async () => {
      try {
        const sourceLanguage = currentLanguageTab;
        // Get all languages except the current one
        const targetLanguages: LanguageCode[] = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code);
        
        const translationPromises = targetLanguages.map(async (lang) => {
          try {
            const result = await TranslationService.translate(text, lang, sourceLanguage);
            if (result.success && result.translations && result.translations[lang]) {
              const translations = result.translations[lang];
              const translated = Array.isArray(translations) ? translations[0] : String(translations || '');
              return { lang, text: translated };
            }
            return { lang, text: '' };
          } catch (err) {
            console.error(`Translation error for ${lang}:`, err);
            return { lang, text: '' };
          }
        });

        const results = await Promise.all(translationPromises);
        setAttractionTranslations(prev => {
          const newTrans = { ...prev };
          if (!newTrans[attractionId]) {
            newTrans[attractionId] = {
              en: { name: '', subtitle: '', description: '' },
              hi: { name: '', subtitle: '', description: '' },
              gu: { name: '', subtitle: '', description: '' },
              ja: { name: '', subtitle: '', description: '' },
              es: { name: '', subtitle: '', description: '' },
              fr: { name: '', subtitle: '', description: '' },
            };
          }
          // Update source language with current text
          newTrans[attractionId][sourceLanguage] = {
            ...newTrans[attractionId][sourceLanguage],
            [field]: text,
          };
          // Update all target languages with translations
          results.forEach(({ lang, text }) => {
            newTrans[attractionId][lang] = {
              ...newTrans[attractionId][lang],
              [field]: text,
            };
          });
          return newTrans;
        });
      } catch (error) {
        console.error('Error in attraction auto-translation:', error);
      }
    }, 1000);
  };

  // Load all available amenities for selection dialog
  const loadAllAvailableAmenities = async () => {
    try {
      const { data, error } = await supabase
        .from('heritage_hotelamenity')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setAllAvailableAmenities(data.map((a: any) => ({
          amenity_id: a.amenity_id,
          amenity_key: a.amenity_key || '',
          amenity_name: a.amenity_name || '',
          amenity_icon: a.amenity_icon || '',
        })));
        
        // Pre-select amenities that are already assigned to this hotel
        const currentAmenityIds = new Set(amenities.map(a => a.amenity_id));
        setSelectedAmenityIds(currentAmenityIds);
      }
    } catch (error) {
      console.error('Error loading available amenities:', error);
    }
  };

  // Handle opening amenity selection dialog
  const handleOpenAmenityDialog = async () => {
    await loadAllAvailableAmenities();
    setAmenityDialogOpen(true);
  };

  // Handle closing amenity selection dialog
  const handleCloseAmenityDialog = () => {
    setAmenityDialogOpen(false);
    setSelectedAmenityIds(new Set());
  };

  // Handle amenity selection toggle
  const handleToggleAmenitySelection = (amenityId: number) => {
    setSelectedAmenityIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(amenityId)) {
        newSet.delete(amenityId);
      } else {
        newSet.add(amenityId);
      }
      return newSet;
    });
  };

  // Handle confirming amenity selection
  const handleConfirmAmenitySelection = async () => {
    try {
      // Filter selected amenities from all available
      const selectedAmenities = allAvailableAmenities.filter(a => 
        selectedAmenityIds.has(a.amenity_id)
      );

      // Update amenities state
      setAmenities(selectedAmenities);

      // Load translations for newly selected amenities
      const amenityIds = selectedAmenities.map(a => a.amenity_id);
      if (amenityIds.length > 0) {
        try {
          const { data: amenityTransData, error: amenityTransError } = await supabase
            .from('heritage_hotelamenitytranslation')
            .select('*')
            .in('amenity_id', amenityIds);

          if (!amenityTransError && amenityTransData) {
            const amenityTrans: Record<number, Record<LanguageCode, string>> = {};
            selectedAmenities.forEach((amenity: any) => {
              amenityTrans[amenity.amenity_id] = {
                en: amenity.amenity_name || '',
                hi: '',
                gu: '',
                ja: '',
                es: '',
                fr: '',
              };
            });

            amenityTransData.forEach((trans: any) => {
              const langCodeRaw = String(trans.language_code || '');
              const langCode = langCodeRaw.toLowerCase() as LanguageCode;
              if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.amenity_id) {
                if (!amenityTrans[trans.amenity_id]) {
                  amenityTrans[trans.amenity_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                }
                if (trans.amenity_name) {
                  amenityTrans[trans.amenity_id][langCode] = String(trans.amenity_name || '').trim();
                }
              }
            });

            setAmenityTranslations(amenityTrans);
          }
        } catch (err) {
          console.error('Error loading amenity translations:', err);
        }
      }

      handleCloseAmenityDialog();
    } catch (error) {
      console.error('Error confirming amenity selection:', error);
    }
  };

  // Auto-translate room type field - works from any language to all other languages
  const autoTranslateRoomTypeField = async (
    text: string,
    roomTypeId: number,
    field: 'room_name' | 'short_description'
  ) => {
    if (!text || !text.trim()) return;

    const timerKey = `room_${roomTypeId}_${field}_${currentLanguageTab}`;
    if (translationTimerRef.current[timerKey]) {
      clearTimeout(translationTimerRef.current[timerKey]);
    }

    translationTimerRef.current[timerKey] = setTimeout(async () => {
      try {
        const sourceLanguage = currentLanguageTab;
        // Get all languages except the current one
        const targetLanguages: LanguageCode[] = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code);
        
        const translationPromises = targetLanguages.map(async (lang) => {
          try {
            const result = await TranslationService.translate(text, lang, sourceLanguage);
            if (result.success && result.translations && result.translations[lang]) {
              const translations = result.translations[lang];
              const translated = Array.isArray(translations) ? translations[0] : String(translations || '');
              return { lang, text: translated };
            }
            return { lang, text: '' };
          } catch (err) {
            console.error(`Translation error for ${lang}:`, err);
            return { lang, text: '' };
          }
        });

        const results = await Promise.all(translationPromises);
        setRoomTypeTranslations(prev => {
          const newTrans = { ...prev };
          if (!newTrans[roomTypeId]) {
            newTrans[roomTypeId] = {
              en: { room_name: '', short_description: '' },
              hi: { room_name: '', short_description: '' },
              gu: { room_name: '', short_description: '' },
              ja: { room_name: '', short_description: '' },
              es: { room_name: '', short_description: '' },
              fr: { room_name: '', short_description: '' },
            };
          }
          // Update source language with current text
          newTrans[roomTypeId][sourceLanguage] = {
            ...newTrans[roomTypeId][sourceLanguage],
            [field]: text,
          };
          // Update all target languages with translations
          results.forEach(({ lang, text }) => {
            newTrans[roomTypeId][lang] = {
              ...newTrans[roomTypeId][lang],
              [field]: text,
            };
          });
          return newTrans;
        });
      } catch (error) {
        console.error('Error in room type auto-translation:', error);
      }
    }, 1000);
  };

  // Load hotel data
  useEffect(() => {
    if (open && hotelId) {
      setLoading(true);
      fetchHotelDetails(hotelId)
        .then(async (data) => {
          console.log('Hotel data from RPC:', data);
          setHotelData(data);
          
          if (data?.hotel) {
            const hotel = data.hotel;
            setEditedHotelDetails({
              hotel_name: hotel.hotel_name || '',
              subtitle: hotel.subtitle || '',
              short_description: hotel.short_description || '',
              full_description: hotel.full_description || '',
              address_line1: hotel.address_line1 || '',
              address_line2: hotel.address_line2 || '',
              area_or_zone: hotel.area_or_zone || '',
              city: hotel.city || '',
              state: hotel.state || '',
              country: hotel.country || '',
              postal_code: hotel.postal_code || '',
              latitude: hotel.latitude || null,
              longitude: hotel.longitude || null,
              checkin_time: hotel.checkin_time || '',
              checkout_time: hotel.checkout_time || '',
              base_price_from: hotel.base_price_from || null,
              currency: hotel.currency || 'INR',
              priority_level: hotel.priority_level || 0,
              is_active: hotel.is_active !== false,
            });

            // Load translations - first from RPC response, then merge with database translations
            const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
            HOTEL_TRANSLATABLE_FIELDS.forEach(field => {
              loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
              // Set English from hotel data
              if (hotel[field] !== null && hotel[field] !== undefined) {
                loadedTranslations[field].en = String(hotel[field] || '');
              }
            });

            // Load translations from RPC response (data.translations array)
            if (data.translations && Array.isArray(data.translations)) {
              data.translations.forEach((trans: any) => {
                // Handle both uppercase (ES, FR, GU, HI, JA) and lowercase language codes
                const langCodeRaw = String(trans.language_code || '');
                const langCode = langCodeRaw.toLowerCase() as LanguageCode;
                if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                  HOTEL_TRANSLATABLE_FIELDS.forEach(field => {
                    if (trans[field] !== null && trans[field] !== undefined) {
                      const transValue = String(trans[field] || '').trim();
                      // Set translation even if empty to ensure structure exists
                      loadedTranslations[field][langCode] = transValue;
                    }
                  });
                }
              });
            }

            // Also load from database as fallback/merge (in case RPC doesn't have all translations)
            const dbTranslations = await loadHotelTranslations(hotelId);
            HOTEL_TRANSLATABLE_FIELDS.forEach(field => {
              if (dbTranslations[field]) {
                for (const langKey of Object.keys(dbTranslations[field])) {
                  const lang = langKey as LanguageCode;
                  const dbValue = dbTranslations[field][lang];
                  // Only use DB value if RPC didn't provide one or DB has a non-empty value
                  if (dbValue && String(dbValue).trim() && (!loadedTranslations[field][lang] || !loadedTranslations[field][lang].trim())) {
                    loadedTranslations[field][lang] = String(dbValue).trim();
                  }
                }
              }
            });

            setTranslations(loadedTranslations);

            // Load media
            if (data.media && Array.isArray(data.media)) {
              const heroMedia = data.media.find((m: any) => m.is_primary || m.media_type === 'hero');
              const galleryMedia = data.media.filter((m: any) => !m.is_primary && m.media_type !== 'hero');
              
              if (heroMedia) {
                setHotelHeroImage(heroMedia.media_url || null);
              }
              
              setHotelGalleryMedia(galleryMedia.map((m: any) => ({
                media_id: m.media_id,
                media_type: m.media_type || 'gallery',
                media_url: m.media_url || '',
                alt_text: m.alt_text || '',
                position: m.position || 0,
                is_primary: m.is_primary || false,
              })));
            }

            // Load room types
            if (data.rooms && Array.isArray(data.rooms)) {
              const rooms: RoomType[] = data.rooms.map((room: any) => {
                const roomTranslations: Record<LanguageCode, { room_name: string; short_description: string }> = {
                  en: { room_name: room.room_name || '', short_description: room.short_description || '' },
                  hi: { room_name: '', short_description: '' },
                  gu: { room_name: '', short_description: '' },
                  ja: { room_name: '', short_description: '' },
                  es: { room_name: '', short_description: '' },
                  fr: { room_name: '', short_description: '' },
                };

                if (room.translations && Array.isArray(room.translations)) {
                  console.log(`Room ${room.room_type_id} translations:`, room.translations);
                  room.translations.forEach((trans: any) => {
                    // Handle both uppercase (ES, FR, GU, HI, JA) and lowercase (es, fr, gu, hi, ja) language codes
                    const langCodeRaw = String(trans.language_code || '');
                    const langCode = langCodeRaw.toLowerCase() as LanguageCode;
                    console.log(`Processing room translation for language: ${langCodeRaw} -> ${langCode}`, trans);
                    if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                      // Set translation values (even if empty, to ensure structure exists)
                      if (trans.room_name !== null && trans.room_name !== undefined) {
                        roomTranslations[langCode].room_name = String(trans.room_name || '').trim();
                      }
                      if (trans.short_description !== null && trans.short_description !== undefined) {
                        roomTranslations[langCode].short_description = String(trans.short_description || '').trim();
                      }
                    }
                  });
                }

                return {
                  room_type_id: room.room_type_id,
                  room_category: room.room_category || 'room',
                  room_name: room.room_name || '',
                  short_description: room.short_description || '',
                  base_price: room.base_price || 0,
                  currency: room.currency || 'INR',
                  max_guests: room.max_guests || 1,
                  area_sqft: room.area_sqft,
                  is_featured: room.is_featured || false,
                  is_active: room.is_active !== false,
                  tax_percentage: room.tax_percentage || 0,
                  tax: room.tax || 0,
                  translations: roomTranslations,
                  media: room.media ? room.media.map((m: any) => ({
                    media_id: m.media_id,
                    media_url: m.media_url || '',
                    alt_text: m.alt_text || '',
                    position: m.position || 0,
                    is_primary: m.is_primary || false,
                  })) : [],
                };
              });

              setRoomTypes(rooms);
              
              // Set room type translations
              const roomTrans: Record<number, Record<LanguageCode, { room_name: string; short_description: string }>> = {};
              rooms.forEach((room) => {
                const roomId = room.room_type_id || 0;
                // Use translations from room object if available, otherwise initialize empty
                if (room.translations) {
                  roomTrans[roomId] = room.translations;
                } else {
                  roomTrans[roomId] = {
                    en: { room_name: room.room_name || '', short_description: room.short_description || '' },
                    hi: { room_name: '', short_description: '' },
                    gu: { room_name: '', short_description: '' },
                    ja: { room_name: '', short_description: '' },
                    es: { room_name: '', short_description: '' },
                    fr: { room_name: '', short_description: '' },
                  };
                }
              });
              setRoomTypeTranslations(roomTrans);
            }

            // Load amenities - fetch from heritage_hotelamenity table
            try {
              // First, get all available amenities from the master table
              const { data: allAmenities, error: allAmenitiesError } = await supabase
                .from('heritage_hotelamenity')
                .select('*')
                .order('sort_order', { ascending: true });

              if (!allAmenitiesError && allAmenities && allAmenities.length > 0) {
                // Get hotel-specific amenities from mapping table
                let hotelAmenityIds: number[] = [];
                try {
                  const { data: mappings, error: mappingError } = await supabase
                    .from('heritage_hotelamenitymapping')
                    .select('amenity_id')
                    .eq('hotel_id', hotelId);

                  if (!mappingError && mappings) {
                    hotelAmenityIds = mappings.map((m: any) => m.amenity_id);
                  } else if (data.amenities && Array.isArray(data.amenities)) {
                    // Fallback to RPC data if mapping table query fails
                    hotelAmenityIds = data.amenities.map((a: any) => a.amenity_id);
                  }
                } catch (mappingErr) {
                  console.error('Error loading amenity mappings:', mappingErr);
                  // Fallback to RPC data
                  if (data.amenities && Array.isArray(data.amenities)) {
                    hotelAmenityIds = data.amenities.map((a: any) => a.amenity_id);
                  }
                }

                // Filter amenities to show only those mapped to this hotel
                const amenitiesToShow = hotelAmenityIds.length > 0
                  ? allAmenities.filter((a: any) => hotelAmenityIds.includes(a.amenity_id))
                  : [];

                setAmenities(amenitiesToShow.map((a: any) => ({
                  amenity_id: a.amenity_id,
                  amenity_key: a.amenity_key || '',
                  amenity_name: a.amenity_name || '',
                  amenity_icon: a.amenity_icon || '',
                })));

                // Load amenity translations
                const amenityIds = amenitiesToShow.map((a: any) => a.amenity_id);
                if (amenityIds.length > 0) {
                  try {
                    const { data: amenityTransData, error: amenityTransError } = await supabase
                      .from('heritage_hotelamenitytranslation')
                      .select('*')
                      .in('amenity_id', amenityIds);

                    if (!amenityTransError && amenityTransData) {
                      const amenityTrans: Record<number, Record<LanguageCode, string>> = {};
                      amenitiesToShow.forEach((amenity: any) => {
                        amenityTrans[amenity.amenity_id] = {
                          en: amenity.amenity_name || '',
                          hi: '',
                          gu: '',
                          ja: '',
                          es: '',
                          fr: '',
                        };
                      });

                      amenityTransData.forEach((trans: any) => {
                        const langCodeRaw = String(trans.language_code || '');
                        const langCode = langCodeRaw.toLowerCase() as LanguageCode;
                        if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.amenity_id) {
                          if (!amenityTrans[trans.amenity_id]) {
                            amenityTrans[trans.amenity_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                          }
                          if (trans.amenity_name) {
                            amenityTrans[trans.amenity_id][langCode] = String(trans.amenity_name || '').trim();
                          }
                        }
                      });

                      setAmenityTranslations(amenityTrans);
                    }
                  } catch (err) {
                    console.error('Error loading amenity translations:', err);
                  }
                }
              } else if (data.amenities && Array.isArray(data.amenities)) {
                // Fallback to old data structure if master table doesn't exist
                setAmenities(data.amenities);
              }
            } catch (err) {
              console.error('Error loading amenities:', err);
              // Fallback to old data structure
              if (data.amenities && Array.isArray(data.amenities)) {
                setAmenities(data.amenities);
              }
            }

            // Load attractions
            if (data.attractions && Array.isArray(data.attractions)) {
              setAttractions(data.attractions);
              
              // Load attraction translations
              const attractionIds = data.attractions.map((a: any) => a.attraction_id);
              if (attractionIds.length > 0) {
                try {
                  const { data: attractionTransData, error: attractionTransError } = await supabase
                    .from('heritage_hotelattractiontranslation')
                    .select('*')
                    .in('attraction_id', attractionIds);

                  if (!attractionTransError && attractionTransData) {
                    const attractionTrans: Record<number, Record<LanguageCode, { name: string; subtitle: string; description: string }>> = {};
                    data.attractions.forEach((attraction: any) => {
                      attractionTrans[attraction.attraction_id] = {
                        en: { name: attraction.name || '', subtitle: attraction.subtitle || '', description: attraction.description || '' },
                        hi: { name: '', subtitle: '', description: '' },
                        gu: { name: '', subtitle: '', description: '' },
                        ja: { name: '', subtitle: '', description: '' },
                        es: { name: '', subtitle: '', description: '' },
                        fr: { name: '', subtitle: '', description: '' },
                      };
                    });

                    attractionTransData.forEach((trans: any) => {
                      const langCodeRaw = String(trans.language_code || '');
                      const langCode = langCodeRaw.toLowerCase() as LanguageCode;
                      if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.attraction_id) {
                        if (!attractionTrans[trans.attraction_id]) {
                          attractionTrans[trans.attraction_id] = {
                            en: { name: '', subtitle: '', description: '' },
                            hi: { name: '', subtitle: '', description: '' },
                            gu: { name: '', subtitle: '', description: '' },
                            ja: { name: '', subtitle: '', description: '' },
                            es: { name: '', subtitle: '', description: '' },
                            fr: { name: '', subtitle: '', description: '' },
                          };
                        }
                        if (trans.name !== null && trans.name !== undefined) {
                          attractionTrans[trans.attraction_id][langCode].name = String(trans.name || '').trim();
                        }
                        if (trans.subtitle !== null && trans.subtitle !== undefined) {
                          attractionTrans[trans.attraction_id][langCode].subtitle = String(trans.subtitle || '').trim();
                        }
                        if (trans.description !== null && trans.description !== undefined) {
                          attractionTrans[trans.attraction_id][langCode].description = String(trans.description || '').trim();
                        }
                      }
                    });

                    setAttractionTranslations(attractionTrans);
                  }
                } catch (err) {
                  console.error('Error loading attraction translations:', err);
                }
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error loading hotel details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, hotelId]);

  // Save hotel changes
  const handleSaveHotelChanges = async () => {
    if (!hotelId) return;

    setSaving(true);
    try {
      // Update hotel basic info
      const { error: hotelUpdateError } = await supabase
        .from('heritage_hotel')
        .update({
          hotel_name: editedHotelDetails.hotel_name,
          subtitle: editedHotelDetails.subtitle,
          short_description: editedHotelDetails.short_description,
          full_description: editedHotelDetails.full_description,
          address_line1: editedHotelDetails.address_line1,
          address_line2: editedHotelDetails.address_line2,
          area_or_zone: editedHotelDetails.area_or_zone,
          city: editedHotelDetails.city,
          state: editedHotelDetails.state,
          country: editedHotelDetails.country,
          postal_code: editedHotelDetails.postal_code,
          latitude: editedHotelDetails.latitude,
          longitude: editedHotelDetails.longitude,
          checkin_time: editedHotelDetails.checkin_time,
          checkout_time: editedHotelDetails.checkout_time,
          base_price_from: editedHotelDetails.base_price_from,
          currency: editedHotelDetails.currency,
          priority_level: editedHotelDetails.priority_level,
          is_active: editedHotelDetails.is_active,
        })
        .eq('hotel_id', hotelId);

      if (hotelUpdateError) {
        throw hotelUpdateError;
      }

      // Save translations
      for (const field of HOTEL_TRANSLATABLE_FIELDS) {
        const fieldTranslations = translations[field];
        if (fieldTranslations) {
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && fieldTranslations[lang.code]) {
              try {
                await supabase
                  .from('heritage_hoteltranslation')
                  .upsert({
                    hotel_id: hotelId,
                    language_code: lang.code.toUpperCase(),
                    [field]: fieldTranslations[lang.code],
                  }, {
                    onConflict: 'hotel_id,language_code',
                  });
              } catch (err) {
                console.error(`Error saving translation for ${field} in ${lang.code}:`, err);
              }
            }
          }
        }
      }

      // Save hero image
      const { data: existingHeroMedia } = await supabase
        .from('heritage_hotelmedia')
        .select('media_id, media_url')
        .eq('hotel_id', hotelId)
        .eq('media_type', 'hero')
        .single();

      let heroImageUrl = hotelHeroImage;
      if (hotelHeroImageFile) {
        setUploadingHero(true);
        try {
          const folder = `hotels/${hotelId}`;
          const uploadResult = await StorageService.uploadFile(hotelHeroImageFile, folder);
          
          if (!uploadResult.success || !uploadResult.url) {
            throw new Error(`Failed to upload hero image: ${uploadResult.error || 'Unknown error'}`);
          }
          
          heroImageUrl = uploadResult.url;
          setHotelHeroImage(heroImageUrl);
          setHotelHeroImageFile(null);
        } catch (error: any) {
          console.error('Error uploading hero image:', error);
        } finally {
          setUploadingHero(false);
        }
      }

      if (heroImageUrl) {
        const heroMediaData: any = {
          hotel_id: hotelId,
          media_type: 'hero',
          media_url: heroImageUrl,
          alt_text: null,
          position: 0,
          is_primary: true,
        };

        if (existingHeroMedia?.media_id) {
          // Delete old file if URL changed
          if (existingHeroMedia.media_url !== heroImageUrl && existingHeroMedia.media_url) {
            await StorageService.deleteFile(existingHeroMedia.media_url);
          }
          await supabase
            .from('heritage_hotelmedia')
            .update(heroMediaData)
            .eq('media_id', existingHeroMedia.media_id);
        } else {
          await supabase
            .from('heritage_hotelmedia')
            .insert(heroMediaData);
        }
      } else if (existingHeroMedia?.media_id) {
        // Delete hero if removed
        if (existingHeroMedia.media_url) {
          await StorageService.deleteFile(existingHeroMedia.media_url);
        }
        await supabase
          .from('heritage_hotelmedia')
          .delete()
          .eq('media_id', existingHeroMedia.media_id);
      }

      // Save gallery media
      if (hotelGalleryMedia.length > 0) {
        const existingMediaIds = hotelGalleryMedia
          .filter(m => m.media_id)
          .map(m => m.media_id);

        const { data: currentMedia } = await supabase
          .from('heritage_hotelmedia')
          .select('media_id, media_url')
          .eq('hotel_id', hotelId)
          .eq('media_type', 'gallery');

        if (currentMedia) {
          const mediaIdsToDelete = currentMedia
            .map((m: any) => m.media_id)
            .filter((id: number) => !existingMediaIds.includes(id));

          // Delete files from storage
          for (const media of currentMedia.filter((m: any) => mediaIdsToDelete.includes(m.media_id))) {
            if (media.media_url) {
              await StorageService.deleteFile(media.media_url);
            }
          }

          // Delete from database
          if (mediaIdsToDelete.length > 0) {
            await supabase
              .from('heritage_hotelmedia')
              .delete()
              .in('media_id', mediaIdsToDelete);
          }
        }

        setUploadingGallery(true);
        const folder = `hotels/${hotelId}`;
        
        for (const media of hotelGalleryMedia) {
          try {
            let mediaUrl = media.media_url;
            
            if (media.file) {
              const uploadResult = await StorageService.uploadFile(media.file, folder);
              if (uploadResult.success && uploadResult.url) {
                mediaUrl = uploadResult.url;
              }
            }
            
            const mediaData: any = {
              hotel_id: hotelId,
              media_type: 'gallery',
              media_url: mediaUrl || '',
              alt_text: media.alt_text || null,
              position: media.position || 0,
              is_primary: false,
            };

            if (media.media_id) {
              await supabase
                .from('heritage_hotelmedia')
                .update(mediaData)
                .eq('media_id', media.media_id);
            } else {
              await supabase
                .from('heritage_hotelmedia')
                .insert(mediaData);
            }
          } catch (mediaErr) {
            console.error('Error during media upsert:', mediaErr);
          }
        }
        
        setUploadingGallery(false);
      }

      // Save room types
      for (const room of roomTypes) {
        const roomData: any = {
          hotel_id: hotelId,
          room_category: room.room_category,
          room_name: room.room_name,
          short_description: room.short_description,
          base_price: room.base_price,
          currency: room.currency,
          max_guests: room.max_guests,
          area_sqft: room.area_sqft,
          is_featured: room.is_featured,
          is_active: room.is_active,
          tax_percentage: room.tax_percentage,
          tax: room.tax,
        };

        let finalRoomId = room.room_type_id;
        
        if (room.room_type_id) {
          await supabase
            .from('heritage_roomtype')
            .update(roomData)
            .eq('room_type_id', room.room_type_id);
        } else {
          const { data: insertedRoom, error: insertError } = await supabase
            .from('heritage_roomtype')
            .insert(roomData)
            .select()
            .single();

          if (!insertError && insertedRoom) {
            finalRoomId = insertedRoom.room_type_id;
          }
        }

        // Save room translations
        if (finalRoomId && roomTypeTranslations[room.room_type_id || 0]) {
          const roomTrans = roomTypeTranslations[room.room_type_id || 0];
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && roomTrans[lang.code]) {
              await supabase
                .from('heritage_roomtypetranslation')
                .upsert({
                  room_type_id: finalRoomId,
                  language_code: lang.code.toUpperCase(),
                  room_name: roomTrans[lang.code].room_name,
                  short_description: roomTrans[lang.code].short_description,
                }, {
                  onConflict: 'room_type_id,language_code',
                });
            }
          }
        }

        // Save room media
        if (finalRoomId && room.media) {
          const existingRoomMediaIds = room.media
            .filter(m => m.media_id)
            .map(m => m.media_id);

          const { data: currentRoomMedia } = await supabase
            .from('heritage_roommedia')
            .select('media_id, media_url')
            .eq('room_type_id', finalRoomId);

          if (currentRoomMedia) {
            const roomMediaIdsToDelete = currentRoomMedia
              .map((m: any) => m.media_id)
              .filter((id: number) => !existingRoomMediaIds.includes(id));

            // Delete files from storage
            for (const media of currentRoomMedia.filter((m: any) => roomMediaIdsToDelete.includes(m.media_id))) {
              if (media.media_url) {
                await StorageService.deleteFile(media.media_url);
              }
            }

            // Delete from database
            if (roomMediaIdsToDelete.length > 0) {
              await supabase
                .from('heritage_roommedia')
                .delete()
                .in('media_id', roomMediaIdsToDelete);
            }
          }

          const roomFolder = `rooms/${finalRoomId}`;
          for (const media of room.media) {
            try {
              let mediaUrl = media.media_url;
              
              if (media.file) {
                const uploadResult = await StorageService.uploadFile(media.file, roomFolder);
                if (uploadResult.success && uploadResult.url) {
                  mediaUrl = uploadResult.url;
                }
              }
              
              const roomMediaData: any = {
                room_type_id: finalRoomId,
                media_url: mediaUrl || '',
                alt_text: media.alt_text || null,
                position: media.position || 0,
                is_primary: media.is_primary || false,
              };

              if (media.media_id) {
                await supabase
                  .from('heritage_roommedia')
                  .update(roomMediaData)
                  .eq('media_id', media.media_id);
              } else {
                await supabase
                  .from('heritage_roommedia')
                  .insert(roomMediaData);
              }
            } catch (roomMediaErr) {
              console.error('Error during room media upsert:', roomMediaErr);
            }
          }
        }
      }

      // Save hotel amenity mappings
      if (hotelId) {
        try {
          // Get current mappings
          const { data: currentMappings } = await supabase
            .from('heritage_hotelamenitymapping')
            .select('amenity_id')
            .eq('hotel_id', hotelId);

          const currentAmenityIds = (currentMappings || []).map((m: any) => m.amenity_id);
          const newAmenityIds = amenities.map(a => a.amenity_id);

          // Delete removed mappings
          const amenitiesToRemove = currentAmenityIds.filter((id: number) => !newAmenityIds.includes(id));
          if (amenitiesToRemove.length > 0) {
            await supabase
              .from('heritage_hotelamenitymapping')
              .delete()
              .eq('hotel_id', hotelId)
              .in('amenity_id', amenitiesToRemove);
          }

          // Insert new mappings
          const amenitiesToAdd = newAmenityIds.filter((id: number) => !currentAmenityIds.includes(id));
          if (amenitiesToAdd.length > 0) {
            const mappingRows = amenitiesToAdd.map((amenityId: number) => ({
              hotel_id: hotelId,
              amenity_id: amenityId,
            }));
            await supabase
              .from('heritage_hotelamenitymapping')
              .insert(mappingRows);
          }
        } catch (err) {
          console.error('Error saving hotel amenity mappings:', err);
        }
      }

      // Save amenity translations
      for (const amenity of amenities) {
        if (amenityTranslations[amenity.amenity_id]) {
          const amenityTrans = amenityTranslations[amenity.amenity_id];
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && amenityTrans[lang.code]) {
              try {
                // Use uppercase for consistency (standard format)
                const langCodeUpper = lang.code.toUpperCase();
                
                await supabase
                  .from('heritage_hotelamenitytranslation')
                  .upsert({
                    amenity_id: amenity.amenity_id,
                    language_code: langCodeUpper,
                    amenity_name: amenityTrans[lang.code],
                  }, {
                    onConflict: 'amenity_id,language_code',
                  });
              } catch (err) {
                console.error(`Error saving amenity translation for ${lang.code}:`, err);
              }
            }
          }
        }
      }

      // Save attractions and translations
      // Get current attractions from database
      const { data: currentAttractions } = await supabase
        .from('heritage_hotelattraction')
        .select('attraction_id, image_url')
        .eq('hotel_id', hotelId);

      const currentAttractionIds = (currentAttractions || []).map((a: any) => a.attraction_id);
      const newAttractionIds = attractions.filter(a => a.attraction_id).map(a => a.attraction_id!);
      
      // Delete removed attractions and their images from storage
      const attractionsToDelete = currentAttractionIds.filter((id: number) => !newAttractionIds.includes(id));
      if (attractionsToDelete.length > 0) {
        // Get image URLs of attractions to delete
        const attractionsToDeleteData = (currentAttractions || []).filter((a: any) => 
          attractionsToDelete.includes(a.attraction_id)
        );
        
        // Delete images from storage
        for (const attractionToDelete of attractionsToDeleteData) {
          if (attractionToDelete.image_url) {
            try {
              await StorageService.deleteFile(attractionToDelete.image_url);
            } catch (err) {
              console.error('Error deleting attraction image from storage:', err);
            }
          }
        }
        
        // Delete from database
        await supabase
          .from('heritage_hotelattraction')
          .delete()
          .in('attraction_id', attractionsToDelete);
      }

      // Upsert attractions
      for (const attraction of attractions) {
        let imageUrl = attraction.image_url;
        
        // Get original image URL from database if this is an existing attraction
        const originalAttraction = currentAttractions?.find((a: any) => a.attraction_id === attraction.attraction_id);
        const originalImageUrl = originalAttraction?.image_url;
        const isBlobUrl = imageUrl && imageUrl.startsWith('blob:');
        
        // Upload image file if provided
        if (attraction.imageFile) {
          try {
            const attractionFolder = `hotels/${hotelId}/attractions`;
            const uploadResult = await StorageService.uploadFile(attraction.imageFile, attractionFolder);
            
            if (uploadResult.success && uploadResult.url) {
              // Delete old image from storage if it was replaced
              if (originalImageUrl && originalImageUrl !== uploadResult.url) {
                try {
                  await StorageService.deleteFile(originalImageUrl);
                } catch (err) {
                  console.error('Error deleting old attraction image:', err);
                }
              }
              imageUrl = uploadResult.url;
            }
          } catch (error) {
            console.error('Error uploading attraction image:', error);
          }
        } else if ((!imageUrl || imageUrl.trim() === '' || isBlobUrl) && originalImageUrl) {
          // Image was removed - user deleted it and there was an original
          try {
            await StorageService.deleteFile(originalImageUrl);
          } catch (err) {
            console.error('Error deleting removed attraction image:', err);
          }
          imageUrl = '';
        } else if (!imageUrl || imageUrl.trim() === '' || isBlobUrl) {
          // New attraction or blob preview without file - set to empty
          imageUrl = '';
        }
        // Otherwise keep existing imageUrl as-is
        
        const attractionData: any = {
          hotel_id: hotelId,
          name: attraction.name,
          subtitle: attraction.subtitle,
          description: attraction.description,
          image_url: imageUrl || '',
          position: attraction.position,
        };

        let finalAttractionId = attraction.attraction_id;
        
        if (attraction.attraction_id) {
          await supabase
            .from('heritage_hotelattraction')
            .update(attractionData)
            .eq('attraction_id', attraction.attraction_id);
        } else {
          const { data: insertedAttraction, error: insertError } = await supabase
            .from('heritage_hotelattraction')
            .insert(attractionData)
            .select()
            .single();

          if (!insertError && insertedAttraction) {
            finalAttractionId = insertedAttraction.attraction_id;
            // Update state with new ID
            const newAttractions = [...attractions];
            const attractionIndex = attractions.findIndex(a => a === attraction);
            if (attractionIndex >= 0) {
              const tempId = attraction.attraction_id;
              newAttractions[attractionIndex] = { ...newAttractions[attractionIndex], attraction_id: finalAttractionId };
              setAttractions(newAttractions);
              
              // Move translations from temp ID to real ID
              if (tempId !== undefined && tempId < 0 && finalAttractionId !== undefined && attractionTranslations[tempId]) {
                const attractionId = finalAttractionId;
                setAttractionTranslations(prev => {
                  const newTrans = { ...prev };
                  newTrans[attractionId] = newTrans[tempId];
                  delete newTrans[tempId];
                  return newTrans;
                });
              }
            }
          }
        }

        // Save attraction translations
        // Use temp ID if it's negative, otherwise use final ID
        const tempId = attraction.attraction_id && attraction.attraction_id < 0 ? attraction.attraction_id : undefined;
        const translationKey = tempId ? tempId : (finalAttractionId || attraction.attraction_id || 0);
        
        if (finalAttractionId && attractionTranslations[translationKey]) {
          const attractionTrans = attractionTranslations[translationKey];
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && attractionTrans[lang.code]) {
              try {
                const langCodeUpper = lang.code.toUpperCase();
                
                await supabase
                  .from('heritage_hotelattractiontranslation')
                  .upsert({
                    attraction_id: finalAttractionId,
                    language_code: langCodeUpper,
                    name: attractionTrans[lang.code].name,
                    subtitle: attractionTrans[lang.code].subtitle,
                    description: attractionTrans[lang.code].description,
                  }, {
                    onConflict: 'attraction_id,language_code',
                  });
              } catch (err) {
                console.error(`Error saving attraction translation for ${lang.code}:`, err);
              }
            }
          }
        }
      }

      // Refresh data
      const refreshedData = await fetchHotelDetails(hotelId);
      setHotelData(refreshedData);
      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving hotel changes:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {hotelData?.hotel?.hotel_name || 'Hotel Details'}
        </Typography>
        <Stack direction="row" spacing={1}>
          {!editMode ? (
            <Tooltip title="Edit">
              <IconButton onClick={() => setEditMode(true)} color="primary">
                <EditIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Tooltip title="Save">
                <IconButton onClick={handleSaveHotelChanges} color="success" disabled={saving}>
                  {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton onClick={() => setEditMode(false)} color="error">
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : hotelData ? (
          <Stack spacing={3}>
            {/* Language Tabs */}
            <Box>
              <Tabs value={currentLanguageTab} onChange={(_, value) => setCurrentLanguageTab(value as LanguageCode)}>
                {LANGUAGES.map((lang) => (
                  <Tab key={lang.code} label={lang.label} value={lang.code} />
                ))}
              </Tabs>
            </Box>

            {/* Hotel Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Hotel Information {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
              </Typography>
              <Grid container spacing={2}>
                {HOTEL_TRANSLATABLE_FIELDS.map((field) => {
                  const label = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                  
                  let currentValue: any = '';
                  if (editMode) {
                    if (currentLanguageTab === 'en') {
                      currentValue = editedHotelDetails[field] || '';
                    } else {
                      currentValue = translations[field]?.[currentLanguageTab] || '';
                    }
                  } else {
                    if (currentLanguageTab === 'en') {
                      currentValue = hotelData?.hotel?.[field] || '';
                    } else {
                      currentValue = translations[field]?.[currentLanguageTab] || '';
                    }
                  }

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
                            if (currentLanguageTab === 'en') {
                              setEditedHotelDetails(prev => ({ ...prev, [field]: newVal }));
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
              </Grid>
            </Box>

            {/* Hero Image Section */}
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
                      id="hotel-hero-image-upload"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setHotelHeroImageFile(file);
                          const previewUrl = URL.createObjectURL(file);
                          setHotelHeroImage(previewUrl);
                        }
                      }}
                    />
                    <label htmlFor="hotel-hero-image-upload">
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingHero}
                      >
                        {uploadingHero ? 'Uploading...' : (hotelHeroImage ? 'Change' : 'Upload')} Hero Image
                      </Button>
                    </label>
                  </>
                )}
              </Stack>
              {hotelHeroImage ? (
                <Card variant="outlined">
                  <CardMedia
                    component="img"
                    height="300"
                    image={hotelHeroImage}
                    alt="Hotel hero image"
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
                              setHotelHeroImage(null);
                              setHotelHeroImageFile(null);
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

            {/* Gallery Images Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Gallery Images ({hotelGalleryMedia.length})
                </Typography>
                {editMode && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="hotel-gallery-image-upload"
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
                              position: hotelGalleryMedia.length + idx,
                              is_primary: false,
                              file: file,
                            };
                          });
                          setHotelGalleryMedia([...hotelGalleryMedia, ...newMediaItems]);
                        }
                      }}
                    />
                    <label htmlFor="hotel-gallery-image-upload">
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
                {hotelGalleryMedia.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No gallery images added yet
                    </Typography>
                  </Grid>
                ) : (
                  hotelGalleryMedia.map((media, index) => (
                    <Grid item xs={12} sm={6} md={4} key={media.media_id || index}>
                      <Card variant="outlined" sx={{ position: 'relative', height: '100%' }}>
                        {editMode && (
                          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={`hotel-gallery-edit-${index}`}
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const previewUrl = URL.createObjectURL(file);
                                  const newMedia = [...hotelGalleryMedia];
                                  newMedia[index] = { ...newMedia[index], media_url: previewUrl, file: file };
                                  setHotelGalleryMedia(newMedia);
                                }
                              }}
                            />
                            <label htmlFor={`hotel-gallery-edit-${index}`}>
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
                                    const newMedia = hotelGalleryMedia.filter((_, i) => i !== index);
                                    setHotelGalleryMedia(newMedia);
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
                          <CardMedia
                            component="img"
                            height="180"
                            image={media.media_url}
                            alt={media.alt_text || 'Hotel gallery image'}
                            sx={{ objectFit: 'cover' }}
                          />
                        )}
                        <Box sx={{ p: 1.5 }}>
                          {editMode && (
                            <TextField
                              fullWidth
                              size="small"
                              label="Alt Text"
                              value={media.alt_text || ''}
                              onChange={(e) => {
                                const newMedia = [...hotelGalleryMedia];
                                newMedia[index] = { ...newMedia[index], alt_text: e.target.value };
                                setHotelGalleryMedia(newMedia);
                              }}
                              sx={{ mb: 1 }}
                            />
                          )}
                          {!editMode && media.alt_text && (
                            <Typography variant="caption" color="text.secondary">
                              {media.alt_text}
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    </Grid>
                  ))
                )}
              </Grid>
            </Box>

            {/* Room Types Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Room Types ({roomTypes.length})
                </Typography>
                {editMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // Generate temporary negative ID for new room
                      const tempId = roomTypes.length > 0 
                        ? Math.min(...roomTypes.map(r => r.room_type_id || 0).filter(id => id < 0)) - 1
                        : -1;
                      
                      const newRoom: RoomType = {
                        room_type_id: tempId,
                        room_category: 'room',
                        room_name: '',
                        short_description: '',
                        base_price: 0,
                        currency: 'INR',
                        max_guests: 1,
                        is_featured: false,
                        is_active: true,
                        tax_percentage: 0,
                        tax: 0,
                        media: [],
                      };
                      setRoomTypes([...roomTypes, newRoom]);
                      
                      // Initialize translations for new room
                      setRoomTypeTranslations(prev => ({
                        ...prev,
                        [tempId]: {
                          en: { room_name: '', short_description: '' },
                          hi: { room_name: '', short_description: '' },
                          gu: { room_name: '', short_description: '' },
                          ja: { room_name: '', short_description: '' },
                          es: { room_name: '', short_description: '' },
                          fr: { room_name: '', short_description: '' },
                        },
                      }));
                    }}
                  >
                    Add Room Type
                  </Button>
                )}
              </Stack>
              {roomTypes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No room types added yet
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {roomTypes.map((room, roomIndex) => (
                    <Card key={room.room_type_id || roomIndex} variant="outlined" sx={{ p: 2 }}>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            {currentLanguageTab === 'en'
                              ? room.room_name
                              : roomTypeTranslations[room.room_type_id || 0]?.[currentLanguageTab]?.room_name || room.room_name}
                          </Typography>
                          {editMode && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setConfirmDialog({
                                  open: true,
                                  message: 'Are you sure you want to delete this room type?',
                                  onConfirm: () => {
                                    setConfirmDialog({ open: false, message: '', onConfirm: null });
                                    const newRooms = roomTypes.filter((_, i) => i !== roomIndex);
                                    setRoomTypes(newRooms);
                                    if (room.room_type_id) {
                                      const newTranslations = { ...roomTypeTranslations };
                                      delete newTranslations[room.room_type_id];
                                      setRoomTypeTranslations(newTranslations);
                                    }
                                  },
                                });
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          )}
                        </Stack>

                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Room Name ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={
                                  currentLanguageTab === 'en'
                                    ? room.room_name
                                    : roomTypeTranslations[room.room_type_id || 0]?.[currentLanguageTab]?.room_name || ''
                                }
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  if (currentLanguageTab === 'en') {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], room_name: newVal };
                                    setRoomTypes(newRooms);
                                  } else {
                                    setRoomTypeTranslations(prev => {
                                      const roomId = room.room_type_id || 0;
                                      const newTrans = { ...prev };
                                      if (!newTrans[roomId]) {
                                        newTrans[roomId] = {
                                          en: { room_name: room.room_name, short_description: room.short_description },
                                          hi: { room_name: '', short_description: '' },
                                          gu: { room_name: '', short_description: '' },
                                          ja: { room_name: '', short_description: '' },
                                          es: { room_name: '', short_description: '' },
                                          fr: { room_name: '', short_description: '' },
                                        };
                                      }
                                      newTrans[roomId][currentLanguageTab] = {
                                        ...newTrans[roomId][currentLanguageTab],
                                        room_name: newVal,
                                      };
                                      return newTrans;
                                    });
                                  }
                                  // Auto-translate from any language to all others
                                  const roomId = room.room_type_id || 0;
                                  if (roomId && newVal && newVal.trim()) {
                                    autoTranslateRoomTypeField(newVal, roomId, 'room_name');
                                  }
                                }}
                              />
                            ) : (
                              <Typography variant="body2">
                                {currentLanguageTab === 'en'
                                  ? room.room_name
                                  : roomTypeTranslations[room.room_type_id || 0]?.[currentLanguageTab]?.room_name || room.room_name}
                              </Typography>
                            )}
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Short Description ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                            </Typography>
                            {editMode ? (
                              <TextField
                                fullWidth
                                size="small"
                                multiline
                                minRows={2}
                                value={
                                  currentLanguageTab === 'en'
                                    ? room.short_description
                                    : roomTypeTranslations[room.room_type_id || 0]?.[currentLanguageTab]?.short_description || ''
                                }
                                onChange={(e) => {
                                  const newVal = e.target.value;
                                  if (currentLanguageTab === 'en') {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], short_description: newVal };
                                    setRoomTypes(newRooms);
                                  } else {
                                    setRoomTypeTranslations(prev => {
                                      const roomId = room.room_type_id || 0;
                                      const newTrans = { ...prev };
                                      if (!newTrans[roomId]) {
                                        newTrans[roomId] = {
                                          en: { room_name: room.room_name, short_description: room.short_description },
                                          hi: { room_name: '', short_description: '' },
                                          gu: { room_name: '', short_description: '' },
                                          ja: { room_name: '', short_description: '' },
                                          es: { room_name: '', short_description: '' },
                                          fr: { room_name: '', short_description: '' },
                                        };
                                      }
                                      newTrans[roomId][currentLanguageTab] = {
                                        ...newTrans[roomId][currentLanguageTab],
                                        short_description: newVal,
                                      };
                                      return newTrans;
                                    });
                                  }
                                  // Auto-translate from any language to all others
                                  const roomId = room.room_type_id || 0;
                                  if (roomId && newVal && newVal.trim()) {
                                    autoTranslateRoomTypeField(newVal, roomId, 'short_description');
                                  }
                                }}
                              />
                            ) : (
                              <Typography variant="body2">
                                {currentLanguageTab === 'en'
                                  ? room.short_description
                                  : roomTypeTranslations[room.room_type_id || 0]?.[currentLanguageTab]?.short_description || room.short_description}
                              </Typography>
                            )}
                          </Grid>

                          {editMode && (
                            <>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Base Price"
                                  type="number"
                                  value={room.base_price}
                                  onChange={(e) => {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], base_price: parseFloat(e.target.value) || 0 };
                                    setRoomTypes(newRooms);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Max Guests"
                                  type="number"
                                  value={room.max_guests}
                                  onChange={(e) => {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], max_guests: parseInt(e.target.value) || 1 };
                                    setRoomTypes(newRooms);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Tax %"
                                  type="number"
                                  value={room.tax_percentage}
                                  onChange={(e) => {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], tax_percentage: parseFloat(e.target.value) || 0 };
                                    setRoomTypes(newRooms);
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} md={3}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Tax Amount"
                                  type="number"
                                  value={room.tax}
                                  onChange={(e) => {
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = { ...newRooms[roomIndex], tax: parseFloat(e.target.value) || 0 };
                                    setRoomTypes(newRooms);
                                  }}
                                />
                              </Grid>
                            </>
                          )}

                          {/* Room Media */}
                          <Grid item xs={12}>
                            <Typography variant="body2" fontWeight={600} gutterBottom>
                              Room Images ({room.media?.length || 0})
                            </Typography>
                            {editMode && (
                              <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id={`room-media-upload-${roomIndex}`}
                                type="file"
                                multiple
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  if (files.length > 0) {
                                    const newMediaItems = files.map((file, idx) => {
                                      const previewUrl = URL.createObjectURL(file);
                                      return {
                                        media_url: previewUrl,
                                        alt_text: '',
                                        position: (room.media?.length || 0) + idx,
                                        is_primary: false,
                                        file: file,
                                      };
                                    });
                                    const newRooms = [...roomTypes];
                                    newRooms[roomIndex] = {
                                      ...newRooms[roomIndex],
                                      media: [...(newRooms[roomIndex].media || []), ...newMediaItems],
                                    };
                                    setRoomTypes(newRooms);
                                  }
                                }}
                              />
                            )}
                            {editMode && (
                              <label htmlFor={`room-media-upload-${roomIndex}`}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  component="span"
                                  startIcon={<CloudUploadIcon />}
                                  sx={{ mb: 2 }}
                                >
                                  Upload Room Images
                                </Button>
                              </label>
                            )}
                            <Grid container spacing={2}>
                              {room.media && room.media.length > 0 ? (
                                room.media.map((media, mediaIndex) => (
                                  <Grid item xs={12} sm={6} md={4} key={mediaIndex}>
                                    <Card variant="outlined" sx={{ position: 'relative' }}>
                                      {editMode && (
                                        <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                                          <input
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id={`room-media-edit-${roomIndex}-${mediaIndex}`}
                                            type="file"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const previewUrl = URL.createObjectURL(file);
                                                const newRooms = [...roomTypes];
                                                const roomMedia = [...(newRooms[roomIndex].media || [])];
                                                roomMedia[mediaIndex] = { ...roomMedia[mediaIndex], media_url: previewUrl, file: file };
                                                newRooms[roomIndex] = { ...newRooms[roomIndex], media: roomMedia };
                                                setRoomTypes(newRooms);
                                              }
                                            }}
                                          />
                                          <label htmlFor={`room-media-edit-${roomIndex}-${mediaIndex}`}>
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
                                                message: 'Are you sure you want to delete this room image?',
                                                onConfirm: () => {
                                                  setConfirmDialog({ open: false, message: '', onConfirm: null });
                                                  const newRooms = [...roomTypes];
                                                  const roomMedia = newRooms[roomIndex].media?.filter((_, i) => i !== mediaIndex) || [];
                                                  newRooms[roomIndex] = { ...newRooms[roomIndex], media: roomMedia };
                                                  setRoomTypes(newRooms);
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
                                        <CardMedia
                                          component="img"
                                          height="150"
                                          image={media.media_url}
                                          alt={media.alt_text || 'Room image'}
                                          sx={{ objectFit: 'cover' }}
                                        />
                                      )}
                                    </Card>
                                  </Grid>
                                ))
                              ) : (
                                <Grid item xs={12}>
                                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    No room images added yet
                                  </Typography>
                                </Grid>
                              )}
                            </Grid>
                          </Grid>
                        </Grid>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>

            {/* Amenities Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Amenities ({amenities.length})
                </Typography>
                {editMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAmenityDialog}
                  >
                    Add Amenity
                  </Button>
                )}
              </Stack>
              {amenities.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No amenities added yet
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {amenities.map((amenity) => {
                    const amenityName = currentLanguageTab === 'en'
                      ? amenity.amenity_name
                      : amenityTranslations[amenity.amenity_id]?.[currentLanguageTab] || amenity.amenity_name;

                    // Get Material Icon component based on amenity_icon name
                    const getIconComponent = (iconName: string) => {
                      if (!iconName) return null;
                      
                      // Map common icon names to Material Icons component names
                      const iconNameMap: Record<string, string> = {
                        'local_parking': 'LocalParking',
                        'wifi': 'Wifi',
                        'ac_unit': 'AcUnit',
                        'king_bed': 'KingBed',
                        'local_laundry_service': 'LocalLaundryService',
                        'elevator': 'Elevator',
                        'cleaning_services': 'CleaningServices',
                        'medical_services': 'MedicalServices',
                        'breakfast': 'Restaurant',
                        'first_aid': 'MedicalServices',
                      };
                      
                      // Try mapped name first, then convert snake_case to PascalCase
                      let iconComponentName = iconNameMap[iconName.toLowerCase()];
                      if (!iconComponentName) {
                        iconComponentName = iconName
                          .split('_')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join('');
                      }
                      
                      // Get the icon component from Material Icons
                      const IconComponent = (Icons as any)[iconComponentName];
                      if (IconComponent) {
                        return <IconComponent sx={{ fontSize: 24, color: 'primary.main' }} />;
                      }
                      
                      // Fallback: try with 'Icon' suffix
                      const IconComponentWithSuffix = (Icons as any)[`${iconComponentName}Icon`];
                      return IconComponentWithSuffix ? (
                        <IconComponentWithSuffix sx={{ fontSize: 24, color: 'primary.main' }} />
                      ) : null;
                    };

                    return (
                      <Grid item xs={12} sm={6} md={4} key={amenity.amenity_id}>
                        <Card variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {amenity.amenity_icon && getIconComponent(amenity.amenity_icon)}
                            {editMode && currentLanguageTab !== 'en' ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={amenityTranslations[amenity.amenity_id]?.[currentLanguageTab] || ''}
                                onChange={(e) => {
                                  setAmenityTranslations(prev => {
                                    const newTrans = { ...prev };
                                    if (!newTrans[amenity.amenity_id]) {
                                      newTrans[amenity.amenity_id] = {
                                        en: amenity.amenity_name,
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      };
                                    }
                                    newTrans[amenity.amenity_id][currentLanguageTab] = e.target.value;
                                    return newTrans;
                                  });
                                }}
                                label={`Amenity Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                InputProps={{
                                  endAdornment: editMode ? (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          setConfirmDialog({
                                            open: true,
                                            message: `Are you sure you want to remove "${amenity.amenity_name}" from this hotel?`,
                                            onConfirm: () => {
                                              setConfirmDialog({ open: false, message: '', onConfirm: null });
                                              const newAmenities = amenities.filter(a => a.amenity_id !== amenity.amenity_id);
                                              setAmenities(newAmenities);
                                              // Remove translations for this amenity
                                              const newTranslations = { ...amenityTranslations };
                                              delete newTranslations[amenity.amenity_id];
                                              setAmenityTranslations(newTranslations);
                                            },
                                          });
                                        }}
                                        edge="end"
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  ) : undefined,
                                }}
                              />
                            ) : (
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {amenityName}
                              </Typography>
                            )}
                          </Stack>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>

            {/* Attractions Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Attractions ({attractions.length})
                </Typography>
                {editMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      // Generate temporary negative ID for new attraction
                      const tempId = attractions.length > 0 
                        ? Math.min(...attractions.map(a => a.attraction_id || 0).filter(id => id < 0)) - 1
                        : -1;
                      
                      const newAttraction: { attraction_id?: number; name: string; subtitle: string; description: string; image_url: string; position: number; imageFile?: File } = {
                        attraction_id: tempId,
                        name: '',
                        subtitle: '',
                        description: '',
                        image_url: '',
                        position: attractions.length + 1,
                      };
                      setAttractions([...attractions, newAttraction]);
                      setAttractionTranslations(prev => ({
                        ...prev,
                        [tempId]: {
                          en: { name: '', subtitle: '', description: '' },
                          hi: { name: '', subtitle: '', description: '' },
                          gu: { name: '', subtitle: '', description: '' },
                          ja: { name: '', subtitle: '', description: '' },
                          es: { name: '', subtitle: '', description: '' },
                          fr: { name: '', subtitle: '', description: '' },
                        },
                      }));
                    }}
                  >
                    Add Attraction
                  </Button>
                )}
              </Stack>
              {attractions.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No attractions added yet
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {attractions.map((attraction, attractionIndex) => {
                    const attractionId = attraction.attraction_id || 0;
                    const attractionName = currentLanguageTab === 'en'
                      ? attraction.name
                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.name || attraction.name;
                    const attractionSubtitle = currentLanguageTab === 'en'
                      ? attraction.subtitle
                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.subtitle || attraction.subtitle;
                    const attractionDescription = currentLanguageTab === 'en'
                      ? attraction.description
                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.description || attraction.description;

                    return (
                      <Card key={attraction.attraction_id || attractionIndex} variant="outlined" sx={{ p: 2 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">
                              {attractionName || 'New Attraction'}
                            </Typography>
                            {editMode && (
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to delete this attraction?',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      const newAttractions = attractions.filter((_, i) => i !== attractionIndex);
                                      setAttractions(newAttractions);
                                      if (attraction.attraction_id) {
                                        const newTranslations = { ...attractionTranslations };
                                        delete newTranslations[attraction.attraction_id];
                                        setAttractionTranslations(newTranslations);
                                      }
                                    },
                                  });
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )}
                          </Stack>

                          <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Name ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                              </Typography>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={
                                    currentLanguageTab === 'en'
                                      ? attraction.name
                                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.name || ''
                                  }
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    if (currentLanguageTab === 'en') {
                                      const newAttractions = [...attractions];
                                      newAttractions[attractionIndex] = { ...newAttractions[attractionIndex], name: newVal };
                                      setAttractions(newAttractions);
                                    } else {
                                      setAttractionTranslations(prev => {
                                        const newTrans = { ...prev };
                                        if (!newTrans[attractionId]) {
                                          newTrans[attractionId] = {
                                            en: { name: attraction.name, subtitle: attraction.subtitle, description: attraction.description },
                                            hi: { name: '', subtitle: '', description: '' },
                                            gu: { name: '', subtitle: '', description: '' },
                                            ja: { name: '', subtitle: '', description: '' },
                                            es: { name: '', subtitle: '', description: '' },
                                            fr: { name: '', subtitle: '', description: '' },
                                          };
                                        }
                                        newTrans[attractionId][currentLanguageTab] = {
                                          ...newTrans[attractionId][currentLanguageTab],
                                          name: newVal,
                                        };
                                        return newTrans;
                                      });
                                    }
                                    // Auto-translate from any language to all others
                                    if (newVal && newVal.trim()) {
                                      autoTranslateAttractionField(newVal, attractionId, 'name');
                                    }
                                  }}
                                />
                              ) : (
                                <Typography variant="body2">
                                  {attractionName}
                                </Typography>
                              )}
                            </Grid>

                            <Grid item xs={12} md={6}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Subtitle ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                              </Typography>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={
                                    currentLanguageTab === 'en'
                                      ? attraction.subtitle
                                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.subtitle || ''
                                  }
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    if (currentLanguageTab === 'en') {
                                      const newAttractions = [...attractions];
                                      newAttractions[attractionIndex] = { ...newAttractions[attractionIndex], subtitle: newVal };
                                      setAttractions(newAttractions);
                                    } else {
                                      setAttractionTranslations(prev => {
                                        const newTrans = { ...prev };
                                        if (!newTrans[attractionId]) {
                                          newTrans[attractionId] = {
                                            en: { name: attraction.name, subtitle: attraction.subtitle, description: attraction.description },
                                            hi: { name: '', subtitle: '', description: '' },
                                            gu: { name: '', subtitle: '', description: '' },
                                            ja: { name: '', subtitle: '', description: '' },
                                            es: { name: '', subtitle: '', description: '' },
                                            fr: { name: '', subtitle: '', description: '' },
                                          };
                                        }
                                        newTrans[attractionId][currentLanguageTab] = {
                                          ...newTrans[attractionId][currentLanguageTab],
                                          subtitle: newVal,
                                        };
                                        return newTrans;
                                      });
                                    }
                                    // Auto-translate from any language to all others
                                    if (newVal && newVal.trim()) {
                                      autoTranslateAttractionField(newVal, attractionId, 'subtitle');
                                    }
                                  }}
                                />
                              ) : (
                                <Typography variant="body2">
                                  {attractionSubtitle}
                                </Typography>
                              )}
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Description ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                              </Typography>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  multiline
                                  minRows={2}
                                  value={
                                    currentLanguageTab === 'en'
                                      ? attraction.description
                                      : attractionTranslations[attractionId]?.[currentLanguageTab]?.description || ''
                                  }
                                  onChange={(e) => {
                                    const newVal = e.target.value;
                                    if (currentLanguageTab === 'en') {
                                      const newAttractions = [...attractions];
                                      newAttractions[attractionIndex] = { ...newAttractions[attractionIndex], description: newVal };
                                      setAttractions(newAttractions);
                                    } else {
                                      setAttractionTranslations(prev => {
                                        const newTrans = { ...prev };
                                        if (!newTrans[attractionId]) {
                                          newTrans[attractionId] = {
                                            en: { name: attraction.name, subtitle: attraction.subtitle, description: attraction.description },
                                            hi: { name: '', subtitle: '', description: '' },
                                            gu: { name: '', subtitle: '', description: '' },
                                            ja: { name: '', subtitle: '', description: '' },
                                            es: { name: '', subtitle: '', description: '' },
                                            fr: { name: '', subtitle: '', description: '' },
                                          };
                                        }
                                        newTrans[attractionId][currentLanguageTab] = {
                                          ...newTrans[attractionId][currentLanguageTab],
                                          description: newVal,
                                        };
                                        return newTrans;
                                      });
                                    }
                                    // Auto-translate from any language to all others
                                    if (newVal && newVal.trim()) {
                                      autoTranslateAttractionField(newVal, attractionId, 'description');
                                    }
                                  }}
                                />
                              ) : (
                                <Typography variant="body2">
                                  {attractionDescription}
                                </Typography>
                              )}
                            </Grid>

                            <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Image
                              </Typography>
                              {editMode && (
                                <input
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  id={`attraction-image-upload-${attractionIndex}`}
                                  type="file"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const previewUrl = URL.createObjectURL(file);
                                      const newAttractions = [...attractions];
                                      newAttractions[attractionIndex] = {
                                        ...newAttractions[attractionIndex],
                                        image_url: previewUrl,
                                        imageFile: file,
                                      };
                                      setAttractions(newAttractions);
                                    }
                                  }}
                                />
                              )}
                              {editMode && (
                                <label htmlFor={`attraction-image-upload-${attractionIndex}`}>
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    component="span"
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ mb: 2 }}
                                  >
                                    {attraction.image_url ? 'Change Image' : 'Upload Image'}
                                  </Button>
                                </label>
                              )}
                              {attraction.image_url && (
                                <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                                  <CardMedia
                                    component="img"
                                    height="200"
                                    image={attraction.image_url}
                                    alt={attractionName}
                                    sx={{ objectFit: 'cover', borderRadius: 1 }}
                                  />
                                  {editMode && (
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => {
                                        setConfirmDialog({
                                          open: true,
                                          message: 'Are you sure you want to remove this image?',
                                          onConfirm: () => {
                                            setConfirmDialog({ open: false, message: '', onConfirm: null });
                                            const newAttractions = [...attractions];
                                            newAttractions[attractionIndex] = {
                                              ...newAttractions[attractionIndex],
                                              image_url: '',
                                              imageFile: undefined,
                                            };
                                            setAttractions(newAttractions);
                                          },
                                        });
                                      }}
                                      sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'white', '&:hover': { bgcolor: '#ffebee' } }}
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                              )}
                            </Grid>
                          </Grid>
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No hotel data available
          </Typography>
        )}
      </DialogContent>

      {/* Amenity Selection Dialog */}
      <Dialog open={amenityDialogOpen} onClose={handleCloseAmenityDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Select Amenities</Typography>
          <IconButton onClick={handleCloseAmenityDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select amenities to add to this hotel
          </Typography>
          <Grid container spacing={2}>
            {allAvailableAmenities.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              allAvailableAmenities.map((amenity) => {
                const isSelected = selectedAmenityIds.has(amenity.amenity_id);
                
                // Get Material Icon component based on amenity_icon name
                const getIconComponent = (iconName: string) => {
                  if (!iconName) return null;
                  
                  const iconNameMap: Record<string, string> = {
                    'local_parking': 'LocalParking',
                    'wifi': 'Wifi',
                    'ac_unit': 'AcUnit',
                    'king_bed': 'KingBed',
                    'local_laundry_service': 'LocalLaundryService',
                    'elevator': 'Elevator',
                    'cleaning_services': 'CleaningServices',
                    'medical_services': 'MedicalServices',
                    'breakfast': 'Restaurant',
                    'first_aid': 'MedicalServices',
                  };
                  
                  let iconComponentName = iconNameMap[iconName.toLowerCase()];
                  if (!iconComponentName) {
                    iconComponentName = iconName
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join('');
                  }
                  
                  const IconComponent = (Icons as any)[iconComponentName];
                  if (IconComponent) {
                    return <IconComponent sx={{ fontSize: 24, color: 'primary.main' }} />;
                  }
                  
                  const IconComponentWithSuffix = (Icons as any)[`${iconComponentName}Icon`];
                  return IconComponentWithSuffix ? (
                    <IconComponentWithSuffix sx={{ fontSize: 24, color: 'primary.main' }} />
                  ) : null;
                };

                return (
                  <Grid item xs={12} sm={6} md={4} key={amenity.amenity_id}>
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        cursor: 'pointer',
                        border: isSelected ? 2 : 1,
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'action.selected' : 'background.paper',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => handleToggleAmenitySelection(amenity.amenity_id)}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleAmenitySelection(amenity.amenity_id)}
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                        />
                        {amenity.amenity_icon && getIconComponent(amenity.amenity_icon)}
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {amenity.amenity_name}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAmenityDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmAmenitySelection}
            variant="contained"
            color="primary"
            disabled={selectedAmenityIds.size === 0}
          >
            Add Selected ({selectedAmenityIds.size})
          </Button>
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
    </Dialog>
  );
};

export default HotelDetailsDialog;


