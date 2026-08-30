import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Shield,
  EyeOff,
  Building2,
  CheckCircle2,
  HardDrive,
  User,
  X,
  FileCheck2,
} from 'lucide-react';
import { Language, User as UserType } from '../types';
import { VinyasaLogo } from './VinyasaLogo';
import { loginWithGoogle, loginWithEmail } from '../services/authService';

interface LoginViewProps {
  language: Language;
  onLoginSuccess: (user: UserType) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ language, onLoginSuccess }) => {
  const isMl = language === 'ml';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Google sign in modal state for real email prompt
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const handleOpenGoogleModal = () => {
    // If the user already typed an email into the main form, pre-fill it
    if (email.trim()) {
      setGoogleEmailInput(email.trim());
    }
    setError(null);
    setShowGoogleModal(true);
  };

  const handlePerformGoogleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = googleEmailInput.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setError(isMl ? 'ദയവായി സാധുവായ ഒരു ഇമെയിൽ വിലാസം നൽകുക' : 'Please enter a valid Google email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle(targetEmail, googleNameInput.trim() || undefined);
      setShowGoogleModal(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || (isMl ? 'ലോഗിൻ പരാജയപ്പെട്ടു' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError(isMl ? 'ദയവായി സാധുവായ ഇമെയിൽ വിലാസം നൽകുക' : 'Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setError(isMl ? 'ദയവായി പാസ്‌വേഡ് നൽകുക' : 'Please enter your password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const user = await loginWithEmail(cleanEmail, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err?.message || (isMl ? 'ഇമെയിൽ ലോഗിൻ പരാജയപ്പെട്ടു' : 'Email authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4 sm:px-6 relative">
      {/* Background Architectural Grid & Neon Glow Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #00e5ff 1px, transparent 1px), linear-gradient(to bottom, #00e5ff 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Side: Brand Visual & High-Contrast Typography */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="space-y-4">
            <VinyasaLogo size="xl" theme="dark" showDomain={true} />

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
              {isMl ? (
                <>
                  കെട്ടിട ചട്ട പരിശോധനയും <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                    ഡിജിറ്റൽ വെരിഫിക്കേഷനും
                  </span>
                </>
              ) : (
                <>
                  Automated Building Scrutiny & <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-emerald-400">
                    Compliance Intelligence
                  </span>
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
              {isMl
                ? 'ഏറ്റവും പുതുക്കിയ കേരള മുനിസിപ്പാലിറ്റി & പഞ്ചായത്ത് ചട്ടങ്ങൾ പ്രകാരം പ്ലാനുകൾ തത്സമയം പരിശോധിക്കാനുള്ള ആധുനിക സംവിധാനം'
                : 'Next-generation real-time statutory drawing scrutiny & building compliance intelligence under latest Kerala Municipality & Panchayat Building Rules.'}
            </p>
          </div>

          {/* Privacy & Zero File Retention Guarantee Box */}
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-cyan-500/30 rounded-2xl p-4 sm:p-5 text-slate-300 space-y-3.5 shadow-[0_0_30px_rgba(0,229,255,0.07)] backdrop-blur-md">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <EyeOff className="w-4 h-4 text-cyan-400" />
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

          {/* Key statutory features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{isMl ? 'സെറ്റ്ബാക്ക്, FAR, കവറേജ് പരിശോധന' : 'Setback, FAR & Coverage Audit'}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{isMl ? 'K-Smart പോർട്ടൽ റിപ്പോർട്ട്' : 'K-Smart & LSGD Scrutiny Sync'}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Sleek Glassmorphic Authentication Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/85 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,229,255,0.12)] relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isMl ? 'നിങ്ങളുടെ അക്കൗണ്ട് ഉപയോഗിച്ച് പ്രവേശിക്കുക' : 'Sign in to access drawing scrutiny & reports'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Lock className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Google Sign In Button */}
            <button
              type="button"
              id="google-signin-btn"
              onClick={handleOpenGoogleModal}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-lg transition-all hover:shadow-cyan-500/20 active:scale-[0.99] cursor-pointer disabled:opacity-50 group"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
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
              <span>{isMl ? 'Google ഉപയോഗിച്ച് തുടരുക' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                  {isMl ? 'അല്ലെങ്കിൽ ഇമെയിൽ നൽകുക' : 'Or sign in with email'}
                </span>
              </div>
            </div>

            {/* Email / Password Direct Login Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isMl ? 'ഇമെയിൽ വിലാസം' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    id="auth-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isMl ? 'പാസ്‌വേഡ്' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    id="auth-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/90 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <span>{isMl ? 'ലോഗിൻ ചെയ്യുക' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Google Interactive Account Prompt Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-[0_0_40px_rgba(0,229,255,0.2)] relative text-left">
            <button
              onClick={() => setShowGoogleModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
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
              <div>
                <h3 className="text-base font-bold text-white">
                  {isMl ? 'Google അക്കൗണ്ട് ഉപയോഗിച്ച് ലോഗിൻ' : 'Sign in with Google Account'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isMl ? 'നിങ്ങളുടെ ഗൂഗിൾ ഇമെയിൽ നൽകുക' : 'Enter your authentic Google email'}
                </p>
              </div>
            </div>

            <form onSubmit={handlePerformGoogleLogin} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isMl ? 'ഗൂഗിൾ ഇമെയിൽ' : 'Google Email'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 outline-none"
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isMl ? 'പേര് (ഓപ്ഷണൽ)' : 'Display Name (Optional)'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="Er. Rajesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {loading ? (isMl ? 'ലോഗിൻ ചെയ്യുന്നു...' : 'Signing in...') : (isMl ? 'തുടരുക' : 'Proceed')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
