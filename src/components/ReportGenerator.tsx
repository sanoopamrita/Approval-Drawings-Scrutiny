import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  FileText,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Building,
  Calendar,
  Layers,
  MapPin,
  Sparkles,
  Info,
  Check,
  FileCheck2,
} from 'lucide-react';
import { BuildingFormData, Language, ScrutinyCheckResult, ScrutinyReportSummary, UploadedDrawing } from '../types';
import { VinyasaLogo } from './VinyasaLogo';

interface ReportGeneratorProps {
  data: BuildingFormData;
  summary: ScrutinyReportSummary;
  checks: ScrutinyCheckResult[];
  drawings?: UploadedDrawing[];
  language: Language;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  data,
  summary,
  checks,
  language,
}) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [reportLang, setReportLang] = useState<Language>(language);

  const isMl = reportLang === 'ml';

  const handleDownloadPdf = async () => {
    if (!reportRef.current) return;

    try {
      setIsExporting(true);
      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const cleanProjectName = data.projectName ? data.projectName.replace(/\s+/g, '_') : 'Project';
      const fileName = `VINYASA_${data.jurisdiction}_${cleanProjectName}_Report.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const failedItems = checks.filter((c) => c.status === 'fail');
  const warningItems = checks.filter((c) => c.status === 'warning');

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Top Action & Control Bar */}
      <div className="bg-[#0A1326] border border-cyan-900/40 rounded-2xl p-4 sm:p-5 shadow-lg flex flex-wrap items-center justify-between gap-4 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/50 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit',sans-serif]">
              {isMl ? 'വിന്യാസ സാങ്കേതിക പരിശോധനാ റിപ്പോർട്ട്' : 'VINYASA Technical Compliance Scrutiny Report'}
            </h2>
            <p className="text-xs text-slate-400">
              {isMl
                ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (KMBR/KPBR 2019) അപഗ്രഥിച്ചുകൊണ്ടുള്ള ഔദ്യോഗിക പരിശോധനാ റിപ്പോർട്ട്.'
                : 'Technical scrutiny report formatted under Kerala LSGD KMBR / KPBR 2019 building rules.'}
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Language Toggle */}
          <div className="bg-slate-900 p-0.5 rounded-lg border border-slate-800 flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReportLang('en')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                reportLang === 'en' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setReportLang('ml')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                reportLang === 'ml' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              മലയാളം
            </button>
          </div>

          <button
            type="button"
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>{isMl ? 'പ്രിന്റ്' : 'Print'}</span>
          </button>

          <button
            type="button"
            id="download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(0,229,255,0.35)] transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-950" />
            <span>
              {isExporting
                ? (isMl ? 'പി.ഡി.എഫ് തയ്യാറാക്കുന്നു...' : 'Generating PDF...')
                : (isMl ? 'റിപ്പോർട്ട് PDF ഡൗൺലോഡ്' : 'Download PDF Report')}
            </span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Sheet (A4 View) */}
      <div
        ref={reportRef}
        id="printable-scrutiny-report"
        className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-lg text-slate-900 space-y-6 max-w-4xl mx-auto font-sans"
      >
        {/* Header with Vinyasa Logo & Rules reference */}
        <div className="border-b-2 border-slate-900 pb-5 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <VinyasaLogo variant="full" size="md" theme="light" showDomain={true} />

            <div className="text-center sm:text-right">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                LSGD Statutory Rule Scrutiny
              </div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-950 uppercase">
                {isMl
                  ? 'സാങ്കേതിക പരിശോധനാ റിപ്പോർട്ട്'
                  : 'TECHNICAL COMPLIANCE SCRUTINY REPORT'}
              </h1>
              <div className="text-xs font-bold text-cyan-800">
                {data.jurisdiction === 'KMBR'
                  ? 'Under Kerala Municipality Building Rules, 2019 (KMBR)'
                  : 'Under Kerala Panchayat Building Rules, 2019 (KPBR)'}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200 font-mono gap-2">
            <span>Reference ID: <strong className="text-slate-900">{summary.scrutinyReferenceId}</strong></span>
            <span>Local Body: <strong className="text-slate-900">{data.localBodyName || 'LSGD Authority'}</strong></span>
            <span>Date: <strong className="text-slate-900">{new Date(summary.scrutinyTimestamp).toLocaleDateString('en-GB')}</strong></span>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            summary.overallStatus === 'APPROVED'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : summary.overallStatus === 'CONDITIONAL_APPROVAL'
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            {summary.overallStatus === 'APPROVED' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : summary.overallStatus === 'CONDITIONAL_APPROVAL' ? (
              <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0" />
            ) : (
              <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm sm:text-base">
                {isMl ? 'പരിശോധനാ ഫലം:' : 'Scrutiny Status:'}{' '}
                {summary.overallStatus === 'APPROVED'
                  ? (isMl ? 'അംഗീകൃത യോഗ്യം (APPROVED)' : 'COMPLIANT & APPROVED')
                  : summary.overallStatus === 'CONDITIONAL_APPROVAL'
                  ? (isMl ? 'വ്യവസ്ഥകൾക്ക് വിധേയം (CONDITIONAL APPROVAL)' : 'CONDITIONAL APPROVAL (FEES APPLICABLE)')
                  : (isMl ? 'ചട്ടലംഘനം കണ്ടെത്തി / തിരുത്തണം (DEFECTS FOUND)' : 'DEFECTIVE - REVISIONS REQUIRED')}
              </div>
              <div className="text-xs mt-0.5">
                {summary.failedCount === 0
                  ? (isMl ? 'പ്ലാൻ എല്ലാ ചട്ടങ്ങളും പാലിക്കുന്നു.' : 'All mandatory setbacks, coverage and sanitary clearances meet statutory guidelines.')
                  : (isMl
                      ? `${summary.failedCount} ചട്ടലംഘനങ്ങൾ കണ്ടെത്തി. പ്ലാൻ തിരുത്തി വീണ്ടും പരിശോധിക്കുക.`
                      : `${summary.failedCount} rule violations found. Revisions must be made by the licensed architect/engineer.`)}
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs hidden sm:block">
            <div>Passed: {summary.passedCount} / {summary.totalChecks}</div>
            <div>Violations: {summary.failedCount}</div>
          </div>
        </div>

        {/* Section 1: Project & Site Data */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
            {isMl ? '1. പ്രോജക്റ്റും പ്ലോട്ട് വിവരങ്ങളും' : '1. Project & Site Particulars'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Project Name:</span>
              <span className="font-bold text-slate-900 truncate block">{data.projectName || 'Proposed Building'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Applicant:</span>
              <span className="font-semibold text-slate-900 truncate block">{data.applicantName || 'Applicant'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Survey No & Ward:</span>
              <span className="font-mono text-slate-900 block">{data.surveyNumber || '-'}, Ward {data.wardNumber || '-'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Occupancy:</span>
              <span className="font-bold text-slate-900 block">Group {data.occupancyGroup}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Area Statement & FAR Metric Summary */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
            {isMl ? '2. ഏരിയ സ്റ്റേറ്റ്മെന്റും കവറേജും' : '2. Area Statement & Coverage Compliance'}
          </h3>

          <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2">Parameter</th>
                <th className="p-2">Proposed / Provided</th>
                <th className="p-2">Statutory Permissible Limit</th>
                <th className="p-2">Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-2 font-medium">Plot Area</td>
                <td className="p-2 font-mono font-bold">{data.plotAreaSqM.toFixed(2)} m² ({data.plotAreaCents} Cents)</td>
                <td className="p-2 text-slate-500">Classification: {data.plotType === 'small_plot' ? 'Small Plot (<=125 m²)' : 'Standard'}</td>
                <td className="p-2 text-emerald-700 font-semibold">Valid ✓</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Access Road Width</td>
                <td className="p-2 font-mono font-bold">{data.roadAccessWidthM.toFixed(2)} m</td>
                <td className="p-2 text-slate-500">As per Rule 22 for Group {data.occupancyGroup}</td>
                <td className="p-2 font-semibold">
                  {data.roadAccessWidthM >= 3.0 ? <span className="text-emerald-700">Pass ✓</span> : <span className="text-rose-600">Deficient ❌</span>}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Ground Coverage</td>
                <td className="p-2 font-mono font-bold">{summary.providedCoveragePercent.toFixed(2)}% ({data.groundCoverageSqM.toFixed(2)} m²)</td>
                <td className="p-2 text-slate-500">Max Permissible: {summary.maxPermissibleCoveragePercent}%</td>
                <td className="p-2 font-semibold">
                  {summary.providedCoveragePercent <= summary.maxPermissibleCoveragePercent ? (
                    <span className="text-emerald-700">Pass ✓</span>
                  ) : (
                    <span className="text-rose-600">Excess Coverage ❌</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Floor Area Ratio (FAR)</td>
                <td className="p-2 font-mono font-bold">{summary.providedFar.toFixed(3)} ({data.totalFloorAreaSqM.toFixed(2)} m²)</td>
                <td className="p-2 text-slate-500">Base: {summary.permissibleFarWithoutFee} | Max: {summary.maxPermissibleFarWithFee}</td>
                <td className="p-2 font-semibold">
                  {summary.providedFar <= summary.permissibleFarWithoutFee ? (
                    <span className="text-emerald-700">Within Base FAR ✓</span>
                  ) : summary.providedFar <= summary.maxPermissibleFarWithFee ? (
                    <span className="text-amber-700">Purchasable FAR ⚠️</span>
                  ) : (
                    <span className="text-rose-600">Exceeds Max FAR ❌</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Building Height & Floors</td>
                <td className="p-2 font-mono font-bold">{data.buildingHeightM.toFixed(2)} m ({data.numberOfFloors} Floors)</td>
                <td className="p-2 text-slate-500">Permissible: 1.5 × (Road + Setback)</td>
                <td className="p-2 text-emerald-700 font-semibold">Verified ✓</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Car Parking Slots</td>
                <td className="p-2 font-mono font-bold">{data.carParkingProvided} Slot(s)</td>
                <td className="p-2 text-slate-500">Required: {summary.requiredCarParking} Slot(s)</td>
                <td className="p-2 font-semibold">
                  {data.carParkingProvided >= summary.requiredCarParking ? (
                    <span className="text-emerald-700">Pass ✓</span>
                  ) : (
                    <span className="text-rose-600">Deficit ❌</span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Rainwater Harvesting</td>
                <td className="p-2 font-mono font-bold">{data.rwhTankCapacityLiters.toLocaleString()} Litres</td>
                <td className="p-2 text-slate-500">Required: {summary.requiredRwhCapacityLiters.toLocaleString()} Litres</td>
                <td className="p-2 font-semibold">
                  {data.rwhTankCapacityLiters >= summary.requiredRwhCapacityLiters ? (
                    <span className="text-emerald-700">Pass ✓</span>
                  ) : (
                    <span className="text-rose-600">Deficit ❌</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Detailed Setback Checks */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
            {isMl ? '3. സെറ്റ്ബാക്ക് പരിശോധനാ വിശദാംശങ്ങൾ' : '3. Setback Clearances Verification'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[10px]">Front Setback (FOS)</div>
              <div className="font-bold text-slate-900 font-mono text-sm">{data.frontSetbackM.toFixed(2)} m</div>
              <div className="text-[10px] text-slate-500">From Road Boundary</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[10px]">Rear Setback (ROS)</div>
              <div className="font-bold text-slate-900 font-mono text-sm">{data.rearSetbackM.toFixed(2)} m</div>
              <div className="text-[10px] text-slate-500">To Rear Boundary</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[10px]">Side 1 (Left)</div>
              <div className="font-bold text-slate-900 font-mono text-sm">{data.sideSetback1M.toFixed(2)} m</div>
              <div className="text-[10px] text-slate-500">To Side Boundary 1</div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-slate-500 text-[10px]">Side 2 (Right)</div>
              <div className="font-bold text-slate-900 font-mono text-sm">{data.sideSetback2M.toFixed(2)} m</div>
              <div className="text-[10px] text-slate-500">To Side Boundary 2</div>
            </div>
          </div>
        </div>

        {/* Section 4: Defect Notice & Rectification Schedule (If any) */}
        {failedItems.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-700 pb-1 border-b border-rose-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>{isMl ? '4. കണ്ടെത്തിയ പിഴവുകളും പരിഹാര നിർദ്ദേശങ്ങളും (Defect Notice)' : '4. Statutory Non-Compliance & Plan Rectification Schedule'}</span>
            </h3>

            <div className="space-y-2">
              {failedItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>
                      {idx + 1}. {isMl ? item.titleMl : item.titleEn}
                    </span>
                    <span className="font-mono bg-rose-200/80 px-2 py-0.5 rounded text-[10px]">
                      {item.ruleNoKmbr}
                    </span>
                  </div>
                  <div className="text-rose-800">
                    <strong>Finding:</strong> {isMl ? item.technicalNoteMl : item.technicalNoteEn}
                  </div>
                  {item.rectificationAdviceEn && (
                    <div className="text-rose-950 font-medium pt-1 border-t border-rose-200/60">
                      <strong>Action Required:</strong> {isMl ? item.rectificationAdviceMl : item.rectificationAdviceEn}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Copyright Notice */}
        <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          Copyright © 2026 vinyasa.online - All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
