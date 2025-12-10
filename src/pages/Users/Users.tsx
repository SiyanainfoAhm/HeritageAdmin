import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Alert,
  Menu,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { UserService, UserFilters } from '@/services/user.service';
import { User, UserType } from '@/types';
import UserDetailsDialog from '@/components/users/UserDetailsDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import DeleteConfirmDialog from '@/components/users/DeleteConfirmDialog';
import { format } from 'date-fns';
import { getDefaultDateRange } from '@/utils/dateRange';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter states
  const [filters, setFilters] = useState<UserFilters>(() => {
    const { startDate, endDate } = getDefaultDateRange();
    return {
      userTypeId: undefined,
      isVerified: undefined,
      startDate,
      endDate,
      searchTerm: '',
    };
  });

  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuUser, setMenuUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchUserTypes();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await UserService.getAllUsers(filters);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const types = await UserService.getUserTypes();
      setUserTypes(types.map((t) => ({ user_type_id: t.user_type_id, type_key: '', type_name: t.type_name })));
    } catch (err) {
      console.error('Error fetching user types:', err);
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleToggleVerification = async (user: User) => {
    setActionLoading(true);
    try {
      const result = await UserService.toggleUserVerification(user.user_id, !user.is_verified);
      if (result.success) {
        setSuccess(`User ${!user.is_verified ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        setError(result.error || 'Failed to update user verification');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
      setMenuAnchor(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      const result = await UserService.deleteUser(selectedUser.user_id);
      if (result.success) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setDeleteDialogOpen(false);
        setSelectedUser(null);
      } else {
        setError(result.error || 'Failed to delete user');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setMenuAnchor(event.currentTarget);
    setMenuUser(user);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuUser(null);
  };

  const sortedUsers = useMemo(() => {
    const sorted = [...users];
    
    sorted.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'user_id':
          aValue = a.user_id;
          bValue = b.user_id;
          break;
        case 'full_name':
          aValue = a.full_name?.toLowerCase() || '';
          bValue = b.full_name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'phone':
          aValue = a.phone?.toLowerCase() || '';
          bValue = b.phone?.toLowerCase() || '';
          break;
        case 'user_type_name':
          aValue = a.user_type_name?.toLowerCase() || '';
          bValue = b.user_type_name?.toLowerCase() || '';
          break;
        case 'is_verified':
          aValue = a.is_verified ? 1 : 0;
          bValue = b.is_verified ? 1 : 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [users, sortBy, sortOrder]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by name, email, or phone"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value || undefined })}
            size="small"
            sx={{ flexGrow: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>User Type</InputLabel>
            <Select
              value={filters.userTypeId || ''}
              label="User Type"
              onChange={(e) => setFilters({ ...filters, userTypeId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <MenuItem value="">All Types</MenuItem>
              {userTypes.map((type) => (
                <MenuItem key={type.user_type_id} value={type.user_type_id}>
                  {type.type_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.isVerified === undefined ? '' : filters.isVerified ? 'verified' : 'unverified'}
              label="Status"
              onChange={(e) => {
                const value = e.target.value;
                setFilters({
                  ...filters,
                  isVerified: value === '' ? undefined : value === 'verified',
                });
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="verified">Verified</MenuItem>
              <MenuItem value="unverified">Unverified</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Start Date"
            type="date"
            size="small"
            value={filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                startDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
          <TextField
            label="End Date"
            type="date"
            size="small"
            value={filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : ''}
            onChange={(e) =>
              setFilters({
                ...filters,
                endDate: e.target.value ? new Date(e.target.value) : null,
              })
            }
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
          />
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('user_id')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>ID</span>
                    {sortBy === 'user_id' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('full_name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Name</span>
                    {sortBy === 'full_name' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('email')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Email</span>
                    {sortBy === 'email' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('phone')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Phone</span>
                    {sortBy === 'phone' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('user_type_name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>User Type</span>
                    {sortBy === 'user_type_name' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('is_verified')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Status</span>
                    {sortBy === 'is_verified' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('created_at')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Created At</span>
                    {sortBy === 'created_at' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {users.length === 0 ? 'No users found' : 'No results match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                sortedUsers.map((user) => (
                  <TableRow key={user.user_id} hover>
                    <TableCell>{user.user_id}</TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {user.full_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.user_type_name || `Type ${user.user_type_id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.is_verified ? 'Verified' : 'Unverified'}
                        color={user.is_verified ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {format(new Date(user.created_at), 'MMM dd, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(user.created_at), 'HH:mm')}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(user)}
                        title="View Details"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                        title="More Actions"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        {menuUser && (
          <>
            <MenuItem onClick={() => handleEdit(menuUser)}>
              <EditIcon fontSize="small" sx={{ mr: 1 }} />
              Edit User
            </MenuItem>
            <MenuItem onClick={() => handleToggleVerification(menuUser)} disabled={actionLoading}>
              {menuUser.is_verified ? (
                <>
                  <CancelIcon fontSize="small" sx={{ mr: 1 }} />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircleIcon fontSize="small" sx={{ mr: 1 }} />
                  Activate
                </>
              )}
            </MenuItem>
            <MenuItem onClick={() => handleDelete(menuUser)} sx={{ color: 'error.main' }}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete User
            </MenuItem>
          </>
        )}
      </Menu>

      {/* Dialogs */}
      <UserDetailsDialog
        open={detailsDialogOpen}
        onClose={() => {
          setDetailsDialogOpen(false);
          setSelectedUser(null);
        }}
        userId={selectedUser?.user_id || null}
      />

      <EditUserDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedUser(null);
        }}
        onSave={() => {
          fetchUsers();
          setSuccess('User updated successfully');
        }}
        user={selectedUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
        loading={actionLoading}
      />
    </Box>
  );
};

export default Users;

