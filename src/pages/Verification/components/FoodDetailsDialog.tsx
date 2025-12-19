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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

const FOOD_TRANSLATABLE_FIELDS = [
  'food_name',
  'subtitle',
  'short_description',
  'full_description',
  'address_line1',
  'area_or_zone',
  'city',
  'state',
];

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 7, label: 'Sunday' },
];

interface FoodDetailsDialogProps {
  open: boolean;
  foodId: number | null;
  onClose: () => void;
}

interface FoodHour {
  hours_id?: number;
  day_of_week: number;
  is_open: boolean;
  open_time: string | null;
  close_time: string | null;
  special_notes?: string | null;
}

interface FoodTag {
  tag_id: number;
  tag_key: string;
  tag_name: string;
  tag_icon?: string;
}

interface MealType {
  meal_type_id: number;
  meal_type_key: string;
  meal_type_name: string;
}

interface MealTypeMapping {
  meal_type_id: number;
  number_of_guests?: number | null;
  start_time?: string | null;
  end_time?: string | null;
}

const FoodDetailsDialog: React.FC<FoodDetailsDialogProps> = ({ open, foodId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [foodData, setFoodData] = useState<any>(null);
  const [editedFoodDetails, setEditedFoodDetails] = useState<Record<string, any>>({});
  const [translations, setTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Food media
  const [foodHeroImages, setFoodHeroImages] = useState<Array<{ media_id?: number; media_type: string; media_url: string; alt_text?: string; position?: number; is_primary?: boolean; file?: File }>>([]);
  const [foodGalleryMedia, setFoodGalleryMedia] = useState<Array<{ media_id?: number; media_type: string; media_url: string; alt_text?: string; position?: number; is_primary?: boolean; file?: File }>>([]);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  
  // Food hours
  const [foodHours, setFoodHours] = useState<FoodHour[]>([]);
  
  // Food tags
  const [foodTags, setFoodTags] = useState<FoodTag[]>([]);
  const [foodTagTranslations, setFoodTagTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  
  // Meal types
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [selectedMealTypeIds, setSelectedMealTypeIds] = useState<Set<number>>(new Set());
  const [mealTypeMappings, setMealTypeMappings] = useState<Record<number, MealTypeMapping>>({});
  const [mealTypeTranslations, setMealTypeTranslations] = useState<Record<number, Record<LanguageCode, string>>>({});
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: (() => void) | null }>({
    open: false,
    message: '',
    onConfirm: null,
  });

  // Tag selection dialog
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [allAvailableTags, setAllAvailableTags] = useState<FoodTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<number>>(new Set());

  // Fetch food details
  const fetchFoodDetails = async (id: number) => {
    try {
      // Fetch food basic info
      const { data: foodData, error: foodError } = await supabase
        .from('heritage_food')
        .select('*')
        .eq('food_id', id)
        .single();

      if (foodError) throw foodError;

      // Fetch translations
      const { data: translationsData } = await supabase
        .from('heritage_foodtranslation')
        .select('*')
        .eq('food_id', id);

      // Fetch media
      const { data: mediaData } = await supabase
        .from('heritage_foodmedia')
        .select('*')
        .eq('food_id', id)
        .order('position', { ascending: true });

      // Fetch food hours
      const { data: hoursData } = await supabase
        .from('heritage_foodhours')
        .select('*')
        .eq('food_id', id)
        .order('day_of_week', { ascending: true });

      // Fetch food tags mapping
      const { data: tagMappingData } = await supabase
        .from('heritage_foodtagmapping')
        .select('tag_id')
        .eq('food_id', id);

      // Fetch meal type mapping with all fields
      const { data: mealTypeMappingData } = await supabase
        .from('heritage_food_meal_type_mapping')
        .select('meal_type_id, number_of_guests, start_time, end_time')
        .eq('food_id', id);

      return {
        food: foodData,
        translations: translationsData || [],
        media: mediaData || [],
        hours: hoursData || [],
        tagIds: (tagMappingData || []).map((t: any) => t.tag_id),
        mealTypeMappings: (mealTypeMappingData || []).map((m: any) => ({
          meal_type_id: m.meal_type_id,
          number_of_guests: m.number_of_guests || null,
          start_time: m.start_time || null,
          end_time: m.end_time || null,
        })),
      };
    } catch (error) {
      console.error('Error fetching food details:', error);
      throw error;
    }
  };

  // Load food translations
  const loadFoodTranslations = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('heritage_foodtranslation')
        .select('*')
        .eq('food_id', id);

      if (error) throw error;

      const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
      FOOD_TRANSLATABLE_FIELDS.forEach(field => {
        loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
      });

      if (data) {
        data.forEach((trans: any) => {
          const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
          if (langCode && LANGUAGES.some(l => l.code === langCode)) {
            FOOD_TRANSLATABLE_FIELDS.forEach(field => {
              if (trans[field] !== null && trans[field] !== undefined) {
                loadedTranslations[field][langCode] = String(trans[field] || '');
              }
            });
          }
        });
      }

      return loadedTranslations;
    } catch (error) {
      console.error('Error loading food translations:', error);
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

  // Load food data
  useEffect(() => {
    if (open && foodId) {
      setLoading(true);
      fetchFoodDetails(foodId)
        .then(async (data) => {
          console.log('Food data:', data);
          setFoodData(data);
          
          if (data?.food) {
            const food = data.food;
            setEditedFoodDetails({
              food_name: food.food_name || '',
              subtitle: food.subtitle || '',
              short_description: food.short_description || '',
              full_description: food.full_description || '',
              address_line1: food.address_line1 || '',
              area_or_zone: food.area_or_zone || '',
              city: food.city || '',
              state: food.state || '',
              country: food.country || '',
              postal_code: food.postal_code || '',
              latitude: food.latitude || null,
              longitude: food.longitude || null,
              avg_cost_for_two: food.avg_cost_for_two || null,
              currency: food.currency || 'INR',
              veg_only: food.veg_only || false,
              priority_level: food.priority_level || 0,
              status: food.status || 'pending',
              is_active: food.is_active !== false,
              establish_year: food.establish_year || null,
            });

            // Load translations
            const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
            FOOD_TRANSLATABLE_FIELDS.forEach(field => {
              loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
              if (food[field] !== null && food[field] !== undefined) {
                loadedTranslations[field].en = String(food[field] || '');
              }
            });

            if (data.translations && Array.isArray(data.translations)) {
              data.translations.forEach((trans: any) => {
                const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                if (langCode && LANGUAGES.some(l => l.code === langCode)) {
                  FOOD_TRANSLATABLE_FIELDS.forEach(field => {
                    if (trans[field] !== null && trans[field] !== undefined) {
                      loadedTranslations[field][langCode] = String(trans[field] || '').trim();
                    }
                  });
                }
              });
            }

            const dbTranslations = await loadFoodTranslations(foodId);
            FOOD_TRANSLATABLE_FIELDS.forEach(field => {
              if (dbTranslations[field]) {
                for (const langKey of Object.keys(dbTranslations[field])) {
                  const lang = langKey as LanguageCode;
                  const dbValue = dbTranslations[field][lang];
                  if (dbValue && String(dbValue).trim() && (!loadedTranslations[field][lang] || !loadedTranslations[field][lang].trim())) {
                    loadedTranslations[field][lang] = String(dbValue).trim();
                  }
                }
              }
            });

            setTranslations(loadedTranslations);

            // Load media
            if (data.media && Array.isArray(data.media)) {
              // Get all hero images (media_type === 'hero')
              const heroMedia = data.media.filter((m: any) => m.media_type === 'hero').map((m: any) => ({
                media_id: m.media_id,
                media_type: 'hero',
                media_url: m.media_url || '',
                alt_text: m.alt_text || '',
                position: m.position || 0,
                is_primary: m.is_primary || false,
              }));
              setFoodHeroImages(heroMedia);
              
              // Gallery media (everything that's not hero)
              const galleryMedia = data.media.filter((m: any) => m.media_type !== 'hero').map((m: any) => ({
                media_id: m.media_id,
                media_type: m.media_type || 'gallery',
                media_url: m.media_url || '',
                alt_text: m.alt_text || '',
                position: m.position || 0,
                is_primary: m.is_primary || false,
              }));
              setFoodGalleryMedia(galleryMedia);
            }

            // Load food hours - ensure all 7 days are present
            // Note: Database uses day_of_week 0 for Sunday, but UI uses 7
            const hoursMap = new Map<number, FoodHour>();
            
            // First, initialize all 7 days with default closed status (is_open = false)
            DAYS_OF_WEEK.forEach(day => {
              hoursMap.set(day.value, {
                day_of_week: day.value,
                is_open: false,
                open_time: null,
                close_time: null,
                special_notes: null,
              });
            });
            
            // Then, override with data from database
            if (data.hours && Array.isArray(data.hours)) {
              data.hours.forEach((h: any) => {
                // Map day_of_week: 0 (Sunday in DB) -> 7 (Sunday in UI), others stay the same
                const dayOfWeek = h.day_of_week === 0 ? 7 : h.day_of_week;
                hoursMap.set(dayOfWeek, {
                  hours_id: h.hours_id,
                  day_of_week: dayOfWeek,
                  is_open: h.is_open !== undefined ? h.is_open : false,
                  open_time: h.open_time || null,
                  close_time: h.close_time || null,
                  special_notes: h.special_notes || null,
                });
              });
            }
            
            // Convert map to array, sorted by day_of_week
            const allHours = Array.from(hoursMap.values()).sort((a, b) => a.day_of_week - b.day_of_week);
            setFoodHours(allHours);

            // Load food tags
            if (data.tagIds && data.tagIds.length > 0) {
              const { data: tagsData } = await supabase
                .from('heritage_foodtag')
                .select('*')
                .in('tag_id', data.tagIds);

              if (tagsData) {
                setFoodTags(tagsData.map((t: any) => ({
                  tag_id: t.tag_id,
                  tag_key: t.tag_key || '',
                  tag_name: t.tag_name || '',
                  tag_icon: t.tag_icon || '',
                })));

                // Load tag translations
                const { data: tagTransData } = await supabase
                  .from('heritage_foodtagtranslation')
                  .select('*')
                  .in('tag_id', data.tagIds);

                if (tagTransData) {
                  const tagTrans: Record<number, Record<LanguageCode, string>> = {};
                  tagsData.forEach((tag: any) => {
                    tagTrans[tag.tag_id] = {
                      en: tag.tag_name || '',
                      hi: '',
                      gu: '',
                      ja: '',
                      es: '',
                      fr: '',
                    };
                  });

                  tagTransData.forEach((trans: any) => {
                    const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                    if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.tag_id) {
                      if (!tagTrans[trans.tag_id]) {
                        tagTrans[trans.tag_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                      }
                      if (trans.tag_name) {
                        tagTrans[trans.tag_id][langCode] = String(trans.tag_name || '').trim();
                      }
                    }
                  });

                  setFoodTagTranslations(tagTrans);
                }
              }
            }

            // Load meal types
            const { data: allMealTypes } = await supabase
              .from('heritage_meal_type')
              .select('*')
              .order('meal_type_id', { ascending: true });

            if (allMealTypes) {
              setMealTypes(allMealTypes.map((m: any) => ({
                meal_type_id: m.meal_type_id,
                meal_type_key: m.meal_type_key || '',
                meal_type_name: m.meal_type_name || '',
              })));

              // Load meal type translations
              const mealTypeIds = allMealTypes.map((m: any) => m.meal_type_id);
              if (mealTypeIds.length > 0) {
                const { data: mealTypeTransData } = await supabase
                  .from('heritage_meal_typetranslation')
                  .select('*')
                  .in('meal_type_id', mealTypeIds);

                if (mealTypeTransData) {
                  const mealTypeTrans: Record<number, Record<LanguageCode, string>> = {};
                  
                  // Initialize translations with default names
                  allMealTypes.forEach((mealType: any) => {
                    mealTypeTrans[mealType.meal_type_id] = {
                      en: mealType.meal_type_name || '',
                      hi: '',
                      gu: '',
                      ja: '',
                      es: '',
                      fr: '',
                    };
                  });

                  // Fill in translations from database
                  mealTypeTransData.forEach((trans: any) => {
                    const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
                    if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.meal_type_id) {
                      if (!mealTypeTrans[trans.meal_type_id]) {
                        mealTypeTrans[trans.meal_type_id] = {
                          en: '',
                          hi: '',
                          gu: '',
                          ja: '',
                          es: '',
                          fr: '',
                        };
                      }
                      if (trans.meal_type_name) {
                        mealTypeTrans[trans.meal_type_id][langCode] = String(trans.meal_type_name || '').trim();
                      }
                    }
                  });

                  setMealTypeTranslations(mealTypeTrans);
                }
              }

              // Load selected meal types and their mappings
              if (data.mealTypeMappings && data.mealTypeMappings.length > 0) {
                const selectedMealTypeIds = data.mealTypeMappings.map((m: any) => m.meal_type_id);
                setSelectedMealTypeIds(new Set(selectedMealTypeIds));

                // Initialize meal type mappings
                const mappings: Record<number, MealTypeMapping> = {};
                data.mealTypeMappings.forEach((m: any) => {
                  mappings[m.meal_type_id] = {
                    meal_type_id: m.meal_type_id,
                    number_of_guests: m.number_of_guests || null,
                    start_time: m.start_time || null,
                    end_time: m.end_time || null,
                  };
                });
                setMealTypeMappings(mappings);
              }
            }
          }
        })
        .catch((error) => {
          console.error('Error loading food details:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, foodId]);

  // Load all available tags for selection dialog
  const loadAllAvailableTags = async () => {
    try {
      const { data, error } = await supabase
        .from('heritage_foodtag')
        .select('*')
        .order('tag_id', { ascending: true });

      if (error) throw error;
      
      if (data) {
        setAllAvailableTags(data.map((t: any) => ({
          tag_id: t.tag_id,
          tag_key: t.tag_key || '',
          tag_name: t.tag_name || '',
          tag_icon: t.tag_icon || '',
        })));
        
        const currentTagIds = new Set(foodTags.map(t => t.tag_id));
        setSelectedTagIds(currentTagIds);
      }
    } catch (error) {
      console.error('Error loading available tags:', error);
    }
  };

  // Handle opening tag selection dialog
  const handleOpenTagDialog = async () => {
    await loadAllAvailableTags();
    setTagDialogOpen(true);
  };

  // Handle closing tag selection dialog
  const handleCloseTagDialog = () => {
    setTagDialogOpen(false);
    setSelectedTagIds(new Set());
  };

  // Handle tag selection toggle
  const handleToggleTagSelection = (tagId: number) => {
    setSelectedTagIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  };

  // Handle confirming tag selection
  const handleConfirmTagSelection = async () => {
    try {
      const selectedTags = allAvailableTags.filter(t => selectedTagIds.has(t.tag_id));
      setFoodTags(selectedTags);

      // Load translations for newly selected tags
      const tagIds = selectedTags.map(t => t.tag_id);
      if (tagIds.length > 0) {
        try {
          const { data: tagTransData } = await supabase
            .from('heritage_foodtagtranslation')
            .select('*')
            .in('tag_id', tagIds);

          if (tagTransData) {
            const tagTrans: Record<number, Record<LanguageCode, string>> = {};
            selectedTags.forEach((tag) => {
              tagTrans[tag.tag_id] = {
                en: tag.tag_name || '',
                hi: '',
                gu: '',
                ja: '',
                es: '',
                fr: '',
              };
            });

            tagTransData.forEach((trans: any) => {
              const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
              if (langCode && LANGUAGES.some(l => l.code === langCode) && trans.tag_id) {
                if (!tagTrans[trans.tag_id]) {
                  tagTrans[trans.tag_id] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                }
                if (trans.tag_name) {
                  tagTrans[trans.tag_id][langCode] = String(trans.tag_name || '').trim();
                }
              }
            });

            setFoodTagTranslations(tagTrans);
          }
        } catch (err) {
          console.error('Error loading tag translations:', err);
        }
      }

      handleCloseTagDialog();
    } catch (error) {
      console.error('Error confirming tag selection:', error);
    }
  };

  // Save food changes
  const handleSaveFoodChanges = async () => {
    if (!foodId) return;

    setSaving(true);
    try {
      // Update food basic info
      const { error: foodUpdateError } = await supabase
        .from('heritage_food')
        .update({
          food_name: editedFoodDetails.food_name,
          subtitle: editedFoodDetails.subtitle,
          short_description: editedFoodDetails.short_description,
          full_description: editedFoodDetails.full_description,
          address_line1: editedFoodDetails.address_line1,
          area_or_zone: editedFoodDetails.area_or_zone,
          city: editedFoodDetails.city,
          state: editedFoodDetails.state,
          country: editedFoodDetails.country,
          postal_code: editedFoodDetails.postal_code,
          latitude: editedFoodDetails.latitude,
          longitude: editedFoodDetails.longitude,
          avg_cost_for_two: editedFoodDetails.avg_cost_for_two,
          currency: editedFoodDetails.currency,
          veg_only: editedFoodDetails.veg_only,
          priority_level: editedFoodDetails.priority_level,
          status: editedFoodDetails.status,
          is_active: editedFoodDetails.is_active,
          establish_year: editedFoodDetails.establish_year,
        })
        .eq('food_id', foodId);

      if (foodUpdateError) {
        throw foodUpdateError;
      }

      // Save translations
      for (const field of FOOD_TRANSLATABLE_FIELDS) {
        const fieldTranslations = translations[field];
        if (fieldTranslations) {
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && fieldTranslations[lang.code]) {
              try {
                await supabase
                  .from('heritage_foodtranslation')
                  .upsert({
                    food_id: foodId,
                    language_code: lang.code.toUpperCase(),
                    [field]: fieldTranslations[lang.code],
                  }, {
                    onConflict: 'food_id,language_code',
                  });
              } catch (err) {
                console.error(`Error saving translation for ${field} in ${lang.code}:`, err);
              }
            }
          }
        }
      }

      // Save hero images
      const existingHeroMediaIds = foodHeroImages
        .filter(m => m.media_id)
        .map(m => m.media_id) as number[];

      const { data: currentHeroMedia } = await supabase
        .from('heritage_foodmedia')
        .select('media_id, media_url')
        .eq('food_id', foodId)
        .eq('media_type', 'hero');

      if (currentHeroMedia) {
        const heroMediaIdsToDelete = currentHeroMedia
          .filter((m: any) => !existingHeroMediaIds.includes(m.media_id))
          .map((m: any) => m.media_id);

        if (heroMediaIdsToDelete.length > 0) {
          for (const mediaId of heroMediaIdsToDelete) {
            const mediaToDelete = currentHeroMedia.find((m: any) => m.media_id === mediaId);
            if (mediaToDelete?.media_url) {
              await StorageService.deleteFile(mediaToDelete.media_url);
            }
          }
          await supabase
            .from('heritage_foodmedia')
            .delete()
            .in('media_id', heroMediaIdsToDelete);
        }
      }

      // Upload new hero images and update existing ones
      setUploadingHero(true);
      try {
        const folder = `food/${foodId}`;
        for (let index = 0; index < foodHeroImages.length; index++) {
          const heroMedia = foodHeroImages[index];
          let mediaUrl = heroMedia.media_url;

          // Upload new file if present
          if (heroMedia.file) {
            try {
              const uploadResult = await StorageService.uploadFile(heroMedia.file, folder);
              if (uploadResult.success && uploadResult.url) {
                mediaUrl = uploadResult.url;
              } else {
                throw new Error(`Failed to upload hero image: ${uploadResult.error || 'Unknown error'}`);
              }
            } catch (error: any) {
              console.error(`Error uploading hero image ${index}:`, error);
              continue;
            }
          }

          if (mediaUrl) {
            const heroMediaData: any = {
              food_id: foodId,
              media_type: 'hero',
              media_url: mediaUrl,
              alt_text: heroMedia.alt_text || null,
              position: index,
              is_primary: false,
            };

            if (heroMedia.media_id) {
              const existingMedia = currentHeroMedia?.find((m: any) => m.media_id === heroMedia.media_id);
              if (existingMedia?.media_url !== mediaUrl && existingMedia?.media_url) {
                await StorageService.deleteFile(existingMedia.media_url);
              }
              await supabase
                .from('heritage_foodmedia')
                .update(heroMediaData)
                .eq('media_id', heroMedia.media_id);
            } else {
              await supabase
                .from('heritage_foodmedia')
                .insert(heroMediaData);
            }
          }
        }
      } finally {
        setUploadingHero(false);
      }

      // Save gallery media
      if (foodGalleryMedia.length > 0) {
        const existingMediaIds = foodGalleryMedia
          .filter(m => m.media_id)
          .map(m => m.media_id);

        const { data: currentMedia } = await supabase
          .from('heritage_foodmedia')
          .select('media_id, media_url')
          .eq('food_id', foodId)
          .eq('media_type', 'gallery');

        if (currentMedia) {
          const mediaIdsToDelete = currentMedia
            .map((m: any) => m.media_id)
            .filter((id: number) => !existingMediaIds.includes(id));

          for (const media of currentMedia.filter((m: any) => mediaIdsToDelete.includes(m.media_id))) {
            if (media.media_url) {
              await StorageService.deleteFile(media.media_url);
            }
          }

          if (mediaIdsToDelete.length > 0) {
            await supabase
              .from('heritage_foodmedia')
              .delete()
              .in('media_id', mediaIdsToDelete);
          }
        }

        setUploadingGallery(true);
        const folder = `food/${foodId}`;
        
        for (const media of foodGalleryMedia) {
          try {
            let mediaUrl = media.media_url;
            
            if (media.file) {
              const uploadResult = await StorageService.uploadFile(media.file, folder);
              if (uploadResult.success && uploadResult.url) {
                mediaUrl = uploadResult.url;
              }
            }
            
            const mediaData: any = {
              food_id: foodId,
              media_type: 'gallery',
              media_url: mediaUrl || '',
              alt_text: media.alt_text || null,
              position: media.position || 0,
              is_primary: false,
            };

            if (media.media_id) {
              await supabase
                .from('heritage_foodmedia')
                .update(mediaData)
                .eq('media_id', media.media_id);
            } else {
              await supabase
                .from('heritage_foodmedia')
                .insert(mediaData);
            }
          } catch (mediaErr) {
            console.error('Error during media upsert:', mediaErr);
          }
        }
        
        setUploadingGallery(false);
      }

      // Save food hours
      if (foodHours.length > 0) {
        const { data: currentHours } = await supabase
          .from('heritage_foodhours')
          .select('hours_id')
          .eq('food_id', foodId);

        const currentHoursIds = (currentHours || []).map((h: any) => h.hours_id);
        const newHoursIds = foodHours.filter(h => h.hours_id).map(h => h.hours_id!);
        
        const hoursToDelete = currentHoursIds.filter((id: number) => !newHoursIds.includes(id));
        if (hoursToDelete.length > 0) {
          await supabase
            .from('heritage_foodhours')
            .delete()
            .in('hours_id', hoursToDelete);
        }

        for (const hour of foodHours) {
          // Map day_of_week: 7 (Sunday in UI) -> 0 (Sunday in DB), others stay the same
          const dayOfWeek = hour.day_of_week === 7 ? 0 : hour.day_of_week;
          const hourData: any = {
            food_id: foodId,
            day_of_week: dayOfWeek,
            is_open: hour.is_open,
            open_time: hour.open_time,
            close_time: hour.close_time,
            special_notes: hour.special_notes || null,
          };

          if (hour.hours_id) {
            await supabase
              .from('heritage_foodhours')
              .update(hourData)
              .eq('hours_id', hour.hours_id);
          } else {
            await supabase
              .from('heritage_foodhours')
              .insert(hourData);
          }
        }
      }

      // Save food tag mappings
      const { data: currentTagMappings } = await supabase
        .from('heritage_food_tag_mapping')
        .select('tag_id')
        .eq('food_id', foodId);

      const currentTagIds = (currentTagMappings || []).map((m: any) => m.tag_id);
      const newTagIds = foodTags.map(t => t.tag_id);

      const tagsToRemove = currentTagIds.filter((id: number) => !newTagIds.includes(id));
      if (tagsToRemove.length > 0) {
        await supabase
          .from('heritage_food_tag_mapping')
          .delete()
          .eq('food_id', foodId)
          .in('tag_id', tagsToRemove);
      }

      const tagsToAdd = newTagIds.filter((id: number) => !currentTagIds.includes(id));
      if (tagsToAdd.length > 0) {
        const mappingRows = tagsToAdd.map((tagId: number) => ({
          food_id: foodId,
          tag_id: tagId,
        }));
        await supabase
          .from('heritage_food_tag_mapping')
          .insert(mappingRows);
      }

      // Save tag translations
      for (const tag of foodTags) {
        if (foodTagTranslations[tag.tag_id]) {
          const tagTrans = foodTagTranslations[tag.tag_id];
          for (const lang of LANGUAGES) {
            if (lang.code !== 'en' && tagTrans[lang.code]) {
              try {
                await supabase
                  .from('heritage_foodtagtranslation')
                  .upsert({
                    tag_id: tag.tag_id,
                    language_code: lang.code.toUpperCase(),
                    tag_name: tagTrans[lang.code],
                  }, {
                    onConflict: 'tag_id,language_code',
                  });
              } catch (err) {
                console.error(`Error saving tag translation for ${lang.code}:`, err);
              }
            }
          }
        }
      }

      // Save meal type mappings with guest count and times
      const { data: currentMealTypeMappings } = await supabase
        .from('heritage_food_meal_type_mapping')
        .select('meal_type_id, number_of_guests, start_time, end_time')
        .eq('food_id', foodId);

      const currentMealTypeIds = (currentMealTypeMappings || []).map((m: any) => m.meal_type_id);
      const newMealTypeIds = Array.from(selectedMealTypeIds);

      // Delete removed meal types
      const mealTypesToRemove = currentMealTypeIds.filter((id: number) => !newMealTypeIds.includes(id));
      if (mealTypesToRemove.length > 0) {
        await supabase
          .from('heritage_food_meal_type_mapping')
          .delete()
          .eq('food_id', foodId)
          .in('meal_type_id', mealTypesToRemove);
      }

      // Upsert all selected meal type mappings
      for (const mealTypeId of newMealTypeIds) {
        const mapping = mealTypeMappings[mealTypeId] || {
          meal_type_id: mealTypeId,
          number_of_guests: null,
          start_time: null,
          end_time: null,
        };

        await supabase
          .from('heritage_food_meal_type_mapping')
          .upsert({
            food_id: foodId,
            meal_type_id: mealTypeId,
            number_of_guests: mapping.number_of_guests || null,
            start_time: mapping.start_time || null,
            end_time: mapping.end_time || null,
          }, {
            onConflict: 'food_id,meal_type_id',
          });
      }

      // Refresh data
      const refreshedData = await fetchFoodDetails(foodId);
      setFoodData(refreshedData);
      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving food changes:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {foodData?.food?.food_name || 'Food Details'}
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
                <IconButton onClick={handleSaveFoodChanges} color="success" disabled={saving}>
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
        ) : foodData ? (
          <Stack spacing={3}>
            {/* Language Tabs */}
            <Box>
              <Tabs value={currentLanguageTab} onChange={(_, value) => setCurrentLanguageTab(value as LanguageCode)}>
                {LANGUAGES.map((lang) => (
                  <Tab key={lang.code} label={lang.label} value={lang.code} />
                ))}
              </Tabs>
            </Box>

            {/* Food Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Food Information {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
              </Typography>
              <Grid container spacing={2}>
                {FOOD_TRANSLATABLE_FIELDS.map((field) => {
                  const label = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                  
                  let currentValue: any = '';
                  if (editMode) {
                    if (currentLanguageTab === 'en') {
                      currentValue = editedFoodDetails[field] || '';
                    } else {
                      currentValue = translations[field]?.[currentLanguageTab] || '';
                    }
                  } else {
                    if (currentLanguageTab === 'en') {
                      currentValue = foodData?.food?.[field] || '';
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
                              setEditedFoodDetails(prev => ({ ...prev, [field]: newVal }));
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

                {/* Non-translatable fields */}
                {editMode && (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Country"
                        value={editedFoodDetails.country || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, country: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Postal Code"
                        value={editedFoodDetails.postal_code || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, postal_code: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Latitude"
                        type="number"
                        value={editedFoodDetails.latitude || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Longitude"
                        type="number"
                        value={editedFoodDetails.longitude || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Average Cost for Two"
                        type="number"
                        value={editedFoodDetails.avg_cost_for_two || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, avg_cost_for_two: parseFloat(e.target.value) || null }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Currency"
                        value={editedFoodDetails.currency || 'INR'}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, currency: e.target.value }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={editedFoodDetails.status || 'pending'}
                          label="Status"
                          onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, status: e.target.value }))}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="published">Published</MenuItem>
                          <MenuItem value="draft">Draft</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Establish Year"
                        type="number"
                        value={editedFoodDetails.establish_year || ''}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, establish_year: parseInt(e.target.value) || null }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Priority Level"
                        type="number"
                        value={editedFoodDetails.priority_level || 0}
                        onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, priority_level: parseInt(e.target.value) || 0 }))}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Veg Option</InputLabel>
                        <Select
                          value={editedFoodDetails.veg_only ? 'yes' : 'no'}
                          label="Veg Option"
                          onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, veg_only: e.target.value === 'yes' }))}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Is Active</InputLabel>
                        <Select
                          value={editedFoodDetails.is_active ? 'yes' : 'no'}
                          label="Is Active"
                          onChange={(e) => setEditedFoodDetails(prev => ({ ...prev, is_active: e.target.value === 'yes' }))}
                        >
                          <MenuItem value="yes">Yes</MenuItem>
                          <MenuItem value="no">No</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
            </Box>

            {/* Hero Images Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Hero Images ({foodHeroImages.length})
                </Typography>
                {editMode && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="food-hero-image-upload"
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          const newHeroItems = files.map((file) => {
                            const previewUrl = URL.createObjectURL(file);
                            return {
                              media_id: undefined,
                              media_type: 'hero' as const,
                              media_url: previewUrl,
                              alt_text: '',
                              position: foodHeroImages.length,
                              is_primary: false,
                              file: file,
                            };
                          });
                          setFoodHeroImages([...foodHeroImages, ...newHeroItems]);
                        }
                      }}
                    />
                    <label htmlFor="food-hero-image-upload">
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingHero}
                      >
                        {uploadingHero ? 'Uploading...' : 'Add Hero Images'}
                      </Button>
                    </label>
                  </>
                )}
              </Stack>
              {foodHeroImages.length > 0 ? (
                <>
                  {uploadingHero && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption" color="text.secondary">
                        Uploading hero images...
                      </Typography>
                    </Box>
                  )}
                  <Grid container spacing={2}>
                    {foodHeroImages.map((heroMedia, index) => (
                      <Grid item xs={6} sm={4} md={3} key={heroMedia.media_id || `hero-${index}`}>
                        <Card variant="outlined">
                          <CardMedia
                            component="img"
                            height="150"
                            image={heroMedia.media_url}
                            alt={heroMedia.alt_text || `Hero image ${index + 1}`}
                            sx={{ objectFit: 'cover' }}
                          />
                          {editMode && (
                            <Box sx={{ p: 1 }}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Alt Text"
                                value={heroMedia.alt_text || ''}
                                onChange={(e) => {
                                  const newHeroImages = [...foodHeroImages];
                                  newHeroImages[index] = { ...newHeroImages[index], alt_text: e.target.value };
                                  setFoodHeroImages(newHeroImages);
                                }}
                                sx={{ mb: 1 }}
                              />
                              <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                  setConfirmDialog({
                                    open: true,
                                    message: 'Are you sure you want to remove this hero image?',
                                    onConfirm: () => {
                                      setConfirmDialog({ open: false, message: '', onConfirm: null });
                                      const newHeroImages = foodHeroImages.filter((_, i) => i !== index);
                                      setFoodHeroImages(newHeroImages);
                                    },
                                  });
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          )}
                          {!editMode && heroMedia.alt_text && (
                            <Box sx={{ p: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {heroMedia.alt_text}
                              </Typography>
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No hero images added yet
                </Typography>
              )}
            </Box>

            {/* Gallery Images Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Gallery Images ({foodGalleryMedia.length})
                </Typography>
                {editMode && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="food-gallery-image-upload"
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
                              position: foodGalleryMedia.length + idx,
                              is_primary: false,
                              file: file,
                            };
                          });
                          setFoodGalleryMedia([...foodGalleryMedia, ...newMediaItems]);
                        }
                      }}
                    />
                    <label htmlFor="food-gallery-image-upload">
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
                {foodGalleryMedia.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No gallery images added yet
                    </Typography>
                  </Grid>
                ) : (
                  foodGalleryMedia.map((media, index) => (
                    <Grid item xs={12} sm={6} md={4} key={media.media_id || index}>
                      <Card variant="outlined" sx={{ position: 'relative', height: '100%' }}>
                        {editMode && (
                          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={`food-gallery-edit-${index}`}
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const previewUrl = URL.createObjectURL(file);
                                  const newMedia = [...foodGalleryMedia];
                                  newMedia[index] = { ...newMedia[index], media_url: previewUrl, file: file };
                                  setFoodGalleryMedia(newMedia);
                                }
                              }}
                            />
                            <label htmlFor={`food-gallery-edit-${index}`}>
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
                                    const newMedia = foodGalleryMedia.filter((_, i) => i !== index);
                                    setFoodGalleryMedia(newMedia);
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
                            alt={media.alt_text || 'Food gallery image'}
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
                                const newMedia = [...foodGalleryMedia];
                                newMedia[index] = { ...newMedia[index], alt_text: e.target.value };
                                setFoodGalleryMedia(newMedia);
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

            {/* Food Hours Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Food Hours
              </Typography>
              <Stack spacing={2}>
                {foodHours.map((hour, index) => {
                  const dayInfo = DAYS_OF_WEEK.find(d => d.value === hour.day_of_week);
                  return (
                    <Card key={hour.hours_id || index} variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={2}>
                          <Typography variant="body2" fontWeight={600}>
                            {dayInfo?.label}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          {editMode ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Status</InputLabel>
                              <Select
                                value={hour.is_open ? 'open' : 'closed'}
                                label="Status"
                                onChange={(e) => {
                                  const newHours = [...foodHours];
                                  newHours[index] = { ...newHours[index], is_open: e.target.value === 'open' };
                                  setFoodHours(newHours);
                                }}
                              >
                                <MenuItem value="open">Open</MenuItem>
                                <MenuItem value="closed">Closed</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip label={hour.is_open ? 'Open' : 'Closed'} color={hour.is_open ? 'success' : 'default'} size="small" />
                          )}
                        </Grid>
                        {hour.is_open && (
                          <>
                            <Grid item xs={6} md={2}>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Open Time"
                                  type="time"
                                  value={hour.open_time || ''}
                                  onChange={(e) => {
                                    const newHours = [...foodHours];
                                    newHours[index] = { ...newHours[index], open_time: e.target.value || null };
                                    setFoodHours(newHours);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                />
                              ) : (
                                <Typography variant="body2">{hour.open_time || '—'}</Typography>
                              )}
                            </Grid>
                            <Grid item xs={6} md={2}>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Close Time"
                                  type="time"
                                  value={hour.close_time || ''}
                                  onChange={(e) => {
                                    const newHours = [...foodHours];
                                    newHours[index] = { ...newHours[index], close_time: e.target.value || null };
                                    setFoodHours(newHours);
                                  }}
                                  InputLabelProps={{ shrink: true }}
                                />
                              ) : (
                                <Typography variant="body2">{hour.close_time || '—'}</Typography>
                              )}
                            </Grid>
                            <Grid item xs={12} md={4}>
                              {editMode ? (
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Special Notes"
                                  value={hour.special_notes || ''}
                                  onChange={(e) => {
                                    const newHours = [...foodHours];
                                    newHours[index] = { ...newHours[index], special_notes: e.target.value || null };
                                    setFoodHours(newHours);
                                  }}
                                />
                              ) : (
                                <Typography variant="body2">{hour.special_notes || '—'}</Typography>
                              )}
                            </Grid>
                          </>
                        )}
                      </Grid>
                    </Card>
                  );
                })}
              </Stack>
            </Box>

            {/* Food Tags Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Food Tags ({foodTags.length})
                </Typography>
                {editMode && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleOpenTagDialog}
                  >
                    Add Tag
                  </Button>
                )}
              </Stack>
              {foodTags.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No tags added yet
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {foodTags.map((tag) => {
                    const tagName = currentLanguageTab === 'en'
                      ? tag.tag_name
                      : foodTagTranslations[tag.tag_id]?.[currentLanguageTab] || tag.tag_name;

                    // Get Material Icon component based on tag_icon name
                    const getIconComponent = (iconName: string) => {
                      if (!iconName) return null;
                      
                      // Map common icon names to Material Icons component names
                      const iconNameMap: Record<string, string> = {
                        'whatshot': 'Whatshot',
                        'star': 'Star',
                        'family_restroom': 'FamilyRestroom',
                        'ramen_dining': 'RamenDining',
                        'spa': 'Spa',
                        'nightlife': 'Nightlife',
                        'thumb_up': 'ThumbUp',
                        'icecream': 'Icecream',
                        'local_parking': 'LocalParking',
                        'wifi': 'Wifi',
                        'restaurant': 'Restaurant',
                        'local_dining': 'LocalDining',
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
                      <Grid item xs={12} sm={6} md={4} key={tag.tag_id}>
                        <Card variant="outlined" sx={{ p: 1.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {tag.tag_icon && getIconComponent(tag.tag_icon)}
                            {editMode && currentLanguageTab !== 'en' ? (
                              <TextField
                                fullWidth
                                size="small"
                                value={foodTagTranslations[tag.tag_id]?.[currentLanguageTab] || ''}
                                onChange={(e) => {
                                  setFoodTagTranslations(prev => {
                                    const newTrans = { ...prev };
                                    if (!newTrans[tag.tag_id]) {
                                      newTrans[tag.tag_id] = {
                                        en: tag.tag_name,
                                        hi: '',
                                        gu: '',
                                        ja: '',
                                        es: '',
                                        fr: '',
                                      };
                                    }
                                    newTrans[tag.tag_id][currentLanguageTab] = e.target.value;
                                    return newTrans;
                                  });
                                }}
                                label={`Tag Name (${LANGUAGES.find(l => l.code === currentLanguageTab)?.label})`}
                                InputProps={{
                                  endAdornment: editMode ? (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => {
                                          setConfirmDialog({
                                            open: true,
                                            message: `Are you sure you want to remove "${tag.tag_name}"?`,
                                            onConfirm: () => {
                                              setConfirmDialog({ open: false, message: '', onConfirm: null });
                                              const newTags = foodTags.filter(t => t.tag_id !== tag.tag_id);
                                              setFoodTags(newTags);
                                              const newTranslations = { ...foodTagTranslations };
                                              delete newTranslations[tag.tag_id];
                                              setFoodTagTranslations(newTranslations);
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
                                {tagName}
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

            {/* Meal Types Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Meal Types ({selectedMealTypeIds.size})
              </Typography>
              {mealTypes.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  No meal types available
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {mealTypes.map((mealType) => {
                    const isSelected = selectedMealTypeIds.has(mealType.meal_type_id);
                    const mapping = mealTypeMappings[mealType.meal_type_id] || {
                      meal_type_id: mealType.meal_type_id,
                      number_of_guests: null,
                      start_time: null,
                      end_time: null,
                    };

                    return (
                      <Grid item xs={12} key={mealType.meal_type_id}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            border: isSelected ? 2 : 1,
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            bgcolor: isSelected ? 'action.selected' : 'background.paper',
                          }}
                        >
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              {editMode && (
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => {
                                    setSelectedMealTypeIds(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(mealType.meal_type_id)) {
                                        newSet.delete(mealType.meal_type_id);
                                        // Remove mapping when deselected
                                        setMealTypeMappings(prev => {
                                          const newMappings = { ...prev };
                                          delete newMappings[mealType.meal_type_id];
                                          return newMappings;
                                        });
                                      } else {
                                        newSet.add(mealType.meal_type_id);
                                        // Initialize mapping when selected
                                        setMealTypeMappings(prev => ({
                                          ...prev,
                                          [mealType.meal_type_id]: {
                                            meal_type_id: mealType.meal_type_id,
                                            number_of_guests: null,
                                            start_time: null,
                                            end_time: null,
                                          },
                                        }));
                                      }
                                      return newSet;
                                    });
                                  }}
                                  size="small"
                                />
                              )}
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, flex: 1 }}>
                                {currentLanguageTab === 'en'
                                  ? mealType.meal_type_name
                                  : mealTypeTranslations[mealType.meal_type_id]?.[currentLanguageTab] || mealType.meal_type_name}
                              </Typography>
                            </Stack>

                            {isSelected && editMode && (
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6} md={3}>
                                  <TextField
                                    fullWidth
                                    label="Maximum Guests"
                                    type="number"
                                    size="small"
                                    value={mapping.number_of_guests || ''}
                                    onChange={(e) => {
                                      setMealTypeMappings(prev => ({
                                        ...prev,
                                        [mealType.meal_type_id]: {
                                          ...prev[mealType.meal_type_id],
                                          number_of_guests: e.target.value ? parseInt(e.target.value, 10) : null,
                                        },
                                      }));
                                    }}
                                    inputProps={{ min: 1 }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4.5}>
                                  <TextField
                                    fullWidth
                                    label="Start Time"
                                    type="time"
                                    size="small"
                                    value={mapping.start_time ? mapping.start_time.substring(0, 5) : ''}
                                    onChange={(e) => {
                                      setMealTypeMappings(prev => ({
                                        ...prev,
                                        [mealType.meal_type_id]: {
                                          ...prev[mealType.meal_type_id],
                                          start_time: e.target.value ? `${e.target.value}:00` : null,
                                        },
                                      }));
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4.5}>
                                  <TextField
                                    fullWidth
                                    label="End Time"
                                    type="time"
                                    size="small"
                                    value={mapping.end_time ? mapping.end_time.substring(0, 5) : ''}
                                    onChange={(e) => {
                                      setMealTypeMappings(prev => ({
                                        ...prev,
                                        [mealType.meal_type_id]: {
                                          ...prev[mealType.meal_type_id],
                                          end_time: e.target.value ? `${e.target.value}:00` : null,
                                        },
                                      }));
                                    }}
                                    InputLabelProps={{ shrink: true }}
                                  />
                                </Grid>
                              </Grid>
                            )}

                            {isSelected && !editMode && (mapping.number_of_guests || mapping.start_time || mapping.end_time) && (
                              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                                {mapping.number_of_guests && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Max Guests:</strong> {mapping.number_of_guests}
                                  </Typography>
                                )}
                                {mapping.start_time && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>Start:</strong> {mapping.start_time.substring(0, 5)}
                                  </Typography>
                                )}
                                {mapping.end_time && (
                                  <Typography variant="body2" color="text.secondary">
                                    <strong>End:</strong> {mapping.end_time.substring(0, 5)}
                                  </Typography>
                                )}
                              </Stack>
                            )}
                          </Stack>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No food data available
          </Typography>
        )}
      </DialogContent>

      {/* Tag Selection Dialog */}
      <Dialog open={tagDialogOpen} onClose={handleCloseTagDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Select Food Tags</Typography>
          <IconButton onClick={handleCloseTagDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select tags to add to this food item
          </Typography>
          <Grid container spacing={2}>
            {allAvailableTags.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              </Grid>
            ) : (
              allAvailableTags.map((tag) => {
                const isSelected = selectedTagIds.has(tag.tag_id);
                
                // Get Material Icon component based on tag_icon name
                const getIconComponent = (iconName: string) => {
                  if (!iconName) return null;
                  
                  // Map common icon names to Material Icons component names
                  const iconNameMap: Record<string, string> = {
                    'whatshot': 'Whatshot',
                    'star': 'Star',
                    'family_restroom': 'FamilyRestroom',
                    'ramen_dining': 'RamenDining',
                    'spa': 'Spa',
                    'nightlife': 'Nightlife',
                    'thumb_up': 'ThumbUp',
                    'icecream': 'Icecream',
                    'local_parking': 'LocalParking',
                    'wifi': 'Wifi',
                    'restaurant': 'Restaurant',
                    'local_dining': 'LocalDining',
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
                  <Grid item xs={12} sm={6} md={4} key={tag.tag_id}>
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
                      onClick={() => handleToggleTagSelection(tag.tag_id)}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleToggleTagSelection(tag.tag_id)}
                          onClick={(e) => e.stopPropagation()}
                          size="small"
                        />
                        {tag.tag_icon && getIconComponent(tag.tag_icon)}
                        <Typography variant="body2" sx={{ flex: 1 }}>
                          {tag.tag_name}
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
          <Button onClick={handleCloseTagDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmTagSelection}
            variant="contained"
            color="primary"
            disabled={selectedTagIds.size === 0}
          >
            Add Selected ({selectedTagIds.size})
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

export default FoodDetailsDialog;




