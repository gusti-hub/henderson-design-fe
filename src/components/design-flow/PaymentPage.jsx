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
  ChevronRight
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
          <div className="bg-white p-6 rounded-lg mt-6">
            <h3 className="text-lg font-medium mb-4 text-[#005670]">Bank Transfer Details</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
          </div>
        );
      
      case 'wire_transfer':
        return (
          <div className="bg-white p-6 rounded-lg mt-6">
            <h3 className="text-lg font-medium mb-4 text-[#005670]">Wire Transfer Details</h3>
            <div className="grid grid-cols-2 gap-4">
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
          <div className="bg-white p-6 rounded-lg mt-6">
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Title and Important Notice */}
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-[#005670] mb-3">Project Details & Payment</h2>
        <p className="text-gray-600">Review your project details and manage payments</p>
      </div>

      {/* Two Column Layout for Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* HDG Concierge Contact Card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#005670] p-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Phone className="h-5 w-5" />
              HDG Concierge
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
              Project Information
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Client Name</p>
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
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-medium">{packageSelected}</p>
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
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                  <p className="text-gray-600">Natural variations in color, grain, or texture of materials</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                  <p className="text-gray-600">Wood expansion and contraction due to environmental changes</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                  <p className="text-gray-600">Fabric and leather wear, colorfastness, dye lot variations, or wrinkling</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 mt-2 rounded-full bg-red-400"></div>
                  <p className="text-gray-600">Softening of filling materials under normal use</p>
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

      {/* Project Timeline */}
      <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
        <div className="bg-[#005670] p-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Project Timeline
          </h3>
        </div>
        <div className="p-6">
          <div className="relative">
            {/* Timeline line - adjusted position */}
            <div className="absolute left-[23px] top-[40px] bottom-8 w-0.5 bg-gray-200" />
            
            <div className="space-y-12">
              {/* Step 1: Engage with Henderson - Completed */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium text-[#005670]">Engage with Henderson</h4>
                  <p className="text-sm text-gray-600">Initial consultation and software introduction</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
              </div>

              {/* Step 2: Register Client - Completed */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium text-[#005670]">Client Registration</h4>
                  <p className="text-sm text-gray-600">Access to design software granted</p>
                  <p className="text-xs text-gray-500 mt-1">Completed</p>
                </div>
              </div>

              {/* Step 3: Design Software - Completed */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium text-[#005670]">Design Selection</h4>
                  <p className="text-sm text-gray-600">Furniture selections finalized and reviewed</p>
                  <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
                </div>
              </div>

              {/* Step 4: Purchasing Agreement - Current/Active */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#005670] text-white shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium text-[#005670]">Purchasing Agreement</h4>
                  <p className="text-sm text-gray-600">Payment schedule and agreement finalization</p>
                  <p className="text-xs text-[#005670] mt-1">In Progress</p>
                </div>
              </div>

              {/* Step 5: Production - Pending */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                  <Building2 className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium">Production Phase</h4>
                  <p className="text-sm text-gray-600">Order placement and manufacturing</p>
                  <p className="text-xs text-gray-500 mt-1">Expected start: Q2 2026</p>
                </div>
              </div>

              {/* Step 6: Progress Payment - Pending */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium">Progress Payment</h4>
                  <p className="text-sm text-gray-600">25% payment due 2 months prior to completion</p>
                  <p className="text-xs text-gray-500 mt-1">To be scheduled</p>
                </div>
              </div>

              {/* Step 7: Delivery & Installation - Pending */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium">Delivery & Installation</h4>
                  <p className="text-sm text-gray-600">6-8 business days for complete installation</p>
                  <p className="text-xs text-gray-500 mt-1">Q3 2026</p>
                </div>
              </div>

              {/* Step 8: Reveal - Pending */}
              <div className="relative flex items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 shrink-0">
                  <Check className="h-6 w-6" />
                </div>
                <div className="ml-4 min-w-0">
                  <h4 className="font-medium">Final Reveal</h4>
                  <p className="text-sm text-gray-600">Unit presentation and care instructions</p>
                  <p className="text-xs text-gray-500 mt-1">To be scheduled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
        <div className="bg-[#005670] p-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Details
          </h3>
        </div>
        <div className="p-6">
          {/* Payment Method Selection */}
          <div className="mb-8">
            <h4 className="text-lg font-medium mb-4">Select Payment Method</h4>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => handleMethodSelect('bank_transfer')}
                className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all hover:border-[#005670] hover:bg-[#005670]/5
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
                className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all hover:border-[#005670] hover:bg-[#005670]/5
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
                className={`p-6 rounded-lg border flex flex-col items-center gap-3 transition-all hover:border-[#005670] hover:bg-[#005670]/5
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

          {/* Render Payment Details based on selected method */}
          {renderPaymentDetails()}

          {/* Payment Schedule */}
          <div className="mt-8">
            <h4 className="text-lg font-medium mb-4">Payment Schedule</h4>
            <div className="space-y-4">
              {paymentDetails?.installments?.map((installment, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">
                        {index === 0 ? `First Payment (50%) - $${(baseBudget * 0.5).toLocaleString()} (Not Including Tax)` :
                         index === 1 ? `Second Payment (25%) - $${(baseBudget * 0.25).toLocaleString()} (Not Including Tax)` :
                         `Final Payment (25%) - $${(baseBudget * 0.25).toLocaleString()} (Not Including Tax)`}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(installment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <PaymentStatusBadge status={installment.status} />
                  </div>

                  {/* File upload and status sections */}
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
                            className="text-[#005670] hover:underline text-sm"
                          >
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upload button */}
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

                  {/* Status messages */}
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
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="bg-[#005670] p-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Order Summary
          </h3>
        </div>
        <div className="p-6">
          {/* Products List */}
          <div className="space-y-4">
            {designSelections?.selectedProducts?.map((product, index) => (
              <div key={index} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                <img
                  src={product.selectedOptions?.image || '/placeholder-image.png'}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium">{product.name}</h4>
                  <p className="text-sm text-gray-600">Location: {product.spotName}</p>
                  {product.selectedOptions && (
                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">
                        {product.selectedOptions.finish && `Finish: ${product.selectedOptions.finish}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.selectedOptions.fabric && `Fabric: ${product.selectedOptions.fabric}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        Quantity: {product.quantity}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Total Price */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Investment</span>
              <span className="text-[#005670]">${baseBudget.toLocaleString()} (Not Including Tax)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;