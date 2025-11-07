import React from 'react';
import { Leaf } from 'lucide-react';

const EnvironmentPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in bg-white">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="flex justify-center mb-6">
          <div className="bg-[#005670]/10 p-4 rounded-full">
            <Leaf className="h-10 w-10 text-[#005670]" />
          </div>
        </div>
        <h1 className="text-6xl font-light text-[#005670] mb-4 tracking-tight">
          Environmental Commitment
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
          We design with intention — not only for how a home looks and feels, but for how it impacts the world around it.
        </p>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Philosophy */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">
            Our Philosophy
          </h2>
          <div className="space-y-5 text-gray-700 leading-relaxed text-base">
            <p>
              Hawaii's environment is fragile and finite. Every piece that arrives here stays here, making responsible sourcing and manufacturing essential to long-term sustainability.
            </p>
            <p>
              By producing over eighty percent of our furnishings in Indonesia, we directly oversee every stage of production—from raw materials to final packaging.
            </p>
            <p>
              Complete unit packages minimize excess packaging and consolidate shipments, dramatically lowering our carbon footprint compared to multi-vendor purchasing.
            </p>
          </div>
        </div>

        {/* Approach */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">
            Our Environmental Approach
          </h2>
          <ul className="space-y-3 text-gray-700 leading-relaxed text-base">
            <li>• Maintain consistent quality and reduce waste at the source</li>
            <li>• Build and ship complete unit packages, minimizing excess packaging</li>
            <li>• Load each container by client unit, reducing handling and damage</li>
            <li>• Consolidate shipments to dramatically lower carbon footprint</li>
            <li>• Support skilled craftsmanship and sustainable forestry practices</li>
          </ul>
        </div>

        {/* Impact Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Quality Control',
              desc: 'Direct oversight reduces waste at source',
            },
            {
              title: 'Smart Packaging',
              desc: 'Minimal excess materials and waste',
            },
            {
              title: 'Efficient Logistics',
              desc: 'Container loading by unit minimizes handling',
            },
            {
              title: 'Lower Impact',
              desc: 'Consolidated shipments reduce carbon footprint',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-gray-50 border-l-4 border-[#005670] p-8 rounded-lg shadow-sm"
            >
              <h3 className="text-xl font-light text-[#005670] mb-3">
                {item.title}
              </h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote */}
        <div className="bg-[#005670]/5 p-12 rounded-2xl text-center shadow-sm">
          <p className="text-2xl font-light italic text-gray-700 mb-6 leading-relaxed">
            "Every decision we make considers longevity, recyclability, and environmental stewardship. 
            Our goal: create enduring interiors that respect the land, the people, and the planet."
          </p>
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            Henderson Design Group
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentPage;
