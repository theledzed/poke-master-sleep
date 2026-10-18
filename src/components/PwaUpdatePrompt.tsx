import React, { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, Sparkles, X, ArrowUpCircle } from 'lucide-react';

export const PwaUpdatePrompt: React.FC = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegistered(r) {
      if (r) {
        // Periodic check for SW updates every 30 minutes
        setInterval(() => {
          r.update().catch(() => {});
        }, 30 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.warn('Service Worker registration error:', error);
    }
  });

  // Also check for updates when user brings the tab back to focus / foreground
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          reg?.update().catch(() => {});
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  if (!needRefresh) {
    return null;
  }

  const handleUpdate = () => {
    // Activates the waiting service worker and reloads the page
    updateServiceWorker(true);
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-[92%] max-w-lg animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1f38] via-[#122849] to-[#1e1b4b] border border-sky-400/40 p-4 sm:p-5 shadow-2xl shadow-sky-950/80 backdrop-blur-xl">
        {/* Glow ambient background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-start gap-3.5">
          {/* Animated Icon */}
          <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white animate-pulse">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Nueva Versión
              </span>
              <span className="text-[11px] text-slate-400 hidden xs:inline">
                Actualización lista
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
              ¡Hay una nueva versión disponible!
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Hemos implementado mejoras recientes. Actualiza ahora para disfrutar de la última optimización sin perder tus datos.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 mt-3.5">
              <button
                type="button"
                onClick={handleUpdate}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/30 transition-all cursor-pointer"
              >
                <ArrowUpCircle className="w-4 h-4" />
                <span>Actualizar Ahora</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
              >
                Más tarde
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-0 right-0 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
