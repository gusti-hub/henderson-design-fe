import React from 'react';
import { CheckCircle } from 'lucide-react';

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
          WARRANTY & AFTERCARE
        </h1>
        <p className="text-xl text-gray-700 font-light">
          Ālia Furnishings Program
        </p>
        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto space-y-12">

        <Section title="Purpose">
          <p>
            This Warranty & Aftercare Policy outlines the warranty coverage and ongoing support provided by
            Henderson Design Group ("HDG") for furnishings, fixtures, lighting, accessories, and related products
            supplied and installed under the Ālia Furnishings Collections.
          </p>
          <p className="mt-4">
            Our goal is to ensure every client receives exceptional service, clear maintenance guidance, and
            continued support throughout ownership.
          </p>
        </Section>

        <Section title="Warranty Coverage">
          <p>
            The warranty period begins on the date of installation and applies only to the original purchaser.
          </p>
        </Section>

        <Section title="90-Day Installation Warranty">
          <p>
            HDG warrants all installation workmanship for ninety (90) days following installation.
          </p>
          <p className="mt-4 font-semibold text-[#005670]">This warranty covers:</p>
          <BulletList items={[
            'Installation-related adjustments',
            'Drawer and cabinet door alignment',
            'Hardware tightening and adjustments',
            'Minor punch-list corrections',
            'Installation workmanship defects',
          ]} />
        </Section>

        <Section title="3-Year Structural Warranty">
          <p>
            HDG warrants furniture frames, cabinetry, millwork, and joinery against defects in materials and
            workmanship for three (3) years from the date of installation.
          </p>
          <p className="mt-4 font-semibold text-[#005670]">This warranty covers:</p>
          <BulletList items={[
            'Structural failure of furniture frames',
            'Joinery defects',
            'Cabinetry construction defects',
            'Manufacturing defects affecting structural integrity',
          ]} />
        </Section>

        <Section title="2-Year Upholstery Construction Warranty">
          <p>
            HDG warrants upholstery construction for two (2) years from the date of installation.
          </p>
          <p className="mt-4 font-semibold text-[#005670]">This warranty covers:</p>
          <BulletList items={[
            'Spring and suspension system failure',
            'Cushion support system defects',
            'Upholstery workmanship defects',
            'Seam failures resulting from manufacturing defects',
          ]} />
          <p className="mt-6 font-semibold text-[#005670]">This warranty does not cover:</p>
          <BulletList items={[
            'Normal softening of cushions',
            'Fabric wrinkling',
            'Compression from regular use',
            'Pilling, stretching, or wear associated with normal residential use',
          ]} />
        </Section>

        <Section title="1-Year Finishes, Hardware, and Component Warranty">
          <p>
            HDG warrants finishes, hardware, decorative lighting, accessories, and related components against
            manufacturing defects for one (1) year from the date of installation.
          </p>
          <p className="mt-4 font-semibold text-[#005670]">This warranty covers:</p>
          <BulletList items={[
            'Finish delamination or peeling under normal residential conditions',
            'Hardware failures',
            'Decorative lighting defects supplied by HDG',
            'Manufacturing defects in accessories supplied by HDG',
          ]} />
        </Section>

        <Section title="Manufacturer Warranties">
          <p>
            Appliances, electronics, motorized systems, specialty lighting, and other third-party products may
            carry separate manufacturer warranties.
          </p>
          <p className="mt-4">
            Where applicable, HDG will assist clients in coordinating warranty claims with the original manufacturer;
            however, coverage remains subject to the manufacturer's warranty terms and conditions.
          </p>
        </Section>

        <Section title="Lani Collection Wellness Visit">
          <p>
            Lani Collection clients receive one (1) complimentary Furnishings Wellness Visit approximately
            twelve (12) months following installation.
          </p>
          <p className="mt-4">
            The visit includes a walkthrough of the residence with an HDG representative to review furniture
            condition, answer care and maintenance questions, and identify any recommended service, repair, or
            enhancement opportunities.
          </p>
          <p className="mt-4">
            The Wellness Visit is provided as a courtesy benefit and does not extend or modify warranty coverage.
          </p>
        </Section>

        <Section title="Exclusions">
          <p>This warranty does not cover:</p>
          <BulletList items={[
            'Normal wear and tear',
            'Fading, discoloration, or aging of materials',
            'Damage resulting from misuse, abuse, neglect, or accidents',
            'Pet damage',
            'Stains, spills, burns, scratches, dents, or impact damage',
            'Damage resulting from improper cleaning or maintenance',
            'Damage caused by unapproved cleaning products, coatings, treatments, or modifications',
            'Water intrusion, leaks, flooding, excessive moisture, or mold',
            'Damage resulting from construction activities performed by others',
            'Damage caused by pests or insects',
            'Excessive sunlight or ultraviolet exposure',
            'Commercial or non-residential use',
            'Natural variations in wood grain, stone, leather, fabric, rattan, or other natural materials',
            'Dye lot variations',
            'Natural expansion, contraction, movement, checking, or cracking of wood and stone due to environmental conditions',
          ]} />
        </Section>

        <Section title="Client Responsibilities">
          <p>
            Clients agree to maintain furnishings in accordance with HDG's Care and Maintenance Guidelines.
          </p>
          <p className="mt-4">
            Proper environmental conditions, including temperature, humidity, and ventilation, are necessary to
            preserve materials and finishes.
          </p>
          <p className="mt-4">
            Damage resulting from improper maintenance or environmental conditions is not covered under this warranty.
          </p>
        </Section>

        <Section title="Warranty Claims">
          <p>
            Submit all warranty claims in writing through the HDG Client Portal or directly to the assigned
            HDG Project Manager.
          </p>
          <p className="mt-4 font-semibold text-[#005670]">Claims should include:</p>
          <BulletList items={[
            'Client name',
            'Unit number',
            'Description of the issue',
            'Photographs documenting the issue',
            'Installation date',
          ]} />
          <p className="mt-6">
            HDG will acknowledge receipt of the claim within ten (10) business days and may request additional
            information or an onsite inspection.
          </p>
        </Section>

        <Section title="Warranty Limitations">
          <p>
            HDG's liability under this warranty is limited to repair, replacement, refinishing, or correction of
            the affected item, at HDG's sole discretion.
          </p>
          <p className="mt-4">
            If an identical replacement is unavailable, HDG may substitute an item of equal or greater value
            consistent with the original design intent.
          </p>
          <p className="mt-4">
            Under no circumstances shall HDG be liable for incidental, consequential, indirect, or special damages,
            including loss of use, relocation expenses, temporary housing costs, or claims exceeding the original
            purchase value of the affected item.
          </p>
          <p className="mt-4">
            This warranty does not provide for refunds.
          </p>
        </Section>

        <Section title="Aftercare Services">
          <p>
            Following expiration of the warranty period, HDG remains available to assist clients with:
          </p>
          <BulletList items={[
            'Repairs',
            'Refinishing',
            'Replacement parts',
            'Reupholstery',
            'Furniture modifications',
            'Furnishing additions and enhancements',
            'Seasonal styling and accessory refreshes',
            'Relocation and reinstallation services',
          ]} />
          <p className="mt-6">
            These services are available on a fee-for-service basis and subject to labor and material availability.
          </p>
        </Section>

        <Section title="Transferability">
          <p>This warranty applies only to the original purchaser and is non-transferable.</p>
        </Section>

        <Section title="Governing Law">
          <p>
            This Warranty & Aftercare Policy shall be governed by and construed in accordance with the laws of
            the State of Hawaii.
          </p>
        </Section>

        {/* Updated Footer */}
        <div className="max-w-4xl mx-auto text-center mt-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-[#005670]/10">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <p className="text-base text-[#005670] font-bold mb-2">
              Last Updated: June 2026
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

const Section = ({ title, children }) => (
  <section className="bg-white p-10 md:p-12 rounded-2xl border-2 border-[#005670]/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h2 className="text-2xl md:text-3xl font-bold text-[#005670] mb-6 uppercase tracking-wide">{title}</h2>
    <div className="text-gray-700 text-lg leading-relaxed">{children}</div>
  </section>
);

const BulletList = ({ items }) => (
  <ul className="mt-4 space-y-3 text-gray-700">
    {items.map((item, i) => (
      <li key={i}>• {item}</li>
    ))}
  </ul>
);

export default WarrantyPage;
