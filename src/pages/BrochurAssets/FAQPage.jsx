import React, { useState } from 'react';
import { 
  ChevronDown, 
  Mail, 
  HelpCircle 
} from 'lucide-react';

const FAQPage = ({ setActiveTab }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);

  const faqs = [
    {
      category: "GENERAL OVERVIEW",
      questions: [
        {
          question: "Who is Henderson Design Group?",
          answer: "Henderson Design Group (HDG) is an interior design and furnishing firm specializing in curated, turnkey solutions for residential developments. For Ālia, we have created a collection of fully coordinated furniture collections—Lani, Nalu, and Foundation—crafted to complement the architecture and finishes of the building."
        },
        {
          question: "What are the available furniture collections?",
          answer: "The Ālia program offers four options:\n\n• Lani Collection – Complete bespoke-level furnishing, including cabinetry, art, rugs, and accessories.\n• Nalu Collection – Comprehensive furnishing with elevated design details and finish selections.\n• Foundation Collection – Streamlined essentials for move-in-ready comfort.\n• Custom Design – For clients wishing to fully personalize their unit with HDG's design team."
        },
        {
          question: "Can I mix items between collections?",
          answer: "Yes. Clients often select a mix of pieces across Lani & Nalu Collection. Our collections allow flexibility in choosing items and finishes while maintaining overall design harmony."
        }
      ]
    },
    {
      category: "PROCESS AND TIMELINE",
      questions: [
        {
          question: "What happens during the first meeting?",
          answer: "Your initial meeting introduces the HDG team, design philosophy, and each furnishing collection. We review pricing, customization options, and next steps."
        },
        {
          question: "What are my options for moving forward after the first meeting?",
          answer: "You may:\n• Place a Deposit to Hold 2025 Pricing.\n• Pay a Design Fee to Hold Place in Line.\n• Take time to review and contact HDG when ready."
        },
        {
          question: "What is the difference between the two deposit options?",
          answer: "Deposit to Hold Pricing locks current 2025 pricing and reserves material allocation.\n\nDesign Fee to Hold Place in Line secures a confirmed design start position and includes the design intake meeting, layout review, and curated presentation."
        },
        {
          question: "How long does the design process take?",
          answer: "From intake to presentation typically takes six to eight weeks, depending on customization level and client feedback speed."
        },
        {
          question: "What happens after I approve my design?",
          answer: "Once you click \"Confirm My Order\" in the HDG portal, we finalize your Purchase Agreement and issue the 50% deposit invoice. This activates production and scheduling."
        },
        {
          question: "When will my furniture be installed?",
          answer: "Installation dates are coordinated with the Ālia construction schedule. Most deliveries occur in the order units are released. Clients will be notified approximately 90 days before their scheduled installation."
        }
      ]
    },
    {
      category: "PORTAL AND COMMUNICATION",
      questions: [
        {
          question: "What is the HDG Client Portal?",
          answer: "The HDG Portal is your centralized workspace for all documents, design selections, approvals, and communication. It replaces long email threads and ensures everything stays organized and accessible."
        },
        {
          question: "When do I receive access to the portal?",
          answer: "You will receive your portal invitation after our first introductory meeting. Initially the portal opens in welcome mode where you can view the collections, catalog, FAQ, and our process overview. Once your deposit is processed, the Design Phase unlocks, giving you access to floor plans, selections, proposals, and approvals."
        },
        {
          question: "Will I still receive updates by email?",
          answer: "Yes. You'll receive email notifications whenever your attention or approval is needed, but all source documents and communication remain inside the portal."
        }
      ]
    },
    {
      category: "FINANCIAL AND PAYMENTS",
      questions: [
        {
          question: "What is the payment schedule?",
          answer: "• 50% Deposit – Due upon approval of the furnishings proposal (less any prior deposits or credits, such as 30% hold price deposit or design fee. The total price is based on the final approved design).\n• 25% Progress Payment – Due six months before completion of production and shipping.\n• 25% Final Payment or remaining balance – Due 30 days prior to installation."
        },
        {
          question: "What forms of payment do you accept?",
          answer: "Payments can be made by wire transfer or check in U.S. Dollars, payable to Henderson Design Group."
        },
        {
          question: "Are deposits refundable?",
          answer: "Design Fees are non-refundable. Deposits to Hold Pricing are refundable less a 10% administrative fee if cancelled before design approval or production scheduling."
        }
      ]
    },
    {
      category: "PRODUCTION, DELIVERY, AND INSTALLATION",
      questions: [
        {
          question: "Where is the furniture manufactured?",
          answer: "The majority of the HDG collections are manufactured in Indonesia by our partner workshops specializing in teak, woven materials, metals, stone, leather, and premium upholstery. Each piece undergoes quality control and is shipped directly to Hawaii for installation."
        },
        {
          question: "How long does production take?",
          answer: "Average production time is 16-20 weeks after design approval, followed by approximately 8-12 weeks of shipping and customs clearance."
        },
        {
          question: "How long does installation take?",
          answer: "Installation typically requires six to eight business days per unit, depending on collection type and building elevator access."
        },
        {
          question: "Can I be present during installation?",
          answer: "No. We ask that clients not be present during installation to ensure efficiency and safety. Our team coordinates all details and will invite you back for your reveal once the unit is complete. We like the WOW effect of a final reveal!"
        },
        {
          question: "What happens if my unit isn't ready when my furniture arrives?",
          answer: "HDG will coordinate adjusted delivery timing or temporary storage as needed. Any associated storage or re-delivery costs will be discussed in advance."
        }
      ]
    },
    {
      category: "WARRANTY AND AFTERCARE",
      questions: [
        {
          question: "What warranty do I receive?",
          answer: "HDG provides a one-year limited warranty against manufacturing defects in materials and workmanship from the date of installation."
        },
        {
          question: "What is not covered under warranty?",
          answer: "Normal wear, fading, misuse, natural variations in materials, or damage caused by improper care or environmental conditions are not covered."
        },
        {
          question: "How do I file a warranty claim?",
          answer: "Submit a request through your HDG portal or contact your project manager. Include a description and photos of the issue. We will respond within ten business days."
        },
        {
          question: "What happens after the one-year warranty period?",
          answer: "HDG continues to offer service, repair, and replacement assistance at standard rates. Contact your project manager for details."
        },
        {
          question: "How do I care for my furnishings?",
          answer: "Care and maintenance instructions are included in your Care & Maintenance Binder. In general:\n• Avoid prolonged sunlight exposure.\n• Maintain moderate humidity.\n• Use soft cloths and mild cleaning agents.\n• Avoid standing water, heat, or abrasive products."
        }
      ]
    },
    {
      category: "ADDITIONAL INFORMATION",
      questions: [
        {
          question: "Can I customize individual pieces?",
          answer: "Yes, custom modifications can be discussed during the design phase. Additional fees and extended timelines may apply."
        },
        {
          question: "Can HDG coordinate additional work such as wall covering, window treatments, or closet systems?",
          answer: "Yes. HDG can coordinate external trades for these services as part of your installation scope. Additional fees and extended timelines may apply."
        },
        {
          question: "What if I plan to rent my unit?",
          answer: "HDG's designs are created for residential living but suitable for high-end rental use. We can advise on durable finish options if your unit will be rented."
        },
        {
          question: "Who do I contact for general questions?",
          answer: "Your assigned HDG Project Manager remains your main point of contact throughout the process."
        },
        {
          question: "How do I begin?",
          answer: "Contact your Ālia sales representative or Henderson Design Group to schedule your introduction meeting. We look forward to helping you create your home."
        }
      ]
    }
  ];

  const allQuestions = faqs.flatMap(cat =>
    cat.questions.map(q => ({ ...q, category: cat.category }))
  );

  const visibleQuestions = allQuestions.slice(0, visibleCount);
  const hasMore = visibleCount < allQuestions.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 6, allQuestions.length));
  };

  const handleContactClick = () => {
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="flex justify-center mb-6">
          <HelpCircle className="w-16 h-16 text-[#005670]" />
        </div>
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Frequently Asked Questions</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          Everything you need to know about the Ālia Furnishing Program
        </p>
      </div>

      {/* FAQ List */}
      <div className="max-w-4xl mx-auto space-y-3 mb-12">
        {visibleQuestions.map((item, index) => {
          const faqId = `faq-${index}`;
          return (
            <div key={index} className="bg-white border border-gray-100 hover:border-[#005670]/40 transition-all duration-500 overflow-hidden rounded-2xl shadow-sm">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faqId ? null : faqId)}
                className="w-full px-8 py-6 flex items-start justify-between gap-4 text-left"
              >
                <div className="flex-1">
                  <div className="text-xs text-[#005670] mb-2 font-light tracking-widest uppercase">{item.category}</div>
                  <h3 className="text-lg font-light text-gray-900 leading-relaxed">{item.question}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[#005670] flex-shrink-0 transition-transform duration-500 mt-1 ${expandedFAQ === faqId ? 'rotate-180' : ''}`}
                />
              </button>

              {expandedFAQ === faqId && (
                <div className="px-8 pb-6 animate-fade-in">
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="max-w-4xl mx-auto text-center mb-16">
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-3 px-12 py-5 bg-white border-2 border-[#005670] text-[#005670] hover:bg-[#005670] hover:text-white transition-all duration-500 group rounded-full"
          >
            <span className="font-light tracking-wide text-lg">Load More Questions</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-4 font-light">
            Showing {visibleCount} of {allQuestions.length} questions
          </p>
        </div>
      )}

    </div>
  );
};

export default FAQPage;
