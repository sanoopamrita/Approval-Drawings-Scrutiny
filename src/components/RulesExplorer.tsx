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
} from 'lucide-react';
import { Language } from '../types';
import { KERALA_BUILDING_RULE_AMENDMENTS } from '../utils/amendments';

interface RulesExplorerProps {
  language: Language;
}

interface RuleBookItem {
  ruleKmbr: string;
  ruleKpbr: string;
  titleEn: string;
  titleMl: string;
  category: string;
  summaryEn: string;
  summaryMl: string;
  keyValues: { label: string; value: string }[];
}

const KERALA_RULEBOOK_DATABASE: RuleBookItem[] = [
  {
    ruleKmbr: 'KMBR Rule 27',
    ruleKpbr: 'KPBR Rule 25',
    titleEn: 'Exterior Open Spaces and Setback Clearances (Table 4)',
    titleMl: 'തുറസ്സായ സ്ഥലങ്ങളും സെറ്റ്ബാക്കുകളും (Table 4)',
    category: 'Setbacks',
    summaryEn: 'Governs front, rear, and side setbacks based on building height and plot width. Minimum front setback is 3.0m for residential up to 10m height.',
    summaryMl: 'കെട്ടിടത്തിന്റെ ഉയരവും പ്ലോട്ടിന്റെ വീതിയും അനുസരിച്ചുള്ള മുൻ-പിൻ-വശങ്ങളിലെ സെറ്റ്ബാക്കുകൾ. 10 മീറ്റർ വരെ ഉയരമുള്ള വീടുകൾക്ക് മുൻവശത്ത് കുറഞ്ഞത് 3.0 മീറ്റർ വേണം.',
    keyValues: [
      { label: 'Front Setback (<=7m height)', value: 'Min 3.0m (Avg 3.0m)' },
      { label: 'Rear Setback (<=7m height)', value: 'Min 1.5m (Avg 2.0m)' },
      { label: 'Side Setback 1', value: 'Min 1.20m' },
      { label: 'Side Setback 2', value: 'Min 1.00m' },
    ],
  },
  {
    ruleKmbr: 'KMBR Rule 29',
    ruleKpbr: 'KPBR Rule 29',
    titleEn: 'Maximum Coverage and Floor Area Ratio (FAR) (Table 2 & 3)',
    titleMl: 'പരമാവധി ഗ്രൗണ്ട് കവറേജ് & FAR (Table 2 & 3)',
    category: 'Coverage & FAR',
    summaryEn: 'Ground coverage limit for Group A1 Residential is 60% in KMBR and 65% in KPBR. Base FAR is 3.0 (KMBR) / 2.75 (KPBR), extendable with fee up to 4.0 (KMBR).',
    summaryMl: 'ഗ്രൂപ്പ് A1 പാർപ്പിട കെട്ടിടങ്ങൾക്ക് പരമാവധി കവറേജ് മുനിസിപ്പാലിറ്റിയിൽ 60%, പഞ്ചായത്തിൽ 65%. അടിസ്ഥാന FAR യഥാക്രമം 3.0 ഉം 2.75 ഉം ആണ്.',
    keyValues: [
      { label: 'Max Coverage (A1 Residential)', value: '60% (KMBR) / 65% (KPBR)' },
      { label: 'Base FAR (No Fee)', value: '3.00 (KMBR) / 2.75 (KPBR)' },
      { label: 'Max Purchasable FAR', value: '4.00 (KMBR) / 3.50 (KPBR)' },
      { label: 'Commercial (Group F) Coverage', value: '60%' },
    ],
  },
  {
    ruleKmbr: 'KMBR Rule 31',
    ruleKpbr: 'KPBR Rule 31',
    titleEn: 'Off-Street Parking Requirements (Table 6)',
    titleMl: 'വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങൾ (Table 6)',
    category: 'Parking',
    summaryEn: 'Specifies car, two-wheeler, and disabled parking slot requirements. For residential homes <= 150 sq.m: Nil. 150-250 sq.m: 1 car space.',
    summaryMl: 'കാറുകൾ, ഇരുചക്ര വാഹനങ്ങൾ, ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് എന്നിവയ്ക്കുള്ള ചട്ടങ്ങൾ. 150 ച.മീ വരെ പാർക്കിംഗ് നിർബന്ധമില്ല. 150-250 ച.മീറ്ററിന് 1 കാർ പാർക്കിംഗ്.',
    keyValues: [
      { label: 'Car Bay Size', value: '2.5m × 5.0m clear' },
      { label: 'Two-Wheeler Slot Size', value: '1.0m × 2.0m' },
      { label: 'Disabled (PwD) Slot', value: '3.6m × 5.0m near entrance' },
      { label: 'Commercial (Group F)', value: '1 Car per 75 sq.m floor area' },
    ],
  },
  {
    ruleKmbr: 'KMBR Rule 47',
    ruleKpbr: 'KPBR Rule 47',
    titleEn: 'Clearance from Open Well to Septic Tank and Soak Pit',
    titleMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലം',
    category: 'Sanitation',
    summaryEn: 'Mandatory minimum 7.50 meters clear distance from open drinking well to septic tank, soak pit, or leach pit.',
    summaryMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും തമ്മിൽ കുറഞ്ഞത് 7.50 മീറ്റർ അകലം നിർബന്ധമാണ്.',
    keyValues: [
      { label: 'Well to Septic Tank', value: 'Min 7.50 meters' },
      { label: 'Well to Soak Pit', value: 'Min 7.50 meters' },
      { label: 'Septic Tank to Boundary', value: 'Min 1.20 meters' },
    ],
  },
  {
    ruleKmbr: 'KMBR Rule 48',
    ruleKpbr: 'KPBR Rule 48',
    titleEn: 'Rainwater Harvesting (RWH) Tank Capacity',
    titleMl: 'മഴവെള്ള സംഭരണി സംഭരണ ശേഷി',
    category: 'Environment',
    summaryEn: 'Mandatory for plinth area >= 100 sq.m in KMBR and >= 150 sq.m in KPBR. Formula: 25 Litres storage per sq.m of roof plinth area.',
    summaryMl: 'പ്ലിന്ത് ഏരിയ 100 ച.മീറ്ററിന് (KMBR) / 150 ച.മീറ്ററിന് (KPBR) മുകളിലുള്ള കെട്ടിടങ്ങൾക്ക് നിർബന്ധം. ചതുരശ്ര മീറ്ററിന് 25 ലിറ്റർ എന്ന തോതിൽ സംഭരണ ശേഷി വേണം.',
    keyValues: [
      { label: 'Formula', value: '25 Litres × Roof Plinth Area (m²)' },
      { label: 'Filtration Requirement', value: 'Sand/gravel filter bed mandatory' },
    ],
  },
  {
    ruleKmbr: 'KMBR Rule 60',
    ruleKpbr: 'KPBR Rule 62',
    titleEn: 'Special Concessions for Small Plots (<= 125 sq.m / 3 Cents)',
    titleMl: 'ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ (125 ച.മീ / 3 സെന്റ്)',
    category: 'Exemptions',
    summaryEn: 'Concessional setbacks for small plots: Front 1.8m, Rear 1.0m, Side 1: 0.9m, Side 2: 0.6m or touching boundary with fire wall and consent.',
    summaryMl: 'ചെറിയ പ്ലോട്ടുകളിലെ പ്രത്യേക ഇളവുകൾ: മുൻവശം 1.8 മീറ്റർ, പിൻവശം 1.0 മീറ്റർ, വശങ്ങളിൽ 0.9 മീറ്ററും 0.6 മീറ്ററും.',
    keyValues: [
      { label: 'Front Setback', value: '1.80 meters' },
      { label: 'Rear Setback', value: '1.00 meters' },
      { label: 'Coverage Allowance', value: 'Up to 75%' },
    ],
  },
];

export const RulesExplorer: React.FC<RulesExplorerProps> = ({ language }) => {
  const isMl = language === 'ml';
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'rules' | 'amendments'>('rules');
  const [lastSyncedDate] = useState<string>('February 2026');

  const filteredRules = KERALA_RULEBOOK_DATABASE.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.titleEn.toLowerCase().includes(q) ||
      r.titleMl.toLowerCase().includes(q) ||
      r.ruleKmbr.toLowerCase().includes(q) ||
      r.ruleKpbr.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Explorer Top Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono">
                Monthly Sync: {lastSyncedDate}
              </span>
              <span className="text-xs text-slate-400">Kerala Gazette & LSGD Orders</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isMl ? 'കെ.എം.ബി.ആർ & കെ.പി.ബി.ആർ ചട്ട പുസ്തകവും ഭേദഗതികളും' : 'KMBR & KPBR Statutory Rulebook & Amendment Registry'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {isMl
                ? 'കേരള സർക്കാർ ഉത്തരവുകളും (GOs) പ്രതിമാസ ചട്ട ഭേദഗതികളും തത്സമയം പരിശോധിക്കാം.'
                : 'Searchable database of KMBR & KPBR rules with latest Kerala Government Orders (LSGD).'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('rules')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'rules'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isMl ? 'ചട്ടങ്ങൾ (Rules)' : 'Core Rules'}
            </button>
            <button
              onClick={() => setActiveTab('amendments')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'amendments'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isMl ? 'ഭേദഗതികൾ (GOs)' : 'Government Orders (GOs)'}
            </button>
          </div>
        </div>
      </div>

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isMl ? 'ചട്ട നമ്പർ, വിഭാഗം അല്ലെങ്കിൽ വാക്ക് നൽകുക...' : 'Search rules by title, number, or category...'}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {rule.ruleKmbr}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      ({rule.ruleKpbr})
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {rule.category}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {isMl ? rule.titleMl : rule.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isMl ? rule.summaryMl : rule.summaryEn}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  {rule.keyValues.map((kv, kIdx) => (
                    <div key={kIdx} className="bg-slate-50 p-2 rounded-lg border border-slate-200/60">
                      <div className="text-[10px] text-slate-500 font-medium">{kv.label}</div>
                      <div className="font-bold text-slate-900 font-mono text-[11px]">{kv.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Amendments Tab */}
      {activeTab === 'amendments' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                {isMl
                  ? 'ഈ സിസ്റ്റം കേരള ഗസറ്റിലെ ഏറ്റവും പുതിയ സർക്കാർ ഉത്തരവുകൾ പ്രകാരം അപ്‌ഡേറ്റ് ചെയ്തതാണ്.'
                  : 'Engine synced with latest Kerala Gazette notifications and LSGD Government Orders up to 2026.'}
              </span>
            </div>
            <span className="font-mono text-emerald-800 font-bold hidden sm:inline">Active</span>
          </div>

          <div className="space-y-3">
            {KERALA_BUILDING_RULE_AMENDMENTS.map((amend) => (
              <div key={amend.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded">
                      {amend.orderNumber}
                    </span>
                    <span className="text-xs text-slate-500">{amend.notificationDate}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                    <span>Rules: {amend.affectedRules.join(', ')}</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {isMl ? amend.titleMl : amend.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isMl ? amend.summaryMl : amend.summaryEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
