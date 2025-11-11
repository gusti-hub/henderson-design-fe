import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, FileText, MessageCircle, ArrowRight, X, Send, AlertCircle, ChevronDown } from "lucide-react";
import { backendServer } from '../../utils/info';

const NextStepsPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null); // 'lock-price', 'design-fee', 'questions'
  const [showOutline, setShowOutline] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unitNumber: "",
    phone: "",
    notes: ""
  });

  // Outlines for Lock Pricing and Design Fee
  const outlines = {
    'lock-price': {
      title: 'Deposit to Hold 2025 Pricing',
      sections: [
        {
          heading: 'Purpose',
          content: 'Secure current HDG collection pricing while finalizing design decisions.'
        },
        {
          heading: 'Deposit Amount',
          content: 'Thirty percent (30%) of your selected furnishing package total.'
        },
        {
          heading: 'What This Does',
          bullets: [
            'Locks in 2025 pricing for your chosen collection (Lani, Nalu, or Foundation).',
            "Reserves materials and production allocation in HDG's manufacturing schedule.",
            'Applies in full toward your total furnishing package once you move forward to production.'
          ]
        },
        {
          heading: 'Refund Policy',
          content: 'Refundable less a 10% administrative fee if cancelled before design selections or production scheduling begin (less any design fees incurred). Non-refundable once design selections are approved or production has started.'
        },
        {
          heading: 'Next Step',
          content: 'Once your deposit is received, HDG will confirm your pricing lock and place your project in the design calendar for the 2026 phase.'
        }
      ]
    },
    'design-fee': {
      title: 'Design Fee to Hold Place in Line',
      sections: [
        {
          heading: 'Purpose',
          content: "Guarantee your design start position in HDG's calendar before capacity fills."
        },
        {
          heading: 'Fee Amount',
          content: 'One hundred percent (100%) due upon signing. Fee is non-refundable. (Refer to Design Fee Schedule by unit type and bedroom count.)'
        },
        {
          heading: 'What This Does',
          bullets: [
            'Confirms your reserved design start date.',
            'Includes design intake meeting, floor plan review, furniture layout, material selections, and one revision.',
            'Applies in full as a credit toward your total furnishing package when you proceed to production.'
          ]
        },
        {
          heading: 'Refund Policy',
          content: 'Non-refundable. The full amount is credited toward your total package if you move forward into production.'
        },
        {
          heading: 'Next Step',
          content: 'Once the design fee is received, HDG will issue your confirmation notice and schedule your design intake meeting.'
        }
      ]
    }
  };

  // Agreement documents for Lock Pricing and Design Fee
  const agreements = {
    'lock-price': {
      title: 'Deposit to Hold 2025 Pricing Agreement',
      content: `HENDERSON DESIGN GROUP
DEPOSIT TO HOLD 2025 PRICING AGREEMENT – ĀLIA FURNISHING PROGRAM


1. Purpose
This Agreement outlines the terms under which Henderson Design Group (HDG) will hold 2025 pricing for the Client's selected furnishing package under the Ālia program. The Deposit secures current pricing for the selected HDG collection and establishes preliminary scheduling and resource allocation for future design and production.

2. Deposit and Payment Terms
The Client agrees to pay HDG a deposit equal to thirty percent (30%) of the total selected furnishing package. The 30% deposit is based on the collection typical and unit size. The deposit must be received by December 15, 2025, to guarantee 2025 pricing.

An additional twenty percent (20%) deposit or 50% total of the final design will be due upon final design approval. The remaining fifty percent (50%) or balance will follow the delivery and installation payment schedule provided by HDG.

If the Client later proceeds to the design phase under a separate Design Fee Agreement, this deposit will be applied toward the total package balance.

3. Scope of Agreement
The Deposit to Hold Pricing includes:
- Locking in current pricing for the selected HDG collection (Lani, Nalu, or Foundation).
- Reserving materials and production allocation in the manufacturing schedule.
- Preliminary scheduling in HDG's 2026 design calendar.

This deposit does include or cover design services. Design services are initiated upon receipt of the deposit.

4. Schedule
Upon receipt of this deposit, HDG will reserve pricing and assign a tentative project window within the 2026 design phase. Confirmation of the design start date will occur once the Design Fee Agreement is signed and the design phase is scheduled.

5. Refund and Cancellation Policy
If the Client cancels prior to final design approval, the deposit will be refundable less an administrative fee of ten percent (10%) of the deposit amount and less any Design Services performed.

Once design selections are approved or production scheduling has begun, the deposit becomes non-refundable.

Deposit (Hold 2025 Pricing) not applied toward a signed Design Agreement within six (6) months of this effective date may expire at HDG's discretion.

6. Credit Toward Final Payment
All deposit payments made under this Agreement will be fully credited toward the Client's total furnishing package cost once production is initiated.

7. Ownership of Materials
All drawings, layouts, and specifications provided by HDG remain the property of HDG until full payment of the furnishing package is received. No design or concept materials may be used, shared or reproduced without written consent from HDG.

8. Liability and Limitations
HDG will exercise reasonable professional care in performing all services and communications under this Agreement. The Client acknowledges that schedules, material lead times, and manufacturer timelines may vary. HDG is not responsible for delays caused by third parties, construction progress, force majeure or shipping logistics outside of its control.

9. Governing Law
This Agreement is governed by and shall be construed in accordance with the laws of the State of Hawaii.

10. Acceptance
By signing below, both parties acknowledge and agree to the terms of this Agreement.

UPDATED 10.30.25`
    },
    'design-fee': {
      title: 'Design Fee Agreement',
      content: `HENDERSON DESIGN GROUP
DESIGN FEE AGREEMENT – ĀLIA FURNISHING PROGRAM

1. Purpose

This Agreement outlines the terms under which Henderson Design Group (HDG) will hold 2025 pricing for the Client's selected furnishing package under the Ālia program. The Deposit secures current pricing for the selected HDG collection and establishes preliminary scheduling and resource allocation for future design and production.

2. Deposit and Payment Terms

The Client agrees to pay HDG a deposit equal to thirty percent (30%) of the total selected furnishing package. The 30% deposit is based on the collection typical and unit size. The deposit must be received by December 15, 2025, to guarantee 2025 pricing.

An additional twenty percent (20%) deposit or 50% total of the final design will be due upon final design approval. The remaining fifty percent (50%) or balance will follow the delivery and installation payment schedule provided by HDG.

If the Client later proceeds to the design phase under a separate Design Fee Agreement, this deposit will be applied toward the total package balance.

3. Scope of Agreement

The Deposit to Hold Pricing includes:

Locking in current pricing for the selected HDG collection (Lani, Nalu, or Foundation).

Reserving materials and production allocation in the manufacturing schedule.

Preliminary scheduling in HDG's 2026 design calendar.

UPDATED 10.30.25
This deposit does not include or cover design services. Design services are initiated upon receipt of the deposit.

4. Schedule

Upon receipt of this deposit, HDG will reserve pricing and assign a tentative project window within the 2026 design phase. Confirmation of the design start date will occur once the Design Fee Agreement is signed and the design phase is scheduled.

5. Refund and Cancellation Policy

If the Client cancels prior to final design approval, the deposit will be refundable less an administrative fee of ten percent (10%) of the deposit amount and less any Design Services performed.

Once design selections are approved or production scheduling has begun, the deposit becomes non-refundable.

Deposit (Hold 2025 Pricing) not applied toward a signed Design Agreement within six (6) months of this effective date may expire at HDG's discretion.

6. Credit Toward Final Payment

All deposit payments made under this Agreement will be fully credited toward the Client's total furnishing package cost once production is initiated.

7. Ownership of Materials

All drawings, layouts, and specifications provided by HDG remain the property of HDG until full payment of the furnishing package is received. No design or concept materials may be used, shared, or reproduced without written consent from HDG.

8. Liability and Limitations

HDG will exercise reasonable professional care in performing all services and communications under this Agreement. The Client acknowledges that schedules, material lead times, and manufacturer timelines may vary. HDG is not responsible for delays caused by third parties, construction progress, force majeure, or shipping logistics outside of its control.

9. Governing Law

This Agreement is governed by and shall be construed in accordance with the laws of the State of Hawaii.

10. Acceptance

By signing below, both parties acknowledge and agree to the terms of this Agreement.

Updated 10.30.25`
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.unitNumber) {
      setError("Name, email, and unit number are required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${backendServer}/api/next-steps/submit-option`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          selectedOption: selectedOption
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        setError(data.message || "Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError("Failed to submit. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    // Show outline for lock-price and design-fee, skip for questions
    if (option === 'lock-price' || option === 'design-fee') {
      setShowOutline(true);
      setShowAgreement(false);
    }
  };

  const handleContinueToForm = () => {
    setShowOutline(false);
    setShowAgreement(false);
    // Form will show because selectedOption is set and showOutline/showAgreement are false
  };

  const optionTitles = {
    'lock-price': 'Lock 2025 Pricing',
    'design-fee': 'Design Hold Fee',
    'questions': 'Schedule Consultation'
  };

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6">
            Request Submitted Successfully!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Thank you for your submission. Our team will contact you shortly with next steps and additional information.
          </p>
          
        </div>
      </div>
    );
  }

  // Agreement Modal (only shown when user clicks "View Agreement")
  if (showAgreement && (selectedOption === 'lock-price' || selectedOption === 'design-fee')) {
    const agreement = agreements[selectedOption];
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b-2 border-[#005670]/10 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{agreement.title}</h3>
                <p className="text-sm text-gray-500 font-semibold">Full Agreement Terms & Conditions</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAgreement(false)}
              className="w-12 h-12 rounded-full border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 flex items-center justify-center transition-all duration-300 active:scale-95"
            >
              <X className="w-6 h-6 text-[#005670]" />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="p-8 max-h-[60vh] overflow-y-auto text-gray-800 leading-relaxed">
            <div className="whitespace-pre-line text-base">
              {agreement.content.split('\n\n').map((block, i) => (
                <p key={i} className="mb-5">
                  {block}
                </p>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t-2 border-[#005670]/10 bg-gradient-to-r from-gray-50 to-white">
            <button
              onClick={() => setShowAgreement(false)}
              className="w-full px-8 py-4 text-lg font-bold bg-[#005670] text-white rounded-xl hover:bg-[#004150] transition-all duration-300 active:scale-95"
            >
              Close Agreement
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Outline screen (shown after selecting lock-price or design-fee)
  if (showOutline && (selectedOption === 'lock-price' || selectedOption === 'design-fee')) {
    const outline = outlines[selectedOption];
    
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">{optionTitles[selectedOption]}</p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">
              {outline.title}
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Review the key details below before proceeding to schedule your consultation.
            </p>
            <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Outline Content */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-10 mb-8">
            {outline.sections.map((section, index) => (
              <div key={index} className={`${index !== outline.sections.length - 1 ? 'mb-8 pb-8 border-b-2 border-gray-100' : 'mb-0'}`}>
                <h3 className="text-2xl font-bold text-[#005670] mb-4">{section.heading}</h3>
                
                {section.content && (
                  <p className="text-lg text-gray-700 leading-relaxed">{section.content}</p>
                )}
                
                {section.bullets && (
                  <ul className="space-y-3">
                    {section.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#005670] mt-2.5 flex-shrink-0"></div>
                        <span className="text-lg text-gray-700 leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* View Agreement Button (Optional) */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-8 mb-8">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#005670] mb-2">Full Agreement Terms</h3>
                <p className="text-gray-600">View the complete legal agreement</p>
              </div>
              <button
                onClick={() => setShowAgreement(true)}
                className="px-8 py-4 text-lg font-bold border-2 border-[#005670] text-[#005670] rounded-xl hover:bg-[#005670]/5 transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                View Agreement
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-5">
            <button
              onClick={() => {
                setSelectedOption(null);
                setShowOutline(false);
                setShowAgreement(false);
              }}
              className="px-8 py-4 text-lg font-bold border-2 border-[#005670]/20 text-[#005670] rounded-xl hover:border-[#005670] hover:bg-[#005670]/5 transition-all duration-300 active:scale-95"
            >
              Back
            </button>
            
            <button
              onClick={handleContinueToForm}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-10 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Continue to Schedule</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form screen (when option is selected and outline/agreement are not shown)
  if (selectedOption && !showOutline && !showAgreement) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">{optionTitles[selectedOption]}</p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">
              Schedule Your Consultation
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Please provide your contact information and our team will reach out to you shortly to discuss the next steps.
            </p>
            <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-10">
            {/* Error message */}
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-base text-red-800">{error}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h2 className="text-2xl font-bold text-[#005670]">
                  Contact Information
                </h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition"
                    placeholder="your.email@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={formData.unitNumber}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition"
                    placeholder="e.g., 101"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-10">
              <label className="block text-base font-bold text-gray-700 mb-3">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                rows="5"
                className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#005670]/20 focus:border-[#005670] transition resize-none"
                placeholder="Any specific questions or requirements..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => {
                  if (selectedOption === 'lock-price' || selectedOption === 'design-fee') {
                    setShowOutline(true);
                  } else {
                    setSelectedOption(null);
                  }
                  setFormData({
                    name: "",
                    email: "",
                    unitNumber: "",
                    phone: "",
                    notes: ""
                  });
                }}
                className="px-8 py-4 text-lg font-bold border-2 border-[#005670]/20 text-[#005670] rounded-xl hover:border-[#005670] hover:bg-[#005670]/5 transition-all duration-300 active:scale-95"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-10 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Submit Request</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Main page with 3 options
  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Page hero */}
      <div className="max-w-6xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">Next Steps</p>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">Choose Your Path Forward</h1>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Select the option that best suits your needs. Our team will contact you to discuss the next steps.
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Three options */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-stretch">

        {/* Option 1: Lock 2025 Pricing */}
        <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#005670]/10 flex flex-col hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] mb-6 mx-auto">
            <Lock className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 text-center">Lock 2025 Pricing</h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed flex-grow text-center">
            Secure current pricing with a 30% deposit. Protect yourself from price increases and reserve your materials.
          </p>

          <button
            onClick={() => handleOptionClick('lock-price')}
            className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-8 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            <span>Select This Option</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Option 2: Design Hold Fee */}
        <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#005670]/10 flex flex-col hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] mb-6 mx-auto">
            <FileText className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 text-center">Design Hold Fee</h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed flex-grow text-center">
            Reserve your design start date with full design services included. 100% credited toward your final package.
          </p>

          <button
            onClick={() => handleOptionClick('design-fee')}
            className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-8 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            <span>Select This Option</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Option 3: Still Have Questions */}
        <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#005670]/10 flex flex-col hover:shadow-2xl transition-all duration-300 hover:scale-105">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] mb-6 mx-auto">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 text-center">Still Have Questions?</h2>
          <p className="text-gray-600 text-lg mb-6 leading-relaxed flex-grow text-center">
            Not sure which option is right for you? Schedule a consultation with our team to discuss your specific needs.
          </p>

          <button
            onClick={() => handleOptionClick('questions')}
            className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-8 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95"
          >
            <span>Schedule Consultation</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NextStepsPage;