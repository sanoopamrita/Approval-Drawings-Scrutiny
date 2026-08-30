import { User, UserRole, AccessLogMetadata, JurisdictionType, SUPER_ADMIN_EMAIL } from '../types';

const AUTH_USER_STORAGE_KEY = 'vinyasa_kbr_auth_user_v1';
const ACCESS_LOGS_STORAGE_KEY = 'vinyasa_kbr_access_logs_v1';
const SESSION_START_KEY = 'vinyasa_kbr_session_start_v1';

// Seed demo access logs if empty for rich admin analytics
const INITIAL_DEMO_LOGS: AccessLogMetadata[] = [
  {
    id: 'log-001',
    userEmail: 'sanoop.amrita@gmail.com',
    userName: 'Sanoop Sadanandhan (Super Admin)',
    role: 'super_admin',
    timestamp: Date.now() - 7200000,
    sessionDurationSeconds: 1420,
    actionType: 'USER_LOGIN',
    jurisdiction: 'KMBR',
    deviceInfo: 'Chrome / macOS (Desktop)',
  },
  {
    id: 'log-002',
    userEmail: 'architect.kerala@vinyasa.com',
    userName: 'Er. Rajesh Kumar (Registered Architect)',
    role: 'user',
    timestamp: Date.now() - 5400000,
    sessionDurationSeconds: 2180,
    actionType: 'SCRUTINY_EXECUTED',
    jurisdiction: 'KPBR',
    referenceId: 'REF-2026-KPBR-0492',
    complianceStatus: 'APPROVED',
    deviceInfo: 'Edge / Windows (Desktop)',
  },
  {
    id: 'log-003',
    userEmail: 'architect.kerala@vinyasa.com',
    userName: 'Er. Rajesh Kumar (Registered Architect)',
    role: 'user',
    timestamp: Date.now() - 4800000,
    sessionDurationSeconds: 2400,
    actionType: 'REPORT_DOWNLOADED',
    jurisdiction: 'KPBR',
    referenceId: 'REF-2026-KPBR-0492',
    complianceStatus: 'APPROVED',
    deviceInfo: 'Edge / Windows (Desktop)',
  },
  {
    id: 'log-004',
    userEmail: 'kerala.planner@lsgd.gov.in',
    userName: 'Ar. Ananya Nair, AITP',
    role: 'user',
    timestamp: Date.now() - 3600000,
    sessionDurationSeconds: 840,
    actionType: 'SCRUTINY_EXECUTED',
    jurisdiction: 'KMBR',
    referenceId: 'REF-2026-KMBR-1082',
    complianceStatus: 'REJECTED_DEFECTIVE',
    deviceInfo: 'Safari / iPad OS (Tablet)',
  },
  {
    id: 'log-005',
    userEmail: 'sanoop.amrita@gmail.com',
    userName: 'Sanoop Sadanandhan (Super Admin)',
    role: 'super_admin',
    timestamp: Date.now() - 1800000,
    sessionDurationSeconds: 600,
    actionType: 'RULE_CONFIG_UPDATED',
    jurisdiction: 'KMBR',
    deviceInfo: 'Chrome / macOS (Desktop)',
  },
];

type AuthListener = (user: User | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function getCurrentUser(): User | null {
  try {
    const saved = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (saved) {
      const parsed: User = JSON.parse(saved);
      // Ensure super admin flag is always strictly checked against the authorized email
      const isSuper = parsed.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();
      return {
        ...parsed,
        role: isSuper ? 'super_admin' : 'user',
        isSuperAdmin: isSuper,
      };
    }
  } catch (e) {
    console.error('[AuthService] Error reading current user:', e);
  }
  return null;
}

export function isUserSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  return user.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL.toLowerCase().trim();
}

export function subscribeAuth(listener: AuthListener): () => void {
  authListeners.add(listener);
  listener(getCurrentUser());
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthListeners(user: User | null) {
  authListeners.forEach((l) => {
    try {
      l(user);
    } catch (e) {
      console.error('[AuthService] Listener notification error:', e);
    }
  });
}

export function loginWithGoogle(
  customEmail?: string,
  customName?: string
): Promise<User> {
  return new Promise((resolve) => {
    // Determine user parameters
    const email = (customEmail || 'sanoop.amrita@gmail.com').toLowerCase().trim();
    const isSuper = email === SUPER_ADMIN_EMAIL.toLowerCase().trim();
    const name = customName || (isSuper ? 'Sanoop Sadanandhan' : email.split('@')[0].replace('.', ' '));

    const user: User = {
      id: `usr-${Date.now()}`,
      email,
      name,
      role: isSuper ? 'super_admin' : 'user',
      avatar: isSuper
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      organization: isSuper ? 'VINYASA Core Architecture Authority' : 'Kerala Engineering Association',
      licenseNumber: isSuper ? 'SUPER-ADMIN-01' : 'LSGD/E-A/2024/9821',
      provider: 'google',
      createdAt: Date.now() - 86400000 * 30,
      lastLoginAt: Date.now(),
      isSuperAdmin: isSuper,
    };

    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());

    // Log the access activity
    logActivity({
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      actionType: 'USER_LOGIN',
      jurisdiction: 'KPBR',
      deviceInfo: getClientDeviceInfo(),
    });

    notifyAuthListeners(user);
    resolve(user);
  });
}

export function loginWithEmail(
  email: string,
  _password?: string,
  name?: string,
  licenseNumber?: string,
  organization?: string
): Promise<User> {
  return new Promise((resolve) => {
    const cleanEmail = email.toLowerCase().trim();
    const isSuper = cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase().trim();
    const defaultName = isSuper ? 'Sanoop Sadanandhan' : cleanEmail.split('@')[0];

    const user: User = {
      id: `usr-${Date.now()}`,
      email: cleanEmail,
      name: name || defaultName,
      role: isSuper ? 'super_admin' : 'user',
      avatar: undefined,
      organization: organization || (isSuper ? 'VINYASA Compliance Authority' : 'Private Practice'),
      licenseNumber: licenseNumber || (isSuper ? 'SUPER-ADMIN-MASTER' : 'LSGD/E-A/2026/001'),
      provider: 'email',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      isSuperAdmin: isSuper,
    };

    localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(SESSION_START_KEY, Date.now().toString());

    logActivity({
      userEmail: user.email,
      userName: user.name,
      role: user.role,
      actionType: 'USER_LOGIN',
      jurisdiction: 'KMBR',
      deviceInfo: getClientDeviceInfo(),
    });

    notifyAuthListeners(user);
    resolve(user);
  });
}

export function logout(): Promise<void> {
  return new Promise((resolve) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      logActivity({
        userEmail: currentUser.email,
        userName: currentUser.name,
        role: currentUser.role,
        actionType: 'USER_LOGOUT',
        jurisdiction: 'KPBR',
        deviceInfo: getClientDeviceInfo(),
      });
    }

    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(SESSION_START_KEY);
    notifyAuthListeners(null);
    resolve();
  });
}

export function getSessionDurationSeconds(): number {
  try {
    const start = localStorage.getItem(SESSION_START_KEY);
    if (start) {
      return Math.max(1, Math.floor((Date.now() - parseInt(start, 10)) / 1000));
    }
  } catch (e) {
    // Ignore
  }
  return 60;
}

export function getAccessLogs(): AccessLogMetadata[] {
  try {
    const saved = localStorage.getItem(ACCESS_LOGS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('[AuthService] Error reading access logs:', e);
  }
  return INITIAL_DEMO_LOGS;
}

export function logActivity(params: {
  userEmail: string;
  userName: string;
  role: UserRole;
  actionType: AccessLogMetadata['actionType'];
  jurisdiction: JurisdictionType;
  referenceId?: string;
  complianceStatus?: string;
  deviceInfo?: string;
}) {
  const newLog: AccessLogMetadata = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userEmail: params.userEmail,
    userName: params.userName,
    role: params.role,
    timestamp: Date.now(),
    sessionDurationSeconds: getSessionDurationSeconds(),
    actionType: params.actionType,
    jurisdiction: params.jurisdiction,
    referenceId: params.referenceId,
    complianceStatus: params.complianceStatus,
    deviceInfo: params.deviceInfo || getClientDeviceInfo(),
  };

  try {
    const current = getAccessLogs();
    const updated = [newLog, ...current].slice(0, 500); // Keep latest 500 records
    localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('[AuthService] Error saving activity log:', e);
  }
}

export function clearAccessLogs(user: User): boolean {
  if (!isUserSuperAdmin(user)) {
    console.warn('[AuthService] Unauthorized attempt to clear access logs.');
    return false;
  }
  try {
    localStorage.setItem(ACCESS_LOGS_STORAGE_KEY, JSON.stringify([]));
    return true;
  } catch (e) {
    return false;
  }
}

export function exportLogsToCSV(logs: AccessLogMetadata[]): string {
  const headers = ['Log ID', 'Timestamp', 'User Email', 'User Name', 'Role', 'Action', 'Jurisdiction', 'Reference ID', 'Status', 'Session Duration (s)', 'Device Info'];
  const rows = logs.map((l) => [
    l.id,
    new Date(l.timestamp).toISOString(),
    `"${l.userEmail}"`,
    `"${l.userName}"`,
    l.role,
    l.actionType,
    l.jurisdiction,
    l.referenceId || 'N/A',
    l.complianceStatus || 'N/A',
    l.sessionDurationSeconds,
    `"${l.deviceInfo}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportLogsToJSON(logs: AccessLogMetadata[]): string {
  return JSON.stringify(logs, null, 2);
}

function getClientDeviceInfo(): string {
  if (typeof navigator === 'undefined') return 'Server';
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  let os = 'OS';
  if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Win')) os = 'Windows';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  return `${browser} / ${os}`;
}

export const logoutUser = logout;
export const recordAccessLog = (
  user: User,
  actionType: AccessLogMetadata['actionType'],
  jurisdiction: JurisdictionType,
  complianceStatus?: string,
  referenceId?: string
) => {
  logActivity({
    userEmail: user.email,
    userName: user.name || user.email,
    role: user.role,
    actionType,
    jurisdiction,
    complianceStatus,
    referenceId,
  });
};

