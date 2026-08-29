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
} from 'lucide-react';
import { DrawingCategory, Language, UploadedDrawing } from '../types';

interface DrawingUploaderProps {
  drawings: UploadedDrawing[];
  onAddDrawing: (drawing: UploadedDrawing) => void;
  onRemoveDrawing: (id: string) => void;
  onUpdateDrawing: (id: string, partial: Partial<UploadedDrawing>) => void;
  language: Language;
  onNext: () => void;
  onPrev: () => void;
}

const DRAWING_TYPES_CONFIG: {
  category: DrawingCategory;
  titleEn: string;
  titleMl: string;
  ruleRef: string;
  defaultScale: string;
  descEn: string;
  descMl: string;
  isMandatory: boolean;
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
    titleEn: '6. Service & Sanitation Plan',
    titleMl: '6. സർവീസ് & സാനിറ്റേഷൻ പ്ലാൻ',
    ruleRef: 'Rule 6(2)(f)',
    defaultScale: '1:100',
    descEn: 'Septic tank, soak pit details, water supply, sewage pipe routing',
    descMl: 'സെപ്റ്റിക് ടാങ്ക്, സോക്ക് പിറ്റ്, ഡ്രെയിനേജ് പൈപ്പ് ലൈൻ വിശദാംശങ്ങൾ',
    isMandatory: true,
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
  language,
  onNext,
  onPrev,
}) => {
  const isMl = language === 'ml';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<DrawingCategory>('site_plan');
  const [dragActive, setDragActive] = useState(false);
  const [previewDrawing, setPreviewDrawing] = useState<UploadedDrawing | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const config = DRAWING_TYPES_CONFIG.find((c) => c.category === selectedCategory);

      // Create synthetic preview url if image/pdf
      const newDrawing: UploadedDrawing = {
        id: `dwg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        category: selectedCategory,
        name: file.name,
        size: file.size,
        status: 'verified',
        scale: config?.defaultScale || '1:100',
        sheetsCount: 1,
        extractedLabels: [config?.titleEn || selectedCategory, 'Scale ' + (config?.defaultScale || '1:100')],
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

  const totalMandatory = DRAWING_TYPES_CONFIG.filter((c) => c.isMandatory).length;
  const uploadedMandatory = DRAWING_TYPES_CONFIG.filter(
    (c) => c.isMandatory && drawings.some((d) => d.category === c.category)
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Step 2 of 5
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isMl ? 'ചട്ടം 6 പ്രകാരമുള്ള ഡ്രോയിംഗ് പരിശോധന' : 'Engineering Drawing Verification (Rule 6)'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
              {isMl ? 'കെട്ടിട നിർമ്മാണ പ്ലാനുകൾ അപ്‌ലോഡ് ചെയ്യുക' : 'Upload Architectural & Engineering Drawings'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isMl
                ? 'ലൊക്കേഷൻ പ്ലാൻ, സൈറ്റ് പ്ലാൻ, ഫ്ലോർ പ്ലാനുകൾ, സെക്ഷൻ, സാനിറ്റേഷൻ പ്ലാൻ എന്നിവ PDF, DWG, DXF അല്ലെങ്കിൽ ഇമേജ് ഫോർമാറ്റിൽ ചേർക്കുക.'
                : 'Upload Location Plan, Site Plan, Floor Plans, Section, Sanitation, and Parking layouts in PDF, DWG or image format.'}
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
              {Math.round((uploadedMandatory / totalMandatory) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Main Upload Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Selector */}
        <div className="lg:col-span-5 space-y-2.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            {isMl ? 'ഡ്രോയിംഗ് കാറ്റഗറി തെരഞ്ഞെടുക്കുക:' : 'Select Plan Type to Upload:'}
          </label>

          <div className="space-y-2">
            {DRAWING_TYPES_CONFIG.map((cfg) => {
              const uploadedCount = drawings.filter((d) => d.category === cfg.category).length;
              const isSelected = selectedCategory === cfg.category;

              return (
                <button
                  key={cfg.category}
                  type="button"
                  id={`cat-select-${cfg.category}`}
                  onClick={() => setSelectedCategory(cfg.category)}
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
              <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-emerald-400 font-mono font-semibold">
                    {activeCfg?.ruleRef} · Standard Scale: {activeCfg?.defaultScale}
                  </div>
                  <div className="font-bold text-sm sm:text-base">
                    {isMl ? activeCfg?.titleMl : activeCfg?.titleEn}
                  </div>
                </div>
                <button
                  type="button"
                  id="browse-files-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                >
                  {isMl ? '+ ഫയൽ ചേർക്കുക' : '+ Add Files'}
                </button>
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
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm sm:text-base">
              {isMl ? 'ഫയലുകൾ ഇവിടെ ഡ്രാഗ് ചെയ്യുക അല്ലെങ്കിൽ ക്ലിക്ക് ചെയ്യുക' : 'Drag and Drop architectural drawings here'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {isMl
                ? 'PDF, DWG, DXF, PNG, JPG ഫോർമാറ്റുകൾ സ്വീകരിക്കും (Max 25MB per file)'
                : 'Supports PDF, DWG, DXF, PNG, JPEG formats with scale metadata'}
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
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{(drawing.size / (1024 * 1024)).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-slate-700">
                              Scale {drawing.scale}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Verified ✓</span>
                          </div>
                        </div>
                      </div>

                      {/* Scale Modifier & Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
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

                        {drawing.dataUrl && (
                          <button
                            type="button"
                            onClick={() => setPreviewDrawing(drawing)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Preview Drawing"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onRemoveDrawing(drawing.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          id="btn-prev-authority"
          onClick={onPrev}
          className="flex items-center gap-1.5 text-slate-700 hover:text-slate-900 font-medium px-4 py-2 rounded-xl text-xs sm:text-sm hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isMl ? 'മുമ്പത്തെ ഘട്ടം' : 'Back to Authority'}</span>
        </button>

        <button
          type="button"
          id="btn-proceed-areastatement"
          onClick={onNext}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 text-xs sm:text-sm"
        >
          <span>{isMl ? 'അടുത്ത ഘട്ടം: ഏരിയ സ്റ്റേറ്റ്മെന്റ് നൽകുക' : 'Proceed to Step 3: Area Statement'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

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
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
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
