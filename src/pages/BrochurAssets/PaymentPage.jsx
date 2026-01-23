import React from "react";
import { Wallet, Calendar, CheckCircle } from "lucide-react";

const PaymentPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            Financial Overview
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Payment Schedule & Deposit Options
        </h1>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto mb-3">
          Transparent, easy-to-follow steps to secure your place and manage your project smoothly.
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Content as Card (like ProcessPage) */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Card 1 - Full Content */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start gap-6 p-8">
            {/* Number Badge */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 leading-snug">
                Standard Payment Schedule
              </h2>
              <div className="w-16 h-1 bg-[#005670] rounded-full mb-6"></div>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Transparent, easy-to-follow steps to secure your place and manage your project smoothly.
              </p>

              <div className="space-y-8 border border-gray-200 rounded-2xl p-8 bg-gray-50">
                <div>
                  <h4 className="text-2xl font-medium text-[#005670] mb-2">
                    50% Deposit
                  </h4>
                  <p className="text-lg leading-relaxed text-gray-700">
                    Due upon approval of the furnishings proposal (less any prior deposits or credits, 
                    such as 30% hold price deposit or design fee). The total price is based on the final approved design.
                  </p>
                </div>

                <div>
                  <h4 className="text-2xl font-medium text-[#005670] mb-2">
                    25% Progress Payment
                  </h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Due six months before completion of production and shipping.
                  </p>
                </div>

                <div>
                  <h4 className="text-2xl font-medium text-[#005670] mb-2">
                    25% Final Payment
                  </h4>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    Due 30 days prior to installation.
                  </p>
                </div>
              </div>

              <div className="mt-10 bg-[#eaf6f8] border-l-4 border-[#005670] p-8 rounded-xl">
                <p className="text-lg text-gray-700 leading-relaxed">
                  <strong className="text-[#005670]">Payment Methods:</strong> Payments may be made by wire transfer or check in U.S. Dollars, payable to Henderson Design Group.
                </p>
                <p className="text-lg text-gray-700 mt-3 leading-relaxed">
                  All payment tracking is available through your secure client portal.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 - Deposit Options */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-start gap-6 p-8">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                <Wallet className="w-6 h-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 leading-snug">
                Understanding Your Deposit Options
              </h2>
              <div className="w-16 h-1 bg-[#005670] rounded-full mb-6"></div>

              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                Clients can secure their position with Henderson Design Group in two ways. 
                Each option offers different flexibility for timing and pricing.
              </p>

              {/* Option 2 */}
              <div className="space-y-6 border border-gray-200 rounded-2xl p-8 bg-gray-50">
                <h4 className="text-2xl font-medium text-[#005670] mb-4">
                  DESIGN FEE TO HOLD PLACE IN LINE
                </h4>

                <InfoBlock
                  title="Purpose"
                  text="Guarantee your design start position in HDG's calendar before capacity fills."
                />

                <div>
                  <h5 className="text-xl font-medium text-gray-900 mb-2">
                    Fee Amount
                  </h5>
                  <p className="text-lg text-gray-700">
                    One hundred percent (100%) due upon signing. Fee is non-refundable.
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Refer to Design Fee Schedule by unit type and bedroom count.)
                  </p>
                </div>

                <div>
                  <h5 className="text-xl font-medium text-gray-900 mb-2">
                    What This Does
                  </h5>
                  <ul className="list-disc pl-6 space-y-2 text-lg text-gray-700">
                    <li>Confirms your reserved design start date.</li>
                    <li>Includes design intake meeting, floor plan review, furniture layout, material selections, and one revision.</li>
                    <li>Applies in full as a credit toward your total furnishing package when you proceed to production.</li>
                  </ul>
                </div>

                <InfoBlock
                  title="Refund Policy"
                  text="Non-refundable. The full amount is credited toward your total package if you move forward into production."
                />

                <InfoBlock
                  title="Next Step"
                  text="Once the design fee is received, HDG will issue your confirmation notice and schedule your design intake meeting."
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-base text-[#005670] font-bold mb-2">
            Updated January 2026
          </p>
          <p className="text-sm text-gray-600">
            Payment structure designed for transparency and flexibility
          </p>
        </div>
      </div>
    </div>
  );
};

// InfoBlock helper
const InfoBlock = ({ title, text }) => (
  <div>
    <h5 className="text-xl font-medium text-gray-900 mb-2">{title}</h5>
    <p className="text-lg text-gray-700 leading-relaxed">{text}</p>
  </div>
);

export default PaymentPage;
