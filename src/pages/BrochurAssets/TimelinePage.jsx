import React, { useState } from 'react';
import { Sparkles, ChevronDown, Calendar, CheckCircle, Clock } from 'lucide-react';

const TimelinePage = () => {
  const [activePhase, setActivePhase] = useState(0);

  const timeline = [
    { 
      period: "Nov 2025 - Jan 2026",
      phase: "Client Outreach and Onboarding",
      items: [
        "HDG and Ālia Sales launch client introductions",
        "Clients receive the pre-call email and initial presentation meeting",
        "Client portal invitations are issued in \"Welcome Mode\"",
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
        "Clients click \"Confirm My Order\" in the HDG software",
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
          Project Timeline
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-gray-600 font-light leading-relaxed tracking-wide">
            November 2025 – April 2027
          </p>
        </div>
        
        {/* Decorative Bottom Line */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#004b5f]/20 to-transparent"></div>
        </div>
      </div>

      {/* Interactive Timeline - Luxury Edition */}
      <div className="max-w-7xl mx-auto mb-24">
        {/* Timeline Navigation - Elegant Tabs */}
        <div className="relative mb-16">
          {/* Background gradient line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          <div className="flex overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-2 mx-auto">
              {timeline.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActivePhase(index)}
                  className={`group relative flex-shrink-0 px-8 py-6 transition-all duration-700 ${
                    activePhase === index
                      ? 'text-[#004b5f]'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {/* Hover/Active Background */}
                  <div className={`absolute inset-0 transition-all duration-700 ${
                    activePhase === index
                      ? 'bg-gradient-to-b from-[#004b5f]/5 to-transparent'
                      : 'bg-transparent group-hover:bg-gray-50/50'
                  }`}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 min-w-[140px]">
                    {/* Phase Number */}
                    <div className={`text-xs tracking-[0.3em] uppercase mb-3 transition-all duration-500 ${
                      activePhase === index
                        ? 'text-[#004b5f]/60'
                        : 'text-gray-300 group-hover:text-gray-400'
                    }`}>
                      Phase {String(index + 1).padStart(2, '0')}
                    </div>
                    
                    {/* Period */}
                    <div className="text-base font-light mb-1 tracking-wide transition-all duration-500">
                      {item.period}
                    </div>
                    
                    {/* Phase indicator dot */}
                    <div className="flex justify-center mt-4">
                      <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        activePhase === index
                          ? 'bg-[#004b5f] scale-125'
                          : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}></div>
                    </div>
                  </div>
                  
                  {/* Active Indicator - Elegant Line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#004b5f] to-transparent transition-all duration-700 ${
                    activePhase === index
                      ? 'opacity-100 scale-x-100'
                      : 'opacity-0 scale-x-0'
                  }`}></div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Phase Content - Premium Card */}
        <div className="animate-fade-in">
          <div className="relative overflow-hidden bg-white border-2 border-gray-100 hover:border-[#004b5f]/20 transition-all duration-500 shadow-xl">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-[#004b5f]/20"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-[#004b5f]/20"></div>
            
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#004b5f]/5 to-transparent transform translate-x-32 -translate-y-32"></div>
            
            {/* Content */}
            <div className="relative p-12 md:p-16">
              {/* Header with Icon */}
              <div className="flex items-start gap-6 mb-10">
                {/* Phase Number Badge */}
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center shadow-2xl">
                    <span className="text-3xl font-extralight text-white">
                      {String(activePhase + 1).padStart(2, '0')}
                    </span>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-[#004b5f]/30 blur-2xl"></div>
                </div>
                
                {/* Title */}
                <div className="flex-1 pt-3">
                  <h3 className="text-4xl font-extralight text-[#004b5f] mb-4 tracking-wide leading-tight">
                    {timeline[activePhase].phase}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 font-light tracking-wider">
                    <Calendar className="w-4 h-4" />
                    <span>{timeline[activePhase].period}</span>
                  </div>
                </div>
              </div>

              {/* Timeline Items - Elegant List */}
              <div className="space-y-5 ml-0 md:ml-26">
                {timeline[activePhase].items.map((item, idx) => (
                  <div key={idx} className="group flex gap-5 items-start">
                    {/* Animated Dot */}
                    <div className="relative flex-shrink-0 mt-2">
                      <div className="w-3 h-3 rounded-full bg-[#004b5f] group-hover:scale-125 transition-transform duration-300"></div>
                      <div className="absolute inset-0 rounded-full bg-[#004b5f]/20 animate-ping opacity-0 group-hover:opacity-100"></div>
                    </div>
                    
                    {/* Item Text */}
                    <p className="text-lg text-gray-700 leading-relaxed font-light group-hover:text-gray-900 transition-colors duration-300">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Luxury Buttons */}
          <div className="flex justify-between mt-10 gap-4">
            <button
              onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
              disabled={activePhase === 0}
              className={`group flex items-center gap-3 px-8 py-4 transition-all duration-300 ${
                activePhase === 0
                  ? 'text-gray-300 cursor-not-allowed opacity-50'
                  : 'text-[#004b5f] hover:bg-gradient-to-r hover:from-gray-50 hover:to-white border border-gray-200 hover:border-[#004b5f]/20 hover:shadow-lg'
              }`}
            >
              <ChevronDown className={`w-5 h-5 rotate-90 transition-transform ${activePhase !== 0 ? 'group-hover:-translate-x-1' : ''}`} />
              <span className="font-light tracking-wide">Previous Phase</span>
            </button>
            
            <button
              onClick={() => setActivePhase(Math.min(timeline.length - 1, activePhase + 1))}
              disabled={activePhase === timeline.length - 1}
              className={`group flex items-center gap-3 px-8 py-4 transition-all duration-300 ${
                activePhase === timeline.length - 1
                  ? 'text-gray-300 cursor-not-allowed opacity-50'
                  : 'text-[#004b5f] hover:bg-gradient-to-r hover:from-white hover:to-gray-50 border border-gray-200 hover:border-[#004b5f]/20 hover:shadow-lg'
              }`}
            >
              <span className="font-light tracking-wide">Next Phase</span>
              <ChevronDown className={`w-5 h-5 -rotate-90 transition-transform ${activePhase !== timeline.length - 1 ? 'group-hover:translate-x-1' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Section - Elegant Grid */}
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#004b5f]/30"></div>
            <Clock className="w-6 h-6 text-[#004b5f]" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#004b5f]/30"></div>
          </div>
          <h3 className="text-4xl font-extralight text-[#004b5f] tracking-wide">
            Summary
          </h3>
        </div>

        {/* Summary Cards - Premium Design */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            {
              label: "Client Onboarding and Design",
              period: "Nov 2025 - Apr 2026",
              icon: CheckCircle,
              color: "from-blue-50 to-white"
            },
            {
              label: "Purchase Agreement and Production",
              period: "May - Sep 2026",
              icon: CheckCircle,
              color: "from-purple-50 to-white"
            },
            {
              label: "Shipping and Logistics",
              period: "Sep - Dec 2026",
              icon: CheckCircle,
              color: "from-green-50 to-white"
            },
            {
              label: "Installation and Turnover",
              period: "Jan - Apr 2027",
              icon: CheckCircle,
              color: "from-orange-50 to-white"
            }
          ].map((summary, index) => (
            <div key={index} className="group relative overflow-hidden">
              {/* Card */}
              <div className={`relative bg-gradient-to-br ${summary.color} border border-gray-200 group-hover:border-[#004b5f]/30 p-8 transition-all duration-500 group-hover:shadow-xl`}>
                {/* Corner Accent */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#004b5f]/5 transform translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-500"></div>
                
                {/* Icon */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#004b5f]/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <summary.icon className="w-6 h-6 text-[#004b5f]" />
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#004b5f]/20 to-transparent"></div>
                </div>
                
                {/* Content */}
                <p className="text-gray-600 mb-3 font-light tracking-wide text-sm">
                  {summary.label}
                </p>
                <p className="text-3xl font-extralight text-[#004b5f] tracking-wide">
                  {summary.period}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Updated Date - Elegant Footer */}
        <div className="relative overflow-hidden border-2 border-[#004b5f]/20 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-8">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#004b5f]/40"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#004b5f]/40"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#004b5f]/40"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#004b5f]/40"></div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500 font-light tracking-wider">
              Updated October 30, 2025
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
        
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-ping {
          animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default TimelinePage;