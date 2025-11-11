import { format } from 'date-fns';

/**
 * Export data to CSV
 */
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle values that might contain commas or quotes
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export report data to CSV
 */
export function exportReportToCSV(reportData: any, reportType: string) {
  const data: any[] = [];

  switch (reportType) {
    case 'users':
      // Export user statistics
      data.push(
        { Metric: 'Total Users', Value: reportData.totalUsers },
        { Metric: 'Active Users', Value: reportData.activeUsers },
        { Metric: 'Inactive Users', Value: reportData.inactiveUsers }
      );
      
      // Export users by type
      reportData.usersByType?.forEach((item: any) => {
        data.push({ 'User Type': item.type, Count: item.count });
      });
      
      // Export registration trends
      reportData.registrationTrends?.forEach((item: any) => {
        data.push({ Date: item.date, 'New Registrations': item.count });
      });
      break;

    case 'bookings':
      data.push({ Metric: 'Total Bookings', Value: reportData.totalBookings });
      
      reportData.bookingsByStatus?.forEach((item: any) => {
        data.push({ Status: item.status, Count: item.count });
      });
      
      reportData.bookingsByModule?.forEach((item: any) => {
        data.push({ Module: item.module, Count: item.count });
      });
      
      reportData.bookingTrends?.forEach((item: any) => {
        data.push({ Date: item.date, Bookings: item.count });
      });
      break;

    case 'revenue':
      data.push({ Metric: 'Total Revenue', Value: `₹${reportData.totalRevenue.toLocaleString()}` });
      
      reportData.revenueByModule?.forEach((item: any) => {
        data.push({ Module: item.module, Revenue: `₹${item.revenue.toLocaleString()}` });
      });
      
      reportData.revenueTrends?.forEach((item: any) => {
        data.push({ Date: item.date, Revenue: `₹${item.revenue.toLocaleString()}` });
      });
      break;

    case 'module':
      data.push(
        { Metric: 'Module', Value: reportData.module },
        { Metric: 'Total Bookings', Value: reportData.totalBookings },
        { Metric: 'Total Revenue', Value: `₹${reportData.totalRevenue.toLocaleString()}` }
      );
      
      reportData.bookingsByStatus?.forEach((item: any) => {
        data.push({ Status: item.status, Count: item.count });
      });
      
      reportData.revenueTrends?.forEach((item: any) => {
        data.push({ Date: item.date, Revenue: `₹${item.revenue.toLocaleString()}` });
      });
      break;
  }

  exportToCSV(data, `${reportType}_report`);
}

