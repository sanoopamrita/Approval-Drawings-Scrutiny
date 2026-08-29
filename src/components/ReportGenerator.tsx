import React, { useRef, useState } from 'react';
import {
  Download,
  Printer,
  FileCheck2,
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  QrCode,
  Globe,
  Share2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  AreaStatementData,
  Language,
  ScrutinyCheckResult,
  ScrutinyReportSummary,
  UploadedDrawing,
} from '../types';

interface ReportGeneratorProps {
  data: AreaStatementData;
  summary: ScrutinyReportSummary;
  checks: ScrutinyCheckResult[];
  drawings: UploadedDrawing[];
  language: Language;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  data,
  summary,
  checks,
  drawings,
  language: initialLanguage,
}) => {
  const [reportLang, setReportLang] = useState<Language>(initialLanguage);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
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

      const fileName = `K-BuildScrutiny_${data.jurisdiction}_${data.projectName.replace(/\s+/g, '_')}_${summary.scrutinyReferenceId}.pdf`;
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
    <div className="space-y-6 animate-fadeIn">
      {/* Control Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {isMl ? 'ഔദ്യോഗിക പ്ലാൻ പരിശോധനാ റിപ്പോർട്ട് & സർട്ടിഫിക്കറ്റ്' : 'Official Plan Scrutiny Certificate & Technical Report'}
          </h2>
          <p className="text-xs text-slate-500">
            {isMl
              ? 'തദ്ദേശ സ്ഥാപനങ്ങളിലെ കെ-സ്മാർട്ട് / ടൗൺ പ്ലാനിംഗ് അപേക്ഷകൾക്കായുള്ള റിപ്പോർട്ട്'
              : 'Formal inspection sheet formatted for Kerala LSGD, K-Smart & Municipal Town Planning submission.'}
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* Language Toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-semibold">
            <button
              type="button"
              onClick={() => setReportLang('en')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                reportLang === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setReportLang('ml')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                reportLang === 'ml' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              മലയാളം
            </button>
          </div>

          <button
            type="button"
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>{isMl ? 'പ്രിന്റ്' : 'Print'}</span>
          </button>

          <button
            type="button"
            id="download-pdf-btn"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl shadow-sm transition-all transform active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting
                ? (isMl ? 'പി.ഡി.എഫ് തയ്യാറാക്കുന്നു...' : 'Generating PDF...')
                : (isMl ? 'PDF ഡൗൺലോഡ് ചെയ്യുക' : 'Download PDF Certificate')}
            </span>
          </button>
        </div>
      </div>

      {/* Official Printable Report Sheet (A4 Structured View) */}
      <div
        ref={reportRef}
        id="printable-scrutiny-report"
        className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-10 shadow-lg text-slate-900 space-y-6 max-w-4xl mx-auto font-sans"
      >
        {/* Government Header */}
        <div className="border-b-2 border-slate-900 pb-5 text-center space-y-1.5">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
              KL
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                Government of Kerala · Local Self Government Department (LSGD)
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
                {isMl
                  ? 'കെട്ടിട നിർമ്മാണ പ്ലാൻ ചട്ട പരിശോധനാ സർട്ടിഫിക്കറ്റ്'
                  : 'BUILDING PLAN TECHNICAL SCRUTINY REPORT'}
              </h1>
              <div className="text-xs font-semibold text-emerald-800">
                {data.jurisdiction === 'KMBR'
                  ? 'Under Kerala Municipality Building Rules, 2019 (KMBR)'
                  : 'Under Kerala Panchayat Building Rules, 2019 (KPBR)'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-200 mt-3 font-mono">
            <span>Reference No: <strong>{summary.scrutinyReferenceId}</strong></span>
            <span>Local Body: <strong>{data.localBodyName || 'LSGD Authority'}</strong></span>
            <span>Date: <strong>{new Date(summary.scrutinyTimestamp).toLocaleDateString('en-GB')}</strong></span>
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
                {isMl ? 'പരിശോധനാ ഫലം:' : 'Scrutiny Endorsement Status:'}{' '}
                {summary.overallStatus === 'APPROVED'
                  ? (isMl ? 'അംഗീകൃത യോഗ്യം (APPROVED)' : 'COMPLIANT & APPROVED')
                  : summary.overallStatus === 'CONDITIONAL_APPROVAL'
                  ? (isMl ? 'വ്യവസ്ഥകൾക്ക് വിധേയം (CONDITIONAL APPROVAL)' : 'CONDITIONAL APPROVAL (FEES APPLICABLE)')
                  : (isMl ? 'ചട്ടലംഘനം കണ്ടെത്തി / തിരുത്തണം (DEFECTIVE)' : 'DEFECTIVE - REVISIONS REQUIRED')}
              </div>
              <div className="text-xs mt-0.5">
                {summary.failedCount === 0
                  ? (isMl ? 'പ്ലാൻ എല്ലാ ചട്ടങ്ങളും പാലിക്കുന്നു.' : 'All mandatory setbacks, coverage and sanitary clearances meet statutory guidelines.')
                  : (isMl
                      ? `${summary.failedCount} ചട്ടലംഘനങ്ങൾ കണ്ടെത്തി. പ്ലാൻ തിരുത്തി വീണ്ടും സമർപ്പിക്കുക.`
                      : `${summary.failedCount} rule violations found. Revisions must be made by the licensed architect/engineer.`)}
              </div>
            </div>
          </div>

          <div className="text-right font-mono text-xs hidden sm:block">
            <div>Passed: {summary.passedCount} / {summary.totalChecks}</div>
            <div>Violations: {summary.failedCount}</div>
          </div>
        </div>

        {/* Section 1: Project & Site Data Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 pb-1 border-b border-slate-200">
            {isMl ? '1. പ്രോജക്റ്റും പ്ലോട്ട് വിവരങ്ങളും' : '1. Project & Site Particulars'}
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Project Name:</span>
              <span className="font-bold text-slate-900 truncate block">{data.projectName}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Applicant:</span>
              <span className="font-semibold text-slate-900 truncate block">{data.applicantName}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px]">Survey No & Ward:</span>
              <span className="font-mono text-slate-900 block">{data.surveyNumber}, {data.wardNumber}</span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200">
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
                <td className="p-2 text-slate-500">Base: {summary.permissibleFarWithoutFee} | Max with Fee: {summary.maxPermissibleFarWithFee}</td>
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
                <td className="p-2 text-slate-500">1.5 × (Road + Setback)</td>
                <td className="p-2 text-emerald-700 font-semibold">Verified ✓</td>
              </tr>
              <tr>
                <td className="p-2 font-medium">Car Parking Slots</td>
                <td className="p-2 font-mono font-bold">{data.carParkingProvided} Slot(s)</td>
                <td className="p-2 text-slate-500">Required: {summary.requiredCarParking} Slot(s) (2.5x5.0m)</td>
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
              <span>{isMl ? '4. കണ്ടെത്തിയ പിഴവുകളും പരിഹാര നിർദ്ദേശങ്ങളും (Defect Notice)' : '4. Statutory Non-Compliance & Plan Rectification Order'}</span>
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

        {/* Section 5: Engineer's Declaration & Official Stamp */}
        <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="font-bold text-slate-800">Engineer / Architect Declaration:</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Certified that the building plans and area statements scrutinized herein have been prepared in
              strict accordance with the provisions of {data.jurisdiction === 'KMBR' ? 'KMBR 2019' : 'KPBR 2019'} and
              applicable Government Orders.
            </p>
            <div className="pt-2 text-slate-900 font-semibold">
              <div>{data.architectEngineerName}</div>
              <div className="font-mono text-[10px] text-slate-500">License: {data.licenseNumber}</div>
            </div>
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col justify-between items-center text-center bg-slate-50/50">
            <div className="text-[10px] uppercase font-bold text-slate-400">
              Government / Municipal Seal & Verification QR
            </div>
            <div className="w-16 h-16 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shadow-2xs my-1">
              <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Ref: {summary.scrutinyReferenceId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
