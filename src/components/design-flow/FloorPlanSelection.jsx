import React, { useState, useEffect } from 'react';

const FloorPlanSelection = ({ onNext }) => {
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    unitNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const floorPlanTypes = {
    investor: {
      id: 'investor',
      title: 'Investor Package',
      description: 'Fully customizable layout for personal preferences',
      availablePlans: '6 floor plans available',
      images: [
        '/images/investor_plan/investor_1.png',
        '/images/investor_plan/investor_2.png',
        '/images/investor_plan/investor_3.png'
      ],
      plans: [
        {
          id: 'investor-a',
          title: 'Residence 00A',
          description: '2 Bedroom + 2 Bath, Level: 7-33 (All)',
          image: '/images/investor_plan/Alia_00A.svg',
          details: [
            'Total: 1,419 Sq. Ft.',
            'Interior: 1,235 Sq. Ft.',
            'Lanai: 184 Sq. Ft.'
          ]
        },
        {
          id: 'investor-b',
          title: 'Residence 01B',
          description: '2 Bedroom + 2.5 Bath, Level: 7-33 (Odd)',
          image: '/images/investor_plan/Alia_01B.svg',
          details: [
            'Total: 1,275 Sq. Ft.',
            'Interior: 1,148 Sq. Ft.',
            'Lanai A: 58 Sq. Ft.',
            'Lanai B: 69 Sq. Ft.'
          ]
        },
        {
          id: 'investor-c',
          title: 'Residence 03A',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 8-38 (Even), 39',
          image: '/images/investor_plan/Alia_03A.svg',
          details: [
            'Total: 1,525 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 90 Sq. Ft.'
          ]
        },
        {
          id: 'investor-d',
          title: 'Residence 05A',
          description: '1 Bedroom / 1.5 Bath, Level: 8-38 (Even), 39',
          image: '/images/investor_plan/Alia_05A.svg',
          details: [
            'Total: 825 Sq. Ft.',
            'Interior: 761 Sq. Ft.',
            'Lanai: 64 Sq. Ft.'
          ]
        },
        {
          id: 'investor-e',
          title: 'Residence 08',
          description: '2 Bedroom / 2 Bath, Level: 7-39 (All)',
          image: '/images/investor_plan/Alia_08.svg',
          details: [
            'Total: 970 Sq. Ft.'
          ]
        },
        {
          id: 'investor-f',
          title: 'Residence 10A/12A',
          description: '3 Bedroom / 3 Bath + Den, Level: 39',
          image: '/images/investor_plan/Alia_10A-12A-L39.svg',
          details: [
            'Total: 1,670 Sq. Ft.',
            'Interior: 1,581 Sq. Ft.',
            'Lanai: 89 Sq. Ft.'
          ]
        }
      ]
    },
    custom: {
      id: 'custom',
      title: 'Owner package',
      description: 'Standard layout optimized for Owner',
      availablePlans: '2 floor plans available',
      images: [
        '/images/custom_plan/custom_1.png',
        '/images/custom_plan/custom_2.png',
        '/images/custom_plan/custom_3.png'
      ],
      plans: [
        {
          id: 'custom-a',
          title: 'Residence 00A',
          description: '2 Bedroom / 2 Bath, Level: 7-33 (All)',
          image: '/images/custom_plan/Alia_00A.svg',
          details: [
            'Total: 1,419 Sq. Ft.',
            'Interior: 1,235 Sq. Ft.',
            'Lanai: 184 Sq. Ft.'
          ]
        },
        {
          id: 'custom-b',
          title: 'Residence 01B',
          description: '2 Bedroom / 2.5 Bath, Level: 7-33 (Odd)',
          image: '/images/custom_plan/Alia_01B.svg',
          details: [
            'Total: 1,275 Sq. Ft.',
            'Interior: 1,148 Sq. Ft.',
            'Lanai A: 58 Sq. Ft.',
            'Lanai B: 69 Sq. Ft.'
          ]
        },
        {
          id: 'custom-c',
          title: 'Residence 03B',
          description: '2 Bedroom / 2.5 Bath + Den, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_03B.svg',
          details: [
            'Total: 1,493 Sq. Ft.',
            'Interior: 1,435 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-d',
          title: 'Residence 05B',
          description: '1 Bedroom / 1.5 Bath, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_05B.svg',
          details: [
            'Total: 819 Sq. Ft.',
            'Interior: 761 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-e',
          title: 'Residence 07B',
          description: '2 Bedroom / 2.5 Bath, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_07B.svg',
          details: [
            'Total: 1,206 Sq. Ft.',
            'Interior: 1,148 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-f',
          title: 'Residence 08',
          description: '2 Bedroom / 2 Bath, Level: 7-39 (All)',
          image: '/images/custom_plan/Alia_08.svg',
          details: [
            'Total: 970 Sq. Ft.'
          ]
        },
        {
          id: 'custom-g',
          title: 'Residence 09B',
          description: '2 Bedroom / 2 Bath + Den, Level: 7-37 (ODD)',
          image: '/images/custom_plan/Alia_09B.svg',
          details: [
            'Total: 1,205 Sq. Ft.',
            'Interior: 1,147 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-h',
          title: 'Residence 10/12',
          description: '3 Bedroom / 3.5 Bath + Den, Level: 7-23',
          image: '/images/custom_plan/Alia_10A-12A.svg',
          details: [
            'Total: 1,670 Sq. Ft.',
            'Interior: 1,581 Sq. Ft.',
            'Lanai: 89 Sq. Ft.'
          ]
        },
        {
          id: 'custom-i',
          title: 'Residence 11B',
          description: '1 Bedroom / 1.5 Bath, Level: 7-37 (Odd)',
          image: '/images/custom_plan/Alia_11B.svg',
          details: [
            'Total: 822 Sq. Ft.',
            'Interior: 764 Sq. Ft.',
            'Lanai: 58 Sq. Ft.'
          ]
        },
        {
          id: 'custom-j',
          title: 'Residence 13A',
          description: '2 Bedroom / 2 Bath, Level: 8-38 (Even), 39',
          image: '/images/custom_plan/Alia_13A.svg',
          details: [
            'Total: 1,101 Sq. Ft.',
            'Interior: 959 Sq. Ft.',
            'Lanai A: 90 Sq. Ft.',
            'Lanai B: 52 Sq. Ft.'
          ]
        },
      ]
    }
  };

  const fetchClientInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`http://localhost:5000/api/clients/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClientInfo({
          name: data.name,
          unitNumber: data.unitNumber
        });
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientInfo();
    const timer = setInterval(() => {
      setCurrentSlide(prev => prev === 2 ? 0 : prev + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedPlan) newErrors.plan = 'Please select a floor plan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext({ selectedPlan, clientInfo });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
        Choose Your Floor Plan
      </h2>

      {/* Client Information Display */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-medium mb-4">Client Information</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <p className="font-medium">{clientInfo.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Unit Number</label>
            <p className="font-medium">{clientInfo.unitNumber}</p>
          </div>
        </div>
      </div>

      {selectedPlanType ? (
        // Detailed Floor Plan Options
        <>
          <button
            onClick={() => setSelectedPlanType(null)}
            className="text-[#005670] hover:underline mb-6 flex items-center"
          >
            ← Back to Plan Types
          </button>
          
          <div className="space-y-8">
            {floorPlanTypes[selectedPlanType].plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white rounded-lg shadow-sm cursor-pointer transition-all
                  ${selectedPlan === plan.id ? 'ring-2 ring-[#005670]' : 'hover:shadow-md'}`}
              >
                <div className="grid grid-cols-12 gap-6">
                  {/* Large Image */}
                  <div className="col-span-8">
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>
                  
                  {/* Details */}
                  <div className="col-span-4 p-6">
                    <h3 className="text-xl font-medium mb-3" style={{ color: '#005670' }}>
                      {plan.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    
                    <h4 className="text-sm font-medium text-gray-500 mb-2">Key Features:</h4>
                    <ul className="space-y-2">
                      {plan.details.map((detail, index) => (
                        <li key={index} className="text-gray-600 flex items-center">
                          <span className="w-1.5 h-1.5 bg-[#005670] rounded-full mr-2"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        // Initial Plan Type Selection with Image Slides
        <div className="grid grid-cols-2 gap-6">
          {Object.values(floorPlanTypes).map(type => (
            <div
              key={type.id}
              onClick={() => setSelectedPlanType(type.id)}
              className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              {/* Image Slider */}
              <div className="relative h-64 rounded-t-lg overflow-hidden">
                {type.images.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 
                      ${currentSlide === index ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div
                      className="h-full w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </div>
                ))}

                {/* Slide Indicators */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {[0, 1, 2].map(index => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all
                        ${currentSlide === index ? 'w-8 bg-white' : 'bg-white/50'}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-medium mb-2" style={{ color: '#005670' }}>
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-2">{type.description}</p>
                <p className="text-gray-500 text-sm">{type.availablePlans}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {errors.plan && (
        <p className="text-red-500 text-sm mb-4">{errors.plan}</p>
      )}

      {selectedPlanType && (
        <div className="flex justify-end mt-6">
          <button
            onClick={handleNext}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#005670' }}
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default FloorPlanSelection;