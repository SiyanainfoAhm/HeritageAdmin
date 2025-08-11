import React from 'react';

interface VendorDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  vendorData: {
    vendorName: string;
    vendorInitials: string;
    type: string;
    categoryTag: string;
    totalBookings: number;
    revenue: number;
    avgRating: number;
    complaintCount: number;
    lastActiveDate: string;
  };
}

const VendorDetailsDialog: React.FC<VendorDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  vendorData 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Vendor Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Information</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Category</span>
                  <div className="font-medium text-gray-800 mt-1">{vendorData.categoryTag}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Type</span>
                  <div className="font-medium text-gray-800 mt-1">{vendorData.type}</div>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Registration Date</span>
                  <div className="font-medium text-gray-800 mt-1">Jan 15, 2025</div>
                </div>
              </div>
            </div>

            {/* Verification Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Verification Status</h3>
                <button className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors">
                  Verify Now
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-file-text-line text-gray-500"></i>
                    <span className="text-gray-600">Business Registration</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600 font-medium">Verified</span>
                    <i className="ri-check-line text-green-500"></i>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <i className="ri-file-text-line text-gray-500"></i>
                    <span className="text-gray-600">Tax Documents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-orange-600 font-medium">Pending</span>
                    <i className="ri-time-line text-orange-500"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Media Gallery */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Media Gallery</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://fvveqziyusjgqejowkfp.supabase.co/storage/v1/object/public/photomedia/HeritageWeb/VendorFood1.jpg"
                    alt="Vendor Food 1"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center hidden">
                    <i className="ri-image-line text-gray-400 text-2xl"></i>
                  </div>
                </div>
                <div className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src="https://fvveqziyusjgqejowkfp.supabase.co/storage/v1/object/public/photomedia/HeritageWeb/VendorFood2.jpg"
                    alt="Vendor Food 2"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center hidden">
                    <i className="ri-image-line text-gray-400 text-2xl"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Documents</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded flex items-center justify-center">
                      <i className="ri-file-pdf-line text-white"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Business License</div>
                      <div className="text-sm text-gray-500">PDF • 2.5 MB</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <i className="ri-download-line text-xl"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Products & Services */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Products & Services</h3>
              <div className="text-gray-500 text-sm">
                <p>No products or services listed yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsDialog;
