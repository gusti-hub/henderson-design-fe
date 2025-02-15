import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone,
  Mail,
  Shield,
  Check 
} from 'lucide-react';
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
    const currentPackage = localStorage.getItem('selectedPackage');
    const existingProducts = localStorage.getItem('selectedProducts');
    const hasProducts = existingProducts && JSON.parse(existingProducts).length > 0;

    if (packageType === currentPackage) {
      setSelectedPlanType(packageType);
      localStorage.setItem('selectedPackage', packageType);
      return;
    }

    if ((currentPackage != null && currentPackage !== packageType)) {
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
      
      const newFloorPlan = floorPlanTypes[pendingPackageType].plans.find(plan =>
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      );
  
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
              selectedPlan: newFloorPlan,
              selectedProducts: [],
              occupiedSpots: {},
              status: 'ongoing',
              step: 2
            })
          });
        }
      }
  
      localStorage.removeItem('selectedProducts');
      localStorage.removeItem('occupiedSpots');
      localStorage.removeItem('designSelections');
      
      setSelectedPlanType(pendingPackageType);
      localStorage.setItem('selectedPackage', pendingPackageType);
      setSelectedPlan(newFloorPlan);
      setDesignSelections(null);
      setSelectedProducts([]);
      setOccupiedSpots({});
      
      setShowWarningModal(false);
      setPendingPackageType(null);
  
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

  useEffect(() => {
    if (selectedPlanType && clientInfo.floorPlan) {
      const availablePlans = floorPlanTypes[selectedPlanType].plans.filter(plan => 
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      );
      
      if (availablePlans.length === 1) {
        setSelectedPlan(availablePlans[0].id);
      }
    }
  }, [selectedPlanType, clientInfo.floorPlan]);

  const validateForm = () => {
    const newErrors = {};
    const availablePlans = selectedPlanType ? 
      floorPlanTypes[selectedPlanType].plans.filter(plan => 
        plan.title.toLowerCase().includes(clientInfo.floorPlan.toLowerCase())
      ) : [];
      
    if (availablePlans.length === 1) {
      setSelectedPlan(availablePlans[0].id);
    } else if (!selectedPlan) {
      newErrors.plan = 'Please select a floor plan';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      const selectedPlanData = floorPlanTypes[selectedPlanType].plans.find(
        plan => plan.id === selectedPlan
      );
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

      {/* Package Selection Section */}
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

        {/* Two Column Layout for Key Information */}
        <div className="mt-12">
          <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
            Additional Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* HDG Concierge Contact Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#005670] p-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Henderson Design Group Concierge
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="mb-4">
                  <h4 className="font-medium text-lg text-[#005670]">Mark Henderson</h4>
                  <p className="text-gray-600">Director of Business Development</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-[#005670]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Number</p>
                    <p className="font-medium">(808) 747-7127</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#005670]/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-[#005670]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">mark@henderson.house</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Available Monday through Friday
                    <br />8:00 AM - 6:00 PM HST
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Client Information Card */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-[#005670] p-4">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Client Information
              </h3>
            </div>
            <div className="p-6">
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
          </div>
        </div>

        {/* Warranty Information Card - Full Width */}
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="bg-[#005670] p-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Henderson Design Group Warranty Terms and Conditions
            </h3>
          </div>
          <div className="p-6">
            {/* Coverage Period */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-2">Coverage Period</h4>
              <p className="text-gray-600">
                Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.
              </p>
            </div>

            {/* Scope of Warranty */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-2">Scope of Warranty</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#005670]"></div>
                  <p className="text-gray-600">Workmanship, Materials, and Functionality: The warranty covers defects in workmanship, materials, and functionality under normal wear and tear conditions.</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-[#005670]"></div>
                  <p className="text-gray-600">Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will, at its discretion, either repair or replace the defective item.</p>
                </div>
              </div>
            </div>

            {/* Returns and Exchanges */}
            <div className="mb-8">
              <h4 className="font-medium text-lg mb-2">Returns and Exchanges</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">No Returns</h5>
                  <p className="text-sm text-gray-600">Items are not eligible for returns.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">No Exchanges</h5>
                  <p className="text-sm text-gray-600">Exchanges are not permitted except in cases of defects.</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Custom Items</h5>
                  <p className="text-sm text-gray-600">Custom items, including upholstery, are not eligible for returns or exchanges.</p>
                </div>
              </div>
            </div>

            {/* Exclusions */}
            <div>
              <h4 className="font-medium text-lg mb-3">Warranty Exclusions</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Negligence, misuse, or accidents after installation</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Incorrect or inadequate maintenance</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Non-residential use or commercial conditions</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Natural variations in color, grain, or texture of materials</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Damage from extensive sun exposure</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                    <p className="text-gray-600">Use of fabric protectants may void warranty</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                This warranty applies to normal household use only. Please refer to your Care and Maintenance guide for proper furniture care instructions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <WarningModal />
    </div>
  );
};

export default FloorPlanSelection;