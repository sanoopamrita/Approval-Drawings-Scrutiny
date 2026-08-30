export interface RuleDetailItem {
  id: string;
  chapter: string;
  chapterNo: number;
  ruleKmbr: string;
  ruleKpbr: string;
  titleEn: string;
  titleMl: string;
  category: 'General' | 'Permit' | 'Setbacks' | 'Coverage & FAR' | 'Parking' | 'Sanitation' | 'Environment' | 'Fire Safety' | 'Special Buildings' | 'Exemptions' | 'Structural';
  summaryEn: string;
  summaryMl: string;
  fullProvisionsEn: string[];
  fullProvisionsMl: string[];
  keyTables?: { label: string; value: string }[];
  pdfDownloadUrl?: string;
  sourceAuthority: string;
  effectiveDate: string;
}

export interface RuleAmendmentItem {
  id: string;
  orderNumber: string;
  gazetteNumber: string;
  notificationDate: string;
  jurisdictionTarget: 'BOTH' | 'KMBR' | 'KPBR';
  titleEn: string;
  titleMl: string;
  affectedRules: string[];
  summaryEn: string;
  summaryMl: string;
  keyPointsEn: string[];
  keyPointsMl: string[];
  downloadUrl: string;
  sourceDept: string;
}

export interface GovernmentOrderItem {
  id: string;
  orderNumber: string;
  issueDate: string;
  subjectEn: string;
  subjectMl: string;
  category: 'K-Smart & Online' | 'Self Certification' | 'Clarification' | 'Town Planning' | 'Solar & Green' | 'Disaster Management';
  summaryEn: string;
  summaryMl: string;
  applicableTo: 'Corporation & Municipality' | 'Grama Panchayat' | 'All LSGD Bodies';
  downloadUrl: string;
}

export const KERALA_RULES_CHAPTERS = [
  { no: 1, nameEn: 'Chapter I: Definitions & Extent', nameMl: 'അധ്യായം 1: നിർവ്വചനങ്ങളും വ്യാപ്തിയും' },
  { no: 2, nameEn: 'Chapter II: Drawings & Documents', nameMl: 'അധ്യായം 2: ഡ്രോയിംഗുകളും രേഖകളും' },
  { no: 3, nameEn: 'Chapter III: Permit Procedure & K-Smart', nameMl: 'അധ്യായം 3: കെട്ടിട പെർമിറ്റ് നടപടിക്രമങ്ങൾ' },
  { no: 4, nameEn: 'Chapter IV: Access Road & Site Criteria', nameMl: 'അധ്യായം 4: വഴിവീതിയും സൈറ്റ് നിബന്ധനകളും' },
  { no: 5, nameEn: 'Chapter V: Setbacks & Exterior Open Spaces', nameMl: 'അധ്യായം 5: സെറ്റ്ബാക്കുകളും തുറസ്സായ സ്ഥലങ്ങളും' },
  { no: 6, nameEn: 'Chapter VI: Coverage & FAR Standards', nameMl: 'അധ്യായം 6: ഗ്രൗണ്ട് കവറേജും എഫ്.എ.ആറും (FAR)' },
  { no: 7, nameEn: 'Chapter VII: Off-Street Parking Standards', nameMl: 'അധ്യായം 7: വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങൾ' },
  { no: 8, nameEn: 'Chapter VIII: Sanitation, Wells & Waste Disposal', nameMl: 'അധ്യായം 8: സാനിറ്റേഷൻ, കിണർ അകലം, മാലിന്യ സംസ്കരണം' },
  { no: 9, nameEn: 'Chapter IX: Rainwater Harvesting & Solar', nameMl: 'അധ്യായം 9: മഴവെള്ള സംഭരണവും സോളാർ പാനലുകളും' },
  { no: 10, nameEn: 'Chapter X: Small Plot Concessions (<=125 m²)', nameMl: 'അധ്യായം 10: ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ' },
  { no: 11, nameEn: 'Chapter XI: Commercial & Mixed Occupancies', nameMl: 'അധ്യായം 11: വാണിജ്യ കെട്ടിടങ്ങളും മിക്സഡ് ഒക്യുപ്പൻസികളും' },
  { no: 12, nameEn: 'Chapter XII: High-Rise Buildings (>16m)', nameMl: 'അധ്യായം 12: ബഹുനില കെട്ടിടങ്ങളും ഫയർ സേഫ്റ്റിയും' },
];

export const KERALA_COMPLETE_RULES_DATABASE: RuleDetailItem[] = [
  {
    id: 'rule-05',
    chapter: 'Chapter III',
    chapterNo: 3,
    ruleKmbr: 'KMBR Rule 5',
    ruleKpbr: 'KPBR Rule 5',
    titleEn: 'Application for Building Permit and Site Approval',
    titleMl: 'കെട്ടിട പെർമിറ്റിനും സൈറ്റ് അനുമതിക്കുമുള്ള അപേക്ഷ',
    category: 'Permit',
    summaryEn: 'Mandates online submission through K-Smart / LSGD portal along with registered licensee digital signatures, possession certificate, and geo-referenced site plan.',
    summaryMl: 'രജിസ്റ്റർ ചെയ്ത ലൈസൻസിയുടെ ഡിജിറ്റൽ ഒപ്പോടെ കെ-സ്മാർട്ട് വഴി ഓൺലൈനായി അപേക്ഷ സമർപ്പിക്കണം. കൈവശാവകാശ രേഖയും ജിയോ-റെഫറൻസ്ഡ് സൈറ്റ് പ്ലാനും നിർബന്ധം.',
    fullProvisionsEn: [
      'Every person who intends to construct or reconstruct a building shall apply online in the prescribed form via K-Smart portal.',
      'Drawing files must adhere strictly to predefined CAD layering standards (e.g., PLOT_BOUNDARY, SETBACK_FRONT, PLINTH_AREA).',
      'For residential buildings up to 300 sq.m (low risk), self-certification permit generation is enabled subject to auto-scrutiny pass.',
    ],
    fullProvisionsMl: [
      'കെട്ടിടം നിർമ്മിക്കാൻ ഉദ്ദേശിക്കുന്ന ഏതൊരാളും നിർദ്ദിഷ്ട ഫോറത്തിൽ കെ-സ്മാർട്ട് പോർട്ടൽ വഴി ഓൺലൈനായി അപേക്ഷിക്കണം.',
      'ഓട്ടോമേറ്റഡ് സ്ക്രൂട്ടിനിക്കായി ഡ്രോയിംഗുകൾ കൃത്യമായ ലെയർ നാമകരണത്തിൽ (CAD Layers) സമർപ്പിക്കേണ്ടതാണ്.',
      '300 ച.മീറ്റർ വരെയുള്ള ചെറിയ വീടുകൾക്ക് സെൽഫ് സർട്ടിഫിക്കേഷൻ വഴി പെർമിറ്റ് ലഭ്യമാണ്.',
    ],
    keyTables: [
      { label: 'Application Mode', value: '100% Online via K-Smart Portal' },
      { label: 'Low Risk Threshold', value: 'Plinth Area <= 300 sq.m (Residential)' },
      { label: 'Licensee Category', value: 'Registered Engineer / Architect / Supervisor' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette GO(P) No. 77/2019/LSGD',
    effectiveDate: '08 November 2019 (Updated 2026)',
  },
  {
    id: 'rule-22',
    chapter: 'Chapter IV',
    chapterNo: 4,
    ruleKmbr: 'KMBR Rule 22',
    ruleKpbr: 'KPBR Rule 22',
    titleEn: 'Access Road Width & Frontage Requirements',
    titleMl: 'പ്രവേശന വഴിവീതിയും റോഡ് ഫ്രണ്ടേജ് നിബന്ധനകളും',
    category: 'General',
    summaryEn: 'Minimum access road width requirements based on occupancy group and built-up area. For Group A1 residential <= 300 sq.m, minimum width is 1.20m to 1.50m.',
    summaryMl: 'കെട്ടിടത്തിന്റെ വിസ്തീർണ്ണവും ഉപയോഗവും അനുസരിച്ചുള്ള വഴിവീതി. 300 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക് കുറഞ്ഞത് 1.20 മുതൽ 1.50 മീറ്റർ വഴിവീതി മതിയാകും.',
    fullProvisionsEn: [
      'No building shall be constructed on a plot which does not abut an existing street or access pathway.',
      'Residential houses (Group A1) with built-up area <= 300 m²: Minimum 1.20m in Panchayat / 1.50m in Municipality.',
      'Residential houses with area > 300 m² up to 1000 m²: Minimum 3.00m clear width.',
      'Commercial buildings (Group F): Minimum 3.60m to 7.00m depending on floor area and occupancy load.',
    ],
    fullProvisionsMl: [
      'പൊതുവഴിയോ അല്ലെങ്കിൽ നിയമപരമായ പ്രവേശന വഴിയോ ഇല്ലാത്ത പ്ലോട്ടുകളിൽ കെട്ടിട നിർമ്മാണം അനുവദനീയമല്ല.',
      '300 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക്: പഞ്ചായത്തിൽ 1.20 മീറ്ററും മുനിസിപ്പാലിറ്റിയിൽ 1.50 മീറ്ററും കുറഞ്ഞ വഴി വീതി ആവശ്യമാണ്.',
      '300 മുതൽ 1000 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക്: കുറഞ്ഞത് 3.00 മീറ്റർ വഴിവീതി നിർബന്ധമാണ്.',
      'വാണിജ്യ കെട്ടിടങ്ങൾക്ക് (ഗ്രൂപ്പ് എഫ്): വിസ്തീർണ്ണമനുസരിച്ച് 3.60 മീറ്റർ മുതൽ 7.00 മീറ്റർ വരെ വഴിവീതി വേണം.',
    ],
    keyTables: [
      { label: 'Residential <= 300 m²', value: 'Min 1.20m (KPBR) / 1.50m (KMBR)' },
      { label: 'Residential 300-1000 m²', value: 'Min 3.00 meters' },
      { label: 'Commercial Buildings', value: 'Min 3.60m to 7.00m' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 22)',
    effectiveDate: '08 November 2019 (Amended 2020)',
  },
  {
    id: 'rule-27',
    chapter: 'Chapter V',
    chapterNo: 5,
    ruleKmbr: 'KMBR Rule 27',
    ruleKpbr: 'KPBR Rule 25',
    titleEn: 'Exterior Open Spaces and Mandatory Setbacks (Table 4)',
    titleMl: 'തുറസ്സായ സ്ഥലങ്ങളും നിർബന്ധിത സെറ്റ്ബാക്കുകളും (Table 4)',
    category: 'Setbacks',
    summaryEn: 'Comprehensive setback requirements for front, rear, and side boundaries according to height and plot width. Minimum front setback is 3.0m for residential up to 10m height.',
    summaryMl: 'കെട്ടിടത്തിന്റെ ഉയരവും പ്ലോട്ടിന്റെ അളവും അനുസരിച്ചുള്ള മുൻ-പിൻ-വശങ്ങളിലെ സെറ്റ്ബാക്കുകൾ. 10 മീറ്റർ വരെ ഉയരമുള്ള വീടുകൾക്ക് മുൻവശത്ത് കുറഞ്ഞത് 3.0 മീറ്റർ വേണം.',
    fullProvisionsEn: [
      'Every building shall have a clear exterior open air space on all sides as prescribed in Table 4 of the Rules.',
      'Front Open Space: For residential buildings up to 10m height, minimum 3.00m (average 3.00m).',
      'Rear Open Space: Minimum 1.50m with an average of not less than 2.00m (for residential up to 10m height).',
      'Side Open Spaces: Minimum 1.20m on one side and 1.00m on the other side (or 0.90m in small plots).',
      'Projections: Sunshades, eaves, and cornices may project up to 0.60m into open spaces without violation.',
    ],
    fullProvisionsMl: [
      'ഓരോ കെട്ടിടത്തിനും റൂളിലെ ടേബിൾ 4 പ്രകാരം നാല് വശങ്ങളിലും തുറസ്സായ സ്ഥലം ഉണ്ടായിരിക്കണം.',
      'മുൻവശത്തെ സെറ്റ്ബാക്ക്: 10 മീറ്റർ വരെ ഉയരമുള്ള വീടുകൾക്ക് കുറഞ്ഞത് 3.00 മീറ്റർ (ശരാശരി 3.00 മീറ്റർ).',
      'പിൻവശത്തെ സെറ്റ്ബാക്ക്: കുറഞ്ഞത് 1.50 മീറ്ററും ശരാശരി 2.00 മീറ്ററും ഉണ്ടായിരിക്കണം.',
      'വശങ്ങളിലെ സെറ്റ്ബാക്കുകൾ: ഒരു വശത്ത് കുറഞ്ഞത് 1.20 മീറ്ററും മറുവശത്ത് കുറഞ്ഞത് 1.00 മീറ്ററും വേണം.',
      'സൺഷേഡ് പ്രൊജക്ഷൻ: 0.60 മീറ്റർ വരെ സെറ്റ്ബാക്കിലേക്ക് തള്ളിനിൽക്കാം.',
    ],
    keyTables: [
      { label: 'Front Setback (<=10m height)', value: 'Min 3.00m (Average 3.00m)' },
      { label: 'Rear Setback (<=10m height)', value: 'Min 1.50m (Average 2.00m)' },
      { label: 'Side 1 Setback', value: 'Min 1.20 meters' },
      { label: 'Side 2 Setback', value: 'Min 1.00 meters' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Table 4)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-29',
    chapter: 'Chapter VI',
    chapterNo: 6,
    ruleKmbr: 'KMBR Rule 29',
    ruleKpbr: 'KPBR Rule 29',
    titleEn: 'Maximum Ground Coverage and Floor Area Ratio (FAR) (Table 2 & 3)',
    titleMl: 'പരമാവധി ഗ്രൗണ്ട് കവറേജും എഫ്.എ.ആറും (FAR) (Table 2 & 3)',
    category: 'Coverage & FAR',
    summaryEn: 'Ground coverage limits: 60% in KMBR / 65% in KPBR for residential Group A1. Base FAR: 3.0 (KMBR) / 2.75 (KPBR), with additional purchasable FAR provisions.',
    summaryMl: 'ഗ്രൂപ്പ് A1 പാർപ്പിട കെട്ടിടങ്ങൾക്ക് പരമാവധി കവറേജ് മുനിസിപ്പാലിറ്റിയിൽ 60%, പഞ്ചായത്തിൽ 65%. അടിസ്ഥാന FAR യഥാക്രമം 3.0 ഉം 2.75 ഉം ആണ്.',
    fullProvisionsEn: [
      'The maximum ground coverage percentage shall not exceed the limits prescribed in Table 2 for the respective occupancy group.',
      'The Floor Area Ratio (FAR) calculation shall include all built-up floors but exclude parking basements, open balconies up to 10%, and lift wells.',
      'Purchasable FAR: Additional FAR up to 4.00 (KMBR) / 3.50 (KPBR) may be purchased by paying the government compounding fee.',
    ],
    fullProvisionsMl: [
      'കെട്ടിടത്തിന്റെ ഗ്രൗണ്ട് കവറേജ് ടേബിൾ 2-ൽ നിർദ്ദേശിച്ചിട്ടുള്ള പരമാവധി പരിധിയിൽ കവിയാൻ പാടില്ല.',
      'FAR കണക്കാക്കുമ്പോൾ പാർക്കിംഗ് ബേസ്മെന്റുകളും 10% വരെയുള്ള തുറന്ന ബാൽക്കണികളും ഒഴിവാക്കാം.',
      'അധിക FAR: സർക്കാർ നിശ്ചയിച്ച ഫീസ് അടച്ച് 4.00 (KMBR) / 3.50 (KPBR) വരെ അധിക FAR വാങ്ങാവുന്നതാണ്.',
    ],
    keyTables: [
      { label: 'Max Coverage (A1 Residential)', value: '60% (KMBR) / 65% (KPBR)' },
      { label: 'Base FAR (No Fee)', value: '3.00 (KMBR) / 2.75 (KPBR)' },
      { label: 'Max Purchasable FAR', value: '4.00 (KMBR) / 3.50 (KPBR)' },
      { label: 'Commercial Group F Coverage', value: '60% (Max)' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 29)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-31',
    chapter: 'Chapter VII',
    chapterNo: 7,
    ruleKmbr: 'KMBR Rule 31',
    ruleKpbr: 'KPBR Rule 31',
    titleEn: 'Off-Street Parking Requirements and Slot Dimensions (Table 6)',
    titleMl: 'വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങളും പാർക്കിംഗ് സ്ലോട്ട് അളവുകളും (Table 6)',
    category: 'Parking',
    summaryEn: 'Specifies car, two-wheeler, and disabled parking slot requirements. For residential homes <= 150 sq.m: Nil. 150-250 sq.m: 1 car space.',
    summaryMl: 'കാറുകൾ, ഇരുചക്ര വാഹനങ്ങൾ, ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് എന്നിവയ്ക്കുള്ള ചട്ടങ്ങൾ. 150 ച.മീ വരെ പാർക്കിംഗ് നിർബന്ധമില്ല. 150-250 ച.മീറ്ററിന് 1 കാർ പാർക്കിംഗ്.',
    fullProvisionsEn: [
      'Off-street parking space shall be provided within the plot boundaries for motor vehicles as per Table 6.',
      'Minimum standard car parking bay size: 2.50 meters × 5.00 meters clear space.',
      'Minimum two-wheeler slot size: 1.00 meter × 2.00 meters.',
      'Accessible (Disabled / PwD) parking bay: Minimum 3.60 meters × 5.00 meters located within 30m of main building entrance.',
    ],
    fullProvisionsMl: [
      'ടേബിൾ 6 പ്രകാരം പ്ലോട്ടിനുള്ളിൽ തന്നെ ആവശ്യമായ പാർക്കിംഗ് സ്ഥലം ഒരുക്കിയിരിക്കണം.',
      'ഒരു കാർ പാർക്കിംഗ് സ്ലോട്ടിന്റെ കുറഞ്ഞ അളവ്: 2.50 മീറ്റർ × 5.00 മീറ്റർ.',
      'ഇരുചക്ര വാഹന സ്ലോട്ടിന്റെ കുറഞ്ഞ അളവ്: 1.00 മീറ്റർ × 2.00 മീറ്റർ.',
      'ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് സ്ലോട്ട്: 3.60 മീറ്റർ × 5.00 മീറ്റർ പ്രവേശന കവാടത്തിന് 30 മീറ്ററിനുള്ളിൽ വേണം.',
    ],
    keyTables: [
      { label: 'Residential <= 150 m²', value: 'Nil (Not Mandatory)' },
      { label: 'Residential 150 - 250 m²', value: '1 Car Parking Slot' },
      { label: 'Residential > 250 m²', value: '1 Car per 150 m² additional' },
      { label: 'Car Bay Clear Dimension', value: '2.50m × 5.00m' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Table 6)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-47',
    chapter: 'Chapter VIII',
    chapterNo: 8,
    ruleKmbr: 'KMBR Rule 47',
    ruleKpbr: 'KPBR Rule 47',
    titleEn: 'Clearance from Open Drinking Well to Septic Tank and Soak Pit',
    titleMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലം',
    category: 'Sanitation',
    summaryEn: 'Mandatory minimum 7.50 meters clear distance from open drinking well to septic tank, soak pit, or leach pit.',
    summaryMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും തമ്മിൽ കുറഞ്ഞത് 7.50 മീറ്റർ അകലം നിർബന്ധമാണ്.',
    fullProvisionsEn: [
      'Every open well or borewell providing drinking water shall be situated not less than 7.50 meters horizontally from any septic tank, soak pit, or sewage leach pit.',
      'Septic tank must maintain a minimum distance of 1.20 meters from any plot boundary.',
      'For small plots up to 125 sq.m where 7.5m is physically impossible, an approved bio-digester / tertiary packaged STP with effluent disinfection is required.',
    ],
    fullProvisionsMl: [
      'കുടിവെള്ളത്തിനായി ഉപയോഗിക്കുന്ന ഏതൊരു കിണറും ബോർവെല്ലും സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റിൽ നിന്നും കുറഞ്ഞത് 7.50 മീറ്റർ അകലത്തിൽ ആയിരിക്കണം.',
      'സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്നും കുറഞ്ഞത് 1.20 മീറ്റർ അകലം പാലിച്ചിരിക്കണം.',
      '125 ച.മീറ്ററിൽ താഴെയുള്ള ചെറിയ പ്ലോട്ടുകളിൽ ബയോ-ഡൈജസ്റ്റർ ടാങ്കുകൾ ഉപയോഗിക്കാം.',
    ],
    keyTables: [
      { label: 'Well to Septic Tank', value: 'Min 7.50 meters' },
      { label: 'Well to Soak Pit / Leach Bed', value: 'Min 7.50 meters' },
      { label: 'Septic Tank to Boundary', value: 'Min 1.20 meters' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 47)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-48',
    chapter: 'Chapter IX',
    chapterNo: 9,
    ruleKmbr: 'KMBR Rule 48',
    ruleKpbr: 'KPBR Rule 48',
    titleEn: 'Rainwater Harvesting (RWH) Tank Storage Capacity',
    titleMl: 'മഴവെള്ള സംഭരണി സംഭരണ ശേഷി നിബന്ധനകൾ',
    category: 'Environment',
    summaryEn: 'Mandatory for plinth area >= 100 sq.m in KMBR and >= 150 sq.m in KPBR. Formula: 25 Litres storage per sq.m of roof plinth area.',
    summaryMl: 'പ്ലിന്ത് ഏരിയ 100 ച.മീറ്ററിന് (KMBR) / 150 ച.മീറ്ററിന് (KPBR) മുകളിലുള്ള കെട്ടിടങ്ങൾക്ക് നിർബന്ധം. ചതുരശ്ര മീറ്ററിന് 25 ലിറ്റർ എന്ന തോതിൽ സംഭരണ ശേഷി വേണം.',
    fullProvisionsEn: [
      'Every new building having plinth area >= 100 sq.m in Municipality / >= 150 sq.m in Panchayat shall be provided with Rainwater Harvesting facilities.',
      'Calculation formula: Storage Capacity (Litres) = Roof Plinth Area (m²) × 25 Litres.',
      'The RWH system must comprise a first-flush diverter, sand-gravel filter unit, and direct recharge well / storage tank.',
    ],
    fullProvisionsMl: [
      'മുനിസിപ്പാലിറ്റിയിൽ 100 ച.മീറ്ററും പഞ്ചായത്തിൽ 150 ച.മീറ്ററും അതിൽ കൂടുതലും പ്ലിന്ത് ഏരിയയുള്ള എല്ലാ കെട്ടിടങ്ങൾക്കും മഴവെള്ള സംഭരണി നിർബന്ധമാണ്.',
      'കണക്കുകൂട്ടൽ സൂത്രവാക്യം: സംഭരണ ശേഷി (ലിറ്റർ) = റൂഫ് പ്ലിന്ത് ഏരിയ (ച.മീ) × 25 ലിറ്റർ.',
      'ഫിൽട്ടർ ബെഡും ഫസ്റ്റ് ഫ്ലഷ് സംവിധാനവും നിർബന്ധമായും ഉൾപ്പെടുത്തണം.',
    ],
    keyTables: [
      { label: 'Capacity Formula', value: 'Plinth Area (m²) × 25 Litres' },
      { label: 'Applicability KMBR', value: 'Plinth Area >= 100 sq.m' },
      { label: 'Applicability KPBR', value: 'Plinth Area >= 150 sq.m' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 48)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-60',
    chapter: 'Chapter X',
    chapterNo: 10,
    ruleKmbr: 'KMBR Rule 60',
    ruleKpbr: 'KPBR Rule 62',
    titleEn: 'Special Concessions for Small Plots (<= 125 sq.m / 3 Cents)',
    titleMl: 'ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ (125 ച.മീ / 3 സെന്റ്)',
    category: 'Exemptions',
    summaryEn: 'Concessional setbacks for small plots: Front 1.8m, Rear 1.0m, Side 1: 0.9m, Side 2: 0.6m or touching boundary with fire wall and consent.',
    summaryMl: 'ചെറിയ പ്ലോട്ടുകളിലെ പ്രത്യേക ഇളവുകൾ: മുൻവശം 1.8 മീറ്റർ, പിൻവശം 1.0 മീറ്റർ, വശങ്ങളിൽ 0.9 മീറ്ററും 0.6 മീറ്ററും.',
    fullProvisionsEn: [
      'Applicable to land plots having an area not exceeding 125 sq.meters registered prior to the commencement of these rules.',
      'Front Open Space: Concessional minimum 1.80 meters.',
      'Rear Open Space: Concessional minimum 1.00 meter.',
      'Side Open Spaces: Minimum 0.90m on one side, and 0.60m or touching boundary with solid fire wall on the other side.',
      'Maximum ground coverage allowed: up to 75% for residential occupancy.',
    ],
    fullProvisionsMl: [
      '125 ചതുരശ്ര മീറ്ററിൽ (ഏകദേശം 3 സെന്റ്) താഴെ വിസ്തീർണ്ണമുള്ള പ്ലോട്ടുകൾക്ക് ഈ പ്രത്യേക ഇളവുകൾ ബാധകമാണ്.',
      'മുൻവശത്തെ ഇളവ് സെറ്റ്ബാക്ക്: 1.80 മീറ്റർ.',
      'പിൻവശത്തെ ഇളവ് സെറ്റ്ബാക്ക്: 1.00 മീറ്റർ.',
      'വശങ്ങളിലെ സെറ്റ്ബാക്ക്: ഒരു വശത്ത് 0.90 മീറ്ററും മറുവശത്ത് 0.60 മീറ്ററോ അല്ലെങ്കിൽ ഫയർ വാളോടെ അതിർത്തി ചേർത്തോ പണിയാം.',
      'പരമാവധി അനുവദനീയമായ കവറേജ് 75% വരെ.',
    ],
    keyTables: [
      { label: 'Front Setback', value: '1.80 meters' },
      { label: 'Rear Setback', value: '1.00 meters' },
      { label: 'Side 1 Setback', value: '0.90 meters' },
      { label: 'Side 2 Setback', value: '0.60m or Boundary Wall' },
      { label: 'Max Coverage Allowed', value: '75%' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 60 / Rule 62)',
    effectiveDate: '08 November 2019 (Clarified 2026)',
  },
];

export const KERALA_AMENDMENTS_FULL_ARCHIVE: RuleAmendmentItem[] = [
  {
    id: 'amend-2026-02',
    orderNumber: 'GO(P) No. 12/2026/LSGD',
    gazetteNumber: 'Kerala Gazette Vol. XV, No. 214',
    notificationDate: '15 February 2026',
    jurisdictionTarget: 'BOTH',
    titleEn: 'Clarification on Small Plot (<125 sq.m) Fire Wall and Boundary Clearances',
    titleMl: '125 ച.മീറ്ററിൽ താഴെയുള്ള ചെറിയ പ്ലോട്ടുകളിലെ ഫയർ വാളും അതിർത്തി അകലവും സംബന്ധിച്ച സമഗ്ര ഭേദഗതി',
    affectedRules: ['KMBR Rule 60', 'KPBR Rule 62', 'Table 4 (Setbacks)'],
    summaryEn: 'Permits construction touching boundary on one side with solid masonry fire wall if neighbor gives registered consent or if side width is <= 0.6m in plots <= 125 sq.m.',
    summaryMl: '125 ചതുരശ്ര മീറ്ററിൽ താഴെയുള്ള പ്ലോട്ടുകളിൽ അയൽവാസിയുടെ സമ്മതത്തോടെയോ അല്ലെങ്കിൽ 0.6 മീറ്റർ അകലത്തിലോ ഫയർ വാളോടെ അതിർത്തി ചേർത്ത് നിർമ്മിക്കാൻ അനുമതി.',
    keyPointsEn: [
      'Allows solid 20cm masonry fire protection wall touching side boundary.',
      'No openings (windows, ventilators) allowed on boundary-touching wall.',
      'Rainwater drainage must be fully contained within applicant plot.',
    ],
    keyPointsMl: [
      'അതിർത്തി തൊട്ടുള്ള നിർമ്മാണത്തിന് 20 സെ.മീ കനമുള്ള ഫയർ വാൾ നിർബന്ധം.',
      'അതിർത്തി വശത്തേക്ക് ജനലുകളോ വെന്റിലേറ്ററുകളോ അനുവദിക്കില്ല.',
      'മേൽക്കൂരയിലെ മഴവെള്ളം സ്വന്തം പ്ലോട്ടിൽ തന്നെ വീഴുന്ന രീതിയിലായിരിക്കണം.',
    ],
    downloadUrl: 'https://lsgkerala.gov.in',
    sourceDept: 'Local Self Government Department, Govt of Kerala',
  },
  {
    id: 'amend-2025-08',
    orderNumber: 'GO(P) No. 04/2025/LSGD',
    gazetteNumber: 'Kerala Gazette Vol. XIV, No. 982',
    notificationDate: '20 August 2025',
    jurisdictionTarget: 'BOTH',
    titleEn: 'Green Building FAR Bonus & EV Charging Station Provisions in Commercial & Group A1 Apartments',
    titleMl: 'ഗ്രീൻ ബിൽഡിംഗ് FAR ബോണസും വാണിജ്യ/അപ്പാർട്ട്മെന്റ് സമുച്ചയങ്ങളിലെ ഇ.വി ചാർജിംഗ് പോയിന്റുകളും',
    affectedRules: ['KMBR Rule 29', 'KPBR Rule 29', 'Rule 31 (Parking Table 6)'],
    summaryEn: '5% bonus FAR for GRIHA / IGBC certified buildings; Mandatory 10% of total car parking slots designated with Level 2 AC EV chargers for commercial and apartment complexes.',
    summaryMl: 'ഗ്രീൻ റേറ്റിംഗ് ഉള്ള കെട്ടിടങ്ങൾക്ക് 5% അധിക FAR ബോണസ്; വാണിജ്യ/പാർപ്പിട സമുച്ചയങ്ങളിൽ ആകെ പാർക്കിംഗിന്റെ 10% ഇലക്ട്രിക് വാഹന ചാർജിംഗ് പോയിന്റുകളാക്കണം.',
    keyPointsEn: [
      '5% bonus FAR for 4-star GRIHA / Gold IGBC green certified buildings.',
      'Dedicated conduit & 10% Level-2 EV charger parking mandate for Group A1 Apartments (>10 units) & Group F Commercial.',
    ],
    keyPointsMl: [
      'GRIHA / IGBC അംഗീകാരമുള്ള കെട്ടിടങ്ങൾക്ക് 5% അധിക സൗജന്യ FAR.',
      '10 ഫ്ലാറ്റുകളിൽ കൂടുതലുള്ള അപ്പാർട്ട്മെന്റുകളിലും വാണിജ്യ സ്ഥാപനങ്ങളിലും 10% ഇ.വി ചാർജിംഗ് പാർക്കിംഗ്.',
    ],
    downloadUrl: 'https://lsgkerala.gov.in',
    sourceDept: 'Local Self Government Department, Govt of Kerala',
  },
  {
    id: 'amend-2024-04',
    orderNumber: 'GO(Ms) No. 89/2024/LSGD',
    gazetteNumber: 'Kerala Gazette Vol. XIII, No. 512',
    notificationDate: '10 April 2024',
    jurisdictionTarget: 'BOTH',
    titleEn: 'K-Smart Automated Digital Plan Scrutiny & Low-Risk Self Certification Guidelines',
    titleMl: 'കെ-സ്മാർട്ട് ഓൺലൈൻ ഓട്ടോമേറ്റഡ് പ്ലാൻ പരിശോധനയും ലോ-റിസ്ക് സെൽഫ് സർട്ടിഫിക്കേഷനും',
    affectedRules: ['KMBR Rule 5', 'KPBR Rule 5', 'Rule 10 (Permit Issuance)'],
    summaryEn: 'Instant building permit issuance through self-certification for residential buildings up to 300 sq.m (low risk category) with strict automated drawing scrutiny standards.',
    summaryMl: '300 ചതുരശ്ര മീറ്റർ വരെയുള്ള ചെറിയ വീടുകൾക്ക് സെൽഫ് സർട്ടിഫിക്കേഷൻ വഴി ഉടനടി കെട്ടിട പെർമിറ്റ് ലഭ്യമാക്കുന്നതിനുള്ള കെ-സ്മാർട്ട് ചട്ടങ്ങൾ.',
    keyPointsEn: [
      'Automated CAD layer verification via K-Smart engine.',
      'Instant digital permit acknowledgment for compliant drawings.',
      'Random audit checks by LSGD engineers within 15 days.',
    ],
    keyPointsMl: [
      'കെ-സ്മാർട്ട് വഴി ഓട്ടോമേറ്റഡ് ഡ്രോയിംഗ് സ്ക്രൂട്ടിനി.',
      'ചട്ടങ്ങൾ പാലിക്കുന്ന ഡ്രോയിംഗുകൾക്ക് ഉടൻ തന്നെ ഡിജിറ്റൽ പെർമിറ്റ് ലഭ്യമാകുന്നു.',
      '15 ദിവസത്തിനുള്ളിൽ എഞ്ചിനീയർമാരുടെ പരിശോധന.',
    ],
    downloadUrl: 'https://lsgkerala.gov.in',
    sourceDept: 'Local Self Government Department, Govt of Kerala',
  },
  {
    id: 'amend-2023-11',
    orderNumber: 'GO(P) No. 16/2023/LSGD',
    gazetteNumber: 'Kerala Gazette Vol. XII, No. 1204',
    notificationDate: '18 November 2023',
    jurisdictionTarget: 'BOTH',
    titleEn: 'Rooftop Solar PV Installation Mandate and Purchasable FAR Slabs',
    titleMl: 'റൂഫ്‌ടോപ്പ് സോളാർ പാനൽ നിർബന്ധമാക്കലും അധിക FAR നിരക്ക് പരിഷ്കരണവും',
    affectedRules: ['KMBR Rule 49', 'KPBR Rule 49', 'Rule 29(4)'],
    summaryEn: 'Mandatory on-grid rooftop solar PV for all commercial buildings above 200 sq.m and other occupancies above 500 sq.m. Standardized fee slabs for purchasable FAR.',
    summaryMl: '200 ച.മീറ്ററിന് മുകളിലുള്ള വാണിജ്യ കെട്ടിടങ്ങൾക്കും 500 ച.മീറ്ററിന് മുകളിലുള്ള മറ്റ് കെട്ടിടങ്ങൾക്കും റൂഫ്‌ടോപ്പ് സോളാർ നിർബന്ധമാക്കി.',
    keyPointsEn: [
      '1 KW solar PV per 100 sq.m built-up area for commercial complexes.',
      'Standardized district-wise compounding fee matrix for purchasable FAR.',
    ],
    keyPointsMl: [
      'വാണിജ്യ കെട്ടിടങ്ങൾക്ക് വിസ്തീർണ്ണത്തിനനുസരിച്ച് റൂഫ് ടോപ്പ് സോളാർ പാനൽ.',
      'അധിക FAR ഫീസ് ഘടന ഏകീകരിച്ചു.',
    ],
    downloadUrl: 'https://lsgkerala.gov.in',
    sourceDept: 'Local Self Government Department, Govt of Kerala',
  },
  {
    id: 'amend-2020-09',
    orderNumber: 'GO(P) No. 47/2020/LSGD',
    gazetteNumber: 'Kerala Gazette Extraordinary No. 2084',
    notificationDate: '22 September 2020',
    jurisdictionTarget: 'BOTH',
    titleEn: 'Kerala Municipality Building (Amendment) Rules, 2020 - Comprehensive Rationalization',
    titleMl: 'കേരള മുനിസിപ്പാലിറ്റി & പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ (ഭേദഗതി) ചട്ടങ്ങൾ 2020',
    affectedRules: ['KMBR Rule 22', 'Rule 27', 'Rule 31', 'Rule 47', 'Rule 48'],
    summaryEn: 'Rationalized road width requirements for residential homes up to 300 sq.m; standard 7.5m clearance between open drinking well and septic tank/soak pit reaffirmed.',
    summaryMl: '300 ചതുരശ്ര മീറ്റർ വരെയുള്ള വീടുകൾക്കുള്ള വഴി വീതി ഇളവുകൾ; കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിൽ 7.5 മീറ്റർ അകലം കർശനമാക്കി.',
    keyPointsEn: [
      'Road width relaxed to 1.20m in panchayats for houses <= 300 m².',
      'Setback calculations simplified for stepped terrain and irregular plots.',
    ],
    keyPointsMl: [
      'ചെറിയ വീടുകൾക്കുള്ള വഴിവീതിയിൽ ഇളവ്.',
      'സെറ്റ്ബാക്ക് കണക്കുകൂട്ടലുകൾ ലളിതമാക്കി.',
    ],
    downloadUrl: 'https://lsgkerala.gov.in',
    sourceDept: 'Local Self Government Department, Govt of Kerala',
  },
];

export const KERALA_GOVERNMENT_ORDERS: GovernmentOrderItem[] = [
  {
    id: 'go-2026-01',
    orderNumber: 'GO(Rt) No. 34/2026/LSGD',
    issueDate: '28 January 2026',
    subjectEn: 'Standard Operating Procedure (SOP) for CAD Layering Validation in K-Smart Scrutiny',
    subjectMl: 'കെ-സ്മാർട്ട് പ്ലാൻ പരിശോധനയിലെ സി.എ.ഡി (CAD) ലെയർ ക്രമീകരണങ്ങൾ സംബന്ധിച്ച മാർഗ്ഗരേഖ',
    category: 'K-Smart & Online',
    summaryEn: 'Directs all LSGD local bodies to standardize CAD drawing layer names for automated digital permit approvals.',
    summaryMl: 'ഓൺലൈൻ പെർമിറ്റുകൾ വേഗത്തിലാക്കാൻ എല്ലാ തദ്ദേശ സ്ഥാപനങ്ങളിലും CAD ലെയർ നാമകരണങ്ങൾ ഏകീകരിച്ചു.',
    applicableTo: 'All LSGD Bodies',
    downloadUrl: 'https://lsgkerala.gov.in',
  },
  {
    id: 'go-2025-11',
    orderNumber: 'GO(Ms) No. 112/2025/LSGD',
    issueDate: '14 November 2025',
    subjectEn: 'Chief Town Planner Circular on Setback Averages for Irregular and Tapering Plots',
    subjectMl: 'വളവുകളുള്ള പ്ലോട്ടുകളിലെ ശരാശരി സെറ്റ്ബാക്ക് കണക്കാക്കൽ സംബന്ധിച്ച ചീഫ് ടൗൺ പ്ലാനറുടെ സർക്കുലർ',
    category: 'Clarification',
    summaryEn: 'Clarifies method of calculating average setbacks when rear or side plot boundary lines are non-parallel or tapering.',
    summaryMl: 'ചതുരാകൃതിയിലല്ലാത്ത പ്ലോട്ടുകളിൽ ശരാശരി സെറ്റ്ബാക്ക് കണക്കാക്കുന്നതിനുള്ള കൃത്യമായ സൂത്രവാക്യം.',
    applicableTo: 'All LSGD Bodies',
    downloadUrl: 'https://lsgkerala.gov.in',
  },
  {
    id: 'go-2024-06',
    orderNumber: 'GO(P) No. 78/2019/LSGD',
    issueDate: '08 November 2019',
    subjectEn: 'Kerala Panchayat Building Rules, 2019 (KPBR 2019) Principal Enactment',
    subjectMl: 'കേരള പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 (KPBR 2019) വിജ്ഞാപനം',
    category: 'Town Planning',
    summaryEn: 'The principal statutory building rules governing all Grama Panchayats in the State of Kerala.',
    summaryMl: 'കേരളത്തിലെ എല്ലാ ഗ്രാമപഞ്ചായത്തുകൾക്കും ബാധകമായ പ്രധാന കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ.',
    applicableTo: 'Grama Panchayat',
    downloadUrl: 'https://lsgkerala.gov.in',
  },
  {
    id: 'go-2024-05',
    orderNumber: 'GO(P) No. 77/2019/LSGD',
    issueDate: '08 November 2019',
    subjectEn: 'Kerala Municipality Building Rules, 2019 (KMBR 2019) Principal Enactment',
    subjectMl: 'കേരള മുനിസിപ്പാലിറ്റി കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ 2019 (KMBR 2019) വിജ്ഞാപനം',
    category: 'Town Planning',
    summaryEn: 'The principal statutory building rules governing all Municipalities and Municipal Corporations in Kerala.',
    summaryMl: 'കേരളത്തിലെ എല്ലാ നഗരസഭകൾക്കും കോർപ്പറേഷനുകൾക്കും ബാധകമായ പ്രധാന കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ.',
    applicableTo: 'Corporation & Municipality',
    downloadUrl: 'https://lsgkerala.gov.in',
  },
];
