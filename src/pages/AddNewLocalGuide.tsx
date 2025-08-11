import React, { useState, useEffect } from 'react';
import './AddNewLocalGuide.css';

interface AddNewLocalGuideProps {
  onLogout?: () => void;
  onPageChange?: (page: string) => void;
}

interface FormData {
  guideName: string;
  address: string;
  area: string;
  city: string;
  state: string;
  profilePhoto: File | null;
  documents: File[];
  bio: {
    en: string;
    gu: string;
    hn: string;
    es: string;
  };
  languages: string[];
  specializations: string[];
  experience: number;
  coverageArea: string;
  email: string;
  phone: string;
  showContact: boolean;
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  availableDays: string[];
  weekdayStart: string;
  weekdayEnd: string;
  weekendStart: string;
  weekendEnd: string;
  status: 'draft' | 'submit';
}

const AddNewLocalGuide: React.FC<AddNewLocalGuideProps> = ({ onLogout, onPageChange }) => {
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    guideName: '',
    address: '',
    area: '',
    city: '',
    state: '',
    profilePhoto: null,
    documents: [],
    bio: {
      en: '',
      gu: '',
      hn: '',
      es: ''
    },
    languages: ['EN'],
    specializations: ['Heritage Walks', 'Architecture Tour'],
    experience: 0,
    coverageArea: '',
    email: '',
    phone: '',
    showContact: true,
    hourlyRate: 0,
    halfDayRate: 0,
    fullDayRate: 0,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    weekdayStart: '09:00',
    weekdayEnd: '17:00',
    weekendStart: '10:00',
    weekendEnd: '18:00',
    status: 'draft'
  });

  const [activeLanguage, setActiveLanguage] = useState('en');
  const [showToast, setShowToast] = useState(false);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBioChange = (lang: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      bio: {
        ...prev.bio,
        [lang]: value
      }
    }));
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        profilePhoto: e.target.files![0]
      }));
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocs]
      }));
    }
  };

  const removeDocument = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const nextSection = () => {
    if (currentSection < 4) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const getProgressWidth = () => {
    return ((currentSection - 1) * 100) / 3;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F4]">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="w-10 h-10 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-full"
              onClick={() => onPageChange && onPageChange('manage')}
            >
              <i className="ri-arrow-left-line ri-lg"></i>
            </button>
          </div>
          <h1 className="text-xl font-semibold text-center text-gray-800">
            Add New Local Guide
          </h1>
          <div className="w-10 h-10 flex items-center justify-center">
            <div className="text-sm text-gray-500">Saved</div>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Step Progress */}
          <div className="mb-10">
            <div className="flex justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 cursor-pointer ${
                    step <= currentSection ? 'text-gray-800' : 'text-gray-600'
                  }`}
                  onClick={() => step <= currentSection && setCurrentSection(step)}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step <= currentSection
                        ? 'bg-[#DA8552] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span className="text-sm font-medium">
                    {step === 1 && 'About'}
                    {step === 2 && 'Overview'}
                    {step === 3 && 'Charges & Availability'}
                    {step === 4 && 'Finalize'}
                  </span>
                </div>
              ))}
            </div>
            <div className="step-progress bg-gray-200 rounded-full h-1">
              <div
                className="step-progress-bar bg-[#DA8552] h-full rounded-full transition-all duration-300"
                style={{ width: `${getProgressWidth()}%` }}
              ></div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-8">
            {/* Section 1: About */}
            {currentSection === 1 && (
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">About</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="guide-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Guide Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="guide-name"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                      placeholder="Enter full name"
                      value={formData.guideName}
                      onChange={(e) => handleInputChange('guideName', e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                        placeholder="Street address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
                        Area
                      </label>
                      <input
                        type="text"
                        id="area"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                        placeholder="Area/Locality"
                        value={formData.area}
                        onChange={(e) => handleInputChange('area', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        id="state"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Profile Photo
                    </label>
                    <div className="flex items-start gap-6">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {formData.profilePhoto ? (
                          <img
                            src={URL.createObjectURL(formData.profilePhoto)}
                            className="w-full h-full object-cover"
                            alt="Profile preview"
                          />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center text-gray-400">
                            <i className="ri-user-line ri-2x"></i>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label htmlFor="profile-upload" className="custom-file-upload border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center hover:border-[#DA8552] transition-colors">
                          <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                            <i className="ri-upload-2-line ri-lg text-gray-500"></i>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            Drag and drop or click to upload
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG or GIF (Max. 2MB)
                          </p>
                        </label>
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleProfilePhotoUpload}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Certificates/Documents
                    </label>
                    <label htmlFor="document-upload" className="custom-file-upload border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center hover:border-[#DA8552] transition-colors">
                      <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <i className="ri-file-upload-line ri-lg text-gray-500"></i>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Upload ID, license, or any proof documents
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, JPG, PNG (Max. 5MB each)
                      </p>
                    </label>
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={handleDocumentUpload}
                    />
                    
                    {formData.documents.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {formData.documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center">
                                <i className="ri-file-text-line ri-lg text-gray-600"></i>
                              </div>
                              <span className="text-sm text-gray-700">{doc.name}</span>
                            </div>
                            <button
                              className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-500"
                              onClick={() => removeDocument(index)}
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Certifications/Badges
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <div className="badge badge-certified px-3 py-1 rounded-full bg-[#DA8552]/10 text-[#DA8552] text-xs font-medium">
                        <i className="ri-verified-badge-line ri-sm mr-1"></i>
                        <span>Tourism Board Certified</span>
                      </div>
                      <div className="badge badge-licensed px-3 py-1 rounded-full bg-[#3F3D56]/10 text-[#3F3D56] text-xs font-medium">
                        <i className="ri-shield-check-line ri-sm mr-1"></i>
                        <span>City Licensed</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Badges are automatically assigned based on your uploaded documents
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    className="px-6 py-2 bg-[#DA8552] text-white font-medium rounded-lg hover:bg-[#DA8552]/90 transition-colors"
                    onClick={nextSection}
                  >
                    Next: Overview
                  </button>
                </div>
              </section>
            )}

            {/* Section 2: Overview */}
            {currentSection === 2 && (
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Overview</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Bio/About
                    </label>
                    <div className="border border-gray-300 rounded overflow-hidden">
                      <div className="flex border-b border-gray-300">
                        {['en', 'gu', 'hn', 'es'].map((lang) => (
                          <button
                            key={lang}
                            className={`px-4 py-2 text-sm font-medium ${
                              activeLanguage === lang
                                ? 'bg-[#DA8552] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                            onClick={() => setActiveLanguage(lang)}
                          >
                            {lang === 'en' && 'English'}
                            {lang === 'gu' && 'Gujarati'}
                            {lang === 'hn' && 'Hindi'}
                            {lang === 'es' && 'Spanish'}
                          </button>
                        ))}
                      </div>
                      {['en', 'gu', 'hn', 'es'].map((lang) => (
                        <div
                          key={lang}
                          className={`p-4 ${activeLanguage === lang ? '' : 'hidden'}`}
                        >
                          <textarea
                            className="w-full p-3 border-none focus:ring-0 outline-none resize-none"
                            rows={4}
                            placeholder={`Write in ${lang === 'en' ? 'English' : lang === 'gu' ? 'Gujarati' : lang === 'hn' ? 'Hindi' : 'Spanish'}...`}
                            value={formData.bio[lang as keyof typeof formData.bio]}
                            onChange={(e) => handleBioChange(lang, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Languages Known
                    </label>
                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-3">
                      {['EN', 'HI', 'GU', 'ES', 'FR', 'DE', 'JA'].map((lang) => (
                        <div
                          key={lang}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                            formData.languages.includes(lang)
                              ? 'bg-[#DA8552] text-white'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          onClick={() => toggleLanguage(lang)}
                        >
                          <span className="text-sm font-medium">{lang}</span>
                        </div>
                      ))}
                      <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-lg flex items-center justify-center">
                        <i className="ri-add-line ri-lg"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Specializations
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'Heritage Walks', 'Food Tour', 'Architecture Tour', 'Cultural Experience',
                        'Historical Sites', 'Religious Tour', 'Art & Craft Tour', 'Local Markets',
                        'Photography Tour'
                      ].map((spec) => (
                        <div
                          key={spec}
                          className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                            formData.specializations.includes(spec)
                              ? 'bg-[#DA8552] text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          onClick={() => toggleSpecialization(spec)}
                        >
                          {spec}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                        Experience
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="experience"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                          placeholder="Years of experience"
                          min="0"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <span className="text-gray-500">years</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="coverage-area" className="block text-sm font-medium text-gray-700 mb-1">
                        Coverage Area
                      </label>
                      <input
                        type="text"
                        id="coverage-area"
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                        placeholder="Zones covered (e.g., Old City, North District)"
                        value={formData.coverageArea}
                        onChange={(e) => handleInputChange('coverageArea', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-3">Contact Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                          placeholder="Email address"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                          placeholder="Phone number"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <label htmlFor="show-contact" className="text-sm font-medium text-gray-700">
                        Show contact details to tourists?
                      </label>
                      <label className="toggle-switch relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          id="show-contact"
                          className="opacity-0 w-0 h-0"
                          checked={formData.showContact}
                          onChange={(e) => handleInputChange('showContact', e.target.checked)}
                        />
                        <span className={`toggle-slider absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
                          formData.showContact ? 'bg-[#DA8552]' : 'bg-gray-300'
                        }`}>
                          <span className={`absolute h-4 w-4 rounded-full bg-white transition-transform ${
                            formData.showContact ? 'translate-x-6' : 'translate-x-1'
                          }`} style={{ top: '2px' }}></span>
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={prevSection}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 bg-[#DA8552] text-white font-medium rounded-lg hover:bg-[#DA8552]/90 transition-colors"
                    onClick={nextSection}
                  >
                    Next: Charges & Availability
                  </button>
                </div>
              </section>
            )}

            {/* Section 3: Charges & Availability */}
            {currentSection === 3 && (
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Charges & Availability</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-3">Tour Rates</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="hourly-rate" className="block text-sm font-medium text-gray-700 mb-1">
                          Hourly Rate
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            id="hourly-rate"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                            placeholder="Amount"
                            min="0"
                            value={formData.hourlyRate}
                            onChange={(e) => handleInputChange('hourlyRate', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="half-day-rate" className="block text-sm font-medium text-gray-700 mb-1">
                          Half-Day Rate
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            id="half-day-rate"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                            placeholder="Amount"
                            min="0"
                            value={formData.halfDayRate}
                            onChange={(e) => handleInputChange('halfDayRate', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="full-day-rate" className="block text-sm font-medium text-gray-700 mb-1">
                          Full-Day Rate
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            id="full-day-rate"
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                            placeholder="Amount"
                            min="0"
                            value={formData.fullDayRate}
                            onChange={(e) => handleInputChange('fullDayRate', parseInt(e.target.value) || 0)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-md font-medium text-gray-800 mb-3">Availability</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Days
                        </label>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            { key: 'monday', label: 'Mon' },
                            { key: 'tuesday', label: 'Tue' },
                            { key: 'wednesday', label: 'Wed' },
                            { key: 'thursday', label: 'Thu' },
                            { key: 'friday', label: 'Fri' },
                            { key: 'saturday', label: 'Sat' },
                            { key: 'sunday', label: 'Sun' }
                          ].map(({ key, label }) => (
                            <div key={key} className="flex flex-col items-center">
                              <label htmlFor={key} className="text-sm text-gray-600 mb-1">
                                {label}
                              </label>
                              <input
                                type="checkbox"
                                id={key}
                                className="w-5 h-5 text-[#DA8552] border-gray-300 rounded focus:ring-[#DA8552]"
                                checked={formData.availableDays.includes(key)}
                                onChange={() => toggleDay(key)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Available Hours
                        </label>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm text-gray-600 mb-2 block">
                              Weekdays (Mon-Fri)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                                value={formData.weekdayStart}
                                onChange={(e) => handleInputChange('weekdayStart', e.target.value)}
                              />
                              <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                                value={formData.weekdayEnd}
                                onChange={(e) => handleInputChange('weekdayEnd', e.target.value)}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 mb-2 block">
                              Weekends (Sat-Sun)
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                                value={formData.weekendStart}
                                onChange={(e) => handleInputChange('weekendStart', e.target.value)}
                              />
                              <input
                                type="time"
                                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#DA8552] focus:border-[#DA8552] outline-none"
                                value={formData.weekendEnd}
                                onChange={(e) => handleInputChange('weekendEnd', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={prevSection}
                  >
                    Back
                  </button>
                  <button
                    className="px-6 py-2 bg-[#DA8552] text-white font-medium rounded-lg hover:bg-[#DA8552]/90 transition-colors"
                    onClick={nextSection}
                  >
                    Next: Finalize
                  </button>
                </div>
              </section>
            )}

            {/* Section 4: Finalize & Review */}
            {currentSection === 4 && (
              <section className="bg-white rounded-lg shadow-sm p-6 space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Review</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium text-gray-800">
                          Preview your profile
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          See how your profile will appear to tourists
                        </p>
                      </div>
                      <a href="#" className="text-[#DA8552] font-medium underline">
                        Preview
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          className="w-4 h-4 text-[#DA8552] border-gray-300 focus:ring-[#DA8552]"
                          checked={formData.status === 'draft'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        />
                        <span className="text-sm text-gray-700">Save as Draft</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="submit"
                          className="w-4 h-4 text-[#DA8552] border-gray-300 focus:ring-[#DA8552]"
                          checked={formData.status === 'submit'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                        />
                        <span className="text-sm text-gray-700">Submit for Approval</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Draft profiles are not visible to tourists. Submit for approval to make your profile public.
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 flex items-center justify-center text-yellow-500">
                        <i className="ri-information-line"></i>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-800">Approval Process</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Your profile will be reviewed by our team within 48 hours. You'll receive an email notification once approved.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                    onClick={prevSection}
                  >
                    Back
                  </button>
                  <button
                    className="px-8 py-3 bg-[#DA8552] text-white font-medium rounded-lg hover:bg-[#DA8552]/90 transition-colors"
                    onClick={handleSubmit}
                  >
                    Submit
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <i className="ri-check-line"></i>
            <span>Profile submitted successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddNewLocalGuide;
