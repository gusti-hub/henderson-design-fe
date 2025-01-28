import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';

const OrderReview = ({ selectedPlan, designSelections, clientInfo, onConfirmOrder }) => {
  // Early return if no selections are available
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

  // Calculate subtotal from all products
  const subtotal = designSelections.selectedProducts.reduce(
    (sum, product) => sum + (product.unitPrice * product.quantity),
    0
  );

  // Calculate additional fees
  const designFee = subtotal * 0.10; // 10% Design and project management fee
  const otherTradesFee = subtotal * 0.05; // 5% Other trades
  const deliveryFee = subtotal * 0.25; // 25% Freight delivery and installation
  const preTaxTotal = subtotal + designFee + otherTradesFee + deliveryFee;
  const tax = preTaxTotal * 0.048; // 4.8% Tax
  const grandTotal = preTaxTotal + tax;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-light mb-6 text-[#005670]">
        Order Review
      </h2>

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
                      <p>${product.unitPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">Total Price</label>
                      <p className="font-medium">${(product.unitPrice * product.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">
          Price Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Design and Project Management Fee (10%)</span>
            <span className="font-medium">${designFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Other Trades - Electrician, Paper Hanger, etc. (5%)</span>
            <span className="font-medium">${otherTradesFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Freight Delivery and Installation (25%)</span>
            <span className="font-medium">${deliveryFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (4.8%)</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-lg font-semibold">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
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