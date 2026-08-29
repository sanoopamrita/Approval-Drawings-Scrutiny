import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AuthoritySelector } from './components/AuthoritySelector';
import { DrawingUploader } from './components/DrawingUploader';
import { AreaStatementForm } from './components/AreaStatementForm';
import { ScrutinyResults } from './components/ScrutinyResults';
import { ReportGenerator } from './components/ReportGenerator';
import { RulesExplorer } from './components/RulesExplorer';
import {
  AreaStatementData,
  JurisdictionType,
  Language,
  ScrutinyCheckResult,
  ScrutinyReportSummary,
  UploadedDrawing,
} from './types';
import { runKeralaBuildingRulesScrutiny } from './services/ruleEngine';
import { SAMPLE_PROJECT_PRESETS } from './utils/presets';

export function App() {
  const [language, setLanguage] = useState<Language>('ml');
  const [activeTab, setActiveTab] = useState<string>('authority');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize with Preset 0 (Panchayat 2-Storey House)
  const defaultPreset = SAMPLE_PROJECT_PRESETS[0];
  const [formData, setFormData] = useState<AreaStatementData>(defaultPreset.data);
  const [drawings, setDrawings] = useState<UploadedDrawing[]>(defaultPreset.mockDrawings);

  // Scrutiny result state
  const [summary, setSummary] = useState<ScrutinyReportSummary | null>(null);
  const [checks, setChecks] = useState<ScrutinyCheckResult[]>([]);

  // Run scrutiny on initial mount and when requested
  useEffect(() => {
    executeScrutiny();
  }, []);

  const executeScrutiny = () => {
    const result = runKeralaBuildingRulesScrutiny(formData, drawings);
    setSummary(result.summary);
    setChecks(result.checks);
  };

  const handleFormDataChange = (partial: Partial<AreaStatementData>) => {
    const updated = { ...formData, ...partial };
    setFormData(updated);
    // Realtime background scrutiny recalculation
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
    showToast(language === 'ml' ? 'ഡ്രോയിംഗ് അപ്‌ലോഡ് ചെയ്തു' : 'Drawing uploaded successfully');
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

  const handleLoadPreset = (presetId: string) => {
    const preset = SAMPLE_PROJECT_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setFormData(preset.data);
      setDrawings(preset.mockDrawings);
      const result = runKeralaBuildingRulesScrutiny(preset.data, preset.mockDrawings);
      setSummary(result.summary);
      setChecks(result.checks);
      showToast(
        language === 'ml'
          ? `മാതൃകാ പ്രോജക്റ്റ് ലോഡ് ചെയ്തു: ${preset.nameMl}`
          : `Loaded preset: ${preset.nameEn}`
      );
    }
  };

  const handleReset = () => {
    setFormData(defaultPreset.data);
    setDrawings(defaultPreset.mockDrawings);
    const result = runKeralaBuildingRulesScrutiny(defaultPreset.data, defaultPreset.mockDrawings);
    setSummary(result.summary);
    setChecks(result.checks);
    setActiveTab('authority');
    showToast(language === 'ml' ? 'ഫോം പുനഃക്രമീകരിച്ചു' : 'Form reset to default');
  };

  const handleManualRunScrutiny = () => {
    executeScrutiny();
    setActiveTab('scrutiny');
    showToast(
      language === 'ml'
        ? 'ചട്ട പരിശോധന പൂർത്തിയായി! ഫലങ്ങൾ താഴെ നൽകിയിരിക്കുന്നു.'
        : 'Rule Scrutiny Complete! Results updated.'
    );
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        jurisdiction={formData.jurisdiction}
        setJurisdiction={(j: JurisdictionType) => handleFormDataChange({ jurisdiction: j })}
        summary={summary}
        onRunScrutiny={handleManualRunScrutiny}
        onLoadPreset={handleLoadPreset}
        onReset={handleReset}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
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
              executeScrutiny();
              setActiveTab('scrutiny');
            }}
            onPrev={() => setActiveTab('drawings')}
          />
        )}

        {activeTab === 'scrutiny' && summary && (
          <ScrutinyResults
            summary={summary}
            checks={checks}
            language={language}
            onGoToReport={() => setActiveTab('report')}
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
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-semibold text-slate-300">K-BuildScrutiny</span> · Kerala Municipality Building Rules (KMBR) & Kerala Panchayat Building Rules (KPBR) Compliance Verification Engine
          </div>
          <div className="text-[11px] text-slate-500">
            Compliant with LSGD Kerala Gazette Notifications & GOs (2019-2026)
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
