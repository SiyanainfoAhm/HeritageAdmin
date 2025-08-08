import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';

interface AddNewHeritageProps {
  onLogout: () => void;
  onPageChange: (page: string) => void;
}

const AddNewHeritage: React.FC<AddNewHeritageProps> = ({ onLogout, onPageChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    siteName: '',
    locationAddress: '',
    ticketType: 'paid' as 'free' | 'paid',
    onlineBooking: true
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        onTabChange={onPageChange} 
        onLogout={onLogout}
        isExpanded={true}
        onToggle={() => {}}
        activeTab="manage"
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-md py-4 px-6">
          <div className="flex justify-between items-center">
            <button onClick={() => onPageChange('manage')} className="text-gray-600 hover:text-gray-800">
              <i className="ri-arrow-left-s-line ri-2x"></i>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 text-center flex-1">Add New Heritage Site</h1>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Auto-saving...</span>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all">
                Save as Draft
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-8">
          {/* Progress Stepper */}
          <div className="mb-10">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((step) => (
                <React.Fragment key={step}>
                  <div className={`step-item flex flex-col items-center cursor-pointer ${currentStep >= step ? 'text-orange-600' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                      currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    <span className="mt-2 font-medium">
                      {step === 1 ? 'Overview' : step === 2 ? 'About' : step === 3 ? 'Plan Visit' : 'Review'}
                    </span>
                  </div>
                  {step < 4 && (
                    <div className="h-1 flex-grow mx-2 bg-gray-200 relative">
                      <div className="absolute inset-0 bg-orange-600 transition-all duration-300"
                           style={{ width: step < currentStep ? '100%' : '0%' }}></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Step 1: Overview */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Site Information</h2>
              
              {/* Site Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                    placeholder="Enter heritage site name"
                  />
                  {formData.siteName && (
                    <div className="absolute right-3 top-3 text-green-500">
                      <i className="ri-check-line ri-lg"></i>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  placeholder="Enter full address"
                />
              </div>

              {/* Media Gallery */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">Media Gallery</label>
                <div className="border-2 border-dashed border-orange-600 rounded-2xl p-8 text-center cursor-pointer hover:border-gray-600 transition-all">
                  <div className="flex flex-col items-center">
                    <i className="ri-upload-cloud-2-line ri-3x text-orange-600 mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Drag & drop files here</h3>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg transition-all">
                      Browse Files
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: About */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mr-3">
                  <i className="ri-ancient-pavilion-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">History & Architecture</h2>
              </div>
              <textarea
                className="w-full h-60 p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent resize-none"
                placeholder="Enter detailed history and architecture information..."
              />
            </div>
          )}

          {/* Step 3: Plan Visit */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-full mr-3">
                  <i className="ri-ticket-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Ticketing Information</h2>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <label className="mr-8 text-gray-700 font-medium">Entry Type</label>
                    <div className="flex items-center mr-4">
                      <input
                        type="radio"
                        id="ticketFree"
                        name="ticketType"
                        checked={formData.ticketType === 'free'}
                        onChange={() => handleInputChange('ticketType', 'free')}
                        className="mr-2"
                      />
                      <label htmlFor="ticketFree" className="text-gray-700">Free Entry</label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="ticketPaid"
                        name="ticketType"
                        checked={formData.ticketType === 'paid'}
                        onChange={() => handleInputChange('ticketType', 'paid')}
                        className="mr-2"
                      />
                      <label htmlFor="ticketPaid" className="text-gray-700">Paid Entry</label>
                    </div>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.onlineBooking}
                        onChange={(e) => handleInputChange('onlineBooking', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                    <span className="ml-2 text-gray-700">Online Booking Available</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Submit</h2>
              
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Site Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Site Name:</span>
                      <span className="ml-2 text-gray-900">{formData.siteName}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Location:</span>
                      <span className="ml-2 text-gray-900">{formData.locationAddress}</span>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Ticketing</h3>
                  <div className="text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Entry Type:</span>
                      <span className="ml-2 text-gray-900 capitalize">{formData.ticketType}</span>
                    </div>
                    {formData.ticketType === 'paid' && (
                      <div>
                        <span className="font-medium text-gray-700">Online Booking:</span>
                        <span className="ml-2 text-gray-900">{formData.onlineBooking ? 'Yes' : 'No'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                currentStep === 1
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Previous
            </button>
            
            <div className="flex space-x-3">
              {currentStep < 4 ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => onPageChange('manage')}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-all"
                >
                  Submit Heritage Site
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNewHeritage;
