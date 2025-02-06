import React, { useState, useEffect } from 'react';
import { Check, ChevronRight, ArrowLeft } from 'lucide-react';
import FloorPlanSelection from './FloorPlanSelection';
import OrderReview from './OrderReview';
import PaymentPage from './PaymentPage';
import AreaCustomization from './AreaCustomization';
import { backendServer } from '../../utils/info';
import { generateFurnitureAreas } from './floorPlanConfig';
import { AlertCircle } from 'lucide-react';

// Add this right after your imports in UserDesignFlow.jsx
const UnselectedSpotsModal = ({ isOpen, onClose, unselectedSpots }) => {
  if (!isOpen) return null;

  // Remove duplicates from unselected areas
  const uniqueAreas = [...new Set(unselectedSpots.map(spot => spot.area))];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Please select all required furniture spots before proceeding.
          </h3>
          <div className="text-gray-600 mb-4">
            Unselected areas:
            <div className="mt-2 space-y-1">
              {uniqueAreas.map((area, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90 transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

const DesignReviewModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-[#005670] mt-1" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Design Review Process</h3>
              <p className="text-gray-600 mt-1">Before proceeding to the order review:</p>
            </div>
          </div>
          <div className="space-y-3 text-gray-600 ml-9">
            <p>• A Henderson Group design team will schedule a meeting with you</p>
            <p>• They will review all your furniture selections in detail</p>
            <p>• Product specifications and placement will be discussed</p>
            <p>• Any questions or concerns will be addressed</p>
            <p>• Once confirmed after review, modifications won't be possible</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
          >
            Proceed to Review
          </button>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-lg w-full mx-4 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Please review your order carefully
          </h3>
          <p className="text-gray-600 mb-4">Once confirmed:</p>
          <div className="space-y-2 text-gray-600">
            <p>• You won't be able to modify your selections</p>
            <p>• First Payment (50%) is due immediately</p>
            <p>• Second Payment (25%) will be due July 2026</p>
            <p>• Final Payment (25%) will be due October 2026</p>
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [furnitureSpots, setFurnitureSpots] = useState({});
  const [showUnselectedModal, setShowUnselectedModal] = useState(false);
  const [unselectedSpotsList, setUnselectedSpotsList] = useState([]);
  const [showDesignReviewModal, setShowDesignReviewModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  useEffect(() => {
    if (selectedPlan?.id) {
      const spots = generateFurnitureAreas(selectedPlan.id);
      setFurnitureSpots(spots);
    }
  }, [selectedPlan]);

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
    { number: 4, title: 'Project Details & Payment' }
  ];

  const handleNext = async () => {
    // Validate step 2 (design selections)
    if (currentStep === 2) {
      // Check if all spots have been selected
      const existingSpots = Object.values(furnitureSpots || {});
      const selectedSpots = Object.keys(designSelections?.spotSelections || {});
      const unselectedSpots = existingSpots.filter(spot => !selectedSpots.includes(spot.id));
      
      console.log(unselectedSpots)
      if (unselectedSpots.length > 0) {
        // Use querySelectorAll to find all elements with the same ID
        unselectedSpots.forEach(spot => {
          const elements = document.querySelectorAll(`[data-spot-id^="${spot.id.split('-')[0]}"]`);
          elements.forEach(element => {
            element.classList.add('animate-pulse');
            element.setAttribute('fill', 'rgba(239, 68, 68, 0.2)');
            element.setAttribute('stroke', 'rgb(239, 68, 68)');
          });
        });
        
        setUnselectedSpotsList(unselectedSpots);
        setShowUnselectedModal(true);
        return;
      }

      setShowDesignReviewModal(true);
      return;
    }
  
    // Handle order confirmation at step 3 (review)
    if (currentStep === 3) {
      setShowConfirmationModal(true);
      return;
    }
  
    try {
      await saveProgress();
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };
  
  const handleConfirmOrder = async () => {
    setShowConfirmationModal(false);
  
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
  
      await saveProgress();
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } catch (error) {
      console.error('Error confirming order:', error);
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

  const handleDesignReviewConfirm = async () => {
    setShowDesignReviewModal(false);
    try {
      await saveProgress();
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
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
      <UnselectedSpotsModal
          isOpen={showUnselectedModal}
          onClose={() => setShowUnselectedModal(false)}
          unselectedSpots={unselectedSpotsList}
      />
      <DesignReviewModal 
        isOpen={showDesignReviewModal}
        onClose={() => setShowDesignReviewModal(false)}
        onConfirm={handleDesignReviewConfirm}
      />
      <OrderConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmOrder}
      />
    </div>
  );
};

export default UserDesignFlow;