import React, { useState } from 'react';
import { 
  Building2, 
  Truck, 
  CreditCard, 
  Check, 
  Upload, 
  Wrench, 
  Phone, 
  Mail, 
  Shield,
  Clock,
  FileText,
  ChevronRight,
  X
} from 'lucide-react';
import { backendServer } from '../../utils/info';
import { FLOOR_PLAN_TYPES } from '../../config/floorPlans';

const PaymentPage = ({ 
  totalAmount, 
  paymentDetails, 
  onPaymentSetup, 
  designSelections, 
  selectedPlan, 
  clientInfo,  
  orderId 
}) => {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const packageType = selectedPlan?.id?.split('-')[0];
  const baseBudget = FLOOR_PLAN_TYPES[packageType]?.budgets[selectedPlan?.id] || 
                    FLOOR_PLAN_TYPES[packageType]?.budgets.default;
  const packageSelected = FLOOR_PLAN_TYPES[packageType]?.title || '';

  const handleMethodSelect = (method) => {
    setPaymentMethod(method);
  };

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

  const handleFileUpload = async (file, installmentIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to upload this payment proof? Once uploaded, you cannot change the file."
    );
  
    if (!confirmed) return;

    try {
      setUploadingIndex(installmentIndex);
  
      const formData = new FormData();
      formData.append('paymentProof', file);
      formData.append('installmentIndex', installmentIndex);
  
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
  
      alert('Payment proof uploaded successfully');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      alert('Failed to upload payment proof. Please try again.');
      
      const revertedPaymentDetails = { ...paymentDetails };
      revertedPaymentDetails.installments[installmentIndex].status = 'pending';
      revertedPaymentDetails.installments[installmentIndex].proofOfPayment = null;
      onPaymentSetup(revertedPaymentDetails);
    } finally {
      setUploadingIndex(null);
    }
  };

  const renderPaymentDetails = () => {
    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Bank Transfer Details</h3>
            <div className="grid grid-cols-2 gap-3">
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
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Wire Transfer Details</h3>
            <div className="grid grid-cols-2 gap-3">
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
          <div className="bg-white p-4 rounded-lg mt-4">
            <h3 className="text-lg font-medium mb-3 text-[#005670]">Cheque Details</h3>
            <div className="space-y-3">
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
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mt-3">
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

  // Tab content renderers
  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Two Column Layout for Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HDG Concierge Contact Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#005670] p-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Henderson Design Group Concierge
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div className="mb-2">
                <h4 className="font-medium text-[#005670]">Mark Henderson</h4>
                <p className="text-sm text-gray-600">Director of Business Development</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005670]/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-[#005670]" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Contact Number</p>
                  <p className="text-sm font-medium">(808) 747-7127</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#005670]/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-[#005670]" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm font-medium">mark@henderson.house</p>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Available Monday through Friday
                  <br />8:00 AM - 6:00 PM HST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Client Information Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#005670] p-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Project Information
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">Client Name</p>
                <p className="text-sm font-medium">{clientInfo?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Unit Number</p>
                <p className="text-sm font-medium">{clientInfo?.unitNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Floor Plan</p>
                <p className="text-sm font-medium">{selectedPlan?.title}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Package</p>
                <p className="text-sm font-medium">{packageSelected}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-3">
          <h3 className="text-base font-medium text-white flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Order Summary
          </h3>
        </div>
        <div className="p-4">
          <div className="flex justify-between text-base font-semibold">
            <span>Total Investment</span>
            <span className="text-[#005670]">${baseBudget.toLocaleString()} (Not Including Tax)</span>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveTab('products')}
              className="text-[#005670] hover:underline text-sm flex items-center justify-center mx-auto"
            >
              View all selected products
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Schedule Preview */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-3">
          <h3 className="text-base font-medium text-white flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Schedule
          </h3>
        </div>
        <div className="p-4">
          {paymentDetails?.installments?.slice(0, 1).map((installment, index) => (
            <div key={index} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">
                    First Payment (50%) - ${(baseBudget * 0.5).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <PaymentStatusBadge status={installment.status} />
              </div>
            </div>
          ))}
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => setActiveTab('payments')}
              className="text-[#005670] hover:underline text-sm flex items-center justify-center mx-auto"
            >
              View full payment schedule and options
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-center">
        <div className="relative max-w-md">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-[32px] bottom-8 w-0.5 bg-gray-200" />
          
          <div className="space-y-8">
            {/* Timeline steps - centered design */}
            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Engage with Henderson</h4>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Client Registration</h4>
                <p className="text-xs text-gray-600">Completed</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Design Selection</h4>
                <p className="text-xs text-gray-600">2/20/2025</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm text-[#005670]">Purchasing Agreement</h4>
                <p className="text-xs text-[#005670]">In Progress</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Production Phase</h4>
                <p className="text-xs text-gray-600">Expected start: Q2 2026</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Progress Payment</h4>
                <p className="text-xs text-gray-600">To be scheduled</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Truck className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Delivery & Installation</h4>
                <p className="text-xs text-gray-600">Q3 2026</p>
              </div>
            </div>

            <div className="relative flex items-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div className="ml-3 min-w-0">
                <h4 className="font-medium text-sm">Final Reveal</h4>
                <p className="text-xs text-gray-600">To be scheduled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-base font-medium mb-3">Select Payment Method</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => handleMethodSelect('bank_transfer')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'bank_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Building2 
              className={`w-6 h-6 ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'bank_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Bank Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('wire_transfer')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'wire_transfer' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <CreditCard 
              className={`w-6 h-6 ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'wire_transfer' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Wire Transfer
            </span>
          </button>

          <button
            onClick={() => handleMethodSelect('cheque')}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 transition-all hover:border-[#005670] hover:bg-[#005670]/5
              ${paymentMethod === 'cheque' ? 'border-[#005670] bg-[#005670]/5' : 'border-gray-200'}`}
          >
            <Check 
              className={`w-6 h-6 ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-400'}`}
            />
            <span className={`text-center text-sm ${paymentMethod === 'cheque' ? 'text-[#005670]' : 'text-gray-600'}`}>
              Cheque
            </span>
          </button>
        </div>

        {/* Render Payment Details based on selected method */}
        {renderPaymentDetails()}
      </div>

      {/* Payment Schedule */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h4 className="text-base font-medium mb-3">Payment Schedule</h4>
        <div className="space-y-3">
          {paymentDetails?.installments?.map((installment, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium text-sm">
                    {index === 0 ? `First Payment (50%) - $${(baseBudget * 0.5).toLocaleString()}` :
                     index === 1 ? `Second Payment (25%) - $${(baseBudget * 0.25).toLocaleString()}` :
                     `Final Payment (25%) - $${(baseBudget * 0.25).toLocaleString()}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    Due: {new Date(installment.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <PaymentStatusBadge status={installment.status} />
              </div>

              {/* File upload and status sections */}
              {installment.proofOfPayment && (
                <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Upload Date: {new Date(installment.proofOfPayment.uploadDate).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-medium">
                      File: {installment.proofOfPayment.filename}
                    </p>
                    {installment.proofOfPayment.url && (
                      <a 
                        href={installment.proofOfPayment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#005670] hover:underline text-xs"
                      >
                        Download
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Upload button */}
              {(installment.status === 'pending' || installment.status === 'rejected') && (
                <div className="mt-2">
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
                    className="cursor-pointer inline-flex items-center px-3 py-1 text-sm bg-[#005670] text-white rounded-lg hover:bg-opacity-90"
                  >
                    <Upload className="w-3 h-3 mr-1" />
                    {uploadingIndex === index ? 'Uploading...' : 
                     installment.status === 'rejected' ? 'Upload New Proof' : 
                     'Upload Payment Proof'}
                  </label>
                </div>
              )}

              {/* Status messages */}
              {installment.status === 'uploaded' && (
                <p className="text-xs text-blue-600 mt-1">
                  Payment proof is under review.
                </p>
              )}
              {installment.status === 'verified' && (
                <p className="text-xs text-green-600 mt-1">
                  Payment has been verified.
                </p>
              )}
              {installment.status === 'rejected' && (
                <p className="text-xs text-red-600 mt-1">
                  Payment proof was rejected.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProductsTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="space-y-3">
        {designSelections?.selectedProducts?.map((product, index) => (
          <div key={index} className="flex items-start gap-3 border-b pb-3 last:border-b-0">
            <img
              src={product.selectedOptions?.image || '/placeholder-image.png'}
              alt={product.name}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1">
              <h4 className="font-medium text-sm">{product.name}</h4>
              <p className="text-xs text-gray-600">Location: {product.spotName}</p>
              {product.selectedOptions && (
                <div>
                  <p className="text-xs text-gray-600">
                    {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                    {product.selectedOptions.fabric && `, Fabric: ${product.selectedOptions.fabric}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    Quantity: {product.quantity}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Total Price */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex justify-between font-semibold">
          <span>Total Investment</span>
          <span className="text-[#005670]">${baseBudget.toLocaleString()} (Not Including Tax)</span>
        </div>
      </div>
    </div>
  );

  const renderWarrantyTab = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Coverage Period */}
      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Coverage Period</h4>
        <p className="text-sm text-gray-600">
          Furniture is warranted to be free from defects in workmanship, materials, and functionality for a period of 30 days from the date of installation.
        </p>
      </div>

      {/* Scope of Warranty */}
      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Scope of Warranty</h4>
        <div className="space-y-1">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 mt-1 rounded-full bg-[#005670] shrink-0"></div>
            <p className="text-xs text-gray-600">Workmanship, Materials, and Functionality: The warranty covers defects under normal wear and tear conditions.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 mt-1 rounded-full bg-[#005670] shrink-0"></div>
            <p className="text-xs text-gray-600">Repair or Replacement: If a defect is identified within the 30-day period, Henderson Design Group will repair or replace the item.</p>
          </div>
        </div>
      </div>

      {/* Returns and Exchanges */}
      <div className="mb-4">
        <h4 className="font-medium text-base mb-1">Returns and Exchanges</h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">No Returns</h5>
            <p className="text-xs text-gray-600">Items are not eligible for returns.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">No Exchanges</h5>
            <p className="text-xs text-gray-600">Exchanges are not permitted except for defects.</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-lg">
            <h5 className="font-medium text-xs mb-1">Custom Items</h5>
            <p className="text-xs text-gray-600">Custom items are not eligible for returns.</p>
          </div>
        </div>
      </div>

      {/* Exclusions */}
      <div>
        <h4 className="font-medium text-base mb-2">Warranty Exclusions</h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          <div className="space-y-1">
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Negligence or accidents after installation</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Incorrect maintenance</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Non-residential or commercial use</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Natural color/grain variations</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Fabric wear or colorfastness</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Filling materials softening</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Damage from sun exposure</p>
            </div>
            <div className="flex items-start gap-1">
              <div className="w-2 h-2 mt-1 rounded-full bg-red-400 shrink-0"></div>
              <p className="text-gray-600">Use of fabric protectants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'timeline':
        return renderTimelineTab();
      case 'payments':
        return renderPaymentsTab();
      case 'products':
        return renderProductsTab();
      case 'warranty':
        return renderWarrantyTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-4 mb-4 rounded-lg shadow-sm">
        <h2 className="text-xl font-medium text-[#005670]">Project Details & Payment</h2>
        <p className="text-sm text-gray-600">Review your project details and manage payments</p>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex mb-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'overview' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'timeline' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'payments' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'products' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('warranty')}
          className={`flex-1 py-3 px-4 text-sm font-medium ${
            activeTab === 'warranty' ? 'bg-[#005670] text-white' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Warranty
        </button>
      </div>

      {/* Mobile Tab Menu Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full flex items-center justify-between bg-white p-3 rounded-lg shadow-sm"
        >
          <span className="font-medium text-[#005670]">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </span>
          <ChevronRight className={`h-5 w-5 transition-transform ${showMobileMenu ? 'rotate-90' : ''}`} />
        </button>

        {/* Mobile Tab Menu */}
        {showMobileMenu && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => {
                setActiveTab('overview');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('timeline');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Timeline
            </button>
            <button
              onClick={() => {
                setActiveTab('payments');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Payments
            </button>
            <button
              onClick={() => {
                setActiveTab('products');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Products
            </button>
            <button
              onClick={() => {
                setActiveTab('warranty');
                setShowMobileMenu(false);
              }}
              className="w-full text-left p-3 hover:bg-gray-50 text-sm"
            >
              Warranty
            </button>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="px-1">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PaymentPage;