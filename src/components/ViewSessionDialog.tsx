import React from 'react';

interface ViewSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionData: {
    userName: string;
    userInitials: string;
    userType: string;
    activity: string;
    pageTarget: string;
    deviceOS: string;
    ipAddress: string;
    location: string;
    timestamp: string;
  };
}

const ViewSessionDialog: React.FC<ViewSessionDialogProps> = ({ 
  isOpen, 
  onClose, 
  sessionData 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Session Details</h2>
          <div className="flex items-center space-x-3">
            {/* Export Data Button */}
            <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <i className="ri-download-line"></i>
              <span>Export Data</span>
            </button>
            
            {/* Terminate Session Button */}
            <button className="flex items-center space-x-2 px-4 py-2 text-white bg-red-500 border border-transparent rounded-md hover:bg-red-600 transition-colors">
              <i className="ri-power-line"></i>
              <span>Terminate Session</span>
            </button>
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Session Overview */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Session Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Login Time:</span>
                    <span className="font-medium text-gray-800">{sessionData.timestamp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-800">1h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Activity:</span>
                    <span className="font-medium text-gray-800">2 minutes ago</span>
                  </div>
                </div>
              </div>

              {/* Device Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Device Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Device:</span>
                    <span className="font-medium text-gray-800">Samsung Galaxy S23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">OS:</span>
                    <span className="font-medium text-gray-800">Android 14</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Browser:</span>
                    <span className="font-medium text-gray-800">Chrome 120.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Screen:</span>
                    <span className="font-medium text-gray-800">1440 x 3088</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Location Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Location Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IP Address:</span>
                    <span className="font-medium text-gray-800">{sessionData.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium text-gray-800">{sessionData.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Country:</span>
                    <span className="font-medium text-gray-800">India</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ISP:</span>
                    <span className="font-medium text-gray-800">Airtel Broadband</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timezone:</span>
                    <span className="font-medium text-gray-800">GMT+5:30</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="font-medium text-gray-800">19.076°N, 72.877°E</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline - Full Width */}
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Activity Timeline</h3>
              <div className="text-xs text-gray-500 mb-3">All times in local timezone</div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-refresh-line text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Session Started</div>
                    <div className="text-sm text-gray-600">User logged in successfully</div>
                    <div className="text-sm text-gray-500">09:30 AM</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-file-list-line text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Viewed Booking Reports</div>
                    <div className="text-sm text-gray-600">Accessed booking reports dashboard</div>
                    <div className="text-sm text-gray-500">09:45 AM</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-filter-line text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Applied Filters</div>
                    <div className="text-sm text-gray-600">Date range: Last 7 days, Status: Confirmed</div>
                    <div className="text-sm text-gray-500">10:15 AM</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <i className="ri-download-line text-white text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Downloaded Report</div>
                    <div className="text-sm text-gray-600">Exported booking data as PDF</div>
                    <div className="text-sm text-gray-500">10:30 AM</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSessionDialog;
