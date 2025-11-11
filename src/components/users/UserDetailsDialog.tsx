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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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

  useEffect(() => {
    if (open && userId) {
      fetchUserDetails();
      fetchUserBookings();
    } else {
      setUserDetails(null);
      setUserBookings([]);
      setError('');
    }
  }, [open, userId]);

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
    try {
      const bookings = await UserService.getUserBookings(userId);
      setUserBookings(bookings);
    } catch (err: any) {
      console.error('Error fetching user bookings:', err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatModuleName = (module: string) => {
    const names: Record<string, string> = {
      hotel: 'Hotel',
      tour: 'Tour',
      event: 'Event',
      food: 'Food',
      guide: 'Guide',
    };
    return names[module] || module;
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
                  User Bookings ({userBookings.length})
                </Typography>
                {bookingsLoading ? (
                  <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                  </Box>
                ) : userBookings.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No bookings found for this user.
                  </Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Reference</TableCell>
                          <TableCell>Module</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Payment</TableCell>
                          <TableCell>Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {userBookings.map((booking) => (
                          <TableRow key={`${booking.module_type}-${booking.booking_id}`}>
                            <TableCell>
                              <Typography variant="body2" fontWeight="medium">
                                {booking.booking_reference}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatModuleName(booking.module_type)}</TableCell>
                            <TableCell>
                              <Chip
                                label={booking.status}
                                color={getStatusColor(booking.status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={booking.payment_status}
                                color={getStatusColor(booking.payment_status) as any}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              {booking.currency} {booking.total_amount.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {format(new Date(booking.created_at), 'MMM dd, yyyy')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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

