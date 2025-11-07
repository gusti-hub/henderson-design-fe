import React from 'react';
import { Shield } from 'lucide-react';

const WarrantyPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 animate-fade-in bg-white">
      {/* Header */}
      <div className="max-w-4xl mx-auto text-center mb-20">
        <div className="flex justify-center mb-6">
          <div className="bg-[#005670]/10 p-4 rounded-full">
            <Shield className="h-10 w-10 text-[#005670]" />
          </div>
        </div>
        <h1 className="text-6xl font-light text-[#005670] mb-4 tracking-tight">
          Warranty & Aftercare Policy
        </h1>
        <p className="text-lg text-gray-600 font-light">Ālia Furnishing Program</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Purpose */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Purpose</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            This document outlines the warranty coverage and aftercare guidelines provided by Henderson Design Group (HDG) 
            for the furnishings, fixtures, and accessories supplied and installed under the Ālia Furnishing Program. 
            The goal is to ensure every client receives continued support, clear maintenance guidance, and timely service when needed.
          </p>
        </div>

        {/* Warranty Coverage */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Warranty Coverage</h2>
          <p className="text-gray-700 leading-relaxed text-base mb-6">
            HDG warrants that all furnishings supplied under the Client Purchase Agreement are free from defects in 
            materials and workmanship for a period of <strong>one (1) year from the date of installation</strong>.
          </p>
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <h3 className="text-xl font-light text-[#005670] mb-4">This warranty covers:</h3>
            <ul className="space-y-3 text-gray-700 leading-relaxed">
              <li>• Structural defects in furniture frames, cabinetry, and joinery</li>
              <li>• Hardware and mechanism failures (hinges, drawer glides, latches, or similar components)</li>
              <li>• Upholstery stitching or seam failures not related to wear or misuse</li>
              <li>• Finishes or coatings that peel or delaminate under normal residential conditions</li>
              <li>• Manufacturing defects in accessories or lighting items supplied by HDG</li>
            </ul>
          </div>
        </div>

        {/* Exclusions */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Exclusions</h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-base">This warranty does not cover:</p>
          <div className="space-y-3 text-gray-700 text-base">
            <p>• Normal wear and tear, fading, or aging of materials</p>
            <p>• Damage from misuse, neglect, accident, or alterations by the client or third parties</p>
            <p>• Variations in color, grain, texture, or tone due to the natural characteristics of wood, stone, fabric, or rattan</p>
            <p>• Shrinkage or movement in natural materials caused by humidity, temperature, or environmental changes</p>
            <p>• Damage caused by improper cleaning, use of unapproved products, or failure to follow care instructions</p>
            <p>• Electrical components, appliances, or fixtures covered under manufacturer warranties</p>
            <p>• Damage resulting from building construction, water leaks, pests, or environmental exposure</p>
          </div>
        </div>

        {/* Warranty Limitations */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Warranty Limitations</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed text-base">
            <p>
              HDG's liability under this warranty is limited to repair or replacement of the defective item, at HDG's discretion. 
              If an identical replacement is unavailable, HDG may substitute an item of equal or greater value consistent with the design intent.
            </p>
            <p>
              Under no circumstances shall HDG be liable for consequential damages, loss of use, or any claim exceeding 
              the original purchase value of the defective item.
            </p>
          </div>
        </div>

        {/* Warranty Claims */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Warranty Claims</h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-base">
            All warranty claims must be submitted in writing through the HDG client portal or directly to your HDG Project Manager. 
            Claims must include:
          </p>
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <ul className="space-y-3 text-gray-700 leading-relaxed text-base">
              <li>• Client name and unit number</li>
              <li>• Description and photographs of the issue</li>
              <li>• Date of installation or purchase</li>
            </ul>
          </div>
          <p className="text-gray-700 leading-relaxed mt-6 text-base">
            HDG will acknowledge receipt of the claim within ten (10) business days and may request an onsite inspection 
            or additional information. Repairs or replacements will be scheduled as soon as practicable, based on material 
            and labor availability.
          </p>
        </div>

        {/* Service Outside Warranty */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Service Outside Warranty</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            After the one-year warranty period, HDG continues to offer support or referral out for repairs, refinishing, 
            and replacement parts at standard service rates. Clients may contact their Project Manager for quotes and scheduling.
          </p>
        </div>

        {/* Client Responsibilities */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Client Responsibilities</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            Clients agree to maintain furnishings in accordance with HDG's Care and Maintenance Guidelines, included in this binder. 
            Proper environmental conditions (temperature, humidity, and ventilation) are necessary to preserve materials and finishes. 
            Damage caused by failure to maintain these conditions is not covered under this warranty.
          </p>
        </div>

        {/* Product Care and Maintenance */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Product Care and Maintenance</h2>
          <p className="text-gray-700 leading-relaxed mb-6 text-base">General care recommendations include:</p>
          <div className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm">
            <ul className="space-y-3 text-gray-700 leading-relaxed text-base">
              <li>• Avoid direct prolonged sunlight exposure to prevent fading</li>
              <li>• Maintain indoor humidity between 40%–60% to minimize wood movement</li>
              <li>• Clean with a soft, damp cloth using mild, non-abrasive products</li>
              <li>• Do not use any bleach, ammonia, or solvent-based cleaners</li>
              <li>• Protect surfaces from standing water, hot objects, or sharp impacts</li>
              <li>• Vacuum or brush upholstery regularly without a beater bar (suction only)</li>
              <li>• Rotate upholstery cushions for even wear</li>
            </ul>
          </div>
        </div>

        {/* Transferability */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Transferability</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            This warranty applies only to the original purchaser and is non-transferable.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-gray-50 p-10 rounded-2xl shadow-sm">
          <h2 className="text-2xl font-light text-[#005670] mb-6">Governing Law</h2>
          <p className="text-gray-700 leading-relaxed text-base">
            This Warranty Policy shall be governed by and construed in accordance with the laws of the State of Hawaii.
          </p>
        </div>

        {/* Updated Date */}
        <div className="text-center">
          <p className="text-sm text-gray-500">Updated October 30, 2025</p>
        </div>
      </div>
    </div>
  );
};

export default WarrantyPage;
