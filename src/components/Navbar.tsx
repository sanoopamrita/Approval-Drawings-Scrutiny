import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  FileCheck2,
  UploadCloud,
  Calculator,
  FileText,
  BookOpen,
  RotateCcw,
  Sparkles,
  Globe,
  Bot,
  Search,
  ChevronRight,
  X,
  Layers,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Sliders,
  Crown,
  Mail,
  Check,
  Copy,
  Shield,
  ChevronDown,
} from 'lucide-react';
import { TabType, Language, JurisdictionType, ScrutinyReportSummary, User } from '../types';
import { VinyasaLogo } from './VinyasaLogo';
import { KERALA_COMPLETE_RULES_DATABASE, KERALA_AMENDMENTS_FULL_ARCHIVE } from '../utils/rulesDatabase';
import { isUserSuperAdmin } from '../services/authService';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  jurisdiction: JurisdictionType;
  setJurisdiction: (j: JurisdictionType) => void;
  summary: ScrutinyReportSummary | null;
  currentUser: User | null;
  onRunScrutiny: () => void;
  onReset: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  jurisdiction,
  setJurisdiction,
  summary,
  currentUser,
  onRunScrutiny,
  onReset,
  onLogout,
}) => {
  const isMl = language === 'ml';
  const isSuper = isUserSuperAdmin(currentUser);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close search suggestions & profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyEmail = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Filter search results across rules & amendments
  const searchResults = globalSearch.trim() === '' ? [] : [
    ...KERALA_COMPLETE_RULES_DATABASE.filter((r) => {
      const q = globalSearch.toLowerCase();
      return (
        r.ruleKmbr.toLowerCase().includes(q) ||
        r.ruleKpbr.toLowerCase().includes(q) ||
        r.titleEn.toLowerCase().includes(q) ||
        r.titleMl.toLowerCase().includes(q) ||
        r.summaryEn.toLowerCase().includes(q) ||
        r.summaryMl.toLowerCase().includes(q)
      );
    }).slice(0, 4).map((r) => ({
      id: r.id,
      title: isMl ? r.titleMl : r.titleEn,
      subtitle: `${r.ruleKmbr} / ${r.ruleKpbr} • ${r.chapter}`,
      targetTab: 'rulebook' as TabType,
    })),
    ...KERALA_AMENDMENTS_FULL_ARCHIVE.filter((a) => {
      const q = globalSearch.toLowerCase();
      return (
        a.orderNumber.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.titleMl.toLowerCase().includes(q)
      );
    }).slice(0, 2).map((a) => ({
      id: a.id,
      title: isMl ? a.titleMl : a.titleEn,
      subtitle: `${a.orderNumber} • ${a.notificationDate}`,
      targetTab: 'rulebook' as TabType,
    })),
  ];

  const handleSelectSearchResult = (targetTab: TabType) => {
    setActiveTab(targetTab);
    setIsSearchOpen(false);
    setGlobalSearch('');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#040813] border-b border-cyan-950/80 shadow-xl backdrop-blur-md">
      {/* Top Main Brand & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('authority')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <VinyasaLogo variant="full" size="md" theme="dark" showDomain={true} />
          </button>
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              id="global-search-input"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={
                isMl
                  ? 'ചട്ടങ്ങൾ, ഭേദഗതികൾ, സെറ്റ്ബാക്ക്, പാർക്കിംഗ് തിരയുക...'
                  : 'Search building rules, setbacks, parking, FAR...'
              }
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {globalSearch && (
              <button
                onClick={() => {
                  setGlobalSearch('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 w-full bg-[#0A1326] border border-cyan-800/80 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-slate-800 text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                {isMl ? 'കണ്ടെത്തിയ ചട്ടങ്ങളും ഉത്തരവുകളും' : 'Matched Rules & Statutory Clauses'}
              </div>
              <div className="divide-y divide-slate-800/60 max-h-64 overflow-y-auto">
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectSearchResult(item.targetTab)}
                    className="p-2.5 hover:bg-cyan-950/60 cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Tools: Jurisdiction Toggle, Language, Scrutiny Button, Reset */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Quick Jurisdiction Selector */}
          <div className="flex items-center bg-slate-900/90 p-0.5 rounded-lg border border-slate-800 shadow-sm text-xs font-semibold">
            <button
              id="jurisdiction-nav-kpbr"
              onClick={() => setJurisdiction('KPBR')}
              className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                jurisdiction === 'KPBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Panchayat Building Rules, 2019"
            >
              KPBR (പഞ്ചായത്ത്)
            </button>
            <button
              id="jurisdiction-nav-kmbr"
              onClick={() => setJurisdiction('KMBR')}
              className={`px-2.5 py-1.5 rounded-md transition-all cursor-pointer ${
                jurisdiction === 'KMBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Municipality Building Rules, 2019"
            >
              KMBR (മുനിസിപ്പാലിറ്റി)
            </button>
          </div>

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
            className="flex items-center gap-1 text-xs bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-900/80 text-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium cursor-pointer"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'ml' ? 'English' : 'മലയാളം'}</span>
          </button>

          {/* Run Scrutiny Action Button */}
          <button
            id="run-scrutiny-btn"
            onClick={onRunScrutiny}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.35)] transition-all transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>{isMl ? 'ചട്ട പരിശോധന' : 'Run Scrutiny'}</span>
          </button>

          {/* Reset Button */}
          <button
            id="reset-form-btn"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="Reset Form / തുടക്കം മുതൽ ആരംഭിക്കുക"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Account with Interactive Email Dropdown & Logout */}
          {currentUser && (
            <div ref={profileMenuRef} className="relative flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <button
                type="button"
                id="user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 py-1 px-2.5 rounded-xl border transition-all cursor-pointer group ${
                  isProfileMenuOpen
                    ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                    : 'bg-slate-900/90 hover:bg-slate-850 border-slate-800 hover:border-cyan-700/50'
                }`}
                title={isMl ? 'അക്കൗണ്ട് വിവരങ്ങളും ഇമെയിലും കാണുക' : 'View account details & email'}
              >
                {/* Avatar */}
                <div className="relative">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-cyan-500/40"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                      {currentUser.isSuperAdmin ? '👑' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-slate-950" />
                </div>

                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 transition-colors truncate max-w-[130px]">
                    {currentUser.name || currentUser.email}
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono flex items-center gap-1">
                    <span>{currentUser.isSuperAdmin ? '👑 Super Admin' : (currentUser.licenseNumber || 'Verified User')}</span>
                  </div>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-transform ${
                    isProfileMenuOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {/* Direct Quick Logout Button */}
              <button
                type="button"
                id="user-logout-btn"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
                title={isMl ? 'ലോഗ് ഔട്ട് ചെയ്യുക' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>

              {/* Interactive Profile Details Popover Menu */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-[#091122] border border-cyan-500/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,229,255,0.15)] overflow-hidden z-50 animate-scaleUp text-left">
                  {/* Top Header Card */}
                  <div className="p-4 bg-gradient-to-br from-slate-900 via-[#0C162D] to-slate-950 border-b border-slate-800/80 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {currentUser.avatar ? (
                            <img
                              src={currentUser.avatar}
                              alt={currentUser.name}
                              className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.3)]"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-cyan-950 border-2 border-cyan-400/60 text-cyan-300 flex items-center justify-center text-lg font-bold">
                              {currentUser.isSuperAdmin ? '👑' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                            </div>
                          )}
                          {/* Google G icon Badge */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-md border border-slate-200">
                            <svg className="w-3 h-3" viewBox="0 0 24 24">
                              <path
                                fill="#4285F4"
                                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                              />
                              <path
                                fill="#34A853"
                                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                              />
                              <path
                                fill="#FBBC05"
                                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                              />
                              <path
                                fill="#EA4335"
                                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                              />
                            </svg>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                            <span>{currentUser.name}</span>
                            {currentUser.isSuperAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shrink-0">
                                Super Admin
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                            <span>{isMl ? 'ഗൂഗിൾ വെരിഫൈഡ് അക്കൗണ്ട്' : 'Google Verified Account'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Prominent Email Address Card */}
                  <div className="p-4 space-y-3 bg-[#070D1B]">
                    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3 space-y-1.5 shadow-inner">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{isMl ? 'ഇമെയിൽ വിലാസം (Email ID)' : 'Registered Email Address'}</span>
                        </span>
                        <span className="text-emerald-400 font-mono text-[9px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          VERIFIED
                        </span>
                      </div>

                      {/* Display Real Email ID */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <span className="text-xs font-mono font-bold text-slate-100 truncate selection:bg-cyan-500">
                          {currentUser.email}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="p-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-colors shrink-0 flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                          title="Copy email to clipboard"
                        >
                          {copiedEmail ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">{isMl ? 'കോപ്പി ചെയ്തു' : 'Copied'}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>{isMl ? 'കോപ്പി' : 'Copy'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Metadata Specs */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-300">
                        <span className="text-slate-400">{isMl ? 'അക്കൗണ്ട് പദവി' : 'Role / Authorization'}:</span>
                        <span className="font-semibold text-slate-200">
                          {currentUser.isSuperAdmin
                            ? (isMl ? '👑 സൂപ്പർ അഡ്മിനിസ്ട്രേറ്റർ' : '👑 Super Administrator')
                            : (isMl ? 'സ്ഥിരീകരിച്ച ആർക്കിടെക്റ്റ് / എൻജിനീയർ' : 'Verified Professional User')}
                        </span>
                      </div>

                      {currentUser.licenseNumber && (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60 text-slate-300">
                          <span className="text-slate-400">{isMl ? 'ലൈസൻസ് നമ്പർ' : 'LSGD License'}:</span>
                          <span className="font-mono text-cyan-300 text-[11px]">{currentUser.licenseNumber}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Links */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      {isSuper && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('admin');
                            setIsProfileMenuOpen(false);
                          }}
                          className="w-full py-2 px-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isMl ? 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ' : 'Open Super Admin Panel'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onLogout();
                        }}
                        className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-rose-200 border border-rose-800/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>{isMl ? 'അക്കൗണ്ടിൽ നിന്ന് ലോഗ് ഔട്ട് ചെയ്യുക' : 'Sign Out of Account'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#040813] border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1.5 min-w-max text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-authority"
              onClick={() => setActiveTab('authority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'authority'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isMl ? '1. പ്രോജക്റ്റും ചട്ടങ്ങളും' : '1. Authority & Project'}</span>
            </button>

            <button
              id="nav-tab-drawings"
              onClick={() => setActiveTab('drawings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'drawings'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isMl ? '2. ഡ്രോയിംഗുകൾ' : '2. Plan Uploads'}</span>
            </button>

            <button
              id="nav-tab-areastatement"
              onClick={() => setActiveTab('areastatement')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'areastatement'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{isMl ? '3. ഏരിയ സ്റ്റേറ്റ്മെന്റ്' : '3. Area Statement'}</span>
            </button>

            <button
              id="nav-tab-scrutiny"
              onClick={() => setActiveTab('scrutiny')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'scrutiny'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{isMl ? '4. പരിശോധനാ ഫലം' : '4. Rule Scrutiny Results'}</span>
              {summary && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    summary.failedCount > 0
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {summary.failedCount > 0 ? `${summary.failedCount} ❌` : 'Pass ✅'}
                </span>
              )}
            </button>

            <button
              id="nav-tab-report"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isMl ? '5. റിപ്പോർട്ട്' : '5. Scrutiny Report'}</span>
            </button>

            <button
              id="nav-tab-rulebook"
              onClick={() => setActiveTab('rulebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'rulebook'
                  ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 shadow-[0_0_10px_rgba(0,229,255,0.15)] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isMl ? '6. ചട്ട പുസ്തകം' : '6. Rulebook & Amendments'}</span>
            </button>

            {/* Exclusive Super Admin Tab (sanoop.amrita@gmail.com) */}
            {isSuper && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/30'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span>{isMl ? '👑 സൂപ്പർ അഡ്മിൻ' : '👑 Super Admin'}</span>
                <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase">
                  Central
                </span>
              </button>
            )}
          </nav>

          {/* Quick Result Status Badge */}
          {summary && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800">
              <span className="text-xs text-slate-400">
                {isMl ? 'പരിശോധനാ ഫലം:' : 'Status:'}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  summary.overallStatus === 'APPROVED'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : summary.overallStatus === 'CONDITIONAL_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}
              >
                {summary.overallStatus === 'APPROVED'
                  ? (isMl ? 'അംഗീകൃത യോഗ്യം ✅' : 'Compliant (Approved)')
                  : summary.overallStatus === 'CONDITIONAL_APPROVAL'
                  ? (isMl ? 'വ്യവസ്ഥകൾക്ക് വിധേയം ⚠️' : 'Conditional Approval')
                  : (isMl ? 'പിഴവുകൾ കണ്ടെത്തി ❌' : 'Defective (Violations)')}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
