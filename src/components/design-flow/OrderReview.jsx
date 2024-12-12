import React from 'react';
import { Check } from 'lucide-react';

const OrderReview = ({ selectedPlan, designSelections, clientInfo }) => {
  // Early return if no selections are available
  if (!designSelections?.selectedProducts || !selectedPlan) {
    return (
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
          Order Review
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-500">No selections have been made yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
        Order Review
      </h2>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
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
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
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
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
          Selected Products
        </h3>
        <div className="space-y-6">
          {designSelections.selectedProducts.map((product, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0">
              <div className="flex items-start gap-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-2">Location: {product.spotName}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Color</label>
                      <p>{product.selectedOptions.color}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Material</label>
                      <p>{product.selectedOptions.material}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Price</label>
                      <p className="font-medium">${product.finalPrice}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Total Price */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Price</span>
            <span className="text-2xl font-bold text-[#005670]">
              ${designSelections.totalPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderReview;