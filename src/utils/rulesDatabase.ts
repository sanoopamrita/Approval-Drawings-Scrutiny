export interface RuleDetailItem {
  id: string;
  chapter: string;
  chapterNo: number;
  ruleKmbr: string;
  ruleKpbr: string;
  titleEn: string;
  titleMl: string;
  category:
    | 'General'
    | 'Permit'
    | 'Access & Road'
    | 'Setbacks'
    | 'Coverage & FAR'
    | 'Parking'
    | 'Sanitation'
    | 'Environment'
    | 'Small Plots'
    | 'Special Buildings'
    | 'Fire & High-Rise'
    | 'Staircase & Exits'
    | 'Solar & Green'
    | 'Regularization';
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
  category: 'K-Smart & Online' | 'Self Certification' | 'Clarification' | 'Town Planning' | 'Solar & Green' | 'Disaster Management' | 'Fire Safety';
  summaryEn: string;
  summaryMl: string;
  applicableTo: 'Corporation & Municipality' | 'Grama Panchayat' | 'All LSGD Bodies';
  downloadUrl: string;
}

export interface StatutoryQuickMatrix {
  id: string;
  titleEn: string;
  titleMl: string;
  category: string;
  headers: string[];
  rows: { label: string; values: string[] }[];
  noteEn?: string;
  noteMl?: string;
}

export const KERALA_RULES_CHAPTERS = [
  { no: 1, nameEn: 'Chapter I: Definitions & Extent (Rules 1-4)', nameMl: 'അധ്യായം 1: നിർവ്വചനങ്ങളും വ്യാപ്തിയും (ചട്ടം 1-4)' },
  { no: 2, nameEn: 'Chapter II: Drawings, CAD Standards & Documents (Rules 5-7)', nameMl: 'അധ്യായം 2: ഡ്രോയിംഗുകളും സി.എ.ഡി മാനദണ്ഡങ്ങളും (ചട്ടം 5-7)' },
  { no: 3, nameEn: 'Chapter III: Permit Procedure & K-Smart (Rules 8-21)', nameMl: 'അധ്യായം 3: കെട്ടിട പെർമിറ്റ് നടപടിക്രമങ്ങളും കെ-സ്മാർട്ടും (ചട്ടം 8-21)' },
  { no: 4, nameEn: 'Chapter IV: Access Road Width & Site Criteria (Rules 22-26)', nameMl: 'അധ്യായം 4: വഴിവീതിയും സൈറ്റ് നിബന്ധനകളും (ചട്ടം 22-26)' },
  { no: 5, nameEn: 'Chapter V: Setbacks & Exterior Open Spaces (Rules 27-31)', nameMl: 'അധ്യായം 5: സെറ്റ്ബാക്കുകളും തുറസ്സായ സ്ഥലങ്ങളും (ചട്ടം 27-31)' },
  { no: 6, nameEn: 'Chapter VI: Coverage & FAR Standards (Rules 32-35)', nameMl: 'അധ്യായം 6: ഗ്രൗണ്ട് കവറേജും എഫ്.എ.ആറും (FAR) (ചട്ടം 32-35)' },
  { no: 7, nameEn: 'Chapter VII: Off-Street Parking Standards (Rules 36-41)', nameMl: 'അധ്യായം 7: വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങൾ (ചട്ടം 36-41)' },
  { no: 8, nameEn: 'Chapter VIII: Sanitation, Wells & Waste Disposal (Rules 42-47)', nameMl: 'അധ്യായം 8: സാനിറ്റേഷൻ, കിണർ അകലം, മാലിന്യ സംസ്കരണം (ചട്ടം 42-47)' },
  { no: 9, nameEn: 'Chapter IX: Rainwater Harvesting & Solar Energy (Rules 48-52)', nameMl: 'അധ്യായം 9: മഴവെള്ള സംഭരണവും സോളാർ പാനലുകളും (ചട്ടം 48-52)' },
  { no: 10, nameEn: 'Chapter X: Small Plot Concessions <=125 m² (Rules 60/62)', nameMl: 'അധ്യായം 10: ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ (ചട്ടം 60/62)' },
  { no: 11, nameEn: 'Chapter XI: Special Occupancies & Exits (Rules 63-75)', nameMl: 'അധ്യായം 11: വാണിജ്യ, അസംബ്ലി, സ്കൂൾ, ആശുപത്രി കെട്ടിടങ്ങൾ (ചട്ടം 63-75)' },
  { no: 12, nameEn: 'Chapter XII: High-Rise Buildings (>16m) & NBC Fire Safety (Rules 76-88)', nameMl: 'അധ്യായം 12: ബഹുനില കെട്ടിടങ്ങളും ഫയർ സുരക്ഷയും (ചട്ടം 76-88)' },
  { no: 13, nameEn: 'Chapter XIII: Telecommunication Towers & Structure Safety (Rules 89-94)', nameMl: 'അധ്യായം 13: ടെലികോം ടവറുകളും സ്ട്രക്ചറൽ സുരക്ഷയും (ചട്ടം 89-94)' },
  { no: 14, nameEn: 'Chapter XIV: Coastal (CRZ), Heritage & Airport Clearances (Rules 95-102)', nameMl: 'അധ്യായം 14: തീരദേശ (CRZ), ഹെറിറ്റേജ് & എയർപോർട്ട് അനുമതികൾ (ചട്ടം 95-102)' },
  { no: 15, nameEn: 'Chapter XV: Regularization & Compounding Procedures (Rules 103-108)', nameMl: 'അധ്യായം 15: ക്രമവൽക്കരണവും കോമ്പൗണ്ടിംഗും (ചട്ടം 103-108)' },
];

export const KERALA_COMPLETE_RULES_DATABASE: RuleDetailItem[] = [
  {
    id: 'rule-01',
    chapter: 'Chapter I',
    chapterNo: 1,
    ruleKmbr: 'KMBR Rule 1 & 2',
    ruleKpbr: 'KPBR Rule 1 & 2',
    titleEn: 'Short Title, Extent, Commencement & Key Statutory Definitions',
    titleMl: 'പേര്, വ്യാപ്തി, പ്രാബല്യം, സുപ്രധാന നിർവ്വചനങ്ങളും ഒക്യുപ്പൻസികളും',
    category: 'General',
    summaryEn: 'Defines plinth area, carpet area, built-up area, Floor Area Ratio (FAR), coverage, setback, courtyard, and Occupancy Groups (A1 Residential, A2 Lodging, B Educational, C Hospital, D Assembly, E Office, F Commercial, G Industrial, H Storage, I Hazardous).',
    summaryMl: 'പ്ലിന്ത് ഏരിയ, കാർപെറ്റ് ഏരിയ, ബിൽറ്റ്-അപ്പ് ഏരിയ, എഫ്.എ.ആർ (FAR), ഗ്രൗണ്ട് കവറേജ്, സെറ്റ്ബാക്ക്, ഒക്യുപ്പൻസി ഗ്രൂപ്പുകൾ (A1 പാർപ്പിടം മുതൽ I അപകടകരമായത് വരെ) എന്നിവയുടെ നിർവ്വചനങ്ങൾ.',
    fullProvisionsEn: [
      'Applicable to all building constructions, reconstructions, alterations, and additions in Kerala.',
      'Plinth Area: The built-up covered area measured at the floor level of the basement or of any story.',
      'FAR (Floor Area Ratio): The quotient obtained by dividing the total built-up area on all floors by the area of the plot.',
      'Ground Coverage: The percentage of the plot area covered by the building plinth.',
      'Occupancy Group A1 includes single family dwellings, duplexes, multi-family flats, and apartments.',
    ],
    fullProvisionsMl: [
      'കേരളത്തിലെ എല്ലാ പുതിയ കെട്ടിട നിർമ്മാണങ്ങൾക്കും കൂട്ടിച്ചേർക്കലുകൾക്കും ഈ ചട്ടങ്ങൾ ബാധകമാണ്.',
      'പ്ലിന്ത് ഏരിയ: തറനിരപ്പിൽ അളക്കുന്ന കെട്ടിടത്തിന്റെ മൂടിയ ആകെ വിസ്തീർണ്ണം.',
      'FAR (Floor Area Ratio): കെട്ടിടത്തിന്റെ എല്ലാ നിലകളിലെയും ആകെ ബിൽറ്റ്-അപ്പ് വിസ്തീർണ്ണത്തെ പ്ലോട്ടിന്റെ വിസ്തീർണ്ണം കൊണ്ട് ഹരിക്കുമ്പോൾ ലഭിക്കുന്ന സംഖ്യ.',
      'ഗ്രൗണ്ട് കവറേജ്: പ്ലോട്ടിന്റെ വിസ്തീർണ്ണത്തിൽ കെട്ടിടം കയ്യടക്കുന്ന വിസ്തീർണ്ണത്തിന്റെ ശതമാനം.',
      'ഗ്രൂപ്പ് A1 ൽ ഒറ്റ വീടുകൾ, ഡ്യൂപ്ലക്സ്, ഫ്ലാറ്റുകൾ, അപ്പാർട്ട്മെന്റുകൾ എന്നിവ ഉൾപ്പെടുന്നു.',
    ],
    keyTables: [
      { label: 'Group A1', value: 'Residential Houses, Villas, Flats, Apartments' },
      { label: 'Group B', value: 'Educational (Schools, Colleges, Day Care)' },
      { label: 'Group C', value: 'Institutional / Hospitals / Nursing Homes' },
      { label: 'Group D', value: 'Assembly / Auditoriums / Theatres / Malls' },
      { label: 'Group F', value: 'Commercial / Shops / Showrooms / Supermarkets' },
      { label: 'Group G', value: 'Industrial / Factories / Workshops' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette GO(P) No. 77/2019/LSGD & GO(P) No. 78/2019/LSGD',
    effectiveDate: '08 November 2019 (Amended to 2026)',
  },
  {
    id: 'rule-05',
    chapter: 'Chapter II & III',
    chapterNo: 3,
    ruleKmbr: 'KMBR Rule 5 & 6',
    ruleKpbr: 'KPBR Rule 5 & 6',
    titleEn: 'Application for Building Permit, K-Smart Online Submission & CAD Layers',
    titleMl: 'കെട്ടിട പെർമിറ്റിനുള്ള അപേക്ഷ, കെ-സ്മാർട്ട് ഓൺലൈൻ സമർപ്പണവും സി.എ.ഡി ലെയറുകളും',
    category: 'Permit',
    summaryEn: 'Mandates online submission through K-Smart / LSGD portal along with registered licensee digital signatures, possession certificate, and geo-referenced CAD drawing files with standardized layer naming.',
    summaryMl: 'രജിസ്റ്റർ ചെയ്ത ലൈസൻസിയുടെ ഡിജിറ്റൽ ഒപ്പോടെ കെ-സ്മാർട്ട് വഴി ഓൺലൈനായി അപേക്ഷ സമർപ്പിക്കണം. കൈവശാവകാശ രേഖയും ജിയോ-റെഫറൻസ്ഡ് സി.എ.ഡി ഡ്രോയിംഗും നിർബന്ധം.',
    fullProvisionsEn: [
      'Every person intending to construct or alter a building shall apply online in the prescribed format via K-Smart portal.',
      'Drawing files must adhere strictly to predefined CAD layering standards (e.g., PLOT_BOUNDARY, SETBACK_FRONT, PLINTH_AREA, PARKING_CAR, WELL_CLEARANCE).',
      'For residential buildings up to 300 sq.m (low risk), self-certification permit generation is enabled with instant digital acknowledgment upon automated rules verification.',
      'Permit fees shall be calculated automatically as per Schedule I based on the total built-up floor area.',
    ],
    fullProvisionsMl: [
      'കെട്ടിടം നിർമ്മിക്കാൻ ഉദ്ദേശിക്കുന്ന ഏതൊരാളും നിർദ്ദിഷ്ട ഫോറത്തിൽ കെ-സ്മാർട്ട് പോർട്ടൽ വഴി ഓൺലൈനായി അപേക്ഷിക്കണം.',
      'ഓട്ടോമേറ്റഡ് സ്ക്രൂട്ടിനിക്കായി ഡ്രോയിംഗുകൾ കൃത്യമായ ലെയർ നാമകരണത്തിൽ (CAD Layers) സമർപ്പിക്കേണ്ടതാണ്.',
      '300 ച.മീറ്റർ വരെയുള്ള ചെറിയ വീടുകൾക്ക് സെൽഫ് സർട്ടിഫിക്കേഷൻ വഴി ഉടനടി പെർമിറ്റ് ലഭ്യമാണ്.',
      'വിസ്തീർണ്ണത്തിനനുസരിച്ചുള്ള പെർമിറ്റ് ഫീസ് ഷെഡ്യൂൾ 1 പ്രകാരം ഓൺലൈനായി അടയ്ക്കണം.',
    ],
    keyTables: [
      { label: 'Application Mode', value: '100% Online via K-Smart Portal' },
      { label: 'Low Risk Self-Cert Limit', value: 'Built-up Area <= 300 sq.m (Residential)' },
      { label: 'Drawing Scale', value: '1:100 (Building) / 1:200 or 1:400 (Site Plan)' },
      { label: 'Licensee Digital Sign', value: 'Mandatory (Registered Architect / Engineer)' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette GO(P) No. 77/2019/LSGD',
    effectiveDate: '08 November 2019 (Updated for K-Smart 2026)',
  },
  {
    id: 'rule-10',
    chapter: 'Chapter III',
    chapterNo: 3,
    ruleKmbr: 'KMBR Rule 10, 11 & 14',
    ruleKpbr: 'KPBR Rule 10, 11 & 14',
    titleEn: 'Permit Validity Period, Deemed Permit Approval (30 Days) & Renewals',
    titleMl: 'പെർമിറ്റ് കാലാവധി, 30 ദിവസത്തെ ഡീംഡ് പെർമിറ്റ് അനുമതി, പുതുക്കൽ ചട്ടങ്ങൾ',
    category: 'Permit',
    summaryEn: 'Building permits remain valid for a period of 5 years from issuance date. Extensible up to a maximum total of 9 years. If the Secretary fails to dispose of the application within 30 days, deemed permit provisions apply.',
    summaryMl: 'പെർമിറ്റിന്റെ കാലാവധി അനുവദിച്ച തീയതി മുതൽ 5 വർഷമാണ്. ഫീസ് അടച്ച് പരമാവധി 9 വർഷം വരെ നീട്ടാം. അപേക്ഷയിൽ 30 ദിവസത്തിനകം തീർപ്പ് കൽപ്പിക്കാത്ത പക്ഷം ഡീംഡ് പെർമിറ്റ് ബാധകമാണ്.',
    fullProvisionsEn: [
      'Initial permit validity is 5 years from date of sanction.',
      'Extension of permit: Can be extended for further periods not exceeding 4 additional years (total 9 years maximum) upon payment of renewal fee.',
      'Deemed Permit: If Secretary does not issue permit or reference within 30 days of receiving complete application, applicant may issue written notice and deemed approval becomes enforceable.',
      'Completion Certificate (Rule 20): Licensee must submit completion certificate after construction before occupying the premises.',
    ],
    fullProvisionsMl: [
      'പ്രാരംഭ പെർമിറ്റ് കാലാവധി 5 വർഷമാണ്.',
      'പുതുക്കൽ: അധികമായി 4 വർഷം കൂടി (ആകെ 9 വർഷം വരെ) പുതുക്കാവുന്നതാണ്.',
      'ഡീംഡ് പെർമിറ്റ്: പൂർണ്ണമായ അപേക്ഷ ലഭിച്ച് 30 ദിവസത്തിനകം സെക്രട്ടറി തീരുമാനം അറിയിക്കാതിരുന്നാൽ ഡീംഡ് പെർമിറ്റ് ലഭ്യമാകും.',
      'കംപ്ലീഷൻ സർട്ടിഫിക്കറ്റ്: നിർമ്മാണം പൂർത്തിയായാൽ ലൈസൻസി കംപ്ലീഷൻ സർട്ടിഫിക്കറ്റ് നൽകി ഒക്യുപ്പൻസി സർട്ടിഫിക്കറ്റ് വാങ്ങണം.',
    ],
    keyTables: [
      { label: 'Initial Validity', value: '5 Years' },
      { label: 'Max Extended Validity', value: '9 Years Total' },
      { label: 'Deemed Approval Timeline', value: '30 Working Days' },
      { label: 'Occupancy Certificate', value: 'Mandatory before electricity/water connection' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 10 & 14)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-22',
    chapter: 'Chapter IV',
    chapterNo: 4,
    ruleKmbr: 'KMBR Rule 22',
    ruleKpbr: 'KPBR Rule 22',
    titleEn: 'Access Road Width & Frontage Requirements by Occupancy',
    titleMl: 'പ്രവേശന വഴിവീതിയും റോഡ് ഫ്രണ്ടേജ് നിബന്ധനകളും (Occupancy പ്രകാരം)',
    category: 'Access & Road',
    summaryEn: 'Mandatory minimum access road width based on occupancy and built-up area: Group A1 residential <=300 m² requires 1.20m (KPBR) / 1.50m (KMBR); Commercial requires 3.6m to 7.0m; High-rise requires 10.0m clear street width.',
    summaryMl: 'കെട്ടിടത്തിന്റെ വിസ്തീർണ്ണവും ഉപയോഗവും അനുസരിച്ചുള്ള വഴിവീതി: 300 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക് 1.20 മീ (പഞ്ചായത്ത്) / 1.50 മീ (നഗരസഭ); വാണിജ്യത്തിന് 3.6 മീ - 7 മീ; ബഹുനില കെട്ടിടങ്ങൾക്ക് 10.0 മീറ്റർ വഴിവീതി വേണം.',
    fullProvisionsEn: [
      'No building shall be constructed on a plot which does not abut an existing public street or legally enforceable pathway.',
      'Residential houses (Group A1) <= 300 m²: Minimum 1.20m in Grama Panchayat / 1.50m in Municipality.',
      'Residential houses with area > 300 m² up to 1000 m²: Minimum 3.00m clear width throughout.',
      'Commercial buildings (Group F): Minimum 3.60m for small shops, 5.00m for medium, and 7.00m for commercial complexes > 1500 m².',
      'High-Rise Buildings (>16m / >15m): Minimum 10.00m wide motorable access road connected to main street network.',
    ],
    fullProvisionsMl: [
      'പൊതുവഴിയോ അല്ലെങ്കിൽ നിയമപരമായ പ്രവേശന വഴിയോ ഇല്ലാത്ത പ്ലോട്ടുകളിൽ കെട്ടിട നിർമ്മാണം അനുവദനീയമല്ല.',
      '300 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക്: പഞ്ചായത്തിൽ 1.20 മീറ്ററും മുനിസിപ്പാലിറ്റിയിൽ 1.50 മീറ്ററും കുറഞ്ഞ വഴി വീതി വേണം.',
      '300 മുതൽ 1000 ച.മീറ്റർ വരെയുള്ള വീടുകൾക്ക്: കുറഞ്ഞത് 3.00 മീറ്റർ വഴിവീതി നിർബന്ധമാണ്.',
      'വാണിജ്യ കെട്ടിടങ്ങൾക്ക് (ഗ്രൂപ്പ് എഫ്): വിസ്തീർണ്ണമനുസരിച്ച് 3.60 മീറ്റർ മുതൽ 7.00 മീറ്റർ വരെ വഴിവീതി വേണം.',
      'ബഹുനില കെട്ടിടങ്ങൾക്ക്: കുറഞ്ഞത് 10.00 മീറ്റർ വീതിയുള്ള റോഡ് കണക്റ്റിവിറ്റി നിർബന്ധം.',
    ],
    keyTables: [
      { label: 'Residential <= 300 m²', value: 'Min 1.20m (KPBR) / 1.50m (KMBR)' },
      { label: 'Residential 300-1000 m²', value: 'Min 3.00 meters' },
      { label: 'Commercial <= 300 m²', value: 'Min 3.60 meters' },
      { label: 'Commercial > 1500 m²', value: 'Min 7.00 meters' },
      { label: 'High-Rise Buildings', value: 'Min 10.00 meters' },
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
    titleEn: 'Exterior Open Spaces & Mandatory Setbacks for Buildings <= 10m Height (Table 4)',
    titleMl: '10 മീറ്റർ വരെയുള്ള കെട്ടിടങ്ങളുടെ സെറ്റ്ബാക്കുകളും തുറസ്സായ സ്ഥലങ്ങളും (Table 4)',
    category: 'Setbacks',
    summaryEn: 'Prescribes mandatory minimum and average setback clearances for front, rear, and side boundaries for buildings up to 10m height. Front setback min 3.0m, rear min 1.5m (avg 2.0m), sides min 1.2m and 1.0m.',
    summaryMl: '10 മീറ്റർ വരെ ഉയരമുള്ള കെട്ടിടങ്ങളുടെ നാല് വശങ്ങളിലെയും സെറ്റ്ബാക്കുകൾ. മുൻവശം കുറഞ്ഞത് 3.0 മീറ്റർ, പിൻവശം 1.5 മീറ്റർ (ശരാശരി 2.0 മീറ്റർ), വശങ്ങളിൽ 1.20 മീറ്ററും 1.00 മീറ്ററും.',
    fullProvisionsEn: [
      'Every building shall maintain clear exterior open air spaces on all sides as prescribed in Table 4 of the Rules.',
      'Front Open Space: For residential buildings up to 10m height, minimum 3.00m (average not less than 3.00m).',
      'Rear Open Space: Minimum 1.50m at any point with an average of not less than 2.00m.',
      'Side 1 Open Space: Minimum 1.20m throughout.',
      'Side 2 Open Space: Minimum 1.00m throughout (or 0.90m in small plots).',
      'Projections: Sunshades and cornices may project up to 0.60m into open spaces without being considered violations.',
      'Open cantilever balconies up to 1.20m width are permitted provided they maintain 1.50m clearance from side boundary.',
    ],
    fullProvisionsMl: [
      'ഓരോ കെട്ടിടത്തിനും റൂളിലെ ടേബിൾ 4 പ്രകാരം നാല് വശങ്ങളിലും തുറസ്സായ സ്ഥലം ഉണ്ടായിരിക്കണം.',
      'മുൻവശത്തെ സെറ്റ്ബാക്ക്: 10 മീറ്റർ വരെ ഉയരമുള്ള വീടുകൾക്ക് കുറഞ്ഞത് 3.00 മീറ്റർ (ശരാശരി 3.00 മീറ്റർ).',
      'പിൻവശത്തെ സെറ്റ്ബാക്ക്: കുറഞ്ഞത് 1.50 മീറ്ററും ശരാശരി 2.00 മീറ്ററും ഉണ്ടായിരിക്കണം.',
      'വശങ്ങളിലെ സെറ്റ്ബാക്കുകൾ: ഒരു വശത്ത് കുറഞ്ഞത് 1.20 മീറ്ററും മറുവശത്ത് കുറഞ്ഞത് 1.00 മീറ്ററും വേണം.',
      'സൺഷേഡ് പ്രൊജക്ഷൻ: 0.60 മീറ്റർ വരെ സെറ്റ്ബാക്കിലേക്ക് തള്ളിനിൽക്കാം.',
      'ബാൽക്കണി: 1.20 മീറ്റർ വരെയുള്ള ഓപ്പൺ ബാൽക്കണി അതിർത്തിയിൽ നിന്ന് 1.50 മീറ്റർ വിട്ട് പണിയാം.',
    ],
    keyTables: [
      { label: 'Front Setback (<=10m height)', value: 'Min 3.00m (Average 3.00m)' },
      { label: 'Rear Setback (<=10m height)', value: 'Min 1.50m (Average 2.00m)' },
      { label: 'Side 1 Setback', value: 'Min 1.20 meters' },
      { label: 'Side 2 Setback', value: 'Min 1.00 meters' },
      { label: 'Max Sunshade Projection', value: '0.60 meters' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Table 4)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-28',
    chapter: 'Chapter V',
    chapterNo: 5,
    ruleKmbr: 'KMBR Rule 28',
    ruleKpbr: 'KPBR Rule 26',
    titleEn: 'Setbacks for Buildings Above 10 Meters Height (Incremental Increments)',
    titleMl: '10 മീറ്ററിൽ കൂടുതൽ ഉയരമുള്ള കെട്ടിടങ്ങളുടെ അധിക സെറ്റ്ബാക്കുകൾ',
    category: 'Setbacks',
    summaryEn: 'For buildings having height exceeding 10 meters, open spaces on all four sides shall be increased by 0.50 meters for every 3.0 meters or part thereof in excess of 10 meters height.',
    summaryMl: '10 മീറ്ററിലധികം ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക്, 10 മീറ്ററിന് മുകളിലുള്ള ഓരോ 3 മീറ്റർ ഉയരത്തിനും നാല് വശങ്ങളിലെയും സെറ്റ്ബാക്ക് 0.50 മീറ്റർ വീതം വർദ്ധിപ്പിക്കണം.',
    fullProvisionsEn: [
      'For buildings exceeding 10m height: Front, rear, and both side setbacks increase at the rate of 0.50m per 3.0m additional height above 10m.',
      'Formula: Required Setback = Base Setback + [ceil((Height - 10) / 3) * 0.50m].',
      'For buildings above 16m height (High-Rise), minimum all-round clear motorable space of 5.00 meters is mandatory for fire tender movement.',
    ],
    fullProvisionsMl: [
      '10 മീറ്ററിൽ കൂടുതൽ ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക്: 10 മീറ്ററിന് മുകളിലുള്ള ഓരോ 3 മീറ്ററിനും 0.50 മീറ്റർ അധിക സെറ്റ്ബാക്ക് നൽകണം.',
      'സൂത്രവാക്യം: ആവശ്യമായ സെറ്റ്ബാക്ക് = അടിസ്ഥാന സെറ്റ്ബാക്ക് + [((ഉയരം - 10) / 3) × 0.50 മീറ്റർ].',
      '16 മീറ്ററിൽ കൂടുതൽ ഉയരമുള്ള ബഹുനില കെട്ടിടങ്ങൾക്ക് ഫയർ എഞ്ചിൻ സഞ്ചാരത്തിനായി ചുറ്റും കുറഞ്ഞത് 5.00 മീറ്റർ വിസ്തൃതി നിർബന്ധമാണ്.',
    ],
    keyTables: [
      { label: 'Height 10.0m - 13.0m', value: 'Base Setback + 0.50m on all sides' },
      { label: 'Height 13.0m - 16.0m', value: 'Base Setback + 1.00m on all sides' },
      { label: 'Height > 16.0m (High-Rise)', value: 'Min 5.00m all-round clear space' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 28)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-29',
    chapter: 'Chapter VI',
    chapterNo: 6,
    ruleKmbr: 'KMBR Rule 29',
    ruleKpbr: 'KPBR Rule 29',
    titleEn: 'Maximum Ground Coverage & Floor Area Ratio (FAR) Standards (Tables 2 & 3)',
    titleMl: 'പരമാവധി ഗ്രൗണ്ട് കവറേജും എഫ്.എ.ആറും (FAR) മാനദണ്ഡങ്ങൾ (Tables 2 & 3)',
    category: 'Coverage & FAR',
    summaryEn: 'Ground coverage limits: 60% in KMBR / 65% in KPBR for residential Group A1. Base FAR: 3.0 (KMBR) / 2.75 (KPBR), with additional purchasable FAR up to 4.00 (KMBR) / 3.50 (KPBR).',
    summaryMl: 'ഗ്രൂപ്പ് A1 പാർപ്പിട കെട്ടിടങ്ങൾക്ക് പരമാവധി കവറേജ് മുനിസിപ്പാലിറ്റിയിൽ 60%, പഞ്ചായത്തിൽ 65%. അടിസ്ഥാന FAR യഥാക്രമം 3.0 ഉം 2.75 ഉം ആണ്. അധിക FAR ഫീസ് അടച്ച് 4.00 വരെ വാങ്ങാം.',
    fullProvisionsEn: [
      'Maximum ground coverage percentage shall not exceed the statutory limits prescribed in Table 2 for the respective occupancy group.',
      'The Floor Area Ratio (FAR) calculation shall include all covered floors but exclude parking basements, open balconies up to 10%, stair wells, lift shafts, and electrical transformer rooms.',
      'Purchasable FAR: Additional FAR up to 4.00 (KMBR) / 3.50 (KPBR) may be purchased by paying the government compounding fee.',
      'Green Building Bonus: 5% additional bonus FAR granted for IGBC / GRIHA certified buildings.',
    ],
    fullProvisionsMl: [
      'കെട്ടിടത്തിന്റെ ഗ്രൗണ്ട് കവറേജ് ടേബിൾ 2-ൽ നിർദ്ദേശിച്ചിട്ടുള്ള പരമാവധി പരിധിയിൽ കവിയാൻ പാടില്ല.',
      'FAR കണക്കാക്കുമ്പോൾ പാർക്കിംഗ് ബേസ്മെന്റുകളും 10% വരെയുള്ള തുറന്ന ബാൽക്കണികളും ഒഴിവാക്കാം.',
      'അധിക FAR: സർക്കാർ നിശ്ചയിച്ച ഫീസ് അടച്ച് 4.00 (KMBR) / 3.50 (KPBR) വരെ അധിക FAR വാങ്ങാവുന്നതാണ്.',
      'ഗ്രീൻ ബിൽഡിംഗ്: പരിസ്ഥിതി സൗഹൃദ റേറ്റിംഗ് ഉള്ള കെട്ടിടങ്ങൾക്ക് 5% അധിക FAR ബോണസ് ലഭിക്കും.',
    ],
    keyTables: [
      { label: 'Max Coverage (A1 Residential)', value: '60% (KMBR) / 65% (KPBR)' },
      { label: 'Base FAR (No Fee)', value: '3.00 (KMBR) / 2.75 (KPBR)' },
      { label: 'Max Purchasable FAR', value: '4.00 (KMBR) / 3.50 (KPBR)' },
      { label: 'Commercial Group F Coverage', value: '60% (Max)' },
      { label: 'Educational Group B Coverage', value: '40% (Max) / Base FAR 2.00' },
      { label: 'Hospital Group C Coverage', value: '40% (Max) / Base FAR 2.50' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Table 2 & Table 3)',
    effectiveDate: '08 November 2019 (Amended 2025)',
  },
  {
    id: 'rule-31',
    chapter: 'Chapter VII',
    chapterNo: 7,
    ruleKmbr: 'KMBR Rule 31',
    ruleKpbr: 'KPBR Rule 31',
    titleEn: 'Off-Street Parking Requirements & Slot Dimensions (Table 6)',
    titleMl: 'വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങളും പാർക്കിംഗ് സ്ലോട്ട് അളവുകളും (Table 6)',
    category: 'Parking',
    summaryEn: 'Specifies car, two-wheeler, and disabled parking slot requirements. For residential homes <= 150 sq.m: Nil. 150-250 sq.m: 1 car space. Commercial: 1 car per 60 sq.m.',
    summaryMl: 'കാറുകൾ, ഇരുചക്ര വാഹനങ്ങൾ, ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് എന്നിവയ്ക്കുള്ള ചട്ടങ്ങൾ. 150 ച.മീ വരെ പാർക്കിംഗ് നിർബന്ധമില്ല. 150-250 ച.മീറ്ററിന് 1 കാർ പാർക്കിംഗ്.',
    fullProvisionsEn: [
      'Off-street parking space shall be provided within the plot boundaries for motor vehicles as per Table 6.',
      'Minimum standard car parking bay size: 2.50 meters × 5.00 meters clear space.',
      'Minimum two-wheeler slot size: 1.00 meter × 2.00 meters (1 slot per 4 car slots for commercial & multi-family).',
      'Accessible (Disabled / PwD) parking bay: Minimum 3.60 meters × 5.00 meters located within 30m of main building entrance (1 bay per 25 bays).',
      'Driveway clear width: Minimum 3.00 meters for one-way movement and 5.00 meters for two-way traffic.',
      'EV Charging: 10% of car parking spaces in commercial complexes and apartment complexes (>10 flats) must have EV charging provisions.',
    ],
    fullProvisionsMl: [
      'ടേബിൾ 6 പ്രകാരം പ്ലോട്ടിനുള്ളിൽ തന്നെ ആവശ്യമായ പാർക്കിംഗ് സ്ഥലം ഒരുക്കിയിരിക്കണം.',
      'ഒരു കാർ പാർക്കിംഗ് സ്ലോട്ടിന്റെ കുറഞ്ഞ അളവ്: 2.50 മീറ്റർ × 5.00 മീറ്റർ.',
      'ഇരുചക്ര വാഹന സ്ലോട്ടിന്റെ കുറഞ്ഞ അളവ്: 1.00 മീറ്റർ × 2.00 മീറ്റർ.',
      'ഭിന്നശേഷി സൗഹൃദ പാർക്കിംഗ് സ്ലോട്ട്: 3.60 മീറ്റർ × 5.00 മീറ്റർ പ്രവേശന കവാടത്തിന് 30 മീറ്ററിനുള്ളിൽ വേണം.',
      'ഡ്രൈവ് വേ വീതി: വൺ-വേ ട്രാഫിക്കിന് 3.00 മീറ്ററും ടു-വേ ട്രാഫിക്കിന് 5.00 മീറ്ററും.',
    ],
    keyTables: [
      { label: 'Residential <= 150 m²', value: 'Nil (Not Mandatory)' },
      { label: 'Residential 150 - 250 m²', value: '1 Car Parking Slot' },
      { label: 'Residential > 250 m²', value: '1 Car per 150 m² additional' },
      { label: 'Commercial Group F', value: '1 Car per 60 m² built-up area' },
      { label: 'Car Bay Clear Dimension', value: '2.50m × 5.00m' },
      { label: 'Disabled PwD Bay', value: '3.60m × 5.00m' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Table 6)',
    effectiveDate: '08 November 2019 (Amended 2025)',
  },
  {
    id: 'rule-47',
    chapter: 'Chapter VIII',
    chapterNo: 8,
    ruleKmbr: 'KMBR Rule 47',
    ruleKpbr: 'KPBR Rule 47',
    titleEn: 'Clearance from Open Drinking Well to Septic Tank & Soak Pit (7.50m Mandate)',
    titleMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള 7.50 മീറ്റർ അകല നിയമം',
    category: 'Sanitation',
    summaryEn: 'Mandatory minimum 7.50 meters clear distance from open drinking well or borewell to septic tank, soak pit, or leach pit. Septic tank must maintain 1.20m boundary distance.',
    summaryMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്കും സോക്ക് പിറ്റും തമ്മിൽ കുറഞ്ഞത് 7.50 മീറ്റർ അകലം നിർബന്ധമാണ്. സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്ന് 1.20 മീറ്റർ വിട്ട് പണിയണം.',
    fullProvisionsEn: [
      'Every open well or borewell providing drinking water shall be situated not less than 7.50 meters horizontally from any septic tank, soak pit, or sewage leach pit.',
      'Septic tank must maintain a minimum distance of 1.20 meters from any plot boundary.',
      'For small plots up to 125 sq.m where 7.5m is physically impossible, an approved bio-digester / tertiary packaged STP with effluent disinfection is required.',
      'Soak pits must be lined and located away from direct ground water table.',
    ],
    fullProvisionsMl: [
      'കുടിവെള്ളത്തിനായി ഉപയോഗിക്കുന്ന ഏതൊരു കിണറും ബോർവെല്ലും സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റിൽ നിന്നും കുറഞ്ഞത് 7.50 മീറ്റർ അകലത്തിൽ ആയിരിക്കണം.',
      'സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്നും കുറഞ്ഞത് 1.20 മീറ്റർ അകലം പാലിച്ചിരിക്കണം.',
      '125 ച.മീറ്ററിൽ താഴെയുള്ള ചെറിയ പ്ലോട്ടുകളിൽ ബയോ-ഡൈജസ്റ്റർ ടാങ്കുകൾ ഉപയോഗിക്കാം.',
      'മലിനജലം കിണറുകളിലേക്ക് ഊർന്നിറങ്ങാത്ത വിധം സാനിറ്റേഷൻ സംവിധാനങ്ങൾ സുരക്ഷിതമാക്കണം.',
    ],
    keyTables: [
      { label: 'Well to Septic Tank', value: 'Min 7.50 meters' },
      { label: 'Well to Soak Pit / Leach Bed', value: 'Min 7.50 meters' },
      { label: 'Septic Tank to Boundary', value: 'Min 1.20 meters' },
      { label: 'Small Plot STP Option', value: 'Bio-Digester with disinfection' },
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
    titleEn: 'Rainwater Harvesting (RWH) Tank Storage Capacity & Groundwater Recharge',
    titleMl: 'മഴവെള്ള സംഭരണി സംഭരണ ശേഷി നിബന്ധനകളും റീചാർജിംഗും',
    category: 'Environment',
    summaryEn: 'Mandatory for plinth area >= 100 sq.m in KMBR and >= 150 sq.m in KPBR. Formula: 25 Litres storage capacity per sq.m of roof plinth area.',
    summaryMl: 'പ്ലിന്ത് ഏരിയ 100 ച.മീറ്ററിന് (KMBR) / 150 ച.മീറ്ററിന് (KPBR) മുകളിലുള്ള കെട്ടിടങ്ങൾക്ക് നിർബന്ധം. ചതുരശ്ര മീറ്ററിന് 25 ലിറ്റർ എന്ന തോതിൽ സംഭരണ ശേഷി വേണം.',
    fullProvisionsEn: [
      'Every new building having plinth area >= 100 sq.m in Municipality / >= 150 sq.m in Panchayat shall be provided with Rainwater Harvesting facilities.',
      'Calculation formula: Storage Capacity (Litres) = Roof Plinth Area (m²) × 25 Litres.',
      'The RWH system must comprise a first-flush diverter, sand-gravel filter unit, and direct recharge well / storage tank.',
      'Open ground recharge pits must be provided with safety mesh and silt traps.',
    ],
    fullProvisionsMl: [
      'മുനിസിപ്പാലിറ്റിയിൽ 100 ച.മീറ്ററും പഞ്ചായത്തിൽ 150 ച.മീറ്ററും അതിൽ കൂടുതലും പ്ലിന്ത് ഏരിയയുള്ള എല്ലാ കെട്ടിടങ്ങൾക്കും മഴവെള്ള സംഭരണി നിർബന്ധമാണ്.',
      'കണക്കുകൂട്ടൽ സൂത്രവാക്യം: സംഭരണ ശേഷി (ലിറ്റർ) = റൂഫ് പ്ലിന്ത് ഏരിയ (ച.മീ) × 25 ലിറ്റർ.',
      'ഫിൽട്ടർ ബെഡും ഫസ്റ്റ് ഫ്ലഷ് സംവിധാനവും നിർബന്ധമായും ഉൾപ്പെടുത്തണം.',
      'മഴവെള്ള റീചാർജിംഗ് കുഴികൾ സിൽറ്റ് ട്രാപ്പോടെ നിർമ്മിക്കണം.',
    ],
    keyTables: [
      { label: 'Capacity Formula', value: 'Plinth Area (m²) × 25 Litres' },
      { label: 'Applicability KMBR', value: 'Plinth Area >= 100 sq.m' },
      { label: 'Applicability KPBR', value: 'Plinth Area >= 150 sq.m' },
      { label: 'Example: 200 m² Plinth', value: '200 × 25 = 5,000 Litres Tank' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 48)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-49',
    chapter: 'Chapter IX',
    chapterNo: 9,
    ruleKmbr: 'KMBR Rule 49',
    ruleKpbr: 'KPBR Rule 49',
    titleEn: 'Rooftop Solar PV Installation Mandate for Buildings',
    titleMl: 'റൂഫ്‌ടോപ്പ് സോളാർ പാനൽ ഇൻസ്റ്റാളേഷൻ ചട്ടങ്ങൾ',
    category: 'Solar & Green',
    summaryEn: 'Mandatory on-grid solar photovoltaic installation for commercial buildings with built-up area >= 200 sq.m and all other occupancy buildings with built-up area >= 500 sq.m.',
    summaryMl: '200 ച.മീറ്ററിന് മുകളിലുള്ള വാണിജ്യ കെട്ടിടങ്ങൾക്കും 500 ച.മീറ്ററിന് മുകളിലുള്ള മറ്റ് കെട്ടിടങ്ങൾക്കും റൂഫ്‌ടോപ്പ് സോളാർ പി.വി പാനലുകൾ നിർബന്ധം (1 KW / 100 m²).',
    fullProvisionsEn: [
      'Commercial buildings (Group F) having built-up area >= 200 sq.m shall install minimum 1.0 KW peak on-grid solar PV capacity for every 100 sq.m of floor area.',
      'All other occupancy categories having built-up area >= 500 sq.m must install solar rooftop power generation facilities.',
      'Structural stability for solar frame wind loads must be certified by the structural engineer.',
    ],
    fullProvisionsMl: [
      '200 ച.മീറ്ററിന് മുകളിലുള്ള വാണിജ്യ സ്ഥാപനങ്ങൾക്ക് ഓരോ 100 ച.മീറ്ററിനും 1 KW വീതം സോളാർ പാനൽ സ്ഥാപിക്കണം.',
      '500 ച.മീറ്ററിന് മുകളിലുള്ള മറ്റ് എല്ലാ കെട്ടിടങ്ങൾക്കും സോളാർ പവർ സൗകര്യം നിർബന്ധമാണ്.',
      'സോളാർ ഫ്രെയിമുകളുടെ സ്ട്രക്ചറൽ സ്റ്റെബിലിറ്റി എൻജിനീയർ സാക്ഷ്യപ്പെടുത്തണം.',
    ],
    keyTables: [
      { label: 'Commercial Threshold', value: 'Built-up Area >= 200 sq.m (1 KW / 100 m²)' },
      { label: 'Other Occupancies Threshold', value: 'Built-up Area >= 500 sq.m' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 49)',
    effectiveDate: '18 November 2023',
  },
  {
    id: 'rule-60',
    chapter: 'Chapter X',
    chapterNo: 10,
    ruleKmbr: 'KMBR Rule 60',
    ruleKpbr: 'KPBR Rule 62',
    titleEn: 'Special Concessions for Small Plots (<= 125 sq.m / 3 Cents)',
    titleMl: 'ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ (125 ച.മീ / 3 സെന്റ്)',
    category: 'Small Plots',
    summaryEn: 'Relaxed setbacks for small plots <= 125 sq.m (3 Cents): Front setback 1.80m, Rear setback 1.00m, Side 1: 0.90m, Side 2: 0.60m or touching boundary with 20cm solid fire wall (no openings). Ground coverage up to 75%.',
    summaryMl: 'ചെറിയ പ്ലോട്ടുകളിലെ പ്രത്യേക ഇളവുകൾ: മുൻവശം 1.80 മീറ്റർ, പിൻവശം 1.00 മീറ്റർ, വശങ്ങളിൽ 0.90 മീറ്ററും 0.60 മീറ്ററോ അതിർത്തി ചേർത്തോ (ഫയർ വാൾ). കവറേജ് 75% വരെ അനുവദനീയം.',
    fullProvisionsEn: [
      'Applicable to plots of land having total area not exceeding 125 sq.meters (approximately 3 Cents).',
      'Front Open Space: Relaxed to 1.80 meters minimum.',
      'Rear Open Space: Relaxed to 1.00 meter minimum.',
      'Side Open Space 1: Relaxed to 0.90 meters minimum.',
      'Side Open Space 2: Relaxed to 0.60 meters minimum, OR touching boundary with a solid 20cm masonry fire protection wall without any openings (windows/ventilators).',
      'Maximum ground coverage allowed: Up to 75% for Group A1 residential occupancy.',
      'Road access width relaxed to 1.20m in panchayats and 1.50m in municipalities.',
    ],
    fullProvisionsMl: [
      '125 ചതുരശ്ര മീറ്ററിൽ (ഏകദേശം 3 സെന്റ്) താഴെ വിസ്തീർണ്ണമുള്ള പ്ലോട്ടുകൾക്ക് ഈ പ്രത്യേക ഇളവുകൾ ബാധകമാണ്.',
      'മുൻവശത്തെ ഇളവ് സെറ്റ്ബാക്ക്: 1.80 മീറ്റർ.',
      'പിൻവശത്തെ ഇളവ് സെറ്റ്ബാക്ക്: 1.00 മീറ്റർ.',
      'വശങ്ങളിലെ സെറ്റ്ബാക്ക്: ഒരു വശത്ത് 0.90 മീറ്ററും മറുവശത്ത് 0.60 മീറ്ററോ അല്ലെങ്കിൽ ഫയർ വാളോടെ അതിർത്തി ചേർത്തോ പണിയാം.',
      'അതിർത്തി തൊട്ടുള്ള നിർമ്മാണത്തിന് 20 സെ.മീ കനമുള്ള ഫയർ വാൾ വേണം; ജനലുകളോ വെന്റിലേറ്ററുകളോ അനുവദിക്കില്ല.',
      'പരമാവധി അനുവദനീയമായ കവറേജ് 75% വരെ.',
    ],
    keyTables: [
      { label: 'Front Setback', value: '1.80 meters' },
      { label: 'Rear Setback', value: '1.00 meters' },
      { label: 'Side 1 Setback', value: '0.90 meters' },
      { label: 'Side 2 Setback', value: '0.60m or Boundary Wall (Fire Wall)' },
      { label: 'Max Ground Coverage', value: '75%' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 60 / Rule 62)',
    effectiveDate: '08 November 2019 (Clarified 2026)',
  },
  {
    id: 'rule-64',
    chapter: 'Chapter XI',
    chapterNo: 11,
    ruleKmbr: 'KMBR Rule 64 to 68',
    ruleKpbr: 'KPBR Rule 64 to 68',
    titleEn: 'Special Requirements for Group B (Educational) & Group C (Hospitals)',
    titleMl: 'വിദ്യാഭ്യാസ സ്ഥാപനങ്ങൾ (Group B), ആശുപത്രികൾ (Group C) പ്രത്യേക ചട്ടങ്ങൾ',
    category: 'Special Buildings',
    summaryEn: 'Educational: Classroom min 1.0 sq.m per student, stair width min 1.50m, separate toilets for boys and girls. Hospitals: Corridor width min 2.0m, ramp slope 1:10 to 1:12 with continuous handrails, stretcher elevator mandatory.',
    summaryMl: 'സ്കൂളുകൾ: ഒരു കുട്ടിക്ക് 1.0 ച.മീ ക്ലാസ്സ്റൂം വിസ്തീർണ്ണം, സ്റ്റെയർ വീതി 1.50 മീറ്റർ. ആശുപത്രികൾ: കൊറിഡോർ വീതി 2.0 മീറ്റർ, റാംപ് ചെരിവ് 1:10 മുതൽ 1:12 വരെ, സ്ട്രെച്ചർ ലിഫ്റ്റ് നിർബന്ധം.',
    fullProvisionsEn: [
      'Group B Educational: Minimum classroom area 1.0 sq.m per pupil; Minimum 2 separate staircases of width not less than 1.50 meters if built-up area > 500 m².',
      'Group C Hospitals: Clear corridor width not less than 2.00 meters to permit easy bed and stretcher movement.',
      'Hospital Ramps: Minimum width 1.80m with gradient between 1:10 and 1:12 with non-slip finish and handrails on both sides.',
      'Fire escape external staircase mandatory for all hospital and educational buildings above Ground + 1 floor.',
    ],
    fullProvisionsMl: [
      'സ്കൂളുകൾ: ഒരു വിദ്യാർത്ഥിക്ക് 1.0 ച.മീറ്റർ ക്ലാസ്സ്റൂം വിസ്തീർണ്ണം; 500 ച.മീറ്ററിൽ കൂടുതൽ വിസ്തീർണ്ണമുള്ള സ്കൂളുകൾക്ക് 1.50 മീറ്റർ വീതിയുള്ള 2 സ്റ്റെയർകേസുകൾ വേണം.',
      'ആശുപത്രികൾ: രോഗികളെ കിടത്തി കൊണ്ടുപോകുന്നതിന് കൊറിഡോറുകൾക്ക് കുറഞ്ഞത് 2.00 മീറ്റർ വീതി വേണം.',
      'ആശുപത്രി റാംപുകൾ: വീതി 1.80 മീറ്ററും ചെരിവ് 1:10 മുതൽ 1:12 വരെയും ആയിരിക്കണം.',
      'ആശുപത്രികൾക്കും സ്കൂളുകൾക്കും എമർജൻസി ഫയർ എസ്കേപ്പ് സ്റ്റെയർ നിർബന്ധം.',
    ],
    keyTables: [
      { label: 'School Classroom Area', value: 'Min 1.0 sq.m per pupil' },
      { label: 'School Staircase Width', value: 'Min 1.50 meters' },
      { label: 'Hospital Corridor Width', value: 'Min 2.00 meters' },
      { label: 'Hospital Ramp Gradient', value: '1:10 to 1:12 (Max)' },
      { label: 'Stretcher Lift', value: 'Mandatory for G+1 and above' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 64-68)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-76',
    chapter: 'Chapter XII',
    chapterNo: 12,
    ruleKmbr: 'KMBR Rule 76 to 82',
    ruleKpbr: 'KPBR Rule 76 to 82',
    titleEn: 'High-Rise Buildings (>16m in KPBR / >15m in KMBR) & NBC Fire Safety Clearances',
    titleMl: 'ബഹുനില കെട്ടിടങ്ങൾ (>16m / >15m) & ഫയർ ഫോഴ്സ് എൻ.ഒ.സി സുരക്ഷാ ചട്ടങ്ങൾ',
    category: 'Fire & High-Rise',
    summaryEn: 'High-rise threshold: >16m height in KPBR and >15m in KMBR. Mandates 5.0m all-round clear motorable access, dual pressurized staircases, fire lift, and Fire & Rescue Services NOC as per NBC 2016 Part IV.',
    summaryMl: 'ഉയരം 16 മീറ്ററിൽ (KPBR) / 15 മീറ്ററിൽ (KMBR) കൂടുതലുള്ള കെട്ടിടങ്ങൾ. ചുറ്റും 5.0 മീറ്റർ ഫയർ എഞ്ചിൻ റോഡ്, 2 എമർജൻസി സ്റ്റെയർകേസുകൾ, ഫയർ ലിഫ്റ്റ്, ഫയർ ഫോഴ്സ് NOC നിർബന്ധം.',
    fullProvisionsEn: [
      'High-Rise Definition: Any building exceeding 16.0 meters height in Grama Panchayat (KPBR) or 15.0 meters height in Municipality (KMBR).',
      'Fire Tender Motorable Access: Minimum 5.00 meters clear, unencumbered driveway all around the perimeter of the building.',
      'Dual Staircases: Minimum 2 enclosed fire-rated staircases situated at opposite ends of the building with self-closing fire doors.',
      'Fire NOC: Initial clearance (NOC for Building Permit) and final compliance certificate from Kerala Fire & Rescue Services Department are mandatory before occupancy.',
      'Automatic sprinkler system, wet riser, yard hydrants, and standby diesel fire pump required as per NBC Part IV.',
    ],
    fullProvisionsMl: [
      'ബഹുനില കെട്ടിട നിർവ്വചനം: പഞ്ചായത്തിൽ 16 മീറ്ററിലും നഗരസഭയിൽ 15 മീറ്ററിലും കൂടുതൽ ഉയരമുള്ള കെട്ടിടങ്ങൾ.',
      'ഫയർ എഞ്ചിൻ പാത: കെട്ടിടത്തിന് ചുറ്റും കുറഞ്ഞത് 5.00 മീറ്റർ വീതിയിൽ തടസ്സമില്ലാത്ത റോഡ്.',
      '2 സ്റ്റെയർകേസുകൾ: കെട്ടിടത്തിന്റെ ഇരുവശങ്ങളിലുമായി രണ്ട് ഫയർ സേഫ്റ്റി സ്റ്റെയർകേസുകൾ വേണം.',
      'ഫയർ എൻ.ഒ.സി: കേരള ഫയർ ഫോഴ്സ് വകുപ്പിന്റെ പ്രാരംഭ പെർമിറ്റ് എൻ.ഒ.സിയും ഫൈനൽ ഒക്യുപ്പൻസി സർട്ടിഫിക്കറ്റും നിർബന്ധം.',
    ],
    keyTables: [
      { label: 'High-Rise Height Threshold', value: '> 16m (KPBR) / > 15m (KMBR)' },
      { label: 'All-Round Motorable Driveway', value: 'Min 5.00 meters clear' },
      { label: 'Emergency Staircases', value: 'Minimum 2 (Opposite sides)' },
      { label: 'Fire NOC Authority', value: 'Director General, Fire & Rescue Services Kerala' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette & NBC 2016 Part IV',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-85',
    chapter: 'Chapter XII',
    chapterNo: 12,
    ruleKmbr: 'KMBR Rule 85',
    ruleKpbr: 'KPBR Rule 85',
    titleEn: 'Staircase Dimensions, Tread, Riser, Handrails & Headroom Standards',
    titleMl: 'സ്റ്റെയർകേസ് അളവുകൾ, ട്രെഡ്, റൈസർ, ഹാൻഡ് റെയിൽ, ഹെഡ്റൂം മാനദണ്ഡങ്ങൾ',
    category: 'Staircase & Exits',
    summaryEn: 'Minimum clear staircase width: 1.0m for residential houses, 1.2m for apartments, 1.5m for commercial/educational. Riser maximum 15cm-19cm; Tread minimum 25cm-30cm; Headroom minimum 2.20m.',
    summaryMl: 'സ്റ്റെയർകേസ് കുറഞ്ഞ വീതി: ഒറ്റ വീടുകൾക്ക് 1.0 മീറ്റർ, ഫ്ലാറ്റുകൾക്ക് 1.2 മീറ്റർ, വാണിജ്യത്തിന് 1.5 മീറ്റർ. റൈസർ പരമാവധി 15-19 സെ.മീ, ട്രെഡ് കുറഞ്ഞത് 25-30 സെ.മീ, ഹെഡ്റൂം 2.20 മീറ്റർ.',
    fullProvisionsEn: [
      'Residential houses (Group A1 <= 300 m²): Minimum clear width 1.00m, max riser 19.0cm, min tread 25.0cm.',
      'Flats & Apartments: Minimum clear width 1.20m, max riser 17.5cm, min tread 28.0cm.',
      'Commercial & Public Buildings: Minimum clear width 1.50m, max riser 15.0cm, min tread 30.0cm.',
      'Clear headroom under staircase soffit: Not less than 2.20 meters at any point.',
      'Handrails: Height between 85cm and 100cm, mandatory on both sides if staircase width is >= 1.50m.',
    ],
    fullProvisionsMl: [
      'ഒറ്റ വീടുകൾ: കുറഞ്ഞ വീതി 1.00 മീറ്റർ, പരമാവധി റൈസർ 19.0 സെ.മീ, കുറഞ്ഞ ട്രെഡ് 25.0 സെ.മീ.',
      'ഫ്ലാറ്റുകൾ: കുറഞ്ഞ വീതി 1.20 മീറ്റർ, പരമാവധി റൈസർ 17.5 സെ.മീ, കുറഞ്ഞ ട്രെഡ് 28.0 സെ.മീ.',
      'വാണിജ്യ/പൊതു കെട്ടിടങ്ങൾ: കുറഞ്ഞ വീതി 1.50 മീറ്റർ, പരമാവധി റൈസർ 15.0 സെ.മീ, കുറഞ്ഞ ട്രെഡ് 30.0 സെ.മീ.',
      'ഹെഡ്റൂം: സ്റ്റെയറിന് അടിയിൽ കുറഞ്ഞത് 2.20 മീറ്റർ ഉയരം ഉണ്ടായിരിക്കണം.',
      'ഹാൻഡ് റെയിൽ: ഉയരം 85 സെ.മീ മുതൽ 100 സെ.മീ വരെ.',
    ],
    keyTables: [
      { label: 'Residential House Stair Width', value: 'Min 1.00 meter' },
      { label: 'Apartment Stair Width', value: 'Min 1.20 meters' },
      { label: 'Commercial / School Stair Width', value: 'Min 1.50 meters' },
      { label: 'Max Riser Height', value: '15cm (Public) / 19cm (Residential)' },
      { label: 'Min Tread Width', value: '30cm (Public) / 25cm (Residential)' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 85)',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-95',
    chapter: 'Chapter XIV',
    chapterNo: 14,
    ruleKmbr: 'KMBR Rule 95 to 98',
    ruleKpbr: 'KPBR Rule 95 to 98',
    titleEn: 'Coastal Regulation Zone (CRZ), Railway Clearances & Airport Height NOC',
    titleMl: 'തീരദേശ സംരക്ഷണ മേഖല (CRZ), റെയിൽവേ അതിർത്തി & എയർപോർട്ട് NOC',
    category: 'Special Buildings',
    summaryEn: 'Building restrictions in CRZ zones (CRZ-I, II, III). Railway boundary clearance: 30m without NOC / 3.0m with Railway NOC. Airport Height Clearance required under CCZM maps.',
    summaryMl: 'സി.ആർ.സെഡ് (CRZ) തീരദേശ നിയന്ത്രണങ്ങൾ. റെയിൽവേ അതിർത്തിയിൽ നിന്ന് NOC ഇല്ലാതെ 30 മീറ്റർ / NOC യോടെ 3.0 മീറ്റർ. വിമാനത്താവള ഫണൽ പരിധിയിലെ ഉയര നിയന്ത്രണം.',
    fullProvisionsEn: [
      'CRZ Clearance: Constructions within 500m of High Tide Line (HTL) or 100m of tidal water bodies require KCZMA clearance before building permit issuance.',
      'Railway Boundary: No construction permitted within 30.0m of railway track center line without NOC from Railway Division.',
      'Airport Height Restriction: Buildings falling within Colour Coded Zoning Map (CCZM) of nearest airport must submit AAI NOC.',
    ],
    fullProvisionsMl: [
      'തീരദേശ മേഖല: ഹൈ ടൈഡ് ലൈനിൽ നിന്ന് 500 മീറ്ററിനുള്ളിലെ നിർമ്മാണങ്ങൾക്ക് കേരള കോസ്റ്റൽ സോൺ മാനേജ്മെന്റ് അതോറിറ്റി (KCZMA) അനുമതി വേണം.',
      'റെയിൽവേ ലൈൻ: റെയിൽവേ അതിർത്തിയിൽ നിന്ന് അനുമതിയില്ലാതെ 30 മീറ്ററിനുള്ളിൽ നിർമ്മാണം പാടില്ല.',
      'എയർപോർട്ട്: വിമാനത്താവളത്തിന് സമീപമുള്ള ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക് എയർപോർട്ട് അതോറിറ്റി ഓഫ് ഇന്ത്യ (AAI) NOC വേണം.',
    ],
    keyTables: [
      { label: 'Railway Track Clearance', value: '30.0m (No NOC) / 3.0m (With Railway NOC)' },
      { label: 'CRZ Authority', value: 'KCZMA (Kerala Coastal Zone Management)' },
      { label: 'Airport NOC', value: 'AAI NOC via NOCAS Portal' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette & MoEFCC CRZ Notification',
    effectiveDate: '08 November 2019',
  },
  {
    id: 'rule-103',
    chapter: 'Chapter XV',
    chapterNo: 15,
    ruleKmbr: 'KMBR Rule 103 to 108',
    ruleKpbr: 'KPBR Rule 103 to 108',
    titleEn: 'Regularization of Unauthorized Constructions & Compounding Slabs',
    titleMl: 'അനധികൃത നിർമ്മാണം ക്രമവൽക്കരണവും കോമ്പൗണ്ടിംഗ് ഫീസും',
    category: 'Regularization',
    summaryEn: 'Procedures and fee slabs for regularizing minor deviations and unauthorized constructions that substantially comply with safety, setback, and structural norms upon payment of statutory compounding fees.',
    summaryMl: 'ചട്ടങ്ങളിൽ ചെറിയ വ്യതിയാനങ്ങളോടെ നിർമ്മിച്ച കെട്ടിടങ്ങൾ പിഴയടച്ച് ക്രമവൽക്കരിക്കുന്നതിനുള്ള നടപടിക്രമങ്ങളും സർക്കാർ കോമ്പൗണ്ടിംഗ് ഫീസ് നിരക്കുകളും.',
    fullProvisionsEn: [
      'Deviations within permissible compounding tolerances may be regularized by the Secretary upon application in Form Appendix II.',
      'Compounding fee is calculated based on the deviation percentage and built-up area as per government notified slabs.',
      'Encroachments into public roads, railway boundaries, CRZ-I zones, and fire driveway spaces are strictly non-compoundable.',
    ],
    fullProvisionsMl: [
      'ചട്ടങ്ങൾക്ക് വലിയ ഭീഷണിയില്ലാത്ത ചെറിയ വ്യതിയാനങ്ങൾ നിശ്ചിത കോമ്പൗണ്ടിംഗ് ഫീസ് ഈടാക്കി ക്രമവൽക്കരിക്കാം.',
      'പൊതുവഴി കൈയേറ്റങ്ങൾ, ഫയർ എഞ്ചിൻ പാതയിലെ തടസ്സങ്ങൾ, CRZ-I ലംഘനങ്ങൾ എന്നിവ ഒരു കാരണവശാലും ക്രമവൽക്കരിക്കില്ല.',
    ],
    keyTables: [
      { label: 'Application Form', value: 'Form Appendix II via K-Smart' },
      { label: 'Road Encroachments', value: 'Non-Compoundable (Strict Demolition)' },
      { label: 'Compounding Authority', value: 'LSGD Secretary / District Town Planner' },
    ],
    pdfDownloadUrl: 'https://lsgkerala.gov.in',
    sourceAuthority: 'LSGD Kerala Gazette (Rule 103-108)',
    effectiveDate: '08 November 2019',
  },
];

export const KERALA_STATUTORY_QUICK_MATRICES: StatutoryQuickMatrix[] = [
  {
    id: 'matrix-setbacks',
    titleEn: 'Quick Reference Matrix: Mandatory Setbacks by Height (Table 4)',
    titleMl: 'ഫിംഗർ ടിപ്പ് ഗൈഡ്: കെട്ടിട ഉയരമനുസരിച്ചുള്ള സെറ്റ്ബാക്കുകൾ (Table 4)',
    category: 'Setbacks',
    headers: ['Building Height (ഉയരം)', 'Front (മുൻവശം)', 'Rear (പിൻവശം)', 'Side 1 (വശം 1)', 'Side 2 (വശം 2)'],
    rows: [
      { label: 'Small Plot <= 125 m² (3 Cents)', values: ['1.80 m', '1.00 m', '0.90 m', '0.60 m / Fire Wall'] },
      { label: 'Up to 10.0 meters (Residential A1)', values: ['3.00 m', '1.50 m (Avg 2.0m)', '1.20 m', '1.00 m'] },
      { label: '10.0 m to 13.0 meters', values: ['3.50 m', '2.00 m (Avg 2.5m)', '1.70 m', '1.50 m'] },
      { label: '13.0 m to 16.0 meters', values: ['4.00 m', '2.50 m (Avg 3.0m)', '2.20 m', '2.00 m'] },
      { label: 'Above 16.0 meters (High-Rise)', values: ['5.00 m clear', '5.00 m clear', '5.00 m clear', '5.00 m clear'] },
    ],
    noteEn: 'Sunshades may project up to 0.60m into setbacks. Open balconies up to 1.20m permitted with 1.50m boundary clearance.',
    noteMl: 'സൺഷേഡുകൾക്ക് 0.60 മീറ്റർ വരെ സെറ്റ്ബാക്കിലേക്ക് തള്ളിനിൽക്കാം. 1.20 മീറ്റർ വരെയുള്ള ഓപ്പൺ ബാൽക്കണിക്ക് 1.50 മീറ്റർ അതിർത്തി അകലം വേണം.',
  },
  {
    id: 'matrix-far-coverage',
    titleEn: 'Quick Reference Matrix: Ground Coverage & Base FAR (Table 2 & 3)',
    titleMl: 'ഫിംഗർ ടിപ്പ് ഗൈഡ്: ഗ്രൗണ്ട് കവറേജും അടിസ്ഥാന FAR ഉം',
    category: 'Coverage & FAR',
    headers: ['Occupancy Group (ഉപയോഗം)', 'Max Coverage (KMBR)', 'Max Coverage (KPBR)', 'Base FAR (ഫീസില്ലാതെ)', 'Max Purchasable FAR'],
    rows: [
      { label: 'Group A1 Residential (വീടുകൾ/ഫ്ലാറ്റുകൾ)', values: ['60%', '65%', '3.00 (KMBR) / 2.75 (KPBR)', '4.00 (KMBR) / 3.50 (KPBR)'] },
      { label: 'Group B Educational (സ്കൂളുകൾ/കോളേജുകൾ)', values: ['40%', '40%', '2.00', '3.00'] },
      { label: 'Group C Hospital / Medical (ആശുപത്രികൾ)', values: ['40%', '40%', '2.50', '3.50'] },
      { label: 'Group D Assembly / Auditoriums (ഓഡിറ്റോറിയം)', values: ['40%', '40%', '1.50', '2.50'] },
      { label: 'Group F Commercial / Shops (കടകൾ/മാളുകൾ)', values: ['60%', '60%', '2.50', '4.00'] },
      { label: 'Group G Industrial / Factories (ഫാക്ടറികൾ)', values: ['50%', '50%', '1.50', '2.50'] },
    ],
    noteEn: 'Parking basements, stair wells, and open balconies up to 10% are excluded from FAR calculations.',
    noteMl: 'പാർക്കിംഗ് ബേസ്മെന്റുകളും 10% വരെയുള്ള ഓപ്പൺ ബാൽക്കണികളും FAR കണക്കുകൂട്ടലിൽ ഒഴിവാക്കാം.',
  },
  {
    id: 'matrix-parking',
    titleEn: 'Quick Reference Matrix: Parking Standards & Slot Sizes (Table 6)',
    titleMl: 'ഫിംഗർ ടിപ്പ് ഗൈഡ്: പാർക്കിംഗ് മാനദണ്ഡങ്ങളും സ്ലോട്ട് അളവുകളും',
    category: 'Parking',
    headers: ['Category / Building Type', 'Car Parking Requirement', 'Two-Wheeler Slot', 'Disabled (PwD) Slot', 'Standard Bay Size'],
    rows: [
      { label: 'Residential <= 150 sq.m', values: ['Nil (Not Mandatory)', 'Optional', 'Not required', '2.50m × 5.00m'] },
      { label: 'Residential 150 - 250 sq.m', values: ['1 Car space', '1 Space', 'Not required', '2.50m × 5.00m'] },
      { label: 'Residential > 250 sq.m', values: ['1 + 1 per 150 sq.m', '1 per 4 cars', '1 per 25 cars', '2.50m × 5.00m'] },
      { label: 'Commercial Group F', values: ['1 Car per 60 sq.m', '1 per 4 cars', '1 per 25 cars (3.6×5m)', '2.50m × 5.00m'] },
      { label: 'Hospitals Group C', values: ['1 Car per 75 sq.m / 5 beds', '1 per 3 cars', 'Min 2 slots near entry', '2.50m × 5.00m'] },
      { label: 'Auditoriums Group D', values: ['1 Car per 15 seats', '1 per 2 cars', 'Min 2 slots near entry', '2.50m × 5.00m'] },
    ],
    noteEn: 'Car slot: 2.50m × 5.00m. Disabled PwD slot: 3.60m × 5.00m. Two-wheeler slot: 1.00m × 2.00m. Driveway: min 3.0m one-way / 5.0m two-way.',
    noteMl: 'കാർ സ്ലോട്ട്: 2.50m × 5.00m. ഭിന്നശേഷി സ്ലോട്ട്: 3.60m × 5.00m. ബൈക്ക് സ്ലോട്ട്: 1.00m × 2.00m. ഡ്രൈവ് വേ: വൺ-വേ 3.0 മീ / ടു-വേ 5.0 മീ.',
  },
  {
    id: 'matrix-well-sanitation',
    titleEn: 'Quick Reference Matrix: Well Distances & Sanitation (Rule 47 & 48)',
    titleMl: 'ഫിംഗർ ടിപ്പ് ഗൈഡ്: കിണർ അകലവും സാനിറ്റേഷനും',
    category: 'Sanitation',
    headers: ['Sanitation / Water Element', 'Mandatory Distance', 'Rule Citation', 'Small Plot Alternative'],
    rows: [
      { label: 'Open Well to Septic Tank', values: ['Min 7.50 meters', 'Rule 47', 'Bio-Digester STP'] },
      { label: 'Open Well to Soak Pit / Leach Bed', values: ['Min 7.50 meters', 'Rule 47', 'Bio-Digester STP'] },
      { label: 'Borewell to Septic Tank', values: ['Min 7.50 meters', 'Rule 47', 'Sealed Packaged STP'] },
      { label: 'Septic Tank to Boundary Line', values: ['Min 1.20 meters', 'Rule 47(2)', 'Concrete sealed tank'] },
      { label: 'Rainwater Tank Capacity', values: ['25 Litres / sq.m plinth', 'Rule 48', 'Formula: Plinth × 25 L'] },
    ],
    noteEn: 'Strict horizontal distance of 7.50m applies between drinking water sources and sewage disposal systems.',
    noteMl: 'കുടിവെള്ള കിണറും സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റും തമ്മിൽ 7.50 മീറ്റർ തിരശ്ചീന അകലം കർശനമായി പാലിക്കണം.',
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
    summaryEn: 'Permits construction touching boundary on one side with solid 20cm masonry fire wall if neighbor gives registered consent or if side width is <= 0.6m in plots <= 125 sq.m.',
    summaryMl: '125 ചതുരശ്ര മീറ്ററിൽ താഴെയുള്ള പ്ലോട്ടുകളിൽ അയൽവാസിയുടെ സമ്മതത്തോടെയോ അല്ലെങ്കിൽ 0.6 മീറ്റർ അകലത്തിലോ 20 സെ.മീ ഫയർ വാളോടെ അതിർത്തി ചേർത്ത് നിർമ്മിക്കാൻ അനുമതി.',
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
