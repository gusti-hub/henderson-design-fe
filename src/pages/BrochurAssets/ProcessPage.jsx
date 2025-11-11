import React from "react";
import { CheckCircle } from "lucide-react";

const ProcessPage = () => {
  const steps = [
    {
      number: "01",
      title: "Engage with Henderson",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          The Ālia sales team introduces Henderson Design Group (HDG) and our
          curated furnishing collections, sharing the brochure and connecting
          you with our team to schedule an initial meeting.
        </p>
      ),
    },
    {
      number: "02",
      title: "Introduction Meeting & Collection Review",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-5">
            Meet with HDG — in person or online — to review the Lani, Nalu, and
            Foundation Collections. We’ll walk you through design philosophy,
            pricing, customization, and next steps.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            After the meeting, you’ll be invited to your Welcome Page in the HDG
            Project Portal to explore collections, learn about the process, and
            decide how to move forward.
          </p>
        </>
      ),
    },
    {
      number: "03",
      title: "Client Portal Access & Onboarding",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Once you’re ready to proceed, we’ll invite you to the HDG Project
            Portal — your private workspace for all communication, documents,
            selections, and approvals. Your portal opens in Welcome Mode, giving
            access to look books, finish libraries, FAQs, contact info, and a
            Design Preferences Questionnaire.
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 pl-6 space-y-1">
            <li>Lock in current pricing with a deposit.</li>
            <li>Reserve your design meeting.</li>
            <li>Schedule a call to review options.</li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            After your choice and deposit, the Design Phase unlocks with
            unit-specific layouts, pricing proposals, and your project
            dashboard.
          </p>
        </>
      ),
    },
    {
      number: "04",
      title: "Design Intake Meeting",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          An HDG team member meets with you (in person or by call) to review
          your questionnaire and confirm design direction. You’ll meet your
          dedicated Henderson Design Team, who will guide your project from
          concept through installation.
        </p>
      ),
    },
    {
      number: "05",
      title: "Curated Design Preparation",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            HDG develops a curated design that reflects your preferences,
            budget, and aesthetic — including furnishings, finishes, and layouts
            customized to your unit.
          </p>
          <p className="italic text-gray-700 font-medium">Timeline: 1–2 months.</p>
        </>
      ),
    },
    {
      number: "06",
      title: "Presentation of Curated Design",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Your HDG project manager schedules your Design Presentation. You’ll
            review your floor plan, explore proposed furnishings, and discuss
            refinements before confirming the final design.
          </p>
        </>
      ),
    },
    {
      number: "07",
      title: "Finalize the Purchase Agreement",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          Once selections are confirmed in the portal, HDG hosts a brief review
          meeting covering design details, budget, and schedule. You’ll receive
          an Order Acknowledgment and Deposit Receipt, marking the start of
          production.
        </p>
      ),
    },
    {
      number: "08",
      title: "Procurement & Installation Coordination",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          After orders are placed and vendor timelines confirmed, HDG provides
          an estimated installation date, aligned with the Ālia delivery
          schedule and unit-release sequence.
        </p>
      ),
    },
    {
      number: "09",
      title: "Invoice Schedule",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Your Purchasing Agreement outlines the payment structure:
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 pl-6 space-y-1">
            <li>
              <strong>50% Deposit</strong> – Due upon proposal approval.
            </li>
            <li>
              <strong>25% Progress Payment</strong> – Six months before
              production completion.
            </li>
            <li>
              <strong>25% Final Payment</strong> – Thirty days prior to
              installation.
            </li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            All payments and milestones are tracked through the portal for full
            transparency.
          </p>
        </>
      ),
    },
    {
      number: "10",
      title: "White-Glove Delivery & Installation",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Installation dates are confirmed 90 days in advance. Once the unit
            is released, your project manager coordinates all delivery and
            installation logistics — including furnishings, wallcoverings,
            window treatments, and lighting.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Installation typically takes 6–8 business days.{" "}
            <em>
              Clients are asked not to be present during installation to
              maintain efficiency and safety.
            </em>
          </p>
        </>
      ),
    },
    {
      number: "11",
      title: "Client Walk-Through & Handover",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed">
          Your project manager hosts the final reveal — presenting your
          completed unit, reviewing design details, and answering questions.
          You’ll receive your Care & Maintenance Binder and continued access to
          your project manager for any future service or warranty needs.
        </p>
      ),
    },
  ];

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            The Journey
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Our Process
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
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex items-start gap-6 p-8">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                  {step.number}
                </div>
              </div>

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
          <p className="text-base text-[#005670] font-bold mb-2">
            Updated October 30, 2025
          </p>
          <p className="text-sm text-gray-600">
            Typical process duration: 10–12 months from engagement to
            installation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessPage;
