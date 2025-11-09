import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const ProcessPage = () => {
  const steps = [
    {
      number: '01',
      title: 'Engage with Henderson',
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          The Ālia sales team introduces Henderson Design Group (HDG) and our curated furnishing
          collections to the client, sharing the brochure and facilitating a personal introduction to
          schedule an initial meeting.
        </p>
      ),
    },
    {
      number: '02',
      title: 'Introduction Meeting and Collection Review',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Henderson Design Group meets with the client, either in person or via an online call, to review
            the available furniture collections:
          </p>
          <ul className="space-y-2 mb-6 text-base text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#005670] mt-1">•</span>
              <span>Lani Furniture Collection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#005670] mt-1">•</span>
              <span>Nalu Furniture Collection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#005670] mt-1">•</span>
              <span>Foundation Collection</span>
            </li>
          </ul>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
            During this meeting, HDG presents the overall design philosophy, collection options, pricing,
            customization possibilities, and project process. Clients may then decide how they wish to move
            forward:
            </p>

            <p className="text-lg font-semibold text-[#005670] mb-4">Options</p>

            <ul className="space-y-4 text-base text-gray-700">
            <li className="flex items-start gap-3">
                <span className="text-[#005670] font-bold">1.</span>
                <span>
                <span className="font-bold text-[#005670]">
                    Place a Deposit to Hold 2025 Pricing by December 15, 2025:
                </span>{' '}
                Locking in current pricing while finalizing design decisions.
                </span>
            </li>
            <li className="flex items-start gap-3">
                <span className="text-[#005670] font-bold">2.</span>
                <span>
                <span className="font-bold text-[#005670]">Place a Design Fee to Hold Place in Line:</span>{' '}
                Securing a confirmed design start position in HDG's calendar.
                </span>
            </li>
            <li className="flex items-start gap-3">
                <span className="text-[#005670] font-bold">3.</span>
                <span>
                Take time to consider options and contact HDG when ready to proceed.
                </span>
            </li>
            </ul>

        </>
      ),
    },
    {
      number: '03',
      title: 'Client Portal Access and Onboarding',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Once a client decides to move forward and places either deposit, HDG will send an invitation to
            the client's personal HDG Project Portal.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            This portal serves as the central workspace for all information, communication, documents,
            selections, approvals, and project timelines.
          </p>

          <div className="bg-[#005670]/5 border-l-4 border-[#005670] rounded-r-xl p-5 mb-6">
            <p className="text-base text-[#005670] mb-4 font-bold">
              When first activated, the client's portal opens in "Welcome Mode," which includes:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>HDG collection look books and furniture catalog</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Material and finish library</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Our Process overview and FAQs</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Contact information for the HDG project team</span>
              </li>
              <li className="flex items-start gap-2 md:col-span-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Design Preferences Questionnaire</span>
              </li>
            </ul>
          </div>

          <p className="text-base text-[#005670] italic font-bold mb-6 bg-[#005670]/5 p-4 rounded-xl">
            After completing the questionnaire, HDG will reach out to schedule the Design Intake Meeting.
          </p>

          <div className="bg-gradient-to-br from-[#005670]/5 to-[#007a9a]/5 border-l-4 border-[#005670] rounded-r-xl p-5">
            <p className="text-base text-[#005670] mb-4 font-bold">
              Once the deposit is received, the Design Phase section unlocks, providing access to:
            </p>
            <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Unit-specific floor plans and layouts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Selections and pricing proposals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Communication threads for design approvals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#005670] mt-0.5">•</span>
                <span>Project timeline and dashboard</span>
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      number: '04',
      title: 'Design Intake Meeting',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            A Henderson team member schedules a call or in-person meeting in Hawaii to review the
            questionnaire and confirm design intent.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            At this stage, the client is formally introduced to their Henderson Design Team, who will remain
            their primary point of contact throughout the process.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Clients also receive full access to the Design Phase of the HDG software, customized for their
            unit or floor plan.
          </p>
        </>
      ),
    },
    {
      number: '05',
      title: 'Curated Design Preparation',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Within one to two months of the intake meeting, Henderson prepares a curated design tailored to
            each client's expectations, budget, and aesthetic.
          </p>
          <div className="inline-block bg-[#005670] text-white px-5 py-2 rounded-full">
            <p className="text-sm font-bold">Timeline: 1–2 months</p>
          </div>
        </>
      ),
    },
    {
      number: '06',
      title: 'Presentation of Curated Design',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Henderson's concierge contacts the client to schedule a design presentation.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            During this meeting, clients can explore their floor plan and review proposed furnishings.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Clients may approve the design as presented or request revisions for a follow-up meeting.
          </p>
        </>
      ),
    },
    {
      number: '07',
      title: 'Finalize and Present the Purchase Agreement',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Once selections are confirmed in the design software by clicking "Confirm My Order," a final
            meeting is scheduled to review the complete design, budget, and timeline.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            The client then receives an order acknowledgment and a deposit receipt.
          </p>
        </>
      ),
    },
    {
      number: '08',
      title: 'Procurement, Delivery, and Installation Coordination',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            After orders are placed and vendor timelines are confirmed, Henderson provides an estimated
            installation date.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Final installation dates align with the Ālia delivery schedule, with installations occurring in
            the order units are released.
          </p>
        </>
      ),
    },
    {
      number: '09',
      title: 'Invoice Schedule',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Once the furniture package is finalized, clients receive a Purchasing Agreement outlining the
            payment schedule:
          </p>
          <div className="space-y-4 text-base text-gray-700">
            <div className="bg-white border-l-4 border-[#005670] rounded-r-xl p-4 shadow-sm">
              <span className="font-bold text-[#005670] block mb-2">50% Deposit:</span>
              <span>Due upon approval of the furnishings proposal (if a 30% deposit was previously placed to hold 2025 pricing, an additional 20% will be due to place the order).</span>
            </div>
            <div className="bg-white border-l-4 border-[#005670] rounded-r-xl p-4 shadow-sm">
              <span className="font-bold text-[#005670] block mb-2">25% Progress Payment:</span>
              <span>Due six months prior to completion of production and shipping.</span>
            </div>
            <div className="bg-white border-l-4 border-[#005670] rounded-r-xl p-4 shadow-sm">
              <span className="font-bold text-[#005670] block mb-2">25% Final Payment:</span>
              <span>Due 30 days prior to installation.</span>
            </div>
          </div>
          <div className="mt-6 bg-[#005670]/5 p-4 rounded-xl">
            <p className="text-base text-[#005670] font-bold">
              All payments are tracked within the design software for full transparency.
            </p>
          </div>
        </>
      ),
    },
    {
      number: '10',
      title: 'White-Glove Delivery and Installation',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Installation dates are confirmed 90 days in advance.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Once Henderson receives notice that a unit has been turned over, our concierge coordinates all
            delivery and installation logistics.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Installation typically requires six to eight business days and includes work by external trades
            such as wallcovering, window coverings, closet systems, and decorative fixtures, all managed by
            Henderson Design Group.
          </p>
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-5">
            <p className="text-base text-amber-800 font-bold">
              Important: Clients are asked not to be present during installation to ensure efficiency and
              safety.
            </p>
          </div>
        </>
      ),
    },
    {
      number: '11',
      title: 'Client Walk-Through and Handover',
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            The Henderson concierge schedules a reveal to present the completed unit, review design details,
            and answer any questions.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            At this time, the client receives their Care and Maintenance Binder for all furnishings.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Your concierge remains your ongoing point of contact for any future assistance or warranty
            support.
          </p>
        </>
      ),
    },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">The Journey</p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Client Process
        </h1>
        <p className="text-xl text-gray-700 mb-3">
          A seamless journey from introduction to installation
        </p>
        <div className="inline-block bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-6 py-2 rounded-full">
          <p className="text-sm font-bold">Typically 10–12 months</p>
        </div>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Steps */}
      <div className="max-w-5xl mx-auto space-y-12">
        {steps.map((step, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start gap-6 p-8">
              {/* Number Badge */}
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4 leading-snug">
                  {step.title}
                </h2>
                <div className="w-16 h-1 bg-[#005670] rounded-full mb-6"></div>
                {step.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-base text-[#005670] font-bold mb-2">Updated October 30, 2025</p>
          <p className="text-sm text-gray-600">
            Typical process duration: 10–12 months from engagement to installation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessPage;