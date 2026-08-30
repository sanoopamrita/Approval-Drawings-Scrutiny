import { SystemConfig } from '../types';

const CONFIG_STORAGE_KEY = 'vinyasa_kbr_system_config_v1';

export const DEFAULT_SYSTEM_CONFIG: SystemConfig = {
  systemPromptModifier: `Enforce standard Kerala Building Rules provisions with latest LSGD Gazette amendments. Ensure clear citations of KMBR / KPBR rule numbers for any discrepancy detected. Always explain rectification in practical engineering steps.`,
  kbrVersionKmbr: 'KMBR (Latest amended)',
  kbrVersionKpbr: 'KPBR (Latest amended)',
  lastRulesUpdatedDate: '30-08-2026',
  syncedKnowledgeSummary: 'Verified & indexed 2026 LSGD Gazette notifications, K-Smart self-certification circulars, NBC Part IV fire safety, and small plot concessions.',
  syncedItemsCount: 14,
  baseFarResidentialKmbr: 3.0,
  baseFarResidentialKpbr: 2.75,
  minDrinkingWellDistanceM: 7.5,
  rwhLitersPerSqM: 25.0,
  maxSmallPlotAreaSqM: 125.0,
  notice: {
    id: 'notice-2026-01',
    enabled: false,
    type: 'info',
    titleEn: 'LSGD Digital Building Scrutiny System (Stateless Mode Active)',
    titleMl: 'ഡിജിറ്റൽ കെട്ടിട ചട്ട പരിശോധന - സീറോ-സ്റ്റോറേജ് പ്രൈവസി സുരക്ഷ സജീവം',
    messageEn: 'All architectural drawings and CAD plots are processed entirely in temporary browser memory with Zero Cloud File Retention.',
    messageMl: 'സമർപ്പിക്കുന്ന എല്ലാ പ്ലാനുകളും താത്കാലിക മെമ്മറിയിൽ മാത്രം പരിശോധിക്കപ്പെടുന്നു. ഡ്രോയിംഗുകൾ ക്ലൗഡിൽ സൂക്ഷിക്കുന്നില്ല.',
    updatedAt: Date.now(),
    updatedBy: 'sanoop.amrita@gmail.com (Super Admin)',
  },
  features: {
    enableAiVisionAnalysis: true,
    enableAutomaticSmallPlotRule60: true,
    enableStrictDrinkingWellClearance: true,
    enableRwhFormulaEnforcement: true,
    enableSolarRooftopMandate500SqM: true,
    enableRealTimeComparisonTable: true,
    enableGuestTrialMode: true,
    enforceZeroStorageStatelessProcessing: true,
  },
  lastModifiedAt: Date.now(),
  lastModifiedBy: 'sanoop.amrita@gmail.com (Super Admin)',
};

type ConfigListener = (config: SystemConfig) => void;
const listeners: Set<ConfigListener> = new Set();

export function getFormattedRulesTag(jurisdiction: 'KMBR' | 'KPBR', config?: SystemConfig): string {
  const cfg = config || getSystemConfig();
  const dateStr = cfg.lastRulesUpdatedDate || '30-08-2026';
  return `${jurisdiction} (Latest amended | Updated on: ${dateStr})`;
}

export function getSystemConfig(): SystemConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SYSTEM_CONFIG,
        ...parsed,
        notice: { ...DEFAULT_SYSTEM_CONFIG.notice, ...(parsed.notice || {}) },
        features: { ...DEFAULT_SYSTEM_CONFIG.features, ...(parsed.features || {}) },
      };
    }
  } catch (e) {
    console.error('[ConfigService] Failed to parse stored config, using defaults:', e);
  }
  return DEFAULT_SYSTEM_CONFIG;
}

export function saveSystemConfig(newConfig: Partial<SystemConfig>, modifiedBy: string = 'sanoop.amrita@gmail.com'): SystemConfig {
  const current = getSystemConfig();
  const updated: SystemConfig = {
    ...current,
    ...newConfig,
    lastModifiedAt: Date.now(),
    lastModifiedBy: modifiedBy,
  };

  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[ConfigService] Failed to save config to localStorage:', e);
  }

  // Notify all active component subscribers
  listeners.forEach((listener) => {
    try {
      listener(updated);
    } catch (err) {
      console.error('[ConfigService] Listener error:', err);
    }
  });

  return updated;
}

export function subscribeSystemConfig(listener: ConfigListener): () => void {
  listeners.add(listener);
  // Trigger immediately with current config
  listener(getSystemConfig());
  return () => {
    listeners.delete(listener);
  };
}

export function resetSystemConfig(modifiedBy: string = 'sanoop.amrita@gmail.com'): SystemConfig {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (e) {
    // Ignore
  }
  const resetConfig = { ...DEFAULT_SYSTEM_CONFIG, lastModifiedAt: Date.now(), lastModifiedBy: modifiedBy };
  saveSystemConfig(resetConfig, modifiedBy);
  return resetConfig;
}

export const subscribeToConfigChange = subscribeSystemConfig;
