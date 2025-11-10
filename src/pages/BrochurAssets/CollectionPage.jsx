import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  BookOpen,
  ZoomIn,
  ZoomOut,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";

// ===================== IMAGE VIEWER =====================
const ImageViewer = ({ images, onClose, title, icon: Icon = FileText }) => {
  const [scale, setScale] = useState(1.5);
  const [currentPage, setCurrentPage] = useState(1);

  const handleZoomIn = () => {
    if (scale < 2) setScale((prev) => prev + 0.25);
  };

  const handleZoomOut = () => {
    if (scale > 0.5) setScale((prev) => prev - 0.25);
  };

  useEffect(() => {
    const preventActions = (e) => {
      if (e.target.tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener("contextmenu", preventActions);
    return () => document.removeEventListener("contextmenu", preventActions);
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      const container = e.target;
      const images = container.querySelectorAll(".page-image");
      images.forEach((img, index) => {
        const rect = img.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (
          rect.top >= containerRect.top &&
          rect.top <= containerRect.top + containerRect.height / 2
        ) {
          setCurrentPage(index + 1);
        }
      });
    };
    const container = document.getElementById("pdf-scroll-container");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fadeIn">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      <div className="relative bg-white w-full max-w-[1600px] h-[90vh] mx-4 rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center px-6 md:px-8 py-4 md:py-5 border-b-2 border-[#005670]/10 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center shadow-lg">
              <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-[#005670] line-clamp-1">
                {title}
              </h3>
              <p className="text-xs md:text-sm text-gray-500 font-semibold">
                Page {currentPage} of {images.length}
              </p>
            </div>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 0.5}
              className="p-2 rounded-lg bg-white border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ZoomOut className="w-5 h-5 text-[#005670]" />
            </button>
            <span className="text-sm font-semibold text-[#005670] min-w-[60px] text-center hidden sm:block">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 2}
              className="p-2 rounded-lg bg-white border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ZoomIn className="w-5 h-5 text-[#005670]" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 flex items-center justify-center transition-all duration-300 active:scale-95"
          >
            <X className="text-[#005670]" size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          id="pdf-scroll-container"
          className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-100 p-4 md:p-8"
          style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="page-image relative bg-white shadow-2xl rounded-lg overflow-hidden"
                style={{
                  transform: `scale(${scale})`,
                  transformOrigin: "top center",
                  transition: "transform 0.3s ease-out",
                  marginBottom: scale > 1 ? `${(scale - 1) * 100}px` : "0",
                }}
              >
                <img
                  src={image}
                  alt={`Page ${index + 1}`}
                  className="w-full h-auto select-none"
                  draggable={false}
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ userSelect: "none", pointerEvents: "none" }}
                  loading={index > 2 ? "lazy" : "eager"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-4 px-4 py-4 border-t-2 border-[#005670]/10 bg-white flex-shrink-0">
          <div className="text-sm text-gray-600">
            Scroll to view all{" "}
            <span className="font-bold text-[#005670]">{images.length}</span>{" "}
            pages
          </div>
        </div>
      </div>
    </div>
  );
};

// ===================== MAIN PAGE =====================
const CollectionsPage = () => {
  const [activeCollection, setActiveCollection] = useState("lani");
  const [showLookbook, setShowLookbook] = useState(false);

  const generateImagePaths = (folder, count) => {
    return Array.from({ length: count }, (_, i) => `/pdfs/${folder}/${i + 1}.jpg`);
  };

  const collections = [
    {
      id: "lani",
      name: "Lani Collections",
      tagline: "The Pinnacle of Luxury",
      description:
        "Complete bespoke-level furnishing, including custom furnishings, curated art, premium rugs, and accessories.",
      features: [
        "Custom Design",
        "Premium Materials",
        "Accessories and Wall Coverings",
        "Art Curation",
      ],
      details:
        "The Lani Collection represents the pinnacle of Hawaiian luxury living, offering 300 different options of furniture, each carefully curated for timeless elegance.",
      lookbookImages: generateImagePaths("lani-lookbook", 26),
    },
    {
      id: "nalu",
      name: "Nalu Collections",
      tagline: "Sophisticated Balance",
      description:
        "An investment-level option with 250+ carefully curated furniture options, blending comfort and sophistication.",
      features: [
        "Over 250 Furniture Options",
        "2 Wood Finish Options",
        "Upholstery Fabric Options",
        "Mix and Match Wood Finishes",
      ],
      details:
        "Nalu combines balance and harmony in every space, merging organic materials with refined island design.",
      lookbookImages: generateImagePaths("nalu-lookbook", 16),
    },
    {
      id: "foundation",
      name: "Foundation Collection",
      tagline: "Elegant Essentials",
      description:
        "Streamlined essentials for move-in-ready comfort with quality furnishings and functional elegance.",
      features: [
        "Foundation Furnishings",
        "Move-In Ready",
        "Simplified, Curated Essentials",
        "Cohesive Foundation For Your Space",
      ],
      details:
        "Foundation provides all the essentials for comfortable island living, offering a practical yet refined experience.",
      lookbookImages: generateImagePaths("foundation-lookbook", 18),
    },
    {
      id: "library",
      name: "Design Library",
      tagline: "Curated Resources",
      description:
        "Explore curated references and design inspirations tailored to elevate your creative process.",
      features: [
        "Mood Boards",
        "Material Palettes",
        "Color Inspirations",
        "Sample Layouts",
      ],
      details:
        "The Design Library provides access to visual references and curated palettes that guide refined decision-making.",
      lookbookImages: generateImagePaths("foundation-library", 45), // ✅ updated folder name
    },
  ];

  const activeCollectionData = collections.find((c) => c.id === activeCollection);

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white text-[#1a1a1a]">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            Our Collections
          </p>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Ālia Collections
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Four curated expressions of island living, each reflecting a unique
          design philosophy and craftsmanship level.
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-20 flex items-center">
        <nav className="flex-1 flex items-stretch bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border-2 border-[#005670]/20 shadow-xl w-full">
          {collections.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActiveCollection(c.id)}
              className={`flex-1 flex flex-col items-center justify-center px-6 py-5 text-base font-bold tracking-wide uppercase transition-all duration-300 border-r last:border-r-0 border-[#005670]/10 ${
                activeCollection === c.id
                  ? "bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg z-10 scale-[1.03]"
                  : "text-[#005670] hover:bg-[#005670]/5 active:scale-95"
              }`}
            >
              <span className="mb-1">{c.name}</span>
              <span
                className={`text-xs font-semibold ${
                  activeCollection === c.id ? "text-white/90" : "text-gray-500"
                }`}
              >
                {c.tagline}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeCollectionData && (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div className="space-y-10">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
              <p className="text-xl text-gray-700 leading-relaxed">
                {activeCollectionData.description}
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mt-4">
                {activeCollectionData.details}
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h3 className="text-2xl font-bold text-[#005670]">
                  Highlights
                </h3>
              </div>
              <ul className="space-y-3 text-lg text-gray-700">
                {activeCollectionData.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#005670] text-2xl leading-none mt-1">
                      •
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Content */}
          <div className="lg:sticky lg:top-32">
            <div className="bg-white rounded-2xl p-10 shadow-xl border-2 border-[#005670]/10">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center shadow-lg">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-[#005670] mb-3">
                  {activeCollectionData.name}
                </h3>
                <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest font-bold">
                  {activeCollectionData.id === "library"
                    ? "Design Reference"
                    : "Comprehensive Lookbook"}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  {activeCollectionData.id === "library"
                    ? "Browse curated inspirations and foundational design resources."
                    : `Explore imagery, specifications, and design inspiration for the ${activeCollectionData.name}.`}
                </p>
                <button
                  onClick={() => setShowLookbook(true)}
                  className="w-full bg-gradient-to-br from-[#005670] to-[#007a9a] hover:from-[#004150] hover:to-[#005670] text-white py-5 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  {activeCollectionData.id === "library"
                    ? "View Library"
                    : "View Lookbook"}
                  <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-500 mt-4 font-semibold">
                  {activeCollectionData.lookbookImages.length} Pages • Interactive Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lookbook Modal */}
      {showLookbook && (
        <ImageViewer
          images={activeCollectionData.lookbookImages}
          onClose={() => setShowLookbook(false)}
          title={`${activeCollectionData.name}`}
          icon={activeCollectionData.id === "library" ? BookOpen : FileText}
        />
      )}
    </div>
  );
};

export default CollectionsPage;
