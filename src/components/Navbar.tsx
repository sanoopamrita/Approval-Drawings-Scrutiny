import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Building2,
  FileCheck2,
  UploadCloud,
  Calculator,
  FileText,
  RotateCcw,
  Sparkles,
  Globe,
  Bot,
  Search,
  ChevronRight,
  X,
  ShieldCheck,
  LogOut,
  Crown,
  Mail,
  Check,
  Copy,
  ChevronDown,
  Coins,
  Split,
  FileQuestion,
  Waves,
  Flame,
  GraduationCap,
  Scale,
  Compass,
  ArrowRight,
  CornerDownLeft,
} from 'lucide-react';
import { TabType, Language, JurisdictionType, ScrutinyReportSummary, User } from '../types';
import { VinyasaLogo } from './VinyasaLogo';
import { KERALA_COMPLETE_RULES_DATABASE, KERALA_AMENDMENTS_FULL_ARCHIVE, KERALA_RULES_CHAPTERS } from '../utils/rulesDatabase';
import { isUserSuperAdmin } from '../services/authService';

interface SearchResultItem {
  id: string;
  category: 'tool' | 'rule' | 'statutory' | 'amendment';
  categoryLabelMl: string;
  categoryLabelEn: string;
  titleMl: string;
  titleEn: string;
  subtitleMl: string;
  subtitleEn: string;
  descriptionMl?: string;
  descriptionEn?: string;
  badge?: string;
  targetTab?: TabType;
  actionType: 'navigate' | 'chat' | 'info';
  keywords: string[];
}

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  jurisdiction: JurisdictionType;
  setJurisdiction: (j: JurisdictionType) => void;
  summary: ScrutinyReportSummary | null;
  currentUser: User | null;
  onRunScrutiny: () => void;
  onReset: () => void;
  onLogout: () => void;
  onOpenChat?: () => void;
}

// Special statutory topics knowledge base for global search
const SPECIAL_STATUTORY_TOPICS: SearchResultItem[] = [
  {
    id: 'statutory-crz',
    category: 'statutory',
    categoryLabelMl: 'തീരദേശ നിയമങ്ങൾ',
    categoryLabelEn: 'Coastal Regulations',
    titleMl: 'തീരദേശ പരിപാലന നിയമങ്ങൾ (CRZ 2019)',
    titleEn: 'Coastal Regulation Zone Rules (CRZ 2019)',
    subtitleMl: 'CRZ-III 50m/200m NDZ • കായലോരം 50m ബഫർ • CRZ-II അനുമതികൾ',
    subtitleEn: 'CRZ-III 50m/200m NDZ • Backwaters 50m Buffer • CRZ-II Landward Rules',
    descriptionMl: 'ഉയർന്ന വേലിയേറ്റ രേഖയിൽ (HTL) നിന്ന് പഞ്ചായത്തുകളിൽ 50 മീറ്റർ (CRZ-IIIA) / 200 മീറ്റർ (CRZ-IIIB) നോ ഡെവലപ്‌മെന്റ് സോൺ (NDZ) നിർബന്ധം.',
    descriptionEn: 'No Development Zone (NDZ) from High Tide Line (HTL): 50m in CRZ-IIIA, 200m in CRZ-IIIB. 50m buffer for backwaters.',
    badge: 'CRZ 2019',
    actionType: 'chat',
    keywords: ['crz', 'coastal', 'htl', 'ndz', 'tidal', 'backwater', 'buffer', 'തീരദേശം', 'തീരദേശ ചട്ടങ്ങൾ', 'കടൽ', 'കായൽ', 'നോ ഡെവലപ്മെന്റ് സോൺ', 'ഹൈ ടൈഡ്', 'സി ആർ ഇസഡ്', 'സിആർഇസഡ്'],
  },
  {
    id: 'statutory-wetland',
    category: 'statutory',
    categoryLabelMl: 'തണ്ണീർത്തട ആക്ട്',
    categoryLabelEn: 'Wetland Act',
    titleMl: 'നെൽവയൽ - തണ്ണീർത്തട തരംമാറ്റൽ (2008 ആക്ട്)',
    titleEn: 'Kerala Paddy Land & Wetland Conversion (Act 2008)',
    subtitleMl: 'ഡാറ്റാ ബാങ്ക് ഒഴിവാക്കൽ: ഫോറം 5 • പുരയിടമാക്കൽ: ഫോറം 6 (Section 27A)',
    subtitleEn: 'Data Bank Deletion: Form 5 • Conversion to Purayidam: Form 6 (Section 27A)',
    descriptionMl: 'ഡാറ്റാ ബാങ്കിൽ ഉൾപ്പെട്ട തണ്ണീർത്തടം ഒഴിവാക്കാൻ ഫോറം 5 വഴിയും, ഡാറ്റാ ബാങ്കിൽ ഇല്ലാത്ത നിലം തരംമാറ്റാൻ ഫോറം 6 പ്രകാരം RDO അനുമതി വേണം.',
    descriptionEn: 'Form 5 for removal from Local Data Bank. Form 6 under Section 27A for unnotified wetland conversion to Purayidam.',
    badge: 'Form 5 & 6',
    actionType: 'chat',
    keywords: ['paddy', 'wetland', 'data bank', 'form 5', 'form 6', 'section 27a', 'rdo', 'purayidam', 'നിലം', 'തണ്ണീർത്തടം', 'ഡാറ്റാ ബാങ്ക്', 'ഫോറം 5', 'ഫോറം 6', 'തരംമാറ്റൽ', 'പുരയിടം', 'നെൽവയൽ'],
  },
  {
    id: 'statutory-well-septic',
    category: 'statutory',
    categoryLabelMl: 'കിണർ & സാനിറ്റേഷൻ',
    categoryLabelEn: 'Well & Sanitation',
    titleMl: 'കിണറും സെപ്റ്റിക് ടാങ്കും തമ്മിലുള്ള അകലം (ചട്ടം 47)',
    titleEn: 'Open Well & Septic Tank Clearances (Rule 47)',
    subtitleMl: 'കിണറിൽ നിന്ന് സെപ്റ്റിക് ടാങ്കിലേക്ക് കുറഞ്ഞത് 7.50 മീറ്റർ അകലം',
    subtitleEn: 'Minimum 7.50m clear distance between drinking well and septic tank',
    descriptionMl: 'കുടിവെള്ള കിണറിൽ നിന്ന് സെപ്റ്റിക് ടാങ്ക് / സോക്ക് പിറ്റിലേക്ക് 7.50 മീറ്ററും, സെപ്റ്റിക് ടാങ്ക് അതിർത്തിയിൽ നിന്ന് 1.20 മീറ്ററും (സമ്മതത്തോടെ 0.60m) വേണം.',
    descriptionEn: '7.50m mandatory horizontal distance from well to septic tank/soak pit. Septic tank 1.20m from boundary (0.60m with consent).',
    badge: 'Rule 47',
    targetTab: 'areastatement',
    actionType: 'navigate',
    keywords: ['well', 'septic tank', 'soak pit', 'leech pit', 'sanitation', 'rule 47', 'കിണർ', 'സെപ്റ്റിക് ടാങ്ക്', 'സോക്ക് പിറ്റ്', 'ശുചിമുറി', 'കുടിവെള്ളം', 'ചട്ടം 47', 'അകലം'],
  },
  {
    id: 'statutory-small-plot',
    category: 'statutory',
    categoryLabelMl: 'ചെറിയ പ്ലോട്ട് ഇളവുകൾ',
    categoryLabelEn: 'Small Plot Concessions',
    titleMl: 'ചെറിയ പ്ലോട്ടുകൾക്കുള്ള പ്രത്യേക ഇളവുകൾ (Rule 60 / 62)',
    titleEn: 'Small Plot Concessions <= 125 sq.m (KMBR Rule 60 / KPBR Rule 62)',
    subtitleMl: '3 സെന്റിൽ താഴെ: മുൻവശം 1.80m • പിൻവശം 1.00m • വശങ്ങൾ 0.90m & 0.60m',
    subtitleEn: 'Plot <= 125 sq.m: Front 1.80m • Rear 1.00m • Sides 0.90m & 0.60m • 75% Coverage',
    descriptionMl: '125 ച.മീറ്റർ (3.08 സെന്റ്) വരെയുള്ള പ്ലോട്ടുകൾക്ക് സെറ്റ്ബാക്കുകളിൽ വലിയ ഇളവുകളും 75% വരെ ഗ്രൗണ്ട് കവറേജും അനുവദനീയമാണ്.',
    descriptionEn: 'Plots up to 125 sq.m enjoy relaxed setbacks (Front 1.80m, Rear 1.00m) and up to 75% ground coverage.',
    badge: 'Rule 60/62',
    targetTab: 'areastatement',
    actionType: 'navigate',
    keywords: ['small plot', 'rule 60', 'rule 62', '3 cent', '125', 'concession', 'ചെറിയ പ്ലോട്ട്', 'റൂൾ 60', 'റൂൾ 62', '3 സെന്റ്', 'ഇളവുകൾ', 'സെറ്റ്ബാക്ക് ഇളവ്'],
  },
  {
    id: 'statutory-ksmart',
    category: 'statutory',
    categoryLabelMl: 'കെ-സ്മാർട്ട് പെർമിറ്റ്',
    categoryLabelEn: 'K-Smart Permitting',
    titleMl: 'കെ-സ്മാർട്ട് ഓൺലൈൻ തൽക്ഷണ പെർമിറ്റ് (Self-Certification)',
    titleEn: 'K-Smart Online Fast Track Auto-Permit',
    subtitleMl: '300 ച.മീറ്റർ വരെയും 10m ഉയരവുമുള്ള വീടുകൾക്ക് തൽക്ഷണ പെർമിറ്റ്',
    subtitleEn: 'Instant automated permit for residential <= 300 sq.m & <= 10m height',
    descriptionMl: 'കെ-സ്മാർട്ട് ഓൺലൈൻ സിസ്റ്റത്തിൽ ലളിതമായ സെൽഫ് സർട്ടിഫിക്കേഷൻ വഴി രജിസ്റ്റേർഡ് എഞ്ചിനീയർക്ക് ഉടൻ പെർമിറ്റ് ഡൗൺലോഡ് ചെയ്യാം.',
    descriptionEn: 'Low-risk self-certification workflow for residential buildings up to 300 sq.m with instant permit generation.',
    badge: 'K-SMART',
    targetTab: 'rfi',
    actionType: 'navigate',
    keywords: ['k-smart', 'ksmart', 'permit', 'low risk', 'self certification', 'auto permit', 'കെ-സ്മാർട്ട്', 'തൽക്ഷണ പെർമിറ്റ്', 'സെൽഫ് സർട്ടിഫിക്കേഷൻ', 'പെർമിറ്റ്'],
  },
  {
    id: 'statutory-fire-safety',
    category: 'statutory',
    categoryLabelMl: 'ഫയർ & ലൈഫ് സേഫ്റ്റി',
    categoryLabelEn: 'Fire & Life Safety',
    titleMl: 'ഫയർ സുരക്ഷാ മാനദണ്ഡങ്ങളും NOC ചട്ടങ്ങളും (NBC 2016 Part 4)',
    titleEn: 'Fire & Life Safety Standards and NOC Rules (NBC 2016 Part 4)',
    subtitleMl: '15 മീറ്ററിന് മുകളിൽ ഉയരമുള്ള കെട്ടിടങ്ങൾക്ക് ഫയർ NOC & 5m ഡ്രൈവ് വേ നിർബന്ധം',
    subtitleEn: 'Mandatory Fire NOC for height > 15.0m & 5.0m clear fire tender driveway',
    descriptionMl: 'ബഹുനില കെട്ടിടങ്ങൾക്കും (>15m) സ്കൂളുകൾക്കും (>1000m²) ഫയർഫോഴ്സ് എൻ.ഒ.സി, സ്റ്റെയർകേസ് വീതി (1.50m), ചുറ്റും 5m പാത എന്നിവ വേണം.',
    descriptionEn: 'Fire NOC mandatory for buildings > 15m height. Minimum 5m wide all-round driveway for fire engine access.',
    badge: 'NBC Part 4',
    actionType: 'chat',
    keywords: ['fire', 'noc', 'nbc', 'high rise', 'safety', 'staircase', 'fire engine', 'tender path', 'ഫയർ', 'എൻഒസി', 'ബഹുനില കെട്ടിടം', 'ഫയർ എൻജിൻ പാത', 'സുരക്ഷ', 'തീപിടുത്തം'],
  },
  {
    id: 'statutory-school-ker',
    category: 'statutory',
    categoryLabelMl: 'സ്കൂൾ കെട്ടിട ചട്ടങ്ങൾ',
    categoryLabelEn: 'School Building Rules',
    titleMl: 'കേരള എഡ്യൂക്കേഷൻ റൂൾസ് (KER Chapter IV) സ്കൂൾ ചട്ടങ്ങൾ',
    titleEn: 'Kerala Education Rules (KER Chapter IV) School Standards',
    subtitleMl: 'ക്ലാസ്സ് മുറി 6.0m × 6.0m • സ്റ്റെയർകേസ് വീതി 1.50m • ഫിറ്റ്‌നസ് സർട്ടിഫിക്കറ്റ്',
    subtitleEn: 'Classroom 6.0m x 6.0m • Staircase min 1.50m • Annual Fitness Certificate',
    descriptionMl: 'സ്കൂൾ ക്ലാസ്സ് മുറികൾക്ക് കുറഞ്ഞത് 36 ച.മീറ്റർ വിസ്തീർണ്ണവും, കുട്ടികൾക്ക് സുരക്ഷിതമായ 1.50m സ്റ്റെയർകേസും കളിസ്ഥലവും നിർബന്ധം.',
    descriptionEn: 'Classroom size min 6x6m (36 sq.m) with 3.0m clear ceiling height. Min 1.50m clear staircase width.',
    badge: 'KER Ch. IV',
    actionType: 'chat',
    keywords: ['ker', 'school', 'education', 'classroom', 'stair', 'playground', 'fitness', 'സ്കൂൾ', 'ക്ലാസ്സ് മുറി', 'വിദ്യാലയം', 'കളിസ്ഥലം', 'വിദ്യാഭ്യാസം', 'ഫിറ്റ്നസ്'],
  },
  {
    id: 'statutory-parking-norms',
    category: 'statutory',
    categoryLabelMl: 'പാർക്കിംഗ് മാനദണ്ഡങ്ങൾ',
    categoryLabelEn: 'Parking Standards',
    titleMl: 'വാഹന പാർക്കിംഗ് മാനദണ്ഡങ്ങൾ (ചട്ടം 31 & Table 6)',
    titleEn: 'Off-Street Parking Standards (Rule 31 & Table 6)',
    subtitleMl: 'വീടുകൾ 150m² താഴെ: പാർക്കിംഗ് ആവശ്യമില്ല • 150-250m²: 1 കാർ പാർക്കിംഗ് (2.5×5.0m)',
    subtitleEn: 'Residential < 150 sq.m: Nil • 150-250 sq.m: 1 Car (2.5x5.0m) • > 250 sq.m: 1 per 100 sq.m',
    descriptionMl: '150 ച.മീറ്ററിൽ താഴെയുള്ള പാർപ്പിട വീടുകൾക്ക് പാർക്കിംഗ് വേണ്ട. വാണിജ്യ കെട്ടിടങ്ങൾക്ക് ഓരോ 60 ച.മീറ്റർ കാർപ്പെറ്റിനും 1 കാർ സ്ഥലം വേണം.',
    descriptionEn: 'Parking bay size 2.5m x 5.0m. Driveway min 3.0m. Commercial: 1 car space per 60 sq.m carpet area.',
    badge: 'Rule 31',
    targetTab: 'areastatement',
    actionType: 'navigate',
    keywords: ['parking', 'car', 'vehicle', 'bay', 'two wheeler', 'driveway', 'table 6', 'പാർക്കിംഗ്', 'കാർ', 'വാഹനം', 'ഡ്രൈവ് വേ', 'ചട്ടം 31'],
  },
  {
    id: 'statutory-rwh-solar',
    category: 'statutory',
    categoryLabelMl: 'മഴവെള്ളം & സോളാർ',
    categoryLabelEn: 'RWH & Solar',
    titleMl: 'മഴവെള്ള സംഭരണിയും സോളാർ ഊർജ്ജവും (ചട്ടം 48 & 49)',
    titleEn: 'Rainwater Harvesting & Solar Energy (Rule 48 & 49)',
    subtitleMl: 'റൂഫ് പ്ലിന്ത് ഏരിയയുടെ ഓരോ ച.മീറ്ററിനും 25 ലിറ്റർ RWH സംഭരണി നിർബന്ധം',
    subtitleEn: 'Mandatory 25 Litres RWH storage per sq.m of roof plinth area',
    descriptionMl: '100 ച.മീറ്ററിന് മുകളിലുള്ള എല്ലാ പുതിയ കെട്ടിടങ്ങൾക്കും മഴവെള്ള സംഭരണിയും, 200 ച.മീറ്ററിന് മുകളിലുള്ളവയ്ക്ക് സോളാർ പ്രൊവിഷനും വേണം.',
    descriptionEn: 'Mandatory RWH tank capacity of 25L/sq.m for residential > 100 sq.m. Solar rooftop provisions for large buildings.',
    badge: 'Rule 48/49',
    targetTab: 'areastatement',
    actionType: 'navigate',
    keywords: ['rainwater', 'rwh', 'solar', 'tank', 'capacity', 'plinth', 'rule 48', 'rule 49', 'മഴവെള്ള സംഭരണി', 'മഴവെള്ളം', 'സോളാർ', 'ചട്ടം 48', 'ചട്ടം 49'],
  },
];

// App Modules and Tools Index for Instant Jump
const APP_TOOLS_INDEX: SearchResultItem[] = [
  {
    id: 'tool-project',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & പ്രോജക്റ്റ്',
    categoryLabelEn: 'Tool & Project',
    titleMl: '1. പ്രോജക്റ്റ് & തദ്ദേശ സ്ഥാപനം (Authority & Site)',
    titleEn: '1. Project & Local Authority Setup',
    subtitleMl: 'തദ്ദേശ സ്ഥാപന തരം, സർവേ നമ്പർ, വാർഡ്, വില്ലേജ് വിവരങ്ങൾ',
    subtitleEn: 'Set Jurisdiction (KPBR/KMBR), Survey No, Ward, Village details',
    descriptionMl: 'പഞ്ചായത്ത് അല്ലെങ്കിൽ മുനിസിപ്പാലിറ്റി നിശ്ചയിക്കാനും ലൊക്കേഷൻ വിവരങ്ങൾ രേഖപ്പെടുത്താനും ഉള്ള ടൂൾ.',
    descriptionEn: 'Configure building jurisdiction, occupancy type, and site location parameters.',
    badge: 'Step 1',
    targetTab: 'authority',
    actionType: 'navigate',
    keywords: ['project', 'authority', 'jurisdiction', 'ward', 'survey', 'taluk', 'village', 'panchayat', 'municipality', 'corporation', 'പ്രോജക്റ്റ്', 'സർവേ', 'വാർഡ്', 'താലൂക്ക്', 'വില്ലേജ്', 'പഞ്ചായത്ത്', 'മുനിസിപ്പാലിറ്റി'],
  },
  {
    id: 'tool-drawings',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & ഡ്രോയിംഗ്',
    categoryLabelEn: 'Tool & Drawings',
    titleMl: '2. ഡ്രോയിംഗ് അപ്‌ലോഡ് & ഓട്ടോ-പാഴ്സർ (Drawing Scrutiny)',
    titleEn: '2. Drawing Upload & In-Memory CAD Scrutiny',
    subtitleMl: 'PDF / DXF / DWG ബ്ലൂപ്രിന്റ് അപ്‌ലോഡ്, തത്സമയ അളവ് കണ്ടെത്തൽ',
    subtitleEn: 'Upload architectural plans in PDF or CAD DXF for automatic measurement extraction',
    descriptionMl: 'പ്ലാനുകൾ അപ്‌ലോഡ് ചെയ്ത് സെറ്റ്ബാക്ക്, പ്ലിന്ത് ഏരിയ, അതിർത്തികൾ തത്സമയം സ്കാൻ ചെയ്യുന്ന എഞ്ചിൻ.',
    descriptionEn: 'Automated extraction of setbacks, building footprints, and boundary measurements.',
    badge: 'Step 2',
    targetTab: 'drawings',
    actionType: 'navigate',
    keywords: ['drawing', 'dwg', 'dxf', 'pdf', 'blueprint', 'upload', 'plan', 'cad', 'measurements', 'ഡ്രോയിംഗ്', 'പ്ലാൻ', 'ബ്ലൂപ്രിന്റ്', 'സിഎഡി', 'അപ്‌ലോഡ്', 'അളവുകൾ'],
  },
  {
    id: 'tool-redline',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & ഓട്ടോ-ഫിക്സ്',
    categoryLabelEn: 'Tool & CAD Fix',
    titleMl: '3. ഡ്രോയിംഗ് പരിഷ്കരണം & CAD റെഡ്‌ലൈൻ (Auto-Fix)',
    titleEn: '3. CAD Redline Visualizer & Plan Auto-Correction',
    subtitleMl: 'അപാകതകൾ തിരുത്താനുള്ള തത്സമയ ഓവർലേ, ഓട്ടോ-കറക്ഷൻ പാരാമീറ്ററുകൾ',
    subtitleEn: 'Interactive CAD overlay showing exact violation points and auto-fix recommendations',
    descriptionMl: 'സെറ്റ്ബാക്ക് കുറവുകൾ എങ്ങനെ പരിഹരിക്കാമെന്ന് വിഷ്വലായി കാണിക്കുന്ന റെഡ്‌ലൈൻ സ്റ്റുഡിയോ.',
    descriptionEn: 'Interactive plan modifier showing setbacks, compliant offset lines, and auto-fix rules.',
    badge: 'Auto-Fix',
    targetTab: 'redline',
    actionType: 'navigate',
    keywords: ['redline', 'fix', 'revision', 'modification', 'cad fix', 'auto fix', 'overlay', 'റെഡ്‌ലൈൻ', 'തിരുത്തൽ', 'പരിഷ്കരണം', 'അപാകത പരിഹാരം', 'പ്ലാൻ തിരുത്തൽ'],
  },
  {
    id: 'tool-areastatement',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & കാൽക്കുലേറ്റർ',
    categoryLabelEn: 'Tool & Calculator',
    titleMl: '4. ഏരിയ സ്റ്റേറ്റ്‌മെന്റ് & അളവുകൾ (Area Statement Form)',
    titleEn: '4. Area Statement & Dimension Calculator',
    subtitleMl: 'പ്ലോട്ട് വിസ്തീർണ്ണം, സെറ്റ്ബാക്ക്, FAR, കവറേജ്, പാർക്കിംഗ്, കിണർ അകലം',
    subtitleEn: 'Plot area, built-up area, setbacks, height, coverage, well & septic clearances',
    descriptionMl: 'കെട്ടിടത്തിന്റെ എല്ലാ അളവുകളും ഇൻപുട്ട് ചെയ്ത് തത്സമയം ചട്ടങ്ങൾ ഒത്തുനോക്കുന്ന ഫോം.',
    descriptionEn: 'Comprehensive statutory input form for all spatial and dimension parameters.',
    badge: 'Calculator',
    targetTab: 'areastatement',
    actionType: 'navigate',
    keywords: ['area statement', 'coverage', 'built up', 'carpet', 'far', 'height', 'setback', 'parking', 'well', 'septic', 'ഏരിയ സ്റ്റേറ്റ്‌മെന്റ്', 'കാർപ്പെറ്റ്', 'വിസ്തീർണ്ണം', 'ഉയരം', 'സെറ്റ്ബാക്ക്', 'കിണർ', 'സെപ്റ്റിക്', 'കണക്കുകൂട്ടൽ'],
  },
  {
    id: 'tool-scrutiny',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & ചട്ട പരിശോധന',
    categoryLabelEn: 'Tool & Scrutiny',
    titleMl: '5. ചട്ട സ്ക്രൂട്ടിനി & നിയമ പരിശോധന (Code Scrutiny Engine)',
    titleEn: '5. Code Scrutiny Engine & Compliance Results',
    subtitleMl: 'KMBR / KPBR 2019 ചട്ടങ്ങൾ പൂർണ്ണമായി വിശകലനം ചെയ്ത് പരിശോധിക്കുന്ന എഞ്ചിൻ',
    subtitleEn: 'Automated legal rule-checking matrix across all 15 statutory chapters',
    descriptionMl: 'ഓരോ ചട്ടവും പാസായോ പരാജയപ്പെട്ടോ എന്ന് കൃത്യമായ റൂൾ നമ്പറുകളോടെ കാണിക്കുന്ന അനാലിസിസ്.',
    descriptionEn: 'Granular pass/fail verification for each statutory clause with precise rule citations.',
    badge: 'Code Engine',
    targetTab: 'scrutiny',
    actionType: 'navigate',
    keywords: ['scrutiny', 'code check', 'compliance', 'kmbr', 'kpbr', 'pass', 'fail', 'violation', 'rules check', 'സ്ക്രൂട്ടിനി', 'ചട്ട പരിശോധന', 'പിഴവുകൾ', 'നിയമം', 'ഫലം', 'പരിശോധന'],
  },
  {
    id: 'tool-rfi',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & നോട്ടീസ് മറുപടി',
    categoryLabelEn: 'Tool & Notice Generator',
    titleMl: '6. നോട്ടീസ്, RFI & ഒബ്ജക്ഷൻ നിവാരണ കത്തുകൾ (Notice Generator)',
    titleEn: '6. Notice, RFI & Defect Memo Reply Builder',
    subtitleMl: 'കെ-സ്മാർട്ട് ന്യൂനത നിവാരണ കത്തുകൾ, റൂൾ 60 ഇളവ് അപേക്ഷകൾ, സത്യവാങ്മൂലം',
    subtitleEn: 'Generate official replies for defect notices, Rule 60 exemption petitions, and affidavits',
    descriptionMl: 'തദ്ദേശ സ്ഥാപനങ്ങളിൽ സമർപ്പിക്കാനുള്ള ഔദ്യോഗിക കത്തുകൾ സ്വയം തയ്യാറാക്കുന്ന ടൂൾ.',
    descriptionEn: 'Generate formal legal reply letters, exemption petitions, and neighbor consent affidavits.',
    badge: 'K-SMART Docs',
    targetTab: 'rfi',
    actionType: 'navigate',
    keywords: ['notice', 'rfi', 'defect memo', 'objection', 'reply letter', 'exemption petition', 'affidavit', 'rule 60 petition', 'k-smart reply', 'നോട്ടീസ്', 'ആർഎഫ്ഐ', 'ന്യൂനത നോട്ടീസ്', 'ഒബ്ജക്ഷൻ', 'മറുപടി കത്ത്', 'ഇളവ് അപേക്ഷ', 'സത്യവാങ്മൂലം'],
  },
  {
    id: 'tool-boq',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & എസ്റ്റിമേറ്റ്',
    categoryLabelEn: 'Tool & BOQ Estimator',
    titleMl: '7. സ്മാർട്ട് BOQ & നിർമ്മാണ എസ്റ്റിമേറ്റ് (Cost Estimator)',
    titleEn: '7. Smart BOQ & Construction Cost Estimator',
    subtitleMl: 'സിമന്റ്, കമ്പി, കോൺക്രീറ്റ് മെറ്റീരിയൽ അളവുകളും ബഡ്ജറ്റ് കണക്കുകൂട്ടലും',
    subtitleEn: 'Calculate material takeoff (cement, steel, concrete) and estimated construction budget',
    descriptionMl: 'പ്ലിന്ത് ഏരിയയ്ക്ക് അനുസരിച്ച് മെറ്റീരിയൽ അളവുകളും നിലവിലെ കേരള മാർക്കറ്റ് റേറ്റും നൽകുന്നു.',
    descriptionEn: 'Accurate Bill of Quantities (BOQ) with Kerala PWD DSR benchmark rates.',
    badge: 'Estimator',
    targetTab: 'boq',
    actionType: 'navigate',
    keywords: ['boq', 'estimate', 'cost', 'material', 'steel', 'cement', 'concrete', 'rate', 'budget', 'taking off', 'എസ്റ്റിമേറ്റ്', 'ചിലവ്', 'സിമന്റ്', 'കമ്പി', 'ബിൽ ഓഫ് ക്വാണ്ടിറ്റി', 'ബഡ്ജറ്റ്'],
  },
  {
    id: 'tool-report',
    category: 'tool',
    categoryLabelMl: 'ടൂൾ & റിപ്പോർട്ട്',
    categoryLabelEn: 'Tool & Report',
    titleMl: '8. ഔദ്യോഗിക പെർമിറ്റ് പരിശോധനാ റിപ്പോർട്ട് (Permit Report PDF)',
    titleEn: '8. Official Permit Verification Report & PDF Export',
    subtitleMl: 'തദ്ദേശ സ്ഥാപന സമർപ്പണത്തിന് യോഗ്യമായ സമഗ്ര റിപ്പോർട്ടും PDF എക്സ്പോർട്ടും',
    subtitleEn: 'Comprehensive statutory permit verification report ready for municipal submission',
    descriptionMl: 'എല്ലാ പരിശോധനാ ഫലങ്ങളും ഉൾപ്പെടുത്തി പ്രിന്റ് ചെയ്യാവുന്ന ഔദ്യോഗിക പെർമിറ്റ് റിപ്പോർട്ട്.',
    descriptionEn: 'Formal submission-ready compliance dossier with authority certification stamps.',
    badge: 'Report PDF',
    targetTab: 'report',
    actionType: 'navigate',
    keywords: ['report', 'permit report', 'pdf', 'verification summary', 'certificate', 'print', 'export', 'റിപ്പോർട്ട്', 'പെർമിറ്റ് റിപ്പോർട്ട്', 'സർട്ടിഫിക്കറ്റ്', 'പിഡിഎഫ്', 'പ്രിന്റ്'],
  },
  {
    id: 'tool-vinyasa-ai',
    category: 'tool',
    categoryLabelMl: 'AI ചട്ട ഉപദേശകൻ',
    categoryLabelEn: 'AI Rules Advisor',
    titleMl: 'വിന്യാസ AI ചട്ട ഉപദേശകൻ (VINYASA AI Co-Pilot)',
    titleEn: 'VINYASA AI Municipal Rules Consultant',
    subtitleMl: 'തത്സമയ സംശയ നിവാരണം, ചട്ട നമ്പറുകൾ, ഇളവ് സാധ്യതകൾ',
    subtitleEn: 'Conversational compliance co-pilot with real-time reasoning and KBR knowledge',
    descriptionMl: 'ഒരു ചീഫ് മുനിസിപ്പൽ എൻജിനീയറെപ്പോലെ നിങ്ങളുടെ ഏത് സംശയങ്ങൾക്കും തത്സമയം മറുപടി നൽകുന്നു.',
    descriptionEn: 'Senior Government Chief Municipal Engineer persona for personalized rule consultation.',
    badge: 'AI Assistant',
    actionType: 'chat',
    keywords: ['ai', 'chat', 'vinyasa', 'chatbot', 'assistant', 'advisor', 'consultant', 'വിന്യാസ', 'ചാറ്റ്', 'അസിസ്റ്റന്റ്', 'ഉപദേശകൻ', 'ചോദ്യം', 'ഹായ്', 'ഹലോ'],
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  jurisdiction,
  setJurisdiction,
  currentUser,
  onRunScrutiny,
  onReset,
  onLogout,
  onOpenChat,
}) => {
  const isMl = language === 'ml';
  const isSuper = isUserSuperAdmin(currentUser);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close search suggestions & profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut (Ctrl+K or Cmd+K or /) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        desktopSearchInputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyEmail = () => {
    if (currentUser?.email) {
      navigator.clipboard.writeText(currentUser.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Build the master searchable index
  const masterSearchIndex = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Add all App Tools
    items.push(...APP_TOOLS_INDEX);

    // 2. Add Special Statutory Topics (CRZ, Wetland, Well-Septic, etc.)
    items.push(...SPECIAL_STATUTORY_TOPICS);

    // 3. Add Kerala Building Rules from database
    KERALA_COMPLETE_RULES_DATABASE.forEach((rule) => {
      items.push({
        id: `rule-${rule.id}`,
        category: 'rule',
        categoryLabelMl: 'കെട്ടിട നിർമ്മാണ ചട്ടം',
        categoryLabelEn: 'Building Rule',
        titleMl: rule.titleMl,
        titleEn: rule.titleEn,
        subtitleMl: `${rule.ruleKmbr} / ${rule.ruleKpbr} • ${rule.chapter}`,
        subtitleEn: `${rule.ruleKmbr} / ${rule.ruleKpbr} • ${rule.chapter}`,
        descriptionMl: rule.summaryMl,
        descriptionEn: rule.summaryEn,
        badge: rule.ruleKmbr.replace('KMBR ', ''),
        targetTab: 'scrutiny',
        actionType: 'navigate',
        keywords: [
          rule.ruleKmbr.toLowerCase(),
          rule.ruleKpbr.toLowerCase(),
          rule.titleEn.toLowerCase(),
          rule.titleMl.toLowerCase(),
          rule.chapter.toLowerCase(),
          rule.category.toLowerCase(),
          ...rule.summaryEn.toLowerCase().split(' '),
          ...rule.summaryMl.toLowerCase().split(' '),
        ],
      });
    });

    // 4. Add Government Orders & Amendments
    KERALA_AMENDMENTS_FULL_ARCHIVE.forEach((amendment) => {
      items.push({
        id: `amendment-${amendment.id}`,
        category: 'amendment',
        categoryLabelMl: 'സർക്കാർ ഭേദഗതി',
        categoryLabelEn: 'Govt Amendment',
        titleMl: amendment.titleMl,
        titleEn: amendment.titleEn,
        subtitleMl: `${amendment.orderNumber} • ${amendment.notificationDate}`,
        subtitleEn: `${amendment.orderNumber} • ${amendment.notificationDate}`,
        descriptionMl: amendment.summaryMl,
        descriptionEn: amendment.summaryEn,
        badge: 'G.O.',
        targetTab: 'scrutiny',
        actionType: 'navigate',
        keywords: [
          amendment.orderNumber.toLowerCase(),
          amendment.titleEn.toLowerCase(),
          amendment.titleMl.toLowerCase(),
          amendment.summaryEn.toLowerCase(),
          amendment.summaryMl.toLowerCase(),
          ...amendment.affectedRules.map((r) => r.toLowerCase()),
        ],
      });
    });

    return items;
  }, []);

  // Filter and rank search results based on query
  const searchResults = useMemo<SearchResultItem[]>(() => {
    const q = globalSearch.trim().toLowerCase();
    if (!q) return [];

    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = masterSearchIndex.map((item) => {
      let score = 0;
      const titleEn = item.titleEn.toLowerCase();
      const titleMl = item.titleMl.toLowerCase();
      const subtitleEn = item.subtitleEn.toLowerCase();
      const subtitleMl = item.subtitleMl.toLowerCase();
      const descEn = (item.descriptionEn || '').toLowerCase();
      const descMl = (item.descriptionMl || '').toLowerCase();

      // Exact phrase match in titles
      if (titleEn.includes(q) || titleMl.includes(q)) score += 50;
      if (subtitleEn.includes(q) || subtitleMl.includes(q)) score += 30;
      if (descEn.includes(q) || descMl.includes(q)) score += 15;

      // Token matching in keywords
      tokens.forEach((token) => {
        if (titleEn.includes(token) || titleMl.includes(token)) score += 20;
        if (subtitleEn.includes(token) || subtitleMl.includes(token)) score += 10;
        if (item.keywords.some((k) => k.includes(token))) score += 12;
        if (descEn.includes(token) || descMl.includes(token)) score += 5;
      });

      // Bonus for app tools
      if (item.category === 'tool') score += 10;
      if (item.category === 'statutory') score += 8;

      return { item, score };
    });

    return scored
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.item)
      .slice(0, 8);
  }, [globalSearch, masterSearchIndex]);

  const handleSelectSearchResult = (result: SearchResultItem) => {
    setIsSearchOpen(false);
    setIsMobileSearchOpen(false);
    setGlobalSearch('');

    if (result.actionType === 'chat') {
      if (onOpenChat) {
        onOpenChat();
      } else {
        setActiveTab('authority');
      }
    } else if (result.targetTab) {
      setActiveTab(result.targetTab);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (searchResults.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedResultIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = searchResults[selectedResultIndex] || searchResults[0];
      if (selected) {
        handleSelectSearchResult(selected);
      }
    }
  };

  // Compute user initial letter
  const userInitial = currentUser?.email
    ? currentUser.email.charAt(0).toUpperCase()
    : currentUser?.name
    ? currentUser.name.charAt(0).toUpperCase()
    : 'U';

  const getCategoryIcon = (category: SearchResultItem['category']) => {
    switch (category) {
      case 'tool':
        return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'statutory':
        return <Waves className="w-3.5 h-3.5 text-emerald-400" />;
      case 'rule':
        return <Scale className="w-3.5 h-3.5 text-blue-400" />;
      case 'amendment':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Search className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#07090E]/95 border-b border-white/10 shadow-[0_10px_35px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      {/* Top Main Brand & Control Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
        {/* Brand Logo & Vinyasa pill badge */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('authority')}
            className="flex items-center gap-2 text-left group focus:outline-none cursor-pointer"
          >
            <VinyasaLogo variant="full" size="md" theme="dark" showDomain={true} />
          </button>
          
          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-extrabold tracking-wider uppercase shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>KBR AI Engine</span>
          </div>
        </div>

        {/* Global Omnipresent Search Bar (Desktop & Tablet) */}
        <div ref={searchContainerRef} className="relative flex-1 max-w-lg hidden md:block mx-2">
          <div className="relative">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-2.5 pointer-events-none" />
            <input
              ref={desktopSearchInputRef}
              type="text"
              id="global-search-input"
              value={globalSearch}
              onChange={(e) => {
                setGlobalSearch(e.target.value);
                setIsSearchOpen(true);
                setSelectedResultIndex(0);
              }}
              onFocus={() => setIsSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder={
                isMl
                  ? 'ചട്ടങ്ങൾ, CRZ, സെറ്റ്ബാക്ക്, കിണർ, പാർക്കിംഗ്, ടൂളുകൾ തിരയുക...'
                  : 'Search building rules, CRZ, setbacks, parking, tools (Ctrl+K)...'
              }
              className="w-full pl-10 pr-20 py-2 text-xs bg-[#0C1425]/90 hover:bg-[#0E182D] border border-cyan-500/30 focus:border-cyan-400 focus:bg-[#0F1B33] rounded-xl text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
            />

            {/* Clear Button and Shortcut Badge */}
            <div className="absolute right-2.5 top-2 flex items-center gap-1.5">
              {globalSearch ? (
                <button
                  type="button"
                  onClick={() => {
                    setGlobalSearch('');
                    setIsSearchOpen(false);
                  }}
                  className="text-slate-400 hover:text-slate-200 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-900 border border-slate-700 rounded font-semibold">
                  <span>⌘K</span>
                </kbd>
              )}
            </div>
          </div>

          {/* Real-time Dynamic Search Results Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full mt-2 w-full bg-[#070D1C] border border-cyan-500/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95),0_0_30px_rgba(0,240,255,0.2)] overflow-hidden z-50 animate-fadeIn">
              {/* Header Bar with Count */}
              <div className="px-3.5 py-2 bg-gradient-to-r from-slate-900 via-[#0B152A] to-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px]">
                <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  <span>
                    {globalSearch.trim()
                      ? `${searchResults.length} ${isMl ? 'ഫലങ്ങൾ കണ്ടെത്തി' : 'matching results'}`
                      : isMl ? 'ജനപ്രിയ വിഷയങ്ങളും ടൂളുകളും' : 'Suggested Topics & Tools'}
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isMl ? '↑↓ തിരഞ്ഞെടുക്കുക • ↵ തുറക്കുക' : '↑↓ Navigate • ↵ Open'}
                </span>
              </div>

              {/* Result List Items */}
              <div className="divide-y divide-slate-800/60 max-h-[380px] overflow-y-auto no-scrollbar">
                {(globalSearch.trim() ? searchResults : APP_TOOLS_INDEX.slice(0, 4).concat(SPECIAL_STATUTORY_TOPICS.slice(0, 3))).map(
                  (item, idx) => {
                    const isSelected = idx === selectedResultIndex;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectSearchResult(item)}
                        onMouseEnter={() => setSelectedResultIndex(idx)}
                        className={`p-3 cursor-pointer transition-all flex items-start justify-between gap-3 group ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-950/80 via-blue-950/60 to-transparent border-l-2 border-cyan-400'
                            : 'hover:bg-slate-900/60 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-850 text-slate-300 border border-slate-700">
                              {getCategoryIcon(item.category)}
                              <span>{isMl ? item.categoryLabelMl : item.categoryLabelEn}</span>
                            </span>
                            {item.badge && (
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 mt-1 truncate">
                            {isMl ? item.titleMl : item.titleEn}
                          </div>

                          <div className="text-[11px] text-cyan-400/80 font-mono mt-0.5 truncate">
                            {isMl ? item.subtitleMl : item.subtitleEn}
                          </div>

                          {(item.descriptionMl || item.descriptionEn) && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                              {isMl ? item.descriptionMl : item.descriptionEn}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 pt-1 flex items-center gap-1 text-[10px] font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                          <span className="hidden sm:inline">
                            {item.actionType === 'chat'
                              ? isMl ? 'AI ചോദിക്കുക' : 'Ask AI'
                              : isMl ? 'തുറക്കുക' : 'Open'}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    );
                  }
                )}

                {searchResults.length === 0 && globalSearch.trim() !== '' && (
                  <div className="p-6 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-300">
                      {isMl ? `"${globalSearch}" എന്നതിൽ ഫലങ്ങൾ കണ്ടെത്തിയില്ല` : `No exact match for "${globalSearch}"`}
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      {isMl
                        ? 'വിന്യാസ AI-യോട് ഈ വിഷയത്തെക്കുറിച്ച് നേരിട്ട് ചോദിക്കാവുന്നതാണ്.'
                        : 'You can directly ask VINYASA AI Assistant regarding this rule.'}
                    </p>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        if (onOpenChat) onOpenChat();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bot className="w-3.5 h-3.5" />
                      <span>{isMl ? 'വിന്യാസ AI-യോട് ചോദിക്കുക' : 'Consult VINYASA AI'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Prompt Hint Footer */}
              <div className="p-2 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                <span className="truncate">
                  {isMl
                    ? 'സെറ്റ്ബാക്ക്, CRZ, കിണർ അകലം, പാർക്കിംഗ്, ഫയർ സുരക്ഷ എന്നിവ തിരയുക'
                    : 'Search setbacks, CRZ, well buffer, parking, fire NOC & small plot'}
                </span>
                <span className="font-mono text-cyan-400 shrink-0 ml-2">Kerala KBR 2019-2026</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Action Tools: Mobile Search Trigger, Jurisdiction, Language, Scrutiny Button, User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile Search Open Trigger Button */}
          <button
            id="mobile-search-trigger-btn"
            onClick={() => {
              setIsMobileSearchOpen(true);
              setTimeout(() => mobileSearchInputRef.current?.focus(), 100);
            }}
            className="md:hidden p-2 text-cyan-400 hover:text-white bg-[#0D1424] hover:bg-slate-800 border border-slate-800 rounded-lg cursor-pointer transition-colors"
            title="Search Rules / തിരയുക"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Jurisdiction Selector */}
          <div className="flex items-center bg-[#0D1424] p-0.5 rounded-lg border border-slate-800 shadow-sm text-xs font-semibold">
            <button
              id="jurisdiction-nav-kpbr"
              onClick={() => setJurisdiction('KPBR')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                jurisdiction === 'KPBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Panchayat Building Rules, 2019"
            >
              KPBR
            </button>
            <button
              id="jurisdiction-nav-kmbr"
              onClick={() => setJurisdiction('KMBR')}
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-md transition-all cursor-pointer text-[11px] sm:text-xs ${
                jurisdiction === 'KMBR'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Kerala Municipality Building Rules, 2019"
            >
              KMBR
            </button>
          </div>

          {/* Bilingual Switcher Toggle (English / മലയാളം) */}
          <button
            id="lang-toggle-btn"
            onClick={() => setLanguage(language === 'ml' ? 'en' : 'ml')}
            className="flex items-center gap-1 text-[11px] sm:text-xs bg-[#0D1424] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 text-slate-200 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-all font-semibold cursor-pointer shadow-sm hover:text-cyan-300"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{language === 'ml' ? 'Eng' : 'മല'}</span>
          </button>

          {/* Run Scrutiny Action Button */}
          <button
            id="run-scrutiny-btn"
            onClick={onRunScrutiny}
            className="flex items-center gap-1.5 text-xs font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 px-2.5 sm:px-3.5 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.35)] transition-all transform active:scale-95 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">{isMl ? 'ചട്ട പരിശോധന' : 'Run Scrutiny'}</span>
            <span className="sm:hidden">{isMl ? 'സ്ക്രൂട്ടിനി' : 'Scrutiny'}</span>
          </button>

          {/* Reset Button */}
          <button
            id="reset-form-btn"
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg border border-transparent hover:border-slate-800 transition-colors cursor-pointer"
            title="Reset Form / തുടക്കം മുതൽ ആരംഭിക്കുക"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Account Profile Menu */}
          {currentUser && (
            <div ref={profileMenuRef} className="relative flex items-center gap-1 pl-1 sm:pl-2 border-l border-slate-800">
              <button
                type="button"
                id="user-profile-menu-btn"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-1.5 py-1 px-1.5 sm:px-2 rounded-xl border transition-all cursor-pointer ${
                  isProfileMenuOpen
                    ? 'bg-cyan-950/80 border-cyan-500/60 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                    : 'bg-[#0D1424] hover:bg-slate-850 border-slate-800 hover:border-cyan-700/50'
                }`}
                title={isMl ? 'അക്കൗണ്ട് വിവരങ്ങൾ' : 'Account Details'}
              >
                <div className="relative shrink-0">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 border border-cyan-300/60 text-white font-black text-xs flex items-center justify-center shadow-md">
                    {userInitial}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-slate-950" />
                </div>

                <div className="hidden xl:block text-left">
                  <div className="text-[11px] font-bold text-slate-200 truncate max-w-[110px]">
                    {currentUser.email || currentUser.name}
                  </div>
                </div>

                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Profile Menu Dropdown */}
              {isProfileMenuOpen && (
                <div className="fixed sm:absolute right-3 sm:right-0 top-14 sm:top-full sm:mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-[340px] bg-[#070E1E] border border-cyan-500/50 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden z-50 animate-scaleUp text-left">
                  <div className="p-3.5 bg-gradient-to-br from-slate-900 via-[#0B152A] to-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white flex items-center justify-center text-base font-black shrink-0 shadow-md">
                        {userInitial}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{currentUser.email}</div>
                        <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 font-semibold">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{isMl ? 'സ്ഥിരീകരിച്ച അക്കൗണ്ട്' : 'Verified Account'}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 space-y-2 bg-[#070D1B]">
                    <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-2.5 space-y-1">
                      <div className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider">
                        {isMl ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                      </div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono font-bold text-slate-200 truncate">{currentUser.email}</span>
                        <button
                          type="button"
                          onClick={handleCopyEmail}
                          className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] flex items-center gap-1 cursor-pointer"
                        >
                          {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {isSuper && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('admin');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isMl ? 'സൂപ്പർ അഡ്മിൻ പാനൽ' : 'Super Admin Panel'}</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full py-2 px-3 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-400" />
                      <span>{isMl ? 'ലോഗ് ഔട്ട് ചെയ്യുക' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Modal Overlay */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md p-4 flex flex-col md:hidden animate-fadeIn">
          <div className="flex items-center gap-2 pb-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder={isMl ? 'ചട്ടങ്ങൾ, CRZ, സെറ്റ്ബാക്ക്, കിണർ തിരയുക...' : 'Search building rules, CRZ, setbacks...'}
                className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-900 border border-cyan-500/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              {globalSearch && (
                <button
                  onClick={() => setGlobalSearch('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setIsMobileSearchOpen(false)}
              className="px-3 py-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
            >
              {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
          </div>

          {/* Mobile Search Results */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800 space-y-1">
            {(globalSearch.trim() ? searchResults : APP_TOOLS_INDEX.concat(SPECIAL_STATUTORY_TOPICS)).map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectSearchResult(item)}
                className="p-3 bg-slate-900/60 rounded-xl my-1 border border-slate-800/80 active:bg-cyan-950/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-cyan-300 border border-cyan-500/30">
                    {isMl ? item.categoryLabelMl : item.categoryLabelEn}
                  </span>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold text-slate-400">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1">
                  {isMl ? item.titleMl : item.titleEn}
                </div>
                <div className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
                  {isMl ? item.subtitleMl : item.subtitleEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs Bar (Streamlined & Free from redundant rightmost status badge) */}
      <div className="bg-[#080C16]/95 border-t border-white/5 px-3 sm:px-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar">
          <nav className="flex space-x-1 sm:space-x-1.5 py-2 min-w-max text-xs sm:text-sm font-medium">
            <button
              id="nav-tab-authority"
              onClick={() => setActiveTab('authority')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'authority'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '1. പ്രോജക്റ്റ്' : '1. Project'}</span>
            </button>

            <button
              id="nav-tab-drawings"
              onClick={() => setActiveTab('drawings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'drawings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '2. ഡ്രോയിംഗ്' : '2. Drawings'}</span>
            </button>

            <button
              id="nav-tab-redline"
              onClick={() => setActiveTab('redline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'redline'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-sky-400" />
              <span>{isMl ? '3. ഡ്രോയിംഗ് പരിഷ്കരണം' : '3. Drawing Revision'}</span>
              <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-400/40 px-1 rounded uppercase font-bold">
                Auto-Fix
              </span>
            </button>

            <button
              id="nav-tab-areastatement"
              onClick={() => setActiveTab('areastatement')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'areastatement'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isMl ? '4. ഏരിയ സ്റ്റേറ്റ്‌മെന്റ്' : '4. Area Statement'}</span>
            </button>

            <button
              id="nav-tab-scrutiny"
              onClick={() => setActiveTab('scrutiny')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'scrutiny'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '5. ചട്ട സ്ക്രൂട്ടിനി' : '5. Code Scrutiny'}</span>
            </button>

            <button
              id="nav-tab-rfi"
              onClick={() => setActiveTab('rfi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'rfi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileQuestion className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isMl ? '6. നോട്ടീസ് & RFI' : '6. Notice & RFI'}</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1 rounded uppercase font-extrabold">
                K-SMART
              </span>
            </button>

            <button
              id="nav-tab-boq"
              onClick={() => setActiveTab('boq')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'boq'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{isMl ? '7. സ്മാർട്ട് BOQ' : '7. Smart BOQ'}</span>
            </button>

            <button
              id="nav-tab-report"
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'report'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_12px_rgba(0,240,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isMl ? '8. റിപ്പോർട്ട്' : '8. Report'}</span>
            </button>

            {/* Super Admin Exclusive Tab */}
            {isSuper && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30 border border-amber-500/30'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>{isMl ? '👑 സൂപ്പർ അഡ്മിൻ' : '👑 Super Admin'}</span>
                <span className="text-[8px] bg-amber-400 text-slate-950 font-black px-1 rounded uppercase">
                  Live
                </span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

