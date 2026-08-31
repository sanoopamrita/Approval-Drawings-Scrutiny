import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Building,
  Layers,
  Sparkles,
  Download,
  IndianRupee,
  PieChart,
  HardHat,
  Hammer,
  Truck,
  Paintbrush,
  Zap,
  Droplets,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Info,
} from 'lucide-react';
import { AreaStatementData, Language } from '../types';

interface BoqEstimatorProps {
  data: AreaStatementData;
  language: Language;
}

interface MaterialItem {
  id: string;
  categoryEn: string;
  categoryMl: string;
  nameEn: string;
  nameMl: string;
  unit: string;
  quantity: number;
  unitRate: number;
  totalCost: number;
  icon: any;
}

export const BoqEstimator: React.FC<BoqEstimatorProps> = ({ data, language }) => {
  const isMl = language === 'ml';

  // State for customization
  const [constructionQuality, setConstructionQuality] = useState<'standard' | 'premium' | 'luxury'>('standard');
  const [customSqFtRate, setCustomSqFtRate] = useState<number>(0);
  const [foundationType, setFoundationType] = useState<'rubble' | 'pile' | 'raft'>('rubble');
  const [masonryType, setMasonryType] = useState<'red_brick' | 'solid_block' | 'aac_block'>('solid_block');

  // Total built-up area in Sq.Ft (1 Sq.M = 10.7639 Sq.Ft)
  const totalBuiltUpSqM = data.totalBuiltUpAreaSqM || 150; // Fallback to 150 sq.m if 0
  const totalBuiltUpSqFt = Math.round(totalBuiltUpSqM * 10.7639);

  // Base rate per sq.ft based on quality in Kerala (2026 market rates)
  const defaultRatePerSqFt = useMemo(() => {
    switch (constructionQuality) {
      case 'standard':
        return 2200; // ₹2,200 / sq.ft standard residential Kerala
      case 'premium':
        return 2750; // ₹2,750 / sq.ft
      case 'luxury':
        return 3500; // ₹3,500 / sq.ft
    }
  }, [constructionQuality]);

  const activeRatePerSqFt = customSqFtRate > 0 ? customSqFtRate : defaultRatePerSqFt;
  const estimatedProjectTotal = Math.round(totalBuiltUpSqFt * activeRatePerSqFt);

  // Calculate material breakdown based on Kerala CPWD/PWD standard ratios
  const materials: MaterialItem[] = useMemo(() => {
    // Standard Kerala residential empirical ratios:
    // Cement: ~0.4 bags per sq.ft
    const cementBags = Math.round(totalBuiltUpSqFt * 0.42);
    const cementRate = constructionQuality === 'luxury' ? 440 : 410;

    // Steel (TMT Fe 550D): ~3.5 to 4 kg per sq.ft
    const steelKg = Math.round(totalBuiltUpSqFt * 3.8);
    const steelRate = 72; // ₹72/kg

    // Coarse Sand / M-Sand: ~1.8 cu.ft per sq.ft
    const sandCuFt = Math.round(totalBuiltUpSqFt * 1.8);
    const sandRate = 58; // ₹58/cu.ft

    // 20mm Granite Metal / Aggregate: ~1.4 cu.ft per sq.ft
    const aggregateCuFt = Math.round(totalBuiltUpSqFt * 1.35);
    const aggregateRate = 52; // ₹52/cu.ft

    // Masonry Blocks / Bricks: ~1.2 blocks per sq.ft or 8 red bricks per sq.ft
    const blockCount = masonryType === 'red_brick' ? Math.round(totalBuiltUpSqFt * 8.5) : Math.round(totalBuiltUpSqFt * 1.3);
    const blockRate = masonryType === 'red_brick' ? 14 : 75;

    // Flooring & Wall Tiles: 1.1x sq.ft
    const tileSqFt = Math.round(totalBuiltUpSqFt * 1.15);
    const tileRate = constructionQuality === 'luxury' ? 140 : constructionQuality === 'premium' ? 95 : 65;

    // Paint & Putty: 3.5x surface area
    const paintSqFt = Math.round(totalBuiltUpSqFt * 3.2);
    const paintRate = constructionQuality === 'luxury' ? 38 : 26;

    // Electrical & Plumbing Points & Fixtures
    const electricalCost = Math.round(estimatedProjectTotal * 0.08); // 8% of total
    const plumbingCost = Math.round(estimatedProjectTotal * 0.07); // 7% of total
    const doorsWindowsCost = Math.round(estimatedProjectTotal * 0.12); // 12% for teak/mahogany/UPVC
    const laborCost = Math.round(estimatedProjectTotal * 0.28); // 28% direct skilled labor in Kerala

    return [
      {
        id: 'mat-cement',
        categoryEn: 'Structural / Concrete',
        categoryMl: 'സ്ട്രക്ചറൽ / കോൺക്രീറ്റ്',
        nameEn: 'OPC / PPC 53 Grade Cement',
        nameMl: 'സിമന്റ് (OPC / PPC 53 ഗ്രേഡ്)',
        unit: isMl ? 'ചാക്ക് (Bags)' : 'Bags',
        quantity: cementBags,
        unitRate: cementRate,
        totalCost: cementBags * cementRate,
        icon: HardHat,
      },
      {
        id: 'mat-steel',
        categoryEn: 'Structural / Reinforcement',
        categoryMl: 'സ്ട്രക്ചറൽ / റീഇൻഫോഴ്‌സ്‌മെന്റ്',
        nameEn: 'TMT Steel Fe 550D Bars',
        nameMl: 'TMT സ്റ്റീൽ കമ്പി (Fe 550D)',
        unit: isMl ? 'കിലോഗ്രാം (Kg)' : 'Kg',
        quantity: steelKg,
        unitRate: steelRate,
        totalCost: steelKg * steelRate,
        icon: Hammer,
      },
      {
        id: 'mat-sand',
        categoryEn: 'Aggregates',
        categoryMl: 'അഗ്രഗേറ്റുകൾ',
        nameEn: 'Manufactured M-Sand (Concrete & Plastering)',
        nameMl: 'എം-സാൻഡ് (വാർപ്പ് & പ്ലാസ്റ്ററിംഗ്)',
        unit: isMl ? 'ക്യു.ഫിറ്റ് (Cu.Ft)' : 'Cu.Ft',
        quantity: sandCuFt,
        unitRate: sandRate,
        totalCost: sandCuFt * sandRate,
        icon: Truck,
      },
      {
        id: 'mat-aggregate',
        categoryEn: 'Aggregates',
        categoryMl: 'അഗ്രഗേറ്റുകൾ',
        nameEn: '20mm & 12mm Granite Metal',
        nameMl: '20mm / 12mm ഗ്രാനൈറ്റ് മെറ്റൽ',
        unit: isMl ? 'ക്യു.ഫിറ്റ് (Cu.Ft)' : 'Cu.Ft',
        quantity: aggregateCuFt,
        unitRate: aggregateRate,
        totalCost: aggregateCuFt * aggregateRate,
        icon: Layers,
      },
      {
        id: 'mat-blocks',
        categoryEn: 'Masonry Work',
        categoryMl: 'കട്ടകെട്ട് നിർമ്മാണം',
        nameEn: masonryType === 'red_brick' ? 'Wirecut Red Bricks' : '6" Solid Concrete Blocks',
        nameMl: masonryType === 'red_brick' ? 'ചെങ്കല്ല് / വയർകട്ട് ചുവപ്പ് ഇഷ്ടിക' : '6" സോളിഡ് കോൺക്രീറ്റ് ബ്ലോക്കുകൾ',
        unit: isMl ? 'എണ്ണം (Nos)' : 'Nos',
        quantity: blockCount,
        unitRate: blockRate,
        totalCost: blockCount * blockRate,
        icon: Building,
      },
      {
        id: 'mat-tiles',
        categoryEn: 'Finishing & Flooring',
        categoryMl: 'ഫിനിഷിംഗ് & ഫ്ലോറിംഗ്',
        nameEn: 'Vitrified Flooring & Bathroom Wall Tiles',
        nameMl: 'വിട്രിഫൈഡ് ഫ്ലോർ ടൈലുകൾ & ബാത്ത്റൂം ടൈലുകൾ',
        unit: isMl ? 'ച.അടി (Sq.Ft)' : 'Sq.Ft',
        quantity: tileSqFt,
        unitRate: tileRate,
        totalCost: tileSqFt * tileRate,
        icon: Layers,
      },
      {
        id: 'mat-paint',
        categoryEn: 'Painting & Polishing',
        categoryMl: 'പെയിന്റിംഗ് & പോളിഷിംഗ്',
        nameEn: 'Interior / Exterior Emulsion & Wall Putty',
        nameMl: 'ഇന്റീരിയർ/എക്സ്റ്റീരിയർ എമൽഷൻ & പുട്ടി',
        unit: isMl ? 'ച.അടി (Sq.Ft)' : 'Sq.Ft',
        quantity: paintSqFt,
        unitRate: paintRate,
        totalCost: paintSqFt * paintRate,
        icon: Paintbrush,
      },
      {
        id: 'mat-electrical',
        categoryEn: 'Electrical MEP',
        categoryMl: 'ഇലക്ട്രിക്കൽ വയറിംഗ്',
        nameEn: 'FR Conduits, Copper Wires, DB & Modular Switches',
        nameMl: 'വയറിംഗ് പൈപ്പ്, വയറുകൾ, മോഡുലാർ സ്വിച്ചുകൾ & DB',
        unit: isMl ? 'ലംപ്‌സം (LS)' : 'LS',
        quantity: 1,
        unitRate: electricalCost,
        totalCost: electricalCost,
        icon: Zap,
      },
      {
        id: 'mat-plumbing',
        categoryEn: 'Plumbing & Sanitary',
        categoryMl: 'പ്ലംബിംഗ് & സാനിറ്ററി',
        nameEn: 'CPVC/PVC Pipes, Water Tank, CP & Sanitaryware',
        nameMl: 'പൈപ്പുകൾ, ഓവർഹെഡ് ടാങ്ക്, ക്ലോസറ്റുകൾ & ടാപ്പുകൾ',
        unit: isMl ? 'ലംപ്‌സം (LS)' : 'LS',
        quantity: 1,
        unitRate: plumbingCost,
        totalCost: plumbingCost,
        icon: Droplets,
      },
      {
        id: 'mat-woodwork',
        categoryEn: 'Doors & Windows',
        categoryMl: 'വാതിലുകളും ജനലുകളും',
        nameEn: 'Front Teak Door, Hardwood Frames & UPVC Windows',
        nameMl: 'തേക്ക് മുൻവാതിൽ, ഹാർഡ്‌വുഡ് ഫ്രെയിം & UPVC ജനലുകൾ',
        unit: isMl ? 'ലംപ്‌സം (LS)' : 'LS',
        quantity: 1,
        unitRate: doorsWindowsCost,
        totalCost: doorsWindowsCost,
        icon: Building,
      },
      {
        id: 'mat-labor',
        categoryEn: 'Kerala Skilled Labor',
        categoryMl: 'തൊഴിലാളി കൂലി (കേരള വേതന നിരക്ക്)',
        nameEn: 'Masonry, Barbending, Carpentry & Concreting Wages',
        nameMl: 'മേസ്തിരി, കമ്പികെട്ട്, കോൺക്രീറ്റിംഗ് തൊഴിലാളി കൂലി',
        unit: isMl ? 'ലംപ്‌സം (LS)' : 'LS',
        quantity: 1,
        unitRate: laborCost,
        totalCost: laborCost,
        icon: HardHat,
      },
    ];
  }, [totalBuiltUpSqFt, constructionQuality, masonryType, estimatedProjectTotal, isMl]);

  const totalCalculatedMaterials = materials.reduce((acc, m) => acc + m.totalCost, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrintBOQ = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn text-left">
      {/* Top Banner Card: Vinyasa AI Co-Worker BOQ Estimator */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B132B] to-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? 'സ്മാർട്ട് BOQ & കേരള PWD കോസ്റ്റ് എസ്റ്റിമേറ്റർ' : 'Smart BOQ & Kerala PWD Cost Estimator'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMl ? 'കെട്ടിട നിർമ്മാണ എസ്റ്റിമേഷൻ & ബിൽ ഓഫ് ക്വാണ്ടിറ്റി' : 'Architectural Bill of Quantities & Material Estimation'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isMl
                ? 'നിങ്ങളുടെ പ്ലാൻ ഏരിയ സ്റ്റേറ്റ്‌മെന്റിലെ വിസ്തീർണ്ണമനുസരിച്ച് (Built-up Area) സിമന്റ്, കമ്പി, എം-സാൻഡ്, കട്ടകെട്ട്, തൊഴിലാളി കൂലി തുടങ്ങിയ മുഴുവൻ നിർമ്മാണ ചെലവുകളും കേരള വിപണി നിരക്കിൽ തത്സമയം കണക്കാക്കുന്നു.'
                : 'Instantly computes cement bags, TMT steel tonnage, M-Sand, bricks, flooring, finishes, and skilled labor wages based on standard Kerala PWD empirical norms.'}
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="bg-slate-950/80 border border-cyan-500/40 rounded-xl p-4 sm:p-5 text-right shrink-0 shadow-inner flex flex-col justify-center">
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              {isMl ? 'ആകെ നിർമ്മാണ വിസ്തീർണ്ണം' : 'Total Built-up Area'}
            </div>
            <div className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono mt-0.5">
              {totalBuiltUpSqFt.toLocaleString()} <span className="text-sm font-normal text-slate-400">Sq.Ft</span>
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-1">
              ≈ {totalBuiltUpSqM.toFixed(2)} Sq.M ({data.plotAreaCents ? `${data.plotAreaCents} Cents Plot` : ''})
            </div>
          </div>
        </div>
      </div>

      {/* Control & Customization Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Specification Quality */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
            {isMl ? 'നിർമ്മാണ നിലവാരം (Quality)' : 'Construction Standard'}
          </label>
          <select
            value={constructionQuality}
            onChange={(e) => setConstructionQuality(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
          >
            <option value="standard">{isMl ? 'സ്റ്റാൻഡേർഡ് (₹2,200 / Sq.Ft)' : 'Standard (₹2,200 / Sq.Ft)'}</option>
            <option value="premium">{isMl ? 'പ്രീമിയം (₹2,750 / Sq.Ft)' : 'Premium (₹2,750 / Sq.Ft)'}</option>
            <option value="luxury">{isMl ? 'ലക്ഷ്വറി (₹3,500 / Sq.Ft)' : 'Luxury (₹3,500 / Sq.Ft)'}</option>
          </select>
        </div>

        {/* Foundation Type */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
            {isMl ? 'ഫൗണ്ടേഷൻ രീതി (Foundation)' : 'Foundation Type'}
          </label>
          <select
            value={foundationType}
            onChange={(e) => setFoundationType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
          >
            <option value="rubble">{isMl ? 'കരിങ്കൽ ഫൗണ്ടേഷൻ (RR Masonry)' : 'RR Masonry (Standard Kerala)'}</option>
            <option value="pile">{isMl ? 'പൈൽ ഫൗണ്ടേഷൻ (DMR / Coastal)' : 'DMC Pile Foundation'}</option>
            <option value="raft">{isMl ? 'റാഫ്റ്റ് ഫൗണ്ടേഷൻ (Raft Slab)' : 'Raft Foundation'}</option>
          </select>
        </div>

        {/* Masonry Block Type */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
            {isMl ? 'ചുമര് നിർമ്മാണം (Wall Masonry)' : 'Wall Masonry'}
          </label>
          <select
            value={masonryType}
            onChange={(e) => setMasonryType(e.target.value as any)}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-semibold"
          >
            <option value="solid_block">{isMl ? 'സോളിഡ് കോൺക്രീറ്റ് ബ്ലോക്കുകൾ' : 'Solid Concrete Blocks (6")'}</option>
            <option value="red_brick">{isMl ? 'ചെങ്കല്ല് / വയർകട്ട് ചുവപ്പ് ഇഷ്ടിക' : 'Red Wirecut Bricks'}</option>
            <option value="aac_block">{isMl ? 'ലൈറ്റ്‌വെയ്റ്റ് AAC ബ്ലോക്കുകൾ' : 'Lightweight AAC Blocks'}</option>
          </select>
        </div>

        {/* Custom Sq.Ft Rate Override */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-2">
          <label className="text-xs font-bold text-slate-200 block uppercase tracking-wider">
            {isMl ? 'കസ്റ്റം ച.അടി നിരക്ക് (₹ / Sq.Ft)' : 'Custom Rate / Sq.Ft (₹)'}
          </label>
          <input
            type="number"
            value={customSqFtRate || ''}
            onChange={(e) => setCustomSqFtRate(Number(e.target.value))}
            placeholder={`Default: ₹${defaultRatePerSqFt}`}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-lg p-2.5 focus:border-cyan-500 focus:outline-none font-mono"
          />
        </div>
      </div>

      {/* Primary Highlights Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Cost Estimate Card */}
        <div className="bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/40 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
              {isMl ? 'ആകെ കണക്കാക്കിയ നിർമ്മാണ തുക' : 'Total Estimated Project Cost'}
            </span>
            <IndianRupee className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono mt-3">
            {formatCurrency(estimatedProjectTotal)}
          </div>
          <div className="text-xs text-slate-300 mt-2 flex items-center gap-1.5 font-medium">
            <span>{isMl ? 'ശരാശരി ച.അടി നിരക്ക്:' : 'Effective Sq.Ft Rate:'}</span>
            <span className="font-bold text-cyan-300 font-mono">₹{activeRatePerSqFt} / Sq.Ft</span>
          </div>
        </div>

        {/* Structural Materials Cost */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              {isMl ? 'മെറ്റീരിയൽ ആകെ തുക' : 'Total Material Cost'}
            </span>
            <Layers className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono mt-3">
            {formatCurrency(totalCalculatedMaterials - Math.round(estimatedProjectTotal * 0.28))}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            {isMl ? 'സിമന്റ്, സ്റ്റീൽ, എം-സാൻഡ്, ടൈൽസ്, പെയിന്റ്, പൈപ്പുകൾ' : 'Cement, Steel, Aggregates, Tiles, Paints, Wood & Fittings'}
          </div>
        </div>

        {/* Labor Wage Total */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-slate-300 tracking-wider">
              {isMl ? 'കേരള തൊഴിലാളി വേതനം (Labor)' : 'Skilled Labor Wages'}
            </span>
            <HardHat className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono mt-3">
            {formatCurrency(Math.round(estimatedProjectTotal * 0.28))}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-medium">
            {isMl ? 'മേസ്തിരി, ആശാരി, കമ്പിപ്പണി തൊഴിലാളികളുടെ വേതനം (~28%)' : 'Masonry, bar bending, plastering & carpenter wages (~28%)'}
          </div>
        </div>
      </div>

      {/* Detailed Material-wise BOQ Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#080E1C]">
          <div className="flex items-center gap-2.5">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              {isMl ? 'സാമഗ്രികളുടെ കൃത്യമായ അളവും തുകയും (Material BOQ Schedule)' : 'Comprehensive Material & Labor Schedule (BOQ)'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintBOQ}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isMl ? 'പ്രിന്റ് / PDF' : 'Print / Export'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4 font-bold">#</th>
                <th className="py-3 px-4 font-bold">{isMl ? 'വിഭാഗം' : 'Category'}</th>
                <th className="py-3 px-4 font-bold">{isMl ? 'നിർമ്മാണ സാമഗ്രി / സേവനം' : 'Material / Work Item'}</th>
                <th className="py-3 px-4 font-bold text-right">{isMl ? 'അളവ് (Qty)' : 'Estimated Quantity'}</th>
                <th className="py-3 px-4 font-bold text-right">{isMl ? 'യൂണിറ്റ് നിരക്ക് (Rate)' : 'Unit Rate (₹)'}</th>
                <th className="py-3 px-4 font-bold text-right">{isMl ? 'ആകെ തുക (Amount)' : 'Total Cost (₹)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium text-slate-200">
              {materials.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <tr key={m.id} className="hover:bg-cyan-950/20 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 text-cyan-400/90 font-semibold">
                      {isMl ? m.categoryMl : m.categoryEn}
                    </td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-semibold text-white">{isMl ? m.nameMl : m.nameEn}</span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-100">
                      {m.quantity.toLocaleString()} {m.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {m.unitRate.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-cyan-300">
                      {formatCurrency(m.totalCost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-slate-950 font-bold border-t-2 border-slate-700 text-sm">
                <td colSpan={5} className="py-3.5 px-4 text-right text-slate-200">
                  {isMl ? 'ആകെ നിർമ്മാണ തുക (Total Project Estimation):' : 'Grand Total Estimated Cost:'}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-cyan-400 text-base">
                  {formatCurrency(estimatedProjectTotal)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Statutory Guidance Note */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold text-slate-300">
            {isMl ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ & PWD റഫറൻസ് നോട്ടുകൾ:' : 'Kerala PWD & Engineering Reference Standard:'}
          </div>
          <p className="leading-relaxed">
            {isMl
              ? 'ഈ എസ്റ്റിമേഷൻ കണക്കാക്കിയിരിക്കുന്നത് നിലവിലെ കേരള നിർമ്മാണ വിപണി നിരക്കുകൾ (DSR/CPWD empirical standards) അടിസ്ഥാനമാക്കിയാണ്. സൈറ്റ് ലൊക്കേഷൻ (തീരദേശം, മലയോരം), മണ്ണ് ഘടന, ഡിസൈൻ സവിശേഷതകൾ എന്നിവയനുസരിച്ച് യഥാർത്ഥ ചെലവിൽ മാറ്റങ്ങൾ വരാം.'
              : 'Estimations are calculated based on prevailing Kerala market material rates and CPWD empirical guidelines. Actual project expenses may vary based on terrain conditions, pile foundation requirements, and architectural customizations.'}
          </p>
        </div>
      </div>
    </div>
  );
};
