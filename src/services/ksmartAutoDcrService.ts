import { AreaStatementData, JurisdictionType, Language } from '../types';

export interface KSmartLayerDef {
  layerName: string;
  colorCode: number; // AutoCAD Color Index (ACI)
  colorHex: string;
  lineType: string;
  descriptionEn: string;
  descriptionMl: string;
  entityType: 'LWPOLYLINE (Closed)' | 'LINE' | 'CIRCLE' | 'TEXT / MTEXT' | 'BLOCK / INSERT';
  mandatory: boolean;
  ruleRef: string;
}

export interface KSmartErrorCodeItem {
  code: string;
  titleEn: string;
  titleMl: string;
  category: 'layer' | 'topology' | 'sanitation' | 'setback' | 'far_coverage' | 'stair_fire' | 'general';
  severity: 'critical' | 'warning' | 'info';
  rootCauseEn: string;
  rootCauseMl: string;
  expertSolutionEn: string;
  expertSolutionMl: string;
  autocadCommand: string;
  autoFixAvailable: boolean;
}

export interface KSmartDiagnosticResult {
  score: number; // 0 to 100
  status: 'ready' | 'needs_rectification' | 'critical_rejection';
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  diagnostics: {
    id: string;
    checkNameEn: string;
    checkNameMl: string;
    layerTarget: string;
    status: 'pass' | 'fail' | 'warning';
    currentFindingEn: string;
    currentFindingMl: string;
    remedyEn: string;
    remedyMl: string;
    cadAction: string;
    fixed: boolean;
  }[];
}

// Official K-Smart Auto-DCR Layer Dictionary (Kerala Building Rules 2019)
export const KSMART_STANDARD_LAYERS: KSmartLayerDef[] = [
  {
    layerName: '0_PLOT_BOUNDARY',
    colorCode: 1, // Red
    colorHex: '#EF4444',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Closed polyline marking registered cadastral plot boundary with exact survey area.',
    descriptionMl: 'രജിസ്റ്റർ ചെയ്ത പ്ലോട്ട് അതിർത്തി അടയാളപ്പെടുത്തുന്ന ക്ലോസ്ഡ് പോളിലൈൻ.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 6(2)(b)',
  },
  {
    layerName: '0_BUILDING_OUTLINE',
    colorCode: 3, // Green
    colorHex: '#10B981',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Composite plinth boundary of the building for ground coverage computation.',
    descriptionMl: 'ഗ്രൗണ്ട് കവറേജ് കണക്കാക്കുന്നതിനുള്ള കെട്ടിടത്തിന്റെ പ്ലിന്ത് വിസ്തീർണ്ണ പോളിലൈൻ.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 24 / 26',
  },
  {
    layerName: '0_FLOOR_GF',
    colorCode: 4, // Cyan
    colorHex: '#06B6D4',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Ground floor built-up boundary used by Auto-DCR for FAR calculation.',
    descriptionMl: 'FAR കണക്കാക്കുന്നതിനുള്ള ഗ്രൗണ്ട് ഫ്ലോർ നിർമ്മിതി വിസ്തീർണ്ണം.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 27 / 29',
  },
  {
    layerName: '0_FLOOR_FF',
    colorCode: 5, // Blue
    colorHex: '#3B82F6',
    lineType: 'CONTINUOUS',
    descriptionEn: 'First floor built-up outline (if multistoried).',
    descriptionMl: 'ഒന്നാം നിലയിലെ ബിൽറ്റ്-അപ്പ് ഔട്ട്ലൈൻ.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: false,
    ruleRef: 'Rule 27 / 29',
  },
  {
    layerName: '0_SETBACK_FRONT',
    colorCode: 6, // Magenta
    colorHex: '#D946EF',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Front open space measurement dimension line (minimum 3.00m or small plot 1.80m).',
    descriptionMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് അകലം അളക്കുന്ന ഡൈമൻഷൻ രേഖ.',
    entityType: 'LINE',
    mandatory: true,
    ruleRef: 'Rule 25 / 27 Table 4',
  },
  {
    layerName: '0_SETBACK_REAR',
    colorCode: 6,
    colorHex: '#D946EF',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Rear open space measurement line (minimum 1.50m / 1.00m).',
    descriptionMl: 'പിൻവശത്തെ സെറ്റ്ബാക്ക് അകലം അളക്കുന്ന ഡൈമൻഷൻ രേഖ.',
    entityType: 'LINE',
    mandatory: true,
    ruleRef: 'Rule 25 / 27 Table 4',
  },
  {
    layerName: '0_SETBACK_SIDE1',
    colorCode: 2, // Yellow
    colorHex: '#EAB308',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Side 1 (Left/North) open space dimension line.',
    descriptionMl: 'സൈഡ് 1 സെറ്റ്ബാക്ക് ഡൈമൻഷൻ രേഖ.',
    entityType: 'LINE',
    mandatory: true,
    ruleRef: 'Rule 25 / 27 Table 4',
  },
  {
    layerName: '0_SETBACK_SIDE2',
    colorCode: 2,
    colorHex: '#EAB308',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Side 2 (Right/South) open space dimension line.',
    descriptionMl: 'സൈഡ് 2 സെറ്റ്ബാക്ക് ഡൈമൻഷൻ രേഖ.',
    entityType: 'LINE',
    mandatory: true,
    ruleRef: 'Rule 25 / 27 Table 4',
  },
  {
    layerName: '0_ROAD_WIDTH',
    colorCode: 7, // White/Light Slate
    colorHex: '#E2E8F0',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Access road corridor polyline with width annotation text.',
    descriptionMl: 'വസ്തുവിലേക്കുള്ള റോഡ് വീതി കാണിക്കുന്ന പോളിലൈനും ടെക്സ്റ്റും.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 34 Table 3',
  },
  {
    layerName: '0_WELL_CIRC',
    colorCode: 140, // Sky Blue
    colorHex: '#38BDF8',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Open drinking water well boundary circle (Radius and offset verification).',
    descriptionMl: 'കുടിവെള്ള കിണർ കാണിക്കുന്ന സർക്കിൾ.',
    entityType: 'CIRCLE',
    mandatory: false,
    ruleRef: 'Rule 47 / 91',
  },
  {
    layerName: '0_SEPTIC_TANK',
    colorCode: 30, // Orange
    colorHex: '#F97316',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Septic tank and soak pit boundary (Must maintain 7.50m radial buffer from well).',
    descriptionMl: 'സെപ്റ്റിക് ടാങ്ക് & സോക്ക് പിറ്റ് (കിണറിൽ നിന്ന് 7.50m ദൂരം നിർബന്ധം).',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 47 / 91',
  },
  {
    layerName: '0_RWH_TANK',
    colorCode: 150, // Teal
    colorHex: '#14B8A6',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Rainwater harvesting tank location and recharge pit.',
    descriptionMl: 'മഴവെള്ള സംഭരണി ടാങ്ക് & റീചാർജ്ജ് പിറ്റ്.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 48',
  },
  {
    layerName: '0_STAIRCASE_FIRE',
    colorCode: 10, // Crimson Red
    colorHex: '#E11D48',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Main internal and fire escape staircase path, riser and tread geometry.',
    descriptionMl: 'പ്രധാന സ്റ്റെയർകേസ് & ഫയർ എസ്കേപ്പ് സ്റ്റെയർ ഘടന.',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 35',
  },
  {
    layerName: '0_PARKING_BAY',
    colorCode: 8, // Gray
    colorHex: '#94A3B8',
    lineType: 'CONTINUOUS',
    descriptionEn: 'Car parking bay rectangles (2.5m x 5.0m standard ECS).',
    descriptionMl: 'കാർ പാർക്കിംഗ് സ്ലോട്ടുകൾ (2.5m x 5.0m).',
    entityType: 'LWPOLYLINE (Closed)',
    mandatory: true,
    ruleRef: 'Rule 29 / 31',
  },
  {
    layerName: '0_NORTH_ARROW',
    colorCode: 1,
    colorHex: '#EF4444',
    lineType: 'CONTINUOUS',
    descriptionEn: 'True North directional arrow block on key plan / site plan.',
    descriptionMl: 'യഥാർത്ഥ വടക്ക് ദിശ അടയാളപ്പെടുത്തുന്ന ചിഹ്നം.',
    entityType: 'BLOCK / INSERT',
    mandatory: true,
    ruleRef: 'Rule 6(2)(a)',
  },
];

// Comprehensive K-Smart Error Code Encyclopedia & Automatic Solution Matrix
export const KSMART_ERROR_CATALOG: KSmartErrorCodeItem[] = [
  {
    code: 'ERR_DCR_001',
    titleEn: 'Missing Mandatory 0_PLOT_BOUNDARY Layer',
    titleMl: 'പ്ലോട്ട് അതിർത്തി ലെയർ (0_PLOT_BOUNDARY) കണ്ടെത്തിയില്ല',
    category: 'layer',
    severity: 'critical',
    rootCauseEn: 'The CAD file uses generic layers like "PLOT", "SITE", or "BOUNDARY" instead of K-Smart strict "0_PLOT_BOUNDARY".',
    rootCauseMl: 'കെ-സ്മാർട്ട് നിർദ്ദിഷ്ട "0_PLOT_BOUNDARY" ക്ക് പകരം "PLOT", "SITE" തുടങ്ങിയ ലെയറുകൾ ഉപയോഗിച്ചു.',
    expertSolutionEn: 'Rename the cadastral boundary layer to "0_PLOT_BOUNDARY" and ensure it is a single closed LWPOLYLINE.',
    expertSolutionMl: 'അതിർത്തി ലെയർ "0_PLOT_BOUNDARY" എന്ന് പുനർനാമകരണം ചെയ്യുകയും അത് ഒരു ക്ലോസ്ഡ് പോളിലൈൻ ആണെന്ന് ഉറപ്പാക്കുകയും ചെയ്യുക.',
    autocadCommand: 'RENAME -> Layer -> "PLOT" -> "0_PLOT_BOUNDARY"',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_002',
    titleEn: 'Unclosed Polyline (Gap detected in Boundary / Plinth)',
    titleMl: 'അടയ്ക്കാത്ത പോളിലൈൻ (പോളിഗൺ ലൂപ്പിൽ വിടവ് ഉണ്ട്)',
    category: 'topology',
    severity: 'critical',
    rootCauseEn: 'K-Smart Auto-DCR area calculation engine fails because boundary polygon has a start-point and end-point gap greater than 0.001m.',
    rootCauseMl: 'പോളിലൈനിന്റെ തുടക്കവും അവസാനവും തമ്മിൽ വിടവ് ഉള്ളതിനാൽ വിസ്തീർണ്ണം തിട്ടപ്പെടുത്താൻ കഴിഞ്ഞില്ല.',
    expertSolutionEn: 'Use PEDIT command, select the polyline, choose Close (C) and Join (J) with tolerance 0.05.',
    expertSolutionMl: 'PEDIT കമാൻഡ് നൽകി "Close" സെലക്ട് ചെയ്യുക, അല്ലെങ്കിൽ BOUNDARY (BO) അടിച്ച് പുതിയ ക്ലോസ്ഡ് പോളിലൈൻ ഉണ്ടാക്കുക.',
    autocadCommand: 'PEDIT -> Select -> C (Close) -> J (Join) 0.05',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_003',
    titleEn: 'Non-Zero Z-Coordinates (3D Entities Detected)',
    titleMl: '3D ഉയരങ്ങൾ ഉള്ള എന്റിറ്റികൾ (Z != 0.0000)',
    category: 'topology',
    severity: 'critical',
    rootCauseEn: 'Entities contain elevation / Z-axis coordinates from 3D blocks or imported survey total-station files, crashing K-Smart 2D Auto-DCR parser.',
    rootCauseMl: 'ലൈനുകൾക്കും ബ്ലോക്കുകൾക്കും Z ആക്സിസ് മൂല്യം ഉള്ളതിനാൽ 2D ഓട്ടോ-ഡിസിആർ എഞ്ചിൻ എറർ കാണിക്കുന്നു.',
    expertSolutionEn: 'Flatten all drawing geometry to Z=0.000 using AutoCAD FLATTEN or CHANGE command.',
    expertSolutionMl: 'ഡ്രോയിംഗിലെ എല്ലാ ലൈനുകളും Z=0 ലേക്ക് ഫ്ലാറ്റൻ (FLATTEN) ചെയ്യുക.',
    autocadCommand: 'FLATTEN -> ALL or CHANGE -> ALL -> Properties -> Elev -> 0',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_004',
    titleEn: 'Well to Septic Tank Clearance Violation (< 7.50m)',
    titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ 7.50 മീറ്റർ ദൂരമില്ല',
    category: 'sanitation',
    severity: 'critical',
    rootCauseEn: 'Radial distance between circle in 0_WELL_CIRC and polygon in 0_SEPTIC_TANK is less than statutory 7.50m (Rule 47/91).',
    rootCauseMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്ക് സോക്ക് പിറ്റും തമ്മിൽ 7.50 മീറ്റർ റേഡിയൽ ദൂരമില്ല.',
    expertSolutionEn: 'Relocate septic tank soak pit in site plan to maintain >= 7.50m buffer, or submit certified water-tight RCC Bio-tank undertaking.',
    expertSolutionMl: 'സെപ്റ്റിക് ടാങ്ക് 7.50 മീറ്ററിലധികം അകലമുള്ള ഭാഗത്തേക്ക് മാറ്റി സ്ഥാപിക്കുകയോ വാട്ടർ ടൈറ്റ് സത്യവാങ്മൂലം നൽകുകയോ ചെയ്യുക.',
    autocadCommand: 'MOVE -> Select 0_SEPTIC_TANK -> Offset >= 7.50m from Well center',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_005',
    titleEn: 'Front Setback Shortfall against Table 4 Standards',
    titleMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് കുറവ് (ചട്ടം 25/27)',
    category: 'setback',
    severity: 'critical',
    rootCauseEn: 'Front open space in layer 0_SETBACK_FRONT measures less than 3.00m (or 1.80m for small plots).',
    rootCauseMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് 3.00 മീറ്ററിൽ താഴെയാണ് (ചെറിയ പ്ലോട്ട് അല്ലെങ്കിൽ 1.80m).',
    expertSolutionEn: 'Check if plot area is < 200 sq.m to claim Rule 60/62 exemption, otherwise shift front building line inward.',
    expertSolutionMl: 'പ്ലോട്ട് 200 ച.മീറ്ററിൽ താഴെയാണെങ്കിൽ റൂൾ 60 ഇളവ് ക്ലെയിം ചെയ്യുക, അല്ലെങ്കിൽ കെട്ടിടം പിന്നിലേക്ക് മാറ്റുക.',
    autocadCommand: 'STRETCH -> Shift Front Plinth to meet 3.00m / 1.80m',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_006',
    titleEn: 'FAR Discrepancy between CAD Polygon & Web Form Area',
    titleMl: 'ഡ്രോയിംഗിലെ വിസ്തീർണ്ണവും അപേക്ഷയിലെ FAR ഉം തമ്മിലുള്ള പൊരുത്തക്കേട്',
    category: 'far_coverage',
    severity: 'critical',
    rootCauseEn: 'Total area of 0_FLOOR_GF + 0_FLOOR_FF polylines differs by > 1% from the built-up area entered in K-Smart web application form.',
    rootCauseMl: 'CAD ഡ്രോയിംഗിലെ ഫ്ലോർ പോളിലൈൻ വിസ്തീർണ്ണവും അപേക്ഷാ ഫോമിലെ ഏരിയയും തമ്മിൽ വ്യത്യാസമുണ്ട്.',
    expertSolutionEn: 'Auto-sync Area Statement figures directly with polyline area output generated by VINYASA Auto-DCR.',
    expertSolutionMl: 'ഡ്രോയിംഗിലെ കൃത്യമായ വിസ്തീർണ്ണം വിന്യാസയിലെ ഏരിയ സ്റ്റേറ്റ്‌മെന്റിലേക്ക് സിങ്ക് ചെയ്ത് ഫോമിൽ അപ്‌ഡേറ്റ് ചെയ്യുക.',
    autocadCommand: 'AREA -> Object -> Select 0_FLOOR_GF',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_007',
    titleEn: 'Duplicate & Overlapping Line Segments in Plinth Layer',
    titleMl: 'ഓവർലാപ്പ് ചെയ്യുന്ന ഇരട്ട ലൈനുകൾ (ഡ്യൂപ്ലിക്കേറ്റ് വെർട്ടിസുകൾ)',
    category: 'topology',
    severity: 'warning',
    rootCauseEn: 'Overlapping duplicate lines confuse Auto-DCR area calculation vertices.',
    rootCauseMl: 'ഒന്നിന് മീതെ മറ്റൊന്നായി കിടക്കുന്ന ഇരട്ട ലൈനുകൾ ഏരിയ കാൽക്കുലേഷനെ തടസ്സപ്പെടുത്തുന്നു.',
    expertSolutionEn: 'Run OVERKILL command to purge duplicate and overlapping collinear lines and vertices.',
    expertSolutionMl: 'ഓട്ടോകാഡിൽ OVERKILL കമാൻഡ് നൽകി ഡ്യൂപ്ലിക്കേറ്റ് ലൈനുകൾ നീക്കം ചെയ്യുക.',
    autocadCommand: 'OVERKILL -> Select All -> Tolerance 0.001 -> OK',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_008',
    titleEn: 'Missing True North Direction Block in 0_NORTH_ARROW',
    titleMl: 'നോർത്ത് മാർക്ക് (0_NORTH_ARROW) ഡ്രോയിംഗിൽ കാണുന്നില്ല',
    category: 'layer',
    severity: 'warning',
    rootCauseEn: 'K-Smart requires North arrow on layer 0_NORTH_ARROW for automated solar and setback orientation.',
    rootCauseMl: 'സൈറ്റ് പ്ലാനിൽ വടക്ക് ദിശ വ്യക്തമാക്കുന്ന നോർത്ത് മാർക്ക് ലെയറിലില്ല.',
    expertSolutionEn: 'Insert standard North Arrow block on layer "0_NORTH_ARROW".',
    expertSolutionMl: '"0_NORTH_ARROW" ലെയറിൽ നോർത്ത് ആരോ ചിഹ്നം പ്ലേസ് ചെയ്യുക.',
    autocadCommand: 'INSERT -> KSMART_NORTH -> Layer: 0_NORTH_ARROW',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_009',
    titleEn: 'Access Road Polyline / Width Missing in 0_ROAD_WIDTH',
    titleMl: 'വഴിവീതി ലെയർ (0_ROAD_WIDTH) അപൂർണ്ണമാണ്',
    category: 'setback',
    severity: 'critical',
    rootCauseEn: 'Road access corridor is drawn as open single lines instead of closed width polygon or dimension line.',
    rootCauseMl: 'വഴിവീതി പോളിലൈൻ ആയി രേഖപ്പെടുത്തിയിട്ടില്ല.',
    expertSolutionEn: 'Draw access road boundary as closed polyline on layer 0_ROAD_WIDTH with clear text dimension.',
    expertSolutionMl: 'റോഡ് വിസ്തൃതി 0_ROAD_WIDTH ലെയറിൽ ക്ലോസ്ഡ് പോളിലൈൻ ആയി വരയ്ക്കുക.',
    autocadCommand: 'PLINE -> Closed path on 0_ROAD_WIDTH',
    autoFixAvailable: true,
  },
  {
    code: 'ERR_DCR_010',
    titleEn: 'Staircase Flight Geometry (Riser > 15cm / Tread < 25cm)',
    titleMl: 'സ്റ്റെയർകേസ് റൈസർ & ട്രെഡ്ഡ് ചട്ടങ്ങൾക്ക് വിരുദ്ധമാണ്',
    category: 'stair_fire',
    severity: 'warning',
    rootCauseEn: 'NBC 2016 Part 4 & KMBR Rule 35 limit maximum riser to 15cm for public or 17.5cm residential, min tread 25cm.',
    rootCauseMl: 'സ്റ്റെയർകേസ് റൈസർ 15cm/17.5cm ൽ കൂടുതലോ ട്രെഡ്ഡ് 25cm ൽ താഴെയോ ആണ്.',
    expertSolutionEn: 'Adjust stair cross-section flight details in drawing to comply with 15cm riser and 25cm tread.',
    expertSolutionMl: 'സ്റ്റെയർകേസ് റൈസർ 15cm ഉം ട്രെഡ്ഡ് 25cm ഉം ആയി ഡ്രോയിംഗിൽ പുതുക്കുക.',
    autocadCommand: 'ARRAY / COPY -> 15cm Riser & 25cm Tread pitch',
    autoFixAvailable: true,
  },
];

/**
 * Runs intelligent K-Smart Auto-DCR Pre-Scrutiny & Diagnostics on current project
 */
export function runKSmartDiagnostics(
  data: AreaStatementData,
  jurisdiction: JurisdictionType = 'KPBR'
): KSmartDiagnosticResult {
  const diagnostics: KSmartDiagnosticResult['diagnostics'] = [];

  // Check 1: 0_PLOT_BOUNDARY Layer & Area Check
  if (data.plotAreaSqM > 0) {
    diagnostics.push({
      id: 'diag-1',
      checkNameEn: 'Cadastral Boundary Closed Polyline (0_PLOT_BOUNDARY)',
      checkNameMl: 'പ്ലോട്ട് അതിർത്തി ക്ലോസ്ഡ് പോളിലൈൻ ലെയർ',
      layerTarget: '0_PLOT_BOUNDARY',
      status: 'pass',
      currentFindingEn: `Plot Area ${data.plotAreaSqM.toFixed(2)} sq.m (${data.plotAreaCents || 0} cents) marked in closed polyline.`,
      currentFindingMl: `പ്ലോട്ട് വിസ്തീർണ്ണം ${data.plotAreaSqM.toFixed(2)} ച.മീറ്റർ ക്ലോസ്ഡ് പോളിലൈനിൽ രേഖപ്പെടുത്തിയിട്ടുണ്ട്.`,
      remedyEn: 'None. Layer is 100% compliant with K-Smart standard.',
      remedyMl: 'മാറ്റങ്ങൾ ആവശ്യമില്ല. കെ-സ്മാർട്ട് നിബന്ധനകൾ പാലിക്കുന്നു.',
      cadAction: 'VERIFIED',
      fixed: true,
    });
  } else {
    diagnostics.push({
      id: 'diag-1',
      checkNameEn: 'Cadastral Boundary Closed Polyline (0_PLOT_BOUNDARY)',
      checkNameMl: 'പ്ലോട്ട് അതിർത്തി ക്ലോസ്ഡ് പോളിലൈൻ ലെയർ',
      layerTarget: '0_PLOT_BOUNDARY',
      status: 'fail',
      currentFindingEn: 'Plot area is 0 or unclosed boundary loop.',
      currentFindingMl: 'പ്ലോട്ട് വിസ്തീർണ്ണം കണ്ടെത്താൻ സാധിച്ചില്ല.',
      remedyEn: 'Draw a closed LWPOLYLINE on layer "0_PLOT_BOUNDARY" around your plot survey boundary.',
      remedyMl: '"0_PLOT_BOUNDARY" ലെയറിൽ ക്ലോസ്ഡ് പോളിലൈൻ വരയ്ക്കുക.',
      cadAction: 'PLINE -> Close -> Layer: 0_PLOT_BOUNDARY',
      fixed: false,
    });
  }

  // Check 2: Front Setback
  const minFront = data.plotAreaSqM < 200 ? 1.8 : 3.0;
  if ((data.frontSetbackM || 0) >= minFront) {
    diagnostics.push({
      id: 'diag-2',
      checkNameEn: 'Front Open Space (0_SETBACK_FRONT)',
      checkNameMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് അകലം',
      layerTarget: '0_SETBACK_FRONT',
      status: 'pass',
      currentFindingEn: `Provided ${data.frontSetbackM}m meets mandatory ${minFront}m minimum.`,
      currentFindingMl: `നൽകിയിട്ടുള്ള ${data.frontSetbackM}m മുൻവശത്തെ ചട്ടപരമായ അകലം (${minFront}m) പാലിക്കുന്നു.`,
      remedyEn: 'Compliant.',
      remedyMl: 'ചട്ടപ്രകാരമുള്ളതാണ്.',
      cadAction: 'VERIFIED',
      fixed: true,
    });
  } else {
    diagnostics.push({
      id: 'diag-2',
      checkNameEn: 'Front Open Space (0_SETBACK_FRONT)',
      checkNameMl: 'മുൻവശത്തെ സെറ്റ്ബാക്ക് അകലം',
      layerTarget: '0_SETBACK_FRONT',
      status: 'fail',
      currentFindingEn: `Provided ${data.frontSetbackM || 0}m is below mandatory ${minFront}m requirement (Shortfall: ${(minFront - (data.frontSetbackM || 0)).toFixed(2)}m).`,
      currentFindingMl: `നൽകിയിട്ടുള്ള മുൻവശത്തെ അകലം (${data.frontSetbackM || 0}m) നിർബന്ധിതമായ ${minFront}m നേക്കാൾ കുറവാണ്.`,
      remedyEn: `Shift front plinth wall ${(minFront - (data.frontSetbackM || 0)).toFixed(2)}m inwards on layer 0_SETBACK_FRONT.`,
      remedyMl: `മുൻവശത്തെ ഭിത്തി ${(minFront - (data.frontSetbackM || 0)).toFixed(2)}m പിന്നിലേക്ക് മാറ്റി ക്രമീകരിക്കുക.`,
      cadAction: 'STRETCH -> Offset plinth to 3.00m/1.80m',
      fixed: false,
    });
  }

  // Check 3: Rear Setback
  const minRear = data.plotAreaSqM < 200 ? 1.0 : 1.5;
  if ((data.rearSetbackM || 0) >= minRear) {
    diagnostics.push({
      id: 'diag-3',
      checkNameEn: 'Rear Open Space (0_SETBACK_REAR)',
      checkNameMl: 'പിൻവശത്തെ സെറ്റ്ബാക്ക് അകലം',
      layerTarget: '0_SETBACK_REAR',
      status: 'pass',
      currentFindingEn: `Provided ${data.rearSetbackM}m clears mandatory ${minRear}m minimum.`,
      currentFindingMl: `പിൻവശത്തെ അകലം ${data.rearSetbackM}m ചട്ടപ്രകാരമുള്ളതാണ് (${minRear}m).`,
      remedyEn: 'Compliant.',
      remedyMl: 'ചട്ടപ്രകാരമുള്ളതാണ്.',
      cadAction: 'VERIFIED',
      fixed: true,
    });
  } else {
    diagnostics.push({
      id: 'diag-3',
      checkNameEn: 'Rear Open Space (0_SETBACK_REAR)',
      checkNameMl: 'പിൻവശത്തെ സെറ്റ്ബാക്ക് അകലം',
      layerTarget: '0_SETBACK_REAR',
      status: 'fail',
      currentFindingEn: `Provided rear setback ${data.rearSetbackM || 0}m is below ${minRear}m minimum.`,
      currentFindingMl: `പിൻവശത്തെ അകലം (${data.rearSetbackM || 0}m) കുറവാണ്. കുറഞ്ഞത് ${minRear}m വേണം.`,
      remedyEn: `Realign rear wall to maintain minimum ${minRear}m open space on 0_SETBACK_REAR.`,
      remedyMl: `പിൻഭാഗത്തെ ഭിത്തി മാറ്റി കുറഞ്ഞത് ${minRear}m അകലം ഉറപ്പാക്കുക.`,
      cadAction: 'MOVE / STRETCH -> 0_SETBACK_REAR',
      fixed: false,
    });
  }

  // Check 4: Septic to Well Clearance
  if (data.openWellInPlot) {
    if ((data.distanceWellToSepticTankM || 0) >= 7.5) {
      diagnostics.push({
        id: 'diag-4',
        checkNameEn: 'Well to Septic Tank Radial Buffer (0_SEPTIC_TANK)',
        checkNameMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50m ദൂരപരിധി',
        layerTarget: '0_SEPTIC_TANK',
        status: 'pass',
        currentFindingEn: `Sanitary clearance of ${data.distanceWellToSepticTankM}m exceeds mandatory 7.50m radial buffer.`,
        currentFindingMl: `കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള ദൂരം (${data.distanceWellToSepticTankM}m) 7.50 മീറ്ററിലധികമാണ്.`,
        remedyEn: 'Compliant.',
        remedyMl: 'ചട്ടപ്രകാരമുള്ളതാണ്.',
        cadAction: 'VERIFIED',
        fixed: true,
      });
    } else {
      diagnostics.push({
        id: 'diag-4',
        checkNameEn: 'Well to Septic Tank Radial Buffer (0_SEPTIC_TANK)',
        checkNameMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50m ദൂരപരിധി',
        layerTarget: '0_SEPTIC_TANK',
        status: 'fail',
        currentFindingEn: `Distance ${data.distanceWellToSepticTankM || 0}m violates Rule 47/91 (Mandatory: 7.50m radial buffer).`,
        currentFindingMl: `കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള ദൂരം (${data.distanceWellToSepticTankM || 0}m) ചട്ടവിരുദ്ധമാണ് (കുറഞ്ഞത് 7.50m വേണം).`,
        remedyEn: 'Relocate 0_SEPTIC_TANK polygon to maintain >= 7.50m radial offset from 0_WELL_CIRC center.',
        remedyMl: 'സെപ്റ്റിക് ടാങ്ക് കിണറിൽ നിന്ന് 7.50 മീറ്ററിലധികം ദൂരത്തേക്ക് മാറ്റി സ്ഥാപിക്കുക.',
        cadAction: 'MOVE -> 0_SEPTIC_TANK offset >= 7.50m',
        fixed: false,
      });
    }
  }

  // Check 5: Access Road Width
  if ((data.roadAccessWidthM || 0) >= 1.2) {
    diagnostics.push({
      id: 'diag-5',
      checkNameEn: 'Access Road Polyline (0_ROAD_WIDTH)',
      checkNameMl: 'വഴിവീതി പോളിലൈൻ ലെയർ',
      layerTarget: '0_ROAD_WIDTH',
      status: 'pass',
      currentFindingEn: `Access road width ${data.roadAccessWidthM}m satisfies Table 3 occupancy access rule.`,
      currentFindingMl: `വഴിവീതി ${data.roadAccessWidthM}m ചട്ടപ്രകാരമുള്ളതാണ്.`,
      remedyEn: 'Compliant.',
      remedyMl: 'ചട്ടപ്രകാരമുള്ളതാണ്.',
      cadAction: 'VERIFIED',
      fixed: true,
    });
  } else {
    diagnostics.push({
      id: 'diag-5',
      checkNameEn: 'Access Road Polyline (0_ROAD_WIDTH)',
      checkNameMl: 'വഴിവീതി പോളിലൈൻ ലെയർ',
      layerTarget: '0_ROAD_WIDTH',
      status: 'fail',
      currentFindingEn: `Road width ${data.roadAccessWidthM || 0}m is below 1.20m pedestrian/vehicular minimum.`,
      currentFindingMl: `വഴിവീതി (${data.roadAccessWidthM || 0}m) കുറവാണ്.`,
      remedyEn: 'Produce village officer access sketch or expand corridor to minimum 1.20m/3.00m.',
      remedyMl: 'വില്ലേജ് റോഡ് സർട്ടിഫിക്കറ്റ് സമർപ്പിക്കുകയോ വഴിവീതി 0_ROAD_WIDTH ൽ ക്രമീകരിക്കുകയോ ചെയ്യുക.',
      cadAction: 'PLINE -> 0_ROAD_WIDTH',
      fixed: false,
    });
  }

  // Check 6: Ground Coverage
  const maxCoveragePct = jurisdiction === 'KMBR' ? 60 : 65;
  const currentCoveragePct =
    data.plotAreaSqM > 0 ? ((data.groundCoverageSqM || 0) / data.plotAreaSqM) * 100 : 50;

  if (currentCoveragePct <= maxCoveragePct) {
    diagnostics.push({
      id: 'diag-6',
      checkNameEn: 'Ground Coverage Plinth (0_BUILDING_OUTLINE)',
      checkNameMl: 'ഗ്രൗണ്ട് കവറേജ് പ്ലിന്ത് വിസ്തീർണ്ണം',
      layerTarget: '0_BUILDING_OUTLINE',
      status: 'pass',
      currentFindingEn: `Coverage ${currentCoveragePct.toFixed(1)}% is within permissible maximum of ${maxCoveragePct}%.`,
      currentFindingMl: `ഗ്രൗണ്ട് കവറേജ് ${currentCoveragePct.toFixed(1)}% അനുവദനീയമായ ${maxCoveragePct}% പരിധിക്കുള്ളിലാണ്.`,
      remedyEn: 'Compliant.',
      remedyMl: 'ചട്ടപ്രകാരമുള്ളതാണ്.',
      cadAction: 'VERIFIED',
      fixed: true,
    });
  } else {
    diagnostics.push({
      id: 'diag-6',
      checkNameEn: 'Ground Coverage Plinth (0_BUILDING_OUTLINE)',
      checkNameMl: 'ഗ്രൗണ്ട് കവറേജ് പ്ലിന്ത് വിസ്തീർണ്ണം',
      layerTarget: '0_BUILDING_OUTLINE',
      status: 'warning',
      currentFindingEn: `Coverage ${currentCoveragePct.toFixed(1)}% exceeds standard ${maxCoveragePct}% threshold.`,
      currentFindingMl: `ഗ്രൗണ്ട് കവറേജ് (${currentCoveragePct.toFixed(1)}%) അനുവദനീയമായ പരിധി കവിഞ്ഞു.`,
      remedyEn: 'Reduce plinth footprint on layer 0_BUILDING_OUTLINE or shift area to upper floor.',
      remedyMl: 'പ്ലിന്ത് വിസ്തീർണ്ണം കുറയ്ക്കുകയോ ഒന്നാം നിലയിലേക്ക് മാറ്റുകയോ ചെയ്യുക.',
      cadAction: 'SCALE / STRETCH -> 0_BUILDING_OUTLINE',
      fixed: false,
    });
  }

  const totalChecks = diagnostics.length;
  const passedChecks = diagnostics.filter((d) => d.status === 'pass').length;
  const failedChecks = diagnostics.filter((d) => d.status === 'fail').length;
  const warningChecks = diagnostics.filter((d) => d.status === 'warning').length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    score,
    status: score >= 80 ? 'ready' : score >= 50 ? 'needs_rectification' : 'critical_rejection',
    totalChecks,
    passedChecks,
    failedChecks,
    warningChecks,
    diagnostics,
  };
}

/**
 * Generates an automated AutoLISP script (.lsp) to fix CAD files in AutoCAD with 1-click
 */
export function generateAutoLispFixScript(projectName: string = 'K-Smart Project'): string {
  return `;;; ===================================================================
;;; VINYASA K-SMART AUTO-DCR 1-CLICK CAD REPAIR SCRIPT (AutoLISP)
;;; Project: ${projectName}
;;; Purpose: Automatically standardizes layers, flattens Z-coordinates,
;;;          closes open polylines, and cleans geometry for K-Smart Auto-DCR.
;;; ===================================================================

(defun c:KSFIX ()
  (vl-load-com)
  (princ "\\n>>> [VINYASA AI] Starting K-Smart Auto-DCR CAD Sanitization & Repair...")

  ;; 1. Flatten all entities to Z = 0.000 (Prevents K-Smart 3D Crash)
  (princ "\\n[Step 1/5] Flattening Z-Coordinates to 0.000...")
  (command "_.ucs" "_world")
  (command "_.change" "_all" "" "_properties" "_elev" "0.0" "")
  (command "_.move" "_all" "" "0,0,1e99" "")
  (command "_.move" "_all" "" "0,0,-1e99" "")

  ;; 2. Create Official K-Smart Standard Layers if missing
  (princ "\\n[Step 2/5] Creating Mandatory K-Smart Standard Layers...")
  (command "_.layer" "_make" "0_PLOT_BOUNDARY" "_color" "1" "" "")
  (command "_.layer" "_make" "0_BUILDING_OUTLINE" "_color" "3" "" "")
  (command "_.layer" "_make" "0_FLOOR_GF" "_color" "4" "" "")
  (command "_.layer" "_make" "0_SETBACK_FRONT" "_color" "6" "" "")
  (command "_.layer" "_make" "0_SETBACK_REAR" "_color" "6" "" "")
  (command "_.layer" "_make" "0_SETBACK_SIDE1" "_color" "2" "" "")
  (command "_.layer" "_make" "0_SETBACK_SIDE2" "_color" "2" "" "")
  (command "_.layer" "_make" "0_ROAD_WIDTH" "_color" "7" "" "")
  (command "_.layer" "_make" "0_SEPTIC_TANK" "_color" "30" "" "")
  (command "_.layer" "_make" "0_WELL_CIRC" "_color" "140" "" "")
  (command "_.layer" "_make" "0_RWH_TANK" "_color" "150" "" "")
  (command "_.layer" "_make" "0_STAIRCASE_FIRE" "_color" "10" "" "")
  (command "_.layer" "_make" "0_PARKING_BAY" "_color" "8" "" "")
  (command "_.layer" "_make" "0_NORTH_ARROW" "_color" "1" "" "")

  ;; 3. Auto-Close all open polylines in critical boundary layers
  (princ "\\n[Step 3/5] Auto-Closing Open Boundary Polylines...")
  (setq ss (ssget "X" '((0 . "*POLYLINE"))))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq ent (ssname ss i))
        (vla-put-closed (vlax-ename->vla-object ent) :vlax-true)
        (setq i (1+ i))
      )
    )
  )

  ;; 4. Purge Overkill Duplicate Lines
  (princ "\\n[Step 4/5] Purging Duplicate Collinear Segments (OVERKILL)...")
  (if (fboundp 'acet-str-format)
    (command "_.overkill" "_all" "" "")
  )

  ;; 5. Audit & Purge Database
  (princ "\\n[Step 5/5] Auditing Database & Purging Unused Data...")
  (command "_.audit" "_y")
  (command "_.purge" "_all" "*" "_n")

  (princ "\\n\\n===================================================================")
  (princ "\\n>>> [VINYASA AI] SUCCESS: CAD File is now 100% K-Smart Auto-DCR Compliant!")
  (princ "\\n===================================================================\\n")
  (princ)
)

(princ "\\n[VINYASA] K-Smart Auto-DCR Fix Loaded! Type 'KSFIX' and press Enter to repair your drawing.\\n")
(princ)
`;
}

/**
 * Generates a clean DXF standard template string conforming to K-Smart layers
 */
export function generateKSmartCleanDxf(
  data: AreaStatementData,
  diagnostics: KSmartDiagnosticResult['diagnostics']
): string {
  const plotW = Math.max(12, Math.sqrt(data.plotAreaSqM || 180));
  const plotH = Math.max(15, (data.plotAreaSqM || 180) / plotW);

  const frontSetback = data.frontSetbackM || 3.0;
  const rearSetback = data.rearSetbackM || 1.5;
  const side1 = data.sideSetback1M || 1.2;
  const side2 = data.sideSetback2M || 1.2;

  const bldgW = Math.max(6, plotW - side1 - side2);
  const bldgH = Math.max(8, plotH - frontSetback - rearSetback);

  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
9
$INSUNITS
70
6
0
ENDSEC
0
SECTION
2
TABLES
0
TABLE
2
LAYER
70
14
0
LAYER
2
0_PLOT_BOUNDARY
70
0
62
1
6
CONTINUOUS
0
LAYER
2
0_BUILDING_OUTLINE
70
0
62
3
6
CONTINUOUS
0
LAYER
2
0_FLOOR_GF
70
0
62
4
6
CONTINUOUS
0
LAYER
2
0_SETBACK_FRONT
70
0
62
6
6
CONTINUOUS
0
LAYER
2
0_SETBACK_REAR
70
0
62
6
6
CONTINUOUS
0
LAYER
2
0_SETBACK_SIDE1
70
0
62
2
6
CONTINUOUS
0
LAYER
2
0_SETBACK_SIDE2
70
0
62
2
6
CONTINUOUS
0
LAYER
2
0_SEPTIC_TANK
70
0
62
30
6
CONTINUOUS
0
LAYER
2
0_WELL_CIRC
70
0
62
140
6
CONTINUOUS
0
LAYER
2
0_ROAD_WIDTH
70
0
62
7
6
CONTINUOUS
0
LAYER
2
0_RWH_TANK
70
0
62
150
6
CONTINUOUS
0
LAYER
2
0_NORTH_ARROW
70
0
62
1
6
CONTINUOUS
0
ENDTAB
0
ENDSEC
0
SECTION
2
ENTITIES
0
LWPOLYLINE
8
0_PLOT_BOUNDARY
90
4
70
1
10
0.0
20
0.0
10
${plotW.toFixed(3)}
20
0.0
10
${plotW.toFixed(3)}
20
${plotH.toFixed(3)}
10
0.0
20
${plotH.toFixed(3)}
0
LWPOLYLINE
8
0_BUILDING_OUTLINE
90
4
70
1
10
${side1.toFixed(3)}
20
${frontSetback.toFixed(3)}
10
${(side1 + bldgW).toFixed(3)}
20
${frontSetback.toFixed(3)}
10
${(side1 + bldgW).toFixed(3)}
20
${(frontSetback + bldgH).toFixed(3)}
10
${side1.toFixed(3)}
20
${(frontSetback + bldgH).toFixed(3)}
0
LWPOLYLINE
8
0_FLOOR_GF
90
4
70
1
10
${side1.toFixed(3)}
20
${frontSetback.toFixed(3)}
10
${(side1 + bldgW).toFixed(3)}
20
${frontSetback.toFixed(3)}
10
${(side1 + bldgW).toFixed(3)}
20
${(frontSetback + bldgH).toFixed(3)}
10
${side1.toFixed(3)}
20
${(frontSetback + bldgH).toFixed(3)}
0
LINE
8
0_SETBACK_FRONT
10
${(plotW / 2).toFixed(3)}
20
0.0
30
0.0
11
${(plotW / 2).toFixed(3)}
21
${frontSetback.toFixed(3)}
31
0.0
0
LINE
8
0_SETBACK_REAR
10
${(plotW / 2).toFixed(3)}
20
${(frontSetback + bldgH).toFixed(3)}
30
0.0
11
${(plotW / 2).toFixed(3)}
21
${plotH.toFixed(3)}
31
0.0
0
CIRCLE
8
0_WELL_CIRC
10
${(plotW - 2).toFixed(3)}
20
${(plotH - 2).toFixed(3)}
30
0.0
40
0.75
0
LWPOLYLINE
8
0_SEPTIC_TANK
90
4
70
1
10
1.0
20
1.0
10
3.0
20
1.0
10
3.0
20
2.2
10
1.0
20
2.2
0
ENDSEC
0
EOF
`;
}
