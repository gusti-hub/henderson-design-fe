import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, FileText, ArrowRight, X } from "lucide-react";

const NextStepsPage = () => {
  const navigate = useNavigate();
  const [showAgreement, setShowAgreement] = useState(false);

  // AGREEMENT TEXT: copied verbatim from the uploaded PDF (10 points)
  const agreementText = `HENDERSON DESIGN GROUP
CLIENT PURCHASE AGREEMENT – ĀLIA FURNISHING PROGRAM

This Client Purchase Agreement (the “Agreement”) is entered into between Henderson Design Group (“HDG”) and the client identified in Exhibit A – Pricing and Item Summary. 

1. Purpose and Scope:
This Agreement governs the purchase, production, delivery, and installation of furnishings, fixtures, and accessories for the client’s residence under the Ālia Furnishing Program (the “Program”). HDG agrees to supply the items specified in Exhibit A in accordance with the terms and schedule described below.

2. Pricing and Exhibit A:
All pricing is set forth in Exhibit A – Pricing and Item Summary. Exhibit A is incorporated into this Agreement by reference and details the selected furniture package, options, itemized pricing, and any applicable credits or prior deposits.

3. Payment Terms:
Client agrees to the payment schedule as follows (unless otherwise agreed in writing):
• Fifty percent (50%) deposit due upon approval of the furnishings proposal (less any prior deposits or credits, such as a 30% hold price deposit or design fee).
• Twenty-five percent (25%) progress payment due six (6) months prior to completion of production and shipping.
• Twenty-five percent (25%) final payment due thirty (30) days prior to installation.

4. Deposit Options:
The client may secure their project by selecting one of two deposit mechanisms:
a) Deposit to Hold 2025 Pricing: A thirty percent (30%) deposit to lock current pricing and reserve production allocation. Refundable less a ten percent (10%) administrative fee if cancelled prior to design selections or production scheduling, except for any design fees incurred.
b) Design Fee to Hold Place in Line: A non-refundable design fee paid in full to secure a confirmed design start date. The design fee is credited in full toward the final furnishing package if the client proceeds to production.

5. Production, Delivery, and Installation:
HDG will coordinate production, shipment, customs clearance, and professional installation in Hawaii. Production lead times, shipping, and customs clearance can vary; estimated timelines will be provided. Installation typically requires six to eight (6–8) business days per unit (subject to building access and additional trades).

6. Ownership and Risk of Loss:
Title to goods transfers to the client upon final payment and delivery unless otherwise agreed in writing. Risk of loss during transit is borne by HDG until delivery to the installation site as coordinated by HDG.

7. Warranty:
HDG provides a one (1) year limited warranty against manufacturing defects in materials and workmanship beginning on the date of installation. Warranty terms, limitations, and exclusions are described in HDG’s Warranty & Aftercare Policy.

8. Exclusions and Limitations:
This Agreement does not cover damage from misuse, neglect, normal wear and tear, exposure to environmental factors, improper cleaning, or alterations performed by others. HDG’s liability shall be limited to repair or replacement, at HDG’s discretion, not to exceed the original purchase price of the defective item.

9. Cancellations and Refunds:
Cancellation policies are as follows: Design fees are non-refundable; deposits to hold pricing may be refunded less administrative fees if cancelled prior to production scheduling. Any refunds are subject to processing and administrative review.

10. Governing Law:
This Agreement shall be governed by and construed in accordance with the laws of the State of Hawaii.

By signing below, both parties acknowledge and agree to the terms set forth in this Agreement.

[Signature blocks and Exhibit A follow in the original PDF document.]`;

  const openAgreement = () => setShowAgreement(true);

  const acknowledgeAndSetup = () => {
    setShowAgreement(false);
    // navigate to meeting scheduler
    navigate("/schedule-meeting");
  };

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
            Please review the Client Purchase Agreement before proceeding. If you are comfortable with the terms, you may proceed to make your deposit.
          </p>

          <button
            onClick={openAgreement}
            className="inline-flex items-center gap-3 bg-white text-[#005670] px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            <FileText className="w-4 h-4" />
            <span className="font-light">Review Agreement & Make Deposit</span>
          </button>
        </div>
      </div>

      {/* Agreement Modal (only opened by clicking Make Deposit) */}
      {showAgreement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAgreement(false)} />

          <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#004b5f]" />
                <h3 className="text-lg font-medium text-gray-900">Client Purchase Agreement – ĀLIA Furnishing Program</h3>
              </div>
              <button onClick={() => setShowAgreement(false)} className="text-gray-500 hover:text-gray-700 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* scrollable content */}
            <div className="p-6 max-h-[72vh] overflow-y-auto text-gray-800 leading-relaxed whitespace-pre-line">
              {agreementText.split("\n\n").map((block, i) => (
                <p key={i} className="mb-4 text-sm font-light">{block}</p>
              ))}
            </div>

            {/* footer */}
            <div className="p-6 border-t border-gray-100 text-right">
              <button
                onClick={acknowledgeAndSetup}
                className="inline-flex items-center gap-3 bg-[#004b5f] text-white px-5 py-3 rounded-lg hover:bg-[#003b4a] transition"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="font-light">Acknowledge & Setup Meeting</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.45s ease-out both; }
      `}</style>
    </div>
  );
};

export default NextStepsPage;