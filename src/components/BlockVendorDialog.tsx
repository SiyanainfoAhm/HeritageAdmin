import React from 'react';

interface BlockVendorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vendorName: string;
  vendorType: string;
}

const BlockVendorDialog: React.FC<BlockVendorDialogProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  vendorName, 
  vendorType 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-forbid-line text-red-500 ri-2x"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Block Vendor</h3>
          <p className="text-gray-600">
            Are you sure you want to block this vendor? They will not be able to
            access the application or web app.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-button hover:bg-gray-200 !rounded-button whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-white bg-red-500 rounded-button hover:bg-red-600 !rounded-button whitespace-nowrap"
          >
            Yes, Block Vendor
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockVendorDialog;
