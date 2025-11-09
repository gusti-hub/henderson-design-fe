import React from 'react';
import { Leaf, CheckCircle } from 'lucide-react';

const EnvironmentPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            Sustainability
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Environmental Commitment
        </h1>
        <p className="text-xl text-gray-700 font-light leading-relaxed max-w-2xl mx-auto">
          We design with intention — not only for how a home looks and feels, but for how it impacts the world around it.
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Our Philosophy */}
        <Section title="Our Philosophy">
          <p>
            Hawaii's environment is fragile and finite. Every piece that arrives here stays here, making responsible
            sourcing and manufacturing essential to long-term sustainability.
          </p>
          <p className="mt-4">
            By producing over eighty percent of our furnishings in Indonesia, we directly oversee every stage of
            production—from raw materials to final packaging.
          </p>
          <p className="mt-4">
            Complete unit packages minimize excess packaging and consolidate shipments, dramatically lowering our carbon
            footprint compared to multi-vendor purchasing.
          </p>
        </Section>

        {/* Environmental Approach */}
        <Section title="Our Environmental Approach">
          <ul className="space-y-3 text-gray-700 text-lg">
            <li>• Maintain consistent quality and reduce waste at the source</li>
            <li>• Build and ship complete unit packages, minimizing excess packaging</li>
            <li>• Load each container by client unit, reducing handling and damage</li>
            <li>• Consolidate shipments to dramatically lower carbon footprint</li>
            <li>• Support skilled craftsmanship and sustainable forestry practices</li>
          </ul>
        </Section>

        {/* Impact Highlights */}
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Quality Control',
              desc: 'Direct oversight reduces waste at source.',
            },
            {
              title: 'Smart Packaging',
              desc: 'Minimal excess materials and recyclable components.',
            },
            {
              title: 'Efficient Logistics',
              desc: 'Container loading by unit minimizes handling and damage.',
            },
            {
              title: 'Lower Impact',
              desc: 'Consolidated shipments significantly reduce carbon emissions.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white border-2 border-[#005670]/10 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <h3 className="text-xl md:text-2xl font-bold text-[#005670] mb-3">
                {item.title}
              </h3>
              <p className="text-gray-700 text-lg">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Quote Section */}
        <div className="bg-white border-2 border-[#005670]/10 p-12 rounded-2xl text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
          <p className="text-2xl md:text-3xl font-light italic text-gray-700 mb-6 leading-relaxed">
            “Every decision we make considers longevity, recyclability, and environmental stewardship. 
            Our goal: create enduring interiors that respect the land, the people, and the planet.”
          </p>
          <p className="text-sm text-[#005670] uppercase tracking-wide font-semibold">
            Henderson Design Group
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="max-w-4xl mx-auto text-center mt-20">
        <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <p className="text-base text-[#005670] font-bold mb-2">Updated October 30, 2025</p>
          <p className="text-sm text-gray-600">Henderson Design Group – Environmental Commitment</p>
        </div>
      </div>
    </div>
  );
};

// Reusable Section component (same visual system as ProcessPage)
const Section = ({ title, children }) => (
  <section className="bg-white p-10 md:p-12 rounded-2xl border-2 border-[#005670]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-6">{title}</h2>
    <div className="text-gray-700 text-lg leading-relaxed space-y-4">{children}</div>
  </section>
);

export default EnvironmentPage;
