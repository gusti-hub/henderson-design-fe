import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FileText, ArrowRight, X, ChevronLeft, ChevronRight, Calendar, Clock, Video, Users, Send, AlertCircle } from "lucide-react";
import { backendServer } from '../../utils/info';

const NextStepsPage = () => {
  const navigate = useNavigate();
  const [showDocuments, setShowDocuments] = useState(false);
  const [currentDocIndex, setCurrentDocIndex] = useState(0);
  const [acknowledgedDocs, setAcknowledgedDocs] = useState({
    understandingOptions: false,
    designFee: false,
    depositPricing: false
  });

  // Meeting scheduler state
  const [showMeetingScheduler, setShowMeetingScheduler] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    unitNumber: "",
    preferredDate: "",
    preferredTime: "",
    alternateDate: "",
    alternateTime: "",
    meetingType: "in-person",
    notes: ""
  });

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM"
  ];

  // Three document contents from the uploaded PDFs
  const documents = [
    {
      id: 'understandingOptions',
      title: 'Understanding Your Deposit Options',
      content: `HENDERSON DESIGN GROUP
ĀLIA FURNISHING PROGRAM – UNDERSTANDING YOUR DEPOSIT OPTIONS

Purpose

This summary explains the two ways clients can move forward with Henderson Design Group for their Ālia residence. Each option secures your place in the HDG design and production schedule in a different way.

OPTION 1 – DEPOSIT TO HOLD 2025 PRICING

Purpose
Secure current HDG collection pricing while you finalize your design decisions.

Deposit Amount
Thirty percent (30%) of your selected furnishing package total.

What This Does
• Locks in 2025 pricing for your chosen collection (Lani, Nalu, or Foundation).
• Reserves materials and production allocation in HDG's manufacturing schedule.
• Applies in full toward your total furnishing package once you move forward to design and production.

Refund Policy
Refundable less a 10% administrative fee if cancelled before design selections or production scheduling begin. Less any design fees incurred.

Non-refundable once design selections are approved or production scheduling has started.

Next Step
Once your deposit is received, HDG will confirm your pricing lock and place your project in the design calendar for the 2026 design phase.

OPTION 2 – DESIGN FEE TO HOLD PLACE IN LINE

Purpose
Guarantee your design start position in HDG's calendar before capacity fills.

Fee Amount
One hundred percent (100%) due upon signing. Fee is non-refundable.
(Refer to Design Fee Schedule by unit type and bedroom count.)

What This Does
• Confirms your reserved design start date.
• Includes design intake meeting, floor plan review, furniture layout, material selections, and one revision.
• Applies in full as a credit toward your total furnishing package when you proceed to production.

Refund Policy
Non-refundable. The full amount is credited toward your total package if you move forward into production.

Next Step
Once the design fee is received, HDG will issue your confirmation notice and schedule your design intake meeting.

Questions
Your HDG project manager can assist you in choosing the best path based on your goals, unit type, and timeline.

UPDATED 10.30.25`
    },
    {
      id: 'designFee',
      title: 'Design Fee Agreement',
      content: `HENDERSON DESIGN GROUP
DESIGN FEE AGREEMENT – ĀLIA FURNISHING PROGRAM

1. Purpose
This Agreement outlines the terms under which Henderson Design Group (HDG) will provide design services to reserve the Client's place in HDG's design calendar for the Ālia furnishing program. The Design Fee guarantees design capacity, secures scheduling priority, and covers the preparation and delivery of design materials for the Client's residence.

2. Design Fee and Payment Terms
The Client agrees to pay HDG a non-refundable design fee, due 100% upfront at signing, according to the unit type selected.

(Insert fee schedule by unit type and bedroom count here.)

Payment is required before HDG confirms a design start date or begins design preparation. The fee is applied in full as a credit toward the Client's total furnishing package if the Client proceeds to production within six (6) months of design completion.

3. Scope of Services
The Design Fee includes:
• Design intake meeting and review of floor plan or unit layout.
• Furniture layout and collection recommendations.
• Material and finish selections for the chosen package.
• Design Presentation #1
• One round of revisions to the layout and selections.
• Preparation of a final design presentation and furnishing proposal for approval
• Design Presentation #2

Additional revisions, custom sourcing, or on-site consultations beyond this scope may be billed separately at HDG's standard hourly rates.

4. Schedule
Upon receipt of payment, HDG will assign the Client a confirmed design start position within the upcoming design phase (estimated Q1 2026). A Project Manager will be assigned as the Client's primary point of contact, and a preliminary calendar will be provided showing intake and presentation dates.

5. Credit Toward Production
If the Client proceeds to production, 100% of the Design Fee will be credited toward the total furnishing package cost. If the Client does not proceed to production within six (6) months of design completion, this credit expires.

6. Cancellation and Refunds
The Design Fee is non-refundable. If the Client chooses not to proceed after the design phase has begun, the payment remains non-refundable but may, at HDG's discretion, be applied toward future design services within the same property if capacity allows.

7. Ownership of Design Materials
All drawings, layouts, renderings, and specifications remain the intellectual property of Henderson Design Group until full payment of the furnishing package is received. The Client may not reproduce, share or implement any portion of the design without HDG's written consent.

8. Liability and Limitations
HDG will exercise reasonable professional care in performing all services. The Client acknowledges that schedules, material lead times, and vendor availability may vary. HDG is not responsible for delays caused by third parties, construction progress, force majeure or shipping logistics outside its control.

9. Governing Law
This Agreement is governed by and shall be construed in accordance with the laws of the State of Hawaii.

10. Acceptance
By signing below, both parties acknowledge and agree to the terms of this Agreement.


Updated 10.30.25`
    },
    {
      id: 'depositPricing',
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
• Locking in current pricing for the selected HDG collection (Lani, Nalu, or Foundation).
• Reserving materials and production allocation in the manufacturing schedule.
• Preliminary scheduling in HDG's 2026 design calendar.

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
    }
  ];

  const openDocuments = () => {
    setShowDocuments(true);
    setCurrentDocIndex(0);
  };

  const closeDocuments = () => {
    setShowDocuments(false);
    setCurrentDocIndex(0);
  };

  const nextDocument = () => {
    if (currentDocIndex < documents.length - 1) {
      setCurrentDocIndex(currentDocIndex + 1);
    }
  };

  const previousDocument = () => {
    if (currentDocIndex > 0) {
      setCurrentDocIndex(currentDocIndex - 1);
    }
  };

  const acknowledgeCurrentDocument = () => {
    const docId = documents[currentDocIndex].id;
    setAcknowledgedDocs(prev => ({
      ...prev,
      [docId]: true
    }));

    // Move to next document if available
    if (currentDocIndex < documents.length - 1) {
      nextDocument();
    }
  };

  const allDocumentsAcknowledged = () => {
    return Object.values(acknowledgedDocs).every(val => val === true);
  };

  const proceedToMeetingScheduler = () => {
    closeDocuments();
    setShowMeetingScheduler(true);
  };

  const handleMeetingFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const validateMeetingForm = () => {
    if (!formData.name || !formData.email || !formData.unitNumber) {
      setError("Name, email, and unit number are required");
      return false;
    }

    if (!formData.preferredDate || !formData.preferredTime) {
      setError("Please select your preferred meeting date and time");
      return false;
    }

    if (!formData.alternateDate || !formData.alternateTime) {
      setError("Please select an alternate meeting date and time");
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Check for public email domain
    const email = formData.email.toLowerCase();
    const publicDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'aol.com', 'protonmail.com', 'zoho.com'];
    const domain = email.split('@')[1];
    
    if (!publicDomains.includes(domain)) {
      setError("Please use a public email domain (Gmail, Yahoo, Outlook, etc.). Company emails are not accepted.");
      return false;
    }

    // Check if preferred date is in the future
    const preferredDate = new Date(formData.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (preferredDate < today) {
      setError("Preferred date must be in the future");
      return false;
    }

    return true;
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateMeetingForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use new next-steps endpoint
      const response = await fetch(`${backendServer}/api/next-steps/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        
        // Show success message for 3 seconds then navigate to home
        setTimeout(() => {
          navigate("/");
        }, 3000);
      } else {
        // Handle error from response
        setError(data.message || "Failed to schedule meeting. Please try again.");
      }
    } catch (err) {
      console.error("Meeting scheduling error:", err);
      setError("Failed to schedule meeting. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  const currentDoc = documents[currentDocIndex];

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen pt-40 pb-24 px-6 bg-white flex items-center justify-center">
        <div className="max-w-2xl text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          
          <h1 className="text-4xl font-light text-[#004b5f] mb-4">
            Meeting Request Submitted!
          </h1>
          
          <p className="text-lg text-gray-600 font-light mb-6">
            Thank you for scheduling your design consultation. You will receive a confirmation email shortly with meeting details.
          </p>
          
          <p className="text-sm text-gray-500 font-light">
            Redirecting to your portal...
          </p>
        </div>
      </div>
    );
  }

  // Meeting scheduler screen
  if (showMeetingScheduler) {
    return (
      <div className="min-h-screen pt-40 pb-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
              <Calendar className="w-6 h-6 text-[#004b5f]/40 mx-4" />
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
            </div>

            <h1 className="text-5xl font-extralight text-[#004b5f] mb-4">
              Schedule Your Design Consultation
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Select your preferred meeting times and our team will confirm your appointment within 24 hours.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleMeetingSubmit} className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-8">
              <h2 className="text-xl font-light text-[#004b5f] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Contact Information
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleMeetingFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleMeetingFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    placeholder="your.email@gmail.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Please use public email (Gmail, Yahoo, Outlook, etc.)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Unit Number *
                  </label>
                  <input
                    type="text"
                    name="unitNumber"
                    value={formData.unitNumber}
                    onChange={handleMeetingFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    placeholder="e.g., 101"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Meeting Type */}
            <div className="mb-8">
              <h2 className="text-xl font-light text-[#004b5f] mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Meeting Type
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.meetingType === 'in-person' 
                    ? 'border-[#004b5f] bg-[#004b5f]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="meetingType"
                    value="in-person"
                    checked={formData.meetingType === 'in-person'}
                    onChange={handleMeetingFormChange}
                    className="w-4 h-4 text-[#004b5f]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">In-Person</div>
                    <div className="text-sm text-gray-500 font-light">Meet at HDG showroom</div>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                  formData.meetingType === 'virtual' 
                    ? 'border-[#004b5f] bg-[#004b5f]/5' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="meetingType"
                    value="virtual"
                    checked={formData.meetingType === 'virtual'}
                    onChange={handleMeetingFormChange}
                    className="w-4 h-4 text-[#004b5f]"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Virtual</div>
                    <div className="text-sm text-gray-500 font-light">Video call meeting</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Preferred Date & Time */}
            <div className="mb-8">
              <h2 className="text-xl font-light text-[#004b5f] mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Preferred Date & Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleMeetingFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Time *
                  </label>
                  <select
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleMeetingFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Alternate Date & Time */}
            <div className="mb-8">
              <h2 className="text-xl font-light text-[#004b5f] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Alternate Date & Time
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="alternateDate"
                    value={formData.alternateDate}
                    onChange={handleMeetingFormChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-light text-gray-700 mb-2">
                    Time *
                  </label>
                  <select
                    name="alternateTime"
                    value={formData.alternateTime}
                    onChange={handleMeetingFormChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition"
                    required
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="mb-8">
              <label className="block text-sm font-light text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleMeetingFormChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004b5f]/20 focus:border-[#004b5f] transition resize-none"
                placeholder="Any specific topics you'd like to discuss or questions you have..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowMeetingScheduler(false)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-light"
              >
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-[#004b5f] text-white px-8 py-3 rounded-lg hover:bg-[#003b4a] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="font-light">Scheduling...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span className="font-light">Schedule Meeting</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-40 pb-24 px-6 animate-fade-in bg-white">
      {/* Page hero */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
          <CheckCircle className="w-6 h-6 text-[#004b5f]/40 mx-4" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
        </div>

        <h1 className="text-6xl font-extralight text-[#004b5f] mb-4">Next Steps</h1>
        <p className="text-lg text-gray-600 font-light max-w-3xl mx-auto">
          Choose how you would like to secure your place in the Ālia Furnishing Program.
        </p>
      </div>

      {/* Two boxes side-by-side on desktop, stacked on mobile */}
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-stretch">

        {/* Already Made Your Deposit? */}
        <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] text-white rounded-2xl p-14 shadow-lg flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/10 mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-light mb-4">Already Made Your Deposit?</h2>
          <p className="max-w-xl text-white/90 mb-8 font-light">
            If you have already secured your place with a deposit, access your personalized client portal to review selections and track your project.
          </p>

          <button
            onClick={() => navigate("/client-portal")}
            className="inline-flex items-center gap-3 bg-white text-[#005670] px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="font-light">Access Your Portal</span>
          </button>
        </div>

        {/* Ready to Make Your Deposit? */}
        <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] text-white rounded-2xl p-14 shadow-lg flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center p-4 rounded-full bg-white/10 mb-6">
            <FileText className="w-8 h-8" />
          </div>

          <h2 className="text-3xl font-light mb-4">Ready to Make Your Deposit?</h2>
          <p className="max-w-xl text-white/90 mb-8 font-light">
            Please review the required agreements before proceeding. You will need to acknowledge all three documents to continue.
          </p>

          <button
            onClick={openDocuments}
            className="inline-flex items-center gap-3 bg-white text-[#005670] px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <FileText className="w-4 h-4" />
            <span className="font-light">Review Agreements & Make Deposit</span>
          </button>
        </div>
      </div>

      {/* Documents Modal */}
      {showDocuments && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={closeDocuments} />

          <div className="relative w-full max-w-5xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#004b5f]" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{currentDoc.title}</h3>
                  <p className="text-sm text-gray-500">
                    Document {currentDocIndex + 1} of {documents.length}
                  </p>
                </div>
              </div>
              <button onClick={closeDocuments} className="text-gray-500 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document progress indicator */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex gap-2">
                {documents.map((doc, index) => (
                  <div
                    key={doc.id}
                    className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200"
                  >
                    <div
                      className={`h-full transition-all duration-300 ${
                        acknowledgedDocs[doc.id]
                          ? 'bg-green-500 w-full'
                          : index === currentDocIndex
                          ? 'bg-[#004b5f] w-1/2'
                          : 'bg-gray-200 w-0'
                      }`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Understanding Options</span>
                <span>Design Fee</span>
                <span>Deposit Pricing</span>
              </div>
            </div>

            {/* scrollable content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto text-gray-800 leading-relaxed">
              <div className="whitespace-pre-line font-light text-sm">
                {currentDoc.content.split('\n\n').map((block, i) => (
                  <p key={i} className="mb-4">
                    {block}
                  </p>
                ))}
              </div>
            </div>

            {/* footer with navigation */}
            <div className="p-6 border-t border-gray-100">
              <div className="flex items-center justify-between">
                {/* Previous button */}
                <button
                  onClick={previousDocument}
                  disabled={currentDocIndex === 0}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg transition ${
                    currentDocIndex === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-light">Previous</span>
                </button>

                {/* Center: Acknowledge or Continue */}
                <div className="flex gap-3">
                  {!acknowledgedDocs[currentDoc.id] && (
                    <button
                      onClick={acknowledgeCurrentDocument}
                      className="inline-flex items-center gap-2 bg-[#004b5f] text-white px-6 py-3 rounded-lg hover:bg-[#003b4a] transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-light">Acknowledge</span>
                    </button>
                  )}
                  
                  {acknowledgedDocs[currentDoc.id] && (
                    <div className="inline-flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5 fill-current" />
                      <span className="font-light">Acknowledged</span>
                    </div>
                  )}
                </div>

                {/* Next button or Proceed */}
                {currentDocIndex < documents.length - 1 ? (
                  <button
                    onClick={nextDocument}
                    className="inline-flex items-center gap-2 bg-[#004b5f] text-white px-5 py-3 rounded-lg hover:bg-[#003b4a] transition"
                  >
                    <span className="font-light">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={proceedToMeetingScheduler}
                    disabled={!allDocumentsAcknowledged()}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg transition ${
                      allDocumentsAcknowledged()
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="font-light">Proceed to Schedule Meeting</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.45s ease-out both; }
        .animate-slide-up { animation: slide-up 0.6s ease-out 0.15s both; }
      `}</style>
    </div>
  );
};

export default NextStepsPage;