import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { backendServer } from '../../utils/info';

const OrderReview = ({ selectedPlan, designSelections, clientInfo, onConfirmOrder }) => {

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
                  src={product.selectedOptions?.image || '/placeholder-image.png'}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder-image.png';
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-lg">
                    {product.name}
                    {product.quantity > 1 && (
                      <span className="text-sm text-gray-600 ml-2">
                        (Qty: {product.quantity})
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">Location: {product.spotName}</p>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">Finish</label>
                      <p>{product.selectedOptions.finish || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Fabric</label>
                      <p>{product.selectedOptions.fabric || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Unit Price</label>
                      <p>${product.unitPrice}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Total Price</label>
                      <p className="font-medium">${product.unitPrice * product.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Warning and Confirmation */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="w-5 h-5" />
          <p className="font-medium">Important Notice</p>
        </div>
        <p className="mt-2 text-sm text-amber-700">
          Once you confirm this order, you won't be able to modify your selections. 
          Please review all details carefully before proceeding.
        </p>
      </div>
    </div>
  );
};

export default OrderReview;