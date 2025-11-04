import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  Leaf, 
  Ship, 
  Package, 
  TrendingDown,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  FileText,
  Shield,
  Users,
  Home,
  Sparkles,
  ArrowRight,
  ChevronDown,
  DollarSign,
  AlertCircle,
  Info,
  Award,
  Heart
} from 'lucide-react';

const BrochureLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeCollection, setActiveCollection] = useState('nalu');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const heroSlides = [
    {
      image: "/images/SAS00201.jpg",
      title: "Hawaiian Elegance",
      subtitle: "Crafting Timeless Island Living"
    },
    {
      image: "/images/SAS00274.jpg",
      title: "Sustainable Design",
      subtitle: "Respecting Land, People & Planet"
    },
    {
      image: "/images/SAS00286.jpg",
      title: "Curated Collections",
      subtitle: "Thoughtfully Sourced Furnishings"
    },
    {
      image: "/images/SAS00319.jpg",
      title: "Complete Solutions",
      subtitle: "From Concept to Installation"
    }
  ];

  const collections = [
    {
      id: 'lani',
      name: 'Lani Collection',
      tagline: 'The Pinnacle of Luxury',
      description: 'Complete bespoke-level furnishing, including custom cabinetry, curated art, premium rugs, and designer accessories.',
      features: ['Custom Design', 'Premium Materials', 'Full Accessories', 'Art Curation'],
      details: 'The Lani Collection represents the pinnacle of Hawaiian luxury living, with every element thoughtfully selected and customized for your unique space.',
      gradient: 'from-amber-50 to-orange-50'
    },
    {
      id: 'nalu',
      name: 'Nalu Collection',
      tagline: 'Sophisticated Balance',
      description: 'Comprehensive furnishing with elevated design details and refined finish selections for sophisticated island living.',
      features: ['Elevated Design', 'Quality Finishes', 'Coordinated Style', 'Designer Touches'],
      details: 'Nalu offers the perfect balance of sophistication and island comfort, with carefully curated pieces that create a cohesive, elegant environment.',
      gradient: 'from-blue-50 to-cyan-50'
    },
    {
      id: 'foundation',
      name: 'Foundation Collection',
      tagline: 'Elegant Essentials',
      description: 'Streamlined essentials for move-in-ready comfort with quality furnishings and functional elegance.',
      features: ['Core Furnishings', 'Move-In Ready', 'Quality Basics', 'Functional Design'],
      details: 'Foundation provides all the essentials for comfortable island living, with quality pieces that allow you to personalize your space over time.',
      gradient: 'from-slate-50 to-gray-50'
    }
  ];

  const faqs = [
    {
      question: "What collections are available?",
      answer: "We offer three collections: Lani (bespoke luxury with custom cabinetry and art curation), Nalu (elevated contemporary with refined finishes), and Foundation (streamlined essentials). You can also mix between collections or request fully custom design services tailored to your preferences."
    },
    {
      question: "How long does the entire process take?",
      answer: "From design intake to installation typically takes 10-12 months. The timeline includes: 6-8 weeks for design development, 16-20 weeks for production in Indonesia, 8-12 weeks for shipping and customs clearance, and 6-8 business days for installation."
    },
    {
      question: "What's included in the Design Fee?",
      answer: "The Design Fee includes your design intake meeting, floor plan review, furniture layout and collection recommendations, material and finish selections, two design presentations, one round of revisions, and preparation of your final furnishing proposal. The fee is 100% credited toward your total package if you proceed to production within six months."
    },
    {
      question: "What's the payment schedule?",
      answer: "50% deposit upon design approval (less any prior deposits or credits), 25% progress payment six months before completion, and 25% final payment 30 days prior to installation. All payments are tracked through your secure client portal."
    },
    {
      question: "Can I be present during installation?",
      answer: "We ask that clients not be present during installation to ensure efficiency and safety. Our professional team coordinates all details and will invite you for a spectacular reveal once your unit is complete. Installation typically takes 6-8 business days depending on your collection."
    },
    {
      question: "Where is the furniture manufactured?",
      answer: "Over 80% of our collections are manufactured in Indonesia by our trusted partner workshops specializing in teak, woven materials, metals, stone, leather, and premium upholstery. Each piece undergoes rigorous quality control before shipping directly to Hawaii."
    },
    {
      question: "What warranty do I receive?",
      answer: "HDG provides a one-year limited warranty against manufacturing defects in materials and workmanship from your installation date. This covers structural defects, hardware failures, upholstery stitching issues, and finish problems. We also offer continued service beyond the warranty period at standard rates."
    },
    {
      question: "What if my unit isn't ready when furniture arrives?",
      answer: "HDG will coordinate adjusted delivery timing or temporary storage as needed. Any associated storage or re-delivery costs will be discussed with you in advance to ensure transparency."
    },
    {
      question: "Can I customize individual pieces?",
      answer: "Yes! Custom modifications can be discussed during the design phase. Our team can work with you on specific adjustments, though additional fees and extended timelines may apply depending on the complexity of changes."
    },
    {
      question: "Can HDG coordinate additional services?",
      answer: "Absolutely. HDG can coordinate external trades for wall coverings, window treatments, closet systems, and other specialized services as part of your installation scope. Additional fees and timelines apply."
    },
    {
      question: "What if I plan to rent my unit?",
      answer: "Our designs work beautifully for both owner-occupied and high-end rental properties. We can advise on more durable finish options if your unit will be used as a rental to ensure longevity."
    },
    {
      question: "What forms of payment do you accept?",
      answer: "Payments can be made by wire transfer or check in U.S. Dollars, payable to Henderson Design Group. All payment tracking is available through your secure client portal."
    },
    {
      question: "Are deposits refundable?",
      answer: "Design Fees are non-refundable but fully credited toward production. Deposits to Hold Pricing are refundable less a 10% administrative fee if cancelled before design approval or production scheduling begins. Once production starts, deposits become non-refundable."
    },
    {
      question: "How do I begin the process?",
      answer: "Contact your Ālia sales representative or Henderson Design Group directly to schedule your introduction meeting. We'll walk you through the collections, answer your questions, and help you choose the best path forward."
    }
  ];

  // Image preloading
  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = heroSlides.map((slide) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = slide.image;
        });
      });

      try {
        await Promise.all(imagePromises);
        setImagesLoaded(true);
      } catch (error) {
        console.error('Error loading images:', error);
        setImagesLoaded(true);
      }
    };

    loadImages();
    setIsVisible(true);
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [imagesLoaded, heroSlides.length]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Elegant Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] flex items-center justify-center">
            <div className="text-center text-white animate-pulse">
              <div className="text-6xl tracking-[0.3em] font-light mb-6">HENDERSON</div>
              <div className="text-2xl tracking-[0.2em] font-light opacity-80">DESIGN GROUP</div>
            </div>
          </div>
        )}

        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-2000 ${
              currentSlide === index && imagesLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-[20000ms]"
              style={{ 
                backgroundImage: `url(${slide.image})`,
                animation: currentSlide === index ? 'ken-burns 20s ease-out' : 'none'
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>
        ))}

        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Elegant Header */}
          <header className="flex justify-between items-center p-8 backdrop-blur-sm">
            <img 
              src="/images/HDG-Logo.png" 
              alt="Henderson Design Group" 
              className="h-14 opacity-0 animate-fade-in"
              style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}
            />
            <button
              onClick={() => navigate('/designer-login')}
              className="text-white/90 hover:text-white text-sm tracking-[0.15em] uppercase transition-all duration-300 opacity-0 animate-fade-in hover:tracking-[0.2em]"
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              Designer Access →
            </button>
          </header>

          {/* Hero Content */}
          <div className="px-8 md:px-16 pb-32 max-w-5xl">
            <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.7s', animationFillMode: 'forwards' }}>
              <div className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4 font-light">
                Ālia Project
              </div>
              <h1 className="text-white text-6xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 leading-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-white/90 text-2xl md:text-3xl font-light tracking-wide mb-12 max-w-2xl">
                {heroSlides[currentSlide].subtitle}
              </p>
              <button
                onClick={() => scrollToSection('main-content')}
                className="group bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 text-base tracking-[0.15em] uppercase hover:bg-white hover:text-[#005670] transition-all duration-500 flex items-center gap-3"
              >
                Discover More 
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>

          {/* Elegant Slide Indicators */}
          {imagesLoaded && (
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`h-0.5 rounded-full transition-all duration-700 ${
                    currentSlide === index ? 'bg-white w-16' : 'bg-white/40 w-8 hover:bg-white/60'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Elegant Tab Navigation */}
      <section id="main-content" className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-4 justify-center">
            {[
              { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
              { id: 'collections', label: 'Collections', icon: <Sparkles className="w-4 h-4" /> },
              { id: 'process', label: 'Process', icon: <Calendar className="w-4 h-4" /> },
              { id: 'investment', label: 'Investment', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'sustainability', label: 'Sustainability', icon: <Leaf className="w-4 h-4" /> },
              { id: 'faq', label: 'FAQ', icon: <Info className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 transition-all duration-300 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-[#005670] text-white shadow-lg shadow-[#005670]/20'
                    : 'text-gray-600 hover:text-[#005670] hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                <span className="tracking-wide">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="py-16 px-6 max-w-7xl mx-auto">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-16 animate-fade-in">
            {/* Hero Statement */}
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#005670]/5 rounded-full mb-6">
                <Award className="w-4 h-4 text-[#005670]" />
                <span className="text-sm tracking-wide text-[#005670] font-medium">30+ Years of Excellence</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-light text-[#005670] mb-6 tracking-tight leading-tight">
                Ālia Project
              </h2>
              <p className="text-gray-600 text-xl leading-relaxed">
                Henderson Design Group brings decades of expertise to Hawaii's most prestigious 
                residential projects. We create complete turnkey furnishing solutions that honor 
                the land, respect the culture, and celebrate island living.
              </p>
            </div>

            {/* Value Propositions */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Home className="w-12 h-12" />,
                  title: "Turnkey Excellence",
                  description: "From concept to installation, we handle every detail. Your home is ready to enjoy from day one.",
                  gradient: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Heart className="w-12 h-12" />,
                  title: "Personalized Journey",
                  description: "Dedicated design team who listens, understands, and brings your unique vision to life.",
                  gradient: "from-purple-500 to-pink-500"
                },
                {
                  icon: <Sparkles className="w-12 h-12" />,
                  title: "Island Authenticity",
                  description: "Designs that embrace Hawaiian culture, climate, and the relaxed elegance of island life.",
                  gradient: "from-amber-500 to-orange-500"
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-transparent overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                  <div className={`relative inline-flex p-3 rounded-xl bg-gradient-to-br ${item.gradient} text-white mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-light text-[#005670] mb-4 tracking-tight">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Client Portal CTA */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] p-12 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              <div className="relative text-center max-w-3xl mx-auto">
                <CheckCircle className="w-16 h-16 mx-auto mb-6 opacity-90" />
                <h3 className="text-4xl font-light mb-4 tracking-tight">Already Made Your Deposit?</h3>
                <p className="text-white/90 text-lg mb-8 leading-relaxed">
                  Access your personalized client portal to schedule your design consultation, 
                  review selections, and track your project journey.
                </p>
                <button
                  onClick={() => navigate('/client-portal')}
                  className="inline-flex items-center gap-3 bg-white text-[#005670] px-10 py-4 text-base font-medium tracking-wide hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  <Calendar className="w-6 h-6" />
                  Access Your Portal
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Collections Tab */}
        {activeTab === 'collections' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-tight">Our Collections</h2>
              <p className="text-gray-600 text-lg">
                Three carefully curated collections designed to complement the Ālia architecture. 
                Mix between collections or request fully custom design.
              </p>
            </div>

            {/* Collection Selector */}
            <div className="flex justify-center gap-4 flex-wrap">
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection.id)}
                  className={`px-8 py-4 rounded-xl font-medium transition-all duration-500 ${
                    activeCollection === collection.id
                      ? 'bg-[#005670] text-white shadow-xl shadow-[#005670]/30 scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200'
                  }`}
                >
                  <div className="text-lg tracking-wide">{collection.name}</div>
                  <div className={`text-xs mt-1 ${activeCollection === collection.id ? 'text-white/80' : 'text-gray-500'}`}>
                    {collection.tagline}
                  </div>
                </button>
              ))}
            </div>

            {/* Active Collection Display */}
            {collections.map((collection) => (
              collection.id === activeCollection && (
                <div 
                  key={collection.id} 
                  className={`bg-gradient-to-br ${collection.gradient} rounded-3xl p-12 shadow-xl border border-gray-200/50 animate-fade-in`}
                >
                  <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                      <h3 className="text-4xl font-light text-[#005670] mb-3 tracking-tight">
                        {collection.name}
                      </h3>
                      <p className="text-[#005670]/70 text-sm tracking-[0.2em] uppercase mb-6">
                        {collection.tagline}
                      </p>
                      <p className="text-gray-700 text-lg leading-relaxed mb-4">
                        {collection.description}
                      </p>
                      <p className="text-gray-600 leading-relaxed">
                        {collection.details}
                      </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {collection.features.map((feature, index) => (
                        <div 
                          key={index} 
                          className="flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-4 rounded-xl"
                        >
                          <CheckCircle className="w-5 h-5 text-[#005670] flex-shrink-0" />
                          <span className="text-gray-800 font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Process Tab */}
        {activeTab === 'process' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-tight">Our Process</h2>
              <p className="text-gray-600 text-lg">
                A seamless journey from consultation to installation, typically 10-12 months
              </p>
            </div>

            {/* Process Steps */}
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { 
                  step: "01", 
                  title: "Design Questionnaire", 
                  description: "Share your lifestyle, preferences, and vision through our comprehensive intake form",
                  duration: "Initial Phase",
                  icon: <FileText className="w-8 h-8" />,
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  step: "02", 
                  title: "Design Development", 
                  description: "Customized layouts and curated selections with two presentations and revisions",
                  duration: "6-8 Weeks",
                  icon: <Sparkles className="w-8 h-8" />,
                  color: "from-purple-500 to-pink-500"
                },
                { 
                  step: "03", 
                  title: "Production & Shipping", 
                  description: "Expert manufacturing in Indonesia with rigorous quality control and ocean freight",
                  duration: "24-32 Weeks",
                  icon: <Package className="w-8 h-8" />,
                  color: "from-amber-500 to-orange-500"
                },
                { 
                  step: "04", 
                  title: "Installation & Reveal", 
                  description: "White-glove delivery and professional installation, ready for your move-in",
                  duration: "6-8 Days",
                  icon: <Home className="w-8 h-8" />,
                  color: "from-green-500 to-emerald-500"
                }
              ].map((item) => (
                <div 
                  key={item.step} 
                  className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl`}></div>
                  <div className="relative flex gap-6">
                    <div className={`flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-lg`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl font-light text-gray-300">{item.step}</span>
                        <span className="text-xs tracking-wider uppercase text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {item.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-medium text-[#005670] mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-200">
              <h3 className="text-2xl font-light text-[#005670] mb-8 text-center">Estimated Project Timeline</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                {[
                  { phase: "Nov 2025 - Jan 2026", title: "Client Onboarding", desc: "Intake, deposits, portal activation" },
                  { phase: "Feb - Apr 2026", title: "Design Phase", desc: "Presentations, revisions, approvals" },
                  { phase: "May - Sep 2026", title: "Production", desc: "Manufacturing with quality control" },
                  { phase: "Oct - Dec 2026", title: "Shipping", desc: "Container shipping and customs" },
                  { phase: "Jan - Mar 2027", title: "Installation", desc: "White-glove delivery and reveal" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] text-white flex items-center justify-center text-lg font-light flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-[#005670]">{item.title}</h4>
                        <span className="text-sm text-gray-500">{item.phase}</span>
                      </div>
                      <p className="text-sm text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investment Tab */}
        {activeTab === 'investment' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-tight">Investment Options</h2>
              <p className="text-gray-600 text-lg">
                Two flexible pathways to secure your place in the Ālia Furnishing Program
              </p>
            </div>

            {/* Deposit Options */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Option 1 */}
              <div className="group relative bg-white rounded-3xl p-10 shadow-xl hover:shadow-2xl transition-all duration-500 border-2 border-gray-200 hover:border-[#005670]">
                <div className="absolute top-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center text-2xl font-light shadow-lg">
                  1
                </div>
                <div className="mb-8">
                  <h3 className="text-3xl font-light text-[#005670] mb-3">Hold 2025 Pricing</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Secure current pricing while finalizing your design decisions
                  </p>
                </div>
                <div className="space-y-4 mb-8">
                  {[
                    { icon: <DollarSign className="w-5 h-5" />, title: "30% Deposit", desc: "Based on selected package" },
                    { icon: <CheckCircle className="w-5 h-5" />, title: "Lock Pricing", desc: "Protect against increases" },
                    { icon: <Package className="w-5 h-5" />, title: "Reserve Materials", desc: "Production allocation secured" },
                    { icon: <CheckCircle className="w-5 h-5" />, title: "Full Credit", desc: "100% toward final package" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-4 bg-gray-50 p-4 rounded-xl">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Refund Policy:</span> Refundable less 10% admin fee before design approval. Must apply within 6 months.
                  </p>
                </div>
              </div>

              {/* Option 2 */}
              <div className="relative bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] rounded-3xl p-10 text-white shadow-2xl overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="absolute top-0 right-0 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center text-2xl font-light">
                    2
                  </div>
                  <div className="mb-8">
                    <h3 className="text-3xl font-light mb-3">Design Fee to Hold Place</h3>
                    <p className="text-white/90 leading-relaxed">
                      Guarantee your design start position with confirmed calendar slot
                    </p>
                  </div>
                  <div className="space-y-4 mb-8">
                    {[
                      { icon: <AlertCircle className="w-5 h-5" />, title: "Non-Refundable Fee", desc: "Based on unit type" },
                      { icon: <Calendar className="w-5 h-5" />, title: "Confirmed Start", desc: "Reserved Q1 2026 slot" },
                      { icon: <Sparkles className="w-5 h-5" />, title: "Full Design Services", desc: "Complete presentations" },
                      { icon: <CheckCircle className="w-5 h-5" />, title: "100% Credit", desc: "Applied to production" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-start gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20">
                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="font-medium">{item.title}</p>
                          <p className="text-sm text-white/80">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm border border-white/30 p-5 rounded-lg">
                    <p className="text-sm">
                      <span className="font-semibold">Includes:</span> Intake meeting, floor plans, material selections, and final proposal presentation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Deadline */}
            <div className="relative overflow-hidden bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 rounded-2xl p-8 border-2 border-red-200">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-medium text-gray-900 mb-2">Critical Deadline: December 15, 2025</h4>
                  <p className="text-gray-700">Deposit must be received by this date to guarantee 2025 pricing and secure your production slot</p>
                </div>
              </div>
            </div>

            {/* Payment Schedule */}
            <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-200">
              <h3 className="text-3xl font-light text-[#005670] mb-8 text-center">Payment Schedule</h3>
              <div className="space-y-6">
                {[
                  { percentage: "50%", title: "Initial Deposit", desc: "Upon design approval (less prior credits)", color: "from-[#005670] to-[#007a9a]" },
                  { percentage: "25%", title: "Progress Payment", desc: "Six months before completion", color: "from-[#007a9a] to-[#00a0c8]" },
                  { percentage: "25%", title: "Final Payment", desc: "30 days prior to installation", color: "from-[#00a0c8] to-cyan-400" }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-6 bg-gray-50 p-6 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center text-2xl font-light shadow-lg flex-shrink-0`}>
                      {item.percentage}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-medium text-[#005670] mb-2">{item.title}</h4>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 bg-blue-50 border-l-4 border-[#005670] p-6 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-[#005670] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-[#005670] mb-2">Secure Payment Tracking</h4>
                    <p className="text-sm text-gray-700">All payments processed via wire transfer or check. Track every transaction through your secure portal with automatic notifications.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sustainability Tab */}
        {activeTab === 'sustainability' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-4xl mx-auto">
              <Leaf className="w-16 h-16 text-[#005670] mx-auto mb-6" />
              <h2 className="text-5xl font-light text-[#005670] mb-6 tracking-tight">Environmental Stewardship</h2>
              <p className="text-gray-700 text-xl leading-relaxed">
                We design with intention—not only for how a home looks and feels, 
                but for how it impacts the world around it
              </p>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-gray-700 text-lg leading-relaxed">
                  Hawaii's environment is fragile and finite. Every piece that arrives here stays here, 
                  making responsible sourcing and manufacturing essential to long-term sustainability.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Over 80% of our furnishings are manufactured in Indonesia with direct oversight 
                  of every production stage—from raw materials to final packaging—supporting skilled 
                  craftsmanship and sustainable forestry practices.
                </p>
                <p className="text-gray-700 text-lg leading-relaxed">
                  Complete unit packages minimize excess packaging and consolidate shipments, 
                  dramatically lowering our carbon footprint while ensuring quality control.
                </p>
              </div>
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img src="/images/SAS00286.jpg" alt="Sustainable Design" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: <CheckCircle className="w-10 h-10" />, title: "Quality Control", desc: "Direct oversight reduces waste", color: "from-green-500 to-emerald-500" },
                { icon: <Package className="w-10 h-10" />, title: "Smart Packaging", desc: "Minimal excess materials", color: "from-blue-500 to-cyan-500" },
                { icon: <Ship className="w-10 h-10" />, title: "Efficient Logistics", desc: "Container loading by unit", color: "from-purple-500 to-pink-500" },
                { icon: <TrendingDown className="w-10 h-10" />, title: "Lower Impact", desc: "Consolidated shipments", color: "from-amber-500 to-orange-500" }
              ].map((item, index) => (
                <div key={index} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-gray-100 text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.color} text-white mb-4 group-hover:scale-110 transition-transform duration-500`}>
                    {item.icon}
                  </div>
                  <h3 className="text-lg font-medium text-[#005670] mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Warranty Section */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-10 border border-gray-200">
              <div className="text-center mb-10">
                <Shield className="w-12 h-12 text-[#005670] mx-auto mb-4" />
                <h3 className="text-3xl font-light text-[#005670] mb-3">Warranty & Support</h3>
                <p className="text-gray-600">Your investment is protected with comprehensive coverage and ongoing care</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: "One-Year Warranty", desc: "Coverage against manufacturing defects from installation date", detail: "Structural, hardware, upholstery, and finish issues" },
                  { title: "Care Guidelines", desc: "Detailed maintenance guide provided with every installation", detail: "Cleaning, humidity control, material preservation" },
                  { title: "Ongoing Support", desc: "Continued service beyond warranty at standard rates", detail: "Repairs, refinishing, replacements available" }
                ].map((item, index) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
                    <h4 className="text-lg font-medium text-[#005670] mb-3">{item.title}</h4>
                    <p className="text-gray-700 mb-3">{item.desc}</p>
                    <p className="text-sm text-gray-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quote */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-3xl p-12 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
              <div className="relative text-center max-w-4xl mx-auto">
                <div className="text-6xl text-white/20 mb-6">"</div>
                <p className="text-2xl font-light leading-relaxed mb-6 italic">
                  Every decision we make considers longevity, recyclability, and environmental stewardship. 
                  Our goal: create enduring interiors that respect the land, the people, and the planet that sustain them.
                </p>
                <div className="text-sm tracking-wider uppercase text-white/60">Henderson Design Group</div>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-tight">Questions & Answers</h2>
              <p className="text-gray-600 text-lg">Everything you need to know about the Ālia Furnishing Program</p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors group"
                  >
                    <h3 className="font-medium text-[#005670] pr-4 text-lg group-hover:text-[#007a9a] transition-colors">
                      {faq.question}
                    </h3>
                    <ChevronDown 
                      className={`w-6 h-6 text-[#005670] flex-shrink-0 transition-all duration-300 ${
                        expandedFAQ === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === index && (
                    <div className="px-6 pb-6 animate-fade-in">
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12 p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200">
              <p className="text-gray-600 mb-4 text-lg">Have more questions?</p>
              <button
                onClick={() => scrollToSection('contact')}
                className="inline-flex items-center gap-2 text-[#005670] font-medium hover:gap-3 transition-all text-lg group"
              >
                Contact Our Team 
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Elegant Contact Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-tight">Begin Your Journey</h2>
            <p className="text-gray-600 text-lg">Contact your Ālia sales representative or reach out directly</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { icon: <MapPin className="w-6 h-6" />, title: "Visit Us", content: "74-5518 Kaiwi Street Suite B\nKailua Kona, HI 96740" },
              { icon: <Phone className="w-6 h-6" />, title: "Call Us", content: "(808) 315-8782" },
              { icon: <Mail className="w-6 h-6" />, title: "Email Us", content: "aloha@henderson.house" },
              { icon: <Clock className="w-6 h-6" />, title: "Hours", content: "Mon-Fri: 9AM-5PM HST\nSat: By Appointment" }
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-center border border-gray-100">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#005670] to-[#007a9a] text-white mb-4">
                  {item.icon}
                </div>
                <h3 className="font-medium text-[#005670] mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{item.content}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 text-center">
            <p className="text-gray-700 text-lg leading-relaxed max-w-3xl mx-auto">
              <span className="font-semibold text-[#005670]">Ready to create your island sanctuary?</span><br />
              Schedule your introduction meeting with Henderson Design Group to explore 
              collections, discuss your vision, and begin your Ālia journey.
            </p>
          </div>
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="bg-[#005670] text-white py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-10">
            <div className="md:col-span-2">
              <img src="/images/HDG-Logo.png" alt="Henderson Design Group" className="h-14 mb-6 opacity-90" />
              <p className="text-white/70 leading-relaxed text-sm">
                Henderson Design Group specializes in curated, turnkey furnishing solutions 
                for Hawaii's premier residential developments. Creating exceptional interiors 
                with sustainable practices and timeless elegance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 tracking-wide">Navigation</h3>
              <div className="space-y-2 text-sm text-white/70">
                {['overview', 'collections', 'process', 'investment', 'sustainability', 'faq'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => { setActiveTab(tab); scrollToSection('main-content'); }} 
                    className="block hover:text-white transition-colors capitalize"
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 tracking-wide">Important Dates</h3>
              <div className="space-y-2 text-sm text-white/70">
                <p>Deposit Deadline:<br /><span className="text-white font-medium">December 15, 2025</span></p>
                <p>Design Phase:<br /><span className="text-white">Feb - Apr 2026</span></p>
                <p>Installation:<br /><span className="text-white">Jan - Mar 2027</span></p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center">
            <p className="text-white/60 text-sm mb-2">Ālia Project by Henderson Design Group</p>
            <p className="text-white/40 text-xs">&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ken-burns {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
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

export default BrochureLandingPage;