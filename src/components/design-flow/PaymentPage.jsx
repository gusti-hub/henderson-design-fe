import React, { useState } from 'react';
import { Building2, CreditCard, Check, Upload } from 'lucide-react';
import { backendServer } from '../../utils/info';

const PaymentPage = ({ totalAmount, paymentDetails, onPaymentSetup, designSelections, selectedPlan, clientInfo,  orderId }) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
  };

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-lg font-medium mb-4 text-[#005670]">Bank Transfer Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">Bank Central Asia (BCA)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">1234567890</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        );
      
      case 'wire_transfer':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-lg font-medium mb-4 text-[#005670]">Wire Transfer Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Bank Name</p>
                <p className="font-medium">Bank Central Asia (BCA)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">SWIFT Code</p>
                <p className="font-medium">CENAIDJA</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Number</p>
                <p className="font-medium">1234567890</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Account Name</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Bank Address</p>
                <p className="font-medium">BCA KCU Mangga Dua, Jakarta</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
            </div>
          </div>
        );

      case 'cheque':
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h3 className="text-lg font-medium mb-4 text-[#005670]">Cheque Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Pay to the Order of</p>
                <p className="font-medium">Henderson Design</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Address</p>
                <p className="font-medium">Henderson Design Office</p>
                <p className="text-gray-600">Jl. MH Thamrin No. 1</p>
                <p className="text-gray-600">Jakarta 10310</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Reference Number</p>
                <p className="font-medium">HDG-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mt-4">
                <p className="text-sm text-yellow-700">
                  Please write the reference number on the back of your cheque.
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleFileUpload = async (file, installmentIndex) => {

    const confirmed = window.confirm(
      "Are you sure you want to upload this payment proof? Once uploaded, you cannot change the file."
    );
  
    if (!confirmed) {
      return;
    }

    try {
      setUploadingIndex(installmentIndex);
  
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('installmentIndex', installmentIndex);
  
      // Update local state immediately for better UX
      const updatedPaymentDetails = { ...paymentDetails };
      updatedPaymentDetails.installments[installmentIndex].status = 'uploaded';
      updatedPaymentDetails.installments[installmentIndex].proofOfPayment = {
        filename: file.name,
        uploadDate: new Date()
      };
      onPaymentSetup(updatedPaymentDetails);
  
      const token = localStorage.getItem('token');
      const response = await fetch(`${backendServer}/api/orders/${orderId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload payment proof');
      }
  
      const data = await response.json();
      
      // Update again with server response to get the file URL
      // if (data.paymentDetails) {
      //   //onPaymentSetup(data.paymentDetails);

        
      // }
  
      // Show success message
      alert('Payment proof uploaded successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Failed to upload payment proof. Please try again.');
      
      // Revert local state if upload failed
      const revertedPaymentDetails = { ...paymentDetails };
      revertedPaymentDetails.installments[installmentIndex].status = 'pending';
      revertedPaymentDetails.installments[installmentIndex].proofOfPayment = null;
      onPaymentSetup(revertedPaymentDetails);
    } finally {
      setUploadingIndex(null);
    }
  };
  
  // Add this component for payment status display
  const PaymentStatusBadge = ({ status }) => {
    const getStatusStyle = () => {
      switch (status) {
        case 'pending':
          return 'bg-yellow-100 text-yellow-800';
        case 'uploaded':
          return 'bg-blue-100 text-blue-800';
        case 'verified':
          return 'bg-green-100 text-green-800';
        case 'rejected':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
  
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle()}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-medium mb-8 text-[#005670]">Complete Your Payment</h2>

      {/* Client & Plan Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h3 className="text-lg font-medium mb-4 text-[#005670]">Client Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">{clientInfo?.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Unit Number</p>
            <p className="font-medium">{clientInfo?.unitNumber}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Floor Plan</p>
            <p className="font-medium">{selectedPlan?.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Description</p>
            <p className="font-medium">{selectedPlan?.description}</p>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-8">
        <h3 className="text-xl font-medium mb-4 text-[#005670]">Select Payment Method</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleMethodSelect('bank_transfer')}
            className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all
              ${paymentMethod === 'bank_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Building2 
              className={`w-8 h-8 ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Bank Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('wire_transfer')}
            className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all
              ${paymentMethod === 'wire_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <CreditCard 
              className={`w-8 h-8 ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Wire Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('cheque')}
            className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all
              ${paymentMethod === 'cheque' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Check 
              className={`w-8 h-8 ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Cheque
            </span>
          </button>
        </div>
      </div>

      {/* Payment Details */}
      {renderPaymentDetails()}

      {/* Upload Payment Proof
      {paymentMethod && paymentMethod !== 'cheque' && (
        <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
          <h3 className="text-lg font-medium mb-4 text-[#005670]">Upload Payment Proof</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              id="payment-proof"
              onChange={handleFileChange}
            />
            <label
              htmlFor="payment-proof"
              className="cursor-pointer inline-flex items-center px-6 py-3 bg-[#005670] text-white rounded-lg hover:bg-[#004560] transition-colors"
            >
              <Upload className="w-5 h-5 mr-2" />
              Select File
            </label>
            <p className="text-sm text-gray-500 mt-3">
              Upload your payment receipt (JPG, PNG, PDF)
            </p>
            {selectedFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected file: {selectedFile.name}
              </p>
            )}
          </div>
        </div>
      )} */}

      {/* Order Summary */}
      <div className="mt-8">
        <h3 className="text-xl mb-6 text-[#005670]">Order Summary</h3>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          {designSelections?.selectedProducts?.map((product, index) => (
            <div key={index} className="flex items-start gap-4 border-b pb-4 mb-4 last:border-b-0">
              <img
                src={
                  product.variants.find(v => 
                    v.fabric === product.selectedOptions.fabric && 
                    v.finish === product.selectedOptions.finish
                  )?.image?.url || 
                  product.variants[0]?.image?.url ||
                  '/placeholder-image.png'
                }
                alt={product.name}
                className="w-20 h-20 object-cover rounded"
              />
              <div className="flex-1">
                <h4 className="font-medium">{product.name}</h4>
                <p className="text-sm text-gray-600">Location: {product.spotName}</p>
                {product.selectedOptions && (
                  <p className="text-sm text-gray-600">
                    {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                    {product.selectedOptions.finish && product.selectedOptions.fabric && ' - '}
                    {product.selectedOptions.fabric && `Fabric: ${product.selectedOptions.fabric}`}
                  </p>
                )}
                <p className="font-medium mt-1 text-[#005670]">
                  ${product.finalPrice.toFixed(2)}
                </p>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="pt-4 mt-4 border-t">
            <div className="flex justify-between">
              <span className="font-medium">Total Amount</span>
              <span className="font-bold text-[#005670]">
                ${totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
      <h3 className="text-lg font-medium mb-4 text-[#005670]">Payment Schedule</h3>
      {paymentDetails?.installments?.map((installment, index) => (
        <div key={index} className="mb-6 last:mb-0 border rounded-lg p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="font-medium">
                {index === 0 ? 'First Payment (25%)' :
                index === 1 ? 'Second Payment (50%)' :
                'Final Payment (25%)'}
              </p>
              <p className="text-sm text-gray-500">
                Due: {new Date(installment.dueDate).toLocaleDateString()}
              </p>
              <p className="text-[#005670] font-medium">
                ${installment.amount.toFixed(2)}
              </p>
            </div>
            <PaymentStatusBadge status={installment.status} />
          </div>

          {/* Current proof of payment if exists */}
          {installment.proofOfPayment && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Upload Date: {new Date(installment.proofOfPayment.uploadDate).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">
                  File: {installment.proofOfPayment.filename}
                </p>
                {installment.proofOfPayment.url && (
                  <a 
                    href={installment.proofOfPayment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#005670] hover:underline text-sm flex items-center"
                  >
                    Download
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Upload section */}
          {(installment.status === 'pending' || installment.status === 'rejected') && (
            <div className="mt-4">
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                id={`payment-proof-${index}`}
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(e.target.files[0], index);
                  }
                }}
              />
              <label
                htmlFor={`payment-proof-${index}`}
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingIndex === index ? 'Uploading...' : 
                installment.status === 'rejected' ? 'Upload New Proof' : 
                'Upload Payment Proof'}
              </label>
            </div>
          )}

          {/* Status message */}
          {installment.status === 'uploaded' && (
            <p className="text-sm text-blue-600 mt-2">
              Payment proof is under review. We'll update the status once verified.
            </p>
          )}
          {installment.status === 'verified' && (
            <p className="text-sm text-green-600 mt-2">
              Payment has been verified. Thank you!
            </p>
          )}
          {installment.status === 'rejected' && (
            <p className="text-sm text-red-600 mt-2">
              Payment proof was rejected. Please upload a new one.
            </p>
          )}
        </div>
      ))}
    </div>
    </div>
  );
};

export default PaymentPage;