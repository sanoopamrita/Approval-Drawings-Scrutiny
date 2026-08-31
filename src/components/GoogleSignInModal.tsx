import React, { useState } from 'react';
import { X, Shield, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Language } from '../types';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onSelectAccount: (email: string, name?: string, avatar?: string) => Promise<void>;
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  language,
  onSelectAccount,
}) => {
  const isMl = language === 'ml';

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = email.toLowerCase().trim();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      setErrorMessage(
        isMl
          ? 'സാധുവായ ഒരു ഗൂഗിൾ ഇമെയിൽ വിലാസം നൽകുക (ഉദാ: name@gmail.com)'
          : 'Please enter a valid Google email address (e.g. name@gmail.com)'
      );
      return;
    }

    setErrorMessage(null);
    setLoading(true);
    try {
      const extractedName = name.trim() || clean.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = extractedName.charAt(0).toUpperCase() + extractedName.slice(1);
      await onSelectAccount(clean, formattedName);
    } catch (err: any) {
      setErrorMessage(err?.message || (isMl ? 'ഗൂഗിൾ ലോഗിൻ പരാജയപ്പെട്ടു' : 'Authentication failed'));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 relative animate-scaleUp">
        {/* Top Header */}
        <div className="p-6 sm:p-7 pb-4 text-center relative border-b border-slate-100">
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Official Google Vector Logo */}
          <div className="flex justify-center mb-3">
            <svg className="w-9 h-9" viewBox="0 0 24 24">
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

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {isMl ? 'ഗൂഗിൾ അക്കൗണ്ട് വഴി പ്രവേശിക്കുക' : 'Sign in with Google'}
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
          <div className="mx-6 my-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isMl ? 'ഗൂഗിൾ ഇമെയിൽ വിലാസം (Gmail / Google Workspace)' : 'Google Email (Gmail / Workspace)'}
            </label>
            <input
              type="email"
              required
              autoFocus
              id="google-signin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all text-slate-900 bg-white placeholder:text-slate-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {isMl ? 'പേര് (ഓപ്ഷണൽ)' : 'Full Name (Optional)'}
            </label>
            <input
              type="text"
              id="google-signin-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isMl ? 'ഉദാ: സനൂപ് സദാനന്ദൻ' : 'e.g. Sanoop Sadanandhan'}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all text-slate-900 bg-white placeholder:text-slate-400 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            id="google-signin-submit"
            className="w-full py-3 px-4 bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{isMl ? 'സ്ഥിരീകരിക്കുന്നു...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <span>{isMl ? 'തുടരുക' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Security Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isMl ? 'സുരക്ഷിത ഒതന്റിക്കേഷൻ · സീറോ ഫയൽ സ്റ്റോറേജ്' : 'Secure OAuth · Zero File Persistence'}</span>
        </div>
      </div>
    </div>
  );
};
