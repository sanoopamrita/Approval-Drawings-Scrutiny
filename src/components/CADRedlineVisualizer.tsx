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
  FileSpreadsheet,
  FileText,
  Check,
  X,
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
  category: 'setback' | 'sanitation' | 'staircase' | 'access' | 'far' | 'coverage';
  titleEn: string;
  titleMl: string;
  ruleRef: string;
  currentVal: string;
  requiredVal: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'fail' | 'pass' | 'warning';
  fixDescriptionEn: string;
  fixDescriptionMl: string;
  resolved: boolean;
  coords: { x: number; y: number; width: number; height: number; label: string };
  correctedCoords: { x: number; y: number; width: number; height: number; label: string };
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
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
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
      status: 'fail',
      fixDescriptionEn: 'Shift rear building wall 0.40m inward into the plinth to secure 1.50m mandatory clear rear open space.',
      fixDescriptionMl: '1.50 മീറ്റർ കൃത്യമായ ഓപ്പൺ സ്പേസ് ഉറപ്പാക്കാൻ പിൻഭാഗത്തെ ഭിത്തി 0.40 മീറ്റർ ഉള്ളിലേക്ക് മാറ്റുക.',
      resolved: false,
      coords: { x: 50, y: 15, width: 200, height: 20, label: 'DEFICIT 1.10m [REQ: 1.50m]' },
      correctedCoords: { x: 50, y: 35, width: 200, height: 20, label: 'COMPLIANT 1.50m ✓' },
    },
    {
      id: 'iss-2',
      category: 'sanitation',
      titleEn: 'Septic Tank to Open Well Clearance Conflict',
      titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലക്കുറവ്',
      ruleRef: 'KMBR Rule 91 & KSPCB Norms',
      currentVal: '5.40 m',
      requiredVal: '7.50 m (Min Statutory Distance)',
      severity: 'critical',
      status: 'fail',
      fixDescriptionEn: 'Relocate septic tank structure 2.10m towards the south-west corner to guarantee 7.50m buffer from open drinking well.',
      fixDescriptionMl: 'കിണറിൽ നിന്ന് 7.50 മീറ്റർ അകലം ഉറപ്പാക്കാൻ സെപ്റ്റിക് ടാങ്ക് തെക്ക്-പടിഞ്ഞാറ് മൂലയിലേക്ക് 2.10 മീറ്റർ മാറ്റി സ്ഥാപിക്കുക.',
      resolved: false,
      coords: { x: 175, y: 65, width: 32, height: 25, label: 'CLASH: 5.40m (<7.5m)' },
      correctedCoords: { x: 65, y: 145, width: 34, height: 24, label: 'SAFE BUFFER: 11.2m ✓' },
    },
    {
      id: 'iss-3',
      category: 'setback',
      titleEn: 'Front Setback Clearance with Access Road',
      titleMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് വഴിവീതിയനുസരിച്ചുള്ള ക്രമീകരണം',
      ruleRef: 'KMBR 2019 Rule 25 & Rule 34',
      currentVal: `${data.frontSetbackM || '2.60'} m`,
      requiredVal: '3.00 m (Min)',
      severity: 'warning',
      status: 'fail',
      fixDescriptionEn: 'Align front porch line to provide full 3.00m clearance from front street boundary line.',
      fixDescriptionMl: 'മുൻവശത്തെ അതിർത്തിയിൽ നിന്നും റോഡിൽ നിന്നും 3.00 മീറ്റർ അകലം ഉറപ്പാക്കാൻ മുൻ പോർച്ച് ലൈൻ ക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 50, y: 175, width: 200, height: 25, label: 'FRONT: 2.60m [REQ: 3.00m]' },
      correctedCoords: { x: 50, y: 165, width: 200, height: 25, label: 'FRONT: 3.00m COMPLIANT ✓' },
    },
    {
      id: 'iss-4',
      category: 'staircase',
      titleEn: 'Staircase Riser & Tread Flight Dimension',
      titleMl: 'സ്റ്റെയർകേസ് റൈസർ & ട്രെഡ്ഡ് അളവിലെ വ്യത്യാസം',
      ruleRef: 'KMBR Rule 35 & NBC 2016 Part 4',
      currentVal: 'Riser: 18.5 cm / Tread: 22 cm',
      requiredVal: 'Max Riser: 15 cm / Min Tread: 25 cm',
      severity: 'warning',
      status: 'warning',
      fixDescriptionEn: 'Reconfigure flight geometry to 16 risers at 15cm each with 25cm clear tread width for safety compliance.',
      fixDescriptionMl: 'സുരക്ഷാ മാനദണ്ഡങ്ങൾ പാലിച്ച് 15cm റൈസറും 25cm ട്രെഡും ഉള്ള 16 പടികളാക്കി സ്റ്റെയർകേസ് പുനക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 95, y: 65, width: 40, height: 48, label: 'STAIR: NON-STANDARD' },
      correctedCoords: { x: 95, y: 65, width: 40, height: 48, label: 'STAIR: NBC COMPLIANT ✓' },
    },
    {
      id: 'iss-5',
      category: 'coverage',
      titleEn: 'Ground Coverage Statutory Permissibility',
      titleMl: 'ഗ്രൗണ്ട് കവറേജ് ചട്ടപരിധി പരിശോധന',
      ruleRef: 'KMBR Rule 26 / KPBR Rule 24',
      currentVal: `${((data.groundCoverageSqM / (data.plotAreaSqM || 202.34)) * 100).toFixed(1)}%`,
      requiredVal: data.jurisdiction === 'KMBR' ? 'Max 60.00%' : 'Max 65.00%',
      severity: 'info',
      status: 'pass',
      fixDescriptionEn: 'Plinth boundary sits comfortably within maximum permissible ground coverage limit.',
      fixDescriptionMl: 'പ്ലിന്ത് വിസ്തീർണ്ണം അനുവദനീയമായ പരമാവധി പരിധിക്കുള്ളിലാണ്.',
      resolved: true,
      coords: { x: 50, y: 35, width: 200, height: 130, label: 'PLINTH: WITHIN LIMIT ✓' },
      correctedCoords: { x: 50, y: 35, width: 200, height: 130, label: 'PLINTH: COMPLIANT ✓' },
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
    }, 1000);
  };

  const handleReset = () => {
    setIssues((prev) => prev.map((item) => ({ ...item, resolved: item.id === 'iss-5' })));
    setViewMode('split');
  };

  // Quick CSV Export from Scrutiny Canvas
  const handleQuickExportCSV = () => {
    const rows = [
      ['VINYASA SCRUTINY CANVAS & KBR SCORECARD EXPORT'],
      ['Project', data.projectName || 'Proposed Building'],
      ['Jurisdiction', data.jurisdiction],
      ['Plot Area (Cents)', data.plotAreaCents.toString()],
      ['Plot Area (Sq.M)', data.plotAreaSqM.toFixed(2)],
      [],
      ['KBR SCORECARD BREAKDOWN'],
      ['Issue / Check Title', 'Rule Ref', 'Submitted / Current', 'Statutory Requirement', 'Status', 'Rectification Action'],
    ];

    issues.forEach((iss) => {
      rows.push([
        `"${iss.titleEn}"`,
        `"${iss.ruleRef}"`,
        `"${iss.currentVal}"`,
        `"${iss.requiredVal}"`,
        `"${iss.resolved ? 'RESOLVED / COMPLIANT' : 'VIOLATION'}"`,
        `"${iss.fixDescriptionEn}"`,
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `VINYASA_${data.jurisdiction}_Scrutiny_Scorecard.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resolvedCount = issues.filter((i) => i.resolved).length;
  const pendingCount = issues.filter((i) => !i.resolved).length;
  const scorePercent = Math.round((resolvedCount / issues.length) * 100);

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
              <span>{isMl ? 'സ്പ്ലിറ്റ്-സ്ക്രീൻ സ്ക്രൂട്ടിനി ക്യാൻവാസ് & സ്കോർകാർഡ്' : 'Split-Screen Scrutiny Canvas & KBR Scorecard'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMl ? 'ഡ്രോയിംഗ് സ്ക്രൂട്ടിനിയും അപാകത പരിഹാരവും' : 'Visual CAD Scrutiny & Rule Violation Breakdown'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isMl
                ? 'ഇടതുവശത്ത് പച്ച/ചുവപ്പ് കംപ്ലയൻസ് ബൗണ്ടിംഗ് ബോക്സുകളോടെയുള്ള CAD ഡ്രോയിംഗ് വ്യൂവർ; വലതുവശത്ത് സ്ട്രക്ചേർഡ് KBR സ്കോർകാർഡും ചട്ടലംഘന വിശദാംശങ്ങളും.'
                : 'Interactive split-screen scrutiny viewer: High-contrast green/red compliance bounding boxes on the left; structured KBR scorecard and violation breakdown on the right.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              onClick={handleQuickExportCSV}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              title="One-click CSV Scorecard Export"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>{isMl ? 'CSV സ്കോർകാർഡ്' : 'Export CSV'}</span>
            </button>

            <button
              onClick={handleFixAllWithAI}
              disabled={isApplyingFixAll}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isApplyingFixAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'തിരുത്തുന്നു...' : 'Auto-Fixing...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isMl ? 'AI ഓട്ടോ-ഫിക്‌സ്' : 'Auto-Fix All'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isMl ? 'റീസെറ്റ്' : 'Reset'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Split-Screen Grid: Left Drawing Viewer (7-8 cols), Right Structured KBR Scorecard (4-5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Drawing Viewer with Green/Red Compliance Bounding Boxes */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
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
                {isMl ? 'ഓവർലേ (Overlay)' : 'Overlay'}
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
                onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
                className={`p-1.5 rounded-md border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  showBoundingBoxes
                    ? 'bg-emerald-950/70 border-emerald-600/60 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
                title="Toggle Compliance Bounding Boxes"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isMl ? 'ബോക്സുകൾ' : 'Bounding Boxes'}</span>
              </button>

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
                <span className="hidden sm:inline">{isMl ? 'സെറ്റ്ബാക്ക്' : 'Setbacks'}</span>
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
                <span className="hidden sm:inline">{isMl ? 'സാനിറ്റേഷൻ' : 'Sanitation'}</span>
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

          {/* Interactive Blueprint Canvas with Red/Green Bounding Boxes */}
          <div className="relative p-6 bg-[#040812] flex-1 flex items-center justify-center min-h-[420px] overflow-hidden">
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
              className="relative transition-transform duration-300 w-full max-w-[560px] aspect-[4/3] bg-slate-950/90 border border-cyan-500/30 rounded-xl p-4 shadow-inner"
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
                  PLOT BOUNDARY ({data.plotAreaCents || 5} Cents - {data.jurisdiction})
                </text>

                {/* Road Frontage */}
                <rect x="20" y="200" width="260" height="15" fill="#1E293B" stroke="#475569" strokeWidth="1" />
                <text x="105" y="210" fill="#94A3B8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                  ROAD ({data.roadAccessWidthM || 5.0}m Access Width)
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
                  <text x="55" y="30" fill="#EF4444" fontSize="7" fontWeight="bold" fontFamily="sans-serif">
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
                    <text x="200" y="30" fill="#10B981" fontSize="6" fontFamily="monospace">
                      1.50m Mandatory Rear Line
                    </text>

                    {/* Front Setback Line */}
                    <line x1="20" y1="165" x2="280" y2="165" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="195" y="173" fill="#10B981" fontSize="6" fontFamily="monospace">
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
                      <text x="202" y="60" fill="#EF4444" fontSize="5.5" fontWeight="bold">
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
                <g transform="translate(95, 65)">
                  <rect x="0" y="0" width="30" height="40" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
                  <line x1="0" y1="10" x2="30" y2="10" stroke="#475569" strokeWidth="0.8" />
                  <line x1="0" y1="20" x2="30" y2="20" stroke="#475569" strokeWidth="0.8" />
                  <line x1="0" y1="30" x2="30" y2="30" stroke="#475569" strokeWidth="0.8" />
                  <text x="4" y="24" fill="#94A3B8" fontSize="5.5">
                    STAIR
                  </text>
                </g>

                {/* DYNAMIC GREEN / RED COMPLIANCE BOUNDING BOXES */}
                {showBoundingBoxes &&
                  issues.map((iss) => {
                    const isSelected = selectedIssueId === iss.id;
                    const isOk = iss.resolved;
                    const c = isOk ? iss.correctedCoords : iss.coords;

                    return (
                      <g key={`bbox-${iss.id}`} onClick={() => setSelectedIssueId(iss.id)} className="cursor-pointer">
                        <rect
                          x={c.x}
                          y={c.y}
                          width={c.width}
                          height={c.height}
                          fill={isOk ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.22)'}
                          stroke={isOk ? '#10B981' : '#EF4444'}
                          strokeWidth={isSelected ? '2.5' : '1.5'}
                          strokeDasharray={isSelected ? 'none' : '3 1'}
                        />
                        {/* Bounding Box Indicator Tag */}
                        <rect
                          x={c.x}
                          y={Math.max(c.y - 10, 2)}
                          width={Math.min(c.width, 110)}
                          height="9"
                          fill={isOk ? '#065F46' : '#991B1B'}
                          rx="2"
                        />
                        <text
                          x={c.x + 2}
                          y={Math.max(c.y - 3, 9)}
                          fill="#FFFFFF"
                          fontSize="5"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {isOk ? '✓ COMPLIANT' : '✕ VIOLATION'}
                        </text>
                      </g>
                    );
                  })}

                {/* Active Selection Focus Ring */}
                <rect
                  x={activeIssue.resolved ? activeIssue.correctedCoords.x - 2 : activeIssue.coords.x - 2}
                  y={activeIssue.resolved ? activeIssue.correctedCoords.y - 2 : activeIssue.coords.y - 2}
                  width={activeIssue.coords.width + 4}
                  height={activeIssue.coords.height + 4}
                  fill="none"
                  stroke="#00F0FF"
                  strokeWidth="1.8"
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

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-red-400 font-semibold">
                ● {pendingCount} {isMl ? 'അപാകതകൾ' : 'Violations'}
              </span>
              <span className="text-emerald-400 font-semibold">
                ● {resolvedCount} {isMl ? 'അനുയോജ്യം' : 'Compliant'}
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Structured KBR Scorecard & Violation Breakdown */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 flex flex-col">
          {/* KBR Scorecard Summary Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  {isMl ? 'KBR കംപ്ലയൻസ് സ്കോർകാർഡ്' : 'Structured KBR Scorecard'}
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  scorePercent === 100
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : scorePercent >= 60
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-rose-950 text-rose-300 border border-rose-500'
                }`}
              >
                {scorePercent}% SCORE
              </span>
            </div>

            {/* Metric Micro-Bar */}
            <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  scorePercent === 100 ? 'bg-emerald-400' : 'bg-gradient-to-r from-rose-500 to-amber-400'
                }`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase block">Rule Authority</span>
                <strong className="text-cyan-300">{data.jurisdiction === 'KMBR' ? 'KMBR 2019 (Urban)' : 'KPBR 2019 (Rural)'}</strong>
              </div>
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300">
                <span className="text-[10px] text-slate-500 uppercase block">Total Checks</span>
                <strong>{issues.length} Parameters</strong>
              </div>
            </div>
          </div>

          {/* Violation Breakdown List */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {issues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => setSelectedIssueId(issue.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  selectedIssueId === issue.id
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : issue.resolved
                    ? 'bg-slate-900/50 border-emerald-700/40 opacity-80'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {issue.resolved ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
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

                {/* Selected Issue Inspection Box */}
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
                      <span className="font-bold text-cyan-400 mr-1">{isMl ? 'പരിഹാര നിർദ്ദേശം:' : 'Rectification:'}</span>
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
              {isMl ? 'പൂർണ്ണമായ KBR സ്ക്രൂട്ടിനി റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യാം' : 'Ready to export official KBR summary report?'}
            </div>
            <button
              onClick={() => onNavigateTab('report')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>{isMl ? 'റിപ്പോർട്ട് കാണുക & എക്സ്പോർട്ട് ചെയ്യുക' : 'Generate & Export Official Report'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
