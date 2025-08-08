import React from 'react';

interface HeritageSiteData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface LocalGuideData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface EventOperatorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface EventFestivalData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface ArtisanData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface FoodVendorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface HotelData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

interface TourOperatorData {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  location: string;
  status: string;
  createdOn: string;
}

type DataType = HeritageSiteData | LocalGuideData | EventOperatorData | EventFestivalData | ArtisanData | FoodVendorData | HotelData | TourOperatorData;

interface ManageViewDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: DataType | null;
}

const ManageViewDetailsDialog: React.FC<ManageViewDetailsDialogProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) {
    return null;
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Draft':
        return 'bg-orange-100 text-orange-800';
      case 'Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Heritage':
        return 'bg-blue-100 text-blue-800';
      case 'Guide':
        return 'bg-purple-100 text-purple-800';
      case 'Operator':
        return 'bg-yellow-100 text-yellow-800';
      case 'Event':
        return 'bg-green-100 text-green-800';
      case 'Festival':
        return 'bg-green-100 text-green-800';
      case 'Artisan':
        return 'bg-blue-100 text-blue-800';
      case 'Food':
        return 'bg-red-100 text-red-800';
      case 'Hotel':
        return 'bg-green-100 text-green-800';
      case 'Tour':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDescription = (data: DataType) => {
    if ('type' in data && data.type === 'Heritage') {
      return "Adalaj Stepwell is a magnificent five-story stepwell located in the village of Adalaj, close to Ahmedabad city. Built in 1498 by Queen Rudabai, this intricately carved stepwell is not just a subterranean water source but also a cultural and architectural marvel. The stepwell features ornate Islamic, Jain and Hindu craftsmanship, showcasing the cultural synthesis of the era.";
    }
    return `${data.name} is a ${data.subtitle.toLowerCase()} located in ${data.location}. This ${data.type.toLowerCase()} provides excellent services and contributes to the local heritage and tourism industry.`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">View Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Header/Overview Section */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-lg font-medium text-orange-600">
                  {getInitials(data.name)}
                </span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{data.name}</h3>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(data.type)}`}>
                  {data.type}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {data.location}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(data.status)}`}>
                  {data.status}
                </span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Century:</span>
                <span className="text-sm text-gray-900">{data.subtitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-700">Created On:</span>
                <span className="text-sm text-gray-900">{data.createdOn}</span>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getDescription(data)}
            </p>
          </div>

          {/* Gallery Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Image 1</span>
              </div>
              <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Image 2</span>
              </div>
              <div className="h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-500">Image 3</span>
              </div>
            </div>
          </div>

          {/* Verification Section */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Verification</h4>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-gray-700">Verified on May 15, 2025</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageViewDetailsDialog;
