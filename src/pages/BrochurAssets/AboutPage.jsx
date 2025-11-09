import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

// ELEGANT Hero Section - Updated Design
// ELEGANT Hero Section - Natural Image without Gradient
const HeroSection = ({ setActiveTab, language }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  const heroSlides = [
    { image: "/images/SAS00201.jpg", title: "Hawaiian Elegance", subtitle: "Crafting Timeless Island Living" },
    { image: "/images/SAS00274.jpg", title: "Sustainable Design", subtitle: "Respecting Land, People & Planet" },
    { image: "/images/SAS00286.jpg", title: "Curated Collections", subtitle: "Thoughtfully Sourced Furnishings" },
    { image: "/images/SAS00319.jpg", title: "Complete Solutions", subtitle: "From Concept to Installation" }
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
    }, 10000);
    return () => clearInterval(timer);
  }, [imagesLoaded, heroSlides.length]);

  return (
    <section className="relative h-screen overflow-hidden">
      {!imagesLoaded && (
        <div className="absolute inset-0 bg-[#005670] flex items-center justify-center">
          <p className="text-3xl font-light text-white">Loading...</p>
        </div>
      )}

      {heroSlides.map((slide, index) => (
        <div key={index} className={`absolute inset-0 transition-opacity duration-2000 ${currentSlide === index && imagesLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${slide.image})` }}></div>
          {/* Light overlay hanya untuk keterbacaan text */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
      ))}

      <div className="relative z-10 h-full flex items-center">
        <div className="px-8 md:px-20 max-w-7xl mx-auto">
          <div className="text-white text-xl tracking-[0.5em] uppercase mb-8 font-light">
            Ālia Furnishing Collection
          </div>
          
          <h1 className="text-white text-7xl md:text-8xl lg:text-9xl font-light mb-10 leading-none drop-shadow-2xl">
            {heroSlides[currentSlide].title}
          </h1>
          
          <p className="text-white text-3xl md:text-4xl font-light mb-16 max-w-3xl leading-relaxed drop-shadow-xl">
            {heroSlides[currentSlide].subtitle}
          </p>
          
          <button 
            onClick={() => setActiveTab('collection')} 
            className="group bg-white text-[#005670] px-14 py-6 text-lg font-bold tracking-wide uppercase hover:bg-white/90 transition-all duration-300 flex items-center gap-4 rounded-xl border-2 border-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            <span>Explore Collections</span>
            <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </button>
        </div>

        {imagesLoaded && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
            {heroSlides.map((_, index) => (
              <button 
                key={index} 
                className={`transition-all duration-500 rounded-full ${currentSlide === index ? 'bg-white w-16 h-3' : 'bg-white/60 hover:bg-white/80 w-3 h-3'}`}
                onClick={() => setCurrentSlide(index)} 
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


// ELEGANT About Page - Redesigned
const AboutPage = ({ setActiveTab, language }) => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      <HeroSection setActiveTab={setActiveTab} language={language} />
      
      {/* About Alia Collection */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">About Us</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
              About Ālia Collection
            </h2>
            <div className="w-24 h-1 bg-[#005670] mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-[#005670]/5 border-l-4 border-[#005670] rounded-r-xl p-8">
              <p className="text-2xl text-[#1a1a1a] leading-relaxed font-medium">
                Three carefully curated collections designed to complement the Ālia architecture.
              </p>
            </div>
            
            <p className="text-xl text-[#1a1a1a] leading-relaxed">
              Each collection offers distinct levels of customization and finish. From streamlined essentials to complete bespoke furnishing, we have options to suit every preference.
            </p>
            
            <p className="text-lg text-[#4a4a4a] leading-relaxed">
              You can choose from one of our three collections, mix pieces between different collections, or work directly with our experienced design team to create a fully custom solution tailored to your vision.
            </p>
            
            <p className="text-lg text-[#4a4a4a] leading-relaxed">
              Every piece in our collections is thoughtfully selected to honor the spirit of island living and celebrate Hawaiian culture. We source materials responsibly and work with skilled artisans to ensure the highest quality.
            </p>
            
            <p className="text-lg text-[#4a4a4a] leading-relaxed">
              Our goal is to create spaces that feel both luxurious and livable, elegant yet comfortable, refined while remaining relaxed and welcoming.
            </p>
            
            <p className="text-lg text-[#4a4a4a] leading-relaxed">
              Each residence becomes a reflection of its owner's taste, enhanced by our expertise in creating environments that elevate daily living into an art form.
            </p>
          </div>
          
          <div className="text-center mt-16">
            <button 
              onClick={() => setActiveTab('collection')} 
              className="group bg-[#005670] text-white px-14 py-6 text-base font-bold tracking-wide uppercase hover:bg-[#004150] transition-all duration-300 inline-flex items-center gap-4 rounded-xl border-2 border-[#005670] shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <span>Explore Collections</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* About HDG */}
      <section className="py-32 px-8 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">Our Story</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
              About Henderson Design Group
            </h2>
            <div className="w-24 h-1 bg-[#005670] mx-auto rounded-full"></div>
          </div>
          
          <div className="space-y-16">
            {/* Established Excellence */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-[#005670]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h3 className="text-3xl font-bold text-[#005670]">
                  Established Excellence
                </h3>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Established by Eric Henderson in 2002, Henderson Design Group has built a reputation for refinement and style over more than two decades of service.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  We respect the values of our clients and enhance the aesthetics of every home we work on. Our approach is personal, attentive, and detail-oriented.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Each project receives the full attention of our experienced team, ensuring that your vision is realized with precision and care.
                </p>
              </div>
            </div>
            
            {/* Design Philosophy */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-[#005670]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h3 className="text-3xl font-bold text-[#005670]">
                  Design Philosophy
                </h3>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Eric approaches his life's work by fusing the personal with the practical. Every design decision is made with both beauty and functionality in mind.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  He delivers an enduring aesthetic that exudes a sense of relaxed sophistication. The interiors we create are meant to be lived in and enjoyed, not just admired.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Henderson's signature style marries clean lines with touches of playfulness to create a unique aesthetic designed specifically for island living.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  We believe that great design should feel effortless, where every element works together to create spaces that are both beautiful and deeply comfortable.
                </p>
              </div>
            </div>
            
            {/* Quote Section */}
            <div className="bg-gradient-to-br from-[#005670] to-[#007a9a] rounded-2xl p-10 shadow-xl text-white">
              <div className="space-y-6">
                <p className="text-xl italic leading-relaxed">
                  "We create organized, symmetrical floor plans where the furniture layouts encourage conversation when occupied or contemplation when on your own."
                </p>
                <p className="text-xl italic leading-relaxed">
                  "Comfort is always incorporated into the design, where every movement is anticipated."
                </p>
                <div className="flex items-center gap-4 pt-4 border-t-2 border-white/30">
                  <div className="h-px flex-1 bg-white/50"></div>
                  <p className="text-base font-bold tracking-widest uppercase">
                    Eric Henderson, Founder
                  </p>
                  <div className="h-px flex-1 bg-white/50"></div>
                </div>
              </div>
            </div>
            
            {/* Our Team & Experience */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-2 border-[#005670]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h3 className="text-3xl font-bold text-[#005670]">
                  Our Team & Experience
                </h3>
              </div>
              <div className="space-y-6">
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Over the past 15 years furnishing homes on the islands of Hawaii, Henderson has grown into a team of established, reliable, and experienced designers.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  We have offices in both Hawaii and San Francisco, allowing us to serve clients throughout the Pacific region with local expertise and international resources.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  We design and furnish homes for a lifestyle and state of mind that is based on comfort, elegance, and warmth. Our designs reflect the unique character of Hawaiian living.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  Our clients know that they can count on our experience and know-how to deliver smart and sophisticated solutions, top quality pieces, and first-rate service.
                </p>
                <p className="text-lg text-[#1a1a1a] leading-relaxed">
                  We are committed to going the extra mile every time, ensuring that your experience with Henderson Design Group exceeds your expectations from start to finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team - Simplified & Centered Layout */}
      <section className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
              <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">The Team</p>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
              Meet Our Team
            </h2>
            <p className="text-xl text-[#4a4a4a] leading-relaxed max-w-4xl mx-auto">
              A dedicated group of established, reliable, and experienced designers committed to delivering exceptional results for every Ālia residence.
            </p>
            <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
          </div>

          {(() => {
            const teamMembers = [
              { name: 'Eric Henderson', role: 'CEO / Founder', image: '/images/team/eric.jpg' },
              { name: 'Janelle Balci', role: 'Creative Director / Senior Designer', image: '/images/team/Janelle.jpg' },
              { name: 'Madeline Clifford', role: 'Project Manager', image: '/images/team/Madeline.jpg' },
              { name: 'Joanna Staniszewski', role: 'Director of Design', image: '/images/team/Joanna.jpg' },
              { name: 'Sara Bravo-Susel', role: 'Director of Logistics & Field Services', image: '/images/team/Sarah.jpg' },
            ];

            return (
              <div className="flex flex-col items-center gap-20">
                {/* Row 1 - 3 members */}
                <div className="grid md:grid-cols-3 gap-12 w-full max-w-6xl">
                  {teamMembers.slice(0, 3).map((member, index) => (
                    <div key={index} className="group">
                      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[#005670]/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center">
                        {member.name}
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-[#005670]"></div>
                        <p className="text-sm text-[#005670] font-bold tracking-widest uppercase">
                          {member.role}
                        </p>
                        <div className="h-px w-8 bg-[#005670]"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Row 2 - 2 members centered */}
                <div className="grid md:grid-cols-2 gap-12 justify-center w-full max-w-4xl">
                  {teamMembers.slice(3, 5).map((member, index) => (
                    <div key={index} className="group">
                      <div className="mb-6 overflow-hidden rounded-2xl border-2 border-[#005670]/20 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105">
                        <div className="aspect-[3/4] overflow-hidden bg-gray-100">
                          <img
                            src={member.image}
                            alt={member.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2 text-center">
                        {member.name}
                      </h3>
                      <div className="flex items-center justify-center gap-3">
                        <div className="h-px w-8 bg-[#005670]"></div>
                        <p className="text-sm text-[#005670] font-bold tracking-widest uppercase">
                          {member.role}
                        </p>
                        <div className="h-px w-8 bg-[#005670]"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </section>


    </div>
  );
};

export default AboutPage;