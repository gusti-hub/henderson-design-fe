import React from "react";
import { Info, Wallet, Calendar } from "lucide-react";

const PaymentPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero / Header Section */}
      <section className="pt-32 pb-20 text-center animate-fade-in">

        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-[#005670]/10">
            <Wallet className="text-[#005670] w-10 h-10" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-4xl font-light text-[#005670] mb-4">
          Payment Schedule & Deposit Options
        </h2>
        <div className="mx-auto w-20 border-b-2 border-[#005670]"></div>
      </section>

      <div className="max-w-5xl mx-auto px-6 space-y-16 pb-20">
        {/* Standard Payment Schedule */}
        <section className="bg-white shadow-md rounded-2xl p-10 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-[#005670]" />
            <h3 className="text-2xl font-light text-[#005670]">
              Standard Payment Schedule
            </h3>
          </div>

          <div className="space-y-6 border border-gray-200 rounded-xl p-8 bg-gray-50">
            <div>
              <h4 className="font-medium text-[#005670] mb-2">50% Deposit</h4>
              <p className="text-gray-700">
                Due upon approval of the furnishings proposal (less any prior deposits or credits, such as 30% hold price deposit or design fee. The total price is based on the final approved design).
              </p>
            </div>

            <div>
              <h4 className="font-medium text-[#005670] mb-2">25% Progress Payment</h4>
              <p className="text-gray-700">
                Due six months before completion of production and shipping.
              </p>
            </div>

            <div>
              <h4 className="font-medium text-[#005670] mb-2">
                25% Final Payment or remaining balance
              </h4>
              <p className="text-gray-700">Due 30 days prior to installation.</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-[#005670] p-6 rounded-lg">
            <p className="text-gray-700">
              <strong>Payment Methods:</strong> Payments can be made by wire transfer or check in U.S. Dollars, payable to Henderson Design Group.
            </p>
            <p className="text-gray-700 mt-2">
              All payment tracking is available through your secure client portal.
            </p>
          </div>
        </section>

        {/* Deposit Options */}
        <section className="bg-white shadow-md rounded-2xl p-10 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="text-[#005670]" />
            <h3 className="text-2xl font-light text-[#005670]">
              Understanding Your Deposit Options
            </h3>
          </div>

          <p className="text-gray-700 leading-relaxed">
            This summary explains the two ways clients can move forward with Henderson Design Group for their Ālia residence. Each option secures your place in the HDG design and production schedule in a different way.
          </p>

          {/* Option 1 */}
          <div className="space-y-6 border border-gray-200 rounded-xl p-8 bg-gray-50">
            <h4 className="text-xl font-medium text-[#005670] mb-2">
              OPTION 1 – DEPOSIT TO HOLD 2025 PRICING
            </h4>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Purpose</h5>
              <p className="text-gray-700">
                Secure current HDG collection pricing while you finalize your design decisions.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Deposit Amount</h5>
              <p className="text-gray-700">
                Thirty percent (30%) of your selected furnishing package total.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">What This Does</h5>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Locks in 2025 pricing for your chosen collection (Lani, Nalu, or Foundation).</li>
                <li>Reserves materials and production allocation in HDG's manufacturing schedule.</li>
                <li>Applies in full toward your total furnishing package once you move forward to design and production.</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Refund Policy</h5>
              <p className="text-gray-700">
                Refundable less a 10% administrative fee if cancelled before design selections or production scheduling begin. Less any design fees incurred.
              </p>
              <p className="text-gray-700 mt-2">
                Non-refundable once design selections are approved or production scheduling has started.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Next Step</h5>
              <p className="text-gray-700">
                Once your deposit is received, HDG will confirm your pricing lock and place your project in the design calendar for the 2026 design phase.
              </p>
            </div>
          </div>

          {/* Option 2 */}
          <div className="space-y-6 border border-gray-200 rounded-xl p-8 bg-gray-50">
            <h4 className="text-xl font-medium text-[#005670] mb-2">
              OPTION 2 – DESIGN FEE TO HOLD PLACE IN LINE
            </h4>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Purpose</h5>
              <p className="text-gray-700">
                Guarantee your design start position in HDG's calendar before capacity fills.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Fee Amount</h5>
              <p className="text-gray-700">
                One hundred percent (100%) due upon signing. Fee is non-refundable.
              </p>
              <p className="text-gray-600 text-sm mt-1">
                (Refer to Design Fee Schedule by unit type and bedroom count.)
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">What This Does</h5>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Confirms your reserved design start date.</li>
                <li>Includes design intake meeting, floor plan review, furniture layout, material selections, and one revision.</li>
                <li>Applies in full as a credit toward your total furnishing package when you proceed to production.</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Refund Policy</h5>
              <p className="text-gray-700">
                Non-refundable. The full amount is credited toward your total package if you move forward into production.
              </p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Next Step</h5>
              <p className="text-gray-700">
                Once the design fee is received, HDG will issue your confirmation notice and schedule your design intake meeting.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PaymentPage;
