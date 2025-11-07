import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Users,
  Palette, 
  Bed, 
  Frame,
  Settings,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Send,
  Loader2,
  Info,
  X, AlertCircle, Check
} from 'lucide-react';
import { backendServer } from '../utils/info';

// ============================================
// MODAL COMPONENTS
// ============================================

const Modal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm modal-fade-in"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full modal-slide-up">
          {children}
        </div>
      </div>

      <style jsx>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .modal-fade-in { animation: modalFadeIn 0.2s ease-out; }
        .modal-slide-up { animation: modalSlideUp 0.3s ease-out; }
      `}</style>
    </>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message, onConfirm }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="p-8">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center animate-pulse">
            <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 text-center mb-3">{title}</h3>
      <p className="text-gray-600 text-center mb-8 leading-relaxed">{message}</p>
      <button
        onClick={onConfirm || onClose}
        className="w-full py-3.5 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
      >
        Continue
      </button>
    </div>
  </Modal>
);

const ErrorModal = ({ isOpen, onClose, title, message }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="p-8">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 text-center mb-3">{title}</h3>
      <p className="text-gray-600 text-center mb-8 leading-relaxed">{message}</p>
      <button
        onClick={onClose}
        className="w-full py-3.5 px-6 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02]"
      >
        Got it
      </button>
    </div>
  </Modal>
);

const ValidationModal = ({ isOpen, onClose, errors }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="p-8">
      <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
        <X className="w-5 h-5 text-gray-500" />
      </button>
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
          <div className="w-16 h-16 bg-yellow-200 rounded-full flex items-center justify-center">
            <Info className="w-10 h-10 text-yellow-600" strokeWidth={2.5} />
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 text-center mb-4">Please Complete Required Fields</h3>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4 mb-6 max-h-60 overflow-y-auto">
        <ul className="space-y-3">
          {errors.map((error, index) => (
            <li key={index} className="flex items-start gap-3 text-sm text-yellow-900">
              <div className="flex-shrink-0 w-5 h-5 bg-yellow-200 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-xs font-bold text-yellow-700">{index + 1}</span>
              </div>
              <span className="flex-1">{error}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={onClose}
        className="w-full py-3.5 px-6 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-all transform hover:scale-[1.02]"
      >
        Fix Required Fields
      </button>
    </div>
  </Modal>
);

const DesignQuestionnaire = ({ unitNumber, email, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [successModal, setSuccessModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '' 
  });
  const [errorModal, setErrorModal] = useState({ 
    isOpen: false, 
    title: '', 
    message: '' 
  });
  const [validationModal, setValidationModal] = useState({ 
    isOpen: false, 
    errors: [] 
  });
  
  // FULL FORM STATE - All fields from PDF
  const [formData, setFormData] = useState({
    clientName: '',
    unitNumber: unitNumber || '',
    
    homeUse: {
      purpose: '',
      primaryUsers: '',
      familyMembers: '',
      childrenAges: '',
      hasRenters: false,
      hasPets: false,
      petDetails: '',
      livingStyle: '',
      desiredFeel: []
    },
    
    workFromHome: {
      homeOfficeNeeded: false,
      deskNeeded: false
    },
    entertaining: {
      frequency: '',
      gatheringTypes: []
    },
    outdoorUse: [],
    
    designOptions: {
      designType: '',
      preferredCollection: '',
      styleDirection: '',
      mainUpholsteryColor: '',
      accentColors: [],
      metalTone: '',
      contrast: '',
      colorsToAvoid: ''
    },
    
    bedrooms: {
      bedSizes: [],
      mattressFirmness: '',
      beddingType: [],
      beddingMaterial: [],
      beddingColor: [],
      lightingMood: ''
    },
    
    art: {
      stylePreferences: [],
      coverage: ''
    },
    accessories: {
      preference: ''
    },
    decorativePillows: '',
    
    specialZones: [],
    existingFurniture: {
      keeping: false,
      items: ''
    },
    additionalNotes: '',
    
    // Add-ons
    closetSolutions: {
      interested: false,
      closetUse: [],
      organizationStyle: '',
      additionalNeeds: [],
      finishOption: '',
      locations: [],
      lockingSection: false
    },
    windowCoverings: {
      interested: false,
      treatmentPreference: [],
      operation: [],
      motorizedDetails: '',
      desiredLightQuality: [],
      materialPreference: [],
      preferredStyle: [],
      locations: []
    },
    audioVisual: {
      interested: false,
      usageLevel: '',
      locations: []
    },
    greenery: {
      interested: false,
      plantType: '',
      locations: []
    },
    kitchenEssentials: {
      interested: false,
      selectedItems: []
    }
  });

  const steps = [
    { number: 1, title: 'Home & Lifestyle', icon: Home },
    { number: 2, title: 'Daily Living', icon: Users },
    { number: 3, title: 'Design Aesthetic', icon: Palette },
    { number: 4, title: 'Bedrooms', icon: Bed },
    { number: 5, title: 'Art & Finishing', icon: Frame },
    { number: 6, title: 'Add-On Services', icon: Settings }
  ];

  // Load draft on mount
  useEffect(() => {
    loadDraft();
  }, []);

  const loadDraft = async () => {
    try {
      const response = await fetch(
        `${backendServer}/api/questionnaires/my-questionnaires?email=${encodeURIComponent(email)}&unitNumber=${encodeURIComponent(unitNumber)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load draft');
      }

      const data = await response.json();
      const draft = data.questionnaires.find(
        q => q.unitNumber === unitNumber && q.status === 'draft'
      );
      
      if (draft) {
        setFormData(draft);
        setCurrentStep(draft.currentStep || 1);
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const submitQuestionnaire = async () => {
    // Validation with array of errors
    const errors = [];
    
    if (!formData.clientName) {
      errors.push('Please enter your name');
    }
    
    if (!formData.homeUse.purpose) {
      errors.push('Please select the purpose of your residence');
    }
    
    if (!formData.homeUse.primaryUsers) {
      errors.push('Please select who will primarily use the home');
    }
    
    if (!formData.homeUse.livingStyle) {
      errors.push('Please select your living style');
    }

    // Show validation modal if errors
    if (errors.length > 0) {
      setValidationModal({ isOpen: true, errors });
      return;
    }
    
    try {
      setIsSaving(true);
      
      const response = await fetch(`${backendServer}/api/questionnaires/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          unitNumber,
          ...formData,
          currentStep
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }

      const data = await response.json();
      
      if (data.success) {
        // Show success modal
        setSuccessModal({
          isOpen: true,
          title: '🎉 Questionnaire Submitted!',
          message: 'Thank you for completing the design questionnaire. Our team will review your responses and get back to you soon.',
          onConfirm: () => {
            setSuccessModal({ ...successModal, isOpen: false });
            if (onComplete) onComplete(data.questionnaire);
          }
        });
      }
    } catch (error) {
      // Show error modal
      setErrorModal({
        isOpen: true,
        title: 'Submission Failed',
        message: error.message || 'Something went wrong. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (section, field, value) => {
    setFormData(prev => section ? {
      ...prev,
      [section]: { ...prev[section], [field]: value }
    } : {
      ...prev,
      [field]: value
    });
  };

  const handleArrayToggle = (section, field, value) => {
    setFormData(prev => {
      const currentArray = prev[section][field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return {
        ...prev,
        [section]: { ...prev[section], [field]: newArray }
      };
    });
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Validation functions for each step
  const validateStep1 = () => {
    return !!(
      formData.clientName &&
      formData.homeUse.purpose &&
      formData.homeUse.primaryUsers &&
      formData.homeUse.livingStyle
    );
  };

  const validateStep2 = () => {
    return true; // Step 2 has no required fields
  };

  const validateStep3 = () => {
    return !!(formData.designOptions.designType);
  };

  const validateStep4 = () => {
    return true; // Step 4 has no required fields
  };

  const validateStep5 = () => {
    return true; // Step 5 has no required fields
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return validateStep1();
      case 2: return validateStep2();
      case 3: return validateStep3();
      case 4: return validateStep4();
      case 5: return validateStep5();
      default: return true;
    }
  };

  const getValidationMessage = () => {
    if (currentStep === 1) {
      if (!formData.clientName) return 'Please enter your name';
      if (!formData.homeUse.purpose) return 'Please select the purpose of your residence';
      if (!formData.homeUse.primaryUsers) return 'Please select who will primarily use the home';
      if (!formData.homeUse.livingStyle) return 'Please select your living style';
    }
    if (currentStep === 3) {
      if (!formData.designOptions.designType) return 'Please select your design approach';
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
        title={successModal.title}
        message={successModal.message}
        onConfirm={successModal.onConfirm}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ ...errorModal, isOpen: false })}
        title={errorModal.title}
        message={errorModal.message}
      />

      <ValidationModal
        isOpen={validationModal.isOpen}
        onClose={() => setValidationModal({ ...validationModal, isOpen: false })}
        errors={validationModal.errors}
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white py-12 px-8 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light mb-3 tracking-wide">
            Ālia Design Questionnaire
          </h1>
          <p className="text-white/90 text-lg">
            Unit {unitNumber} • Help us understand your vision
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 pb-16">
        
        {/* Progress Steps - Fixed overflow */}
        <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 mb-8">
          <div className="overflow-x-auto pb-2">
            <div className="flex justify-between items-center" style={{ minWidth: '600px' }}>
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.number;
                const isCompleted = currentStep > step.number;
                return (
                  <React.Fragment key={step.number}>
                    <button
                      onClick={() => goToStep(step.number)}
                      className={`flex flex-col items-center flex-shrink-0 transition-all ${
                        isActive ? 'text-[#005670]' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                      style={{ minWidth: '70px', maxWidth: '100px' }}
                    >
                      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 transition-all ${
                        isActive ? 'bg-[#005670] text-white shadow-lg' : 
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200'
                      }`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6 md:w-7 md:h-7" /> : <Icon className="w-5 h-5 md:w-6 md:h-6" />}
                      </div>
                      <span className="text-[10px] md:text-xs text-center font-medium leading-tight px-1">{step.title}</span>
                    </button>
                    {idx < steps.length - 1 && (
                      <div className={`h-1 transition-all ${
                        currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                      }`} style={{ minWidth: '20px', flex: '1 1 auto' }} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-10">
          {currentStep === 1 && <Step1 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
          {currentStep === 2 && <Step2 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
          {currentStep === 3 && <Step3 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
          {currentStep === 4 && <Step4 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
          {currentStep === 5 && <Step5 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
          {currentStep === 6 && <Step6 formData={formData} handleChange={handleChange} handleArrayToggle={handleArrayToggle} />}
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
          {/* Validation Message */}
          {!canProceedToNext() && currentStep < 6 && (
            <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800 font-medium">
                  {getValidationMessage()}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              onClick={() => currentStep > 1 && goToStep(currentStep - 1)}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>
            
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            <div className="flex gap-4">
              {currentStep < 6 ? (
                <button
                  onClick={() => {
                    if (canProceedToNext()) {
                      goToStep(currentStep + 1);
                    } else {
                      // Scroll to first error
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  disabled={!canProceedToNext()}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all shadow-md ${
                    canProceedToNext() 
                      ? 'bg-[#005670] text-white hover:bg-[#007a9a] cursor-pointer' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={submitQuestionnaire}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit & Continue</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Your responses help us create a personalized design that reflects your lifestyle and preferences. 
              Complete all sections and click Submit when ready.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// HELPER COMPONENTS
// ============================================

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-8 pb-4 border-b-2 border-[#005670]/10">
    <h2 className="text-3xl font-light text-[#005670] mb-2">{title}</h2>
    {subtitle && <p className="text-gray-600">{subtitle}</p>}
  </div>
);

const QuestionLabel = ({ children, required }) => (
  <label className="block text-gray-800 font-medium mb-3 text-base">
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const RadioCard = ({ label, name, value, checked, onChange, description }) => (
  <label className={`relative flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
    checked ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }`}>
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-5 h-5 text-[#005670] focus:ring-[#005670]"
    />
    <div className="flex-1">
      <div className="font-medium text-gray-900">{label}</div>
      {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
    </div>
    {checked && (
      <CheckCircle className="w-5 h-5 text-[#005670] absolute top-4 right-4" />
    )}
  </label>
);

const CheckboxCard = ({ label, checked, onChange, description }) => (
  <label className={`relative flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
    checked ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
  }`}>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="mt-1 w-5 h-5 text-[#005670] rounded focus:ring-[#005670]"
    />
    <div className="flex-1">
      <div className="font-medium text-gray-900">{label}</div>
      {description && <div className="text-sm text-gray-600 mt-1">{description}</div>}
    </div>
    {checked && (
      <CheckCircle className="w-5 h-5 text-[#005670] absolute top-4 right-4" />
    )}
  </label>
);

const TextInput = ({ value, onChange, placeholder, required }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    required={required}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all"
  />
);

const TextArea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={rows}
    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none transition-all resize-none"
  />
);

// ============================================
// STEP 1: Home Use & Lifestyle
// ============================================

const Step1 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Home Use & Lifestyle" 
      subtitle="Tell us about how you'll be using your Ālia residence"
    />

    {/* Client Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <QuestionLabel required>Client Name</QuestionLabel>
        <TextInput
          value={formData.clientName}
          onChange={(val) => handleChange(null, 'clientName', val)}
          placeholder="Your full name"
          required
        />
      </div>
      <div>
        <QuestionLabel required>Unit Number</QuestionLabel>
        <input
          type="text"
          value={formData.unitNumber}
          readOnly
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-600"
        />
      </div>
    </div>

    {/* Purpose */}
    <div>
      <QuestionLabel required>Purpose of your Ālia residence</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Full-time home"
          name="purpose"
          value="full-time"
          checked={formData.homeUse.purpose === 'full-time'}
          onChange={(val) => handleChange('homeUse', 'purpose', val)}
        />
        <RadioCard
          label="Second home / part-time residence"
          name="purpose"
          value="second-home"
          checked={formData.homeUse.purpose === 'second-home'}
          onChange={(val) => handleChange('homeUse', 'purpose', val)}
        />
        <RadioCard
          label="Investment property / rental property"
          name="purpose"
          value="investment"
          checked={formData.homeUse.purpose === 'investment'}
          onChange={(val) => handleChange('homeUse', 'purpose', val)}
        />
        <RadioCard
          label="Occasional vacation stay"
          name="purpose"
          value="vacation"
          checked={formData.homeUse.purpose === 'vacation'}
          onChange={(val) => handleChange('homeUse', 'purpose', val)}
        />
      </div>
    </div>

    {/* Primary Users */}
    <div>
      <QuestionLabel required>Who will primarily use the home?</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Individual"
          name="primaryUsers"
          value="individual"
          checked={formData.homeUse.primaryUsers === 'individual'}
          onChange={(val) => handleChange('homeUse', 'primaryUsers', val)}
        />
        <RadioCard
          label="Couple"
          name="primaryUsers"
          value="couple"
          checked={formData.homeUse.primaryUsers === 'couple'}
          onChange={(val) => handleChange('homeUse', 'primaryUsers', val)}
        />
        <RadioCard
          label="Family with children"
          name="primaryUsers"
          value="family"
          checked={formData.homeUse.primaryUsers === 'family'}
          onChange={(val) => handleChange('homeUse', 'primaryUsers', val)}
        />
        <RadioCard
          label="Extended family / multi-generational"
          name="primaryUsers"
          value="extended-family"
          checked={formData.homeUse.primaryUsers === 'extended-family'}
          onChange={(val) => handleChange('homeUse', 'primaryUsers', val)}
        />
        <RadioCard
          label="Frequent guests"
          name="primaryUsers"
          value="guests"
          checked={formData.homeUse.primaryUsers === 'guests'}
          onChange={(val) => handleChange('homeUse', 'primaryUsers', val)}
        />
      </div>
    </div>

    {/* Family Details */}
    {formData.homeUse.primaryUsers === 'family' && (
      <div className="ml-4 pl-6 border-l-4 border-[#005670]/20 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <QuestionLabel>How many family members?</QuestionLabel>
            <TextInput
              value={formData.homeUse.familyMembers}
              onChange={(val) => handleChange('homeUse', 'familyMembers', val)}
              placeholder="e.g., 4"
            />
          </div>
          <div>
            <QuestionLabel>Ages of child(ren)?</QuestionLabel>
            <TextInput
              value={formData.homeUse.childrenAges}
              onChange={(val) => handleChange('homeUse', 'childrenAges', val)}
              placeholder="e.g., 5, 8, 12"
            />
          </div>
        </div>
      </div>
    )}

    {/* Renters & Pets */}
    <div className="flex flex-col sm:flex-row gap-4">
      <CheckboxCard
        label="Will have renters"
        checked={formData.homeUse.hasRenters}
        onChange={(val) => handleChange('homeUse', 'hasRenters', val)}
      />
      <CheckboxCard
        label="Have pets"
        checked={formData.homeUse.hasPets}
        onChange={(val) => handleChange('homeUse', 'hasPets', val)}
      />
    </div>
    
    {/* Living Style */}
    <div>
      <QuestionLabel required>How do you envision living here?</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Everyday living"
          name="livingStyle"
          value="everyday"
          checked={formData.homeUse.livingStyle === 'everyday'}
          onChange={(val) => handleChange('homeUse', 'livingStyle', val)}
        />
        <RadioCard
          label="Weekend retreat"
          name="livingStyle"
          value="weekend"
          checked={formData.homeUse.livingStyle === 'weekend'}
          onChange={(val) => handleChange('homeUse', 'livingStyle', val)}
        />
        <RadioCard
          label="Lock-and-leave lifestyle"
          name="livingStyle"
          value="lock-and-leave"
          checked={formData.homeUse.livingStyle === 'lock-and-leave'}
          onChange={(val) => handleChange('homeUse', 'livingStyle', val)}
        />
        <RadioCard
          label="Guest-ready showcase"
          name="livingStyle"
          value="guest-ready"
          checked={formData.homeUse.livingStyle === 'guest-ready'}
          onChange={(val) => handleChange('homeUse', 'livingStyle', val)}
        />
      </div>
    </div>

    {/* Desired Feel */}
    <div>
      <QuestionLabel>What do you want your home to feel like? (Select up to 3)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'calm-restorative', label: 'Calm & Restorative' },
          { value: 'modern-minimal', label: 'Modern & Minimal' },
          { value: 'natural-organic', label: 'Natural & Organic' },
          { value: 'warm-inviting', label: 'Warm & Inviting' },
          { value: 'relaxed-effortless', label: 'Relaxed & Effortless' },
          { value: 'luxurious-polished', label: 'Luxurious & Polished' },
          { value: 'artistic-expressive', label: 'Artistic & Expressive' },
          { value: 'functional-simple', label: 'Functional & Simple' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.homeUse.desiredFeel.includes(opt.value)}
            onChange={() => handleArrayToggle('homeUse', 'desiredFeel', opt.value)}
          />
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// STEP 2: Entertaining & Daily Use
// ============================================

const Step2 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Entertaining & Daily Use" 
      subtitle="How will you use your spaces day-to-day?"
    />

    {/* Work from Home */}
    <div>
      <QuestionLabel>Work from home needs</QuestionLabel>
      <div className="space-y-3">
        <CheckboxCard
          label="Home office needed"
          description="Dedicated workspace for remote work"
          checked={formData.workFromHome.homeOfficeNeeded}
          onChange={(val) => handleChange('workFromHome', 'homeOfficeNeeded', val)}
        />
        <CheckboxCard
          label="Dedicated desk needed"
          description="Workspace for occasional tasks or study"
          checked={formData.workFromHome.deskNeeded}
          onChange={(val) => handleChange('workFromHome', 'deskNeeded', val)}
        />
      </div>
    </div>

    {/* Entertaining */}
    <div>
      <QuestionLabel>Do you entertain at home?</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Often"
          description="Regular gatherings and events"
          name="entertainingFrequency"
          value="often"
          checked={formData.entertaining.frequency === 'often'}
          onChange={(val) => handleChange('entertaining', 'frequency', val)}
        />
        <RadioCard
          label="Occasionally"
          description="Periodic social gatherings"
          name="entertainingFrequency"
          value="occasionally"
          checked={formData.entertaining.frequency === 'occasionally'}
          onChange={(val) => handleChange('entertaining', 'frequency', val)}
        />
        <RadioCard
          label="Rarely"
          description="Minimal entertaining"
          name="entertainingFrequency"
          value="rarely"
          checked={formData.entertaining.frequency === 'rarely'}
          onChange={(val) => handleChange('entertaining', 'frequency', val)}
        />
      </div>
    </div>

    {/* Gathering Types */}
    <div>
      <QuestionLabel>Preferred type of gatherings (select all that apply)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'dinner-parties', label: 'Dinner parties' },
          { value: 'small-groups', label: 'Small groups / casual drinks' },
          { value: 'family-visits', label: 'Family visits' },
          { value: 'outdoor-lounging', label: 'Outdoor lounging' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.entertaining.gatheringTypes.includes(opt.value)}
            onChange={() => handleArrayToggle('entertaining', 'gatheringTypes', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Outdoor Use */}
    <div>
      <QuestionLabel>Outdoor / lanai use (select all that apply)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { value: 'morning-coffee', label: 'Morning coffee' },
          { value: 'dining', label: 'Dining area' },
          { value: 'reading-relaxation', label: 'Reading & relaxation' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.outdoorUse.includes(opt.value)}
            onChange={() => {
              const current = formData.outdoorUse || [];
              const updated = current.includes(opt.value) 
                ? current.filter(item => item !== opt.value)
                : [...current, opt.value];
              handleChange(null, 'outdoorUse', updated);
            }}
          />
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// STEP 3: Design Aesthetic & Color
// ============================================

const Step3 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Design Aesthetic & Color Preferences" 
      subtitle="Define your personal style"
    />

    {/* Design Type */}
    <div>
      <QuestionLabel required>Options for your unit</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Pre-designed & curated by Kobayashi & Henderson Design Group"
          description="A ready-to-go, fully approved furniture plan for either the Nalu or Lani Collections"
          name="designType"
          value="pre-designed"
          checked={formData.designOptions.designType === 'pre-designed'}
          onChange={(val) => handleChange('designOptions', 'designType', val)}
        />
        <RadioCard
          label="Custom design your unit"
          description="Work with us to create a personalized design from scratch"
          name="designType"
          value="custom"
          checked={formData.designOptions.designType === 'custom'}
          onChange={(val) => handleChange('designOptions', 'designType', val)}
        />
      </div>
    </div>

    {/* Preferred Collection */}
    <div>
      <QuestionLabel>Preferred Collection</QuestionLabel>
      <div className="space-y-3">
        <RadioCard
          label="Lani Collection"
          description="Complete bespoke-level furnishing with custom cabinetry and art"
          name="preferredCollection"
          value="lani"
          checked={formData.designOptions.preferredCollection === 'lani'}
          onChange={(val) => handleChange('designOptions', 'preferredCollection', val)}
        />
        <RadioCard
          label="Nalu Collection"
          description="Comprehensive furnishing with elevated design details"
          name="preferredCollection"
          value="nalu"
          checked={formData.designOptions.preferredCollection === 'nalu'}
          onChange={(val) => handleChange('designOptions', 'preferredCollection', val)}
        />
        <RadioCard
          label="Nalu Foundation"
          description="Streamlined essentials for move-in-ready comfort"
          name="preferredCollection"
          value="foundation"
          checked={formData.designOptions.preferredCollection === 'foundation'}
          onChange={(val) => handleChange('designOptions', 'preferredCollection', val)}
        />
        <RadioCard
          label="Combination of Lani & Nalu Collections"
          description="Mix elements from both collections"
          name="preferredCollection"
          value="combination"
          checked={formData.designOptions.preferredCollection === 'combination'}
          onChange={(val) => handleChange('designOptions', 'preferredCollection', val)}
        />
      </div>
    </div>

    {/* Style Direction */}
    <div>
      <QuestionLabel>Overall style direction</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'light-airy', label: 'Light, airy, coastal calm' },
          { value: 'warm-textural', label: 'Warm, textural, island contemporary' },
          { value: 'refined-essentials', label: 'Refined essentials with natural balance' },
          { value: 'custom-mix', label: 'Custom mix / undecided' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="styleDirection"
            value={opt.value}
            checked={formData.designOptions.styleDirection === opt.value}
            onChange={(val) => handleChange('designOptions', 'styleDirection', val)}
          />
        ))}
      </div>
    </div>

    {/* Main Upholstery Color */}
    <div>
      <QuestionLabel>Main upholstery color palette preference(s)</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'dark', label: 'Dark (charcoal, deep taupe)' },
          { value: 'medium', label: 'Medium (taupe, sand)' },
          { value: 'light', label: 'Light (ivory, cream)' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="mainUpholsteryColor"
            value={opt.value}
            checked={formData.designOptions.mainUpholsteryColor === opt.value}
            onChange={(val) => handleChange('designOptions', 'mainUpholsteryColor', val)}
          />
        ))}
      </div>
    </div>

    {/* Accent Colors */}
    <div>
      <QuestionLabel>Accent fabric color palette preference(s) (select all that apply)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'warm-neutrals', label: 'Warm neutrals (ivory, sand, taupe)' },
          { value: 'cool-neutrals', label: 'Cool neutrals (stone, gray, driftwood)' },
          { value: 'earth-tones', label: 'Earth tones (terracotta, olive, clay)' },
          { value: 'ocean-inspired', label: 'Ocean-inspired (aqua, teal, mist blue)' },
          { value: 'soft-pastels', label: 'Soft natural pastels (sage, blush, clay)' },
          { value: 'deep-moody', label: 'Deep & moody (indigo, navy, charcoal)' },
          { value: 'vibrant-accents', label: 'Vibrant accents (sunflower yellow, gold, mustard)' },
          { value: 'lush-greens', label: 'Lush greens (forest, emerald, moss)' },
          { value: 'warm-lively', label: 'Warm & lively (coral, tangerine, apricot)' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.designOptions.accentColors.includes(opt.value)}
            onChange={() => handleArrayToggle('designOptions', 'accentColors', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Metal Tone */}
    <div>
      <QuestionLabel>Metal tone preference</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'brass', label: 'Brass' },
          { value: 'dark-bronze', label: 'Dark Bronze' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="metalTone"
            value={opt.value}
            checked={formData.designOptions.metalTone === opt.value}
            onChange={(val) => handleChange('designOptions', 'metalTone', val)}
          />
        ))}
      </div>
    </div>

    {/* Contrast */}
    <div>
      <QuestionLabel>Do you like tone-on-tone harmony or contrast?</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'subtle-blended', label: 'Subtle and blended' },
          { value: 'complementary-contrast', label: 'Complementary contrast' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="contrast"
            value={opt.value}
            checked={formData.designOptions.contrast === opt.value}
            onChange={(val) => handleChange('designOptions', 'contrast', val)}
          />
        ))}
      </div>
    </div>

    {/* Colors to Avoid */}
    <div>
      <QuestionLabel>Any specific colors, tones, or finishes to avoid?</QuestionLabel>
      <TextArea
        value={formData.designOptions.colorsToAvoid}
        onChange={(val) => handleChange('designOptions', 'colorsToAvoid', val)}
        placeholder="Tell us about any colors or finishes you'd prefer not to use..."
        rows={3}
      />
    </div>
  </div>
);

// ============================================
// STEP 4: Bedrooms & Comfort
// ============================================

const Step4 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Bedrooms & Comfort" 
      subtitle="Create your perfect sleeping sanctuary"
    />

    {/* Bed Sizes */}
    <div>
      <QuestionLabel>Preferred bed size(s) (check any that apply to your floor plan)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { value: 'king', label: 'King' },
          { value: 'queen', label: 'Queen' },
          { value: 'full', label: 'Full' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.bedrooms.bedSizes.includes(opt.value)}
            onChange={() => handleArrayToggle('bedrooms', 'bedSizes', opt.value)}
          />
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-2">
        Note: No Cal King or Twin sizes available for Ālia floor plans
      </p>
    </div>

    {/* Mattress Firmness */}
    <div>
      <QuestionLabel>Mattress firmness</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'plush', label: 'Plush' },
          { value: 'medium', label: 'Medium' },
          { value: 'firm', label: 'Firm' },
          { value: 'own', label: 'Prefer to order/manage on your own' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="mattressFirmness"
            value={opt.value}
            checked={formData.bedrooms.mattressFirmness === opt.value}
            onChange={(val) => handleChange('bedrooms', 'mattressFirmness', val)}
          />
        ))}
      </div>
    </div>

    {/* Bedding Type */}
    <div>
      <QuestionLabel>Bedding (check any that apply)</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'coverlet-sheet-set', label: 'Coverlet & Sheet Set' },
          { value: 'duvet-sheet-set', label: 'Duvet & Sheet Set' },
          { value: 'two-sets-duvet', label: 'Two sets for each bedroom (Duvet & Sheets)' },
          { value: 'two-sets-coverlet', label: 'Two sets for each bedroom (Coverlet & Sheets)' },
          { value: 'manage-own', label: 'Prefer to order/manage on your own' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.bedrooms.beddingType.includes(opt.value)}
            onChange={() => handleArrayToggle('bedrooms', 'beddingType', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Bedding Material */}
    <div>
      <QuestionLabel>Bedding Material (select all that apply)</QuestionLabel>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { value: 'down', label: 'Down' },
          { value: 'down-alternative', label: 'Down Alternative' },
          { value: 'cotton', label: 'Cotton' },
          { value: 'linen', label: 'Linen' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.bedrooms.beddingMaterial.includes(opt.value)}
            onChange={() => handleArrayToggle('bedrooms', 'beddingMaterial', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Bedding Color */}
    <div>
      <QuestionLabel>Bedding Color Options</QuestionLabel>
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: 'ivory', label: 'Ivory' },
          { value: 'white', label: 'White' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.bedrooms.beddingColor.includes(opt.value)}
            onChange={() => handleArrayToggle('bedrooms', 'beddingColor', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Lighting Mood */}
    <div>
      <QuestionLabel>Lighting mood</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'bright-functional', label: 'Bright & functional', description: 'Well-lit for tasks and activities' },
          { value: 'soft-ambient', label: 'Soft & ambient', description: 'Relaxing, calming atmosphere' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            description={opt.description}
            name="lightingMood"
            value={opt.value}
            checked={formData.bedrooms.lightingMood === opt.value}
            onChange={(val) => handleChange('bedrooms', 'lightingMood', val)}
          />
        ))}
      </div>
    </div>
  </div>
);

// ============================================
// STEP 5: Art, Accessories & Finishing
// ============================================

const Step5 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Art, Accessories & Finishing Touches" 
      subtitle="The details that make it uniquely yours"
    />

    {/* Art Style */}
    <div>
      <QuestionLabel>Art Style / Type Preference (Select all that apply)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'giclee', label: 'Giclée / Print reproductions' },
          { value: 'photography', label: 'Photography' },
          { value: 'island-coastal', label: 'Island-inspired / Coastal' },
          { value: 'abstract-modern', label: 'Abstract / Modern' },
          { value: 'traditional-classic', label: 'Traditional / Classic' },
          { value: 'sculptural', label: 'Sculptural' },
          { value: 'original-local', label: 'Original / Local Artists' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.art.stylePreferences.includes(opt.value)}
            onChange={() => handleArrayToggle('art', 'stylePreferences', opt.value)}
          />
        ))}
      </div>
    </div>

    {/* Art Coverage */}
    <div>
      <QuestionLabel>Art Coverage / Quantity Preference</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'minimal', label: 'Minimal – a few statement pieces only' },
          { value: 'moderate', label: 'Moderate – balanced, curated selection throughout the space' },
          { value: 'own', label: 'Prefer to order/manage on your own' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="artCoverage"
            value={opt.value}
            checked={formData.art.coverage === opt.value}
            onChange={(val) => handleChange('art', 'coverage', val)}
          />
        ))}
      </div>
    </div>

    {/* Accessories */}
    <div>
      <QuestionLabel>Accessories & styling preference</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'minimal', label: 'Minimal – a few statement pieces only' },
          { value: 'moderate', label: 'Moderate – balanced, curated selection throughout the space' },
          { value: 'own', label: 'Prefer to order/manage on your own' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="accessories"
            value={opt.value}
            checked={formData.accessories.preference === opt.value}
            onChange={(val) => handleChange('accessories', 'preference', val)}
          />
        ))}
      </div>
    </div>

    {/* Decorative Pillows */}
    <div>
      <QuestionLabel>Decorative pillow preferences</QuestionLabel>
      <div className="space-y-3">
        {[
          { value: 'curated-by-hdg', label: 'Curated by Henderson Design Group' },
          { value: 'manage-own', label: 'Prefer to order/manage on your own' }
        ].map(opt => (
          <RadioCard
            key={opt.value}
            label={opt.label}
            name="decorativePillows"
            value={opt.value}
            checked={formData.decorativePillows === opt.value}
            onChange={(val) => handleChange(null, 'decorativePillows', val)}
          />
        ))}
      </div>
    </div>

    {/* Special Zones */}
    <div>
      <QuestionLabel>Special zone requirements (select all that apply)</QuestionLabel>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          { value: 'meditation-yoga', label: 'Meditation or yoga area' },
          { value: 'art-craft', label: 'Art or craft zone' },
          { value: 'fitness', label: 'Fitness equipment' },
          { value: 'pet-area', label: 'Pet area' },
          { value: 'flexible-guest-sleeping', label: 'Flexible sleeping for overnight guests' }
        ].map(opt => (
          <CheckboxCard
            key={opt.value}
            label={opt.label}
            checked={formData.specialZones.includes(opt.value)}
            onChange={() => {
              const current = formData.specialZones || [];
              const updated = current.includes(opt.value) 
                ? current.filter(item => item !== opt.value)
                : [...current, opt.value];
              handleChange(null, 'specialZones', updated);
            }}
          />
        ))}
      </div>
    </div>

    {/* Existing Furniture */}
    <div>
      <QuestionLabel>Existing furniture to keep</QuestionLabel>
      <div className="space-y-4">
        <CheckboxCard
          label="Yes – I have existing furniture to incorporate into the design"
          checked={formData.existingFurniture.keeping}
          onChange={(val) => handleChange('existingFurniture', 'keeping', val)}
        />
        
        {formData.existingFurniture.keeping && (
          <div className="ml-4 pl-6 border-l-4 border-[#005670]/20">
            <QuestionLabel>Please list items and sizes</QuestionLabel>
            <TextArea
              value={formData.existingFurniture.items}
              onChange={(val) => handleChange('existingFurniture', 'items', val)}
              placeholder="e.g., King bed frame (76x80), vintage dresser (48x20x32)"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>

    {/* Additional Notes */}
    <div>
      <QuestionLabel>Anything else you'd like us to know?</QuestionLabel>
      <TextArea
        value={formData.additionalNotes}
        onChange={(val) => handleChange(null, 'additionalNotes', val)}
        placeholder="Share any additional thoughts about your daily life, aesthetic preferences, or how you plan to live in your Ālia home..."
        rows={5}
      />
    </div>
  </div>
);

// ============================================
// STEP 6: Add-On Services
// ============================================

const Step6 = ({ formData, handleChange, handleArrayToggle }) => (
  <div className="space-y-8">
    <SectionHeader 
      title="Additional / Add-On Services" 
      subtitle="Optional services to complete your home (Additional design fees apply)"
    />

    <div className="p-6 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg mb-8">
      <p className="text-blue-900">
        <strong>Note:</strong> Henderson Design Group offers optional coordination and design services 
        to complete your home beyond the core furniture package. Additional design fees apply and will 
        be determined based on scope of work.
      </p>
    </div>

    {/* 1. Closet Solutions */}
    <div className="p-6 border-2 border-gray-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <input
          type="checkbox"
          checked={formData.closetSolutions.interested}
          onChange={(e) => handleChange('closetSolutions', 'interested', e.target.checked)}
          className="mt-1 w-6 h-6 text-[#005670] rounded"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-light text-[#005670] mb-2">1. Customized Closet Solutions</h3>
          <p className="text-gray-600">
            Custom closet systems in finishes that match your selected furniture finishes
          </p>
        </div>
      </div>

      {formData.closetSolutions.interested && (
        <div className="ml-10 space-y-6 mt-6 pt-6 border-t border-gray-200">
          {/* Closet Use */}
          <div>
            <QuestionLabel>Closet use & priority (select all that apply)</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'minimal-wardrobe', label: 'Minimal wardrobe' },
                { value: 'full-wardrobe', label: 'Full wardrobe' },
                { value: 'multi-user', label: 'Multi-user / shared closet' },
                { value: 'guest-closet', label: 'Guest closet' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.closetSolutions.closetUse.includes(opt.value)}
                  onChange={() => handleArrayToggle('closetSolutions', 'closetUse', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Organization Style */}
          <div>
            <QuestionLabel>Organization style</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'visible-open', label: 'Visible open layout' },
                { value: 'fully-enclosed', label: 'Fully enclosed cabinetry' },
                { value: 'combination', label: 'Combination' }
              ].map(opt => (
                <RadioCard
                  key={opt.value}
                  label={opt.label}
                  name="organizationStyle"
                  value={opt.value}
                  checked={formData.closetSolutions.organizationStyle === opt.value}
                  onChange={(val) => handleChange('closetSolutions', 'organizationStyle', val)}
                />
              ))}
            </div>
          </div>

          {/* Additional Needs */}
          <div>
            <QuestionLabel>Additional needs (select all that apply)</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'shoe-storage', label: 'Shoe storage' },
                { value: 'jewelry-drawers', label: 'Jewelry / accessory drawers' },
                { value: 'built-in-safe', label: 'Built-in safe' },
                { value: 'luggage-storage', label: 'Luggage storage' },
                { value: 'drawers', label: 'Drawers' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.closetSolutions.additionalNeeds.includes(opt.value)}
                  onChange={() => handleArrayToggle('closetSolutions', 'additionalNeeds', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Locking Section */}
          <CheckboxCard
            label="Locking owner vs. rental sections"
            description="Separate lockable section for owner items when renting"
            checked={formData.closetSolutions.lockingSection}
            onChange={(val) => handleChange('closetSolutions', 'lockingSection', val)}
          />

          {/* Finish Options */}
          <div>
            <QuestionLabel>Finish Options</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'light-oak', label: 'Light Oak' },
                { value: 'medium-teak', label: 'Medium Teak' },
                { value: 'dark-teak', label: 'Dark Teak' }
              ].map(opt => (
                <RadioCard
                  key={opt.value}
                  label={opt.label}
                  name="closetFinish"
                  value={opt.value}
                  checked={formData.closetSolutions.finishOption === opt.value}
                  onChange={(val) => handleChange('closetSolutions', 'finishOption', val)}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <QuestionLabel>Location(s)</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'primary-bedroom', label: 'Primary Bedroom Closet Only' },
                { value: 'all-bedrooms', label: 'All Bedroom Closets' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.closetSolutions.locations.includes(opt.value)}
                  onChange={() => handleArrayToggle('closetSolutions', 'locations', opt.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 2. Window Coverings */}
    <div className="p-6 border-2 border-gray-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <input
          type="checkbox"
          checked={formData.windowCoverings.interested}
          onChange={(e) => handleChange('windowCoverings', 'interested', e.target.checked)}
          className="mt-1 w-6 h-6 text-[#005670] rounded"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-light text-[#005670] mb-2">2. Window Coverings</h3>
          <p className="text-gray-600">
            Custom window treatments for light control and privacy
          </p>
        </div>
      </div>

      {formData.windowCoverings.interested && (
        <div className="ml-10 space-y-6 mt-6 pt-6 border-t border-gray-200">
          {/* Treatment Preference */}
          <div>
            <QuestionLabel>Window treatment preference (select all that apply)</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'sheer-living', label: 'Sheer layer in Living Areas (for filtered light)' },
                { value: 'blackout-bedrooms', label: 'Blackout layer in Bedrooms (for sleep privacy)' },
                { value: 'dual-layer-all', label: 'Dual-layer combination in all areas' },
                { value: 'dual-layer-some', label: 'Dual-layer combination in some areas' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.treatmentPreference.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'treatmentPreference', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Operation */}
          <div>
            <QuestionLabel>Operation</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'manual', label: 'Manual' },
                { value: 'motorized', label: 'Motorized (Rechargeable battery with remote control)' },
                { value: 'combination', label: 'Combination of manual and motorized' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.operation.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'operation', opt.value)}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Note: Please confirm if units being hardwired for window coverings
            </p>
          </div>

          {/* Light Quality */}
          <div>
            <QuestionLabel>Desired light quality (select all that apply)</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'soft-diffused', label: 'Soft, diffused natural light' },
                { value: 'total-darkness', label: 'Total darkness for bedrooms' },
                { value: 'balance', label: 'Balance of privacy and light' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.desiredLightQuality.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'desiredLightQuality', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Material Preference */}
          <div>
            <QuestionLabel>Preferred material for shades/curtains</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'synthetic-solar', label: 'Synthetic solar material' },
                { value: 'linen-fabric', label: 'Linen/Fabric material' },
                { value: 'woven', label: 'Woven material' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.materialPreference.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'materialPreference', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Preferred Style */}
          <div>
            <QuestionLabel>Preferred style</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'roller-shades', label: 'Roller Shades' },
                { value: 'curtain-panels', label: 'Curtain Panels' },
                { value: 'combination', label: 'Combination of shades and drapery' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.preferredStyle.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'preferredStyle', opt.value)}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <QuestionLabel>Location(s) (select all that apply)</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'living-room', label: 'Living Room' },
                { value: 'dining-area', label: 'Dining Area' },
                { value: 'primary-bedroom', label: 'Primary Bedroom' },
                { value: 'guest-bedroom-1', label: 'Guest Bedroom 1' },
                { value: 'guest-bedroom-2', label: 'Guest Bedroom 2' },
                { value: 'guest-bedroom-3', label: 'Guest Bedroom 3' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.windowCoverings.locations.includes(opt.value)}
                  onChange={() => handleArrayToggle('windowCoverings', 'locations', opt.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 3. Audio/Visual */}
    <div className="p-6 border-2 border-gray-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <input
          type="checkbox"
          checked={formData.audioVisual.interested}
          onChange={(e) => handleChange('audioVisual', 'interested', e.target.checked)}
          className="mt-1 w-6 h-6 text-[#005670] rounded"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-light text-[#005670] mb-2">3. Audio / Visual</h3>
          <p className="text-gray-600">
            Entertainment system setup and coordination
          </p>
        </div>
      </div>

      {formData.audioVisual.interested && (
        <div className="ml-10 space-y-6 mt-6 pt-6 border-t border-gray-200">
          {/* Usage Level */}
          <div>
            <QuestionLabel>AV usage level</QuestionLabel>
            <div className="space-y-3">
              {[
                { value: 'minimal', label: 'Minimal (Single Room, TV + soundbar)' },
                { value: 'standard', label: 'Standard (Multi Room, TV, streaming, sound system)' }
              ].map(opt => (
                <RadioCard
                  key={opt.value}
                  label={opt.label}
                  name="avUsageLevel"
                  value={opt.value}
                  checked={formData.audioVisual.usageLevel === opt.value}
                  onChange={(val) => handleChange('audioVisual', 'usageLevel', val)}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          <div>
            <QuestionLabel>Areas to equip (select all that apply)</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { value: 'living-room', label: 'Living Room' },
                { value: 'primary-bedroom', label: 'Primary Bedroom' },
                { value: 'guest-bedroom-1', label: 'Guest Bedroom 1' },
                { value: 'guest-bedroom-2', label: 'Guest Bedroom 2' },
                { value: 'guest-bedroom-3', label: 'Guest Bedroom 3' }
              ].map(opt => (
                <CheckboxCard
                  key={opt.value}
                  label={opt.label}
                  checked={formData.audioVisual.locations.includes(opt.value)}
                  onChange={() => handleArrayToggle('audioVisual', 'locations', opt.value)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>

    {/* 4. Greenery/Plants */}
    <div className="p-6 border-2 border-gray-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <input
          type="checkbox"
          checked={formData.greenery.interested}
          onChange={(e) => handleChange('greenery', 'interested', e.target.checked)}
          className="mt-1 w-6 h-6 text-[#005670] rounded"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-light text-[#005670] mb-2">4. Greenery/Plants</h3>
          <p className="text-gray-600">
            Bring nature indoors with curated plant selections
          </p>
        </div>
      </div>

      {formData.greenery.interested && (
        <div className="ml-10 space-y-6 mt-6 pt-6 border-t border-gray-200">
          {/* Plant Type */}
          <div>
            <QuestionLabel>Plant type preference</QuestionLabel>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { value: 'real', label: 'Real' },
                { value: 'faux', label: 'Faux / artificial' },
                { value: 'none', label: 'None' }
              ].map(opt => (
                <RadioCard
                  key={opt.value}
                  label={opt.label}
                  name="plantType"
                  value={opt.value}
                  checked={formData.greenery.plantType === opt.value}
                  onChange={(val) => handleChange('greenery', 'plantType', val)}
                />
              ))}
            </div>
          </div>

          {/* Locations */}
          {formData.greenery.plantType && formData.greenery.plantType !== 'none' && (
            <div>
              <QuestionLabel>Areas to include plants/Planters (select all that apply)</QuestionLabel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { value: 'living-room', label: 'Living Room' },
                  { value: 'primary-bedroom', label: 'Primary Bedroom' },
                  { value: 'guest-bedroom-1', label: 'Guest Bedroom 1' },
                  { value: 'guest-bedroom-2', label: 'Guest Bedroom 2' },
                  { value: 'guest-bedroom-3', label: 'Guest Bedroom 3' },
                  { value: 'kitchen-dining', label: 'Kitchen / Dining' },
                  { value: 'bathroom', label: 'Bathroom' },
                  { value: 'entry-hallway', label: 'Entry / Hallway' },
                  { value: 'outdoor-balcony', label: 'Outdoor / Balcony' }
                ].map(opt => (
                  <CheckboxCard
                    key={opt.value}
                    label={opt.label}
                    checked={formData.greenery.locations.includes(opt.value)}
                    onChange={() => handleArrayToggle('greenery', 'locations', opt.value)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* 5. Kitchen Essentials */}
    <div className="p-6 border-2 border-gray-200 rounded-xl">
      <div className="flex items-start gap-4 mb-6">
        <input
          type="checkbox"
          checked={formData.kitchenEssentials.interested}
          onChange={(e) => handleChange('kitchenEssentials', 'interested', e.target.checked)}
          className="mt-1 w-6 h-6 text-[#005670] rounded"
        />
        <div className="flex-1">
          <h3 className="text-2xl font-light text-[#005670] mb-2">5. Kitchen & Household Essentials Package</h3>
          <p className="text-gray-600">
            Select items you want included
          </p>
        </div>
      </div>

      {formData.kitchenEssentials.interested && (
        <div className="ml-10 space-y-3 mt-6 pt-6 border-t border-gray-200">
          {[
            { value: 'kitchenware', label: 'Kitchenware (pots, pans, utensils, knives)' },
            { value: 'dishware', label: 'Dishware (plates, bowls, serving dishes)' },
            { value: 'glassware', label: 'Glassware (drinking glasses, wine glasses, mugs)' },
            { value: 'appliances', label: 'Appliances (coffee maker, toaster, blender, etc.)' },
            { value: 'cookware-bakeware', label: 'Cookware / Bakeware (mixing bowls, baking sheets, cookware sets)' },
            { value: 'storage-organization', label: 'Storage / Organization (containers, racks, organizers)' },
            { value: 'cleaning-utility', label: 'Cleaning & Utility Items (iron & ironing board, vacuum, mop, broom)' },
            { value: 'none', label: 'Will order and manage all my own household items' }
          ].map(opt => (
            <CheckboxCard
              key={opt.value}
              label={opt.label}
              checked={formData.kitchenEssentials.selectedItems.includes(opt.value)}
              onChange={() => handleArrayToggle('kitchenEssentials', 'selectedItems', opt.value)}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default DesignQuestionnaire;