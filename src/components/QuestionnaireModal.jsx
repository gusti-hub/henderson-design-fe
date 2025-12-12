import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle, Heart, AlertCircle } from 'lucide-react';
import { backendServer } from '../utils/info';

const QuestionnaireModal = ({ onComplete, userData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [likedImages, setLikedImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 12;

  // Helper function to check if a checkbox array contains a value
  const checkboxIncludes = (fieldId, value) => {
    const fieldValue = formData[fieldId];
    if (Array.isArray(fieldValue)) {
      return fieldValue.includes(value);
    }
    return false;
  };

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
      description: 'Tell us about your Ālia residence',
      questions: [
        {
          id: 'purpose_of_residence',
          label: 'Purpose of your Ālia residence',
          type: 'checkbox',
          options: [
            'Full-time home',
            'Second home / part-time residence',
            'Investment/Rental Property',
            'Occasional vacation stay'
          ],
          required: true
        },
        {
          id: 'who_will_use',
          label: 'Who will primarily use the home?',
          type: 'checkbox',
          options: [
            'Individual',
            'Couple',
            'Family with children',
            'Extended family / multi-generational',
            'Frequent guests',
            'Renters'
          ],
          required: true
        },
        {
          id: 'family_members_count',
          label: 'How many family members?',
          type: 'text',
          placeholder: 'Enter number',
          showIfCheckbox: { field: 'who_will_use', value: 'Family with children' }
        },
        {
          id: 'children_ages',
          label: 'Ages of child(ren)?',
          type: 'text',
          placeholder: 'e.g., 5, 8, 12',
          showIfCheckbox: { field: 'who_will_use', value: 'Family with children' }
        },
        {
          id: 'living_envision',
          label: 'How do you envision living here?',
          type: 'checkbox',
          options: [
            'Everyday living',
            'Weekend retreat',
            'Lock-and-leave lifestyle',
            'Guest-ready showcase'
          ],
          required: true
        },
        {
          id: 'home_feeling',
          label: 'What do you want your home to feel like? (Select up to 3)',
          type: 'checkbox',
          options: [
            'Calm & Restorative',
            'Modern & Minimal',
            'Natural & Organic',
            'Warm & Inviting',
            'Relaxed & Effortless Luxury',
            'Luxurious & Polished',
            'Artistic & Expressive',
            'Functional & Simple'
          ],
          required: true,
          maxSelect: 3
        }
      ]
    },
    {
      title: 'Entertaining & Daily Use',
      description: 'Share your lifestyle needs',
      questions: [
        {
          id: 'work_from_home',
          label: 'Work from home:',
          type: 'checkbox',
          options: [
            'Home office needed',
            'Dedicated desk needed'
          ]
        },
        {
          id: 'entertain_frequency',
          label: 'Do you entertain at home?',
          type: 'checkbox',
          options: [
            'Often',
            'Occasionally',
            'Rarely'
          ],
          required: true
        },
        {
          id: 'gathering_types',
          label: 'Preferred type of gatherings (select all that apply):',
          type: 'checkbox',
          options: [
            'Dinner parties',
            'Small groups / casual drinks',
            'Family visits',
            'Outdoor lounging'
          ]
        },
        {
          id: 'outdoor_lanai_use',
          label: 'Outdoor / lanai use (select all that apply):',
          type: 'checkbox',
          options: [
            'Morning coffee',
            'Dining area',
            'Reading & relaxation'
          ]
        }
      ]
    },
    {
      title: 'Design Aesthetic & Color Preferences',
      description: 'Define your design vision',
      questions: [
        {
          id: 'unit_options',
          label: 'Options for your unit:',
          type: 'checkbox',
          options: [
            'Pre-designed & curated by Kobayashi & Henderson Design Group – a ready-to-go, fully approved furniture plan for your unit for either the Nalu or Lani Collections',
            'Custom design your unit – work with us to create a personalized design from scratch'
          ],
          required: true
        },
        {
          id: 'preferred_collection',
          label: 'Preferred Collection:',
          type: 'checkbox',
          options: [
            'Lani Collection',
            'Nalu Collection',
            'Nalu Foundation',
            'Combination of Lani & Nalu Collections'
          ],
          required: true
        },
        {
          id: 'style_direction',
          label: 'Overall style direction:',
          type: 'checkbox',
          options: [
            'Light, airy, coastal calm',
            'Warm, textural, island contemporary',
            'Refined essentials with natural balance',
            'Custom mix / undecided'
          ],
          required: true
        },
        {
          id: 'main_upholstery_color',
          label: 'Main upholstery color palette preference(s):',
          type: 'checkbox',
          options: [
            'Dark (charcoal, deep taupe)',
            'Medium (taupe, sand)',
            'Light (ivory, cream)'
          ],
          required: true
        },
        {
          id: 'accent_fabric_color',
          label: 'Accent fabric color palette preference(s):',
          type: 'checkbox',
          options: [
            'Warm neutrals (ivory, sand, taupe)',
            'Cool neutrals (stone, gray, driftwood)',
            'Earth tones (terracotta, olive, clay)',
            'Ocean-inspired (aqua, teal, mist blue)',
            'Soft natural pastels (sage, blush, clay)',
            'Deep & moody (indigo, navy, charcoal)',
            'Vibrant accents (sunflower yellow, gold, mustard)',
            'Lush greens (forest, emerald, moss)',
            'Warm & lively (coral, tangerine, apricot)',
            'Mixed / Multiple palettes (check any that apply)'
          ],
          required: true
        },
        {
          id: 'metal_tone',
          label: 'Metal tone preference:',
          type: 'checkbox',
          options: [
            'Brass',
            'Dark Bronze'
          ],
          required: true
        },
        {
          id: 'tone_preference',
          label: 'Do you like tone-on-tone harmony or contrast?',
          type: 'checkbox',
          options: [
            'Subtle and blended',
            'Complementary contrast'
          ],
          required: true
        },
        {
          id: 'colors_to_avoid',
          label: 'Any specific colors, tones, or finishes to avoid?',
          type: 'text',
          placeholder: 'List any colors or finishes you prefer to avoid...'
        }
      ]
    },
    {
      title: 'Visual Inspiration',
      description: 'Select designs that inspire you',
      isImageSelection: true
    },
    {
      title: 'Bedrooms & Comfort',
      description: 'Customize your sleeping spaces',
      questions: [
        {
          id: 'bed_sizes',
          label: 'Preferred bed size(s) (check any that apply to your floor plan):',
          type: 'checkbox',
          options: [
            'Eastern King',
            'Queen',
            'Full',
            'Twin'
          ],
          required: true
        },
        {
          id: 'mattress_firmness',
          label: 'Mattress firmness:',
          type: 'checkbox',
          options: [
            'Plush',
            'Medium',
            'Firm',
            'Prefer to order/manage on your own'
          ],
          required: true
        },
        {
          id: 'bedding_type',
          label: 'Bedding (check any that apply):',
          type: 'checkbox',
          options: [
            'Coverlet & Sheet Set',
            'Duvet & Sheet Set',
            'Two set for each bedroom (Duvet & Sheets)',
            'Two set for each bedroom (Coverlet & Sheets)',
            'Prefer to order/manage on your own'
          ]
        },
        {
          id: 'bedding_material_color',
          label: 'Bedding Material & Color Options:',
          type: 'checkbox',
          options: [
            'Down',
            'Down Alternative',
            'Cotton',
            'Linen',
            'Ivory',
            'White'
          ]
        },
        {
          id: 'lighting_mood',
          label: 'Lighting mood:',
          type: 'checkbox',
          options: [
            'Bright & functional',
            'Soft & ambient'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Art, Accessories & Finishing Touches',
      description: 'Complete your interior design',
      questions: [
        {
          id: 'art_style',
          label: 'Art Style / Type Preference (Select all that apply):',
          type: 'checkbox',
          options: [
            'Giclée / Print reproductions',
            'Photography',
            'Island-inspired / Coastal',
            'Abstract / Modern',
            'Traditional / Classic',
            'Sculptural'
          ]
        },
        {
          id: 'art_coverage',
          label: 'Art Coverage / Quantity Preference (Select one):',
          type: 'checkbox',
          options: [
            'Minimal – a few statement pieces only',
            'Moderate – balanced, curated selection throughout the space',
            'Prefer to order/manage on your own'
          ],
          required: true
        },
        {
          id: 'accessories_styling',
          label: 'Accessories & styling preference (Select one):',
          type: 'checkbox',
          options: [
            'Minimal – a few statement pieces only',
            'Moderate – balanced, curated selection throughout the space',
            'Prefer to order/manage on your own'
          ],
          required: true
        },
        {
          id: 'decorative_pillows',
          label: 'Decorative pillow preferences (Select one):',
          type: 'checkbox',
          options: [
            'Curated by Henderson Design Group',
            'Prefer to order/manage on your own'
          ],
          required: true
        }
      ]
    },
    {
      title: 'Additional / Misc Design-Related Questions',
      description: 'Special zones and considerations',
      questions: [
        {
          id: 'special_zones',
          label: 'Special zone requirements (select all that apply):',
          type: 'checkbox',
          options: [
            'Meditation or yoga area',
            'Art or craft zone',
            'Fitness equipment',
            'Pet area'
          ]
        },
        {
          id: 'existing_furniture',
          label: 'Existing furniture to incorporate:',
          type: 'checkbox',
          options: [
            'Yes',
            'No'
          ],
          required: true
        },
        {
          id: 'existing_furniture_details',
          label: 'Please list items and sizes:',
          type: 'textarea',
          placeholder: 'List furniture items and their dimensions...',
          rows: 3,
          showIfCheckbox: { field: 'existing_furniture', value: 'Yes' }
        },
        {
          id: 'additional_notes',
          label: 'Anything else you\'d like us to know about your daily life, aesthetic, or how you plan to live in your Ālia home?',
          type: 'textarea',
          placeholder: 'Share any additional information that will help us design your perfect home...',
          rows: 5
        }
      ]
    },
    {
      title: 'Add-On Services: Customized Closet Solutions',
      description: 'Optional closet customization (Additional Design Fees apply)',
      questions: [
        {
          id: 'closet_use',
          label: 'Closet use & priority:',
          type: 'checkbox',
          options: [
            'Minimal wardrobe',
            'Full wardrobe',
            'Multi-user / shared closet',
            'Guest closet'
          ]
        },
        {
          id: 'organization_style',
          label: 'Organization style:',
          type: 'checkbox',
          options: [
            'Visible open layout',
            'Fully enclosed cabinetry',
            'Combination'
          ]
        },
        {
          id: 'closet_additional_needs',
          label: 'Additional needs:',
          type: 'checkbox',
          options: [
            'Shoe storage',
            'Jewelry / accessory drawers',
            'Built-in safe',
            'Luggage storage',
            'Drawers'
          ]
        },
        {
          id: 'closet_finish',
          label: 'Finish Options:',
          type: 'checkbox',
          options: [
            'Light Oak',
            'Medium Teak',
            'Dark Teak'
          ]
        },
        {
          id: 'closet_locations',
          label: 'Location(s):',
          type: 'checkbox',
          options: [
            'Primary Bedroom Closet Only',
            'All Bedroom Closets'
          ]
        }
      ]
    },
    {
      title: 'Add-On Services: Window Coverings',
      description: 'Optional window treatment (Additional Design Fees apply)',
      questions: [
        {
          id: 'window_treatment',
          label: 'Window treatment preference:',
          type: 'checkbox',
          options: [
            'Sheer layer in Living Areas (for filtered light)',
            'Blackout layer In Bedrooms (for sleep privacy)',
            'Dual-layer Sheer & Blackout in Bedrooms'
          ]
        },
        {
          id: 'window_operation',
          label: 'Operation:',
          type: 'checkbox',
          options: [
            'Manual',
            'Motorized (Rechargeable battery with remote control)'
          ]
        },
        {
          id: 'light_quality',
          label: 'Desired light quality:',
          type: 'checkbox',
          options: [
            'Soft, diffused natural light',
            'Total darkness for bedrooms',
            'Balance of privacy and light'
          ]
        },
        {
          id: 'shade_material',
          label: 'Preferred material for shades / curtains:',
          type: 'checkbox',
          options: [
            'Synthetic solar material',
            'Linen/Fabric material',
            'Woven material'
          ]
        },
        {
          id: 'shade_style',
          label: 'Preferred style:',
          type: 'checkbox',
          options: [
            'Roller Shades',
            'Drapery Panels',
            'Combination of roller and drapery panels'
          ]
        },
        {
          id: 'window_locations',
          label: 'Location(s):',
          type: 'checkbox',
          options: [
            'Living Room',
            'Dining Area',
            'Primary Bedroom',
            'Guest Bedroom 1',
            'Guest Bedroom 2',
            'Guest Bedroom 3',
            'Other area'
          ]
        },
        {
          id: 'window_other_area',
          label: 'Other area:',
          type: 'text',
          placeholder: 'Specify other area',
          showIfCheckbox: { field: 'window_locations', value: 'Other area' }
        }
      ]
    },
    {
      title: 'Add-On Services: Audio/Visual',
      description: 'Optional AV setup (Additional Design Fees apply)',
      questions: [
        {
          id: 'av_usage',
          label: 'AV usage level:',
          type: 'checkbox',
          options: [
            'Minimal (Single Room, TV + soundbar)',
            'Standard (Multi Room, TV, streaming, sound system)'
          ]
        },
        {
          id: 'av_areas',
          label: 'Areas to equip:',
          type: 'checkbox',
          options: [
            'Living Room',
            'Primary Bedroom',
            'Guest Bedroom 1',
            'Guest Bedroom 2',
            'Guest Bedroom 3'
          ]
        }
      ]
    },
    {
      title: 'Add-On Services: Greenery/Plants',
      description: 'Optional plant and planter selection (Additional Design Fees apply)',
      questions: [
        {
          id: 'plant_type',
          label: 'Plant type preference:',
          type: 'checkbox',
          options: [
            'Real',
            'Faux / artificial'
          ]
        },
        {
          id: 'plant_areas',
          label: 'Areas to include Plants/Planters (select all that apply):',
          type: 'checkbox',
          options: [
            'Living Room',
            'Primary Bedroom',
            'Guest Bedroom 1',
            'Guest Bedroom 2',
            'Guest Bedroom 3',
            'Kitchen / Dining',
            'Bathroom',
            'Entry / Hallway',
            'Outdoor / Balcony'
          ]
        }
      ]
    },
    {
      title: 'Add-On Services: Kitchen & Household Essentials',
      description: 'Optional kitchen package (Additional Design Fees apply)',
      questions: [
        {
          id: 'kitchen_essentials',
          label: 'Kitchen & Household Essentials Package (Select items you want included):',
          type: 'checkbox',
          options: [
            'Kitchenware (pots, pans, utensils, knives)',
            'Dishware (plates, bowls, serving dishes)',
            'Glassware (drinking glasses, wine glasses, mugs)',
            'Appliances (coffee maker, toaster, blender, etc.)',
            'Cookware / Bakeware (mixing bowls, baking sheets, cookware sets)',
            'Storage / Organization (containers, racks, organizers)',
            'Cleaning & Utility Items (iron & ironing board, vacuum, mop, broom)'
          ]
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
        likedDesigns: likedImages,
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
              <h2 className="text-2xl font-bold text-white">Alia Home Design & Lifestyle Intake</h2>
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
                  <strong>Tip:</strong> Select designs that inspire you and match your aesthetic preferences. 
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
                // Handle showIf (for radio buttons)
                if (question.showIf) {
                  const [conditionKey, conditionValue] = Object.entries(question.showIf)[0];
                  if (formData[conditionKey] !== conditionValue) {
                    return null;
                  }
                }

                // Handle showIfCheckbox (for checkbox arrays)
                if (question.showIfCheckbox) {
                  const { field, value } = question.showIfCheckbox;
                  const fieldValue = formData[field];
                  if (!Array.isArray(fieldValue) || !fieldValue.includes(value)) {
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
                        {question.options?.map((opt, i) => {
                          const isChecked = (formData[question.id] || []).includes(opt);
                          const currentSelections = formData[question.id] || [];
                          const isDisabled = question.maxSelect && 
                                            currentSelections.length >= question.maxSelect && 
                                            !isChecked;
                          
                          return (
                            <label 
                              key={i} 
                              className={`flex items-start gap-3 cursor-pointer p-3 rounded-lg transition-colors ${
                                isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                value={opt}
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={(e) => handleInputChange(question.id, e.target.value, 'checkbox')}
                                className="mt-1 w-5 h-5 text-[#005670] rounded"
                              />
                              <span className="text-gray-700">{opt}</span>
                            </label>
                          );
                        })}
                        {question.maxSelect && (
                          <p className="text-sm text-gray-500 mt-2">
                            Selected: {(formData[question.id] || []).length} / {question.maxSelect}
                          </p>
                        )}
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
                className="flex items-center gap-2 px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-semibold disabled:opacity-50"
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