import React from 'react';

interface MarkResolvedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const MarkResolvedDialog: React.FC<MarkResolvedDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-check-line text-green-600 ri-2x"></i>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Mark as Resolved</h3>
          
          {/* Message */}
          <p className="text-gray-600 mb-6">
            Are you sure you want to mark this item as resolved?
          </p>
          
          {/* Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 text-white bg-green-500 rounded-md hover:bg-green-600 transition-colors"
            >
              Yes, Mark as Resolved
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkResolvedDialog;
