import { Language } from '../types';

export const TRANSLATIONS = {
  appTitle: {
    en: 'Kerala Building Rules Scrutiny & Compliance Engine',
    ml: 'കേരള കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ പരിശോധനാ സിസ്റ്റം (KMBR & KPBR)',
  },
  subTitle: {
    en: 'Automated Engineering Plan Verification for KMBR & KPBR (2019 & Latest Amendments)',
    ml: 'മുനിസിപ്പാലിറ്റി / പഞ്ചായത്ത് കെട്ടിട നിർമ്മാണ ചട്ടങ്ങൾ പ്രകാരമുള്ള സമഗ്ര പ്ലാൻ പരിശോധന',
  },
  tabAuthority: {
    en: '1. Project & Rules',
    ml: '1. പ്രോജക്റ്റും ചട്ടങ്ങളും',
  },
  tabDrawings: {
    en: '2. Drawing Uploads',
    ml: '2. ഡ്രോയിംഗുകൾ അപ്‌ലോഡ്',
  },
  tabAreaStatement: {
    en: '3. Area Statement & Data',
    ml: '3. ഏരിയ സ്റ്റേറ്റ്മെന്റ് & അളവുകൾ',
  },
  tabScrutiny: {
    en: '4. Rule Scrutiny Results',
    ml: '4. ചട്ട പരിശോധനാ ഫലം',
  },
  tabReport: {
    en: '5. Scrutiny Report & PDF',
    ml: '5. പരിശോധനാ റിപ്പോർട്ടും PDF-ഉം',
  },
  tabRulebook: {
    en: '6. KMBR/KPBR Rulebook',
    ml: '6. ചട്ട പുസ്തകം & ഭേദഗതികൾ',
  },
  loadPreset: {
    en: 'Load Sample Project',
    ml: 'മാതൃകാ പ്രോജക്റ്റ് ലോഡ് ചെയ്യുക',
  },
  runScrutinyBtn: {
    en: 'Run Automated Rule Scrutiny',
    ml: 'പൂർണ്ണ ചട്ട പരിശോധന നടത്തുക',
  },
  downloadPdf: {
    en: 'Download PDF Report',
    ml: 'പി.ഡി.എഫ് റിപ്പോർട്ട് ഡൗൺലോഡ് ചെയ്യുക',
  },
  printReport: {
    en: 'Print Scrutiny Certificate',
    ml: 'റിപ്പോർട്ട് പ്രിന്റ് ചെയ്യുക',
  },
  statusApproved: {
    en: 'COMPLIANT / APPROVED',
    ml: 'ചട്ടപ്രകാരം കൃത്യം / അംഗീകൃത യോഗ്യം',
  },
  statusDefective: {
    en: 'DEFECTS DETECTED / REVISE PLAN',
    ml: 'പിഴവുകൾ കണ്ടെത്തി / പ്ലാൻ തിരുത്തണം',
  },
  statusConditional: {
    en: 'CONDITIONAL / FEE PAYABLE',
    ml: 'വ്യവസ്ഥകൾക്ക് വിധേയം / ഫീസ് അടയ്ക്കണം',
  },
};

export function t(key: keyof typeof TRANSLATIONS, lang: Language): string {
  return TRANSLATIONS[key]?.[lang] || '';
}
