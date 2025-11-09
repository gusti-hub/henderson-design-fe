import React, { useState } from "react";
import { X, FileText, ChevronRight, BookOpen } from "lucide-react";

const CollectionPage = () => {
  const [activeCollection, setActiveCollection] = useState("lani");
  const [showLookbook, setShowLookbook] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const collections = [
    {
      id: "lani",
      name: "Lani Collection",
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
        "The Lani Collection represents the pinnacle of Hawaiian luxury living, with every element thoughtfully selected and customized for your unique space, offering 300 different options of furniture to perfectly suit your style and needs.",
      lookbook: "/pdfs/lani-lookbook.pdf",
    },
    {
      id: "nalu",
      name: "Nalu Collection",
      tagline: "Sophisticated Balance",
      description:
        "This collection is our investment level option that has streamline selections curated by our design team, and also offering 250 different options of furnishings of furniture.",
      features: [
        "Over 250 Furniture Options",
        "2 Wood Finish Options",
        "Upholstery Fabric Options",
        "Mix and Match Wood Finishes",
      ],
      details:
        "Nalu offers the perfect balance of sophistication and island comfort, with carefully curated pieces that create a cohesive, elegant environment.",
      lookbook: "/pdfs/nalu-lookbook.pdf",
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
        "Foundation provides all the essentials for comfortable island living, with quality pieces that allow you to personalize your space over time.",
      lookbook: "/pdfs/foundation-lookbook.pdf",
      library: "/pdfs/foundation-library.pdf",
    },
  ];

  const activeCollectionData = collections.find(
    (c) => c.id === activeCollection
  );

  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white text-[#1a1a1a]">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">Our Collections</p>
        </div>
        <h2 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Ālia Collections
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          Three carefully curated expressions of island living, each designed to complement the Ālia
          architecture with distinct levels of customization and refinement.
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Tabs - Segmented Control Style */}
      <div className="max-w-5xl mx-auto mb-20">
        <nav className="hidden md:flex items-stretch bg-white/80 backdrop-blur-md rounded-2xl p-1.5 border-2 border-[#005670]/20 shadow-xl">
          {collections.map((collection, index) => (
            <button
              key={collection.id}
              onClick={() => setActiveCollection(collection.id)}
              className={`flex-1 flex flex-col items-center justify-center px-8 py-5 text-base font-bold tracking-wide uppercase transition-all duration-300 ${
                index === 0 ? 'rounded-l-xl' : ''
              } ${
                index === collections.length - 1 ? 'rounded-r-xl' : ''
              } ${
                activeCollection === collection.id
                  ? "bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg z-10 scale-105"
                  : "text-[#005670] hover:bg-[#005670]/5 active:scale-95"
              }`}
            >
              <span className="mb-1">{collection.name}</span>
              <span className={`text-xs font-semibold ${
                activeCollection === collection.id ? "text-white/90" : "text-gray-500"
              }`}>
                {collection.tagline}
              </span>
            </button>
          ))}
        </nav>

        {/* Mobile - Stacked */}
          <div className="md:hidden bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-[#005670]/30 shadow-xl space-y-4">
            {collections.map((collection) => (
              <button
                key={collection.id}
                onClick={() => setActiveCollection(collection.id)}
                className={`w-full flex flex-col items-center justify-center px-8 py-6 text-lg font-semibold tracking-wide uppercase transition-all duration-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#005670]/30 ${
                  activeCollection === collection.id
                    ? "bg-gradient-to-br from-[#005670] to-[#007a9a] text-white shadow-lg scale-[1.03]"
                    : "text-[#005670] bg-white hover:bg-[#005670]/10 active:scale-95"
                }`}
              >
                <span className="mb-2 leading-relaxed">{collection.name}</span>
                <span
                  className={`text-sm font-medium ${
                    activeCollection === collection.id
                      ? "text-white/90"
                      : "text-[#007a9a]" // 💙 Ganti abu-abu jadi biru lembut
                  }`}
                >
                  {collection.tagline}
                </span>
              </button>
            ))}
          </div>

      </div>

      {/* Active Content */}
      {activeCollectionData && (
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Text Section */}
          <div className="space-y-10">
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
              <div className="space-y-6">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {activeCollectionData.description}
                </p>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {activeCollectionData.details}
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-1 bg-[#005670] rounded-full"></div>
                <h3 className="text-2xl font-bold text-[#005670]">
                  Collection Highlights
                </h3>
              </div>
              <ul className="space-y-3 text-lg text-gray-700">
                {activeCollectionData.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-[#005670] text-2xl leading-none mt-1">•</span>
                    <span className="flex-1">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Library Button */}
            {activeCollection === "foundation" &&
              activeCollectionData.library && (
                <button
                  onClick={() => setShowLibrary(true)}
                  className="w-full flex items-center justify-center gap-4 bg-gradient-to-br from-[#005670] to-[#007a9a] hover:from-[#004150] hover:to-[#005670] text-white px-8 py-5 rounded-xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <BookOpen className="w-6 h-6" />
                  View Design Library
                </button>
              )}

            {/* Customization Note */}
            <div className="bg-gradient-to-br from-[#005670]/5 to-[#007a9a]/5 border-l-4 border-[#005670] rounded-r-xl p-6">
              <p className="text-base text-gray-800 leading-relaxed">
                <span className="text-[#005670] font-bold text-lg block mb-2">
                  Customization Available
                </span>
                All collections can be tailored to your preferences. Connect with your design team to explore specific modifications or create unique combinations.
              </p>
            </div>
          </div>

          {/* Lookbook Section */}
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
                  Comprehensive Lookbook
                </p>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  Explore detailed imagery, specifications, and design inspiration for the{" "}
                  {activeCollectionData.name}. View curated selections and finish options in our
                  comprehensive digital lookbook.
                </p>
                <button
                  onClick={() => setShowLookbook(true)}
                  className="w-full bg-gradient-to-br from-[#005670] to-[#007a9a] hover:from-[#004150] hover:to-[#005670] text-white py-5 rounded-xl text-lg font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  View Lookbook
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-sm text-gray-500 mt-4 font-semibold">
                  Interactive Digital Preview
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lookbook Modal */}
      {showLookbook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLookbook(false)}
          ></div>
          <div className="relative bg-white w-full max-w-[1600px] h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-8 py-5 border-b-2 border-[#005670]/10 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#005670]">
                    {activeCollectionData.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-semibold">
                    Digital Lookbook
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLookbook(false)}
                className="w-12 h-12 rounded-full bg-white border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 flex items-center justify-center transition-all duration-300 active:scale-95"
              >
                <X className="text-[#005670]" size={24} />
              </button>
            </div>
            <iframe
              src={`${activeCollectionData.lookbook}#toolbar=0`}
              className="w-full h-[calc(90vh-80px)]"
              title={`${activeCollectionData.name} Lookbook`}
              style={{ border: "none" }}
            ></iframe>
          </div>
        </div>
      )}

      {/* Library Modal (similar to Lookbook) */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowLibrary(false)}
          ></div>
          <div className="relative bg-white w-full max-w-[1600px] h-[90vh] rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center px-8 py-5 border-b-2 border-[#005670]/10 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#005670]">
                    {activeCollectionData.name}
                  </h3>
                  <p className="text-sm text-gray-500 font-semibold">
                    Design Library
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLibrary(false)}
                className="w-12 h-12 rounded-full bg-white border-2 border-[#005670]/20 hover:border-[#005670] hover:bg-[#005670]/5 flex items-center justify-center transition-all duration-300 active:scale-95"
              >
                <X className="text-[#005670]" size={24} />
              </button>
            </div>
            <iframe
              src={`${activeCollectionData.library}#toolbar=0`}
              className="w-full h-[calc(90vh-80px)]"
              title={`${activeCollectionData.name} Library`}
              style={{ border: "none" }}
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionPage;