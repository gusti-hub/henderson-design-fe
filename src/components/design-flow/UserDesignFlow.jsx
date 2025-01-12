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
      { percent: 50, dueDate: null, status: 'pending', amount: 0 },
      { percent: 25, dueDate: null, status: 'pending', amount: 0 },
      { percent: 25, dueDate: null, status: 'pending', amount: 0 }
    ]
  });

  const checkExistingOrder = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      console.log('Checking for existing order...');
      console.log('Using backend server:', backendServer);
  
      const response = await fetch(`${backendServer}/api/orders/user-order`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        if (response.status === 404) {
          // No existing order - this is a valid state
          console.log('No existing order found');
          setCurrentStep(1); // Reset to first step if no order exists
          setIsLoading(false);
          return;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const order = await response.json();
      console.log('Received order:', order);
  
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
          
          // Save to localStorage
          localStorage.setItem('selectedProducts', JSON.stringify(order.selectedProducts));
          localStorage.setItem('occupiedSpots', JSON.stringify(order.occupiedSpots || {}));
          localStorage.setItem('designSelections', JSON.stringify(restoredSelections));
        }
        
        // Set payment details with new schedule
        setPaymentDetails(order.paymentDetails || {
          method: '',
          installments: [
            { 
              percent: 50, 
              dueDate: new Date().toISOString(), 
              status: 'pending', 
              amount: 0 
            },
            { 
              percent: 25, 
              dueDate: new Date('2026-07-01').toISOString(), 
              status: 'pending', 
              amount: 0 
            },
            { 
              percent: 25, 
              dueDate: new Date('2026-10-01').toISOString(), 
              status: 'pending', 
              amount: 0 
            }
          ]
        });
        
        // Set the correct step based on order status
        const newStep = order.status === 'confirmed' ? 4 : order.step || 1;
        setCurrentStep(newStep);
        localStorage.setItem('currentStep', newStep.toString());
        
        setIsViewOnly(order.status === 'confirmed');
        
        // Update localStorage
        localStorage.setItem('selectedPlan', JSON.stringify(order.selectedPlan));
        localStorage.setItem('clientInfo', JSON.stringify(order.clientInfo));
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
      // Handle network errors
      if (error.message.includes('Failed to fetch')) {
        console.error('Network error - check if backend server is running');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const checkExistingOrderAreaCustomization = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }
  
      console.log('Checking for existing order...');
      console.log('Using backend server:', backendServer);
  
      const response = await fetch(`${backendServer}/api/orders/user-order`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        if (response.status === 404) {
          // No existing order - this is a valid state
          console.log('No existing order found');
          setCurrentStep(1); // Reset to first step if no order exists
          setIsLoading(false);
          return;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const order = await response.json();
      console.log('Received order:', order);
  
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
          
          // Save to localStorage
          localStorage.setItem('selectedProducts', JSON.stringify(order.selectedProducts));
          localStorage.setItem('occupiedSpots', JSON.stringify(order.occupiedSpots || {}));
          localStorage.setItem('designSelections', JSON.stringify(restoredSelections));
        }
        
        // Set payment details with new schedule
        setPaymentDetails(order.paymentDetails || {
          method: '',
          installments: [
            { 
              percent: 50, 
              dueDate: new Date().toISOString(), 
              status: 'pending', 
              amount: 0 
            },
            { 
              percent: 25, 
              dueDate: new Date('2026-07-01').toISOString(), 
              status: 'pending', 
              amount: 0 
            },
            { 
              percent: 25, 
              dueDate: new Date('2026-10-01').toISOString(), 
              status: 'pending', 
              amount: 0 
            }
          ]
        });
        
        // Set the correct step based on order status
        const newStep = order.status === 'confirmed' ? 4 : order.step || 1;
        setCurrentStep(newStep);
        localStorage.setItem('currentStep', newStep.toString());
        
        setIsViewOnly(order.status === 'confirmed');
        
        // Update localStorage
        localStorage.setItem('selectedPlan', JSON.stringify(order.selectedPlan));
        localStorage.setItem('clientInfo', JSON.stringify(order.clientInfo));
      }
    } catch (error) {
      console.error('Error checking existing order:', error);
      // Handle network errors
      if (error.message.includes('Failed to fetch')) {
        console.error('Network error - check if backend server is running');
      }
    }
  };
  

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkExistingOrder().catch(error => {
        console.error('Error in useEffect:', error);
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);


  const calculatePaymentSchedule = (totalAmount) => {
    const firstPaymentDate = new Date(); // Today for first payment
    const secondPaymentDate = new Date('2026-07-01'); // July 2026
    const finalPaymentDate = new Date('2026-10-01'); // October 2026
  
    return [
      {
        percent: 50,
        dueDate: firstPaymentDate.toISOString(),
        status: 'pending',
        amount: (totalAmount * 0.50)
      },
      {
        percent: 25,
        dueDate: secondPaymentDate.toISOString(),
        status: 'pending',
        amount: (totalAmount * 0.25)
      },
      {
        percent: 25,
        dueDate: finalPaymentDate.toISOString(),
        status: 'pending',
        amount: (totalAmount * 0.25)
      }
    ];
  };

  const saveProgress = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
  
      const method = existingOrder ? 'PUT' : 'POST';
      const endpoint = existingOrder 
        ? `${backendServer}/api/orders/${existingOrder._id}`
        : `${backendServer}/api/orders`;
  
      console.log('Saving progress to:', endpoint);
      console.log('Method:', method);
  
      let updatedPaymentDetails = {
        method: paymentDetails?.method || '',
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
  
      if (!response.ok) {
        throw new Error(`Failed to save progress: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Save progress response:', data);
      
      setExistingOrder(data);
      setPaymentDetails(updatedPaymentDetails);
  
      localStorage.setItem('selectedPlan', JSON.stringify(selectedPlan));
      localStorage.setItem('clientInfo', JSON.stringify(clientInfo));
      localStorage.setItem('currentStep', currentStep.toString());
      localStorage.setItem('orderStatus', orderStatus);
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
        "• First Payment (50%) is due immediately\n" +
        "• Second Payment (25%) will be due July 2026\n" +
        "• Final Payment (25%) will be due October 2026\n\n" +
        "Do you want to proceed?"
      );
    
      if (!confirmed) {
        return;
      }
    
      const paymentSchedule = {
        method: '',
        installments: calculatePaymentSchedule(designSelections.totalPrice)
      };
    
      setPaymentDetails(paymentSchedule);
      setIsViewOnly(true);
    
      try {
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

  const handleFloorPlanSelection = (data) => {
    try {
      // Just handle the state updates without any API calls
      setSelectedPlan(data.selectedPlan);
      setClientInfo(data.clientInfo);
      
      // Save to localStorage
      localStorage.setItem('selectedPlan', JSON.stringify(data.selectedPlan));
      localStorage.setItem('clientInfo', JSON.stringify(data.clientInfo));
      localStorage.setItem('currentStep', '2');
      
      // Move to step 2
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
            existingOrder={existingOrder}
            currentStep={currentStep}
            clientInfo={clientInfo}
            checkExistingOrder={checkExistingOrderAreaCustomization}
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