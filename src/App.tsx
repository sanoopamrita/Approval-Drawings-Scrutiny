import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { AuthoritySelector } from './components/AuthoritySelector';
import { DrawingUploader } from './components/DrawingUploader';
import { AreaStatementForm } from './components/AreaStatementForm';
import { ScrutinyResults } from './components/ScrutinyResults';
import { ReportGenerator } from './components/ReportGenerator';
import { BoqEstimator } from './components/BoqEstimator';
import { CADRedlineVisualizer } from './components/CADRedlineVisualizer';
import { RfiGenerator } from './components/RfiGenerator';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AdminPanel } from './components/AdminPanel';
import { AdPlayerModal } from './components/AdPlayerModal';
import { LoginView } from './components/LoginView';
import { VinyasaLogo } from './components/VinyasaLogo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Bot, Sparkles, Lock, Bell, EyeOff, ShieldCheck, CheckCircle2, X, Mail } from 'lucide-react';
import {
  AreaStatementData,
  JurisdictionType,
  Language,
  ScrutinyCheckResult,
  ScrutinyReportSummary,
  UploadedDrawing,
  TabType,
  User,
  SystemConfig,
  SUPER_ADMIN_EMAIL,
} from './types';
import { runKeralaBuildingRulesScrutiny } from './services/ruleEngine';
import {
  getCurrentUser,
  logoutUser,
  recordAccessLog,
  isUserSuperAdmin,
} from './services/authService';
import {
  getSystemConfig,
  subscribeToConfigChange,
} from './services/configService';

const initialDefaultFormData: AreaStatementData = {
  jurisdiction: 'KPBR',
  district: 'Ernakulam',
  localBodyName: '',
  projectName: '',
  applicantName: '',
  preparedByName: '',
  preparedByDesignation: '',
  surveyNumber: '',
  wardNumber: '',
  villageName: '',
  talukName: '',
  occupancyGroup: 'A1',
  plotType: 'normal',
  plotAreaSqM: 0,
  plotAreaCents: 0,
  plotWidthM: 0,
  plotDepthM: 0,
  roadAccessWidthM: 0,
  groundCoverageSqM: 0,
  totalBuiltUpAreaSqM: 0,
  totalFloorAreaSqM: 0,
  totalCarpetAreaSqM: 0,
  numberOfFloors: 1,
  buildingHeightM: 0,
  floors: [
    { floorName: 'Ground Floor', builtUpArea: 0, carpetArea: 0, occupancy: 'A1', heightFromGround: 0 },
  ],
  frontSetbackM: 0,
  rearSetbackM: 0,
  sideSetback1M: 0,
  sideSetback2M: 0,
  carParkingProvided: 0,
  twoWheelerParkingProvided: 0,
  disabledParkingProvided: 0,
  loadingBaysProvided: 0,
  parkingBayWidthM: 2.5,
  parkingBayLengthM: 5.0,
  drivewayWidthM: 3.0,
  openWellInPlot: false,
  distanceWellToSepticTankM: 0,
  distanceWellToSoakPitM: 0,
  distanceSepticTankToBoundaryM: 0,
  rwhTankCapacityLiters: 0,
  solarPvCapacityKwp: 0,
  solidWasteUnitProvided: false,
  biogasPlantOrCompostProvided: false,
  mainStaircaseWidthM: 0,
  staircaseTreadCm: 0,
  staircaseRiserCm: 0,
  staircaseHeadroomM: 0,
  minHabitableRoomAreaSqM: 0,
  minHabitableRoomWidthM: 0,
  minHabitableRoomHeightM: 0,
  minKitchenAreaSqM: 0,
  minKitchenWidthM: 0,
  ventilationRatioPercent: 0,
  clearFirePassageWidthM: 0,
  hasLift: false,
  hasRampForDisabled: false,
  rampSlopeRatio: 10,
};

const initialDefaultDrawings: UploadedDrawing[] = [];

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(getSystemConfig());
  const [dismissNotice, setDismissNotice] = useState(false);

  const [language, setLanguage] = useState<Language>('ml');
  const [activeTab, setActiveTab] = useState<TabType>('authority');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);
  const [isScrutinyRunning, setIsScrutinyRunning] = useState<boolean>(false);

  // Draggable FAB button position
  const [fabPosition, setFabPosition] = useState<{ x: number; y: number } | null>(null);
  const [, setIsFabDragging] = useState(false);
  const fabDragRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
    active: boolean;
  }>({ startX: 0, startY: 0, initialX: 0, initialY: 0, hasMoved: false, active: false });
  const fabButtonRef = useRef<HTMLButtonElement>(null);

  const handleFabDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    let currentX = 0;
    let currentY = 0;

    if (fabButtonRef.current) {
      const rect = fabButtonRef.current.getBoundingClientRect();
      currentX = rect.left;
      currentY = rect.top;
    } else if (fabPosition) {
      currentX = fabPosition.x;
      currentY = fabPosition.y;
    } else {
      currentX = window.innerWidth - 200;
      currentY = window.innerHeight - 80;
    }

    fabDragRef.current = {
      startX: clientX,
      startY: clientY,
      initialX: currentX,
      initialY: currentY,
      hasMoved: false,
      active: true,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!fabDragRef.current.active) return;
      const deltaX = e.clientX - fabDragRef.current.startX;
      const deltaY = e.clientY - fabDragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        fabDragRef.current.hasMoved = true;
        setIsFabDragging(true);
        const btnWidth = fabButtonRef.current?.offsetWidth || 180;
        const btnHeight = fabButtonRef.current?.offsetHeight || 48;
        const rawX = fabDragRef.current.initialX + deltaX;
        const rawY = fabDragRef.current.initialY + deltaY;
        const clampedX = Math.max(10, Math.min(window.innerWidth - btnWidth - 10, rawX));
        const clampedY = Math.max(10, Math.min(window.innerHeight - btnHeight - 10, rawY));
        setFabPosition({ x: clampedX, y: clampedY });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!fabDragRef.current.active || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - fabDragRef.current.startX;
      const deltaY = e.touches[0].clientY - fabDragRef.current.startY;

      if (Math.hypot(deltaX, deltaY) > 4) {
        fabDragRef.current.hasMoved = true;
        setIsFabDragging(true);
        const btnWidth = fabButtonRef.current?.offsetWidth || 180;
        const btnHeight = fabButtonRef.current?.offsetHeight || 48;
        const rawX = fabDragRef.current.initialX + deltaX;
        const rawY = fabDragRef.current.initialY + deltaY;
        const clampedX = Math.max(10, Math.min(window.innerWidth - btnWidth - 10, rawX));
        const clampedY = Math.max(10, Math.min(window.innerHeight - btnHeight - 10, rawY));
        setFabPosition({ x: clampedX, y: clampedY });
      }
    };

    const handleMouseUp = () => {
      if (fabDragRef.current.active) {
        fabDragRef.current.active = false;
        setTimeout(() => setIsFabDragging(false), 50);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const [formData, setFormData] = useState<AreaStatementData>(initialDefaultFormData);
  const [drawings, setDrawings] = useState<UploadedDrawing[]>(initialDefaultDrawings);

  // Scrutiny result state
  const [summary, setSummary] = useState<ScrutinyReportSummary | null>(null);
  const [checks, setChecks] = useState<ScrutinyCheckResult[]>([]);

  // Subscribe to live System Config updates from Super Admin
  useEffect(() => {
    const unsubscribe = subscribeToConfigChange((newConfig) => {
      setSystemConfig(newConfig);
    });
    return () => unsubscribe();
  }, []);

  // Run initial scrutiny
  useEffect(() => {
    executeScrutiny();
  }, []);

  const executeScrutiny = () => {
    const result = runKeralaBuildingRulesScrutiny(formData, drawings);
    setSummary(result.summary);
    setChecks(result.checks);
    return result;
  };

  const handleFormDataChange = (partial: Partial<AreaStatementData>) => {
    const updated = { ...formData, ...partial };
    setFormData(updated);
    const result = runKeralaBuildingRulesScrutiny(updated, drawings);
    setSummary(result.summary);
    setChecks(result.checks);
  };

  const handleAddDrawing = (drawing: UploadedDrawing) => {
    const updated = [...drawings, drawing];
    setDrawings(updated);
    const result = runKeralaBuildingRulesScrutiny(formData, updated);
    setSummary(result.summary);
    setChecks(result.checks);
    showToast(language === 'ml' ? 'ഡ്രോയിംഗ് ഇൻ-മെമ്മറി പരിശോധിച്ചു' : 'Drawing processed in-memory');
  };

  const handleRemoveDrawing = (id: string) => {
    const updated = drawings.filter((d) => d.id !== id);
    setDrawings(updated);
    const result = runKeralaBuildingRulesScrutiny(formData, updated);
    setSummary(result.summary);
    setChecks(result.checks);
  };

  const handleUpdateDrawing = (id: string, partial: Partial<UploadedDrawing>) => {
    const updated = drawings.map((d) => (d.id === id ? { ...d, ...partial } : d));
    setDrawings(updated);
    const result = runKeralaBuildingRulesScrutiny(formData, updated);
    setSummary(result.summary);
    setChecks(result.checks);
  };

  const handlePurgeDrawings = () => {
    setDrawings([]);
    const result = runKeralaBuildingRulesScrutiny(formData, []);
    setSummary(result.summary);
    setChecks(result.checks);
    showToast(
      language === 'ml'
        ? 'ഡ്രോയിംഗ് മെമ്മറി പൂർണ്ണമായി മായ്‌ച്ചു (സീറോ ക്ലൗഡ് സ്റ്റോറേജ്)'
        : 'All drawings wiped from memory. Zero file retention.'
    );
  };

  const handleReset = () => {
    setFormData(initialDefaultFormData);
    setDrawings(initialDefaultDrawings);
    const result = runKeralaBuildingRulesScrutiny(initialDefaultFormData, initialDefaultDrawings);
    setSummary(result.summary);
    setChecks(result.checks);
    setActiveTab('authority');
    showToast(language === 'ml' ? 'ഫോം പുനഃക്രമീകരിച്ചു' : 'Form reset to default');
  };

  const handleManualRunScrutiny = () => {
    if (isScrutinyRunning) return;
    setIsScrutinyRunning(true);

    const result = executeScrutiny();
    setActiveTab('scrutiny');

    if (currentUser) {
      recordAccessLog(
        currentUser,
        'SCRUTINY_EXECUTED',
        formData.jurisdiction,
        result.summary.overallStatus,
        formData.surveyNumber || 'SURVEY-REF'
      );
    }

    showToast(
      language === 'ml'
        ? 'ചട്ട പരിശോധന പൂർത്തിയായി! ഫലങ്ങൾ താഴെ നൽകിയിരിക്കുന്നു.'
        : 'Rule Scrutiny Complete! Results updated.'
    );

    setTimeout(() => {
      setIsScrutinyRunning(false);
    }, 600);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setActiveTab('authority');
    showToast(language === 'ml' ? 'ലോഗ് ഔട്ട് ചെയ്തു' : 'Signed out successfully');
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    showToast(
      language === 'ml'
        ? `സ്വാഗതം, ${user.name || user.email}`
        : `Welcome back, ${user.name || user.email}`
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // If user is not authenticated, show modern high-converting Sign in view
  if (!currentUser) {
    return (
      <div className="min-h-screen min-h-[100dvh] flex flex-col bg-[#040813] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white overflow-x-hidden">
        {/* Sleek Brand Header */}
        <header className="bg-[#030712]/95 backdrop-blur-md border-b border-cyan-950/80 py-2.5 sm:py-3.5 px-3.5 sm:px-6 shadow-lg relative z-20 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="min-w-0 flex items-center overflow-hidden">
              <VinyasaLogo variant="full" size="md" theme="dark" showDomain={true} className="scale-[0.85] sm:scale-100 origin-left shrink-0" />
            </div>
            <button
              onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
              className="shrink-0 text-xs text-cyan-300 hover:text-white bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 px-3 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-1.5 font-semibold active:scale-95"
            >
              <span>🌐</span>
              <span>{language === 'ml' ? 'English' : 'മലയാളം'}</span>
            </button>
          </div>
        </header>

        {/* Login & Zero Storage Gateway */}
        <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
          <LoginView language={language} onLoginSuccess={handleLoginSuccess} />
        </main>

        {/* Minimal Clean Copyright Footer */}
        <footer className="bg-[#02050e] text-slate-400 text-xs py-3.5 sm:py-4 border-t border-slate-900 text-center relative z-20 shrink-0">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-[11px] sm:text-[12px] font-mono text-slate-400 tracking-wide">
              Copyright © 2026 vinyasa.online - All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const isSuper = isUserSuperAdmin(currentUser);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F19] text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: TabType) => {
          // If non-super admin tries to navigate to admin tab, divert to authority
          if (tab === 'admin' && !isSuper) {
            setActiveTab('authority');
            return;
          }
          setActiveTab(tab);
        }}
        language={language}
        setLanguage={setLanguage}
        jurisdiction={formData.jurisdiction}
        setJurisdiction={(j: JurisdictionType) => handleFormDataChange({ jurisdiction: j })}
        summary={summary}
        currentUser={currentUser}
        onRunScrutiny={handleManualRunScrutiny}
        onReset={handleReset}
        onLogout={handleLogout}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#0F172A] text-cyan-300 border border-cyan-500/50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 space-y-5">
        {/* Vinyasa High-Precision Obsidian Hero Header */}
        <div className="relative overflow-hidden rounded-2xl super-card p-6 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(6,182,212,0.18)]">
          {/* Ambient Glow Orbs */}
          <div className="absolute -right-16 -top-16 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="space-y-4 max-w-4xl">
              {/* Glowing animated pill badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>AI-Powered KMBR & KPBR Compliance Engine</span>
              </div>

              {/* Massive gradient headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-super-glow leading-tight font-['Outfit',sans-serif]">
                Autonomous Architectural Scrutiny for Kerala
              </h1>

              {/* Subheading */}
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
                {language === 'ml'
                  ? 'തദ്ദേശ സ്വയംഭരണ സ്ഥാപനങ്ങൾ, ആർക്കിടെക്റ്റുകൾ, എൻജിനീയർമാർ എന്നിവർക്കായി സെറ്റ്ബാക്ക്, FAR, ഗ്രൗണ്ട് കവറേജ്, റോഡ് വീതി, പാർക്കിംഗ് ചട്ടങ്ങളുടെ തത്സമയ ഓട്ടോമേറ്റഡ് പരിശോധന.'
                  : 'Instant setback calculations, FAR verification, ground coverage checks, road width scrutiny, and parking compliance under Kerala Municipality & Panchayat Building Rules.'}
              </p>
            </div>

            {/* Service Cards (3-Column Obsidian Glass Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Card 1: Automated Drawing Scrutiny */}
              <div 
                onClick={() => setActiveTab('drawings')}
                className="super-card p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:border-cyan-400 transition-all">
                    <span className="text-lg">📐</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    Automated Drawing Scrutiny (KBR Engine)
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    PDF/DWG upload, real-time setback verification, parking validation, and violation detection.
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>{language === 'ml' ? 'പ്ലാനുകൾ പരിശോധിക്കുക' : 'Scrutinize Plans'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Card 2: നോട്ടീസ് & മറുപടികൾ */}
              <div 
                onClick={() => setActiveTab('rfi')}
                className="super-card p-5 cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:border-blue-400 transition-all">
                    <span className="text-lg">📑</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {language === 'ml' ? 'നോട്ടീസ് & ഔദ്യോഗിക മറുപടികൾ' : 'Notices, RFI & Replies'}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {language === 'ml'
                      ? 'കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ നിവാരണ കത്തുകൾ, റൂൾ 60 ഇളവ് അപേക്ഷകൾ, സത്യവാങ്മൂലങ്ങൾ.'
                      : 'K-Smart defect memo replies, Rule 60/62 exemption petitions, and affidavits.'}
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>{language === 'ml' ? 'കത്തുകൾ തയ്യാറാക്കുക' : 'Draft Official Replies'}</span>
                  <span>→</span>
                </div>
              </div>

              {/* Card 3: വിന്യാസ AI ചട്ട ഉപദേശകൻ */}
              <div 
                onClick={() => setFloatingChatOpen(true)}
                className="super-card p-5 cursor-pointer flex flex-col justify-between group border-cyan-500/30"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950 to-indigo-950 border border-cyan-400/50 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)]">
                    <Bot className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    വിന്യാസ AI ചട്ട ഉപദേശകൻ
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Real-time intelligent compliance co-pilot with exact rule numbers, setbacks, and concessions.
                  </p>
                </div>
                <div className="pt-4 flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>{language === 'ml' ? 'ചോദ്യങ്ങൾ ചോദിക്കുക' : 'Ask AI Advisor'}</span>
                  <span>→</span>
                </div>
              </div>
            </div>

            {/* Quick Action Button Dock */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleManualRunScrutiny}
                className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{language === 'ml' ? 'തത്സമയ സ്ക്രൂട്ടിനി ആരംഭിക്കുക' : 'Run Live Scrutiny'}</span>
              </button>

              <button
                onClick={() => setActiveTab('drawings')}
                className="px-5 py-3 rounded-xl font-semibold text-xs bg-slate-900/90 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>📐</span>
                <span>{language === 'ml' ? 'ഡ്രോയിംഗ് & പരിശോധന സ്റ്റുഡിയോ' : 'Drawings & Scrutiny Studio'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Vinyasa AI Co-Worker Agent Switcher Bar */}
        <div className="bg-[#0D1424]/90 border border-cyan-500/30 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
                {language === 'ml'
                  ? 'വിന്യാസ AI ആർക്കിടെക്ചറൽ കോ-വർക്കർ സ്യൂട്ട് (Superbuilt AEC Model)'
                  : 'Vinyasa AI Architectural Co-Worker Suite (Superbuilt AEC Model)'}
              </span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold uppercase">
                100% Free Lifetime
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
              <span className="text-cyan-400">⚡ 9 Full AEC Workflows</span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-emerald-400">🔒 Zero Cloud Retention</span>
            </div>
          </div>

          {/* Quick-Jump Agent Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2.5 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('authority')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'authority'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🏛️</span>
              <span>{language === 'ml' ? '1. പ്രോജക്റ്റ്' : '1. Project'}</span>
            </button>

            <button
              onClick={() => setActiveTab('drawings')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'drawings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📐</span>
              <span>{language === 'ml' ? '2. ഡ്രോയിംഗ്' : '2. Drawings'}</span>
            </button>

            <button
              onClick={() => setActiveTab('redline')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'redline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>🔍</span>
              <span>{language === 'ml' ? '3. CAD റെഡ്‌ലൈൻ' : '3. CAD Redline'}</span>
            </button>

            <button
              onClick={() => setActiveTab('areastatement')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'areastatement'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📋</span>
              <span>{language === 'ml' ? '4. ഏരിയ സ്റ്റേറ്റ്‌മെന്റ്' : '4. Area Statement'}</span>
            </button>

            <button
              onClick={() => {
                executeScrutiny();
                setActiveTab('scrutiny');
              }}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'scrutiny'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>⚖️</span>
              <span>{language === 'ml' ? '5. ചട്ട സ്ക്രൂട്ടിനി' : '5. Code Scrutiny'}</span>
            </button>

            <button
              onClick={() => setActiveTab('rfi')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rfi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📑</span>
              <span>{language === 'ml' ? '6. നോട്ടീസ് & RFI' : '6. Notice & RFI'}</span>
            </button>

            <button
              onClick={() => setActiveTab('boq')}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'boq'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>💰</span>
              <span>{language === 'ml' ? '7. സ്മാർട്ട് BOQ' : '7. Smart BOQ'}</span>
            </button>

            <button
              onClick={() => {
                executeScrutiny();
                setActiveTab('report');
              }}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)] font-bold'
                  : 'bg-[#0B1120] hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>📄</span>
              <span>{language === 'ml' ? '8. പെർമിറ്റ് റിപ്പോർട്ട്' : '8. Permit Report'}</span>
            </button>

            <button
              onClick={() => setFloatingChatOpen(true)}
              className="px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 hover:text-white border border-cyan-500/40"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{language === 'ml' ? 'AI വിന്യാസ അസിസ്റ്റന്റ്' : 'AI Assistant'}</span>
            </button>
          </div>
        </div>

        <ErrorBoundary fallbackTitle="ഘടകങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു">
          {/* Sub-Views */}
          {activeTab === 'authority' && (
            <AuthoritySelector
              data={formData}
              onChange={handleFormDataChange}
              language={language}
              onNext={() => setActiveTab('drawings')}
            />
          )}

          {activeTab === 'drawings' && (
            <DrawingUploader
              drawings={drawings}
              onAddDrawing={handleAddDrawing}
              onRemoveDrawing={handleRemoveDrawing}
              onUpdateDrawing={handleUpdateDrawing}
              onPurgeDrawings={handlePurgeDrawings}
              onApplyExtractedData={(partial) => {
                handleFormDataChange(partial);
                showToast(
                  language === 'ml'
                    ? 'ഡ്രോയിംഗിൽ നിന്ന് കണ്ടെത്തിയ അളവുകൾ ഫോമിലേക്ക് ചേർത്തു!'
                    : 'Extracted drawing measurements applied to Area Statement!'
                );
              }}
              onDirectScrutiny={(synthesizedData) => {
                if (synthesizedData) {
                  const updated = { ...formData, ...synthesizedData };
                  setFormData(updated);
                  const result = runKeralaBuildingRulesScrutiny(updated, drawings);
                  setSummary(result.summary);
                  setChecks(result.checks);
                } else {
                  executeScrutiny();
                }
                setActiveTab('scrutiny');
                showToast(
                  language === 'ml'
                    ? 'ഡ്രോയിംഗ് അടിസ്ഥാനത്തിൽ സമഗ്ര ചട്ട സ്ക്രൂട്ടിനി റിപ്പോർട്ട് ലഭ്യമാക്കി!'
                    : 'Comprehensive statutory scrutiny report generated from blueprints!'
                );
              }}
              currentFormData={formData}
              jurisdiction={formData.jurisdiction}
              occupancy={formData.occupancyGroup}
              language={language}
              onNext={() => setActiveTab('redline')}
              onPrev={() => setActiveTab('authority')}
            />
          )}

          {activeTab === 'redline' && (
            <CADRedlineVisualizer
              data={formData}
              drawings={drawings}
              language={language}
              onNavigateTab={(t) => setActiveTab(t)}
            />
          )}

          {activeTab === 'areastatement' && (
            <AreaStatementForm
              data={formData}
              onChange={handleFormDataChange}
              language={language}
              onNext={() => {
                handleManualRunScrutiny();
              }}
              onPrev={() => setActiveTab('drawings')}
            />
          )}

          {activeTab === 'scrutiny' && (
            <ScrutinyResults
              summary={summary || runKeralaBuildingRulesScrutiny(formData, drawings).summary}
              checks={checks.length > 0 ? checks : runKeralaBuildingRulesScrutiny(formData, drawings).checks}
              language={language}
              onGoToReport={() => {
                setActiveTab('report');
                if (currentUser) {
                  recordAccessLog(
                    currentUser,
                    'REPORT_DOWNLOADED',
                    formData.jurisdiction,
                    (summary || runKeralaBuildingRulesScrutiny(formData, drawings).summary).overallStatus,
                    formData.surveyNumber
                  );
                }
              }}
            />
          )}

          {activeTab === 'rfi' && (
            <RfiGenerator data={formData} language={language} />
          )}

          {activeTab === 'report' && (
            <ReportGenerator
              data={formData}
              summary={summary || runKeralaBuildingRulesScrutiny(formData, drawings).summary}
              checks={checks.length > 0 ? checks : runKeralaBuildingRulesScrutiny(formData, drawings).checks}
              drawings={drawings}
              language={language}
            />
          )}

          {activeTab === 'boq' && (
            <BoqEstimator data={formData} language={language} />
          )}

          {activeTab === 'chatbot' && (
            <div className="max-w-4xl mx-auto py-6">
              <GeminiChatbot
                language={language}
                jurisdiction={formData.jurisdiction}
                projectData={formData}
                mode="embedded"
                onClose={() => setActiveTab('authority')}
              />
            </div>
          )}

          {/* Super Admin Dashboard (Accessible ONLY to super admins) */}
          {activeTab === 'admin' && (
            <AdminPanel
              currentUser={currentUser}
              language={language}
              onToast={showToast}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Floating Chatbot Widget and Launcher Button */}
      {floatingChatOpen && (
        <ErrorBoundary fallbackTitle="Chatbot Error">
          <GeminiChatbot
            language={language}
            jurisdiction={formData.jurisdiction}
            projectData={formData}
            mode="floating"
            onClose={() => setFloatingChatOpen(false)}
          />
        </ErrorBoundary>
      )}

      {/* Floating Action Button - Draggable & Always available on all screens */}
      {!floatingChatOpen && (
        <button
          ref={fabButtonRef}
          id="floating-ai-chat-btn"
          onMouseDown={handleFabDragStart}
          onTouchStart={handleFabDragStart}
          onClick={() => {
            if (fabDragRef.current.hasMoved) return;
            setFloatingChatOpen(true);
            if (currentUser) {
              recordAccessLog(
                currentUser,
                'AI_ADVISOR_CONSULTED',
                formData.jurisdiction,
                undefined,
                'AI_CONSULTATION'
              );
            }
          }}
          style={
            fabPosition
              ? {
                  left: `${fabPosition.x}px`,
                  top: `${fabPosition.y}px`,
                  right: 'auto',
                  bottom: 'auto',
                  margin: 0,
                }
              : undefined
          }
          className={`fixed z-40 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-4 py-3 rounded-full shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center gap-2.5 font-bold text-xs sm:text-sm border-2 border-white/20 transition-all transform hover:scale-105 active:scale-95 group cursor-grab active:cursor-grabbing select-none ${
            !fabPosition ? 'bottom-6 right-6' : ''
          }`}
          title={
            language === 'ml'
              ? 'വിന്യാസ AI കെട്ടിട നിർമ്മാണ ചട്ട ഉപദേശകൻ (നീക്കാൻ ഡ്രാഗ് ചെയ്യാം)'
              : 'Open VINYASA AI Building Rules Advisor (Drag to reposition)'
          }
        >
          <div className="relative flex items-center justify-center pointer-events-none">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          </div>
          <span className="pointer-events-none">{language === 'ml' ? 'വിന്യാസ AI അസിസ്റ്റന്റ്' : 'Ask VINYASA AI'}</span>
          <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:rotate-12 transition-transform text-slate-950 pointer-events-none" />
        </button>
      )}

      {/* Global Promotional & Informational Ad Player Modal */}
      <AdPlayerModal currentUser={currentUser} language={language} />

      {/* Footer */}
      <footer className="bg-[#030712] text-slate-400 text-xs py-6 border-t border-slate-800/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <VinyasaLogo size="sm" showDomain={false} />
              <div className="text-slate-400 text-xs max-w-xl leading-relaxed border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
                {language === 'ml'
                  ? 'കേരള മുനിസിപ്പാലിറ്റി & പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (KMBR / KPBR 2019) കൃത്യമായി അപഗ്രഥിക്കുന്ന ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് സിസ്റ്റം.'
                  : 'Kerala Municipality & Panchayat Building Rules (KMBR / KPBR 2019) statutory intelligence & blueprint scrutiny system.'}
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1.5">
              <div className="flex items-center gap-1.5 text-xs text-cyan-300/90 font-medium">
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-400">{language === 'ml' ? 'ഇമെയിൽ ഐഡി:' : 'Email ID:'}</span>
                <a
                  href="mailto:vinyasaonline.ai@gmail.com"
                  className="text-cyan-300 hover:text-cyan-200 underline decoration-cyan-500/40 hover:decoration-cyan-300 transition-colors font-mono"
                >
                  vinyasaonline.ai@gmail.com
                </a>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Copyright © 2026 vinyasa.online - All Rights Reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
