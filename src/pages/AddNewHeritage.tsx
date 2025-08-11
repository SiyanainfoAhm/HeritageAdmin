import React, { useState, useEffect } from 'react';

interface AddNewHeritageProps {
  onLogout: () => void;
  onPageChange: (page: string) => void;
}

const AddNewHeritage: React.FC<AddNewHeritageProps> = ({ onLogout, onPageChange }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    siteName: '',
    locationAddress: '',
    area: '',
    city: '',
    state: '',
    ticketType: 'paid' as 'free' | 'paid',
    onlineBooking: true,
    bookingUrl: 'https://fvveqziyusjgqejowkfp.supabase.co/storage/v1/object/public/photomedia/HeritageWeb/SunTempleModhera.jpg',
    arMode: false,
    openingTime: '09:00',
    closingTime: '18:00',
    openDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    amenities: ['wheelchair', 'parking', 'restaurant', 'giftShop'],
    overviewText: {
      en: 'The Sun Temple of Modhera is a Hindu temple dedicated to the solar deity Surya, situated on the bank of the river Pushpavati. It was built in 1026-27 CE during the reign of Bhima I of the Chaulukya dynasty. The temple complex has three components: Gudhamandapa (the shrine hall), Sabhamandapa (the assembly hall) and Kunda (the reservoir). The halls have intricately carved exterior and pillars. The reservoir has steps to reach the bottom and numerous small shrines.',
      gu: '',
      hi: '',
      es: ''
    },
    historyText: {
      en: 'The Sun Temple at Modhera is a masterpiece of Solanki-era architecture, built in 1026-27 CE during the reign of King Bhima I of the Chaulukya dynasty. The temple was designed as a tribute to the Sun God, Surya, and stands as one of the most significant ancient monuments in Gujarat.',
      gu: '',
      hi: '',
      es: ''
    },
    ticketFees: [
      { type: 'Adult (18-60 years)', fee: 150, notes: '' },
      { type: 'Child (5-17 years)', fee: 50, notes: '' }
    ],
    transportation: {
      metro: { name: 'Ahmedabad Metro', distance: 35 },
      bus: { name: 'Modhera Village Bus Stand', distance: 0.5 },
      taxi: { name: 'Modhera Village Auto Stand', distance: 0.3 }
    },
    nearbyAttractions: [
      { name: 'Sun Temple Museum', distance: 0.2 },
      { name: 'Maataji Temple', distance: 1.5 },
      { name: 'Siddhi Vinayak Temple', distance: 3.2 }
    ],
    culturalEtiquettes: [
      'Remove footwear before entering the temple premises',
      'Dress modestly, covering shoulders and knees',
      'Photography is allowed in most areas, but flash photography is prohibited near ancient carvings',
      'Maintain silence and respect the religious significance of the site',
      'Do not touch the carvings or climb on the structures'
    ]
  });

  const [showToast, setShowToast] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState('en');
  const [activeHistoryLanguage, setActiveHistoryLanguage] = useState('en');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      showToastMessage();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const showToastMessage = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      openDays: prev.openDays.includes(day)
        ? prev.openDays.filter(d => d !== day)
        : [...prev.openDays, day]
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addTicketFee = () => {
    setFormData(prev => ({
      ...prev,
      ticketFees: [...prev.ticketFees, { type: '', fee: 0, notes: '' }]
    }));
  };

  const removeTicketFee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ticketFees: prev.ticketFees.filter((_, i) => i !== index)
    }));
  };

  const updateTicketFee = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      ticketFees: prev.ticketFees.map((fee, i) => 
        i === index ? { ...fee, [field]: value } : fee
      )
    }));
  };

  const addNearbyAttraction = () => {
    setFormData(prev => ({
      ...prev,
      nearbyAttractions: [...prev.nearbyAttractions, { name: '', distance: 0 }]
    }));
  };

  const removeNearbyAttraction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.filter((_, i) => i !== index)
    }));
  };

  const updateNearbyAttraction = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      nearbyAttractions: prev.nearbyAttractions.map((attraction, i) => 
        i === index ? { ...attraction, [field]: value } : attraction
      )
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const [newAmenity, setNewAmenity] = useState('');
  const [newEtiquette, setNewEtiquette] = useState('');
  const [newNearbyAttraction, setNewNearbyAttraction] = useState('');
  const [newNearbyDistance, setNewNearbyDistance] = useState(0);

  const addNewAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const addNewEtiquette = () => {
    if (newEtiquette.trim()) {
      setFormData(prev => ({
        ...prev,
        culturalEtiquettes: [...prev.culturalEtiquettes, newEtiquette.trim()]
      }));
      setNewEtiquette('');
    }
  };

  const addNewNearbyAttraction = () => {
    if (newNearbyAttraction.trim() && newNearbyDistance > 0) {
      setFormData(prev => ({
        ...prev,
        nearbyAttractions: [...prev.nearbyAttractions, { name: newNearbyAttraction.trim(), distance: newNearbyDistance }]
      }));
      setNewNearbyAttraction('');
      setNewNearbyDistance(0);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1:
        return formData.siteName.trim() !== '' && formData.locationAddress.trim() !== '';
      case 2:
        return formData.historyText.en.trim() !== '';
      case 3:
        return (formData.ticketType === 'free' || (formData.ticketType === 'paid' && formData.ticketFees.length > 0));
      case 4:
        return true; // Review step is always complete
      default:
        return false;
    }
  };

  const canProceedToNext = () => {
    return isStepComplete(currentStep);
  };

  const getValidationErrors = (step: number) => {
    const errors: string[] = [];
    switch (step) {
      case 1:
        if (!formData.siteName.trim()) errors.push('Site name is required');
        if (!formData.locationAddress.trim()) errors.push('Location is required');
        break;
      case 2:
        if (!formData.historyText.en.trim()) errors.push('History text in English is required');
        break;
      case 3:
        if (formData.ticketType === 'paid' && formData.ticketFees.length === 0) {
          errors.push('At least one ticket fee is required for paid entry');
        }
        break;
    }
    return errors;
  };

  const createConfetti = () => {
    // Simple confetti effect
    const colors = ['#DA8552', '#3F3D56', '#FDF8F4', '#FFC107', '#4CAF50'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.zIndex = '9999';
      confetti.style.animation = `confetti-fall ${Math.random() * 2 + 2}s ease-in-out forwards`;
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }
  };

  const handleSubmit = () => {
    createConfetti();
    setTimeout(() => {
      alert('Heritage Site successfully submitted for approval!');
      onPageChange('manage');
    }, 500);
  };

  // Auto-save effect
  useEffect(() => {
    const interval = setInterval(showToastMessage, 30000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentStep < 4 && canProceedToNext()) {
        nextStep();
      } else if (e.key === 'ArrowLeft' && currentStep > 1) {
        prevStep();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep, canProceedToNext]);

  // Debug logging for step changes
  useEffect(() => {
    console.log('Current step changed to:', currentStep);
    if (currentStep === 2) {
      console.log('About section should be visible now');
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-[#FDF8F4] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <button
            onClick={() => onPageChange('manage')}
            className="text-gray-600 hover:text-gray-800"
          >
            <i className="ri-arrow-left-s-line ri-2x"></i>
          </button>
          <h1 className="text-2xl font-bold text-[#3F3D56] text-center flex-1">
            Add New Heritage Site
          </h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto-saving...</span>
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition-all">
              Save as Draft
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 flex-grow">
        {/* Progress Stepper */}
        <div className="mb-10">
          <div className="flex justify-between items-center">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div 
                  className={`step-item flex flex-col items-center cursor-pointer transition-all duration-300 ${
                    currentStep >= step ? 'text-[#DA8552]' : 'text-gray-500'
                  }`}
                  onClick={() => setCurrentStep(step)}
                >
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all duration-300 ${
                    currentStep >= step ? 'bg-[#DA8552] text-white shadow-lg' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className="mt-2 font-medium">
                    {step === 1 ? 'Overview' : step === 2 ? 'About' : step === 3 ? 'Plan Visit' : 'Review'}
                  </span>
                  {currentStep === step && (
                    <div className="mt-1 w-2 h-2 bg-[#DA8552] rounded-full animate-pulse"></div>
                  )}
                </div>
                {step < 4 && (
                  <div className="h-1 flex-grow mx-2 bg-gray-200 relative rounded-full overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-[#DA8552] transition-all duration-500 ease-out"
                      style={{ width: step < currentStep ? '100%' : '0%' }}
                    ></div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
          

        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className={`step-content ${currentStep === 1 ? 'active' : ''}`}>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-ancient-pavilion-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Site Information</h2>
              </div>
              
              {/* Site Name */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-ancient-pavilion-line ri-lg mr-2 text-[#DA8552]"></i>
                  Site Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
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
                  <i className="ri-map-pin-line ri-lg mr-2 text-[#DA8552]"></i>
                  Location <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="text"
                        value={formData.locationAddress}
                        onChange={(e) => handleInputChange('locationAddress', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                        placeholder="Enter full address"
                      />
                    </div>
                    <div>
                      <button className="w-full bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-all">
                        <i className="ri-map-pin-line ri-lg mr-2"></i> Pin on Map
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Area"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:ring-[#DA8552] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <div className="text-center">
                        <i className="ri-map-2-line ri-3x text-gray-400 mb-2"></i>
                        <p className="text-gray-500">Map placeholder</p>
                        <p className="text-sm text-gray-400">Click to add location coordinates</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Gallery */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-image-line ri-lg mr-2 text-[#DA8552]"></i>
                  Media Gallery
                </label>
                <div 
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    isDragActive ? 'border-[#3F3D56] bg-[#DA8552]/10' : 'border-[#DA8552] hover:border-gray-600'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <div className="flex flex-col items-center">
                    <i className="ri-upload-cloud-2-line ri-3x text-[#DA8552] mb-4"></i>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Drag & drop files here</h3>
                    <p className="text-gray-500 mb-4">or click to browse files</p>
                    <button className="bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-6 py-2 rounded-lg transition-all">
                      Browse Files
                    </button>
                    <input 
                      type="file" 
                      id="fileInput" 
                      className="hidden" 
                      multiple 
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-700 mb-3">Uploaded Media ({uploadedFiles.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative rounded-lg overflow-hidden group thumbnail">
                          <img
                            src={file}
                            alt={`Uploaded file ${index + 1}`}
                            className="w-full h-40 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
                              <i className="ri-eye-line text-gray-700"></i>
                            </button>
                            <button 
                              onClick={() => removeFile(index)}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center"
                            >
                              <i className="ri-delete-bin-line text-red-500"></i>
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 360° Video */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-video-line ri-lg mr-2 text-[#DA8552]"></i>
                  360° Video
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Paste YouTube or Vimeo embed link"
                    />
                  </div>
                  <div>
                    <button className="w-full bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-3 rounded-lg flex items-center justify-center transition-all">
                      <i className="ri-upload-line ri-lg mr-2"></i> Upload Video
                    </button>
                  </div>
                </div>
              </div>

              {/* AR Mode */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <label className="block text-gray-700 font-medium">
                    <i className="ri-vr-line ri-lg mr-2 text-[#DA8552]"></i>
                    AR Mode Available
                  </label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.arMode}
                      onChange={(e) => handleInputChange('arMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DA8552] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DA8552]"></div>
                  </label>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Enable AR mode to allow visitors to experience this heritage site in augmented reality through the mobile app 📱
                </p>
              </div>

              {/* Open Days & Hours */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-time-line ri-lg mr-2 text-[#DA8552]"></i>
                  Open Days & Hours
                </label>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-4">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <button
                      key={day}
                      onClick={() => toggleDay(day)}
                      className={`px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        formData.openDays.includes(day)
                          ? 'bg-[#DA8552] text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Opening Time</label>
                    <input
                      type="time"
                      value={formData.openingTime}
                      onChange={(e) => handleInputChange('openingTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Closing Time</label>
                    <input
                      type="time"
                      value={formData.closingTime}
                      onChange={(e) => handleInputChange('closingTime', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-hotel-line ri-lg mr-2 text-[#DA8552]"></i>
                  Amenities
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { key: 'wheelchair', icon: 'ri-wheelchair-line', label: 'Wheelchair Access' },
                    { key: 'parking', icon: 'ri-parking-line', label: 'Parking' },
                    { key: 'restaurant', icon: 'ri-restaurant-line', label: 'Restaurant' },
                    { key: 'giftShop', icon: 'ri-store-2-line', label: 'Gift Shop' }
                  ].map((amenity) => (
                    <button
                      key={amenity.key}
                      onClick={() => toggleAmenity(amenity.key)}
                      className={`flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all ${
                        formData.amenities.includes(amenity.key) ? 'bg-[#DA8552]/10 border-[#DA8552]' : ''
                      }`}
                    >
                      <div className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                        formData.amenities.includes(amenity.key) ? 'bg-[#DA8552]/10 text-[#DA8552]' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <i className={`${amenity.icon} ri-lg`}></i>
                      </div>
                      <span className="text-sm text-gray-700">{amenity.label}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    className="flex-grow px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                    placeholder="Add new amenity..."
                  />
                  <button 
                    onClick={addNewAmenity}
                    className="ml-2 bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-2 rounded-lg transition-all"
                  >
                    <i className="ri-add-line ri-lg"></i>
                  </button>
                </div>
              </div>

              {/* Overview Text */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  <i className="ri-file-text-line ri-lg mr-2 text-[#DA8552]"></i>
                  Overview Text
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <div className="flex border-b border-gray-300">
                    {[
                      { code: 'en', flag: '🇬🇧', name: 'English' },
                      { code: 'gu', flag: '🇮🇳', name: 'Gujarati' },
                      { code: 'hi', flag: '🇮🇳', name: 'Hindi' },
                      { code: 'es', flag: '🇪🇸', name: 'Spanish' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setActiveLanguage(lang.code)}
                        className={`px-4 py-2 text-sm font-medium flex items-center transition-all ${
                          activeLanguage === lang.code
                            ? 'bg-[#DA8552] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                  <div className="p-4">
                    <div className="border border-gray-200 rounded-lg p-2 mb-4 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-bold ri-lg"></i>
                        </button>
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-italic ri-lg"></i>
                        </button>
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-underline ri-lg"></i>
                        </button>
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-link ri-lg"></i>
                        </button>
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-list-unordered ri-lg"></i>
                        </button>
                        <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded transition-all">
                          <i className="ri-list-ordered ri-lg"></i>
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={formData.overviewText[activeLanguage as keyof typeof formData.overviewText]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        overviewText: {
                          ...prev.overviewText,
                          [activeLanguage]: e.target.value
                        }
                      }))}
                      className="w-full h-40 p-2 border-none focus:outline-none focus:ring-0 resize-none bg-transparent"
                      placeholder={`Enter overview text in ${activeLanguage === 'en' ? 'English' : activeLanguage === 'gu' ? 'Gujarati' : activeLanguage === 'hi' ? 'Hindi' : 'Spanish'}`}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Characters: {formData.overviewText[activeLanguage as keyof typeof formData.overviewText].length}/1000</span>
                      <span>All fields with translations will be marked with 🌐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={`step-content ${currentStep === 2 ? 'active' : ''}`}>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-ancient-pavilion-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">History & Architecture</h2>
              </div>
              <div className="mb-6">
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <div className="flex border-b border-gray-300">
                    {[
                      { code: 'en', flag: '🇬🇧', name: 'English' },
                      { code: 'gu', flag: '🇮🇳', name: 'Gujarati' },
                      { code: 'hi', flag: '🇮🇳', name: 'Hindi' },
                      { code: 'es', flag: '🇪🇸', name: 'Spanish' }
                    ].map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setActiveHistoryLanguage(lang.code)}
                        className={`language-tab px-4 py-2 text-sm font-medium flex items-center ${
                          activeHistoryLanguage === lang.code
                            ? 'active bg-[#DA8552] text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="w-6 h-6 flex items-center justify-center mr-2">{lang.flag}</span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                  {Object.keys(formData.historyText).map((lang) => (
                    <div
                      key={lang}
                      className={`history-lang-content p-4 ${
                        activeHistoryLanguage === lang ? '' : 'hidden'
                      }`}
                    >
                      <div className="border border-gray-200 rounded-lg p-2 mb-4">
                        <div className="flex items-center mb-2">
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-bold ri-lg"></i>
                          </button>
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-italic ri-lg"></i>
                          </button>
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-underline ri-lg"></i>
                          </button>
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-link ri-lg"></i>
                          </button>
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-list-unordered ri-lg"></i>
                          </button>
                          <button className="mr-2 bg-gray-100 hover:bg-gray-200 p-1 rounded">
                            <i className="ri-list-ordered ri-lg"></i>
                          </button>
                        </div>
                      </div>
                      <textarea
                        value={formData.historyText[lang as keyof typeof formData.historyText]}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          historyText: {
                            ...prev.historyText,
                            [lang]: e.target.value
                          }
                        }))}
                        className="w-full h-60 p-2 border-none focus:outline-none focus:ring-0 resize-none"
                        placeholder={`Enter detailed history and architecture information in ${lang === 'en' ? 'English' : lang === 'gu' ? 'Gujarati' : lang === 'hi' ? 'Hindi' : 'Spanish'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Audio Guide */}
              <div className="flex items-center mb-6 mt-10">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-volume-up-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Audio Guide</h2>
              </div>
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { code: 'en', flag: '🇬🇧', name: 'English Audio Guide', hasFile: true, duration: '12:45', fileSize: '14.2 MB', fileName: 'modhera_temple_guide_en.mp3' },
                    { code: 'gu', flag: '🇮🇳', name: 'Gujarati Audio Guide', hasFile: false },
                    { code: 'hi', flag: '🇮🇳', name: 'Hindi Audio Guide', hasFile: false },
                    { code: 'es', flag: '🇪🇸', name: 'Spanish Audio Guide', hasFile: false }
                  ].map((audio) => (
                    <div key={audio.code} className="border border-gray-300 rounded-lg p-4">
                      <div className="flex items-center mb-3">
                        <span className="w-6 h-6 flex items-center justify-center mr-2">{audio.flag}</span>
                        <h3 className="text-md font-medium">{audio.name}</h3>
                      </div>
                      {audio.hasFile ? (
                        <>
                          <div className="flex items-center mb-4">
                            <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full mr-3">
                              <i className="ri-upload-line ri-lg text-gray-700"></i>
                            </button>
                            <div className="flex-grow">
                              <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#DA8552] w-3/4"></div>
                              </div>
                            </div>
                            <div className="ml-3 text-sm text-gray-600">{audio.duration}</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <button className="text-[#DA8552] hover:text-[#DA8552]/80">
                              <i className="ri-play-circle-line ri-2x"></i>
                            </button>
                            <button className="text-red-500 hover:text-red-600">
                              <i className="ri-delete-bin-line ri-lg"></i>
                            </button>
                          </div>
                          <div className="mt-3 text-xs text-gray-500">
                            File: {audio.fileName} ({audio.fileSize})
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-32">
                          <i className="ri-upload-cloud-line ri-3x text-gray-300 mb-3"></i>
                          <button className="bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-2 rounded-lg text-sm">
                            Upload Audio File
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Map */}
              <div className="flex items-center mb-6 mt-10">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-map-2-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Site Map</h2>
              </div>
              <div className="mb-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="mb-4">
                    <img
                      src="https://fvveqziyusjgqejowkfp.supabase.co/storage/v1/object/public/photomedia/HeritageWeb/AddAboutHeritageImage.jpg"
                      className="max-w-full h-auto mx-auto rounded-lg"
                      alt="Site Map Preview"
                    />
                  </div>
                  <p className="text-gray-600 mb-4">modhera_temple_site_map.pdf (2.4 MB)</p>
                  <div className="flex justify-center space-x-3">
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center">
                      <i className="ri-eye-line ri-lg mr-2"></i> Preview
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center">
                      <i className="ri-upload-line ri-lg mr-2"></i> Replace
                    </button>
                    <button className="bg-gray-100 hover:bg-gray-200 text-red-500 px-4 py-2 rounded-lg text-sm flex items-center">
                      <i className="ri-delete-bin-line ri-lg mr-2"></i> Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Cultural Etiquettes */}
              <div className="flex items-center mb-6 mt-10">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-information-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Cultural Etiquettes</h2>
              </div>
              <div className="mb-6">
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="mb-4">
                    {formData.culturalEtiquettes.map((etiquette, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <i className="ri-checkbox-circle-line ri-lg text-[#DA8552] mr-2"></i>
                        <p className="text-gray-700">{etiquette}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Add new etiquette point..."
                      value={newEtiquette}
                      onChange={(e) => setNewEtiquette(e.target.value)}
                    />
                    <button
                      onClick={addNewEtiquette}
                      className="ml-2 bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-2 rounded-lg"
                    >
                      <i className="ri-add-line ri-lg"></i>
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={`step-content ${currentStep === 3 ? 'active' : ''}`}>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-ticket-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Ticketing Information</h2>
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
                        className="custom-radio mr-2"
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
                        className="custom-radio mr-2"
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
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#DA8552] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#DA8552]"></div>
                    </label>
                    <span className="ml-2 text-gray-700">Online Booking Available</span>
                  </div>
                </div>

                {formData.ticketType === 'paid' && (
                  <div>
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Booking URL (Optional)</label>
                      <input
                        type="url"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                        placeholder="https://..."
                        value={formData.bookingUrl}
                        onChange={(e) => handleInputChange('bookingUrl', e.target.value)}
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Visitor Type</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fee (₹)</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                            <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.ticketFees.map((fee, index) => (
                            <tr key={index} className="border-t border-gray-200">
                              <td className="px-4 py-3 text-sm text-gray-700">
                                <input
                                  type="text"
                                  value={fee.type}
                                  onChange={(e) => updateTicketFee(index, 'type', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                                  placeholder="Visitor type"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={fee.fee}
                                  onChange={(e) => updateTicketFee(index, 'fee', parseInt(e.target.value))}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={fee.notes}
                                  onChange={(e) => updateTicketFee(index, 'notes', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                                  placeholder="Any special notes"
                                />
                              </td>
                              <td className="px-4 py-3 text-right">
                                <button 
                                  onClick={() => removeTicketFee(index)}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <i className="ri-delete-bin-line ri-lg"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="mt-4">
                        <button
                          onClick={addTicketFee}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center"
                        >
                          <i className="ri-add-line ri-lg mr-2"></i> Add New Fee Type
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Transportation Information */}
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-route-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Transportation Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full mr-3">
                      <i className="ri-train-line ri-lg"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Nearest Metro Station</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.transportation.metro.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          metro: { ...prev.transportation.metro, name: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Station name"
                    />
                    <input
                      type="number"
                      value={formData.transportation.metro.distance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          metro: { ...prev.transportation.metro, distance: parseFloat(e.target.value) }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Distance (km)"
                    />
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
                      <i className="ri-bus-line ri-lg"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Nearest Bus Stop</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.transportation.bus.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          bus: { ...prev.transportation.bus, name: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Stop name"
                    />
                    <input
                      type="number"
                      value={formData.transportation.bus.distance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          bus: { ...prev.transportation.bus, distance: parseFloat(e.target.value) }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Distance (km)"
                    />
                  </div>
                </div>

                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 flex items-center justify-center bg-yellow-100 text-yellow-600 rounded-full mr-3">
                      <i className="ri-taxi-line ri-lg"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">Taxi/Auto Stand</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={formData.transportation.taxi.name}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          taxi: { ...prev.transportation.taxi, name: e.target.value }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Stand name"
                    />
                    <input
                      type="number"
                      value={formData.transportation.taxi.distance}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        transportation: {
                          ...prev.transportation,
                          taxi: { ...prev.transportation.taxi, distance: parseFloat(e.target.value) }
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Distance (km)"
                    />
                  </div>
                </div>
              </div>

              {/* Nearby Attractions */}
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                  <i className="ri-map-pin-time-line ri-lg"></i>
                </div>
                <h2 className="text-xl font-semibold text-[#3F3D56]">Nearby Attractions</h2>
              </div>
              <div className="mb-6">
                <div className="border border-gray-300 rounded-lg p-4">
                  <div className="mb-4">
                    {formData.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <i className="ri-map-pin-line ri-lg text-[#DA8552] mr-2"></i>
                          <input
                            type="text"
                            value={attraction.name}
                            onChange={(e) => updateNearbyAttraction(index, 'name', e.target.value)}
                            className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                            placeholder="Attraction name"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="number"
                            value={attraction.distance}
                            onChange={(e) => updateNearbyAttraction(index, 'distance', parseFloat(e.target.value))}
                            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                            placeholder="km"
                          />
                          <span className="ml-2 text-sm text-gray-500">km</span>
                          <button
                            onClick={() => removeNearbyAttraction(index)}
                            className="ml-2 text-red-500 hover:text-red-600"
                          >
                            <i className="ri-delete-bin-line ri-lg"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="Add nearby attraction..."
                      value={newNearbyAttraction}
                      onChange={(e) => setNewNearbyAttraction(e.target.value)}
                    />
                    <input
                      type="number"
                      className="w-24 ml-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                      placeholder="km"
                      value={newNearbyDistance}
                      onChange={(e) => setNewNearbyDistance(parseFloat(e.target.value) || 0)}
                    />
                    <button
                      onClick={addNewNearbyAttraction}
                      className="ml-2 bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-2 rounded-lg"
                    >
                      <i className="ri-add-line ri-lg"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className={`step-content ${currentStep === 4 ? 'active' : ''}`}>
            <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center bg-[#DA8552]/10 text-[#DA8552] rounded-full mr-3">
                    <i className="ri-eye-line ri-lg"></i>
                  </div>
                  <h2 className="text-xl font-semibold text-[#3F3D56]">Preview & Submit</h2>
                </div>
                <div className="flex items-center">
                  <a href="#" className="text-[#DA8552] hover:text-[#DA8552]/80 underline">Preview link</a>
                </div>
              </div>
              
              <div className="mb-8">
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center">
                    <i className="ri-smartphone-line ri-lg text-gray-500 mr-2"></i>
                    <span className="text-gray-700 font-medium">Tourist View Preview</span>
                  </div>
                  <div className="p-4">
                    <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                      <img 
                        src="https://fvveqziyusjgqejowkfp.supabase.co/storage/v1/object/public/photomedia/HeritageWeb/SunTempleModhera.jpg"
                        alt="Sun Temple Modhera"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-white text-2xl font-bold drop-shadow-lg">
                          {formData.siteName || 'Sun Temple Modhera'}
                        </h3>
                        <div className="flex items-center mt-1">
                          <i className="ri-map-pin-line text-white drop-shadow-lg mr-1"></i>
                          <span className="text-white text-sm drop-shadow-lg">
                            {formData.locationAddress || 'Modhera, Gujarat, India'}
                          </span>
                        </div>
                      </div>
                      {formData.arMode && (
                        <div className="absolute top-4 right-4 bg-[#DA8552] text-white px-3 py-1 rounded-full text-sm font-medium">
                          AR Available
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <i className="ri-time-line text-[#DA8552] mr-2"></i>
                          <span className="text-gray-700 font-medium">Opening Hours</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formData.openDays.length > 0 ? `${formData.openDays.slice(0, 3).map(day => day.charAt(0).toUpperCase() + day.slice(1).slice(0, 3)).join('-')}: ${formData.openingTime} - ${formData.closingTime}` : 'Not specified'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center mb-2">
                          <i className="ri-ticket-line text-[#DA8552] mr-2"></i>
                          <span className="text-gray-700 font-medium">Entry Fee</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formData.ticketType === 'free' ? 'Free Entry' : formData.ticketFees.length > 0 ? `${formData.ticketFees[0].type}: ₹${formData.ticketFees[0].fee}` : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-800 mb-2">Overview</h4>
                      <p className="text-gray-700 text-sm">
                        {formData.overviewText.en || 'No overview text provided...'}
                      </p>
                    </div>
                    <div className="flex space-x-3">
                      <button className="bg-[#DA8552] hover:bg-[#DA8552]/90 text-white px-4 py-2 rounded-lg text-sm flex items-center">
                        <i className="ri-ticket-line ri-lg mr-2"></i> Book Tickets
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center">
                        <i className="ri-map-pin-line ri-lg mr-2"></i> Directions
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm flex items-center">
                        <i className="ri-share-line ri-lg mr-2"></i> Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Completion Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="text-green-700 font-medium mb-2">Completed Sections</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-green-600">
                        <i className="ri-checkbox-circle-line ri-lg mr-2"></i>
                        <span>Basic Information</span>
                      </li>
                      <li className="flex items-center text-green-600">
                        <i className="ri-checkbox-circle-line ri-lg mr-2"></i>
                        <span>Location Details</span>
                      </li>
                      <li className="flex items-center text-green-600">
                        <i className="ri-checkbox-circle-line ri-lg mr-2"></i>
                        <span>Media Gallery</span>
                      </li>
                      <li className="flex items-center text-green-600">
                        <i className="ri-checkbox-circle-line ri-lg mr-2"></i>
                        <span>Opening Hours</span>
                      </li>
                      <li className="flex items-center text-green-600">
                        <i className="ri-checkbox-circle-line ri-lg mr-2"></i>
                        <span>Entrance Fees</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="text-yellow-700 font-medium mb-2">Missing Information</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center text-yellow-600">
                        <i className="ri-error-warning-line ri-lg mr-2"></i>
                        <span>Audio Guide (3 languages missing)</span>
                      </li>
                      <li className="flex items-center text-yellow-600">
                        <i className="ri-error-warning-line ri-lg mr-2"></i>
                        <span>Overview Text (3 languages missing)</span>
                      </li>
                      <li className="flex items-center text-yellow-600">
                        <i className="ri-error-warning-line ri-lg mr-2"></i>
                        <span>History & Architecture (3 languages missing)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Save Options</h3>
                <div className="flex items-center mb-6">
                  <div className="flex items-center mr-8">
                    <input
                      type="radio"
                      id="saveDraft"
                      name="saveOption"
                      className="custom-radio mr-2"
                      defaultChecked
                    />
                    <label htmlFor="saveDraft" className="text-gray-700">Save as Draft</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      id="submitApproval"
                      name="saveOption"
                      className="custom-radio mr-2"
                    />
                    <label htmlFor="submitApproval" className="text-gray-700">Submit for Approval</label>
                  </div>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="text-gray-700 font-medium mb-2">Admin Notes (Optional)</h4>
                  <textarea
                    className="w-full h-24 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DA8552] focus:border-transparent"
                    placeholder="Add any notes for the admin review team..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Validation Errors */}
        {getValidationErrors(currentStep).length > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="text-red-700 font-medium mb-2">Please fix the following errors:</h4>
            <ul className="list-disc list-inside text-red-600 space-y-1">
              {getValidationErrors(currentStep).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 mb-12">
          <button
            onClick={prevStep}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center ${
              currentStep === 1
                ? 'invisible'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            <i className="ri-arrow-left-line ri-lg mr-2"></i> Previous
          </button>
          
          {currentStep < 4 ? (
            <button
              onClick={nextStep}
              disabled={!canProceedToNext()}
              className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${
                canProceedToNext()
                  ? 'bg-[#DA8552] hover:bg-[#DA8552]/90 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Next <i className="ri-arrow-right-line ri-lg ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#DA8552] hover:bg-[#DA8552]/90 text-white rounded-lg font-medium flex items-center transition-all"
            >
              Submit Heritage Site <i className="ri-check-line ri-lg ml-2"></i>
            </button>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 flex items-center transition-opacity duration-300">
          <div className="w-10 h-10 flex items-center justify-center bg-green-100 text-green-600 rounded-full mr-3">
            <i className="ri-check-line ri-lg"></i>
          </div>
          <div>
            <h4 className="text-gray-800 font-medium">Auto-saved</h4>
            <p className="text-gray-600 text-sm">Your changes have been saved</p>
          </div>
        </div>
      )}

      {/* Confetti Animation CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AddNewHeritage;
