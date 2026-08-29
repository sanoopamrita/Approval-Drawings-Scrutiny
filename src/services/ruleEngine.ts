import {
  AreaStatementData,
  ScrutinyCheckResult,
  ScrutinyReportSummary,
  UploadedDrawing,
  JurisdictionType,
  OccupancyGroup,
} from '../types';

export function runKeralaBuildingRulesScrutiny(
  data: AreaStatementData,
  drawings: UploadedDrawing[]
): {
  summary: ScrutinyReportSummary;
  checks: ScrutinyCheckResult[];
} {
  const isKmbr = data.jurisdiction === 'KMBR';
  const checks: ScrutinyCheckResult[] = [];

  // ==========================================
  // 1. DRAWING SUBMISSION & COMPLETENESS CHECKS
  // ==========================================
  const mandatoryDrawings: { category: UploadedDrawing['category']; nameEn: string; nameMl: string; ruleKmbr: string; ruleKpbr: string }[] = [
    { category: 'location_plan', nameEn: 'Location Plan (1:2000 / 1:1000)', nameMl: 'ലൊക്കേഷൻ പ്ലാൻ (1:2000 / 1:1000)', ruleKmbr: 'KMBR Rule 6(2)(a)', ruleKpbr: 'KPBR Rule 6(2)(a)' },
    { category: 'site_plan', nameEn: 'Site Plan with Road, Setbacks & Well (1:400 / 1:200)', nameMl: 'സൈറ്റ് പ്ലാൻ - അതിർത്തി, റോഡ് വീതി, കിണർ, സെറ്റ്ബാക്കുകൾ (1:400 / 1:200)', ruleKmbr: 'KMBR Rule 6(2)(b)', ruleKpbr: 'KPBR Rule 6(2)(b)' },
    { category: 'floor_plans', nameEn: 'Floor Plans of all floors with room dimensions (1:100)', nameMl: 'എല്ലാ നിലകളുടെയും ഫ്ലോർ പ്ലാനുകൾ (1:100)', ruleKmbr: 'KMBR Rule 6(2)(c)', ruleKpbr: 'KPBR Rule 6(2)(c)' },
    { category: 'elevation_plans', nameEn: 'Building Elevations showing total height (1:100)', nameMl: 'ഇലവേഷൻ പ്ലാനുകൾ - ഉയരം സഹിതം (1:100)', ruleKmbr: 'KMBR Rule 6(2)(d)', ruleKpbr: 'KPBR Rule 6(2)(d)' },
    { category: 'section_plans', nameEn: 'Cross Sections through staircase & latrines (1:100)', nameMl: 'ക്രോസ്സ് സെക്ഷൻ പ്ലാനുകൾ - സ്റ്റെയർകേസ് & ടോയ്‌ലറ്റ് (1:100)', ruleKmbr: 'KMBR Rule 6(2)(e)', ruleKpbr: 'KPBR Rule 6(2)(e)' },
    { category: 'service_plans', nameEn: 'Sanitation, Septic Tank & Soak Pit Details (1:100)', nameMl: 'സാനിറ്റേഷൻ, സെപ്റ്റിക് ടാങ്ക് & സോക്ക്പിറ്റ് വിശദാംശങ്ങൾ (1:100)', ruleKmbr: 'KMBR Rule 6(2)(f)', ruleKpbr: 'KPBR Rule 6(2)(f)' },
    { category: 'rwh_solar_plans', nameEn: 'Rainwater Harvesting & Solar Rooftop Layout', nameMl: 'മഴവെള്ള സംഭരണി & സോളാർ റൂഫ്‌ടോപ്പ് ലേഔട്ട്', ruleKmbr: 'KMBR Rule 48 & 49', ruleKpbr: 'KPBR Rule 48 & 49' },
  ];

  if (data.totalBuiltUpAreaSqM > 150 || data.occupancyGroup !== 'A1') {
    mandatoryDrawings.push({
      category: 'parking_plans',
      nameEn: 'Parking Layout & Traffic Circulation Plan (1:200)',
      nameMl: 'പാർക്കിംഗ് ലേഔട്ട് & ഡ്രൈവ്‌വേ പ്ലാൻ (1:200)',
      ruleKmbr: 'KMBR Rule 31',
      ruleKpbr: 'KPBR Rule 31',
    });
  }

  mandatoryDrawings.forEach((req, idx) => {
    const uploaded = drawings.filter((d) => d.category === req.category);
    const hasUploaded = uploaded.length > 0;

    checks.push({
      id: `dwg-${idx}`,
      category: 'drawings',
      ruleNoKmbr: req.ruleKmbr,
      ruleNoKpbr: req.ruleKpbr,
      titleEn: `Mandatory Drawing Submission: ${req.nameEn}`,
      titleMl: `നിർബന്ധിത ഡ്രോയിംഗ് സമർപ്പണം: ${req.nameMl}`,
      requirementEn: `Submission of ${req.nameEn} prepared and signed by Registered Architect/Engineer is mandatory.`,
      requirementMl: `രജിസ്റ്റർ ചെയ്ത ആർക്കിടെക്റ്റ്/എൻജിനീയർ സാക്ഷ്യപ്പെടുത്തിയ ${req.nameMl} സമർപ്പിക്കേണ്ടത് നിർബന്ധമാണ്.`,
      providedValue: hasUploaded ? `${uploaded.length} Drawing(s) Uploaded (${uploaded.map((u) => u.name).join(', ')})` : 'Not Uploaded',
      requiredValue: '1 or more compliant drawing sheets',
      status: hasUploaded ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: hasUploaded
        ? `Successfully uploaded ${uploaded.length} file(s) for ${req.nameEn}. Scale and boundary verification applied.`
        : `Missing ${req.nameEn}. Permit application cannot be approved under Rule 6 without this plan.`,
      technicalNoteMl: hasUploaded
        ? `${req.nameMl} ഡ്രോയിംഗ് അപ്‌ലോഡ് ചെയ്തിട്ടുണ്ട്. സ്കെയിലും അനുബന്ധ വിവരങ്ങളും ലഭ്യമാണ്.`
        : `${req.nameMl} അപ്‌ലോഡ് ചെയ്തിട്ടില്ല. ചട്ടം 6 പ്രകാരം ഈ ഡ്രോയിംഗ് ഇല്ലാതെ പെർമിറ്റ് അപേക്ഷ പാസ്സാക്കാൻ കഴിയില്ല.`,
      rectificationAdviceEn: hasUploaded ? undefined : `Upload the architectural drawing for ${req.nameEn} in PDF, DWG or image format with valid scale.`,
      rectificationAdviceMl: hasUploaded ? undefined : `കൃത്യമായ സ്കെയിലിൽ തയ്യാറാക്കിയ ${req.nameMl} ഡ്രോയിംഗ് അപ്‌ലോഡ് ചെയ്യുക.`,
    });
  });

  // ==========================================
  // 2. ACCESS ROAD WIDTH (Rule 22 KMBR / Rule 23 KPBR)
  // ==========================================
  let minRequiredRoadWidthM = 1.2;
  if (data.occupancyGroup === 'A1') {
    if (data.totalBuiltUpAreaSqM <= 300) {
      minRequiredRoadWidthM = isKmbr ? 1.2 : 1.2; // Pedestrian access ok for <= 300 sq.m in small houses, 3.0m motorable
    } else if (data.totalBuiltUpAreaSqM <= 1000) {
      minRequiredRoadWidthM = isKmbr ? 3.6 : 3.0;
    } else {
      minRequiredRoadWidthM = isKmbr ? 5.0 : 4.5;
    }
  } else if (data.occupancyGroup === 'F' || data.occupancyGroup === 'E') {
    minRequiredRoadWidthM = data.totalBuiltUpAreaSqM > 300 ? (isKmbr ? 6.0 : 5.0) : 3.6;
  } else if (data.occupancyGroup === 'D' || data.occupancyGroup === 'C') {
    minRequiredRoadWidthM = isKmbr ? 7.0 : 6.0;
  } else if (data.occupancyGroup === 'G1' || data.occupancyGroup === 'G2' || data.occupancyGroup === 'H') {
    minRequiredRoadWidthM = isKmbr ? 7.0 : 6.0;
  }

  // High rise road width override
  if (data.buildingHeightM > 16) {
    minRequiredRoadWidthM = Math.max(minRequiredRoadWidthM, isKmbr ? 10.0 : 8.0);
  }

  const roadPass = data.roadAccessWidthM >= minRequiredRoadWidthM;
  checks.push({
    id: 'road-access-width',
    category: 'access_road',
    ruleNoKmbr: 'KMBR 2019 Rule 22',
    ruleNoKpbr: 'KPBR 2019 Rule 23',
    titleEn: 'Access Road Width to the Plot',
    titleMl: 'പ്ലോട്ടിലേക്കുള്ള വഴിയുടെ വീതി (Access Road Width)',
    requirementEn: `Minimum clear access street/road width of ${minRequiredRoadWidthM.toFixed(1)}m required for ${data.occupancyGroup} occupancy with ${data.totalBuiltUpAreaSqM.toFixed(1)} sq.m built-up area.`,
    requirementMl: `${data.occupancyGroup} വിഭാഗം കെട്ടിടത്തിന് (${data.totalBuiltUpAreaSqM.toFixed(1)} ച.മീ.) പ്ലോട്ടിലേക്ക് കുറഞ്ഞത് ${minRequiredRoadWidthM.toFixed(1)} മീറ്റർ വഴി വീതി ആവശ്യമാണ്.`,
    providedValue: `${data.roadAccessWidthM.toFixed(2)} m`,
    requiredValue: `≥ ${minRequiredRoadWidthM.toFixed(2)} m`,
    status: roadPass ? 'pass' : 'fail',
    severity: 'critical',
    technicalNoteEn: roadPass
      ? `Provided frontage road width of ${data.roadAccessWidthM}m satisfies minimum access requirement (${minRequiredRoadWidthM}m).`
      : `Access road is only ${data.roadAccessWidthM}m which is deficient by ${(minRequiredRoadWidthM - data.roadAccessWidthM).toFixed(2)}m. Violation under Access Rules.`,
    technicalNoteMl: roadPass
      ? `നൽകിയിട്ടുള്ള വഴി വീതി (${data.roadAccessWidthM} മീറ്റർ) ആവശ്യമായ മിനിമം വീതിയേക്കാൾ (${minRequiredRoadWidthM} മീറ്റർ) കൂടുതലാണ്.`
      : `നൽകിയിട്ടുള്ള വഴി വീതി (${data.roadAccessWidthM} മീറ്റർ) അപര്യാപ്തമാണ്. കുറഞ്ഞത് ${minRequiredRoadWidthM} മീറ്റർ വീതി വേണം.`,
    rectificationAdviceEn: roadPass ? undefined : `Acquire road widening setback, produce road surrender deed or reduce building built-up area/occupancy classification.`,
    rectificationAdviceMl: roadPass ? undefined : `വഴിയുടെ വീതി കൂട്ടുകയോ അല്ലെങ്കിൽ ബിൽഡിംഗ് ഏരിയ കുറച്ച് അനുയോജ്യമായ കാറ്റഗറിയിലേക്ക് മാറ്റുകയോ ചെയ്യുക.`,
  });

  // ==========================================
  // 3. COVERAGE AND FLOOR AREA RATIO (FAR) (Rule 29 / Table 2 & 3)
  // ==========================================
  let maxPermissibleCoveragePercent = 60;
  let permissibleFarWithoutFee = 3.0;
  let maxPermissibleFarWithFee = 4.0;

  switch (data.occupancyGroup) {
    case 'A1':
      maxPermissibleCoveragePercent = isKmbr ? 60 : 65;
      permissibleFarWithoutFee = isKmbr ? 3.0 : 2.75;
      maxPermissibleFarWithFee = isKmbr ? 4.0 : 3.5;
      break;
    case 'A2':
      maxPermissibleCoveragePercent = 50;
      permissibleFarWithoutFee = 2.5;
      maxPermissibleFarWithFee = 3.5;
      break;
    case 'B':
      maxPermissibleCoveragePercent = 40;
      permissibleFarWithoutFee = 1.5;
      maxPermissibleFarWithFee = 2.0;
      break;
    case 'C':
      maxPermissibleCoveragePercent = 40;
      permissibleFarWithoutFee = 1.5;
      maxPermissibleFarWithFee = 2.5;
      break;
    case 'D':
      maxPermissibleCoveragePercent = 40;
      permissibleFarWithoutFee = 1.0;
      maxPermissibleFarWithFee = 1.5;
      break;
    case 'E':
      maxPermissibleCoveragePercent = 50;
      permissibleFarWithoutFee = 2.0;
      maxPermissibleFarWithFee = 3.0;
      break;
    case 'F':
      maxPermissibleCoveragePercent = 60;
      permissibleFarWithoutFee = isKmbr ? 2.5 : 2.25;
      maxPermissibleFarWithFee = isKmbr ? 3.5 : 3.0;
      break;
    case 'G1':
    case 'G2':
      maxPermissibleCoveragePercent = 50;
      permissibleFarWithoutFee = 1.5;
      maxPermissibleFarWithFee = 2.0;
      break;
    case 'H':
      maxPermissibleCoveragePercent = 60;
      permissibleFarWithoutFee = 1.5;
      maxPermissibleFarWithFee = 2.0;
      break;
    case 'I':
      maxPermissibleCoveragePercent = 40;
      permissibleFarWithoutFee = 1.0;
      maxPermissibleFarWithFee = 1.0;
      break;
  }

  // Small plot exemption: coverage up to 75% for small plots <= 125 sq.m
  if (data.plotType === 'small_plot' || data.plotAreaSqM <= 125) {
    maxPermissibleCoveragePercent = Math.max(maxPermissibleCoveragePercent, 75);
  }

  const providedCoveragePercent = data.plotAreaSqM > 0 ? (data.groundCoverageSqM / data.plotAreaSqM) * 100 : 0;
  const coveragePass = providedCoveragePercent <= maxPermissibleCoveragePercent;

  checks.push({
    id: 'ground-coverage',
    category: 'coverage_far',
    ruleNoKmbr: 'KMBR 2019 Rule 29 / Table 2',
    ruleNoKpbr: 'KPBR 2019 Rule 29 / Table 2',
    titleEn: 'Maximum Ground Coverage Percentage',
    titleMl: 'പരമാവധി ഗ്രൗണ്ട് കവറേജ് ശതമാനം (Ground Coverage)',
    requirementEn: `Maximum ground coverage allowed for ${data.occupancyGroup} is ${maxPermissibleCoveragePercent}%. Max permissible ground footprint = ${((data.plotAreaSqM * maxPermissibleCoveragePercent) / 100).toFixed(2)} sq.m.`,
    requirementMl: `${data.occupancyGroup} കെട്ടിടത്തിന് പ്ലോട്ടിൽ അനുവദനീയമായ പരമാവധി ഗ്രൗണ്ട് കവറേജ് ${maxPermissibleCoveragePercent}% ആണ് (${((data.plotAreaSqM * maxPermissibleCoveragePercent) / 100).toFixed(2)} ച.മീ.).`,
    providedValue: `${providedCoveragePercent.toFixed(2)}% (${data.groundCoverageSqM.toFixed(2)} sq.m)`,
    requiredValue: `≤ ${maxPermissibleCoveragePercent}%`,
    status: coveragePass ? 'pass' : 'fail',
    severity: 'critical',
    technicalNoteEn: coveragePass
      ? `Provided ground coverage of ${providedCoveragePercent.toFixed(2)}% is within the permissible limit of ${maxPermissibleCoveragePercent}%.`
      : `Excess ground coverage of ${(providedCoveragePercent - maxPermissibleCoveragePercent).toFixed(2)}% (${(data.groundCoverageSqM - (data.plotAreaSqM * maxPermissibleCoveragePercent) / 100).toFixed(2)} sq.m excess). Exceeds mandatory limit.`,
    technicalNoteMl: coveragePass
      ? `നൽകിയിട്ടുള്ള ഗ്രൗണ്ട് കവറേജ് (${providedCoveragePercent.toFixed(2)}%) അനുവദനീയമായ പരിധിക്കുള്ളിലാണ് (${maxPermissibleCoveragePercent}%).`
      : `ഗ്രൗണ്ട് കവറേജ് അനുവദനീയമായ പരിധിയേക്കാൾ ${(providedCoveragePercent - maxPermissibleCoveragePercent).toFixed(2)}% അധികമാണ്. ഗ്രൗണ്ട് ഫ്ലോർ വിസ്തീർണ്ണം കുറയ്ക്കണം.`,
    rectificationAdviceEn: coveragePass ? undefined : `Reduce ground floor plinth footprint by ${(data.groundCoverageSqM - (data.plotAreaSqM * maxPermissibleCoveragePercent) / 100).toFixed(2)} sq.m by moving area to upper floors.`,
    rectificationAdviceMl: coveragePass ? undefined : `ഗ്രൗണ്ട് ഫ്ലോർ വിസ്തീർണ്ണം കുറച്ച് മുകൾനിലകളിലേക്ക് മാറ്റുക.`,
  });

  // FAR Calculation
  const providedFar = data.plotAreaSqM > 0 ? data.totalFloorAreaSqM / data.plotAreaSqM : 0;
  let farStatus: ScrutinyCheckResult['status'] = 'pass';
  let farSeverity: ScrutinyCheckResult['severity'] = 'info';
  let farNoteEn = '';
  let farNoteMl = '';

  if (providedFar <= permissibleFarWithoutFee) {
    farStatus = 'pass';
    farSeverity = 'info';
    farNoteEn = `Provided FAR of ${providedFar.toFixed(3)} is within free permissible FAR (${permissibleFarWithoutFee}). No additional FAR fee required.`;
    farNoteMl = `നൽകിയിട്ടുള്ള FAR (${providedFar.toFixed(3)}) ഫീസ് ഇല്ലാതെ അനുവദനീയമായ പരിധിക്ക് (${permissibleFarWithoutFee}) ഉള്ളിലാണ്. അഡീഷണൽ ഫീസ് ആവശ്യമില്ല.`;
  } else if (providedFar <= maxPermissibleFarWithFee) {
    farStatus = 'warning';
    farSeverity = 'medium';
    farNoteEn = `Provided FAR of ${providedFar.toFixed(3)} exceeds free limit (${permissibleFarWithoutFee}) but is within max purchasable limit (${maxPermissibleFarWithFee}). Additional FAR fee payable to ${data.jurisdiction === 'KMBR' ? 'Municipality' : 'Panchayat'}.`;
    farNoteMl = `നൽകിയിട്ടുള്ള FAR (${providedFar.toFixed(3)}) സാധാരണ പരിധിയേക്കാൾ (${permissibleFarWithoutFee}) കൂടുതലാണ്. എങ്കിലും അഡീഷണൽ ഫീസ് അടച്ച് പരമാവധി ${maxPermissibleFarWithFee} വരെ അനുവദിക്കാം.`;
  } else {
    farStatus = 'fail';
    farSeverity = 'critical';
    farNoteEn = `Provided FAR of ${providedFar.toFixed(3)} strictly violates maximum permissible FAR of ${maxPermissibleFarWithFee}. Illegal floor area of ${(data.totalFloorAreaSqM - data.plotAreaSqM * maxPermissibleFarWithFee).toFixed(2)} sq.m.`;
    farNoteMl = `നൽകിയിട്ടുള്ള FAR (${providedFar.toFixed(3)}) അനുവദനീയമായ പരമാവധി FAR-നേക്കാൾ (${maxPermissibleFarWithFee}) കൂടുതലാണ്. ${(data.totalFloorAreaSqM - data.plotAreaSqM * maxPermissibleFarWithFee).toFixed(2)} ച.മീറ്റർ വിസ്തീർണ്ണം കുറയ്ക്കണം.`;
  }

  checks.push({
    id: 'floor-area-ratio',
    category: 'coverage_far',
    ruleNoKmbr: 'KMBR 2019 Rule 29 / Table 3',
    ruleNoKpbr: 'KPBR 2019 Rule 29 / Table 3',
    titleEn: 'Floor Area Ratio (FAR) Compliance',
    titleMl: 'ഫ്ലോർ ഏരിയ റേഷ്യോ (FAR) പരിശോധന',
    requirementEn: `Permissible Base FAR: ${permissibleFarWithoutFee} | Max with Fee: ${maxPermissibleFarWithFee} for ${data.occupancyGroup} Occupancy.`,
    requirementMl: `അനുവദനീയമായ അടിസ്ഥാന FAR: ${permissibleFarWithoutFee} | അഡീഷണൽ ഫീസ് സഹിതം പരമാവധി FAR: ${maxPermissibleFarWithFee}.`,
    providedValue: `${providedFar.toFixed(3)} (${data.totalFloorAreaSqM.toFixed(2)} sq.m)`,
    requiredValue: `Base ≤ ${permissibleFarWithoutFee} | Max ≤ ${maxPermissibleFarWithFee}`,
    status: farStatus,
    severity: farSeverity,
    technicalNoteEn: farNoteEn,
    technicalNoteMl: farNoteMl,
    rectificationAdviceEn: farStatus === 'fail' ? `Reduce total floor area by ${(data.totalFloorAreaSqM - data.plotAreaSqM * maxPermissibleFarWithFee).toFixed(2)} sq.m to reach permissible FAR of ${maxPermissibleFarWithFee}.` : undefined,
    rectificationAdviceMl: farStatus === 'fail' ? `കെട്ടിടത്തിന്റെ ആകെ വിസ്തീർണ്ണത്തിൽ നിന്ന് ${(data.totalFloorAreaSqM - data.plotAreaSqM * maxPermissibleFarWithFee).toFixed(2)} ച.മീറ്റർ കുറയ്ക്കുക.` : undefined,
  });

  // ==========================================
  // 4. OPEN SPACES / SETBACKS (Rule 27 & 28 / Table 4 & 5)
  // ==========================================
  let minFrontSetback = 3.0;
  let minRearSetback = 1.5;
  let minSide1Setback = 1.2;
  let minSide2Setback = 1.0;

  const isSmallPlot = data.plotType === 'small_plot' || data.plotAreaSqM <= 125;

  if (isSmallPlot && data.occupancyGroup === 'A1') {
    // Small plot concessions (Rule 60 KMBR / Rule 62 KPBR)
    minFrontSetback = 1.8;
    minRearSetback = 1.0;
    minSide1Setback = 0.9;
    minSide2Setback = 0.6;
  } else if (data.occupancyGroup === 'A1') {
    if (data.buildingHeightM <= 7) {
      minFrontSetback = 3.0;
      minRearSetback = 1.5;
      minSide1Setback = 1.2;
      minSide2Setback = 1.0;
    } else if (data.buildingHeightM <= 10) {
      minFrontSetback = 3.0;
      minRearSetback = 2.0;
      minSide1Setback = 1.5;
      minSide2Setback = 1.2;
    } else if (data.buildingHeightM <= 16) {
      minFrontSetback = 5.0;
      minRearSetback = 3.0;
      minSide1Setback = 2.0;
      minSide2Setback = 2.0;
    } else {
      // High rise >16m: 5m base + 1m for every 3m height over 16m
      const extraHeight = data.buildingHeightM - 16;
      const extraSetback = Math.ceil(extraHeight / 3);
      minFrontSetback = Math.min(12, 5.0 + extraSetback);
      minRearSetback = Math.min(10, 5.0 + extraSetback);
      minSide1Setback = Math.min(8, 5.0 + extraSetback);
      minSide2Setback = Math.min(8, 5.0 + extraSetback);
    }
  } else if (data.occupancyGroup === 'F' || data.occupancyGroup === 'E') {
    // Commercial / Office
    minFrontSetback = isKmbr ? 5.0 : 4.5;
    minRearSetback = 2.0;
    minSide1Setback = 1.5;
    minSide2Setback = 1.5;
  } else if (data.occupancyGroup === 'D' || data.occupancyGroup === 'C' || data.occupancyGroup === 'B') {
    // Assembly / Hospital / Educational
    minFrontSetback = 6.0;
    minRearSetback = 3.0;
    minSide1Setback = 3.0;
    minSide2Setback = 3.0;
  } else if (data.occupancyGroup === 'G1' || data.occupancyGroup === 'G2' || data.occupancyGroup === 'H' || data.occupancyGroup === 'I') {
    // Industrial & Warehouse
    minFrontSetback = 7.5;
    minRearSetback = 3.0;
    minSide1Setback = 3.0;
    minSide2Setback = 3.0;
  }

  // Front Setback Check
  const frontPass = data.frontSetbackM >= minFrontSetback;
  checks.push({
    id: 'setback-front',
    category: 'setbacks',
    ruleNoKmbr: isSmallPlot ? 'KMBR 2019 Rule 60' : 'KMBR 2019 Rule 27 / Table 4',
    ruleNoKpbr: isSmallPlot ? 'KPBR 2019 Rule 62' : 'KPBR 2019 Rule 25 / Table 4',
    titleEn: 'Front Open Space / Front Setback (FOS)',
    titleMl: 'മുൻവശത്തെ തുറസ്സായ സ്ഥലം / ഫ്രണ്ട് സെറ്റ്ബാക്ക് (Front Setback)',
    requirementEn: `Minimum front yard of ${minFrontSetback.toFixed(2)}m is required for building height of ${data.buildingHeightM}m and ${data.occupancyGroup} occupancy.`,
    requirementMl: `${data.buildingHeightM} മീറ്റർ ഉയരമുള്ള ${data.occupancyGroup} കെട്ടിടത്തിന് മുൻവശത്ത് കുറഞ്ഞത് ${minFrontSetback.toFixed(2)} മീറ്റർ സെറ്റ്ബാക്ക് വേണം.`,
    providedValue: `${data.frontSetbackM.toFixed(2)} m`,
    requiredValue: `≥ ${minFrontSetback.toFixed(2)} m`,
    status: frontPass ? 'pass' : 'fail',
    severity: 'critical',
    technicalNoteEn: frontPass
      ? `Front setback of ${data.frontSetbackM}m complies with the mandatory minimum (${minFrontSetback}m).`
      : `Front setback of ${data.frontSetbackM}m is deficient by ${(minFrontSetback - data.frontSetbackM).toFixed(2)}m. Building must be pushed back from the road boundary.`,
    technicalNoteMl: frontPass
      ? `മുൻവശത്തെ സെറ്റ്ബാക്ക് (${data.frontSetbackM} മീറ്റർ) ചട്ടപ്രകാരമുള്ള മിനിമം ദൂരത്തേക്കാൾ (${minFrontSetback} മീറ്റർ) ശരിയാണ്.`
      : `മുൻവശത്തെ സെറ്റ്ബാക്ക് (${data.frontSetbackM} മീറ്റർ) അപര്യാപ്തമാണ്. ${(minFrontSetback - data.frontSetbackM).toFixed(2)} മീറ്റർ കുറവാണ്. കെട്ടിടം റോഡ് അതിർത്തിയിൽ നിന്നും പുറകോട്ട് മാറ്റണം.`,
    rectificationAdviceEn: frontPass ? undefined : `Shift building line backwards by ${(minFrontSetback - data.frontSetbackM).toFixed(2)}m to maintain clear ${minFrontSetback}m front yard.`,
    rectificationAdviceMl: frontPass ? undefined : `കെട്ടിടം ${(minFrontSetback - data.frontSetbackM).toFixed(2)} മീറ്റർ കൂടി പുറകോട്ട് മാറ്റി വരയ്ക്കുക.`,
  });

  // Rear Setback Check
  const rearPass = data.rearSetbackM >= minRearSetback;
  checks.push({
    id: 'setback-rear',
    category: 'setbacks',
    ruleNoKmbr: isSmallPlot ? 'KMBR 2019 Rule 60' : 'KMBR 2019 Rule 27 / Table 4',
    ruleNoKpbr: isSmallPlot ? 'KPBR 2019 Rule 62' : 'KPBR 2019 Rule 25 / Table 4',
    titleEn: 'Rear Open Space / Rear Setback (ROS)',
    titleMl: 'പിൻവശത്തെ തുറസ്സായ സ്ഥലം / റിയർ സെറ്റ്ബാക്ക് (Rear Setback)',
    requirementEn: `Minimum rear open yard of ${minRearSetback.toFixed(2)}m required.`,
    requirementMl: `പിൻവശത്ത് കുറഞ്ഞത് ${minRearSetback.toFixed(2)} മീറ്റർ സെറ്റ്ബാക്ക് ഉണ്ടായിരിക്കണം.`,
    providedValue: `${data.rearSetbackM.toFixed(2)} m`,
    requiredValue: `≥ ${minRearSetback.toFixed(2)} m`,
    status: rearPass ? 'pass' : 'fail',
    severity: 'critical',
    technicalNoteEn: rearPass
      ? `Rear setback of ${data.rearSetbackM}m complies with mandatory ${minRearSetback}m.`
      : `Rear setback of ${data.rearSetbackM}m violates minimum clearance of ${minRearSetback}m by ${(minRearSetback - data.rearSetbackM).toFixed(2)}m.`,
    technicalNoteMl: rearPass
      ? `പിൻവശത്തെ സെറ്റ്ബാക്ക് (${data.rearSetbackM} മീറ്റർ) അനുവദനീയമാണ്.`
      : `പിൻവശത്തെ സെറ്റ്ബാക്ക് (${data.rearSetbackM} മീറ്റർ) ആവശ്യമായ ദൂരത്തേക്കാൾ ${(minRearSetback - data.rearSetbackM).toFixed(2)} മീറ്റർ കുറവാണ്.`,
    rectificationAdviceEn: rearPass ? undefined : `Increase rear open space to minimum ${minRearSetback}m.`,
    rectificationAdviceMl: rearPass ? undefined : `പിൻവശത്തെ അതിർത്തിയിൽ നിന്നുള്ള അകലം ${minRearSetback} മീറ്ററായി വർദ്ധിപ്പിക്കുക.`,
  });

  // Side Setback 1 Check (Left)
  const side1Pass = data.sideSetback1M >= minSide1Setback;
  checks.push({
    id: 'setback-side1',
    category: 'setbacks',
    ruleNoKmbr: isSmallPlot ? 'KMBR 2019 Rule 60' : 'KMBR 2019 Rule 27 / Table 4',
    ruleNoKpbr: isSmallPlot ? 'KPBR 2019 Rule 62' : 'KPBR 2019 Rule 25 / Table 4',
    titleEn: 'Side Open Space 1 (Side 1 / Left Setback)',
    titleMl: 'വശങ്ങളിലെ തുറസ്സായ സ്ഥലം 1 (Side 1 Setback)',
    requirementEn: `Minimum side open space 1 of ${minSide1Setback.toFixed(2)}m required.`,
    requirementMl: `ഒരു വശത്ത് കുറഞ്ഞത് ${minSide1Setback.toFixed(2)} മീറ്റർ സെറ്റ്ബാക്ക് വേണം.`,
    providedValue: `${data.sideSetback1M.toFixed(2)} m`,
    requiredValue: `≥ ${minSide1Setback.toFixed(2)} m`,
    status: side1Pass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: side1Pass
      ? `Side 1 setback of ${data.sideSetback1M}m satisfies rule (${minSide1Setback}m).`
      : `Side 1 setback of ${data.sideSetback1M}m is deficient by ${(minSide1Setback - data.sideSetback1M).toFixed(2)}m.`,
    technicalNoteMl: side1Pass
      ? `സൈഡ് 1 സെറ്റ്ബാക്ക് (${data.sideSetback1M} മീറ്റർ) ആവശ്യമായ മിനിമം ദൂരത്തേക്കാൾ ശരിയാണ്.`
      : `സൈഡ് 1 സെറ്റ്ബാക്ക് (${data.sideSetback1M} മീറ്റർ) കുറവാണ്. ${(minSide1Setback - data.sideSetback1M).toFixed(2)} മീറ്റർ കൂട്ടണം.`,
    rectificationAdviceEn: side1Pass ? undefined : `Adjust side boundary clearance to at least ${minSide1Setback}m.`,
    rectificationAdviceMl: side1Pass ? undefined : `വശത്തെ അതിർത്തിയിൽ നിന്നും ${minSide1Setback} മീറ്റർ അകലം പാലിക്കുക.`,
  });

  // Side Setback 2 Check (Right)
  const side2Pass = data.sideSetback2M >= minSide2Setback;
  checks.push({
    id: 'setback-side2',
    category: 'setbacks',
    ruleNoKmbr: isSmallPlot ? 'KMBR 2019 Rule 60' : 'KMBR 2019 Rule 27 / Table 4',
    ruleNoKpbr: isSmallPlot ? 'KPBR 2019 Rule 62' : 'KPBR 2019 Rule 25 / Table 4',
    titleEn: 'Side Open Space 2 (Side 2 / Right Setback)',
    titleMl: 'വശങ്ങളിലെ തുറസ്സായ സ്ഥലം 2 (Side 2 Setback)',
    requirementEn: `Minimum side open space 2 of ${minSide2Setback.toFixed(2)}m required.`,
    requirementMl: `മറ്റേ വശത്ത് കുറഞ്ഞത് ${minSide2Setback.toFixed(2)} മീറ്റർ സെറ്റ്ബാക്ക് വേണം.`,
    providedValue: `${data.sideSetback2M.toFixed(2)} m`,
    requiredValue: `≥ ${minSide2Setback.toFixed(2)} m`,
    status: side2Pass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: side2Pass
      ? `Side 2 setback of ${data.sideSetback2M}m satisfies rule (${minSide2Setback}m).`
      : `Side 2 setback of ${data.sideSetback2M}m is deficient by ${(minSide2Setback - data.sideSetback2M).toFixed(2)}m.`,
    technicalNoteMl: side2Pass
      ? `സൈഡ് 2 സെറ്റ്ബാക്ക് (${data.sideSetback2M} മീറ്റർ) ചട്ടപ്രകാരം അനുവദനീയമാണ്.`
      : `സൈഡ് 2 സെറ്റ്ബാക്ക് (${data.sideSetback2M} മീറ്റർ) അപര്യാപ്തമാണ്. ${(minSide2Setback - data.sideSetback2M).toFixed(2)} മീറ്റർ കുറവാണ്.`,
    rectificationAdviceEn: side2Pass ? undefined : `Adjust side boundary clearance to at least ${minSide2Setback}m.`,
    rectificationAdviceMl: side2Pass ? undefined : `വശത്തെ അതിർത്തിയിൽ നിന്നും ${minSide2Setback} മീറ്റർ അകലം പാലിക്കുക.`,
  });

  // ==========================================
  // 5. BUILDING HEIGHT AND ROAD WIDTH RATIO (Rule 30)
  // ==========================================
  const maxAllowableHeightFromRoad = 1.5 * (data.roadAccessWidthM + data.frontSetbackM);
  const heightPass = data.buildingHeightM <= maxAllowableHeightFromRoad || data.buildingHeightM <= 10;

  checks.push({
    id: 'building-height-road',
    category: 'height_limits',
    ruleNoKmbr: 'KMBR 2019 Rule 30',
    ruleNoKpbr: 'KPBR 2019 Rule 26',
    titleEn: 'Maximum Building Height Restriction based on Road & Setback',
    titleMl: 'റോഡ് വീതിയും സെറ്റ്ബാക്കും അടിസ്ഥാനമാക്കിയുള്ള കെട്ടിട ഉയര പരിധി',
    requirementEn: `Max building height shall not exceed 1.5 × (Street Width + Front Setback) = ${maxAllowableHeightFromRoad.toFixed(2)}m (except standard 2-storey buildings <= 10m).`,
    requirementMl: `കെട്ടിടത്തിന്റെ പരമാവധി ഉയരം 1.5 × (വഴിവീതി + മുൻവശത്തെ സെറ്റ്ബാക്ക്) ആയ ${maxAllowableHeightFromRoad.toFixed(2)} മീറ്ററിൽ കൂടാൻ പാടില്ല.`,
    providedValue: `${data.buildingHeightM.toFixed(2)} m (${data.numberOfFloors} Floors)`,
    requiredValue: `≤ ${Math.max(10, maxAllowableHeightFromRoad).toFixed(2)} m`,
    status: heightPass ? 'pass' : 'fail',
    severity: 'critical',
    technicalNoteEn: heightPass
      ? `Building height of ${data.buildingHeightM}m is within permissible limit based on road width and setback formula.`
      : `Building height of ${data.buildingHeightM}m exceeds maximum permissible height (${maxAllowableHeightFromRoad.toFixed(2)}m). Road is too narrow for this height.`,
    technicalNoteMl: heightPass
      ? `കെട്ടിടത്തിന്റെ ഉയരം (${data.buildingHeightM} മീറ്റർ) റോഡ് വീതിക്ക് ആനുപാതികമായി അനുവദനീയമായ പരിധിക്കുള്ളിലാണ്.`
      : `കെട്ടിടത്തിന്റെ ഉയരം (${data.buildingHeightM} മീറ്റർ) റോഡ് വീതിയനുസരിച്ച് അനുവദനീയമായ പരിധിയേക്കാൾ കൂടുതലാണ്.`,
    rectificationAdviceEn: heightPass ? undefined : `Reduce number of floors/height or increase front setback to satisfy 1.5×(Width + Setback) formula.`,
    rectificationAdviceMl: heightPass ? undefined : `നിലകളുടെ എണ്ണം കുറയ്ക്കുകയോ അല്ലെങ്കിൽ ഫ്രണ്ട് സെറ്റ്ബാക്ക് വർദ്ധിപ്പിക്കുകയോ ചെയ്യുക.`,
  });

  // ==========================================
  // 6. PARKING PROVISIONS (Rule 31 / Table 6)
  // ==========================================
  let requiredCarParking = 0;
  let requiredTwoWheelerParking = 0;

  if (data.occupancyGroup === 'A1') {
    if (data.totalBuiltUpAreaSqM <= 150) {
      requiredCarParking = 0;
      requiredTwoWheelerParking = 0;
    } else if (data.totalBuiltUpAreaSqM <= 250) {
      requiredCarParking = 1;
      requiredTwoWheelerParking = 1;
    } else {
      const extraArea = data.totalBuiltUpAreaSqM - 250;
      requiredCarParking = 1 + Math.ceil(extraArea / 150);
      requiredTwoWheelerParking = Math.ceil(requiredCarParking * 0.5);
    }
  } else if (data.occupancyGroup === 'F') {
    // Commercial: 1 car per 75 sq.m + 1 two-wheeler per 25 sq.m
    requiredCarParking = Math.ceil(data.totalFloorAreaSqM / 75);
    requiredTwoWheelerParking = Math.ceil(data.totalFloorAreaSqM / 25);
  } else if (data.occupancyGroup === 'E') {
    // Office: 1 car per 100 sq.m
    requiredCarParking = Math.ceil(data.totalFloorAreaSqM / 100);
    requiredTwoWheelerParking = Math.ceil(data.totalFloorAreaSqM / 40);
  } else if (data.occupancyGroup === 'D') {
    // Assembly: 1 car per 25 sq.m
    requiredCarParking = Math.ceil(data.totalFloorAreaSqM / 25);
    requiredTwoWheelerParking = Math.ceil(data.totalFloorAreaSqM / 15);
  } else if (data.occupancyGroup === 'C') {
    // Hospital: 1 car per 50 sq.m
    requiredCarParking = Math.ceil(data.totalFloorAreaSqM / 50);
    requiredTwoWheelerParking = Math.ceil(data.totalFloorAreaSqM / 25);
  } else {
    requiredCarParking = Math.ceil(data.totalFloorAreaSqM / 150);
    requiredTwoWheelerParking = Math.ceil(requiredCarParking * 0.5);
  }

  const carParkingPass = data.carParkingProvided >= requiredCarParking;
  checks.push({
    id: 'parking-cars',
    category: 'parking',
    ruleNoKmbr: 'KMBR 2019 Rule 31 / Table 6',
    ruleNoKpbr: 'KPBR 2019 Rule 31 / Table 6',
    titleEn: 'Four-Wheeler / Car Parking Spaces',
    titleMl: 'കാർ പാർക്കിംഗ് സൗകര്യം (Four Wheeler Parking)',
    requirementEn: `Minimum ${requiredCarParking} car parking slot(s) (min 2.5m × 5.0m each) required for ${data.occupancyGroup} with ${data.totalBuiltUpAreaSqM.toFixed(1)} sq.m built-up area.`,
    requirementMl: `${data.occupancyGroup} കെട്ടിടത്തിന് (${data.totalBuiltUpAreaSqM.toFixed(1)} ച.മീ.) കുറഞ്ഞത് ${requiredCarParking} കാർ പാർക്കിംഗ് സ്ലോട്ടുകൾ (ഓരോന്നിനും 2.5m × 5.0m) ആവശ്യമാണ്.`,
    providedValue: `${data.carParkingProvided} Slot(s)`,
    requiredValue: `≥ ${requiredCarParking} Slot(s)`,
    status: carParkingPass ? 'pass' : 'fail',
    severity: requiredCarParking > 0 ? 'critical' : 'info',
    technicalNoteEn: carParkingPass
      ? `Provided ${data.carParkingProvided} car space(s) satisfies the statutory requirement (${requiredCarParking}).`
      : `Deficit of ${requiredCarParking - data.carParkingProvided} car parking space(s). Parking bays must be marked in site plan with 2.5m x 5.0m clear dimension.`,
    technicalNoteMl: carParkingPass
      ? `നൽകിയിട്ടുള്ള ${data.carParkingProvided} കാർ പാർക്കിംഗ് സ്ലോട്ടുകൾ ചട്ടപ്രകാരം പര്യാപ്തമാണ്.`
      : `ആവശ്യമായ പാർക്കിംഗിൽ ${requiredCarParking - data.carParkingProvided} കാർ സ്ലോട്ടുകളുടെ കുറവുണ്ട്. സൈറ്റ് പ്ലാനിൽ മാർക്ക് ചെയ്യണം.`,
    rectificationAdviceEn: carParkingPass ? undefined : `Mark additional ${requiredCarParking - data.carParkingProvided} car parking bay(s) in site/parking plan.`,
    rectificationAdviceMl: carParkingPass ? undefined : `സൈറ്റ് പ്ലാനിൽ ${requiredCarParking - data.carParkingProvided} കാർ പാർക്കിംഗ് സ്ലോട്ട് കൂടി രേഖപ്പെടുത്തുക.`,
  });

  // Disabled / Accessible Parking (Rule 52 / Table 6)
  if (data.totalBuiltUpAreaSqM > 300 || data.occupancyGroup !== 'A1') {
    const requiredDisabledParking = requiredCarParking >= 10 ? Math.ceil(requiredCarParking * 0.05) : (data.occupancyGroup !== 'A1' ? 1 : 0);
    const disabledPass = data.disabledParkingProvided >= requiredDisabledParking;

    checks.push({
      id: 'parking-disabled',
      category: 'parking',
      ruleNoKmbr: 'KMBR 2019 Rule 52',
      ruleNoKpbr: 'KPBR 2019 Rule 52',
      titleEn: 'Accessible Parking for Persons with Disabilities (PwD)',
      titleMl: 'ഭിന്നശേഷിക്കാർക്കായുള്ള പാർക്കിംഗ് (Accessible Parking)',
      requirementEn: `At least ${requiredDisabledParking} designated accessible parking bay (3.6m × 5.0m) close to entrance with barrier-free ramp.`,
      requirementMl: `പ്രവേശന കവാടത്തിന് സമീപം കുറഞ്ഞത് ${requiredDisabledParking} ഭിന്നശേഷി പാർക്കിംഗ് സ്ലോട്ട് (3.6m × 5.0m) റാംപ് സഹിതം നൽകണം.`,
      providedValue: `${data.disabledParkingProvided} Slot(s)`,
      requiredValue: `≥ ${requiredDisabledParking} Slot(s)`,
      status: disabledPass ? 'pass' : 'fail',
      severity: 'high',
      technicalNoteEn: disabledPass
        ? `Dedicated accessible parking space is provided compliant with Rule 52.`
        : `Missing or deficient designated accessible parking bay (min 3.6m x 5.0m). Mandatory under Rights of PwD Act & Building Rules.`,
      technicalNoteMl: disabledPass
        ? `ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് സ്ലോട്ട് ചട്ടപ്രകാരം നൽകിയിട്ടുണ്ട്.`
        : `ഭിന്നശേഷി പാർക്കിംഗ് സ്ലോട്ട് നൽകിയിട്ടില്ല. കുറഞ്ഞത് 1 സ്ലോട്ട് (3.6m x 5.0m) നൽകണം.`,
      rectificationAdviceEn: disabledPass ? undefined : `Designate 1 parking bay of 3.6m width with disabled logo and wheelchair ramp access.`,
      rectificationAdviceMl: disabledPass ? undefined : `റാംപ് പ്രവേശനമുള്ള 3.6m വീതിയുള്ള 1 പാർക്കിംഗ് സ്ലോട്ട് പ്ലാനിൽ അടയാളപ്പെടുത്തുക.`,
    });
  }

  // ==========================================
  // 7. SANITATION, WELL CLEARANCE & RWH (Rule 47, 48, 49)
  // ==========================================
  // Well to Septic Tank Clearance
  if (data.openWellInPlot) {
    const minWellDistM = 7.5; // Mandatory 7.5m in KMBR & KPBR
    const wellDistPass = data.distanceWellToSepticTankM >= minWellDistM && data.distanceWellToSoakPitM >= minWellDistM;

    checks.push({
      id: 'sanitation-well-clearance',
      category: 'sanitation_rwh',
      ruleNoKmbr: 'KMBR 2019 Rule 47 / 77',
      ruleNoKpbr: 'KPBR 2019 Rule 47 / 77',
      titleEn: 'Clearance from Open Well to Septic Tank & Soak Pit',
      titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള കുറഞ്ഞ ദൂരം (Well to Septic Tank Distance)',
      requirementEn: `Mandatory minimum clear distance of 7.50m from open well/drinking water source to septic tank, leach pit, and soak pit.`,
      requirementMl: `കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റും തമ്മിൽ കുറഞ്ഞത് 7.50 മീറ്റർ അകലം ഉണ്ടായിരിക്കണം.`,
      providedValue: `Septic Tank: ${data.distanceWellToSepticTankM.toFixed(2)}m | Soak Pit: ${data.distanceWellToSoakPitM.toFixed(2)}m`,
      requiredValue: `≥ 7.50 m each`,
      status: wellDistPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: wellDistPass
        ? `Water source protection clearance of 7.5m is strictly maintained to septic tank and soak pit.`
        : `Violation of sanitary clearance! Minimum distance to well must be at least 7.50m. Provided distance is deficient. Potential contamination risk.`,
      technicalNoteMl: wellDistPass
        ? `കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ 7.5 മീറ്റർ സുരക്ഷിത അകലം പാലിച്ചിട്ടുണ്ട്.`
        : `ഗുരുതരമായ നിയമലംഘനം! കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ കുറഞ്ഞത് 7.50 മീറ്റർ അകലം വേണം. നിലവിൽ നൽകിയിരിക്കുന്ന അകലം അപര്യാപ്തമാണ്.`,
      rectificationAdviceEn: wellDistPass ? undefined : `Relocate septic tank/soak pit in site plan to ensure >= 7.5m clearance from well or install approved bio-digester plant.`,
      rectificationAdviceMl: wellDistPass ? undefined : `സെപ്റ്റിക് ടാങ്ക് കിണറിൽ നിന്നും കുറഞ്ഞത് 7.5 മീറ്റർ മാറ്റി പുതിയ ലൊക്കേഷനിൽ സ്ഥാപിക്കുക.`,
    });
  }

  // Septic Tank to Boundary
  const septicToBoundaryPass = data.distanceSepticTankToBoundaryM >= 1.2;
  checks.push({
    id: 'sanitation-septic-boundary',
    category: 'sanitation_rwh',
    ruleNoKmbr: 'KMBR 2019 Rule 47(2)',
    ruleNoKpbr: 'KPBR 2019 Rule 47(2)',
    titleEn: 'Clearance from Septic Tank to Plot Boundary',
    titleMl: 'സെപ്റ്റിക് ടാങ്കും പ്ലോട്ട് അതിർത്തിയും തമ്മിലുള്ള അകലം',
    requirementEn: `Septic tank & soak pit shall be located at least 1.20m away from any plot boundary.`,
    requirementMl: `സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും പ്ലോട്ടിന്റെ ഏത് അതിർത്തിയിൽ നിന്നും കുറഞ്ഞത് 1.20 മീറ്റർ അകലെയായിരിക്കണം.`,
    providedValue: `${data.distanceSepticTankToBoundaryM.toFixed(2)} m`,
    requiredValue: `≥ 1.20 m`,
    status: septicToBoundaryPass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: septicToBoundaryPass
      ? `Septic tank boundary clearance of ${data.distanceSepticTankToBoundaryM}m satisfies Rule 47(2) minimum (1.2m).`
      : `Septic tank is only ${data.distanceSepticTankToBoundaryM}m from plot boundary, deficient by ${(1.2 - data.distanceSepticTankToBoundaryM).toFixed(2)}m.`,
    technicalNoteMl: septicToBoundaryPass
      ? `സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്ന് 1.2 മീറ്റർ മാറിയാണ് സ്ഥിതി ചെയ്യുന്നത്.`
      : `സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്ന് 1.20 മീറ്റർ മാറിയിരിക്കണം. നൽകിയിട്ടുള്ള അകലം കുറവാണ്.`,
    rectificationAdviceEn: septicToBoundaryPass ? undefined : `Shift septic tank position to maintain 1.2m clear distance from the plot boundary.`,
    rectificationAdviceMl: septicToBoundaryPass ? undefined : `സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്നും കുറഞ്ഞത് 1.2 മീറ്റർ ഉള്ളിലേക്ക് മാറ്റി സ്ഥാപിക്കുക.`,
  });

  // Rainwater Harvesting Tank Capacity (Rule 48)
  const isRwhMandatory = isKmbr ? data.groundCoverageSqM >= 100 : data.groundCoverageSqM >= 150;
  const requiredRwhCapacityLiters = isRwhMandatory ? Math.ceil(data.groundCoverageSqM * 25) : 0; // 25 Liters per sq.m roof area
  const rwhPass = !isRwhMandatory || data.rwhTankCapacityLiters >= requiredRwhCapacityLiters;

  checks.push({
    id: 'rwh-capacity',
    category: 'sanitation_rwh',
    ruleNoKmbr: 'KMBR 2019 Rule 48',
    ruleNoKpbr: 'KPBR 2019 Rule 48',
    titleEn: 'Rain Water Harvesting (RWH) Tank Storage Capacity',
    titleMl: 'മഴവെള്ള സംഭരണി സംഭരണ ശേഷി (Rainwater Harvesting Tank)',
    requirementEn: isRwhMandatory
      ? `Mandatory minimum RWH storage of 25 Litres per sq.m of roof plinth area = ${requiredRwhCapacityLiters.toLocaleString()} Litres.`
      : `Optional for ground coverage < ${isKmbr ? 100 : 150} sq.m.`,
    requirementMl: isRwhMandatory
      ? `റൂഫ് പ്ലിന്ത് ഏരിയയുടെ ചതുരശ്ര മീറ്ററിന് 25 ലിറ്റർ എന്ന നിരക്കിൽ കുറഞ്ഞത് ${requiredRwhCapacityLiters.toLocaleString()} ലിറ്റർ ശേഷിയുള്ള മഴവെള്ള സംഭരണി നിർബന്ധമാണ്.`
      : `പ്ലിന്ത് ഏരിയ ${isKmbr ? 100 : 150} ച.മീറ്ററിൽ താഴെയായതിനാൽ നിർബന്ധമല്ല.`,
    providedValue: `${data.rwhTankCapacityLiters.toLocaleString()} Litres`,
    requiredValue: isRwhMandatory ? `≥ ${requiredRwhCapacityLiters.toLocaleString()} Litres` : 'Not Mandatory',
    status: rwhPass ? 'pass' : 'fail',
    severity: isRwhMandatory ? 'high' : 'info',
    technicalNoteEn: rwhPass
      ? `Provided RWH tank capacity of ${data.rwhTankCapacityLiters}L meets or exceeds requirement (${requiredRwhCapacityLiters}L).`
      : `Deficit of ${requiredRwhCapacityLiters - data.rwhTankCapacityLiters} Litres in RWH storage capacity. Violation under conservation rules.`,
    technicalNoteMl: rwhPass
      ? `മഴവെള്ള സംഭരണിയുടെ ശേഷി (${data.rwhTankCapacityLiters} ലിറ്റർ) ചട്ടപ്രകാരമുള്ള മിനിമം സംഭരണശേഷിയെക്കാൾ (${requiredRwhCapacityLiters} ലിറ്റർ) ശരിയാണ്.`
      : `മഴവെള്ള സംഭരണി ശേഷിയിൽ ${requiredRwhCapacityLiters - data.rwhTankCapacityLiters} ലിറ്ററിന്റെ കുറവുണ്ട്. സംഭരണി വലിപ്പം കൂട്ടണം.`,
    rectificationAdviceEn: rwhPass ? undefined : `Specify RWH tank with minimum capacity of ${requiredRwhCapacityLiters} Litres in service plan.`,
    rectificationAdviceMl: rwhPass ? undefined : `സർവീസ് പ്ലാനിൽ മഴവെള്ള സംഭരണിയുടെ അളവ് ${requiredRwhCapacityLiters} ലിറ്ററാക്കി ഉയർത്തുക.`,
  });

  // Solar Rooftop (Rule 49)
  const isSolarMandatory = data.totalBuiltUpAreaSqM >= 500 || (data.occupancyGroup === 'F' && data.totalBuiltUpAreaSqM >= 200);
  const requiredSolarKwp = isSolarMandatory ? Math.ceil((data.totalBuiltUpAreaSqM / 500) * 1.0) : 0;
  const solarPass = !isSolarMandatory || data.solarPvCapacityKwp >= requiredSolarKwp;

  checks.push({
    id: 'solar-rooftop',
    category: 'sanitation_rwh',
    ruleNoKmbr: 'KMBR 2019 Rule 49',
    ruleNoKpbr: 'KPBR 2019 Rule 49',
    titleEn: 'Solar Photovoltaic (PV) Rooftop Provision',
    titleMl: 'സോളാർ റൂഫ്‌ടോപ്പ് ഊർജ്ജ സംവിധാനം (Solar PV Provision)',
    requirementEn: isSolarMandatory
      ? `Mandatory grid-tied Solar Rooftop PV installation of min ${requiredSolarKwp} kWp for built-up area >= 500 sq.m.`
      : `Optional for built-up area < 500 sq.m.`,
    requirementMl: isSolarMandatory
      ? `500 ച.മീറ്ററിന് മുകളിലുള്ള കെട്ടിടങ്ങൾക്ക് കുറഞ്ഞത് ${requiredSolarKwp} kWp സോളാർ പാനൽ സംവിധാനം നിർബന്ധമാണ്.`
      : `500 ച.മീറ്ററിൽ താഴെയുള്ള കെട്ടിടങ്ങൾക്ക് നിർബന്ധമല്ല.`,
    providedValue: `${data.solarPvCapacityKwp} kWp`,
    requiredValue: isSolarMandatory ? `≥ ${requiredSolarKwp} kWp` : 'Not Mandatory',
    status: solarPass ? 'pass' : (isSolarMandatory ? 'fail' : 'exempt'),
    severity: isSolarMandatory ? 'medium' : 'info',
    technicalNoteEn: solarPass
      ? `Solar rooftop provision complies with energy conservation mandate.`
      : `Building exceeds 500 sq.m but provides insufficient solar PV capacity (${data.solarPvCapacityKwp} kWp vs ${requiredSolarKwp} kWp).`,
    technicalNoteMl: solarPass
      ? `സോളാർ പാനൽ സംവിധാനം ചട്ടപ്രകാരം നൽകിയിട്ടുണ്ട്.`
      : `500 ച.മീറ്ററിൽ അധികമുള്ള കെട്ടിടമായതിനാൽ ${requiredSolarKwp} kWp സോളാർ പാനൽ പ്ലാനിൽ രേഖപ്പെടുത്തണം.`,
    rectificationAdviceEn: solarPass ? undefined : `Incorporate ${requiredSolarKwp} kWp rooftop solar PV schematic in electrical/terrace plan.`,
    rectificationAdviceMl: solarPass ? undefined : `ടെറസ് പ്ലാനിൽ ${requiredSolarKwp} kWp സോളാർ പാനൽ ലേഔട്ട് ഉൾപ്പെടുത്തുക.`,
  });

  // Solid Waste / Biogas / Compost (Rule 50)
  const isWasteMandatory = data.occupancyGroup !== 'A1' || data.totalBuiltUpAreaSqM >= 300 || data.numberOfFloors > 3;
  const wastePass = !isWasteMandatory || data.solidWasteUnitProvided || data.biogasPlantOrCompostProvided;

  checks.push({
    id: 'waste-management',
    category: 'sanitation_rwh',
    ruleNoKmbr: 'KMBR 2019 Rule 50',
    ruleNoKpbr: 'KPBR 2019 Rule 50',
    titleEn: 'Solid Waste Management & Bio-treatment Unit',
    titleMl: 'ഖരമാലിന്യ സംസ്കരണ സംവിധാനം & ബയോഗ്യാസ് / കമ്പോസ്റ്റ് പ്ലാന്റ്',
    requirementEn: isWasteMandatory
      ? `Mandatory source-level bio-waste treatment (Biogas plant / Pipe compost) for public/commercial/large residential buildings.`
      : `Recommended for small residential buildings.`,
    requirementMl: isWasteMandatory
      ? `വാണിജ്യ കെട്ടിടങ്ങൾക്കും വലിയ പാർപ്പിട സമുച്ചയങ്ങൾക്കും ഉറവിട മാലിന്യ സംസ്കരണ ഉപാധികൾ (ബയോഗ്യാസ്/കമ്പോസ്റ്റ്) നിർബന്ധമാണ്.`
      : `ചെറിയ വീടുകൾക്ക് അഭികാമ്യം.`,
    providedValue: data.biogasPlantOrCompostProvided ? 'Biogas/Compost Provided' : (data.solidWasteUnitProvided ? 'Segregated Unit Provided' : 'Not Specified'),
    requiredValue: isWasteMandatory ? 'Source Waste Unit Required' : 'Recommended',
    status: wastePass ? 'pass' : 'warning',
    severity: 'medium',
    technicalNoteEn: wastePass
      ? `Solid waste segregation & organic treatment facility is incorporated.`
      : `Bio-waste treatment facility not clearly demarcated in service plan.`,
    technicalNoteMl: wastePass
      ? `മാലിന്യ സംസ്കരണ ഉപാധികൾ പ്ലാനിൽ കൃത്യമായി നൽകിയിട്ടുണ്ട്.`
      : `മാലിന്യ സംസ്കരണ പ്ലാന്റ് സർവീസ് പ്ലാനിൽ രേഖപ്പെടുത്തിയിട്ടില്ല.`,
    rectificationAdviceEn: wastePass ? undefined : `Mark proposed biogas plant or aerobic compost unit in site/service layout plan.`,
    rectificationAdviceMl: wastePass ? undefined : `സൈറ്റ് പ്ലാനിൽ ബയോഗ്യാസ് പ്ലാന്റ് അല്ലെങ്കിൽ കമ്പോസ്റ്റ് യൂണിറ്റിന്റെ സ്ഥാനം രേഖപ്പെടുത്തുക.`,
  });

  // ==========================================
  // 8. ARCHITECTURAL STANDARDS (Rule 34 to 45)
  // ==========================================
  // Main Staircase Width (Rule 38)
  let minStairWidth = 1.0;
  if (data.occupancyGroup === 'A1') {
    minStairWidth = isSmallPlot ? 0.75 : 1.0;
  } else if (data.occupancyGroup === 'F' || data.occupancyGroup === 'E') {
    minStairWidth = 1.20;
  } else if (data.occupancyGroup === 'D' || data.occupancyGroup === 'C' || data.occupancyGroup === 'B') {
    minStairWidth = 1.50;
  }

  const stairWidthPass = data.mainStaircaseWidthM >= minStairWidth;
  checks.push({
    id: 'arch-stair-width',
    category: 'architecture',
    ruleNoKmbr: 'KMBR 2019 Rule 38',
    ruleNoKpbr: 'KPBR 2019 Rule 38',
    titleEn: 'Main Staircase Clear Width',
    titleMl: 'പ്രധാന കോണിയുടെ (Staircase) വീതി',
    requirementEn: `Minimum clear flight width of ${minStairWidth.toFixed(2)}m required for ${data.occupancyGroup} occupancy.`,
    requirementMl: `${data.occupancyGroup} കെട്ടിടത്തിൽ സ്റ്റെയർകേസിന് കുറഞ്ഞത് ${minStairWidth.toFixed(2)} മീറ്റർ വ്യക്തമായ വീതി ഉണ്ടായിരിക്കണം.`,
    providedValue: `${data.mainStaircaseWidthM.toFixed(2)} m`,
    requiredValue: `≥ ${minStairWidth.toFixed(2)} m`,
    status: stairWidthPass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: stairWidthPass
      ? `Staircase width of ${data.mainStaircaseWidthM}m satisfies egress requirement (${minStairWidth}m).`
      : `Staircase width of ${data.mainStaircaseWidthM}m is below required ${minStairWidth}m. Obstruction to egress.`,
    technicalNoteMl: stairWidthPass
      ? `സ്റ്റെയർകേസ് വീതി (${data.mainStaircaseWidthM} മീറ്റർ) ചട്ടപ്രകാരം ശരിയാണ്.`
      : `സ്റ്റെയർകേസ് വീതി (${data.mainStaircaseWidthM} മീറ്റർ) കുറവാണ്. കുറഞ്ഞത് ${minStairWidth} മീറ്റർ ഉണ്ടായിരിക്കണം.`,
    rectificationAdviceEn: stairWidthPass ? undefined : `Widen staircase flight to clear ${minStairWidth}m in floor plan.`,
    rectificationAdviceMl: stairWidthPass ? undefined : `ഫ്ലോർ പ്ലാനിൽ സ്റ്റെയർകേസിന്റെ വീതി ${minStairWidth} മീറ്ററാക്കി മാറ്റുക.`,
  });

  // Staircase Tread & Riser (Rule 38)
  const maxRiserCm = data.occupancyGroup === 'A1' ? 17.5 : 15.0;
  const minTreadCm = data.occupancyGroup === 'A1' ? 25.0 : 30.0;
  const riserPass = data.staircaseRiserCm <= maxRiserCm;
  const treadPass = data.staircaseTreadCm >= minTreadCm;
  const riserTreadPass = riserPass && treadPass;

  checks.push({
    id: 'arch-stair-tread-riser',
    category: 'architecture',
    ruleNoKmbr: 'KMBR 2019 Rule 38',
    ruleNoKpbr: 'KPBR 2019 Rule 38',
    titleEn: 'Staircase Tread & Riser Dimensions',
    titleMl: 'സ്റ്റെയർകേസ് ട്രെഡ്ഡ് & റൈസർ അളവുകൾ (Tread & Riser)',
    requirementEn: `Max Riser: ${maxRiserCm} cm | Min Tread: ${minTreadCm} cm for ${data.occupancyGroup} occupancy.`,
    requirementMl: `പരമാവധി റൈസർ: ${maxRiserCm} സെ.മീ | കുറഞ്ഞ ട്രെഡ്ഡ്: ${minTreadCm} സെ.മീ.`,
    providedValue: `Riser: ${data.staircaseRiserCm} cm | Tread: ${data.staircaseTreadCm} cm`,
    requiredValue: `Riser ≤ ${maxRiserCm} cm | Tread ≥ ${minTreadCm} cm`,
    status: riserTreadPass ? 'pass' : 'fail',
    severity: 'medium',
    technicalNoteEn: riserTreadPass
      ? `Tread and riser dimensions satisfy comfortable ergonomic stepping rule.`
      : `Violation: ${!riserPass ? `Riser (${data.staircaseRiserCm}cm) exceeds max ${maxRiserCm}cm.` : ''} ${!treadPass ? `Tread (${data.staircaseTreadCm}cm) is below min ${minTreadCm}cm.` : ''}`,
    technicalNoteMl: riserTreadPass
      ? `റൈസർ, ട്രെഡ്ഡ് അളവുകൾ ചട്ടപ്രകാരം കൃത്യമാണ്.`
      : `പിഴവ്: ${!riserPass ? `റൈസർ ${data.staircaseRiserCm}cm പരമാവധി ${maxRiserCm}cm-നേക്കാൾ കൂടുതലാണ്.` : ''} ${!treadPass ? `ട്രെഡ്ഡ് ${data.staircaseTreadCm}cm മിനിമം ${minTreadCm}cm-നേക്കാൾ കുറവാണ്.` : ''}`,
    rectificationAdviceEn: riserTreadPass ? undefined : `Adjust steps detail in section drawing: Riser <= ${maxRiserCm}cm, Tread >= ${minTreadCm}cm.`,
    rectificationAdviceMl: riserTreadPass ? undefined : `സെക്ഷൻ പ്ലാനിൽ റൈസർ പരമാവധി ${maxRiserCm} സെ.മീറ്ററും ട്രെഡ്ഡ് കുറഞ്ഞത് ${minTreadCm} സെ.മീറ്ററുമായി രേഖപ്പെടുത്തുക.`,
  });

  // Habitable Room Size (Rule 34)
  const minRoomArea = 9.5; // sq.m
  const minRoomWidth = 2.4; // m
  const minRoomHeight = 2.75; // m
  const roomPass = data.minHabitableRoomAreaSqM >= minRoomArea && data.minHabitableRoomWidthM >= minRoomWidth && data.minHabitableRoomHeightM >= minRoomHeight;

  checks.push({
    id: 'arch-habitable-room',
    category: 'architecture',
    ruleNoKmbr: 'KMBR 2019 Rule 34',
    ruleNoKpbr: 'KPBR 2019 Rule 34',
    titleEn: 'Minimum Habitable Room Area, Width & Height',
    titleMl: 'വാസയോഗ്യമായ മുറിയുടെ കുറഞ്ഞ വിസ്തീർണ്ണം, വീതി & ഉയരം',
    requirementEn: `Min Floor Area: 9.50 sq.m | Min Width: 2.40m | Min Clear Height: 2.75m.`,
    requirementMl: `കുറഞ്ഞ വിസ്തീർണ്ണം: 9.50 ച.മീ | കുറഞ്ഞ വീതി: 2.40 മീറ്റർ | കുറഞ്ഞ ഉയരം: 2.75 മീറ്റർ.`,
    providedValue: `Area: ${data.minHabitableRoomAreaSqM.toFixed(1)} sq.m | Width: ${data.minHabitableRoomWidthM.toFixed(2)}m | Height: ${data.minHabitableRoomHeightM.toFixed(2)}m`,
    requiredValue: `Area ≥ 9.50 sq.m | Width ≥ 2.40m | Height ≥ 2.75m`,
    status: roomPass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: roomPass
      ? `Habitable rooms meet all spatial dimension standards under Rule 34.`
      : `Deficiency in room dimensions. Habitable space fails minimum area or height specification.`,
    technicalNoteMl: roomPass
      ? `മുറികളുടെ വിസ്തീർണ്ണവും ഉയരവും ചട്ടപ്രകാരം ശരിയാണ്.`
      : `മുറിയുടെ അളവുകൾ ചട്ടപ്രകാരമുള്ള മിനിമം അളവുകളേക്കാൾ കുറവാണ്.`,
    rectificationAdviceEn: roomPass ? undefined : `Adjust room dimensions in floor plan to guarantee min 9.5 sq.m area, 2.4m width, and 2.75m clear ceiling height.`,
    rectificationAdviceMl: roomPass ? undefined : `ഫ്ലോർ പ്ലാനിൽ മുറികളുടെ വിസ്തീർണ്ണം കുറഞ്ഞത് 9.5 ച.മീറ്ററും ഉയരം 2.75 മീറ്ററുമായി ഉറപ്പാക്കുക.`,
  });

  // Kitchen Size (Rule 35)
  const minKitchenArea = 5.0; // sq.m
  const minKitchenWidth = 1.8; // m
  const kitchenPass = data.minKitchenAreaSqM >= minKitchenArea && data.minKitchenWidthM >= minKitchenWidth;

  checks.push({
    id: 'arch-kitchen',
    category: 'architecture',
    ruleNoKmbr: 'KMBR 2019 Rule 35',
    ruleNoKpbr: 'KPBR 2019 Rule 35',
    titleEn: 'Minimum Kitchen Area & Width',
    titleMl: 'അടുക്കളയുടെ കുറഞ്ഞ വിസ്തീർണ്ണവും വീതിയും (Kitchen Standards)',
    requirementEn: `Min Kitchen Floor Area: 5.00 sq.m | Min Clear Width: 1.80m.`,
    requirementMl: `അടുക്കളയുടെ കുറഞ്ഞ വിസ്തീർണ്ണം: 5.00 ച.മീ | കുറഞ്ഞ വീതി: 1.80 മീറ്റർ.`,
    providedValue: `Area: ${data.minKitchenAreaSqM.toFixed(1)} sq.m | Width: ${data.minKitchenWidthM.toFixed(2)}m`,
    requiredValue: `Area ≥ 5.00 sq.m | Width ≥ 1.80m`,
    status: kitchenPass ? 'pass' : 'fail',
    severity: 'medium',
    technicalNoteEn: kitchenPass
      ? `Kitchen dimensions satisfy Rule 35.`
      : `Kitchen is below required 5.0 sq.m area or 1.8m width.`,
    technicalNoteMl: kitchenPass
      ? `അടുക്കളയുടെ അളവുകൾ അനുവദനീയമാണ്.`
      : `അടുക്കളയുടെ അളവുകൾ കുറവാണ്. കുറഞ്ഞത് 5.0 ച.മീറ്ററും 1.8 മീറ്റർ വീതിയും വേണം.`,
    rectificationAdviceEn: kitchenPass ? undefined : `Increase kitchen floor dimensions in architectural plan.`,
    rectificationAdviceMl: kitchenPass ? undefined : `പ്ലാനിൽ അടുക്കളയുടെ വിസ്തീർണ്ണം വർദ്ധിപ്പിക്കുക.`,
  });

  // Ventilation Ratio (Rule 42)
  const minVentilationPercent = 10; // 1/10th of floor area
  const ventPass = data.ventilationRatioPercent >= minVentilationPercent;

  checks.push({
    id: 'arch-ventilation',
    category: 'architecture',
    ruleNoKmbr: 'KMBR 2019 Rule 42',
    ruleNoKpbr: 'KPBR 2019 Rule 42',
    titleEn: 'Natural Light & Ventilation Opening Area',
    titleMl: 'സ്വാഭാവിക വെളിച്ചവും വായുസഞ്ചാരവും (Light & Ventilation)',
    requirementEn: `Window and ventilator clear opening area shall not be less than 10% (1/10th) of the room floor area opening to exterior air.`,
    requirementMl: `മുറിയുടെ ഫ്ലോർ ഏരിയയുടെ കുറഞ്ഞത് 10% (പത്തിലൊന്ന് ഭാഗം) തുറസ്സായ ജനലുകളും വെന്റിലേറ്ററുകളും ഉണ്ടായിരിക്കണം.`,
    providedValue: `${data.ventilationRatioPercent.toFixed(1)}% of Floor Area`,
    requiredValue: `≥ 10.0% of Floor Area`,
    status: ventPass ? 'pass' : 'fail',
    severity: 'high',
    technicalNoteEn: ventPass
      ? `Provided window opening ratio of ${data.ventilationRatioPercent}% ensures adequate natural cross-ventilation.`
      : `Ventilation opening is only ${data.ventilationRatioPercent}%, deficient by ${(minVentilationPercent - data.ventilationRatioPercent).toFixed(1)}%.`,
    technicalNoteMl: ventPass
      ? `നൽകിയിട്ടുള്ള ജനലുകളുടെ വിസ്തീർണ്ണം (${data.ventilationRatioPercent}%) സ്വാഭാവിക വെളിച്ചത്തിനും വായുസഞ്ചാരത്തിനും പര്യാപ്തമാണ്.`
      : `ജനലുകളുടെ വിസ്തീർണ്ണം കുറവാണ്. കുറഞ്ഞത് 10% ഉണ്ടായിരിക്കണം.`,
    rectificationAdviceEn: ventPass ? undefined : `Increase window dimensions or add additional ventilators in external walls.`,
    rectificationAdviceMl: ventPass ? undefined : `പുറംഭിത്തികളിൽ വലിയ ജനലുകൾ കൂടി നൽകി വെന്റിലേഷൻ വർദ്ധിപ്പിക്കുക.`,
  });

  // ==========================================
  // 9. FIRE SAFETY & SPECIAL OCCUPANCIES (Rule 51, 58)
  // ==========================================
  // High rise (>16m) checks
  if (data.buildingHeightM > 16) {
    const minFirePassage = 5.0; // 5.0m clear width around building for fire tender
    const firePassagePass = data.clearFirePassageWidthM >= minFirePassage;

    checks.push({
      id: 'fire-passage-highrise',
      category: 'fire_safety',
      ruleNoKmbr: 'KMBR 2019 Rule 58 / NBC Part 4',
      ruleNoKpbr: 'KPBR 2019 Rule 58 / NBC Part 4',
      titleEn: 'High-Rise Fire Tender Motorable Clear Way',
      titleMl: 'ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക് ചുറ്റുമുള്ള ഫയർ എഞ്ചിൻ പാത (Fire Tender Access)',
      requirementEn: `Mandatory continuous clear motorable way of minimum 5.00m width all around the high-rise building (>16m height) with 5.0m clear entrance gate.`,
      requirementMl: `16 മീറ്ററിലധികം ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക് ചുറ്റും ഫയർ എഞ്ചിന് തടസ്സമില്ലാതെ സഞ്ചരിക്കാൻ കുറഞ്ഞത് 5.0 മീറ്റർ വീതിയുള്ള വഴി നിർബന്ധമാണ്.`,
      providedValue: `${data.clearFirePassageWidthM.toFixed(2)} m`,
      requiredValue: `≥ 5.00 m all around`,
      status: firePassagePass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: firePassagePass
        ? `Continuous 5.0m fire tender driveway provided around the structure.`
        : `Deficient fire engine driveway (${data.clearFirePassageWidthM}m vs 5.0m). Fire NOC cannot be issued.`,
      technicalNoteMl: firePassagePass
        ? `കെട്ടിടത്തിന് ചുറ്റും 5.0 മീറ്റർ ഫയർ പാത കൃത്യമായി നൽകിയിട്ടുണ്ട്.`
        : `ഫയർ എഞ്ചിൻ സഞ്ചരിക്കാനുള്ള പാതയുടെ വീതി (${data.clearFirePassageWidthM} മീറ്റർ) അപര്യാപ്തമാണ്. ഫയർ ഫോഴ്സ് എൻ.ഒ.സി ലഭിക്കില്ല.`,
      rectificationAdviceEn: firePassagePass ? undefined : `Ensure minimum 5.0m unhindered paved driveway on all sides for fire safety compliance.`,
      rectificationAdviceMl: firePassagePass ? undefined : `കെട്ടിടത്തിന് ചുറ്റും 5.0 മീറ്റർ വീതിയിൽ ഫയർ പാത സൈറ്റ് പ്ലാനിൽ അടയാളപ്പെടുത്തുക.`,
    });
  }

  // Lift provision for >3 floors or >15m height
  if (data.numberOfFloors > 3 || data.buildingHeightM > 15) {
    checks.push({
      id: 'arch-lift-provision',
      category: 'architecture',
      ruleNoKmbr: 'KMBR 2019 Rule 46',
      ruleNoKpbr: 'KPBR 2019 Rule 46',
      titleEn: 'Mandatory Passenger Lift Installation',
      titleMl: 'യാത്രാ ലിഫ്റ്റ് സൗകര്യം (Passenger Lift Provision)',
      requirementEn: `Installation of passenger lift is mandatory for buildings having more than 3 floors or exceeding 15.0m in height.`,
      requirementMl: `3 നിലകളിൽ കൂടുതലുള്ളതോ 15 മീറ്ററിലധികം ഉയരമുള്ളതോ ആയ കെട്ടിടങ്ങൾക്ക് പാസഞ്ചർ ലിഫ്റ്റ് നിർബന്ധമാണ്.`,
      providedValue: data.hasLift ? 'Passenger Lift Provided in Plan' : 'No Lift in Plan',
      requiredValue: 'Mandatory Lift Required',
      status: data.hasLift ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: data.hasLift
        ? `Passenger lift provision shown in floor plans and sections.`
        : `Building has ${data.numberOfFloors} floors but lacks mandatory lift provision under Rule 46.`,
      technicalNoteMl: data.hasLift
        ? `ലിഫ്റ്റ് സൗകര്യം പ്ലാനിൽ കൃത്യമായി നൽകിയിട്ടുണ്ട്.`
        : `${data.numberOfFloors} നിലകളുള്ള കെട്ടിടത്തിൽ ലിഫ്റ്റ് നൽകിയിട്ടില്ല. ചട്ടം 46 പ്രകാരം ലിഫ്റ്റ് നിർബന്ധമാണ്.`,
      rectificationAdviceEn: data.hasLift ? undefined : `Designate lift well with lift lobby and machine room in floor and section plans.`,
      rectificationAdviceMl: data.hasLift ? undefined : `ഫ്ലോർ പ്ലാനുകളിലും സെക്ഷനിലും ലിഫ്റ്റ് വെൽ ഉൾപ്പെടുത്തുക.`,
    });
  }

  // Calculate summary counts
  const totalChecks = checks.length;
  const passedCount = checks.filter((c) => c.status === 'pass').length;
  const failedCount = checks.filter((c) => c.status === 'fail').length;
  const warningCount = checks.filter((c) => c.status === 'warning').length;
  const exemptCount = checks.filter((c) => c.status === 'exempt').length;

  let overallStatus: ScrutinyReportSummary['overallStatus'] = 'APPROVED';
  if (failedCount > 0) {
    overallStatus = 'REJECTED_DEFECTIVE';
  } else if (warningCount > 0) {
    overallStatus = 'CONDITIONAL_APPROVAL';
  }

  const summary: ScrutinyReportSummary = {
    totalChecks,
    passedCount,
    failedCount,
    warningCount,
    exemptCount,
    overallStatus,
    maxPermissibleCoveragePercent,
    providedCoveragePercent,
    permissibleFarWithoutFee,
    maxPermissibleFarWithFee,
    providedFar,
    requiredCarParking,
    requiredTwoWheelerParking,
    requiredRwhCapacityLiters,
    requiredSolarKwp,
    scrutinyTimestamp: Date.now(),
    scrutinyReferenceId: `KSCR-${Date.now().toString().slice(-6)}-${data.jurisdiction}`,
  };

  return { summary, checks };
}
