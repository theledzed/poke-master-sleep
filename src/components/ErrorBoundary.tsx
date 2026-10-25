import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetLocalData = () => {
    if (window.confirm('¿Deseas restablecer la caché local? Tus datos en la nube de Supabase no se perderán.')) {
      try {
        localStorage.clear();
      } catch (e) {
        // ignore
      }
      window.location.href = '/';
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0d1e] text-slate-100 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-700/60 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-3xl shadow-inner animate-pulse">
              💤
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                Algo interrumpió la app
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Se produjo un error inesperado al renderizar la interfaz. Puedes recargar para reanudar de inmediato.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left bg-black/40 rounded-xl p-3 border border-white/10 text-[11px] font-mono text-rose-300 overflow-x-auto max-h-32">
                <summary className="cursor-pointer font-bold text-slate-400 hover:text-white select-none">
                  Ver detalle técnico
                </summary>
                <p className="mt-2 text-[10px] break-words whitespace-pre-wrap">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-95 cursor-pointer"
              >
                🔄 Recargar app
              </button>
              <button
                type="button"
                onClick={this.handleResetLocalData}
                className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs border border-white/10 transition-all active:scale-95 cursor-pointer"
              >
                Limpiar caché
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
