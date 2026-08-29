import React from 'react';
import {
  Building2,
  ShieldCheck,
  Globe,
  FileCheck2,
  Sparkles,
  BookOpen,
  FileText,
  UploadCloud,
  Calculator,
  RotateCcw,
} from 'lucide-react';
import { JurisdictionType, Language, ScrutinyReportSummary } from '../types';
import { SAMPLE_PROJECT_PRESETS } from '../utils/presets';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  jurisdiction: JurisdictionType;
  setJurisdiction: (j: JurisdictionType) => void;
  summary: ScrutinyReportSummary | null;
  onRunScrutiny: () => void;
  onLoadPreset: (presetId: string) => void;
  onReset: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  jurisdiction,
  setJurisdiction,
  summary,
  onRunScrutiny,
  onLoadPreset,
  onReset,
}) => {
  const isMl = language === 'ml';

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md">
      {/* Top Branding Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-inner border border-emerald-400/30">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                K-BuildScrutiny
                <span className="text-xs px-1.5 py-0.5 rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {jurisdiction === 'KMBR' ? 'KMBR 2019' : 'KPBR 2019'}
                </span>
              </span>
              <span className="hidden md:inline text-xs text-slate-400 font-medium border-l border-slate-700 pl-2">
                {isMl ? 'തദ്ദേശ സ്വയംഭരണ വകുപ്പ് (LSGD)' : 'LSGD Kerala Building Rules Engine'}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-light truncate max-w-xs sm:max-w-md">
              {isMl
                ? 'കേരള മുനിസിപ്പാലിറ്റി / പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ പ്ലാൻ പരിശോധന'
                : 'Plan Scrutiny, Setback & Coverage Compliance Verification'}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Jurisdiction Toggle */}
          <div className="bg-slate-800 p-0.5 rounded-lg border border-slate-700 flex text-xs font-semibold">
            <button
              id="toggle-kmbr-btn"
              onClick={() => setJurisdiction('KMBR')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                jurisdiction === 'KMBR'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Municipality Building Rules (Corporation & Municipality)"
            >
              KMBR (നഗരസഭ)
            </button>
            <button
              id="toggle-kpbr-btn"
              onClick={() => setJurisdiction('KPBR')}
              className={`px-2.5 py-1.5 rounded-md transition-all ${
                jurisdiction === 'KPBR'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Panchayat Building Rules (Grama Panchayat)"
            >
              KPBR (പഞ്ചായത്ത്)
            </button>
          </div>

          {/* Sample Preset Dropdown */}
          <div className="relative">
            <select
              id="preset-selector"
              onChange={(e) => {
                if (e.target.value) onLoadPreset(e.target.value);
              }}
              defaultValue=""
              className="text-xs bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="" disabled>
                {isMl ? '⚡ മാതൃകാ പ്രോജക്റ്റുകൾ' : '⚡ Load Sample Project'}
              </option>
              {SAMPLE_PROJECT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {isMl ? p.nameMl : p.nameEn}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
            className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{language === 'ml' ? 'English' : 'മലയാളം'}</span>
          </button>

          {/* Run Scrutiny Button */}
          <button
            id="run-scrutiny-btn"
            onClick={onRunScrutiny}
            className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 px-3.5 py-1.5 rounded-lg shadow-sm transition-all transform active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isMl ? 'പരിശോധിക്കുക' : 'Run Scrutiny'}</span>
          </button>

          {/* Reset Button */}
          <button
            id="reset-form-btn"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-700 transition-colors"
            title="Reset Form / തുടക്കം മുതൽ ആരംഭിക്കുക"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-950/80 backdrop-blur border-t border-slate-800/80 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 py-1.5 min-w-max text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-authority"
              onClick={() => setActiveTab('authority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'authority'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isMl ? '1. പ്രോജക്റ്റും ചട്ടങ്ങളും' : '1. Authority & Project'}</span>
            </button>

            <button
              id="nav-tab-drawings"
              onClick={() => setActiveTab('drawings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'drawings'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isMl ? '2. ഡ്രോയിംഗുകൾ' : '2. Plan Uploads'}</span>
            </button>

            <button
              id="nav-tab-areastatement"
              onClick={() => setActiveTab('areastatement')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'areastatement'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>{isMl ? '3. ഏരിയ സ്റ്റേറ്റ്മെന്റ്' : '3. Area Statement'}</span>
            </button>

            <button
              id="nav-tab-scrutiny"
              onClick={() => setActiveTab('scrutiny')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'scrutiny'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'report'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{isMl ? '5. റിപ്പോർട്ടും PDF-ഉം' : '5. Official Report & PDF'}</span>
            </button>

            <button
              id="nav-tab-rulebook"
              onClick={() => setActiveTab('rulebook')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'rulebook'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{isMl ? '6. ചട്ട പുസ്തകം' : '6. Rulebook & Amendments'}</span>
            </button>
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
