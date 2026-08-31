import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Send,
  Copy,
  Check,
  Printer,
  Download,
  Building,
  HardHat,
  HelpCircle,
  AlertCircle,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { AreaStatementData, Language } from '../types';

interface RfiGeneratorProps {
  data: AreaStatementData;
  language: Language;
}

interface RfiTemplate {
  id: string;
  titleEn: string;
  titleMl: string;
  category: 'lsgd' | 'structural' | 'site' | 'client';
  recipientEn: string;
  recipientMl: string;
  subjectEn: string;
  subjectMl: string;
  contentEn: string;
  contentMl: string;
}

export const RfiGenerator: React.FC<RfiGeneratorProps> = ({ data, language }) => {
  const isMl = language === 'ml';

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'lsgd' | 'structural' | 'site'>('all');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('rfi-1');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Editable fields
  const [projectName, setProjectName] = useState<string>(data.applicantName ? `Residential Building for ${data.applicantName}` : 'Proposed Residential Project');
  const [surveyNo, setSurveyNo] = useState<string>(data.surveyNumber || '142/5-A');
  const [localBodyName, setLocalBodyName] = useState<string>(data.localBodyName || 'Kochi Municipal Corporation');
  const [customQuery, setCustomQuery] = useState<string>('');

  const templates: RfiTemplate[] = [
    {
      id: 'rfi-1',
      titleEn: 'K-Smart LSGD Objection Clarification Reply',
      titleMl: 'കെ-സ്മാർട്ട് അസിസ്റ്റന്റ് എഞ്ചിനീയർ ഒബ്ജക്ഷൻ മറുപടി കത്ത്',
      category: 'lsgd',
      recipientEn: 'The Assistant Engineer / Town Planning Officer, LSGD',
      recipientMl: 'അസിസ്റ്റന്റ് എഞ്ചിനീയർ / ടൗൺ പ്ലാനിംഗ് ഓഫീസർ, തദ്ദേശ സ്വയംഭരണ വകുപ്പ്',
      subjectEn: `Clarification regarding Building Permit Application (Sy.No. ${surveyNo}) - Setback & FAR Alignment under KMBR 2019`,
      subjectMl: `കെട്ടിട നിർമ്മാണ പെർമിറ്റ് അപേക്ഷ (സർവേ നമ്പർ: ${surveyNo}) - KMBR 2019 ചട്ടങ്ങൾ പ്രകാരമുള്ള സെറ്റ്ബാക്ക് വിശദീകരണം നൽകുന്നത് സംബന്ധിച്ച്`,
      contentEn: `To,
${data.localBodyName || 'The Assistant Engineer, Local Self Government Department'},
Kerala.

Subject: Submission of Revised Drawing & Clarification on Scrutiny Notice - Sy. No. ${surveyNo}, ${data.villageName || 'Village'}

Respected Sir/Madam,

With reference to the scrutiny remarks issued via K-Smart for the proposed ${data.occupancyGroup || 'Residential (A1)'} building application in respect of ${data.applicantName || 'the applicant'}, we have reviewed the site measurements and KMBR 2019 rules.

1. Setback Compliance:
   - Front Open Space provided: ${data.frontSetbackM || '3.00'} m (against required 3.00m under Rule 25).
   - Rear Open Space provided: ${data.rearSetbackM || '1.50'} m (meets minimum 1.50m clear boundary requirement).
   - Side Open Spaces provided: Side 1: ${data.sideSetback1M || '1.20'} m, Side 2: ${data.sideSetback2M || '1.00'} m.

2. Access Road Width:
   - The existing access street provides clear ${data.roadAccessWidthM || '5.00'} m motorable width, conforming with Rule 34.

3. Sanitation Buffer:
   - The proposed septic tank is located at a safe horizontal distance exceeding 7.50 m from the nearest open drinking well as mandated under Rule 91.

We have updated the digital CAD layers and uploaded the revised defect-free drawings on K-Smart for your favorable verification and issuance of the Building Permit.

Thanking you,
Yours faithfully,
Registered Architect / Licensed Engineer
Vinyasa Compliance Intelligence`,
      contentMl: `സ്വീകർത്താവ്,
അസിസ്റ്റന്റ് എഞ്ചിനീയർ / സെക്രട്ടറി,
${localBodyName}, കേരളം.

വിഷയം: കെ-സ്മാർട്ട് പ്ലാൻ സ്ക്രൂട്ടിനി നോട്ടീസിൻമേലുള്ള വിശദീകരണവും തിരുത്തിയ പ്ലാൻ സമർപ്പിക്കുന്നതും സംബന്ധിച്ച്.
(സർവേ നമ്പർ: ${surveyNo}, വില്ലേജ്: ${data.villageName || 'വില്ലേജ്'})

ബഹുമാനപ്പെട്ട സാർ/മാഡം,

മേൽ സൂചിപ്പിച്ച സ്ഥലത്ത് ${data.applicantName || 'അപേക്ഷകന്റെ'} പേരിൽ സമർപ്പിച്ച ${data.occupancyGroup || 'റസിഡൻഷ്യൽ'} കെട്ടിട നിർമ്മാണ അപേക്ഷയിന്മേൽ കെ-സ്മാർട്ട് പോർട്ടൽ വഴി ലഭിച്ച പരിശോധനാ കുറിപ്പുകൾക്കുള്ള വിശദീകരണം താഴെ ചേർക്കുന്നു:

1. സെറ്റ്ബാക്ക് ക്രമീകരണം (KMBR 2019 ചട്ടം 25):
   - മുൻവശത്തെ അകലം: ${data.frontSetbackM || '3.00'} മീറ്റർ (ചട്ടപ്രകാരം ആവശ്യമായ 3.00 മീറ്റർ ലഭ്യമാക്കിയിട്ടുണ്ട്).
   - പിൻഭാഗത്തെ അകലം: ${data.rearSetbackM || '1.50'} മീറ്റർ (മിനിമം 1.50 മീറ്റർ കൃത്യമായി പാലിച്ചിരിക്കുന്നു).
   - വശങ്ങളിലെ അകലം: സൈഡ് 1: ${data.sideSetback1M || '1.20'} മീറ്റർ, സൈഡ് 2: ${data.sideSetback2M || '1.00'} മീറ്റർ.

2. കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലം (ചട്ടം 91):
   - സെപ്റ്റിക് ടാങ്ക് കിണറിൽ നിന്നും നിർദ്ദിഷ്ട 7.50 മീറ്ററിലധികം കൃത്യമായ അകലം പാലിച്ചാണ് സ്ഥാപിക്കുന്നത്.

3. റോഡ് വീതി (ചട്ടം 34):
   - വസ്തുവിലേക്കുള്ള വഴിവീതി ${data.roadAccessWidthM || '5.00'} മീറ്റർ ഉള്ളതായി സൈറ്റ് പ്ലാനിൽ കൃത്യമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്.

ആയതിനാൽ മേൽ വസ്തുതകൾ പരിഗണിച്ച് കെട്ടിട നിർമ്മാണ പെർമിറ്റ് അനുവദിച്ച് നൽകണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.

വിശ്വസ്തതയോടെ,
രജിസ്ട്രേഡ് ആർക്കിടെക്റ്റ് / ലൈസൻസ്ഡ് എഞ്ചിനീയർ`,
    },
    {
      id: 'rfi-2',
      titleEn: 'Rule 60/62 Small Plot Relaxation Request to Secretary',
      titleMl: 'റൂൾ 60/62 ചെറിയ പ്ലോട്ടുകൾക്കുള്ള ഇളവ് അപേക്ഷ (സെക്രട്ടറിക്ക്)',
      category: 'lsgd',
      recipientEn: 'The Secretary, Local Self Government Institution',
      recipientMl: 'സെക്രട്ടറി, തദ്ദേശ സ്വയംഭരണ സ്ഥാപനം',
      subjectEn: `Application for Small Plot Exemption under Rule 60/62 of KMBR/KPBR 2019 (Sy.No. ${surveyNo})`,
      subjectMl: `ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ അനുവദിക്കുന്നത് സംബന്ധിച്ച അപേക്ഷ (KMBR/KPBR റൂൾ 60/62)`,
      contentEn: `To,
The Secretary,
${localBodyName}.

Subject: Application for Small Plot Concession under Rule 60/62 of Kerala Building Rules 2019

Respected Sir,

The plot having extent of ${data.plotAreaCents || 3.5} Cents (approx. ${data.plotAreaSqM || 141.6} sq.m) situated in Sy. No. ${surveyNo} is an ancestral/registered small land parcel.

We request your good office to consider the permissible relaxations under Rule 60 (KPBR) / Rule 62 (KMBR) for small plots up to 200 sq.m:
1. Front setback: 1.80m provided.
2. Rear setback: 1.00m provided with fire-rated masonry.
3. Average side setback: 0.90m provided.

The building plan satisfies all safety and structural stability norms. Kindly grant approval under the small plot provisions.

Yours faithfully,
Registered Consultant / Architect`,
      contentMl: `സ്വീകർത്താവ്,
സെക്രട്ടറി,
${localBodyName}.

വിഷയം: KMBR/KPBR 2019 ചട്ടം 60/62 പ്രകാരം ചെറിയ പ്ലോട്ടുകൾക്കുള്ള ഇളവുകൾ ലഭ്യമാക്കണമെന്ന് ആവശ്യപ്പെട്ടുള്ള അപേക്ഷ.

ബഹുമാനപ്പെട്ട സെക്രട്ടറിക്ക്,

സർവേ നമ്പർ ${surveyNo} ൽ ഉൾപ്പെട്ട ${data.plotAreaCents || 3.5} സെന്റ് (ഏകദേശം ${data.plotAreaSqM || 141.6} ച.മീറ്റർ) വസ്തു ഒരു ചെറിയ പ്ലോട്ടാണ്. 

2019-ലെ കേരള ബിൽഡിംഗ് റൂളുകളിലെ റൂൾ 60 (പഞ്ചായത്ത്) / റൂൾ 62 (മുനിസിപ്പാലിറ്റി) പ്രകാരം 200 ച.മീറ്ററിൽ താഴെയുള്ള ചെറുകിട പ്ലോട്ടുകൾക്ക് അനുവദിച്ചിട്ടുള്ള സെറ്റ്ബാക്ക് ഇളവുകൾ (മുൻവശം 1.80 മീറ്റർ, പിൻവശം 1.00 മീറ്റർ) അനുവദിച്ച് ഈ പ്ലാനിൽ അനുമതി തരണമെന്ന് അപേക്ഷിക്കുന്നു.

വിശ്വസ്തതയോടെ,
രജിസ്ട്രേഡ് ആർക്കിടെക്റ്റ് / എഞ്ചിനീയർ`,
    },
    {
      id: 'rfi-3',
      titleEn: 'Structural vs Architectural Column Alignment RFI',
      titleMl: 'സ്ട്രക്ചറൽ vs ആർക്കിടെക്ചറൽ കോളം അലൈൻമെന്റ് RFI',
      category: 'structural',
      recipientEn: 'Structural Consultant / Consulting Engineer',
      recipientMl: 'സ്ട്രക്ചറൽ കൺസൾട്ടന്റ് / കൺസൾട്ടിംഗ് എഞ്ചിനീയർ',
      subjectEn: `RFI-004: Ground Floor Parking Clear Width vs Column Grid Grid B-3`,
      subjectMl: `RFI-004: ഗ്രൗണ്ട് ഫ്ലോർ പാർക്കിംഗ് കാർ സ്ലോട്ട് ക്ലിയറൻസും കോളം ഗ്രിഡും തമ്മിലുള്ള മാറ്റം`,
      contentEn: `PROJECT: ${projectName}
RFI REF: RFI-STR-2026-004
DATE: ${new Date().toLocaleDateString('en-GB')}

To: Structural Engineering Consultant
From: Lead Project Architect (Vinyasa AI)

SUBJECT: Column Grid Alignment with KMBR Mandatory Car Parking Clearance (2.50m x 5.00m)

DESCRIPTION OF QUERY:
During site drawing scrutiny, Column C-4 at Grid B-3 encroaches into the turning radius and reduces the clear parking bay width to 2.25m. KMBR 2019 Rule 31 mandates a minimum clear parking bay of 2.50m x 5.00m.

REQUESTED ACTION:
1. Please confirm if Column C-4 can be offset 250mm along the X-axis or if a cantilever beam transfer can be accommodated at plinth level.
2. Confirm the updated reinforcement schedule for the transfer beam if proposed.

Impact on Schedule: Urgent (Pending Site Foundation Casting).`,
      contentMl: `പ്രോജക്റ്റ്: ${projectName}
റഫറൻസ്: RFI-STR-2026-004
തീയതി: ${new Date().toLocaleDateString('en-GB')}

സ്വീകർത്താവ്: സ്ട്രക്ചറൽ കൺസൾട്ടിംഗ് എഞ്ചിനീയർ
അയക്കുന്നത്: പ്രോജക്റ്റ് ആർക്കിടെക്റ്റ് (വിന്യാസ AI)

വിഷയം: കാർ പാർക്കിംഗ് സ്ലോട്ട് ക്ലിയറൻസും (2.50m x 5.00m) കോളം ഗ്രിഡും തമ്മിലുള്ള തടസ്സം പരിഹരിക്കുന്നത്.

വിശദാംശങ്ങൾ:
ഗ്രൗണ്ട് ഫ്ലോർ പ്ലാനിൽ കോളം C-4 വരുന്നത് മൂലം കാർ പാർക്കിംഗ് വീതി 2.25 മീറ്ററായി കുറയുന്നു. KMBR റൂൾ 31 പ്രകാരം 2.50m x 5.00m മിനിമം ക്ലിയറൻസ് നിർബന്ധമാണ്.

ആവശ്യപ്പെടുന്ന നടപടി:
1. കോളം C-4 നെ 250mm മാറ്റി സ്ഥാപിക്കാമോ അല്ലെങ്കിൽ പ്ലിന്ത് ലെവലിൽ കാന്റിലിവർ ട്രാൻസ്ഫർ ബീം നൽകാമോ എന്ന് വ്യക്തമാക്കുക.
2. പുതിയ റീഇൻഫോഴ്‌സ്‌മെന്റ് വിശദാംശങ്ങൾ നൽകുക.`,
    },
  ];

  const filteredTemplates = selectedCategory === 'all' ? templates : templates.filter((t) => t.category === selectedCategory);
  const activeTemplate = templates.find((t) => t.id === activeTemplateId) || templates[0];

  const handleCopy = () => {
    const textToCopy = isMl ? activeTemplate.contentMl : activeTemplate.contentEn;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0A1124] to-slate-950 border border-cyan-500/40 p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.6)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? 'AI റിക്വസ്റ്റ് ഫോർ ഇൻഫർമേഷൻ (RFI) & നോട്ടീസ് ജനറേറ്റർ' : 'AI Request for Information (RFI) & Notice Co-Worker'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isMl ? 'തദ്ദേശ സ്ഥാപന നോട്ടീസുകൾക്കും എഞ്ചിനീയറിംഗ് സംശയങ്ങൾക്കുമുള്ള ഔദ്യോഗിക മറുപടികൾ' : 'Automated LSGD Objection Letters & Technical RFIs'}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              {isMl
                ? 'കെ-സ്മാർട്ട് നോട്ടീസുകൾ, അസിസ്റ്റന്റ് എഞ്ചിനീയറുടെ ഒബ്ജക്ഷനുകൾ, അതിർത്തി-സെറ്റ്ബാക്ക് തർക്കങ്ങൾ, സ്ട്രക്ചറൽ കോളം ക്ലാഷുകൾ എന്നിവയ്ക്ക് KMBR/KPBR 2019 ചട്ടങ്ങൾ ഉദ്ധരിച്ചുകൊണ്ട് നിമിഷങ്ങൾക്കുള്ളിൽ ഔദ്യോഗിക കത്തുകൾ തയ്യാറാക്കുന്നു.'
                : 'Drafts statutory LSGD objection replies, municipal AE clarification letters, and MEP/structural conflict RFIs with precise Kerala Building Rules 2019 citations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Template Selector on Left, Form / Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Templates List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-slate-200 tracking-wider">
                {isMl ? 'RFI മാതൃകകൾ തിരഞ്ഞെടുക്കുക' : 'Select RFI Template'}
              </span>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'all' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isMl ? 'എല്ലാം' : 'All'}
              </button>
              <button
                onClick={() => setSelectedCategory('lsgd')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'lsgd' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isMl ? 'തദ്ദേശ സ്ഥാപനം (LSGD)' : 'LSGD / K-Smart'}
              </button>
              <button
                onClick={() => setSelectedCategory('structural')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  selectedCategory === 'structural' ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/50' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isMl ? 'സ്ട്രക്ചറൽ' : 'Structural'}
              </button>
            </div>
          </div>

          {/* List of Templates */}
          <div className="space-y-2">
            {filteredTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTemplateId(t.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  activeTemplateId === t.id
                    ? 'bg-cyan-950/50 border-cyan-500 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-white">
                      {isMl ? t.titleMl : t.titleEn}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {isMl ? t.recipientMl : t.recipientEn}
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 mt-0.5 ${activeTemplateId === t.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                </div>
              </div>
            ))}
          </div>

          {/* Parameter Customizer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
            <span className="text-xs font-bold uppercase text-slate-300 block tracking-wider">
              {isMl ? 'പ്രോജക്റ്റ് വിശദാംശങ്ങൾ മാറ്റുക' : 'Project Parameters'}
            </span>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 block">{isMl ? 'സർവേ നമ്പർ' : 'Survey No'}</label>
                <input
                  type="text"
                  value={surveyNo}
                  onChange={(e) => setSurveyNo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block">{isMl ? 'തദ്ദേശ സ്ഥാപനം' : 'Local Body Name'}</label>
                <input
                  type="text"
                  value={localBodyName}
                  onChange={(e) => setLocalBodyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Letter Editor / Document View */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Action Header */}
          <div className="p-4 bg-[#080E1C] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">
                {isMl ? activeTemplate.titleMl : activeTemplate.titleEn}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isMl ? 'കോപ്പി ചെയ്തു!' : 'Copied!') : (isMl ? 'കോപ്പി' : 'Copy')}</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-300 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{isMl ? 'പ്രിന്റ് / PDF' : 'Print / Export'}</span>
              </button>
            </div>
          </div>

          {/* Letter Body Preview */}
          <div className="p-6 bg-slate-950 flex-1 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed border-b border-slate-800 overflow-y-auto max-h-[500px]">
            {isMl ? activeTemplate.contentMl : activeTemplate.contentEn}
          </div>

          {/* Bottom Notice */}
          <div className="p-3.5 bg-[#080E1C] text-[11px] text-slate-400 flex items-center justify-between">
            <span>✓ {isMl ? 'KMBR/KPBR 2019 ചട്ടങ്ങൾ പ്രകാരം സാക്ഷ്യപ്പെടുത്തിയത്' : 'Verified against KMBR / KPBR 2019 statutory drafting standards'}</span>
            <span className="font-bold text-cyan-400 font-sans">Vinyasa AI Co-Worker</span>
          </div>
        </div>
      </div>
    </div>
  );
};
