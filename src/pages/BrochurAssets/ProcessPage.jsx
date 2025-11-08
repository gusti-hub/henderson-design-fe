import React from 'react';
import { Sparkles, CheckCircle } from 'lucide-react';

const ProcessPage = () => {
  const steps = [
    {
      number: "01",
      title: "Engage with Henderson",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          The Ālia sales team introduces Henderson Design Group (HDG) and our curated furnishing 
          collections to the client, sharing the brochure and facilitating a personal introduction to 
          schedule an initial meeting.
        </p>
      )
    },
    {
      number: "02",
      title: "Introduction Meeting and Collection Review",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
            Henderson Design Group meets with the client, either in person or via an online call, to review 
            the available furniture collections:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {['Lani Furniture Collection', 'Nalu Furniture Collection', 'Foundation Collection'].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                <div className="w-6 h-6 rounded-full bg-[#004b5f]/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-light text-[#004b5f]">{i + 1}</span>
                </div>
                <span className="text-gray-700 font-light">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
            During this meeting, HDG presents the overall design philosophy, collection options, pricing, 
            customization possibilities, and project process. Clients may then decide how they wish to move forward:
          </p>
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-white border-l-4 border-[#004b5f]/30 p-8 space-y-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/5 to-transparent -translate-y-16 translate-x-16"></div>
            <div className="relative space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#004b5f] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-light">Place a <strong className="font-medium text-[#004b5f]">Deposit to Hold 2025 Pricing</strong>, locking in current pricing while finalizing design decisions.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#004b5f] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-light">Place a <strong className="font-medium text-[#004b5f]">Design Fee to Hold Place in Line</strong>, securing a confirmed design start position in HDG's calendar.</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-[#004b5f] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700 font-light">Take time to consider options and contact HDG when ready to proceed.</p>
              </div>
            </div>
          </div>
        </>
      )
    },
    {
      number: "03",
      title: "Client Portal Access and Onboarding",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
            Once a client decides to move forward and places either deposit, HDG will send an invitation to 
            the client's personal HDG Project Portal. This portal serves as the central workspace for all 
            information, communication, documents, selections, approvals, and project timelines.
          </p>
          
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#004b5f]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#004b5f]" />
              </div>
              <p className="text-gray-900 font-medium">When first activated, the client's portal opens in "Welcome Mode," which includes:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'HDG collection look books and furniture catalog',
                'Material and finish library',
                'Our Process overview and FAQs',
                'Contact information for the HDG project team',
                'Design Preferences Questionnaire'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-100 hover:border-[#004b5f]/20 hover:shadow-md transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-[#004b5f] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-light text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-gray-700 mb-6 font-light italic">After completing the questionnaire, HDG will reach out to schedule the Design Intake Meeting.</p>
          
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-[#004b5f]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#004b5f]" />
              </div>
              <p className="text-gray-900 font-medium">Once the deposit is received, the Design Phase section unlocks, providing access to:</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                'Unit-specific floor plans and layouts',
                'Selections and pricing proposals',
                'Communication threads for design approvals',
                'Project timeline and dashboard'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white border border-gray-100 hover:border-[#004b5f]/20 hover:shadow-md transition-all duration-300">
                  <CheckCircle className="w-4 h-4 text-[#004b5f] flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-light text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )
    },
    {
      number: "04",
      title: "Design Intake Meeting",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          A Henderson team member schedules a call or in-person meeting in Hawaii to review the 
          questionnaire and confirm design intent. At this stage, the client is formally introduced to their 
          Henderson Design Team, who will remain their primary point of contact throughout the process. 
          Clients also receive full access to the Design Phase of the HDG software, customized for their 
          unit or floor plan.
        </p>
      )
    },
    {
      number: "05",
      title: "Curated Design Preparation",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          Within one to two months of the intake meeting, Henderson prepares a curated design tailored to 
          each client's expectations, budget, and aesthetic.
        </p>
      )
    },
    {
      number: "06",
      title: "Presentation of Curated Design",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          Henderson's concierge contacts the client to schedule a design presentation. During this meeting, 
          clients can explore their floor plan and review proposed furnishings. Clients may approve the 
          design as presented or request revisions for a follow-up meeting.
        </p>
      )
    },
    {
      number: "07",
      title: "Finalize and Present the Purchase Agreement",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          Once selections are confirmed in the design software by clicking "Confirm My Order," a final 
          meeting is scheduled to review the complete design, budget, and timeline. The client then 
          receives an order acknowledgment and a deposit receipt.
        </p>
      )
    },
    {
      number: "08",
      title: "Procurement, Delivery, and Installation Coordination",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          After orders are placed and vendor timelines are confirmed, Henderson provides an estimated 
          installation date. Final installation dates align with the Ālia delivery schedule, with installations 
          occurring in the order units are released.
        </p>
      )
    },
    {
      number: "09",
      title: "Invoice Schedule",
      content: (
        <>
          <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
            Once the furniture package is finalized, clients receive a Purchasing Agreement outlining the payment schedule:
          </p>
          <div className="space-y-6">
            {[
              {
                title: '50% Deposit',
                desc: 'Due upon approval of the furnishings proposal (if a 30% deposit was previously placed to hold 2025 pricing, an additional 20% will be due to place the order).'
              },
              {
                title: '25% Progress Payment',
                desc: 'Due six months prior to completion of production and shipping.'
              },
              {
                title: '25% Final Payment',
                desc: 'Due 30 days prior to installation.'
              }
            ].map((payment, i) => (
              <div key={i} className="relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#004b5f]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative border-l-4 border-[#004b5f]/30 group-hover:border-[#004b5f] transition-all duration-500 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-light">{i + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-2 text-lg">{payment.title}</p>
                      <p className="text-gray-700 font-light leading-relaxed">{payment.desc}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-white border-l-4 border-blue-400">
            <p className="text-gray-700 font-light">All payments are tracked within the design software for full transparency.</p>
          </div>
        </>
      )
    },
    {
      number: "10",
      title: "White-Glove Delivery and Installation",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          Installation dates are confirmed 90 days in advance. Once Henderson receives notice that a unit 
          has been turned over, our concierge coordinates all delivery and installation logistics. Installation 
          typically requires six to eight business days and includes work by external trades such as 
          wallcovering, window coverings, closet systems, and decorative fixtures, all managed by 
          Henderson Design Group. Clients are asked not to be present during installation to ensure 
          efficiency and safety.
        </p>
      )
    },
    {
      number: "11",
      title: "Client Walk-Through and Handover",
      content: (
        <p className="text-lg text-gray-700 leading-relaxed font-light">
          The Henderson concierge schedules a reveal to present the completed unit, review design details, 
          and answer any questions. At this time, the client receives their Care and Maintenance Binder for 
          all furnishings. Your concierge remains your ongoing point of contact for any future assistance 
          or warranty support.
        </p>
      )
    }
  ];

  return (
    <div className="pt-40 pb-24 px-6 animate-fade-in">
      {/* Hero Section - Ultra Elegant */}
      <div className="max-w-5xl mx-auto text-center mb-24">
        {/* Decorative Element */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
          <Sparkles className="w-5 h-5 text-[#004b5f]/40 mx-4" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
        </div>
        
        <h2 className="text-8xl font-extralight text-[#004b5f] mb-8 tracking-tight leading-none">
          Client Process
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-gray-600 font-light leading-relaxed tracking-wide">
            A seamless journey from introduction to installation, typically 10-12 months
          </p>
        </div>
        
        {/* Decorative Bottom Line */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#004b5f]/20 to-transparent"></div>
        </div>
      </div>

      {/* Process Steps - Elegant Cards */}
      <div className="max-w-5xl mx-auto space-y-8">
        {steps.map((step, index) => (
          <div key={index} className="group relative">
            {/* Connecting Line between steps */}
            {index < steps.length - 1 && (
              <div className="absolute left-8 top-full w-px h-8 bg-gradient-to-b from-[#004b5f]/30 to-transparent"></div>
            )}
            
            {/* Step Card */}
            <div className="relative overflow-hidden bg-white border border-gray-100 hover:border-[#004b5f]/20 transition-all duration-500 hover:shadow-xl">
              {/* Corner Accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/5 to-transparent transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>
              
              {/* Content */}
              <div className="relative p-8 md:p-10">
                {/* Header */}
                <div className="flex items-start gap-6 mb-6">
                  {/* Number Badge - Luxury */}
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                      <span className="text-2xl font-extralight text-white">{step.number}</span>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-full bg-[#004b5f]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  {/* Title */}
                  <div className="flex-1 pt-2">
                    <h3 className="text-2xl md:text-3xl font-light text-[#004b5f] tracking-wide leading-tight">
                      {step.title}
                    </h3>
                    {/* Decorative underline */}
                    <div className="w-16 h-px bg-gradient-to-r from-[#004b5f]/40 to-transparent mt-3"></div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="ml-0 md:ml-22">
                  {step.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Timeline Note - Elegant Footer */}
      <div className="max-w-5xl mx-auto mt-20">
        <div className="relative overflow-hidden border-2 border-[#004b5f]/20 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#004b5f]/40"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#004b5f]/40"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#004b5f]/40"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#004b5f]/40"></div>
          
          {/* Content */}
          <div className="relative text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#004b5f]/30"></div>
              <CheckCircle className="w-6 h-6 text-[#004b5f]" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#004b5f]/30"></div>
            </div>
            
            <p className="text-lg text-gray-900 font-medium mb-3">
              Updated October 30, 2025
            </p>
            <p className="text-gray-600 font-light">
              Typical process duration: 10-12 months from engagement to installation
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProcessPage;