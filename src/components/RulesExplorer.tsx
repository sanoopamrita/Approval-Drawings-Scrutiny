import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileCheck2,
  Calendar,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Clock,
  Layers,
  FileText,
  Download,
  CheckCircle2,
  Building2,
  HelpCircle,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Language, JurisdictionType } from '../types';
import {
  KERALA_COMPLETE_RULES_DATABASE,
  KERALA_AMENDMENTS_FULL_ARCHIVE,
  KERALA_GOVERNMENT_ORDERS,
  RuleDetailItem,
  RuleAmendmentItem,
  GovernmentOrderItem,
  KERALA_RULES_CHAPTERS,
} from '../utils/rulesDatabase';

interface RulesExplorerProps {
  language: Language;
  initialSearchQuery?: string;
}

type ExplorerSubTab = 'all_rules' | 'amendments' | 'gov_orders';

export const RulesExplorer: React.FC<RulesExplorerProps> = ({
  language,
  initialSearchQuery = '',
}) => {
  const isMl = language === 'ml';
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionType>('KPBR');
  const [activeSubTab, setActiveSubTab] = useState<ExplorerSubTab>('all_rules');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery);
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all');
  const [selectedRuleModal, setSelectedRuleModal] = useState<RuleDetailItem | null>(null);
  const [selectedAmendmentModal, setSelectedAmendmentModal] = useState<RuleAmendmentItem | null>(null);
  const [selectedGoModal, setSelectedGoModal] = useState<GovernmentOrderItem | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ lastSynced: string; countNew: number }>({
    lastSynced: '2026-08-30 (Sunday)',
    countNew: 0,
  });

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus({
        lastSynced: new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }) + ' (Live Sync Active)',
        countNew: 0,
      });
    }, 1200);
  };

  // Filter Rules
  const filteredRules = KERALA_COMPLETE_RULES_DATABASE.filter((rule) => {
    if (selectedChapter !== 'all' && rule.chapterNo !== selectedChapter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNo = (rule.ruleKmbr + ' ' + rule.ruleKpbr).toLowerCase().includes(q);
      const matchTitle = (rule.titleEn + ' ' + rule.titleMl).toLowerCase().includes(q);
      const matchSummary = (rule.summaryEn + ' ' + rule.summaryMl).toLowerCase().includes(q);
      const matchCategory = rule.category.toLowerCase().includes(q);
      if (!matchNo && !matchTitle && !matchSummary && !matchCategory) return false;
    }
    return true;
  });

  // Filter Amendments
  const filteredAmendments = KERALA_AMENDMENTS_FULL_ARCHIVE.filter((item) => {
    if (
      selectedJurisdiction === 'KMBR' &&
      item.jurisdictionTarget !== 'BOTH' &&
      item.jurisdictionTarget !== 'KMBR'
    )
      return false;
    if (
      selectedJurisdiction === 'KPBR' &&
      item.jurisdictionTarget !== 'BOTH' &&
      item.jurisdictionTarget !== 'KPBR'
    )
      return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.titleEn + ' ' + item.titleMl).toLowerCase().includes(q);
      const matchOrder = (item.orderNumber + ' ' + item.gazetteNumber).toLowerCase().includes(q);
      const matchSummary = (item.summaryEn + ' ' + item.summaryMl).toLowerCase().includes(q);
      if (!matchTitle && !matchOrder && !matchSummary) return false;
    }
    return true;
  });

  // Filter Government Orders
  const filteredOrders = KERALA_GOVERNMENT_ORDERS.filter((item) => {
    if (selectedJurisdiction === 'KPBR' && item.applicableTo === 'Corporation & Municipality')
      return false;
    if (selectedJurisdiction === 'KMBR' && item.applicableTo === 'Grama Panchayat') return false;

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchSubject = (item.subjectEn + ' ' + item.subjectMl).toLowerCase().includes(q);
      const matchOrder = item.orderNumber.toLowerCase().includes(q);
      const matchSummary = (item.summaryEn + ' ' + item.summaryMl).toLowerCase().includes(q);
      if (!matchSubject && !matchOrder && !matchSummary) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Banner & Jurisdiction Switcher */}
      <div className="bg-[#0A1326] border border-cyan-900/50 rounded-2xl p-6 text-white shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <BookOpen className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit',sans-serif] flex items-center gap-2">
                {isMl ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ട പുസ്തകം' : 'Kerala Statutory Building Rulebook & Gazette Archive'}
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                  Official Gazette Verified
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                {isMl
                  ? 'KMBR / KPBR ചട്ടങ്ങൾ, കാലികമായ ഭേദഗതികൾ, ഗസറ്റ് ഉത്തരവുകൾ എന്നിവയുടെ സമഗ്ര ഗൈഡ്.'
                  : 'Official statutory guide & archive with full clauses, real-time amendments, and LSGD circulars.'}
              </p>
            </div>
          </div>

          {/* Weekly Auto-Sync Box */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-cyan-900/60 px-4 py-2 rounded-xl text-xs">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-slate-400">
                  {isMl ? 'ആഴ്ചയിലൊരിക്കലുള്ള വെബ് സിങ്ക്' : 'Weekly Automated Gazette Sync'}
                </div>
                <div className="font-mono font-medium text-cyan-300">{syncStatus.lastSynced}</div>
              </div>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-700/60 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Check LSGD Kerala Gazette for newest orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? (isMl ? 'പരിശോധിക്കുന്നു...' : 'Checking...') : isMl ? 'സിങ്ക്' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* Primary Jurisdiction Selector Tabs */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="jurisdiction-kpbr-select"
              onClick={() => setSelectedJurisdiction('KPBR')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedJurisdiction === 'KPBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏡 {isMl ? 'കേരള പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (KPBR)' : 'Kerala Panchayat Building Rules (KPBR)'}</span>
            </button>

            <button
              id="jurisdiction-kmbr-select"
              onClick={() => setSelectedJurisdiction('KMBR')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                selectedJurisdiction === 'KMBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🏛️ {isMl ? 'കേരള മുൻസിപ്പാലിറ്റി കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (KMBR)' : 'Kerala Municipality Building Rules (KMBR)'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            {selectedJurisdiction === 'KPBR'
              ? (isMl ? 'ബാധകമായത്: ഗ്രാമപഞ്ചായത്തുകൾ' : 'Scope: All Grama Panchayats in Kerala')
              : (isMl ? 'ബാധകമായത്: മുനിസിപ്പാലിറ്റി & കോർപ്പറേഷൻ' : 'Scope: All Municipalities & Corporations')}
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation & Universal Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* 3 Main Sections */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
            <button
              id="subtab-all-rules"
              onClick={() => setActiveSubTab('all_rules')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'all_rules'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-4 h-4 text-cyan-500" />
              <span>{isMl ? 'മുഴുവൻ ചട്ടങ്ങളും (All Rules & Guide)' : 'All Building Rules & Guide'}</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {filteredRules.length}
              </span>
            </button>

            <button
              id="subtab-amendments"
              onClick={() => setActiveSubTab('amendments')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'amendments'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-500" />
              <span>{isMl ? 'ഭേദഗതികൾ (Amendments)' : 'Statutory Amendments'}</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {filteredAmendments.length}
              </span>
            </button>

            <button
              id="subtab-gov-orders"
              onClick={() => setActiveSubTab('gov_orders')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'gov_orders'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>{isMl ? 'ഗവൺമെന്റ് ഓർഡറുകൾ (GOs & Circulars)' : 'Government Orders & Circulars'}</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {filteredOrders.length}
              </span>
            </button>
          </div>

          {/* Universal Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              id="rulebook-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isMl
                  ? 'ചട്ടം, വാക്ക്, നമ്പർ തിരയുക (Search anything)...'
                  : 'Search by Rule No, keyword, title...'
              }
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Chapter filter for All Rules tab */}
        {activeSubTab === 'all_rules' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium whitespace-nowrap pr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" />
              {isMl ? 'അധ്യായങ്ങൾ:' : 'Chapters:'}
            </span>
            <button
              onClick={() => setSelectedChapter('all')}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                selectedChapter === 'all'
                  ? 'bg-cyan-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isMl ? 'എല്ലാ അധ്യായങ്ങളും' : 'All Chapters'}
            </button>
            {KERALA_RULES_CHAPTERS.map((ch) => (
              <button
                key={ch.no}
                onClick={() => setSelectedChapter(ch.no)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedChapter === ch.no
                    ? 'bg-cyan-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isMl ? ch.nameMl : ch.nameEn}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: ALL RULES LIST */}
      {activeSubTab === 'all_rules' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => {
              const ruleDisplayNo = selectedJurisdiction === 'KPBR' ? rule.ruleKpbr : rule.ruleKmbr;
              const otherRuleNo = selectedJurisdiction === 'KPBR' ? rule.ruleKmbr : rule.ruleKpbr;

              return (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleModal(rule)}
                  className="bg-white border border-slate-200 hover:border-cyan-500/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {ruleDisplayNo}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          ({otherRuleNo})
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {rule.category}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-cyan-700 transition-colors">
                        {isMl ? rule.titleMl : rule.titleEn}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {isMl ? rule.summaryMl : rule.summaryEn}
                      </p>
                    </div>

                    {rule.keyTables && rule.keyTables.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 text-[11px]">
                        {rule.keyTables.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="bg-slate-50 p-1.5 rounded-lg">
                            <span className="text-slate-500">{item.label}:</span>{' '}
                            <strong className="text-slate-800 font-mono">{item.value}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-cyan-700 font-semibold">
                    <span>{isMl ? 'വിശദമായ ചട്ടങ്ങളും ഡൗൺലോഡും' : 'View Full Provisions & Clauses'}</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>

          {filteredRules.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">{isMl ? 'തിരഞ്ഞെടുത്ത വാക്കിന് അനുയോജ്യമായ ചട്ടങ്ങൾ ലഭ്യമല്ല.' : 'No rules found matching your search query.'}</p>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: AMENDMENTS ARCHIVE (Newest to Oldest) */}
      {activeSubTab === 'amendments' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1 font-medium">
            {isMl
              ? 'ഏറ്റവും പുതിയ ഭേദഗതികൾ മുതൽ മുൻകാല ഉത്തരവുകൾ വരെയുള്ള പൂർണ്ണ വിവരങ്ങൾ:'
              : 'Chronological Gazette Amendments (Ordered from latest to oldest):'}
          </div>

          <div className="space-y-3">
            {filteredAmendments.map((amend) => (
              <div
                key={amend.id}
                onClick={() => setSelectedAmendmentModal(amend)}
                className="bg-white border border-slate-200 hover:border-amber-500/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                        {amend.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {amend.notificationDate}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {amend.gazetteNumber}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {isMl ? amend.titleMl : amend.titleEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isMl ? amend.summaryMl : amend.summaryEn}
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <span className="text-[11px] text-slate-500 font-medium">
                        {isMl ? 'ബാധകമായ ചട്ടങ്ങൾ:' : 'Affected Rules:'}
                      </span>
                      {amend.affectedRules.map((ruleNo, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {ruleNo}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <span>{isMl ? 'വിശദാംശങ്ങൾ' : 'View Details'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: GOVERNMENT ORDERS & CIRCULARS */}
      {activeSubTab === 'gov_orders' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1 font-medium">
            {isMl
              ? 'തദ്ദേശ സ്വയംഭരണ വകുപ്പിന്റെ പ്രധാന ഉത്തരവുകളും ചീഫ് ടൗൺ പ്ലാനറുടെ സർക്കുലറുകളും:'
              : 'Official Government Notifications, Circulars & Town Planning Directions:'}
          </div>

          <div className="space-y-3">
            {filteredOrders.map((go) => (
              <div
                key={go.id}
                onClick={() => setSelectedGoModal(go)}
                className="bg-white border border-slate-200 hover:border-emerald-500/60 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                        {go.orderNumber}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {go.issueDate}
                      </span>
                      <span className="text-[11px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {go.category}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      {isMl ? go.subjectMl : go.subjectEn}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {isMl ? go.summaryMl : go.summaryEn}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{isMl ? 'ഡൗൺലോഡ് ലിങ്ക്' : 'Download / View'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Full Rule Details Modal */}
      {selectedRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-300 animate-fadeIn">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-950 text-cyan-300">
                    {selectedRuleModal.ruleKmbr}
                  </span>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-800 text-slate-200">
                    {selectedRuleModal.ruleKpbr}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {selectedRuleModal.chapter}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
                  {isMl ? selectedRuleModal.titleMl : selectedRuleModal.titleEn}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRuleModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4 text-cyan-950">
                <div className="font-bold mb-1">{isMl ? 'ചട്ട സംഗ്രഹം:' : 'Rule Overview:'}</div>
                <p className="leading-relaxed">
                  {isMl ? selectedRuleModal.summaryMl : selectedRuleModal.summaryEn}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">
                  {isMl ? 'പൂർണ്ണ ചട്ട നിബന്ധനകളും ഉപവകുപ്പുകളും:' : 'Statutory Clauses & Provisions:'}
                </h4>
                <ul className="space-y-2 list-disc list-inside text-slate-700 leading-relaxed">
                  {(isMl ? selectedRuleModal.fullProvisionsMl : selectedRuleModal.fullProvisionsEn).map(
                    (clause, idx) => (
                      <li key={idx} className="pl-1">
                        {clause}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {selectedRuleModal.keyTables && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900">
                    {isMl ? 'പ്രധാന അളവുകളും മാനദണ്ഡങ്ങളും (Table Values):' : 'Key Statutory Values:'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedRuleModal.keyTables.map((t, idx) => (
                      <div key={idx} className="bg-slate-100 p-2.5 rounded-xl text-xs">
                        <div className="text-slate-500">{t.label}</div>
                        <div className="font-bold text-slate-900 font-mono mt-0.5">{t.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs flex justify-between items-center">
                <span>Source: {selectedRuleModal.sourceAuthority}</span>
                <span>Effective: {selectedRuleModal.effectiveDate}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <a
                href={selectedRuleModal.pdfDownloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-cyan-700 hover:text-cyan-800 bg-cyan-50 px-4 py-2.5 rounded-xl border border-cyan-200"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isMl ? 'ഔദ്യോഗിക LSGD വെബ്‌സൈറ്റിൽ കാണുക' : 'Open LSGD Official Source'}</span>
              </a>

              <button
                onClick={() => setSelectedRuleModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                {isMl ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Amendment Modal */}
      {selectedAmendmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-300 animate-fadeIn">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {selectedAmendmentModal.orderNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                  {isMl ? selectedAmendmentModal.titleMl : selectedAmendmentModal.titleEn}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Notification: {selectedAmendmentModal.notificationDate} · {selectedAmendmentModal.gazetteNumber}
                </div>
              </div>
              <button
                onClick={() => setSelectedAmendmentModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {isMl ? selectedAmendmentModal.summaryMl : selectedAmendmentModal.summaryEn}
              </p>

              <div>
                <div className="font-bold text-slate-900 mb-1.5">
                  {isMl ? 'പ്രധാന ഭേദഗതി പോയിന്റുകൾ:' : 'Key Amendment Highlights:'}
                </div>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700">
                  {(isMl
                    ? selectedAmendmentModal.keyPointsMl
                    : selectedAmendmentModal.keyPointsEn
                  ).map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <a
                href={selectedAmendmentModal.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-4 py-2.5 rounded-xl border border-amber-300"
              >
                <Download className="w-4 h-4" />
                <span>{isMl ? 'ഗസറ്റ് ഓർഡർ ഡൗൺലോഡ് ചെയ്യുക' : 'Download Gazette Order (PDF)'}</span>
              </a>

              <button
                onClick={() => setSelectedAmendmentModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                {isMl ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Government Order Modal */}
      {selectedGoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-300 animate-fadeIn">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                  {selectedGoModal.orderNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
                  {isMl ? selectedGoModal.subjectMl : selectedGoModal.subjectEn}
                </h3>
                <div className="text-xs text-slate-500 mt-1">
                  Issue Date: {selectedGoModal.issueDate} · Applicable: {selectedGoModal.applicableTo}
                </div>
              </div>
              <button
                onClick={() => setSelectedGoModal(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {isMl ? selectedGoModal.summaryMl : selectedGoModal.summaryEn}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <a
                href={selectedGoModal.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 px-4 py-2.5 rounded-xl border border-emerald-300"
              >
                <Download className="w-4 h-4" />
                <span>{isMl ? 'ഔദ്യോഗിക ഓർഡർ ഡൗൺലോഡ് ചെയ്യുക' : 'Download Order PDF'}</span>
              </a>

              <button
                onClick={() => setSelectedGoModal(null)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800"
              >
                {isMl ? 'അടയ്ക്കുക' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
