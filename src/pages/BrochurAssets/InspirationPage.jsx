import React, { useState } from 'react';
import { X, Sparkles, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';

const InspirationPage = ({ language }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages = [
    { id: 1, src: '/images/collections/1.jpg', title: '', category: '' },
    { id: 2, src: '/images/collections/2.jpg', title: '', category: '' },
    { id: 3, src: '/images/collections/3.jpg', title: '', category: '' },
    { id: 4, src: '/images/collections/4.jpg', title: '', category: '' },
    { id: 7, src: '/images/collections/7.jpg', title: '', category: '' },
    { id: 8, src: '/images/collections/8.jpg', title: '', category: '' },
    { id: 10, src: '/images/collections/10.jpg', title: '', category: '' },
    { id: 11, src: '/images/collections/11.jpg', title: '', category: '' },
    { id: 12, src: '/images/collections/12.jpg', title: '', category: '' },
    { id: 13, src: '/images/collections/13.jpg', title: '', category: '' },
    { id: 15, src: '/images/collections/15.jpg', title: '', category: '' },
    { id: 16, src: '/images/collections/16.jpg', title: '', category: '' },
    { id: 17, src: '/images/collections/17.jpg', title: '', category: '' },
    { id: 18, src: '/images/collections/18.jpg', title: '', category: '' },
    { id: 19, src: '/images/collections/19.jpg', title: '', category: '' },
    { id: 21, src: '/images/collections/21.jpg', title: '', category: '' },
    { id: 26, src: '/images/collections/26.jpg', title: '', category: '' },
    { id: 27, src: '/images/collections/27.jpg', title: '', category: '' },
    { id: 28, src: '/images/collections/28.jpg', title: '', category: '' }
  ];


  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (selectedIndex + 1) % galleryImages.length
      : (selectedIndex - 1 + galleryImages.length) % galleryImages.length;
    
    setSelectedIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

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
          Design Inspiration
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-gray-600 font-light leading-relaxed tracking-wide">
            Explore our curated portfolio of completed Ālia residences, showcasing the artistry 
            and attention to detail that defines Henderson Design Group.
          </p>
        </div>
        
        {/* Decorative Bottom Line */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#004b5f]/20 to-transparent"></div>
        </div>
      </div>

      {/* Luxury Gallery Grid */}
      <div className="max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
          {galleryImages.map((image, index) => (
            <div 
              key={image.id}
              onClick={() => handleImageClick(image, index)}
              className="group relative overflow-hidden bg-gray-100 cursor-pointer"
            >
              {/* Image Container with Elegant Border */}
              <div className="relative aspect-[4/3] overflow-hidden border border-gray-200 transition-all duration-500 group-hover:border-[#004b5f]/40 group-hover:shadow-xl">
                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#004b5f]/0 group-hover:border-[#004b5f]/40 transition-all duration-500 z-10"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#004b5f]/0 group-hover:border-[#004b5f]/40 transition-all duration-500 z-10"></div>
                
                {/* Image */}
                <img 
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                
                {/* Elegant Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  {/* Zoom Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {/* Category Badge */}
                    <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-3">
                      <span className="text-xs tracking-wider uppercase text-white/80 font-light">
                        {image.category}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-white text-xl font-light tracking-wide">
                      {image.title}
                    </h3>
                    
                    {/* Decorative Line */}
                    <div className="w-12 h-px bg-gradient-to-r from-white/60 to-transparent mt-3"></div>
                  </div>
                </div>
              </div>
              
              {/* Image Number - Subtle */}
              <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <span className="text-xs font-light text-[#004b5f]">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note Section - Elegant */}
      <div className="max-w-4xl mx-auto mt-20">
        <div className="relative overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-10">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/5 to-transparent -translate-y-16 translate-x-16"></div>
          
          <div className="relative z-10 text-center">
            <div className="w-12 h-12 rounded-full bg-[#004b5f]/10 flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-6 h-6 text-[#004b5f]" />
            </div>
            
            <h3 className="text-2xl font-light text-[#004b5f] mb-4">
              Bespoke Design Services
            </h3>
            
            <p className="text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
              Each space showcased represents our commitment to creating exceptional living environments. 
              Connect with our design team to explore how we can bring your vision to life.
            </p>
          </div>
        </div>
      </div>

      {/* LUXURY LIGHTBOX MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/95 backdrop-blur-sm"
            onClick={() => setSelectedImage(null)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative h-full flex flex-col">
            {/* Elegant Header */}
            <div className="relative z-20 border-b border-white/10">
              <div className="max-w-[1800px] mx-auto px-8 py-6 flex items-center justify-between">
                {/* Left: Image Info */}
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                    <span className="text-sm font-light text-white">
                      {String(selectedIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-light text-white tracking-wide mb-1">
                      {selectedImage.title}
                    </h3>
                    <p className="text-xs tracking-wider uppercase text-white/60 font-light">
                      {selectedImage.category}
                    </p>
                  </div>
                </div>
                
                {/* Right: Close Button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="group relative w-12 h-12 rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 rounded-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center justify-center w-full h-full text-white/70 group-hover:text-white group-hover:rotate-90 transition-all duration-300">
                    <X size={20} />
                  </div>
                </button>
              </div>
            </div>

            {/* Image Display Area */}
            <div className="relative flex-1 flex items-center justify-center p-8">
              {/* Navigation Buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('prev');
                }}
                className="absolute left-8 top-1/2 -translate-y-1/2 z-20 group"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110">
                  <ChevronLeft className="w-6 h-6 text-white group-hover:translate-x-[-2px] transition-transform" />
                </div>
              </button>

              {/* Main Image */}
              <div className="relative max-w-6xl max-h-[80vh] mx-auto">
                <img 
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[80vh] object-contain shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage('next');
                }}
                className="absolute right-8 top-1/2 -translate-y-1/2 z-20 group"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-110">
                  <ChevronRight className="w-6 h-6 text-white group-hover:translate-x-[2px] transition-transform" />
                </div>
              </button>
            </div>

            {/* Elegant Footer */}
            <div className="relative z-20 border-t border-white/10">
              <div className="max-w-[1800px] mx-auto px-8 py-4 flex items-center justify-between">
                {/* Left: Image Counter */}
                <div className="flex items-center gap-3 text-xs text-white/60 font-light tracking-wider">
                  <span>{selectedIndex + 1} / {galleryImages.length}</span>
                  <div className="w-px h-3 bg-white/20"></div>
                  <span>ĀLIA COLLECTION</span>
                </div>
                
                {/* Right: Keyboard Hint */}
                <div className="hidden md:flex items-center gap-6 text-xs text-white/40 font-light tracking-wider">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                      <span>←</span>
                    </div>
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                      <span>→</span>
                    </div>
                    <span>Navigate</span>
                  </div>
                  <div className="w-px h-3 bg-white/20"></div>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/10">
                      <span>ESC</span>
                    </div>
                    <span>Close</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Navigation */}
      {selectedImage && (
        <KeyboardNavigation 
          onClose={() => setSelectedImage(null)}
          onPrev={() => navigateImage('prev')}
          onNext={() => navigateImage('next')}
        />
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

// Keyboard Navigation Component
const KeyboardNavigation = ({ onClose, onPrev, onNext }) => {
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  return null;
};

export default InspirationPage;