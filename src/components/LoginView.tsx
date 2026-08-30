import React, { useState } from 'react';
import {
  Mail,
  ArrowRight,
  Shield,
  EyeOff,
  HardDrive,
  User,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Award,
  Sparkles,
  Crown,
} from 'lucide-react';
import { Language, User as UserType, SUPER_ADMIN_EMAIL } from '../types';
import {
  loginWithGoogle,
  loginWithEmail,
  checkIsSuperAdminEmail,
} from '../services/authService';

interface LoginViewProps {
  language: Language;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ language, onLoginSuccess }) => {
  const isMl = language === 'ml';

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [organization, setOrganization] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick direct login with given email
  const handleEmailDirectLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    const targetEmail = (customEmail || email).toLowerCase().trim();

    if (!targetEmail || !targetEmail.includes('@') || !targetEmail.includes('.')) {
      setError(
        isMl
          ? 'ദയവായി സാധുവായ ഒരു ഇമെയിൽ വിലാസം നൽകുക (ഉദാ: yourname@gmail.com)'
          : 'Please enter a valid email address (e.g. yourname@gmail.com)'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await loginWithEmail(
        targetEmail,
        undefined,
        fullName.trim() || undefined,
        licenseNumber.trim() || undefined,
        organization.trim() || undefined
      );

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || (isMl ? 'ലോഗിൻ പരാജയപ്പെട്ടു' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Google Account Direct Login
  const handleGoogleDirectLogin = async (customEmail?: string) => {
    setLoading(true);
    setError(null);

    try {
      const targetEmail = customEmail || email.trim() || undefined;
      const user = await loginWithGoogle(
        targetEmail,
        fullName.trim() || undefined
      );

      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || (isMl ? 'ഗൂഗിൾ ലോഗിൻ പരാജയപ്പെട്ടു' : 'Google login failed'));
    } finally {
      setLoading(false);
    }
  };

  const isSuperInput = checkIsSuperAdminEmail(email);

  return (
    <div className="w-full max-w-6xl mx-auto flex items-center justify-center py-2 sm:py-6 relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-5 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
        {/* Left Side: Value Proposition & Free Service Guarantee */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
          <div className="space-y-2.5 sm:space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                {isMl
                  ? '100% സൗജന്യ സേവനം — ലളിതമായ ഇമെയിൽ ലോഗിൻ'
                  : '100% Free Service — Instant Direct Email Login'}
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
                    Instant Compliance Intelligence
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              {isMl
                ? 'ഒടിപിയോ സങ്കീർണ്ണമായ പാസ്‌വേഡുകളോ ഇല്ലാതെ, അവരവരുടെ ഔദ്യോഗിക ഗൂഗിൾ / ഇമെയിൽ ഐഡി ഉപയോഗിച്ച് നേരിട്ട് ലോഗിൻ ചെയ്ത് ഉപയോഗിക്കാവുന്ന സൗജന്യ വെബ് ആപ്പ്.'
                : 'Zero passwords, zero OTPs needed. Seamlessly sign in with your official Google or professional email address to instantly access the free architectural scrutiny engine.'}
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
                  {isMl ? 'ഡ്രോയിംഗുകൾ മെമ്മറിയിൽ മാത്രം പരിശോധിക്കുന്നു' : 'Drawings analyzed 100% in temporary volatile memory'}
                </span>
              </div>
              <div className="flex items-start gap-2.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-snug">
                  {isMl ? 'ക്ലൗഡിൽ ഫയലുകൾ സൂക്ഷിക്കുന്നില്ല' : 'Zero CAD / PDF cloud storage persistence'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Seamless Direct Sign In Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto lg:max-w-none">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-[0_0_50px_rgba(0,229,255,0.12)] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-800">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                  <span>{isMl ? 'ഇമെയിൽ ലോഗിൻ' : 'Email Sign In'}</span>
                  <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    {isMl ? 'സൗജന്യം' : 'Free'}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isMl
                    ? 'നിങ്ങളുടെ ഇമെയിൽ ഐഡി നൽകി നേരിട്ട് പ്രവേശിക്കുക'
                    : 'Enter your email address to enter instantly'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)] shrink-0">
                <Mail className="w-4.5 h-4.5 text-cyan-400" />
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-950/70 border border-rose-500/60 rounded-xl text-rose-200 text-xs font-semibold flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick 1-Click Google Sign-In Button */}
            <div className="space-y-3 mb-5">
              <button
                type="button"
                id="google-signin-btn"
                disabled={loading}
                onClick={() => handleGoogleDirectLogin()}
                className="w-full min-h-[48px] py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3 border border-slate-200"
              >
                {/* Official Google Vector Logo */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                <span>
                  {loading
                    ? isMl
                      ? 'പ്രവേശിക്കുന്നു...'
                      : 'Signing in...'
                    : isMl
                    ? 'ഗൂഗിൾ അക്കൗണ്ട് വഴി പ്രവേശിക്കുക (Login with Google)'
                    : 'Sign in with Google Account'}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-800" />
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                  {isMl ? 'അല്ലെങ്കിൽ ഇമെയിൽ നൽകുക' : 'Or with Email ID'}
                </span>
                <div className="flex-1 h-px bg-slate-800" />
              </div>
            </div>

            {/* Direct Email Form (No password or OTP needed) */}
            <form onSubmit={(e) => handleEmailDirectLogin(e)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isMl ? 'നിങ്ങളുടെ ഇമെയിൽ വിലാസം (Email Address)' : 'Your Email Address'}</span>
                  {isSuperInput && (
                    <span className="text-[10px] text-purple-300 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3 text-purple-400" />
                      {isMl ? 'സൂപ്പർ അഡ്മിൻ തിരിച്ചറിഞ്ഞു' : 'Super Admin Recognized'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    id="auth-direct-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@domain.com / sanoop.amrita@gmail.com"
                    required
                    className={`w-full min-h-[46px] pl-10 pr-4 py-2.5 text-sm bg-slate-950 border rounded-xl text-white placeholder-slate-500 outline-none transition-all ${
                      isSuperInput
                        ? 'border-purple-500/80 focus:ring-2 focus:ring-purple-500/50'
                        : 'border-slate-700/90 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400'
                    }`}
                  />
                </div>
              </div>

              {/* Optional Name & License field */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {isMl ? 'പേര് (Name - ഓപ്ഷണൽ)' : 'Full Name (Optional)'}
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Er. Rajesh Kumar"
                      className="w-full min-h-[38px] pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                    {isMl ? 'LSGD ലൈസൻസ് നമ്പർ' : 'LSGD License (Optional)'}
                  </label>
                  <div className="relative">
                    <Award className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="LSGD/E-A/2026/..."
                      className="w-full min-h-[38px] pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-600 focus:border-cyan-400 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Direct Submit Button */}
              <button
                type="submit"
                id="direct-login-submit-btn"
                disabled={loading || !email.trim()}
                className={`w-full min-h-[48px] py-3 px-4 text-slate-950 font-bold text-sm rounded-xl transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2 ${
                  isSuperInput
                    ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                    : 'bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-[0_0_20px_rgba(0,229,255,0.3)]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {isMl ? 'ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുന്നു...' : 'Accessing Dashboard...'}
                  </span>
                ) : (
                  <>
                    <span>
                      {isSuperInput
                        ? isMl
                          ? '👑 സൂപ്പർ അഡ്മിനായി പ്രവേശിക്കുക'
                          : '👑 Enter as Super Admin'
                        : isMl
                        ? 'നേരിട്ട് പ്ലാറ്റ്‌ഫോമിലേക്ക് പ്രവേശിക്കുക'
                        : 'Enter Scrutiny Platform'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Preset Buttons for hassle-free 1-click test access */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 block text-center">
                  {isMl ? 'ദ്രുത പ്രവേശനത്തിന് താഴെയുള്ളതിൽ ക്ലിക്ക് ചെയ്യാം:' : 'Quick 1-Click Access Profiles:'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail(SUPER_ADMIN_EMAIL);
                      handleEmailDirectLogin(undefined, SUPER_ADMIN_EMAIL);
                    }}
                    className="p-2 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-500/40 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-purple-300 block truncate flex items-center gap-1">
                      <span>👑</span>
                      <span>{isMl ? 'സൂപ്പർ അഡ്മിൻ' : 'Super Admin'}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">
                      {SUPER_ADMIN_EMAIL}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const userMail = 'architect.kerala@domain.com';
                      setEmail(userMail);
                      handleEmailDirectLogin(undefined, userMail);
                    }}
                    className="p-2 bg-slate-950 hover:bg-cyan-950/60 border border-cyan-500/30 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="text-[11px] font-bold text-cyan-300 block truncate flex items-center gap-1">
                      <span>📐</span>
                      <span>{isMl ? 'ആർക്കിടെക്റ്റ് / എഞ്ചിനീയർ' : 'Architect / Engineer'}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block truncate">
                      user@domain.com
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
