import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
import FloorPlanSelection from './FloorPlanSelection';
import OrderReview from './OrderReview';
import PaymentPage from './PaymentPage';
import AreaCustomization from './AreaCustomization';
import { backendServer } from '../../utils/info';

const UserDesignFlow = () => {
  const [currentStep, setCurrentStep] = useState(() => {
    // Initialize from localStorage if available
    const savedStep = localStorage.getItem('currentStep');
    return savedStep ? parseInt(savedStep) : 1;
  });
  const [isLoading, setIsLoading] = useState(true);
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

  const checkExistingOrder = async () => {
    setIsLoading(true);  // Set loading at start
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${backendServer}/api/orders/user-order`, {
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
          
          if (order.selectedProducts?.length > 0) {
            const restoredSelections = {
              selectedProducts: order.selectedProducts,
              spotSelections: order.occupiedSpots || {},
              totalPrice: order.selectedProducts.reduce((sum, p) => sum + p.finalPrice, 0),
              floorPlanId: order.selectedPlan.id
            };
            setDesignSelections(restoredSelections);
            
            localStorage.setItem('selectedProducts', JSON.stringify(order.selectedProducts));
            localStorage.setItem('occupiedSpots', JSON.stringify(order.occupiedSpots || {}));
            localStorage.setItem('designSelections', JSON.stringify(restoredSelections));
          }
          
          setPaymentDetails(order.paymentDetails || paymentDetails);
          
          // Set step after all data is loaded
          const newStep = order.status === 'confirmed' ? 4 : order.step || 1;
          setCurrentStep(newStep);
          localStorage.setItem('currentStep', newStep.toString());
          
          setIsViewOnly(order.status === 'confirmed');
          
          localStorage.setItem('selectedPlan', JSON.stringify(order.selectedPlan));
          localStorage.setItem('clientInfo', JSON.stringify(order.clientInfo));
        }
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
    } finally {
      setIsLoading(false);  // Always remove loading state
    }
  };

  useEffect(() => {
  
    // Check for token and run
    const token = localStorage.getItem('token');
    if (token) {
      checkExistingOrder();
    } else {
      setIsLoading(false);
    }
  }, []);


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
        ? `${backendServer}/api/orders/${existingOrder._id}`
        : `${backendServer}/api/orders`;
  
      let updatedPaymentDetails = {
        method: paymentDetails?.method?.method || paymentDetails?.method || '',
        installments: paymentDetails?.installments?.map(installment => ({
          percent: installment.percent,
          dueDate: installment.dueDate || null,
          status: installment.status || 'pending',
          amount: installment.amount || 0
        })) || []
      };
  
      if (designSelections?.totalPrice) {
        updatedPaymentDetails.installments = calculatePaymentSchedule(designSelections.totalPrice);
      }
  
      // Update status to 'confirmed' when moving from review to payment
      const orderStatus = currentStep === 3 ? 'confirmed' : 
                         currentStep === 4 ? 'confirmed' : 
                         'ongoing';
  
      const orderData = {
        selectedPlan,
        clientInfo,
        selectedProducts: designSelections?.selectedProducts || [],
        occupiedSpots: designSelections?.spotSelections || {},
        designSelections,
        paymentDetails: updatedPaymentDetails,
        status: orderStatus,
        step: currentStep
      };
  
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
  
      if (!response.ok) throw new Error('Failed to save progress');
      const data = await response.json();
      setExistingOrder(data);
      setPaymentDetails(updatedPaymentDetails);
  
      // Update localStorage
      localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
      localStorage.setItem('clientInfo', JSON.stringify(clientInfo));
      localStorage.setItem('currentStep', currentStep.toString());
      localStorage.setItem('orderStatus', orderStatus); // Store order status
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  };

  useEffect(() => {
    return () => {
      // Save current state to localStorage before unmounting
      if (selectedPlan) {
        localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
      }
      if (clientInfo) {
        localStorage.setItem('clientInfo', JSON.stringify(clientInfo));
      }
      if (currentStep) {
        localStorage.setItem('currentStep', currentStep.toString());
      }
    };
  }, [selectedPlan, clientInfo, currentStep]);

  useEffect(() => {
    const restoreSession = async () => {
      const orderId = localStorage.getItem('currentOrderId');
      const savedStep = localStorage.getItem('currentOrderStep');
      
      if (orderId) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${backendServer}/api/orders/${orderId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const order = await response.json();
            setExistingOrder(order);
            setSelectedPlan(order.selectedPlan);
            setClientInfo(order.clientInfo);
            setDesignSelections(order.designSelections);
            setPaymentDetails(order.paymentDetails);
            setCurrentStep(parseInt(savedStep) || order.step);
            setIsViewOnly(order.status === 'completed');
          }
        } catch (error) {
          console.error('Error restoring session:', error);
        }
      }
    };
  
    restoreSession();
  }, []);

  const steps = [
    { number: 1, title: 'Choose Floor Plan' },
    { number: 2, title: 'Design Your Space' },
    { number: 3, title: 'Review Order' },
    { number: 4, title: 'Payment Schedule' }
  ];

  const handleNext = async () => {
    // Validate step 2 (design selections)
    if (currentStep === 2) {
      const hasProducts = designSelections?.selectedProducts?.length > 0;
      if (!hasProducts) {
        alert('Please select at least one product before proceeding');
        return;
      }
    }
  
    // Handle order confirmation at step 3 (review)
    if (currentStep === 3) {
      const confirmed = window.confirm(
        "Please review your order carefully. Once confirmed:\n\n" +
        "• You won't be able to modify your selections\n" +
        "• First payment (25%) must be completed within 1 week\n" +
        "• Second payment (50%) will be due 3 months after first payment\n" +
        "• Final payment (25%) will be due 3 months after second payment\n\n" +
        "Do you want to proceed?"
      );
  
      if (!confirmed) {
        return;
      }
  
      // Calculate payment schedule
      const today = new Date();
      const firstPaymentDue = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));
      const secondPaymentDue = new Date(firstPaymentDue.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
      const thirdPaymentDue = new Date(secondPaymentDue.getTime() + (3 * 30 * 24 * 60 * 60 * 1000));
  
      const paymentSchedule = {
        method: '',
        installments: [
          {
            percent: 25,
            dueDate: firstPaymentDue.toISOString(),
            status: 'pending',
            amount: (designSelections.totalPrice * 0.25)
          },
          {
            percent: 50,
            dueDate: secondPaymentDue.toISOString(),
            status: 'pending',
            amount: (designSelections.totalPrice * 0.5)
          },
          {
            percent: 25,
            dueDate: thirdPaymentDue.toISOString(),
            status: 'pending',
            amount: (designSelections.totalPrice * 0.25)
          }
        ]
      };
  
      setPaymentDetails(paymentSchedule);
      setIsViewOnly(true); // Set view only when confirmed
  
      try {
        // Update order status to confirmed
        const token = localStorage.getItem('token');
        const response = await fetch(`${backendServer}/api/orders/${existingOrder._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...existingOrder,
            status: 'confirmed',
            paymentDetails: paymentSchedule,
            step: 4
          })
        });
  
        if (!response.ok) {
          throw new Error('Failed to confirm order');
        }
      } catch (error) {
        console.error('Error confirming order:', error);
        return;
      }
    }
  
    try {
      await saveProgress();
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  
  // Add handleBack function to prevent navigation when confirmed
  const handleBack = () => {
    if (existingOrder?.status === 'confirmed') {
      alert("You cannot modify your selections after order confirmation.");
      return;
    }
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFloorPlanSelection = async (data) => {
    try {
      const planDetails = data.selectedPlan;
      const token = localStorage.getItem('token');
      
      // Check if there's an existing order with selected products
      console.log(existingOrder);
      console.log(planDetails);
      if (existingOrder && 
          existingOrder.selectedPlan?.id !== planDetails.id && 
          existingOrder.selectedProducts?.length > 0) {
        
        // Show confirmation dialog
        const confirmed = window.confirm(
          "Changing floor plan will reset all your furniture selections. Do you want to continue?"
        );
  
        // If user cancels, exit the function
        if (!confirmed) {
          return;
        }
      }
      // Proceed with floor plan change
      if (existingOrder && existingOrder.selectedPlan?.id !== planDetails.id) {
        const response = await fetch(`${backendServer}/api/orders/${existingOrder._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            selectedPlan: {
              ...planDetails,
              clientInfo: data.clientInfo
            },
            clientInfo: data.clientInfo,
            selectedProducts: [],
            occupiedSpots: {},
            designSelections: null,
            step: 2,
            status: 'ongoing',
            package: (data.package == 'investor') ? 'Investor Package' : 'Owner Package'
          })
        });
        
  
        if (!response.ok) {
          throw new Error('Failed to update order');
        }      
      }
  
      // Clear localStorage
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
      localStorage.removeItem('currentPlanId');
  
      // Reset states
      setDesignSelections(null);
      setSelectedPlan({
        ...planDetails,
        clientInfo: data.clientInfo
      });
      setClientInfo(data.clientInfo);
  
      // Save new plan info to localStorage
      localStorage.setItem('selectedPlan', JSON.stringify({
        ...planDetails,
        clientInfo: data.clientInfo
      }));
      localStorage.setItem('clientInfo', JSON.stringify(data.clientInfo));
      localStorage.setItem('currentStep', '2');
      
  
      // Move to next step
      setCurrentStep(2);
      checkExistingOrder();
  
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
            checkExistingOrder={checkExistingOrder}
          />
        );
      case 2:
        return (
          <AreaCustomization 
            selectedPlan={selectedPlan}
            floorPlanImage={selectedPlan?.image}
            onComplete={handleDesignComplete}
            existingOrder={existingOrder}
            currentStep={currentStep}
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
            designSelections={designSelections}
            selectedPlan={selectedPlan}
            clientInfo={clientInfo}
            orderId={existingOrder?._id}
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-[#005670] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your progress...</p>
          </div>
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
              disabled={existingOrder?.status === 'confirmed'}
              className={`flex items-center px-6 py-2 border rounded-lg ${
                existingOrder?.status === 'confirmed'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
            {currentStep < 4 && (
              <button
                onClick={handleNext}
                disabled={currentStep === 2 && (!designSelections?.selectedProducts?.length)}
                className={`ml-auto flex items-center px-6 py-2 text-white rounded-lg ${
                  currentStep === 2 && (!designSelections?.selectedProducts?.length)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#005670] hover:opacity-90'
                }`}
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