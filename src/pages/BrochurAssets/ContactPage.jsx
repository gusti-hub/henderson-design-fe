import React from 'react';
import { Mail, MapPin, Sparkles, CheckCircle } from 'lucide-react';

const ContactPage = () => {
  return (
    <div className="pt-40 pb-24 px-6 animate-fade-in">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto text-center mb-24">
        {/* Decorative Element */}
        <div className="flex items-center justify-center mb-8">
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
          <Sparkles className="w-5 h-5 text-[#004b5f]/40 mx-4" />
          <div className="h-px w-16 bg-gradient-to-r from-transparent via-[#004b5f]/30 to-transparent"></div>
        </div>

        <h2 className="text-8xl font-extralight text-[#004b5f] mb-8 tracking-tight leading-none">
          Get in Touch
        </h2>

        <p className="text-xl text-gray-600 font-light leading-relaxed tracking-wide max-w-3xl mx-auto">
          We're here to answer your questions about the Ālia Furnishing Program
        </p>

        {/* Decorative Bottom Line */}
        <div className="flex items-center justify-center mt-8">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-[#004b5f]/20 to-transparent"></div>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 mb-24">
        {/* Email Card */}
        <div className="relative overflow-hidden bg-white border border-gray-100 hover:border-[#004b5f]/20 transition-all duration-500 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/5 to-transparent transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>

          <div className="relative p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light text-[#004b5f] mb-4">Email Us</h3>
            <p className="text-gray-600 mb-6 font-light">
              Send us your questions and we’ll respond within 24 hours.
            </p>
            <a
              href="mailto:aloha@henderson.house"
              className="text-[#004b5f] hover:text-[#007a9e] transition-colors font-light text-lg"
            >
              aloha@henderson.house
            </a>
          </div>
        </div>

        {/* Visit Card */}
        <div className="relative overflow-hidden bg-white border border-gray-100 hover:border-[#004b5f]/20 transition-all duration-500 hover:shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#004b5f]/5 to-transparent transform translate-x-16 -translate-y-16 group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-500"></div>

          <div className="relative p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#004b5f] to-[#007a9e] flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-light text-[#004b5f] mb-4">Visit Us</h3>
            <p className="text-gray-600 mb-6 font-light">By appointment only</p>
            <div className="text-gray-700 font-light space-y-2">
              <p>Henderson Design Group</p>
              <p>Hawaii Office</p>
              <p className="text-sm text-gray-500 mt-4">
                Please contact us via email to schedule an appointment
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto relative overflow-hidden border border-[#004b5f]/20 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-12 text-center">
        {/* Decorative Corners */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#004b5f]/40"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#004b5f]/40"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#004b5f]/40"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#004b5f]/40"></div>

        <div className="relative">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-[#004b5f]/30"></div>
            <CheckCircle className="w-6 h-6 text-[#004b5f]" />
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-[#004b5f]/30"></div>
          </div>

          <h3 className="text-3xl font-light text-[#004b5f] mb-6">Ready to Begin Your Design Journey?</h3>
          <p className="text-gray-700 font-light mb-8 leading-relaxed max-w-2xl mx-auto">
            Contact your Ālia sales representative or reach out to us directly to schedule your introduction meeting.
          </p>
          <a
            href="mailto:aloha@henderson.house"
            className="inline-flex items-center gap-3 bg-gradient-to-br from-[#004b5f] to-[#007a9e] text-white px-10 py-4 rounded-full hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            <Mail className="w-5 h-5" />
            <span className="font-light">Schedule a Meeting</span>
          </a>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ContactPage;
