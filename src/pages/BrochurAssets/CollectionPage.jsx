import React, { useState } from 'react';
import { X, FileText, Sparkles, ChevronRight } from 'lucide-react';

const CollectionPage = ({ language }) => {
  const [activeCollection, setActiveCollection] = useState('lani');
  const [showLookbook, setShowLookbook] = useState(false);

  const collections = [
    {
      id: 'lani',
      name: 'Lani Collection',
      tagline: 'The Pinnacle of Luxury',
      description:
        'Complete bespoke-level furnishing, including custom cabinetry, curated art, premium rugs, and designer accessories.',
      features: [
        'Custom Design',
        'Premium Materials',
        'Full Accessories',
        'Art Curation',
      ],
      details:
        'The Lani Collection represents the pinnacle of Hawaiian luxury living, with every element thoughtfully selected and customized for your unique space.',
      lookbook: '/pdfs/lani-lookbook.pdf',
    },
    {
      id: 'nalu',
      name: 'Nalu Collection',
      tagline: 'Sophisticated Balance',
      description:
        'Comprehensive furnishing with elevated design details and refined finish selections for sophisticated island living.',
      features: [
        'Elevated Design',
        'Quality Finishes',
        'Coordinated Style',
        'Designer Touches',
      ],
      details:
        'Nalu offers the perfect balance of sophistication and island comfort, with carefully curated pieces that create a cohesive, elegant environment.',
      lookbook: '/pdfs/nalu-lookbook.pdf',
    },
    {
      id: 'foundation',
      name: 'Foundation Collection',
      tagline: 'Elegant Essentials',
      description:
        'Streamlined essentials for move-in-ready comfort with quality furnishings and functional elegance.',
      features: [
        'Core Furnishings',
        'Move-In Ready',
        'Quality Basics',
        'Functional Design',
      ],
      details:
        'Foundation provides all the essentials for comfortable island living, with quality pieces that allow you to personalize your space over time.',
      lookbook: '/pdfs/foundation-lookbook.pdf',
    },
  ];

  const activeCollectionData = collections.find(
    (c) => c.id === activeCollection
  );

  return (
    <div className="pt-40 pb-24 px-6 animate-fade-in">
      {/* Hero Section - Ultra Elegant */}
      <div className="max-w-5xl mx-auto text-center mb-24">
        {/* Decorative Element - Perfectly positioned below header */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
          <Sparkles className="w-5 h-5 text-[#004b5f]/40 mx-4" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
        </div>
        
        <h2 className="text-8xl font-extralight text-[#004b5f] mb-8 tracking-tight leading-none">
          Ālia Collections
        </h2>
        
        <div className="max-w-3xl mx-auto">
          <p className="text-xl text-gray-600 font-light leading-relaxed tracking-wide">
            Three carefully curated expressions of island living, each designed to
            complement the Ālia architecture with distinct levels of customization
            and refinement.
          </p>
        </div>
        
        {/* Decorative Bottom Line */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#004b5f]/20 to-transparent"></div>
        </div>
      </div>

      {/* Collection Selector - Minimalist Elegant */}
      <div className="max-w-6xl mx-auto mb-20">
        <div className="relative">
          {/* Background Gradient Bar */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          
          <div className="flex justify-center gap-0 relative">
            {collections.map((collection, index) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection.id)}
                className={`group relative flex-1 max-w-xs px-12 py-8 transition-all duration-700 ${
                  activeCollection === collection.id
                    ? 'text-[#004b5f]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {/* Hover Background */}
                <div className={`absolute inset-0 transition-all duration-700 ${
                  activeCollection === collection.id
                    ? 'bg-gradient-to-b from-[#004b5f]/5 to-transparent'
                    : 'bg-transparent group-hover:bg-gray-50/50'
                }`}></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Collection Number */}
                  <div className={`text-xs tracking-[0.3em] uppercase mb-3 transition-all duration-500 ${
                    activeCollection === collection.id
                      ? 'text-[#004b5f]/60'
                      : 'text-gray-300 group-hover:text-gray-400'
                  }`}>
                    Collection {String(index + 1).padStart(2, '0')}
                  </div>
                  
                  {/* Collection Name */}
                  <div className="text-2xl font-light mb-2 tracking-wide transition-all duration-500">
                    {collection.name}
                  </div>
                  
                  {/* Tagline */}
                  <div className={`text-sm font-light tracking-wide transition-all duration-500 ${
                    activeCollection === collection.id
                      ? 'opacity-70'
                      : 'opacity-50 group-hover:opacity-60'
                  }`}>
                    {collection.tagline}
                  </div>
                </div>
                
                {/* Active Indicator - Elegant Line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#004b5f] to-transparent transition-all duration-700 ${
                  activeCollection === collection.id
                    ? 'opacity-100 scale-x-100'
                    : 'opacity-0 scale-x-0'
                }`}></div>
                
                {/* Subtle Side Divider */}
                {index < collections.length - 1 && (
                  <div className="absolute right-0 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Collection Content - Luxury Layout */}
      {activeCollectionData && (
        <div className="animate-fade-in max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Content */}
            <div className="space-y-10">
              {/* Description with Elegant Typography */}
              <div className="space-y-6">
                <p className="text-3xl text-gray-800 leading-relaxed font-extralight tracking-wide">
                  {activeCollectionData.description}
                </p>
                
                <div className="h-px w-24 bg-gradient-to-r from-[#004b5f]/30 to-transparent"></div>
                
                <p className="text-lg text-gray-600 leading-relaxed font-light">
                  {activeCollectionData.details}
                </p>
              </div>

              {/* Features Grid - Refined */}
              <div className="pt-8">
                <h3 className="text-sm font-light text-[#004b5f] mb-8 uppercase tracking-[0.3em]">
                  Collection Highlights
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  {activeCollectionData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="group relative"
                    >
                      {/* Elegant Card */}
                      <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50/50 p-6 border border-gray-100 transition-all duration-500 hover:shadow-lg hover:border-[#004b5f]/20">
                        {/* Corner Accent */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#004b5f]/5 to-transparent transform translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform duration-500"></div>
                        
                        {/* Number */}
                        <div className="text-xs text-[#004b5f]/30 font-light mb-3 tracking-wider">
                          {String(index + 1).padStart(2, '0')}
                        </div>
                        
                        {/* Feature Text */}
                        <div className="relative z-10">
                          <div className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#004b5f] mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-500"></div>
                            <span className="text-base text-gray-700 font-light leading-relaxed">
                              {feature}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Note - Elegant Info Box */}
              <div className="relative overflow-hidden">
                {/* Decorative Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#004b5f]/5 via-transparent to-transparent"></div>
                
                <div className="relative border-l-2 border-[#004b5f]/40 bg-white/80 backdrop-blur-sm p-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#004b5f]/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#004b5f]"></div>
                    </div>
                    <p className="text-sm text-gray-700 font-light leading-relaxed">
                      <span className="font-medium text-[#004b5f]">Customization Available:</span>{' '}
                      All collections can be tailored to your preferences. Connect with your design team
                      to explore specific modifications or create unique combinations.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Lookbook Preview Card */}
            <div className="lg:sticky lg:top-32">
              <div className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-700">
                {/* Decorative Corner Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/10 to-transparent -translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-[#004b5f]/10 to-transparent translate-x-16 translate-y-16"></div>
                
                {/* Content */}
                <div className="relative z-10 p-12">
                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-3xl font-extralight text-[#004b5f] mb-4 tracking-wide">
                    {activeCollectionData.name}
                  </h3>
                  
                  {/* Subtitle */}
                  <p className="text-sm text-gray-500 font-light mb-8 tracking-wide">
                    Comprehensive Lookbook
                  </p>
                  
                  {/* Description */}
                  <p className="text-base text-gray-600 font-light leading-relaxed mb-10">
                    Explore detailed imagery, specifications, and design inspiration for the {activeCollectionData.name}. 
                    View curated selections and finish options in our comprehensive digital lookbook.
                  </p>
                  
                  {/* Button - Ultra Elegant */}
                  <button
                    onClick={() => setShowLookbook(true)}
                    className="group/btn relative w-full overflow-hidden"
                  >
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#004b5f] via-[#005f75] to-[#007a9e] transition-transform duration-500 group-hover/btn:scale-105"></div>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"></div>
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-3 px-8 py-5 text-white">
                      <span className="text-sm tracking-[0.2em] uppercase font-light">
                        View Lookbook
                      </span>
                      <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                    </div>
                  </button>
                  
                  {/* Additional Info */}
                  <p className="text-xs text-gray-400 text-center mt-6 font-light tracking-wide">
                    Interactive digital preview
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LUXURY MODAL LOOKBOOK */}
      {showLookbook && activeCollectionData && (
        <div className="fixed inset-0 z-50 animate-fade-in">
          {/* Backdrop with Blur */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowLookbook(false)}
          ></div>
          
          {/* Modal Container */}
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-[1600px] h-[90vh] rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
              {/* Elegant Header */}
              <div className="relative border-b border-gray-100">
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-50 via-white to-gray-50"></div>
                
                {/* Header Content */}
                <div className="relative flex justify-between items-center px-12 py-8">
                  <div className="flex items-center gap-6">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center shadow-lg">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    
                    {/* Title */}
                    <div>
                      <h3 className="text-3xl font-extralight text-[#004b5f] mb-1 tracking-wide">
                        {activeCollectionData.name}
                      </h3>
                      <p className="text-sm text-gray-500 font-light tracking-wide">
                        Digital Lookbook Collection
                      </p>
                    </div>
                  </div>
                  
                  {/* Close Button - Elegant */}
                  <button
                    onClick={() => setShowLookbook(false)}
                    className="group relative w-12 h-12 rounded-full border border-gray-200 hover:border-[#004b5f] transition-all duration-300 hover:scale-110"
                  >
                    {/* Hover Background */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#004b5f]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Icon */}
                    <div className="relative flex items-center justify-center w-full h-full text-gray-400 group-hover:text-[#004b5f] group-hover:rotate-90 transition-all duration-300">
                      <X size={20} />
                    </div>
                  </button>
                </div>
              </div>

              {/* PDF Viewer with Frame */}
              <div className="relative h-[calc(90vh-120px)] bg-gray-50 p-6">
                <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden border border-gray-200">
                  <iframe
                    src={`${activeCollectionData.lookbook}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full"
                    title={`${activeCollectionData.name} Lookbook`}
                    style={{ border: 'none' }}
                  />
                </div>
              </div>

              {/* Elegant Footer */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white to-transparent flex items-center justify-center">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-light tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#004b5f]/30"></div>
                  <span>ĀLIA LIVING</span>
                  <div className="w-px h-3 bg-gray-300"></div>
                  <span>VIEW-ONLY PREVIEW</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#004b5f]/30"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CollectionPage;