import React, { useState, useEffect } from 'react';
import { Download, Share2, PlusSquare, X, CheckCircle2, Smartphone, Apple } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const STORAGE_KEY_INSTALL_DISMISSED = 'pwa_install_dismissed_v1';

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIos(isIosDevice);

    // Check if dismissed previously
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY_INSTALL_DISMISSED);
      if (dismissed && Date.now() - parseInt(dismissed, 10) < 7 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    } catch {
      // ignore
    }

    // Android & Chrome beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // App installed handler
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Do not render anything if already installed as standalone
  if (isStandalone || isInstalled) {
    return null;
  }

  // Handle Android / Chrome prompt
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.warn('PWA install error:', err);
      } finally {
        setDeferredPrompt(null);
      }
    } else if (isIos) {
      setShowIosModal(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_INSTALL_DISMISSED, Date.now().toString());
    } catch {
      // ignore
    }
  };

  // Only show if we either have a deferredPrompt (Android/Desktop Chrome) or we are on iOS Safari
  const canShowPrompt = (deferredPrompt !== null || isIos) && !isDismissed;

  return (
    <>
      {/* Floating Install Prompt Banner */}
      {canShowPrompt && (
        <aside
          aria-label="Notificación de instalación"
          className="fixed bottom-16 lg:bottom-4 right-4 z-40 max-w-sm w-[calc(100%-2rem)] sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="relative flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl cozy-card border border-[var(--surface-border)] shadow-2xl backdrop-blur-xl text-white">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/25">
              {isIos ? (
                <Apple className="w-5 h-5 text-slate-950" />
              ) : (
                <Smartphone className="w-5 h-5 text-slate-950" />
              )}
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-200 border border-amber-400/30">
                  App PWA
                </span>
                <span className="text-xs font-bold truncate">Instalar App</span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                {isIos
                  ? 'Acceso directo y pantalla completa'
                  : 'Instala en tu pantalla de inicio'}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="btn-cozy-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold shadow-md cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Minimized Pill when dismissed */}
      {!canShowPrompt && !isStandalone && !isInstalled && (deferredPrompt !== null || isIos) && (
        <button
          type="button"
          onClick={() => {
            if (isIos) {
              setShowIosModal(true);
            } else if (deferredPrompt) {
              handleInstallClick();
            } else {
              setIsDismissed(false);
            }
          }}
          className="fixed bottom-16 lg:bottom-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface-inner)] border border-[var(--surface-border)] text-amber-300 hover:text-white hover:bg-white/10 shadow-lg text-[11px] font-bold backdrop-blur-md transition-all cursor-pointer animate-in fade-in"
          title="Instalar Pokémon Sleep Master"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>Instalar PWA</span>
        </button>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIosModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-modal-title"
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-3xl cozy-card border border-[var(--surface-border)] p-5 sm:p-6 text-white shadow-2xl relative animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Apple className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <h3 id="ios-modal-title" className="text-base sm:text-lg font-bold text-white leading-tight">
                    Instalar en tu iPhone / iPad
                  </h3>
                  <p className="text-xs text-amber-300">
                    Sigue estos 3 pasos sencillos desde Safari:
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIosModal(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Steps Container */}
            <div className="space-y-3.5 my-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)]">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-400/30">
                  1
                </div>
                <div className="flex-1 text-xs text-slate-200">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Toca el botón</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                      <Share2 className="w-3.5 h-3.5" /> Compartir
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    En la barra de herramientas inferior de Safari.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)]">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-400/30">
                  2
                </div>
                <div className="flex-1 text-xs text-slate-200">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Selecciona</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                      <PlusSquare className="w-3.5 h-3.5" /> Agregar a pantalla de inicio
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    Desliza hacia abajo en el menú de opciones hasta encontrarlo.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)]">
                <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-400/30">
                  3
                </div>
                <div className="flex-1 text-xs text-slate-200">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>Presiona</span>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-400/30">
                      "Agregar"
                    </span>
                  </div>
                  <p className="text-slate-400 mt-0.5">
                    En la esquina superior derecha para confirmar la instalación.
                  </p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 rounded-xl bg-[var(--surface-inner)] border border-[var(--surface-border)] flex items-start gap-2.5 mb-5 text-[11px] text-amber-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>
                La aplicación se abrirá como app nativa: sin barras de navegación, con soporte sin conexión y carga ultrarrápida.
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                setShowIosModal(false);
                handleDismiss();
              }}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 transition-all cursor-pointer"
            >
              ¡Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
