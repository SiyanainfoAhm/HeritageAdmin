import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface AccessData {
  id: string;
  email: string;
  password: string;
  accessType: string;
}

interface AccessControlProps {
  onPageChange?: (page: string) => void;
  onLogout?: () => void;
}

const AccessControl: React.FC<AccessControlProps> = ({ onPageChange, onLogout }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [filterType, setFilterType] = useState('All Access Types');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [editingAccess, setEditingAccess] = useState<AccessData | null>(null);
  const [deletingAccess, setDeletingAccess] = useState<AccessData | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    accessType: 'normal'
  });

  // Mock data
  const mockAccessData: AccessData[] = [
    {
      id: '1',
      email: 'sarah.johnson@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Admin'
    },
    {
      id: '2',
      email: 'michael.chen@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '3',
      email: 'emma.rodriguez@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Admin'
    },
    {
      id: '4',
      email: 'david.kim@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '5',
      email: 'lisa.thompson@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '6',
      email: 'john.doe@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Admin'
    },
    {
      id: '7',
      email: 'jane.smith@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '8',
      email: 'robert.wilson@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Admin'
    },
    {
      id: '9',
      email: 'maria.garcia@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '10',
      email: 'james.brown@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
    },
    {
      id: '11',
      email: 'patricia.davis@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Admin'
    },
    {
      id: '12',
      email: 'thomas.miller@heritage.com',
      password: 'Heritage2024!',
      accessType: 'Normal User'
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

  // Filter data based on selected filter
  const filteredData = filterType === 'All Access Types' 
    ? mockAccessData 
    : mockAccessData.filter(item => item.accessType === filterType);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearFilters = () => {
    setFilterType('All Access Types');
    setCurrentPage(1);
  };

  const handleAddAccess = () => {
    setEditingAccess(null);
    setFormData({
      email: '',
      password: '',
      accessType: 'normal'
    });
    setShowAddModal(true);
  };

  const handleEditAccess = (access: AccessData) => {
    setEditingAccess(access);
    setFormData({
      email: access.email,
      password: access.password,
      accessType: access.accessType === 'Admin' ? 'admin' : 'normal'
    });
    setShowAddModal(true);
  };

  const handleDeleteAccess = (access: AccessData) => {
    setDeletingAccess(access);
    setShowDeleteModal(true);
  };

  const handleSaveAccess = () => {
    // Here you would typically make an API call to save the access
    console.log('Saving access:', formData);
    setShowAddModal(false);
  };

  const handleConfirmDelete = () => {
    // Here you would typically make an API call to delete the access
    console.log('Deleting access:', deletingAccess);
    setShowDeleteModal(false);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPassword(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getAccessTypeColor = (type: string) => {
    return type === 'Admin' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        activeTab="access-control" 
        onTabChange={handleSidebarTabChange}
        isExpanded={sidebarExpanded}
        onToggle={handleSidebarToggle}
        onLogout={onLogout}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Access Control</h1>
            <div className="flex items-center">
              <button
                onClick={handleAddAccess}
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Access
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Filter Bar */}
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none pr-8"
                >
                  <option>All Access Types</option>
                  <option>Admin</option>
                  <option>Normal User</option>
                </select>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-sm text-orange-500 hover:text-orange-600 font-medium"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      <button className="flex items-center space-x-1 hover:text-orange-500">
                        <span>Email</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Password
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      <button className="flex items-center space-x-1 hover:text-orange-500">
                        <span>Access Type</span>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.email}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">
                            {showPassword[item.id] ? item.password : '••••••••'}
                          </span>
                          <button 
                            onClick={() => togglePasswordVisibility(item.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {showPassword[item.id] ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              )}
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccessTypeColor(item.accessType)}`}>
                          {item.accessType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditAccess(item)}
                            className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteAccess(item)}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredData.length)}</span> of{' '}
                  <span className="font-medium">{filteredData.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1.5 text-sm rounded-lg ${
                        page === currentPage
                          ? 'bg-orange-500 text-white'
                          : 'text-gray-700 hover:text-gray-900 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingAccess ? 'Edit Access' : 'Create Access'}
              </h2>
            </div>
            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email ID
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword['modal'] ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('modal')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword['modal'] ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Type
                </label>
                <select
                  value={formData.accessType}
                  onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm pr-8"
                >
                  <option value="admin">Admin</option>
                  <option value="normal">Normal User</option>
                </select>
              </div>
            </form>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccess}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors"
              >
                {editingAccess ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                Delete Access?
              </h3>
              <p className="text-sm text-gray-600 text-center mb-6">
                Are you sure you want to remove this user's access? This will revoke all login rights.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessControl;
