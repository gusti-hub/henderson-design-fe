import React, { useState, useEffect } from 'react';
import { Home, Check, CreditCard, ChevronRight, ArrowLeft } from 'lucide-react';
import AreaSelection from './AreaSelection';
import FloorPlanSelection from './FloorPlanSelection';
import FurnitureCustomization from './FurnitureCustomization';
import OrderReview from './OrderReview';
import PaymentPage from './PaymentPage';
import AreaCustomization from './AreaCustomization';

const UserDesignFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    unitNumber: ''
  });
  const [existingOrder, setExistingOrder] = useState(null);
  const [isViewOnly, setIsViewOnly] = useState(false);

  const [selectedArea, setSelectedArea] = useState(null);
  const [customizations, setCustomizations] = useState({});

  useEffect(() => {
    checkExistingOrder();
  }, []);

  const checkExistingOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders/user-order', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const order = await response.json();
        if (order) {
          setExistingOrder(order);
          setSelectedPlan(order.selectedPlan);
          setClientInfo(order.clientInfo);
          setIsViewOnly(order.status === 'completed');
        }
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = existingOrder ? 'PUT' : 'POST';
      const endpoint = existingOrder 
        ? `http://localhost:5000/api/orders/${existingOrder._id}`
        : 'http://localhost:5000/api/orders';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedPlan,
          clientInfo,
          status: currentStep === 5 ? 'completed' : 'in_progress',
          step: currentStep
        })
      });

      if (!response.ok) throw new Error('Failed to save progress');
      const data = await response.json();
      setExistingOrder(data);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const steps = [
    { number: 1, title: 'Choose Floor Plan' },
    { number: 2, title: 'Design Your Space' },  // Updated title
    { number: 3, title: 'Review Order' },
    { number: 4, title: 'Payment' }
  ];

  const handleNext = async () => {
    await saveProgress();
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFloorPlanSelection = async (data) => {
    setSelectedPlan(data.selectedPlan);
    setClientInfo(data.clientInfo);
    await saveProgress();
    setCurrentStep(2);
  };

  const renderStepContent = () => {
    if (isViewOnly) {
      return (
        <div>
          <div className="bg-yellow-50 border border-yellow-400 p-4 rounded-lg mb-6">
            <p className="text-yellow-700">
              This order has been completed. You can view the details but cannot make changes.
            </p>
          </div>
          {renderCurrentStep()}
        </div>
      );
    }
    return renderCurrentStep();
  };

    // Add this function
    const handleAreaSelect = (area) => {
        console.log("Selected area:", area);
        setSelectedArea(area);
        handleNext();
    };

  const renderCurrentStep = () => {
    switch (currentStep) {
        case 1:
          return <FloorPlanSelection onNext={handleFloorPlanSelection} />;
        case 2:
        return <AreaCustomization 
            selectedPlan={selectedPlan}
            onComplete={(customizations) => {
            setCustomizations(customizations);
            handleNext();
            }}
        />;
        case 4:
          return <OrderReview />;
        case 5:
          return <PaymentPage />;
        default:
          return null;
      }
  };

  if (!existingOrder && currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {renderStepContent()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full
                    ${currentStep >= step.number ? 'bg-[#005670] text-white' : 'bg-gray-200'}`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= step.number ? 'text-[#005670]' : 'text-gray-500'}`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 mx-4 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepContent()}

        {/* Navigation Buttons */}
        {!isViewOnly && (
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            )}
            {currentStep < 5 && (
              <button
                onClick={handleNext}
                className="ml-auto flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#005670' }}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDesignFlow;