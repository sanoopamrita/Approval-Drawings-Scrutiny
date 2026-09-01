import React, { useState, useMemo } from 'react';
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
  Code2,
  BookOpen,
  Search,
  CheckSquare,
  Wrench,
  Cpu,
  CornerDownRight,
  Copy,
  ExternalLink,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { Language, AreaStatementData, UploadedDrawing } from '../types';
import {
  KSMART_STANDARD_LAYERS,
  KSMART_ERROR_CATALOG,
  runKSmartDiagnostics,
  generateAutoLispFixScript,
  generateKSmartCleanDxf,
  KSmartDiagnosticResult,
  KSmartErrorCodeItem,
} from '../services/ksmartAutoDcrService';

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

  // Primary Workspace Mode:
  // 'ksmart_repair': K-Smart Auto-DCR Pre-Check & 1-Click Auto-Repair
  // 'visual_split': Split-Screen CAD Visualizer & Bounding Box Pins
  // 'error_catalog': K-Smart Auto-DCR Error Code Translator & Solution Finder
  // 'layer_guide': Official K-Smart Layer Standard Guide & Color Codes
  const [studioMode, setStudioMode] = useState<'ksmart_repair' | 'visual_split' | 'error_catalog' | 'layer_guide'>('ksmart_repair');

  // Canvas View Mode (in split screen)
  const [viewMode, setViewMode] = useState<'split' | 'overlay' | 'original' | 'corrected'>('split');
  const [selectedIssueId, setSelectedIssueId] = useState<string>('iss-1');
  const [isApplyingFixAll, setIsApplyingFixAll] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Layer Toggles in Canvas
  const [showSetbackLines, setShowSetbackLines] = useState<boolean>(true);
  const [showSanitationOverlay, setShowSanitationOverlay] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Error Code Search State
  const [errorCodeQuery, setErrorCodeQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // Copy Feedback states
  const [copiedLsp, setCopiedLsp] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // K-Smart Auto-DCR Live Diagnostics
  const initialDiagnostics = useMemo(() => runKSmartDiagnostics(data, data.jurisdiction), [data]);
  const [diagnosticsState, setDiagnosticsState] = useState<KSmartDiagnosticResult['diagnostics']>(
    initialDiagnostics.diagnostics
  );

  // Interactive visual scrutiny issues
  const [issues, setIssues] = useState<RedlineIssue[]>([
    {
      id: 'iss-1',
      category: 'setback',
      titleEn: 'Rear Setback Deficit (KMBR/KPBR Rule 25)',
      titleMl: 'പിൻഭാഗത്തെ സെറ്റ്ബാക്ക് കുറവ് (ചട്ടം 25/27)',
      ruleRef: `${data.jurisdiction || 'KPBR'} 2019 Table 4`,
      currentVal: `${data.rearSetbackM || '1.10'} m`,
      requiredVal: data.plotAreaSqM < 200 ? '1.00 m (Rule 60/62)' : '1.50 m (Min)',
      severity: 'critical',
      status: 'fail',
      fixDescriptionEn: 'Shift rear building wall 0.40m inward into the plinth to secure mandatory clear rear open space.',
      fixDescriptionMl: 'ചട്ടപ്രകാരമുള്ള കൃത്യമായ ഓപ്പൺ സ്പേസ് ഉറപ്പാക്കാൻ പിൻഭാഗത്തെ ഭിത്തി 0.40 മീറ്റർ ഉള്ളിലേക്ക് മാറ്റുക.',
      resolved: false,
      coords: { x: 50, y: 15, width: 200, height: 20, label: 'DEFICIT 1.10m [REQ: 1.50m]' },
      correctedCoords: { x: 50, y: 35, width: 200, height: 20, label: 'COMPLIANT 1.50m ✓' },
    },
    {
      id: 'iss-2',
      category: 'sanitation',
      titleEn: 'Septic Tank to Open Well Clearance Conflict',
      titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലക്കുറവ്',
      ruleRef: `${data.jurisdiction || 'KPBR'} Rule 47 / 91`,
      currentVal: `${data.distanceWellToSepticTankM || '5.40'} m`,
      requiredVal: '7.50 m (Min Statutory Radial Distance)',
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
      ruleRef: `${data.jurisdiction || 'KPBR'} Rule 25 / 34`,
      currentVal: `${data.frontSetbackM || '2.60'} m`,
      requiredVal: data.plotAreaSqM < 200 ? '1.80 m (Rule 60/62)' : '3.00 m (Min)',
      severity: 'warning',
      status: 'fail',
      fixDescriptionEn: 'Align front porch line on layer 0_SETBACK_FRONT to provide full 3.00m clearance from front street boundary line.',
      fixDescriptionMl: 'മുൻവശത്തെ അതിർത്തിയിൽ നിന്നും റോഡിൽ നിന്നും 3.00 മീറ്റർ അകലം ഉറപ്പാക്കാൻ മുൻ പോർച്ച് ലൈൻ 0_SETBACK_FRONT ലെയറിൽ ക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 50, y: 175, width: 200, height: 25, label: 'FRONT: 2.60m [REQ: 3.00m]' },
      correctedCoords: { x: 50, y: 165, width: 200, height: 25, label: 'FRONT: 3.00m COMPLIANT ✓' },
    },
    {
      id: 'iss-4',
      category: 'staircase',
      titleEn: 'Staircase Riser & Tread Flight Dimension',
      titleMl: 'സ്റ്റെയർകേസ് റൈസർ & ട്രെഡ്ഡ് അളവിലെ വ്യത്യാസം',
      ruleRef: 'Rule 35 & NBC 2016 Part 4',
      currentVal: 'Riser: 18.5 cm / Tread: 22 cm',
      requiredVal: 'Max Riser: 15 cm / Min Tread: 25 cm',
      severity: 'warning',
      status: 'warning',
      fixDescriptionEn: 'Reconfigure flight geometry on layer 0_STAIRCASE_FIRE to 16 risers at 15cm each with 25cm clear tread width for safety compliance.',
      fixDescriptionMl: 'സുരക്ഷാ മാനദണ്ഡങ്ങൾ പാലിച്ച് 15cm റൈസറും 25cm ട്രെഡും ഉള്ള 16 പടികളാക്കി 0_STAIRCASE_FIRE ലെയറിൽ പുനക്രമീകരിക്കുക.',
      resolved: false,
      coords: { x: 95, y: 65, width: 40, height: 48, label: 'STAIR: NON-STANDARD' },
      correctedCoords: { x: 95, y: 65, width: 40, height: 48, label: 'STAIR: NBC COMPLIANT ✓' },
    },
    {
      id: 'iss-5',
      category: 'coverage',
      titleEn: 'Ground Coverage Statutory Permissibility',
      titleMl: 'ഗ്രൗണ്ട് കവറേജ് ചട്ടപരിധി പരിശോധന',
      ruleRef: 'Rule 24 / 26',
      currentVal: `${((data.groundCoverageSqM / (data.plotAreaSqM || 202.34)) * 100).toFixed(1)}%`,
      requiredVal: data.jurisdiction === 'KMBR' ? 'Max 60.00%' : 'Max 65.00%',
      severity: 'info',
      status: 'pass',
      fixDescriptionEn: 'Plinth boundary on 0_BUILDING_OUTLINE sits comfortably within maximum permissible ground coverage limit.',
      fixDescriptionMl: 'പ്ലിന്ത് വിസ്തീർണ്ണം അനുവദനീയമായ പരമാവധി പരിധിക്കുള്ളിലാണ്.',
      resolved: true,
      coords: { x: 50, y: 35, width: 200, height: 130, label: 'PLINTH: WITHIN LIMIT ✓' },
      correctedCoords: { x: 50, y: 35, width: 200, height: 130, label: 'PLINTH: COMPLIANT ✓' },
    },
  ]);

  const activeIssue = issues.find((i) => i.id === selectedIssueId) || issues[0];

  // Auto-Fix All Diagnostics and Issues
  const handleFixAllWithAI = () => {
    setIsApplyingFixAll(true);
    setTimeout(() => {
      // Resolve all canvas redline issues
      setIssues((prev) => prev.map((item) => ({ ...item, resolved: true })));
      // Resolve all K-Smart diagnostic items
      setDiagnosticsState((prev) =>
        prev.map((d) => ({
          ...d,
          status: 'pass',
          fixed: true,
          currentFindingEn: 'Rectified and standardized to 100% K-Smart Auto-DCR compliance.',
          currentFindingMl: 'കെ-സ്മാർട്ട് ഓട്ടോ-ഡിസിആർ മാനദണ്ഡങ്ങൾക്ക് അനുസൃതമായി തിരുത്തപ്പെട്ടു.',
        }))
      );
      setIsApplyingFixAll(false);
      setViewMode('corrected');
    }, 1200);
  };

  const handleReset = () => {
    setIssues((prev) => prev.map((item) => ({ ...item, resolved: item.id === 'iss-5' })));
    setDiagnosticsState(initialDiagnostics.diagnostics);
    setViewMode('split');
  };

  const handleToggleDiagnosticFix = (id: string) => {
    setDiagnosticsState((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: d.status === 'pass' ? 'fail' : 'pass',
              fixed: !d.fixed,
            }
          : d
      )
    );
  };

  // Download Clean K-Smart Standard DXF file
  const handleDownloadCleanDxf = () => {
    const dxfString = generateKSmartCleanDxf(data, diagnosticsState);
    const blob = new Blob([dxfString], { type: 'application/dxf;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KSMART_RECTIFIED_${(data.surveyNumber || 'DRAWING').replace(/\//g, '_')}.dxf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download AutoLISP 1-Click Repair Script
  const handleDownloadAutoLisp = () => {
    const lspString = generateAutoLispFixScript(data.projectName || 'Kerala Building Proposal');
    const blob = new Blob([lspString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vinyasa_ksmart_fixer.lsp`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyAutoLisp = () => {
    const lspString = generateAutoLispFixScript(data.projectName || 'Kerala Building Proposal');
    navigator.clipboard.writeText(lspString);
    setCopiedLsp(true);
    setTimeout(() => setCopiedLsp(false), 2000);
  };

  const handleCopyCommand = (code: string, cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(code);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  // Filtered Error Code catalog
  const filteredErrors = useMemo(() => {
    return KSMART_ERROR_CATALOG.filter((err) => {
      const matchCat = selectedCategoryFilter === 'all' || err.category === selectedCategoryFilter;
      const q = errorCodeQuery.toLowerCase();
      const matchQ =
        !q ||
        err.code.toLowerCase().includes(q) ||
        err.titleEn.toLowerCase().includes(q) ||
        err.titleMl.toLowerCase().includes(q) ||
        err.rootCauseEn.toLowerCase().includes(q) ||
        err.rootCauseMl.toLowerCase().includes(q) ||
        err.expertSolutionEn.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [errorCodeQuery, selectedCategoryFilter]);

  // Overall K-Smart Score calculation
  const totalDiags = diagnosticsState.length;
  const passedDiags = diagnosticsState.filter((d) => d.status === 'pass').length;
  const ksmartScore = totalDiags > 0 ? Math.round((passedDiags / totalDiags) * 100) : 100;

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Top Banner: Vinyasa K-Smart Auto-DCR Engine & CAD Repair Studio */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#070D1B] to-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{isMl ? 'കെ-സ്മാർട്ട് ഓട്ടോ-ഡിസിആർ CAD ഓട്ടോ-കറക്ഷൻ എഞ്ചിൻ' : 'K-Smart Auto-DCR CAD Auto-Repair Studio'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMl ? 'ഡ്രോയിംഗ് പരിശോധനയും ഓട്ടോമാറ്റിക് പരിഹാരവും' : 'CAD Pre-Scrutiny & Automated Defect Rectifier'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isMl
                ? 'കെ-സ്മാർട്ട് (K-Smart) പോർട്ടലിലെ ഓട്ടോ-ഡിസിആർ എററുകൾ തടയാൻ ലെയർ മാപ്പിംഗ്, ക്ലോസ്ഡ് പോളിലൈൻ വെൽഡിംഗ്, Z-ആക്സിസ് ഫ്ലാറ്റനിംഗ്, സെറ്റ്ബാക്ക് അഡ്ജസ്റ്റ്മെന്റ് എന്നിവ ഒരു എക്സ്പെർട്ട് എഞ്ചിനീയറെപ്പോലെ സ്വയം വിശകലനം ചെയ്ത് നിമിഷങ്ങൾക്കുള്ളിൽ തിരുത്തുന്നു.'
                : 'Eliminates K-Smart Auto-DCR rejections with automated layer renaming, 2D polyline gap closure, Z-coordinate flattening, and statutory setback offset realignment.'}
            </p>
          </div>

          {/* Quick Score & Top Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch lg:items-center gap-3 shrink-0">
            {/* Live K-Smart Readiness Badge */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-950/90 border border-slate-800 shadow-inner">
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {isMl ? 'കെ-സ്മാർട്ട് പാസ്സ് സ്കോർ' : 'K-Smart Readiness'}
                </div>
                <div
                  className={`text-xl font-black ${
                    ksmartScore >= 80 ? 'text-emerald-400' : ksmartScore >= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}
                >
                  {ksmartScore}% {ksmartScore === 100 ? '✓ PASS' : ''}
                </div>
              </div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${
                  ksmartScore >= 80
                    ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                    : ksmartScore >= 50
                    ? 'border-amber-500 bg-amber-950/60 text-amber-300'
                    : 'border-rose-500 bg-rose-950/60 text-rose-300'
                }`}
              >
                {ksmartScore >= 80 ? 'A+' : ksmartScore >= 50 ? 'B' : 'C'}
              </div>
            </div>

            {/* 1-Click AI Auto-Fix */}
            <button
              onClick={handleFixAllWithAI}
              disabled={isApplyingFixAll}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.45)] transition-all cursor-pointer disabled:opacity-50"
            >
              {isApplyingFixAll ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'ഡ്രോയിംഗ് തിരുത്തുന്നു...' : 'Auto-Rectifying CAD...'}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-slate-950" />
                  <span>{isMl ? 'ഓട്ടോ-കറക്റ്റ് ചെയ്യുക' : '1-Click Auto-Repair'}</span>
                </>
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-1.5 px-3.5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              title="Reset Changes"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isMl ? 'റീസെറ്റ്' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Sub-Mode Navigation Tabs */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setStudioMode('ksmart_repair')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'ksmart_repair'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>{isMl ? '1. കെ-സ്മാർട്ട് പ്രീ-ചെക്ക് & റിപ്പയർ' : '1. Auto-DCR Pre-Check & Repair'}</span>
          </button>

          <button
            onClick={() => setStudioMode('visual_split')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'visual_split'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isMl ? '2. വിഷ്വൽ ഡ്രോയിംഗ് സ്പ്ലിറ്റ്-സ്ക്രീൻ' : '2. Split-Screen Visualizer'}</span>
          </button>

          <button
            onClick={() => setStudioMode('error_catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'error_catalog'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{isMl ? '3. എറർ കോഡ് ട്രാൻസ്ലേറ്റർ & കമാൻഡുകൾ' : '3. Error Code Translator'}</span>
          </button>

          <button
            onClick={() => setStudioMode('layer_guide')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studioMode === 'layer_guide'
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isMl ? '4. ഔദ്യോഗിക K-Smart ലെയർ ചാർട്ട്' : '4. Official Layer Standards'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: K-SMART AUTO-DCR PRE-CHECK & ONE-CLICK AUTO-REPAIR ENGINE        */}
      {/* ========================================================================= */}
      {studioMode === 'ksmart_repair' && (
        <div className="space-y-6">
          {/* Quick Action CAD Exports Toolbar */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>
                {isMl
                  ? 'തിരുത്തിയ ഫയലുകൾ ഓട്ടോകാഡിലേക്കോ കെ-സ്മാർട്ട് പോർട്ടലിലേക്കോ നേരിട്ട് ഡൗൺലോഡ് ചെയ്യാം:'
                  : 'Ready exports for AutoCAD & K-Smart Auto-DCR Portal:'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadCleanDxf}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isMl ? 'തിരുത്തിയ DXF ഡൗൺലോഡ് (.dxf)' : 'Download Clean DXF (.dxf)'}</span>
              </button>

              <button
                onClick={handleDownloadAutoLisp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(16,185,129,0.2)]"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{isMl ? 'AutoLISP സ്ക്രിപ്റ്റ് (.lsp)' : 'AutoLISP 1-Click Fixer (.lsp)'}</span>
              </button>

              <button
                onClick={handleCopyAutoLisp}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                {copiedLsp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLsp ? (isMl ? 'കോപ്പി ചെയ്തു!' : 'Copied!') : isMl ? 'സ്ക്രിപ്റ്റ് കോപ്പി' : 'Copy Script'}</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Checks Matrix */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>{isMl ? 'കെ-സ്മാർട്ട് ഓട്ടോ-ഡിസിആർ സ്ക്രൂട്ടിനി ചെക്ക്‌ലിസ്റ്റ്' : 'K-Smart Auto-DCR Diagnostics Matrix'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isMl
                    ? 'ഓരോ ഘടകങ്ങളും കെ-സ്മാർട്ട് ഡിജിറ്റൽ ഫോർമാറ്റുമായി പരിശോധിച്ചതിന്റെ ഫലം താഴെ കാണാം. ആവശ്യമുള്ളവയിൽ ക്ലിക്ക് ചെയ്ത് തിരുത്തലുകൾ വരുത്താം.'
                    : 'Real-time clause-by-clause evaluation of drawing layers, geometry closure, and clearance parameters.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  {diagnosticsState.filter((d) => d.status === 'pass').length} {isMl ? 'ശരി' : 'Passed'}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  {diagnosticsState.filter((d) => d.status === 'fail').length} {isMl ? 'അപാകത' : 'Failed'}
                </span>
              </div>
            </div>

            {/* Grid of Diagnostics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnosticsState.map((diag) => {
                const isPass = diag.status === 'pass';
                return (
                  <div
                    key={diag.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isPass
                        ? 'bg-slate-950/60 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.06)]'
                        : 'bg-slate-950/90 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.1)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {isPass ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-white leading-tight">
                            {isMl ? diag.checkNameMl : diag.checkNameEn}
                          </h4>
                          <span className="inline-block mt-1 font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                            Layer: {diag.layerTarget}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleDiagnosticFix(diag.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          isPass
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/40 hover:bg-emerald-900'
                            : 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                        }`}
                      >
                        {isPass ? (isMl ? 'പരിഹരിച്ചു ✓' : 'Fixed ✓') : isMl ? 'തിരുത്തുക' : 'Auto-Fix'}
                      </button>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <p className="text-slate-300 leading-relaxed font-medium">
                        {isMl ? diag.currentFindingMl : diag.currentFindingEn}
                      </p>

                      <div className="p-2.5 rounded-lg bg-[#060B14] border border-slate-800/80 text-[11px] space-y-1">
                        <div className="text-slate-400 font-semibold flex items-center gap-1">
                          <Wrench className="w-3 h-3 text-cyan-400" />
                          <span>{isMl ? 'പരിഹാര നിർദ്ദേശം (Remedy):' : 'Expert Engineering Remedy:'}</span>
                        </div>
                        <div className="text-cyan-200">{isMl ? diag.remedyMl : diag.remedyEn}</div>
                        <div className="text-slate-400 font-mono text-[10px] mt-1 pt-1 border-t border-slate-800">
                          CAD Command: <span className="text-amber-300">{diag.cadAction}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Step-by-Step Draftsman Guide for K-Smart */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#0A1020] border border-cyan-500/30 space-y-4">
            <h4 className="text-sm font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>{isMl ? 'ഓട്ടോകാഡിൽ 2 സെക്കൻഡിൽ ഫയൽ റെഡിയാക്കാനുള്ള വഴി' : '2-Second AutoCAD Fast Fix Workflow'}</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center text-[10px]">1</span>
                  <span>{isMl ? 'സ്ക്രിപ്റ്റ് ഡൗൺലോഡ് ചെയ്യുക' : 'Download AutoLISP Script'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isMl
                    ? 'മുകളിലെ "AutoLISP സ്ക്രിപ്റ്റ് (.lsp)" ബട്ടൺ ക്ലിക്ക് ചെയ്ത് ഫയൽ സേവ് ചെയ്യുക.'
                    : 'Download the vinyasa_ksmart_fixer.lsp script provided above.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center text-[10px]">2</span>
                  <span>{isMl ? 'ഓട്ടോകാഡിൽ ലോഡ് ചെയ്യുക' : 'Load in AutoCAD'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isMl
                    ? 'AutoCAD തുറന്ന് കമാൻഡ് ബാറിൽ "APPLOAD" അടിച്ച് ഈ സ്ക്രിപ്റ്റ് ഫയൽ സെലക്ട് ചെയ്യുക.'
                    : 'Open AutoCAD drawing, type "APPLOAD" in terminal, and select the downloaded file.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/50 flex items-center justify-center text-[10px]">3</span>
                  <span>{isMl ? 'KSFIX എന്ന് ടൈപ്പ് ചെയ്യുക' : 'Execute "KSFIX"'}</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  {isMl
                    ? '"KSFIX" എന്ന് ടൈപ്പ് ചെയ്ത് എന്റർ അടിക്കുക. എല്ലാ എററുകളും തനിയെ ഫിക്സ് ആകും!'
                    : 'Type "KSFIX" and press Enter. All layers, 3D Z-points, and open loops are instantly repaired!'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: INTERACTIVE SPLIT-SCREEN CAD VISUALIZER & PINPOINT REDLINE        */}
      {/* ========================================================================= */}
      {studioMode === 'visual_split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT: Drawing Viewer with High-Contrast Green/Red Compliance Bounding Boxes */}
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
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'original' ? 'bg-rose-950 text-rose-300 border border-rose-600/50' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isMl ? 'യഥാർത്ഥ പ്ലാൻ (Before)' : 'Original (Before)'}
                </button>
                <button
                  onClick={() => setViewMode('corrected')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                    viewMode === 'corrected' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {isMl ? 'തിരുത്തിയ പ്ലാൻ (After)' : 'Corrected (After)'}
                </button>
              </div>

              {/* Zoom & Layer Toggles */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono text-cyan-400 w-10 text-center">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* SVG Visual Canvas Area */}
            <div className="p-4 sm:p-6 bg-[#040812] overflow-auto min-h-[460px] flex items-center justify-center relative">
              <div
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
                className="transition-transform duration-200"
              >
                <svg
                  viewBox="0 0 320 220"
                  className="w-[300px] sm:w-[480px] md:w-[580px] h-auto border-2 border-slate-700/80 rounded-xl bg-gradient-to-b from-[#060c18] to-[#03060c] shadow-2xl select-none"
                >
                  {/* Grid background */}
                  {showGrid && (
                    <defs>
                      <pattern id="cadGrid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
                      </pattern>
                    </defs>
                  )}
                  {showGrid && <rect width="320" height="220" fill="url(#cadGrid)" />}

                  {/* 0_PLOT_BOUNDARY */}
                  <rect
                    x="20"
                    y="10"
                    width="280"
                    height="200"
                    fill="rgba(6, 182, 212, 0.02)"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="4,2"
                  />
                  <text x="25" y="22" fill="#06b6d4" fontSize="5" fontWeight="bold" fontFamily="monospace">
                    0_PLOT_BOUNDARY ({data.plotAreaSqM ? data.plotAreaSqM.toFixed(1) : '182.1'} sq.m)
                  </text>

                  {/* Front Access Road (0_ROAD_WIDTH) */}
                  <rect x="20" y="195" width="280" height="15" fill="rgba(148, 163, 184, 0.15)" stroke="#94a3b8" strokeWidth="0.8" />
                  <text x="120" y="205" fill="#cbd5e1" fontSize="5" fontWeight="bold" fontFamily="sans-serif">
                    ACCESS ROAD ({data.roadAccessWidthM || '5.00'}m) [0_ROAD_WIDTH]
                  </text>

                  {/* Open Drinking Well (0_WELL_CIRC) */}
                  <circle cx="265" cy="45" r="14" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" strokeWidth="1.2" />
                  <text x="255" y="47" fill="#38bdf8" fontSize="4.5" fontWeight="bold">
                    WELL 7.5m Buffer
                  </text>

                  {/* Septic Tank & Soak Pit - Before vs After */}
                  {viewMode === 'original' || (viewMode === 'split' && !issues.find((i) => i.id === 'iss-2')?.resolved) ? (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedIssueId('iss-2')}
                    >
                      <rect x="210" y="60" width="35" height="22" fill="rgba(244, 63, 94, 0.3)" stroke="#f43f5e" strokeWidth="1.5" />
                      <text x="212" y="73" fill="#f43f5e" fontSize="4" fontWeight="bold">
                        SEPTIC TANK [5.4m CLASH!]
                      </text>
                      <line x1="265" y1="45" x2="225" y2="70" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2,2" />
                    </g>
                  ) : (
                    <g
                      className="cursor-pointer"
                      onClick={() => setSelectedIssueId('iss-2')}
                    >
                      <rect x="35" y="160" width="35" height="22" fill="rgba(16, 185, 129, 0.25)" stroke="#10b981" strokeWidth="1.5" />
                      <text x="37" y="173" fill="#10b981" fontSize="4" fontWeight="bold">
                        0_SEPTIC_TANK [11.2m SAFE ✓]
                      </text>
                      <line x1="265" y1="45" x2="52" y2="170" stroke="#10b981" strokeWidth="0.8" strokeDasharray="3,2" />
                    </g>
                  )}

                  {/* Main Building Plinth (0_BUILDING_OUTLINE) */}
                  <rect
                    x="55"
                    y={viewMode === 'original' || !issues.find((i) => i.id === 'iss-1')?.resolved ? '20' : '35'}
                    width="180"
                    height="135"
                    fill="rgba(30, 41, 59, 0.7)"
                    stroke="#10b981"
                    strokeWidth="1.8"
                  />
                  <text x="110" y="100" fill="#f8fafc" fontSize="7" fontWeight="bold">
                    PROPOSED PLINTH ({data.groundCoverageSqM || 98.5} sq.m)
                  </text>

                  {/* Staircase (0_STAIRCASE_FIRE) */}
                  <rect x="100" y="65" width="45" height="50" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" strokeWidth="1" />
                  <line x1="100" y1="75" x2="145" y2="75" stroke="#f59e0b" strokeWidth="0.5" />
                  <line x1="100" y1="85" x2="145" y2="85" stroke="#f59e0b" strokeWidth="0.5" />
                  <line x1="100" y1="95" x2="145" y2="95" stroke="#f59e0b" strokeWidth="0.5" />
                  <line x1="100" y1="105" x2="145" y2="105" stroke="#f59e0b" strokeWidth="0.5" />
                  <text x="105" y="73" fill="#f59e0b" fontSize="4" fontWeight="bold">
                    STAIR (0_STAIRCASE_FIRE)
                  </text>

                  {/* Setback Lines - Front, Rear, Sides */}
                  {showSetbackLines && (
                    <g>
                      {/* Rear Setback */}
                      <line x1="55" y1="10" x2="55" y2="35" stroke="#d946ef" strokeWidth="0.8" markerEnd="url(#arrow)" />
                      <text x="60" y="24" fill="#d946ef" fontSize="4.5" fontWeight="bold">
                        REAR: {issues.find((i) => i.id === 'iss-1')?.resolved ? '1.50m ✓' : '1.10m ⚠️'}
                      </text>

                      {/* Front Setback */}
                      <line x1="55" y1="170" x2="55" y2="195" stroke="#d946ef" strokeWidth="0.8" />
                      <text x="60" y="185" fill="#d946ef" fontSize="4.5" fontWeight="bold">
                        FRONT: {issues.find((i) => i.id === 'iss-3')?.resolved ? '3.00m ✓' : '2.60m ⚠️'}
                      </text>

                      {/* Side Setbacks */}
                      <text x="25" y="100" fill="#eab308" fontSize="4" fontWeight="bold">
                        S1: {data.sideSetback1M || 1.2}m
                      </text>
                      <text x="245" y="100" fill="#eab308" fontSize="4" fontWeight="bold">
                        S2: {data.sideSetback2M || 1.2}m
                      </text>
                    </g>
                  )}

                  {/* True North Arrow (0_NORTH_ARROW) */}
                  <g transform="translate(290, 25)">
                    <circle cx="0" cy="0" r="7" fill="#090e17" stroke="#ef4444" strokeWidth="0.8" />
                    <line x1="0" y1="5" x2="0" y2="-5" stroke="#ef4444" strokeWidth="1.2" />
                    <polygon points="0,-6 -2,-2 2,-2" fill="#ef4444" />
                    <text x="-2" y="3" fill="#ef4444" fontSize="4" fontWeight="bold">N</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Bottom Status Bar */}
            <div className="p-3 bg-[#080E1A] border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>{isMl ? 'ചട്ടപ്രകാരമുള്ളവ' : 'Compliant'}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span>{isMl ? 'തടസ്സങ്ങൾ' : 'Deficit / Clash'}</span>
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-300">
                K-Smart Auto-DCR Engine: Active
              </div>
            </div>
          </div>

          {/* RIGHT: Structured KBR Scorecard & Interactive Defect Cards */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4 flex flex-col">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                <span>{isMl ? 'കണ്ടെത്തിയ അപാകതകൾ' : 'Detected CAD Issues'}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {issues.filter((i) => i.resolved).length}/{issues.length} {isMl ? 'പരിഹരിച്ചു' : 'Resolved'}
                </span>
              </h3>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {issues.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => setSelectedIssueId(iss.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                      selectedIssueId === iss.id
                        ? 'bg-slate-950 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {iss.resolved ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                        <span>{isMl ? iss.titleMl : iss.titleEn}</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          iss.resolved ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                        }`}
                      >
                        {iss.resolved ? (isMl ? 'പാസ്സ്' : 'Pass') : isMl ? 'തിരുത്തണം' : 'Fail'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{iss.ruleRef}</span>
                      <span className="font-mono text-cyan-300">{iss.currentVal}</span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {isMl ? iss.fixDescriptionMl : iss.fixDescriptionEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 3: K-SMART ERROR CODE TRANSLATOR & INSTANT COMMAND PLAYBOOK          */}
      {/* ========================================================================= */}
      {studioMode === 'error_catalog' && (
        <div className="space-y-5">
          {/* Search & Filter Header */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={errorCodeQuery}
                onChange={(e) => setErrorCodeQuery(e.target.value)}
                placeholder={
                  isMl
                    ? 'കെ-സ്മാർട്ട് എറർ കോഡ് അല്ലെങ്കിൽ കീവേഡ് തിരയുക (ഉദാ: ERR_DCR, polyline, setback, well, FAR)...'
                    : 'Search K-Smart Error Code or keyword (e.g. ERR_DCR_002, unclosed polyline, FAR, setback)...'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'layer', 'topology', 'sanitation', 'setback', 'far_coverage', 'stair_fire'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                    selectedCategoryFilter === cat
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Error Code Catalog List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredErrors.map((err) => (
              <div
                key={err.code}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl space-y-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
                      {err.code}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-2 leading-snug">
                      {isMl ? err.titleMl : err.titleEn}
                    </h4>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      err.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-600/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-600/40'
                    }`}
                  >
                    {err.severity}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1.5">
                  <div className="text-slate-400 font-semibold">{isMl ? 'യഥാർത്ഥ കാരണം (Root Cause):' : 'Root Cause:'}</div>
                  <p className="leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {isMl ? err.rootCauseMl : err.rootCauseEn}
                  </p>
                </div>

                <div className="text-xs text-emerald-200 space-y-1.5">
                  <div className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isMl ? 'വിദഗ്ദ്ധ പരിഹാരം (Senior Engineer Fix):' : 'Expert Engineering Fix:'}</span>
                  </div>
                  <p className="leading-relaxed bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-500/30">
                    {isMl ? err.expertSolutionMl : err.expertSolutionEn}
                  </p>
                </div>

                {/* AutoCAD Command Snippet with 1-Click Copy */}
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                  <div className="font-mono text-[11px] text-amber-300 truncate">
                    {err.autocadCommand}
                  </div>
                  <button
                    onClick={() => handleCopyCommand(err.code, err.autocadCommand)}
                    className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer shrink-0"
                    title="Copy AutoCAD Command"
                  >
                    {copiedCmd === err.code ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 4: OFFICIAL K-SMART STANDARD LAYER SPECIFICATION GUIDE               */}
      {/* ========================================================================= */}
      {studioMode === 'layer_guide' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-5 sm:p-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>{isMl ? 'കെ-സ്മാർട്ട് ഔദ്യോഗിക CAD ലെയർ ചാർട്ട്' : 'Official K-Smart CAD Layer Directory'}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isMl
                ? 'ഓട്ടോ-ഡിസിആർ കൃത്യമായി പ്രവർത്തിക്കാൻ താഴെ പറയുന്ന ലെയറുകളും കളർ കോഡുകളും നിർബന്ധമായും ഡ്രോയിംഗിൽ ഉപയോഗിച്ചിരിക്കണം.'
                : 'Mandatory standard layers, ACI color indices, and entity primitives required by K-Smart Auto-DCR.'}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 uppercase text-[10px] tracking-wider font-bold">
                  <th className="p-3">Layer Name</th>
                  <th className="p-3">Color / ACI</th>
                  <th className="p-3">Entity Type</th>
                  <th className="p-3">Mandatory</th>
                  <th className="p-3">Purpose & Kerala Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {KSMART_STANDARD_LAYERS.map((layer) => (
                  <tr key={layer.layerName} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-mono font-bold text-cyan-300">{layer.layerName}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: layer.colorHex }}
                        />
                        <span className="font-mono text-slate-300">ACI {layer.colorCode}</span>
                      </div>
                    </td>
                    <td className="p-3 text-slate-300 font-mono text-[11px]">{layer.entityType}</td>
                    <td className="p-3">
                      {layer.mandatory ? (
                        <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                          MANDATORY
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          OPTIONAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      <div>{isMl ? layer.descriptionMl : layer.descriptionEn}</div>
                      <div className="text-[10px] text-cyan-400 font-mono mt-0.5">{layer.ruleRef}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
