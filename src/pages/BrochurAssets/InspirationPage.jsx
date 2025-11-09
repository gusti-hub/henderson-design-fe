import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, CheckCircle } from 'lucide-react';

const InspirationPage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const galleryImages = [
    { id: 1, src: '/images/collections/11.jpg' },
    { id: 2, src: '/images/collections/8.jpg' },
    { id: 3, src: '/images/collections/15.jpg' },
    { id: 4, src: '/images/collections/18.jpg' },
    { id: 5, src: '/images/collections/7.jpg' },
    { id: 6, src: '/images/collections/3.jpg' },
    { id: 7, src: '/images/collections/10.jpg' },
    { id: 8, src: '/images/collections/1.jpg' },
    { id: 9, src: '/images/collections/12.jpg' },
    { id: 10, src: '/images/collections/13.jpg' },
    { id: 11, src: '/images/collections/2.jpg' },
    { id: 12, src: '/images/collections/16.jpg' },
    { id: 13, src: '/images/collections/17.jpg' },
    { id: 14, src: '/images/collections/4.jpg' },
    { id: 15, src: '/images/collections/19.jpg' },
    { id: 16, src: '/images/collections/21.jpg' },
    { id: 17, src: '/images/collections/26.jpg' },
    { id: 18, src: '/images/collections/27.jpg' },
    { id: 19, src: '/images/collections/28.jpg' },
  ];

  const handleImageClick = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeImage = () => {
    setSelectedImage(null);
    document.body.style.overflow = 'auto';
  };

  const navigateImage = (direction) => {
    const newIndex =
      direction === 'next'
        ? (selectedIndex + 1) % galleryImages.length
        : (selectedIndex - 1 + galleryImages.length) % galleryImages.length;
    setSelectedIndex(newIndex);
    setSelectedImage(galleryImages[newIndex]);
  };

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Header Section */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            The Gallery
          </p>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Design Inspiration
        </h1>

        <p className="text-xl text-gray-700 mb-3 leading-relaxed max-w-3xl mx-auto">
          Explore our curated portfolio of completed residences showcasing 
          craftsmanship and attention to detail that defines Henderson Design Group.
        </p>

        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Gallery */}
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {galleryImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => handleImageClick(image, index)}
              className="group relative overflow-hidden bg-white rounded-2xl cursor-pointer border border-[#005670]/10 shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={image.src}
                  alt={`Inspiration ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Number Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                  <span className="text-sm font-semibold text-[#005670]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-[#005670]/20 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <ZoomIn className="w-6 h-6 text-[#005670]" />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm transition-opacity duration-500"
        >
          {/* Close Button */}
          <button
            onClick={closeImage}
            className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/10 border border-white/30 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X className="w-7 h-7 text-white" />
          </button>

          {/* Prev */}
          <button
            onClick={() => navigateImage('prev')}
            className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 border border-white/30 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>

          {/* Image */}
          <img
            src={selectedImage.src}
            alt="Inspiration Large"
            className="max-w-[90%] max-h-[80vh] object-contain rounded-lg shadow-2xl select-none"
          />

          {/* Next */}
          <button
            onClick={() => navigateImage('next')}
            className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/10 border border-white/30 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>

          {/* Footer Counter */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-sm text-white/80 font-light tracking-wider">
            {selectedIndex + 1} / {galleryImages.length}
          </div>
        </div>
      )}

      <KeyboardNavigation
        onClose={closeImage}
        onPrev={() => navigateImage('prev')}
        onNext={() => navigateImage('next')}
      />
    </div>
  );
};

// Keyboard Navigation
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
