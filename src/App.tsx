import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthoritySelector } from './components/AuthoritySelector';
import { DrawingUploader } from './components/DrawingUploader';
import { AreaStatementForm } from './components/AreaStatementForm';
import { ScrutinyResults } from './components/ScrutinyResults';
import { ReportGenerator } from './components/ReportGenerator';
import { RulesExplorer } from './components/RulesExplorer';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AdminPanel } from './components/AdminPanel';
import { LoginView } from './components/LoginView';
import { VinyasaLogo } from './components/VinyasaLogo';
import { Bot, Sparkles, Lock, Bell, EyeOff, ShieldCheck, CheckCircle2, X } from 'lucide-react';
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
  localBodyName: 'Kizhakkambalam Grama Panchayat',
  projectName: 'Proposed Residential Building',
  applicantName: 'Project Applicant',
  architectEngineerName: 'Er. Rajesh Kumar, B.Tech (Civil)',
  licenseNumber: 'LSGD/ENG/A/2024/0984',
  surveyNumber: '342/1-B',
  wardNumber: 'Ward 04',
  villageName: 'Kizhakkambalam',
  talukName: 'Kunnathunad',
  occupancyGroup: 'A1',
  plotType: 'normal',
  plotAreaSqM: 202.34,
  plotAreaCents: 5.0,
  plotWidthM: 14.0,
  plotDepthM: 14.5,
  roadAccessWidthM: 3.0,
  groundCoverageSqM: 98.5,
  totalBuiltUpAreaSqM: 185.0,
  totalFloorAreaSqM: 175.2,
  totalCarpetAreaSqM: 142.0,
  numberOfFloors: 2,
  buildingHeightM: 6.8,
  floors: [
    { floorName: 'Ground Floor', builtUpArea: 98.5, carpetArea: 76.0, occupancy: 'A1', heightFromGround: 0.6 },
    { floorName: 'First Floor', builtUpArea: 86.5, carpetArea: 66.0, occupancy: 'A1', heightFromGround: 3.6 },
  ],
  frontSetbackM: 3.2,
  rearSetbackM: 2.1,
  sideSetback1M: 1.35,
  sideSetback2M: 1.25,
  carParkingProvided: 1,
  twoWheelerParkingProvided: 2,
  disabledParkingProvided: 0,
  loadingBaysProvided: 0,
  parkingBayWidthM: 2.5,
  parkingBayLengthM: 5.0,
  drivewayWidthM: 3.0,
  openWellInPlot: true,
  distanceWellToSepticTankM: 7.8,
  distanceWellToSoakPitM: 8.0,
  distanceSepticTankToBoundaryM: 1.3,
  rwhTankCapacityLiters: 5000,
  solarPvCapacityKwp: 1.5,
  solidWasteUnitProvided: true,
  biogasPlantOrCompostProvided: true,
  mainStaircaseWidthM: 1.0,
  staircaseTreadCm: 25.0,
  staircaseRiserCm: 17.0,
  staircaseHeadroomM: 2.2,
  minHabitableRoomAreaSqM: 9.5,
  minHabitableRoomWidthM: 2.4,
  minHabitableRoomHeightM: 3.0,
  minKitchenAreaSqM: 5.0,
  minKitchenWidthM: 1.8,
  ventilationRatioPercent: 12.0,
  clearFirePassageWidthM: 1.5,
  hasLift: false,
  hasRampForDisabled: false,
  rampSlopeRatio: 10,
};

const initialDefaultDrawings: UploadedDrawing[] = [
  {
    id: 'dwg-1',
    category: 'site_plan',
    name: 'Site_Plan_Cad_Survey_342_1B.pdf',
    size: 1940000,
    status: 'verified',
    scale: '1:200',
    sheetsCount: 1,
    extractedLabels: ['PLOT_BOUNDARY', 'SETBACK_FRONT', 'SETBACK_REAR', 'SETBACK_SIDE_1', 'SETBACK_SIDE_2', 'ACCESS_ROAD'],
    remarks: 'Auto-extracted from CAD layers with verified boundary coordinates.',
    uploadedAt: Date.now() - 3600000,
  },
  {
    id: 'dwg-2',
    category: 'floor_plans',
    name: 'Ground_Floor_and_First_Floor_Plan.pdf',
    size: 2450000,
    status: 'verified',
    scale: '1:100',
    sheetsCount: 2,
    extractedLabels: ['PLINTH_AREA', 'ROOM_DIMENSIONS', 'STAIR_CASE', 'DOORS_WINDOWS'],
    remarks: 'Plinth area and room sizes verified against Kerala Building Rules standards.',
    uploadedAt: Date.now() - 3000000,
  },
];

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getCurrentUser());
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(getSystemConfig());
  const [dismissNotice, setDismissNotice] = useState(false);

  const [language, setLanguage] = useState<Language>('ml');
  const [activeTab, setActiveTab] = useState<TabType>('authority');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [floatingChatOpen, setFloatingChatOpen] = useState<boolean>(false);

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

  // Run scrutiny on initial mount and when requested
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
      <div className="min-h-screen flex flex-col bg-[#040813] text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
        {/* Sleek Brand Header */}
        <header className="bg-[#030712]/90 backdrop-blur-md border-b border-cyan-950/80 py-3.5 px-6 shadow-lg relative z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <VinyasaLogo variant="full" size="md" theme="dark" showDomain={true} />
            <button
              onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
              className="text-xs text-cyan-300 hover:text-white bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all shadow-sm flex items-center gap-1.5 font-semibold"
            >
              <span>🌐</span>
              <span>{language === 'ml' ? 'English' : 'മലയാളം'}</span>
            </button>
          </div>
        </header>

        {/* Login & Zero Storage Gateway */}
        <main className="flex-1 flex items-center justify-center">
          <LoginView language={language} onLoginSuccess={handleLoginSuccess} />
        </main>

        {/* Minimal Clean Copyright Footer */}
        <footer className="bg-[#02050e] text-slate-400 text-xs py-5 border-t border-slate-900 text-center relative z-20">
          <div className="max-w-7xl mx-auto px-4">
            <p className="text-[12px] font-mono text-slate-400 tracking-wide">
              Copyright © 2026 vinyasa.online - All Rights Reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const isSuper = isUserSuperAdmin(currentUser);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
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
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-cyan-300 border border-cyan-500/50 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-4">
        
        {/* Live System Broadcast Notice (Configurable in real-time by Super Admin) */}
        {systemConfig.notice.enabled && !dismissNotice && (
          <div className="bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-400/40 rounded-2xl p-3.5 text-amber-950 flex items-center justify-between gap-3 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-900 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-amber-950 mr-1.5">
                  {language === 'ml' ? systemConfig.notice.titleMl : systemConfig.notice.titleEn}:
                </span>
                <span className="text-amber-900 font-medium">
                  {language === 'ml' ? systemConfig.notice.messageMl : systemConfig.notice.messageEn}
                </span>
              </div>
            </div>
            <button
              onClick={() => setDismissNotice(true)}
              className="p-1 text-amber-800 hover:text-amber-950 rounded-lg hover:bg-amber-400/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

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
            language={language}
            onNext={() => setActiveTab('areastatement')}
            onPrev={() => setActiveTab('authority')}
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

        {activeTab === 'scrutiny' && summary && (
          <ScrutinyResults
            summary={summary}
            checks={checks}
            language={language}
            onGoToReport={() => {
              setActiveTab('report');
              if (currentUser) {
                recordAccessLog(
                  currentUser,
                  'REPORT_DOWNLOADED',
                  formData.jurisdiction,
                  summary.overallStatus,
                  formData.surveyNumber
                );
              }
            }}
          />
        )}

        {activeTab === 'report' && summary && (
          <ReportGenerator
            data={formData}
            summary={summary}
            checks={checks}
            drawings={drawings}
            language={language}
          />
        )}

        {activeTab === 'rulebook' && <RulesExplorer language={language} />}

        {activeTab === 'chatbot' && (
          <div className="space-y-4">
            <div className="bg-[#0A1326] border border-cyan-900/50 rounded-2xl p-5 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                  <Bot className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-['Outfit',sans-serif]">
                    {language === 'ml' ? 'വിന്യാസ AI സാങ്കേതിക ഉപദേശകൻ' : 'VINYASA AI Compliance Advisor'}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-mono">
                      Gemini 2.5 Multi-turn
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {language === 'ml'
                      ? 'KMBR / KPBR ചട്ട സംശയങ്ങൾ, സെറ്റ്ബാക്ക് കണക്കുകൂട്ടലുകൾ, പ്ലാനിലെ അപാകതകൾ, കെ-സ്മാർട്ട് നടപടിക്രമങ്ങൾ എന്നിവ തത്സമയം ചോദിക്കാം.'
                      : 'Real-time multi-turn building rules scrutiny, setback verification, defect diagnosis & K-Smart filing support.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-cyan-300 bg-cyan-950/80 px-3 py-1.5 rounded-lg border border-cyan-800/60 font-mono font-medium">
                  {formData.jurisdiction === 'KMBR' ? '🏛️ KMBR 2019' : '🏡 KPBR 2019'}
                </span>
              </div>
            </div>

            <div className="h-[750px]">
              <GeminiChatbot
                language={language}
                jurisdiction={formData.jurisdiction}
                projectData={formData}
                mode="embedded"
              />
            </div>
          </div>
        )}

        {/* Super Admin Dashboard (Accessible ONLY to sanoop.amrita@gmail.com) */}
        {activeTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            language={language}
            onToast={showToast}
          />
        )}
      </main>

      {/* Floating Chatbot Widget and Launcher Button */}
      {floatingChatOpen && (
        <GeminiChatbot
          language={language}
          jurisdiction={formData.jurisdiction}
          projectData={formData}
          mode="floating"
          onClose={() => setFloatingChatOpen(false)}
        />
      )}

      {/* Floating Action Button */}
      {!floatingChatOpen && activeTab !== 'chatbot' && (
        <button
          id="floating-ai-chat-btn"
          onClick={() => {
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
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-4 py-3 rounded-full shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center gap-2.5 font-bold text-xs sm:text-sm border-2 border-white/20 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer"
          title="Open VINYASA AI Building Rules Advisor"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-5 h-5 text-slate-950" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
          </div>
          <span>{language === 'ml' ? 'വിന്യാസ AI അസിസ്റ്റന്റ്' : 'Ask VINYASA AI'}</span>
          <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:rotate-12 transition-transform text-slate-950" />
        </button>
      )}

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

            <div className="text-[11px] text-slate-400 font-mono">
              Copyright © 2026 vinyasa.online - All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
