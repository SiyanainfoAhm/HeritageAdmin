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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { MasterDataService } from '@/services/masterData.service';
import { MasterData, MasterDataCategory } from '@/types';
import MasterDataDialog from '@/components/masters/MasterDataDialog';
import DeleteConfirmDialog from '@/components/masters/DeleteConfirmDialog';
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMasterData, setSelectedMasterData] = useState<MasterData | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'order' | 'code' | 'name'>('order');

  useEffect(() => {
    if (activeTab === 'masterData') {
      fetchMasterData();
    }
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (activeTab === 'masterData') {
      applyFilters();
    }
  }, [masterData, searchTerm, statusFilter, sortBy, activeTab]);

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
      filtered = filtered.filter((item) => item.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((item) => !item.is_active);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'order':
          return a.display_order - b.display_order;
        case 'code':
          return a.code.localeCompare(b.code);
        case 'name':
          return a.display_name.localeCompare(b.display_name);
        default:
          return 0;
      }
    });

    setFilteredData(filtered);
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: MasterDataCategory) => {
    setSelectedCategory(newValue);
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('order');
  };

  const handleAdd = () => {
    setSelectedMasterData(null);
    setAddDialogOpen(true);
  };

  const handleEdit = (item: MasterData) => {
    setSelectedMasterData(item);
    setEditDialogOpen(true);
  };

  const handleDelete = (item: MasterData) => {
    setSelectedMasterData(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedMasterData) return;

    setDeleteLoading(true);
    try {
      const result = await MasterDataService.deleteMasterData(selectedMasterData.master_id);
      if (result.success) {
        setSuccess('Master data deleted successfully');
        fetchMasterData();
        setDeleteDialogOpen(false);
        setSelectedMasterData(null);
      } else {
        setError(result.error?.message || 'Failed to delete master data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setDeleteLoading(false);
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value as any)}>
              <MenuItem value="order">Display Order</MenuItem>
              <MenuItem value="code">Code</MenuItem>
              <MenuItem value="name">Name</MenuItem>
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
                <TableCell>Code</TableCell>
                <TableCell>Display Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Display Order</TableCell>
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
                      <Chip label={item.is_active ? 'Active' : 'Inactive'} color={item.is_active ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleEdit(item)} title="Edit">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(item)} title="Delete">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedMasterData(null);
        }}
        onConfirm={handleDeleteConfirm}
        masterData={selectedMasterData}
        loading={deleteLoading}
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

