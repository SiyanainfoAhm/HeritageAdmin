import React, { useState } from 'react';

interface MailTabProps {
  onAddNotification: () => void;
  onViewDetails: (id: string) => void;
}

const MailTab: React.FC<MailTabProps> = ({ onAddNotification, onViewDetails }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div id="mail-tab" className="tab-content">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center"></div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm w-full md:w-64"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <i className="ri-search-line text-gray-400"></i>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                id="export-mail-btn"
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
              >
                <i className="ri-download-line mr-2"></i>
                Export
              </button>
              <button
                id="add-mail-btn"
                onClick={onAddNotification}
                className="bg-primary text-white rounded-lg px-3 py-2 text-sm flex items-center !rounded-button whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Add Notification
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative">
            <button
              id="filter-mail-audience-btn"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
            >
              <span>Audience</span>
              <i className="ri-arrow-down-s-line ml-2"></i>
            </button>
            <div
              id="filter-mail-audience-dropdown"
              className="hidden absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-48"
            >
              <div className="p-2 space-y-1">
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">All Users</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Only Tourists</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Only Vendors</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Only Guides</span>
                </label>
              </div>
              <div className="border-t border-gray-200 p-2 flex justify-end">
                <button className="text-xs text-primary font-medium">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            <button
              id="filter-mail-date-btn"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
            >
              <span>Date</span>
              <i className="ri-arrow-down-s-line ml-2"></i>
            </button>
            <div
              id="filter-mail-date-dropdown"
              className="hidden absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-64"
            >
              <div className="p-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="date"
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 p-2 flex justify-end">
                <button className="text-xs text-primary font-medium">
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
          <button
            id="clear-mail-filters"
            className="text-sm text-primary flex items-center"
          >
            <i className="ri-refresh-line mr-1"></i>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Mail Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Message Body
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type of User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  Monthly Heritage Newsletter: Discover the latest updates, upcoming events, and featured stories...
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  All Users
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Aug 07, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge sent">Sent</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="view-mail-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => onViewDetails("1")}
                  title="View Details"
                >
                  <i className="ri-eye-line"></i>
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  Heritage Photography Contest: Submit your best heritage site photos and win exciting prizes...
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  Only Tourists
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Aug 05, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge sent">Sent</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="view-mail-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => onViewDetails("2")}
                  title="View Details"
                >
                  <i className="ri-eye-line"></i>
                </button>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  Vendor Registration Update: New features and improved dashboard for all registered vendors...
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Only Vendors
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Aug 03, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge sent">Sent</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="view-mail-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => onViewDetails("3")}
                  title="View Details"
                >
                  <i className="ri-eye-line"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-500">
          Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of <span className="font-medium">20</span> results
        </div>
        <div className="flex space-x-2">
          <button
            className="px-3 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            disabled
          >
            <i className="ri-arrow-left-s-line"></i>
          </button>
          <button className="px-3 py-1 rounded-lg bg-primary text-white">
            1
          </button>
          <button className="px-3 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
            2
          </button>
          <button className="px-3 py-1 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50">
            <i className="ri-arrow-right-s-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MailTab;
