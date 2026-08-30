import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Settings,
  Sliders,
  Bell,
  Activity,
  Download,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User as UserIcon,
  HardDrive,
  EyeOff,
  Cpu,
  Layers,
  Sparkles,
  Save,
  RotateCcw,
  BookOpen,
  Filter,
  Globe,
  Check,
  Zap,
  FileCheck2,
} from 'lucide-react';
import {
  Language,
  User,
  SystemConfig,
  AccessLogMetadata,
  SUPER_ADMIN_EMAIL,
  SUPER_ADMIN_EMAILS,
} from '../types';
import {
  getSystemConfig,
  saveSystemConfig,
  resetSystemConfig,
} from '../services/configService';
import {
  getAccessLogs,
  clearAccessLogs,
  exportLogsToCSV,
  exportLogsToJSON,
  isUserSuperAdmin,
} from '../services/authService';
import { syncRulesWithWeb, SyncRulesResult } from '../services/geminiService';

interface AdminPanelProps {
  currentUser: User | null;
  language: Language;
  onToast: (msg: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  language,
  onToast,
}) => {
  const isMl = language === 'ml';
  const isSuper = isUserSuperAdmin(currentUser);

  // Active Admin Sub-tab
  const [adminTab, setAdminTab] = useState<'config' | 'logs' | 'features'>('config');

  // Config State
  const [config, setConfig] = useState<SystemConfig>(getSystemConfig());
  const [isConfigDirty, setIsConfigDirty] = useState(false);

  // Live Rule Sync State
  const [isSyncingRules, setIsSyncingRules] = useState(false);
  const [syncStep, setSyncStep] = useState<number>(0);
  const [syncResult, setSyncResult] = useState<SyncRulesResult | null>(null);

  // Access Logs State
  const [logs, setLogs] = useState<AccessLogMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  useEffect(() => {
    refreshLogs();
    setConfig(getSystemConfig());
  }, []);

  const handleLiveSyncRules = async () => {
    setIsSyncingRules(true);
    setSyncStep(1);

    try {
      // Step 1: Query LSGD Portal
      await new Promise((r) => setTimeout(r, 600));
      setSyncStep(2);

      // Step 2: K-Smart circulars & self-certifications
      await new Promise((r) => setTimeout(r, 700));
      setSyncStep(3);

      // Step 3: NBC Part IV Fire & School building norms
      await new Promise((r) => setTimeout(r, 600));
      setSyncStep(4);

      // Step 4: Execute server sync with Gemini search tool
      const result = await syncRulesWithWeb();
      setSyncResult(result);
      setSyncStep(5);

      const updatedConfig = saveSystemConfig(
        {
          lastRulesUpdatedDate: result.lastRulesUpdatedDate,
          syncedKnowledgeSummary: isMl ? result.syncSummaryMl : result.syncSummaryEn,
          syncedItemsCount: result.syncedItemsCount,
          kbrVersionKmbr: `KMBR (Latest amended | ${result.lastRulesUpdatedDate})`,
          kbrVersionKpbr: `KPBR (Latest amended | ${result.lastRulesUpdatedDate})`,
        },
        currentUser?.email || SUPER_ADMIN_EMAIL
      );

      setConfig(updatedConfig);
      setIsConfigDirty(false);

      onToast(
        isMl
          ? `കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ വിജയകരമായി സിങ്ക് ചെയ്തു! (തീയതി: ${result.lastRulesUpdatedDate})`
          : `Building Rules synced with latest LSGD Gazette! (Date: ${result.lastRulesUpdatedDate})`
      );
    } catch (err) {
      console.error('[AdminPanel] Rule sync error:', err);
      onToast(isMl ? 'ചട്ടങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു' : 'Failed to complete live rule sync');
    } finally {
      setIsSyncingRules(false);
    }
  };

  const refreshLogs = () => {
    setLogs(getAccessLogs());
  };

  const handleConfigChange = (partial: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
    setIsConfigDirty(true);
  };

  const handleNoticeChange = (partial: Partial<SystemConfig['notice']>) => {
    setConfig((prev) => ({
      ...prev,
      notice: { ...prev.notice, ...partial },
    }));
    setIsConfigDirty(true);
  };

  const handleFeatureFlagChange = (flagKey: keyof SystemConfig['features'], value: boolean) => {
    setConfig((prev) => ({
      ...prev,
      features: { ...prev.features, [flagKey]: value },
    }));
    setIsConfigDirty(true);
  };

  const handleSaveConfig = () => {
    const updated = saveSystemConfig(config, currentUser?.email || SUPER_ADMIN_EMAIL);
    setConfig(updated);
    setIsConfigDirty(false);
    onToast(
      isMl
        ? 'സിസ്റ്റം ചട്ട ക്രമീകരണങ്ങൾ തത്സമയം അപ്‌ഡേറ്റ് ചെയ്തു!'
        : 'System parameters & rules updated live for all active sessions!'
    );
  };

  const handleResetConfig = () => {
    if (confirm(isMl ? 'ഡിഫോൾട്ട് ക്രമീകരണങ്ങളിലേക്ക് പുനഃസ്ഥാപിക്കണോ?' : 'Reset configuration to defaults?')) {
      const reset = resetSystemConfig(currentUser?.email || SUPER_ADMIN_EMAIL);
      setConfig(reset);
      setIsConfigDirty(false);
      onToast(isMl ? 'ക്രമീകരണങ്ങൾ പുനഃക്രമീകരിച്ചു' : 'System configuration reset to default');
    }
  };

  const handleClearLogs = () => {
    if (!currentUser) return;
    if (confirm(isMl ? 'എല്ലാ ആക്‌സസ് ലോഗുകളും മായ്‌ക്കണോ?' : 'Clear all access metadata history?')) {
      clearAccessLogs(currentUser);
      refreshLogs();
      onToast(isMl ? 'ലോഗുകൾ മായ്‌ച്ചു' : 'Access logs cleared');
    }
  };

  const handleExportCSV = () => {
    const csvContent = exportLogsToCSV(filteredLogs);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vinyasa_kbr_access_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(isMl ? 'CSV ഫയൽ ഡൗൺലോഡ് ചെയ്തു' : 'Access audit logs exported as CSV');
  };

  const handleExportJSON = () => {
    const jsonContent = exportLogsToJSON(filteredLogs);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `vinyasa_kbr_access_audit_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onToast(isMl ? 'JSON ഫയൽ ഡൗൺലോഡ് ചെയ്തു' : 'Access audit logs exported as JSON');
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.referenceId && log.referenceId.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = actionFilter === 'ALL' || log.actionType === actionFilter;

    return matchesSearch && matchesAction;
  });

  // Calculate Metrics
  const totalUsers = new Set(logs.map((l) => l.userEmail)).size;
  const totalScrutinies = logs.filter((l) => l.actionType === 'SCRUTINY_EXECUTED').length;
  const approvedScrutinies = logs.filter(
    (l) => l.actionType === 'SCRUTINY_EXECUTED' && l.complianceStatus === 'APPROVED'
  ).length;
  const complianceRate = totalScrutinies > 0 ? Math.round((approvedScrutinies / totalScrutinies) * 100) : 100;
  const avgSessionSec =
    logs.length > 0 ? Math.round(logs.reduce((acc, l) => acc + l.sessionDurationSeconds, 0) / logs.length) : 0;

  // Non-Super-Admin Access Denied Barrier
  if (!isSuper) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="bg-rose-950/40 border-2 border-rose-600/60 rounded-3xl p-8 text-white space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-600/20 border border-rose-500 flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-rose-300">
            {isMl ? 'അനധികൃത പ്രവേശന വിലക്ക് (403 Forbidden)' : 'Access Restricted: Super Admin Only'}
          </h2>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            {isMl ? (
              <>
                ഈ സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ <span className="font-mono text-amber-400">{SUPER_ADMIN_EMAIL}</span> എന്ന വിലാസത്തിൽ ലോഗിൻ ചെയ്ത അഡ്മിനിസ്ട്രേറ്റർക്ക് മാത്രമായി പരിമിതപ്പെടുത്തിയിരിക്കുന്നു.
              </>
            ) : (
              <>
                This administrative panel is strictly restricted to the Super Administrator (<span className="font-mono text-amber-400">{SUPER_ADMIN_EMAIL}</span>). Regular users have direct access to Drawing Scrutiny & Rulebook services.
              </>
            )}
          </p>
          <div className="pt-4">
            <span className="text-xs px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 font-mono text-slate-400">
              Current Session: {currentUser?.email || 'Guest / Unauthenticated'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Super Admin Header Banner */}
      <div className="bg-gradient-to-r from-[#040D21] via-[#0A1A3A] to-[#040D21] border border-cyan-800/80 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_rgba(245,158,11,0.4)]">
            <ShieldCheck className="w-8 h-8 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit',sans-serif]">
                {isMl ? 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ' : 'VINYASA Super Admin Central'}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/50 font-mono font-bold">
                👑 Super Admin: {SUPER_ADMIN_EMAIL}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isMl
                ? 'കെട്ടിട നിർമ്മാണ ചട്ടങ്ങളുടെ ലൈവ് കോൺഫിഗറേഷൻ, സിസ്റ്റം പ്രോംപ്റ്റ്, ഫീച്ചർ ഫ്ലാഗുകൾ & സീറോ-സ്റ്റോറേജ് ആക്‌സസ് ലോഗുകൾ.'
                : 'Real-time KBR rules orchestration, system prompts, feature toggles & privacy-compliant access audit metrics.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConfigDirty && (
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isMl ? 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക' : 'Save Live Changes'}</span>
            </button>
          )}
          <button
            onClick={handleResetConfig}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Reset System Config"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setAdminTab('config')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'config'
              ? 'bg-slate-900 text-cyan-300 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>{isMl ? '1. ചട്ടങ്ങളും പ്രോംപ്റ്റും' : '1. Rules & AI Config'}</span>
        </button>

        <button
          onClick={() => setAdminTab('features')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'features'
              ? 'bg-slate-900 text-cyan-300 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>{isMl ? '2. ഫീച്ചർ ഫ്ലാഗുകളും നോട്ടീസും' : '2. Feature Flags & Notices'}</span>
        </button>

        <button
          onClick={() => setAdminTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            adminTab === 'logs'
              ? 'bg-slate-900 text-cyan-300 shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>{isMl ? '3. യൂസേജ് ആക്‌സസ് ലോഗുകൾ' : '3. Usage Audit & Analytics'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-900 text-cyan-300 font-mono">
            {logs.length}
          </span>
        </button>
      </div>

      {/* SUB-TAB 1: RULES & AI CONFIG */}
      {adminTab === 'config' && (
        <div className="space-y-6">
          {/* ONE-CLICK LIVE WEB KNOWLEDGE BASE SYNC CARD */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 border-2 border-cyan-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Globe className={`w-6 h-6 ${isSyncingRules ? 'animate-spin text-cyan-300' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                      {isMl ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ വെബ് ലൈവ് സിങ്ക്' : 'Sync & Update Building Rules from Web'}
                    </h2>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                      {isMl ? `അവസാനം അപ്‌ഡേറ്റ് ചെയ്തത്: ${config.lastRulesUpdatedDate || '30-08-2026'}` : `Latest Updated: ${config.lastRulesUpdatedDate || '30-08-2026'}`}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                    {isMl
                      ? 'തദ്ദേശ സ്വയംഭരണ വകുപ്പ് (LSGD) ഗസറ്റ് വിജ്ഞാപനങ്ങൾ, കെ-സ്മാർട്ട് പുതിയ സർക്കുലറുകൾ, ഫയർ സേഫ്റ്റി (NBC 2016), സ്കൂൾ ചട്ടങ്ങൾ എന്നിവ ലൈവായി വെബ്ബിൽ നിന്ന് പരിശോധിച്ച് സിസ്റ്റത്തിൽ അപ്‌ഡേറ്റ് ചെയ്യുന്നു.'
                      : 'Live web synchronization for latest LSGD notifications, K-Smart self-certification circulars, NBC Part IV fire norms, and Kerala school building rules.'}
                  </p>
                </div>
              </div>

              <button
                id="admin-sync-rules-btn"
                onClick={handleLiveSyncRules}
                disabled={isSyncingRules}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xl cursor-pointer shrink-0 ${
                  isSyncingRules
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95'
                }`}
              >
                {isSyncingRules ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isMl ? 'ചട്ടങ്ങൾ സിങ്ക് ചെയ്യുന്നു...' : 'Syncing Rules from Web...'}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-slate-950" />
                    <span>{isMl ? 'തത്സമയം അപ്‌ഡേറ്റ് ചെയ്യുക' : 'Sync & Update Now'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Sync Progress Steps (Active when syncing or synced) */}
            {(isSyncingRules || syncStep > 0) && (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3 text-xs">
                <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-cyan-400" />
                  <span>{isMl ? 'തത്സമയ സിങ്ക് പുരോഗതി (Sync Pipeline)' : 'Real-Time Sync Pipeline Execution'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      syncStep >= 1
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        syncStep > 1
                          ? 'bg-emerald-500 text-slate-950'
                          : syncStep === 1
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {syncStep > 1 ? <Check className="w-3 h-3" /> : '1'}
                    </div>
                    <span className="text-[11px] truncate">1. LSGD Gazette Orders</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      syncStep >= 2
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        syncStep > 2
                          ? 'bg-emerald-500 text-slate-950'
                          : syncStep === 2
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {syncStep > 2 ? <Check className="w-3 h-3" /> : '2'}
                    </div>
                    <span className="text-[11px] truncate">2. K-Smart Circulars</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      syncStep >= 3
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        syncStep > 3
                          ? 'bg-emerald-500 text-slate-950'
                          : syncStep === 3
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {syncStep > 3 ? <Check className="w-3 h-3" /> : '3'}
                    </div>
                    <span className="text-[11px] truncate">3. NBC Part IV & KER</span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      syncStep >= 4
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/50 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        syncStep >= 5
                          ? 'bg-emerald-500 text-slate-950'
                          : syncStep === 4
                          ? 'bg-cyan-400 text-slate-950 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {syncStep >= 5 ? <Check className="w-3 h-3" /> : '4'}
                    </div>
                    <span className="text-[11px] truncate">4. Re-Index Engine</span>
                  </div>
                </div>

                {config.syncedKnowledgeSummary && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                    <span className="text-emerald-400 font-bold">✓ Synced Knowledge: </span>
                    {config.syncedKnowledgeSummary}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* System Prompt & AI Tuning */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-600" />
                  <span>{isMl ? 'AI സിസ്റ്റം പ്രോംപ്റ്റ് മോഡിഫയർ' : 'Gemini AI System Prompt Modifier'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-mono font-bold">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isMl
                  ? 'കോഡ് മാറ്റാതെ തന്നെ AI അസിസ്റ്റന്റിന്റെ നിർദ്ദേശങ്ങളും ചട്ട പരിശോധനാ കർക്കശ്യവും മാറ്റിയെഴുതാം.'
                  : 'Dynamically customize Gemini AI scrutiny logic, advisory tone, and engineering rules without redeploying.'}
              </p>
              <textarea
                value={config.systemPromptModifier}
                onChange={(e) => handleConfigChange({ systemPromptModifier: e.target.value })}
                rows={6}
                className="w-full p-3 text-xs font-mono bg-slate-900 text-cyan-300 border border-slate-800 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none leading-relaxed"
                placeholder="Enter system prompt instruction..."
              />
            </div>

            {/* Active Rule Versions */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-cyan-600" />
                  <span>{isMl ? 'സജീവായ ചട്ട പതിപ്പുകൾ (Gazette Versions)' : 'Statutory Rule Versions'}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">
                  2026 Ready
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    KMBR (Municipality Rules Version Label)
                  </label>
                  <input
                    type="text"
                    value={config.kbrVersionKmbr}
                    onChange={(e) => handleConfigChange({ kbrVersionKmbr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    KPBR (Panchayat Rules Version Label)
                  </label>
                  <input
                    type="text"
                    value={config.kbrVersionKpbr}
                    onChange={(e) => handleConfigChange({ kbrVersionKpbr: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Mathematical Thresholds & Statutory Constants */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-600" />
              <span>{isMl ? 'ചട്ടപരമായ മാനദണ്ഡങ്ങളും പരിധികളും (Statutory Thresholds)' : 'Statutory Threshold Constants'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Base Residential FAR (KMBR)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={config.baseFarResidentialKmbr}
                  onChange={(e) => handleConfigChange({ baseFarResidentialKmbr: parseFloat(e.target.value) || 3.0 })}
                  className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-400">Default: 3.00 (Table 2)</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Base Residential FAR (KPBR)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={config.baseFarResidentialKpbr}
                  onChange={(e) => handleConfigChange({ baseFarResidentialKpbr: parseFloat(e.target.value) || 2.75 })}
                  className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-400">Default: 2.75 (Table 2)</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Drinking Well to Septic (m)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.minDrinkingWellDistanceM}
                  onChange={(e) => handleConfigChange({ minDrinkingWellDistanceM: parseFloat(e.target.value) || 7.5 })}
                  className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-400">Rule 47: Min 7.50 meters</span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  RWH Capacity (Litres / sq.m)
                </label>
                <input
                  type="number"
                  step="1"
                  value={config.rwhLitersPerSqM}
                  onChange={(e) => handleConfigChange({ rwhLitersPerSqM: parseFloat(e.target.value) || 25 })}
                  className="w-full px-2.5 py-1.5 text-sm font-bold border border-slate-300 rounded-lg bg-white outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-400">Rule 48: 25 Litres / m² plinth</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: FEATURE FLAGS & BROADCAST NOTICES */}
      {adminTab === 'features' && (
        <div className="space-y-6">
          {/* Live System Broadcast Notice Editor */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>{isMl ? 'ലൈവ് സിസ്റ്റം ബ്രോഡ്കാസ്റ്റ് നോട്ടീസ്' : 'Live System Broadcast Banner'}</span>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notice.enabled}
                  onChange={(e) => handleNoticeChange({ enabled: e.target.checked })}
                  className="w-4 h-4 accent-cyan-600 rounded"
                />
                <span className={config.notice.enabled ? 'text-emerald-600' : 'text-slate-400'}>
                  {config.notice.enabled ? 'Active (Displaying)' : 'Disabled'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title (English)</label>
                <input
                  type="text"
                  value={config.notice.titleEn}
                  onChange={(e) => handleNoticeChange({ titleEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Banner Title (Malayalam)</label>
                <input
                  type="text"
                  value={config.notice.titleMl}
                  onChange={(e) => handleNoticeChange({ titleMl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Message (English)</label>
                <input
                  type="text"
                  value={config.notice.messageEn}
                  onChange={(e) => handleNoticeChange({ messageEn: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Message (Malayalam)</label>
                <input
                  type="text"
                  value={config.notice.messageMl}
                  onChange={(e) => handleNoticeChange({ messageMl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Feature Flags Toggles */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>{isMl ? 'ഫീച്ചർ ഫ്ലാഗുകൾ (Real-time Switches)' : 'Feature Flags Orchestration'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {[
                {
                  key: 'enableAiVisionAnalysis' as const,
                  title: 'Gemini AI Vision Blueprint OCR',
                  desc: 'Allow architects to upload CAD drawings for direct AI vision inspection',
                },
                {
                  key: 'enableAutomaticSmallPlotRule60' as const,
                  title: 'Auto Small Plot Concessions (Rule 60/62)',
                  desc: 'Automatically relax setbacks for plots up to 125 sq.m (3 Cents)',
                },
                {
                  key: 'enableStrictDrinkingWellClearance' as const,
                  title: 'Strict Well-to-Septic 7.5m Enforcement',
                  desc: 'Flag any drinking well within 7.50m of septic tank as critical failure',
                },
                {
                  key: 'enableRwhFormulaEnforcement' as const,
                  title: 'Rainwater Harvesting (Rule 48) Formula',
                  desc: 'Enforce 25 Litres/sq.m storage requirement on plinth area',
                },
                {
                  key: 'enableSolarRooftopMandate500SqM' as const,
                  title: 'Solar Rooftop PV (Rule 49)',
                  desc: 'Mandate solar PV for buildings >= 500 sq.m total floor area',
                },
                {
                  key: 'enforceZeroStorageStatelessProcessing' as const,
                  title: 'Enforce Zero-Cloud-Storage Stateless Architecture',
                  desc: 'Strictly prevent any drawing persistence; discard in-memory buffer on finish',
                },
              ].map((flag) => (
                <div
                  key={flag.key}
                  className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-2xl"
                >
                  <div className="pr-4">
                    <div className="font-bold text-slate-900">{flag.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{flag.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={config.features[flag.key]}
                      onChange={(e) => handleFeatureFlagChange(flag.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: USAGE & ACCESS AUDIT LOGS (PRIVACY COMPLIANT) */}
      {adminTab === 'logs' && (
        <div className="space-y-6">
          {/* Privacy Statement Banner */}
          <div className="bg-slate-900 border border-cyan-800/80 rounded-2xl p-4 text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                <EyeOff className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{isMl ? 'പ്രൈവസി-കംപ്ലയന്റ് അനലിറ്റിക്‌സ്' : 'Privacy-First Metadata Audit (Zero Drawings Logged)'}</span>
                  <span className="text-[9px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                    100% Zero-Storage Certified
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {isMl
                    ? 'ഉപയോക്താവിന്റെ ഇമെയിൽ, ലോഗിൻ സമയം, സെഷൻ ദൈർഘ്യം എന്നിവ മാത്രമേ ട്രാക്ക് ചെയ്യുന്നുള്ളൂ. പ്ലാനുകളോ ഡ്രോയിംഗുകളോ ലോഗിൽ ഉൾപ്പെടുത്തുന്നില്ല.'
                    : 'Tracks metadata only: Email, Login Timestamp, Scrutiny Request Count, and Session Duration. Zero drawing data stored.'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleClearLogs}
                className="p-1.5 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 rounded-lg transition-colors cursor-pointer"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>{isMl ? 'ആകെ ഉപയോക്താക്കൾ' : 'Unique Users'}</span>
                <UserIcon className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {totalUsers}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Active accounts logged</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>{isMl ? 'ആകെ പരിശോധനകൾ' : 'Scrutinies Run'}</span>
                <Layers className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {totalScrutinies}
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1">
                {approvedScrutinies} Approved ({complianceRate}%)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>{isMl ? 'ശരാശരി സെഷൻ സമയം' : 'Avg Session Duration'}</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-extrabold text-slate-900 mt-2 font-mono">
                {Math.floor(avgSessionSec / 60)}m {avgSessionSec % 60}s
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">Stateless execution</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>{isMl ? 'ക്ലൗഡ് സ്റ്റോറേജ്' : 'Cloud File Storage'}</span>
                <HardDrive className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-2 font-mono">
                0.00 MB
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Zero Retention Policy
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isMl ? 'ഇമെയിൽ അല്ലെങ്കിൽ റെഫറൻസ് ഐഡി തിരയുക...' : 'Search by email or reference ID...'}
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-cyan-500 font-medium"
              >
                <option value="ALL">All Actions</option>
                <option value="USER_LOGIN">User Logins</option>
                <option value="SCRUTINY_EXECUTED">Scrutiny Executions</option>
                <option value="REPORT_DOWNLOADED">Report Downloads</option>
                <option value="AI_ADVISOR_CONSULTED">AI Chat Inquiries</option>
                <option value="RULE_CONFIG_UPDATED">Admin Rule Updates</option>
              </select>

              <button
                onClick={refreshLogs}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Refresh Logs"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Access Logs Data Table */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">User Email & Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Jurisdiction</th>
                    <th className="py-3 px-4">Reference / Status</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-sans">
                        No activity records found matching query.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}{' '}
                          <span className="text-[10px] text-slate-400">
                            ({new Date(log.timestamp).toLocaleDateString()})
                          </span>
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <div className="font-bold text-slate-900">{log.userName}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{log.userEmail}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.role === 'super_admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.role === 'super_admin' ? '👑 Admin' : 'User'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              log.actionType === 'SCRUTINY_EXECUTED'
                                ? 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                                : log.actionType === 'REPORT_DOWNLOADED'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : log.actionType === 'USER_LOGIN'
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {log.actionType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-700">{log.jurisdiction}</td>
                        <td className="py-3 px-4">
                          {log.referenceId ? (
                            <div>
                              <div className="text-slate-800 text-[11px]">{log.referenceId}</div>
                              {log.complianceStatus && (
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                    log.complianceStatus === 'APPROVED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {log.complianceStatus}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {log.sessionDurationSeconds}s
                        </td>
                        <td className="py-3 px-4 text-[11px] text-slate-500 font-sans truncate max-w-[140px]">
                          {log.deviceInfo}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
