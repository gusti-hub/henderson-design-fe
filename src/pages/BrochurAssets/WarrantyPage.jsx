import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

const WarrantyPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">
            Warranty & Care
          </p>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-[#005670] mb-6 leading-tight">
          Warranty & Aftercare Policy
        </h1>
        <p className="text-xl text-gray-700 font-light">
          Ālia Furnishing Program
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Purpose */}
        <Section title="Purpose">
          This document outlines the warranty coverage and aftercare guidelines provided by Henderson Design Group (HDG)
          for the furnishings, fixtures, and accessories supplied and installed under the Ālia Furnishing Program.
          The goal is to ensure every client receives continued support, clear maintenance guidance, and timely service when needed.
        </Section>

        {/* Warranty Coverage */}
        <Section title="Warranty Coverage">
          <p>
            HDG warrants that all furnishings supplied under the Client Purchase Agreement are free from defects in
            materials and workmanship for a period of <strong>one (1) year from the date of installation</strong>.
          </p>

          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mt-6">
            <h3 className="text-xl font-semibold text-[#005670] mb-4">This warranty covers:</h3>
            <ul className="space-y-3 text-gray-700">
              <li>• Structural defects in furniture frames, cabinetry, and joinery</li>
              <li>• Hardware and mechanism failures (hinges, drawer glides, latches, or similar components)</li>
              <li>• Upholstery stitching or seam failures not related to wear or misuse</li>
              <li>• Finishes or coatings that peel or delaminate under normal residential conditions</li>
              <li>• Manufacturing defects in accessories or lighting items supplied by HDG</li>
            </ul>
          </div>
        </Section>

        {/* Exclusions */}
        <Section title="Exclusions">
          <p>This warranty does not cover:</p>
          <ul className="space-y-3 mt-4 text-gray-700">
            <li>• Normal wear and tear, fading, or aging of materials</li>
            <li>• Damage from misuse, neglect, accident, or alterations by the client or third parties</li>
            <li>• Variations in color, grain, texture, or tone due to the natural characteristics of materials</li>
            <li>• Shrinkage or movement in wood, rattan, or stone due to humidity or temperature changes</li>
            <li>• Damage caused by improper cleaning or unapproved cleaning products</li>
            <li>• Electrical components or appliances covered under manufacturer warranties</li>
            <li>• Damage caused by building construction, water leaks, pests, or environmental exposure</li>
          </ul>
        </Section>

        {/* Warranty Limitations */}
        <Section title="Warranty Limitations">
          <p>
            HDG's liability under this warranty is limited to repair or replacement of the defective item, at HDG's discretion.
            If an identical replacement is unavailable, HDG may substitute an item of equal or greater value consistent with the design intent.
          </p>
          <p className="mt-4">
            Under no circumstances shall HDG be liable for consequential damages, loss of use,
            or any claim exceeding the original purchase value of the defective item.
          </p>
        </Section>

        {/* Warranty Claims */}
        <Section title="Warranty Claims">
          <p>
            All warranty claims must be submitted in writing through the HDG client portal or directly to your HDG Project Manager.
            Claims must include:
          </p>
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mt-6">
            <ul className="space-y-3 text-gray-700">
              <li>• Client name and unit number</li>
              <li>• Description and photographs of the issue</li>
              <li>• Date of installation or purchase</li>
            </ul>
          </div>
          <p className="mt-6">
            HDG will acknowledge receipt of the claim within ten (10) business days and may request an onsite inspection
            or additional information. Repairs or replacements will be scheduled as soon as practicable, based on material
            and labor availability.
          </p>
        </Section>

        {/* Service Outside Warranty */}
        <Section title="Service Outside Warranty">
          After the one-year warranty period, HDG continues to offer support or referrals for repairs, refinishing,
          and replacement parts at standard service rates. Clients may contact their Project Manager for quotes and scheduling.
        </Section>

        {/* Client Responsibilities */}
        <Section title="Client Responsibilities">
          Clients agree to maintain furnishings in accordance with HDG's Care and Maintenance Guidelines.
          Proper environmental conditions (temperature, humidity, and ventilation) are necessary to preserve materials and finishes.
          Damage caused by failure to maintain these conditions is not covered under this warranty.
        </Section>

        {/* Product Care and Maintenance */}
        <Section title="Product Care and Maintenance">
          <p>General care recommendations include:</p>
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mt-6">
            <ul className="space-y-3 text-gray-700">
              <li>• Avoid direct prolonged sunlight exposure</li>
              <li>• Maintain indoor humidity between 40%–60%</li>
              <li>• Clean with a soft, damp cloth using mild, non-abrasive products</li>
              <li>• Avoid bleach, ammonia, or solvent-based cleaners</li>
              <li>• Protect surfaces from standing water or sharp impacts</li>
              <li>• Vacuum upholstery gently; rotate cushions regularly</li>
            </ul>
          </div>
        </Section>

        {/* Transferability */}
        <Section title="Transferability">
          This warranty applies only to the original purchaser and is non-transferable.
        </Section>

        {/* Governing Law */}
        <Section title="Governing Law">
          This Warranty Policy shall be governed by and construed in accordance with the laws of the State of Hawaii.
        </Section>

        {/* Updated Footer */}
        <div className="max-w-4xl mx-auto text-center mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-base text-[#005670] font-bold mb-2">
              Updated October 30, 2025
            </p>
            <p className="text-sm text-gray-600">
              Henderson Design Group – Warranty & Aftercare Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Section Component (same style as ProcessPage)
const Section = ({ title, children }) => (
  <section className="bg-white p-10 md:p-12 rounded-2xl border-2 border-[#005670]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-6">{title}</h2>
    <div className="text-gray-700 text-lg leading-relaxed">{children}</div>
  </section>
);

export default WarrantyPage;
