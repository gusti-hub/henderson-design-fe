import React, { useState, useEffect } from 'react';

const FloorPlanSelection = ({ onNext }) => {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [formData, setFormData] = useState({
      name: '',
      unitNumber: ''
    });

    const [clientInfo, setClientInfo] = React.useState({
        name: '',
        unitNumber: ''
    });
    const [errors, setErrors] = useState({});
   
    const floorPlans = [
      { 
        id: 'investor', 
        title: 'Investor Plan',
        description: 'Standard layout optimized for investment',
        images: [
          '/images/investor_plan/investor_1.png',
          '/images/investor_plan/investor_2.png', 
          '/images/investor_plan/investor_3.png'
        ]
      },
      { 
        id: 'custom', 
        title: 'Custom Plan',
        description: 'Fully customizable layout for personal preferences',
        images: [
          '/images/custom_plan/custom_1.png',
          '/images/custom_plan/custom_2.png',
          '/images/custom_plan/custom_3.png'
        ]
      }
    ];
    
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
        onNext({ selectedPlan, clientInfo: formData });
      }
    };
   
    return (
      <div className="max-w-6xl mx-auto p-6">
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
   
        {/* Floor Plan Options */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {floorPlans.map(plan => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-all
                ${selectedPlan === plan.id ? 'ring-2 ring-[#005670]' : 'hover:shadow-md'}`}
            >
              {/* Image Slider */}
              <div className="relative h-64 mb-4 rounded-lg overflow-hidden">
                {plan.images.map((image, index) => (
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
   
              <h3 className="text-lg font-medium mb-2" style={{ color: '#005670' }}>
                {plan.title}
              </h3>
              <p className="text-gray-600">{plan.description}</p>
            </div>
          ))}
        </div>
   
        {errors.plan && (
          <p className="text-red-500 text-sm mb-4">{errors.plan}</p>
        )}
   
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#005670' }}
          >
            Continue
          </button>
        </div>
      </div>
    );
   };
   
   export default FloorPlanSelection;