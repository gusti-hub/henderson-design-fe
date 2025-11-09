import React, { useState } from 'react';
import { Calendar, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const TimelinePage = () => {
  const [activePhase, setActivePhase] = useState(0);

  const timeline = [
    { 
      period: "Nov 2025 - Jan 2026",
      phase: "Client Outreach and Onboarding",
      items: [
        "HDG and Ālia Sales launch client introductions",
        "Clients receive the pre-call email and initial presentation meeting",
        "Client portal invitations are issued in Welcome Mode",
        "Deposits to hold pricing or Design Fees to hold place in line are collected",
        "Clients complete their Design Preferences Questionnaire"
      ]
    },
    { 
      period: "Feb - Apr 2026",
      phase: "Design Intake and Active Design Phase",
      items: [
        "Clients attend their Design Intake Meetings, in person or online",
        "HDG design team prepares curated layouts, material selections, and proposals",
        "Design Presentation #1",
        "Clients review concepts and request refinements",
        "Design Presentation #2",
        "Final design approvals begin rolling in by late April"
      ]
    },
    { 
      period: "May - Jun 2026",
      phase: "Final Design Approvals and Purchase Agreements",
      items: [
        "Clients click Confirm My Order in the HDG software",
        "Client Purchase Agreements are executed",
        "50 percent deposits, less any prior credits, are invoiced and received",
        "Production scheduling and material allocations are confirmed with manufacturers",
        "Redline reviews and final shop drawings completed before fabrication"
      ]
    },
    { 
      period: "Jul - Sep 2026",
      phase: "Production and Quality Control",
      items: [
        "Manufacturing and finishing take place in Indonesia and US Mainland, approximately 16-20 weeks",
        "Quality control inspections, photography, and packaging occur through September",
        "First containers begin shipping in early September 2026, approximately 8-12 weeks in transit to Hawaii"
      ]
    },
    { 
      period: "Oct - Nov 2026",
      phase: "Shipping and Logistics Coordination",
      items: [
        "Remaining production batches ship",
        "Mainland accessories and art pieces coordinated to match container arrivals",
        "Progress payments of 25% invoiced six months before completion",
        "HDG and freight teams manage customs, storage, and sequencing for building access"
      ]
    },
    { 
      period: "Dec 2026 - Jan 2027",
      phase: "Final Preparations and Installation Scheduling",
      items: [
        "Final payments of 25% or any remaining balance invoiced thirty days prior to installation",
        "Final delivery windows and elevator reservations confirmed with the building",
        "Project Manager issues final installation notices and preparation checklists"
      ]
    },
    { 
      period: "Jan - Mar 2027",
      phase: "White-Glove Delivery and Installation",
      items: [
        "Container deliveries staged by phase",
        "Installation begins",
        "Lani installations average ten to twelve business days; Nalu and Foundation units average six to eight business days",
        "Finishing team completes styling, bed making, accessories, and final inspections"
      ]
    },
    { 
      period: "Feb - Apr 2027",
      phase: "Client Walk-Throughs and Handover",
      items: [
        "HDG Project Manager conducts client reveals and walkthroughs",
        "Care and Maintenance Binders distributed at completion",
        "Warranty coverage begins at installation date",
        "Client portal remains active for service, warranty, and aftercare requests"
      ]
    }
  ];

  const current = timeline[activePhase];

  return (
    <div className="pt-32 pb-24 px-6 md:px-10 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-10 py-4 rounded-full mb-8">
          <p className="text-base md:text-lg font-bold text-[#005670] tracking-widest uppercase">The Timeline</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[#005670] mb-8 leading-tight">
          Project Timeline
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-5 leading-relaxed">
          A comprehensive journey from client engagement to final handover
        </p>
        <div className="inline-block bg-gradient-to-r from-[#005670] to-[#007a9a] text-white px-8 py-3 rounded-full">
          <p className="text-base md:text-lg font-bold">November 2025 — April 2027</p>
        </div>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-8 rounded-full"></div>
      </div>

    {/* Phase Selector - Larger & More Proportional */}
    <div className="max-w-6xl mx-auto mb-20">
    {/* Desktop - 2 rows of 4 with bigger, more proportional buttons */}
    <div className="hidden md:block space-y-4">
        {/* First Row */}
        <nav className="flex items-stretch bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border-2 border-[#005670]/25 shadow-xl">
        {timeline.slice(0, 4).map((item, i) => (
            <button
            key={i}
            onClick={() => setActivePhase(i)}
            className={`flex-1 flex flex-col items-center justify-center px-6 py-6 text-base font-bold tracking-wide transition-all duration-300 min-h-[100px] ${
                i === 0 ? 'rounded-l-xl' : ''
            } ${
                i === 3 ? 'rounded-r-xl' : ''
            } ${
                activePhase === i
                ? 'bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg z-10 scale-105'
                : 'text-[#005670] hover:bg-[#005670]/5 active:scale-95'
            }`}
            >
            <span className={`text-base mb-3 font-bold ${
                activePhase === i ? 'text-white' : 'text-gray-600'
            }`}>
                Phase {i + 1}
            </span>
            <span className="text-base leading-snug">{item.period}</span>
            </button>
        ))}
        </nav>

        {/* Second Row */}
        <nav className="flex items-stretch bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border-2 border-[#005670]/25 shadow-xl">
        {timeline.slice(4, 8).map((item, i) => (
            <button
            key={i + 4}
            onClick={() => setActivePhase(i + 4)}
            className={`flex-1 flex flex-col items-center justify-center px-6 py-6 text-base font-bold tracking-wide transition-all duration-300 min-h-[100px] ${
                i === 0 ? 'rounded-l-xl' : ''
            } ${
                i === 3 ? 'rounded-r-xl' : ''
            } ${
                activePhase === i + 4
                ? 'bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg z-10 scale-105'
                : 'text-[#005670] hover:bg-[#005670]/5 active:scale-95'
            }`}
            >
            <span className={`text-base mb-3 font-bold ${
                activePhase === i + 4 ? 'text-white' : 'text-gray-600'
            }`}>
                Phase {i + 5}
            </span>
            <span className="text-base leading-snug">{item.period}</span>
            </button>
        ))}
        </nav>
    </div>

    {/* Mobile - Stacked with bigger buttons */}
    <div className="md:hidden bg-white/80 backdrop-blur-md rounded-2xl p-2.5 border-2 border-[#005670]/25 shadow-xl space-y-2">
        {timeline.map((item, i) => (
        <button
            key={i}
            onClick={() => setActivePhase(i)}
            className={`w-full flex flex-col items-center justify-center px-6 py-6 text-base font-bold tracking-wide transition-all duration-300 rounded-xl min-h-[90px] ${
            activePhase === i
                ? 'bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg scale-[1.02]'
                : 'text-[#005670] hover:bg-[#005670]/5 active:scale-95'
            }`}
        >
            <span className={`text-base mb-3 font-bold ${
            activePhase === i ? 'text-white' : 'text-gray-600'
            }`}>
            Phase {i + 1}
            </span>
            <span className="text-base">{item.period}</span>
        </button>
        ))}
    </div>
    </div>

      {/* Active Phase - Larger Content */}
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border-2 border-[#005670]/10 overflow-hidden mb-20">
        <div className="p-10 md:p-12">
          <div className="flex items-start gap-8 mb-12">
            <div className="flex-shrink-0">
              <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] text-white w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg">
                {String(activePhase + 1).padStart(2, '0')}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl text-[#005670] font-bold mb-4 leading-snug">
                {current.phase}
              </h2>
              <div className="flex items-center gap-3 text-lg bg-[#005670]/5 px-6 py-3 rounded-full inline-flex">
                <Calendar className="w-5 h-5 text-[#005670]" />
                <span className="font-bold text-[#005670]">{current.period}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-1 bg-[#005670] rounded-full"></div>
            <h3 className="text-xl md:text-2xl text-[#005670] font-bold">
              Key Activities
            </h3>
          </div>

          <ul className="space-y-4">
            {current.items.map((item, idx) => (
              <li
                key={idx}
                className="flex gap-5 bg-gradient-to-r from-gray-50 to-white p-6 rounded-xl border-2 border-[#005670]/10 hover:border-[#005670]/20 transition-all duration-300"
              >
                <CheckCircle className="w-6 h-6 text-[#005670] mt-1 flex-shrink-0" />
                <p className="text-base md:text-lg leading-relaxed text-gray-700">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation - Larger Buttons */}
      <div className="flex flex-col sm:flex-row justify-between gap-5 max-w-5xl mx-auto">
        <button
          onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
          disabled={activePhase === 0}
          className={`px-10 py-5 rounded-xl text-lg font-bold border-2 transition-all duration-300 flex items-center justify-center gap-4 ${
            activePhase === 0
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-[#005670] border-[#005670]/25 hover:border-[#005670] hover:bg-[#005670]/5 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
          <span>Previous Phase</span>
        </button>
        <button
          onClick={() => setActivePhase(Math.min(timeline.length - 1, activePhase + 1))}
          disabled={activePhase === timeline.length - 1}
          className={`px-10 py-5 rounded-xl text-lg font-bold border-2 transition-all duration-300 flex items-center justify-center gap-4 ${
            activePhase === timeline.length - 1
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              : 'bg-white text-[#005670] border-[#005670]/25 hover:border-[#005670] hover:bg-[#005670]/5 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
          }`}
        >
          <span>Next Phase</span>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default TimelinePage;