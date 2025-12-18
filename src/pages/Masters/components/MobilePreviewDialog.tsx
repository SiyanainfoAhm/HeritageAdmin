import { useState, useEffect } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Rating,
  Button,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DirectionsIcon from '@mui/icons-material/Directions';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/Home';
import ExploreIcon from '@mui/icons-material/Explore';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import PersonIcon from '@mui/icons-material/Person';
import { supabase } from '@/config/supabase';

interface MobilePreviewDialogProps {
  open: boolean;
  siteId: number | null;
  onClose: () => void;
}

// Mapped site data after processing RPC response
interface MappedSiteData {
  site_id: number;
  name: string;
  short_desc: string;
  full_desc: string;
  label: string;
  city: string;
  state: string;
  country: string;
  rating: number;
  total_reviews: number;
  latitude: number;
  longitude: number;
  image_url: string;
  vr_link: string | null;
  ar_mode_available?: boolean;
  entry_type: string;
  entry_fee: number;
  photography_allowed: string;
  photograph_amount: number | null;
  site_type: { code: string; display_name: string } | null;
  accessibility: { code: string; display_name: string }[];
  experience: { code: string; display_name: string }[];
  etiquettes: { code: string; display_name: string }[];
  ticket_types: { ticket_type_id: number; name: string; price: number; is_active: boolean }[];
  visiting_hours: { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[];
  images: { media_id: number; media_url: string; position: number; is_primary: boolean }[];
  audios: { media_id: number; media_url: string; position: number }[];
  sitemap: { media_id: number; media_url: string; position: number }[];
  reviews: { review_id: number; reviewer_name: string; rating: number; text: string; created_at: string }[];
}

type PreviewLanguageCode = 'EN' | 'HI' | 'GU' | 'JA' | 'ES' | 'FR';

const PREVIEW_LANGUAGES: { code: PreviewLanguageCode; label: string }[] = [
  { code: 'EN', label: 'English' },
  { code: 'HI', label: 'Hindi' },
  { code: 'GU', label: 'Gujarati' },
  { code: 'JA', label: 'Japanese' },
  { code: 'ES', label: 'Spanish' },
  { code: 'FR', label: 'French' },
];

type UiStringKey =
  | 'tabOverview'
  | 'tabAbout'
  | 'tabPlanVisit'
  | 'tabReviews'
  | 'immersiveExperience'
  | 'quickInfo'
  | 'openHours'
  | 'entryFee'
  | 'photography'
  | 'gettingThere'
  | 'historyArchitecture'
  | 'accessibility'
  | 'etiquettes'
  | 'experience'
  | 'openingHoursEntry'
  | 'bookTickets'
  | 'writeReview'
  | 'noReviewsYet'
  | 'beFirstReview'
  | 'viewIn360'
  | 'tapToExperience'
  | 'openNow'
  | 'vrAvailable'
  | 'getDirections'
  | 'bookNow'
  | 'free'
  | 'restricted';

type UiStrings = Record<UiStringKey, string>;

const EN_STRINGS: UiStrings = {
  tabOverview: 'Overview',
  tabAbout: 'About',
  tabPlanVisit: 'Plan Visit',
  tabReviews: 'Reviews',
  immersiveExperience: 'Immersive Experience',
  quickInfo: 'Quick Info',
  openHours: 'Open Hours',
  entryFee: 'Entry Fee',
  photography: 'Photography',
  gettingThere: 'Getting There',
  historyArchitecture: 'History & Architecture',
  accessibility: 'Accessibility',
  etiquettes: 'Etiquettes',
  experience: 'Experience',
  openingHoursEntry: 'Opening Hours & Entry',
  bookTickets: 'Book Tickets',
  writeReview: 'Write a Review',
  noReviewsYet: 'No reviews yet',
  beFirstReview: 'Be the first to share your experience!',
  viewIn360: 'View in 360°',
  tapToExperience: 'Tap to experience',
  openNow: 'Open Now',
  vrAvailable: 'VR Available',
  getDirections: 'Get Directions',
  bookNow: 'Book Now',
  free: 'Free',
  restricted: 'Restricted',
};

const UI_STRINGS: Record<PreviewLanguageCode, UiStrings> = {
  EN: EN_STRINGS,
  HI: {
    ...EN_STRINGS,
    tabOverview: 'सारांश',
    tabAbout: 'विवरण',
    tabPlanVisit: 'यात्रा योजना',
    tabReviews: 'समीक्षाएँ',
    immersiveExperience: 'इमर्सिव अनुभव',
    quickInfo: 'त्वरित जानकारी',
    openHours: 'खुलने का समय',
    entryFee: 'प्रवेश शुल्क',
    photography: 'फोटो खींचना',
    gettingThere: 'कैसे पहुँचे',
    historyArchitecture: 'इतिहास और वास्तुकला',
    accessibility: 'सुगम्यता',
    etiquettes: 'आचार नियम',
    experience: 'अनुभव',
    openingHoursEntry: 'खुलने का समय और प्रवेश',
    bookTickets: 'टिकट बुक करें',
    writeReview: 'समीक्षा लिखें',
    noReviewsYet: 'अभी तक कोई समीक्षा नहीं',
    beFirstReview: 'अपना अनुभव साझा करने वाले पहले व्यक्ति बनें!',
    viewIn360: '360° में देखें',
    tapToExperience: 'अनुभव के लिए टैप करें',
    openNow: 'खुला है',
    vrAvailable: 'वीआर उपलब्ध',
    getDirections: 'दिशा-निर्देश प्राप्त करें',
    bookNow: 'अभी बुक करें',
    free: 'नि:शुल्क',
    restricted: 'प्रतिबंधित',
  },
  GU: {
    ...EN_STRINGS,
    tabOverview: 'પરિચય',
    tabAbout: 'વિગતો',
    tabPlanVisit: 'મુલાકાત યોજના',
    tabReviews: 'સમીક્ષાઓ',
    immersiveExperience: 'ઈમર્સિવ અનુભવ',
    quickInfo: 'ઝડપી માહિતી',
    openHours: 'ખુલ્લા કલાકો',
    entryFee: 'પ્રવેશ ફી',
    photography: 'ફોટોગ્રાફી',
    gettingThere: 'ત્યાં કેવી રીતે પહોંચવું',
    historyArchitecture: 'ઇતિહાસ અને વાસ્તુશિલ્પ',
    accessibility: 'સુગમતા',
    etiquettes: 'નિયમો',
    experience: 'અનુભવ',
    openingHoursEntry: 'ખુલ્લા કલાકો અને પ્રવેશ',
    bookTickets: 'ટિકિટ બુક કરો',
    writeReview: 'સમિક્ષા લખો',
    noReviewsYet: 'હજુ સુધી કોઈ સમિક્ષા નથી',
    beFirstReview: 'તમારો અનુભવ શેર કરનાર પહેલા બનો!',
    viewIn360: '૩૬૦° માં જુઓ',
    tapToExperience: 'અનુભવ માટે ટેપ કરો',
    openNow: 'હમણાં ખુલ્લું છે',
    vrAvailable: 'વી.આર. ઉપલબ્ધ',
    getDirections: 'દિશા મેળવો',
    bookNow: 'હમણાં બુક કરો',
    free: 'મફત',
    restricted: 'પ્રતિબંધિત',
  },
  JA: {
    ...EN_STRINGS,
    tabOverview: '概要',
    tabAbout: '詳細',
    tabPlanVisit: '訪問計画',
    tabReviews: 'レビュー',
    immersiveExperience: '没入型体験',
    quickInfo: 'クイック情報',
    openHours: '営業時間',
    entryFee: '入場料',
    photography: '写真撮影',
    gettingThere: 'アクセス',
    historyArchitecture: '歴史と建築',
    accessibility: 'バリアフリー',
    etiquettes: 'マナー',
    experience: '体験',
    openingHoursEntry: '営業時間と入場',
    bookTickets: 'チケットを予約',
    writeReview: 'レビューを書く',
    noReviewsYet: 'まだレビューがありません',
    beFirstReview: '最初に体験を共有しましょう！',
    viewIn360: '360°で見る',
    tapToExperience: 'タップして体験',
    openNow: '営業中',
    vrAvailable: 'VR 対応',
    getDirections: '行き方を見る',
    bookNow: '今すぐ予約',
    free: '無料',
  },
  ES: {
    ...EN_STRINGS,
    tabOverview: 'Resumen',
    tabAbout: 'Acerca de',
    tabPlanVisit: 'Planificar visita',
    tabReviews: 'Reseñas',
    immersiveExperience: 'Experiencia inmersiva',
    quickInfo: 'Información rápida',
    openHours: 'Horario',
    entryFee: 'Entrada',
    photography: 'Fotografía',
    gettingThere: 'Cómo llegar',
    historyArchitecture: 'Historia y arquitectura',
    accessibility: 'Accesibilidad',
    etiquettes: 'Normas',
    experience: 'Experiencia',
    openingHoursEntry: 'Horario y entrada',
    bookTickets: 'Reservar entradas',
    writeReview: 'Escribir una reseña',
    noReviewsYet: 'Aún no hay reseñas',
    beFirstReview: '¡Sé el primero en compartir tu experiencia!',
    viewIn360: 'Ver en 360°',
    tapToExperience: 'Toca para vivir la experiencia',
    openNow: 'Abierto ahora',
    vrAvailable: 'VR disponible',
    getDirections: 'Obtener indicaciones',
    bookNow: 'Reservar ahora',
    free: 'Gratis',
    restricted: 'Restringido',
  },
  FR: {
    ...EN_STRINGS,
    tabOverview: 'Aperçu',
    tabAbout: 'À propos',
    tabPlanVisit: 'Planifier la visite',
    tabReviews: 'Avis',
    immersiveExperience: 'Expérience immersive',
    quickInfo: 'Infos rapides',
    openHours: 'Horaires',
    entryFee: 'Tarif d’entrée',
    photography: 'Photographie',
    gettingThere: 'Comment y aller',
    historyArchitecture: 'Histoire et architecture',
    accessibility: 'Accessibilité',
    etiquettes: 'Règles',
    experience: 'Expérience',
    openingHoursEntry: 'Horaires et entrée',
    bookTickets: 'Réserver des billets',
    writeReview: 'Écrire un avis',
    noReviewsYet: 'Aucun avis pour le moment',
    beFirstReview: 'Soyez le premier à partager votre expérience !',
    viewIn360: 'Voir en 360°',
    tapToExperience: 'Touchez pour découvrir',
    openNow: 'Ouvert maintenant',
    vrAvailable: 'VR disponible',
    getDirections: 'Itinéraire',
    bookNow: 'Réserver',
    free: 'Gratuit',
    restricted: 'Restreint',
  },
};

const MobilePreviewDialog: React.FC<MobilePreviewDialogProps> = ({ open, siteId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<MappedSiteData | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showVrPlayer, setShowVrPlayer] = useState(false);
  const [language, setLanguage] = useState<PreviewLanguageCode>('EN');

  const t = (key: UiStringKey): string => {
    const langStrings = UI_STRINGS[language] || EN_STRINGS;
    return langStrings[key] || EN_STRINGS[key];
  };

  useEffect(() => {
    if (open && siteId) {
      // Reset view state whenever a site is (re)opened or language changes
      setCurrentImageIndex(0);
      setCurrentTab(0);
      setShowVrPlayer(false);
      fetchExtendedSiteData(siteId, language);
    } else if (!open) {
      // Ensure VR overlay is closed when dialog is closed
      setShowVrPlayer(false);
    }
  }, [open, siteId, language]);

  const fetchExtendedSiteData = async (id: number, lang: PreviewLanguageCode) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        'get_extended_heritage_site',
        {
          p_site_id: id,
          p_language_code: lang,
          p_user_id: null,
        }
      );

      if (rpcError) {
        throw rpcError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data) {
        // Map RPC response to our component structure
        const siteBasic = data.site_data || {};
        const ratings = data.ratings || {};

        // Normalize ticket types to ensure we always have a name and price
        const rawTickets = Array.isArray(data.ticket_types) ? data.ticket_types : [];
        const ticketTypes = rawTickets.map((t: any) => ({
          ticket_type_id: t.ticket_type_id ?? t.id ?? 0,
          name: t.name ?? t.ticket_name ?? t.ticket ?? 'Ticket',
          price: typeof t.price === 'number' ? t.price : Number(t.price ?? 0),
          is_active: typeof t.is_active === 'boolean' ? t.is_active : true,
        }));
        
        const mapped: MappedSiteData = {
          site_id: siteBasic.site_id || id,
          name: siteBasic.name || 'Heritage Site',
          short_desc: siteBasic.short_desc || '',
          full_desc: siteBasic.full_desc || '',
          label: siteBasic.label || '',
          city: siteBasic.city || '',
          state: siteBasic.state || '',
          country: siteBasic.country || 'India',
          rating: ratings.avg_rating || 0,
          total_reviews: ratings.ratings_count || 0,
          latitude: siteBasic.latitude || 0,
          longitude: siteBasic.longitude || 0,
          image_url: siteBasic.image_url || '',
          vr_link: siteBasic.vr_link || null,
          ar_mode_available: !!siteBasic.ar_mode_available,
          entry_type: siteBasic.entry_type || 'free',
          entry_fee: siteBasic.entry_fee || 0,
          // This value is already localized by get_site_basic_data, so we treat it as a label
          photography_allowed: siteBasic.photography_allowed || 'Free',
          photograph_amount: siteBasic.photograph_amount !== null && siteBasic.photograph_amount !== undefined 
            ? Number(siteBasic.photograph_amount) 
            : null,
          site_type: data.site_type && data.site_type !== 'null' ? data.site_type : null,
          accessibility: Array.isArray(data.accessibility) ? data.accessibility : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          etiquettes: Array.isArray(data.etiquettes) ? data.etiquettes : [],
          ticket_types: ticketTypes,
          visiting_hours: Array.isArray(data.visiting_hours) ? data.visiting_hours : [],
          images: Array.isArray(data.images) ? data.images : [],
          audios: Array.isArray(data.audios) ? data.audios : [],
          sitemap: Array.isArray(data.sitemap) ? data.sitemap : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        };
        
        console.log('Mapped site data:', mapped);
        console.log('Photography data:', {
          photography_allowed: mapped.photography_allowed,
          photograph_amount: mapped.photograph_amount,
          siteBasic_photography_allowed: siteBasic.photography_allowed,
          siteBasic_photograph_amount: siteBasic.photograph_amount,
        });
        setSiteData(mapped);
      } else {
        setError('Site not found');
      }
    } catch (err: any) {
      console.error('Error fetching extended site data:', err);
      setError(err?.message || 'Failed to load site data');
    } finally {
      setLoading(false);
    }
  };

  const getImages = (): string[] => {
    const imageList: string[] = [];
    // Images from the images array (already filtered to media_type='image' by RPC)
    if (siteData?.images?.length) {
      // Sort by is_primary desc, then position
      const sorted = [...siteData.images].sort((a, b) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.position || 0) - (b.position || 0);
      });
      sorted.forEach((img) => {
        if (img.media_url) {
          imageList.push(img.media_url);
        }
      });
    }
    // Add main image_url if not already included
    if (siteData?.image_url && !imageList.includes(siteData.image_url)) {
      imageList.unshift(siteData.image_url);
    }
    return imageList.length > 0 ? imageList : ['https://picsum.photos/400/300?random=' + siteId];
  };

  const formatTime = (time24: string | null): string => {
    if (!time24) return 'N/A';
    try {
      const parts = time24.split(':');
      if (parts.length < 2) return time24;
      const hour = parseInt(parts[0]);
      const minute = parts[1];
      if (hour === 0) return `12:${minute} AM`;
      if (hour < 12) return `${hour}:${minute} AM`;
      if (hour === 12) return `12:${minute} PM`;
      return `${hour - 12}:${minute} PM`;
    } catch {
      return time24;
    }
  };

  const getOperatingHours = (): string => {
    if (!siteData?.visiting_hours?.length) return 'Not available';
    const firstHour = siteData.visiting_hours[0];
    if (firstHour.is_closed) return 'Closed';
    return `${formatTime(firstHour.open_time)} - ${formatTime(firstHour.close_time)}`;
  };

  const getOpeningDaysLabel = (): string => {
    if (!siteData || !siteData.visiting_hours || siteData.visiting_hours.length === 0) {
      return 'Not available';
    }

    const DAY_NAMES_MAP: Record<PreviewLanguageCode, string[]> = {
      EN: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      HI: ['सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार', 'रविवार'],
      GU: ['સોમવાર', 'મંગળવાર', 'બુધવાર', 'ગુરુવાર', 'શુક્રવાર', 'શનિવાર', 'રવિવાર'],
      JA: ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日', '日曜日'],
      ES: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
      FR: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
    };

    const dayNames = DAY_NAMES_MAP[language] || DAY_NAMES_MAP.EN;
    const openDays = siteData.visiting_hours
      .filter((h) => !h.is_closed)
      .map((h) => h.day_of_week)
      .filter((d) => typeof d === 'number' && d >= 1 && d <= 7)
      .sort((a, b) => a - b);

    if (!openDays.length) return 'Closed';

    const firstDay = dayNames[openDays[0] - 1];
    const lastDay = dayNames[openDays[openDays.length - 1] - 1];

    // If open all week
    if (openDays.length === 7 && openDays[0] === 1 && openDays[6] === 7) {
      return 'Monday - Sunday';
    }

    // If open on a single day
    if (openDays.length === 1) {
      return firstDay;
    }

    // If open on a continuous range of days (e.g., Mon-Fri)
    const isContiguous = openDays.every((day, index) =>
      index === 0 ? true : day === openDays[index - 1] + 1
    );

    if (isContiguous) {
      return `${firstDay} - ${lastDay}`;
    }

    // Non-contiguous days, list them comma-separated (e.g., Mon, Wed, Fri)
    return openDays.map((d) => dayNames[d - 1]).join(', ');
  };

  // Returns a high-level entry type label: "Paid" | "Free" | "External"
  const getEntryFee = (): string => {
    if (siteData?.ticket_types?.length) {
      const activeTickets = siteData.ticket_types.filter((t) => t.is_active);
      if (activeTickets.length > 0) {
        const prices = activeTickets.map((t) => t.price).filter((p) => p > 0);
        const hasExternal = activeTickets.some((t) =>
          (t.name || '').toLowerCase().includes('external')
        );

        // Any positive price means overall entry is paid
        if (prices.length > 0) {
          return 'Paid';
        }

        // No paid tickets but we do have an "External" ticket – treat as External
        if (hasExternal) {
          return 'External';
        }

        // Fallback when everything is actually free
        return 'Free';
      }
    }
    return 'Free';
  };

  const handleOpenDirections = () => {
    if (!siteData) return;

    const { latitude, longitude } = siteData;
    if (latitude == null || longitude == null) {
      console.warn('No latitude/longitude available for this site');
      return;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.warn('Invalid latitude/longitude values:', latitude, longitude);
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${lat},${lng}`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const images = getImages();

  const goToNextImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const goToPreviousImage = () => {
    if (!images.length) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const renderOverviewTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Short Description */}
      <Typography sx={{ fontSize: 12, color: '#333', mb: 2, lineHeight: 1.5 }}>
        {siteData?.short_desc || 'A beautiful heritage site with rich history and cultural significance.'}
      </Typography>

      {/* VR Experience Section */}
      {siteData?.vr_link && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{t('immersiveExperience')}</Typography>
          <Box
            sx={{
              height: 140,
              borderRadius: 2,
              overflow: 'hidden',
              position: 'relative',
              backgroundImage: `url(${images[0]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#7B1FA2',
                borderRadius: 10,
                px: 1,
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>{t('vrAvailable')}</Typography>
            </Box>

            {/* Buttons Row */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              {/* 360 Button */}
              <Box
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: 1.5,
                  px: 2.5,
                  py: 0.75,
                  minWidth: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                  border: '1px solid #e0e0e0',
                  cursor: 'pointer',
                }}
                onClick={() => setShowVrPlayer(true)}
              >
                <AutorenewIcon sx={{ fontSize: 18, color: '#FF9800', mr: 0.5 }} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
                  {t('viewIn360')}
                </Typography>
              </Box>

              {/* AR Button (only when ar_mode is available) */}
              {siteData.ar_mode_available && (
                <Box
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: 1.5,
                    px: 2.5,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.75,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                    border: '1px solid #e0e0e0',
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowVrPlayer(true)}
                >
                  <ViewInArIcon sx={{ fontSize: 18, color: '#FF9800', mr: 0.5 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
                    AR Mode
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Quick Info */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>{t('quickInfo')}</Typography>
      <Stack direction="row" justifyContent="space-around" sx={{ mb: 3 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 0.5,
            }}
          >
            <AccessTimeIcon sx={{ color: '#FF9800', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: '#666' }}>{t('openHours')}</Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>{getOperatingHours()}</Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 0.5,
            }}
          >
            <AttachMoneyIcon sx={{ color: '#FF9800', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: '#666' }}>{t('entryFee')}</Typography>
          {(() => {
            const fee = getEntryFee();

            let label: string;
            if (fee === 'Free') {
              label = t('free');
            } else if (fee === 'External') {
              // Simple English label for external booking
              label = 'External';
            } else if (fee === 'Paid') {
              // High-level paid label without amount
              label = 'Paid';
            } else {
              // Fallback, should not normally happen
              label = fee;
            }

            return (
              <Typography sx={{ fontSize: 10, color: '#999' }}>{label}</Typography>
            );
          })()}
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 0.5,
            }}
          >
            <CameraAltIcon sx={{ color: '#FF9800', fontSize: 20 }} />
          </Box>
          <Typography sx={{ fontSize: 11, color: '#666' }}>{t('photography')}</Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>
            {(() => {
              const label = siteData?.photography_allowed || t('free');
              const amount = siteData?.photograph_amount;

              // If there is a valid positive amount, show "<label> ₹<amount>"
              if (amount !== null && amount !== undefined && !Number.isNaN(Number(amount)) && Number(amount) > 0) {
                return `${label} ₹${Number(amount)}`;
              }

              // Otherwise show the label coming from the backend (already localized)
              return label;
            })()}
          </Typography>
        </Box>
      </Stack>

      {/* Getting There */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>{t('gettingThere')}</Typography>
      <Button
        variant="contained"
        startIcon={<DirectionsIcon />}
        onClick={handleOpenDirections}
        sx={{
          backgroundColor: '#FF9800',
          color: '#fff',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 12,
          '&:hover': { backgroundColor: '#F57C00' },
        }}
      >
        {t('getDirections')}
      </Button>
    </Box>
  );

  const renderAboutTab = () => (
    <Box sx={{ p: 2 }}>
      {/* History & Architecture */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>{t('historyArchitecture')}</Typography>
      <Typography sx={{ fontSize: 12, color: '#333', mb: 2, lineHeight: 1.5 }}>
        {siteData?.full_desc || 'This heritage site has a rich history and architectural significance.'}
      </Typography>

      {/* Site Type */}
      {siteData?.site_type && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Site Type</Typography>
          <Chip
            label={siteData.site_type.display_name}
            size="small"
            sx={{ backgroundColor: '#E1BEE7', color: '#7B1FA2', fontSize: 10 }}
          />
        </Box>
      )}

      {/* Accessibility */}
      {siteData && Array.isArray(siteData.accessibility) && siteData.accessibility.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>{t('accessibility')}</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {siteData.accessibility.map((item, idx) => (
              <Chip
                key={idx}
                label={item.display_name}
                size="small"
                sx={{ backgroundColor: '#C8E6C9', color: '#2E7D32', fontSize: 10 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Etiquettes */}
      {siteData && Array.isArray(siteData.etiquettes) && siteData.etiquettes.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>{t('etiquettes')}</Typography>
          <Stack spacing={0.5}>
            {siteData.etiquettes.map((item, idx) => (
              <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#FF9800' }} />
                <Typography sx={{ fontSize: 11, color: '#333' }}>{item.display_name}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      )}

      {/* Experience */}
      {siteData && Array.isArray(siteData.experience) && siteData.experience.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>{t('experience')}</Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {siteData.experience.map((item, idx) => (
              <Chip
                key={idx}
                label={item.display_name}
                size="small"
                sx={{ backgroundColor: '#BBDEFB', color: '#1565C0', fontSize: 10 }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Sitemap */}
      {(() => {
        const sitemapItems = siteData?.sitemap?.filter(
          (m) => m && m.media_url && String(m.media_url).trim().length > 0
        );
        if (!sitemapItems || sitemapItems.length === 0) return null;
        return (
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Sitemap</Typography>
            <Stack spacing={1}>
              {sitemapItems.map((mapItem, idx) => (
                <Box
                  key={mapItem.media_id ?? idx}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid {#e0e0e0',
                  }}
                >
                  <Box
                    component="img"
                    src={mapItem.media_url}
                    alt={`Sitemap ${idx + 1}`}
                    sx={{
                      width: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Box>
        );
      })()}
    </Box>
  );

  const renderPlanVisitTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Opening Hours & Entry */}
      <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, p: 2, mb: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666', mb: 1 }}>
          {t('openingHoursEntry')}
        </Typography>
        <Typography sx={{ fontSize: 11, color: '#666', fontWeight: 500, mb: 1 }}>
          {getOpeningDaysLabel()} • {getOperatingHours()}
        </Typography>
        <Divider sx={{ my: 1 }} />
        {siteData?.ticket_types?.filter((t) => t.is_active).map((ticket, idx) => (
          <Stack key={idx} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography sx={{ fontSize: 11, color: '#666' }}>{ticket.name}</Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 500 }}>
              {ticket.price > 0 ? `₹${ticket.price}` : 'Free'}
            </Typography>
          </Stack>
        ))}
      </Box>

      {/* Book Tickets */}
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666', mb: 1 }}>{t('bookTickets')}</Typography>
      <Box sx={{ border: '1px solid #e0e0e0', borderRadius: 2, p: 2, mb: 2 }}>
        <Button
          fullWidth
          variant="contained"
          sx={{
            backgroundColor: '#FFC107',
            color: '#fff',
            borderRadius: 2,
            textTransform: 'none',
            fontSize: 12,
            fontWeight: 500,
            '&:hover': { backgroundColor: '#FFB300' },
          }}
        >
          {(() => {
            const fee = getEntryFee();
            const label = fee === 'Free' ? t('free') : fee;
            return `${t('bookNow')} - ${label}`;
          })()}
        </Button>
      </Box>
    </Box>
  );

  const renderReviewsTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Rating Summary */}
      <Box sx={{ backgroundColor: '#fff', borderRadius: 2, p: 2, mb: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: 28, fontWeight: 700 }}>{siteData?.rating || 0}</Typography>
          <Box>
            <Typography sx={{ fontSize: 10, color: '#666' }}>
              {siteData?.total_reviews || 0} reviews
            </Typography>
            <Rating value={siteData?.rating || 0} readOnly size="small" />
          </Box>
        </Stack>
      </Box>

      {/* Reviews List */}
      {siteData && Array.isArray(siteData.reviews) && siteData.reviews.length > 0 ? (
        siteData.reviews.slice(0, 3).map((review, idx) => (
          <Box key={idx} sx={{ backgroundColor: '#fff', borderRadius: 2, p: 2, mb: 1, border: '1px solid #e0e0e0' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#FFE0B2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: 12, color: '#E65100', fontWeight: 600 }}>
                  {(review.reviewer_name || 'A')[0].toUpperCase()}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{review.reviewer_name || 'Anonymous'}</Typography>
                <Rating value={review.rating || 0} readOnly size="small" sx={{ fontSize: 12 }} />
              </Box>
            </Stack>
            {review.text && (
              <Typography sx={{ fontSize: 11, color: '#333' }}>{review.text}</Typography>
            )}
          </Box>
        ))
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Typography sx={{ fontSize: 12, color: '#666' }}>{t('noReviewsYet')}</Typography>
          <Typography sx={{ fontSize: 11, color: '#999' }}>{t('beFirstReview')}</Typography>
        </Box>
      )}

      <Button
        fullWidth
        variant="contained"
        sx={{
          backgroundColor: '#FF9800',
          color: '#fff',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 12,
          mt: 2,
          '&:hover': { backgroundColor: '#F57C00' },
        }}
      >
        {t('writeReview')}
      </Button>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, pb: 1 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Mobile App Preview
          </Typography>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <Select
              value={language}
              onChange={(e) => setLanguage(e.target.value as PreviewLanguageCode)}
              displayEmpty
              sx={{ fontSize: 12, height: 32 }}
            >
              {PREVIEW_LANGUAGES.map((lang) => (
                <MenuItem key={lang.code} value={lang.code}>
                  {lang.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#f5f5f5' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
            <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
            <Button onClick={() => siteId && fetchExtendedSiteData(siteId, language)}>Retry</Button>
          </Box>
        ) : siteData ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: 375,
              mx: 'auto',
              backgroundColor: '#fff',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '8px solid #333',
              borderRadius: '24px',
              position: 'relative',
            }}
          >
            {/* VR Video Overlay */}
            {showVrPlayer && siteData?.vr_link && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 20,
                  backgroundColor: '#000',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 1.5,
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0.3))',
                  }}
                >
                  <IconButton
                    onClick={() => setShowVrPlayer(false)}
                    sx={{ color: '#fff' }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography sx={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                    {siteData.name} - 360° View
                  </Typography>
                  <Box width={40} />
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#000',
                  }}
                  onClick={() => setShowVrPlayer(false)}
                >
                  <video
                    src={siteData.vr_link}
                    style={{ width: '100%', height: '100%' }}
                    controls
                    autoPlay
                    playsInline
                    controlsList="nodownload"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Box>
              </Box>
            )}
            {/* Image Carousel */}
            <Box
              sx={{
                height: 200,
                position: 'relative',
                backgroundImage: `url(${images[currentImageIndex]})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
              }}
              onClick={images.length > 1 ? goToNextImage : undefined}
              onTouchStart={(e) => {
                if (e.touches && e.touches[0]) {
                  setTouchStartX(e.touches[0].clientX);
                }
              }}
              onTouchEnd={(e) => {
                if (!touchStartX) return;
                const touchEndX = e.changedTouches[0]?.clientX || 0;
                const deltaX = touchEndX - touchStartX;
                if (Math.abs(deltaX) > 40) {
                  if (deltaX < 0) {
                    goToNextImage();
                  } else {
                    goToPreviousImage();
                  }
                }
                setTouchStartX(null);
              }}
            >
              {/* Back Button */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 12,
                  left: 12,
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 20 }} />
              </Box>

              {/* Share & Favorite */}
              <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 12 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShareIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  {isWishlisted ? (
                    <FavoriteIcon sx={{ fontSize: 18, color: 'red' }} />
                  ) : (
                    <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                  )}
                </Box>
              </Stack>

              {/* Image Counter */}
              {images.length > 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: siteData.vr_link ? 50 : 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: 10, color: '#fff' }}>
                    {currentImageIndex + 1} / {images.length}
                  </Typography>
                </Box>
              )}

              {/* VR / AR Buttons */}
              {siteData.vr_link && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  {/* 360 Button */}
                  <Box
                    sx={{
                      backgroundColor: '#fff',
                      borderRadius: 1.5,
                      px: 2.5,
                      py: 0.75,
                      minWidth: 120,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.75,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                      border: '1px solid #e0e0e0',
                      cursor: 'pointer',
                    }}
                    onClick={() => setShowVrPlayer(true)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AutorenewIcon sx={{ fontSize: 18, color: '#FF9800', mr: 0.5 }} />
                    </Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
                      {t('viewIn360')}
                    </Typography>
                  </Box>

                  {/* AR Button (only when ar_mode is available) */}
                  {siteData.ar_mode_available && (
                    <Box
                      sx={{
                        backgroundColor: '#fff',
                        borderRadius: 1.5,
                        px: 2.5,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.75,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                      }}
                      onClick={() => setShowVrPlayer(true)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ViewInArIcon sx={{ fontSize: 18, color: '#FF9800', mr: 0.5 }} />
                      </Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#444' }}>
                        AR Mode
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            {/* Site Info Header */}
            <Box sx={{ p: 2, pb: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 0.5 }}>
                    {siteData.name}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: '#FFF4E1',
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <StarIcon sx={{ fontSize: 14, color: '#FF9800' }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 500 }}>{siteData.rating || 0}</Typography>
                </Box>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1 }}>
                <LocationOnIcon sx={{ fontSize: 12, color: '#FF9800' }} />
                <Typography sx={{ fontSize: 11, color: '#666' }}>
                  {[siteData.city, siteData.state, siteData.country].filter(Boolean).join(', ') || 'India'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {siteData.label && (
                  <Chip
                    label={siteData.label}
                    size="small"
                    sx={{ height: 20, fontSize: 10, backgroundColor: '#BBDEFB', color: '#1565C0' }}
                  />
                )}
                <Chip
                  label="Open Now"
                  size="small"
                  sx={{ height: 20, fontSize: 10, backgroundColor: '#C8E6C9', color: '#2E7D32' }}
                />
                {siteData.vr_link && (
                  <Chip
                    label="VR Available"
                    size="small"
                    sx={{ height: 20, fontSize: 10, backgroundColor: '#E1BEE7', color: '#7B1FA2' }}
                  />
                )}
              </Stack>
            </Box>

            {/* Tabs */}
            <Tabs
              value={currentTab}
              onChange={(_, v) => setCurrentTab(v)}
              variant="fullWidth"
              sx={{
                '& .MuiTab-root': {
                  fontSize: 11,
                  minHeight: 36,
                  textTransform: 'none',
                  color: '#666',
                },
                '& .Mui-selected': { color: '#FF9800' },
                '& .MuiTabs-indicator': { backgroundColor: '#FF9800' },
              }}
            >
              <Tab label={t('tabOverview')} />
              <Tab label={t('tabAbout')} />
              <Tab label={t('tabPlanVisit')} />
              <Tab label={t('tabReviews')} />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ height: 280, overflow: 'auto', backgroundColor: '#fff' }}>
              {currentTab === 0 && renderOverviewTab()}
              {currentTab === 1 && renderAboutTab()}
              {currentTab === 2 && renderPlanVisitTab()}
              {currentTab === 3 && renderReviewsTab()}
            </Box>

            {/* Bottom Navigation */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-around',
                py: 1,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fff',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <HomeIcon sx={{ fontSize: 20, color: '#666' }} />
                <Typography sx={{ fontSize: 9, color: '#666' }}>Home</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <ExploreIcon sx={{ fontSize: 20, color: '#666' }} />
                <Typography sx={{ fontSize: 9, color: '#666' }}>Explore</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <CardGiftcardIcon sx={{ fontSize: 20, color: '#666' }} />
                <Typography sx={{ fontSize: 9, color: '#666' }}>Packages</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 20, color: '#666' }} />
                <Typography sx={{ fontSize: 9, color: '#666' }}>Profile</Typography>
              </Box>
            </Box>
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default MobilePreviewDialog;

