import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MasterData, MasterDataCategory, MasterDataTranslation } from '@/types';
import { MasterDataService } from '@/services/masterData.service';
import { TranslationService } from '@/services/translation.service';
import { supabase } from '@/config/supabase';

interface MasterDataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  category: MasterDataCategory;
  masterData?: MasterData | null;
  mode: 'add' | 'edit';
}

const LANGUAGES = [
  { code: 'EN', label: 'English' },
  { code: 'HI', label: 'Hindi' },
  { code: 'GU', label: 'Gujarati' },
  { code: 'JA', label: 'Japanese' },
  { code: 'ES', label: 'Spanish' },
  { code: 'FR', label: 'French' },
];

const MasterDataDialog: React.FC<MasterDataDialogProps> = ({
  open,
  onClose,
  onSave,
  category,
  masterData,
  mode,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [translatingFields, setTranslatingFields] = useState<Set<string>>(new Set());
  const translationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTranslationsQueueRef = useRef<Array<{ field: 'displayName' | 'description'; value: string }>>([]);
  const isTranslatingRef = useRef(false);

  // Form state
  const [code, setCode] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [translations, setTranslations] = useState<Record<string, { displayName: string; description: string }>>({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && masterData) {
        setCode(masterData.code || '');
        setDisplayOrder(masterData.display_order || 0);
        setIsActive(masterData.is_active ?? true);
        // Load translations
        loadTranslations(masterData.master_id);
      } else {
        // Reset form for add mode
        setCode('');
        setIsActive(true);
        setDisplayOrder(0);
        setTranslations({});
        // Auto-populate display order with next value
        loadNextDisplayOrder();
      }
      setError('');
      setTranslatingFields(new Set());
      pendingTranslationsQueueRef.current = [];
      isTranslatingRef.current = false;
    }

    // Cleanup translation timer on unmount
    return () => {
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
      }
      pendingTranslationsQueueRef.current = [];
      isTranslatingRef.current = false;
    };
  }, [open, mode, masterData, category]);

  const loadTranslations = async (masterId: number) => {
    try {
      // Fetch translations for this master data item
      const { data, error } = await supabase
        .from('heritage_masterdatatranslation')
        .select('*')
        .eq('master_id', masterId);

      if (!error && data) {
        const transMap: Record<string, { displayName: string; description: string }> = {};
        data.forEach((trans: MasterDataTranslation) => {
          transMap[trans.language_code] = {
            displayName: trans.display_name,
            description: trans.description || '',
          };
        });
        setTranslations(transMap);
      }
    } catch (err) {
      console.error('Error loading translations:', err);
    }
  };

  const loadNextDisplayOrder = async () => {
    try {
      // Fetch existing master data for this category
      const existingData = await MasterDataService.getMasterDataByCategory(category);
      
      if (existingData && existingData.length > 0) {
        // Find the maximum display order
        const maxDisplayOrder = Math.max(...existingData.map(item => item.display_order || 0));
        // Set to next value
        setDisplayOrder(maxDisplayOrder + 1);
      } else {
        // No existing items, start at 1
        setDisplayOrder(1);
      }
    } catch (err) {
      console.error('Error loading next display order:', err);
      // Default to 1 if there's an error
      setDisplayOrder(1);
    }
  };

  // Auto-generate code from English display name
  const generateCodeFromName = (name: string): string => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .replace(/_+/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  };

  // Auto-translate field
  const autoTranslateField = async (text: string, targetLang: string, sourceLang: string = 'en') => {
    if (!text || !text.trim()) return '';
    
    try {
      const result = await TranslationService.translate(text, targetLang.toLowerCase(), sourceLang);
      console.log('🔄 Translation result for', targetLang, ':', result);
      
      if (result.success && result.translations) {
        const langKey = targetLang.toLowerCase();
        let translations = result.translations[langKey];
        
        // Handle case where API returns target language in uppercase or mixed case
        if (!translations) {
          // Try uppercase
          translations = result.translations[langKey.toUpperCase()];
        }
        if (!translations) {
          // Try to find any matching key (case insensitive)
          const matchingKey = Object.keys(result.translations).find(
            key => key.toLowerCase() === langKey
          );
          if (matchingKey) {
            translations = result.translations[matchingKey];
          }
        }
        
        if (translations) {
          // Handle array or string
          const translatedText = Array.isArray(translations) 
            ? (translations.length > 0 ? translations[0] : '')
            : String(translations || '');
          
          console.log('✅ Translated text:', translatedText);
          return translatedText;
        }
      }
      console.warn('⚠️ No translation found for', targetLang);
      return '';
    } catch (error) {
      console.warn(`Failed to auto-translate to ${targetLang}:`, error);
      return '';
    }
  };

  // Perform translation for a field
  const performTranslation = async (field: 'displayName' | 'description', value: string) => {
    if (!value || !value.trim()) {
      // Process next in queue if available
      processNextPendingTranslation();
      return;
    }
    
    // If already translating, queue this one
    if (isTranslatingRef.current) {
      // Add to queue instead of replacing
      pendingTranslationsQueueRef.current.push({ field, value });
      console.log(`📋 Queued translation: ${field}, queue length:`, pendingTranslationsQueueRef.current.length);
      return;
    }
    
    isTranslatingRef.current = true;
    const otherLangs = LANGUAGES.filter(l => l.code !== 'EN');
    setTranslatingFields(new Set(otherLangs.map(l => l.code)));

    console.log(`🔄 Starting translation for ${field}:`, value);

    try {
      // Perform all translations
      const translationResults = await Promise.all(
        otherLangs.map(async (lang) => {
          const targetLang = lang.code.toLowerCase();
          const translatedValue = await autoTranslateField(value, targetLang);
          return { langCode: lang.code, translatedValue };
        })
      );
      
      // Update state with all translations using functional update
      setTranslations((prev) => {
        const updated = { ...prev };
        
        translationResults.forEach(({ langCode, translatedValue }) => {
          if (!translatedValue || !translatedValue.trim()) {
            console.warn(`⚠️ Empty translation for ${langCode}`);
            return; // Skip empty translations
          }
          
          // Always update translations when translating from English (source language)
          // This ensures we get the latest translated values
          if (field === 'displayName') {
            updated[langCode] = {
              displayName: translatedValue,
              description: updated[langCode]?.description || prev[langCode]?.description || '',
            };
            console.log(`✅ Updated ${langCode} displayName:`, translatedValue);
          } else {
            updated[langCode] = {
              displayName: updated[langCode]?.displayName || prev[langCode]?.displayName || '',
              description: translatedValue,
            };
            console.log(`✅ Updated ${langCode} description:`, translatedValue);
          }
        });
        
        return updated;
      });
      
      setTranslatingFields(new Set());
      isTranslatingRef.current = false;
      
      // Process next pending translation
      processNextPendingTranslation();
    } catch (error) {
      console.error('Translation error:', error);
      setTranslatingFields(new Set());
      isTranslatingRef.current = false;
      // Process next pending translation even on error
      processNextPendingTranslation();
    }
  };

  // Process next pending translation from queue
  const processNextPendingTranslation = () => {
    if (pendingTranslationsQueueRef.current.length > 0 && !isTranslatingRef.current) {
      const next = pendingTranslationsQueueRef.current.shift();
      if (next) {
        console.log(`📤 Processing queued translation: ${next.field}`);
        setTimeout(() => {
          performTranslation(next.field, next.value);
        }, 100);
      }
    }
  };

  const handleTranslationChange = (langCode: string, field: 'displayName' | 'description', value: string) => {
    setTranslations((prev) => {
      const updated = {
        ...prev,
        [langCode]: {
          displayName: prev[langCode]?.displayName || '',
          description: prev[langCode]?.description || '',
          [field]: value,
        },
      };

      // Auto-generate code from English display name in add mode (except for language category)
      if (mode === 'add' && category !== 'language' && langCode === 'EN' && field === 'displayName' && value.trim()) {
        const generatedCode = generateCodeFromName(value);
        if (generatedCode) {
          setCode(generatedCode.toUpperCase());
        }
      }

      // Auto-translate when English display name or description changes
      if (langCode === 'EN' && value.trim()) {
        // Clear existing timer
        if (translationTimerRef.current) {
          clearTimeout(translationTimerRef.current);
          translationTimerRef.current = null;
        }

        // If translation is in progress, queue this translation
        if (isTranslatingRef.current) {
          // Remove any existing pending translation for this field from queue
          pendingTranslationsQueueRef.current = pendingTranslationsQueueRef.current.filter(
            item => !(item.field === field)
          );
          // Add to queue
          pendingTranslationsQueueRef.current.push({ field, value });
        } else {
          // Debounce translation - translate after 1 second of no typing (like other screens)
          translationTimerRef.current = setTimeout(() => {
            // Get the latest value from state when timer fires to ensure we translate the most recent text
            setTranslations((current) => {
              const latestValue = current['EN']?.[field];
              if (latestValue && latestValue.trim()) {
                console.log(`⏱️ Timer fired for ${field}, translating:`, latestValue);
                performTranslation(field, latestValue);
              }
              return current; // Don't modify state, just read it
            });
          }, 1000);
        }
      }

      return updated;
    });
  };

  // Handle blur event to ensure translation completes
  const handleTranslationBlur = (langCode: string, field: 'displayName' | 'description') => {
    if (langCode === 'EN') {
      // Clear any pending timer and trigger translation immediately
      if (translationTimerRef.current) {
        clearTimeout(translationTimerRef.current);
        translationTimerRef.current = null;
      }
      
      // Get current value and translate if not already translating
      setTranslations((current) => {
        const englishValue = current['EN']?.[field];
        if (englishValue && englishValue.trim()) {
          // Remove any pending translation for this field from queue
          pendingTranslationsQueueRef.current = pendingTranslationsQueueRef.current.filter(
            item => !(item.field === field)
          );
          // Queue the translation (or execute if not translating)
          if (isTranslatingRef.current) {
            pendingTranslationsQueueRef.current.push({ field, value: englishValue });
          } else {
            performTranslation(field, englishValue);
          }
        }
        return current;
      });
    }
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!code || !code.trim()) {
      setError('Code is required');
      return;
    }

    // At least one translation (display name) is required
    const hasTranslation = Object.values(translations).some((t) => t && t.displayName && t.displayName.trim());
    if (!hasTranslation) {
      setError('At least one translation (display name) is required');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'add') {
        // Create master data
        const result = await MasterDataService.createMasterData(
          category,
          code.trim().toUpperCase(),
          displayOrder
        );

        if (!result.success) {
          setError(result.error?.message || 'Failed to create master data');
          setLoading(false);
          return;
        }

        const newMasterId = result.data?.master_id;

        // Create translations
        for (const [langCode, trans] of Object.entries(translations)) {
          if (trans && trans.displayName && trans.displayName.trim()) {
            await MasterDataService.upsertTranslation(
              newMasterId,
              langCode,
              trans.displayName.trim(),
              (trans.description && trans.description.trim()) || undefined
            );
          }
        }
      } else if (mode === 'edit' && masterData) {
        // Update master data
        const result = await MasterDataService.updateMasterData(masterData.master_id, {
          code: code.trim().toUpperCase(),
          display_order: displayOrder,
          is_active: isActive,
        });

        if (!result.success) {
          setError(result.error?.message || 'Failed to update master data');
          setLoading(false);
          return;
        }

        // Update translations
        for (const [langCode, trans] of Object.entries(translations)) {
          if (trans && trans.displayName && trans.displayName.trim()) {
            await MasterDataService.upsertTranslation(
              masterData.master_id,
              langCode,
              trans.displayName.trim(),
              (trans.description && trans.description.trim()) || undefined
            );
          }
        }
      }

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'add' ? 'Add New Master Data' : 'Edit Master Data'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            margin="normal"
            required
            helperText={
              mode === 'add' 
                ? category === 'language' 
                  ? "Enter language code (will be stored in uppercase)" 
                  : "Auto-generated from English display name (can be edited)"
                : "Code cannot be changed"
            }
            disabled={mode === 'edit'}
          />
          <TextField
            fullWidth
            label="Display Order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            margin="normal"
            inputProps={{ min: 0 }}
          />
          {mode === 'edit' && (
            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
              label="Active"
              sx={{ mt: 2 }}
            />
          )}
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Translations
        </Typography>

        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          {LANGUAGES.map((lang) => {
            const hasTranslation = translations[lang.code]?.displayName && translations[lang.code].displayName.trim();
            const isTranslating = translatingFields.has(lang.code);
            
            return (
              <Tab 
                key={lang.code} 
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>{lang.label}</span>
                    {isTranslating ? (
                      <CircularProgress size={14} />
                    ) : (
                      hasTranslation &&
                      lang.code !== 'EN' && (
                        <CheckCircleIcon fontSize="small" sx={{ color: '#4CAF50' }} />
                      )
                    )}
                  </Stack>
                }
              />
            );
          })}
        </Tabs>

        {LANGUAGES.map((lang, index) => (
          <Box key={lang.code} hidden={activeTab !== index} sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={`Display Name (${lang.label})`}
              value={translations[lang.code]?.displayName || ''}
              onChange={(e) => handleTranslationChange(lang.code, 'displayName', e.target.value)}
              onBlur={() => handleTranslationBlur(lang.code, 'displayName')}
              margin="normal"
              required={index === 0} // English is required
            />
            <TextField
              fullWidth
              label={`Description (${lang.label})`}
              value={translations[lang.code]?.description || ''}
              onChange={(e) => handleTranslationChange(lang.code, 'description', e.target.value)}
              onBlur={() => handleTranslationBlur(lang.code, 'description')}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : mode === 'add' ? 'Create' : 'Update'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MasterDataDialog;

