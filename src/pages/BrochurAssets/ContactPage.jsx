import React from 'react';
import { Mail, MapPin, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="pt-32 pb-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-20">
        <div className="inline-block bg-[#005670]/5 px-8 py-3 rounded-full mb-6">
          <p className="text-sm font-bold text-[#005670] tracking-widest uppercase">Contact Us</p>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-[#005670] mb-6 leading-tight">
          Get in Touch
        </h2>

        <p className="text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
          We're here to answer your questions about the Ālia Furnishing Program
        </p>

        <div className="w-24 h-1 bg-[#005670] mx-auto mt-6 rounded-full"></div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 mb-20">
        {/* Email Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4">Email Us</h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Send us your questions and we'll respond within 24 hours.
            </p>

            <a
              href="mailto:aloha@henderson.house"
              className="inline-block text-[#005670] hover:text-[#007a9a] transition-colors font-bold text-xl bg-[#005670]/5 px-6 py-3 rounded-xl hover:bg-[#005670]/10"
            >
              aloha@henderson.house
            </a>
          </div>
        </div>

        {/* Visit Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-[#005670]/10 overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <div className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#005670] to-[#007a9a] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-[#005670] mb-4">Visit Us</h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">By appointment only</p>
            <div className="text-gray-700 space-y-2 text-lg">
              <p className="font-semibold">Henderson Design Group</p>
              <p className="font-semibold">Hawaii Office</p>
              <p className="text-base text-gray-500 mt-4 bg-gray-50 px-4 py-3 rounded-xl">
                Please contact us via email to schedule an appointment
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
