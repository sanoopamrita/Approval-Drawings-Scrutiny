import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  Building,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Printer,
  FileCheck2,
} from 'lucide-react';
import { Language, ScrutinyCheckResult, ScrutinyReportSummary } from '../types';

interface ScrutinyResultsProps {
  summary: ScrutinyReportSummary;
  checks: ScrutinyCheckResult[];
  language: Language;
  onGoToReport: () => void;
}

export const ScrutinyResults: React.FC<ScrutinyResultsProps> = ({
  summary,
  checks,
  language,
  onGoToReport,
}) => {
  const isMl = language === 'ml';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'fail' | 'warning' | 'pass'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCheckId, setExpandedCheckId] = useState<string | null>(null);

  const categories = [
    { id: 'all', labelEn: 'All Rules', labelMl: 'എല്ലാ ചട്ടങ്ങളും' },
    { id: 'drawings', labelEn: 'Drawings (Rule 6)', labelMl: 'പ്ലാനുകൾ (Rule 6)' },
    { id: 'access_road', labelEn: 'Access Road (Rule 22)', labelMl: 'വഴിവീതി (Rule 22)' },
    { id: 'coverage_far', labelEn: 'Coverage & FAR', labelMl: 'കവറേജ് & FAR' },
    { id: 'setbacks', labelEn: 'Open Space Setbacks', labelMl: 'സെറ്റ്ബാക്കുകൾ' },
    { id: 'parking', labelEn: 'Parking Bays (Rule 31)', labelMl: 'പാർക്കിംഗ് (Rule 31)' },
    { id: 'sanitation_rwh', labelEn: 'Sanitation & RWH', labelMl: 'സാനിറ്റേഷൻ & മഴവെള്ളം' },
    { id: 'architecture', labelEn: 'Architectural Standards', labelMl: 'വാസ്തുശില്പ മാനദണ്ഡങ്ങൾ' },
    { id: 'fire_safety', labelEn: 'Fire & Safety', labelMl: 'ഫയർ സേഫ്റ്റി' },
  ];

  const filteredChecks = checks.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = (item.titleEn + ' ' + item.titleMl).toLowerCase().includes(query);
      const matchRule = (item.ruleNoKmbr + ' ' + item.ruleNoKpbr).toLowerCase().includes(query);
      const matchNote = (item.technicalNoteEn + ' ' + item.technicalNoteMl).toLowerCase().includes(query);
      if (!matchTitle && !matchRule && !matchNote) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Executive Summary Status Card */}
      <div
        className={`rounded-2xl p-6 text-white shadow-md border ${
          summary.overallStatus === 'APPROVED'
            ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 border-emerald-500/40'
            : summary.overallStatus === 'CONDITIONAL_APPROVAL'
            ? 'bg-gradient-to-r from-amber-950 via-slate-900 to-amber-900 border-amber-500/40'
            : 'bg-gradient-to-r from-rose-950 via-slate-900 to-rose-900 border-rose-500/40'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full">
                Ref: {summary.scrutinyReferenceId}
              </span>
              <span className="text-xs text-white/70">
                {new Date(summary.scrutinyTimestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {summary.overallStatus === 'APPROVED' ? (
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
              ) : summary.overallStatus === 'CONDITIONAL_APPROVAL' ? (
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-7 h-7" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-400">
                  <XCircle className="w-7 h-7" />
                </div>
              )}

              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  {summary.overallStatus === 'APPROVED'
                    ? (isMl ? 'ചട്ടപ്രകാരം അംഗീകൃത യോഗ്യം (APPROVED)' : 'FULLY COMPLIANT WITH KERALA BUILDING RULES')
                    : summary.overallStatus === 'CONDITIONAL_APPROVAL'
                    ? (isMl ? 'വ്യവസ്ഥകൾക്ക് വിധേയം (CONDITIONAL APPROVAL)' : 'CONDITIONAL COMPLIANCE (ADDITIONAL FEES APPLICABLE)')
                    : (isMl ? 'ചട്ടലംഘനം കണ്ടെത്തി / പ്ലാൻ തിരുത്തണം (DEFECTIVE)' : 'STATUTORY DEFECTS DETECTED - REVISIONS MANDATORY')}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mt-0.5">
                  {summary.failedCount === 0
                    ? (isMl ? 'എല്ലാ പരിശോധനകളും വിജയകരമായി പൂർത്തിയായി.' : 'All mandatory setbacks, coverage, parking and sanitary clearances verified.')
                    : (isMl
                        ? `${summary.failedCount} ചട്ടലംഘനങ്ങൾ കണ്ടെത്തി. വിശദാംശങ്ങൾ താഴെ നൽകിയിരിക്കുന്നു.`
                        : `${summary.failedCount} non-compliant item(s) must be rectified before permit endorsement.`)}
                </p>
              </div>
            </div>
          </div>

          {/* KPI Mini Counter Cards */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
            <div className="bg-slate-900/80 border border-emerald-500/30 rounded-xl p-3 text-center">
              <div className="text-emerald-400 font-bold text-xl sm:text-2xl">{summary.passedCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Passed (✅)</div>
            </div>

            <div className="bg-slate-900/80 border border-rose-500/30 rounded-xl p-3 text-center">
              <div className="text-rose-400 font-bold text-xl sm:text-2xl">{summary.failedCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Violations (❌)</div>
            </div>

            <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-3 text-center">
              <div className="text-amber-400 font-bold text-xl sm:text-2xl">{summary.warningCount}</div>
              <div className="text-[11px] text-slate-400 font-medium">Warnings (⚠️)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isMl ? 'ചട്ടം അല്ലെങ്കിൽ വാക്ക് തിരയുക...' : 'Search by Rule No or parameter...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Status Quick Filter Pills */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({checks.length})
            </button>
            <button
              onClick={() => setStatusFilter('fail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'fail'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Violations ({summary.failedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Warnings ({summary.warningCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('pass')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                statusFilter === 'pass'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passed ({summary.passedCount})</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isMl ? cat.labelMl : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Scrutiny Checklist Table / Cards */}
      <div className="space-y-3">
        {filteredChecks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            <Info className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm">No rules match the active filter or search query.</p>
          </div>
        ) : (
          filteredChecks.map((item) => {
            const isExpanded = expandedCheckId === item.id;
            const isPass = item.status === 'pass';
            const isFail = item.status === 'fail';
            const isWarning = item.status === 'warning';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all shadow-2xs overflow-hidden ${
                  isFail
                    ? 'border-rose-300 ring-1 ring-rose-500/20'
                    : isWarning
                    ? 'border-amber-300 ring-1 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Rule Card Header */}
                <div
                  onClick={() => setExpandedCheckId(isExpanded ? null : item.id)}
                  className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/50"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {isPass ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          ✓
                        </div>
                      ) : isFail ? (
                        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                          ✕
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                          !
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {item.ruleNoKmbr}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono hidden md:inline">
                          ({item.ruleNoKpbr})
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.2 rounded-full ${
                            isPass
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFail
                              ? 'bg-rose-100 text-rose-800 font-bold'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isPass ? 'COMPLIANT ✅' : isFail ? 'VIOLATION ❌' : 'CONDITIONAL ⚠️'}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {isMl ? item.titleMl : item.titleEn}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {isMl ? item.requirementMl : item.requirementEn}
                      </p>
                    </div>
                  </div>

                  {/* Value Comparison */}
                  <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-medium">Provided / Required</div>
                      <div className="font-bold text-slate-900 font-mono">
                        <span className={isFail ? 'text-rose-700' : 'text-emerald-700'}>
                          {item.providedValue}
                        </span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className="text-slate-600">{item.requiredValue}</span>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details & Rectification Note */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs sm:text-sm animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Requirement Details */}
                      <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
                        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-emerald-600" />
                          <span>{isMl ? 'ചട്ടപരമായ നിബന്ധന:' : 'Statutory Rule Requirement:'}</span>
                        </div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {isMl ? item.requirementMl : item.requirementEn}
                        </p>
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="text-slate-500">KMBR Ref:</span>
                          <span className="font-mono font-medium text-slate-800">{item.ruleNoKmbr}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">KPBR Ref:</span>
                          <span className="font-mono font-medium text-slate-800">{item.ruleNoKpbr}</span>
                        </div>
                      </div>

                      {/* Right: Technical Scrutiny Finding */}
                      <div
                        className={`space-y-2 p-3.5 rounded-xl border ${
                          isFail
                            ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                            : isWarning
                            ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        }`}
                      >
                        <div className="font-semibold flex items-center gap-1.5">
                          <Info className="w-4 h-4" />
                          <span>{isMl ? 'സാങ്കേതിക പരിശോധനാ നിഗമനം:' : 'Engineering Scrutiny Finding:'}</span>
                        </div>
                        <p className="text-xs leading-relaxed">
                          {isMl ? item.technicalNoteMl : item.technicalNoteEn}
                        </p>
                      </div>
                    </div>

                    {/* Rectification Advice for Violations */}
                    {(isFail || isWarning) && item.rectificationAdviceEn && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-1">
                        <div className="font-bold text-xs flex items-center gap-1.5 text-rose-900">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>{isMl ? 'പരിഹാര നിർദ്ദേശം (Action Required):' : 'Remedy & Plan Rectification Action:'}</span>
                        </div>
                        <p className="text-xs text-rose-800 leading-relaxed font-medium">
                          {isMl ? item.rectificationAdviceMl : item.rectificationAdviceEn}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Action to Official Report */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <span className="text-xs text-slate-500">
          Generated under Kerala Municipality Building Rules & Panchayat Building Rules Engine.
        </span>

        <button
          type="button"
          id="btn-goto-official-report"
          onClick={onGoToReport}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm"
        >
          <FileText className="w-4 h-4" />
          <span>{isMl ? 'ഔദ്യോഗിക റിപ്പോർട്ടും PDF-ഉം കാണുക' : 'Generate Official Report & Export PDF'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
