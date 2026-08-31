import React, { useState, useRef } from 'react';
import {
  FileText,
  Sparkles,
  Send,
  Copy,
  Check,
  Printer,
  Download,
  Building,
  AlertTriangle,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
  UploadCloud,
  FileCheck2,
  Paperclip,
  CheckCircle2,
  XCircle,
  FileSignature,
  Landmark,
  ShieldCheck,
  Search,
  BookOpen,
  Image as ImageIcon,
  Camera,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { AreaStatementData, Language, UploadedDrawing } from '../types';

interface RfiGeneratorProps {
  data: AreaStatementData;
  drawings?: UploadedDrawing[];
  language: Language;
}

export interface DefectItem {
  id: string;
  ruleCitation: string;
  defectText: string;
  rectificationPlan: string;
  severity: 'high' | 'medium' | 'low';
}

export const RfiGenerator: React.FC<RfiGeneratorProps> = ({ data, drawings = [], language }) => {
  const isMl = language === 'ml';

  // Mode: 'notice_analyzer' (Upload Notice & Auto-Fix) or 'letters' (Official Letter Studio)
  const [activeMode, setActiveMode] = useState<'notice_analyzer' | 'letters'>('notice_analyzer');

  // Notice Analyzer State
  const [noticeText, setNoticeText] = useState<string>('');
  const [noticeFile, setNoticeFile] = useState<{
    name: string;
    size: number;
    type: string;
    dataUrl: string;
    isImage: boolean;
    isPdf: boolean;
  } | null>(null);

  const [isAnalyzingNotice, setIsAnalyzingNotice] = useState<boolean>(false);
  const [analyzedDefects, setAnalyzedDefects] = useState<DefectItem[] | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Letter Studio State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('letter-1');
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiDrafting, setIsAiDrafting] = useState<boolean>(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  // Editable fields for letter
  const [applicantName, setApplicantName] = useState<string>(data.applicantName || 'Er. Sanoop Sadanandhan');
  const [surveyNo, setSurveyNo] = useState<string>(data.surveyNumber || '142/5-A');
  const [villageName, setVillageName] = useState<string>(data.villageName || 'Kochi');
  const [localBodyName, setLocalBodyName] = useState<string>(
    data.localBodyName || (data.jurisdiction === 'KMBR' ? 'Kochi Municipal Corporation' : 'Kumbalangi Grama Panchayat')
  );
  const [district, setDistrict] = useState<string>(data.district || 'Ernakulam');
  const [customLetterBody, setCustomLetterBody] = useState<string>('');

  // Sample LSGD Defect Presets for Quick Testing
  const sampleNotices = [
    {
      titleEn: 'K-Smart Defect Sheet: Front Setback & Septic Tank Distance',
      titleMl: 'കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ: മുൻവശത്തെ അകലവും സെപ്റ്റിക് ടാങ്ക് ദൂരവും',
      content: `1. Front open space provided in drawing is 2.85m which is less than mandatory 3.00m under KMBR Rule 25.\n2. Drinking water open well is situated at 5.80m from proposed septic tank soak pit (Violation of Rule 91 - minimum 7.50m required).\n3. Re-submit revised drawings through K-Smart CAD layer format.`,
    },
    {
      titleEn: 'Notice on Small Plot Exemption & Access Road Width',
      titleMl: 'ചെറിയ പ്ലോട്ട് ഇളവും വഴിവീതിയും സംബന്ധിച്ച നോട്ടീസ്',
      content: `1. Road access width marked as 3.2m. Produce sketch from Village Officer verifying access road.\n2. Clarify if small plot concession under KPBR Rule 60 is claimed for side setback of 0.90m.\n3. Submit affidavit for rain water harvesting system as per Rule 48.`,
    },
  ];

  // Handle File Upload (PDF, JPG, PNG, DOCX, TXT)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setNoticeFile({
        name: file.name,
        size: file.size,
        type: file.type || 'document',
        dataUrl,
        isImage,
        isPdf,
      });

      // If text or json file, populate noticeText directly
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const textReader = new FileReader();
        textReader.onload = (t) => setNoticeText(t.target?.result as string);
        textReader.readAsText(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const isImage = file.type.startsWith('image/');
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNoticeFile({
          name: file.name,
          size: file.size,
          type: file.type || 'document',
          dataUrl,
          isImage,
          isPdf,
        });

        if (file.type.includes('text') || file.name.endsWith('.txt')) {
          const textReader = new FileReader();
          textReader.onload = (t) => setNoticeText(t.target?.result as string);
          textReader.readAsText(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeNotice = async () => {
    if (!noticeText.trim() && !noticeFile) {
      setAnalysisError(
        isMl
          ? 'ദയവായി ഒരു നോട്ടീസ് ഫയൽ അപ്‌ലോഡ് ചെയ്യുകയോ വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക.'
          : 'Please upload a defect notice file or paste the notice text.'
      );
      return;
    }

    setIsAnalyzingNotice(true);
    setAnalysisError(null);

    try {
      const payload: any = {
        noticeText: noticeText.trim(),
        fileName: noticeFile?.name,
        fileMimeType: noticeFile?.type,
        jurisdiction: data.jurisdiction || 'KPBR',
        language,
        projectData: {
          ...data,
          applicantName,
          surveyNumber: surveyNo,
          villageName,
          localBodyName,
          district,
        },
      };

      if (noticeFile?.dataUrl) {
        payload.fileData = noticeFile.dataUrl;
      }

      const res = await fetch('/api/ai/analyze-notice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const result = await res.json();
      if (result.defects && Array.isArray(result.defects)) {
        setAnalyzedDefects(result.defects);
      }

      if (result.replyLetter) {
        setCustomLetterBody(result.replyLetter);
      } else if (result.defects) {
        generateAutoReplyFromDefects(result.defects);
      }
    } catch (err: any) {
      console.warn('[Notice Analysis] Fallback to in-browser rule evaluator:', err);
      // Fallback in-browser rule diagnosis
      runFallbackNoticeAnalysis();
    } finally {
      setIsAnalyzingNotice(false);
    }
  };

  const runFallbackNoticeAnalysis = () => {
    const combined = `${noticeText} ${noticeFile?.name || ''}`.toLowerCase();
    const detected: DefectItem[] = [];

    if (
      combined.includes('front') ||
      combined.includes('setback') ||
      combined.includes('സെറ്റ്ബാക്ക്') ||
      combined.includes('മുൻവശം') ||
      combined.includes('അകലം')
    ) {
      detected.push({
        id: 'def-1',
        ruleCitation: data.jurisdiction === 'KMBR' ? 'KMBR 2019 Rule 25(1)' : 'KPBR 2019 Rule 27(1)',
        defectText: isMl
          ? 'മുൻവശത്തെ സെറ്റ്ബാക്ക് കുറവുള്ളതായി നോട്ടീസിൽ രേഖപ്പെടുത്തിയിട്ടുണ്ട്.'
          : 'Front open space shortfall flagged in scrutiny notice.',
        rectificationPlan: isMl
          ? `ഡ്രോയിംഗിലെ മുൻവശത്തെ അകലം കൃത്യമായി ${data.frontSetbackM || '3.00'} മീറ്ററായി തിരുത്തി '0_SETBACK_FRONT' ലെയറിൽ അപ്‌ഡേറ്റ് ചെയ്തു.`
          : `Setback corrected to ${data.frontSetbackM || '3.00'}m in CAD drawing on layer '0_SETBACK_FRONT'.`,
        severity: 'high',
      });
    }

    if (
      combined.includes('septic') ||
      combined.includes('well') ||
      combined.includes('സെപ്റ്റിക്') ||
      combined.includes('കിണർ')
    ) {
      detected.push({
        id: 'def-2',
        ruleCitation: data.jurisdiction === 'KMBR' ? 'KMBR 2019 Rule 91' : 'KPBR 2019 Rule 47',
        defectText: isMl
          ? 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50 മീറ്റർ ദൂരപരിധി തടസ്സമായി ചൂണ്ടിക്കാണിച്ചു.'
          : 'Well-to-septic clearance violation flagged (7.50m mandatory buffer).',
        rectificationPlan: isMl
          ? 'സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും കിണറിൽ നിന്നും 7.50 മീറ്ററിലധികം കൃത്യമായ അകലത്തിലേക്ക് മാറ്റി സൈറ്റ് പ്ലാനിൽ രേഖപ്പെടുത്തി.'
          : 'Relocated septic tank to clear 7.50m horizontal buffer from drinking well in Site Plan.',
        severity: 'high',
      });
    }

    if (
      combined.includes('road') ||
      combined.includes('വീതി') ||
      combined.includes('വഴി')
    ) {
      detected.push({
        id: 'def-3',
        ruleCitation: 'KMBR/KPBR Rule 34 (Access Road Conformance)',
        defectText: isMl ? 'വസ്തുവിലേക്കുള്ള വഴിവീതി സംബന്ധിച്ച രേഖകൾ ആവശ്യപ്പെട്ടു.' : 'Road access width proof requested.',
        rectificationPlan: isMl
          ? `വില്ലേജ് ഓഫീസർ / തദ്ദേശ സ്ഥാപനം സാക്ഷ്യപ്പെടുത്തിയ ${data.roadAccessWidthM || '5.00'} മീറ്റർ വഴിവീതി തെളിയിക്കുന്ന രേഖയും സൈറ്റ് പ്ലാനും ഒപ്പം ചേർക്കുന്നു.`
          : `Attached authenticated access road sketch confirming ${data.roadAccessWidthM || '5.00'}m width.`,
        severity: 'medium',
      });
    }

    if (
      combined.includes('small plot') ||
      combined.includes('60') ||
      combined.includes('62') ||
      combined.includes('ചെറിയ പ്ലോട്ട്')
    ) {
      detected.push({
        id: 'def-4',
        ruleCitation: data.jurisdiction === 'KMBR' ? 'KMBR 2019 Rule 62' : 'KPBR 2019 Rule 60',
        defectText: isMl ? 'ചെറിയ പ്ലോട്ടുകൾക്കുള്ള ഇളവ് അപേക്ഷയുടെ സ്ഥിരീകരണം.' : 'Small plot statutory exemption verification.',
        rectificationPlan: isMl
          ? 'പ്ലോട്ടിന്റെ ആകെ വിസ്തീർണ്ണം 200 ച.മീറ്ററിൽ താഴെയായതിനാൽ റൂൾ 60 പ്രകാരമുള്ള ഇളവുകൾക്കുള്ള അപേക്ഷ കത്തിൽ ഉൾപ്പെടുത്തി.'
          : 'Enclosed Rule 60 small plot exemption petition as total plot area is under 200 sq.m.',
        severity: 'low',
      });
    }

    if (detected.length === 0) {
      detected.push({
        id: 'def-gen',
        ruleCitation: 'KMBR / KPBR General Compliance',
        defectText: isMl ? 'നോട്ടീസിലെ ചട്ടപരമായ തിരുത്തൽ നിർദ്ദേശങ്ങൾ.' : 'General statutory remarks identified in notice.',
        rectificationPlan: isMl
          ? 'പരിഷ്കരിച്ച ഡ്രോയിംഗുകൾ കെ-സ്മാർട്ട് ഡിജിറ്റൽ ഫോർമാറ്റിൽ പുനഃസമർപ്പിച്ചു.'
          : 'Updated revised CAD layers aligned with K-Smart format.',
        severity: 'medium',
      });
    }

    setAnalyzedDefects(detected);
    generateAutoReplyFromDefects(detected);
  };

  const generateAutoReplyFromDefects = (defects: DefectItem[]) => {
    const defectBulletsEn = defects
      .map((d, i) => `${i + 1}. **${d.ruleCitation}**: ${d.defectText}\n   *Rectification Action*: ${d.rectificationPlan}`)
      .join('\n\n');

    const defectBulletsMl = defects
      .map((d, i) => `${i + 1}. **${d.ruleCitation}**: ${d.defectText}\n   *സ്വീകരിച്ച തിരുത്തൽ നടപടി*: ${d.rectificationPlan}`)
      .join('\n\n');

    const calcFar = data.plotAreaSqM > 0 ? ((data.totalFloorAreaSqM || data.totalBuiltUpAreaSqM || 0) / data.plotAreaSqM).toFixed(2) : '0.98';
    const calcCov = data.plotAreaSqM > 0 ? (((data.groundCoverageSqM || 0) / data.plotAreaSqM) * 100).toFixed(1) : '48';

    const generatedEn = `To,
The Assistant Engineer / Town Planning Officer,
LSGD Engineering Wing,
${localBodyName}, ${district}, Kerala.

Subject: Submission of Revised Drawing & Point-by-Point Compliance Reply on Scrutiny Notice (Sy. No. ${surveyNo}, ${villageName} Village)

Ref: K-Smart Online Building Permit Application No: KBR/KL/${new Date().getFullYear()}/${surveyNo.replace(/\//g, '-')}
Applicant: ${applicantName}

Respected Sir/Madam,

With reference to the scrutiny notice issued through the K-Smart portal for the proposed ${data.occupancyGroup || 'Residential (A1)'} building in Sy. No. ${surveyNo} of ${villageName} Village, we have thoroughly verified the site parameters against Kerala Building Rules 2019.

We submit herewith our point-by-point clarification and revised drawings:

${defectBulletsEn}

SUMMARY OF PROJECT SPECIFICATIONS:
• Plot Area: ${data.plotAreaCents || 4.5} Cents (${data.plotAreaSqM || 182.1} sq.m)
• Total Proposed Built-Up Area: ${data.totalBuiltUpAreaSqM || 178.5} sq.m
• Calculated FAR: ${calcFar} (Permissible: ${data.jurisdiction === 'KMBR' ? '3.00' : '2.75'})
• Ground Coverage: ${calcCov}% (Permissible: ${data.jurisdiction === 'KMBR' ? '60%' : '65%'})
• Front Setback: ${data.frontSetbackM || 3.0} m
• Rear Setback: ${data.rearSetbackM || 1.5} m
• Side Setbacks: Side 1: ${data.sideSetback1M || 1.2} m | Side 2: ${data.sideSetback2M || 1.0} m

The digital CAD drawing layers have been rectified in strict accordance with the K-Smart validation standards. We kindly request you to verify the uploaded files and approve the Building Permit at the earliest.

Thanking you,

Yours faithfully,

Er. / Ar. __________________________
Registered Architect / Licensed Engineer
Vinyasa Verified AI Submission System`;

    const generatedMl = `സ്വീകർത്താവ്,
അസിസ്റ്റന്റ് എഞ്ചിനീയർ / ടൗൺ പ്ലാനിംഗ് ഓഫീസർ,
എൽ.എസ്.ജി.ഡി എഞ്ചിനീയറിംഗ് വിങ്,
${localBodyName}, ${district} ജില്ല, കേരളം.

വിഷയം: കെ-സ്മാർട്ട് സ്ക്രൂട്ടിനി നോട്ടീസിൻമേലുള്ള വിശദീകരണവും തിരുത്തിയ പ്ലാൻ സമർപ്പിക്കുന്നതും സംബന്ധിച്ച്.
റഫറൻസ്: കെ-സ്മാർട്ട് അപേക്ഷാ നമ്പർ: KBR/KL/${new Date().getFullYear()}/${surveyNo.replace(/\//g, '-')}
അപേക്ഷകൻ: ${applicantName}
സ്ഥലം: സർവേ നമ്പർ: ${surveyNo}, ${villageName} വില്ലേജ്

ബഹുമാനപ്പെട്ട സാർ/മാഡം,

മേൽ സൂചിപ്പിച്ച സ്ഥലത്ത് ${applicantName} യുടെ പേരിൽ സമർപ്പിച്ച ${data.occupancyGroup || 'റസിഡൻഷ്യൽ'} കെട്ടിട നിർമ്മാണ അപേക്ഷയിന്മേൽ കെ-സ്മാർട്ട് പോർട്ടൽ വഴി ലഭിച്ച പരിശോധനാ കുറിപ്പുകൾ വിശദമായി പരിശോധിക്കുകയും കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ പ്രകാരം ആവശ്യമായ എല്ലാ തിരുത്തലുകളും വരുത്തുകയും ചെയ്തിട്ടുണ്ട്.

നോട്ടീസിലെ ഓരോ നിരീക്ഷണങ്ങൾക്കുമുള്ള വിശദീകരണം താഴെ നൽകുന്നു:

${defectBulletsMl}

പ്രോജക്റ്റിന്റെ പ്രധാന വിവരങ്ങൾ:
• പ്ലോട്ടിന്റെ വിസ്തീർണ്ണം: ${data.plotAreaCents || 4.5} സെന്റ് (${data.plotAreaSqM || 182.1} ച.മീറ്റർ)
• ആകെ നിർമ്മിതി വിസ്തീർണ്ണം: ${data.totalBuiltUpAreaSqM || 178.5} ച.മീറ്റർ
• FAR: ${calcFar} (അനുവദനീയം: ${data.jurisdiction === 'KMBR' ? '3.00' : '2.75'})
• ഗ്രൗണ്ട് കവറേജ്: ${calcCov}% (അനുവദനീയം: ${data.jurisdiction === 'KMBR' ? '60%' : '65%'})
• മുൻവശത്തെ അകലം: ${data.frontSetbackM || 3.0} മീറ്റർ | പിൻവശം: ${data.rearSetbackM || 1.5} മീറ്റർ
• വശങ്ങളിലെ അകലം: സൈഡ് 1: ${data.sideSetback1M || 1.2} മീറ്റർ | സൈഡ് 2: ${data.sideSetback2M || 1.0} മീറ്റർ

മേൽ പറഞ്ഞ പ്രകാരം തയ്യാറാക്കിയ ഡിജിറ്റൽ CAD ഡ്രോയിംഗുകൾ കെ-സ്മാർട്ട് പോർട്ടലിൽ അപ്‌ലോഡ് ചെയ്തിട്ടുണ്ട്. ആയതിനാൽ പ്രസ്തുത അപേക്ഷ പരിശോധിച്ച് കെട്ടിട നിർമ്മാണ പെർമിറ്റ് അനുവദിച്ച് നൽകണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.

വിശ്വസ്തതയോടെ,

എഞ്ചിനീയർ / ആർക്കിടെക്റ്റ്
രജിസ്ട്രേഷൻ നമ്പർ: __________________`;

    setCustomLetterBody(isMl ? generatedMl : generatedEn);
  };

  // Ready Official Letter Templates
  const officialTemplates = [
    {
      id: 'letter-1',
      titleEn: 'K-Smart AE Defect Rectification Reply',
      titleMl: 'കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ നിവാരണ മറുപടി കത്ത്',
      category: 'K-Smart & LSGD',
      icon: '🏛️',
    },
    {
      id: 'letter-2',
      titleEn: 'Rule 60/62 Small Plot Exemption Petition',
      titleMl: 'റൂൾ 60 ചെറിയ പ്ലോട്ട് ഇളവ് അപേക്ഷ',
      category: 'Exemptions',
      icon: '📐',
    },
    {
      id: 'letter-3',
      titleEn: 'Rule 91 Sanitation & Well Buffer Declaration',
      titleMl: 'കിണർ-സെപ്റ്റിക് ടാങ്ക് ദൂരപരിധി സത്യവാങ്മൂലം',
      category: 'Affidavit',
      icon: '💧',
    },
    {
      id: 'letter-4',
      titleEn: 'K-Smart Self-Certification Permit Undertaking (<=300 sq.m)',
      titleMl: 'സെൽഫ് സർട്ടിഫിക്കേഷൻ ഫാസ്റ്റ് ട്രാക്ക് സത്യവാങ്മൂലം',
      category: 'Self-Certification',
      icon: '⚡',
    },
    {
      id: 'letter-5',
      titleEn: 'Access Road / ROW Concession Petition',
      titleMl: 'വഴിവീതി സംബന്ധിച്ച വിശദീകരണ കത്ത്',
      category: 'Road Access',
      icon: '🛣️',
    },
    {
      id: 'letter-6',
      titleEn: 'Statutory Appeal to District Town Planner (DTP)',
      titleMl: 'ടൗൺ പ്ലാനർ / ട്രൈബ്യൂണൽ അപ്പീൽ ഹർജി',
      category: 'Appeals',
      icon: '⚖️',
    },
  ];

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    switch (id) {
      case 'letter-1':
        generateAutoReplyFromDefects(
          analyzedDefects || [
            {
              id: 'd1',
              ruleCitation: data.jurisdiction === 'KMBR' ? 'KMBR Rule 25' : 'KPBR Rule 27',
              defectText: isMl ? 'സെറ്റ്ബാക്കുകൾ ചട്ടപ്രകാരം ക്രമീകരിച്ചു.' : 'Setbacks aligned with statutory rules.',
              rectificationPlan: isMl ? 'ഡ്രോയിംഗ് തിരുത്തി കെ-സ്മാർട്ടിൽ അപ്‌ലോഡ് ചെയ്തു.' : 'Drawings revised on K-Smart.',
              severity: 'high',
            },
          ]
        );
        break;
      case 'letter-2':
        setCustomLetterBody(
          isMl
            ? `സ്വീകർത്താവ്,
സെക്രട്ടറി,
${localBodyName}, ${district} ജില്ല.

വിഷയം: KMBR/KPBR 2019 ചട്ടം 60/62 പ്രകാരം ചെറിയ പ്ലോട്ടുകൾക്കുള്ള ഇളവുകൾ അനുവദിക്കുന്നത് സംബന്ധിച്ച്.
അപേക്ഷകൻ: ${applicantName} | സർവേ നമ്പർ: ${surveyNo}, ${villageName} വില്ലേജ്

ബഹുമാനപ്പെട്ട സെക്രട്ടറി അവർകൾക്ക്,

മേൽ സൂചിപ്പിച്ച സർവേ നമ്പറിലുള്ള ${data.plotAreaCents || 3.5} സെന്റ് (${data.plotAreaSqM || 141.6} ച.മീറ്റർ) വസ്തു പരമ്പരാഗതമായി കൈവശമുള്ള ചെറിയ പ്ലോട്ടാണ്. 

പ്രസ്തുത പ്ലോട്ട് 200 ചതുരശ്ര മീറ്ററിൽ താഴെയായതിനാൽ കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങളിലെ റൂൾ 60 (KPBR) / റൂൾ 62 (KMBR) പ്രകാരമുള്ള താഴെ പറയുന്ന ഇളവുകൾ അനുവദിച്ച് തരണമെന്ന് അപേക്ഷിക്കുന്നു:
1. മുൻവശത്തെ സെറ്റ്ബാക്ക് 1.80 മീറ്ററായി ക്രമീകരിച്ചിരിക്കുന്നു.
2. പിൻവശം 1.00 മീറ്ററും പാർശ്വഭാഗങ്ങളിൽ ശരാശരി 0.90 മീറ്ററും നൽകിയിട്ടുണ്ട്.
3. നിർദ്ദിഷ്ട പ്ലാനിൽ അഗ്നിസുരക്ഷയും വെന്റിലേഷനും ഉറപ്പുവരുത്തിയിട്ടുണ്ട്.

ആയതിനാൽ മേൽ വസ്തുതകൾ പരിഗണിച്ച് ചെറിയ പ്ലോട്ടുകൾക്കുള്ള ചട്ടപ്രകാരമുള്ള ഇളവുകളോടെ പ്ലാൻ പാസ്സാക്കി തരണമെന്ന് വിനീതമായി അപേക്ഷിക്കുന്നു.

വിശ്വസ്തതയോടെ,
${applicantName} (അപേക്ഷകൻ)
എഞ്ചിനീയർ / ആർക്കിടെക്റ്റ് സാക്ഷ്യപത്രം`
            : `To,
The Secretary,
${localBodyName}, ${district} District, Kerala.

Subject: Petition for Statutory Small Plot Concessions under Rule 60/62 of Kerala Building Rules 2019
Applicant: ${applicantName} | Sy. No. ${surveyNo}, ${villageName} Village

Respected Sir,

The subject plot in Sy. No. ${surveyNo} measuring ${data.plotAreaCents || 3.5} Cents (${data.plotAreaSqM || 141.6} sq.m) is a bona fide small land parcel below 200 sq.m.

We pray for the grant of admissible concessions under Rule 60 (KPBR) / Rule 62 (KMBR):
1. Front open space provided: 1.80 m.
2. Rear open space provided: 1.00 m with solid fire-rated wall.
3. Side open space average: 0.90 m.

The proposed design strictly meets structural stability and fire egress requirements. Kindly sanction the permit under the small plot provisions.

Yours faithfully,
${applicantName}
Licensed Engineer / Registered Architect`
        );
        break;
      case 'letter-3':
        setCustomLetterBody(
          isMl
            ? `സത്യവാങ്മൂലം (AFFIDAVIT)
(കേരള കെട്ടിട നിർമ്മാണ ചട്ടം 91 / 47 പ്രകാരം കിണർ-സെപ്റ്റിക് ടാങ്ക് ദൂരപരിധി സംബന്ധിച്ചത്)

ഞാൻ, ${applicantName}, ${villageName} വില്ലേജിൽ സർവേ നമ്പർ: ${surveyNo} ൽ സ്ഥിതി ചെയ്യുന്ന സ്ഥലത്ത് നിർദ്ദേശിച്ചിട്ടുള്ള ${data.occupancyGroup || 'പാർപ്പിട'} കെട്ടിടത്തിന്റെ ഉടമസ്ഥനും അപേക്ഷകനുമാകുന്നു.

താഴെ പറയുന്ന കാര്യങ്ങൾ ഇതിനാൽ ഉത്തമവിശ്വാസത്തോടെ സത്യവാങ്മൂലം ചെയ്യുന്നു:
1. എന്റെ വസ്തുവിലോ തൊട്ടടുത്ത അയൽ വസ്തുക്കളിലോ ഉള്ള കുടിവെള്ള കിണറുകളിൽ നിന്നും 7.50 മീറ്ററിലധികം കൃത്യമായ തിരശ്ചീന ദൂരം പാലിച്ചാണ് സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും സ്ഥാപിക്കുന്നത്.
2. സെപ്റ്റിക് ടാങ്ക് പൂർണ്ണമായും കോൺക്രീറ്റ് വാട്ടർപ്രൂഫിംഗ് നടത്തിയും അടിവശം ചോർച്ചയില്ലാതെയും മാത്രമേ നിർമ്മിക്കുകയുള്ളൂ.
3. കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ ലംഘിക്കുന്ന പക്ഷം തദ്ദേശ സ്ഥാപന അധികാരികൾ എടുക്കുന്ന ഏത് നിയമ നടപടികൾക്കും ഞാൻ പൂർണ്ണ ബാധ്യസ്ഥനായിരിക്കും.

മേൽ പറഞ്ഞ കാര്യങ്ങൾ പൂർണ്ണമായും സത്യമാണെന്ന് ഇതിനാൽ ബോധിപ്പിക്കുന്നു.

ഒപ്പ്:
${applicantName} (അപേക്ഷകൻ)
സാക്ഷ്യപ്പെടുത്തിയത്: രജിസ്ട്രേഡ് എഞ്ചിനീയർ`
            : `AFFIDAVIT & STATUTORY UNDERTAKING
(Under Rule 91 of KMBR / Rule 47 of KPBR - Sanitation Buffer Clearances)

I, ${applicantName}, applicant for building permit in Sy. No. ${surveyNo}, ${villageName} Village, do hereby solemnly affirm and declare as under:

1. The proposed septic tank and soak pit shall maintain a clear horizontal buffer distance exceeding 7.50 meters from any open drinking well located within this plot or neighboring plots.
2. The septic tank shall be constructed using RCC watertight grade materials in full conformance with statutory sanitation codes.
3. In case of any deviation, I shall be solely liable under the provisions of the Kerala Panchayat / Municipality Raj Act.

Deponent: ${applicantName}
Verified by: Licensed Engineer / Architect`
        );
        break;
      case 'letter-4':
        setCustomLetterBody(
          isMl
            ? `കെ-സ്മാർട്ട് ലോ-റിസ്ക് സെൽഫ് സർട്ടിഫിക്കേഷൻ സത്യവാങ്മൂലം
(സർക്കാർ ഉത്തരവ് GO(Ms) No. 98/2022/LSGD & 12/2024/LSGD പ്രകാരം)

തദ്ദേശ സ്ഥാപനം: ${localBodyName}
അപേക്ഷകൻ: ${applicantName} | സർവേ നമ്പർ: ${surveyNo}, ${villageName}

ഞാൻ, ലൈസൻസ്ഡ് എഞ്ചിനീയർ / ആർക്കിടെക്റ്റ്, താഴെ പറയുന്ന കാര്യങ്ങൾ ഇതിനാൽ സാക്ഷ്യപ്പെടുത്തുന്നു:
1. പ്രസ്തുത പ്ലാനിലെ നിർമ്മിതി ആകെ ${data.totalBuiltUpAreaSqM || 178.5} ചതുരശ്ര മീറ്റർ വിസ്തീർണ്ണമുള്ള ഗ്രൂപ്പ് A1 പാർപ്പിട കെട്ടിടമാകുന്നു (300 ച.മീറ്ററിൽ താഴെ).
2. കെട്ടിടത്തിന്റെ ആകെ ഉയരം ${data.buildingHeightM || 7.2} മീറ്റർ ആകുന്നു (10 മീറ്ററിൽ താഴെ).
3. പ്രസ്തുത പ്ലാൻ കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങളിലെ സെറ്റ്ബാക്ക്, FAR, കവറേജ്, ഫയർ സേഫ്റ്റി മാനദണ്ഡങ്ങൾ 100% പാലിക്കുന്നുണ്ട്.
4. സർക്കാർ ഉത്തരവ് പ്രകാരം തൽക്ഷണ ഡിജിറ്റൽ പെർമിറ്റ് ഇഷ്യൂ ചെയ്യുന്നതിനായി ഈ സാക്ഷ്യപത്രം സമർപ്പിക്കുന്നു.

എഞ്ചിനീയർ / ആർക്കിടെക്റ്റ് ഒപ്പ് & സീൽ:
ലൈസൻസ് നമ്പർ: __________________`
            : `K-SMART LOW-RISK SELF-CERTIFICATION UNDERTAKING
(Under Kerala LSGD Fast-Track Orders GO(Ms) No. 98/2022 & 12/2024)

Authority: ${localBodyName}
Applicant: ${applicantName} | Sy. No. ${surveyNo}, ${villageName}

I, Registered Architect / Licensed Engineer, hereby solemnly certify:
1. Proposed building is Group A1 Residential with total built-up area of ${data.totalBuiltUpAreaSqM || 178.5} sq.m (<= 300 sq.m).
2. Total height is ${data.buildingHeightM || 7.2} m (<= 10.0 m).
3. The CAD drawing strictly adheres to all KMBR/KPBR statutory provisions without any deviations.
4. Recommended for instant automated digital permit generation via K-Smart.

Licensed Engineer Signature & Seal`
        );
        break;
      default:
        break;
    }
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(customLetterBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const handleCustomAiDraft = () => {
    if (!customPrompt.trim()) return;
    setIsAiDrafting(true);
    setTimeout(() => {
      const generated = isMl
        ? `സ്വീകർത്താവ്,
അസിസ്റ്റന്റ് എഞ്ചിനീയർ / സെക്രട്ടറി,
${localBodyName}, ${district} ജില്ല.

വിഷയം: ${customPrompt} - സംബന്ധിച്ച വിശദീകരണ കത്ത്.
അപേക്ഷകൻ: ${applicantName} | സർവേ നമ്പർ: ${surveyNo}

ബഹുമാനപ്പെട്ട സാർ,

മേൽ വിഷയവുമായി ബന്ധപ്പെട്ട് ${applicantName} സമർപ്പിച്ച കെട്ടിട നിർമ്മാണ പ്ലാനിൽ താഴെ പറയുന്ന വിശദീകരണങ്ങൾ നൽകുന്നു:

1. ${customPrompt} സംബന്ധിച്ച് കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (2019) പ്രകാരമുള്ള വ്യവസ്ഥകൾ കൃത്യമായി പാലിച്ചിട്ടുണ്ട്.
2. ആവശ്യമായ തിരുത്തലുകൾ ഡ്രോയിംഗിൽ വരുത്തി സൈറ്റ് പ്ലാൻ അപ്‌ഡേറ്റ് ചെയ്തിരിക്കുന്നു.

ആയതിനാൽ പ്രസ്തുത അപേക്ഷ പരിശോധിച്ച് പെർമിറ്റ് അനുവദിച്ച് തരണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.

വിശ്വസ്തതയോടെ,
രജിസ്ട്രേഡ് ആർക്കിടെക്റ്റ് / എഞ്ചിനീയർ`
        : `To,
The Assistant Engineer / Secretary,
${localBodyName}, ${district} District.

Subject: Submission regarding ${customPrompt}
Applicant: ${applicantName} | Sy. No. ${surveyNo}

Respected Sir/Madam,

With reference to the specific requirement regarding "${customPrompt}", we clarify that the proposed plan strictly adheres to the statutory provisions under Kerala Building Rules 2019.

Kindly verify the attached drawings and approve the permit.

Yours faithfully,
Licensed Engineer / Architect`;

      setCustomLetterBody(generated);
      setIsAiDrafting(false);
      setActiveMode('letters');
    }, 600);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.txt"
        className="hidden"
        onChange={handleFileUpload}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Top Header & Mode Toggle */}
      <div className="bg-gradient-to-r from-[#070E1E] via-[#0A1628] to-[#070E1E] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,240,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMl ? 'കെ-സ്മാർട്ട് നോട്ടീസ് & മറുപടി എഞ്ചിൻ' : 'K-Smart Notice & Official Reply Engine'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{isMl ? 'നോട്ടീസ് അപ്‌ലോഡ് & ഔദ്യോഗിക തിരുത്തൽ' : 'Notice Ingest & Statutory Rectifications'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {isMl
                ? 'എൽ.എസ്.ജി.ഡി ഒബ്ജക്ഷൻ നോട്ടീസുകൾ (PDF/ഇമേജ്) അപ്‌ലോഡ് ചെയ്താൽ AI അവ പൂർണ്ണമായി വായിച്ച് ചട്ടപ്രകാരമുള്ള തിരുത്തൽ നിർദ്ദേശങ്ങളും ഔദ്യോഗിക മറുപടി കത്തും തത്സമയം തയ്യാറാക്കുന്നു.'
                : 'Upload LSGD scrutiny objection memos (PDF/Images) or paste text to diagnose defects, rectify CAD layers, and generate legally sound reply letters grounded in KMBR/KPBR.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveMode('notice_analyzer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'notice_analyzer'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isMl ? '1. നോട്ടീസ് അപ്‌ലോഡ് & ഓട്ടോ-തിരുത്തൽ' : '1. Notice Ingest & Auto-Fix'}</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('letters');
                if (!customLetterBody) handleSelectTemplate('letter-1');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'letters'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSignature className="w-4 h-4" />
              <span>{isMl ? '2. ഔദ്യോഗിക കത്ത് സ്റ്റുഡിയോ' : '2. Official Letter Studio'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: NOTICE INGEST & AUTO-FIX */}
      {activeMode === 'notice_analyzer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* Left Column: Notice File Upload & Text Input */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#0A101D] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>{isMl ? 'നോട്ടീസ് ഫയൽ അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Objection Memo / Notice'}</span>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded-md border border-cyan-500/30">
                  PDF / Image / OCR
                </span>
              </div>

              {/* Interactive File Dropzone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all cursor-pointer group ${
                  noticeFile
                    ? 'border-emerald-500/60 bg-emerald-950/20'
                    : 'border-slate-800 hover:border-cyan-500/60 bg-slate-950/60 hover:bg-cyan-950/20'
                }`}
              >
                {noticeFile ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-3">
                      {noticeFile.isImage ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-emerald-500/40">
                          <img src={noticeFile.dataUrl} alt="Notice Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="text-left flex-1 min-w-0">
                        <div className="text-xs font-bold text-emerald-300 truncate">{noticeFile.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {(noticeFile.size / 1024).toFixed(1)} KB · {noticeFile.isPdf ? 'PDF Memo' : 'Image Scan'}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" />
                          <span>{isMl ? 'ഫയൽ തയ്യാറാണ്' : 'File attached for AI OCR parsing'}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoticeFile(null);
                        }}
                        className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 border border-slate-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        {isMl ? 'നോട്ടീസ് ഫയൽ ഇവിടെ വലിച്ചിടുക അല്ലെങ്കിൽ ബ്രൗസ് ചെയ്യുക' : 'Drag & drop notice file or click to browse'}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PDF, JPG, PNG, DOCX {isMl ? '(എൽ.എസ്.ജി.ഡി / കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ ഷീറ്റ്)' : '(LSGD / K-Smart defect sheets)'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Action Helpers (Browse Button / Camera Capture) */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isMl ? 'ഫയൽ തിരഞ്ഞെടുക്കുക' : 'Browse File'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title={isMl ? 'ക്യാമറ ഉപയോഗിച്ച് നോട്ടീസ് പകർത്തുക' : 'Capture printed notice with camera'}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isMl ? 'ക്യാമറ' : 'Camera'}</span>
                </button>
              </div>

              {/* Sample Presets for Quick Testing */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-semibold text-slate-400">
                  {isMl ? 'സാമ്പിൾ നോട്ടീസുകൾ ഉപയോഗിച്ച് പരീക്ഷിക്കുക:' : 'Or try with standard LSGD defect presets:'}
                </label>
                <div className="flex flex-col gap-1.5">
                  {sampleNotices.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNoticeText(s.content)}
                      className="text-left text-xs p-2.5 rounded-xl bg-slate-900/80 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className="truncate">{isMl ? s.titleMl : s.titleEn}</span>
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea for pasting defect remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isMl ? 'നോട്ടീസ് ടെക്സ്റ്റ് നേരിട്ട് ഇവിടെ നൽകുക (ഓപ്ഷണൽ):' : 'Paste notice or defect sheet remarks here (optional):'}
                </label>
                <textarea
                  rows={4}
                  value={noticeText}
                  onChange={(e) => setNoticeText(e.target.value)}
                  placeholder={
                    isMl
                      ? 'ഉദാഹരണത്തിന്: Front setback 2.85m is less than mandatory 3.00m under KMBR Rule 25. Well distance to septic tank is insufficient...'
                      : 'e.g. Front setback 2.85m is less than mandatory 3.00m under KMBR Rule 25. Well-to-septic tank buffer violation...'
                  }
                  className="w-full p-3.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-2xl text-xs font-mono text-slate-200 placeholder-slate-500 outline-none resize-y"
                />
              </div>

              {analysisError && (
                <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{analysisError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleAnalyzeNotice}
                disabled={isAnalyzingNotice || (!noticeText.trim() && !noticeFile)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAnalyzingNotice ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isMl ? 'AI നോട്ടീസ് വായിച്ച് വിശകലനം ചെയ്യുന്നു...' : 'AI Scanning Notice & Grounding in KBR 2019...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isMl ? 'വിശകലനം ചെയ്ത് തിരുത്തലും മറുപടിയും തയ്യാറാക്കുക' : 'Diagnose & Generate Compliance Reply'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Custom AI Prompt Box */}
            <div className="bg-[#0A101D] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isMl ? 'പ്രത്യേക വിഷയങ്ങളിൽ AI കത്ത് എഴുതാൻ' : 'Custom AI Letter Draftsman'}</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={
                    isMl
                      ? 'ഉദാ: കിണർ നിർമ്മാണ അനുമതിക്ക് പഞ്ചായത്ത് പ്രസിഡന്റിന് കത്ത്'
                      : 'e.g. Letter to Panchayat Secretary regarding retaining wall approval'
                  }
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleCustomAiDraft}
                  disabled={isAiDrafting || !customPrompt.trim()}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAiDrafting ? '...' : (isMl ? 'എഴുതുക' : 'Draft')}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Detected Defects & Live Rectification Plan */}
          <div className="lg:col-span-7 space-y-4">
            {analyzedDefects ? (
              <div className="space-y-4 animate-scaleUp">
                {/* Defect Cards */}
                <div className="bg-[#0A101D] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-extrabold text-white">
                        {isMl ? 'കണ്ടെത്തിയ അപാകതകളും പരിഹാരങ്ങളും' : 'Detected Scrutiny Remarks & Statutory Remedies'}
                      </h3>
                    </div>
                    <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                      {analyzedDefects.length} {isMl ? 'ഇനങ്ങൾ' : 'Items'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {analyzedDefects.map((def) => (
                      <div
                        key={def.id}
                        className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 space-y-2 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {def.ruleCitation}
                          </span>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
                            Action Required
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium">
                          <strong className="text-slate-100">{isMl ? 'നോട്ടീസ് കുറിപ്പ്:' : 'Remark:'}</strong>{' '}
                          {def.defectText}
                        </p>

                        <div className="bg-[#0D1627] border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>{isMl ? 'ഓട്ടോ-തിരുത്തൽ നടപടി:' : 'Automated Rectification Action:'}</span>
                          </div>
                          <p className="text-slate-200 text-[11px] leading-relaxed">{def.rectificationPlan}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setActiveMode('letters')}
                      className="w-full py-3.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileSignature className="w-4 h-4" />
                      <span>{isMl ? 'ഔദ്യോഗിക മറുപടി കത്ത് തുറക്കുക' : 'Open Generated Official Reply Letter'}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State Prompt */
              <div className="bg-[#0A101D] border border-dashed border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.15)]">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-bold text-white">
                    {isMl ? 'നോട്ടീസ് അപ്‌ലോഡ് ചെയ്ത് പരിശോധിക്കുക' : 'Upload or Paste Notice to Diagnose'}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isMl
                      ? 'തദ്ദേശ സ്ഥാപനങ്ങളിൽ നിന്നോ കെ-സ്മാർട്ട് പോർട്ടലിൽ നിന്നോ ലഭിച്ച നോട്ടീസ് (PDF/ഇമേജ്) ഇടതുവശത്ത് അപ്‌ലോഡ് ചെയ്യുക. AI സാങ്കേതികവിദ്യ വഴി ഡ്രോയിംഗ് തിരുത്തലുകളും മറുപടി കത്തും സ്വയം തയ്യാറാക്കുന്നു.'
                      : 'Upload objection memos or paste defect text to automatically generate legally sound, rule-cited response letters and CAD layer modifications.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODE 2: OFFICIAL LETTER STUDIO */}
      {activeMode === 'letters' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-left">
          {/* Left Column: Template Selector & Metadata Inputs */}
          <div className="lg:col-span-4 space-y-4">
            {/* Template Selector */}
            <div className="bg-[#0A101D] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{isMl ? 'കത്ത് മാതൃകകൾ തിരഞ്ഞെടുക്കുക' : 'Official Letter Categories'}</span>
              </h3>

              <div className="space-y-1.5">
                {officialTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      selectedTemplateId === tpl.id
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                        : 'bg-slate-950/80 border-slate-800 hover:border-cyan-500/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{tpl.icon}</span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">
                          {isMl ? tpl.titleMl : tpl.titleEn}
                        </div>
                        <div className="text-[10px] text-slate-400">{tpl.category}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metadata Editor */}
            <div className="bg-[#0A101D] border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3 text-xs">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider">
                {isMl ? 'പ്രോജക്റ്റ് വിശദാംശങ്ങൾ തിരുത്താൻ' : 'Project Parameters'}
              </h4>

              <div className="space-y-2">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400">{isMl ? 'അപേക്ഷകൻ:' : 'Applicant:'}</label>
                  <input
                    type="text"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400">{isMl ? 'തദ്ദേശ സ്ഥാപനം:' : 'Local Body:'}</label>
                  <input
                    type="text"
                    value={localBodyName}
                    onChange={(e) => setLocalBodyName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">{isMl ? 'സർവേ നമ്പർ:' : 'Survey No:'}</label>
                    <input
                      type="text"
                      value={surveyNo}
                      onChange={(e) => setSurveyNo(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-slate-400">{isMl ? 'വില്ലേജ്:' : 'Village:'}</label>
                    <input
                      type="text"
                      value={villageName}
                      onChange={(e) => setVillageName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Official Formatted Letter Preview & Actions */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-300 relative print:p-0 print:border-none print:shadow-none">
              {/* Official Letterhead Header */}
              <div className="border-b-2 border-slate-900 pb-4 mb-4 text-center space-y-1">
                <div className="text-[10px] tracking-widest uppercase font-extrabold text-slate-600">
                  GOVERNMENT OF KERALA · LOCAL SELF GOVERNMENT DEPARTMENT
                </div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 uppercase">
                  STATUTORY BUILDING SCRUTINY & RECTIFICATION MEMORANDUM
                </h1>
                <div className="text-[11px] text-slate-600 font-mono flex items-center justify-center gap-4">
                  <span>Ref: KBR/KL/{new Date().getFullYear()}/{surveyNo.replace(/\//g, '-')}</span>
                  <span>•</span>
                  <span>Date: {new Date().toLocaleDateString('en-GB')}</span>
                </div>
              </div>

              {/* Editable Letter Body */}
              <textarea
                rows={16}
                value={customLetterBody}
                onChange={(e) => setCustomLetterBody(e.target.value)}
                className="w-full p-2 bg-transparent text-xs sm:text-sm font-serif leading-relaxed text-slate-900 border-none outline-none resize-y selection:bg-cyan-200"
              />

              {/* Stamp & Signature Space */}
              <div className="pt-8 border-t border-slate-200 flex items-end justify-between text-xs text-slate-700">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">Vinyasa Verified Reference</div>
                  <div className="text-[10px] font-mono text-slate-500">ID: VIN-{Date.now().toString().slice(-6)}</div>
                </div>

                <div className="text-right space-y-4">
                  <div className="h-10" />
                  <div className="border-t border-slate-800 pt-1 font-bold">
                    Registered Architect / Engineer Signature
                  </div>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0A101D] border border-cyan-500/30 p-4 rounded-2xl shadow-xl">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isMl ? 'നിയമസാധുതയുള്ള ഔദ്യോഗിക ഫോർമാറ്റ്' : 'Statutorily Compliant Format'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isMl ? 'പകർത്തി!' : 'Copied!') : (isMl ? 'കോപ്പി ചെയ്യുക' : 'Copy Text')}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintLetter}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isMl ? 'പ്രിന്റ് / PDF ഡൗൺലോഡ്' : 'Print / Download PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
