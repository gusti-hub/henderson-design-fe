import React, { useState, useEffect } from 'react';
import { backendServer } from '../../utils/info';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';

const FloorPlanSelection = ({ onNext, showNavigationButtons }) => {
  const [selectedPlanType, setSelectedPlanType] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    unitNumber: '',
    floorPlan: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingPackageType, setPendingPackageType] = useState(null);

  const [selectedProducts, setSelectedProducts] = useState([]);
  const [occupiedSpots, setOccupiedSpots] = useState({});
  const [designSelections, setDesignSelections] = useState(null);

  const handlePackageSelect = (packageType) => {
    // Get current package from localStorage instead of state
    const currentPackage = localStorage.getItem('selectedPackage');
    
    // Get existing products from localStorage
    const existingProducts = localStorage.getItem('selectedProducts');
    const hasProducts = existingProducts && JSON.parse(existingProducts).length > 0;

    // If it's the same package, just update the state and proceed
    if (packageType === currentPackage) {
      setSelectedPlanType(packageType);
      localStorage.setItem('selectedPackage', packageType);
      return;
    }

  
    // Show warning if has products and changing packages
    if (hasProducts || (currentPackage != null && currentPackage !== packageType)) {
      setPendingPackageType(packageType);
      setShowWarningModal(true);
    } else {
      setSelectedPlanType(packageType);
      localStorage.setItem('selectedPackage', packageType);
      setSelectedPlan(null);
    }
  };
  
  const confirmPackageChange = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Get the new floor plan data based on pendingPackageType
      const newFloorPlan = floorPlanTypes[pendingPackageType].plans.find(plan =>
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      );
  
      // Clear existing order and update selectedPlan in database
      const response = await fetch(`${backendServer}/api/orders/user-order`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const existingOrder = await response.json();
        if (existingOrder) {
          await fetch(`${backendServer}/api/orders/${existingOrder._id}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              ...existingOrder,
              selectedPlan: newFloorPlan, // Update the selectedPlan
              selectedProducts: [], // Clear products
              occupiedSpots: {},
              status: 'ongoing',
              step: 2
            })
          });
        }
      }
  
      // Clear local storage
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
      
      // Update local state
      setSelectedPlanType(pendingPackageType);
      localStorage.setItem('selectedPackage', pendingPackageType);
      setSelectedPlan(newFloorPlan); // Update selectedPlan in state
      setDesignSelections(null); // Clear design selections if you have this state
      setSelectedProducts([]); // Clear selected products if you have this state
      setOccupiedSpots({}); // Clear occupied spots if you have this state
      
      setShowWarningModal(false);
      setPendingPackageType(null);
  
      // Force clean state in UI
      //window.location.reload();
  
    } catch (error) {
      console.error('Error handling package change:', error);
      alert('There was an error changing packages. Please try again.');
    }
  };

  const renderPackages = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.values(floorPlanTypes).map(type => {
          const clientPlan = type.plans.find(plan =>
            plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
          );
  
          const image_link = clientPlan.image;
          
          const budget = clientPlan ? 
            type.budgets[clientPlan.id] || type.budgets.default : 
            type.budgets.default;
  
          return (
            <div
              key={type.id}
              onClick={() => handlePackageSelect(type.id)}
              className="bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all"
            >
              <div className="relative w-full pt-[75%] rounded-t-lg overflow-hidden">
                <img
                  src={image_link}
                  alt={`${type.title} floor plan`}
                  className="absolute top-0 left-0 w-full h-full object-cover object-center"
                />
              </div>
  
              <div className="p-6">
                <h3 className="text-xl font-medium mb-2 text-[#005670]">
                  {type.title}
                </h3>
                <p className="text-gray-600 mb-2">{type.description}</p>
                <p className="text-[#005670] font-medium text-lg">
                  Price ${budget.toLocaleString()} (Not Including Tax)
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const WarningModal = () => showWarningModal && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Change Package?</h3>
        <p className="mb-6 text-gray-600">
          Changing packages will remove all your current furniture selections. Would you like to proceed?
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowWarningModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={confirmPackageChange}
            className="px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
          >
            Confirm Change
          </button>
        </div>
      </div>
    </div>
  );

  const floorPlanTypes = FLOOR_PLAN_TYPES;

  const fetchClientInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await fetch(`${backendServer}/api/clients/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClientInfo({
          name: data.name,
          unitNumber: data.unitNumber,
          floorPlan: data.floorPlan
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
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedPlan) newErrors.plan = 'Please select a floor plan';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const selectedPlanData = floorPlanTypes[selectedPlanType].plans.find(
        plan => plan.id === selectedPlan
      );
      // Remove checkExistingOrder() call and just pass the data
      onNext({ 
        selectedPlan: selectedPlanData,
        clientInfo,
        package: selectedPlanType
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
        Choose Your Package
      </h2>

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
        <>
          <button
            onClick={() => setSelectedPlanType(null)}
            className="text-[#005670] hover:underline mb-6 flex items-center"
          >
            ← Back to Plan Types
          </button>
          
          <div className="space-y-8">
            {floorPlanTypes[selectedPlanType].plans.filter(plan => 
              plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
            ).map(plan => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`bg-white rounded-lg shadow-sm cursor-pointer transition-all
                  ${selectedPlan === plan.id ? 'ring-2 ring-[#005670]' : 'hover:shadow-md'}`}
              >
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-8">
                    <img
                      src={plan.image}
                      alt={plan.title}
                      className="w-full h-full object-cover rounded-l-lg"
                    />
                  </div>
                  
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
        renderPackages()
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

      <WarningModal />
    </div>
  );
};

export default FloorPlanSelection;