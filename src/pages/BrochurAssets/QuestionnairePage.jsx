import React, { useState } from 'react';
import { Heart, CheckCircle, Info } from 'lucide-react';

const QuestionnairePage = ({ language }) => {
  const [likedImages, setLikedImages] = useState([]);

  const inspirationImages = [
    { id: 1, src: '/images/collections/1.jpg', title: '' },
    { id: 2, src: '/images/collections/2.jpg', title: '' },
    { id: 3, src: '/images/collections/3.jpg', title: '' },
    { id: 4, src: '/images/collections/4.jpg', title: '' },
    { id: 7, src: '/images/collections/7.jpg', title: '' },
    { id: 8, src: '/images/collections/8.jpg', title: '' },
    { id: 10, src: '/images/collections/10.jpg', title: '' },
    { id: 11, src: '/images/collections/11.jpg', title: '' },
    { id: 12, src: '/images/collections/12.jpg', title: '' },
    { id: 13, src: '/images/collections/13.jpg', title: '' },
    { id: 15, src: '/images/collections/15.jpg', title: '' },
    { id: 16, src: '/images/collections/16.jpg', title: '' },
  ];

  const toggleLike = (imageId) => {
    setLikedImages((prev) =>
      prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]
    );
  };

  // Full sections with all questions (content preserved exactly as provided)
  const sections = [
    {
      category: 'PERSONAL INFORMATION',
      questions: [
        { id: 'name', label: 'Full Name', type: 'text', required: true },
        { id: 'email', label: 'Email Address', type: 'email', required: true },
        { id: 'phone', label: 'Phone Number', type: 'tel', required: true },
        { id: 'unit', label: 'Ālia Unit Number', type: 'text', required: true },
        { id: 'bedrooms', label: 'Number of Bedrooms', type: 'select', options: ['2BR', '3BR', '4BR'], required: true },
        { id: 'preferred_contact', label: 'Preferred Contact Method', type: 'select', options: ['Email', 'Phone', 'Text'], required: true },
      ],
    },
    {
      category: 'HOME USE & LIFESTYLE',
      questions: [
        {
          id: 'primary_use',
          label: 'How will you primarily use this residence?',
          type: 'radio',
          options: [
            'Primary residence',
            'Second home/vacation home',
            'Investment property for rental',
            'Mixed use (personal & rental)',
          ],
          required: true,
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
            'Multi-generational',
          ],
          required: true,
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
            'Art and culture enthusiast',
          ],
          required: true,
        },
        {
          id: 'entertaining',
          label: 'How often do you entertain guests?',
          type: 'radio',
          options: ['Frequently (weekly)', 'Regularly (monthly)', 'Occasionally (few times a year)', 'Rarely'],
          required: true,
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
            'Cocktail parties',
          ],
        },
      ],
    },
    {
      category: 'DESIGN STYLE & AESTHETIC',
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
            'Scandinavian',
          ],
          required: true,
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
            'Natural materials and textures',
          ],
          required: true,
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
            'Natural and organic',
          ],
          required: true,
        },
        {
          id: 'formality',
          label: 'How formal or casual should the space feel?',
          type: 'radio',
          options: [
            'Very formal and elegant',
            'Somewhat formal but comfortable',
            'Balanced - neither too formal nor casual',
            'Casual and relaxed',
            'Very casual and laid-back',
          ],
          required: true,
        },
        {
          id: 'design_inspiration',
          label: 'Are there any specific homes, hotels, or spaces that inspire you?',
          type: 'textarea',
          placeholder: 'Please describe any places that inspire your design vision...',
        },
      ],
    },
    {
      category: 'FUNCTIONAL REQUIREMENTS',
      questions: [
        {
          id: 'bedroom_use',
          label: 'How will you use each bedroom?',
          type: 'textarea',
          placeholder: 'E.g., Master for us, Guest room 1 for family visits, Guest room 2 as office...',
          required: true,
        },
        {
          id: 'work_from_home',
          label: 'Do you need a dedicated workspace?',
          type: 'radio',
          options: ['Yes, full home office setup', 'Yes, small desk area', 'No, not needed'],
          required: true,
        },
        {
          id: 'storage_needs',
          label: 'What are your storage priorities?',
          type: 'checkbox',
          options: [
            'Extensive closet space',
            'Kitchen pantry storage',
            'Linen and towel storage',
            'Sports equipment storage',
            'Beach gear storage',
            'Wine storage',
            'Display storage for collections',
            'Hidden/concealed storage',
          ],
        },
        {
          id: 'dining',
          label: 'How do you prefer to dine?',
          type: 'checkbox',
          options: [
            'Formal dining table for entertaining',
            'Casual island/breakfast bar seating',
            'Outdoor dining',
            'Combination of formal and casual',
          ],
          required: true,
        },
        {
          id: 'seating_preference',
          label: 'What type of seating do you prefer in the living area?',
          type: 'checkbox',
          options: [
            'Large sectional sofa',
            'Sofa and armchairs',
            'Multiple seating areas',
            'Casual/conversation-focused',
            'Media viewing-focused',
            'Reading nook',
          ],
          required: true,
        },
        {
          id: 'outdoor_use',
          label: 'How will you use your lanai/outdoor space?',
          type: 'checkbox',
          options: [
            'Outdoor dining',
            'Lounging and relaxation',
            'Entertaining guests',
            'Morning coffee/evening cocktails',
            'Yoga or exercise',
            'Minimal use',
          ],
        },
      ],
    },
    {
      category: 'SPECIFIC PREFERENCES',
      questions: [
        {
          id: 'bed_size',
          label: 'Preferred bed size for master bedroom?',
          type: 'radio',
          options: ['King', 'California King', 'Queen'],
          required: true,
        },
        {
          id: 'guest_bed',
          label: 'Preferred bed configuration for guest rooms?',
          type: 'checkbox',
          options: ['Queen beds', 'Twin beds (can be separated or combined)', 'Day beds', 'Sofa beds', 'Flexible based on design'],
        },
        {
          id: 'tv_preference',
          label: 'Television placement preferences?',
          type: 'checkbox',
          options: ['Living room - must have', 'Master bedroom - must have', 'Guest bedrooms', 'No TVs preferred', 'Hidden/concealed when not in use'],
        },
        {
          id: 'artwork',
          label: 'What are your preferences for artwork and accessories?',
          type: 'radio',
          options: [
            'Curated art collection - I want HDG to select',
            'Minimal artwork',
            'I will provide my own art',
            'Mix of HDG selections and my pieces',
          ],
          required: true,
        },
        {
          id: 'rug_preference',
          label: 'Rug preferences?',
          type: 'radio',
          options: ['Natural fiber (jute, sisal, seagrass)', 'Plush and soft', 'Patterned/colorful', 'Neutral tones', 'No rugs preferred'],
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
            'Privacy is important',
          ],
          required: true,
        },
      ],
    },
    {
      category: 'LIFESTYLE CONSIDERATIONS',
      questions: [
        { id: 'pets', label: 'Do you have pets?', type: 'radio', options: ['Yes', 'No'], required: true },
        { id: 'pet_details', label: 'If yes, please describe (type, size, special needs)', type: 'textarea', placeholder: 'E.g., Medium dog, cat, need durable fabrics...' },
        { id: 'allergies', label: 'Do you have any allergies or sensitivities to materials?', type: 'textarea', placeholder: 'E.g., latex, certain fabrics, fragrances...' },
        { id: 'accessibility', label: 'Are there any accessibility requirements?', type: 'textarea', placeholder: 'E.g., wheelchair access, grab bars, specific height requirements...' },
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
            'Water sports',
          ],
        },
      ],
    },
    {
      category: 'BUDGET & TIMELINE',
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
            'Not sure yet - need guidance',
          ],
          required: true,
        },
        {
          id: 'budget_comfort',
          label: 'Are you comfortable with the estimated pricing for your chosen collection?',
          type: 'radio',
          options: ['Yes, budget is confirmed', 'Yes, but want to discuss options', 'Need more information', 'Would like to explore cost-saving options'],
          required: true,
        },
        { id: 'move_in', label: 'When do you plan to move in/use the residence?', type: 'text', placeholder: 'E.g., January 2027, as soon as ready...', required: true },
        {
          id: 'timeline_flexibility',
          label: 'How flexible is your timeline?',
          type: 'radio',
          options: ['Fixed timeline - must be ready by specific date', 'Somewhat flexible', 'Very flexible - quality over speed'],
          required: true,
        },
      ],
    },
    {
      category: "ITEMS YOU'RE BRINGING",
      questions: [
        { id: 'bringing_items', label: "Will you be bringing any existing furniture or items?", type: 'radio', options: ['Yes', 'No', 'Maybe - not decided yet'], required: true },
        { id: 'existing_items', label: "If yes, please describe what you'll bring", type: 'textarea', placeholder: 'E.g., family heirloom dining table, artwork collection, specific pieces...' },
        { id: 'keep_items', label: 'Are there any specific pieces you definitely want to keep?', type: 'textarea', placeholder: 'Describe items you must incorporate into the design...' },
      ],
    },
    {
      category: 'SPECIAL REQUESTS & ADDITIONAL INFORMATION',
      questions: [
        { id: 'must_haves', label: "What are your absolute must-haves?", type: 'textarea', placeholder: 'List any non-negotiable items, features, or requirements...', rows: 4 },
        { id: 'dislikes', label: 'What should we avoid? (styles, colors, materials, etc.)', type: 'textarea', placeholder: 'List anything you definitely do not want...', rows: 4 },
        { id: 'inspiration_images', label: 'Do you have inspiration images or Pinterest boards to share?', type: 'textarea', placeholder: "Please provide links or describe the images you'd like to share..." },
        { id: 'special_requests', label: 'Any other special requests or considerations?', type: 'textarea', placeholder: 'Anything else we should know about your vision, lifestyle, or requirements...', rows: 5 },
      ],
    },
    {
      category: 'DESIGN TEAM COMMUNICATION',
      questions: [
        {
          id: 'meeting_preference',
          label: 'Preferred meeting format?',
          type: 'radio',
          options: ['In-person in Hawaii', 'Virtual (Zoom/Video call)', 'Phone call', 'Mix of virtual and in-person', 'Primarily email communication'],
          required: true,
        },
        {
          id: 'availability',
          label: 'What is your general availability for design meetings?',
          type: 'checkbox',
          options: ['Weekday mornings (HST)', 'Weekday afternoons (HST)', 'Weekday evenings (HST)', 'Weekends', 'Flexible - will work around HDG schedule'],
          required: true,
        },
        {
          id: 'decision_making',
          label: 'Who will be involved in design decisions?',
          type: 'radio',
          options: ['Just me', 'Me and my partner/spouse', 'Family decision', "I'll make decisions but want input from others"],
          required: true,
        },
        { id: 'additional_contacts', label: 'Additional contacts (if applicable)', type: 'textarea', placeholder: 'Names and contact info for anyone else involved in decisions...' },
      ],
    },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            Client Preferences
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Design Preferences Questionnaire
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed mb-8 max-w-3xl mx-auto">
          Help us understand your lifestyle, preferences, and vision for your Ālia residence.
        </p>
        <div className="bg-[#005670]/5 border-l-4 border-[#005670] p-6 rounded-xl text-left text-gray-800 font-light leading-relaxed max-w-3xl mx-auto">
          <strong className="text-[#005670]">Note:</strong> This questionnaire is for reference only.
          After your deposit, you’ll receive access to the interactive form in your client portal
          where you can save progress and submit directly to your design team.
        </div>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-8 rounded-full"></div>
      </div>

      {/* LEGEND - Explanation Section */}
      <div className="max-w-4xl mx-auto mb-16 mt-10">
        <div className="bg-white border border-[#005670]/20 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-6 h-6 text-[#005670]" />
            <h3 className="text-xl font-semibold text-[#005670]">
              How to Read This Form
            </h3>
          </div>

          <ul className="space-y-3 text-gray-700 text-base leading-relaxed">
            <li>
              <span className="font-semibold text-[#005670]">*</span> &nbsp;= Required question that must be answered.
            </li>
            <li>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 mr-2"></span>
              <span className="font-medium text-[#005670]">Circle button</span> – Select <strong>only one option</strong>.
            </li>
            <li>
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm border border-gray-400 mr-2"></span>
              <span className="font-medium text-[#005670]">Box button</span> – You can select <strong>more than one option</strong>.
            </li>
          </ul>
        </div>
      </div>


      {/* IMAGE PREFERENCE */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="bg-white border-2 border-[#005670]/10 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold text-[#005670]">
                Select Your Favorite Designs
              </h3>
            </div>
            <p className="text-lg text-gray-700 font-light">
              Click the heart icon on images that match your aesthetic preferences.
            </p>
            <p className="text-sm text-gray-500 font-light mt-1">
              {likedImages.length} image{likedImages.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {inspirationImages.map((image) => {
              const isLiked = likedImages.includes(image.id);
              return (
                <div
                  key={image.id}
                  className={`group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer border-2 transition-all duration-500 ${isLiked ? 'border-[#005670]' : 'border-transparent hover:border-gray-200'}`}
                  onClick={() => toggleLike(image.id)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(image.id);
                    }}
                    className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition-all duration-300 ${isLiked ? 'bg-[#005670] scale-110' : 'bg-white/90 hover:bg-white hover:scale-110'}`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-white text-white' : 'text-gray-700'}`} />
                  </button>
                  {isLiked && (
                    <div className="absolute inset-0 border-4 border-[#005670] rounded-xl pointer-events-none" />
                  )}
                </div>
              );
            })}
          </div>

          {likedImages.length > 0 && (
            <div className="mt-8 p-5 bg-green-50 border-l-4 border-green-500 rounded-xl text-green-800 font-light">
              <strong className="font-medium">Great!</strong> You’ve selected {likedImages.length}{' '}
              design{likedImages.length !== 1 ? 's' : ''}. These preferences will be shared with your design team.
            </div>
          )}
        </div>
      </div>

      {/* QUESTIONNAIRE SECTIONS (preview-only, inputs disabled) */}
      <div className="max-w-5xl mx-auto space-y-12">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.category}
            className="bg-white border-2 border-[#005670]/10 p-10 md:p-12 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Section Header */}
            <div className="mb-10 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white text-lg">
                  {sectionIndex + 1}
                </div>
                <h3 className="text-3xl font-bold text-[#005670]">
                  {section.category}
                </h3>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {section.questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <label className="block text-lg text-gray-900 font-light">
                    {question.label}
                    {question.required && <span className="text-[#005670] ml-1">*</span>}
                  </label>

                  {/* Text */}
                  {question.type === 'text' && (
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-[#005670] disabled:bg-gray-50"
                      placeholder={question.placeholder || ''}
                      disabled
                    />
                  )}

                  {/* Email */}
                  {question.type === 'email' && (
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-[#005670] disabled:bg-gray-50"
                      placeholder={question.placeholder || ''}
                      disabled
                    />
                  )}

                  {/* Tel */}
                  {question.type === 'tel' && (
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-[#005670] disabled:bg-gray-50"
                      placeholder={question.placeholder || ''}
                      disabled
                    />
                  )}

                  {/* Select */}
                  {question.type === 'select' && (
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-[#005670] disabled:bg-gray-50"
                      disabled
                    >
                      <option value="">Select an option...</option>
                      {question.options?.map((opt, i) => (
                        <option key={`${question.id}-opt-${i}`} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Textarea */}
                  {question.type === 'textarea' && (
                    <textarea
                      rows={question.rows || 3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:border-[#005670] disabled:bg-gray-50 resize-none"
                      placeholder={question.placeholder || ''}
                      disabled
                    />
                  )}

                  {/* Radio */}
                  {question.type === 'radio' && (
                    <div className="space-y-3 pl-1">
                      {question.options?.map((opt, i) => (
                        <label key={`${question.id}-radio-${i}`} className="flex items-start gap-3 cursor-not-allowed">
                          <input type="radio" name={question.id} value={opt} className="mt-1 w-5 h-5 text-[#005670]" disabled />
                          <span className="text-gray-700 font-light">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {/* Checkbox */}
                  {question.type === 'checkbox' && (
                    <div className="space-y-3 pl-1">
                      {question.options?.map((opt, i) => (
                        <label key={`${question.id}-chk-${i}`} className="flex items-start gap-3 cursor-not-allowed">
                          <input type="checkbox" name={question.id} value={opt} className="mt-1 w-5 h-5 text-[#005670] rounded" disabled />
                          <span className="text-gray-700 font-light">{opt}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FOOTER */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-base text-[#005670] font-bold mb-2">
            Updated October 2025
          </p>
          <p className="text-sm text-gray-600">
            Henderson Design Group – Questionnaire Reference
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;