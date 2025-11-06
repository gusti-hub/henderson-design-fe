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
  Home,
  Sparkles,
  ArrowRight,
  ChevronDown,
  DollarSign,
  AlertCircle,
  Info,
  Heart,
  Download,
   X 
} from 'lucide-react';

// Navigation Component
const Navigation = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (activeTab === 'about') {
        setIsScrolled(window.scrollY > 50);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeTab]);
  
  const needsSolidBg = activeTab !== 'about';
  
  const tabs = [
    { id: 'about', label: 'About', icon: <Home className="w-4 h-4" /> },
    { id: 'collection', label: 'Collection', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'inspiration', label: 'Inspiration', icon: <Heart className="w-4 h-4" /> },
    { id: 'process', label: 'Process', icon: <Calendar className="w-4 h-4" /> },
    { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { id: 'next-steps', label: 'Next Steps', icon: <ArrowRight className="w-4 h-4" /> },
    { id: 'faq', label: 'FAQ', icon: <Info className="w-4 h-4" /> },
    { id: 'payment', label: 'Payment', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'warranty', label: 'Warranty & Care', icon: <Shield className="w-4 h-4" /> },
    { id: 'environment', label: 'Environment', icon: <Leaf className="w-4 h-4" /> },
    { id: 'questionnaire', label: 'Questionnaire', icon: <FileText className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <Mail className="w-4 h-4" /> }
  ];

  return (
    <header className={`${activeTab === 'about' ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-500 ${
      needsSolidBg 
        ? 'bg-white border-b border-gray-100 shadow-sm' 
        : 'bg-gradient-to-b from-black/20 to-transparent backdrop-blur-[2px]'
    }`}>
      <div className="px-6">
        <div className="flex items-center py-4">
          <div className="relative">
            <img 
              src="/images/HDG-Logo.png" 
              alt="Henderson Design Group" 
              className="h-12 cursor-pointer hover:opacity-80 transition-all duration-500"
              style={{
                filter: needsSolidBg ? 'invert(1)' : 'brightness(0) invert(1)',
                display: 'block'
              }}
              onClick={() => setActiveTab('about')}
            />
          </div>
          
          <nav className="hidden lg:flex items-center gap-1 ml-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-light whitespace-nowrap flex items-center gap-2 transition-all duration-500 rounded relative group ${
                  needsSolidBg
                    ? activeTab === tab.id
                      ? 'text-[#005670] bg-[#005670]/5'
                      : 'text-gray-600 hover:text-[#005670] hover:bg-gray-50'
                    : activeTab === tab.id
                      ? 'text-white bg-white/10 backdrop-blur-md'
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="tracking-wide">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    needsSolidBg ? 'bg-[#005670]' : 'bg-white'
                  }`}></div>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate('/designer-login')}
            className={`hidden md:flex items-center gap-2 text-sm font-light tracking-wide hover:gap-3 transition-all ml-auto ${
              needsSolidBg 
                ? 'text-[#005670] hover:text-[#004a5c]' 
                : 'text-white/90 hover:text-white'
            }`}
          >
            Designer Access
            <ArrowRight className="w-4 h-4" />
          </button>

          <button className={`lg:hidden p-2 transition-colors ml-auto ${
            needsSolidBg 
              ? 'text-gray-600 hover:text-[#005670]' 
              : 'text-white/90 hover:text-white'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="lg:hidden pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-light whitespace-nowrap flex items-center gap-2 transition-all duration-500 rounded ${
                  needsSolidBg
                    ? activeTab === tab.id
                      ? 'bg-[#005670] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : activeTab === tab.id
                      ? 'bg-white/20 text-white backdrop-blur-md border border-white/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section Component  
const HeroSection = ({ setActiveTab }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

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

  useEffect(() => {
    if (!imagesLoaded) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [imagesLoaded, heroSlides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#005670] via-[#007a9a] to-[#00a0c8] flex items-center justify-center">
          <div className="text-center text-white animate-pulse">
            {/* <div className="text-7xl tracking-[0.3em] font-light mb-6">HENDERSON</div>
            <div className="text-2xl tracking-[0.2em] font-light opacity-80">DESIGN GROUP</div> */}
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

      <div className="relative z-10 h-full flex items-center">
        <div className="px-8 md:px-16 max-w-6xl mx-auto">
          <div className="opacity-0 animate-fade-in-up" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            <div className="text-white/60 text-sm tracking-[0.3em] uppercase mb-4 font-light">
              Ālia Project
            </div>
            <h1 className="text-white text-7xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 leading-tight">
              {heroSlides[currentSlide].title}
            </h1>
            <p className="text-white/90 text-2xl md:text-3xl font-light tracking-wide mb-12 max-w-2xl">
              {heroSlides[currentSlide].subtitle}
            </p>
            <button
              onClick={() => setActiveTab('collection')}
              className="group bg-white/10 backdrop-blur-md border border-white/30 text-white px-10 py-4 text-base tracking-[0.15em] uppercase hover:bg-white hover:text-[#005670] transition-all duration-500 flex items-center gap-3"
            >
              Explore Collections
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-500" />
            </button>
          </div>
        </div>

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
  );
};

// About Page - Simple, clean and elegant
const AboutPage = ({ setActiveTab }) => {
  const navigate = useNavigate();
  
  return (
    <div className="animate-fade-in">
      <HeroSection setActiveTab={setActiveTab} />
      
      {/* About Alia Collection */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-light text-[#005670] mb-8 text-center">About Ālia Collection</h2>
          
          <div className="space-y-6 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              Three carefully curated collections designed to complement the Ālia architecture. 
              Each collection offers distinct levels of customization and finish, from streamlined 
              essentials to complete bespoke furnishing.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Mix between collections or work with our design team to create a fully custom solution 
              that reflects your unique vision and lifestyle. Every piece is thoughtfully selected to 
              honor island living and Hawaiian culture.
            </p>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => setActiveTab('collection')}
              className="inline-flex items-center gap-2 bg-[#005670] text-white px-10 py-4 hover:bg-[#004a5c] transition-all"
            >
              Explore Collections
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* About HDG - Our Story */}
      <section className="py-32 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-light text-[#005670] mb-4 text-center">About Henderson Design Group</h2>
          <p className="text-xl text-gray-500 text-center mb-12 italic">Our Story</p>
          
          <div className="space-y-8 text-gray-700">
            <p className="text-lg leading-relaxed">
              Established by Eric Henderson in 2002, Henderson Design Group has built a reputation 
              for refinement and style, and for respecting the values of clients and enhancing the 
              aesthetics of the homes on which we work.
            </p>
            
            <p className="text-lg leading-relaxed">
              Eric approaches his life's work by fusing the personal with the practical, along the 
              way delivering an enduring aesthetic that exudes a sense of relaxed sophistication. 
              Henderson's signature marries clean lines with touches of playfulness to create a 
              unique aesthetic designed for island living.
            </p>
            
            <blockquote className="text-lg italic text-gray-600 border-l-4 border-[#005670] pl-6 py-2 my-8">
              "We create organized, symmetrical floor plans where the furniture layouts encourage 
              conversation when occupied or contemplation when on your own. Comfort is always 
              incorporated into the design, where every movement is anticipated."
              <footer className="text-sm text-gray-500 mt-2 not-italic">— Eric Henderson</footer>
            </blockquote>
            
            <p className="text-lg leading-relaxed">
              Over the past 15 years furnishing homes on the islands of Hawaii, Henderson has grown 
              into a team of established, reliable, and experienced designers with offices in Hawaii 
              and San Francisco. We design and furnish homes for a lifestyle and state of mind that 
              is based on comfort, elegance, and warmth. Our clients know that they can count on our 
              experience and know-how to deliver smart and sophisticated solutions, top quality pieces, 
              first-rate service, and our willingness to go the extra mile every time.
            </p>
          </div>
        </div>
      </section>

{/* About Team - Real Images & High-Class Design */}
  <section className="py-32 px-8 bg-white">
    <div className="max-w-6xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-20">
        <div className="inline-block mb-6">
          <div className="text-xs tracking-[0.4em] uppercase text-[#005670]/70 font-light mb-4">
            Our Team
          </div>
          <div className="h-px w-16 bg-[#005670]/30 mx-auto"></div>
        </div>
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 leading-tight tracking-tight">
          Meet Your Design Team
        </h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed max-w-3xl mx-auto">
          A dedicated group of established, reliable, and experienced designers committed to 
          delivering exceptional results for every Ālia residence
        </p>
      </div>
      
      {/* Team Grid - Featured Members with Real Photos */}
      <div className="grid md:grid-cols-3 gap-16 mb-20">
        {[
          { 
            name: 'Eric Henderson', 
            role: 'CEO & Creative Director', 
            image: '/images/team/eric.jpg',
            bio: 'Founder guiding every project with refined vision and over 20 years of design excellence'
          },
          { 
            name: 'Janelle', 
            role: 'Creative Director', 
            image: '/images/team/Janelle.jpg',
            bio: 'Ensuring seamless execution from concept through installation with meticulous attention to detail'
          },
          { 
            name: 'Madeline', 
            role: 'Project Manager', 
            image: '/images/team/Madeline.jpg',
            bio: 'Your dedicated point of contact throughout the journey, ensuring clear communication'
          }
        ].map((member, index) => (
          <div key={index} className="group text-center">
            {/* Photo with Hover Effect */}
            <div className="relative mb-8 overflow-hidden">
              <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                <img 
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>
            {/* Info */}
            <h3 className="text-2xl font-light text-gray-900 mb-2">{member.name}</h3>
            <p className="text-sm text-[#005670] mb-4 tracking-wide uppercase font-light">{member.role}</p>
            <p className="text-gray-600 leading-relaxed font-light">{member.bio}</p>
          </div>
        ))}
      </div>

      {/* Additional Team Members - Without Photos */}
      <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
        {[
          { name: 'Ash', role: 'Design Manager', bio: 'Leading design development and material curation with expertise' },
          { name: 'Daiki', role: 'Production Coordinator', bio: 'Maintaining quality standards and project timelines' }
        ].map((member, index) => (
          <div key={index} className="group text-center p-8 border border-gray-100 hover:border-[#005670]/30 transition-all duration-500">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center border border-gray-100 group-hover:border-[#005670]/30 transition-all duration-500">
              <span className="text-3xl font-extralight text-[#005670]/30 group-hover:text-[#005670]/50 transition-colors duration-500">
                {member.name[0]}
              </span>
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">{member.name}</h3>
            <p className="text-sm text-[#005670] mb-4 tracking-wide uppercase font-light">{member.role}</p>
            <p className="text-sm text-gray-600 leading-relaxed font-light">{member.bio}</p>
          </div>
        ))}
      </div>
    </div>
  </section>

      {/* Client Portal CTA */}
      <section className="py-20 px-6 bg-[#005670]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl font-light mb-6">Already Made Your Deposit?</h3>
          <p className="text-lg text-white/90 mb-8 leading-relaxed max-w-2xl mx-auto">
            Access your personalized client portal to schedule your design consultation, 
            review selections, and track your project journey.
          </p>
          <button
            onClick={() => navigate('/client-portal')}
            className="inline-flex items-center gap-3 bg-white text-[#005670] px-10 py-4 hover:bg-gray-100 transition-all"
          >
            <Calendar className="w-5 h-5" />
            Access Your Portal
          </button>
        </div>
      </section>
    </div>
  );
};

// Collection Page - Luxurious, elegant and simple
const CollectionPage = () => {
  const [activeCollection, setActiveCollection] = useState('nalu');

  const collections = [
    {
      id: 'nalu',
      name: 'Nalu Collection',
      tagline: 'Sophisticated Balance',
      description: 'Comprehensive furnishing with elevated design details and refined finish selections for sophisticated island living.',
      features: [
        'Elevated Design',
        'Quality Finishes', 
        'Coordinated Style',
        'Designer Touches'
      ],
      details: 'Nalu offers the perfect balance of sophistication and island comfort, with carefully curated pieces that create a cohesive, elegant environment.',
      lookbook: '/pdfs/nalu-lookbook.pdf'
    },
    {
      id: 'lani',
      name: 'Lani Collection',
      tagline: 'The Pinnacle of Luxury',
      description: 'Complete bespoke-level furnishing, including custom cabinetry, curated art, premium rugs, and designer accessories.',
      features: [
        'Custom Design',
        'Premium Materials',
        'Full Accessories',
        'Art Curation'
      ],
      details: 'The Lani Collection represents the pinnacle of Hawaiian luxury living, with every element thoughtfully selected and customized for your unique space.',
      lookbook: '/pdfs/lani-lookbook.pdf'
    },
    {
      id: 'foundation',
      name: 'Foundation Collection',
      tagline: 'Elegant Essentials',
      description: 'Streamlined essentials for move-in-ready comfort with quality furnishings and functional elegance.',
      features: [
        'Core Furnishings',
        'Move-In Ready',
        'Quality Basics',
        'Functional Design'
      ],
      details: 'Foundation provides all the essentials for comfortable island living, with quality pieces that allow you to personalize your space over time.',
      lookbook: '/pdfs/foundation-lookbook.pdf'
    }
  ];

  const activeCollectionData = collections.find(c => c.id === activeCollection);

  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Ālia Collections</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          Three carefully curated expressions of island living, each designed to complement 
          the Ālia architecture with distinct levels of customization and refinement.
        </p>
      </div>

      {/* Collection Selector - Elegant Tabs */}
      <div className="flex justify-center gap-0 mb-20 max-w-4xl mx-auto border-b border-gray-100">
        {collections.map((collection) => (
          <button
            key={collection.id}
            onClick={() => setActiveCollection(collection.id)}
            className={`flex-1 px-8 py-6 font-light transition-all duration-500 border-b-2 ${
              activeCollection === collection.id
                ? 'border-[#005670] text-[#005670]'
                : 'border-transparent text-gray-500 hover:text-[#005670]'
            }`}
          >
            <div className="text-xl mb-1">{collection.name}</div>
            <div className="text-sm opacity-70">{collection.tagline}</div>
          </button>
        ))}
      </div>

      {/* Collection Content */}
      {activeCollectionData && (
        <div className="animate-fade-in">
          <div className="max-w-5xl mx-auto">
            {/* Main Description */}
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-2xl text-gray-700 leading-relaxed font-light mb-6">
                {activeCollectionData.description}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed font-light">
                {activeCollectionData.details}
              </p>
            </div>

            {/* Features Grid */}
            <div className="mb-16">
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {activeCollectionData.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-6 bg-gray-50">
                    <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                    <span className="text-lg text-gray-700 font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lookbook Download */}
            <div className="max-w-2xl mx-auto">
              <a
                href={activeCollectionData.lookbook}
                target="_blank"
                rel="noopener noreferrer"
                className="group block bg-white border-2 border-gray-100 hover:border-[#005670] transition-all duration-500 overflow-hidden"
              >
                <div className="flex items-center justify-between p-8">
                  <div className="flex-1">
                    <h3 className="text-2xl font-light text-[#005670] mb-2">View Lookbook</h3>
                    <p className="text-gray-600 font-light">
                      Browse the complete {activeCollectionData.name} with detailed imagery and specifications
                    </p>
                  </div>
                  <div className="ml-6 flex items-center justify-center w-16 h-16 rounded-full bg-[#005670] group-hover:bg-[#004a5c] transition-all duration-500">
                    <Download className="w-7 h-7 text-white" />
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Inspiration Page - Elegant gallery with real collection images
const InspirationPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    // { id: 2, src: '/images/collections/2.jpg', title: 'Sophisticated Living' },
    // { id: 4, src: '/images/collections/4.jpg', title: 'Coastal Elegance' },
    // { id: 7, src: '/images/collections/7.jpg', title: 'Island Luxury' },
    // { id: 10, src: '/images/collections/10.jpg', title: 'Modern Comfort' },
    // { id: 13, src: '/images/collections/13.jpg', title: 'Refined Details' },
    // { id: 15, src: '/images/collections/15.jpg', title: 'Curated Spaces' },
    // { id: 17, src: '/images/collections/17.jpg', title: 'Hawaiian Living' },
    // { id: 19, src: '/images/collections/19.jpg', title: 'Designer Touch' },
    // { id: 26, src: '/images/collections/26.jpg', title: 'Timeless Design' }
    { id: 1, src: '/images/collections/1.jpg', title: '' },
    { id: 2, src: '/images/collections/2.jpg', title: '' },
    { id: 3, src: '/images/collections/3.jpg', title: '' },
    { id: 4, src: '/images/collections/4.jpg', title: '' },
    { id: 7, src: '/images/collections/7.jpg', title: '' },
    { id: 8, src: '/images/collections/8.jpg', title: '' },
    { id: 10, src: '/images/collections/10.jpg', title: '' },
    { id: 11, src: '/images/collections/11.jpg', title: '' },
    { id: 12, src: '/images/collections/12.jpg', title: '' },
    { id: 13, src: '/images/collections/13.jpg', title: '' },
    { id: 15, src: '/images/collections/15.jpg', title: '' },
    { id: 16, src: '/images/collections/16.jpg', title: '' },
    { id: 17, src: '/images/collections/17.jpg', title: '' },
    { id: 18, src: '/images/collections/18.jpg', title: '' },
    { id: 19, src: '/images/collections/19.jpg', title: '' },
    { id: 21, src: '/images/collections/21.jpg', title: '' },
    { id: 26, src: '/images/collections/26.jpg', title: '' },
    { id: 27, src: '/images/collections/27.jpg', title: '' },
    { id: 28, src: '/images/collections/28.jpg', title: '' }
  ];

  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Design Inspiration</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          Explore our curated collections and completed Ālia residences
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((image) => (
            <div 
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative aspect-[4/3] overflow-hidden bg-gray-100 cursor-pointer"
            >
              <img 
                src={image.src}
                alt={image.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-xl font-light">{image.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 animate-fade-in"
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 text-white hover:text-gray-300 transition-colors"
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={selectedImage.src}
            alt={selectedImage.title}
            className="max-w-full max-h-[85vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-0 right-0 text-center">
            <h3 className="text-white text-2xl font-light">{selectedImage.title}</h3>
          </div>
        </div>
      )}

      {/* CTA Section */}
      {/* <div className="max-w-4xl mx-auto mt-20 bg-gray-50 p-12 text-center">
        <h3 className="text-2xl font-light text-[#005670] mb-4">Ready to Begin Your Design Journey?</h3>
        <p className="text-gray-600 mb-8 leading-relaxed font-light">
          Schedule your introduction meeting to explore how Henderson Design Group can create your perfect island home.
        </p>
        <a
          href="#contact"
          className="inline-flex items-center gap-2 bg-[#005670] text-white px-8 py-4 hover:bg-[#004a5c] transition-all"
        >
          <Mail className="w-5 h-5" />
          <span className="font-light">Schedule a Meeting</span>
        </a>
      </div> */}
    </div>
  );
};

// Process Page - Complete content from PDF, elegant and simple
const ProcessPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Client Process</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          A seamless journey from introduction to installation, typically 10-12 months
        </p>
      </div>

      {/* Process Steps */}
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Step 1 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">01</span>
            <h3 className="text-2xl font-light text-[#005670]">Engage with Henderson</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            The Ālia sales team introduces Henderson Design Group (HDG) and our curated furnishing 
            collections to the client, sharing the brochure and facilitating a personal introduction to 
            schedule an initial meeting.
          </p>
        </div>

        {/* Step 2 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">02</span>
            <h3 className="text-2xl font-light text-[#005670]">Introduction Meeting and Collection Review</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Henderson Design Group meets with the client, either in person or via an online call, to review 
            the available furniture collections:
          </p>
          <ul className="space-y-2 mb-4 ml-6">
            <li className="text-gray-700">1. Lani Furniture Collection</li>
            <li className="text-gray-700">2. Nalu Furniture Collection</li>
            <li className="text-gray-700">3. Foundation Collection</li>
            <li className="text-gray-700">4. Custom Design</li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            During this meeting, HDG presents the overall design philosophy, collection options, pricing, 
            customization possibilities, and project process. Clients may then decide how they wish to move forward:
          </p>
          <div className="bg-gray-50 p-6 space-y-3">
            <p className="text-gray-700">• Place a <strong>Deposit to Hold 2025 Pricing</strong>, locking in current pricing while finalizing design decisions.</p>
            <p className="text-gray-700">• Place a <strong>Design Fee to Hold Place in Line</strong>, securing a confirmed design start position in HDG's calendar.</p>
            <p className="text-gray-700">• Take time to consider options and contact HDG when ready to proceed.</p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">03</span>
            <h3 className="text-2xl font-light text-[#005670]">Client Portal Access and Onboarding</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Once a client decides to move forward and places either deposit, HDG will send an invitation to 
            the client's personal HDG Project Portal. This portal serves as the central workspace for all 
            information, communication, documents, selections, approvals, and project timelines.
          </p>
          <p className="text-gray-700 font-medium mb-3">When first activated, the client's portal opens in "Welcome Mode," which includes:</p>
          <div className="bg-gray-50 p-6 space-y-2 mb-4">
            <p className="text-gray-700">• HDG collection look books and furniture catalog</p>
            <p className="text-gray-700">• Material and finish library</p>
            <p className="text-gray-700">• Our Process overview and FAQs</p>
            <p className="text-gray-700">• Contact information for the HDG project team</p>
            <p className="text-gray-700">• Design Preferences Questionnaire</p>
          </div>
          <p className="text-gray-700 mb-3">After completing the questionnaire, HDG will reach out to schedule the Design Intake Meeting.</p>
          <p className="text-gray-700 font-medium mb-3">Once the deposit is received, the Design Phase section unlocks, providing access to:</p>
          <div className="bg-gray-50 p-6 space-y-2">
            <p className="text-gray-700">• Unit-specific floor plans and layouts</p>
            <p className="text-gray-700">• Selections and pricing proposals</p>
            <p className="text-gray-700">• Communication threads for design approvals</p>
            <p className="text-gray-700">• Project timeline and dashboard</p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">04</span>
            <h3 className="text-2xl font-light text-[#005670]">Design Intake Meeting</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            A Henderson team member schedules a call or in-person meeting in Hawaii to review the 
            questionnaire and confirm design intent. At this stage, the client is formally introduced to their 
            Henderson Design Team, who will remain their primary point of contact throughout the process. 
            Clients also receive full access to the Design Phase of the HDG software, customized for their 
            unit or floor plan.
          </p>
        </div>

        {/* Step 5 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">05</span>
            <h3 className="text-2xl font-light text-[#005670]">Curated Design Preparation</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Within one to two months of the intake meeting, Henderson prepares a curated design tailored to 
            each client's expectations, budget, and aesthetic.
          </p>
        </div>

        {/* Step 6 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">06</span>
            <h3 className="text-2xl font-light text-[#005670]">Presentation of Curated Design</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Henderson's concierge contacts the client to schedule a design presentation. During this meeting, 
            clients can explore their floor plan and review proposed furnishings. Clients may approve the 
            design as presented or request revisions for a follow-up meeting.
          </p>
        </div>

        {/* Step 7 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">07</span>
            <h3 className="text-2xl font-light text-[#005670]">Finalize and Present the Purchase Agreement</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Once selections are confirmed in the design software by clicking "Confirm My Order," a final 
            meeting is scheduled to review the complete design, budget, and timeline. The client then 
            receives an order acknowledgment and a deposit receipt.
          </p>
        </div>

        {/* Step 8 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">08</span>
            <h3 className="text-2xl font-light text-[#005670]">Procurement, Delivery, and Installation Coordination</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            After orders are placed and vendor timelines are confirmed, Henderson provides an estimated 
            installation date. Final installation dates align with the Ālia delivery schedule, with installations 
            occurring in the order units are released.
          </p>
        </div>

        {/* Step 9 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">09</span>
            <h3 className="text-2xl font-light text-[#005670]">Invoice Schedule</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            Once the furniture package is finalized, clients receive a Purchasing Agreement outlining the payment schedule:
          </p>
          <div className="bg-gray-50 p-6 space-y-4">
            <div>
              <p className="font-medium text-gray-900 mb-1">50% Deposit</p>
              <p className="text-gray-700">Due upon approval of the furnishings proposal (if a 30% deposit was previously placed to hold 2025 pricing, an additional 20% will be due to place the order).</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">25% Progress Payment</p>
              <p className="text-gray-700">Due six months prior to completion of production and shipping.</p>
            </div>
            <div>
              <p className="font-medium text-gray-900 mb-1">25% Final Payment</p>
              <p className="text-gray-700">Due 30 days prior to installation.</p>
            </div>
          </div>
          <p className="text-gray-700 mt-4">All payments are tracked within the design software for full transparency.</p>
        </div>

        {/* Step 10 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">10</span>
            <h3 className="text-2xl font-light text-[#005670]">White-Glove Delivery and Installation</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            Installation dates are confirmed 90 days in advance. Once Henderson receives notice that a unit 
            has been turned over, our concierge coordinates all delivery and installation logistics. Installation 
            typically requires six to eight business days and includes work by external trades such as 
            wallcovering, window coverings, closet systems, and decorative fixtures, all managed by 
            Henderson Design Group. Clients are asked not to be present during installation to ensure 
            efficiency and safety.
          </p>
        </div>

        {/* Step 11 */}
        <div className="border-l-2 border-[#005670] pl-8 py-4">
          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-5xl font-extralight text-[#005670]">11</span>
            <h3 className="text-2xl font-light text-[#005670]">Client Walk-Through and Handover</h3>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed">
            The Henderson concierge schedules a reveal to present the completed unit, review design details, 
            and answer any questions. At this time, the client receives their Care and Maintenance Binder for 
            all furnishings. Your concierge remains your ongoing point of contact for any future assistance 
            or warranty support.
          </p>
        </div>

      </div>

      {/* Timeline Note */}
      <div className="max-w-4xl mx-auto mt-16 bg-gray-50 p-8 text-center">
        <p className="text-lg text-gray-700">
          <strong>Updated October 30, 2025</strong>
        </p>
        <p className="text-gray-600 mt-2">
          Typical process duration: 10-12 months from engagement to installation
        </p>
      </div>
    </div>
  );
};

// Timeline Page - Simple and elegant with complete content
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
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Project Timeline</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          November 2025 – April 2027
        </p>
      </div>

      {/* Interactive Timeline */}
      <div className="max-w-6xl mx-auto mb-20">
        {/* Timeline Navigation */}
        <div className="flex overflow-x-auto pb-6 mb-12 scrollbar-hide border-b border-gray-100">
          {timeline.map((item, index) => (
            <button
              key={index}
              onClick={() => setActivePhase(index)}
              className={`flex-shrink-0 px-6 py-4 transition-all duration-500 border-b-2 ${
                activePhase === index
                  ? 'border-[#005670] text-[#005670]'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className="text-sm mb-1 font-light">{item.period}</div>
              <div className={`text-xs ${activePhase === index ? 'opacity-100' : 'opacity-60'}`}>
                Phase {index + 1}
              </div>
            </button>
          ))}
        </div>

        {/* Active Phase Content */}
        <div className="animate-fade-in">
          <div className="bg-gray-50 p-12">
            <h3 className="text-3xl font-light text-[#005670] mb-8">{timeline[activePhase].phase}</h3>
            <ul className="space-y-4">
              {timeline[activePhase].items.map((item, idx) => (
                <li key={idx} className="flex gap-4 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Arrows */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setActivePhase(Math.max(0, activePhase - 1))}
              disabled={activePhase === 0}
              className={`flex items-center gap-2 px-6 py-3 transition-all ${
                activePhase === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-[#005670] hover:bg-gray-50'
              }`}
            >
              <ChevronDown className="w-5 h-5 rotate-90" />
              Previous Phase
            </button>
            <button
              onClick={() => setActivePhase(Math.min(timeline.length - 1, activePhase + 1))}
              disabled={activePhase === timeline.length - 1}
              className={`flex items-center gap-2 px-6 py-3 transition-all ${
                activePhase === timeline.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-[#005670] hover:bg-gray-50'
              }`}
            >
              Next Phase
              <ChevronDown className="w-5 h-5 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Simplified Summary */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-light text-[#005670] mb-10 text-center">Summary</h3>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-50 p-8">
            <p className="text-gray-600 mb-2">Client Onboarding and Design</p>
            <p className="text-2xl font-light text-[#005670]">Nov 2025 - Apr 2026</p>
          </div>
          <div className="bg-gray-50 p-8">
            <p className="text-gray-600 mb-2">Purchase Agreement and Production</p>
            <p className="text-2xl font-light text-[#005670]">May - Sep 2026</p>
          </div>
          <div className="bg-gray-50 p-8">
            <p className="text-gray-600 mb-2">Shipping and Logistics</p>
            <p className="text-2xl font-light text-[#005670]">Sep - Dec 2026</p>
          </div>
          <div className="bg-gray-50 p-8">
            <p className="text-gray-600 mb-2">Installation and Turnover</p>
            <p className="text-2xl font-light text-[#005670]">Jan - Apr 2027</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mt-12">Updated October 30, 2025</p>
      </div>
    </div>
  );
};

// Next Steps Page - Investment Options dari PDF
const NextStepsPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="pt-24 pb-20 px-6 max-w-6xl mx-auto space-y-16 animate-fade-in">
      {/* Portal Access Banner */}
      <div className="bg-gradient-to-r from-[#005670] to-[#007a9a] text-white p-10 max-w-4xl mx-auto rounded-lg shadow-xl">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-full bg-white/10 backdrop-blur-md mb-6">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-3xl font-light mb-4">Already Made Your Deposit?</h3>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
            If you've already secured your place with a deposit, access your personalized client portal 
            to schedule meetings, review selections, and track your project journey.
          </p>
          <button
            onClick={() => navigate('/client-portal')}
            className="inline-flex items-center gap-3 bg-white text-[#005670] px-10 py-4 hover:bg-gray-100 transition-all duration-500 group rounded-lg shadow-lg"
          >
            <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-light tracking-wide">Access Your Portal</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto">
        <div className="w-16 h-0.5 bg-[#005670] mx-auto mb-8"></div>
        <h2 className="text-5xl font-extralight text-[#005670] mb-6 tracking-tight">Haven't Made a Deposit Yet?</h2>
        <p className="text-gray-600 font-light">
          Two flexible pathways to secure your place in the Ālia Furnishing Program
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Option 1 */}
        <div className="group border border-gray-100 p-10 hover:border-[#005670] transition-all duration-500">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="text-xs tracking-widest uppercase text-gray-500 mb-2 font-light">Option 1</div>
              <h3 className="text-2xl font-extralight text-[#005670]">Deposit to Hold 2025 Pricing</h3>
            </div>
            <div className="w-10 h-10 rounded-full border border-[#005670]/30 text-[#005670] flex items-center justify-center font-light">
              1
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed mb-8 font-light">
            Secure current pricing while finalizing your design decisions
          </p>
          <div className="space-y-4 mb-8">
            {[
              { title: "30% Deposit", desc: "Based on selected package" },
              { title: "Lock Pricing", desc: "Protect against increases" },
              { title: "Reserve Materials", desc: "Production allocation secured" },
              { title: "Full Credit", desc: "100% toward final package" }
            ].map((item, index) => (
              <div key={index} className="flex gap-4 py-3 border-b border-gray-100 last:border-b-0">
                <CheckCircle className="w-4 h-4 text-[#005670] flex-shrink-0 mt-1" />
                <div>
                  <p className="font-light text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600 font-light">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-50/50 border-l-2 border-[#005670] p-4 text-xs font-light">
            <p className="text-gray-700">
              <span className="font-medium">Refund Policy:</span> Refundable less 10% admin fee before design approval. Must apply within 6 months.
            </p>
          </div>
        </div>

        {/* Option 2 */}
        <div className="relative bg-[#005670] text-white p-10 overflow-hidden">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="text-xs tracking-widest uppercase text-white/60 mb-2 font-light">Option 2</div>
                <h3 className="text-2xl font-extralight">Design Fee to Hold Place</h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/30 text-white flex items-center justify-center font-light">
                2
              </div>
            </div>
            <p className="text-white/80 leading-relaxed mb-8 font-light">
              Guarantee your design start position with confirmed calendar slot
            </p>
            <div className="space-y-4 mb-8">
              {[
                { title: "Non-Refundable Fee", desc: "Based on unit type" },
                { title: "Confirmed Start", desc: "Reserved Q1 2026 slot" },
                { title: "Full Design Services", desc: "Complete presentations" },
                { title: "100% Credit", desc: "Applied to production" }
              ].map((item, index) => (
                <div key={index} className="flex gap-4 py-3 border-b border-white/10 last:border-b-0">
                  <CheckCircle className="w-4 h-4 text-white flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-light text-white">{item.title}</p>
                    <p className="text-sm text-white/70 font-light">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/10 border-l-2 border-white/30 p-4 text-xs font-light">
              <p className="text-white/90">
                <span className="font-medium">Includes:</span> Intake meeting, floor plans, material selections, and final proposal presentation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Deadline */}
      <div className="border-2 border-red-200 bg-red-50/50 p-8 max-w-3xl mx-auto rounded-lg">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-xl font-light text-gray-900 mb-2">Critical Deadline: December 15, 2025</h4>
            <p className="text-gray-700 font-light">Deposit must be received by this date to guarantee 2025 pricing and secure your production slot</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// FAQ Page - With Load More concept
const FAQPage = ({ setActiveTab }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6); // Show 6 questions initially

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

  // Flatten all questions with category info
  const allQuestions = faqs.flatMap((cat) => 
    cat.questions.map((q) => ({
      ...q,
      category: cat.category
    }))
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
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
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
            <div key={index} className="bg-white border border-gray-100 hover:border-[#005670]/40 transition-all duration-500 overflow-hidden">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faqId ? null : faqId)}
                className="w-full px-8 py-6 flex items-start justify-between gap-4 text-left"
              >
                <div className="flex-1">
                  <div className="text-xs text-[#005670] mb-2 font-light tracking-widest uppercase">{item.category}</div>
                  <h3 className="text-lg font-light text-gray-900 leading-relaxed">{item.question}</h3>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-[#005670] flex-shrink-0 transition-transform duration-500 mt-1 ${
                    expandedFAQ === faqId ? 'rotate-180' : ''
                  }`}
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
            className="inline-flex items-center gap-3 px-12 py-5 bg-white border-2 border-[#005670] text-[#005670] hover:bg-[#005670] hover:text-white transition-all duration-500 group"
          >
            <span className="font-light tracking-wide text-lg">Load More Questions</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </button>
          <p className="text-sm text-gray-500 mt-4 font-light">
            Showing {visibleCount} of {allQuestions.length} questions
          </p>
        </div>
      )}

      {/* Contact CTA */}
      <div className="max-w-4xl mx-auto bg-gray-50 p-12 text-center">
        <h3 className="text-2xl font-light text-[#005670] mb-4">Still have questions?</h3>
        <p className="text-gray-600 mb-8 leading-relaxed font-light">
          Your HDG project manager can assist you. Contact your Ālia sales representative or Henderson Design Group directly.
        </p>
        <button
          onClick={handleContactClick}
          className="inline-flex items-center gap-2 bg-[#005670] text-white px-8 py-4 hover:bg-[#004a5c] transition-all"
        >
          <Mail className="w-5 h-5" />
          <span className="font-light">Contact Us</span>
        </button>
      </div>
    </div>
  );
};

// Payment Page - Exact content from PDFs
const PaymentPage = () => {
  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto space-y-12 animate-fade-in">
      <div className="text-center max-w-4xl mx-auto mb-12">
        <h2 className="text-4xl font-light text-[#005670] mb-6">Payment Schedule & Deposit Options</h2>
      </div>

      {/* Payment Schedule */}
      <div className="space-y-8">
        <h3 className="text-2xl font-light text-[#005670] border-b pb-3">Standard Payment Schedule</h3>
        
        <div className="space-y-6 bg-gray-50 p-8">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[#005670] mb-2">50% Deposit</h4>
              <p className="text-gray-700">Due upon approval of the furnishings proposal (less any prior deposits or credits, such as 30% hold price deposit or design fee. The total price is based on the final approved design).</p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#005670] mb-2">25% Progress Payment</h4>
              <p className="text-gray-700">Due six months before completion of production and shipping.</p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#005670] mb-2">25% Final Payment or remaining balance</h4>
              <p className="text-gray-700">Due 30 days prior to installation.</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-[#005670] p-6">
          <p className="text-gray-700"><strong>Payment Methods:</strong> Payments can be made by wire transfer or check in U.S. Dollars, payable to Henderson Design Group.</p>
          <p className="text-gray-700 mt-2">All payment tracking is available through your secure client portal.</p>
        </div>
      </div>

      {/* Deposit Options */}
      <div className="space-y-8 mt-16">
        <h3 className="text-2xl font-light text-[#005670] border-b pb-3">Understanding Your Deposit Options</h3>
        
        <p className="text-gray-700 leading-relaxed">This summary explains the two ways clients can move forward with Henderson Design Group for their Ālia residence. Each option secures your place in the HDG design and production schedule in a different way.</p>

        {/* Option 1 */}
        <div className="border-2 border-gray-300 p-8">
          <h4 className="text-xl font-medium text-[#005670] mb-4">OPTION 1 – DEPOSIT TO HOLD 2025 PRICING</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Purpose</h5>
              <p className="text-gray-700">Secure current HDG collection pricing while you finalize your design decisions.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Deposit Amount</h5>
              <p className="text-gray-700">Thirty percent (30%) of your selected furnishing package total.</p>
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
              <p className="text-gray-700">Refundable less a 10% administrative fee if cancelled before design selections or production scheduling begin. Less any design fees incurred.</p>
              <p className="text-gray-700 mt-2">Non-refundable once design selections are approved or production scheduling has started.</p>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Next Step</h5>
              <p className="text-gray-700">Once your deposit is received, HDG will confirm your pricing lock and place your project in the design calendar for the 2026 design phase.</p>
            </div>
          </div>
        </div>

        {/* Option 2 */}
        <div className="bg-[#005670] text-white p-8">
          <h4 className="text-xl font-medium mb-4">OPTION 2 – DESIGN FEE TO HOLD PLACE IN LINE</h4>
          
          <div className="space-y-4">
            <div>
              <h5 className="font-medium mb-2">Purpose</h5>
              <p className="text-white/90">Guarantee your design start position in HDG's calendar before capacity fills.</p>
            </div>

            <div>
              <h5 className="font-medium mb-2">Fee Amount</h5>
              <p className="text-white/90">One hundred percent (100%) due upon signing. Fee is non-refundable.</p>
              <p className="text-white/90 text-sm mt-1">(Refer to Design Fee Schedule by unit type and bedroom count.)</p>
            </div>

            <div>
              <h5 className="font-medium mb-2">What This Does</h5>
              <ul className="list-disc pl-6 space-y-1 text-white/90">
                <li>Confirms your reserved design start date.</li>
                <li>Includes design intake meeting, floor plan review, furniture layout, material selections, and one revision.</li>
                <li>Applies in full as a credit toward your total furnishing package when you proceed to production.</li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium mb-2">Refund Policy</h5>
              <p className="text-white/90">Non-refundable. The full amount is credited toward your total package if you move forward into production.</p>
            </div>

            <div>
              <h5 className="font-medium mb-2">Next Step</h5>
              <p className="text-white/90">Once the design fee is received, HDG will issue your confirmation notice and schedule your design intake meeting.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Deadline */}
      <div className="bg-red-50 border-2 border-red-300 p-8 mt-12">
        <h4 className="text-xl font-medium text-red-900 mb-3">CRITICAL DEADLINE: December 15, 2025</h4>
        <p className="text-red-800">Deposit must be received by this date to guarantee 2025 pricing and secure your production slot.</p>
      </div>
    </div>
  );
};

// Warranty Page - Complete content from PDF
const WarrantyPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Warranty & Aftercare Policy</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          Ālia Furnishing Program
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Purpose */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Purpose</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            This document outlines the warranty coverage and aftercare guidelines provided by Henderson Design Group (HDG) 
            for the furnishings, fixtures, and accessories supplied and installed under the Ālia Furnishing Program. 
            The goal is to ensure every client receives continued support, clear maintenance guidance, and timely service when needed.
          </p>
        </section>

        {/* Warranty Coverage */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Warranty Coverage</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            HDG warrants that all furnishings supplied under the Client Purchase Agreement are free from defects in 
            materials and workmanship for a period of <strong>one (1) year from the date of installation</strong>.
          </p>
          
          <div className="bg-gray-50 p-8">
            <h4 className="text-xl font-light text-[#005670] mb-4">This warranty covers:</h4>
            <ul className="space-y-3">
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Structural defects in furniture frames, cabinetry, and joinery</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Hardware and mechanism failures (hinges, drawer glides, latches, or similar components)</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Upholstery stitching or seam failures not related to wear or misuse</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Finishes or coatings that peel or delaminate under normal residential conditions</p>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-2 h-2 rounded-full bg-[#005670] mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Manufacturing defects in accessories or lighting items supplied by HDG</p>
              </li>
            </ul>
          </div>
        </section>

        {/* Exclusions */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Exclusions</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">This warranty does not cover:</p>
          
          <div className="space-y-3">
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Normal wear and tear, fading, or aging of materials</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Damage from misuse, neglect, accident, or alterations by the client or third parties</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Variations in color, grain, texture, or tone due to the natural characteristics of wood, stone, fabric, or rattan</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Shrinkage or movement in natural materials caused by humidity, temperature, or environmental changes</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Damage caused by improper cleaning, use of unapproved products, or failure to follow care instructions</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Electrical components, appliances, or fixtures covered under manufacturer warranties</p>
            </div>
            <div className="flex gap-3 items-start p-4 border-l-2 border-gray-300">
              <p className="text-gray-700">• Damage resulting from building construction, water leaks, pests, or environmental exposure</p>
            </div>
          </div>
        </section>

        {/* Warranty Limitations */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Warranty Limitations</h3>
          <div className="bg-gray-50 p-8 space-y-4">
            <p className="text-gray-700 leading-relaxed">
              HDG's liability under this warranty is limited to repair or replacement of the defective item, at HDG's discretion. 
              If an identical replacement is unavailable, HDG may substitute an item of equal or greater value consistent with the design intent.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Under no circumstances shall HDG be liable for consequential damages, loss of use, or any claim exceeding 
              the original purchase value of the defective item.
            </p>
          </div>
        </section>

        {/* Warranty Claims */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Warranty Claims</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            All warranty claims must be submitted in writing through the HDG client portal or directly to your HDG Project Manager. 
            Claims must include:
          </p>
          <div className="bg-gray-50 p-8 space-y-3">
            <p className="text-gray-700">• Client name and unit number</p>
            <p className="text-gray-700">• Description and photographs of the issue</p>
            <p className="text-gray-700">• Date of installation or purchase</p>
          </div>
          <p className="text-gray-700 leading-relaxed mt-6">
            HDG will acknowledge receipt of the claim within ten (10) business days and may request an onsite inspection 
            or additional information. Repairs or replacements will be scheduled as soon as practicable, based on material 
            and labor availability.
          </p>
        </section>

        {/* Service Outside Warranty */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Service Outside Warranty</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            After the one-year warranty period, HDG continues to offer support or referral out for repairs, refinishing, 
            and replacement parts at standard service rates. Clients may contact their Project Manager for quotes and scheduling.
          </p>
        </section>

        {/* Client Responsibilities */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Client Responsibilities</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            Clients agree to maintain furnishings in accordance with HDG's Care and Maintenance Guidelines, included in this binder. 
            Proper environmental conditions (temperature, humidity, and ventilation) are necessary to preserve materials and finishes. 
            Damage caused by failure to maintain these conditions is not covered under this warranty.
          </p>
        </section>

        {/* Product Care and Maintenance */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Product Care and Maintenance</h3>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">General care recommendations include:</p>
          <div className="bg-gray-50 p-8 space-y-3">
            <p className="text-gray-700">• Avoid direct prolonged sunlight exposure to prevent fading</p>
            <p className="text-gray-700">• Maintain indoor humidity between 40%–60% to minimize wood movement</p>
            <p className="text-gray-700">• Clean with a soft, damp cloth using mild, non-abrasive products</p>
            <p className="text-gray-700">• Do not use any bleach, ammonia, or solvent-based cleaners</p>
            <p className="text-gray-700">• Protect surfaces from standing water, hot objects, or sharp impacts</p>
            <p className="text-gray-700">• Vacuum or brush upholstery regularly without a beater bar (suction only)</p>
            <p className="text-gray-700">• Rotate upholstery cushions for even wear</p>
          </div>
        </section>

        {/* Transferability */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Transferability</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            This warranty applies only to the original purchaser and is non-transferable.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-6">Governing Law</h3>
          <p className="text-lg text-gray-700 leading-relaxed">
            This Warranty Policy shall be governed by and construed in accordance with the laws of the State of Hawaii.
          </p>
        </section>

        {/* Contact Information */}
        <section className="bg-[#005670] text-white p-12">
          <h3 className="text-3xl font-extralight mb-8">Contact Information</h3>
          <p className="text-lg text-white/90 mb-6">
            For warranty questions, service requests, or aftercare support, please contact:
          </p>
          <div className="space-y-2 text-white/90">
            <p className="font-light">Henderson Design Group – Project Manager</p>
            <p className="text-sm">Available through your HDG client portal</p>
          </div>
        </section>

        {/* Updated Date */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Updated October 30, 2025</p>
        </div>

      </div>
    </div>
  );
};

// Environment Page - Consistent elegant theme
const EnvironmentPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">Environmental Commitment</h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed">
          We design with intention—not only for how a home looks and feels, 
          but for how it impacts the world around it
        </p>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Philosophy */}
        <section>
          <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
            <p>
              Hawaii's environment is fragile and finite. Every piece that arrives here stays here, 
              making responsible sourcing and manufacturing essential to long-term sustainability.
            </p>
            <p>
              By producing over eighty percent of our furnishings in Indonesia, we directly oversee 
              every stage of production—from raw materials to final packaging.
            </p>
            <p>
              Complete unit packages minimize excess packaging and consolidate shipments, 
              dramatically lowering our carbon footprint compared to multi-vendor purchasing.
            </p>
          </div>
        </section>

        {/* Our Approach */}
        <section>
          <h3 className="text-3xl font-light text-[#005670] mb-8">Our Environmental Approach</h3>
          <div className="space-y-4 bg-gray-50 p-8">
            <p className="text-gray-700 leading-relaxed">• Maintain consistent quality and reduce waste at the source</p>
            <p className="text-gray-700 leading-relaxed">• Build and ship complete unit packages, minimizing excess packaging</p>
            <p className="text-gray-700 leading-relaxed">• Load each container by client unit, reducing handling and damage</p>
            <p className="text-gray-700 leading-relaxed">• Consolidate shipments to dramatically lower carbon footprint</p>
            <p className="text-gray-700 leading-relaxed">• Support skilled craftsmanship and sustainable forestry practices</p>
          </div>
        </section>

        {/* Impact Grid */}
        <section>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="border-l-4 border-[#005670] pl-6 py-4">
              <h4 className="text-xl font-light text-[#005670] mb-3">Quality Control</h4>
              <p className="text-gray-700">Direct oversight reduces waste at source</p>
            </div>
            <div className="border-l-4 border-[#005670] pl-6 py-4">
              <h4 className="text-xl font-light text-[#005670] mb-3">Smart Packaging</h4>
              <p className="text-gray-700">Minimal excess materials and waste</p>
            </div>
            <div className="border-l-4 border-[#005670] pl-6 py-4">
              <h4 className="text-xl font-light text-[#005670] mb-3">Efficient Logistics</h4>
              <p className="text-gray-700">Container loading by unit minimizes handling</p>
            </div>
            <div className="border-l-4 border-[#005670] pl-6 py-4">
              <h4 className="text-xl font-light text-[#005670] mb-3">Lower Impact</h4>
              <p className="text-gray-700">Consolidated shipments reduce carbon footprint</p>
            </div>
          </div>
        </section>

        {/* Quote */}
        <section className="bg-gray-50 p-12 text-center">
          <p className="text-2xl font-light leading-relaxed italic text-gray-700 mb-6">
            "Every decision we make considers longevity, recyclability, and environmental stewardship. 
            Our goal: create enduring interiors that respect the land, the people, and the planet."
          </p>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Henderson Design Group</p>
        </section>

      </div>
    </div>
  );
};

// Questionnaire Page - Link to download PDF atau embed form
const QuestionnairePage = () => {
  const sections = [
    {
      title: "Personal Information",
      questions: [
        { id: "name", label: "Full Name", type: "text", required: true },
        { id: "email", label: "Email Address", type: "email", required: true },
        { id: "phone", label: "Phone Number", type: "tel", required: true },
        { id: "unit", label: "Ālia Unit Number", type: "text", required: true },
        { id: "bedrooms", label: "Number of Bedrooms", type: "select", options: ["2BR", "3BR", "4BR"], required: true },
        { id: "preferred_contact", label: "Preferred Contact Method", type: "select", options: ["Email", "Phone", "Text"], required: true }
      ]
    },
    {
      title: "Home Use & Lifestyle",
      questions: [
        { 
          id: "primary_use", 
          label: "How will you primarily use this residence?", 
          type: "radio", 
          options: [
            "Primary residence",
            "Second home/vacation home",
            "Investment property for rental",
            "Mixed use (personal & rental)"
          ],
          required: true 
        },
        { 
          id: "occupancy", 
          label: "Who will be living in or using this home?", 
          type: "checkbox", 
          options: [
            "Just me",
            "Couple",
            "Family with young children",
            "Family with teenagers",
            "Adult children visit",
            "Frequent guests",
            "Multi-generational"
          ],
          required: true 
        },
        { 
          id: "lifestyle", 
          label: "How would you describe your lifestyle?", 
          type: "checkbox", 
          options: [
            "Active and outdoors-oriented",
            "Entertaining and social",
            "Quiet and relaxing",
            "Work-from-home focused",
            "Health and wellness focused",
            "Art and culture enthusiast"
          ],
          required: true 
        },
        { 
          id: "entertaining", 
          label: "How often do you entertain guests?", 
          type: "radio", 
          options: [
            "Frequently (weekly)",
            "Regularly (monthly)",
            "Occasionally (few times a year)",
            "Rarely"
          ],
          required: true 
        },
        {
          id: "entertaining_style",
          label: "What type of entertaining do you prefer?",
          type: "checkbox",
          options: [
            "Intimate dinners (4-6 people)",
            "Larger gatherings (8+ people)",
            "Casual get-togethers",
            "Formal dinner parties",
            "Outdoor barbecues",
            "Cocktail parties"
          ]
        }
      ]
    },
    {
      title: "Design Style & Aesthetic",
      questions: [
        {
          id: "design_style",
          label: "Which design styles appeal to you? (Select all that apply)",
          type: "checkbox",
          options: [
            "Modern/Contemporary",
            "Coastal/Beach",
            "Tropical/Hawaiian",
            "Minimalist",
            "Traditional",
            "Transitional (blend of traditional and modern)",
            "Mid-century modern",
            "Bohemian/Eclectic",
            "Industrial",
            "Scandinavian"
          ],
          required: true
        },
        {
          id: "color_preference",
          label: "What color palettes do you prefer?",
          type: "checkbox",
          options: [
            "Neutral tones (whites, beiges, grays)",
            "Warm tones (earth tones, terracotta, warm woods)",
            "Cool tones (blues, greens, silvers)",
            "Bold and vibrant colors",
            "Dark and moody",
            "Light and airy",
            "Natural materials and textures"
          ],
          required: true
        },
        {
          id: "atmosphere",
          label: "What atmosphere do you want to create?",
          type: "checkbox",
          options: [
            "Calm and serene",
            "Energizing and vibrant",
            "Cozy and warm",
            "Elegant and sophisticated",
            "Casual and relaxed",
            "Luxurious and refined",
            "Natural and organic"
          ],
          required: true
        },
        {
          id: "formality",
          label: "How formal or casual should the space feel?",
          type: "radio",
          options: [
            "Very formal and elegant",
            "Somewhat formal but comfortable",
            "Balanced - neither too formal nor casual",
            "Casual and relaxed",
            "Very casual and laid-back"
          ],
          required: true
        },
        {
          id: "design_inspiration",
          label: "Are there any specific homes, hotels, or spaces that inspire you?",
          type: "textarea",
          placeholder: "Please describe any places that inspire your design vision..."
        }
      ]
    },
    {
      title: "Functional Requirements",
      questions: [
        {
          id: "bedroom_use",
          label: "How will you use each bedroom?",
          type: "textarea",
          placeholder: "E.g., Master for us, Guest room 1 for family visits, Guest room 2 as office...",
          required: true
        },
        {
          id: "work_from_home",
          label: "Do you need a dedicated workspace?",
          type: "radio",
          options: [
            "Yes, full home office setup",
            "Yes, small desk area",
            "No, not needed"
          ],
          required: true
        },
        {
          id: "storage_needs",
          label: "What are your storage priorities?",
          type: "checkbox",
          options: [
            "Extensive closet space",
            "Kitchen pantry storage",
            "Linen and towel storage",
            "Sports equipment storage",
            "Beach gear storage",
            "Wine storage",
            "Display storage for collections",
            "Hidden/concealed storage"
          ]
        },
        {
          id: "dining",
          label: "How do you prefer to dine?",
          type: "checkbox",
          options: [
            "Formal dining table for entertaining",
            "Casual island/breakfast bar seating",
            "Outdoor dining",
            "Combination of formal and casual"
          ],
          required: true
        },
        {
          id: "seating_preference",
          label: "What type of seating do you prefer in the living area?",
          type: "checkbox",
          options: [
            "Large sectional sofa",
            "Sofa and armchairs",
            "Multiple seating areas",
            "Casual/conversation-focused",
            "Media viewing-focused",
            "Reading nook"
          ],
          required: true
        },
        {
          id: "outdoor_use",
          label: "How will you use your lanai/outdoor space?",
          type: "checkbox",
          options: [
            "Outdoor dining",
            "Lounging and relaxation",
            "Entertaining guests",
            "Morning coffee/evening cocktails",
            "Yoga or exercise",
            "Minimal use"
          ]
        }
      ]
    },
    {
      title: "Specific Preferences",
      questions: [
        {
          id: "bed_size",
          label: "Preferred bed size for master bedroom?",
          type: "radio",
          options: ["King", "California King", "Queen"],
          required: true
        },
        {
          id: "guest_bed",
          label: "Preferred bed configuration for guest rooms?",
          type: "checkbox",
          options: [
            "Queen beds",
            "Twin beds (can be separated or combined)",
            "Day beds",
            "Sofa beds",
            "Flexible based on design"
          ]
        },
        {
          id: "tv_preference",
          label: "Television placement preferences?",
          type: "checkbox",
          options: [
            "Living room - must have",
            "Master bedroom - must have",
            "Guest bedrooms",
            "No TVs preferred",
            "Hidden/concealed when not in use"
          ]
        },
        {
          id: "artwork",
          label: "What are your preferences for artwork and accessories?",
          type: "radio",
          options: [
            "Curated art collection - I want HDG to select",
            "Minimal artwork",
            "I will provide my own art",
            "Mix of HDG selections and my pieces"
          ],
          required: true
        },
        {
          id: "rug_preference",
          label: "Rug preferences?",
          type: "radio",
          options: [
            "Natural fiber (jute, sisal, seagrass)",
            "Plush and soft",
            "Patterned/colorful",
            "Neutral tones",
            "No rugs preferred"
          ]
        },
        {
          id: "window_treatment",
          label: "Window treatment preferences?",
          type: "checkbox",
          options: [
            "Blackout shades for bedrooms",
            "Sheer curtains for light filtering",
            "Natural woven shades",
            "Motorized/automated",
            "Minimal - maximize views",
            "Privacy is important"
          ],
          required: true
        }
      ]
    },
    {
      title: "Lifestyle Considerations",
      questions: [
        {
          id: "pets",
          label: "Do you have pets?",
          type: "radio",
          options: ["Yes", "No"],
          required: true
        },
        {
          id: "pet_details",
          label: "If yes, please describe (type, size, special needs)",
          type: "textarea",
          placeholder: "E.g., Medium dog, cat, need durable fabrics..."
        },
        {
          id: "allergies",
          label: "Do you have any allergies or sensitivities to materials?",
          type: "textarea",
          placeholder: "E.g., latex, certain fabrics, fragrances..."
        },
        {
          id: "accessibility",
          label: "Are there any accessibility requirements?",
          type: "textarea",
          placeholder: "E.g., wheelchair access, grab bars, specific height requirements..."
        },
        {
          id: "activities",
          label: "What activities are important to you in Hawaii?",
          type: "checkbox",
          options: [
            "Beach and ocean activities",
            "Hiking and outdoor exploration",
            "Golf",
            "Dining and culinary experiences",
            "Cultural activities",
            "Relaxation and spa",
            "Fitness and wellness",
            "Water sports"
          ]
        }
      ]
    },
    {
      title: "Budget & Timeline",
      questions: [
        {
          id: "collection_interest",
          label: "Which collection are you most interested in?",
          type: "radio",
          options: [
            "Lani Collection (Complete bespoke furnishing)",
            "Nalu Collection (Elevated design with quality finishes)",
            "Foundation Collection (Streamlined essentials)",
            "Custom Design",
            "Mix between collections",
            "Not sure yet - need guidance"
          ],
          required: true
        },
        {
          id: "budget_comfort",
          label: "Are you comfortable with the estimated pricing for your chosen collection?",
          type: "radio",
          options: [
            "Yes, budget is confirmed",
            "Yes, but want to discuss options",
            "Need more information",
            "Would like to explore cost-saving options"
          ],
          required: true
        },
        {
          id: "move_in",
          label: "When do you plan to move in/use the residence?",
          type: "text",
          placeholder: "E.g., January 2027, as soon as ready...",
          required: true
        },
        {
          id: "timeline_flexibility",
          label: "How flexible is your timeline?",
          type: "radio",
          options: [
            "Fixed timeline - must be ready by specific date",
            "Somewhat flexible",
            "Very flexible - quality over speed"
          ],
          required: true
        }
      ]
    },
    {
      title: "Items You're Bringing",
      questions: [
        {
          id: "bringing_items",
          label: "Will you be bringing any existing furniture or items?",
          type: "radio",
          options: ["Yes", "No", "Maybe - not decided yet"],
          required: true
        },
        {
          id: "existing_items",
          label: "If yes, please describe what you'll bring",
          type: "textarea",
          placeholder: "E.g., family heirloom dining table, artwork collection, specific pieces..."
        },
        {
          id: "keep_items",
          label: "Are there any specific pieces you definitely want to keep?",
          type: "textarea",
          placeholder: "Describe items you must incorporate into the design..."
        }
      ]
    },
    {
      title: "Special Requests & Additional Information",
      questions: [
        {
          id: "must_haves",
          label: "What are your absolute must-haves?",
          type: "textarea",
          placeholder: "List any non-negotiable items, features, or requirements...",
          rows: 4
        },
        {
          id: "dislikes",
          label: "What should we avoid? (styles, colors, materials, etc.)",
          type: "textarea",
          placeholder: "List anything you definitely do not want...",
          rows: 4
        },
        {
          id: "inspiration_images",
          label: "Do you have inspiration images or Pinterest boards to share?",
          type: "textarea",
          placeholder: "Please provide links or describe the images you'd like to share..."
        },
        {
          id: "special_requests",
          label: "Any other special requests or considerations?",
          type: "textarea",
          placeholder: "Anything else we should know about your vision, lifestyle, or requirements...",
          rows: 5
        }
      ]
    },
    {
      title: "Design Team Communication",
      questions: [
        {
          id: "meeting_preference",
          label: "Preferred meeting format?",
          type: "radio",
          options: [
            "In-person in Hawaii",
            "Virtual (Zoom/Video call)",
            "Phone call",
            "Mix of virtual and in-person",
            "Primarily email communication"
          ],
          required: true
        },
        {
          id: "availability",
          label: "What is your general availability for design meetings?",
          type: "checkbox",
          options: [
            "Weekday mornings (HST)",
            "Weekday afternoons (HST)",
            "Weekday evenings (HST)",
            "Weekends",
            "Flexible - will work around HDG schedule"
          ],
          required: true
        },
        {
          id: "decision_making",
          label: "Who will be involved in design decisions?",
          type: "radio",
          options: [
            "Just me",
            "Me and my partner/spouse",
            "Family decision",
            "I'll make decisions but want input from others"
          ],
          required: true
        },
        {
          id: "additional_contacts",
          label: "Additional contacts (if applicable)",
          type: "textarea",
          placeholder: "Names and contact info for anyone else involved in decisions..."
        }
      ]
    }
  ];

  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in">
      {/* Hero */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <h2 className="text-7xl font-extralight text-[#005670] mb-6 tracking-tight">
          Design Preferences Questionnaire
        </h2>
        <p className="text-xl text-gray-600 font-light leading-relaxed mb-8">
          Help us understand your lifestyle, preferences, and vision for your Ālia residence
        </p>
        <div className="bg-blue-50 border-l-4 border-[#005670] p-6 text-left">
          <p className="text-gray-700 font-light">
            <strong className="font-medium">Note:</strong> This questionnaire is for reference. 
            After making your deposit, you'll receive access to the interactive form in your 
            client portal where you can save progress and submit your responses directly to your design team.
          </p>
        </div>
      </div>

      {/* Questionnaire Sections */}
      <div className="max-w-5xl mx-auto space-y-16">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-white border border-gray-100 p-8 md:p-12">
            {/* Section Header */}
            <div className="mb-10 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#005670] text-white font-light">
                  {sectionIndex + 1}
                </div>
                <h3 className="text-3xl font-light text-[#005670]">{section.title}</h3>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-8">
              {section.questions.map((question, qIndex) => (
                <div key={question.id} className="space-y-3">
                  {/* Question Label */}
                  <label className="block text-lg text-gray-900 font-light">
                    {question.label}
                    {question.required && <span className="text-[#005670] ml-1">*</span>}
                  </label>

                  {/* Input Fields Based on Type */}
                  {question.type === 'text' && (
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-[#005670] focus:ring-1 focus:ring-[#005670] transition-colors"
                      placeholder={question.placeholder}
                      disabled
                    />
                  )}

                  {question.type === 'email' && (
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-[#005670] focus:ring-1 focus:ring-[#005670] transition-colors"
                      placeholder={question.placeholder}
                      disabled
                    />
                  )}

                  {question.type === 'tel' && (
                    <input
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 focus:border-[#005670] focus:ring-1 focus:ring-[#005670] transition-colors"
                      placeholder={question.placeholder}
                      disabled
                    />
                  )}

                  {question.type === 'select' && (
                    <select
                      className="w-full px-4 py-3 border border-gray-200 focus:border-[#005670] focus:ring-1 focus:ring-[#005670] transition-colors"
                      disabled
                    >
                      <option value="">Select an option...</option>
                      {question.options?.map((option, i) => (
                        <option key={i} value={option}>{option}</option>
                      ))}
                    </select>
                  )}

                  {question.type === 'textarea' && (
                    <textarea
                      rows={question.rows || 3}
                      className="w-full px-4 py-3 border border-gray-200 focus:border-[#005670] focus:ring-1 focus:ring-[#005670] transition-colors resize-none"
                      placeholder={question.placeholder}
                      disabled
                    />
                  )}

                  {question.type === 'radio' && (
                    <div className="space-y-3 pl-2">
                      {question.options?.map((option, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            className="mt-1 w-4 h-4 text-[#005670] focus:ring-[#005670]"
                            disabled
                          />
                          <span className="text-gray-700 font-light group-hover:text-gray-900">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                  {question.type === 'checkbox' && (
                    <div className="space-y-3 pl-2">
                      {question.options?.map((option, i) => (
                        <label key={i} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            name={question.id}
                            value={option}
                            className="mt-1 w-4 h-4 text-[#005670] focus:ring-[#005670] rounded"
                            disabled
                          />
                          <span className="text-gray-700 font-light group-hover:text-gray-900">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA
      <div className="max-w-4xl mx-auto mt-16 bg-gray-50 p-12 text-center">
        <h3 className="text-2xl font-light text-[#005670] mb-4">
          Ready to Begin Your Design Journey?
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed font-light">
          Complete this questionnaire in your personalized client portal after making your deposit. 
          Your design team will use your responses to create a custom furnishing plan tailored to your lifestyle.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="inline-flex items-center justify-center gap-2 bg-[#005670] text-white px-8 py-4 hover:bg-[#004a5c] transition-all">
            <Download className="w-5 h-5" />
            <span className="font-light">Download PDF Version</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 bg-white border-2 border-[#005670] text-[#005670] px-8 py-4 hover:bg-gray-50 transition-all"
          >
            <FileText className="w-5 h-5" />
            <span className="font-light">Print Questionnaire</span>
          </button>
        </div>
      </div> */}
    </div>
  );
};

// Contact Page - Standalone tab
const ContactPage = () => {
  return (
    <div className="pt-24 pb-20 px-6 max-w-5xl mx-auto animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-light text-[#005670] mb-4">Begin Your Journey</h2>
        <p className="text-gray-600">Contact your Ālia sales representative or reach out directly</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 text-center border border-gray-100 hover:border-[#005670] transition-all">
          <div className="inline-flex p-4 rounded-full bg-[#005670] text-white mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-[#005670] mb-3">Visit Us</h3>
          <p className="text-sm text-gray-600">74-5518 Kaiwi Street Suite B</p>
          <p className="text-sm text-gray-600">Kailua Kona, HI 96740</p>
        </div>

        <div className="bg-white p-6 text-center border border-gray-100 hover:border-[#005670] transition-all">
          <div className="inline-flex p-4 rounded-full bg-[#005670] text-white mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-[#005670] mb-3">Call Us</h3>
          <p className="text-sm text-gray-600">(808) 315-8782</p>
        </div>

        <div className="bg-white p-6 text-center border border-gray-100 hover:border-[#005670] transition-all">
          <div className="inline-flex p-4 rounded-full bg-[#005670] text-white mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-[#005670] mb-3">Email Us</h3>
          <p className="text-sm text-gray-600">aloha@henderson.house</p>
        </div>

        <div className="bg-white p-6 text-center border border-gray-100 hover:border-[#005670] transition-all">
          <div className="inline-flex p-4 rounded-full bg-[#005670] text-white mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-[#005670] mb-3">Hours</h3>
          <p className="text-sm text-gray-600">Mon-Fri: 9AM-5PM HST</p>
          <p className="text-sm text-gray-600">Sat: By Appointment</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 p-8 text-center max-w-3xl mx-auto">
        <h3 className="text-xl font-medium text-[#005670] mb-4">Ready to create your island sanctuary?</h3>
        <p className="text-gray-700 leading-relaxed">
          Schedule your introduction meeting with Henderson Design Group to explore 
          collections, discuss your vision, and begin your Ālia journey.
        </p>
      </div>
    </div>
  );
};

// Footer
const Footer = ({ setActiveTab }) => {
  return (
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
              {['about', 'collection', 'process', 'timeline', 'payment', 'faq'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => { setActiveTab(tab); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
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
  );
};

// Main Component
const BrochureLandingPage = () => {
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderPage = () => {
    switch(activeTab) {
      case 'about':
        return <AboutPage setActiveTab={setActiveTab} />;
      case 'collection':
        return <CollectionPage />;
      case 'inspiration':
        return <InspirationPage />;
      case 'process':
        return <ProcessPage />;
      case 'timeline':
        return <TimelinePage />;
      case 'next-steps':
        return <NextStepsPage />;
      case 'faq':
        return <FAQPage setActiveTab={setActiveTab} />;
      case 'payment':
        return <PaymentPage />;
      case 'warranty':
        return <WarrantyPage />;
      case 'environment':
        return <EnvironmentPage />;
      case 'questionnaire':
        return <QuestionnairePage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <AboutPage setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        {renderPage()}
      </main>

      <Footer setActiveTab={setActiveTab} />

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