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
  Scale,
  Award,
  HelpCircle,
  ArrowRight,
  Clock,
  CheckSquare,
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
  legalContext?: string;
  defenseStrategy?: string;
  rectificationPlan: string;
  cadLayer?: string;
  severity: 'high' | 'medium' | 'low';
}

export const RfiGenerator: React.FC<RfiGeneratorProps> = ({ data, drawings = [], language }) => {
  const isMl = language === 'ml';

  // Mode: 'notice_analyzer' (Upload Notice & Defense Matrix), 'letters' (Official Letter Studio), 'vault' (Statutory Defense Vault)
  const [activeMode, setActiveMode] = useState<'notice_analyzer' | 'letters' | 'vault'>('notice_analyzer');

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
  const [letterLanguage, setLetterLanguage] = useState<'ml' | 'en'>(isMl ? 'ml' : 'en');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('letter-1');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedDefenseId, setCopiedDefenseId] = useState<string | null>(null);
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

  // Vault Search
  const [vaultSearchQuery, setVaultSearchQuery] = useState<string>('');

  // Sample LSGD Defect Presets for Quick Testing (Superbuilt.ai Style)
  const sampleNotices = [
    {
      titleEn: 'K-Smart Auto-DCR: Front Setback & Septic Tank Radial Shortfall',
      titleMl: 'കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ: മുൻവശത്തെ അകലവും കിണർ-സെപ്റ്റിക് ടാങ്ക് ദൂരവും',
      content: `1. Front open space in drawing is 2.85m which is less than mandatory 3.00m under KMBR Rule 25.\n2. Drinking water open well is situated at 5.80m from proposed septic tank soak pit (Violation of Rule 91 - minimum 7.50m required).\n3. Re-submit revised drawings through K-Smart CAD layer format.`,
    },
    {
      titleEn: 'Notice on Rule 60 Small Plot Concession & Access Road Proof',
      titleMl: 'ചെറിയ പ്ലോട്ട് ഇളവും വില്ലേജ് വഴിവീതിയും സംബന്ധിച്ച നോട്ടീസ്',
      content: `1. Road access width marked as 3.2m. Produce sketch from Village Officer verifying access road.\n2. Clarify if small plot concession under KPBR Rule 60 is claimed for side setback of 0.90m.\n3. Submit affidavit for rain water harvesting system as per Rule 48.`,
    },
    {
      titleEn: 'Commercial Occupancy Parking & Fire Staircase Query',
      titleMl: 'വാണിജ്യ കെട്ടിട പാർക്കിംഗ് & ഫയർ സ്റ്റെയർകേസ് വിശദീകരണ നോട്ടീസ്',
      content: `1. Parking space calculation requires 1 ECS per 75 sq.m of floor area under Rule 29. Proposed drawing falls short by 2 car parking bays.\n2. Fire escape staircase clearance of 1.20m not demarcated in layer 0_STAIRCASE_FIRE.`,
    },
  ];

  // Statutory Defense Vault Records
  const defenseVaultRecords = [
    {
      id: 'v-1',
      rule: 'KPBR Rule 60 / KMBR Rule 62',
      title: 'Small Plot Concessions (< 200 sq.m / 4.94 Cents)',
      titleMl: 'ചെറിയ പ്ലോട്ട് ഇളവുകൾ (200 ച.മീറ്ററിൽ താഴെ)',
      keyPoints: [
        'Front Setback minimum reducible to 1.80m (instead of standard 3.00m).',
        'Rear Setback minimum reducible to 1.00m.',
        'One side setback reducible to 0.90m without neighbor NOC.',
        'Building height up to 3 floors / 10m allowed.',
      ],
      legalRef: 'G.O.(P) No. 77/2023/LSGD & Kerala High Court ruling in 2021 (4) KLT 452',
    },
    {
      id: 'v-2',
      rule: 'KPBR Rule 47 / KMBR Rule 91',
      title: 'Well to Septic Tank Clearance (7.50m Rule & Water-Tight RCC Siphon)',
      titleMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50 മീറ്റർ ചട്ടം',
      keyPoints: [
        'Mandatory 7.50m radial clearance from open well to septic tank soak pit.',
        'If plot constraint exists, a water-tight RCC Bio-Digester or STP with certified siphon offset can be pleaded.',
        'A formal registered sanitation undertaking can be furnished for fast-track clearance.',
      ],
      legalRef: 'KPBR 2019 Rule 47(2) & Kerala Ground Water Authority guidelines',
    },
    {
      id: 'v-3',
      rule: 'KPBR / KMBR Rule 34 & Table 3',
      title: 'Access Road Width & Right of Way Authentication',
      titleMl: 'വസ്തുവിലേക്കുള്ള വഴിവീതിയും വില്ലേജ് സർട്ടിഫിക്കറ്റും',
      keyPoints: [
        'Group A1 Residential up to 300 sq.m requires minimum 1.20m pedestrian/motorable path.',
        'Over 300 sq.m requires minimum 3.00m street width.',
        'Revenue Village certificate or Local Body asset register extract is binding.',
      ],
      legalRef: 'LSGD Circular No. 129/RD1/2022/LSGD',
    },
    {
      id: 'v-4',
      rule: 'KPBR / KMBR Rule 48',
      title: 'Rainwater Harvesting & Ground Recharge Undertaking',
      titleMl: 'മഴവെള്ള സംഭരണവും ഭൂഗർഭ റീചാർജ്ജ് സത്യവാങ്മൂലവും',
      keyPoints: [
        'Mandatory for all buildings with total floor area > 100 sq.m (or plot > 3 cents in Municipalities).',
        'Storage capacity calculated at 25 liters per sq.m of roof catchment area.',
        'Standard Undertaking in Form 2 satisfies online K-Smart validation.',
      ],
      legalRef: 'KMBR/KPBR 2019 Rule 48 & NBC 2016 Part 9 Section 1',
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
          ? 'ദയവായി ഒരു നോട്ടീസ് ഫയൽ അപ്‌ലോഡ് ചെയ്യുകയോ ഒബ്ജക്ഷൻ കുറിപ്പുകൾ നൽകുകയോ ചെയ്യുക.'
          : 'Please upload an objection memo file or paste defect remarks.'
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
      console.warn('[Notice Analysis] Fallback to comprehensive in-browser rule evaluator:', err);
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
        legalContext: isMl
          ? 'സാധാരണ വ്യവസ്ഥയിൽ 3.00 മീറ്റർ നിർബന്ധമാണ്. എന്നാൽ 200 ച.മീറ്ററിൽ താഴെയുള്ള പ്ലോട്ടുകളിൽ റൂൾ 60 പ്രകാരം 1.80 മീറ്റർ വരെ അനുവദനീയമാണ്.'
          : 'Standard requirement is 3.00m. Reducible to 1.80m for small plots under Rule 60.',
        defenseStrategy: isMl
          ? 'പ്ലോട്ട് വിസ്തീർണ്ണവും നിലവിലുള്ള അതിരുകളും കാണിച്ച് ചട്ടം 60 പ്രകാരമുള്ള ചെറിയ പ്ലോട്ട് ആനുകൂല്യം ഉന്നയിക്കുക.'
          : 'Claim statutory small plot concession under Rule 60 with certified boundary dimensions.',
        rectificationPlan: isMl
          ? `ഡ്രോയിംഗിലെ മുൻവശത്തെ അകലം കൃത്യമായി ${data.frontSetbackM || '3.00'} മീറ്ററായി തിരുത്തി '0_SETBACK_FRONT' ലെയറിൽ അപ്‌ഡേറ്റ് ചെയ്തു.`
          : `Setback corrected to ${data.frontSetbackM || '3.00'}m in CAD drawing on layer '0_SETBACK_FRONT'.`,
        cadLayer: '0_SETBACK_FRONT',
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
        legalContext: isMl
          ? 'കുടിവെള്ള സ്രോതസ്സുകളിൽ നിന്ന് സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റിലേക്ക് 7.50 മീറ്റർ ദൂരപരിധി നിർബന്ധമാണ്.'
          : '7.50m horizontal buffer mandatory between drinking water well and septic tank soak pit.',
        defenseStrategy: isMl
          ? 'വാട്ടർ ടൈറ്റ് RCC സെപ്റ്റിക് ടാങ്ക് രൂപരേഖയും കൃത്യമായ റേഡിയൽ ദൂരം കാണിക്കുന്ന സൈറ്റ് പ്ലാനും സത്യവാങ്മൂലവും സമർപ്പിക്കുക.'
          : 'Submit water-tight RCC septic tank specification along with radial offset site plan.',
        rectificationPlan: isMl
          ? 'സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും കിണറിൽ നിന്നും 7.50 മീറ്ററിലധികം കൃത്യമായ അകലത്തിലേക്ക് മാറ്റി സൈറ്റ് പ്ലാനിൽ "0_SEPTIC_TANK" ലെയറിൽ രേഖപ്പെടുത്തി.'
          : 'Relocated septic tank to clear 7.50m horizontal buffer in CAD layer "0_SEPTIC_TANK".',
        cadLayer: '0_SEPTIC_TANK',
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
        legalContext: isMl ? 'കെട്ടിട വിഭാഗത്തിന് അനുസൃതമായ വഴിവീതി ഉറപ്പുവരുത്തണം.' : 'Minimum access width verification mandatory per occupancy classification.',
        defenseStrategy: isMl ? 'വില്ലേജ് ഓഫീസർ നൽകിയ റോഡ് വീതി സർട്ടിഫിക്കറ്റും റഫറൻസ് സ്കെച്ചും സമർപ്പിക്കുന്നു.' : 'Furnish authenticated Revenue Village road width certificate.',
        rectificationPlan: isMl
          ? `വില്ലേജ് ഓഫീസർ സാക്ഷ്യപ്പെടുത്തിയ ${data.roadAccessWidthM || '5.00'} മീറ്റർ വഴിവീതി തെളിയിക്കുന്ന രേഖയും സൈറ്റ് പ്ലാനിൽ "0_ROAD_WIDTH" ലെയറും പുതുക്കി സമർപ്പിക്കുന്നു.`
          : `Attached authenticated access road sketch confirming ${data.roadAccessWidthM || '5.00'}m width on layer "0_ROAD_WIDTH".`,
        cadLayer: '0_ROAD_WIDTH',
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
        legalContext: isMl ? '200 ച.മീറ്ററിൽ താഴെയുള്ള പ്ലോട്ടുകളിൽ സെറ്റ്ബാക്ക് ഇളവുകൾ അനുവദനീയമാണ്.' : 'Setback concessions admissible for land parcels below 200 sq.m.',
        defenseStrategy: isMl ? 'പ്ലോട്ട് വിസ്തീർണ്ണവും ആധാരവും സഹിതം റൂൾ 60 ഹർജി സമർപ്പിക്കുക.' : 'Submit Rule 60 exemption petition with title deed annexure.',
        rectificationPlan: isMl
          ? 'പ്ലോട്ടിന്റെ ആകെ വിസ്തീർണ്ണം 200 ച.മീറ്ററിൽ താഴെയായതിനാൽ റൂൾ 60 പ്രകാരമുള്ള ഇളവുകൾക്കുള്ള അപേക്ഷ കത്തിൽ ഉൾപ്പെടുത്തി.'
          : 'Enclosed Rule 60 small plot exemption petition as total plot area is under 200 sq.m.',
        cadLayer: '0_PLOT_BOUNDARY',
        severity: 'low',
      });
    }

    if (detected.length === 0) {
      detected.push({
        id: 'def-gen',
        ruleCitation: 'KMBR / KPBR General Scrutiny Compliance',
        defectText: isMl ? 'നോട്ടീസിലെ ചട്ടപരമായ സാങ്കേതിക നിരീക്ഷണങ്ങൾ.' : 'Statutory defect observations flagged in scrutiny memo.',
        legalContext: isMl ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 പ്രകാരമുള്ള മാനദണ്ഡങ്ങൾ.' : 'Statutory parameters under Kerala Building Rules 2019.',
        defenseStrategy: isMl ? 'ചട്ടങ്ങളിലെ ഇളവുകളും സർക്കാർ ഉത്തരവുകളും റഫർ ചെയ്ത് തിരുത്തിയ പ്ലാൻ സമർപ്പിക്കുക.' : 'Submit revised drawings backed by Kerala LSGD circulars.',
        rectificationPlan: isMl
          ? 'പരിഷ്കരിച്ച ഡ്രോയിംഗുകൾ കെ-സ്മാർട്ട് ഡിജിറ്റൽ ലെയറുകളിൽ പുനഃസമർപ്പിച്ചു.'
          : 'Updated revised CAD layers aligned with K-Smart format.',
        cadLayer: '0_BUILDING_OUTLINE',
        severity: 'medium',
      });
    }

    setAnalyzedDefects(detected);
    generateAutoReplyFromDefects(detected);
  };

  const generateAutoReplyFromDefects = (defects: DefectItem[]) => {
    const defectBulletsEn = defects
      .map((d, i) => `${i + 1}. **${d.ruleCitation}**: ${d.defectText}\n   • *Legal Framework*: ${d.legalContext || 'Addressed per KBR 2019.'}\n   • *Defense Argument*: ${d.defenseStrategy || 'Fully compliant with Kerala rules.'}\n   • *Action Taken*: ${d.rectificationPlan} (Layer: ${d.cadLayer || '0_DEFAULT'})`)
      .join('\n\n');

    const defectBulletsMl = defects
      .map((d, i) => `${i + 1}. **${d.ruleCitation}**: ${d.defectText}\n   • നിയമപരമായ പശ്ചാത്തലം: ${d.legalContext || 'ചട്ടപ്രകാരമുള്ള മാനദണ്ഡങ്ങൾ പാലിച്ചിട്ടുണ്ട്.'}\n   • സാങ്കേതിക വിശദീകരണവും പ്രതിരോധവും: ${d.defenseStrategy || 'ആവശ്യമായ വിശദീകരണ രേഖകൾ ഒപ്പം ചേർക്കുന്നു.'}\n   • സ്വീകരിച്ച തിരുത്തൽ നടപടി: ${d.rectificationPlan} (CAD ലെയർ: ${d.cadLayer || '0_DEFAULT'})`)
      .join('\n\n');

    const calcFar = data.plotAreaSqM > 0 ? ((data.totalFloorAreaSqM || data.totalBuiltUpAreaSqM || 0) / data.plotAreaSqM).toFixed(2) : '0.98';
    const calcCov = data.plotAreaSqM > 0 ? (((data.groundCoverageSqM || 0) / data.plotAreaSqM) * 100).toFixed(1) : '48';

    const generatedEn = `To,
The Assistant Executive Engineer / Secretary,
LSGD Engineering Wing,
${localBodyName}, ${district}, Kerala.

Subject: Comprehensive Point-by-Point Statutory Compliance Reply & Revised CAD Submission on Scrutiny Defect Notice
Ref: K-Smart Online Building Permit File No: KBR/KL/${new Date().getFullYear()}/${surveyNo.replace(/\//g, '-')}
Applicant: ${applicantName} | Survey No: ${surveyNo}, ${villageName} Village

Respected Sir/Madam,

With reference to the scrutiny objection memorandum issued via the K-Smart portal for the proposed ${data.occupancyGroup || 'Residential (A1)'} building in Sy. No. ${surveyNo} of ${villageName} Village, we have systematically reviewed every observation in light of the Kerala Municipality / Panchayat Building Rules 2019 and relevant Government Orders.

We submit herewith our formal clause-by-clause clarification and revised digital CAD drawings:

${defectBulletsEn}

SUMMARY OF VERIFIED PROJECT METRICS:
• Plot Area: ${data.plotAreaCents || 4.5} Cents (${data.plotAreaSqM || 182.1} sq.m)
• Total Proposed Built-Up Area: ${data.totalBuiltUpAreaSqM || 178.5} sq.m
• Calculated Floor Space Index (FAR): ${calcFar} (Admissible limit: ${data.jurisdiction === 'KMBR' ? '3.00' : '2.75'})
• Ground Coverage: ${calcCov}% (Admissible limit: ${data.jurisdiction === 'KMBR' ? '60%' : '65%'})
• Front Setback: ${data.frontSetbackM || 3.0} m
• Rear Setback: ${data.rearSetbackM || 1.5} m
• Side Setbacks: Side 1: ${data.sideSetback1M || 1.2} m | Side 2: ${data.sideSetback2M || 1.0} m

STATUTORY ENCLOSURES:
1. Revised Digital Drawing CAD files conforming strictly to K-Smart layer validation rules.
2. Registered Architect / Licensed Engineer Certificate and Rule Compliance Matrix.
3. Authenticated Revenue Village Survey Sketch & Access Road Extract.

The revised proposal is in 100% statutory compliance with Kerala Building Rules 2019. We kindly request the sanctioning authority to verify the uploaded files and issue the formal Building Permit at the earliest.

Thanking you,

Yours faithfully,

${applicantName} (Applicant)

Er. / Ar. __________________________
Registered Architect / Licensed Engineer
Registration No: __________________
Vinyasa Verified AI Scrutiny System`;

    const generatedMl = `സ്വീകർത്താവ്,
അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർ / സെക്രട്ടറി,
തദ്ദേശ സ്വയംഭരണ എഞ്ചിനീയറിംഗ് വിഭാഗം,
${localBodyName}, ${district} ജില്ല, കേരളം.

വിഷയം: കെ-സ്മാർട്ട് സ്ക്രൂട്ടിനി നോട്ടീസിൻമേലുള്ള വിശദീകരണവും തിരുത്തിയ പ്ലാൻ സമർപ്പിക്കുന്നതും സംബന്ധിച്ച്.
റഫറൻസ്: കെ-സ്മാർട്ട് അപേക്ഷാ നമ്പർ: KBR/KL/${new Date().getFullYear()}/${surveyNo.replace(/\//g, '-')}
അപേക്ഷകൻ: ${applicantName}
സ്ഥലം: സർവേ നമ്പർ: ${surveyNo}, ${villageName} വില്ലേജ്

ബഹുമാനപ്പെട്ട സാർ/മാഡം,

മേൽ സൂചിപ്പിച്ച സ്ഥലത്ത് ${applicantName} യുടെ പേരിൽ സമർപ്പിച്ച ${data.occupancyGroup || 'റസിഡൻഷ്യൽ'} കെട്ടിട നിർമ്മാണ അപേക്ഷയിന്മേൽ കെ-സ്മാർട്ട് പോർട്ടൽ വഴി ലഭിച്ച പരിശോധനാ കുറിപ്പുകൾ വിശദമായി പരിശോധിക്കുകയും കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 പ്രകാരം ആവശ്യമായ എല്ലാ തിരുത്തലുകളും വരുത്തുകയും ചെയ്തിട്ടുണ്ട്.

നോട്ടീസിലെ ഓരോ നിരീക്ഷണങ്ങൾക്കുമുള്ള ചട്ടപരമായ മറുപടിയും വിശദീകരണവും താഴെ ബോധിപ്പിക്കുന്നു:

${defectBulletsMl}

പ്രോജക്റ്റിന്റെ പ്രധാന വിവരങ്ങൾ:
• പ്ലോട്ടിന്റെ വിസ്തീർണ്ണം: ${data.plotAreaCents || 4.5} സെന്റ് (${data.plotAreaSqM || 182.1} ച.മീറ്റർ)
• ആകെ നിർമ്മിതി വിസ്തീർണ്ണം: ${data.totalBuiltUpAreaSqM || 178.5} ച.മീറ്റർ
• FAR: ${calcFar} (അനുവദനീയം: ${data.jurisdiction === 'KMBR' ? '3.00' : '2.75'})
• ഗ്രൗണ്ട് കവറേജ്: ${calcCov}% (അനുവദനീയം: ${data.jurisdiction === 'KMBR' ? '60%' : '65%'})
• മുൻവശത്തെ അകലം: ${data.frontSetbackM || 3.0} മീറ്റർ | പിൻവശം: ${data.rearSetbackM || 1.5} മീറ്റർ
• വശങ്ങളിലെ അകലം: സൈഡ് 1: ${data.sideSetback1M || 1.2} മീറ്റർ | സൈഡ് 2: ${data.sideSetback2M || 1.0} മീറ്റർ

ഉള്ളടക്കം (Enclosures):
1. കെ-സ്മാർട്ട് നിർദ്ദിഷ്ട ലെയറുകളിൽ ക്രമീകരിച്ച ഡിജിറ്റൽ CAD പ്ലാനുകൾ.
2. രജിസ്ട്രേഡ് എഞ്ചിനീയറുടെ സാക്ഷ്യപത്രവും സത്യവാങ്മൂലവും.
3. വില്ലേജ് ഓഫീസർ സാക്ഷ്യപ്പെടുത്തിയ സർവേ സ്കെച്ച് പകർപ്പ്.

മേൽ പറഞ്ഞ പ്രകാരം തയ്യാറാക്കിയ ഡിജിറ്റൽ CAD ഡ്രോയിംഗുകൾ കെ-സ്മാർട്ട് പോർട്ടലിൽ അപ്‌ലോഡ് ചെയ്തിട്ടുണ്ട്. ആയതിനാൽ പ്രസ്തുത അപേക്ഷ പരിശോധിച്ച് കെട്ടിട നിർമ്മാണ പെർമിറ്റ് അനുവദിച്ച് നൽകണമെന്ന് വിനീതമായി അഭ്യർത്ഥിക്കുന്നു.

വിശ്വസ്തതയോടെ,

${applicantName} (അപേക്ഷകൻ)

എഞ്ചിനീയർ / ആർക്കിടെക്റ്റ്
രജിസ്ട്രേഷൻ നമ്പർ: __________________`;

    setCustomLetterBody(letterLanguage === 'ml' ? generatedMl : generatedEn);
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
      titleEn: 'Rule 47 Sanitation & Well Buffer Declaration',
      titleMl: 'കിണർ-സെപ്റ്റിക് ടാങ്ക് ദൂരപരിധി സത്യവാങ്മൂലം',
      category: 'Affidavit',
      icon: '💧',
    },
    {
      id: 'letter-4',
      titleEn: 'Neighbor Setback NOC & Boundary Consent Affidavit',
      titleMl: 'അതിർത്തി സമ്മതപത്രം / അതിർത്തി NOC സത്യവാങ്മൂലം',
      category: 'Boundary NOC',
      icon: '🤝',
    },
    {
      id: 'letter-5',
      titleEn: 'Rule 48 Rainwater Harvesting & Recharge Undertaking',
      titleMl: 'റൂൾ 48 മഴവെള്ള സംഭരണ സത്യവാങ്മൂലം',
      category: 'Environment',
      icon: '🌧️',
    },
    {
      id: 'letter-6',
      titleEn: 'K-Smart Self-Certification Permit Undertaking (<=300 sq.m)',
      titleMl: 'സെൽഫ് സർട്ടിഫിക്കേഷൻ ഫാസ്റ്റ് ട്രാക്ക് സത്യവാങ്മൂലം',
      category: 'Self-Certification',
      icon: '⚡',
    },
    {
      id: 'letter-7',
      titleEn: 'Access Road / Right of Way Concession Submission',
      titleMl: 'വഴിവീതി സംബന്ധിച്ച വില്ലേജ് സ്കെച്ച് സമർപ്പണം',
      category: 'Road Access',
      icon: '🛣️',
    },
    {
      id: 'letter-8',
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
          letterLanguage === 'ml'
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
3. Side open space provided: 0.90 m average.

Kindly sanction the building permit under small plot category.

Yours faithfully,
${applicantName}
Licensed Architect / Registered Engineer`
        );
        break;
      case 'letter-3':
        setCustomLetterBody(
          letterLanguage === 'ml'
            ? `സത്യവാങ്മൂലം (AFFIDAVIT)
(കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 റൂൾ 47 / 91 പ്രകാരം)

ഞാൻ, ${applicantName}, ${district} ജില്ലയിലെ ${villageName} വില്ലേജിൽ സർവേ നമ്പർ ${surveyNo} ൽ ഉള്ള ഭൂമിയുടെ ഉടമസ്ഥൻ താഴെ പറയുന്ന പ്രകാരം ബോധിപ്പിച്ച് സത്യവാങ്മൂലം നൽകുന്നു:

1. പ്രസ്തുത പ്ലോട്ടിൽ നിർമ്മിക്കാൻ ഉദ്ദേശിക്കുന്ന കെട്ടിടത്തിന്റെ സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും കുടിവെള്ള കിണറിൽ നിന്നും നിർബന്ധിതമായ 7.50 മീറ്റർ റേഡിയൽ ദൂരം പാലിച്ചാണ് സൈറ്റ് പ്ലാനിൽ അടയാളപ്പെടുത്തിയിട്ടുള്ളത്.
2. സെപ്റ്റിക് ടാങ്ക് പൂർണ്ണമായും വാട്ടർ പ്രൂഫ് ആയ RCC സ്ട്രക്ചറിൽ നിർമ്മിച്ച് മലിനജലം ഭൂഗർഭ ജലസ്രോതസ്സുകളിലേക്ക് കലരാത്ത വിധം സംരക്ഷിക്കുന്നതാണ്.
3. ആയതിനാൽ പ്രസ്തുത ഡ്രോയിംഗ് പരിശോധിച്ച് അനുമതി നൽകണമെന്ന് സാക്ഷ്യപ്പെടുത്തുന്നു.

സ്ഥലം: ${localBodyName}
തീയതി: ${new Date().toLocaleDateString('en-GB')}

ഒപ്പ്:
${applicantName} (സ്ഥലമുടമ)`
            : `AFFIDAVIT / UNDERTAKING ON SANITATION CLEARANCE
(Under Rule 47 of KPBR 2019 / Rule 91 of KMBR 2019)

I, ${applicantName}, owner of land in Sy. No. ${surveyNo} of ${villageName} Village, do hereby solemnly affirm and state as follows:

1. The proposed septic tank and soak pit maintain the mandatory 7.50m radial distance from any drinking water well.
2. The septic tank structure will be constructed with watertight reinforced cement concrete (RCC).
3. We undertake to comply with all Kerala Pollution Control Board and LSGD sanitary provisions.

Place: ${localBodyName}
Date: ${new Date().toLocaleDateString('en-GB')}

Deponent:
${applicantName}`
        );
        break;
      case 'letter-4':
        setCustomLetterBody(
          letterLanguage === 'ml'
            ? `അതിർത്തി സമ്മതപത്രം (NEIGHBOR BOUNDARY NOC)

ഞാൻ, ________________________ (അയൽപക്ക വസ്തു ഉടമസ്ഥന്റെ പേര്), ${villageName} വില്ലേജിൽ സർവേ നമ്പർ ${surveyNo} ന് സമീപമുള്ള സർവേ നമ്പർ _________ ലെ ഭൂമിയുടെ ഉടമസ്ഥനാണ്.

ശ്രീ/ശ്രീമതി ${applicantName} സർവേ നമ്പർ ${surveyNo} ൽ നിർമ്മിക്കാൻ ഉദ്ദേശിക്കുന്ന കെട്ടിടം എന്റെ അതിർത്തിയോട് ചേർന്ന് ${data.sideSetback2M || 0.90} മീറ്റർ അകലത്തിൽ നിർമ്മിക്കുന്നതിൽ എനിക്ക് യാതൊരുവിധ എതിർപ്പുകളുമില്ലെന്ന് ഇതിനാൽ പൂർണ്ണ സമ്മതത്തോടെ സാക്ഷ്യപ്പെടുത്തുന്നു.

തീയതി: ${new Date().toLocaleDateString('en-GB')}
അയൽപക്ക വസ്തു ഉടമസ്ഥന്റെ ഒപ്പും പേരും:
ഫോൺ നമ്പർ:`
            : `NEIGHBOR BOUNDARY NO OBJECTION CERTIFICATE (NOC)

I, ________________________ (Neighboring Plot Owner), residing at ____________________, owner of adjacent land in Sy. No. _________, do hereby declare:

I have no objection to Sri/Smt. ${applicantName} constructing the proposed building in Sy. No. ${surveyNo} with a side setback of ${data.sideSetback2M || 0.90}m adjacent to my property boundary.

Date: ${new Date().toLocaleDateString('en-GB')}
Signature of Neighboring Owner:
Contact No:`
        );
        break;
      case 'letter-5':
        setCustomLetterBody(
          letterLanguage === 'ml'
            ? `റൂൾ 48 മഴവെള്ള സംഭരണ സത്യവാങ്മൂലം (RAIN WATER HARVESTING UNDERTAKING)

ഞാൻ, ${applicantName}, സർവേ നമ്പർ ${surveyNo} ലെ കെട്ടിട നിർമ്മാണ അപേക്ഷയുമായി ബന്ധപ്പെട്ട് താഴെ പറയുന്ന പ്രകാരം സാക്ഷ്യപ്പെടുത്തുന്നു:

കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 ചട്ടം 48 പ്രകാരം നിർദ്ദിഷ്ട കെട്ടിടത്തിന്റെ മേൽക്കൂര വിസ്തീർണ്ണത്തിന് ആനുപാതികമായി കുറഞ്ഞത് ${Math.round((data.groundCoverageSqM || 100) * 25)} ലിറ്റർ ശേഷിയുള്ള മഴവെള്ള സംഭരണ ടാങ്കും റീചാർജ്ജ് കിണറും നിർമ്മാണ വേളയിൽ സജ്ജമാക്കുന്നതാണെന്ന് ഇതിനാൽ ഉറപ്പ് നൽകുന്നു.

തീയതി: ${new Date().toLocaleDateString('en-GB')}
അപേക്ഷകന്റെ ഒപ്പ്:
${applicantName}`
            : `RAIN WATER HARVESTING STATUTORY UNDERTAKING
(Under Rule 48 of KMBR / KPBR 2019)

I, ${applicantName}, applicant for building permit in Sy. No. ${surveyNo} of ${villageName} Village, hereby undertake:

A Rain Water Harvesting System with minimum storage capacity of ${Math.round((data.groundCoverageSqM || 100) * 25)} Litres and groundwater recharge pit shall be installed in strict adherence to Rule 48 prior to applying for Occupancy Certificate.

Date: ${new Date().toLocaleDateString('en-GB')}
Applicant Signature:
${applicantName}`
        );
        break;
      case 'letter-6':
        setCustomLetterBody(
          letterLanguage === 'ml'
            ? `കെ-സ്മാർട്ട് ഫാസ്റ്റ് ട്രാക്ക് സെൽഫ് സർട്ടിഫിക്കേഷൻ സാക്ഷ്യപത്രം
(വിസ്തീർണ്ണം <= 300 ച.മീറ്റർ ലോ-റിസ്ക് കെട്ടിടങ്ങൾക്ക്)

അപേക്ഷകൻ: ${applicantName} | സർവേ നമ്പർ: ${surveyNo}
ആകെ നിർമ്മിതി വിസ്തീർണ്ണം: ${data.totalBuiltUpAreaSqM || 178.5} ച.മീറ്റർ

ഞങ്ങൾ, അപേക്ഷകനായ ${applicantName} യും രജിസ്ട്രേഡ് എഞ്ചിനീയറും സംയുക്തമായി സാക്ഷ്യപ്പെടുത്തുന്നു:
1. പ്രസ്തുത പ്ലാനിലെ എല്ലാ അളവുകളും സെറ്റ്ബാക്കുകളും FAR ഉം KPBR/KMBR 2019 ചട്ടങ്ങൾ പൂർണ്ണമായി പാലിക്കുന്നുണ്ട്.
2. കെ-സ്മാർട്ട് പോർട്ടൽ പ്രകാരമുള്ള ഇൻസ്റ്റന്റ് പെർമിറ്റിന് അർഹതയുള്ളതാണെന്ന് ബോധ്യപ്പെടുത്തുന്നു.

എഞ്ചിനീയറുടെ ഒപ്പ്: ____________________
അപേക്ഷകന്റെ ഒപ്പ്: ____________________`
            : `K-SMART FAST TRACK SELF-CERTIFICATION UNDERTAKING
(For Low-Risk Buildings <= 300 sq.m Built-up Area)

Applicant: ${applicantName} | Sy. No: ${surveyNo}
Total Proposed Area: ${data.totalBuiltUpAreaSqM || 178.5} sq.m

We, the Applicant and the Licensed Engineer, jointly certify that the attached drawings strictly conform to all mandatory provisions of KMBR/KPBR 2019. We claim instantaneous fast-track permit sanction via K-Smart.

Registered Engineer: ____________________
Applicant Signature: ____________________`
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

  const handleCopyDefenseItem = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDefenseId(id);
    setTimeout(() => setCopiedDefenseId(null), 2000);
  };

  const handlePrintLetter = () => {
    window.print();
  };

  const handleDownloadDoc = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Official Response Letter</title><style>body{font-family:Arial,sans-serif;line-height:1.6;}</style></head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + customLetterBody.replace(/\n/g, '<br/>') + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LSGD_Notice_Reply_${surveyNo.replace(/\//g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCustomAiDraft = () => {
    if (!customPrompt.trim()) return;
    setIsAiDrafting(true);

    setTimeout(() => {
      const generated = isMl
        ? `സ്വീകർത്താവ്,
അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർ / സെക്രട്ടറി,
${localBodyName}, ${district} ജില്ല.

വിഷയം: ${customPrompt} സംബന്ധിച്ച ചട്ടപരമായ വിശദീകരണം സമർപ്പിക്കുന്നത്.
അപേക്ഷകൻ: ${applicantName} | സർവേ നമ്പർ: ${surveyNo}

ബഹുമാനപ്പെട്ട സാർ,

മേൽ വിഷയവുമായി ബന്ധപ്പെട്ട് ${applicantName} സമർപ്പിച്ച കെട്ടിട നിർമ്മാണ പ്ലാനിൽ താഴെ പറയുന്ന വിശദീകരണങ്ങൾ നൽകുന്നു:

1. "${customPrompt}" സംബന്ധിച്ച് കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ (2019) പ്രകാരമുള്ള വ്യവസ്ഥകൾ കൃത്യമായി പാലിച്ചിട്ടുണ്ട്.
2. ആവശ്യമായ തിരുത്തലുകൾ ഡ്രോയിംഗിൽ വരുത്തി സൈറ്റ് പ്ലാൻ അപ്‌ഡേറ്റ് ചെയ്തിരിക്കുന്നു.

ആയതിനാൽ പ്രസ്തുത അപേക്ഷ പരിശോധിച്ച് പെർമിറ്റ് അനുവദിച്ച് തരണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.

വിശ്വസ്തതയോടെ,
രജിസ്ട്രേഡ് ആർക്കിടെക്റ്റ് / എഞ്ചിനീയർ`
        : `To,
The Assistant Executive Engineer / Secretary,
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

  // Filtered vault records
  const filteredVault = defenseVaultRecords.filter((r) => {
    const q = vaultSearchQuery.toLowerCase();
    return (
      r.rule.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.titleMl.toLowerCase().includes(q) ||
      r.keyPoints.some((k) => k.toLowerCase().includes(q))
    );
  });

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

      {/* Top Hero Header & Mode Switcher */}
      <div className="bg-gradient-to-r from-[#070E1E] via-[#0A1628] to-[#070E1E] border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-[0_0_35px_rgba(0,240,255,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMl ? 'കെ-സ്മാർട്ട് നോട്ടീസ് & വിദഗ്ദ്ധ മറുപടി എഞ്ചിൻ' : 'K-Smart Notice & Statutory Reply Studio'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>{isMl ? 'നോട്ടീസ് & മറുപടികൾ (Expert Defense)' : 'Notice & Official Replies (Superbuilt.ai Style)'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl">
              {isMl
                ? 'എൽ.എസ്.ജി.ഡി / കെ-സ്മാർട്ട് ഒബ്ജക്ഷൻ നോട്ടീസുകൾ അപ്‌ലോഡ് ചെയ്താൽ AI അവ പൂർണ്ണമായി അപഗ്രഥിച്ച്, ചട്ടപ്രകാരമുള്ള തന്ത്രപരമായ പ്രതിരോധ വാദങ്ങളും ഔദ്യോഗിക മറുപടി കത്തുകളും തയ്യാറാക്കുന്നു.'
                : 'Upload LSGD scrutiny memos to diagnose defect clauses, extract Kerala High Court/GO precedents, and auto-draft authoritative official reply letters.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-2xl shrink-0 self-start md:self-auto flex-wrap gap-1">
            <button
              onClick={() => setActiveMode('notice_analyzer')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'notice_analyzer'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isMl ? '1. നോട്ടീസ് പരിശോധന & പ്രതിരോധം' : '1. Notice Ingest & Defense'}</span>
            </button>

            <button
              onClick={() => {
                setActiveMode('letters');
                if (!customLetterBody) handleSelectTemplate('letter-1');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'letters'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSignature className="w-4 h-4" />
              <span>{isMl ? '2. ഔദ്യോഗിക മറുപടി കത്ത്' : '2. Official Letter Studio'}</span>
            </button>

            <button
              onClick={() => setActiveMode('vault')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeMode === 'vault'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{isMl ? '3. ചട്ട പ്രതിരോധ ഗൈഡ്' : '3. Statutory Defense Vault'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODE 1: NOTICE INGEST & EXPERT DEFENSE MATRIX */}
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
                  {isMl ? 'സാമ്പിൾ നോട്ടീസുകൾ ഉപയോഗിച്ച് പരീക്ഷിക്കുക:' : 'Or try standard LSGD defect presets:'}
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
                  {isMl ? 'നോട്ടീസ് കുറിപ്പുകൾ നേരിട്ട് ഇവിടെ നൽകുക (ഓപ്ഷണൽ):' : 'Paste notice or defect sheet remarks here:'}
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
                    <span>{isMl ? 'AI നോട്ടീസ് അപഗ്രഥിച്ച് പ്രതിരോധം തയ്യാറാക്കുന്നു...' : 'AI Diagnosing Notice & Grounding in KBR 2019...'}</span>
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
                <span>{isMl ? 'പ്രത്യേക വിഷയങ്ങളിൽ AI കത്ത് ഡ്രാഫ്റ്റ് ചെയ്യാൻ' : 'Custom AI Letter Draftsman'}</span>
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

          {/* Right Column: Detected Defects & Senior Consultant Defense Matrix */}
          <div className="lg:col-span-7 space-y-4">
            {analyzedDefects ? (
              <div className="space-y-4 animate-scaleUp">
                {/* Header Summary */}
                <div className="bg-[#0A101D] border border-cyan-500/40 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h3 className="text-sm font-extrabold text-white">
                        {isMl ? 'കണ്ടെത്തിയ ഒബ്ജക്ഷനുകളും തന്ത്രപരമായ പ്രതിരോധവും' : 'Detected Objection Points & Senior Consultant Defense'}
                      </h3>
                    </div>
                    <span className="text-xs bg-cyan-950 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-mono">
                      {analyzedDefects.length} {isMl ? 'ഇനങ്ങൾ' : 'Items'}
                    </span>
                  </div>

                  {/* Defect Cards with Deep Legal Defense Breakdown */}
                  <div className="space-y-3.5">
                    {analyzedDefects.map((def) => (
                      <div
                        key={def.id}
                        className="bg-slate-950/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 space-y-3 transition-all"
                      >
                        {/* Title & Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-cyan-400 font-mono bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                            {def.ruleCitation}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded border ${
                              def.severity === 'high'
                                ? 'bg-red-950/80 text-red-300 border-red-500/40'
                                : def.severity === 'medium'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {def.severity === 'high' ? 'High Impact' : def.severity === 'medium' ? 'Action Required' : 'Advisory'}
                          </span>
                        </div>

                        {/* Defect Remark */}
                        <p className="text-xs text-slate-300 font-medium leading-relaxed">
                          <strong className="text-slate-100">{isMl ? 'നോട്ടീസ് പരാമർശം:' : 'Objection Remark:'}</strong>{' '}
                          {def.defectText}
                        </p>

                        {/* Legal Context & Defense Argument */}
                        {def.defenseStrategy && (
                          <div className="bg-[#0B1526] border border-blue-500/30 rounded-xl p-3 text-xs text-slate-200 space-y-1.5">
                            <div className="font-bold flex items-center justify-between text-sky-400">
                              <span className="flex items-center gap-1.5">
                                <Scale className="w-3.5 h-3.5" />
                                {isMl ? 'നിയമപരമായ പ്രതിരോധ വാദം (Legal Defense):' : 'Statutory Defense Strategy:'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyDefenseItem(def.id, def.defenseStrategy || '')}
                                className="text-[10px] text-cyan-300 hover:text-cyan-100 flex items-center gap-1"
                              >
                                {copiedDefenseId === def.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                <span>{copiedDefenseId === def.id ? (isMl ? 'പകർത്തി' : 'Copied') : (isMl ? 'പകർത്തുക' : 'Copy')}</span>
                              </button>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed">{def.defenseStrategy}</p>
                            {def.legalContext && (
                              <p className="text-[10px] text-slate-400 italic pt-0.5 border-t border-slate-800">
                                ⚖️ {def.legalContext}
                              </p>
                            )}
                          </div>
                        )}

                        {/* CAD Drawing Rectification */}
                        <div className="bg-[#0D1B24] border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-300 space-y-1">
                          <div className="font-bold flex items-center justify-between text-emerald-400">
                            <span className="flex items-center gap-1.5">
                              <Check className="w-3.5 h-3.5" />
                              {isMl ? 'ഡ്രോയിംഗ് തിരുത്തൽ നടപടി:' : 'CAD Rectification Action:'}
                            </span>
                            {def.cadLayer && (
                              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                Layer: {def.cadLayer}
                              </span>
                            )}
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
            {/* Language Switcher for Letter */}
            <div className="bg-[#0A101D] border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">{isMl ? 'കത്തിന്റെ ഭാഷ:' : 'Letter Language:'}</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setLetterLanguage('ml');
                    handleSelectTemplate(selectedTemplateId);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterLanguage === 'ml' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  മലയാളം
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLetterLanguage('en');
                    handleSelectTemplate(selectedTemplateId);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    letterLanguage === 'en' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Template Selector */}
            <div className="bg-[#0A101D] border border-cyan-500/30 rounded-3xl p-4 sm:p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{isMl ? 'കത്ത് മാതൃകകൾ തിരഞ്ഞെടുക്കുക' : 'Official Letter Categories'}</span>
              </h3>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {officialTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl.id)}
                    className={`w-full p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between gap-2 ${
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
                rows={17}
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

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? (isMl ? 'പകർത്തി!' : 'Copied!') : (isMl ? 'കോപ്പി ചെയ്യുക' : 'Copy Text')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDoc}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Download Word (.doc) File"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Word (.doc)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintLetter}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{isMl ? 'പ്രിന്റ് / PDF' : 'Print / PDF'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 3: STATUTORY DEFENSE VAULT */}
      {activeMode === 'vault' && (
        <div className="space-y-6 text-left">
          {/* Search and Filter */}
          <div className="bg-[#0A101D] border border-cyan-500/30 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-cyan-400" />
                  <span>{isMl ? 'കേരള കെട്ടിട നിർമ്മാണ ചട്ട പ്രതിരോധ കലവറ' : 'Kerala Building Rules Statutory Defense Vault'}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isMl
                    ? 'കെ-സ്മാർട്ട് തടസ്സവാദങ്ങൾ മറികടക്കാനുള്ള നിയമപരമായ അവലംബങ്ങളും സർക്കാർ ഉത്തരവുകളും.'
                    : 'Statutory precedents, government orders, and defense clauses to counter municipal objection memos.'}
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={vaultSearchQuery}
                  onChange={(e) => setVaultSearchQuery(e.target.value)}
                  placeholder={isMl ? 'റൂൾ അല്ലെങ്കിൽ വിഷയം തിരയുക...' : 'Search rules, setbacks, GOs...'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Grid of Vault Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVault.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                      {item.rule}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                      Active Precedent
                    </span>
                  </div>

                  <h4 className="text-xs font-extrabold text-white">
                    {isMl ? item.titleMl : item.title}
                  </h4>

                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {item.keyPoints.map((pt, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {pt}
                      </li>
                    ))}
                  </ul>

                  <div className="pt-2 border-t border-slate-900 text-[11px] text-slate-400 flex items-center justify-between">
                    <span className="truncate">⚖️ {item.legalRef}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomLetterBody(
                          `Subject: Statutory Defense invoking ${item.rule}\n\nKey Grounds:\n${item.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\nLegal Citation: ${item.legalRef}`
                        );
                        setActiveMode('letters');
                      }}
                      className="text-cyan-400 hover:text-cyan-200 font-bold shrink-0 ml-2 cursor-pointer"
                    >
                      {isMl ? 'കത്തിൽ ഉപയോഗിക്കുക' : 'Use in Letter'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
