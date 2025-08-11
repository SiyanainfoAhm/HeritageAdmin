import React from 'react';

interface BookingDetailsDialogProps {
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

const BookingDetailsDialog: React.FC<BookingDetailsDialogProps> = ({ 
  isOpen, 
  onClose, 
  bookingData 
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Basic Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking ID:</span>
                    <span className="font-medium text-gray-800">{bookingData.bookingId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date & Time:</span>
                    <span className="font-medium text-gray-800">{bookingData.dateTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium text-gray-800">₹{bookingData.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Contact Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer:</span>
                    <span className="font-medium text-gray-800">{bookingData.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-800">{bookingData.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-800">{bookingData.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Additional Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Additional Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Entity:</span>
                    <span className="font-medium text-gray-800">{bookingData.entity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendor/Guide:</span>
                    <span className="font-medium text-gray-800">{bookingData.vendorGuide}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Mode:</span>
                    <span className="font-medium text-gray-800">{bookingData.paymentMode}</span>
                  </div>
                </div>
              </div>

              {/* Status & History */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Status & History</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-check-line text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Booking Confirmed</div>
                      <div className="text-sm text-gray-600">{bookingData.dateTime}</div>
                      <div className="text-sm text-gray-500">Payment received and booking confirmed</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <i className="ri-time-line text-white text-xs"></i>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">Booking Initiated</div>
                      <div className="text-sm text-gray-600">{bookingData.dateTime.replace('10:45 AM', '10:40 AM')}</div>
                      <div className="text-sm text-gray-500">Customer initiated the booking process</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Documents & Attachments */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Documents & Attachments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-end p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                    <i className="ri-file-pdf-line text-white"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Booking Confirmation</div>
                    <div className="text-sm text-gray-500">PDF • 245 KB</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 mr-2">
                  <i className="ri-download-line text-xl"></i>
                </button>
              </div>
              <div className="flex items-center justify-end p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-red-500 rounded flex items-center justify-center">
                    <i className="ri-file-pdf-line text-white"></i>
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">Payment Receipt</div>
                    <div className="text-sm text-gray-500">PDF • 180 KB</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 mr-2">
                  <i className="ri-download-line text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Download Invoice
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-orange-500 border border-transparent rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsDialog;
