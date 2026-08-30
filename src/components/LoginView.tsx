import React, { useState } from 'react';
import {
  Shield,
  EyeOff,
  HardDrive,
  RefreshCw,
  AlertCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { Language, User as UserType } from '../types';
import { loginWithGoogle } from '../services/authService';

interface LoginViewProps {
  language: Language;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ language, onLoginSuccess }) => {
  const isMl = language === 'ml';

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1-Click Verified Google Account Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      // Direct authenticated login through Google identity
      const user = await loginWithGoogle();
      onLoginSuccess(user);
    } catch (err: any) {
      setError(
        err?.message ||
          (isMl ? 'ഗൂഗിൾ ലോഗിൻ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.' : 'Google Sign-In failed. Please try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-center py-4 sm:py-8 relative">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-5 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Value Proposition & Security Highlights */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isMl
                  ? '100% സൗജന്യ സർവീസ് — ഗൂഗിൾ ലോഗിൻ'
                  : '100% Free Service — Google Authentication'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {isMl ? (
                <>
                  കേരള ബിൽഡിംഗ് റൂൾസ് <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                    തത്സമയ പരിശോധന പ്ലാറ്റ്‌ഫോം
                  </span>
                </>
              ) : (
                <>
                  Kerala Building Rules (KMBR/KPBR) <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                    Scrutiny & Compliance Engine
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              {isMl
                ? 'ഒടിപിയോ പാസ്‌വേഡുകളോ മാനുവൽ ഫോമുകളോ ഇല്ലാതെ, നിങ്ങളുടെ ഔദ്യോഗിക ഗൂഗിൾ അക്കൗണ്ട് ഉപയോഗിച്ച് നേരിട്ട് ഒരൊറ്റ ക്ലിക്കിൽ സുരക്ഷിതമായി പ്രവേശിക്കാം.'
                : 'Zero passwords, zero OTPs, and no manual forms. Sign in instantly and securely with your official Google Account to access the free architectural scrutiny engine.'}
            </p>
          </div>

          {/* Privacy & Zero File Retention Guarantee Box */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 text-slate-300 space-y-3 shadow-[0_0_30px_rgba(0,229,255,0.07)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <EyeOff className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{isMl ? 'സീറോ-ഫയൽ റിട്ടൻഷൻ & പ്രൈവസി സുരക്ഷ' : 'Zero-File Retention & Privacy Architecture'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <HardDrive className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-snug">
                  {isMl ? 'ഡ്രോയിംഗുകൾ മെമ്മറിയിൽ മാത്രം പരിശോധിക്കുന്നു' : 'Drawings analyzed in temporary volatile memory'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-snug">
                  {isMl ? 'ക്ലൗഡിൽ ഫയലുകൾ സൂക്ഷിക്കുന്നില്ല' : 'Zero cloud storage persistence'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ultra Clean Google Sign-In Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.12)] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="mb-6 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/90 border border-cyan-500/40 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(0,229,255,0.25)]">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {isMl ? 'സുരക്ഷിത പ്രവേശനം' : 'Secure Sign In'}
              </h2>
              <p className="text-xs text-slate-400">
                {isMl
                  ? 'ഗൂഗിൾ അക്കൗണ്ട് വഴി നേരിട്ട് ലോഗിൻ ചെയ്യുക'
                  : 'Sign in directly with your Google Account'}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-rose-950/70 border border-rose-500/60 rounded-xl text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Single Clean Google Sign-In Button */}
            <div className="space-y-4">
              <button
                type="button"
                id="google-signin-btn"
                disabled={loading}
                onClick={handleGoogleSignIn}
                className="w-full min-h-[52px] py-3 px-5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-base rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3.5 border border-slate-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5 text-slate-700">
                    <RefreshCw className="w-5 h-5 animate-spin text-cyan-600" />
                    <span>{isMl ? 'പ്രവേശിക്കുന്നു...' : 'Signing in...'}</span>
                  </span>
                ) : (
                  <>
                    {/* Official Google Logo */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                    <span className="text-sm sm:text-base tracking-wide">
                      {isMl
                        ? 'ഗൂഗിൾ അക്കൗണ്ട് വഴി പ്രവേശിക്കുക'
                        : 'Sign in with Google Account'}
                    </span>
                  </>
                )}
              </button>

              {/* Verified Trust & Privacy Badges */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    {isMl
                      ? 'അധിക പാസ്‌വേഡുകളോ ഒ.ടി.പിയോ ആവശ്യമില്ല'
                      : 'No additional passwords or OTPs required'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>
                    {isMl
                      ? 'സുരക്ഷിതമായ ഗൂഗിൾ വെരിഫിക്കേഷൻ'
                      : 'Verified Google OAuth Authentication'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
