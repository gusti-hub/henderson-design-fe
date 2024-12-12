import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
import FloorPlanSelection from './FloorPlanSelection';
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
  const [designSelections, setDesignSelections] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    method: '', // 'cheque' or 'bank_transfer'
    installments: [
      { percent: 25, dueDate: null, status: 'pending', amount: 0 },
      { percent: 50, dueDate: null, status: 'pending', amount: 0 },
      { percent: 25, dueDate: null, status: 'pending', amount: 0 }
    ]
  });

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
          setDesignSelections(order.designSelections);
          setPaymentDetails(order.paymentDetails || paymentDetails);
          setIsViewOnly(order.status === 'completed');
        }
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
    }
  };

  const calculatePaymentSchedule = (totalAmount) => {
    const today = new Date();
    return paymentDetails.installments.map((installment, index) => {
      const dueDate = new Date(today);
      dueDate.setMonth(today.getMonth() + (index * 3)); // 3 months between payments
      return {
        ...installment,
        dueDate: dueDate.toISOString(),
        amount: (totalAmount * (installment.percent / 100))
      };
    });
  };

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = existingOrder ? 'PUT' : 'POST';
      const endpoint = existingOrder 
        ? `http://localhost:5000/api/orders/${existingOrder._id}`
        : 'http://localhost:5000/api/orders';

      // Calculate payment schedule if we have design selections
      let updatedPaymentDetails = paymentDetails;
      if (designSelections?.totalPrice) {
        updatedPaymentDetails = {
          ...paymentDetails,
          installments: calculatePaymentSchedule(designSelections.totalPrice)
        };
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selectedPlan,
          clientInfo,
          designSelections,
          paymentDetails: updatedPaymentDetails,
          status: currentStep === 4 ? 'completed' : 'in_progress',
          step: currentStep
        })
      });

      if (!response.ok) throw new Error('Failed to save progress');
      const data = await response.json();
      setExistingOrder(data);
      setPaymentDetails(updatedPaymentDetails);
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const steps = [
    { number: 1, title: 'Choose Floor Plan' },
    { number: 2, title: 'Design Your Space' },
    { number: 3, title: 'Review Order' },
    { number: 4, title: 'Payment Schedule' }
  ];

  const handleNext = async () => {
    await saveProgress();
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFloorPlanSelection = async (data) => {
    try {
      const planDetails = data.selectedPlan;
      setSelectedPlan({
        ...planDetails,
        clientInfo: data.clientInfo
      });
      setClientInfo(data.clientInfo);
      await saveProgress();
      setCurrentStep(2);
    } catch (error) {
      console.error('Error in floor plan selection:', error);
    }
  };

  const handleDesignComplete = (selections) => {
    setDesignSelections(selections);
    //handleNext();
  };

  const handlePaymentSetup = async (paymentMethod) => {
    const updatedPaymentDetails = {
      ...paymentDetails,
      method: paymentMethod
    };
    setPaymentDetails(updatedPaymentDetails);
    await saveProgress();
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <FloorPlanSelection 
            onNext={handleFloorPlanSelection} 
            showNavigationButtons={false}
          />
        );
      case 2:
        return (
          <AreaCustomization 
            selectedPlan={selectedPlan}
            floorPlanImage={selectedPlan?.image}
            onComplete={handleDesignComplete}
          />
        );
      case 3:
        return (
          <OrderReview 
            selectedPlan={selectedPlan}
            designSelections={designSelections}
            clientInfo={clientInfo}
          />
        );
      case 4:
        return (
          <PaymentPage 
            totalAmount={designSelections?.totalPrice || 0}
            paymentDetails={paymentDetails}
            onPaymentSetup={handlePaymentSetup}
          />
        );
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

      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepContent()}

        {!isViewOnly && currentStep > 1 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              className="flex items-center px-6 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            {currentStep < 4 && (
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