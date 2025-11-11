import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import UserReports from './UserReports';
import BookingReports from './BookingReports';
import RevenueReports from './RevenueReports';
import ModuleReports from './ModuleReports';
import { exportReportToCSV } from '@/utils/export.utils';
import { ReportsService } from '@/services/reports.service';

const Reports = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [exportLoading, setExportLoading] = useState(false);

  const reportTabs = [
    { label: 'User Reports', value: 'users' },
    { label: 'Booking Reports', value: 'bookings' },
    { label: 'Revenue Reports', value: 'revenue' },
    { label: 'Module Reports', value: 'modules' },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const reportType = reportTabs[selectedTab].value;
      let reportData;

      switch (reportType) {
        case 'users':
          reportData = await ReportsService.getUserReportData();
          exportReportToCSV(reportData, 'users');
          break;
        case 'bookings':
          reportData = await ReportsService.getBookingReportData();
          exportReportToCSV(reportData, 'bookings');
          break;
        case 'revenue':
          reportData = await ReportsService.getRevenueReportData();
          exportReportToCSV(reportData, 'revenue');
          break;
        case 'modules':
          // For module reports, export the currently selected module
          reportData = await ReportsService.getModuleReportData('hotel');
          exportReportToCSV(reportData, 'module');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export report');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Reports
        </Typography>
        <Button
          variant="outlined"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={exportLoading}
        >
          {exportLoading ? 'Exporting...' : 'Export Report'}
        </Button>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          {reportTabs.map((tab) => (
            <Tab key={tab.value} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {selectedTab === 0 && <UserReports />}
      {selectedTab === 1 && <BookingReports />}
      {selectedTab === 2 && <RevenueReports />}
      {selectedTab === 3 && <ModuleReports />}
    </Box>
  );
};

export default Reports;

