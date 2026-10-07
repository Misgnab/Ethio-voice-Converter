import React, { useState } from 'react';
import { Menu, X, Sparkles, User, Award, Globe, Eye, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGES } from '../data';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  selectedLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  isPremium: boolean;
  conversionsLeft: number;
  userEmail: string | null;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  onOpenUpgradeModal: () => void;
  onOpenAuthModal: () => void;
  onOpenHelpModal: () => void;
  onOpenSettingsModal: () => void;
}

export default function Navbar({
  currentTab,
  onSelectTab,
  selectedLanguage,
  onSelectLanguage,
  isPremium,
  conversionsLeft,
  userEmail,
  accessibilityMode,
  onToggleAccessibility,
  onOpenUpgradeModal,
  onOpenAuthModal,
  onOpenHelpModal,
  onOpenSettingsModal
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  // Exact core links per UX brief: Home, Text to Speech, My Audio, Pricing
  const mainNavLinks = [
    { id: 'home', label: 'Home' },
    { id: 'tts', label: 'Text to Speech' },
    { id: 'library', label: 'My Audio' },
    { id: 'pricing', label: 'Pricing' }
  ];

  // Secondary items under More: OCR Scanner, Audiobook Reader, About EthioVoice, Developer API, Help, Settings
  const moreNavLinks = [
    { id: 'ocr', label: 'OCR Scanner', type: 'tab' },
    { id: 'docs', label: 'Audiobook Reader', type: 'tab' },
    { id: 'about', label: 'About EthioVoice', type: 'tab' },
    { id: 'docs-api', label: 'Developer API', type: 'tab' },
    { id: 'help', label: 'Help & Guide', type: 'action' },
    { id: 'settings', label: 'Settings', type: 'action' }
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
  };

  const handleMoreAction = (item: { id: string; label: string; type: string }) => {
    setMoreDropdownOpen(false);
    setMobileMenuOpen(false);
    if (item.id === 'help') {
      onOpenHelpModal();
    } else if (item.id === 'settings') {
      onOpenSettingsModal();
    } else {
      onSelectTab(item.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Subtle Ethiopian Tricolor Strip */}
      <div className="h-1 w-full flex">
        <div className="h-full flex-1 bg-[#006241]" />
        <div className="h-full flex-1 bg-[#F9D616]" />
        <div className="h-full flex-1 bg-[#E21C21]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Wordmark: Logo EthioVoice + Tagline 'Ethiopian voices, powered by AI.' */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 text-left group focus:outline-none shrink-0"
          aria-label="EthioVoice Home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#006241] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-200">
            <span className="font-serif font-black text-lg">ኢ</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#006241] transition-colors leading-none">
              EthioVoice
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-normal mt-0.5">
              Ethiopian voices, powered by AI.
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600" aria-label="Main Navigation">
          {mainNavLinks.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`whitespace-nowrap transition-colors py-1 ${
                currentTab === item.id
                  ? 'text-[#006241] font-bold border-b-2 border-[#006241]'
                  : 'hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* More dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className="flex items-center gap-1 text-slate-600 hover:text-slate-900 py-1 transition cursor-pointer"
              aria-expanded={moreDropdownOpen}
              aria-haspopup="true"
            >
              <span>More</span>
              <ChevronDown size={14} className={`transform transition-transform ${moreDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {moreDropdownOpen && (
              <div
                className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                role="menu"
              >
                {moreNavLinks.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleMoreAction(item)}
                    className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#006241] transition flex items-center justify-between"
                    role="menuitem"
                  >
                    <span>{item.label}</span>
                    {item.type === 'action' && (
                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        Option
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions Zone */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Global Header Language Switcher (Desktop) */}
          <div className="hidden xl:flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => onSelectLanguage(l.code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                  selectedLanguage === l.code
                    ? 'bg-white text-[#006241] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={l.name}
              >
                <span>{l.flag}</span>
                <span className="ml-1">{l.nativeName.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Accessibility Mode Toggle */}
          <button
            type="button"
            onClick={onToggleAccessibility}
            title={accessibilityMode ? 'Disable high-contrast large mode' : 'Enable accessible large contrast mode'}
            className={`p-2 rounded-xl border text-xs transition ${
              accessibilityMode
                ? 'bg-[#006241] text-white border-emerald-700'
                : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
            }`}
            aria-label="Toggle accessibility display mode"
          >
            <Eye size={16} />
          </button>

          {/* Account Login / User Profile */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="p-2 sm:px-2.5 sm:py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition flex items-center gap-1.5"
            title={userEmail ? `Signed in as ${userEmail}` : 'Sign in / Account'}
            aria-label="User Account"
          >
            <User size={15} className="text-[#006241]" />
            <span className="hidden md:inline max-w-[100px] truncate text-[11px]">
              {userEmail ? userEmail.split('@')[0] : 'Account'}
            </span>
          </button>

          {/* User Status / Upgrade Button */}
          {isPremium ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-[#006241]">
              <Award size={14} className="text-amber-500 fill-amber-500" />
              <span>Pro</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenUpgradeModal}
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-[#F9D616] text-[#006241] hover:bg-yellow-400 font-bold rounded-xl text-xs shadow-2xs border border-yellow-300 transition whitespace-nowrap"
            >
              <Sparkles size={13} />
              <span>Go Pro</span>
            </button>
          )}

          {/* Primary Action Button: Start Speaking / Studio */}
          <button
            type="button"
            onClick={() => handleNavClick('tts')}
            className="px-3.5 sm:px-4 py-2 text-xs font-bold text-white bg-[#006241] hover:bg-[#004d33] rounded-xl shadow-xs transition whitespace-nowrap"
          >
            Start Speaking
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl flex items-center gap-1 text-xs font-bold"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            <span className="text-[11px] uppercase tracking-wider">Menu</span>
          </button>
        </div>
      </div>

      {/* Responsive Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-4 shadow-xl">
          {/* Main Navigation Links */}
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {mainNavLinks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`p-3 rounded-xl text-left text-xs font-bold transition min-h-[44px] flex items-center ${
                  currentTab === item.id
                    ? 'bg-emerald-50 text-[#006241] border border-emerald-200'
                    : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* More options in mobile drawer */}
          <div className="space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">More Tools & Guides</span>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              {moreNavLinks.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMoreAction(item)}
                  className="p-2.5 rounded-xl text-left text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-[#006241] transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language selection on mobile */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500 font-semibold block">Select Language:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => onSelectLanguage(l.code)}
                  className={`p-2 rounded-xl text-xs font-bold text-center transition min-h-[44px] flex items-center justify-center gap-1.5 ${
                    selectedLanguage === l.code
                      ? 'bg-[#006241] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Account status in mobile drawer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <User size={16} className="text-[#006241]" />
              <span className="text-slate-600 font-medium">
                {userEmail ? (
                  <span>Signed in as <strong className="text-slate-900">{userEmail}</strong></span>
                ) : (
                  <span>Guest User</span>
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onOpenAuthModal();
                setMobileMenuOpen(false);
              }}
              className="text-xs font-bold text-[#006241] hover:underline py-1.5 px-2"
            >
              {userEmail ? 'Switch / Logout' : 'Sign In'}
            </button>
          </div>

          {!isPremium && (
            <button
              type="button"
              onClick={() => {
                onOpenUpgradeModal();
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#F9D616] text-[#006241] font-bold rounded-xl text-xs text-center border border-yellow-300 shadow-xs min-h-[44px]"
            >
              Upgrade to Pro (99 ETB / Telebirr & Chapa)
            </button>
          )}
        </div>
      )}
    </header>
  );
}
