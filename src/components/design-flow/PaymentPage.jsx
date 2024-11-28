import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const PaymentPage = () => {
  const [copied, setCopied] = useState(false);
  const bankDetails = {
    bank: "Bank Central Asia",
    accountNumber: "1234567890",
    accountName: "Henderson Design"
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-light mb-6" style={{ color: '#005670' }}>
        Complete Your Payment
      </h2>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
          Bank Transfer Details
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Bank Name</label>
            <p className="font-medium">{bankDetails.bank}</p>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Number</label>
            <div className="flex items-center gap-2">
              <p className="font-medium">{bankDetails.accountNumber}</p>
              <button
                onClick={() => handleCopy(bankDetails.accountNumber)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Account Name</label>
            <p className="font-medium">{bankDetails.accountName}</p>
          </div>
        </div>
      </div>

      {/* Upload Payment Proof */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-medium mb-4" style={{ color: '#005670' }}>
          Upload Payment Proof
        </h3>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            id="payment-proof"
          />
          <label
            htmlFor="payment-proof"
            className="cursor-pointer inline-block px-4 py-2 text-white rounded-lg"
            style={{ backgroundColor: '#005670' }}
          >
            Select File
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload your payment receipt (JPG, PNG, PDF)
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;