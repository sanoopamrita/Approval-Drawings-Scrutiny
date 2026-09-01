import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileX,
  Layers,
  Eye,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  ArrowLeft,
  Tag,
  Maximize2,
  X,
  Camera,
  Sparkles,
  Bot,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  EyeOff,
  HardDrive,
  RotateCcw,
  Sliders,
  Filter,
  CheckSquare,
  Droplets,
  Sun,
  Flame,
  Recycle,
  Building2,
  FileSpreadsheet,
} from 'lucide-react';
import Markdown from 'react-markdown';
import {
  AreaStatementData,
  DrawingCategory,
  JurisdictionType,
  Language,
  OccupancyGroup,
  ServiceSubType,
  UploadedDrawing,
} from '../types';
import { analyzeDrawingWithGemini } from '../services/geminiService';
import {
  MultiDrawingScrutinyResult,
  parseExtractedDrawingMetrics,
  scrutinizeAllDrawingsWithExpertAi,
} from '../services/drawingScrutinyService';
import { validateDrawingFile } from '../utils/sanitize';

interface DrawingUploaderProps {
  drawings: UploadedDrawing[];
  onAddDrawing: (drawing: UploadedDrawing) => void;
  onRemoveDrawing: (id: string) => void;
  onUpdateDrawing: (id: string, partial: Partial<UploadedDrawing>) => void;
  onPurgeDrawings?: () => void;
  onApplyExtractedData?: (partial: Record<string, any>) => void;
  onDirectScrutiny?: (synthesizedData?: Partial<AreaStatementData>) => void;
  currentFormData?: AreaStatementData;
  jurisdiction?: JurisdictionType;
  occupancy?: OccupancyGroup;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
}

export const DRAWING_TYPES_CONFIG: {
  category: DrawingCategory;
  serviceSubType?: ServiceSubType;
  titleEn: string;
  titleMl: string;
  ruleRef: string;
  defaultScale: string;
  descEn: string;
  descMl: string;
  isMandatory: boolean;
  isServiceSubPlan?: boolean;
}[] = [
  {
    category: 'location_plan',
    titleEn: '1. Location Plan (Key Map)',
    titleMl: '1. ലൊക്കേഷൻ പ്ലാൻ (കീ മാപ്പ്)',
    ruleRef: 'Rule 6(2)(a)',
    defaultScale: '1:2000',
    descEn: 'Survey boundary, landmarks, ward boundary, north arrow, surrounding roads',
    descMl: 'സർവേ അതിർത്തി, റോഡുകൾ, പ്രധാന ലാൻഡ്‌മാർക്കുകൾ, നോർത്ത് മാർക്ക്',
    isMandatory: true,
  },
  {
    category: 'site_plan',
    titleEn: '2. Site Plan (Plot & Setbacks)',
    titleMl: '2. സൈറ്റ് പ്ലാൻ (സെറ്റ്ബാക്കുകൾ & കിണർ)',
    ruleRef: 'Rule 6(2)(b)',
    defaultScale: '1:200',
    descEn: 'Frontage road width, front/rear/side setbacks, open well, septic tank distance',
    descMl: 'വഴിവീതി, മുൻ-പിൻ-വശങ്ങളിലെ സെറ്റ്ബാക്കുകൾ, കിണർ, സെപ്റ്റിക് ടാങ്ക്',
    isMandatory: true,
  },
  {
    category: 'floor_plans',
    titleEn: '3. Floor Plans (All Levels)',
    titleMl: '3. ഫ്ലോർ പ്ലാനുകൾ (എല്ലാ നിലകളും)',
    ruleRef: 'Rule 6(2)(c)',
    defaultScale: '1:100',
    descEn: 'Ground, first and upper floor plans with clear room dimensions & names',
    descMl: 'ഗ്രൗണ്ട്, ഒന്നാം നില എന്നിവയുടെ മുറികളുടെ അളവുകളും പേരുകളും',
    isMandatory: true,
  },
  {
    category: 'elevation_plans',
    titleEn: '4. Building Elevation Plans',
    titleMl: '4. ഇലവേഷൻ പ്ലാനുകൾ',
    ruleRef: 'Rule 6(2)(d)',
    defaultScale: '1:100',
    descEn: 'Front, rear & side views showing total building height & level markers',
    descMl: 'കെട്ടിടത്തിന്റെ ആകെ ഉയരവും ലെവലുകളും കാണിക്കുന്ന മുൻ-പിൻ കാഴ്ചകൾ',
    isMandatory: true,
  },
  {
    category: 'section_plans',
    titleEn: '5. Sectional Elevations',
    titleMl: '5. സെക്ഷൻ പ്ലാനുകൾ (ക്രോസ്സ് സെക്ഷൻ)',
    ruleRef: 'Rule 6(2)(e)',
    defaultScale: '1:100',
    descEn: 'Cross-section through staircase (riser, tread, headroom) & toilet plumbing',
    descMl: 'സ്റ്റെയർകേസ് (റൈസർ, ട്രെഡ്ഡ്, ഹെഡ്റൂം), ടോയ്‌ലറ്റ് എന്നിവയിലൂടെയുള്ള സെക്ഷൻ',
    isMandatory: true,
  },
  {
    category: 'service_plans',
    serviceSubType: 'general_service',
    titleEn: '6. Service & Sanitation Plan (Combined/General)',
    titleMl: '6. സർവീസ് & സാനിറ്റേഷൻ പ്ലാൻ (ഒരുമിച്ചുള്ളത്)',
    ruleRef: 'Rule 6(2)(f)',
    defaultScale: '1:100',
    descEn: 'Septic tank, soak pit, open well, solid waste, biogas, solar & RWH details',
    descMl: 'സെപ്റ്റിക് ടാങ്ക്, സോക്ക് പിറ്റ്, കിണർ, മാലിന്യ സംസ്കരണം, ബയോഗ്യാസ്, സോളാർ വിശദാംശങ്ങൾ',
    isMandatory: true,
  },
  // Dedicated Service Sub-Plans (Allowed separately or within Service Plan)
  {
    category: 'service_well_plan',
    serviceSubType: 'open_well',
    titleEn: '6A. Open Drinking Well Details (Rule 47)',
    titleMl: '6A. കുടിവെള്ള കിണർ പ്ലാൻ (ചട്ടം 47)',
    ruleRef: 'Rule 47',
    defaultScale: '1:100',
    descEn: 'Open well location, sanitary apron, protection ring & 7.50m clearance from septic tank',
    descMl: 'തുറന്ന കിണർ, ആൾമറ, പ്രൊട്ടക്ഷൻ റിംഗ്, സെപ്റ്റിക് ടാങ്കിലേക്കുള്ള 7.50m അകലം',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_septic_plan',
    serviceSubType: 'septic_tank',
    titleEn: '6B. Septic Tank & Soak Pit Details (Rule 47)',
    titleMl: '6B. സെപ്റ്റിക് ടാങ്ക് & സോക്ക്പിറ്റ് വിശദാംശങ്ങൾ (ചട്ടം 47)',
    ruleRef: 'Rule 47(2)',
    defaultScale: '1:50',
    descEn: 'Capacity, filter bed, inlet/outlet levels, 1.20m boundary buffer and soak pit layout',
    descMl: 'സെപ്റ്റിക് ടാങ്ക് കപ്പാസിറ്റി, സോക്ക്പിറ്റ്, അതിർത്തിയിൽ നിന്നുള്ള 1.20m അകലം',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_solar_plan',
    serviceSubType: 'solar_panel',
    titleEn: '6C. Rooftop Solar PV Array Layout (Rule 49)',
    titleMl: '6C. സോളാർ റൂഫ്‌ടോപ്പ് പാനൽ ലേഔട്ട് (ചട്ടം 49)',
    ruleRef: 'Rule 49',
    defaultScale: '1:100',
    descEn: 'Solar panels placement on terrace, kWp capacity, inverter room, shadow-free area',
    descMl: 'ടെറസിലെ സോളാർ പാനലുകൾ, kWp ശേഷി, ഇൻവെർട്ടർ റൂം, ഷാഡോ-ഫ്രീ ഏരിയ',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_solidwaste_plan',
    serviceSubType: 'solid_waste',
    titleEn: '6D. Solid Waste Management Unit (Rule 46)',
    titleMl: '6D. ഖരമാലിന്യ സംസ്കരണ യൂണിറ്റ് (ചട്ടം 46)',
    ruleRef: 'Rule 46 / 50',
    defaultScale: '1:50',
    descEn: 'Segregated waste collection, aerobic composting bins, non-biodegradable storage',
    descMl: 'മാലിന്യ വേർതിരിക്കൽ, എയറോബിക് കമ്പോസ്റ്റിംഗ് ബിന്നുകൾ, അജൈവ മാലിന്യ സംഭരണം',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_biogas_plan',
    serviceSubType: 'biogas_plant',
    titleEn: '6E. Biogas Plant / Bio-digest Unit (Rule 46)',
    titleMl: '6E. ബയോഗ്യാസ് പ്ലാന്റ് / ബയോ ഡൈജസ്റ്റർ (ചട്ടം 46)',
    ruleRef: 'Rule 46',
    defaultScale: '1:50',
    descEn: 'Bio-methanation plant footprint, gas pipeline routing, safety valve, manure outlet',
    descMl: 'ബയോഗ്യാസ് പ്ലാന്റ്, ഗ്യാസ് പൈപ്പ്‌ലൈൻ, സുരക്ഷാ വാൽവ്, സ്ലറി ഔട്ട്‌ലെറ്റ്',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_rwh_plan',
    serviceSubType: 'rainwater_harvesting',
    titleEn: '6F. Rainwater Harvesting & Recharge Pit (Rule 48)',
    titleMl: '6F. മഴവെള്ള സംഭരണിയും റീചാർജ് പിറ്റും (ചട്ടം 48)',
    ruleRef: 'Rule 48',
    defaultScale: '1:100',
    descEn: 'Storage tank (25L/sq.m plinth), first-flush diverter, sand-gravel-charcoal filter',
    descMl: 'സംഭരണി (25L/ച.മീ. പ്ലിന്ത്), ഫസ്റ്റ് ഫ്ലഷ് ഡൈവേർട്ടർ, ഫിൽട്ടർ ബെഡ്, റീചാർജ് പിറ്റ്',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'service_fire_plan',
    serviceSubType: 'fire_safety',
    titleEn: '6G. Fire Fighting & Emergency Evacuation (NBC Part 4)',
    titleMl: '6G. ഫയർ ഫൈറ്റിംഗ് & ഇവാക്വേഷൻ പ്ലാൻ (NBC Part 4)',
    ruleRef: 'NBC Part IV',
    defaultScale: '1:100',
    descEn: 'Fire tender accessway, wet riser, external escape stair, hose reel, fire extinguishers',
    descMl: 'ഫയർ എഞ്ചിൻ പാത, വെറ്റ് റൈസർ, എക്സ്റ്റേണൽ സ്റ്റെയർകേസ്, ഹോസ് റീൽ പോയിന്റുകൾ',
    isMandatory: false,
    isServiceSubPlan: true,
  },
  {
    category: 'parking_plans',
    titleEn: '7. Parking Layout & Traffic Plan',
    titleMl: '7. പാർക്കിംഗ് ലേഔട്ട് & ഡ്രൈവ്‌വേ പ്ലാൻ',
    ruleRef: 'Rule 31',
    defaultScale: '1:200',
    descEn: 'Car slots (2.5x5.0m), two-wheelers, disabled parking, driveway circulation',
    descMl: 'കാർ പാർക്കിംഗ് (2.5x5.0m), ഇരുചക്ര വാഹനങ്ങൾ, ഭിന്നശേഷി പാർക്കിംഗ്, ഡ്രൈവ്‌വേ',
    isMandatory: false,
  },
  {
    category: 'rwh_solar_plans',
    titleEn: '8. Rainwater Harvesting & Solar Plan',
    titleMl: '8. മഴവെള്ള സംഭരണി & സോളാർ ലേഔട്ട്',
    ruleRef: 'Rule 48 & 49',
    defaultScale: '1:100',
    descEn: 'RWH tank capacity, rooftop catchment area, solar PV schematic array',
    descMl: 'മഴവെള്ള സംഭരണി അളവ്, ഫിൽട്ടർ ബെഡ്, റൂഫ്‌ടോപ്പ് സോളാർ പാനൽ അറേ',
    isMandatory: true,
  },
];

export const DrawingUploader: React.FC<DrawingUploaderProps> = ({
  drawings,
  onAddDrawing,
  onRemoveDrawing,
  onUpdateDrawing,
  onPurgeDrawings,
  onApplyExtractedData,
  onDirectScrutiny,
  currentFormData,
  jurisdiction = 'KPBR',
  occupancy = 'A1',
  language,
  onNext,
  onPrev,
}) => {
  const isMl = language === 'ml';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<DrawingCategory>('site_plan');
  const [selectedServiceSubType, setSelectedServiceSubType] = useState<ServiceSubType>('general_service');
  const [categoryFilterTab, setCategoryFilterTab] = useState<'all' | 'mandatory' | 'services'>('all');
  const [dragActive, setDragActive] = useState(false);
  const [previewDrawing, setPreviewDrawing] = useState<UploadedDrawing | null>(null);

  // AI Visual Inspection State (Single Drawing)
  const [analyzingDrawingId, setAnalyzingDrawingId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    drawing: UploadedDrawing;
    text: string;
  } | null>(null);

  // Master Multi-Drawing Scrutiny State (Evaluates all drawings together)
  const [isMasterScrutinizing, setIsMasterScrutinizing] = useState(false);
  const [masterScrutinyResult, setMasterScrutinyResult] = useState<MultiDrawingScrutinyResult | null>(null);
  const [copiedMasterAnalysis, setCopiedMasterAnalysis] = useState(false);
  const [copiedAnalysis, setCopiedAnalysis] = useState(false);
  const [appliedDataToast, setAppliedDataToast] = useState(false);

  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileValidationError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validation = validateDrawingFile(file);
      if (!validation.isValid) {
        setFileValidationError(isMl ? validation.errorMl || 'അസാധുവായ ഫയൽ' : validation.errorEn || 'Invalid file');
        setTimeout(() => setFileValidationError(null), 4000);
        continue;
      }

      const config = DRAWING_TYPES_CONFIG.find((c) => c.category === selectedCategory);

      // Create synthetic in-memory preview url for verified drawings
      const newDrawing: UploadedDrawing = {
        id: `dwg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category: selectedCategory,
        serviceSubType: selectedCategory === 'service_plans' ? selectedServiceSubType : config?.serviceSubType,
        name: file.name,
        size: file.size,
        status: 'verified',
        scale: config?.defaultScale || '1:100',
        sheetsCount: 1,
        extractedLabels: [
          config?.titleEn || selectedCategory,
          selectedServiceSubType !== 'general_service' ? `Sub: ${selectedServiceSubType}` : '',
          'Scale ' + (config?.defaultScale || '1:100'),
        ].filter(Boolean),
        uploadedAt: Date.now(),
      };

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newDrawing.dataUrl = e.target?.result as string;
          onAddDrawing(newDrawing);
        };
        reader.readAsDataURL(file);
      } else {
        onAddDrawing(newDrawing);
      }
    }
  };

  const handleRunAiInspection = async (drawing: UploadedDrawing) => {
    if (!drawing.dataUrl) {
      alert(
        isMl
          ? 'AI വിഷ്വൽ പരിശോധനയ്ക്ക് പ്ലാനിന്റെ ഇമേജ് (JPG/PNG) ആവശ്യമാണ്.'
          : 'Image format (JPG/PNG) required for AI vision scrutiny.'
      );
      return;
    }

    setAnalyzingDrawingId(drawing.id);
    try {
      const result = await analyzeDrawingWithGemini(
        drawing.dataUrl,
        drawing.category,
        drawing.name,
        jurisdiction,
        occupancy,
        currentFormData,
        language
      );
      setAnalysisResult({
        drawing,
        text: result,
      });
    } catch (err: any) {
      alert(
        (isMl ? 'പരിശോധന പരാജയപ്പെട്ടു: ' : 'Scrutiny failed: ') +
          (err?.message || 'Server error')
      );
    } finally {
      setAnalyzingDrawingId(null);
    }
  };

  /**
   * Master Multi-Drawing Deep Scrutiny
   * Evaluates all submitted drawings with genuine engineering discretion.
   */
  const handleRunMasterScrutiny = async () => {
    if (drawings.length === 0) {
      alert(
        isMl
          ? 'ദയവായി കുറഞ്ഞത് ഒരു ഡ്രോയിംഗെങ്കിലും അപ്‌ലോഡ് ചെയ്യുക.'
          : 'Please upload at least one drawing sheet before running master scrutiny.'
      );
      return;
    }

    setIsMasterScrutinizing(true);
    try {
      const fallbackData = currentFormData || ({} as any);
      const result = await scrutinizeAllDrawingsWithExpertAi(
        drawings,
        jurisdiction,
        occupancy,
        fallbackData,
        language
      );
      setMasterScrutinyResult(result);
    } catch (err: any) {
      alert((isMl ? 'സമഗ്ര പരിശോധനയിൽ തടസ്സം: ' : 'Master scrutiny error: ') + (err?.message || 'Server busy'));
    } finally {
      setIsMasterScrutinizing(false);
    }
  };

  const handleApplyMasterResultToProject = () => {
    if (!masterScrutinyResult) return;
    if (onApplyExtractedData) {
      onApplyExtractedData(masterScrutinyResult.synthesizedData);
    }
    setAppliedDataToast(true);
    setTimeout(() => {
      setAppliedDataToast(false);
      setMasterScrutinyResult(null);
      if (onDirectScrutiny) {
        onDirectScrutiny(masterScrutinyResult.synthesizedData);
      }
    }, 800);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Filter configuration categories
  const filteredConfigs = DRAWING_TYPES_CONFIG.filter((cfg) => {
    if (categoryFilterTab === 'mandatory') return cfg.isMandatory;
    if (categoryFilterTab === 'services') return cfg.category.startsWith('service_') || cfg.category === 'rwh_solar_plans';
    return true;
  });

  const totalMandatory = DRAWING_TYPES_CONFIG.filter((c) => c.isMandatory).length;
  const uploadedMandatory = DRAWING_TYPES_CONFIG.filter(
    (c) => c.isMandatory && drawings.some((d) => d.category === c.category || (c.category === 'service_plans' && d.category.startsWith('service_')))
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Step 2 of 5
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isMl ? 'ചട്ടം 6 & 46-50 പ്രകാരമുള്ള ഡ്രോയിംഗ് പരിശോധന' : 'Engineering Drawing Verification (Rule 6 & Allied)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {isMl ? 'കെട്ടിട & സർവീസ് പ്ലാനുകൾ അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Architectural, Service & Sanitation Plans'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isMl
                ? 'സൈറ്റ് പ്ലാൻ, ഫ്ലോർ പ്ലാനുകൾ, സെക്ഷൻ, സർവീസ് പ്ലാനുകൾ (കിണർ, സോളാർ, സെപ്റ്റിക് ടാങ്ക്, ഖരമാലിന്യം, ബയോഗ്യാസ്) എന്നിവ ഒരുമിച്ചോ പ്രത്യേകമായോ അപ്‌ലോഡ് ചെയ്യാം.'
                : 'Upload Site Plan, Floor Plans, Section, and Service Plans (Well, Solar PV, Septic Tank, Solid Waste, Biogas, RWH, Fire Safety) separately or combined.'}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs">
            <div className="text-right">
              <div className="text-slate-500 font-medium">
                {isMl ? 'നിർബന്ധിത പ്ലാനുകൾ:' : 'Mandatory Plans:'}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {uploadedMandatory} / {totalMandatory} {isMl ? 'ചേർത്തു' : 'Uploaded'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-emerald-500 flex items-center justify-center font-bold text-emerald-700 bg-emerald-50">
              {Math.min(100, Math.round((uploadedMandatory / totalMandatory) * 100))}%
            </div>
          </div>
        </div>

        {/* Master AI Scrutiny Callout Bar (Runs inspection even with zero area statement input) */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 rounded-xl p-4 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="font-bold text-sm text-emerald-200 flex items-center gap-2">
                <span>{isMl ? 'വിദഗ്ദ്ധ സമഗ്ര പ്ലാൻ പരിശോധന (Master Drawing Scrutiny)' : 'Expert Human-Discretion Blueprint Scrutiny'}</span>
                <span className="text-[9px] bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.5 rounded font-mono">
                  Auto-Extract & Scrutinize
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isMl
                  ? 'ഏരിയ സ്റ്റേറ്റ്മെന്റിൽ ഒന്നും നൽകാതെ തന്നെ, അപ്‌ലോഡ് ചെയ്ത പ്ലാനുകൾ വിവേചനബുദ്ധിയോടെ പരിശോധിച്ച് അളവുകൾ സ്വയം ശേഖരിക്കാനും K-Smart സ്ക്രൂട്ടിനി റിപ്പോർട്ട് തയ്യാറാക്കാനും കഴിയും.'
                  : 'Scrutinizes all uploaded blueprint sheets with human-expert discretion, extracts exact dimensions, and generates full statutory scrutiny even with zero Area Statement manual entries.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            id="run-master-drawing-scrutiny-btn"
            onClick={handleRunMasterScrutiny}
            disabled={isMasterScrutinizing || drawings.length === 0}
            className="w-full md:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs shrink-0 cursor-pointer disabled:opacity-50"
          >
            {isMasterScrutinizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                <span>{isMl ? 'എല്ലാ പ്ലാനുകളും പരിശോധിക്കുന്നു...' : 'Scrutinizing All Sheets...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isMl ? 'പ്ലാനുകൾ മാത്രം വച്ച് സമഗ്ര പരിശോധന നടത്തുക' : 'Run Master Scrutiny on Drawings'}</span>
              </>
            )}
          </button>
        </div>

        {/* Zero-Storage Privacy & Memory Purge Bar */}
        <div className="bg-slate-900 border border-emerald-900/60 rounded-xl p-3 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300">
              <EyeOff className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>{isMl ? 'സീറോ-സ്റ്റോറേജ് പ്രൈവസി സിസ്റ്റം' : 'Zero-Cloud-Storage Stateless Architecture'}</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-mono">
                  100% In-Memory
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {isMl
                  ? 'ഡ്രോയിംഗുകൾ ബ്രൗസർ മെമ്മറിയിൽ മാത്രം പരിശോധിക്കുന്നു. സെർവറിലോ ക്ലൗഡ് സ്റ്റോറേജിലോ ഫയലുകൾ സൂക്ഷിക്കപ്പെടുന്നില്ല.'
                  : 'Drawings are processed strictly in temporary client memory and discarded after report generation.'}
              </p>
            </div>
          </div>

          {drawings.length > 0 && onPurgeDrawings && (
            <button
              type="button"
              id="purge-drawings-btn"
              onClick={onPurgeDrawings}
              className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 px-3 py-1.5 rounded-lg transition-colors font-semibold shrink-0 cursor-pointer text-xs"
              title="Immediately wipe uploaded drawing representations from memory"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isMl ? 'ഡ്രോയിംഗ് മെമ്മറി മായ്‌ക്കുക' : 'Purge Drawing Memory'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setCategoryFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilterTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMl ? 'എല്ലാ പ്ലാനുകളും' : 'All Plan Types'} ({DRAWING_TYPES_CONFIG.length})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilterTab('mandatory')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            categoryFilterTab === 'mandatory'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {isMl ? 'നിർബന്ധിതമായവ (Mandatory)' : 'Mandatory Only'} ({totalMandatory})
        </button>
        <button
          type="button"
          onClick={() => setCategoryFilterTab('services')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
            categoryFilterTab === 'services'
              ? 'bg-emerald-700 text-white'
              : 'text-slate-600 hover:bg-emerald-50 text-emerald-800'
          }`}
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>{isMl ? 'സാനിറ്റേഷൻ & സർവീസ് പ്ലാനുകൾ' : 'Sanitation & Service Plans'}</span>
        </button>
      </div>

      {/* Main Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Selector */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {isMl ? 'ഡ്രോയിംഗ് കാറ്റഗറി തെരഞ്ഞെടുക്കുക:' : 'Select Plan Type to Upload:'}
          </label>

          <div className="space-y-2">
            {filteredConfigs.map((cfg) => {
              const uploadedCount = drawings.filter(
                (d) => d.category === cfg.category || (cfg.serviceSubType && d.serviceSubType === cfg.serviceSubType)
              ).length;
              const isSelected = selectedCategory === cfg.category;

              return (
                <button
                  key={cfg.category}
                  type="button"
                  id={`cat-select-${cfg.category}`}
                  onClick={() => {
                    setSelectedCategory(cfg.category);
                    if (cfg.serviceSubType) {
                      setSelectedServiceSubType(cfg.serviceSubType);
                    }
                  }}
                  className={`w-full p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-slate-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-xs sm:text-sm truncate ${isSelected ? 'text-emerald-950' : 'text-slate-900'}`}>
                        {isMl ? cfg.titleMl : cfg.titleEn}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {cfg.ruleRef}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {isMl ? cfg.descMl : cfg.descEn}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {uploadedCount > 0 ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{uploadedCount}</span>
                      </span>
                    ) : cfg.isMandatory ? (
                      <span className="text-[10px] font-medium bg-rose-50 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded">
                        Required
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Optional</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Dropzone & File List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active Category Header */}
          {(() => {
            const activeCfg = DRAWING_TYPES_CONFIG.find((c) => c.category === selectedCategory);
            return (
              <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-emerald-400 font-mono font-semibold">
                      {activeCfg?.ruleRef} · Standard Scale: {activeCfg?.defaultScale}
                    </div>
                    <div className="font-bold text-sm sm:text-base">
                      {isMl ? activeCfg?.titleMl : activeCfg?.titleEn}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id="camera-photo-btn"
                      onClick={() => cameraInputRef.current?.click()}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Take photo of physical plan"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isMl ? 'ക്യാമറ ഫോട്ടോ' : 'Photo'}</span>
                    </button>
                    <button
                      type="button"
                      id="browse-files-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      {isMl ? '+ ഫയൽ ചേർക്കുക' : '+ Add Files'}
                    </button>
                  </div>
                </div>

                {/* Sub-Service Tag Quick Selector (when service_plans is selected) */}
                {selectedCategory === 'service_plans' && (
                  <div className="pt-2 border-t border-slate-800">
                    <label className="text-[11px] text-slate-300 font-medium block mb-1.5">
                      {isMl ? 'സർവീസ് പ്ലാൻ ഉപവിഭാഗം ടാഗ് ചെയ്യുക (Service Sub-Type):' : 'Tag Service Sub-Type for Upload:'}
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'general_service', labelEn: 'Combined/General', labelMl: 'ഒരുമിച്ചുള്ളത്' },
                        { id: 'open_well', labelEn: 'Open Well (Rule 47)', labelMl: 'കിണർ (Rule 47)' },
                        { id: 'septic_tank', labelEn: 'Septic & Soak Pit', labelMl: 'സെപ്റ്റിക് ടാങ്ക്' },
                        { id: 'solar_panel', labelEn: 'Solar PV (Rule 49)', labelMl: 'സോളാർ' },
                        { id: 'solid_waste', labelEn: 'Solid Waste (Rule 46)', labelMl: 'ഖരമാലിന്യം' },
                        { id: 'biogas_plant', labelEn: 'Biogas (Rule 46)', labelMl: 'ബയോഗ്യാസ്' },
                        { id: 'rainwater_harvesting', labelEn: 'RWH (Rule 48)', labelMl: 'മഴവെള്ള സംഭരണി' },
                        { id: 'fire_safety', labelEn: 'Fire Safety (NBC)', labelMl: 'ഫയർ സേഫ്റ്റി' },
                      ].map((sub) => (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() => setSelectedServiceSubType(sub.id as ServiceSubType)}
                          className={`text-[10px] px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                            selectedServiceSubType === sub.id
                              ? 'bg-emerald-500 text-slate-950 shadow-xs'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isMl ? sub.labelMl : sub.labelEn}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Drag & Drop Upload Zone */}
          <div
            id="drawing-dropzone"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/70 bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              id="drawing-file-input"
              multiple
              accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              {isMl ? 'പ്ലാനുകൾ ഇവിടെ ഡ്രാഗ് ചെയ്യുക അല്ലെങ്കിൽ ക്ലിക്ക് ചെയ്യുക' : 'Drag and Drop architectural drawings here'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {isMl
                ? 'PDF, DWG, DXF, PNG, JPG അല്ലെങ്കിൽ ക്യാമറ ഫോട്ടോകൾ (ഓപ്പൺ വെൽ, സോളാർ, സെപ്റ്റിക്, വേസ്റ്റ്, ബയോഗ്യാസ് അടക്കം ഒന്നിലധികം ഷീറ്റുകൾ ചേർക്കാം)'
                : 'Supports PDF, DWG, DXF, PNG, JPEG or Camera photos. Upload multiple service sheets freely.'}
            </p>
          </div>

          {/* Uploaded Files for current Category */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>
                {isMl ? 'അപ്‌ലോഡ് ചെയ്ത ഫയലുകൾ' : 'Uploaded Sheets for'} (
                {drawings.filter((d) => d.category === selectedCategory).length})
              </span>
              <span className="text-[11px] font-normal text-slate-500">
                Total in Project: {drawings.length}
              </span>
            </h4>

            {drawings.filter((d) => d.category === selectedCategory).length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>
                  {isMl
                    ? 'ഈ വിഭാഗത്തിൽ ഇതുവരെ ഫയലുകൾ ചേർത്തിട്ടില്ല. മുകളിലെ ബോക്സിൽ ക്ലിക്ക് ചെയ്ത് ചേർക്കുക.'
                    : 'No drawings uploaded yet for this plan category.'}
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {drawings
                  .filter((d) => d.category === selectedCategory)
                  .map((drawing) => (
                    <div
                      key={drawing.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                            {drawing.name}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5 flex-wrap">
                            <span>{(drawing.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                              Scale {drawing.scale}
                            </span>
                            {drawing.serviceSubType && (
                              <>
                                <span>•</span>
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono text-[10px]">
                                  {drawing.serviceSubType}
                                </span>
                              </>
                            )}
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Verified ✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Scale Modifier & Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-wrap">
                        <select
                          value={drawing.scale}
                          onChange={(e) => onUpdateDrawing(drawing.id, { scale: e.target.value })}
                          className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:bg-white"
                        >
                          <option value="1:50">1:50</option>
                          <option value="1:100">1:100</option>
                          <option value="1:200">1:200</option>
                          <option value="1:400">1:400</option>
                          <option value="1:1000">1:1000</option>
                          <option value="1:2000">1:2000</option>
                        </select>

                        {/* AI Vision Inspection Button */}
                        {drawing.dataUrl && (
                          <button
                            type="button"
                            onClick={() => handleRunAiInspection(drawing)}
                            disabled={analyzingDrawingId === drawing.id}
                            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Run Gemini AI Visual Scrutiny on this sheet"
                          >
                            {analyzingDrawingId === drawing.id ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                                <span>{isMl ? 'പരിശോധിക്കുന്നു...' : 'Analyzing...'}</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{isMl ? 'AI പരിശോധന' : 'AI Scrutiny'}</span>
                              </>
                            )}
                          </button>
                        )}

                        {drawing.dataUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDrawing(drawing)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Preview Drawing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onRemoveDrawing(drawing.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove Drawing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
        <button
          type="button"
          id="btn-prev-authority"
          onClick={onPrev}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isMl ? 'മുമ്പത്തെ ഘട്ടം' : 'Back to Authority'}</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Quick Direct Scrutiny button (even with zero area statement input) */}
          <button
            type="button"
            id="btn-direct-scrutiny"
            onClick={() => {
              if (onDirectScrutiny) {
                onDirectScrutiny();
              } else {
                onNext();
              }
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40 font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all text-xs sm:text-sm cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{isMl ? 'ഡ്രോയിംഗ് അടിസ്ഥാനത്തിൽ നേരിട്ട് സ്ക്രൂട്ടിനി കാണുക' : 'Direct Drawing Scrutiny'}</span>
          </button>

          <button
            type="button"
            id="btn-proceed-areastatement"
            onClick={onNext}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm cursor-pointer"
          >
            <span>{isMl ? 'അടുത്ത ഘട്ടം: ഏരിയ സ്റ്റേറ്റ്മെന്റ്' : 'Proceed to Step 3: Area Statement'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Master Multi-Drawing Scrutiny Result Modal */}
      {masterScrutinyResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    {isMl ? 'വിന്യാസ (VINYASA) വിദഗ്ദ്ധ സമഗ്ര പ്ലാൻ പരിശോധന' : 'VINYASA Multi-Drawing Expert Scrutiny'}
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Cross-Drawing Synthesizer
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Evaluated {drawings.length} drawing sheets under {jurisdiction} 2019
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMasterScrutinyResult(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 max-h-[65vh]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isMl ? 'സമഗ്ര വാസ്തുശില്പ-നിയമ പരിശോധനാ റിപ്പോർട്ട്' : 'Technical-Legal Cross-Scrutiny Findings'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(masterScrutinyResult.scrutinyText);
                    setCopiedMasterAnalysis(true);
                    setTimeout(() => setCopiedMasterAnalysis(false), 2000);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer"
                >
                  {copiedMasterAnalysis ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{isMl ? 'കോപ്പി ചെയ്തു' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isMl ? 'റിപ്പോർട്ട് കോപ്പി' : 'Copy'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="prose prose-xs sm:prose-sm max-w-none text-slate-700 space-y-3 leading-relaxed bg-slate-50/70 p-5 rounded-xl border border-slate-200">
                <Markdown>{masterScrutinyResult.scrutinyText}</Markdown>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                {isMl
                  ? '💡 ഏരിയ സ്റ്റേറ്റ്മെന്റ് ടാബിൽ ഫിൽ ചെയ്യാതെ തന്നെ ഈ അളവുകൾ ഉപയോഗിച്ച് പെർമിറ്റ് പരിശോധന പൂർത്തിയാക്കാം.'
                  : '💡 Extracted dimensions can be applied directly to run the complete 40+ rule scrutiny.'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyMasterResultToProject}
                  className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {appliedDataToast ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>{isMl ? 'അളവുകൾ നൽകി സ്ക്രൂട്ടിനിയിലേക്ക് പോകുന്നു...' : 'Applying & Transitioning...'}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                      <span>{isMl ? 'ഈ അളവുകൾ നൽകി സ്ക്രൂട്ടിനി റിപ്പോർട്ട് കാണുക' : 'Apply Dimensions & View Scrutiny Report'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMasterScrutinyResult(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl cursor-pointer"
                >
                  {isMl ? 'അടയ്ക്കുക' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Drawing AI Vision Analysis Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-scaleUp">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    {isMl ? 'AI വിഷ്വൽ പ്ലാൻ പരിശോധനാ റിപ്പോർട്ട്' : 'AI Visual Blueprint Scrutiny Report'}
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      Gemini 2.5 Vision
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {analysisResult.drawing.name} ({analysisResult.drawing.category})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisResult(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 overflow-hidden flex-1">
              <div className="md:col-span-5 bg-slate-950 p-4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-800">
                {analysisResult.drawing.dataUrl ? (
                  <img
                    src={analysisResult.drawing.dataUrl}
                    alt={analysisResult.drawing.name}
                    className="max-h-[350px] md:max-h-[500px] w-full object-contain rounded-lg border border-slate-800 bg-slate-900"
                  />
                ) : (
                  <div className="text-slate-400 text-xs">PDF Document</div>
                )}
                <div className="text-slate-400 text-[11px] mt-2 flex items-center justify-between w-full">
                  <span>Scale: {analysisResult.drawing.scale}</span>
                  <span className="text-emerald-400">Visual Scan Complete</span>
                </div>
              </div>

              <div className="md:col-span-7 p-5 overflow-y-auto flex flex-col space-y-4 max-h-[60vh] md:max-h-[550px]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {isMl ? 'കെട്ടിട നിർമ്മാണ ചട്ട പരിശോധനാ ഫലം' : 'Rule Scrutiny & Rectification Guide'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(analysisResult.text);
                      setCopiedAnalysis(true);
                      setTimeout(() => setCopiedAnalysis(false), 2000);
                    }}
                    className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    {copiedAnalysis ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{isMl ? 'കോപ്പി ചെയ്തു' : 'Copied'}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isMl ? 'റിപ്പോർട്ട് കോപ്പി' : 'Copy'}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="prose prose-xs sm:prose-sm max-w-none text-slate-700 space-y-3 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                  <Markdown>{analysisResult.text}</Markdown>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
              <span>
                {isMl
                  ? '💡 KMBR 2019 / KPBR 2019 ചട്ടങ്ങൾ ആധാരമാക്കിയാണ് വിശകലനം ചെയ്തിരിക്കുന്നത്.'
                  : '💡 Scrutinized strictly in compliance with KMBR 2019 / KPBR 2019 standards.'}
              </span>

              <div className="flex items-center gap-2">
                {onApplyExtractedData && (
                  <button
                    type="button"
                    onClick={() => {
                      const metrics = parseExtractedDrawingMetrics(analysisResult.text);
                      onApplyExtractedData(metrics);
                      setAppliedDataToast(true);
                      setTimeout(() => setAppliedDataToast(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                  >
                    {appliedDataToast ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>{isMl ? 'ഫോമിലേക്ക് ചേർത്തു ✓' : 'Applied to Form ✓'}</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-200" />
                        <span>{isMl ? 'കണ്ടെത്തിയ അളവുകൾ ഫോമിലേക്ക് ചേർക്കുക' : 'Apply Detected Values to Form'}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAnalysisResult(null)}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg cursor-pointer"
                >
                  {isMl ? 'അടയ്ക്കുക' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewDrawing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-sm">{previewDrawing.name}</h3>
                <span className="text-xs text-slate-400 font-mono">Scale: {previewDrawing.scale}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDrawing(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-100 flex-1">
              {previewDrawing.dataUrl ? (
                <img
                  src={previewDrawing.dataUrl}
                  alt={previewDrawing.name}
                  className="max-h-[65vh] object-contain rounded-lg border border-slate-300"
                />
              ) : (
                <div className="text-slate-500 text-xs">PDF Document: {previewDrawing.name}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
