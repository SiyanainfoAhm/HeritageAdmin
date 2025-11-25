/**
 * Translation Service
 * Integrates with Google Cloud Translation API via Supabase Edge Function
 */

// Import Supabase config for authentication
const SUPABASE_URL = 'https://ecvqhfbiwqmqgiqfxheu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjdnFoZmJpd3FtcWdpcWZ4aGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDEwMTksImV4cCI6MjA2MDg3NzAxOX0.rRF6VbPIRMucv2ePb4QFKA6gvmevrhqO0M_nTiWm5n4';

const TRANSLATE_EDGE_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/heritage-translate`;

// Language code mapping (frontend lowercase to Google API format)
const LANGUAGE_CODE_MAP: Record<string, string> = {
  'en': 'en',
  'hi': 'hi',
  'gu': 'gu',
  'ja': 'ja',
  'es': 'es',
  'fr': 'fr',
};

export interface TranslationRequest {
  text: string | string[];
  target: string | string[];
  source?: string;
}

export interface SingleTargetResponse {
  target: string;
  translations: string[];
}

export interface MultiTargetResponse {
  results: Record<string, string[]>;
}

export interface TranslationResult {
  success: boolean;
  translations?: Record<string, string[]>;
  error?: string;
}

export class TranslationService {
  /**
   * Translate text to one or multiple target languages
   * @param text - Text or array of texts to translate
   * @param targetLanguages - Target language code(s)
   * @param sourceLanguage - Source language code (optional, auto-detected if not provided)
   * @returns Translation results for each target language
   */
  static async translate(
    text: string | string[],
    targetLanguages: string | string[],
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    try {
      const payload: TranslationRequest = {
        text,
        target: targetLanguages,
        ...(sourceLanguage ? { source: sourceLanguage } : {}),
      };

      console.log('🌐 API Request to:', TRANSLATE_EDGE_FUNCTION_URL);
      console.log('📤 Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(TRANSLATE_EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('📨 API Response:', data);

      // Handle single target response
      if ('target' in data && 'translations' in data) {
        const singleResult = data as SingleTargetResponse;
        console.log('✅ Single target translation received');
        return {
          success: true,
          translations: {
            [singleResult.target]: singleResult.translations,
          },
        };
      }

      // Handle multi-target response
      if ('results' in data) {
        const multiResult = data as MultiTargetResponse;
        console.log('✅ Multi-target translation received:', Object.keys(multiResult.results));
        return {
          success: true,
          translations: multiResult.results,
        };
      }

      console.error('❌ Invalid response format:', data);
      return {
        success: false,
        error: 'Invalid response format from translation service',
      };
    } catch (error) {
      console.error('❌ Translation API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Translation service error',
      };
    }
  }

  /**
   * Translate heritage site content to all supported languages
   * @param sourceText - Original text in source language
   * @param sourceLanguage - Source language code (default: 'en')
   * @returns Translations for all supported languages
   */
  static async translateToAllLanguages(
    sourceText: string,
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult> {
    const targetLanguages = Object.keys(LANGUAGE_CODE_MAP).filter(
      (lang) => lang !== sourceLanguage
    );

    if (targetLanguages.length === 0) {
      return {
        success: true,
        translations: { [sourceLanguage]: [sourceText] },
      };
    }

    const result = await this.translate(sourceText, targetLanguages, sourceLanguage);

    // Add source language to results
    if (result.success && result.translations) {
      result.translations[sourceLanguage] = [sourceText];
    }

    return result;
  }

  /**
   * Translate multiple texts to all supported languages
   * Useful for translating name, short_desc, full_desc together
   * @param sourceTexts - Array of texts to translate (e.g., [name, short_desc, full_desc])
   * @param sourceLanguage - Source language code (default: 'en')
   * @returns Translations for all supported languages
   */
  static async translateMultipleToAllLanguages(
    sourceTexts: string[],
    sourceLanguage: string = 'en'
  ): Promise<TranslationResult> {
    const targetLanguages = Object.keys(LANGUAGE_CODE_MAP).filter(
      (lang) => lang !== sourceLanguage
    );

    if (targetLanguages.length === 0) {
      return {
        success: true,
        translations: { [sourceLanguage]: sourceTexts },
      };
    }

    const result = await this.translate(sourceTexts, targetLanguages, sourceLanguage);

    // Add source language to results
    if (result.success && result.translations) {
      result.translations[sourceLanguage] = sourceTexts;
    }

    return result;
  }

  /**
   * Batch translate heritage site content for optimal API usage
   * Translates name, short_desc, and full_desc in a single API call
   * @param content - Content to translate
   * @param sourceLanguage - Source language code (default: 'en')
   * @returns Object with translations for each field
   */
  static async translateHeritageSiteContent(
    content: {
      name: string;
      short_desc?: string | null;
      full_desc?: string | null;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      country?: string | null;
    },
    sourceLanguage: string = 'en'
  ): Promise<{
    success: boolean;
    translations?: Record<string, {
      name: string;
      short_desc?: string;
      full_desc?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
    }>;
    error?: string;
  }> {
    try {
      console.log('🔄 TranslationService.translateHeritageSiteContent called');
      console.log('📥 Input content:', content);
      console.log('📥 Source language:', sourceLanguage);

      // Prepare texts to translate (filter out null/undefined)
      const textsToTranslate: string[] = [];
      const fieldMap: string[] = []; // Track which field each text belongs to

      textsToTranslate.push(content.name);
      fieldMap.push('name');

      if (content.short_desc) {
        textsToTranslate.push(content.short_desc);
        fieldMap.push('short_desc');
      }

      if (content.full_desc) {
        textsToTranslate.push(content.full_desc);
        fieldMap.push('full_desc');
      }

      if (content.address) {
        textsToTranslate.push(content.address);
        fieldMap.push('address');
      }

      if (content.city) {
        textsToTranslate.push(content.city);
        fieldMap.push('city');
      }

      if (content.state) {
        textsToTranslate.push(content.state);
        fieldMap.push('state');
      }

      if (content.country) {
        textsToTranslate.push(content.country);
        fieldMap.push('country');
      }

      console.log('📤 Texts to translate:', textsToTranslate);
      console.log('📤 Field mapping:', fieldMap);

      if (textsToTranslate.length === 0) {
        console.error('❌ No content to translate');
        return {
          success: false,
          error: 'No content to translate',
        };
      }

      console.log('🌐 Calling translateMultipleToAllLanguages...');
      const result = await this.translateMultipleToAllLanguages(textsToTranslate, sourceLanguage);

      console.log('📨 Translation result:', {
        success: result.success,
        translationCount: result.translations ? Object.keys(result.translations).length : 0,
        languages: result.translations ? Object.keys(result.translations) : [],
        error: result.error
      });

      if (!result.success || !result.translations) {
        console.error('❌ Translation failed:', result.error);
        return {
          success: false,
          error: result.error || 'Translation failed',
        };
      }

      // Reconstruct translations by language
      const translationsByLanguage: Record<string, any> = {};

      Object.entries(result.translations).forEach(([lang, translatedTexts]) => {
        const langData: any = {};

        translatedTexts.forEach((text, index) => {
          const fieldName = fieldMap[index];
          langData[fieldName] = text;
        });

        translationsByLanguage[lang.toUpperCase()] = langData;
        console.log(`  ✅ ${lang.toUpperCase()}:`, langData);
      });

      console.log('✅ TranslationService.translateHeritageSiteContent complete');
      return {
        success: true,
        translations: translationsByLanguage,
      };
    } catch (error) {
      console.error('❌ TranslationService error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Translation error',
      };
    }
  }

  /**
   * Check if translation service is available
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const result = await this.translate('test', 'es', 'en');
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get supported language codes
   */
  static getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_CODE_MAP);
  }

  /**
   * Convert frontend language code to API format
   */
  static toApiLanguageCode(code: string): string {
    return LANGUAGE_CODE_MAP[code.toLowerCase()] || code;
  }

  /**
   * Convert API language code to uppercase format used in database
   */
  static toDatabaseLanguageCode(code: string): string {
    return code.toUpperCase();
  }
}

