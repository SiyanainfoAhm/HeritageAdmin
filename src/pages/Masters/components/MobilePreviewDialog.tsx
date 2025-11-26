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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
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
  entry_type: string;
  entry_fee: number;
  photography_allowed: string;
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

const MobilePreviewDialog: React.FC<MobilePreviewDialogProps> = ({ open, siteId, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [siteData, setSiteData] = useState<MappedSiteData | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (open && siteId) {
      fetchExtendedSiteData(siteId);
    }
  }, [open, siteId]);

  const fetchExtendedSiteData = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc('get_extended_heritage_site', {
        p_site_id: id,
        p_language_code: 'EN',
        p_user_id: null,
      });

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
          entry_type: siteBasic.entry_type || 'free',
          entry_fee: siteBasic.entry_fee || 0,
          photography_allowed: siteBasic.photography_allowed || 'Free',
          site_type: data.site_type && data.site_type !== 'null' ? data.site_type : null,
          accessibility: Array.isArray(data.accessibility) ? data.accessibility : [],
          experience: Array.isArray(data.experience) ? data.experience : [],
          etiquettes: Array.isArray(data.etiquettes) ? data.etiquettes : [],
          ticket_types: Array.isArray(data.ticket_types) ? data.ticket_types : [],
          visiting_hours: Array.isArray(data.visiting_hours) ? data.visiting_hours : [],
          images: Array.isArray(data.images) ? data.images : [],
          audios: Array.isArray(data.audios) ? data.audios : [],
          sitemap: Array.isArray(data.sitemap) ? data.sitemap : [],
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
        };
        
        console.log('Mapped site data:', mapped);
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

  const getEntryFee = (): string => {
    if (siteData?.ticket_types?.length) {
      const activeTickets = siteData.ticket_types.filter((t) => t.is_active);
      if (activeTickets.length > 0) {
        const prices = activeTickets.map((t) => t.price).filter((p) => p > 0);
        if (prices.length > 0) {
          const minPrice = Math.min(...prices);
          return `₹${minPrice}`;
        }
        return 'Free';
      }
    }
    return 'Free';
  };

  const images = getImages();

  const renderOverviewTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Short Description */}
      <Typography sx={{ fontSize: 12, color: '#333', mb: 2, lineHeight: 1.5 }}>
        {siteData?.short_desc || 'A beautiful heritage site with rich history and cultural significance.'}
      </Typography>

      {/* VR Experience Section */}
      {siteData?.vr_link && (
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>Immersive Experience</Typography>
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
              <Typography sx={{ fontSize: 10, color: '#fff', fontWeight: 600 }}>VR Available</Typography>
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: 12,
                left: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
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
                <PlayArrowIcon sx={{ color: '#7B1FA2', fontSize: 24 }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#fff', fontWeight: 700 }}>View in 360°</Typography>
                <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.9)' }}>Tap to experience</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      {/* Quick Info */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>Quick Info</Typography>
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
          <Typography sx={{ fontSize: 11, color: '#666' }}>Open Hours</Typography>
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
          <Typography sx={{ fontSize: 11, color: '#666' }}>Entry Fee</Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>{getEntryFee()}</Typography>
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
          <Typography sx={{ fontSize: 11, color: '#666' }}>Photography</Typography>
          <Typography sx={{ fontSize: 10, color: '#999' }}>{siteData?.photography_allowed || 'Free'}</Typography>
        </Box>
      </Stack>

      {/* Getting There */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1.5 }}>Getting There</Typography>
      <Button
        variant="contained"
        startIcon={<DirectionsIcon />}
        sx={{
          backgroundColor: '#FF9800',
          color: '#fff',
          borderRadius: 2,
          textTransform: 'none',
          fontSize: 12,
          '&:hover': { backgroundColor: '#F57C00' },
        }}
      >
        Get Directions
      </Button>
    </Box>
  );

  const renderAboutTab = () => (
    <Box sx={{ p: 2 }}>
      {/* History & Architecture */}
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: 1 }}>History & Architecture</Typography>
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
      {siteData?.accessibility?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Accessibility</Typography>
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
      {siteData?.etiquettes?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Etiquettes</Typography>
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
      {siteData?.experience?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>Experience</Typography>
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
    </Box>
  );

  const renderPlanVisitTab = () => (
    <Box sx={{ p: 2 }}>
      {/* Opening Hours & Entry */}
      <Box sx={{ backgroundColor: '#f5f5f5', borderRadius: 2, p: 2, mb: 2 }}>
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666', mb: 1 }}>Opening Hours & Entry</Typography>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 11, color: '#666' }}>Monday - Sunday</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 500 }}>{getOperatingHours()}</Typography>
        </Stack>
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
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#666', mb: 1 }}>Book Tickets</Typography>
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
          Book Now - {getEntryFee()}
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
      {siteData?.reviews?.length > 0 ? (
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
          <Typography sx={{ fontSize: 12, color: '#666' }}>No reviews yet</Typography>
          <Typography sx={{ fontSize: 11, color: '#999' }}>Be the first to share your experience!</Typography>
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
        Write a Review
      </Button>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2, pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Mobile App Preview
        </Typography>
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
            <Button onClick={() => siteId && fetchExtendedSiteData(siteId)}>Retry</Button>
          </Box>
        ) : siteData ? (
          <Box
            sx={{
              width: '100%',
              maxWidth: 375,
              mx: 'auto',
              backgroundColor: '#fff',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '8px solid #333',
              borderRadius: '24px',
            }}
          >
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

              {/* VR Button */}
              {siteData.vr_link && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    px: 2,
                    py: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#FF9800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PlayArrowIcon sx={{ fontSize: 16, color: '#fff' }} />
                  </Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>View in 360°</Typography>
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
              <Tab label="Overview" />
              <Tab label="About" />
              <Tab label="Plan Visit" />
              <Tab label="Reviews" />
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

