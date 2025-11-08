import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight,
  Globe,
  Menu
} from 'lucide-react';
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

// Language translations
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
    selectLanguage: 'Select Language'
  },
  id: {
    about: 'Tentang',
    collection: 'Koleksi',
    inspiration: 'Inspirasi',
    process: 'Proses',
    timeline: 'Timeline',
    nextSteps: 'Langkah Selanjutnya',
    faq: 'FAQ',
    payment: 'Pembayaran',
    warranty: 'Garansi & Perawatan',
    environment: 'Lingkungan',
    questionnaire: 'Kuesioner',
    contact: 'Kontak',
    designerAccess: 'Akses Desainer',
    selectLanguage: 'Pilih Bahasa'
  },
  zh: {
    about: '关于',
    collection: '系列',
    inspiration: '灵感',
    process: '流程',
    timeline: '时间表',
    nextSteps: '下一步',
    faq: '常见问题',
    payment: '付款',
    warranty: '保修与护理',
    environment: '环境',
    questionnaire: '问卷',
    contact: '联系',
    designerAccess: '设计师访问',
    selectLanguage: '选择语言'
  },
  ja: {
    about: '概要',
    collection: 'コレクション',
    inspiration: 'インスピレーション',
    process: 'プロセス',
    timeline: 'タイムライン',
    nextSteps: '次のステップ',
    faq: 'よくある質問',
    payment: '支払い',
    warranty: '保証とケア',
    environment: '環境',
    questionnaire: 'アンケート',
    contact: 'お問い合わせ',
    designerAccess: 'デザイナーアクセス',
    selectLanguage: '言語を選択'
  }
};

// Luxury Navigation Component - FIXED LOGO CUTOFF
const Navigation = ({ activeTab, setActiveTab, language, setLanguage }) => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const t = translations[language];
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const isAboutPage = activeTab === 'about';
  const needsSolidBg = !isAboutPage || isScrolled;
  
  const mainTabs = [
    { id: 'about', label: t.about },
    { id: 'collection', label: t.collection },
    { id: 'inspiration', label: t.inspiration },
    { id: 'process', label: t.process },
    { id: 'timeline', label: t.timeline },
    { id: 'next-steps', label: t.nextSteps }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    // { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
    // { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <header className={`${isAboutPage && !isScrolled ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 transition-all duration-700 ${
      needsSolidBg 
        ? 'bg-white/95 backdrop-blur-xl border-b border-gray-100/50 shadow-lg shadow-gray-900/5' 
        : 'bg-transparent'
    }`}>
      {/* Top Bar - Ultra Minimal & Compact */}
      <div className="border-b border-white/10">
        <div className="max-w-[1800px] mx-auto px-8 py-2 flex items-center justify-between">
          <div className={`text-xs tracking-[0.2em] uppercase font-light transition-colors ${
            needsSolidBg ? 'text-gray-400' : 'text-white/50'
          }`}>
            Ālia Furnishing Collection
          </div>
          
          <div className="flex items-center gap-6">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className={`flex items-center gap-2 text-xs tracking-wider uppercase transition-all ${
                  needsSolidBg 
                    ? 'text-gray-600 hover:text-[#005670]' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{languages.find(l => l.code === language)?.flag}</span>
              </button>
              
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-100 shadow-xl rounded-sm min-w-[180px] py-2 z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        language === lang.code ? 'bg-gray-50 text-[#005670]' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="font-light">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Designer Access */}
            <button
              onClick={() => navigate('/designer-login')}
              className={`hidden md:flex items-center gap-2 text-xs tracking-[0.15em] uppercase font-semibold transition-all ${
                needsSolidBg 
                  ? 'text-gray-600 hover:text-[#005670]' 
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {t.designerAccess}
              <div className="w-px h-3 bg-current opacity-30"></div>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation - Compact & Elegant */}
      <div className="max-w-[1800px] mx-auto px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo Container - Compact but not cut off */}
          <div className="flex items-center">
            <button 
              onClick={() => setActiveTab('about')}
              className="group relative"
            >
              <div className="relative py-1">
                {/* Optimal logo size */}
                <img 
                  src="/images/HDG-Logo.png" 
                  alt="Henderson Design Group" 
                  className="h-12 w-auto object-contain transition-all duration-700 group-hover:scale-105"
                  style={{
                    filter: needsSolidBg ? 'invert(1)' : 'brightness(0) invert(1)',
                  }}
                />
                {/* Premium underline effect */}
                <div className={`absolute -bottom-2 left-0 right-0 h-px transition-all duration-500 ${
                  needsSolidBg ? 'bg-[#005670]' : 'bg-white'
                } scale-x-0 group-hover:scale-x-100`}></div>
              </div>
            </button>
          </div>
          
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center justify-center gap-6 w-full">
          {mainTabs.map((tab, index) => (
            <React.Fragment key={tab.id}>
              <button
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 text-lg font-semibold tracking-[0.1em] uppercase transition-all duration-500 group text-center ${
                  needsSolidBg
                    ? activeTab === tab.id
                      ? 'text-[#005670]'
                      : 'text-gray-600 hover:text-[#005670]'
                    : activeTab === tab.id
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="relative z-10">{tab.label}</span>
                
                {activeTab === tab.id && (
                  <div className={`absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500 ${
                    needsSolidBg ? 'bg-[#005670]' : 'bg-white'
                  }`}></div>
                )}
              </button>

              {index < mainTabs.length - 1 && (
                <div className={`w-px h-6 transition-colors ${needsSolidBg ? 'bg-gray-300' : 'bg-white/30'}`}></div>
              )}
            </React.Fragment>
          ))}
        </nav>


          {/* Mobile Menu Button */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className={`lg:hidden p-2 transition-colors ${
              needsSolidBg ? 'text-gray-600' : 'text-white'
            }`}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="lg:hidden pb-6 animate-fade-in">
            <div className="space-y-1">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setShowMobileMenu(false);
                  }}
                  className={`w-full px-6 py-3 text-left text-sm font-light tracking-wide transition-all ${
                    needsSolidBg
                      ? activeTab === tab.id
                        ? 'bg-[#005670] text-white'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      : activeTab === tab.id
                        ? 'bg-white/20 text-white backdrop-blur-md'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
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

// Footer Component
const Footer = ({ setActiveTab, language }) => {
  const t = translations[language];
  
  const footerTabs = [
    { id: 'faq', label: t.faq },
    { id: 'payment', label: t.payment },
    { id: 'warranty', label: t.warranty },
    { id: 'environment', label: t.environment },
    { id: 'questionnaire', label: t.questionnaire },
    { id: 'contact', label: t.contact }
  ];

  return (
    <footer className="bg-[#005670] text-white py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 pb-10 border-b border-white/20">
          <h3 className="text-lg font-medium mb-10 tracking-wide text-center uppercase text-white/90">
            Additional Resources
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {footerTabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { 
                  setActiveTab(tab.id); 
                  window.scrollTo({ top: 0, behavior: 'smooth' }); 
                }} 
                className="group relative text-base px-5 py-3 text-white font-light tracking-wide 
                           transition-all duration-300 hover:scale-110 hover:text-white
                           bg-white/10 hover:bg-white/15 rounded-full backdrop-blur-sm
                           shadow-[0_0_8px_rgba(255,255,255,0.15)] hover:shadow-[0_0_18px_rgba(255,255,255,0.35)]"
              >
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 mb-10">
          <div>
            <img src="/images/HDG-Logo.png" alt="Henderson Design Group" className="h-14 mb-6 opacity-90" />
            <p className="text-white/70 leading-relaxed text-sm">
              Henderson Design Group specializes in curated, turnkey furnishing solutions 
              for Hawaii's premier residential developments. Creating exceptional interiors 
              with sustainable practices and timeless elegance.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4 tracking-wide">Quick Links</h3>
            <div className="space-y-2 text-sm text-white/70">
              {[
                { id: 'about', label: t.about },
                { id: 'collection', label: t.collection },
                { id: 'process', label: t.process },
                { id: 'timeline', label: t.timeline }
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { 
                    setActiveTab(tab.id); 
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }} 
                  className="block hover:text-white transition-colors"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4 tracking-wide">Important Dates</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p>Deposit Deadline:<br /><span className="text-white font-medium">December 15, 2025</span></p>
              <p>Design Phase:<br /><span className="text-white">Feb - Apr 2026</span></p>
              <p>Installation:<br /><span className="text-white">Jan - Mar 2027</span></p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/60 text-sm mb-2">Ālia Project by Henderson Design Group</p>
          <p className="text-white/40 text-xs">&copy; {new Date().getFullYear()} Henderson Design Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Component
const BrochureLandingPage = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const renderPage = () => {
    const pageProps = { setActiveTab, language };
    
    switch(activeTab) {
      case 'about':
        return <AboutPage {...pageProps} />;
      case 'collection':
        return <CollectionPage language={language} />;
      case 'inspiration':
        return <InspirationPage language={language} />;
      case 'process':
        return <ProcessPage language={language} />;
      case 'timeline':
        return <TimelinePage language={language} />;
      case 'next-steps':
        return <NextStepsPage language={language} />;
      case 'faq':
        return <FAQPage language={language} />;
      case 'payment':
        return <PaymentPage language={language} />;
      case 'warranty':
        return <WarrantyPage language={language} />;
      case 'environment':
        return <EnvironmentPage language={language} />;
      case 'questionnaire':
        return <QuestionnairePage language={language} />;
      case 'contact':
        return <ContactPage language={language} />;
      default:
        return <AboutPage {...pageProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
      />
      
      <main>
        {renderPage()}
      </main>

      <Footer setActiveTab={setActiveTab} language={language} />

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes ken-burns {
          from {
            transform: scale(1);
          }
          to {
            transform: scale(1.1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default BrochureLandingPage;