import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, Menu, X, LogIn } from 'lucide-react';
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
    portalLogin: 'Portal Login',
    selectLanguage: 'Select Language',
    home: 'Home',
    menu: 'Menu',
    close: 'Close',
    more: 'More'
  },
  ja: {
    about: '紹介',
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
    portalLogin: 'ポータルログイン',
    selectLanguage: '言語を選択',
    home: 'ホーム',
    menu: 'メニュー',
    close: '閉じる',
    more: 'もっと'
  }
};

// ===== HEADER =====
const Navigation = ({ activeTab, setActiveTab, language, setLanguage }) => {
  const navigate = useNavigate();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const t = translations[language] || translations.en;

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
    <header className="fixed top-0 left-0 w-full z-50 bg-[#005670] shadow-[0_2px_20px_rgba(0,0,0,0.3)] border-b border-white/10">
      {/* Top bar */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
        {/* Logo/Title - clickable to go to About */}
        <button 
          onClick={() => setActiveTab('about')}
          className="flex-1 text-left"
        >
          <div className="text-xs md:text-sm tracking-[0.2em] uppercase font-light text-white/70">
            <span className="font-semibold text-sm md:text-base text-white">Ālia</span> Furnishings Collections
          </div>
        </button>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Language selector - compact on mobile */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="group flex items-center gap-1 md:gap-2 text-sm font-semibold tracking-wide transition-all duration-300 px-2 md:px-3 py-2 rounded-lg border-2 text-white border-white/25 hover:border-white/50 hover:bg-white/10 active:scale-95"
            >
              <Globe className="w-4 h-4" />
              <span className="text-base md:text-lg">{languages.find(l => l.code === language)?.flag}</span>
            </button>

            {showLangMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-2xl rounded-xl min-w-[180px] md:min-w-[200px] py-1 z-50 overflow-hidden">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangMenu(false);
                      }}
                      className={`relative w-full px-4 md:px-5 py-2.5 md:py-3 text-left text-sm md:text-base hover:bg-gray-50 transition-all flex items-center gap-2 md:gap-3 ${
                        language === lang.code ? 'bg-[#005670]/10 text-[#005670] font-bold' : 'text-gray-700'
                      }`}
                    >
                      <span className="text-lg md:text-xl">{lang.flag}</span>
                      <span className="font-semibold text-sm md:text-base">{lang.name}</span>
                      {language === lang.code && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-[#005670]"></div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Portal Login Button */}
          <button
            onClick={() => navigate('/portal-login')}
            className="hidden sm:flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 px-3 md:px-4 py-2 rounded-lg border-2 text-white border-white/25 hover:border-white/50 hover:bg-white/10 active:scale-95"
          >
            <LogIn className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">{t.portalLogin}</span>
            <span className="md:hidden">Login</span>
          </button>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 border-t border-white/10">
        <div className="flex items-center justify-between py-3 md:py-5">
          {/* Logo HDG - hanya tampil di desktop */}
          <div className="hidden lg:flex flex-1 items-center">
            <button 
              onClick={() => setActiveTab('about')} 
              className="group relative transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <img
                src="/images/HDG-Logo.png"
                alt="Henderson Design Group"
                className="h-10 md:h-12 w-auto object-contain brightness-0 invert"
              />
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden flex items-center gap-2 text-white px-3 py-2 rounded-lg border-2 border-white/25 hover:bg-white/10 transition-all active:scale-95"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="text-sm font-semibold">{showMobileMenu ? t.close : t.menu}</span>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex flex-1 justify-center items-stretch bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border-2 border-white/25 shadow-xl mx-auto">
            {mainTabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 xl:px-10 py-4 min-w-[100px] xl:min-w-[140px] text-sm xl:text-base font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-300 ${
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

          {/* Spacer untuk balance layout di desktop */}
          <div className="hidden lg:flex flex-1"></div>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-30" 
              onClick={() => setShowMobileMenu(false)}
            />
            <div className="lg:hidden pb-4 relative z-40 animate-slide-down">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-2 border-2 border-white/25 space-y-1">
                {mainTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setShowMobileMenu(false);
                    }}
                    className={`w-full px-5 py-3.5 text-left text-base font-bold tracking-wide transition-all duration-300 rounded-xl ${
                      activeTab === tab.id
                        ? 'bg-white text-[#005670] shadow-lg scale-[1.02]'
                        : 'text-white hover:text-white hover:bg-white/15 active:scale-95'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
                
                {/* Mobile Portal Login */}
                <button
                  onClick={() => navigate('/portal-login')}
                  className="sm:hidden w-full px-5 py-3.5 text-left text-base font-bold tracking-wide transition-all duration-300 rounded-xl text-white hover:bg-white/15 active:scale-95 flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.portalLogin}</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

// ===== FOOTER =====
const Footer = ({ setActiveTab, language, activeTab }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const t = translations[language] || translations.en;

  const footerTabs = [
    { id: 'inspiration', label: t.inspiration },
    { id: 'faq', label: t.faq },
    { id: 'payment', label: t.payment },
    { id: 'warranty', label: t.warranty },
    { id: 'environment', label: t.environment },
    { id: 'questionnaire', label: t.questionnaire }
  ];

  const mobileVisibleTabs = footerTabs.slice(0, 3);
  const mobileHiddenTabs = footerTabs.slice(3);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setShowMoreMenu(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#005670] shadow-[0_-2px_20px_rgba(0,0,0,0.3)] border-t border-white/10 z-40">
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 py-2 md:py-3">
        {/* Desktop navigation */}
        <nav className="hidden md:flex items-stretch justify-center bg-white/10 backdrop-blur-md rounded-2xl p-2.5 border-2 border-white/25 shadow-xl max-w-6xl mx-auto">
          {footerTabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`relative px-6 xl:px-10 py-3 min-w-[100px] xl:min-w-[140px] text-sm xl:text-base font-bold tracking-wide uppercase whitespace-nowrap transition-all duration-300 ${
                index === 0 ? 'rounded-l-xl' : ''
              } ${
                index === footerTabs.length - 1 ? 'rounded-r-xl' : ''
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

        {/* Mobile navigation */}
        <nav className="md:hidden relative">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-1.5 border-2 border-white/25 shadow-xl">
            <div className="grid grid-cols-4 gap-1">
              {mobileVisibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2 py-2.5 text-xs font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                    activeTab === tab.id
                      ? 'bg-white text-[#005670] shadow-lg'
                      : 'text-white hover:bg-white/15 active:scale-95'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`px-2 py-2.5 text-xs font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                  mobileHiddenTabs.some(tab => tab.id === activeTab)
                    ? 'bg-white text-[#005670] shadow-lg'
                    : 'text-white hover:bg-white/15 active:scale-95'
                }`}
              >
                {t.more}
              </button>
            </div>
          </div>

          {showMoreMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowMoreMenu(false)}
              />
              <div className="absolute bottom-full left-0 right-0 mb-2 z-40">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-1.5 border-2 border-white/25 shadow-xl space-y-1">
                  {mobileHiddenTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.id)}
                      className={`w-full px-4 py-3 text-sm font-bold tracking-wide uppercase transition-all duration-300 rounded-lg ${
                        activeTab === tab.id
                          ? 'bg-white text-[#005670] shadow-lg'
                          : 'text-white hover:bg-white/15 active:scale-95'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </nav>
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
    switch (activeTab) {
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
      <main className="pt-28 md:pt-32 pb-24 md:pb-28">{renderPage()}</main>
      <Footer setActiveTab={setActiveTab} language={language} activeTab={activeTab} />
    </div>
  );
};

export default BrochureLandingPage;