import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
} from '@mui/material';
import { UserDetails } from '@/services/user.service';
import { Booking } from '@/services/booking.service';
import { UserService } from '@/services/user.service';
import { format } from 'date-fns';

interface UserDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  loading?: boolean;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({ open, onClose, userId, loading = false }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState('');
  const [bookingsError, setBookingsError] = useState('');

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
    } else {
      setUserDetails(null);
      setUserBookings([]);
      setError('');
      setBookingsError('');
    }
  }, [open, userId]);

  useEffect(() => {
    if (open && userId && userDetails) {
      fetchUserBookings();
    }
  }, [open, userId, userDetails]);

  const fetchUserDetails = async () => {
    if (!userId) return;
    setDetailsLoading(true);
    setError('');
    try {
      const details = await UserService.getUserDetails(userId);
      if (details) {
        setUserDetails(details);
      } else {
        setError('User not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    if (!userId) return;
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const userTypeName = userDetails?.user_type_name || '';
      const bookings = await UserService.getUserBookings(userId, userTypeName);
      setUserBookings(bookings);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch user bookings';
      setBookingsError(errorMessage);
      console.error('Error fetching user bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const formatModuleName = (module: string) => {
    const names: Record<string, string> = {
      hotel: 'Hotel',
      tour: 'Tour',
      event: 'Event',
      food: 'Food',
      guide: 'Guide',
      product: 'Artisan Artwork Purchase',
    };
    return names[module] || module;
  };

  // Get relevant booking types based on user type
  const getRelevantBookingTypes = (): string[] => {
    if (!userDetails) return ['food', 'tour', 'hotel', 'event', 'product'];
    
    const userTypeName = (userDetails.user_type_name || '').toLowerCase();
    
    // Check for hotel-related user types
    if (userTypeName.includes('hotel') || userTypeName.includes('accommodation')) {
      return ['hotel'];
    }
    
    // Check for food vendor user types
    if (userTypeName.includes('food') || userTypeName.includes('beverage') || userTypeName.includes('vendor')) {
      return ['food'];
    }
    
    // Check for event organizer user types
    if (userTypeName.includes('event') || userTypeName.includes('organizer')) {
      return ['event'];
    }
    
    // Check for tour operator user types
    if (userTypeName.includes('tour') || userTypeName.includes('operator')) {
      return ['tour'];
    }
    
    // Check for guide user types
    if (userTypeName.includes('guide') || userTypeName.includes('local')) {
      return ['guide'];
    }
    
    // Check for artisan user types
    if (userTypeName.includes('artisan') || userTypeName.includes('artist')) {
      return ['product'];
    }
    
    // Default: show all booking types
    return ['food', 'tour', 'hotel', 'event', 'guide', 'product'];
  };

  // Calculate booking counts grouped by entity name
  const getBookingCountsByEntity = () => {
    const relevantTypes = getRelevantBookingTypes();
    const entityCounts: Array<{ type: string; name: string; count: number }> = [];
    const entityMap = new Map<string, number>();

    // Group bookings by entity name
    userBookings.forEach((booking) => {
      const type = booking.module_type;
      if (relevantTypes.includes(type)) {
        const entityName = (booking as any).entity_name || formatModuleName(type);
        const key = `${type}:${entityName}`;
        entityMap.set(key, (entityMap.get(key) || 0) + 1);
      }
    });

    // Convert map to array
    entityMap.forEach((count, key) => {
      const [type, name] = key.split(':');
      entityCounts.push({ type, name, count });
    });

    // Sort by count descending, then by name
    entityCounts.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.name.localeCompare(b.name);
    });

    return entityCounts;
  };

  // Calculate total booking count
  const getTotalBookingCount = () => {
    return userBookings.length;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        {loading || detailsLoading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : userDetails ? (
          <Box>
            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
              <Tab label="Profile" />
              <Tab label="Bookings" />
            </Tabs>

            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    src={userDetails.avatar_url}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  >
                    {userDetails.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h5">{userDetails.full_name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userDetails.email}
                    </Typography>
                    <Chip
                      label={userDetails.is_verified ? 'Verified' : 'Unverified'}
                      color={userDetails.is_verified ? 'success' : 'default'}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User ID
                    </Typography>
                    <Typography variant="body1">{userDetails.user_id}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Type
                    </Typography>
                    <Typography variant="body1">{userDetails.user_type_name || `Type ${userDetails.user_type_id}`}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{userDetails.email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{userDetails.phone || '-'}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Language
                    </Typography>
                    <Typography variant="body1">{userDetails.language_code.toUpperCase()}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created At
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(userDetails.created_at), 'PPpp')}
                    </Typography>
                  </Grid>
                </Grid>

                {userDetails.tags && userDetails.tags.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {userDetails.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>
                  </>
                )}

                {(userDetails.is_facebook_connected ||
                  userDetails.is_instagram_connected ||
                  userDetails.is_twitter_connected) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Social Connections
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {userDetails.is_facebook_connected && (
                        <Chip label="Facebook" color="primary" size="small" />
                      )}
                      {userDetails.is_instagram_connected && (
                        <Chip label="Instagram" color="secondary" size="small" />
                      )}
                      {userDetails.is_twitter_connected && (
                        <Chip label="Twitter" color="info" size="small" />
                      )}
                    </Box>
                  </>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  User Bookings Summary
                </Typography>
                {bookingsLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : bookingsError ? (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {bookingsError}
                  </Alert>
                ) : (
                  <Box>
                    {userBookings.length === 0 ? (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        No bookings found for this user.
                      </Typography>
                    ) : (
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        {getBookingCountsByEntity().map((entity, index) => (
                          <Grid item xs={12} sm={6} md={4} key={`${entity.type}-${entity.name}-${index}`}>
                            <Box
                              sx={{
                                p: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 2,
                                textAlign: 'center',
                              }}
                            >
                              <Typography variant="h4" color="primary" fontWeight="bold">
                                {entity.count}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {entity.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                {formatModuleName(entity.type)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2,
                              textAlign: 'center',
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                            }}
                          >
                            <Typography variant="h4" fontWeight="bold">
                              {getTotalBookingCount()}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                              Total Bookings
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserDetailsDialog;

