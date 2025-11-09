import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Menu, X } from 'lucide-react';
import AboutPage from './BrochurAssets/AboutPage';
import CollectionPage from './BrochurAssets/CollectionPage';
import ContactPage from './BrochurAssets/ContactPage';
import EnvironmentPage from './BrochurAssets/EnvironmentPage';
import ProcessPage from './BrochurAssets/ProcessPage'; 
import FAQPage from './BrochurAssets/FAQPage';
import InspirationPage from './BrochurAssets/InspirationPage';
import NextStepsPage from './BrochurAssets/NextStepsPage';
import PaymentPage from './BrochurAssets/PaymentPage';
import QuestionnairePage from './BrochurAssets/QuestionnairePage';
import TimelinePage from './BrochurAssets/TimelinePage';
import WarrantyPage from './BrochurAssets/WarrantyPage';

const translations = {
  en: {
    about: 'About',
    collection: 'Collection',
    inspiration: 'Inspiration',
    process: 'Process',
    timeline: 'Timeline',
    nextSteps: 'Next Steps',
    faq: 'FAQ',
    payment: 'Payment',
    warranty: 'Warranty & Care',
    environment: 'Environment',
    questionnaire: 'Questionnaire',
    contact: 'Contact',
    designerAccess: 'Designer Access',
    selectLanguage: 'Select Language',
    home: 'Home',
    menu: 'Menu',
    close: 'Close'
  }
};

// ===== HEADER - Segmented Control Style =====
const Navigation = ({ activeTab, setActiveTab, language, setLanguage }) => {
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const t = translations[language];

  const mainTabs = [
    { id: 'about', label: t.about },
    { id: 'collection', label: t.collection },
    { id: 'process', label: t.process },
    { id: 'timeline', label: t.timeline },
    { id: 'next-steps', label: t.nextSteps },
    { id: 'contact', label: t.contact }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <header className="relative z-50 bg-[#005670] shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-white/10">
      {/* Top bar - Made Smaller */}
      <div className="max-w-[1800px] mx-auto px-8 py-3 flex items-center justify-between">
        <div className="text-xs md:text-sm tracking-[0.2em] uppercase font-light text-white/70">
          <span className="font-semibold text-sm md:text-base text-white">Ālia</span> Furnishing Collection
        </div>

        <div className="flex items-center gap-3">
          {/* Language selector - Smaller */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="group flex items-center gap-2 text-sm font-semibold tracking-wide transition-all duration-300 px-3 py-2 rounded-lg border-2 text-white border-white/25 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span className="text-lg">{languages.find(l => l.code === language)?.flag}</span>
              <span className="hidden md:inline text-sm">{languages.find(l => l.code === language)?.name}</span>
            </button>

            {showLangMenu && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl min-w-[200px] py-1 z-50 overflow-hidden">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`relative w-full px-5 py-3 text-left text-base hover:bg-gray-50 transition-all flex items-center gap-3 ${
                      language === lang.code ? 'bg-[#005670]/10 text-[#005670] font-bold' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-semibold">{lang.name}</span>
                    {language === lang.code && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-[#005670]"></div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/designer-login')}
            className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-wide transition-all duration-300 px-4 py-2 rounded-lg border-2 text-white border-white/25 hover:border-white/50 hover:bg-white/10 active:scale-95"
          >
            <span>{t.designerAccess}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-[1800px] mx-auto px-8 border-t border-white/10">
        <div className="flex items-center justify-between py-5">
          {/* Logo */}
          <div className="flex items-center">
            <button onClick={() => setActiveTab('about')} className="group relative transition-transform duration-300 hover:scale-105 active:scale-95">
              <img
                src="/images/HDG-Logo.png"
                alt="Henderson Design Group"
                className="h-14 md:h-16 w-auto object-contain brightness-0 invert"
              />
            </button>
          </div>

          {/* Desktop nav - Segmented Control Style */}
          <nav className="hidden lg:flex items-stretch bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border-2 border-white/25 shadow-xl">
            {mainTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-8 py-4 text-base font-bold tracking-wide uppercase transition-all duration-300 ${
                  index === 0 ? 'rounded-l-xl' : ''
                } ${
                  index === mainTabs.length - 1 ? 'rounded-r-xl' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-white text-[#005670] shadow-lg z-10 scale-105'
                    : 'text-white hover:text-white hover:bg-white/15 active:scale-95'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-4 transition-all duration-300 rounded-xl border-2 text-white border-white/25 hover:border-white/50 hover:bg-white/10 active:scale-95"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {showMobileMenu && (
          <div className="lg:hidden pb-6 animate-slide-down">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border-2 border-white/25 space-y-1">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full px-6 py-4 text-left text-lg font-bold tracking-wide transition-all duration-300 rounded-xl ${
                    activeTab === tab.id
                      ? 'bg-white text-[#005670] shadow-lg scale-[1.02]'
                      : 'text-white hover:text-white hover:bg-white/15 active:scale-95'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};


// ===== FOOTER - Larger & Closer Spacing =====
const Footer = ({ setActiveTab, language, activeTab }) => {
  const t = translations[language];
  
  const footerTabs = [
    { id: 'inspiration', label: t.inspiration },
    { id: 'faq', label: t.faq },
    { id: 'payment', label: t.payment },
    { id: 'warranty', label: t.warranty },
    { id: 'environment', label: t.environment },
    { id: 'questionnaire', label: t.questionnaire }
  ];

  return (
    <footer className="relative bg-[#005670] shadow-[0_-2px_20px_rgba(0,0,0,0.3)] border-t border-white/10">
      <div className="max-w-[1800px] mx-auto px-8 py-8">
        {/* Additional Resources Navigation - Larger & Closer */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-5 text-center tracking-wide uppercase">
            Additional Resources
          </h3>
          
          {/* Desktop - Single Row, Larger & Tighter */}
          <nav className="hidden md:flex items-stretch bg-white/10 backdrop-blur-md rounded-xl p-1.5 border-2 border-white/25 shadow-xl max-w-6xl mx-auto">
            {footerTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex-1 px-5 py-3.5 text-sm font-bold tracking-wide uppercase transition-all duration-300 whitespace-nowrap ${
                  index === 0 ? 'rounded-l-lg' : ''
                } ${
                  index === footerTabs.length - 1 ? 'rounded-r-lg' : ''
                } ${
                  activeTab === tab.id
                    ? 'bg-white text-[#005670] shadow-lg z-10 scale-105'
                    : 'text-white hover:text-white hover:bg-white/15 active:scale-95'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Mobile - Stacked */}
          <nav className="md:hidden bg-white/10 backdrop-blur-md rounded-xl p-1.5 border-2 border-white/25 shadow-xl space-y-1 max-w-md mx-auto">
            {footerTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`w-full px-5 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                  activeTab === tab.id
                    ? 'bg-white text-[#005670] shadow-lg scale-[1.02]'
                    : 'text-white hover:text-white hover:bg-white/15 active:scale-95'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Content Grid - 2 Columns Only */}
        <div className="grid md:grid-cols-2 gap-10 pb-6 border-b border-white/10">
          {/* Company Info */}
          <div>
            <img
              src="/images/HDG-Logo.png"
              alt="Henderson Design Group"
              className="h-10 w-auto object-contain mb-3 brightness-0 invert"
            />
            <p className="text-sm text-white/80 leading-relaxed">
              Henderson Design Group specializes in curated, turnkey furnishing solutions for Hawaii's premier residential developments.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">
              Quick Links
            </h4>
            <div className="space-y-1">
              {[
                { id: 'about', label: t.about },
                { id: 'collection', label: t.collection },
                { id: 'process', label: t.process },
                { id: 'timeline', label: t.timeline },
                { id: 'contact', label: t.contact }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="block w-full text-left text-sm text-white/80 hover:text-white font-semibold transition-all duration-300 py-2 px-3 rounded-lg hover:bg-white/10 hover:translate-x-1 active:scale-95"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-5 text-center">
          <p className="text-sm font-semibold text-white tracking-wide mb-1">
            Ālia Project by Henderson Design Group
          </p>
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// ===== MAIN =====
const BrochureLandingPage = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderPage = () => {
    const pageProps = { setActiveTab, language };
    switch(activeTab) {
      case 'about': return <AboutPage {...pageProps} />;
      case 'collection': return <CollectionPage language={language} />;
      case 'inspiration': return <InspirationPage language={language} />;
      case 'process': return <ProcessPage language={language} />;
      case 'timeline': return <TimelinePage language={language} />;
      case 'next-steps': return <NextStepsPage language={language} />;
      case 'faq': return <FAQPage language={language} />;
      case 'payment': return <PaymentPage language={language} />;
      case 'warranty': return <WarrantyPage language={language} />;
      case 'environment': return <EnvironmentPage language={language} />;
      case 'questionnaire': return <QuestionnairePage language={language} />;
      case 'contact': return <ContactPage language={language} />;
      default: return <AboutPage {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white">
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
      />
      <main>{renderPage()}</main>
      <Footer setActiveTab={setActiveTab} language={language} activeTab={activeTab} />
    </div>
  );
};

export default BrochureLandingPage;