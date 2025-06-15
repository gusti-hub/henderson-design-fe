import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendServer } from '../utils/info';

const ClientRegistration = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    unitNumber: '',
    phoneNumber: '',
    questionnaire: {
      designStyle: [],
      colorPalette: [],
      patterns: [],
      personalTouches: '',
      personalArtworkDetails: '',
      primaryUse: [],
      occupants: '',
      lifestyleNeeds: '',
      desiredCompletionDate: '',
      budgetFlexibility: '',
      technologyIntegration: '',
      additionalThoughts: ''
    }
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Questionnaire options
  const questionnaireOptions = {
    designStyle: ['Modern/Contemporary', 'Minimalist', 'Beachy/Hawaiian'],
    colorPalette: [
      'Tone-on-tone -- Dark', 'Tone-on-tone -- Light/Medium', 'Ocean Blue',
      'Navy Blue', 'Green', 'Coral/Orange', 'Yellow', 'Tan'
    ],
    patterns: [
      'No pattern -- just texture', 'Subtle patterns', 'Bold/Geometric patterns',
      'Floral/Tropical patterns', 'Organic/Natural patterns'
    ],
    personalTouches: ['Yes', 'No'],
    primaryUse: [
      'Personal use', 'Entertaining', 'Working from home',
      'Short-term/Vacation rental', 'Long-term rental'
    ],
    budgetFlexibility: ['Very flexible', 'Somewhat flexible', 'Not flexible']
  };

  const validateStep = (step) => {
    const newErrors = {};
    let isValid = true;

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = 'Name is required';
        isValid = false;
      }
      if (!formData.email) {
        newErrors.email = 'Email is required';
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
        isValid = false;
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
        isValid = false;
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
        isValid = false;
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
        isValid = false;
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
      if (!formData.unitNumber.trim()) {
        newErrors.unitNumber = 'Unit number is required';
        isValid = false;
      }
      if (!formData.phoneNumber.trim()) {
        newErrors.phoneNumber = 'Phone number is required';
        isValid = false;
      }
    }

    if (step === 2) {
      const q = formData.questionnaire;
      if (!q.designStyle || q.designStyle.length === 0) {
        newErrors.designStyle = 'Please select at least one design style';
        isValid = false;
      }
      if (!q.colorPalette || q.colorPalette.length === 0) {
        newErrors.colorPalette = 'Please select at least one color preference';
        isValid = false;
      }
      if (!q.patterns || q.patterns.length === 0) {
        newErrors.patterns = 'Please select at least one pattern preference';
        isValid = false;
      }
      if (!q.personalTouches) {
        newErrors.personalTouches = 'Please indicate if you have personal items to incorporate';
        isValid = false;
      }
      if (!q.primaryUse || q.primaryUse.length === 0) {
        newErrors.primaryUse = 'Please select at least one primary use';
        isValid = false;
      }
      if (!q.budgetFlexibility) {
        newErrors.budgetFlexibility = 'Please select your budget flexibility';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('questionnaire.')) {
      const field = name.split('.')[1];
      
      if (['designStyle', 'colorPalette', 'patterns', 'primaryUse'].includes(field)) {
        const currentValues = formData.questionnaire[field] || [];
        let newValues;
        
        if (checked) {
          newValues = [...currentValues, value];
        } else {
          newValues = currentValues.filter(item => item !== value);
        }
        
        setFormData({
          ...formData,
          questionnaire: {
            ...formData.questionnaire,
            [field]: newValues
          }
        });
      } else {
        setFormData({
          ...formData,
          questionnaire: {
            ...formData.questionnaire,
            [field]: value
          }
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    setErrors({ ...errors, [name.includes('.') ? name.split('.')[1] : name]: '' });
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(2)) return;

    setLoading(true);

    try {
      const response = await fetch(`${backendServer}/api/auth/register-client`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          unitNumber: formData.unitNumber,
          phoneNumber: formData.phoneNumber,
          questionnaire: formData.questionnaire
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setRegistrationSuccess(true);
      
    } catch (error) {
      setErrors({ form: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-light mb-4" style={{ color: '#005670' }}>
            Registration Submitted!
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for registering with Henderson Design Group! Your account is now under review by our admin team. 
            You will receive an email notification once your account has been approved and you can start using the platform.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-[#005670]"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - matching dashboard style */}
      <div className="bg-[#005670] text-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img 
            src="/images/HDG-Logo.png" 
            alt="Henderson Design Group" 
            className="h-12"
          />
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 2
            </span>
            <span className="text-sm text-gray-500">
              {currentStep === 1 ? 'Personal Information' : 'Design Preferences'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#005670] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 2) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
          {errors.form && (
            <div className="p-6 border-b">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {errors.form}
              </div>
            </div>
          )}

          <form onSubmit={currentStep === 2 ? handleSubmit : (e) => e.preventDefault()}>
            <div className="p-8">
              {currentStep === 1 ? (
                // Step 1: Personal Information
                <div>
                  <h2 className="text-2xl font-light mb-6 text-[#005670]">
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your full name"
                      />
                      {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your email"
                      />
                      {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Number *
                      </label>
                      <input
                        type="text"
                        name="unitNumber"
                        value={formData.unitNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your unit number"
                      />
                      {errors.unitNumber && <p className="mt-2 text-sm text-red-600">{errors.unitNumber}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Enter your phone number"
                      />
                      {errors.phoneNumber && <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>}
                    </div>
                  </div>
                </div>
              ) : (
                // Step 2: Design Preferences (Questionnaire)
                <div>
                  <h2 className="text-2xl font-light mb-6 text-[#005670]">
                    Design Preferences Questionnaire
                  </h2>
                  <div className="space-y-8">
                    
                    {/* Design Style & Aesthetic Preferences */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-6">Design Style & Aesthetic Preferences</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Which styles do you naturally gravitate toward? *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {questionnaireOptions.designStyle.map(option => (
                              <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="questionnaire.designStyle"
                                  value={option}
                                  checked={formData.questionnaire.designStyle.includes(option)}
                                  onChange={handleInputChange}
                                  className="mr-3 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.designStyle && <p className="mt-2 text-sm text-red-600">{errors.designStyle}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Which tones or colors would you like to see in your space? *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {questionnaireOptions.colorPalette.map(option => (
                              <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="questionnaire.colorPalette"
                                  value={option}
                                  checked={formData.questionnaire.colorPalette.includes(option)}
                                  onChange={handleInputChange}
                                  className="mr-3 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.colorPalette && <p className="mt-2 text-sm text-red-600">{errors.colorPalette}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            What types of patterns or textures do you prefer? *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {questionnaireOptions.patterns.map(option => (
                              <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="questionnaire.patterns"
                                  value={option}
                                  checked={formData.questionnaire.patterns.includes(option)}
                                  onChange={handleInputChange}
                                  className="mr-3 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.patterns && <p className="mt-2 text-sm text-red-600">{errors.patterns}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Do you have any personal artwork, furnishings, or heirlooms you'd like to incorporate? *
                          </label>
                          <div className="flex gap-4 mb-3">
                            {questionnaireOptions.personalTouches.map(option => (
                              <label key={option} className="flex items-center">
                                <input
                                  type="radio"
                                  name="questionnaire.personalTouches"
                                  value={option}
                                  checked={formData.questionnaire.personalTouches === option}
                                  onChange={handleInputChange}
                                  className="mr-2 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.personalTouches && <p className="mt-2 text-sm text-red-600">{errors.personalTouches}</p>}
                          
                          {formData.questionnaire.personalTouches === 'Yes' && (
                            <textarea
                              name="questionnaire.personalArtworkDetails"
                              value={formData.questionnaire.personalArtworkDetails}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              rows="3"
                              placeholder="Please describe the items you'd like to incorporate..."
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lifestyle & Functionality */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-6">Lifestyle & Functionality</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            How do you plan to use the space? *
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {questionnaireOptions.primaryUse.map(option => (
                              <label key={option} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                  type="checkbox"
                                  name="questionnaire.primaryUse"
                                  value={option}
                                  checked={formData.questionnaire.primaryUse.includes(option)}
                                  onChange={handleInputChange}
                                  className="mr-3 text-blue-600"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                          {errors.primaryUse && <p className="mt-2 text-sm text-red-600">{errors.primaryUse}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Please tell us about who will be using the space
                            </label>
                            <textarea
                              name="questionnaire.occupants"
                              value={formData.questionnaire.occupants}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              rows="4"
                              placeholder="Adults, children, pets, guests, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Are there any specific lifestyle requirements we should consider?
                            </label>
                            <textarea
                              name="questionnaire.lifestyleNeeds"
                              value={formData.questionnaire.lifestyleNeeds}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                              rows="4"
                              placeholder="Accessibility needs, allergies, work requirements, etc."
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Timeline & Budget */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-6">Timeline & Budget</h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              What is your desired completion date?
                            </label>
                            <input
                              type="date"
                              name="questionnaire.desiredCompletionDate"
                              value={formData.questionnaire.desiredCompletionDate}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                              Budget flexibility for upgrades? *
                            </label>
                            <div className="space-y-2">
                              {questionnaireOptions.budgetFlexibility.map(option => (
                                <label key={option} className="flex items-center">
                                  <input
                                    type="radio"
                                    name="questionnaire.budgetFlexibility"
                                    value={option}
                                    checked={formData.questionnaire.budgetFlexibility === option}
                                    onChange={handleInputChange}
                                    className="mr-3 text-blue-600"
                                  />
                                  <span className="text-sm">{option}</span>
                                </label>
                              ))}
                            </div>
                            {errors.budgetFlexibility && <p className="mt-2 text-sm text-red-600">{errors.budgetFlexibility}</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-6">Project Details</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Are there any specific tech features you would like to include?
                          </label>
                          <textarea
                            name="questionnaire.technologyIntegration"
                            value={formData.questionnaire.technologyIntegration}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            rows="3"
                            placeholder="Smart home features, entertainment systems, etc."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Are there any other thoughts or ideas you would like us to incorporate?
                          </label>
                          <textarea
                            name="questionnaire.additionalThoughts"
                            value={formData.questionnaire.additionalThoughts}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            rows="4"
                            placeholder="Any additional ideas, concerns, or special requests..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Navigation */}
            <div className="border-t bg-gray-50 px-8 py-6 flex justify-between items-center">
              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to Login
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#005670' }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 bg-[#005670]"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Registration
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientRegistration;