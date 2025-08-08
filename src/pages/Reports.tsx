import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface ReportsProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const Reports: React.FC<ReportsProps> = ({ onPageChange, onLogout }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="reports" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#FDF8F4] shadow-sm py-4 px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-secondary">Reports</h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reports Dashboard</h2>
            <p className="text-gray-600">Reports functionality coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
