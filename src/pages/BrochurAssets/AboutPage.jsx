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
  X,
  Globe,
  Menu
} from 'lucide-react';

// Hero Section Component  
const HeroSection = ({ setActiveTab, language }) => {
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

// About Page
const AboutPage = ({ setActiveTab, language }) => {
  const navigate = useNavigate();
  
  return (
    <div className="animate-fade-in">
      <HeroSection setActiveTab={setActiveTab} language={language} />
      
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

      {/* About Team */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-6xl mx-auto">
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
                <h3 className="text-2xl font-light text-gray-900 mb-2">{member.name}</h3>
                <p className="text-sm text-[#005670] mb-4 tracking-wide uppercase font-light">{member.role}</p>
                <p className="text-gray-600 leading-relaxed font-light">{member.bio}</p>
              </div>
            ))}
          </div>

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
      {/* <section className="py-20 px-6 bg-[#005670]">
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
      </section> */}
    </div>
  );
};



export default AboutPage;