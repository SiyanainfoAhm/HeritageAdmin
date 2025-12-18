import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { MasterDataService } from '@/services/masterData.service';
import { MasterData, MasterDataCategory } from '@/types';
import MasterDataDialog from '@/components/masters/MasterDataDialog';
import HeritageSitesManager from './components/HeritageSitesManager';

const MASTER_CATEGORIES: { value: MasterDataCategory; label: string }[] = [
  { value: 'language', label: 'Languages' },
  { value: 'site_type', label: 'Site Types' },
  { value: 'preference', label: 'User Preferences' },
  { value: 'report_reason', label: 'Report Reasons' },
  { value: 'age_group', label: 'Age Groups' },
  { value: 'travel_purpose', label: 'Travel Purposes' },
  { value: 'relation', label: 'Relations' },
];

const Masters = () => {
  const [activeTab, setActiveTab] = useState<'masterData' | 'heritageSites'>('masterData');
  const [selectedCategory, setSelectedCategory] = useState<MasterDataCategory>('language');
  const [masterData, setMasterData] = useState<MasterData[]>([]);
  const [filteredData, setFilteredData] = useState<MasterData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedMasterData, setSelectedMasterData] = useState<MasterData | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'code' | 'name'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (activeTab === 'masterData') {
      fetchMasterData();
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (activeTab === 'masterData') {
      applyFilters();
    }
  }, [masterData, searchTerm, statusFilter, sortBy, sortOrder, activeTab]);

  const fetchMasterData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await MasterDataService.getMasterDataByCategory(selectedCategory);
      setMasterData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch master data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...masterData];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.code.toLowerCase().includes(searchLower) ||
          item.display_name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower))
      );
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((item) => Boolean(item.is_active) === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((item) => Boolean(item.is_active) === false);
    }

    // Sort (consistent with Verification and Users pages)
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortBy) {
        case 'order':
          aValue = a.display_order || 0;
          bValue = b.display_order || 0;
          break;
        case 'code':
          aValue = a.code?.toLowerCase() || '';
          bValue = b.code?.toLowerCase() || '';
          break;
        case 'name':
          aValue = a.display_name?.toLowerCase() || '';
          bValue = b.display_name?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredData(filtered);
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: MasterDataCategory) => {
    setSelectedCategory(newValue);
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('order');
    setSortOrder('asc');
  };

  const handleSort = (column: 'order' | 'code' | 'name') => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleAdd = () => {
    setSelectedMasterData(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (item: MasterData) => {
    setSelectedMasterData(item);
    setEditDialogOpen(true);
  };

  const handleToggleStatus = async (item: MasterData) => {
    setActionLoading(true);
    try {
      const result = await MasterDataService.toggleMasterDataStatus(item.master_id, !item.is_active);
      if (result.success) {
        setSuccess(`Master data marked as ${item.is_active ? 'inactive' : 'active'}.`);
        fetchMasterData();
      } else {
        setError(result.error?.message || 'Failed to update status');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDialogSave = () => {
    fetchMasterData();
    setSuccess('Master data saved successfully');
  };

  const renderMasterDataSection = () => (
    <>
      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedCategory} onChange={handleCategoryChange} variant="scrollable" scrollButtons="auto">
          {MASTER_CATEGORIES.map((category) => (
            <Tab key={category.value} label={category.label} value={category.value} />
          ))}
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="Search by code, name, or description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

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
                  onClick={() => handleSort('code')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Code</span>
                    {sortBy === 'code' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('name')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Display Name</span>
                    {sortBy === 'name' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell 
                  sx={{ fontWeight: 600, cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => handleSort('order')}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Display Order</span>
                    {sortBy === 'order' && (
                      sortOrder === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {masterData.length === 0 ? 'No data found' : 'No results match your filters'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.master_id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {item.code}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.display_name}</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {item.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>{item.display_order}</TableCell>
                    <TableCell>
                      <Chip 
                        icon={Boolean(item.is_active) ? <CheckCircleIcon /> : <CancelIcon />}
                        label={Boolean(item.is_active) ? 'Active' : 'Inactive'} 
                        color={Boolean(item.is_active) ? 'success' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title={Boolean(item.is_active) ? 'Mark as Inactive' : 'Mark as Active'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleStatus(item)}
                          disabled={actionLoading}
                          color={Boolean(item.is_active) ? 'success' : 'default'}
                          sx={{ mr: 0.5 }}
                        >
                          {Boolean(item.is_active) ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(item)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <MasterDataDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSave={handleDialogSave}
        category={selectedCategory}
        mode="add"
      />

      <MasterDataDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedMasterData(null);
        }}
        onSave={handleDialogSave}
        category={selectedCategory}
        masterData={selectedMasterData}
        mode="edit"
      />
    </>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Manage
        </Typography>
        {activeTab === 'masterData' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add New
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_event, value) => setActiveTab(value as 'masterData' | 'heritageSites')}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Master Data" value="masterData" />
          <Tab label="Heritage Sites" value="heritageSites" />
        </Tabs>
      </Paper>

      {activeTab === 'masterData' ? renderMasterDataSection() : <HeritageSitesManager />}
    </Box>
  );
};

export default Masters;

