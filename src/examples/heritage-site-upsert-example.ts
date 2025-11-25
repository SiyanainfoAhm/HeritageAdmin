/**
 * Heritage Site Upsert Examples
 * 
 * This file contains practical examples of using the upsertHeritageSiteWithTranslations function
 * to create and update heritage sites with multi-language support.
 */

import { HeritageSiteService } from '@/services/heritageSite.service';
import type { CreateHeritageSiteRequest } from '@/services/heritageSite.service';

/**
 * Example 1: Create a new heritage site with all 6 languages
 */
export async function createNewHeritageSite() {
  const request: CreateHeritageSiteRequest = {
    site: {
      name_default: 'Rani ki Vav (The Queen\'s Stepwell)',
      short_desc_default: 'UNESCO World Heritage Site - Ancient stepwell in Gujarat',
      full_desc_default: 'Rani ki Vav is an intricately constructed stepwell situated in Patan, Gujarat. It was built in 1063 by Queen Udayamati as a memorial to her husband King Bhima I of the Chaulukya dynasty. The stepwell is designed as an inverted temple highlighting the sanctity of water.',
      latitude: 23.8589,
      longitude: 72.1019,
      vr_link: null,
      qr_link: null,
      meta_title_def: 'Rani ki Vav - UNESCO World Heritage Stepwell',
      meta_description_def: 'Visit the magnificent Rani ki Vav stepwell in Patan, Gujarat',
      is_active: true,
      location_address: 'Rani ki Vav Rd, Near Saraswati River',
      location_city: 'Patan',
      location_state: 'Gujarat',
      location_country: 'India',
    },
    media: [
      {
        media_type: 'image',
        storage_url: 'https://example.com/images/rani-ki-vav-1.jpg',
        is_primary: true,
        position: 1,
      },
      {
        media_type: 'image',
        storage_url: 'https://example.com/images/rani-ki-vav-2.jpg',
        is_primary: false,
        position: 2,
      },
    ],
    visitingHours: [
      { day_of_week: 'Monday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Tuesday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Wednesday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Thursday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Friday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Saturday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
      { day_of_week: 'Sunday', is_open: true, opening_time: '08:00', closing_time: '18:00' },
    ],
    ticketTypes: [
      { visitor_type: 'Indian Adult', amount: 40, currency: 'INR' },
      { visitor_type: 'Indian Child (below 15 years)', amount: 0, currency: 'INR' },
      { visitor_type: 'Foreign National', amount: 200, currency: 'INR' },
    ],
    transportation: [
      {
        category: 'transport',
        mode: 'train',
        name: 'Patan Railway Station',
        description: '3 km from the site',
        travel_time_minutes: 10,
      },
      {
        category: 'transport',
        mode: 'bus',
        name: 'Patan ST Bus Stand',
        description: '2 km from the site',
        travel_time_minutes: 5,
      },
    ],
    amenities: [
      { name: 'Parking', icon: 'ri-parking-line' },
      { name: 'Drinking Water', icon: 'ri-goblet-line' },
      { name: 'Restrooms', icon: 'ri-hotel-line' },
      { name: 'Guided Tours', icon: 'ri-guide-line' },
    ],
    etiquettes: [
      {
        rule_title: 'Maintain Cleanliness',
        rule_description: 'Please do not litter. Help preserve this UNESCO World Heritage Site.',
        importance_level: 'high',
      },
      {
        rule_title: 'No Entry Beyond Barriers',
        rule_description: 'For your safety and preservation of the monument, do not cross barriers.',
        importance_level: 'critical',
      },
    ],
    translations: [
      // English (EN)
      {
        language_code: 'EN',
        name: 'Rani ki Vav (The Queen\'s Stepwell)',
        short_desc: 'UNESCO World Heritage Site - Ancient stepwell in Gujarat built in 1063 AD',
        full_desc: 'Rani ki Vav is an intricately constructed stepwell situated in Patan, Gujarat. It was built in 1063 by Queen Udayamati as a memorial to her husband King Bhima I of the Chaulukya dynasty. The stepwell is designed as an inverted temple highlighting the sanctity of water. It has seven levels of stairs with sculptural panels depicting various forms of Vishnu.',
        address: 'Rani ki Vav Rd, Near Saraswati River',
        city: 'Patan',
        state: 'Gujarat',
        country: 'India',
        meta_title: 'Rani ki Vav - UNESCO World Heritage Stepwell in Patan',
        meta_description: 'Explore the magnificent Rani ki Vav stepwell, a UNESCO World Heritage Site in Patan, Gujarat',
      },
      // Hindi (HI)
      {
        language_code: 'HI',
        name: 'रानी की वाव (रानी की बावड़ी)',
        short_desc: 'यूनेस्को विश्व धरोहर स्थल - 1063 ईस्वी में निर्मित प्राचीन बावड़ी',
        full_desc: 'रानी की वाव गुजरात के पाटन में स्थित एक जटिल रूप से निर्मित बावड़ी है। इसे 1063 में रानी उदयमति ने चालुक्य वंश के अपने पति राजा भीम प्रथम की याद में बनवाया था। यह बावड़ी एक उल्टे मंदिर के रूप में डिज़ाइन की गई है जो पानी की पवित्रता को उजागर करती है। इसमें सात स्तरों की सीढ़ियाँ हैं जिनमें विष्णु के विभिन्न रूपों को दर्शाने वाले मूर्तिकला पैनल हैं।',
        address: 'रानी की वाव रोड, सरस्वती नदी के पास',
        city: 'पाटन',
        state: 'गुजरात',
        country: 'भारत',
        meta_title: 'रानी की वाव - पाटन में यूनेस्को विश्व धरोहर बावड़ी',
        meta_description: 'गुजरात के पाटन में यूनेस्को विश्व धरोहर स्थल रानी की वाव का अन्वेषण करें',
      },
      // Gujarati (GU)
      {
        language_code: 'GU',
        name: 'રાણીની વાવ (રાણીની બાવડી)',
        short_desc: 'યુનેસ્કો વર્લ્ડ હેરિટેજ સાઇટ - 1063 એડીમાં બાંધવામાં આવેલી પ્રાચીન વાવ',
        full_desc: 'રાણીની વાવ ગુજરાતના પાટણમાં સ્થિત એક જટિલ રીતે બાંધવામાં આવેલી વાવ છે. તે 1063માં ચાલુક્ય વંશના તેમના પતિ રાજા ભીમ પ્રથમની યાદમાં રાણી ઉદયમતિ દ્વારા બાંધવામાં આવી હતી. આ વાવ પાણીની પવિત્રતાને હાઇલાઇટ કરતા ઊલટા મંદિર તરીકે ડિઝાઇન કરવામાં આવી છે. તેમાં સાત સ્તરની સીડીઓ છે જેમાં વિષ્ણુના વિવિધ સ્વરૂપોને દર્શાવતી શિલ્પકલા પેનલ્સ છે।',
        address: 'રાણીની વાવ રોડ, સરસ્વતી નદી નજીક',
        city: 'પાટણ',
        state: 'ગુજરાત',
        country: 'ભારત',
        meta_title: 'રાણીની વાવ - પાટણમાં યુનેસ્કો વર્લ્ડ હેરિટેજ વાવ',
        meta_description: 'પાટણ, ગુજરાતમાં યુનેસ્કો વર્લ્ડ હેરિટેજ સાઇટ રાણીની વાવનું અન્વેષણ કરો',
      },
      // Japanese (JA)
      {
        language_code: 'JA',
        name: 'ラニ・キ・ヴァヴ（女王の階段井戸）',
        short_desc: 'ユネスコ世界遺産 - 1063年に建設された古代の階段井戸',
        full_desc: 'ラニ・キ・ヴァヴは、グジャラート州パタンにある複雑に構築された階段井戸です。1063年にチャウルキヤ王朝のビーマ1世の記念として、ウダヤマティ女王によって建てられました。この階段井戸は、水の神聖さを強調する逆さまの寺院として設計されています。ヴィシュヌのさまざまな形を描いた彫刻パネルがある7レベルの階段があります。',
        address: 'ラニ・キ・ヴァヴ通り、サラスワティ川近く',
        city: 'パタン',
        state: 'グジャラート',
        country: 'インド',
        meta_title: 'ラニ・キ・ヴァヴ - パタンのユネスコ世界遺産階段井戸',
        meta_description: 'グジャラート州パタンのユネスコ世界遺産であるラニ・キ・ヴァヴを探索する',
      },
      // Spanish (ES)
      {
        language_code: 'ES',
        name: 'Rani ki Vav (El Pozo Escalonado de la Reina)',
        short_desc: 'Patrimonio Mundial de la UNESCO - Pozo escalonado antiguo construido en 1063 d.C.',
        full_desc: 'Rani ki Vav es un pozo escalonado intrincadamente construido situado en Patan, Gujarat. Fue construido en 1063 por la reina Udayamati como un memorial a su esposo, el rey Bhima I de la dinastía Chaulukya. El pozo está diseñado como un templo invertido que destaca la santidad del agua. Tiene siete niveles de escaleras con paneles escultóricos que representan varias formas de Vishnu.',
        address: 'Rani ki Vav Rd, cerca del río Saraswati',
        city: 'Patan',
        state: 'Gujarat',
        country: 'India',
        meta_title: 'Rani ki Vav - Pozo Escalonado Patrimonio de la UNESCO en Patan',
        meta_description: 'Explora el magnífico pozo escalonado Rani ki Vav, Patrimonio Mundial de la UNESCO en Patan, Gujarat',
      },
      // French (FR)
      {
        language_code: 'FR',
        name: 'Rani ki Vav (Le Puits à Degrés de la Reine)',
        short_desc: 'Site du patrimoine mondial de l\'UNESCO - Puits à degrés ancien construit en 1063 après J.-C.',
        full_desc: 'Rani ki Vav est un puits à degrés complexe situé à Patan, Gujarat. Il a été construit en 1063 par la reine Udayamati en mémoire de son mari, le roi Bhima I de la dynastie Chaulukya. Le puits est conçu comme un temple inversé mettant en valeur la sainteté de l\'eau. Il comporte sept niveaux d\'escaliers avec des panneaux sculpturaux représentant diverses formes de Vishnu.',
        address: 'Rani ki Vav Rd, près de la rivière Saraswati',
        city: 'Patan',
        state: 'Gujarat',
        country: 'Inde',
        meta_title: 'Rani ki Vav - Puits à Degrés du patrimoine mondial de l\'UNESCO à Patan',
        meta_description: 'Explorez le magnifique puits à degrés Rani ki Vav, site du patrimoine mondial de l\'UNESCO à Patan, Gujarat',
      },
    ],
  };

  try {
    const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(request);
    
    if (result.success) {
      console.log('✅ Heritage site created successfully!');
      console.log('Site ID:', result.siteId);
      console.log('Message:', result.message);
      return result;
    } else {
      console.error('❌ Failed to create heritage site');
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
}

/**
 * Example 2: Update an existing heritage site
 */
export async function updateExistingHeritageSite(siteId: number) {
  const request: CreateHeritageSiteRequest = {
    site: {
      name_default: 'Rani ki Vav - Updated',
      short_desc_default: 'UNESCO World Heritage Site (Updated)',
      is_active: true,
    },
    translations: [
      {
        language_code: 'EN',
        name: 'Rani ki Vav - Updated',
        short_desc: 'Updated description in English',
      },
      {
        language_code: 'HI',
        name: 'रानी की वाव - अपडेटेड',
        short_desc: 'हिंदी में अपडेट किया गया विवरण',
      },
      {
        language_code: 'GU',
        name: 'રાણીની વાવ - અપડેટ કરેલ',
        short_desc: 'ગુજરાતીમાં અપડેટ કરેલ વર્ણન',
      },
      {
        language_code: 'JA',
        name: 'ラニ・キ・ヴァヴ - 更新',
        short_desc: '日本語で更新された説明',
      },
      {
        language_code: 'ES',
        name: 'Rani ki Vav - Actualizado',
        short_desc: 'Descripción actualizada en español',
      },
      {
        language_code: 'FR',
        name: 'Rani ki Vav - Mis à jour',
        short_desc: 'Description mise à jour en français',
      },
    ],
    media: [],
    visitingHours: [],
    ticketTypes: [],
    transportation: [],
    amenities: [],
    etiquettes: [],
  };

  try {
    const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(request, siteId);
    
    if (result.success) {
      console.log('✅ Heritage site updated successfully!');
      console.log('Message:', result.message);
      return result;
    } else {
      console.error('❌ Failed to update heritage site');
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
}

/**
 * Example 3: Create a minimal heritage site (draft mode)
 */
export async function createMinimalHeritageSite() {
  const request: CreateHeritageSiteRequest = {
    site: {
      name_default: 'New Heritage Site (Draft)',
      is_active: false, // Draft mode
    },
    translations: [
      { language_code: 'EN', name: 'New Heritage Site (Draft)' },
      { language_code: 'HI', name: 'नया विरासत स्थल (प्रारूप)' },
      { language_code: 'GU', name: 'નવું વારસો સ્થળ (ડ્રાફ્ટ)' },
      { language_code: 'JA', name: '新しい遺産サイト（下書き）' },
      { language_code: 'ES', name: 'Nuevo Sitio Patrimonial (Borrador)' },
      { language_code: 'FR', name: 'Nouveau Site Patrimonial (Brouillon)' },
    ],
    media: [],
    visitingHours: [],
    ticketTypes: [],
    transportation: [],
    amenities: [],
    etiquettes: [],
  };

  try {
    const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(request);
    
    if (result.success) {
      console.log('✅ Draft heritage site created successfully!');
      console.log('Site ID:', result.siteId);
      return result;
    } else {
      console.error('❌ Failed to create draft');
      console.error('Error:', result.message);
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Exception:', error);
    throw error;
  }
}

/**
 * Example 4: Helper function to generate default translations
 */
export function generateDefaultTranslations(siteName: string, shortDesc?: string, fullDesc?: string) {
  return [
    {
      language_code: 'EN',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
    {
      language_code: 'HI',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
    {
      language_code: 'GU',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
    {
      language_code: 'JA',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
    {
      language_code: 'ES',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
    {
      language_code: 'FR',
      name: siteName,
      short_desc: shortDesc || null,
      full_desc: fullDesc || null,
    },
  ];
}

/**
 * Example usage in a React component or form submission
 */
export async function handleFormSubmit(formData: any, isEdit: boolean, siteId?: number) {
  const request: CreateHeritageSiteRequest = {
    site: {
      name_default: formData.siteName,
      short_desc_default: formData.shortDescription,
      full_desc_default: formData.fullDescription,
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      is_active: formData.isActive,
      location_address: formData.address,
      location_city: formData.city,
      location_state: formData.state,
      location_country: formData.country || 'India',
    },
    media: formData.media || [],
    visitingHours: formData.visitingHours || [],
    ticketTypes: formData.ticketTypes || [],
    transportation: formData.transportation || [],
    amenities: formData.amenities || [],
    etiquettes: formData.etiquettes || [],
    translations: formData.translations || generateDefaultTranslations(formData.siteName),
  };

  try {
    const result = await HeritageSiteService.upsertHeritageSiteWithTranslations(
      request,
      isEdit && siteId ? siteId : null
    );

    if (result.success) {
      return {
        success: true,
        siteId: result.siteId,
        message: result.message,
      };
    } else {
      return {
        success: false,
        message: result.message,
        error: result.error,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error,
    };
  }
}

