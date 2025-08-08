import React, { useState } from 'react';

interface CampaignTabProps {
  onAddCampaign: () => void;
  onViewDetails: (id: string) => void;
  onEditStatus: (id: string) => void;
}

const CampaignTab: React.FC<CampaignTabProps> = ({ onAddCampaign, onViewDetails, onEditStatus }) => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div id="campaign-tab" className="tab-content active">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center"></div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search campaigns..."
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
                id="export-campaign-btn"
                className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
              >
                <i className="ri-download-line mr-2"></i>
                Export
              </button>
              <button
                id="add-campaign-btn"
                onClick={onAddCampaign}
                className="bg-primary text-white rounded-lg px-3 py-2 text-sm flex items-center !rounded-button whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Add Campaign
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="relative">
            <button
              id="filter-audience-btn"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
            >
              <span>Audience</span>
              <i className="ri-arrow-down-s-line ml-2"></i>
            </button>
            <div
              id="filter-audience-dropdown"
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
              id="filter-campaign-status-btn"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
            >
              <span>Status</span>
              <i className="ri-arrow-down-s-line ml-2"></i>
            </button>
            <div
              id="filter-campaign-status-dropdown"
              className="hidden absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-10 w-48"
            >
              <div className="p-2 space-y-1">
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Draft</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Active</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Paused</span>
                </label>
                <label className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-primary rounded border-gray-300 mr-2"
                  />
                  <span className="text-sm">Completed</span>
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
              id="filter-campaign-date-btn"
              className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 flex items-center !rounded-button whitespace-nowrap"
            >
              <span>Date</span>
              <i className="ri-arrow-down-s-line ml-2"></i>
            </button>
            <div
              id="filter-campaign-date-dropdown"
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
            id="clear-campaign-filters"
            className="text-sm text-primary flex items-center"
          >
            <i className="ri-refresh-line mr-1"></i>
            Clear Filters
          </button>
        </div>
      </div>

      {/* Campaign Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden mt-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Audience
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <i className="ri-megaphone-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer campaign-name" data-id="1">
                      Summer Heritage Walk
                    </div>
                    <div className="text-sm text-gray-500">
                      Special guided tours
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  All Users
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                June 20, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                August 31, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge active status-toggle cursor-pointer" data-id="1">Active</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="edit-status-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="1"
                    onClick={() => onEditStatus("1")}
                    title="Edit Status"
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button
                    className="view-campaign-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="1"
                    onClick={() => onViewDetails("1")}
                    title="View Details"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <i className="ri-megaphone-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer campaign-name" data-id="2">
                      Monsoon Festival Discount
                    </div>
                    <div className="text-sm text-gray-500">
                      20% off on all packages
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  Only Tourists
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                July 1, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                July 31, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge draft status-toggle cursor-pointer" data-id="2">Draft</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="edit-status-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="2"
                    onClick={() => onEditStatus("2")}
                    title="Edit Status"
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button
                    className="view-campaign-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="2"
                    onClick={() => onViewDetails("2")}
                    title="View Details"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <i className="ri-megaphone-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer campaign-name" data-id="3">
                      Artisan Spotlight
                    </div>
                    <div className="text-sm text-gray-500">
                      Featured local artisans
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Only Vendors
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                June 15, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                June 30, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge paused status-toggle cursor-pointer" data-id="3">Paused</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="edit-status-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="3"
                    onClick={() => onEditStatus("3")}
                    title="Edit Status"
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button
                    className="view-campaign-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="3"
                    onClick={() => onViewDetails("3")}
                    title="View Details"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <i className="ri-megaphone-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer campaign-name" data-id="4">
                      Guide Certification Program
                    </div>
                    <div className="text-sm text-gray-500">
                      Professional development
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Only Guides
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                May 1, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                June 15, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge completed status-toggle cursor-pointer" data-id="4">Completed</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="edit-status-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="4"
                    onClick={() => onEditStatus("4")}
                    title="Edit Status"
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button
                    className="view-campaign-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="4"
                    onClick={() => onViewDetails("4")}
                    title="View Details"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </div>
              </td>
            </tr>
            <tr className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
                    <i className="ri-megaphone-line text-primary"></i>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 cursor-pointer campaign-name" data-id="5">
                      Heritage Photography Contest
                    </div>
                    <div className="text-sm text-gray-500">
                      User-generated content
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  All Users
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                July 15, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                August 15, 2025
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="status-badge draft status-toggle cursor-pointer" data-id="5">Draft</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    className="edit-status-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="5"
                    onClick={() => onEditStatus("5")}
                    title="Edit Status"
                  >
                    <i className="ri-pencil-line"></i>
                  </button>
                  <button
                    className="view-campaign-btn p-2 text-secondary hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
                    data-id="5"
                    onClick={() => onViewDetails("5")}
                    title="View Details"
                  >
                    <i className="ri-eye-line"></i>
                  </button>
                </div>
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

export default CampaignTab;
