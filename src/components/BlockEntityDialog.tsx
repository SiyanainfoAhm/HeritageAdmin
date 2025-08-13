import React from 'react';

interface BlockEntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  entityName?: string;
  entityType?: string;
}

const BlockEntityDialog: React.FC<BlockEntityDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  entityName, 
  entityType 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-red-500 text-2xl"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Block Confirmation</h3>
          <p className="text-gray-600">
            Are you sure you want to block this entity? They will lose access to app and web.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-button hover:bg-gray-50 whitespace-nowrap"
          >
            No, Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-red-500 rounded-button hover:bg-red-600 whitespace-nowrap"
          >
            Yes, Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockEntityDialog;
