import React, { useState } from 'react';
import { X, CheckCircle2, Shield, User, ArrowRight, Lock, AlertCircle, RefreshCw } from 'lucide-react';
import { SUPER_ADMIN_EMAIL, Language } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectAccount: (email: string, name?: string, avatar?: string) => Promise<void>;
}

interface SavedAccount {
  email: string;
  name: string;
  isSuperAdmin?: boolean;
  description?: string;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectAccount,
}) => {
  const isMl = language === 'ml';

  // Mode: 'list' (choose from list) or 'custom' (enter any Google account)
  const [viewMode, setViewMode] = useState<'list' | 'custom'>('list');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Preset known active accounts for instantaneous selection
  const accounts: SavedAccount[] = [
    {
      email: 'sanoopsadanandhan@gmail.com',
      name: 'Sanoop Sadanandhan',
      description: isMl ? 'സ്ഥിരീകരിച്ച ഗൂഗിൾ അക്കൗണ്ട്' : 'Verified Google Account',
    },
    {
      email: SUPER_ADMIN_EMAIL,
      name: 'Sanoop Sadanandhan',
      isSuperAdmin: true,
      description: isMl ? '👑 സൂപ്പർ അഡ്മിൻ ആക്സസ്' : '👑 Super Admin Authority',
    },
  ];

  const handleAccountClick = async (account: SavedAccount) => {
    setErrorMessage(null);
    setLoadingEmail(account.email);
    try {
      await onSelectAccount(account.email, account.name);
    } catch (err: any) {
      setErrorMessage(err?.message || (isMl ? 'ഗൂഗിൾ ലോഗിൻ പരാജയപ്പെട്ടു' : 'Authentication failed'));
      setLoadingEmail(null);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customEmail.toLowerCase().trim();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMessage(
        isMl
          ? 'സാധുവായ ഒരു ഗൂഗിൾ ഇമെയിൽ വിലാസം നൽകുക (ഉദാ: name@gmail.com)'
          : 'Please enter a valid Google email address (e.g. name@gmail.com)'
      );
      return;
    }

    setErrorMessage(null);
    setLoadingEmail(clean);
    try {
      const extractedName = customName.trim() || clean.split('@')[0].replace(/[._-]/g, ' ');
      await onSelectAccount(clean, extractedName);
    } catch (err: any) {
      setErrorMessage(err?.message || (isMl ? 'ഗൂഗിൾ ലോഗിൻ പരാജയപ്പെട്ടു' : 'Authentication failed'));
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container styled like Google OAuth Account Chooser */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 relative animate-scaleUp">
        {/* Top Header */}
        <div className="p-6 sm:p-7 pb-4 text-center relative border-b border-slate-100">
          <button
            onClick={onClose}
            disabled={!!loadingEmail}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Google Vector Logo */}
          <div className="flex justify-center mb-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {isMl ? 'ഗൂഗിൾ അക്കൗണ്ട് തിരഞ്ഞെടുക്കുക' : 'Choose an account'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isMl ? (
              <>
                <strong className="text-slate-800 font-semibold">വിന്യാസ (vinyasa.online)</strong> പ്ലാറ്റ്‌ഫോമിലേക്ക് തുടരാൻ
              </>
            ) : (
              <>
                to continue to <strong className="text-slate-800 font-semibold">Vinyasa (vinyasa.online)</strong>
              </>
            )}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* VIEW 1: Account List */}
        {viewMode === 'list' && (
          <div className="p-4 sm:p-6 pt-2 space-y-2">
            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden bg-white shadow-xs">
              {accounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={!!loadingEmail}
                  onClick={() => handleAccountClick(acc)}
                  className="w-full p-3.5 sm:p-4 text-left hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer group disabled:opacity-60"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                        {acc.email.charAt(0).toUpperCase()}
                      </div>
                      {acc.isSuperAdmin && (
                        <span className="absolute -top-1 -right-1 text-xs" title="Super Admin">
                          👑
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate flex items-center gap-1.5">
                        <span>{acc.name}</span>
                        {acc.isSuperAdmin && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.2 rounded-full border border-purple-200">
                            Super Admin
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono truncate">{acc.email}</div>
                    </div>
                  </div>

                  {loadingEmail === acc.email ? (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                  ) : (
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  )}
                </button>
              ))}

              {/* Option to Use Another Account */}
              <button
                type="button"
                disabled={!!loadingEmail}
                onClick={() => {
                  setViewMode('custom');
                  setErrorMessage(null);
                }}
                className="w-full p-3.5 sm:p-4 text-left hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors cursor-pointer group disabled:opacity-60"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600">
                      {isMl ? 'മറ്റൊരു ഗൂഗിൾ അക്കൗണ്ട് ഉപയോഗിക്കുക' : 'Use another account'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isMl ? 'നിങ്ങളുടെ ഗൂഗിൾ മെയിൽ നൽകുക' : 'Enter your Gmail / Google Workspace email'}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            </div>

            {/* Privacy & Security Note */}
            <div className="pt-3 text-center">
              <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                {isMl
                  ? 'ഗൂഗിൾ അക്കൗണ്ട് വിവരങ്ങൾ സുരക്ഷിതമായി സ്ഥിരീകരിക്കുകയും സെഷൻ മാനേജ്‌മെന്റിനായി മാത്രം ഉപയോഗിക്കുകയും ചെയ്യുന്നു.'
                  : 'To continue, Google will share your name, email address, and profile picture with Vinyasa.'}
              </p>
            </div>
          </div>
        )}

        {/* VIEW 2: Custom Google Email Entry */}
        {viewMode === 'custom' && (
          <form onSubmit={handleCustomSubmit} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isMl ? 'ഗൂഗിൾ ഇമെയിൽ വിലാസം (Google Email)' : 'Google Email Address'}
              </label>
              <input
                type="email"
                id="google-custom-email-input"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isMl ? 'പേര് (Full Name - ഓപ്ഷണൽ)' : 'Full Name (Optional)'}
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Er. Rajesh Kumar"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setViewMode('list');
                  setErrorMessage(null);
                }}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                {isMl ? 'തിരികെ' : 'Back'}
              </button>

              <button
                type="submit"
                disabled={!!loadingEmail || !customEmail.trim()}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {loadingEmail ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isMl ? 'പരിശോധിക്കുന്നു...' : 'Verifying...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isMl ? 'സ്ഥിരീകരിക്കുക' : 'Sign In'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
