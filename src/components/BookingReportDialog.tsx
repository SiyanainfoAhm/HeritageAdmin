import React, { useState } from 'react';

interface BookingReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    bookingId: string;
    dateTime: string;
    amount: number;
    entity: string;
    vendorGuide: string;
    paymentMode: string;
    customer: string;
    phone: string;
    email: string;
    status: string;
  };
}

const BookingReportDialog: React.FC<BookingReportDialogProps> = ({ 
  isOpen, 
  onClose, 
  bookingData 
}) => {
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Booking Report</h2>
          <div className="flex items-center space-x-3">
            {/* Print Button */}
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              <i className="ri-printer-line"></i>
              <span>Print</span>
            </button>
            
            {/* Download Button with Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
              >
                <i className="ri-download-line"></i>
                <span>Download</span>
                <i className="ri-arrow-down-s-line"></i>
              </button>
              
              {/* Download Dropdown */}
              {showDownloadDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <div className="py-1">
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <i className="ri-file-pdf-line text-red-500"></i>
                      <span>PDF</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <i className="ri-file-spreadsheet-line text-green-500"></i>
                      <span>CSV</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <i className="ri-file-excel-line text-blue-500"></i>
                      <span>Excel</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Share Button */}
            <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
              <i className="ri-share-line"></i>
              <span>Share</span>
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
              {/* Customer Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Customer Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium text-gray-800">{bookingData.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{bookingData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-800">{bookingData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium text-gray-800">{bookingData.bookingId}</span>
                  </div>
                </div>
              </div>

              {/* Itinerary Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Itinerary Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Activity:</span>
                    <span className="font-medium text-gray-800">{bookingData.entity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-gray-800">{bookingData.dateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-gray-800">2 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Meeting Point:</span>
                    <span className="font-medium text-gray-800">Main Entrance</span>
                  </div>
                </div>
              </div>

              {/* Vendor Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Vendor Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor Name:</span>
                    <span className="font-medium text-gray-800">{bookingData.vendorGuide}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium text-gray-800 flex items-center">
                      4.8 <i className="ri-star-fill text-yellow-400 ml-1"></i>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium text-gray-800">{bookingData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">License No.:</span>
                    <span className="font-medium text-gray-800">TG12345</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Payment Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-800">₹{bookingData.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-medium text-gray-800">{bookingData.paymentMode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-800">Paid</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium text-gray-800">TXN123456789</span>
                  </div>
                </div>
              </div>

              {/* Booking Status History */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Booking Status History</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-check-line text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Booking Confirmed</div>
                      <div className="text-sm text-gray-600">{bookingData.dateTime}</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-time-line text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Payment Received</div>
                      <div className="text-sm text-gray-600">{bookingData.dateTime}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Notes - Full Width */}
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-3">Additional Notes</h3>
              <div className="text-gray-500 text-sm">
                <p>Special requests: None</p>
                <p className="mt-2">Last updated: {bookingData.dateTime}</p>
                <p className="mt-2">Generated by: Admin System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReportDialog;
