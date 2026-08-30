import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] w-full p-6 flex items-center justify-center bg-slate-950/90 text-slate-100 border border-slate-800 rounded-3xl backdrop-blur-md animate-fadeIn">
          <div className="max-w-md w-full text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_20px_rgba(244,63,94,0.2)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white font-['Outfit',sans-serif]">
                {this.props.fallbackTitle || 'എന്തോ തടസ്സം നേരിട്ടു'}
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {this.props.fallbackMessage ||
                  'ഘടകങ്ങൾ ലോഡ് ചെയ്യുന്നതിൽ അവിചാരിതമായ തടസ്സം നേരിട്ടു. ദയവായി പേജ് റീലോഡ് ചെയ്യുകയോ വീണ്ടും ശ്രമിക്കുകയോ ചെയ്യുക.'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                Something went wrong. Please reload or try again.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-[10px] font-mono text-rose-300/80 text-left overflow-x-auto max-h-24 no-scrollbar">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition-all shadow-md cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>പേജ് റീലോഡ് ചെയ്യുക (Reload)</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              >
                <span>വീണ്ടും ശ്രമിക്കുക</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
