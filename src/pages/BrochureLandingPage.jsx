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
  AlertCircle
} from 'lucide-react';

const BrochureLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [activeCollection, setActiveCollection] = useState('nalu');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
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
      description: 'Complete bespoke-level furnishing, including custom cabinetry, curated art, premium rugs, and designer accessories.',
      features: ['Custom Design', 'Premium Materials', 'Full Accessories', 'Art Curation'],
      details: 'The Lani Collection represents the pinnacle of Hawaiian luxury living, with every element thoughtfully selected and customized for your unique space.'
    },
    {
      id: 'nalu',
      name: 'Nalu Collection',
      description: 'Comprehensive furnishing with elevated design details and refined finish selections for sophisticated island living.',
      features: ['Elevated Design', 'Quality Finishes', 'Coordinated Style', 'Designer Touches'],
      details: 'Nalu offers the perfect balance of sophistication and island comfort, with carefully curated pieces that create a cohesive, elegant environment.'
    },
    {
      id: 'foundation',
      name: 'Foundation Collection',
      description: 'Streamlined essentials for move-in-ready comfort with quality furnishings and functional elegance.',
      features: ['Core Furnishings', 'Move-In Ready', 'Quality Basics', 'Functional Design'],
      details: 'Foundation provides all the essentials for comfortable island living, with quality pieces that allow you to personalize your space over time.'
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
  }, []);

  // Auto-advance slides
  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [imagesLoaded, heroSlides.length]);

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-freight">
      {/* Hero Section with Slideshow */}
      <section className="relative h-screen overflow-hidden">
        {!imagesLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-5xl tracking-widest font-light mb-4">HENDERSON</div>
              <div className="text-xl tracking-wider font-light">DESIGN GROUP</div>
            </div>
          </div>
        )}

        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index && imagesLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>
          </div>
        ))}

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Header */}
          <header className="flex justify-between items-center p-8">
            <img 
              src="/images/HDG-Logo.png" 
              alt="Henderson Design Group" 
              className="h-12"
            />
            <button
              onClick={() => navigate('/designer-login')}
              className="text-white/90 hover:text-white text-sm tracking-wide transition-colors"
            >
              Designer Login →
            </button>
          </header>

          {/* Hero Text */}
          <div className="px-8 pb-32 max-w-4xl">
            <h1 className="text-white text-6xl md:text-7xl font-light tracking-wide mb-6">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-white/90 text-2xl md:text-3xl font-light tracking-wide mb-12">
              {heroSlides[currentSlide].subtitle}
            </p>
            <button
              onClick={() => scrollToSection('collections')}
              className="bg-white text-[#005670] px-8 py-4 text-lg tracking-wide hover:bg-white/95 transition-all duration-300 flex items-center gap-2"
            >
              Explore Collections <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slide Indicators */}
          {imagesLoaded && (
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'bg-white w-12' : 'bg-white/50 w-2'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Ālia Project */}
      <section id="about" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light text-[#005670] mb-6 tracking-wide">
            Ālia Project
          </h2>
          <p className="text-gray-700 text-xl leading-relaxed max-w-3xl mx-auto">
            Henderson Design Group brings over three decades of expertise to Hawaii's most 
            prestigious residential projects. The Ālia Project represents the pinnacle of 
            island living—where modern elegance meets Hawaiian authenticity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center p-6">
            <Home className="w-12 h-12 text-[#005670] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-[#005670] mb-3">Turnkey Solutions</h3>
            <p className="text-gray-600 leading-relaxed">
              Complete furnishing packages from furniture to final styling, ready for you to move in and enjoy.
            </p>
          </div>
          <div className="text-center p-6">
            <Users className="w-12 h-12 text-[#005670] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-[#005670] mb-3">Personalized Service</h3>
            <p className="text-gray-600 leading-relaxed">
              Dedicated design team to understand your lifestyle and create spaces that reflect your vision.
            </p>
          </div>
          <div className="text-center p-6">
            <Sparkles className="w-12 h-12 text-[#005670] mx-auto mb-4" />
            <h3 className="text-xl font-medium text-[#005670] mb-3">Island Living</h3>
            <p className="text-gray-600 leading-relaxed">
              Designs that embrace Hawaiian culture, climate, and the relaxed elegance of island life.
            </p>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section id="collections" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-wide">
              Our Collections
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Choose from three carefully curated collections, each designed to complement 
              the Ālia architecture and Hawaiian lifestyle. Mix between collections or request fully custom design.
            </p>
          </div>

          {/* Collection Tabs */}
          <div className="flex justify-center gap-4 mb-12 flex-wrap">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  activeCollection === collection.id
                    ? 'bg-[#005670] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>

          {/* Active Collection Details */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            {collections.map((collection) => (
              collection.id === activeCollection && (
                <div key={collection.id}>
                  <h3 className="text-3xl font-light text-[#005670] mb-6">
                    {collection.name}
                  </h3>
                  <p className="text-gray-700 text-lg mb-4 leading-relaxed">
                    {collection.description}
                  </p>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {collection.details}
                  </p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {collection.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => scrollToSection('process')}
              className="text-[#005670] font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              Learn About Our Process <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-wide">
              Our Process
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              From initial consultation to final installation, we guide you through every 
              step of creating your perfect island sanctuary.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Design Questionnaire",
                description: "Complete our comprehensive intake form to share your lifestyle, preferences, and vision for your Ālia home.",
                icon: <FileText className="w-8 h-8 text-[#005670]" />
              },
              {
                step: "02",
                title: "Design Development",
                description: "Our team creates customized layouts and curated selections tailored to your unit and personal style. Two design presentations included.",
                icon: <Sparkles className="w-8 h-8 text-[#005670]" />
              },
              {
                step: "03",
                title: "Deposit & Scheduling",
                description: "Secure 2025 pricing or reserve your design slot. Once approved, we schedule production and confirm your timeline.",
                icon: <Calendar className="w-8 h-8 text-[#005670]" />
              },
              {
                step: "04",
                title: "Installation & Reveal",
                description: "We handle production in Indonesia, shipping, and white-glove installation. Your unit is ready to enjoy in 6-8 days.",
                icon: <Home className="w-8 h-8 text-[#005670]" />
              }
            ].map((item) => (
              <div key={item.step} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow duration-300">
                <div className="mb-4">{item.icon}</div>
                <div className="text-[#005670] text-4xl font-light mb-4 opacity-30">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium text-[#005670] mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Overview */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#005670] mb-4 tracking-wide">
              Project Timeline
            </h2>
            <p className="text-gray-600 text-lg">
              Estimated November 2025 – March 2027
            </p>
          </div>

          <div className="space-y-8">
            {[
              { phase: "Nov 2025 - Jan 2026", title: "Client Onboarding", description: "Initial meetings, questionnaires, deposit collection, and portal activation" },
              { phase: "Feb - Apr 2026", title: "Design Phase", description: "Design intake meetings, two presentations, revisions, and final approvals" },
              { phase: "May - Sep 2026", title: "Production", description: "Manufacturing in Indonesia with rigorous quality control and progress updates" },
              { phase: "Oct - Dec 2026", title: "Shipping & Logistics", description: "Container shipping, customs coordination, and delivery scheduling" },
              { phase: "Jan - Mar 2027", title: "Installation", description: "White-glove delivery, professional installation (6-8 days), and reveal" }
            ].map((phase, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-[#005670] text-white flex items-center justify-center font-light text-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="text-sm text-[#005670] font-medium mb-2">{phase.phase}</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{phase.title}</h3>
                    <p className="text-gray-600">{phase.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deposit Options Section */}
      <section id="deposit-options" className="py-24 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-light text-[#005670] mb-4 tracking-wide">
              Your Path Forward
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Two flexible options to secure your place in the Ālia Furnishing Program
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1 - Deposit to Hold Pricing */}
            <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-8 hover:border-[#005670] transition-all duration-300">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#005670] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-light">
                  1
                </div>
                <h3 className="text-2xl font-medium text-[#005670] mb-2">
                  Deposit to Hold 2025 Pricing
                </h3>
                <p className="text-gray-600">
                  Secure current pricing while finalizing your design
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">30% Deposit</p>
                    <p className="text-sm text-gray-600">Based on selected furnishing package</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Lock 2025 Pricing</p>
                    <p className="text-sm text-gray-600">Protect against price increases</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Reserve Materials</p>
                    <p className="text-sm text-gray-600">Production allocation secured</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-gray-900">Full Credit Applied</p>
                    <p className="text-sm text-gray-600">100% toward final package</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <p className="font-medium text-blue-900 mb-1">Refund Policy</p>
                <p className="text-blue-800">Refundable less 10% admin fee if cancelled before design approval. Must be applied within 6 months or credit expires.</p>
              </div>
            </div>

            {/* Option 2 - Design Fee */}
            <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] text-white rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                MOST POPULAR
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-white text-[#005670] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-light">
                  2
                </div>
                <h3 className="text-2xl font-medium mb-2">
                  Design Fee to Hold Place in Line
                </h3>
                <p className="text-white/90">
                  Guarantee your design start position
                </p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Non-Refundable Fee</p>
                    <p className="text-sm text-white/80">Based on unit type and bedrooms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Confirmed Start Date</p>
                    <p className="text-sm text-white/80">Reserved in Q1 2026 calendar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">Complete Design Services</p>
                    <p className="text-sm text-white/80">Intake, layouts, 2 presentations, 1 revision</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium">100% Credit Applied</p>
                    <p className="text-sm text-white/80">Full amount toward production</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 border border-white/30 rounded-lg p-4 text-sm">
                <p className="font-medium mb-1">What's Included</p>
                <p className="text-white/90">Design intake meeting, floor plan review, material selections, and final proposal presentation</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12 p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-center justify-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <p className="text-gray-900 text-lg font-medium">
                Important Deadline: December 15, 2025
              </p>
            </div>
            <p className="text-gray-600">
              Deposit must be received by this date to guarantee 2025 pricing
            </p>
          </div>
        </div>
      </section>

      {/* Payment Schedule Section */}
      <section className="py-24 px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-[#005670] mb-4 tracking-wide">
              Payment Structure
            </h2>
            <p className="text-gray-600 text-lg">
              Clear, straightforward payment milestones throughout your journey
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#005670] text-white flex items-center justify-center text-2xl font-light">
                  50%
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-[#005670] mb-2">Initial Deposit</h3>
                <p className="text-gray-700 mb-2">
                  Due upon approval of your furnishing proposal
                </p>
                <p className="text-sm text-gray-600">
                  Less any prior deposits or credits. This activates production and scheduling. Your total price is based on the final approved design.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#007a9a] text-white flex items-center justify-center text-2xl font-light">
                  25%
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-[#005670] mb-2">Progress Payment</h3>
                <p className="text-gray-700 mb-2">
                  Due six months before completion of production and shipping
                </p>
                <p className="text-sm text-gray-600">
                  Covers production completion and shipping preparation. Invoiced automatically through your portal.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 flex items-start gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-full bg-[#00a0c8] text-white flex items-center justify-center text-2xl font-light">
                  25%
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-medium text-[#005670] mb-2">Final Payment</h3>
                <p className="text-gray-700 mb-2">
                  Due 30 days prior to installation
                </p>
                <p className="text-sm text-gray-600">
                  Final balance or remaining amount before white-glove delivery and installation begins. Payment in full required before shipment.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Payment Methods</h4>
                <p className="text-blue-800 text-sm">
                  All payments accepted via wire transfer or check in U.S. Dollars, payable to Henderson Design Group. Payment tracking available 24/7 through your secure client portal with automatic email notifications.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Portal CTA */}
      <section className="py-24 px-8 bg-gradient-to-br from-[#005670] to-[#007a9a]">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">
            Already Made Your Down Payment?
          </h2>
          <p className="text-white/90 text-xl mb-4 leading-relaxed">
            Access your centralized workspace for all documents, design selections, approvals, and communication.
          </p>
          <p className="text-white/80 text-lg mb-8">
            Schedule your personalized design consultation and track your project every step of the way.
          </p>
          <button
            onClick={() => navigate('/client-portal')}
            className="bg-white text-[#005670] px-10 py-4 text-lg font-medium tracking-wide hover:bg-gray-100 transition-all duration-300 inline-flex items-center gap-3"
          >
            <Calendar className="w-6 h-6" />
            Access Client Portal
          </button>
        </div>
      </section>

      {/* Environmental Commitment */}
      <section id="sustainability" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Leaf className="w-16 h-16 text-[#005670] mx-auto mb-6" />
            <h2 className="text-5xl font-light text-[#005670] mb-6 tracking-wide">
              Our Environmental Commitment
            </h2>
            <p className="text-gray-700 text-xl leading-relaxed max-w-4xl mx-auto">
              We design with intention—not only for how a home looks and feels, but for 
              how it impacts the world around it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                Hawaii's environment is fragile and finite. Every piece that arrives here stays here, 
                which means responsible sourcing and manufacturing are essential to long-term sustainability.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                By producing over eighty percent of our furnishings in Indonesia, we directly oversee 
                every stage of production—from raw materials to final packaging. This allows us to maintain 
                consistent quality while supporting skilled craftsmanship and sustainable forestry practices.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Working with trusted partners enables us to build and ship complete unit packages, 
                minimizing excess packaging and consolidating shipments to dramatically lower our carbon footprint.
              </p>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <img
                src="/images/SAS00286.jpg"
                alt="Sustainable Design"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Environmental Benefits */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <CheckCircle className="w-10 h-10 text-[#005670]" />,
                title: "Quality Control",
                description: "Direct oversight reduces waste at source and maintains consistent quality throughout production."
              },
              {
                icon: <Package className="w-10 h-10 text-[#005670]" />,
                title: "Smart Packaging",
                description: "Complete unit packages minimize excess packaging and redundant freight shipments."
              },
              {
                icon: <Ship className="w-10 h-10 text-[#005670]" />,
                title: "Efficient Logistics",
                description: "Container loading by unit reduces handling, damage, and streamlines delivery process."
              },
              {
                icon: <TrendingDown className="w-10 h-10 text-[#005670]" />,
                title: "Lower Impact",
                description: "Consolidated shipments dramatically reduce carbon footprint vs. multi-vendor purchasing."
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="mb-4 flex justify-center">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-medium text-[#005670] mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-gray-50 p-12 rounded-lg text-center">
            <p className="text-gray-700 text-xl leading-relaxed max-w-4xl mx-auto italic">
              "Every decision we make, from material selection to shipping and installation, considers 
              longevity, recyclability, and environmental stewardship. Our goal: create enduring interiors 
              that respect the land, the people, and the planet that sustain them."
            </p>
          </div>
        </div>
      </section>

      {/* Warranty & Support */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-16">
            <Shield className="w-16 h-16 text-[#005670] mx-auto mb-6" />
            <h2 className="text-4xl font-light text-[#005670] mb-4 tracking-wide">
              Warranty & Aftercare
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Your investment is protected with our comprehensive warranty and ongoing support
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium text-[#005670] mb-4">One-Year Warranty</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Coverage against manufacturing defects in materials and workmanship from installation date.
              </p>
              <p className="text-sm text-gray-500">
                Includes structural defects, hardware failures, upholstery stitching, and finish problems
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium text-[#005670] mb-4">Care & Maintenance</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Detailed care guide provided with every installation to help preserve your furnishings.
              </p>
              <p className="text-sm text-gray-500">
                Guidelines for cleaning, humidity control, and protecting natural materials
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium text-[#005670] mb-4">Ongoing Support</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Continued service and support available beyond warranty period at standard rates.
              </p>
              <p className="text-sm text-gray-500">
                Contact your project manager anytime for repairs, refinishing, or replacements
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8">
            <h3 className="text-2xl font-light text-[#005670] mb-6">What's Not Covered</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Normal wear and tear, fading, or aging",
                "Damage from misuse, neglect, or accidents",
                "Natural variations in wood, stone, or fabric",
                "Shrinkage from humidity or temperature changes",
                "Improper cleaning or unapproved products",
                "Building construction or environmental damage"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-600">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-900">
                <span className="font-medium">Filing a Claim:</span> Submit requests through your HDG portal with photos and description. We respond within 10 business days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-8">
          <h2 className="text-4xl font-light text-[#005670] mb-12 text-center tracking-wide">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-lg font-medium text-[#005670] pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown 
                    className={`w-5 h-5 text-[#005670] flex-shrink-0 transition-transform ${
                      expandedFAQ === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Have more questions?</p>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-[#005670] font-medium inline-flex items-center gap-2 hover:gap-3 transition-all"
            >
              Contact Our Team <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl font-light text-[#005670] mb-8 tracking-wide">
                Get In Touch
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-[#005670] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      74-5518 Kaiwi Street Suite B<br />
                      Kailua Kona, HI 96740-3145
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-[#005670] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-600">(808) 315-8782</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[#005670] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-600">aloha@henderson.house</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[#005670] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">
                      Monday - Friday: 9:00 AM - 5:00 PM HST<br />
                      Saturday: By Appointment<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-6 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed">
                  <span className="font-medium text-[#005670]">Ready to begin?</span><br />
                  Contact your Ālia sales representative or reach out directly to Henderson Design Group 
                  to schedule your introduction meeting.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden">
              <img
                src="/images/SAS00319.jpg"
                alt="Henderson Design Group"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

{/* Footer */}
      <footer className="bg-[#005670] text-white py-12 px-8 font-freight">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
          <div>
            <img 
              src="/images/HDG-Logo.png" 
              alt="Henderson Design Group" 
              className="h-16 mb-4"
            />
            <p className="text-white/80 text-sm leading-relaxed">
              Henderson Design Group specializes in curated, turnkey furnishing solutions for Hawaii's premier residential developments. We create exceptional interiors with sustainable practices and timeless elegance, honoring the land, people, and planet that sustain us.
            </p>
          </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                    About Ālia
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('collections')} className="hover:text-white transition-colors">
                    Collections
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('process')} className="hover:text-white transition-colors">
                    Our Process
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('deposit-options')} className="hover:text-white transition-colors">
                    Deposit Options
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('sustainability')} className="hover:text-white transition-colors">
                    Sustainability
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/client-portal')} className="hover:text-white transition-colors">
                    Client Portal
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Professional Access</h3>
              <ul className="space-y-2 text-white/80 text-sm mb-6">
                <li>
                  <button onClick={() => navigate('/designer-login')} className="hover:text-white transition-colors">
                    Designer Login
                  </button>
                </li>
              </ul>
              <h3 className="text-lg font-medium mb-4">Important Dates</h3>
              <p className="text-white/80 text-sm">
                Deposit Deadline: December 15, 2025<br />
                Design Phase: Feb - Apr 2026<br />
                Installation: Jan - Mar 2027
              </p>
            </div>
          </div>
          <div className="border-t border-white/20 pt-8 text-center text-white/60 text-sm">
            <p className="mb-2">Ālia Project by Henderson Design Group</p>
            <p>&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BrochureLandingPage;