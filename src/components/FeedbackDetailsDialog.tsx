import React from 'react';

interface FeedbackDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackData: {
    userInitials: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    userLocation: string;
    feedbackType: string;
    entity: string;
    status: string;
    date: string;
    description: string;
  };
  onContactUser: () => void;
  onMarkResolved: () => void;
}

const FeedbackDetailsDialog: React.FC<FeedbackDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  feedbackData,
  onContactUser,
  onMarkResolved
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Feedback Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Name</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.userInitials}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.userEmail}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Phone</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.userPhone}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Location</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.userLocation}</div>
              </div>
            </div>
          </div>

          {/* Feedback Details */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Feedback Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <span className="text-gray-600 text-sm">Type</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.feedbackType}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Entity</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.entity}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Status</span>
                <div className="font-medium text-blue-600 mt-1">{feedbackData.status}</div>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Date</span>
                <div className="font-medium text-gray-800 mt-1">{feedbackData.date}</div>
              </div>
            </div>
            <div>
              <span className="text-gray-600 text-sm">Description</span>
              <div className="font-medium text-gray-800 mt-1">{feedbackData.description}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="ri-mail-line text-blue-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">Feedback Submitted</div>
                      <div className="text-sm text-gray-500">User submitted the feedback</div>
                    </div>
                    <div className="text-sm text-gray-500">{feedbackData.date}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3 ml-4">
                <div className="w-px h-8 bg-gray-300 ml-4"></div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <i className="ri-eye-line text-orange-600"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">Under Review</div>
                      <div className="text-sm text-gray-500">Team reviewing the feedback</div>
                    </div>
                    <div className="text-sm text-gray-500">2 hours later</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onContactUser}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <i className="ri-mail-line"></i>
            <span>Contact User</span>
          </button>
          <button
            onClick={onMarkResolved}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
          >
            <i className="ri-check-line"></i>
            <span>Mark as Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetailsDialog;
