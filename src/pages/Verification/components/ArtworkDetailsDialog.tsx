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
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { supabase } from '@/config/supabase';
import { StorageService } from '@/services/storage.service';
import { TranslationService } from '@/services/translation.service';

type LanguageCode = 'en' | 'hi' | 'gu' | 'ja' | 'es' | 'fr';

const LANGUAGES = [
  { code: 'en' as LanguageCode, label: 'English', flag: '🇬🇧' },
  { code: 'hi' as LanguageCode, label: 'Hindi', flag: '🇮🇳' },
  { code: 'gu' as LanguageCode, label: 'Gujarati', flag: '🇮🇳' },
  { code: 'ja' as LanguageCode, label: 'Japanese', flag: '🇯🇵' },
  { code: 'es' as LanguageCode, label: 'Spanish', flag: '🇪🇸' },
  { code: 'fr' as LanguageCode, label: 'French', flag: '🇫🇷' },
];

const ARTWORK_TRANSLATABLE_FIELDS = [
  'artwork_name',
  'short_description',
  'full_description',
];

interface ArtworkDetailsDialogProps {
  open: boolean;
  artworkId: number | null;
  onClose: () => void;
}

interface ArtworkMedia {
  media_id?: number;
  media_url: string;
  alt_text?: string;
  position?: number;
  is_primary?: boolean;
  file?: File;
}

const ArtworkDetailsDialog: React.FC<ArtworkDetailsDialogProps> = ({ open, artworkId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLanguageTab, setCurrentLanguageTab] = useState<LanguageCode>('en');
  const [artworkData, setArtworkData] = useState<any>(null);
  const [editedArtworkDetails, setEditedArtworkDetails] = useState<Record<string, any>>({});
  const [translations, setTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<Record<string, NodeJS.Timeout>>({});
  
  // Artwork media
  const [artworkMedia, setArtworkMedia] = useState<ArtworkMedia[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  
  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; message: string; onConfirm: (() => void) | null }>({
    open: false,
    message: '',
    onConfirm: null,
  });

  // Fetch artwork details
  const fetchArtworkDetails = async (id: number) => {
    try {
      // Fetch artwork basic info
      const { data: artworkData, error: artworkError } = await supabase
        .from('heritage_artwork')
        .select('*')
        .eq('artwork_id', id)
        .single();

      if (artworkError) throw artworkError;

      // Fetch translations
      const { data: translationsData } = await supabase
        .from('heritage_artworktranslation')
        .select('*')
        .eq('artwork_id', id);

      // Fetch media
      const { data: mediaData } = await supabase
        .from('heritage_artworkmedia')
        .select('media_id, artwork_id, media_url, alt_text, position, is_primary, uploaded_at')
        .eq('artwork_id', id)
        .order('position', { ascending: true });

      return {
        artwork: artworkData,
        translations: translationsData || [],
        media: mediaData || [],
      };
    } catch (error) {
      console.error('Error fetching artwork details:', error);
      throw error;
    }
  };

  // Load artwork translations
  const loadArtworkTranslations = async (id: number) => {
    try {
      const { data, error } = await supabase
        .from('heritage_artworktranslation')
        .select('*')
        .eq('artwork_id', id);

      if (error) throw error;

      const loadedTranslations: Record<string, Record<LanguageCode, string>> = {};
      ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
        loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
      });

      if (data) {
        data.forEach((trans: any) => {
          const langCode = String(trans.language_code || '').toLowerCase() as LanguageCode;
          if (langCode && LANGUAGES.some(l => l.code === langCode)) {
            ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
              if (trans[field] !== null && trans[field] !== undefined) {
                loadedTranslations[field][langCode] = String(trans[field] || '');
              }
            });
          }
        });
      }

      return loadedTranslations;
    } catch (error) {
      console.error('Error loading artwork translations:', error);
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
          newTranslations[field][sourceLanguage] = text;
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
    }, 1000); // 1 second debounce
  };

  // Auto-translate alt_text for media
  const autoTranslateAltText = async (text: string, mediaIndex: number) => {
    if (!text || !text.trim()) return;

    const timerKey = `alt_text_${mediaIndex}_${currentLanguageTab}`;
    if (translationTimerRef.current[timerKey]) {
      clearTimeout(translationTimerRef.current[timerKey]);
    }

    translationTimerRef.current[timerKey] = setTimeout(async () => {
      try {
        const sourceLanguage = currentLanguageTab;
        const targetLanguages: LanguageCode[] = LANGUAGES.filter(l => l.code !== sourceLanguage).map(l => l.code);
        
        // For alt_text, we'll store translations in a separate state structure
        // For simplicity, we'll just update the current media item's alt_text
        // and let the user manually translate if needed for other languages
        // (since alt_text is per-media, not per-artwork)
      } catch (error) {
        console.error('Error in alt_text translation:', error);
      }
    }, 1000);
  };

  // Load artwork data when dialog opens
  useEffect(() => {
    if (open && artworkId) {
      setLoading(true);
      fetchArtworkDetails(artworkId)
        .then((data) => {
          setArtworkData(data);
          
          // Initialize edited details
          if (data.artwork) {
            setEditedArtworkDetails({
              artwork_name: data.artwork.artwork_name || '',
              short_description: data.artwork.short_description || '',
              full_description: data.artwork.full_description || '',
              base_price: data.artwork.base_price || 0,
              currency: data.artwork.currency || 'INR',
              stock_quantity: data.artwork.stock_quantity || 0,
              is_featured: data.artwork.is_featured || false,
              is_active: data.artwork.is_active !== false,
              category: data.artwork.category || '',
              tax_percentage: data.artwork.tax_percentage || 0,
              artisan_id: data.artwork.artisan_id || null,
            });
          }

          // Load translations
          loadArtworkTranslations(artworkId).then((loadedTranslations) => {
            // Set English values from main artwork data
            ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
              if (!loadedTranslations[field]) {
                loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
              }
              if (data.artwork[field] !== null && data.artwork[field] !== undefined) {
                loadedTranslations[field].en = String(data.artwork[field] || '');
              }
            });
            setTranslations(loadedTranslations);
          });

          // Load media
          if (data.media) {
            const normalizedMedia = data.media.map((m: any) => ({
              media_id: m.media_id,
              media_url: m.media_url || '',
              alt_text: m.alt_text || '',
              position: m.position || 0,
              is_primary: m.is_primary || false,
            }));
            setArtworkMedia(normalizedMedia);
          }
        })
        .catch((error) => {
          console.error('Error loading artwork:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (!open) {
      // Reset state when dialog closes
      setArtworkData(null);
      setEditedArtworkDetails({});
      setTranslations({});
      setArtworkMedia([]);
      setEditMode(false);
      setCurrentLanguageTab('en');
    }
  }, [open, artworkId]);

  // Save artwork changes
  const handleSave = async () => {
    if (!artworkId || !artworkData) return;
    
    setSaving(true);
    try {
      // Update base artwork fields if changed (English only)
      const baseFieldsToUpdate: Record<string, any> = {};
      if (currentLanguageTab === 'en') {
        ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
          if (editedArtworkDetails[field] !== undefined) {
            baseFieldsToUpdate[field] = editedArtworkDetails[field];
          }
        });
      }

      // Update non-translatable fields
      if (editedArtworkDetails.base_price !== undefined) {
        baseFieldsToUpdate.base_price = editedArtworkDetails.base_price;
      }
      if (editedArtworkDetails.currency !== undefined) {
        baseFieldsToUpdate.currency = editedArtworkDetails.currency;
      }
      if (editedArtworkDetails.stock_quantity !== undefined) {
        baseFieldsToUpdate.stock_quantity = editedArtworkDetails.stock_quantity;
      }
      if (editedArtworkDetails.is_featured !== undefined) {
        baseFieldsToUpdate.is_featured = editedArtworkDetails.is_featured;
      }
      if (editedArtworkDetails.is_active !== undefined) {
        baseFieldsToUpdate.is_active = editedArtworkDetails.is_active;
      }
      if (editedArtworkDetails.category !== undefined) {
        baseFieldsToUpdate.category = editedArtworkDetails.category;
      }
      if (editedArtworkDetails.tax_percentage !== undefined) {
        baseFieldsToUpdate.tax_percentage = editedArtworkDetails.tax_percentage;
      }

      // Update base artwork record
      if (Object.keys(baseFieldsToUpdate).length > 0) {
        const { error: updateError } = await supabase
          .from('heritage_artwork')
          .update(baseFieldsToUpdate)
          .eq('artwork_id', artworkId);

        if (updateError) {
          throw new Error(`Failed to update artwork: ${updateError.message}`);
        }
      }

      // Save translations for all languages
      const translationPayloads: any[] = LANGUAGES.filter(l => l.code !== 'en').map(lang => {
        const langCode = lang.code.toUpperCase();
        const row: any = {
          artwork_id: artworkId,
          language_code: langCode,
        };
        let hasData = false;

        ARTWORK_TRANSLATABLE_FIELDS.forEach((field) => {
          const val = translations[field]?.[lang.code];
          if (val && String(val).trim()) {
            row[field] = String(val).trim();
            hasData = true;
          }
        });

        return hasData ? row : null;
      }).filter(Boolean) as any[];

      // Also save English translations
      const enTranslation: any = {
        artwork_id: artworkId,
        language_code: 'EN',
      };
      let enHasData = false;
      ARTWORK_TRANSLATABLE_FIELDS.forEach((field) => {
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
            const { artwork_id, language_code, ...fields } = payload;
            const { error: upsertErr } = await supabase
              .from('heritage_artworktranslation')
              .upsert(
                {
                  artwork_id,
                  language_code,
                  ...fields,
                },
                {
                  onConflict: 'artwork_id,language_code',
                }
              );

            if (upsertErr) {
              console.error('Error saving artwork translation row:', upsertErr);
            }
          } catch (rowErr) {
            console.error('Error during artwork translation upsert:', rowErr);
          }
        }
      }

      // Save media
      setUploadingMedia(true);
      const artisanId = editedArtworkDetails.artisan_id || artworkData.artwork.artisan_id;
      const folder = artisanId ? `artisanartwork/${artisanId}` : 'artisanartwork';

      // Get current media IDs
      const existingMediaIds = artworkMedia
        .filter(m => m.media_id)
        .map(m => m.media_id);

      // Get current media from database
      const { data: currentMedia } = await supabase
        .from('heritage_artworkmedia')
        .select('media_id, media_url')
        .eq('artwork_id', artworkId);

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
            .from('heritage_artworkmedia')
            .delete()
            .in('media_id', mediaIdsToDelete);

          if (deleteError) {
            console.error('Error deleting removed media from database:', deleteError);
          }
        }
      }

      // Upload and upsert all media items
      for (let index = 0; index < artworkMedia.length; index++) {
        const media = artworkMedia[index];
        try {
          let mediaUrl = media.media_url;
          
          // Upload file if provided
          if (media.file) {
            const uploadResult = await StorageService.uploadFile(media.file, folder);
            
            if (!uploadResult.success || !uploadResult.url) {
              console.error(`Failed to upload media: ${uploadResult.error}`);
              continue;
            }
            
            mediaUrl = uploadResult.url;
          }
          
          // Skip if no media URL (after upload)
          if (!mediaUrl) {
            console.warn(`Skipping media item at index ${index} - no media URL`);
            continue;
          }
          
          // Skip blob URLs (preview URLs) - these should only exist temporarily before upload
          if (mediaUrl.startsWith('blob:')) {
            console.warn(`Skipping media item at index ${index} - blob URL detected, file may not have uploaded`);
            continue;
          }
          
          const mediaData: any = {
            artwork_id: artworkId,
            media_url: mediaUrl,
            alt_text: media.alt_text || null,
            position: media.position || index,
            is_primary: media.is_primary || false,
          };

          if (media.media_id) {
            // Update existing by ID
            const { error: updateError } = await supabase
              .from('heritage_artworkmedia')
              .update(mediaData)
              .eq('media_id', media.media_id);

            if (updateError) {
              console.error('Error updating media:', updateError);
            }
          } else {
            // Check if media with this URL already exists for this artwork
            // This prevents duplicates when the same image is saved multiple times
            const { data: existingMedia, error: checkError } = await supabase
              .from('heritage_artworkmedia')
              .select('media_id')
              .eq('artwork_id', artworkId)
              .eq('media_url', mediaUrl)
              .maybeSingle();

            if (checkError && checkError.code !== 'PGRST116') {
              // PGRST116 is "not found" which is fine, other errors are not
              console.error('Error checking for existing media:', checkError);
            }

            if (existingMedia?.media_id) {
              // Update existing record found by URL instead of creating duplicate
              const { error: updateError } = await supabase
                .from('heritage_artworkmedia')
                .update(mediaData)
                .eq('media_id', existingMedia.media_id);

              if (updateError) {
                console.error('Error updating existing media by URL:', updateError);
              } else {
                // Update the local state with the correct media_id to prevent future duplicates
                const updatedMedia = [...artworkMedia];
                updatedMedia[index] = { ...updatedMedia[index], media_id: existingMedia.media_id };
                setArtworkMedia(updatedMedia);
              }
            } else {
              // Insert new only if it doesn't exist
              const { data: insertedMedia, error: insertError } = await supabase
                .from('heritage_artworkmedia')
                .insert(mediaData)
                .select('media_id')
                .single();

              if (insertError) {
                console.error('Error inserting media:', insertError);
              } else if (insertedMedia) {
                // Update the local state with the new media_id
                const updatedMedia = [...artworkMedia];
                updatedMedia[index] = { ...updatedMedia[index], media_id: insertedMedia.media_id };
                setArtworkMedia(updatedMedia);
              }
            }
          }
        } catch (mediaErr) {
          console.error('Error during media upsert:', mediaErr);
        }
      }
      
      setUploadingMedia(false);

      // Refresh artwork details
      const refreshedData = await fetchArtworkDetails(artworkId);
      setArtworkData(refreshedData);
      
      // Reload translations
      const refreshedTranslations = await loadArtworkTranslations(artworkId);
      
      // Update English values from refreshed artwork data
      if (refreshedData?.artwork) {
        ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
          if (!refreshedTranslations[field]) {
            refreshedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
          }
          if (refreshedData.artwork[field] !== null && refreshedData.artwork[field] !== undefined) {
            refreshedTranslations[field].en = String(refreshedData.artwork[field] || '');
          }
        });
      }
      
      setTranslations(refreshedTranslations);

      // Update edited artwork details
      if (refreshedData?.artwork) {
        setEditedArtworkDetails({
          artwork_name: refreshedData.artwork.artwork_name || '',
          short_description: refreshedData.artwork.short_description || '',
          full_description: refreshedData.artwork.full_description || '',
          base_price: refreshedData.artwork.base_price || 0,
          currency: refreshedData.artwork.currency || 'INR',
          stock_quantity: refreshedData.artwork.stock_quantity || 0,
          is_featured: refreshedData.artwork.is_featured || false,
          is_active: refreshedData.artwork.is_active !== false,
          category: refreshedData.artwork.category || '',
          tax_percentage: refreshedData.artwork.tax_percentage || 0,
          artisan_id: refreshedData.artwork.artisan_id || null,
        });
      }

      // Reload media
      if (refreshedData.media) {
        const normalizedMedia = refreshedData.media.map((m: any) => ({
          media_id: m.media_id,
          media_url: m.media_url || '',
          alt_text: m.alt_text || '',
          position: m.position || 0,
          is_primary: m.is_primary || false,
        }));
        setArtworkMedia(normalizedMedia);
      }

      setEditMode(false);
    } catch (error: any) {
      console.error('Error saving artwork changes:', error);
      alert(error.message || 'Failed to save artwork changes');
    } finally {
      setSaving(false);
      setUploadingMedia(false);
    }
  };

  // Handle field change
  const handleFieldChange = (key: string, value: any) => {
    if (currentLanguageTab === 'en') {
      setEditedArtworkDetails(prev => ({ ...prev, [key]: value }));
      
      // Update translation for English
      if (ARTWORK_TRANSLATABLE_FIELDS.includes(key)) {
        setTranslations(prev => ({
          ...prev,
          [key]: {
            ...(prev[key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
            en: value || '',
          },
        }));
        
        // Auto-translate from English to all other languages
        if (typeof value === 'string' && value && value.trim()) {
          autoTranslateField(value, key);
        }
      }
    } else {
      // Update translation for non-English language
      if (ARTWORK_TRANSLATABLE_FIELDS.includes(key)) {
        setTranslations(prev => ({
          ...prev,
          [key]: {
            ...(prev[key] || { en: '', hi: '', gu: '', ja: '', es: '', fr: '' }),
            [currentLanguageTab]: value || '',
          },
        }));
        
        // Auto-translate from current language to all other languages
        if (typeof value === 'string' && value && value.trim()) {
          autoTranslateField(value, key);
        }
      }
    }
  };

  // Handle media upload
  const handleMediaUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newMediaItems: ArtworkMedia[] = [];
    Array.from(files).forEach((file, idx) => {
      const previewUrl = URL.createObjectURL(file);
      newMediaItems.push({
        media_url: previewUrl,
        alt_text: '',
        position: artworkMedia.length + idx,
        is_primary: false,
        file: file,
      });
    });

    setArtworkMedia([...artworkMedia, ...newMediaItems]);
  };

  // Handle media delete
  const handleMediaDelete = (index: number) => {
    setConfirmDialog({
      open: true,
      message: 'Are you sure you want to delete this media?',
      onConfirm: () => {
        setConfirmDialog({ open: false, message: '', onConfirm: null });
        const newMedia = artworkMedia.filter((_, i) => i !== index);
        setArtworkMedia(newMedia);
      },
    });
  };

  // Get current value for translatable field
  const getTranslatableFieldValue = (field: string): string => {
    if (currentLanguageTab === 'en') {
      return editedArtworkDetails[field] || '';
    } else {
      return translations[field]?.[currentLanguageTab] || '';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {artworkData?.artwork?.artwork_name || 'Artwork Details'}
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
                <IconButton onClick={handleSave} color="success" disabled={saving}>
                  {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancel">
                <IconButton
                  onClick={() => {
                    setEditMode(false);
                    // Reload data to reset changes
                    if (artworkId) {
                      fetchArtworkDetails(artworkId).then((data) => {
                        setArtworkData(data);
                        if (data.artwork) {
                          setEditedArtworkDetails({
                            artwork_name: data.artwork.artwork_name || '',
                            short_description: data.artwork.short_description || '',
                            full_description: data.artwork.full_description || '',
                            base_price: data.artwork.base_price || 0,
                            currency: data.artwork.currency || 'INR',
                            stock_quantity: data.artwork.stock_quantity || 0,
                            is_featured: data.artwork.is_featured || false,
                            is_active: data.artwork.is_active !== false,
                            category: data.artwork.category || '',
                            tax_percentage: data.artwork.tax_percentage || 0,
                            artisan_id: data.artwork.artisan_id || null,
                          });
                        }
                        loadArtworkTranslations(artworkId).then((loadedTranslations) => {
                          if (data.artwork) {
                            ARTWORK_TRANSLATABLE_FIELDS.forEach(field => {
                              if (!loadedTranslations[field]) {
                                loadedTranslations[field] = { en: '', hi: '', gu: '', ja: '', es: '', fr: '' };
                              }
                              if (data.artwork[field] !== null && data.artwork[field] !== undefined) {
                                loadedTranslations[field].en = String(data.artwork[field] || '');
                              }
                            });
                          }
                          setTranslations(loadedTranslations);
                        });
                        if (data.media) {
                          const normalizedMedia = data.media.map((m: any) => ({
                            media_id: m.media_id,
                            media_url: m.media_url || '',
                            alt_text: m.alt_text || '',
                            position: m.position || 0,
                            is_primary: m.is_primary || false,
                          }));
                          setArtworkMedia(normalizedMedia);
                        }
                      });
                    }
                  }}
                  color="error"
                >
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
        ) : artworkData ? (
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
                  const hasTranslations = lang.code === 'en' || ARTWORK_TRANSLATABLE_FIELDS.some(field => {
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
                    ARTWORK_TRANSLATABLE_FIELDS.some(field => translatingFields.has(field));
                  
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

            {/* Artwork Basic Information */}
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Artwork Information {editMode && <Chip label="Editing" size="small" color="warning" sx={{ ml: 1 }} />}
              </Typography>
              <Grid container spacing={2}>
                {/* Artwork Name */}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Artwork Name ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={getTranslatableFieldValue('artwork_name')}
                      onChange={(e) => handleFieldChange('artwork_name', e.target.value)}
                      InputProps={{
                        endAdornment: translatingFields.has('artwork_name') ? (
                          <InputAdornment position="end">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : undefined,
                      }}
                    />
                  ) : (
                    <Typography variant="body2">
                      {getTranslatableFieldValue('artwork_name') || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Short Description */}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Short Description ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      maxRows={4}
                      value={getTranslatableFieldValue('short_description')}
                      onChange={(e) => handleFieldChange('short_description', e.target.value)}
                      InputProps={{
                        endAdornment: translatingFields.has('short_description') ? (
                          <InputAdornment position="end">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : undefined,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {getTranslatableFieldValue('short_description') || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Full Description */}
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Full Description ({LANGUAGES.find(l => l.code === currentLanguageTab)?.label})
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={4}
                      maxRows={8}
                      value={getTranslatableFieldValue('full_description')}
                      onChange={(e) => handleFieldChange('full_description', e.target.value)}
                      InputProps={{
                        endAdornment: translatingFields.has('full_description') ? (
                          <InputAdornment position="end">
                            <CircularProgress size={16} />
                          </InputAdornment>
                        ) : undefined,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {getTranslatableFieldValue('full_description') || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Base Price */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Base Price
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editedArtworkDetails.base_price || 0}
                      onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, base_price: parseFloat(e.target.value) || 0 }))}
                    />
                  ) : (
                    <Typography variant="body2">
                      {artworkData.artwork.base_price || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Currency */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Currency
                  </Typography>
                  {editMode ? (
                    <FormControl fullWidth size="small">
                      <Select
                        value={editedArtworkDetails.currency || 'INR'}
                        onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <MenuItem value="INR">INR</MenuItem>
                        <MenuItem value="USD">USD</MenuItem>
                        <MenuItem value="EUR">EUR</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <Typography variant="body2">
                      {artworkData.artwork.currency || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Stock Quantity */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Stock Quantity
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editedArtworkDetails.stock_quantity || 0}
                      onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
                    />
                  ) : (
                    <Typography variant="body2">
                      {artworkData.artwork.stock_quantity || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Category */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Category
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      value={editedArtworkDetails.category || ''}
                      onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, category: e.target.value }))}
                    />
                  ) : (
                    <Typography variant="body2">
                      {artworkData.artwork.category || '—'}
                    </Typography>
                  )}
                </Grid>

                {/* Tax Percentage */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Tax Percentage
                  </Typography>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editedArtworkDetails.tax_percentage || 0}
                      onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, tax_percentage: parseFloat(e.target.value) || 0 }))}
                    />
                  ) : (
                    <Typography variant="body2">
                      {artworkData.artwork.tax_percentage || '—'}%
                    </Typography>
                  )}
                </Grid>

                {/* Is Featured */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Featured
                  </Typography>
                  {editMode ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editedArtworkDetails.is_featured || false}
                          onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, is_featured: e.target.checked }))}
                        />
                      }
                      label={editedArtworkDetails.is_featured ? 'Yes' : 'No'}
                    />
                  ) : (
                    <Chip
                      label={artworkData.artwork.is_featured ? 'Yes' : 'No'}
                      size="small"
                      color={artworkData.artwork.is_featured ? 'success' : 'default'}
                    />
                  )}
                </Grid>

                {/* Is Active */}
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Active
                  </Typography>
                  {editMode ? (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editedArtworkDetails.is_active !== false}
                          onChange={(e) => setEditedArtworkDetails(prev => ({ ...prev, is_active: e.target.checked }))}
                        />
                      }
                      label={editedArtworkDetails.is_active !== false ? 'Yes' : 'No'}
                    />
                  ) : (
                    <Chip
                      label={artworkData.artwork.is_active !== false ? 'Yes' : 'No'}
                      size="small"
                      color={artworkData.artwork.is_active !== false ? 'success' : 'default'}
                    />
                  )}
                </Grid>
              </Grid>
            </Box>

            {/* Artwork Media Section */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Artwork Media ({artworkMedia.length})
                </Typography>
                {editMode && (
                  <>
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="artwork-media-upload"
                      type="file"
                      multiple
                      onChange={(e) => handleMediaUpload(e.target.files)}
                    />
                    <label htmlFor="artwork-media-upload">
                      <Button
                        variant="outlined"
                        size="small"
                        component="span"
                        startIcon={<CloudUploadIcon />}
                        disabled={uploadingMedia}
                      >
                        {uploadingMedia ? 'Uploading...' : 'Upload Media'}
                      </Button>
                    </label>
                  </>
                )}
              </Stack>
              {uploadingMedia && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Uploading media...
                  </Typography>
                </Box>
              )}
              <Grid container spacing={2}>
                {artworkMedia.length === 0 ? (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      No media added yet
                    </Typography>
                  </Grid>
                ) : (
                  artworkMedia.map((media, index) => (
                    <Grid item xs={12} sm={6} md={4} key={media.media_id || index}>
                      <Card variant="outlined" sx={{ position: 'relative', height: '100%' }}>
                        {editMode && (
                          <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1 }}>
                            <input
                              accept="image/*"
                              style={{ display: 'none' }}
                              id={`artwork-edit-${index}`}
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const previewUrl = URL.createObjectURL(file);
                                  const newMedia = [...artworkMedia];
                                  newMedia[index] = { ...newMedia[index], media_url: previewUrl, file: file };
                                  setArtworkMedia(newMedia);
                                }
                              }}
                            />
                            <label htmlFor={`artwork-edit-${index}`}>
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
                              onClick={() => handleMediaDelete(index)}
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
                              alt={media.alt_text || 'Artwork media'}
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
                                const newMedia = [...artworkMedia];
                                newMedia[index] = { ...newMedia[index], alt_text: e.target.value };
                                setArtworkMedia(newMedia);
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
                          {media.is_primary && (
                            <Chip label="Primary" size="small" color="primary" sx={{ mt: 0.5, fontSize: '0.7rem' }} />
                          )}
                          {media.media_url && !media.file && (
                            <Typography variant="caption" component="a" href={media.media_url} target="_blank" rel="noopener" sx={{ mt: 0.5, display: 'block', color: 'primary' }}>
                              View Image
                            </Typography>
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
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No artwork data available
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>

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

export default ArtworkDetailsDialog;
