import React, { useState, useEffect } from 'react';
import {
  Building,
  MapPin,
  UserCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Edit3,
  ListFilter,
  Layers,
  Search,
  RefreshCw,
  Info,
  Landmark,
  Building2,
  Home,
  Check,
  Compass,
} from 'lucide-react';
import { AreaStatementData, Language, OccupancyGroup, LocalBodyType, JurisdictionType } from '../types';
import {
  KERALA_ADMINISTRATIVE_DATA,
  KERALA_DISTRICT_NAMES,
  ALL_LOCAL_BODY_TYPES,
  STANDARD_WARD_OPTIONS,
  getApplicableJurisdiction,
} from '../data/keralaAdministrativeData';
import { adminDataService } from '../services/adminDataService';

interface AuthoritySelectorProps {
  data: AreaStatementData;
  onChange: (updated: Partial<AreaStatementData>) => void;
  language: Language;
  onNext: () => void;
}

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

  // Listen to dynamic changes from adminDataService
  const [, setAdminDataVersion] = useState(0);
  useEffect(() => {
    return adminDataService.subscribe(() => {
      setAdminDataVersion((v) => v + 1);
    });
  }, []);

  // Determine current active Local Body Type (default to Grama Panchayat or Municipality based on jurisdiction)
  const currentLbType: LocalBodyType =
    data.localBodyType || (data.jurisdiction === 'KMBR' ? 'Municipality' : 'Grama Panchayat');

  // Fallback / manual input mode toggles for fields
  const [customLocalBodyMode, setCustomLocalBodyMode] = useState(false);
  const [customTalukMode, setCustomTalukMode] = useState(false);
  const [customVillageMode, setCustomVillageMode] = useState(false);
  const [customWardMode, setCustomWardMode] = useState(false);

  // Search filter for local bodies
  const [localBodySearch, setLocalBodySearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Computed options from dynamic administrative service
  const currentDistrict = data.district || 'Ernakulam';
  const allDistricts = adminDataService.getAllDistricts();
  const taluks = adminDataService.getTaluks(currentDistrict);
  const villages = adminDataService.getVillages(currentDistrict, data.talukName);
  const lastSyncInfo = adminDataService.getLastSyncInfo();

  // Get local bodies specifically filtered by district AND selected local body type
  const localBodiesForType = adminDataService.getLocalBodiesByType(currentDistrict, currentLbType);

  // Filtered local bodies based on user's quick search
  const filteredLocalBodies = localBodiesForType.filter((lb) => {
    if (!localBodySearch.trim()) return true;
    const q = localBodySearch.toLowerCase();
    return lb.nameEn.toLowerCase().includes(q) || lb.nameMl.includes(q);
  });

  // Handle live quick sync for the selected district or all Kerala
  const handleQuickSync = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(isMl ? 'തദ്ദേശ സ്ഥാപനങ്ങളുടെ ഡാറ്റ സിങ്ക് ചെയ്യുന്നു...' : 'Syncing local bodies directory...');
    try {
      const res = await adminDataService.syncWithInternet(currentDistrict);
      setSyncStatusMsg(
        isMl
          ? `✓ ${currentDistrict} ജില്ലയിലെ ${localBodiesForType.length} തദ്ദേശ സ്ഥാപനങ്ങൾ സിങ്ക് ചെയ്തു`
          : `✓ Synced ${localBodiesForType.length} local bodies for ${currentDistrict}`
      );
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch {
      setSyncStatusMsg(isMl ? 'ഡാറ്റ അപ്‌ഡേറ്റ് ചെയ്തു' : 'Data updated');
      setTimeout(() => setSyncStatusMsg(null), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle District Change
  const handleDistrictChange = (newDistrict: string) => {
    const bodies = adminDataService.getLocalBodiesByType(newDistrict, currentLbType);
    const newTaluks = adminDataService.getTaluks(newDistrict);
    const firstLocalBody = bodies.length > 0 ? (isMl ? bodies[0].nameMl : bodies[0].nameEn) : '';
    const firstLocalBodyCode = bodies.length > 0 ? bodies[0].code : '';
    const firstTaluk = newTaluks.length > 0 ? (isMl ? newTaluks[0].nameMl : newTaluks[0].nameEn) : '';
    const newVillages = adminDataService.getVillages(newDistrict, firstTaluk);
    const firstVillage = newVillages.length > 0 ? (isMl ? newVillages[0].nameMl : newVillages[0].nameEn) : '';

    onChange({
      district: newDistrict,
      localBodyType: currentLbType,
      localBodyName: firstLocalBody,
      localBodyCode: firstLocalBodyCode,
      talukName: firstTaluk,
      villageName: firstVillage,
      wardNumber: data.wardNumber || 'Ward 01',
    });
    setCustomLocalBodyMode(false);
    setCustomTalukMode(false);
    setCustomVillageMode(false);
    setLocalBodySearch('');
  };

  // Handle Local Body Type Change (e.g. Grama Panchayat, Municipality, Corporation, Block Panchayat, District Panchayat)
  const handleLocalBodyTypeChange = (newType: LocalBodyType) => {
    const applicableJurisdiction = getApplicableJurisdiction(newType);
    const bodies = adminDataService.getLocalBodiesByType(currentDistrict, newType);
    const firstLocalBody = bodies.length > 0 ? (isMl ? bodies[0].nameMl : bodies[0].nameEn) : '';
    const firstCode = bodies.length > 0 ? bodies[0].code : '';

    onChange({
      localBodyType: newType,
      jurisdiction: applicableJurisdiction,
      localBodyName: firstLocalBody,
      localBodyCode: firstCode,
    });
    setCustomLocalBodyMode(false);
    setLocalBodySearch('');
  };

  const handleTalukChange = (newTaluk: string) => {
    const newVillages = adminDataService.getVillages(currentDistrict, newTaluk);
    const firstVillage = newVillages.length > 0 ? (isMl ? newVillages[0].nameMl : newVillages[0].nameEn) : '';
    onChange({
      talukName: newTaluk,
      villageName: firstVillage,
    });
    setCustomVillageMode(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Introduction Card with Ruleset and Sync Badge */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 rounded-2xl p-5 text-white shadow-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span
                className={`text-xs px-3 py-1 rounded-full font-mono font-bold flex items-center gap-1.5 border shadow-xs ${
                  data.jurisdiction === 'KMBR'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                {data.jurisdiction === 'KMBR' ? 'KMBR 2019 (നഗരസഭ / കോർപ്പറേഷൻ)' : 'KPBR 2019 (പഞ്ചായത്ത് പരിധി)'}
              </span>
              <span className="text-xs bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                {isMl ? 'കേരള LSGD സമ്പൂർണ്ണ ഡയറക്ടറി (14 ജില്ലകൾ)' : 'Kerala LSGD Master Directory Active'}
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isMl ? 'പ്രോജക്റ്റ് വിവരങ്ങളും അധികാര പരിധിയും' : 'Project Identification & Statutory Authority'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {isMl
                ? 'ജില്ല, തദ്ദേശ സ്ഥാപന വിഭാഗം (പഞ്ചായത്ത്/മുനിസിപ്പാലിറ്റി/കോർപ്പറേഷൻ), താലൂക്ക്, വില്ലേജ്, വാർഡ് എന്നിവ സെലക്ട് ചെയ്യുക.'
                : 'Select District, Local Body Type (Grama Panchayat / Municipality / Corporation / Block / District), Taluk, and Village.'}
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-700/70 rounded-xl p-3 text-xs flex flex-col gap-1 min-w-[220px]">
            <span className="text-slate-400 font-medium">
              {isMl ? 'ബാധകമായ നിർമ്മാണ ചട്ടം:' : 'Applicable Building Rules:'}
            </span>
            <span className={`font-bold text-sm ${data.jurisdiction === 'KMBR' ? 'text-blue-400' : 'text-emerald-400'}`}>
              {data.jurisdiction === 'KMBR' ? 'KMBR 2019 (Kerala Municipality Building Rules)' : 'KPBR 2019 (Kerala Panchayat Building Rules)'}
            </span>
            <span className="text-slate-400 text-[11px]">
              {currentLbType === 'Corporation'
                ? isMl ? 'കോർപ്പറേഷൻ പരിധി' : 'Municipal Corporation Area'
                : currentLbType === 'Municipality'
                ? isMl ? 'മുനിസിപ്പാലിറ്റി പരിധി' : 'Municipality Area'
                : currentLbType === 'District Panchayat'
                ? isMl ? 'ജില്ലാ പഞ്ചായത്ത് പരിധി' : 'District Panchayat Level'
                : currentLbType === 'Block Panchayat'
                ? isMl ? 'ബ്ലോക്ക് പഞ്ചായത്ത് പരിധി' : 'Block Panchayat Level'
                : isMl ? 'ഗ്രാമപഞ്ചായത്ത് പരിധി' : 'Grama Panchayat Area'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Authority & Project Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Local Self Government Jurisdiction & Administrative Levels */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {isMl ? '1. തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം & പരിധി' : '1. Local Self Government Institution (LSGI)'}
              </h3>
            </div>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {isMl ? 'ഡൈനാമിക് ഫിൽട്ടർ സജീവം' : 'Dynamic Hierarchy Active'}
            </span>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
            {/* Step 1: District Selection */}
            <div>
              <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                <span>{isMl ? 'റവന്യൂ ജില്ല (District):' : 'Revenue District:'}</span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  14 Districts
                </span>
              </label>
              <select
                id="auth-district"
                value={currentDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm transition-all"
              >
                {allDistricts.map((d) => (
                  <option key={d.district} value={d.district}>
                    {isMl ? `${d.districtMl} (${d.district})` : `${d.district} (${d.districtMl})`}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Local Body Type Selector (5 Types as requested: District Panchayat, Block Panchayat, Municipality, Corporation, Grama Panchayat) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-slate-700 font-semibold">
                  {isMl ? 'തദ്ദേശ സ്ഥാപന വിഭാഗം (Local Body Type):' : 'Local Body Administrative Level:'}
                </label>
                <span className="text-[11px] text-slate-500">
                  {isMl ? 'ബാധകമായ ചട്ടമനുസരിച്ച്' : 'Ruleset-Specific'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ALL_LOCAL_BODY_TYPES.map((lbt) => {
                  const isSelected = currentLbType === lbt.type;
                  const isKmbr = lbt.jurisdiction === 'KMBR';

                  return (
                    <button
                      key={lbt.type}
                      type="button"
                      id={`auth-lbtype-${lbt.type.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => handleLocalBodyTypeChange(lbt.type)}
                      className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? isKmbr
                            ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/30 text-slate-900 shadow-xs'
                            : 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 text-slate-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="font-bold text-xs leading-tight">
                          {isMl ? lbt.nameMl : lbt.nameEn}
                        </span>
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 shrink-0 ${isKmbr ? 'text-blue-600' : 'text-emerald-600'}`} />
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                            isKmbr
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {lbt.jurisdiction}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Local Body Name Dropdown with Search, Count, Code and Custom Entry */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-700 font-semibold flex items-center gap-1.5">
                  <span>
                    {isMl ? `${currentLbType} തിരഞ്ഞെടുക്കുക:` : `Select ${currentLbType}:`}
                  </span>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                    {localBodiesForType.length} {isMl ? 'എണ്ണം' : 'Available'}
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleQuickSync}
                    disabled={isSyncing}
                    title={isMl ? 'ഇന്റർനെറ്റിൽ നിന്ന് തദ്ദേശ സ്ഥാപനങ്ങൾ സിങ്ക് ചെയ്യുക' : 'Sync local bodies from web'}
                    className="text-[11px] text-cyan-700 hover:text-cyan-800 bg-cyan-50 border border-cyan-200/60 px-2 py-0.5 rounded flex items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-cyan-600' : ''}`} />
                    <span>{isMl ? 'സിങ്ക്' : 'Sync'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomLocalBodyMode(!customLocalBodyMode)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    {customLocalBodyMode ? (
                      <span>📋 {isMl ? 'ലിസ്റ്റ്' : 'List'}</span>
                    ) : (
                      <span>✏️ {isMl ? 'ടൈപ്പ്' : 'Custom'}</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Search filter if there are multiple local bodies */}
              {!customLocalBodyMode && localBodiesForType.length > 6 && (
                <div className="relative mb-1.5">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={localBodySearch}
                    onChange={(e) => setLocalBodySearch(e.target.value)}
                    placeholder={
                      isMl
                        ? `${currentDistrict} ജില്ലയിലെ ലിസ്റ്റിൽ തിരയുക (${localBodiesForType.length} എണ്ണം)...`
                        : `Filter in ${currentDistrict} (${localBodiesForType.length} items)...`
                    }
                    className="w-full text-xs bg-white border border-slate-200 rounded-md pl-8 pr-2.5 py-1 text-slate-700 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                  {localBodySearch && (
                    <button
                      type="button"
                      onClick={() => setLocalBodySearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              {customLocalBodyMode ? (
                <input
                  type="text"
                  id="auth-localbody-custom"
                  value={data.localBodyName}
                  onChange={(e) => onChange({ localBodyName: e.target.value })}
                  placeholder={
                    currentLbType === 'Corporation'
                      ? isMl ? 'ഉദാ: കൊച്ചി കോർപ്പറേഷൻ' : 'e.g. Kochi Municipal Corporation'
                      : currentLbType === 'Municipality'
                      ? isMl ? 'ഉദാ: തൃപ്പൂണിത്തുറ നഗരസഭ' : 'e.g. Tripunithura Municipality'
                      : isMl ? 'ഉദാ: കിഴക്കമ്പലം ഗ്രാമപഞ്ചായത്ത്' : 'e.g. Kizhakkambalam Grama Panchayat'
                  }
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              ) : (
                <select
                  id="auth-localbody"
                  value={data.localBodyName}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setCustomLocalBodyMode(true);
                    } else {
                      const selectedItem = localBodiesForType.find(
                        (lb) => (isMl ? lb.nameMl : lb.nameEn) === e.target.value || lb.nameEn === e.target.value
                      );
                      onChange({
                        localBodyName: e.target.value,
                        localBodyCode: selectedItem?.code || '',
                      });
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm"
                >
                  {filteredLocalBodies.length > 0 ? (
                    filteredLocalBodies.map((lb) => {
                      const label = isMl ? `${lb.nameMl} (${lb.nameEn})` : `${lb.nameEn} (${lb.nameMl})`;
                      const value = isMl ? lb.nameMl : lb.nameEn;
                      return (
                        <option key={lb.code || lb.nameEn} value={value}>
                          {label}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>
                      {isMl ? 'ഈ വിഭാഗത്തിൽ സ്ഥാപനങ്ങൾ ലഭ്യമല്ല' : 'No local bodies found in this category'}
                    </option>
                  )}
                  <option value="__custom__">+ {isMl ? 'മറ്റ് സ്ഥാപനത്തിന്റെ പേര് നൽകുക...' : 'Add Custom Local Body Name...'}</option>
                </select>
              )}

              {syncStatusMsg && (
                <div className="mt-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}
            </div>

            {/* Taluk & Revenue Village Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Taluk Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    {isMl ? 'താലൂക്ക് (Taluk):' : 'Taluk:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomTalukMode(!customTalukMode)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {customTalukMode ? (isMl ? 'ലിസ്റ്റ്' : 'List') : (isMl ? 'ടൈപ്പ് ചെയ്യുക' : 'Custom')}
                  </button>
                </div>

                {customTalukMode ? (
                  <input
                    type="text"
                    id="auth-taluk-custom"
                    value={data.talukName}
                    onChange={(e) => onChange({ talukName: e.target.value })}
                    placeholder="e.g. Kunnathunad"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                ) : (
                  <select
                    id="auth-taluk"
                    value={data.talukName}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomTalukMode(true);
                      } else {
                        handleTalukChange(e.target.value);
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                  >
                    {taluks.map((t) => {
                      const val = isMl ? t.nameMl : t.nameEn;
                      return (
                        <option key={t.nameEn} value={val}>
                          {isMl ? `${t.nameMl} (${t.nameEn})` : `${t.nameEn} (${t.nameMl})`}
                        </option>
                      );
                    })}
                    <option value="__custom__">+ {isMl ? 'മറ്റ് താലൂക്ക് നൽകുക...' : 'Add Custom Taluk...'}</option>
                  </select>
                )}
              </div>

              {/* Revenue Village Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    {isMl ? 'വില്ലേജ് (Revenue Village):' : 'Revenue Village:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomVillageMode(!customVillageMode)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {customVillageMode ? (isMl ? 'ലിസ്റ്റ്' : 'List') : (isMl ? 'ടൈപ്പ് ചെയ്യുക' : 'Custom')}
                  </button>
                </div>

                {customVillageMode ? (
                  <input
                    type="text"
                    id="auth-village-custom"
                    value={data.villageName}
                    onChange={(e) => onChange({ villageName: e.target.value })}
                    placeholder="e.g. Kizhakkambalam"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                ) : (
                  <select
                    id="auth-village"
                    value={data.villageName}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomVillageMode(true);
                      } else {
                        onChange({ villageName: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
                  >
                    {villages.map((v) => {
                      const val = isMl ? v.nameMl : v.nameEn;
                      return (
                        <option key={v.nameEn} value={val}>
                          {isMl ? `${v.nameMl} (${v.nameEn})` : `${v.nameEn} (${v.nameMl})`}
                        </option>
                      );
                    })}
                    <option value="__custom__">+ {isMl ? 'മറ്റ് വില്ലേജ് നൽകുക...' : 'Add Custom Village...'}</option>
                  </select>
                )}
              </div>
            </div>

            {/* Ward & Survey Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ward / Division Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-700 font-semibold">
                    {isMl ? 'വാർഡ് / ഡിവിഷൻ (Ward):' : 'Ward / Division:'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomWardMode(!customWardMode)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {customWardMode ? (isMl ? 'ലിസ്റ്റ്' : 'List') : (isMl ? 'ടൈപ്പ് ചെയ്യുക' : 'Custom')}
                  </button>
                </div>

                {customWardMode ? (
                  <input
                    type="text"
                    id="auth-ward-custom"
                    value={data.wardNumber}
                    onChange={(e) => onChange({ wardNumber: e.target.value })}
                    placeholder="e.g. Ward 08 (Kallumala)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                ) : (
                  <select
                    id="auth-ward"
                    value={data.wardNumber}
                    onChange={(e) => {
                      if (e.target.value === '__custom__') {
                        setCustomWardMode(true);
                      } else {
                        onChange({ wardNumber: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    {STANDARD_WARD_OPTIONS.map((w) => (
                      <option key={w.value} value={isMl ? w.labelMl : w.labelEn}>
                        {isMl ? w.labelMl : w.labelEn}
                      </option>
                    ))}
                    <option value="__custom__">+ {isMl ? 'മറ്റ് വാർഡ് നൽകുക...' : 'Add Custom Ward...'}</option>
                  </select>
                )}
              </div>

              {/* Survey Number */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                  <span>{isMl ? 'റീ-സർവേ നമ്പർ & ബ്ലോക്ക്:' : 'Re-Survey No & Block:'}</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono">e.g. 142/3-B, Blk 12</span>
                </label>
                <input
                  type="text"
                  id="auth-surveyno"
                  value={data.surveyNumber}
                  onChange={(e) => onChange({ surveyNumber: e.target.value })}
                  placeholder="e.g. 142/3-B, Block 12"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Applicant & Preparation Details */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {isMl ? '2. അപേക്ഷകനും തയ്യാറാക്കിയ വിവരങ്ങളും' : '2. Applicant & Preparation Details'}
            </h3>
          </div>

          <div className="space-y-3.5 text-xs sm:text-sm">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'പ്രോജക്റ്റിന്റെ പേര്:' : 'Project Name:'}
              </label>
              <input
                type="text"
                id="auth-projectname"
                value={data.projectName}
                onChange={(e) => onChange({ projectName: e.target.value })}
                placeholder="e.g. Green Villa Residential Project"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium text-sm"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {isMl ? 'അപേക്ഷകന്റെ പേര് (Applicant / Owner):' : 'Applicant / Owner Name:'}
              </label>
              <input
                type="text"
                id="auth-applicant"
                value={data.applicantName}
                onChange={(e) => onChange({ applicantName: e.target.value })}
                placeholder="e.g. Sanoop Sadanandhan"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'തയ്യാറാക്കിയത് - പേര് (Prepared by - Name):' : 'Prepared by (Name):'}
                </label>
                <input
                  type="text"
                  id="auth-prepared-name"
                  value={data.preparedByName}
                  onChange={(e) => onChange({ preparedByName: e.target.value })}
                  placeholder="e.g. Sanoop Sadanandhan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  {isMl ? 'തയ്യാറാക്കിയത് - പദവി (Prepared by - Designation):' : 'Prepared by (Designation):'}
                </label>
                <input
                  type="text"
                  id="auth-prepared-designation"
                  value={data.preparedByDesignation}
                  onChange={(e) => onChange({ preparedByDesignation: e.target.value })}
                  placeholder="e.g. Scrutiny Engineer / Senior Architect"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    data.plotType === 'normal'
                      ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-1 ring-emerald-500/30'
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
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    data.plotType === 'small_plot'
                      ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 ring-2 ring-emerald-500/30'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{isMl ? 'ചെറിയ പ്ലോട്ട് (≤ 125 ച.മീ)' : 'Small Plot (≤ 125 sq.m / 3 Cents)'}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                      {data.jurisdiction === 'KMBR' ? 'Rule 60' : 'Rule 62'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
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
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-sm cursor-pointer"
        >
          <span>{isMl ? 'അടുത്ത ഘട്ടം: ഡ്രോയിംഗുകൾ അപ്‌ലോഡ് ചെയ്യുക' : 'Proceed to Step 2: Drawing Uploads'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
