import {
  Box,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { HeritageSite } from '@/types';

interface HeritageSiteViewDialogProps {
  open: boolean;
  site: HeritageSite | null;
  onClose: () => void;
}

const HeritageSiteViewDialog: React.FC<HeritageSiteViewDialogProps> = ({ open, site, onClose }) => {
  if (!site) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Heritage Site Overview
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: '#fdf8f4' }}>
        <Stack spacing={3}>
          <Box
            sx={{
              backgroundColor: '#fff',
              borderRadius: 3,
              p: 3,
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#3F3D56', mb: 1 }}>
              {site.name_default}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 2 }}>
              {site.short_desc_default || 'No short description provided.'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {site.site_type && (
                <Chip label={site.site_type} sx={{ backgroundColor: '#DA855210', color: '#DA8552', fontWeight: 600 }} />
              )}
              {site.experience && (
                Array.isArray(site.experience) ? (
                  site.experience.map((exp, idx) => (
                    <Chip
                      key={idx}
                      label={`Experience: ${exp.replace(/_/g, ' ')}`}
                      sx={{ backgroundColor: '#3F3D5610', color: '#3F3D56', fontWeight: 600 }}
                    />
                  ))
                ) : (
                  <Chip
                    label={`Experience: ${site.experience.replace(/_/g, ' ')}`}
                    sx={{ backgroundColor: '#3F3D5610', color: '#3F3D56', fontWeight: 600 }}
                  />
                )
              )}
              <Chip
                label={site.is_active ? 'Active' : 'Inactive'}
                color={site.is_active ? 'success' : 'default'}
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          </Box>

          <Box sx={{ backgroundColor: '#fff', borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Location & Access
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Latitude
                </Typography>
                <Typography variant="body1">{site.latitude ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Longitude
                </Typography>
                <Typography variant="body1">{site.longitude ?? '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Entry Type
                </Typography>
                <Typography variant="body1">{site.entry_type ? site.entry_type.toUpperCase() : '—'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">
                  Entry Fee
                </Typography>
                <Typography variant="body1">
                  {site.entry_type === 'paid' ? `₹${site.entry_fee ?? 0}` : 'Free Entry'}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Accessibility
                </Typography>
                <Typography variant="body1">{site.accessibility || '—'}</Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ backgroundColor: '#fff', borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Detailed Description
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
              {site.full_desc_default || 'No detailed description provided.'}
            </Typography>
          </Box>

          <Box sx={{ backgroundColor: '#fff', borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Digital Experiences
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  VR Experience Link
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {site.vr_link || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  QR Landing Link
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  {site.qr_link || '—'}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ backgroundColor: '#fff', borderRadius: 3, p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              SEO Metadata
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Meta Title
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {site.meta_title_def || '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Meta Description
            </Typography>
            <Typography variant="body2">
              {site.meta_description_def || '—'}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default HeritageSiteViewDialog;

