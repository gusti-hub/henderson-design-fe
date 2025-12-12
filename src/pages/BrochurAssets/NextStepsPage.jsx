import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Lock, FileText, MessageCircle, ArrowRight, X, Send, AlertCircle, LogIn, Eye } from "lucide-react";
import SchedulingComponent from "../../components/scheduling/SchedulingComponent";

const NextStepsPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [showOutline, setShowOutline] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);
  const [currentAgreementIndex, setCurrentAgreementIndex] = useState(0);
  const [showScheduling, setShowScheduling] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unitNumber: "",
    phone: "",
    notes: ""
  });

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
          content: 'One hundred percent (100%) due upon signing. Fee is non-refundable.',
          priceTable: [
            { collection: 'Nalu Foundation Collection', bedrooms: { '1': '$2,500', '2': '$3,500', '3': '$4,500' } },
            { collection: 'Nalu Collection', bedrooms: { '1': '$5,000', '2': '$7,500', '3': '$10,000' } },
            { collection: 'Lani', bedrooms: { '1': '$10,000', '2': '$15,000', '3': '$20,000' } }
          ]
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

  const agreements = {
    'lock-price': [
      {
        title: 'Deposit to Hold 2025 Pricing Agreement',
        content: `HENDERSON DESIGN GROUP
DEPOSIT TO HOLD 2025 PRICING AGREEMENT – ĀLIA FURNISHING PROGRAM

Effective Date: __________________________
Client Name: ____________________________
Unit / Residence: _________________________

1. Purpose

This Agreement outlines the terms under which Henderson Design Group ("HDG") will hold 2025 pricing for the Client's selected furnishing package under the Ālia program.

The deposit secures current pricing for the selected HDG collection and establishes preliminary scheduling and resource allocation for future design and production.

2. Deposit and Payment Terms

The Client agrees to pay HDG a deposit equal to thirty percent (30%) of the total selected furnishing package based on the chosen Collection (Lani, Nalu, Foundation) and Unit size (1-bedroom, 2-bedroom, or 3-bedroom).

The deposit must be received by December 15, 2025, to guarantee 2025 pricing.

Upon final design and budget approval, the Client shall make an additional payment, bringing the total payment to fifty percent (50%) of the final design budget price. The initial 30% deposit will be credited towards this fifty percent (50%) payment, as per the mutually agreed design budget. The remaining fifty percent (50%) balance will follow the delivery and installation payment schedule provided by HDG.

3. Scope of Agreement

The Deposit to Hold Pricing includes:
• Locking in current pricing for the selected HDG collection (Lani, Nalu, or Foundation).
• Reserving materials and production allocation in the manufacturing schedule.
• Preliminary placement within HDG's 2026 design calendar.

4. Schedule

Upon receipt of the deposit, HDG will reserve pricing and assign a tentative project window within the 2026 design phase.

A confirmed design start date will be issued once the Design Agreement is signed (and funded) and the design phase is officially scheduled.

5. Refund and Cancellation Policy

If the Client cancels prior to design approval, the deposit will be refundable less a ten percent (10%) administrative fee.

Once design selections are approved or production scheduling has begun, the deposit becomes non-refundable.

Deposits not applied toward a signed Proposal within twelve (12) months of the Effective Date may expire at HDG's discretion.

6. Credit Toward Final Payment

All deposit payments made under this Agreement will be fully credited toward the Client's total furnishing package cost once production is initiated.

7. Ownership of Materials

All drawings, layouts, and specifications provided by HDG remain the exclusive property of HDG until the furnishing package is paid in full. No design or concept materials may be used, shared, or reproduced without written consent from HDG.

8. Liability and Limitations

HDG will exercise reasonable professional care in performing all services under this Agreement. The Client acknowledges that schedules, material lead times, and manufacturer timelines may vary. HDG is not responsible for delays caused by third parties, construction progress, building access, or shipping logistics outside its control.

9. Governing Law

This Agreement shall be governed by the laws of the State of Hawaii.

10. Acceptance

By signing below, both parties acknowledge and agree to the terms of this Agreement.

Client Signature: ________________________________   Date: ____________
Printed Name: __________________________________

Henderson Design Group Representative: __________________________   Date: ____________
Printed Name: __________________________________

Exhibit A – Deposit Summary
Deposit Amount: $________________________
Collection Type: __________________________
Payment Method: _________________________
Date Received: __________________________

Exhibit B – Deliverables
Pricing lock, materials allocation, and production scheduling for the selected HDG furnishing collection.

Exhibit C – Schedule
Deposit Received: ________________________
Design Start Window: ______________________
Estimated Production Window: _____________`
      },
      {
        title: 'Design Agreement – Lock In',
        content: `HENDERSON DESIGN GROUP
DESIGN AGREEMENT – ĀLIA FURNISHING PROGRAM

Effective Date: __________________________
Client Name: ____________________________
Unit / Residence: _________________________

1. Purpose

The Client has already secured 2025 pricing and a design-calendar position through the previously executed Deposit to Hold Pricing Agreement.

This Design Agreement authorizes Henderson Design Group ("HDG") to begin the design phase for the Client's residence and outlines the scope, process, and payment terms for the design work.

2. Design Fee and Payment Terms

The Client agrees to pay HDG a non-refundable design fee, due in full at signing. This fee covers all design services outlined in Section 3.

[PRICING_TABLE]
Collection | 1 Bedroom | 2 Bedroom | 3 Bedroom
Nalu Foundation Collection | $2,500 | $3,500 | $4,500
Nalu Collection | $5,000 | $7,500 | $10,000
Lani | $10,000 | $15,000 | $20,000
[/PRICING_TABLE]

Payment is required before HDG begins design preparation, assigns design resources, or sets confirmed meeting dates.

If the Client proceeds to production, 100% of the design fee will be credited toward the total furnishing package price. This credit remains valid for six (6) months from the final design presentation date.

3. Scope of Services

The Design Fee includes:
• Design intake meeting
• Review of floor plan and unit layout
• Furniture layout and package selection (Lani, Nalu, or Foundation)
• Material, fabric, and finish selections
• One round of revisions
• A final design presentation and furnishing proposal for approval

Additional revisions, custom designs, add-on sourcing, or in-person consultations may be billed separately at HDG's standard hourly rates.

4. Schedule

Because the Client has already secured a place in HDG's 2026 design calendar, HDG will now assign a confirmed design start date upon execution of this Agreement and receipt of payment.

A Project Manager will be assigned as the Client's primary point of contact. Intake meeting and presentation dates will be scheduled according to HDG's 2026 design calendar.

5. Credit Toward Production

If the Client approves the design proposal, the full design fee will be applied as a credit toward the total furnishing package cost.

If the Client does not approve the design proposal within six (6) months of design, the credit expires.

6. Cancellation and Refunds

The design fee is non-refundable. If the Client chooses not to proceed after design begins, HDG may, at its discretion, apply the fee toward future design services for the same property.

7. Ownership of Design Materials

All drawings, layouts, specifications, and renderings remain the exclusive property of HDG until the furnishing package is paid in full.

The Client may not reuse, reproduce, or implement the design without HDG's written approval.

8. Liability and Limitations

HDG will exercise reasonable care in performing all services.

9. Governing Law

This Agreement is governed by the laws of the State of Hawaii.

10. Acceptance

Client Signature: ____________________________   Date: ____________
Printed Name: ______________________________

HDG Representative: ___________________________   Date: ____________
Printed Name: ______________________________

Exhibit A – Design Fee Summary
Design Fee Amount: $________________________
Package Type: _____________________________
Payment Method: ___________________________
Date Received: _____________________________

Exhibit B – Deliverables
Design intake, layout development, material/finish selections, one revision, and final design presentation.

Exhibit C – Schedule
Confirmed Design Start: _______________________
Estimated Completion: ________________________`
      }
    ],
    'design-fee': {
      title: 'Design Agreement – Hold',
      content: `HENDERSON DESIGN GROUP
DESIGN AGREEMENT – ĀLIA FURNISHING PROGRAM

Effective Date: __________________________
Client Name: ____________________________
Unit / Residence: _________________________

1. Purpose

This Agreement authorizes Henderson Design Group ("HDG") to provide design services for the Client's Ālia residence and reserves the Client's place in HDG's upcoming design calendar.

Execution of this Agreement secures design capacity and scheduling priority for 2026.

2. Design Fee and Payment Terms

The Client agrees to pay HDG a non-refundable design fee, due in full at signing.

Payment is required before HDG confirms a design start date, allocates design resources, or schedules intake and presentation meetings.

If the Client proceeds to production, 100% of the design fee will be credited toward the total furnishing package price. This credit is valid for six (6) months from the date of final design presentation.

3. Scope of Services

The Design Fee includes:
• Design intake meeting
• Review of floor plan and unit layout
• Furniture layout and collection recommendations
• Material, fabric, and finish selections
• One round of revisions
• A final design presentation and furnishing proposal for approval

Additional revisions, custom designs, add-on sourcing, or in-person consultations may be billed separately at HDG's standard hourly rates.

4. Schedule

Upon receipt of the design fee, HDG will assign a design start position within the upcoming 2026 design phase.

A Project Manager will be assigned as the Client's point of contact. Intake and presentation dates will be provided based on HDG's scheduling availability.

5. Credit Toward Production

The design fee will be credited in full toward the Client's total furnishing package should the Client approve the proposal within six (6) months of final design presentation.

6. Cancellation and Refunds

The design fee is non-refundable. If the Client withdraws after design begins, HDG may, but is not obligated to, apply a portion of the fee to future design work for the same property.

7. Ownership of Design Materials

All drawings, layouts, specifications, and renderings remain the exclusive property of HDG until the furnishing package is paid in full.

Design work cannot be reproduced, shared, or implemented without HDG's written approval.

8. Liability and Limitations

HDG will exercise reasonable care in performing all services.

9. Governing Law

This Agreement is governed by the laws of the State of Hawaii.

10. Acceptance

Client Signature: ____________________________   Date: ____________
Printed Name: ______________________________

HDG Representative: ___________________________   Date: ____________
Printed Name: ______________________________

Exhibit A – Design Fee Summary
Design Fee Amount: $________________________
Package Type: _____________________________
Payment Method: ___________________________
Date Received: _____________________________

Exhibit B – Deliverables
Design intake, layout development, material/finish selections, one revision, final proposal presentation.

Exhibit C – Schedule
Reserved Design Start: _______________________
Estimated Completion: _______________________`
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

    if (!selectedOption) {
      setError("Please select a next step option first");
      return false;
    }

    return true;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowScheduling(true);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setError("");

    if (option === 'lock-price' || option === 'design-fee') {
      setShowOutline(true);
      setShowAgreement(false);
      setCurrentAgreementIndex(0);
    } else {
      setShowOutline(false);
      setShowAgreement(false);
    }
  };

  const handleContinueToForm = () => {
    setShowOutline(false);
    setShowAgreement(false);
  };

  const handleSchedulingSuccess = (appointmentData) => {
    setSuccess(true);
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  const optionTitles = {
    'lock-price': 'Lock 2025 Pricing',
    'design-fee': 'Design Hold Fee',
    'questions': 'Schedule Consultation'
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-8">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6">
            All Set!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your appointment has been confirmed and we'll see you soon. Check your email for confirmation details.
          </p>
        </div>
      </div>
    );
  }

  if (showScheduling && !success) {
    return (
      <SchedulingComponent
        formData={formData}
        selectedOption={selectedOption}
        onBack={() => setShowScheduling(false)}
        onSuccess={handleSchedulingSuccess}
      />
    );
  }

  if (showAgreement && (selectedOption === 'lock-price' || selectedOption === 'design-fee')) {
    const agreementData = selectedOption === 'lock-price' 
      ? agreements[selectedOption][currentAgreementIndex]
      : agreements[selectedOption];
    
    const isLockPriceOption = selectedOption === 'lock-price';
    const totalAgreements = isLockPriceOption ? agreements[selectedOption].length : 1;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b-2 border-gray-200 bg-gradient-to-r from-[#005670]/5 to-white flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center shadow-lg">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{agreementData.title}</h3>
                <p className="text-sm text-gray-600 font-semibold tracking-wide">
                  {isLockPriceOption && `AGREEMENT ${currentAgreementIndex + 1} OF ${totalAgreements} • `}
                  FULL AGREEMENT TERMS & CONDITIONS
                </p>
              </div>
            </div>
            <button 
              onClick={() => {
                setShowAgreement(false);
                setCurrentAgreementIndex(0);
              }}
              className="w-12 h-12 rounded-full border-2 border-gray-300 hover:border-[#005670] hover:bg-[#005670]/5 flex items-center justify-center transition-all duration-300 active:scale-95 flex-shrink-0"
            >
              <X className="w-6 h-6 text-gray-600 hover:text-[#005670]" />
            </button>
          </div>

          {/* Content Area with improved typography */}
          <div className="p-10 overflow-y-auto flex-grow bg-gray-50" style={{ scrollbarWidth: 'thin' }}>
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-12 border border-gray-200">
              {(() => {
                const lines = agreementData.content.split('\n');
                const result = [];
                let i = 0;
                
                while (i < lines.length) {
                  const line = lines[i];
                  const trimmedLine = line.trim();
                  
                  // Skip empty lines
                  if (!trimmedLine) {
                    result.push(<div key={i} className="h-4"></div>);
                    i++;
                    continue;
                  }
                  
                  // Check if this is the start of pricing table
                  if (trimmedLine === '[PRICING_TABLE]') {
                    // Collect all table rows
                    const tableRows = [];
                    i++; // Skip the marker
                    
                    while (i < lines.length && lines[i].trim() !== '[/PRICING_TABLE]') {
                      const tableLine = lines[i].trim();
                      if (tableLine && tableLine.includes('|')) {
                        tableRows.push(tableLine);
                      }
                      i++;
                    }
                    
                    // Render the complete table
                    if (tableRows.length > 0) {
                      const headerCells = tableRows[0].split('|').map(cell => cell.trim());
                      const dataRows = tableRows.slice(1).map(row => row.split('|').map(cell => cell.trim()));
                      
                      result.push(
                        <div key={`table-${i}`} className="my-6">
                          <table className="w-full border-2 border-gray-300">
                            <thead>
                              <tr className="bg-gray-100 border-b-2 border-gray-300">
                                {headerCells.map((cell, idx) => (
                                  <th key={idx} className={`${idx !== headerCells.length - 1 ? 'border-r-2 border-gray-300' : ''} px-4 py-3 text-center text-gray-900 font-bold text-sm`}>
                                    {cell}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {dataRows.map((row, rowIdx) => (
                                <tr key={rowIdx} className={`border-b border-gray-300 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className={`${cellIdx !== row.length - 1 ? 'border-r-2 border-gray-300' : ''} px-4 py-3 ${cellIdx === 0 ? 'font-bold' : 'text-center'} text-gray-800 text-sm`}>
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    }
                    
                    i++; // Skip the closing marker
                    continue;
                  }
                  
                  // Check if this is a main title (contains HENDERSON DESIGN GROUP or main agreement title)
                  const isMainTitle = trimmedLine.includes('HENDERSON DESIGN GROUP') || 
                                     (trimmedLine.includes('AGREEMENT') && trimmedLine.includes('ĀLIA')) ||
                                     (trimmedLine.includes('VERSION') && trimmedLine.includes('—'));
                  
                  // Check if this is specifically "HENDERSON DESIGN GROUP" text that should be replaced with logo
                  const isHDGTitle = trimmedLine === 'HENDERSON DESIGN GROUP';
                  
                  // Check if this is a numbered heading (1. Purpose, 2. Deposit, etc)
                  const isNumberedHeading = /^\d+\.\s+[A-Z]/.test(trimmedLine);
                  
                  // Check if this is a field line (Effective Date:, Client Name:, etc)
                  const isFieldLine = /^(Effective Date|Client Name|Unit|Residence|Collection Type|Payment Method|Date Received|Deposit Amount|Package Type|Design Fee Amount|Confirmed Design Start|Estimated|Reserved Design Start|Deposit Received|Design Start Window|Production Window)/.test(trimmedLine);
                  
                  // Check if this is a bullet point
                  const isBullet = trimmedLine.startsWith('•');
                  
                  // Check if this is a signature line
                  const isSignatureLine = trimmedLine.includes('Signature:') || 
                                         trimmedLine.includes('Printed Name:') ||
                                         trimmedLine.includes('Representative:');
                  
                  // Check if this is an Exhibit heading
                  const isExhibitHeading = /^Exhibit [A-C]/.test(trimmedLine);
                  
                  if (isHDGTitle) {
                    result.push(
                      <div key={i} className="mb-6 text-center py-4">
                        <img
                          src="/images/HDG-Logo.png"
                          alt="Henderson Design Group"
                          className="h-12 w-auto object-contain mx-auto"
                          style={{
                            filter: 'brightness(0) saturate(100%) invert(23%) sepia(89%) saturate(1289%) hue-rotate(163deg) brightness(92%) contrast(101%)'
                          }}
                        />
                      </div>
                    );
                  } else if (isMainTitle) {
                    result.push(
                      <div key={i} className="mb-8 text-center py-4">
                        <h2 className="text-xl font-bold text-[#005670] leading-relaxed uppercase tracking-wide">
                          {trimmedLine}
                        </h2>
                      </div>
                    );
                  } else if (isNumberedHeading) {
                    result.push(
                      <div key={i} className="mt-10 mb-5">
                        <h3 className="text-lg font-bold text-[#005670] leading-relaxed pb-2 border-b-2 border-[#005670]/30">
                          {trimmedLine}
                        </h3>
                      </div>
                    );
                  } else if (isExhibitHeading) {
                    result.push(
                      <div key={i} className="mt-10 mb-4 pt-6 border-t-2 border-gray-300">
                        <h3 className="text-lg font-bold text-[#005670] leading-relaxed">
                          {trimmedLine}
                        </h3>
                      </div>
                    );
                  } else if (isFieldLine) {
                    result.push(
                      <div key={i} className="mb-3 font-mono text-sm">
                        <p className="text-gray-700 leading-relaxed">
                          {trimmedLine}
                        </p>
                      </div>
                    );
                  } else if (isBullet) {
                    result.push(
                      <div key={i} className="flex items-start gap-3 mb-3 ml-4">
                        <span className="text-[#005670] font-bold mt-1">•</span>
                        <p className="text-gray-700 leading-relaxed flex-1">
                          {trimmedLine.substring(1).trim()}
                        </p>
                      </div>
                    );
                  } else if (isSignatureLine) {
                    result.push(
                      <div key={i} className="mb-3 mt-8">
                        <p className="text-gray-700 leading-relaxed font-mono text-sm">
                          {trimmedLine}
                        </p>
                      </div>
                    );
                  } else {
                    // Regular paragraph
                    result.push(
                      <p key={i} className="mb-4 text-gray-700 leading-relaxed text-justify">
                        {trimmedLine}
                      </p>
                    );
                  }
                  
                  i++;
                }
                
                return result;
              })()}
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
            <div className="flex items-center justify-between gap-6 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <AlertCircle className="w-5 h-5 text-[#005670]" />
                <span>Please read all terms carefully before proceeding</span>
              </div>
              
              <div className="flex gap-4">
                {isLockPriceOption && currentAgreementIndex === 0 && (
                  <button
                    onClick={() => setCurrentAgreementIndex(1)}
                    className="px-8 py-4 text-lg font-bold bg-[#005670] text-white rounded-xl hover:bg-[#004150] transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    Next Agreement →
                  </button>
                )}
                
                {isLockPriceOption && currentAgreementIndex === 1 && (
                  <button
                    onClick={() => setCurrentAgreementIndex(0)}
                    className="px-8 py-4 text-lg font-bold border-2 border-[#005670] text-[#005670] rounded-xl hover:bg-[#005670]/5 transition-all duration-300 active:scale-95 whitespace-nowrap"
                  >
                    ← Previous Agreement
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setShowAgreement(false);
                    setCurrentAgreementIndex(0);
                  }}
                  className="px-8 py-4 text-lg font-bold bg-[#005670] text-white rounded-xl hover:bg-[#004150] transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Close Agreement
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showOutline && (selectedOption === 'lock-price' || selectedOption === 'design-fee')) {
    const outline = outlines[selectedOption];
    
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">{optionTitles[selectedOption]}</p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">
              {outline.title}
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Review the key details below before proceeding to scheduling your consultation.
            </p>
            <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-10 mb-8">
            {outline.sections.map((section, index) => (
              <div key={index} className={`${index !== outline.sections.length - 1 ? 'mb-8 pb-8 border-b-2 border-gray-100' : 'mb-0'}`}>
                <h3 className="text-2xl font-bold text-[#005670] mb-4">{section.heading}</h3>
                
                {section.content && (
                  <p className="text-lg text-gray-700 leading-relaxed mb-4">{section.content}</p>
                )}
                
                {/* Price Table for Design Fee */}
                {section.priceTable && (
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full border-2 border-gray-300">
                      <thead>
                        <tr className="bg-gray-100 border-b-2 border-gray-300">
                          <th className="border-r-2 border-gray-300 px-6 py-4 text-center text-gray-900 font-bold text-base">Collection</th>
                          <th className="border-r-2 border-gray-300 px-6 py-4 text-center text-gray-900 font-bold text-base">1 Bedroom</th>
                          <th className="border-r-2 border-gray-300 px-6 py-4 text-center text-gray-900 font-bold text-base">2 Bedroom</th>
                          <th className="px-6 py-4 text-center text-gray-900 font-bold text-base">3 Bedroom</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.priceTable.map((row, i) => (
                          <tr key={i} className={`border-b-2 border-gray-300 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                            <td className="border-r-2 border-gray-300 px-6 py-4 font-bold text-gray-900">{row.collection}</td>
                            <td className="border-r-2 border-gray-300 px-6 py-4 text-center text-gray-800">{row.bedrooms['1']}</td>
                            <td className="border-r-2 border-gray-300 px-6 py-4 text-center text-gray-800">{row.bedrooms['2']}</td>
                            <td className="px-6 py-4 text-center text-gray-800">{row.bedrooms['3']}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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

          <div className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-8 mb-8">
            <div className="flex items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-[#005670] mb-2">Full Agreement Terms</h3>
                <p className="text-gray-600">
                  {selectedOption === 'lock-price' 
                    ? 'View the complete legal agreements (2 documents)'
                    : 'View the complete legal agreement'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAgreement(true);
                  setCurrentAgreementIndex(0);
                }}
                className="px-8 py-4 text-lg font-bold border-2 border-[#005670] text-[#005670] rounded-xl hover:bg-[#005670]/5 transition-all duration-300 active:scale-95 whitespace-nowrap"
              >
                View Agreement{selectedOption === 'lock-price' ? 's' : ''}
              </button>
            </div>
          </div>

          <div className="flex gap-5">
            <button
              onClick={() => {
                setSelectedOption(null);
                setShowOutline(false);
                setShowAgreement(false);
                setCurrentAgreementIndex(0);
              }}
              className="px-8 py-4 text-lg font-bold border-2 border-[#005670]/20 text-[#005670] rounded-xl hover:border-[#005670] hover:bg-[#005670]/5 transition-all duration-300 active:scale-95"
            >
              Back
            </button>
            
            <button
              onClick={handleContinueToForm}
              className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-10 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Continue to Contact Form</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (selectedOption && !showOutline && !showAgreement) {
    return (
      <div className="min-h-screen pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">{optionTitles[selectedOption]}</p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">
              Contact Information
            </h1>
            <p className="text-xl text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Please provide your contact information to proceed with scheduling your consultation.
            </p>
            <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
          </div>

          <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 p-10">
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-base text-red-800">{error}</p>
              </div>
            )}

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

            <div className="flex gap-5">
              <button
                type="button"
                onClick={() => {
                  if (selectedOption === 'lock-price' || selectedOption === 'design-fee') {
                    setShowOutline(true);
                  } else {
                    setSelectedOption(null);
                  }
                }}
                className="px-8 py-4 text-lg font-bold border-2 border-[#005670]/20 text-[#005670] rounded-xl hover:border-[#005670] hover:bg-[#005670]/5 transition-all duration-300 active:scale-95"
              >
                Back
              </button>
              
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#005670] to-[#007a9a] text-white px-10 py-4 text-lg font-bold rounded-xl hover:from-[#004150] hover:to-[#005670] transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
                <span>Continue to Scheduling</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
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

      {/* ✅ Client Portal Access Notice */}
      <div className="max-w-4xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Already Completed Your Payment?</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                If you've already made your down payment and completed your consultation, you can access your client portal to track your project progress and view all the details of your journey with us.
              </p>
              <button
                onClick={() => navigate('/portal-login')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#005670] text-white rounded-xl hover:opacity-90 transition-all font-bold shadow-lg"
              >
                <LogIn className="w-5 h-5" />
                <span>Access Client Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 items-stretch">
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