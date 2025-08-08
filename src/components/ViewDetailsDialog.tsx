import React from 'react';
import Dialog from './Dialog';

interface ViewDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'campaign' | 'notification' | 'whatsapp' | 'mail' | 'verification';
}

const ViewDetailsDialog: React.FC<ViewDetailsDialogProps> = ({ isOpen, onClose, data, type }) => {
  // Don't render if data is null or undefined
  if (!data) {
    return null;
  }

  const renderCampaignDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
          <i className="ri-megaphone-line text-primary text-xl"></i>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{data.name || 'N/A'}</h4>
          <p className="text-sm text-gray-500">{data.description || 'No description available'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</label>
          <p className="mt-1 text-sm text-gray-900">{data.audience || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
          <p className="mt-1 text-sm text-gray-900">{data.status || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</label>
          <p className="mt-1 text-sm text-gray-900">{data.startDate || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</label>
          <p className="mt-1 text-sm text-gray-900">{data.endDate || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const renderNotificationDetails = () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{data.title || 'N/A'}</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-700">{data.message || 'No message available'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Audience</label>
          <p className="mt-1 text-sm text-gray-900">{data.audience || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</label>
          <p className="mt-1 text-sm text-gray-900">{data.sentDate || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
          <p className="mt-1 text-sm text-gray-900">{data.status || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
          <p className="mt-1 text-sm text-gray-900 capitalize">{type}</p>
        </div>
      </div>
    </div>
  );

  const renderVerificationDetails = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-primary/10 flex items-center justify-center">
          <i className="ri-building-line text-primary text-xl"></i>
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{data.name || 'N/A'}</h4>
          <p className="text-sm text-gray-500">{data.description || 'No description available'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
          <p className="mt-1 text-sm text-gray-900">{data.type || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Location</label>
          <p className="mt-1 text-sm text-gray-900">{data.location || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Status</label>
          <p className="mt-1 text-sm text-gray-900">{data.status || 'N/A'}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted On</label>
          <p className="mt-1 text-sm text-gray-900">{data.submittedOn || 'N/A'}</p>
        </div>
      </div>
    </div>
  );

  const getDialogTitle = () => {
    switch (type) {
      case 'campaign':
        return 'Campaign Details';
      case 'whatsapp':
        return 'WhatsApp Message Details';
      case 'mail':
        return 'Email Details';
      case 'verification':
        return 'Entity Details';
      default:
        return 'Notification Details';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'campaign':
        return renderCampaignDetails();
      case 'verification':
        return renderVerificationDetails();
      default:
        return renderNotificationDetails();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={getDialogTitle()} size="lg">
      <div className="space-y-6">
        {renderContent()}
        
        <div className="flex justify-end pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default ViewDetailsDialog;
