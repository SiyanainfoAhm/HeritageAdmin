import React, { useState, useEffect, useRef } from 'react';
import './AddNewEvent.css';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  description: string;
}

interface FeeItem {
  id: string;
  ticketType: string;
  amount: string;
  description: string;
}

interface Amenity {
  id: string;
  name: string;
  icon: string;
  selected: boolean;
}

interface AddNewEventProps {
  onLogout: () => void;
  onPageChange: (page: string) => void;
}

const AddNewEvent: React.FC<AddNewEventProps> = ({ onLogout, onPageChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [autosaveStatus, setAutosaveStatus] = useState('Just now');
  const [isPaidEvent, setIsPaidEvent] = useState(false);
  const [activeLanguageTab, setActiveLanguageTab] = useState('English');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', startTime: '', endTime: '', description: '' },
    { id: '2', startTime: '11:00', endTime: '13:00', description: 'Cultural Performances' }
  ]);
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    { id: '1', ticketType: 'General Entry', amount: '250', description: 'Access to all general areas' },
    { id: '2', ticketType: 'VIP Pass', amount: '750', description: 'Priority seating & exclusive areas' }
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(['Food Court', 'Accessibility']);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventStatus, setEventStatus] = useState('submit');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const amenities: Amenity[] = [
    { id: '1', name: 'Wi-Fi', icon: 'ri-wifi-line', selected: false },
    { id: '2', name: 'Parking', icon: 'ri-parking-box-line', selected: false },
    { id: '3', name: 'Food Court', icon: 'ri-restaurant-line', selected: true },
    { id: '4', name: 'Accessibility', icon: 'ri-wheelchair-line', selected: true },
    { id: '5', name: 'First Aid', icon: 'ri-first-aid-kit-line', selected: false },
    { id: '6', name: 'ATM', icon: 'ri-secure-payment-line', selected: false },
    { id: '7', name: 'Baby Care', icon: 'ri-parent-line', selected: false },
    { id: '8', name: 'Add Custom', icon: 'ri-add-line', selected: false }
  ];

  const steps = ['Overview', 'Schedule', 'Venue & Ticket', 'Review'];

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      setAutosaveStatus('Saving...');
      setTimeout(() => {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        setAutosaveStatus(`Last saved: ${timeString}`);
      }, 1000);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Ensure currentStep is always valid
  useEffect(() => {
    if (currentStep < 0 || currentStep >= steps.length) {
      setCurrentStep(0);
    }
  }, [currentStep, steps.length]);

  const showStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
      setAutosaveStatus('Saving...');
      setTimeout(() => {
        setAutosaveStatus('Saved just now');
      }, 1000);
    }
  };

  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      startTime: '',
      endTime: '',
      description: ''
    };
    setTimeSlots([...timeSlots, newSlot]);
  };

  const removeTimeSlot = (id: string) => {
    setTimeSlots(timeSlots.filter(slot => slot.id !== id));
  };

  const updateTimeSlot = (id: string, field: keyof TimeSlot, value: string) => {
    setTimeSlots(timeSlots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };

  const addFeeItem = () => {
    const newFeeItem: FeeItem = {
      id: Date.now().toString(),
      ticketType: '',
      amount: '',
      description: ''
    };
    setFeeItems([...feeItems, newFeeItem]);
  };

  const removeFeeItem = (id: string) => {
    setFeeItems(feeItems.filter(item => item.id !== id));
  };

  const updateFeeItem = (id: string, field: keyof FeeItem, value: string) => {
    setFeeItems(feeItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const toggleAmenity = (amenityName: string) => {
    if (amenityName === 'Add Custom') {
      const customAmenity = prompt('Enter custom amenity name:');
      if (customAmenity && customAmenity.trim() !== '') {
        setSelectedAmenities([...selectedAmenities, customAmenity]);
      }
      return;
    }

    setSelectedAmenities(prev => 
      prev.includes(amenityName) 
        ? prev.filter(name => name !== amenityName)
        : [...prev, amenityName]
    );
  };

  const removeAmenity = (amenityName: string) => {
    setSelectedAmenities(prev => prev.filter(name => name !== amenityName));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Handle file upload logic here
      console.log('Files selected:', files);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setShowSuccessModal(true);
      setIsSubmitting(false);
      createConfetti();
    }, 1500);
  };

  const createConfetti = () => {
    const confettiCount = 100;
    const colors = ['#DA8552', '#3F3D56', '#FDF8F4', '#E9C4B1', '#F5E9E2'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';

      document.body.appendChild(confetti);

      setTimeout(() => {
        confetti.remove();
      }, 3500);
    }
  };

  const getStepClass = (stepIndex: number) => {
    if (stepIndex < currentStep) return 'step-completed';
    if (stepIndex === currentStep) return 'step-active';
    return 'step-inactive';
  };

  const getProgressWidth = () => {
    return (currentStep / (steps.length - 1)) * 100;
  };

  // Debug logging
  console.log('Current step:', currentStep);
  console.log('Steps array:', steps);
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center">
        <button
            onClick={() => onPageChange('manage')}
            className="text-gray-600 hover:text-gray-800"
          >
            <i className="ri-arrow-left-s-line ri-2x"></i>
          </button>
          <h1 className="text-xl font-semibold mx-auto pr-10">
            Add New Event/Festival
          </h1>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <span>{autosaveStatus}</span>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="w-full flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full ${getStepClass(index)}`}>
                      {index + 1}
                    </div>
                    <span className="text-xs mt-1">{step}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="h-1 flex-1 bg-gray-200 mx-2 relative">
                      <div 
                        className="absolute inset-0 bg-primary transition-all duration-300"
                        style={{ width: index <= currentStep ? '100%' : '0%' }}
                      ></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Debug info */}
        
        {/* Step 1: Overview */}
        {currentStep === 0 && (
          <div className="step-content" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Organizer Details
                <span className="text-sm font-normal text-gray-500 ml-2">(For Admin Verification)</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Organizer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter organizer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="organizer@example.com"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Event/Festival Details</h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Event/Festival Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter event name"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Media Gallery</h2>
              <div className="custom-file-upload w-full p-8 text-center mb-4">
                <div className="flex flex-col items-center justify-center">
                  <i className="ri-upload-cloud-line ri-3x text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600 mb-1">
                    Drag & drop files here or
                  </p>
                  <label className="bg-primary text-white px-4 py-2 rounded-button cursor-pointer hover:bg-opacity-90 transition-colors whitespace-nowrap">
                    Browse Files
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, GIF, MP4 (Max: 10MB each)
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="relative rounded overflow-hidden h-40 bg-gray-100">
                  <img
                    src="https://readdy.ai/api/search-image?query=colorful%20festival%20celebration%20with%20decorations%20and%20lights%2C%20cultural%20event%20in%20India%2C%20vibrant%20colors%2C%20professional%20photography%2C%20high%20quality&width=400&height=300&seq=1&orientation=landscape"
                    className="w-full h-full object-cover object-top"
                    alt="Festival celebration"
                  />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors">
                    <i className="ri-delete-bin-line ri-sm text-red-500"></i>
                  </button>
                </div>
                <div className="relative rounded overflow-hidden h-40 bg-gray-100">
                  <img
                    src="https://readdy.ai/api/search-image?query=traditional%20dance%20performance%20at%20cultural%20festival%2C%20colorful%20costumes%2C%20stage%20lighting%2C%20audience%20watching%2C%20professional%20event%20photography&width=400&height=300&seq=2&orientation=landscape"
                    className="w-full h-full object-cover object-top"
                    alt="Cultural performance"
                  />
                  <button className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors">
                    <i className="ri-delete-bin-line ri-sm text-red-500"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => showStep(1)}
                className="bg-primary text-white px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap"
              >
                Next: Schedule
                <i className="ri-arrow-right-line ri-sm ml-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Schedule */}
        {currentStep === 1 && (
          <div className="step-content" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Time Slots</h2>
              <div>
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="time-slot-item bg-gray-50 p-4 rounded mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Time</label>
                        <input
                          type="time"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={slot.startTime}
                          onChange={(e) => updateTimeSlot(slot.id, 'startTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Time</label>
                        <input
                          type="time"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          value={slot.endTime}
                          onChange={(e) => updateTimeSlot(slot.id, 'endTime', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                            placeholder="e.g., Opening Ceremony"
                            value={slot.description}
                            onChange={(e) => updateTimeSlot(slot.id, 'description', e.target.value)}
                          />
                          <button
                            className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                            onClick={() => removeTimeSlot(slot.id)}
                          >
                            <i className="ri-delete-bin-line ri-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addTimeSlot}
                  className="mt-2 flex items-center text-primary hover:text-primary-dark transition-colors"
                >
                  <i className="ri-add-circle-line ri-lg mr-1"></i>
                  Add Another Time Slot
                </button>
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Schedule Description</h2>
              <div className="mb-4">
                <div className="flex border-b">
                  {['English', 'Gujarati', 'Hindi', 'Spanish'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-2 rounded-t-lg ${
                        activeLanguageTab === lang ? 'tab-active' : 'tab-inactive'
                      }`}
                      onClick={() => setActiveLanguageTab(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="rich-text-toolbar flex flex-wrap gap-1 py-2">
                  <button><i className="ri-bold ri-sm"></i></button>
                  <button><i className="ri-italic ri-sm"></i></button>
                  <button><i className="ri-underline ri-sm"></i></button>
                  <button><i className="ri-list-unordered ri-sm"></i></button>
                  <button><i className="ri-list-ordered ri-sm"></i></button>
                  <button><i className="ri-link ri-sm"></i></button>
                </div>
                <div className="rich-text-editor bg-white">
                  <p>
                    Join us for the annual Cultural Heritage Festival celebrating
                    the rich traditions of our community. The festival will
                    feature:
                  </p>
                  <ul>
                    <li>Traditional dance performances</li>
                    <li>Live music from local artists</li>
                    <li>Food stalls featuring regional cuisine</li>
                    <li>Handicraft exhibitions and workshops</li>
                    <li>Cultural processions and parades</li>
                  </ul>
                  <p>
                    This year's theme focuses on "Preserving Our Roots" with
                    special performances highlighting ancestral traditions.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => showStep(0)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-button hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line ri-sm mr-1"></i>
                Back: Overview
              </button>
              <button
                onClick={() => showStep(2)}
                className="bg-primary text-white px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap"
              >
                Next: Venue & Ticket
                <i className="ri-arrow-right-line ri-sm ml-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Venue & Ticket */}
        {currentStep === 2 && (
          <div className="step-content" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Venue Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Venue Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter venue name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter area"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Nearest Metro Station</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter nearest metro station"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nearest Bus Stop</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter nearest bus stop"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                {amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className={`amenity-item border border-gray-300 rounded p-3 text-center cursor-pointer hover:border-primary hover:bg-primary-50 transition-colors ${
                      selectedAmenities.includes(amenity.name) ? 'amenity-selected' : ''
                    }`}
                    onClick={() => toggleAmenity(amenity.name)}
                  >
                    <div className="w-10 h-10 mx-auto flex items-center justify-center mb-2">
                      <i className={`${amenity.icon} ri-lg`}></i>
                    </div>
                    <span className="text-sm">{amenity.name}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedAmenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="bg-primary bg-opacity-10 text-primary px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {amenity}
                    <button
                      className="ml-1 text-primary hover:text-primary-dark"
                      onClick={() => removeAmenity(amenity)}
                    >
                      <i className="ri-close-line ri-sm"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Etiquettes</h2>
              <div className="mb-4">
                <div className="flex border-b">
                  {['English', 'Gujarati', 'Hindi', 'Spanish'].map((lang) => (
                    <button
                      key={lang}
                      className={`px-4 py-2 rounded-t-lg ${
                        activeLanguageTab === lang ? 'tab-active' : 'tab-inactive'
                      }`}
                      onClick={() => setActiveLanguageTab(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full mt-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-32"
                  placeholder="Enter etiquettes for visitors..."
                  defaultValue="- Please maintain silence during performances
- Photography without flash is permitted
- No outside food or beverages allowed
- Dress modestly as per cultural norms
- Follow designated pathways and seating arrangements
- Dispose waste in designated bins"
                />
              </div>
            </div>

            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Ticket Information</h2>
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Is this a paid event?</label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={isPaidEvent}
                      onChange={(e) => setIsPaidEvent(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
              {isPaidEvent && (
                <div>
                  <div className="mb-4">
                    <h3 className="text-md font-medium mb-2">Fee Details</h3>
                    <div>
                      {feeItems.map((item) => (
                        <div
                          key={item.id}
                          className="fee-item grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-gray-50 p-4 rounded"
                        >
                          <div>
                            <label className="block text-sm font-medium mb-2">Ticket Type</label>
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="e.g., Adult, Child, Senior"
                              value={item.ticketType}
                              onChange={(e) => updateFeeItem(item.id, 'ticketType', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Amount (₹)</label>
                            <input
                              type="number"
                              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="Enter amount"
                              value={item.amount}
                              onChange={(e) => updateFeeItem(item.id, 'amount', e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <div className="relative">
                              <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                placeholder="Optional description"
                                value={item.description}
                                onChange={(e) => updateFeeItem(item.id, 'description', e.target.value)}
                              />
                              <button
                                className="absolute right-2 top-2 text-red-500 hover:text-red-700"
                                onClick={() => removeFeeItem(item.id)}
                              >
                                <i className="ri-delete-bin-line ri-lg"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addFeeItem}
                        className="mt-2 flex items-center text-primary hover:text-primary-dark transition-colors"
                      >
                        <i className="ri-add-circle-line ri-lg mr-1"></i>
                        Add Another Ticket Type
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Booking URL (Optional)</label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="https://example.com/book-tickets"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => showStep(1)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-button hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line ri-sm mr-1"></i>
                Back: Schedule
              </button>
              <button
                onClick={() => showStep(3)}
                className="bg-primary text-white px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap"
              >
                Next: Review
                <i className="ri-arrow-right-line ri-sm ml-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <div className="step-content" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold">Review Your Event</h2>
                <a
                  href="#"
                  className="text-primary underline hover:text-primary-dark transition-colors"
                >
                  Preview
                </a>
              </div>
              <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h3 className="font-medium mb-2">Event Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Event Name</p>
                      <p className="font-medium">Cultural Heritage Festival 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date</p>
                      <p className="font-medium">June 25, 2025 - June 27, 2025</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Organizer</p>
                      <p className="font-medium">Heritage Foundation of Gujarat</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact</p>
                      <p className="font-medium">+91 9876543210 / events@hfg.org</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h3 className="font-medium mb-2">Venue</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Venue Name</p>
                      <p className="font-medium">Sabarmati Riverfront Event Center</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium">
                        Riverfront West, Ahmedabad, Gujarat 380009
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nearest Metro</p>
                      <p className="font-medium">Sabarmati Station (1.2 km)</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nearest Bus Stop</p>
                      <p className="font-medium">Riverfront Bus Terminal (0.3 km)</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <h3 className="font-medium mb-2">Ticket Information</h3>
                  <div className="mb-2">
                    <p className="text-sm text-gray-600">Ticket Types</p>
                    <div className="mt-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">General Entry</span>
                        <span>₹250</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">VIP Pass</span>
                        <span>₹750</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Booking URL</p>
                    <a href="#" className="text-primary hover:underline">
                      https://culturalheritagefest.in/tickets
                    </a>
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Status</label>
                <div className="flex gap-4">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => setEventStatus('submit')}
                  >
                    <div className="w-5 h-5 border border-gray-300 rounded-full mr-2 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${eventStatus === 'submit' ? 'bg-primary' : 'bg-transparent'}`}></div>
                    </div>
                    <span>Submit for Approval</span>
                  </div>
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => setEventStatus('draft')}
                  >
                    <div className="w-5 h-5 border border-gray-300 rounded-full mr-2 flex items-center justify-center">
                      <div className={`w-3 h-3 rounded-full ${eventStatus === 'draft' ? 'bg-primary' : 'bg-transparent'}`}></div>
                    </div>
                    <span>Save as Draft</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => showStep(2)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-button hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                <i className="ri-arrow-left-line ri-sm mr-1"></i>
                Back: Venue & Ticket
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-white px-8 py-3 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Event
                    <i className="ri-check-line ri-sm ml-1"></i>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
        
        {/* Fallback: Show first step if no step is selected */}
        {currentStep < 0 || currentStep >= steps.length ? (
          <div className="step-content" style={{ display: 'block', visibility: 'visible', opacity: 1 }}>
            <div className="bg-white rounded shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4 text-red-600">
                Step not found. Redirecting to first step...
              </h2>
              <button
                onClick={() => showStep(0)}
                className="bg-primary text-white px-6 py-3 rounded-button hover:bg-opacity-90 transition-colors"
              >
                Go to Overview
              </button>
            </div>
          </div>
        ) : null}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line ri-2x text-green-500"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Event Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-6">
                Your event has been submitted for approval. You will be notified
                once it's approved.
              </p>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="bg-primary text-white px-6 py-2 rounded-button hover:bg-opacity-90 transition-colors whitespace-nowrap"
                >
                  Return to Events
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewEvent;
