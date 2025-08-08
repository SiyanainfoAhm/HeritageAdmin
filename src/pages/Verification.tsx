import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ViewDetailsDialog from '../components/ViewDetailsDialog';

interface VerificationProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

interface Entity {
  id: string;
  name: string;
  description: string;
  type: string;
  location: string;
  status: string;
  submittedOn: string;
}

const Verification: React.FC<VerificationProps> = ({ onPageChange, onLogout }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);
  const [viewDetailsData, setViewDetailsData] = useState<any>(null);
  const [isEntityTypeOpen, setIsEntityTypeOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const itemsPerPage = 9;

  // Mock data based on the image
  const mockEntities: Entity[] = [
    {
      id: '1',
      name: 'Adalaj Stepwell',
      description: '15th Century',
      type: 'Heritage Site',
      location: 'Ahmedabad',
      status: 'Pending',
      submittedOn: 'June 14, 2025'
    },
    {
      id: '2',
      name: 'Rajesh Patel',
      description: 'Heritage Expert',
      type: 'Local Guide',
      location: 'Ahmedabad',
      status: 'Approved',
      submittedOn: 'June 12, 2025'
    },
    {
      id: '3',
      name: 'Garba Fest Organizers',
      description: 'Cultural Events',
      type: 'Event Operator',
      location: 'Ahmedabad',
      status: 'Rejected',
      submittedOn: 'June 10, 2025'
    },
    {
      id: '4',
      name: 'Manek Chowk Night Tour',
      description: 'Weekly Event',
      type: 'Event',
      location: 'Ahmedabad',
      status: 'Pending',
      submittedOn: 'June 15, 2025'
    },
    {
      id: '5',
      name: 'Rekha Devi',
      description: 'Bandhej Craftsperson',
      type: 'Artisan',
      location: 'Ahmedabad',
      status: 'Pending',
      submittedOn: 'June 13, 2025'
    },
    {
      id: '6',
      name: 'Das Khaman House',
      description: 'Street Food',
      type: 'Food Vendor',
      location: 'Ahmedabad',
      status: 'Approved',
      submittedOn: 'June 11, 2025'
    },
    {
      id: '7',
      name: 'Manek Chowk Souvenirs',
      description: 'Handicrafts',
      type: 'Retailer',
      location: 'Ahmedabad',
      status: 'Pending',
      submittedOn: 'June 16, 2025'
    },
    {
      id: '8',
      name: 'House of MG',
      description: 'Heritage Hotel',
      type: 'Hotel',
      location: 'Ahmedabad',
      status: 'Rejected',
      submittedOn: 'June 9, 2025'
    },
    {
      id: '9',
      name: 'Sabarmati Tours',
      description: 'River Front Packages',
      type: 'Tour Operator',
      location: 'Ahmedabad',
      status: 'Pending',
      submittedOn: 'June 15, 2025'
    }
  ];

  const handleSidebarToggle = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const handleSidebarTabChange = (tab: string) => {
    if (onPageChange) {
      onPageChange(tab);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setEntityTypeFilter([]);
    setStatusFilter([]);
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleEntityTypeToggle = (type: string) => {
    setEntityTypeFilter(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleStatusToggle = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const handleApplyDateFilter = () => {
    setIsDateOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.filter-dropdown')) {
        setIsEntityTypeOpen(false);
        setIsStatusOpen(false);
        setIsDateOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewDetails = (entity: Entity) => {
    setViewDetailsData(entity);
    setIsViewDetailsOpen(true);
  };

  const handleApprove = (id: string) => {
    console.log('Approve entity:', id);
    // Here you would typically update the status in your backend
    alert(`Entity ${id} approved successfully!`);
  };

  const handleReject = (id: string) => {
    console.log('Reject entity:', id);
    // Here you would typically update the status in your backend
    alert(`Entity ${id} rejected successfully!`);
  };

  const handleExport = () => {
    console.log('Exporting data...');
    // Here you would typically generate and download a CSV/Excel file
    alert('Data exported successfully!');
  };

  // Filter entities based on search and filters
  const filteredEntities = mockEntities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entity.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = entityTypeFilter.length === 0 || entityTypeFilter.includes(entity.type);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(entity.status);
    
    // Date range filtering
    let matchesDate = true;
    if (dateFrom || dateTo) {
      // Convert entity date to comparable format
      const entityDateParts = entity.submittedOn.split(' ');
      const entityMonth = entityDateParts[0]; // June
      const entityDay = entityDateParts[1].replace(',', ''); // 14
      const entityYear = entityDateParts[2]; // 2025
      
      // Convert to Date object for comparison
      const entityDate = new Date(`${entityMonth} ${entityDay}, ${entityYear}`);
      
      if (dateFrom) {
        // Convert dd-mm-yyyy to Date object
        const fromParts = dateFrom.split('-');
        const fromDate = new Date(parseInt(fromParts[2]), parseInt(fromParts[1]) - 1, parseInt(fromParts[0]));
        matchesDate = matchesDate && entityDate >= fromDate;
      }
      if (dateTo) {
        // Convert dd-mm-yyyy to Date object
        const toParts = dateTo.split('-');
        const toDate = new Date(parseInt(toParts[2]), parseInt(toParts[1]) - 1, parseInt(toParts[0]));
        matchesDate = matchesDate && entityDate <= toDate;
      }
    }
    
    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEntities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntities = filteredEntities.slice(startIndex, endIndex);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Pending':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heritage Site':
        return 'bg-blue-100 text-blue-800';
      case 'Local Guide':
        return 'bg-purple-100 text-purple-800';
      case 'Event Operator':
        return 'bg-yellow-100 text-yellow-800';
      case 'Event':
        return 'bg-green-100 text-green-800';
      case 'Artisan':
        return 'bg-blue-100 text-blue-800';
      case 'Food Vendor':
        return 'bg-red-100 text-red-800';
      case 'Retailer':
        return 'bg-pink-100 text-pink-800';
      case 'Hotel':
        return 'bg-teal-100 text-teal-800';
      case 'Tour Operator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="verification" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-[#FDF8F4] shadow-sm py-4 px-6">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-secondary">Verification</h1>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Search and Export */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or type..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="ml-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center space-x-2"
            >
              <i className="ri-download-line"></i>
              <span>Export</span>
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4 mb-6">
            {/* Entity Type Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setIsEntityTypeOpen(!isEntityTypeOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center space-x-2"
              >
                <span>Entity Type</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              
              {isEntityTypeOpen && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="space-y-2">
                      {['Heritage Sites', 'Local Guides', 'Event Operators', 'Artisans', 'Food Vendors'].map((type) => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={entityTypeFilter.includes(type)}
                            onChange={() => handleEntityTypeToggle(type)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsEntityTypeOpen(false)}
                      className="w-full mt-3 px-3 py-2 text-primary text-sm font-medium hover:bg-primary/10 rounded"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center space-x-2"
              >
                <span>Status</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              
              {isStatusOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="space-y-2">
                      {['Pending', 'Approved', 'Rejected'].map((status) => (
                        <label key={status} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statusFilter.includes(status)}
                            onChange={() => handleStatusToggle(status)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-gray-700">{status}</span>
                        </label>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsStatusOpen(false)}
                      className="w-full mt-3 px-3 py-2 text-primary text-sm font-medium hover:bg-primary/10 rounded"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Date Filter */}
            <div className="relative filter-dropdown">
              <button
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent flex items-center space-x-2"
              >
                <span>Date</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              
              {isDateOpen && (
                <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                        <div className="relative">
                                                     <input
                             type="text"
                             value={dateFrom}
                             onChange={(e) => setDateFrom(e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                             placeholder="dd-mm-yyyy"
                             onClick={() => {
                               const input = document.createElement('input');
                               input.type = 'date';
                               input.style.position = 'absolute';
                               input.style.opacity = '0';
                               input.style.pointerEvents = 'none';
                               document.body.appendChild(input);
                               input.click();
                               input.onchange = (e) => {
                                 const target = e.target as HTMLInputElement;
                                 if (target.value) {
                                   const date = new Date(target.value);
                                   const formattedDate = date.toLocaleDateString('en-GB');
                                   setDateFrom(formattedDate);
                                 }
                                 document.body.removeChild(input);
                               };
                             }}
                           />
                           <i className="ri-calendar-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => {
                             const input = document.createElement('input');
                             input.type = 'date';
                             input.style.position = 'absolute';
                             input.style.opacity = '0';
                             input.style.pointerEvents = 'none';
                             document.body.appendChild(input);
                             input.click();
                             input.onchange = (e) => {
                               const target = e.target as HTMLInputElement;
                               if (target.value) {
                                 const date = new Date(target.value);
                                 const formattedDate = date.toLocaleDateString('en-GB');
                                 setDateFrom(formattedDate);
                               }
                               document.body.removeChild(input);
                             };
                           }}></i>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                        <div className="relative">
                                                     <input
                             type="text"
                             value={dateTo}
                             onChange={(e) => setDateTo(e.target.value)}
                             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                             placeholder="dd-mm-yyyy"
                             onClick={() => {
                               const input = document.createElement('input');
                               input.type = 'date';
                               input.style.position = 'absolute';
                               input.style.opacity = '0';
                               input.style.pointerEvents = 'none';
                               document.body.appendChild(input);
                               input.click();
                               input.onchange = (e) => {
                                 const target = e.target as HTMLInputElement;
                                 if (target.value) {
                                   const date = new Date(target.value);
                                   const formattedDate = date.toLocaleDateString('en-GB');
                                   setDateTo(formattedDate);
                                 }
                                 document.body.removeChild(input);
                               };
                             }}
                           />
                           <i className="ri-calendar-line absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer" onClick={() => {
                             const input = document.createElement('input');
                             input.type = 'date';
                             input.style.position = 'absolute';
                             input.style.opacity = '0';
                             input.style.pointerEvents = 'none';
                             document.body.appendChild(input);
                             input.click();
                             input.onchange = (e) => {
                               const target = e.target as HTMLInputElement;
                               if (target.value) {
                                 const date = new Date(target.value);
                                 const formattedDate = date.toLocaleDateString('en-GB');
                                 setDateTo(formattedDate);
                               }
                               document.body.removeChild(input);
                             };
                           }}></i>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleApplyDateFilter}
                      className="w-full mt-3 px-3 py-2 text-primary text-sm font-medium hover:bg-primary/10 rounded"
                    >
                      Apply Filter
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleClearFilters}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex items-center space-x-2"
            >
              <i className="ri-refresh-line"></i>
              <span>Clear Filters</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TYPE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      LOCATION
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SUBMITTED ON
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentEntities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{entity.name}</div>
                          <div className="text-sm text-gray-500">{entity.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(entity.type)}`}>
                          {entity.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entity.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entity.status)}`}>
                          {entity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entity.submittedOn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(entity)}
                            className="text-gray-400 hover:text-gray-600"
                            title="View Details"
                          >
                            <i className="ri-eye-line text-lg"></i>
                          </button>
                          {entity.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(entity.id)}
                                className="text-green-400 hover:text-green-600"
                                title="Approve"
                              >
                                <i className="ri-check-line text-lg"></i>
                              </button>
                              <button
                                onClick={() => handleReject(entity.id)}
                                className="text-red-400 hover:text-red-600"
                                title="Reject"
                              >
                                <i className="ri-close-line text-lg"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredEntities.length)} of {filteredEntities.length} results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <i className="ri-arrow-left-s-line"></i>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm border rounded-lg ${
                    currentPage === page
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Details Dialog */}
      <ViewDetailsDialog 
        isOpen={isViewDetailsOpen}
        onClose={() => setIsViewDetailsOpen(false)}
        data={viewDetailsData}
        type="verification"
      />
    </div>
  );
};

export default Verification;
