import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Split,
  Eye,
  EyeOff,
  Move,
  ArrowRight,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { Language, AreaStatementData, UploadedDrawing } from '../types';

interface CADRedlineVisualizerProps {
  data: AreaStatementData;
  drawings: UploadedDrawing[];
  language: Language;
  onNavigateTab: (tab: any) => void;
}

interface RedlineIssue {
  id: string;
  category: 'setback' | 'sanitation' | 'staircase' | 'access' | 'far';
  titleEn: string;
  titleMl: string;
  ruleRef: string;
  currentVal: string;
  requiredVal: string;
  severity: 'critical' | 'warning' | 'info';
  fixDescriptionEn: string;
  fixDescriptionMl: string;
  resolved: boolean;
  coords: { x: number; y: number; width: number; height: number };
  correctedCoords: { x: number; y: number; width: number; height: number };
}

export const CADRedlineVisualizer: React.FC<CADRedlineVisualizerProps> = ({
  data,
  drawings,
  language,
  onNavigateTab,
}) => {
  const isMl = language === 'ml';

  // Mode: 'split' (side by side), 'overlay' (before & after overlay), 'original', 'corrected'
  const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'original' | 'corrected'>('split');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('iss-1');
  const [isApplyingFixAll, setIsApplyingFixAll] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Layer Toggles
  const [showSetbackLines, setShowSetbackLines] = useState<boolean>(true);
  const [showSanitationOverlay, setShowSanitationOverlay] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Interactive sample / live scrutiny issues
  const [issues, setIssues] = useState<RedlineIssue[]>([
    {
      id: 'iss-1',
      category: 'setback',
      titleEn: 'Rear Setback Deficit (KMBR Rule 25)',
      titleMl: 'പിൻഭാഗത്തെ സെറ്റ്ബാക്ക് കുറവ് (ചട്ടം 25)',
      ruleRef: 'KMBR 2019 Rule 25(1) Table 4',
      currentVal: `${data.rearSetbackM || '1.10'} m`,
      requiredVal: '1.50 m (Min)',
      severity: 'critical',
      fixDescriptionEn: 'Shift rear building wall 0.40m inward into the plinth to secure 1.50m mandatory clear rear open space.',
      fixDescriptionMl: '1.50 മീറ്റർ കൃത്യമായ ഓപ്പൺ സ്പേസ് ഉറപ്പാക്കാൻ പിൻഭാഗത്തെ ഭിത്തി 0.40 മീറ്റർ ഉള്ളിലേക്ക് മാറ്റുക.',
      resolved: false,
      coords: { x: 50, y: 15, width: 200, height: 25 },
      correctedCoords: { x: 50, y: 35, width: 200, height: 25 },
    },
    {
      id: 'iss-2',
      category: 'sanitation',
      titleEn: 'Septic Tank to Open Well Distance Conflict',
      titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലക്കുറവ്',
      ruleRef: 'KMBR Rule 91 & KSPCB Norms',
      currentVal: '5.40 m',
      requiredVal: '7.50 m (Min Statutory Distance)',
      severity: 'critical',
      fixDescriptionEn: 'Relocate septic tank structure 2.10m towards the south-west corner to guarantee 7.50m buffer from open drinking well.',
      fixDescriptionMl: 'കിണറിൽ നിന്ന് 7.50 മീറ്റർ അകലം ഉറപ്പാക്കാൻ സെപ്റ്റിക് ടാങ്ക് തെക്ക്-പടിഞ്ഞാറ് മൂലയിലേക്ക് 2.10 മീറ്റർ മാറ്റി സ്ഥാപിക്കുക.',
      resolved: false,
      coords: { x: 180, y: 70, width: 45, height: 35 },
      correctedCoords: { x: 230, y: 110, width: 45, height: 35 },
    },
    {
      id: 'iss-3',
      category: 'setback',
      titleEn: 'Front Setback Alignment with Access Road',
      titleMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് വഴിവീതിയനുസരിച്ചുള്ള ക്രമീകരണം',
      ruleRef: 'KMBR 2019 Rule 25 & Rule 34',
      currentVal: `${data.frontSetbackM || '2.60'} m`,
      requiredVal: '3.00 m (Min)',
      severity: 'warning',
      fixDescriptionEn: 'Align front porch line to provide full 3.00m clearance from front street boundary line.',
      fixDescriptionMl: 'മുൻവശത്തെ അതിർത്തിയിൽ നിന്നും റോഡിൽ നിന്നും 3.00 മീറ്റർ അകലം ഉറപ്പാക്കാൻ മുൻ പോർച്ച് ലൈൻ ക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 50, y: 180, width: 200, height: 20 },
      correctedCoords: { x: 50, y: 165, width: 200, height: 20 },
    },
    {
      id: 'iss-4',
      category: 'staircase',
      titleEn: 'Staircase Riser & Tread Dimension Discrepancy',
      titleMl: 'സ്റ്റെയർകേസ് റൈസർ & ട്രെഡ്ഡ് അളവിലെ വ്യത്യാസം',
      ruleRef: 'KMBR Rule 35 & NBC 2016 Part 4',
      currentVal: 'Riser: 18.5 cm / Tread: 22 cm',
      requiredVal: 'Max Riser: 15 cm / Min Tread: 25 cm',
      severity: 'warning',
      fixDescriptionEn: 'Reconfigure flight geometry to 16 risers at 15cm each with 25cm clear tread width for safety compliance.',
      fixDescriptionMl: 'സുരക്ഷാ മാനദണ്ഡങ്ങൾ പാലിച്ച് 15cm റൈസറും 25cm ട്രെഡും ഉള്ള 16 പടികളാക്കി സ്റ്റെയർകേസ് പുനക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 110, y: 80, width: 40, height: 50 },
      correctedCoords: { x: 105, y: 75, width: 50, height: 60 },
    },
  ]);

  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  const handleResolveIssue = (id: string) => {
    setIssues((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
  };

  const handleFixAllWithAI = () => {
    setIsApplyingFixAll(true);
    setTimeout(() => {
      setIssues((prev) => prev.map((item) => ({ ...item, resolved: true })));
      setIsApplyingFixAll(false);
      setViewMode('corrected');
    }, 1200);
  };

  const handleReset = () => {
    setIssues((prev) => prev.map((item) => ({ ...item, resolved: false })));
    setViewMode('split');
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Banner: Vinyasa Drawing Review & Auto-Redline Studio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0A1022] to-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-12 -top-12 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? 'ഡ്രോയിംഗ് റിവ്യൂ & ഓട്ടോ-റെഡ്‌ലൈൻ ഫിക്‌സ് സ്റ്റുഡിയോ' : 'Drawing Review & CAD Redline Auto-Fix Studio'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMl ? 'പ്ലാനുകളിലെ അപാകതകൾ തത്സമയം കണ്ടെത്തി തിരുത്തുന്നു' : 'Automated CAD Redline Scrutiny & Statutory Rectification'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isMl
                ? 'നിങ്ങൾ നൽകിയ CAD/PDF ഡ്രോയിംഗുകളിലെ സെറ്റ്ബാക്ക് ലംഘനങ്ങൾ, കിണർ-സെപ്റ്റിക് ടാങ്ക് അകലം, സ്റ്റെയർകേസ് അളവുകൾ എന്നിവ KMBR/KPBR 2019 ചട്ടങ്ങൾ പ്രകാരം പരിശോധിച്ച്, കൃത്യമായ തിരുത്തലുകളോടെ പുതിയ ബ്ലൂപ്രിന്റ് നിർദ്ദേശിക്കുന്നു.'
                : 'Scans DWG, DXF & PDF blueprints for KMBR/KPBR code violations. Automatically plots visual redline overlays with exact coordinate offsets to achieve 100% defect-free LSGD permit compliance.'}
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={handleFixAllWithAI}
              disabled={isApplyingFixAll}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isApplyingFixAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'തിരുത്തലുകൾ വരുത്തുന്നു...' : 'Rectifying CAD Overlays...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isMl ? 'AI ഓട്ടോ-ഫിക്‌സ് & അലൈൻമെന്റ്' : 'Auto-Fix All Redlines'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isMl ? 'റീസെറ്റ്' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid: Left Visualizer Canvas, Right Issues Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visualizer Interactive Canvas (7 cols on desktop) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Canvas Controls Header */}
          <div className="p-3.5 sm:p-4 bg-[#080E1A] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'split' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Split className="w-3.5 h-3.5 inline mr-1" />
                {isMl ? 'സൈഡ്-ബൈ-സൈഡ്' : 'Side-by-Side'}
              </button>

              <button
                onClick={() => setViewMode('overlay')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'overlay' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                {isMl ? 'ഓവർലേ (Overlay)' : 'Redline Overlay'}
              </button>

              <button
                onClick={() => setViewMode('corrected')}
                className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'corrected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                {isMl ? 'തിരുത്തിയ പ്ലാൻ' : 'Corrected CAD'}
              </button>
            </div>

            {/* Layer Filter Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSetbackLines(!showSetbackLines)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  showSetbackLines
                    ? 'bg-cyan-950/70 border-cyan-600/60 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle Setback Boundary Guidelines"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMl ? 'സെറ്റ്ബാക്കുകൾ' : 'Setbacks'}</span>
              </button>

              <button
                onClick={() => setShowSanitationOverlay(!showSanitationOverlay)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  showSanitationOverlay
                    ? 'bg-cyan-950/70 border-cyan-600/60 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle Well & Septic Sanitation Buffer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMl ? 'കിണർ & ടാങ്ക്' : 'Sanitation'}</span>
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 20, 160))}
                className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 20, 80))}
                className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Blueprint Canvas */}
          <div className="relative p-6 bg-[#040812] flex-1 flex items-center justify-center min-h-[380px] overflow-hidden">
            {/* Blueprint Grid pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(rgba(0, 229, 255, 0.15) 1px, transparent 0), linear-gradient(to right, rgba(0, 229, 255, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 229, 255, 0.08) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            {/* SVG Visual Blueprint Engine */}
            <div
              className="relative transition-transform duration-300 w-full max-w-[540px] aspect-[4/3] bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 shadow-inner"
              style={{ transform: `scale(${zoomLevel / 100})` }}
            >
              <svg viewBox="0 0 300 220" className="w-full h-full">
                {/* Plot Boundary */}
                <rect
                  x="20"
                  y="10"
                  width="260"
                  height="200"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <text x="25" y="24" fill="#64748B" fontSize="7" fontFamily="monospace">
                  PLOT BOUNDARY ({data.plotAreaCents || 5} Cents)
                </text>

                {/* Road Frontage */}
                <rect x="20" y="200" width="260" height="15" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                <text x="110" y="210" fill="#94A3B8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                  ROAD ({data.roadAccessWidthM || 5.0}m Access)
                </text>

                {/* Building Footprint (Original Defective in Red/Amber) */}
                <g opacity={viewMode === 'corrected' ? 0.2 : 1}>
                  <rect
                    x="50"
                    y="15"
                    width="200"
                    height="165"
                    fill="rgba(239, 68, 68, 0.08)"
                    stroke="#EF4444"
                    strokeWidth="1.8"
                  />
                  <text x="55" y="32" fill="#EF4444" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
                    BUILDING (Plinth: {data.groundCoverageSqM || 120} m²)
                  </text>
                </g>

                {/* Corrected AI Footprint (Green) */}
                {(viewMode === 'split' || viewMode === 'overlay' || viewMode === 'corrected') && (
                  <g>
                    <rect
                      x="50"
                      y="35"
                      width="200"
                      height="130"
                      fill="rgba(16, 185, 129, 0.12)"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeDasharray={viewMode === 'overlay' ? '4 2' : 'none'}
                    />
                    <text x="55" y="50" fill="#10B981" fontSize="7.5" fontWeight="bold" fontFamily="sans-serif">
                      ✓ AI RECTIFIED KMBR PLINTH
                    </text>
                  </g>
                )}

                {/* Setback Guideline Markers */}
                {showSetbackLines && (
                  <>
                    {/* Rear Setback Line */}
                    <line x1="20" y1="35" x2="280" y2="35" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="210" y="30" fill="#10B981" fontSize="6" fontFamily="monospace">
                      1.50m KMBR Rear Line
                    </text>

                    {/* Front Setback Line */}
                    <line x1="20" y1="165" x2="280" y2="165" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="205" y="173" fill="#10B981" fontSize="6" fontFamily="monospace">
                      3.00m Front Setback Line
                    </text>
                  </>
                )}

                {/* Sanitation Markers (Open Well & Septic Tank) */}
                {showSanitationOverlay && (
                  <>
                    {/* Open Well in North-East */}
                    <circle cx="240" cy="45" r="10" fill="#0284C7" stroke="#38BDF8" strokeWidth="1.5" />
                    <text x="228" y="47" fill="#FFFFFF" fontSize="5.5" fontWeight="bold">
                      WELL
                    </text>

                    {/* Original Septic Tank (Too close - 5.4m) */}
                    <g opacity={viewMode === 'corrected' ? 0.15 : 1}>
                      <rect x="180" y="70" width="22" height="16" fill="#DC2626" stroke="#F87171" strokeWidth="1" />
                      <text x="182" y="80" fill="#FFFFFF" fontSize="4.5">
                        SEPTIC
                      </text>
                      {/* Distance Radius Line */}
                      <line x1="240" y1="45" x2="190" y2="75" stroke="#EF4444" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="205" y="60" fill="#EF4444" fontSize="5.5" fontWeight="bold">
                        5.4m (Violation)
                      </text>
                    </g>

                    {/* Corrected Septic Tank (Safe 7.5m+) */}
                    {(viewMode === 'split' || viewMode === 'overlay' || viewMode === 'corrected') && (
                      <g>
                        <rect
                          x="70"
                          y="150"
                          width="24"
                          height="16"
                          fill="#059669"
                          stroke="#34D399"
                          strokeWidth="1.5"
                        />
                        <text x="73" y="160" fill="#FFFFFF" fontSize="5" fontWeight="bold">
                          ✓ SEPTIC
                        </text>
                        {/* Safe distance Line */}
                        <line x1="240" y1="45" x2="80" y2="155" stroke="#10B981" strokeWidth="1" strokeDasharray="3 2" />
                        <text x="145" y="105" fill="#10B981" fontSize="6" fontWeight="bold">
                          ✓ 11.2m Safe Buffer
                        </text>
                      </g>
                    )}
                  </>
                )}

                {/* Staircase Flight */}
                <g transform="translate(100, 70)">
                  <rect x="0" y="0" width="30" height="40" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
                  <line x1="0" y1="10" x2="30" y2="10" stroke="#475569" strokeWidth="0.8" />
                  <line x1="0" y1="20" x2="30" y2="20" stroke="#475569" strokeWidth="0.8" />
                  <line x1="0" y1="30" x2="30" y2="30" stroke="#475569" strokeWidth="0.8" />
                  <text x="4" y="24" fill="#94A3B8" fontSize="5.5">
                    STAIR
                  </text>
                </g>

                {/* Active Selection Glow Ring */}
                <rect
                  x={activeIssue.resolved ? activeIssue.correctedCoords.x : activeIssue.coords.x}
                  y={activeIssue.resolved ? activeIssue.correctedCoords.y : activeIssue.coords.y}
                  width={activeIssue.coords.width}
                  height={activeIssue.coords.height}
                  fill="none"
                  stroke={activeIssue.resolved ? '#10B981' : '#00F0FF'}
                  strokeWidth="1.5"
                  className="animate-pulse"
                />
              </svg>
            </div>
          </div>

          {/* Bottom Canvas Status Bar */}
          <div className="p-3 bg-[#080E1A] border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>
                {isMl
                  ? `പരിശോധിച്ച ഡ്രോയിംഗുകൾ: ${drawings.length > 0 ? drawings.length : 1} ഫയൽ`
                  : `Active Scrutiny: ${drawings.length > 0 ? drawings.length : 1} Plan Layer`}
              </span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className="text-red-400 font-semibold">
                ● {issues.filter((i) => !i.resolved).length} {isMl ? 'അപാകതകൾ' : 'Redlines Pending'}
              </span>
              <span className="text-emerald-400 font-semibold">
                ● {issues.filter((i) => i.resolved).length} {isMl ? 'തിരുത്തിയത്' : 'Rectified'}
              </span>
            </div>
          </div>
        </div>

        {/* Issues List & Remedy Inspector (5 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4 flex flex-col">
          {/* Header Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isMl ? 'കണ്ടെത്തിയ തിരുത്തലുകൾ' : 'Detected Redline Violations'}
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-600/60 text-cyan-300 text-xs font-bold">
                {issues.length} Items
              </span>
            </div>

            <p className="text-xs text-slate-400">
              {isMl
                ? 'താഴെയുള്ള ഓരോ ഇനത്തിലും ക്ലിക്ക് ചെയ്ത് തിരുത്തൽ നിർദ്ദേശങ്ങൾ പരിശോധിക്കുക.'
                : 'Select an issue to inspect code citations, dimensional conflicts, and AI auto-correction offsets.'}
            </p>
          </div>

          {/* Issue Cards Stack */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedIssueId === issue.id
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : issue.resolved
                    ? 'bg-slate-900/50 border-emerald-700/40 opacity-75'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {issue.resolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="text-xs font-bold text-white">
                        {isMl ? issue.titleMl : issue.titleEn}
                      </span>
                    </div>

                    <div className="text-[11px] text-cyan-400 font-mono">
                      {issue.ruleRef}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResolveIssue(issue.id);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer shrink-0 ${
                      issue.resolved
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {issue.resolved ? (isMl ? 'പരിഹരിച്ചു ✓' : 'Fixed ✓') : (isMl ? 'ഓട്ടോ-ഫിക്‌സ്' : 'Auto-Fix')}
                  </button>
                </div>

                {/* Expand active card details */}
                {selectedIssueId === issue.id && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="bg-slate-950 p-2 rounded border border-red-900/40 text-red-300">
                        <span className="text-[9px] text-slate-400 uppercase block">{isMl ? 'നിലവിലുള്ളത്' : 'Current'}</span>
                        {issue.currentVal}
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-emerald-900/40 text-emerald-300">
                        <span className="text-[9px] text-slate-400 uppercase block">{isMl ? 'ആവശ്യമുള്ളത്' : 'Required'}</span>
                        {issue.requiredVal}
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 text-slate-300 leading-relaxed text-[11px]">
                      <span className="font-bold text-cyan-400 mr-1">{isMl ? 'തിരുത്തൽ നിർദ്ദേശം:' : 'AI Remedy:'}</span>
                      {isMl ? issue.fixDescriptionMl : issue.fixDescriptionEn}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick Navigate to Full Scrutiny Report */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs text-slate-300 font-semibold">
              {isMl ? 'പൂർണ്ണമായ ഡിഫെക്ട്-ഫ്രീ K-Smart റിപ്പോർട്ട് തയ്യാറാണ്' : 'Ready to export certified LSGD compliance schedule?'}
            </div>
            <button
              onClick={() => onNavigateTab('report')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/50 text-cyan-300 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>{isMl ? '5. പെർമിറ്റ് റിപ്പോർട്ട് കാണുക' : 'Generate Permit Report'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
