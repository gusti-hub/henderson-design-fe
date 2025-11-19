import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Heart, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const QuestionnaireModal = ({ onComplete, userData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [likedImages, setLikedImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 9;

  const inspirationImages = [
    { id: 1, src: '/images/collections/1.jpg', title: 'Design 1' },
    { id: 2, src: '/images/collections/2.jpg', title: 'Design 2' },
    { id: 3, src: '/images/collections/3.jpg', title: 'Design 3' },
    { id: 4, src: '/images/collections/4.jpg', title: 'Design 4' },
    { id: 7, src: '/images/collections/7.jpg', title: 'Design 5' },
    { id: 8, src: '/images/collections/8.jpg', title: 'Design 6' },
    { id: 10, src: '/images/collections/10.jpg', title: 'Design 7' },
    { id: 11, src: '/images/collections/11.jpg', title: 'Design 8' },
    { id: 12, src: '/images/collections/12.jpg', title: 'Design 9' },
    { id: 13, src: '/images/collections/13.jpg', title: 'Design 10' },
    { id: 15, src: '/images/collections/15.jpg', title: 'Design 11' },
    { id: 16, src: '/images/collections/16.jpg', title: 'Design 12' },
  ];

  const questionSections = [
    {
      title: 'Home Use & Lifestyle',
      description: 'Tell us how you plan to use your residence',
      questions: [
        {
          id: 'primary_use',
          label: 'How will you primarily use this residence?',
          type: 'radio',
          options: [
            'Primary residence',
            'Second home/vacation home',
            'Investment property for rental',
            'Mixed use (personal & rental)'
          ],
          required: true
        },
        {
          id: 'occupancy',
          label: 'Who will be living in or using this home?',
          type: 'checkbox',
          options: [
            'Just me',
            'Couple',
            'Family with young children',
            'Family with teenagers',
            'Adult children visit',
            'Frequent guests',
            'Multi-generational'
          ],
          required: true
        },
        {
          id: 'lifestyle',
          label: 'How would you describe your lifestyle?',
          type: 'checkbox',
          options: [
            'Active and outdoors-oriented',
            'Entertaining and social',
            'Quiet and relaxing',
            'Work-from-home focused',
            'Health and wellness focused',
            'Art and culture enthusiast'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Entertaining & Social Life',
      description: 'Share your entertaining style',
      questions: [
        {
          id: 'entertaining',
          label: 'How often do you entertain guests?',
          type: 'radio',
          options: [
            'Frequently (weekly)',
            'Regularly (monthly)',
            'Occasionally (few times a year)',
            'Rarely'
          ],
          required: true
        },
        {
          id: 'entertaining_style',
          label: 'What type of entertaining do you prefer?',
          type: 'checkbox',
          options: [
            'Intimate dinners (4-6 people)',
            'Larger gatherings (8+ people)',
            'Casual get-togethers',
            'Formal dinner parties',
            'Outdoor barbecues',
            'Cocktail parties'
          ]
        }
      ]
    },
    {
      title: 'Design Style & Aesthetic',
      description: 'Define your design preferences',
      questions: [
        {
          id: 'design_style',
          label: 'Which design styles appeal to you? (Select all that apply)',
          type: 'checkbox',
          options: [
            'Modern/Contemporary',
            'Coastal/Beach',
            'Tropical/Hawaiian',
            'Minimalist',
            'Traditional',
            'Transitional (blend of traditional and modern)',
            'Mid-century modern',
            'Bohemian/Eclectic',
            'Industrial',
            'Scandinavian'
          ],
          required: true
        },
        {
          id: 'color_preference',
          label: 'What color palettes do you prefer?',
          type: 'checkbox',
          options: [
            'Neutral tones (whites, beiges, grays)',
            'Warm tones (earth tones, terracotta, warm woods)',
            'Cool tones (blues, greens, silvers)',
            'Bold and vibrant colors',
            'Dark and moody',
            'Light and airy',
            'Natural materials and textures'
          ],
          required: true
        },
        {
          id: 'atmosphere',
          label: 'What atmosphere do you want to create?',
          type: 'checkbox',
          options: [
            'Calm and serene',
            'Energizing and vibrant',
            'Cozy and warm',
            'Elegant and sophisticated',
            'Casual and relaxed',
            'Luxurious and refined',
            'Natural and organic'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Visual Design Preferences',
      description: 'Select designs that resonate with you',
      isImageSelection: true
    },
    {
      title: 'Functional Requirements',
      description: 'Tell us about your practical needs',
      questions: [
        {
          id: 'bedroom_use',
          label: 'How will you use each bedroom?',
          type: 'textarea',
          placeholder: 'E.g., Master for us, Guest room 1 for family visits, Guest room 2 as office...',
          required: true
        },
        {
          id: 'work_from_home',
          label: 'Do you need a dedicated workspace?',
          type: 'radio',
          options: [
            'Yes, full home office setup',
            'Yes, small desk area',
            'No, not needed'
          ],
          required: true
        },
        {
          id: 'dining',
          label: 'How do you prefer to dine?',
          type: 'checkbox',
          options: [
            'Formal dining table for entertaining',
            'Casual island/breakfast bar seating',
            'Outdoor dining',
            'Combination of formal and casual'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Bedroom Preferences',
      description: 'Your comfort is our priority',
      questions: [
        {
          id: 'bed_size',
          label: 'Preferred bed size for master bedroom?',
          type: 'radio',
          options: ['King', 'California King', 'Queen'],
          required: true
        },
        {
          id: 'guest_bed',
          label: 'Preferred bed configuration for guest rooms?',
          type: 'checkbox',
          options: [
            'Queen beds',
            'Twin beds (can be separated or combined)',
            'Day beds',
            'Sofa beds',
            'Flexible based on design'
          ]
        },
        {
          id: 'tv_preference',
          label: 'Television placement preferences?',
          type: 'checkbox',
          options: [
            'Living room - must have',
            'Master bedroom - must have',
            'Guest bedrooms',
            'No TVs preferred',
            'Hidden/concealed when not in use'
          ]
        }
      ]
    },
    {
      title: 'Additional Preferences',
      description: 'Fine-tune your design vision',
      questions: [
        {
          id: 'artwork',
          label: 'What are your preferences for artwork and accessories?',
          type: 'radio',
          options: [
            'Curated art collection - I want HDG to select',
            'Minimal artwork',
            'I will provide my own art',
            'Mix of HDG selections and my pieces'
          ],
          required: true
        },
        {
          id: 'window_treatment',
          label: 'Window treatment preferences?',
          type: 'checkbox',
          options: [
            'Blackout shades for bedrooms',
            'Sheer curtains for light filtering',
            'Natural woven shades',
            'Motorized/automated',
            'Minimal - maximize views',
            'Privacy is important'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Lifestyle Considerations',
      description: 'Help us personalize your space',
      questions: [
        {
          id: 'pets',
          label: 'Do you have pets?',
          type: 'radio',
          options: ['Yes', 'No'],
          required: true
        },
        {
          id: 'pet_details',
          label: 'If yes, please describe (type, size, special needs)',
          type: 'textarea',
          placeholder: 'E.g., Medium dog, cat, need durable fabrics...',
          showIf: { pets: 'Yes' }
        },
        {
          id: 'activities',
          label: 'What activities are important to you in Hawaii?',
          type: 'checkbox',
          options: [
            'Beach and ocean activities',
            'Hiking and outdoor exploration',
            'Golf',
            'Dining and culinary experiences',
            'Cultural activities',
            'Relaxation and spa',
            'Fitness and wellness',
            'Water sports'
          ]
        }
      ]
    },
    {
      title: 'Budget & Special Requests',
      description: 'Final details to complete your profile',
      questions: [
        {
          id: 'collection_interest',
          label: 'Which collection are you most interested in?',
          type: 'radio',
          options: [
            'Lani Collections (Complete bespoke furnishing)',
            'Nalu Collections (Elevated design with quality finishes)',
            'Foundation Collections (Streamlined essentials)',
            'Custom Design',
            'Mix between collections',
            'Not sure yet - need guidance'
          ],
          required: true
        },
        {
          id: 'move_in',
          label: 'When do you plan to move in/use the residence?',
          type: 'text',
          placeholder: 'E.g., January 2027, as soon as ready...',
          required: true
        },
        {
          id: 'must_haves',
          label: 'What are your absolute must-haves?',
          type: 'textarea',
          placeholder: 'List any non-negotiable items, features, or requirements...',
          rows: 4
        },
        {
          id: 'special_requests',
          label: 'Any other special requests or considerations?',
          type: 'textarea',
          placeholder: 'Anything else we should know about your vision, lifestyle, or requirements...',
          rows: 5
        }
      ]
    }
  ];

  useEffect(() => {
    loadSavedDraft();
  }, []);

  const loadSavedDraft = async () => {
    try {
      const response = await fetch(
        `${backendServer}/api/questionnaires/my-questionnaires?email=${userData.email}&unitNumber=${userData.unitNumber}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.questionnaires && data.questionnaires.length > 0) {
          const draft = data.questionnaires[0];
          if (draft.status === 'draft') {
            setFormData(draft);
            setCurrentStep(draft.currentStep || 1);
            if (draft.likedDesigns) {
              setLikedImages(draft.likedDesigns);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const handleInputChange = (questionId, value, type) => {
    if (type === 'checkbox') {
      const currentValues = formData[questionId] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      setFormData(prev => ({ ...prev, [questionId]: newValues }));
    } else {
      setFormData(prev => ({ ...prev, [questionId]: value }));
    }
    
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const toggleImageLike = (imageId) => {
    setLikedImages(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
    console.log('🖼️ Liked images updated:', likedImages);
  };

  const validateCurrentStep = () => {
    const currentSection = questionSections[currentStep - 1];
    const newErrors = {};

    if (currentSection.isImageSelection) {
      return true;
    }

    currentSection.questions?.forEach(question => {
      if (question.required) {
        if (question.showIf) {
          const [conditionKey, conditionValue] = Object.entries(question.showIf)[0];
          if (formData[conditionKey] !== conditionValue) {
            return;
          }
        }

        const value = formData[question.id];
        
        if (value === undefined || value === null || value === '' || 
            (Array.isArray(value) && value.length === 0)) {
          newErrors[question.id] = 'This field is required';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < totalSteps) {
        setCurrentStep(prev => prev + 1);
        document.querySelector('.questionnaire-content')?.scrollTo(0, 0);
      }
    } else {
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      document.querySelector('.questionnaire-content')?.scrollTo(0, 0);
    }
  };

  const handleSubmit = async () => {
    console.log('🚀 Submit button clicked!');
    
    if (!validateCurrentStep()) {
      console.log('❌ Validation failed');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        clientName: userData.name,
        unitNumber: userData.unitNumber,
        email: userData.email,
        likedDesigns: likedImages, // ✅ CRITICAL: Include liked images
        isFirstTimeComplete: true
      };

      console.log('📤 Submitting data:', submitData);
      console.log('🖼️ Liked images count:', likedImages.length);
      console.log('🖼️ Liked images:', likedImages);

      const response = await fetch(`${backendServer}/api/questionnaires/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      });

      console.log('📥 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Questionnaire submitted successfully:', result);
        onComplete();
      } else {
        const error = await response.json();
        console.error('❌ Submission error:', error);
        alert(error.message || 'Failed to submit questionnaire');
      }
    } catch (error) {
      console.error('❌ Error submitting questionnaire:', error);
      alert('Error submitting questionnaire. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentSection = questionSections[currentStep - 1];
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome! Complete Your Profile</h2>
              <p className="text-white/80 text-sm mt-1">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 questionnaire-content">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-[#005670] mb-2">
              {currentSection.title}
            </h3>
            <p className="text-gray-600">{currentSection.description}</p>
          </div>

          {currentSection.isImageSelection ? (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Select designs that match your aesthetic preferences. 
                  You've selected {likedImages.length} design{likedImages.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {inspirationImages.map((image) => {
                  const isLiked = likedImages.includes(image.id);
                  return (
                    <div
                      key={image.id}
                      className={`group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer border-2 transition-all ${
                        isLiked ? 'border-[#005670] shadow-lg scale-105' : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => toggleImageLike(image.id)}
                    >
                      <img
                        src={image.src}
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        className={`absolute top-2 right-2 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all ${
                          isLiked ? 'bg-[#005670] scale-110' : 'bg-white/90 hover:scale-110'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-gray-700'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {currentSection.questions?.map((question) => {
                if (question.showIf) {
                  const [conditionKey, conditionValue] = Object.entries(question.showIf)[0];
                  if (formData[conditionKey] !== conditionValue) {
                    return null;
                  }
                }

                return (
                  <div key={question.id} className="space-y-3">
                    <label className="block text-base font-medium text-gray-900">
                      {question.label}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'text' && (
                      <input
                        type="text"
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none ${
                          errors[question.id] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={question.placeholder}
                      />
                    )}

                    {question.type === 'textarea' && (
                      <textarea
                        rows={question.rows || 3}
                        value={formData[question.id] || ''}
                        onChange={(e) => handleInputChange(question.id, e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#005670] focus:border-transparent outline-none resize-none ${
                          errors[question.id] ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={question.placeholder}
                      />
                    )}

                    {question.type === 'radio' && (
                      <div className="space-y-2">
                        {question.options?.map((opt, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name={question.id}
                              value={opt}
                              checked={formData[question.id] === opt}
                              onChange={(e) => handleInputChange(question.id, e.target.value)}
                              className="mt-1 w-5 h-5 text-[#005670]"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {question.type === 'checkbox' && (
                      <div className="space-y-2">
                        {question.options?.map((opt, i) => (
                          <label key={i} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="checkbox"
                              value={opt}
                              checked={(formData[question.id] || []).includes(opt)}
                              onChange={(e) => handleInputChange(question.id, e.target.value, 'checkbox')}
                              className="mt-1 w-5 h-5 text-[#005670] rounded"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {errors[question.id] && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors[question.id]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Back</span>
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-semibold"
              >
                <span>Next</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Submit & Complete</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireModal;