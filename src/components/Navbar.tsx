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
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* User Account & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 py-1 px-2.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.isSuperAdmin ? '👑' : (currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U')}
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-[11px] font-bold text-slate-200 truncate max-w-[120px]">
                    {currentUser.name || currentUser.email}
                  </div>
                  <div className="text-[9px] text-cyan-400 font-mono">
                    {currentUser.isSuperAdmin ? 'Super Admin' : (currentUser.licenseNumber || 'Registered User')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                id="user-logout-btn"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg border border-transparent hover:border-rose-900/50 transition-colors cursor-pointer"
                title={isMl ? 'ലോഗ് ഔട്ട് ചെയ്യുക' : 'Sign Out'}
              >
                <LogOut className="w-4 h-4" />
              </button>
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

            <button
              id="nav-tab-chatbot"
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'chatbot'
                  ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,229,255,0.25)] font-semibold'
                  : 'text-cyan-400 hover:text-cyan-300 hover:bg-slate-900/80'
              }`}
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>{isMl ? '7. AI അസിസ്റ്റന്റ് (Gemini)' : '7. Gemini AI Advisor'}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                AI
              </span>
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
