import React from 'react';
import {
  Building,
  MapPin,
  UserCheck,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { AreaStatementData, JurisdictionType, Language, OccupancyGroup, PlotType } from '../types';

interface AuthoritySelectorProps {
  data: AreaStatementData;
  onChange: (updated: Partial<AreaStatementData>) => void;
  language: Language;
  onNext: () => void;
}

const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

const OCCUPANCIES: {
  group: OccupancyGroup;
  nameEn: string;
  nameMl: string;
  descEn: string;
  descMl: string;
}[] = [
  {
    group: 'A1',
    nameEn: 'Group A1 - Residential',
    nameMl: 'ഗ്രൂപ്പ് A1 - പാർപ്പിടം (Residential)',
    descEn: 'Single or multi-family dwellings, row houses, residential apartments',
    descMl: 'വ്യക്തിഗത വീടുകൾ, ഫ്ലാറ്റുകൾ, അപ്പാർട്ട്‌മെന്റുകൾ, വില്ലകൾ',
  },
  {
    group: 'A2',
    nameEn: 'Group A2 - Special Residential',
    nameMl: 'ഗ്രൂപ്പ് A2 - സ്പെഷ്യൽ റെസിഡൻഷ്യൽ',
    descEn: 'Hostels, boarding houses, dormitories, serviced apartments, lodges',
    descMl: 'ഹോസ്റ്റലുകൾ, ലോഡ്ജുകൾ, സർവീസ് അപ്പാർട്ട്‌മെന്റുകൾ, ഡോർമിറ്ററികൾ',
  },
  {
    group: 'B',
    nameEn: 'Group B - Educational',
    nameMl: 'ഗ്രൂപ്പ് B - വിദ്യാഭ്യാസം (Educational)',
    descEn: 'Schools, colleges, universities, day-care centers, training institutes',
    descMl: 'സ്കൂളുകൾ, കോളേജുകൾ, ട്രെയിനിംഗ് ഇൻസ്റ്റിറ്റ്യൂട്ടുകൾ, ഡേ-കെയറുകൾ',
  },
  {
    group: 'C',
    nameEn: 'Group C - Medical / Hospital',
    nameMl: 'ഗ്രൂപ്പ് C - ആശുപത്രി / ചികിൽസാലയം (Medical)',
    descEn: 'Hospitals, clinics, nursing homes, diagnostic labs, dispensaries',
    descMl: 'ആശുപത്രികൾ, നഴ്സിംഗ് ഹോമുകൾ, ക്ലിനിക്കുകൾ, ഡയഗ്നോസ്റ്റിക് സെന്ററുകൾ',
  },
  {
    group: 'D',
    nameEn: 'Group D - Assembly',
    nameMl: 'ഗ്രൂപ്പ് D - അസംബ്ലി / സമ്മേളന ശാലകൾ',
    descEn: 'Auditoriums, wedding halls, theatres, convention centers, places of worship',
    descMl: 'ഓഡിറ്റോറിയങ്ങൾ, കൺവെൻഷൻ സെന്ററുകൾ, തിയേറ്ററുകൾ, ആരാധനാലയങ്ങൾ',
  },
  {
    group: 'E',
    nameEn: 'Group E - Office / Business',
    nameMl: 'ഗ്രൂപ്പ് E - ഓഫീസ് / ബിസിനസ്സ്',
    descEn: 'Offices, IT parks, financial institutions, administrative centers',
    descMl: 'ഓഫീസുകൾ, ബാങ്കുകൾ, ഐ.ടി സ്ഥാപനങ്ങൾ, അഡ്മിനിസ്ട്രേറ്റീവ് കെട്ടിടങ്ങൾ',
  },
  {
    group: 'F',
    nameEn: 'Group F - Mercantile / Commercial',
    nameMl: 'ഗ്രൂപ്പ് F - വാണിജ്യം / ഷോപ്പുകൾ (Commercial)',
    descEn: 'Retail shops, supermarkets, shopping malls, showrooms, restaurants',
    descMl: 'കടകൾ, ഷോപ്പിംഗ് മാളുകൾ, സൂപ്പർമാർക്കറ്റുകൾ, റസ്റ്റോറന്റുകൾ',
  },
  {
    group: 'G1',
    nameEn: 'Group G1 - Industrial (Low Hazard)',
    nameMl: 'ഗ്രൂപ്പ് G1 - വ്യവസായം (Low Hazard)',
    descEn: 'Garments, food processing, light manufacturing, electronics assembly',
    descMl: 'ചെറുകിട വ്യവസായങ്ങൾ, തുണി നിർമ്മാണം, ഭക്ഷ്യ സംസ്കരണം',
  },
  {
    group: 'G2',
    nameEn: 'Group G2 - Industrial (Moderate Hazard)',
    nameMl: 'ഗ്രൂപ്പ് G2 - വ്യവസായം (Moderate Hazard)',
    descEn: 'Sawmills, metal fabrication, plastics, printing presses',
    descMl: 'തടി മില്ലുകൾ, മെറ്റൽ ഫാബ്രിക്കേഷൻ, പ്ലാസ്റ്റിക് നിർമ്മാണം',
  },
  {
    group: 'H',
    nameEn: 'Group H - Storage / Warehouse',
    nameMl: 'ഗ്രൂപ്പ് H - സംഭരണശാലകൾ / വെയർഹൗസ്',
    descEn: 'Warehouses, godowns, freight logistics centers, cold storages',
    descMl: 'വെയർഹൗസുകൾ, ഗോഡൗണുകൾ, കോൾഡ് സ്റ്റോറേജുകൾ',
  },
  {
    group: 'I',
    nameEn: 'Group I - Hazardous',
    nameMl: 'ഗ്രൂപ്പ് I - അപകടകരമായ വസ്തുക്കൾ (Hazardous)',
    descEn: 'Chemical plants, petroleum storage, LPG bottling, explosives',
    descMl: 'കെമിക്കൽ പ്ലാന്റുകൾ, പെട്രോളിയം സംഭരണശാലകൾ, ഗ്യാസ് ഏജൻസികൾ',
  },
];

export const AuthoritySelector: React.FC<AuthoritySelectorProps> = ({
  data,
  onChange,
  language,
  onNext,
}) => {
  const isMl = language === 'ml';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Introduction Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono">
                {data.jurisdiction === 'KMBR' ? 'Kerala Municipality Building Rules (KMBR 2019)' : 'Kerala Panchayat Building Rules (KPBR 2019)'}
              </span>
              <span className="text-xs text-slate-400">Govt. of Kerala LSGD</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isMl ? 'പ്രോജക്റ്റ് വിവരങ്ങളും അധികാര പരിധിയും' : 'Project Identification & Statutory Authority'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {isMl
                ? 'തദ്ദേശ സ്വയംഭരണ സ്ഥാപനത്തിന്റെ പരിധി, സർവേ നമ്പർ, ഓക്കുപ്പൻസി ഗ്രൂപ്പ് എന്നിവ തെരഞ്ഞെടുക്കുക.'
                : 'Select the LSGD jurisdiction, survey particulars, occupancy classification, and plot category.'}
            </p>
          </div>

          <div className="bg-slate-950/60 border border-slate-700/60 rounded-xl p-3 text-xs flex flex-col gap-1 min-w-[220px]">
            <span className="text-slate-400 font-medium">
              {isMl ? 'നിലവിലെ ചട്ട ബാധ്യത:' : 'Applicable Ruleset:'}
            </span>
            <span className="text-emerald-400 font-bold text-sm">
              {data.jurisdiction === 'KMBR' ? 'KMBR 2019 (നഗരസഭ)' : 'KPBR 2019 (പഞ്ചായത്ത്)'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {data.jurisdiction === 'KMBR' ? 'Corporations & Municipalities' : 'Grama Panchayats in Kerala'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Authority & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Jurisdiction & Local Body */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '1. തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം & പരിധി' : '1. Local Self Government Jurisdiction'}
            </h3>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Jurisdiction Switcher Box */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                {isMl ? 'ചട്ട വിഭാഗം (Jurisdiction Type):' : 'Statutory Building Rules:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="auth-select-kmbr"
                  onClick={() => onChange({ jurisdiction: 'KMBR' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    data.jurisdiction === 'KMBR'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-emerald-800 flex items-center justify-between">
                    <span>KMBR 2019</span>
                    {data.jurisdiction === 'KMBR' && <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {isMl ? 'മുനിസിപ്പൽ കോർപ്പറേഷൻ & മുനിസിപ്പാലിറ്റി' : 'Municipal Corporations & Municipalities'}
                  </div>
                </button>

                <button
                  type="button"
                  id="auth-select-kpbr"
                  onClick={() => onChange({ jurisdiction: 'KPBR' })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    data.jurisdiction === 'KPBR'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-slate-900'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <div className="font-bold text-emerald-800 flex items-center justify-between">
                    <span>KPBR 2019</span>
                    {data.jurisdiction === 'KPBR' && <span className="text-xs bg-emerald-600 text-white px-1.5 py-0.5 rounded">Active</span>}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {isMl ? 'ഗ്രാമപഞ്ചായത്തുകൾ' : 'Grama Panchayats in Kerala'}
                  </div>
                </button>
              </div>
            </div>

            {/* District & Local Body Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'ജില്ല (District):' : 'District:'}
                </label>
                <select
                  id="auth-district"
                  value={data.district}
                  onChange={(e) => onChange({ district: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  {KERALA_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'തദ്ദേശ സ്ഥാപനത്തിന്റെ പേര്:' : 'Local Body Name:'}
                </label>
                <input
                  type="text"
                  id="auth-localbody"
                  value={data.localBodyName}
                  onChange={(e) => onChange({ localBodyName: e.target.value })}
                  placeholder={data.jurisdiction === 'KMBR' ? 'e.g. Kochi Corporation' : 'e.g. Kizhakkambalam Grama Panchayat'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Ward & Taluk & Village */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'വാർഡ് (Ward):' : 'Ward / Division:'}
                </label>
                <input
                  type="text"
                  id="auth-ward"
                  value={data.wardNumber}
                  onChange={(e) => onChange({ wardNumber: e.target.value })}
                  placeholder="e.g. Ward 08"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'വില്ലേജ് (Village):' : 'Revenue Village:'}
                </label>
                <input
                  type="text"
                  id="auth-village"
                  value={data.villageName}
                  onChange={(e) => onChange({ villageName: e.target.value })}
                  placeholder="e.g. Kizhakkambalam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'താലൂക്ക് (Taluk):' : 'Taluk:'}
                </label>
                <input
                  type="text"
                  id="auth-taluk"
                  value={data.talukName}
                  onChange={(e) => onChange({ talukName: e.target.value })}
                  placeholder="e.g. Kunnathunad"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Survey Number */}
            <div>
              <label className="block text-slate-700 font-medium mb-1 flex items-center justify-between">
                <span>{isMl ? 'റീ-സർവേ നമ്പർ & ബ്ലോക്ക്:' : 'Re-Survey Number & Block:'}</span>
                <span className="text-[11px] text-slate-500 font-normal">Matching Revenue Sketch</span>
              </label>
              <input
                type="text"
                id="auth-surveyno"
                value={data.surveyNumber}
                onChange={(e) => onChange({ surveyNumber: e.target.value })}
                placeholder="e.g. 142/3-B, Block 12"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Applicant & Project Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '2. അപേക്ഷകനും രജിസ്റ്റേർഡ് എഞ്ചിനീയറും' : '2. Applicant & Licensed Engineer'}
            </h3>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'പ്രോജക്റ്റിന്റെ പേര്:' : 'Project Name:'}
              </label>
              <input
                type="text"
                id="auth-projectname"
                value={data.projectName}
                onChange={(e) => onChange({ projectName: e.target.value })}
                placeholder="e.g. Green Villa Residential Project"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">
                {isMl ? 'അപേക്ഷകന്റെ പേര് (Applicant / Owner):' : 'Applicant / Owner Name:'}
              </label>
              <input
                type="text"
                id="auth-applicant"
                value={data.applicantName}
                onChange={(e) => onChange({ applicantName: e.target.value })}
                placeholder="e.g. Sanoop Sadanandhan"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'ആർക്കിടെക്റ്റ് / എഞ്ചിനീയർ:' : 'Architect / Engineer:'}
                </label>
                <input
                  type="text"
                  id="auth-engineer"
                  value={data.architectEngineerName}
                  onChange={(e) => onChange({ architectEngineerName: e.target.value })}
                  placeholder="e.g. Er. Rajesh Kumar, FIE"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  {isMl ? 'ലൈസൻസ് നമ്പർ (LSGD / COA):' : 'LSGD / COA License No:'}
                </label>
                <input
                  type="text"
                  id="auth-license"
                  value={data.licenseNumber}
                  onChange={(e) => onChange({ licenseNumber: e.target.value })}
                  placeholder="e.g. LSGD/ENG/A/2024/0984"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            {/* Plot Category / Special Zone */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{isMl ? 'പ്ലോട്ട് കാറ്റഗറി / പ്രത്യേക ഇളവുകൾ:' : 'Plot Classification & Special Exemptions:'}</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                <button
                  type="button"
                  id="plot-type-normal"
                  onClick={() => onChange({ plotType: 'normal' })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    data.plotType === 'normal'
                      ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold">{isMl ? 'സാധാരണ പ്ലോട്ട്' : 'Standard Plot (> 125 sq.m)'}</div>
                  <div className="text-[11px] text-slate-500">Standard KMBR/KPBR rules apply</div>
                </button>

                <button
                  type="button"
                  id="plot-type-small"
                  onClick={() => onChange({ plotType: 'small_plot' })}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                    data.plotType === 'small_plot'
                      ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-500/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{isMl ? 'ചെറിയ പ്ലോട്ട് (≤ 125 ച.മീ)' : 'Small Plot (≤ 125 sq.m / 3 Cents)'}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-mono">
                      {data.jurisdiction === 'KMBR' ? 'Rule 60' : 'Rule 62'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {isMl ? 'ഫ്രണ്ട് 1.8m, റിയർ 1.0m ഇളവുകൾ' : 'Concessional setbacks: 1.8m FOS, 1.0m ROS'}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Occupancy Group Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '3. കെട്ടിട ഓക്കുപ്പൻസി ഗ്രൂപ്പ് (Building Occupancy Classification)' : '3. Building Occupancy Classification (Groups A1 to I)'}
            </h3>
          </div>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {isMl ? 'ചട്ടം 25 പ്രകാരം' : 'As per KMBR/KPBR Rule 25'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {OCCUPANCIES.map((occ) => {
            const isSelected = data.occupancyGroup === occ.group;
            return (
              <button
                key={occ.group}
                id={`occupancy-${occ.group}`}
                type="button"
                onClick={() => onChange({ occupancyGroup: occ.group })}
                className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs sm:text-sm ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>
                      {isMl ? occ.nameMl : occ.nameEn}
                    </span>
                    <span
                      className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      Group {occ.group}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2">
                    {isMl ? occ.descMl : occ.descEn}
                  </p>
                </div>

                {isSelected && (
                  <div className="mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                    <span>Selected Category</span>
                    <span>✓</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Step Action Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          id="btn-proceed-drawings"
          onClick={onNext}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-sm"
        >
          <span>{isMl ? 'അടുത്ത ഘട്ടം: ഡ്രോയിംഗുകൾ അപ്‌ലോഡ് ചെയ്യുക' : 'Proceed to Step 2: Drawing Uploads'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
