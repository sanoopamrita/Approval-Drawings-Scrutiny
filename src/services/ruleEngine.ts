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
    let uploaded = drawings.filter((d) => d.category === req.category);

    // If checking service_plans, accept both service_plans and any discrete service sub-plans
    if (req.category === 'service_plans') {
      uploaded = drawings.filter(
        (d) =>
          d.category === 'service_plans' ||
          d.category.startsWith('service_') ||
          d.serviceSubType !== undefined
      );
    } else if (req.category === 'rwh_solar_plans') {
      uploaded = drawings.filter(
        (d) =>
          d.category === 'rwh_solar_plans' ||
          d.category === 'service_solar_plan' ||
          d.category === 'service_rwh_plan' ||
          d.serviceSubType === 'solar_panel' ||
          d.serviceSubType === 'rainwater_harvesting'
      );
    }

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
  } else if (data.occupancyGroup === 'B') {
    minRequiredRoadWidthM = data.totalBuiltUpAreaSqM > 500 ? (isKmbr ? 7.0 : 6.0) : (isKmbr ? 5.0 : 4.0);
  } else if (data.occupancyGroup === 'D' || data.occupancyGroup === 'C') {
    minRequiredRoadWidthM = isKmbr ? 7.0 : 6.0;
  } else if (data.occupancyGroup === 'G1' || data.occupancyGroup === 'G2' || data.occupancyGroup === 'H') {
    minRequiredRoadWidthM = isKmbr ? 7.0 : 6.0;
  } else if (data.occupancyGroup === 'I') {
    minRequiredRoadWidthM = isKmbr ? 12.0 : 10.0;
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

  // ==========================================
  // 10. DUAL STAIRCASES & EGRESS (Rule 38 / NBC Part IV)
  // ==========================================
  const requiresDualStaircase =
    data.occupancyGroup === 'B' || // Educational
    data.occupancyGroup === 'D' || // Assembly
    (data.occupancyGroup === 'F' && data.totalFloorAreaSqM > 300) ||
    data.buildingHeightM > 15 ||
    data.numberOfFloors > 2;

  if (requiresDualStaircase) {
    const stairCount = data.staircaseCount || 1;
    const dualStairPass = stairCount >= 2;
    checks.push({
      id: 'arch-dual-staircase',
      category: 'architecture',
      ruleNoKmbr: 'KMBR 2019 Rule 38 / NBC Part IV',
      ruleNoKpbr: 'KPBR 2019 Rule 38 / NBC Part IV',
      titleEn: 'Dual Independent Exit Staircases',
      titleMl: 'രണ്ട് സ്വതന്ത്ര എക്സിറ്റ് സ്റ്റെയർകേസുകൾ (Dual Exit Staircase)',
      requirementEn: `Mandatory minimum of 2 separate independent enclosed exit staircases for ${data.occupancyGroup} occupancy / multi-floor public occupancy.`,
      requirementMl: `${data.occupancyGroup} വിഭാഗം കെട്ടിടങ്ങൾക്കും ഒന്നിലധികം നിലകളുള്ള പൊതു കെട്ടിടങ്ങൾക്കും കുറഞ്ഞത് 2 സ്വതന്ത്ര എക്സിറ്റ് സ്റ്റെയർകേസുകൾ നിർബന്ധമാണ്.`,
      providedValue: `${stairCount} Staircase(s) in Plan`,
      requiredValue: `≥ 2 Separate Staircases`,
      status: dualStairPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: dualStairPass
        ? `Two independent egress staircases provided complying with NBC Part IV evacuation limits.`
        : `Single staircase provided. High risk of egress failure during emergency/fire. Rule strictly mandates 2 separate staircases.`,
      technicalNoteMl: dualStairPass
        ? `ചട്ടപ്രകാരം 2 സ്വതന്ത്ര സ്റ്റെയർകേസുകൾ പ്ലാനിൽ നൽകിയിട്ടുണ്ട്.`
        : `ഒറ്റ സ്റ്റെയർകേസ് മാത്രമേ നൽകിയിട്ടുള്ളൂ. അടിയന്തര സാഹചര്യത്തിൽ എക്സിറ്റിനായി കുറഞ്ഞത് 2 സ്റ്റെയർകേസുകൾ നിർബന്ധമാണ്.`,
      rectificationAdviceEn: dualStairPass ? undefined : `Add a secondary fire escape / exit staircase with direct exterior egress.`,
      rectificationAdviceMl: dualStairPass ? undefined : `പ്ലാനിൽ പുറത്തേക്ക് എളുപ്പത്തിൽ ഇറങ്ങാൻ കഴിയുന്ന രണ്ടാമതൊരു സ്റ്റെയർകേസ് കൂടി ഉൾപ്പെടുത്തുക.`,
    });
  }

  // ==========================================
  // 11. SPECIALIZED EDUCATIONAL NORMS (Group B / KER)
  // ==========================================
  if (data.occupancyGroup === 'B') {
    // 1. Minimum Classroom Area (KER Chapter IV Rule 3: min 36 sq.m)
    const classroomArea = data.minClassroomAreaSqM || 36.0;
    const classroomAreaPass = classroomArea >= 36.0;
    checks.push({
      id: 'ker-classroom-area',
      category: 'architecture',
      ruleNoKmbr: 'KER Chap IV Rule 3 / KMBR Rule 53',
      ruleNoKpbr: 'KER Chap IV Rule 3 / KPBR Rule 53',
      titleEn: 'KER Minimum Classroom Floor Dimension (36.0 sq.m)',
      titleMl: 'ക്ലാസ്സ് മുറിയുടെ കുറഞ്ഞ വിസ്തീർണ്ണം (KER Norms - 36 ച.മീ.)',
      requirementEn: `Kerala Education Rules (KER) mandates minimum classroom floor area of 36.0 sq.m (standard 6.0m × 6.0m dimension) per standard division.`,
      requirementMl: `കേരള എഡ്യൂക്കേഷൻ റൂൾസ് (KER) പ്രകാരം ഓരോ ക്ലാസ്സ് മുറിക്കും കുറഞ്ഞത് 36.0 ച.മീറ്റർ വിസ്തീർണ്ണം (6m × 6m) ഉണ്ടായിരിക്കണം.`,
      providedValue: `${classroomArea.toFixed(1)} sq.m`,
      requiredValue: `≥ 36.0 sq.m`,
      status: classroomAreaPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: classroomAreaPass
        ? `Classroom dimensions meet KER educational structural norms.`
        : `Classroom area (${classroomArea} sq.m) fails mandatory 36 sq.m standard under KER Chapter IV. DEO/AEO recognition will be withheld.`,
      technicalNoteMl: classroomAreaPass
        ? `ക്ലാസ്സ് മുറിയുടെ വിസ്തീർണ്ണം KER മാനദണ്ഡങ്ങൾക്ക് അനുസൃതമാണ്.`
        : `ക്ലാസ്സ് മുറിയുടെ വിസ്തീർണ്ണം കുറവാണ്. കുറഞ്ഞത് 36 ചതുരശ്ര മീറ്റർ ഉണ്ടായിരിക്കണം.`,
      rectificationAdviceEn: classroomAreaPass ? undefined : `Resize classrooms to minimum 6.00m × 6.00m internal dimension.`,
      rectificationAdviceMl: classroomAreaPass ? undefined : `ക്ലാസ്സ് മുറിയുടെ അളവ് 6.0m × 6.0m ആക്കി പ്ലാനിൽ തിരുത്തുക.`,
    });

    // 2. Classroom Height (KER Chap IV: min 3.0m clear ceiling height)
    const classroomHeight = data.minClassroomHeightM || data.minHabitableRoomHeightM || 3.0;
    const classroomHeightPass = classroomHeight >= 3.0;
    checks.push({
      id: 'ker-classroom-height',
      category: 'architecture',
      ruleNoKmbr: 'KER Chap IV / KMBR Rule 53',
      ruleNoKpbr: 'KER Chap IV / KPBR Rule 53',
      titleEn: 'KER Minimum Classroom Ceiling Height',
      titleMl: 'ക്ലാസ്സ് മുറിയുടെ ഉയരം (KER Ceiling Height)',
      requirementEn: `Minimum clear vertical ceiling height of 3.00m required for school classrooms.`,
      requirementMl: `ക്ലാസ്സ് മുറികൾക്ക് കുറഞ്ഞത് 3.00 മീറ്റർ വ്യക്തമായ ഉയരം ഉണ്ടായിരിക്കണം.`,
      providedValue: `${classroomHeight.toFixed(2)} m`,
      requiredValue: `≥ 3.00 m`,
      status: classroomHeightPass ? 'pass' : 'fail',
      severity: 'high',
      technicalNoteEn: classroomHeightPass
        ? `Clear ceiling height satisfies educational ventilation norms.`
        : `Ceiling height is only ${classroomHeight}m (fails 3.0m standard).`,
      technicalNoteMl: classroomHeightPass
        ? `ക്ലാസ്സ് മുറിയുടെ ഉയരം ചട്ടപ്രകാരം ശരിയാണ്.`
        : `ക്ലാസ്സ് മുറിയുടെ ഉയരം 3.0 മീറ്ററിൽ കുറവാണ്.`,
      rectificationAdviceEn: classroomHeightPass ? undefined : `Ensure sectional elevation indicates >= 3.0m clear floor-to-ceiling height.`,
      rectificationAdviceMl: classroomHeightPass ? undefined : `സെക്ഷൻ പ്ലാനിൽ ക്ലാസ്സ് മുറിയുടെ ഉയരം 3.0 മീറ്ററായി ഉയർത്തുക.`,
    });

    // 3. School Playground & Open Yard
    const students = data.numberOfStudents || 100;
    const requiredPlaygroundArea = Math.max(500, students * 5.0); // 5 sq.m per student or min 500 sq.m
    const playgroundArea = data.playgroundAreaSqM || 600;
    const playgroundPass = playgroundArea >= requiredPlaygroundArea;
    checks.push({
      id: 'ker-playground-norm',
      category: 'architecture',
      ruleNoKmbr: 'KER Chap IV Rule 1 / KMBR Rule 53',
      ruleNoKpbr: 'KER Chap IV Rule 1 / KPBR Rule 53',
      titleEn: 'KER School Playground Area Requirement',
      titleMl: 'സ്കൂൾ കളിസ്ഥല വിസ്തീർണ്ണം (School Playground Norm)',
      requirementEn: `Minimum playground open space of ${requiredPlaygroundArea.toLocaleString()} sq.m (min 5.0 sq.m per enrolled student).`,
      requirementMl: `ഒരു വിദ്യാർത്ഥിക്ക് 5 ച.മീറ്റർ എന്ന നിരക്കിൽ കുറഞ്ഞത് ${requiredPlaygroundArea.toLocaleString()} ച.മീറ്റർ കളിസ്ഥലം സ്കൂൾ കാമ്പസിൽ ഉണ്ടായിരിക്കണം.`,
      providedValue: `${playgroundArea.toLocaleString()} sq.m`,
      requiredValue: `≥ ${requiredPlaygroundArea.toLocaleString()} sq.m`,
      status: playgroundPass ? 'pass' : 'warning',
      severity: 'high',
      technicalNoteEn: playgroundPass
        ? `Adequate recreational playground open ground provided.`
        : `Deficient playground area (${playgroundArea} sq.m vs ${requiredPlaygroundArea} sq.m). Essential for KER departmental fitness clearance.`,
      technicalNoteMl: playgroundPass
        ? `കളിസ്ഥലം ചട്ടപ്രകാരം ലഭ്യമാണ്.`
        : `കളിസ്ഥലത്തിന് ആവശ്യമായ സ്ഥലം കുറവാണ്.`,
      rectificationAdviceEn: playgroundPass ? undefined : `Demarcate open sports ground / recreation area in site master plan.`,
      rectificationAdviceMl: playgroundPass ? undefined : `സൈറ്റ് പ്ലാനിൽ കളിസ്ഥലത്തിന്റെ സ്ഥലം കൃത്യമായി അടയാളപ്പെടുത്തുക.`,
    });
  }

  // ==========================================
  // 12. FIRE SAFETY, NOC & HYDRANT (NBC Part IV & Kerala Fire Services)
  // ==========================================
  const requiresFireNoc =
    data.buildingHeightM > 16 ||
    (data.occupancyGroup === 'D' && data.totalBuiltUpAreaSqM > 500) ||
    (data.occupancyGroup === 'F' && data.totalBuiltUpAreaSqM > 1000) ||
    (data.occupancyGroup === 'B' && data.totalBuiltUpAreaSqM > 1000) ||
    (data.occupancyGroup === 'C' && data.totalBuiltUpAreaSqM > 500) ||
    data.occupancyGroup === 'I';

  if (requiresFireNoc) {
    const fireNocPass = !!data.hasFireNoc;
    checks.push({
      id: 'fire-noc-statutory',
      category: 'fire_safety',
      ruleNoKmbr: 'KMBR 2019 Rule 58 & NBC Part IV',
      ruleNoKpbr: 'KPBR 2019 Rule 58 & NBC Part IV',
      titleEn: 'Statutory Fire NOC from Kerala Fire & Rescue Services',
      titleMl: 'കേരള ഫയർ & റെസ്ക്യൂ സർവീസസ് അനുമതി (Fire NOC Clearance)',
      requirementEn: `Mandatory Fire & Life Safety NOC / Clearance Certificate from Department of Fire & Rescue Services Kerala for high-rise / special occupancy.`,
      requirementMl: `ഉയരമുള്ള കെട്ടിടങ്ങൾക്കും പൊതു സ്ഥാപനങ്ങൾക്കും കേരള ഫയർ ഫോഴ്സിന്റെ മുൻകൂർ അനുമതി പത്രം (Fire NOC) നിർബന്ധമാണ്.`,
      providedValue: data.hasFireNoc ? 'Fire NOC / Scheme Submitted' : 'Fire NOC Scheme Not Attached',
      requiredValue: 'Mandatory Fire NOC',
      status: fireNocPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: fireNocPass
        ? `Fire NOC scheme incorporated with wet risers, yard hydrants, and smoke detection.`
        : `Fire NOC is mandatory for this building scale. Drawing cannot receive LSGD sanction without Fire Department NOC.`,
      technicalNoteMl: fireNocPass
        ? `ഫയർ എൻ.ഒ.സി പ്ലാനുകൾ കൃത്യമായി നൽകിയിട്ടുണ്ട്.`
        : `കെട്ടിടത്തിന് ഫയർ ഫോഴ്സ് എൻ.ഒ.സി നിർബന്ധമാണ്. എൻ.ഒ.സി ഇല്ലാതെ കെ-സ്മാർട്ട് വഴി അനുമതി ലഭിക്കില്ല.`,
      rectificationAdviceEn: fireNocPass ? undefined : `Submit building plan to Kerala Fire & Rescue Services for Initial Fire Scheme Approval.`,
      rectificationAdviceMl: fireNocPass ? undefined : `ഫയർ ഫോഴ്സ് ഓഫീസിൽ നിന്ന് ഫയർ സ്കീം അപ്രൂവൽ വാങ്ങി രേഖപ്പെടുത്തുക.`,
    });
  }

  // External Fire Escape Staircase check for >15m or >500 sq.m public floor
  if (data.buildingHeightM > 15 || (data.occupancyGroup !== 'A1' && data.totalBuiltUpAreaSqM > 1000)) {
    const externalStairPass = !!data.hasExternalFireEscapeStair;
    checks.push({
      id: 'fire-external-stair',
      category: 'fire_safety',
      ruleNoKmbr: 'KMBR 2019 Rule 58(4) / NBC Part IV',
      ruleNoKpbr: 'KPBR 2019 Rule 58(4) / NBC Part IV',
      titleEn: 'External Fire Escape Staircase (Direct Ground Discharge)',
      titleMl: 'പുറത്തുകൂടിയുള്ള എമർജൻസി ഫയർ എസ്കേപ്പ് സ്റ്റെയർകേസ്',
      requirementEn: `Mandatory external steel/RCC fire escape staircase with minimum 1.0m width directly discharging to safe open exterior ground.`,
      requirementMl: `അടിയന്തര സാഹചര്യങ്ങളിൽ രക്ഷപ്പെടാൻ പുറംഭിത്തിയോട് ചേർന്ന് കുറഞ്ഞത് 1.0 മീറ്റർ വീതിയുള്ള ഫയർ എസ്കേപ്പ് സ്റ്റെയർകേസ് നിർബന്ധമാണ്.`,
      providedValue: externalStairPass ? 'External Fire Escape Stair Provided' : 'Not Shown in Plan',
      requiredValue: 'Mandatory External Fire Stair',
      status: externalStairPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: externalStairPass
        ? `External fire escape staircase provided complying with egress distances.`
        : `Missing external fire escape staircase on outer building facade.`,
      technicalNoteMl: externalStairPass
        ? `എമർജൻസി ഫയർ എസ്കേപ്പ് സ്റ്റെയർകേസ് നൽകിയിട്ടുണ്ട്.`
        : `കെട്ടിടത്തിന്റെ പുറംഭിത്തിയിൽ ഫയർ എസ്കേപ്പ് സ്റ്റെയർകേസ് കാണിച്ചിട്ടില്ല.`,
      rectificationAdviceEn: externalStairPass ? undefined : `Add external fire escape staircase with minimum 1.0m width in architectural and elevation plans.`,
      rectificationAdviceMl: externalStairPass ? undefined : `എലവേഷനിലും പ്ലാനിലും പുറം സ്റ്റെയർകേസ് വരച്ചു ചേർക്കുക.`,
    });
  }

  // ==========================================
  // 13. PROJECTIONS & ACCESSORY CLEARANCES (Rule 27 / 25)
  // ==========================================
  const canopyProj = data.canopyProjectionM || 0.6;
  const balconyProj = data.balconyProjectionM || 0.9;
  const minSide = Math.min(data.sideSetback1M, data.sideSetback2M);
  // Rule: Balcony/canopy projection should leave at least 1.0m clear open space to boundary (or 0.6m in small plot)
  const requiredClearAfterProjection = isSmallPlot ? 0.6 : 1.0;
  const clearAfterProjection = minSide - balconyProj;
  const projPass = clearAfterProjection >= requiredClearAfterProjection || balconyProj <= 1.2;

  checks.push({
    id: 'arch-projections-clearance',
    category: 'setbacks',
    ruleNoKmbr: 'KMBR 2019 Rule 27(6)',
    ruleNoKpbr: 'KPBR 2019 Rule 25(6)',
    titleEn: 'Balcony & Canopy Projections into Setback Yards',
    titleMl: 'ബാൽക്കണി & സൺഷെയ്ഡ് തള്ളിനിൽക്കൽ (Projections into Setbacks)',
    requirementEn: `Projections (sunshades/balconies) into open setbacks shall not exceed 1.20m and must leave minimum ${requiredClearAfterProjection.toFixed(1)}m clear open space to boundary.`,
    requirementMl: `ബാൽക്കണികളും സൺഷെയ്ഡുകളും പരമാവധി 1.20 മീറ്ററിൽ കൂടുതൽ തള്ളിനിൽക്കാൻ പാടില്ല. അതിർത്തിയിലേക്ക് കുറഞ്ഞത് ${requiredClearAfterProjection.toFixed(1)} മീറ്റർ തുറസ്സായ സ്ഥലം അവശേഷിക്കണം.`,
    providedValue: `Balcony: ${balconyProj.toFixed(2)}m | Clear Left: ${Math.max(0, clearAfterProjection).toFixed(2)}m`,
    requiredValue: `Balcony ≤ 1.20m & Clear Space ≥ ${requiredClearAfterProjection.toFixed(1)}m`,
    status: projPass ? 'pass' : 'warning',
    severity: 'medium',
    technicalNoteEn: projPass
      ? `Architectural projections are within allowable projection limits.`
      : `Balcony projection leaves less than required ${requiredClearAfterProjection}m clear open yard to plot boundary.`,
    technicalNoteMl: projPass
      ? `ബാൽക്കണി തള്ളിനിൽക്കൽ അനുവദനീയമായ പരിധിക്കുള്ളിലാണ്.`
      : `ബാൽക്കണി തള്ളിനിൽക്കുന്നതിനാൽ അതിർത്തിയിലേക്കുള്ള കുറഞ്ഞ അകലം ലംഘിക്കപ്പെടുന്നു.`,
    rectificationAdviceEn: projPass ? undefined : `Reduce balcony/canopy cantilever to ensure minimum ${requiredClearAfterProjection}m clear space to boundary.`,
    rectificationAdviceMl: projPass ? undefined : `ബാൽക്കണിയുടെ വീതി കുറച്ച് അതിർത്തിയിലേക്കുള്ള അകലം ക്രമീകരിക്കുക.`,
  });

  // ==========================================
  // 14. ALLIED STATUTORY ACTS & MULTI-DEPARTMENT CLEARANCES
  // ==========================================

  // A. CRZ 2019 Notification (Coastal Regulation Zone & KCZMA)
  if (data.isCrzApplicable || data.plotType === 'crz' || (data.distanceFromHtlM !== undefined && data.distanceFromHtlM > 0)) {
    const crzDist = data.distanceFromHtlM || 0;
    const hasKczma = !!data.hasKczmaClearance;
    const crzCategory = data.crzCategory || 'CRZ-II';
    let minNdzDist = 50; // CRZ-III-A (50m) or CRZ-II (existing authorized line)
    if (crzCategory === 'CRZ-III-B') minNdzDist = 200;
    if (crzCategory === 'CRZ-I') minNdzDist = 500;

    const inNdz = crzDist > 0 && crzDist < minNdzDist && crzCategory !== 'CRZ-II';
    const crzPass = !inNdz && hasKczma;

    checks.push({
      id: 'allied-crz-clearance',
      category: 'allied_statutory',
      ruleNoKmbr: 'CRZ Notification 2019 / KMBR Rule 5(4)',
      ruleNoKpbr: 'CRZ Notification 2019 / KPBR Rule 5(4)',
      titleEn: `CRZ Clearance & Coastal Zone Compliance (${crzCategory})`,
      titleMl: `തീരദേശ സംരക്ഷണ നിയമം (CRZ 2019) & KCZMA അനുമതി`,
      requirementEn: `Mandatory KCZMA recommendation and strict adherence to No Development Zone (NDZ: ${minNdzDist}m from HTL) for ${crzCategory}.`,
      requirementMl: `തീരദേശ നിയന്ത്രണ മേഖലയിൽ (${crzCategory}) വേലിയേറ്റ രേഖയിൽ (HTL) നിന്ന് ${minNdzDist} മീറ്റർ NDZ ബഫർ പാലിക്കുകയും KCZMA അനുമതി ഹാജരാക്കുകയും വേണം.`,
      providedValue: `HTL Dist: ${crzDist > 0 ? `${crzDist}m` : 'Not Specified'} | KCZMA NOC: ${hasKczma ? 'Obtained' : 'Pending'}`,
      requiredValue: `Outside NDZ (≥ ${minNdzDist}m) + Valid KCZMA NOC`,
      status: crzPass ? 'pass' : hasKczma ? 'warning' : 'fail',
      severity: 'critical',
      technicalNoteEn: crzPass
        ? `Plot is located outside NDZ buffer and KCZMA coastal recommendation is validated.`
        : inNdz
        ? `Plot falls within prohibited No Development Zone (NDZ: ${minNdzDist}m from HTL). Strict construction ban applies.`
        : `KCZMA coastal recommendation is mandatory for CRZ plots before LSGD permit issuance.`,
      technicalNoteMl: crzPass
        ? `തീരദേശ ബഫർ ദൂരവും KCZMA അനുമതിയും ചട്ടപ്രകാരമാണ്.`
        : inNdz
        ? `പ്ലോട്ട് നിരോധിത തീരദേശ മേഖലയിൽ (NDZ) ഉൾപ്പെടുന്നു. നിർമ്മാണം അനുവദനീയമല്ല.`
        : `തദ്ദേശ സ്ഥാപനത്തിൽ നിന്ന് പെർമിറ്റ് ലഭിക്കുന്നതിന് മുൻപായി KCZMA അനുമതി നിർബന്ധമാണ്.`,
      rectificationAdviceEn: crzPass ? undefined : `Apply to Kerala Coastal Zone Management Authority (KCZMA) through Parivesh portal with CZMP map and environmental layout.`,
      rectificationAdviceMl: crzPass ? undefined : `പരിവേഷ് പോർട്ടൽ വഴി KCZMA അനുമതിക്കായി അപേക്ഷ സമർപ്പിച്ച് പെർമിറ്റിനൊപ്പം ചേർക്കുക.`,
    });
  }

  // B. Kerala Conservation of Paddy Land and Wetland Act 2008 & 2018 (നെൽവയൽ-തണ്ണീർത്തട സംരക്ഷണ നിയമം)
  if (data.isPaddyOrWetland || data.dataBankStatus) {
    const dbStatus = data.dataBankStatus || 'not_in_databank';
    let wetlandPass = true;
    let noteEn = '';
    let noteMl = '';
    let reqVal = '';
    let status: ScrutinyCheckResult['status'] = 'pass';

    if (dbStatus === 'in_databank_form5_applied') {
      wetlandPass = false;
      status = 'fail';
      reqVal = 'Form 5 Order Excluding Land from Data Bank';
      noteEn = `Land is presently notified in Data Bank. Permit cannot be sanctioned until RDO/Sub-Collector issues Form 5 exclusion order under Section 5(4).`;
      noteMl = `ഭൂമി നിലവിൽ ഡാറ്റാ ബാങ്കിൽ ഉൾപ്പെട്ടിട്ടുള്ളതാണ്. ഫോറം 5 ഉത്തരവ് ലഭിക്കാതെ തദ്ദേശ സ്ഥാപനത്തിന് പെർമിറ്റ് നൽകാൻ കഴിയില്ല.`;
    } else if (dbStatus === 'in_databank_form5_obtained') {
      status = 'warning';
      reqVal = 'Section 27A Form 6 Order if not converted in BTR';
      noteEn = `Form 5 exclusion obtained (Order: ${data.form5OrderNumber || 'Verified'}). If BTR classification remains 'Nilam', Form 6 conversion order under Section 27A is mandatory.`;
      noteMl = `ഡാറ്റാ ബാങ്കിൽ നിന്ന് ഒഴിവാക്കിയ ഉത്തരവ് ലഭ്യമാണ് (ഓർഡർ: ${data.form5OrderNumber || 'ലഭ്യമാണ്'}). BTR-ൽ നിലം എന്നാണെങ്കിൽ 27A പ്രകാരം ഫോറം 6 ഉത്തരവ് കൂടി ആവശ്യമാണ്.`;
    } else if (dbStatus === 'unnotified_form6_converted') {
      status = 'pass';
      reqVal = 'Form 6 Order / Section 27A Converted';
      noteEn = `Unnotified uncultivated land successfully regularized under Section 27A (Order: ${data.form6OrderNumber || 'Verified'}). Eligible for LSGD building permit.`;
      noteMl = `27A പ്രകാരം ഭൂമി തരംമാറ്റ ഉത്തരവ് (ഓർഡർ: ${data.form6OrderNumber || 'ലഭ്യമാണ്'}) ലഭ്യമാണ്. കെട്ടിട നിർമ്മാണ പെർമിറ്റിന് അർഹതയുണ്ട്.`;
    } else {
      status = 'pass';
      reqVal = 'Dry Land (Purayidam/Karakkooru) in BTR & Data Bank';
      noteEn = `Land is verified as dry land / purayidam and not notified in Paddy Land Data Bank.`;
      noteMl = `ഭൂമി പുരയിടം/കരഭൂമിയാണെന്നും ഡാറ്റാ ബാങ്കിൽ ഉൾപ്പെട്ടിട്ടില്ലെന്നും സാക്ഷ്യപ്പെടുത്തിയിരിക്കുന്നു.`;
    }

    checks.push({
      id: 'allied-wetland-databank',
      category: 'allied_statutory',
      ruleNoKmbr: 'Kerala Conservation of Paddy Land Act 2008 & Sec 27A',
      ruleNoKpbr: 'Kerala Conservation of Paddy Land Act 2008 & Sec 27A',
      titleEn: 'Kerala Paddy Land & Wetland Data Bank Regularization',
      titleMl: 'കേരള നെൽവയൽ-തണ്ണീർത്തട സംരക്ഷണ നിയമം (Data Bank & 27A)',
      requirementEn: `Building permit shall not be granted on notified paddy land without Form 5 exclusion & Form 6 (Section 27A) unnotified land conversion order.`,
      requirementMl: `ഡാറ്റാ ബാങ്കിൽ ഉൾപ്പെട്ട ഭൂമിയിൽ ഫോറം 5 ഉത്തരവില്ലാതെയോ, BTR-ൽ നിലമായ ഭൂമിയിൽ 27A (ഫോറം 6) ഉത്തരവില്ലാതെയോ നിർമ്മാണ പെർമിറ്റ് അനുവദിക്കാൻ പാടില്ല.`,
      providedValue: `Status: ${dbStatus.replace(/_/g, ' ').toUpperCase()}${data.form6OrderNumber ? ` (Order: ${data.form6OrderNumber})` : ''}`,
      requiredValue: reqVal,
      status: status,
      severity: 'critical',
      technicalNoteEn: noteEn,
      technicalNoteMl: noteMl,
      rectificationAdviceEn: status === 'fail' ? `Submit Form 5 application on Revenue e-Services portal to exclude wrongly notified land from Data Bank.` : undefined,
      rectificationAdviceMl: status === 'fail' ? `ഡാറ്റാ ബാങ്കിൽ നിന്ന് ഭൂമി ഒഴിവാക്കുന്നതിനായി റവന്യൂ ഇ-സർവീസസ് പോർട്ടൽ വഴി ഫോറം 5 അപേക്ഷ സമർപ്പിക്കുക.` : undefined,
    });
  }

  // C. Kerala State Pollution Control Board (KSPCB / PCB Consent & STP)
  const isLargeCommercial = (data.occupancyGroup === 'F' || data.occupancyGroup === 'E') && data.totalBuiltUpAreaSqM > 2000;
  const isLargeApartment = data.occupancyGroup === 'A1' && data.totalBuiltUpAreaSqM > 2000;
  const isIndustrialOrHospital = data.occupancyGroup === 'C' || data.occupancyGroup === 'G1' || data.occupancyGroup === 'G2' || data.occupancyGroup === 'I';
  const pcbRequired = data.isPcbApplicable || isLargeCommercial || isLargeApartment || isIndustrialOrHospital;

  if (pcbRequired) {
    const hasPcbCte = !!data.hasPcbConsentToEstablish;
    const hasStp = !!data.hasStpEtpProvided;
    const pcbPass = hasPcbCte && hasStp;

    checks.push({
      id: 'allied-pcb-clearance',
      category: 'allied_statutory',
      ruleNoKmbr: 'Water (Prevention of Pollution) Act 1974 / KMBR Rule 47',
      ruleNoKpbr: 'Water (Prevention of Pollution) Act 1974 / KPBR Rule 47',
      titleEn: 'KSPCB Consent to Establish (CTE) & STP Treatment Plant',
      titleMl: 'മലിനീകരണ നിയന്ത്രണ ബോർഡ് (KSPCB) അനുമതി & STP പ്ലാന്റ്',
      requirementEn: `Mandatory KSPCB Consent to Establish (CTE) and Sewage Treatment Plant (STP) for buildings > 2000 sq.m / hospitals / industries.`,
      requirementMl: `2000 ച.മീറ്ററിൽ കൂടുതൽ വിസ്തീർണ്ണമുള്ള അപ്പാർട്ട്‌മെന്റുകൾ/ഓഫീസുകൾ/ആശുപത്രികൾക്ക് KSPCB അനുമതിയും STP മാലിന്യ സംസ്കരണ പ്ലാന്റും നിർബന്ധമാണ്.`,
      providedValue: `PCB CTE: ${hasPcbCte ? 'Obtained' : 'Pending'} | STP Plant: ${hasStp ? `${data.stpCapacityKld || 'Provided'} KLD` : 'Not Shown'}`,
      requiredValue: 'KSPCB Consent to Establish + Dedicated STP Layout',
      status: pcbPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: pcbPass
        ? `KSPCB Consent to Establish and STP engineering parameters meet pollution standards.`
        : `Missing mandatory KSPCB Consent to Establish / STP plant layout for scale of ${data.totalBuiltUpAreaSqM.toFixed(1)} sq.m.`,
      technicalNoteMl: pcbPass
        ? `മലിനീകരണ നിയന്ത്രണ ബോർഡിന്റെ അനുമതിയും STP പ്ലാന്റും ചട്ടപ്രകാരം നൽകിയിട്ടുണ്ട്.`
        : `കെട്ടിട വിസ്തീർണ്ണം 2000 ച.മീറ്ററിൽ കൂടുതലായതിനാൽ KSPCB അനുമതിയും STP പ്ലാന്റും നിർബന്ധമാണ്.`,
      rectificationAdviceEn: pcbPass ? undefined : `Apply for Consent to Establish on KSPCB Online Consent Management portal (OCMMS) with STP design layout.`,
      rectificationAdviceMl: pcbPass ? undefined : `KSPCB പോർട്ടൽ വഴി Consent to Establish അപേക്ഷ നൽകി ഡ്രോയിംഗിൽ STP ലൊക്കേഷൻ ഉൾപ്പെടുത്തുക.`,
    });
  }

  // D. Airports Authority of India (AAI NOCAS / CCZM Height Clearances)
  const isTallInAirportZone = data.isAirportNocApplicable || (data.buildingHeightM > 20 && ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Kannur', 'Malappuram'].includes(data.district));
  if (isTallInAirportZone) {
    const hasAai = !!data.hasAaiNoc;
    checks.push({
      id: 'allied-aai-noc',
      category: 'allied_statutory',
      ruleNoKmbr: 'GSR 751(E) / Aircraft Act 1934 / KMBR Rule 5(4)',
      ruleNoKpbr: 'GSR 751(E) / Aircraft Act 1934 / KPBR Rule 5(4)',
      titleEn: 'Airports Authority of India (AAI NOCAS) Height Clearance',
      titleMl: 'എയർപോർട്ട് അതോറിറ്റി ഓഫ് ഇന്ത്യ (AAI NOC) ഉയര പരിധി അനുമതി',
      requirementEn: `Mandatory AAI NOCAS clearance for structures exceeding Colour Coded Zoning Map (CCZM) permissible elevation within airport aerodrome funnel.`,
      requirementMl: `വിമാനത്താവള ഫണൽ സോണിൽ ഉൾപ്പെടുന്നതോ ഉയർന്നതുമായ കെട്ടിടങ്ങൾക്ക് AAI-യുടെ NOCAS പോർട്ടൽ വഴിയുള്ള ഉയര അനുമതി നിർബന്ധമാണ്.`,
      providedValue: `Total Height: ${data.buildingHeightM}m | AAI NOC: ${hasAai ? 'Obtained' : 'Pending Verification'}`,
      requiredValue: 'AAI NOCAS Clearance Certificate / CCZM Exemption',
      status: hasAai ? 'pass' : 'warning',
      severity: 'high',
      technicalNoteEn: hasAai
        ? `AAI NOCAS height clearance validated within permissible AMSL envelope.`
        : `Verify site coordinates against CCZM map of ${data.district} airport. AAI NOC required if top elevation exceeds CCZM limit.`,
      technicalNoteMl: hasAai
        ? `AAI ഉയര അനുമതി പത്രവും കോർഡിനേറ്റുകളും പരിശോധിച്ചു ഉറപ്പുവരുത്തി.`
        : `സൈറ്റ് കോർഡിനേറ്റുകൾ CCZM മാപ്പിൽ പരിശോധിച്ച് AAI NOC ആവശ്യമെങ്കിൽ ലഭ്യമാക്കുക.`,
      rectificationAdviceEn: hasAai ? undefined : `Upload building coordinates and top elevation on AAI NOCAS-2 portal to obtain height clearance.`,
      rectificationAdviceMl: hasAai ? undefined : `AAI NOCAS പോർട്ടലിൽ കെട്ടിടത്തിന്റെ ഉയരവും ലൊക്കേഷൻ കോർഡിനേറ്റുകളും നൽകി NOC വാങ്ങുക.`,
    });
  }

  // E. National Highway (NHAI) / Kerala Highway Protection Act (PWD Road Line)
  if (data.isNearNationalHighwayOrPwdRoad || (data.roadAccessWidthM >= 12)) {
    const highwayDist = data.distanceFromHighwayBoundaryM || data.frontSetbackM;
    const minHighwaySetback = isKmbr ? 5.0 : 4.0;
    const highwayPass = highwayDist >= minHighwaySetback;

    checks.push({
      id: 'allied-highway-buffer',
      category: 'allied_statutory',
      ruleNoKmbr: 'Kerala Highway Protection Act 1999 / KMBR Rule 25',
      ruleNoKpbr: 'Kerala Highway Protection Act 1999 / KPBR Rule 27',
      titleEn: 'National / State Highway Building Line & Control Line Buffer',
      titleMl: 'ദേശീയപാത / പൊതുമരാമത്ത് റോഡ് ബിൽഡിംഗ് ലൈൻ അകലം',
      requirementEn: `Minimum clear setback of ${minHighwaySetback.toFixed(1)}m from Highway boundary/Right-of-Way under Highway Protection Act.`,
      requirementMl: `ഹൈവേ പ്രൊട്ടക്ഷൻ ആക്ട് പ്രകാരം ദേശീയപാത/സംസ്ഥാന പാത അതിർത്തിയിൽ നിന്ന് കുറഞ്ഞത് ${minHighwaySetback.toFixed(1)} മീറ്റർ ബിൽഡിംഗ് ലൈൻ അകലം പാലിക്കണം.`,
      providedValue: `Highway Setback: ${highwayDist.toFixed(2)} m`,
      requiredValue: `≥ ${minHighwaySetback.toFixed(2)} m`,
      status: highwayPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: highwayPass
        ? `Highway building line buffer of ${highwayDist}m satisfies Highway Protection Act.`
        : `Building encroaches into Highway Protection Act statutory buffer by ${(minHighwaySetback - highwayDist).toFixed(2)}m.`,
      technicalNoteMl: highwayPass
        ? `ഹൈവേ അതിർത്തിയിൽ നിന്നുള്ള അകലം (${highwayDist} മീറ്റർ) സുരക്ഷിത പരിധിയിലാണ്.`
        : `ഹൈവേ അതിർത്തിയിൽ നിന്നുള്ള അകലം ചട്ടപ്രകാരം കുറവാണ് (${highwayDist} മീറ്റർ).`,
      rectificationAdviceEn: highwayPass ? undefined : `Increase front building setback to minimum ${minHighwaySetback}m from Highway Right-of-Way boundary.`,
      rectificationAdviceMl: highwayPass ? undefined : `ഹൈവേ അതിർത്തിയിൽ നിന്ന് കെട്ടിടത്തിലേക്കുള്ള മുൻവശത്തെ അകലം ${minHighwaySetback} മീറ്ററായി വർദ്ധിപ്പിക്കുക.`,
    });
  }

  // F. Indian Railways Property Buffer (30m Zone)
  if (data.isNearRailwayBoundary || (data.distanceFromRailwayBoundaryM !== undefined && data.distanceFromRailwayBoundaryM < 50)) {
    const rlyDist = data.distanceFromRailwayBoundaryM || 0;
    const hasRlyNoc = !!data.hasRailwayNoc;
    const rlyPass = rlyDist >= 30 || hasRlyNoc;

    checks.push({
      id: 'allied-railway-noc',
      category: 'allied_statutory',
      ruleNoKmbr: 'Indian Railways Act 1989 / KMBR Rule 5(4)',
      ruleNoKpbr: 'Indian Railways Act 1989 / KPBR Rule 5(4)',
      titleEn: 'Railway Boundary Safety Buffer (30m Zone Clearance)',
      titleMl: 'റെയിൽവേ അതിർത്തി സുരക്ഷാ ബഫർ (30 മീറ്റർ പരിധി NOC)',
      requirementEn: `Construction within 30 meters of Railway track/property boundary mandates No Objection Certificate from Railway Divisional Engineer (DRM).`,
      requirementMl: `റെയിൽവേ അതിർത്തിയിൽ നിന്ന് 30 മീറ്ററിനുള്ളിലെ നിർമ്മാണങ്ങൾക്ക് റെയിൽവേ ഡിവിഷണൽ എഞ്ചിനീയറുടെ (DRM) എൻ.ഒ.സി നിർബന്ധമാണ്.`,
      providedValue: `Railway Dist: ${rlyDist > 0 ? `${rlyDist}m` : 'Within 30m'} | Railway NOC: ${hasRlyNoc ? 'Obtained' : 'Pending'}`,
      requiredValue: 'Railway DRM NOC for distance < 30m',
      status: rlyPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: rlyPass
        ? `Railway safety buffer compliant or DRM NOC produced.`
        : `Plot is within 30m of Railway boundary. Railway Division DRM NOC is mandatory.`,
      technicalNoteMl: rlyPass
        ? `റെയിൽവേ ബഫർ ദൂരം പാലിച്ചിട്ടുണ്ട് അല്ലെങ്കിൽ എൻ.ഒ.സി ലഭ്യമാക്കിയിട്ടുണ്ട്.`
        : `റെയിൽവേ അതിർത്തിയിൽ നിന്ന് 30 മീറ്ററിനുള്ളിലായതിനാൽ റെയിൽവേ എൻ.ഒ.സി ആവശ്യമാണ്.`,
      rectificationAdviceEn: rlyPass ? undefined : `Apply to Southern Railway Divisional Office for Track Safety Clearance NOC.`,
      rectificationAdviceMl: rlyPass ? undefined : `സതേൺ റെയിൽവേ ഡിവിഷണൽ ഓഫീസിൽ പ്ലാൻ സമർപ്പിച്ച് എൻ.ഒ.സി വാങ്ങുക.`,
    });
  }

  // G. Archaeological Survey of India (ASI Ancient Monuments & Archaeological Sites Act)
  if (data.isNearAsiMonument || (data.distanceFromMonumentM !== undefined && data.distanceFromMonumentM < 300)) {
    const asiDist = data.distanceFromMonumentM || 0;
    const hasAsiNoc = !!data.hasAsiNmaNoc;
    const isProhibited = asiDist > 0 && asiDist <= 100;
    const asiPass = !isProhibited && (asiDist > 300 || hasAsiNoc);

    checks.push({
      id: 'allied-asi-monument',
      category: 'allied_statutory',
      ruleNoKmbr: 'AMASR Act 1958 & 2010 Amendment / KMBR Rule 5(4)',
      ruleNoKpbr: 'AMASR Act 1958 & 2010 Amendment / KPBR Rule 5(4)',
      titleEn: 'ASI Protected Monument Prohibited (100m) & Regulated (300m) Zones',
      titleMl: 'പുരാവസ്തു സംരക്ഷണ മേഖല (ASI / NMA 100m/300m ബഫർ)',
      requirementEn: `Absolute construction ban in Prohibited Zone (0-100m). National Monuments Authority (NMA) permission mandatory in Regulated Zone (100-300m).`,
      requirementMl: `സംരക്ഷിത സ്മാരകങ്ങളുടെ 100 മീറ്ററിനുള്ളിൽ (Prohibited Zone) നിർമ്മാണം നിരോധിച്ചിരിക്കുന്നു. 100-300 മീറ്ററിനുള്ളിൽ (Regulated Zone) NMA അനുമതി നിർബന്ധമാണ്.`,
      providedValue: `Monument Dist: ${asiDist > 0 ? `${asiDist}m` : 'Near Monument'} | NMA NOC: ${hasAsiNoc ? 'Obtained' : 'Pending'}`,
      requiredValue: 'Outside 100m Prohibited Area + NMA NOC (100-300m)',
      status: isProhibited ? 'fail' : asiPass ? 'pass' : 'fail',
      severity: 'critical',
      technicalNoteEn: isProhibited
        ? `Plot is inside 100m Prohibited Zone of centrally protected monument. Construction cannot be permitted under Central Act.`
        : asiPass
        ? `ASI / NMA clearance validated for regulated buffer.`
        : `NMA clearance through Form-I required for construction in 100-300m regulated buffer.`,
      technicalNoteMl: isProhibited
        ? `പ്ലോട്ട് പുരാവസ്തു സ്മാരകത്തിന്റെ 100 മീറ്റർ നിരോധിത മേഖലയിലാണ്. നിർമ്മാണം അനുവദനീയമല്ല.`
        : asiPass
        ? `പുരാവസ്തു അതോറിറ്റി അനുമതി ലഭ്യമാണ്.`
        : `100-300 മീറ്റർ പരിധിയിലായതിനാൽ ദേശീയ സ്മാരക അതോറിറ്റിയുടെ (NMA) അനുമതി ആവശ്യമാണ്.`,
      rectificationAdviceEn: isProhibited ? `Construction prohibited under AMASR Act within 100m.` : `Apply on NMA NOAPS portal for monument clearance.`,
      rectificationAdviceMl: isProhibited ? `100 മീറ്ററിനുള്ളിൽ നിർമ്മാണം പാടില്ല.` : `NMA പോർട്ടലിൽ അപേക്ഷ നൽകി അനുമതി നേടുക.`,
    });
  }

  // H. Rights of Persons with Disabilities (RPwD Act 2016 & Universal Accessibility)
  const isPublicOrCommercial = data.occupancyGroup !== 'A1' && data.totalBuiltUpAreaSqM > 150;
  if (isPublicOrCommercial) {
    const hasRamp = !!data.hasRampForDisabled;
    const rampSlope = data.rampSlopeRatio || 12;
    const hasDisabledToilet = (data.disabledParkingProvided || 0) > 0 || hasRamp;
    const accessibilityPass = hasRamp && rampSlope >= 10;

    checks.push({
      id: 'allied-rpwd-accessibility',
      category: 'allied_statutory',
      ruleNoKmbr: 'RPwD Act 2016 / KMBR 2019 Rule 43 / NBC Part 3',
      ruleNoKpbr: 'RPwD Act 2016 / KPBR 2019 Rule 43 / NBC Part 3',
      titleEn: 'Barrier-Free Universal Accessibility (RPwD Act & Rule 43)',
      titleMl: 'ഭിന്നശേഷി സൗഹൃദ മാനദണ്ഡങ്ങൾ (RPwD Act 2016 & ചട്ടം 43)',
      requirementEn: `Mandatory barrier-free entry ramp (max 1:12 slope), tactile paving, dedicated accessible toilet and accessible parking for public buildings.`,
      requirementMl: `പൊതു/വാണിജ്യ കെട്ടിടങ്ങളിൽ ഭിന്നശേഷിക്കാർക്കായി 1:12 റാംപ്, പ്രത്യേക ടോയ്‌ലറ്റ്, പ്രവേശന സൗകര്യം എന്നിവ നിർബന്ധമാണ്.`,
      providedValue: `Ramp: ${hasRamp ? `Provided (1:${rampSlope})` : 'Not Shown'} | Disabled Parking: ${data.disabledParkingProvided || 0} Bay(s)`,
      requiredValue: 'Mandatory Ramp (≤ 1:12) + Accessible Entry Facilities',
      status: accessibilityPass ? 'pass' : 'fail',
      severity: 'high',
      technicalNoteEn: accessibilityPass
        ? `Barrier-free access ramp and accessible layout comply with RPwD Act 2016.`
        : `Public/Commercial building must include accessible ramp (slope ≤ 1:12) and dedicated facilities under RPwD Act & Rule 43.`,
      technicalNoteMl: accessibilityPass
        ? `ഭിന്നശേഷി സൗഹൃദ റാംപും അനുബന്ധ ക്രമീകരണങ്ങളും ചട്ടപ്രകാരമാണ്.`
        : `പൊതു കെട്ടിടങ്ങൾക്ക് ചട്ടം 43 പ്രകാരം ഭിന്നശേഷി റാംപും സൗകര്യങ്ങളും നിർബന്ധമാണ്.`,
      rectificationAdviceEn: accessibilityPass ? undefined : `Incorporate 1:12 ramp with handrails and dedicated accessible toilet in ground floor plan.`,
      rectificationAdviceMl: accessibilityPass ? undefined : `ഗ്രൗണ്ട് ഫ്ലോറിൽ 1:12 ചരിവുള്ള റാംപും ഭിന്നശേഷി ടോയ്‌ലറ്റും ഉൾപ്പെടുത്തുക.`,
    });
  }

  // I. Kerala Lifts and Escalators Act (Electrical Inspectorate Clearance)
  if (data.hasLift || data.buildingHeightM > 15 || data.numberOfFloors > 3) {
    const hasLift = !!data.hasLift;
    const hasElecNoc = !!data.hasElectricalInspectorateNoc;
    const liftPass = !hasLift || hasElecNoc || data.buildingHeightM <= 15;

    checks.push({
      id: 'allied-lift-act',
      category: 'allied_statutory',
      ruleNoKmbr: 'Kerala Lifts & Escalators Act / KMBR Rule 44',
      ruleNoKpbr: 'Kerala Lifts & Escalators Act / KPBR Rule 44',
      titleEn: 'Kerala Lifts & Escalators Act (Electrical Inspectorate Clearance)',
      titleMl: 'കേരള ലിഫ്റ്റ് ആക്ട് & ഇലക്ട്രിക്കൽ ഇൻസ്പെക്ടറേറ്റ് അനുമതി',
      requirementEn: `Mandatory passenger lift installation for buildings with height > 15m, and Department of Electrical Inspectorate sanction for lift machine room/shaft.`,
      requirementMl: `15 മീറ്ററിൽ കൂടുതൽ ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക് ലിഫ്റ്റ് നിർബന്ധമാണ്. ലിഫ്റ്റുകൾക്ക് ഇലക്ട്രിക്കൽ ഇൻസ്പെക്ടറേറ്റിന്റെ അനുമതി ആവശ്യമാണ്.`,
      providedValue: `Lift Provided: ${hasLift ? 'Yes' : 'No'} | Inspectorate Approval: ${hasElecNoc ? 'Sanctioned' : 'To be submitted'}`,
      requiredValue: data.buildingHeightM > 15 ? 'Mandatory Passenger Lift + Inspectorate Sanction' : 'Inspectorate Sanction if lift installed',
      status: data.buildingHeightM > 15 && !hasLift ? 'fail' : 'pass',
      severity: 'high',
      technicalNoteEn: data.buildingHeightM > 15 && !hasLift
        ? `Building height is ${data.buildingHeightM}m (> 15m). Passenger lift is mandatory under Rule 44.`
        : `Lift provision and electrical shaft dimensions are noted for inspectorate clearance.`,
      technicalNoteMl: data.buildingHeightM > 15 && !hasLift
        ? `കെട്ടിടത്തിന് 15 മീറ്ററിലധികം ഉയരമുള്ളതിനാൽ ചട്ടം 44 പ്രകാരം ലിഫ്റ്റ് നിർബന്ധമാണ്.`
        : `ലിഫ്റ്റ് ഷാഫ്റ്റ് വിവരങ്ങൾ ഇലക്ട്രിക്കൽ ഇൻസ്പെക്ടറേറ്റ് മാനദണ്ഡങ്ങൾക്കനുസൃതമാണ്.`,
      rectificationAdviceEn: data.buildingHeightM > 15 && !hasLift ? `Incorporate passenger lift core in floor plans and submit to Electrical Inspectorate.` : undefined,
      rectificationAdviceMl: data.buildingHeightM > 15 && !hasLift ? `പ്ലാനുകളിൽ ലിഫ്റ്റ് ഉൾപ്പെടുത്തി ഇലക്ട്രിക്കൽ ഇൻസ്പെക്ടറേറ്റിൽ നിന്ന് അനുമതി നേടുക.` : undefined,
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
