import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';

const OrderReview = ({ selectedPlan, designSelections, clientInfo, onConfirmOrder }) => {
  if (!designSelections?.selectedProducts || !selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-light mb-6 text-[#005670]">
          Order Review
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">No selections have been made yet.</p>
        </div>
      </div>
    );
  }

  const packageType = selectedPlan?.id?.split('-')[0]; // 'investor' or 'custom'
  const totalInvestment = FLOOR_PLAN_TYPES[packageType]?.budgets[selectedPlan?.id] || 
                         FLOOR_PLAN_TYPES[packageType]?.budgets.default;


  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-6 text-[#005670]">
        Order Review
      </h2>

      {/* Design Team Review Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-800 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Design Team Review Process</h4>
            <p className="mt-2 text-sm text-amber-700">
              Before finalizing your order:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>A Henderson Design Group Concierge team member will schedule a review meeting</li>
                <li>They will discuss all your selections in detail</li>
                <li>Ensure everything meets your expectations and requirements</li>
                <li>After the review and confirmation, modifications will not be possible</li>
                <li>Payment process begins after the design review meeting</li>
              </ul>
            </p>
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Client Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Name</label>
            <p className="font-medium">{clientInfo?.name}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Unit Number</label>
            <p className="font-medium">{clientInfo?.unitNumber}</p>
          </div>
        </div>
      </div>

      {/* Floor Plan Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Floor Plan Details
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Plan Type</label>
            <p className="font-medium">{selectedPlan.title}</p>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Description</label>
            <p className="font-medium">{selectedPlan.description}</p>
          </div>
        </div>
      </div>

      {/* Selected Products */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Selected Products
        </h3>
        <div className="space-y-6">
          {designSelections.selectedProducts.map((product, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-4">
              {product.selectedOptions?.image?.toLowerCase().endsWith('.mp4') ? (
                <video
                  src={product.selectedOptions.image}
                  className="w-24 h-24 object-cover rounded"
                  autoPlay
                  loop
                  muted
                  onError={(e) => {
                    console.error(`Error loading video for ${product.name}`);
                    // Create fallback image
                    const img = document.createElement('img');
                    img.src = '/placeholder-image.png';
                    img.className = 'w-24 h-24 object-cover rounded';
                    e.target.parentNode.replaceChild(img, e.target);
                  }}
                />
              ) : (
                <img
                  src={product.selectedOptions?.image || '/placeholder-image.png'}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.png';
                  }}
                />
              )}
                <div className="flex-1">
                  <h4 className="font-medium text-lg">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">Location: {product.spotName}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Finish</label>
                      <p>{product.selectedOptions.finish || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Fabric</label>
                      <p>{product.selectedOptions.fabric || 'N/A'}</p>
                    </div>
                    {product.selectedOptions.size && (
                      <div>
                        <label className="block text-sm text-gray-600">Size</label>
                        <p>{product.selectedOptions.size}</p>
                      </div>
                    )}
                    {product.selectedOptions.insetPanel && (
                      <div>
                        <label className="block text-sm text-gray-600">Inset Panel</label>
                        <p>{product.selectedOptions.insetPanel}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm text-gray-600">Quantity</label>
                      <p className="font-medium">{product.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total Price</span>
          <span className="text-[#005670]">${totalInvestment.toLocaleString()} (Not Including Tax)</span>
        </div>
      </div>

      {/* Final Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium">Please Note</p>
        </div>
        <p className="mt-2 text-sm text-red-700">
          By proceeding, you acknowledge that you'll need to complete the design review meeting with Henderson Group before final confirmation. After confirmation, modifications to the order will not be possible.
        </p>
      </div>
    </div>
  );
};

export default OrderReview;