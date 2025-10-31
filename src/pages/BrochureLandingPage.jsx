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
  Clock
} from 'lucide-react';

const BrochureLandingPage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
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
    <div className="min-h-screen bg-white">
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
              onClick={() => scrollToSection('about')}
              className="bg-white text-[#005670] px-8 py-4 text-lg tracking-wide hover:bg-white/95 transition-all duration-300 flex items-center gap-2"
            >
              Discover Our Process <ChevronRight className="w-5 h-5" />
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

      {/* About Section */}
      <section id="about" className="py-24 px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-5xl font-light text-[#005670] mb-6 tracking-wide">
              Ālia Project
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              Henderson Design Group brings over three decades of expertise to Hawaii's most 
              prestigious residential projects. Our Ālia Project represents the pinnacle of 
              island living — where modern elegance meets Hawaiian authenticity.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              We believe exceptional design starts with understanding. Every piece is carefully 
              curated, every detail intentionally chosen, every space thoughtfully crafted to 
              reflect both timeless sophistication and the unique spirit of island life.
            </p>
            <button
              onClick={() => scrollToSection('process')}
              className="text-[#005670] font-medium flex items-center gap-2 hover:gap-3 transition-all"
            >
              Learn About Our Process <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="relative h-[500px] overflow-hidden">
            <img
              src="/images/SAS00274.jpg"
              alt="Henderson Design"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-8">
          <h2 className="text-5xl font-light text-[#005670] mb-4 text-center tracking-wide">
            Our Process
          </h2>
          <p className="text-gray-600 text-center text-lg mb-16 max-w-2xl mx-auto">
            From initial consultation to final installation, we guide you through every step 
            of creating your perfect island sanctuary.
          </p>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Consultation",
                description: "We begin by understanding your vision, lifestyle, and unique needs through a comprehensive design questionnaire."
              },
              {
                step: "02",
                title: "Design Development",
                description: "Our team creates a customized furniture package tailored specifically to your unit and preferences."
              },
              {
                step: "03",
                title: "Down Payment & Scheduling",
                description: "Once you approve the design and submit your down payment, schedule a meeting with your designer at your convenience."
              },
              {
                step: "04",
                title: "Production & Delivery",
                description: "We oversee production, coordinate shipping, and handle complete installation for a seamless experience."
              }
            ].map((item) => (
              <div key={item.step} className="bg-white p-8 hover:shadow-xl transition-shadow duration-300">
                <div className="text-[#005670] text-5xl font-light mb-4 opacity-30">
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

      {/* Client Portal CTA */}
      <section className="py-24 px-8 bg-gradient-to-br from-[#005670] to-[#007a9a]">
        <div className="max-w-4xl mx-auto text-center">
          <CheckCircle className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-light text-white mb-6 tracking-wide">
            Already Made Your Down Payment?
          </h2>
          <p className="text-white/90 text-xl mb-8 leading-relaxed">
            Schedule your personalized design consultation at a time that works for you. 
            Our designers are ready to bring your vision to life.
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

      {/* Environmental Commitment Section */}
      <section id="sustainability" className="py-24 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Leaf className="w-16 h-16 text-[#005670] mx-auto mb-6" />
            <h2 className="text-5xl font-light text-[#005670] mb-6 tracking-wide">
              Our Environmental Commitment
            </h2>
            <p className="text-gray-700 text-xl leading-relaxed max-w-4xl mx-auto">
              At Henderson Design Group, we design with intention — not only for how a home 
              looks and feels, but for how it impacts the world around it.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                Hawaii's environment is fragile and finite. Every piece that arrives here stays here, 
                which means responsible sourcing and manufacturing are essential to long-term sustainability.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                By producing over eighty percent of our furnishings in Indonesia, we directly oversee 
                every stage of production — from raw materials to final packaging.
              </p>
            </div>
            <div className="relative h-[400px]">
              <img
                src="/images/SAS00286.jpg"
                alt="Sustainable Design"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Environmental Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <CheckCircle className="w-10 h-10 text-[#005670]" />,
                title: "Quality Control",
                description: "Maintain consistent quality and reduce waste at the source through direct oversight."
              },
              {
                icon: <Package className="w-10 h-10 text-[#005670]" />,
                title: "Smart Packaging",
                description: "Build and ship complete unit packages, minimizing excess packaging and redundant freight."
              },
              {
                icon: <Ship className="w-10 h-10 text-[#005670]" />,
                title: "Efficient Logistics",
                description: "Load containers by client unit, reducing handling and damage while streamlining delivery."
              },
              {
                icon: <TrendingDown className="w-10 h-10 text-[#005670]" />,
                title: "Lower Carbon Footprint",
                description: "Consolidate shipments to dramatically reduce environmental impact versus multi-vendor purchasing."
              }
            ].map((benefit, index) => (
              <div key={index} className="text-center">
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

          <div className="mt-16 bg-gray-50 p-12 text-center">
            <p className="text-gray-700 text-xl leading-relaxed max-w-4xl mx-auto italic">
              "Every decision we make, from material selection to shipping and installation, 
              considers longevity, recyclability, and environmental stewardship. Our goal is simple: 
              create enduring interiors that respect the land, the people, and the planet that sustain them."
            </p>
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
                  <MapPin className="w-6 h-6 text-[#005670] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Visit Us</h3>
                    <p className="text-gray-600">
                      74-5518 Kaiwi Street Suite B<br />
                      Kailua Kona, HI 96740-3145
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-[#005670] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Call Us</h3>
                    <p className="text-gray-600">(808) 315-8782</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[#005670] mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Email Us</h3>
                    <p className="text-gray-600">aloha@henderson.house</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-[#005670] mt-1" />
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
            </div>
            <div className="relative h-[500px]">
              <img
                src="/images/SAS00319.jpg"
                alt="Henderson Design Group Office"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#005670] text-white py-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 mb-8">
            <div>
              <div className="text-3xl tracking-widest font-light mb-2">HENDERSON</div>
              <div className="text-sm tracking-wider font-light mb-4">DESIGN GROUP</div>
              <p className="text-white/80 text-sm leading-relaxed">
                Crafting exceptional Hawaiian interiors with sustainable practices and timeless elegance.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('process')} className="hover:text-white transition-colors">
                    Our Process
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
              <ul className="space-y-2 text-white/80 text-sm">
                <li>
                  <button onClick={() => navigate('/designer-login')} className="hover:text-white transition-colors">
                    Designer Login
                  </button>
                </li>
              </ul>
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
