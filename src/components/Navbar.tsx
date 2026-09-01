import React, { useState, useRef, useEffect } from 'react';
import {
  Building2,
  FileCheck2,
  UploadCloud,
  Calculator,
  FileText,
  RotateCcw,
  Sparkles,
  Globe,
  X,
  ShieldCheck,
  LogOut,
  Crown,
  Check,
  Copy,
  ChevronDown,
  Coins,
  Split,
  FileQuestion,
} from 'lucide-react';
import { TabType, Language, JurisdictionType, ScrutinyReportSummary, User } from '../types';
import { VinyasaLogo } from './VinyasaLogo';
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
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  jurisdiction,
  setJurisdiction,
  currentUser,
  onRunScrutiny,
  onReset,
  onLogout,
}) => {
  const isMl = language === 'ml';
  const isSuper = isUserSuperAdmin(currentUser);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
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

  // Compute user initial letter
  const userInitial = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 bg-[#07090E]/95 border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {/* Top Main Brand & Control Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        {/* Brand Logo & Vinyasa pill badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('authority')}
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          >
            <VinyasaLogo variant="full" size="md" theme="dark" showDomain={true} />
          </button>
          
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>KBR AI Engine</span>
          </div>
        </div>

        {/* Right Action Tools: Jurisdiction, Language, Scrutiny Button, User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Jurisdiction Selector */}
          <div className="flex items-center bg-[#0D1424] p-0.5 rounded-lg border border-slate-800 shadow-sm text-xs font-semibold">
            <button
              id="jurisdiction-nav-kpbr"
              onClick={() => setJurisdiction('KPBR')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                jurisdiction === 'KPBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Panchayat Building Rules, 2019"
            >
              KPBR
            </button>
            <button
              id="jurisdiction-nav-kmbr"
              onClick={() => setJurisdiction('KMBR')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                jurisdiction === 'KMBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Municipality Building Rules, 2019"
            >
              KMBR
            </button>
          </div>

          {/* Bilingual Switcher Toggle (English / മലയാളം) */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
            className="flex items-center gap-1 text-[11px] sm:text-xs bg-[#0D1424] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all font-semibold cursor-pointer shadow-sm hover:text-cyan-300"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{language === 'ml' ? 'Eng' : 'മല'}</span>
          </button>

          {/* Run Scrutiny Action Button */}
          <button
            id="run-scrutiny-btn"
            onClick={onRunScrutiny}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{isMl ? 'ചട്ട പരിശോധന' : 'Run Scrutiny'}</span>
            <span className="sm:hidden">{isMl ? 'സ്ക്രൂട്ടിനി' : 'Scrutiny'}</span>
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

          {/* User Account Profile Menu */}
          {currentUser && (
            <div ref={profileMenuRef} className="relative flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-800">
              <button
                type="button"
                id="user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-xl border transition-all cursor-pointer ${
                  isProfileMenuOpen
                    ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0D1424] hover:bg-slate-850 border-slate-800 hover:border-cyan-700/50'
                }`}
                title={isMl ? 'അക്കൗണ്ട് വിവരങ്ങൾ' : 'Account Details'}
              >
                <div className="relative shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 border border-cyan-300/60 text-white font-black text-xs flex items-center justify-center shadow-md">
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
                </div>

                <div className="hidden xl:block text-left">
                  <div className="text-[11px] font-bold text-slate-200 truncate max-w-[110px]">
                    {currentUser.email || currentUser.name}
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-[340px] bg-[#070E1E] border border-cyan-500/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-scaleUp text-left">
                  <div className="p-3.5 bg-gradient-to-br from-slate-900 via-[#0B152A] to-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center text-base font-black shrink-0 shadow-md">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentUser.email}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isMl ? 'സ്ഥിരീകരിച്ച അക്കൗണ്ട്' : 'Verified Account'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 space-y-2 bg-[#070D1B]">
                    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 space-y-1">
                      <div className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">
                        {isMl ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-bold text-slate-200 truncate">{currentUser.email}</span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {isSuper && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isMl ? 'സൂപ്പർ അഡ്മിൻ പാനൽ' : 'Super Admin Panel'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isMl ? 'ലോഗ് ഔട്ട് ചെയ്യുക' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#080C16]/95 border-t border-white/5 px-3 sm:px-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-1.5 py-2 min-w-max text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-authority"
              onClick={() => setActiveTab('authority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'authority'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '1. പ്രോജക്റ്റ്' : '1. Project'}</span>
            </button>

            <button
              id="nav-tab-drawings"
              onClick={() => setActiveTab('drawings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'drawings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '2. ഡ്രോയിംഗ്' : '2. Drawings'}</span>
            </button>

            <button
              id="nav-tab-redline"
              onClick={() => setActiveTab('redline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'redline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-sky-400" />
              <span>{isMl ? '3. CAD & K-Smart റിപ്പയർ' : '3. CAD & K-Smart Repair'}</span>
            </button>

            <button
              id="nav-tab-areastatement"
              onClick={() => setActiveTab('areastatement')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'areastatement'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isMl ? '4. ഏരിയ സ്റ്റേറ്റ്‌മെന്റ്' : '4. Area Statement'}</span>
            </button>

            <button
              id="nav-tab-scrutiny"
              onClick={() => setActiveTab('scrutiny')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'scrutiny'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '5. ചട്ട സ്ക്രൂട്ടിനി' : '5. Code Scrutiny'}</span>
            </button>

            <button
              id="nav-tab-rfi"
              onClick={() => setActiveTab('rfi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'rfi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMl ? '6. നോട്ടീസ് & മറുപടികൾ' : '6. Notice & Replies'}</span>
            </button>

            <button
              id="nav-tab-boq"
              onClick={() => setActiveTab('boq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'boq'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMl ? '7. സ്മാർട്ട് BOQ' : '7. Smart BOQ'}</span>
            </button>

            <button
              id="nav-tab-report"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '8. റിപ്പോർട്ട്' : '8. Permit Report'}</span>
            </button>

            {/* Super Admin Exclusive Tab */}
            {isSuper && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/30'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isMl ? '👑 സൂപ്പർ അഡ്മിൻ' : '👑 Super Admin'}</span>
                <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase">
                  Live
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
