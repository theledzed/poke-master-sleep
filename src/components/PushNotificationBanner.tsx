import React, { useState, useEffect, useMemo } from 'react';
import {
  BellRing,
  Sparkles,
  UtensilsCrossed,
  Backpack,
  Moon,
  Smartphone,
  Share2,
  PlusSquare,
  X,
  Settings,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Pokemon, PushNotificationConfig, SnorlaxConfig } from '../types/pokemon';
import { ProfileId, PROFILES } from '../services/supabase';
import {
  detectPushPlatformSupport,
  getActiveBrowserPushEndpoint,
  subscribeDeviceToWebPush,
  computeFastestTeamBagFill,
  mergeWithDefaultPushConfig
} from '../services/pushNotificationService';

const STORAGE_KEY_PUSH_BANNER_DISMISSED = 'pokesleep_push_banner_dismissed_v1';

interface PushNotificationBannerProps {
  activeProfile: ProfileId;
  pokemons: Pokemon[];
  config: SnorlaxConfig;
  onUpdatePushConfig: (nextPushConfig: PushNotificationConfig) => void;
  onOpenPushModal: () => void;
  onShowToast?: (msg: string) => void;
}

export const PushNotificationBanner: React.FC<PushNotificationBannerProps> = ({
  activeProfile,
  pokemons,
  config,
  onUpdatePushConfig,
  onOpenPushModal,
  onShowToast
}) => {
  const [deviceEndpoint, setDeviceEndpoint] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(true); // default true until checked
  const [isBusy, setIsBusy] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pushConfig = useMemo(
    () => mergeWithDefaultPushConfig(config.pushConfig),
    [config.pushConfig]
  );

  const platformSupport = useMemo(() => detectPushPlatformSupport(), []);
  const { bottleneck } = useMemo(
    () => computeFastestTeamBagFill(pokemons, config),
    [pokemons, config]
  );

  // Check device subscription status and dismissal on mount
  useEffect(() => {
    getActiveBrowserPushEndpoint().then((endpoint) => {
      setDeviceEndpoint(endpoint);

      // Check if user dismissed the banner recently (cooldown: 5 days)
      try {
        const dismissedAt = localStorage.getItem(STORAGE_KEY_PUSH_BANNER_DISMISSED);
        if (dismissedAt) {
          const diff = Date.now() - parseInt(dismissedAt, 10);
          if (diff < 5 * 24 * 60 * 60 * 1000) {
            setIsDismissed(true);
            return;
          }
        }
      } catch {
        // ignore storage errors
      }

      setIsDismissed(false);
    });
  }, [config.pushConfig]);

  // Is this device already subscribed?
  const isCurrentDeviceSubscribed = useMemo(() => {
    if (!deviceEndpoint) return false;
    return pushConfig.subscriptions.some((s) => s.endpoint === deviceEndpoint) && pushConfig.enabled;
  }, [deviceEndpoint, pushConfig]);

  // Do not show banner if device is already subscribed or user dismissed it
  if (isCurrentDeviceSubscribed || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY_PUSH_BANNER_DISMISSED, Date.now().toString());
    } catch {
      // ignore
    }
  };

  const handleQuickEnable = async () => {
    // If on iOS in standard Safari browser tab, Apple blocks Notification.requestPermission()
    // Show step-by-step PWA install instructions first!
    if (platformSupport.needsIosHomeScreenInstall) {
      setShowIosGuide(true);
      return;
    }

    setIsBusy(true);
    setErrorMsg(null);
    try {
      const { updatedConfig, subscription } = await subscribeDeviceToWebPush(pushConfig);
      onUpdatePushConfig(updatedConfig);
      setDeviceEndpoint(subscription.endpoint);
      setIsDismissed(true);

      const profileName = PROFILES[activeProfile].name;
      onShowToast?.(
        `✅ ¡Alertas Push activadas para ${profileName}! Te avisaremos antes de cada comida y al llenarse la bolsa.`
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo activar las notificaciones en este dispositivo.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c38] via-[#1a2347] to-[#241b44] border-2 border-amber-400/40 p-4 sm:p-5 shadow-2xl shadow-purple-950/50 backdrop-blur-xl animate-fade-in text-white my-4">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Icon & Pitch */}
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            <div className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 text-indigo-950 font-black animate-pulse">
              <BellRing className="w-6 h-6 stroke-[2.3]" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Nuevo en Sleep Master</span>
                </span>
                <span className="text-xs text-purple-200/80 font-medium hidden sm:inline">
                  Para {PROFILES[activeProfile].avatar} {PROFILES[activeProfile].name}
                </span>
              </div>

              <h4 className="font-display font-black text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5 flex-wrap">
                <span>¿Activar Alertas Push en tu celular?</span>
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed">
                Recibe avisos útiles para no perder progreso en Pokémon Sleep:
              </p>

              {/* 3 Key Benefits Pills */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.07] border border-white/10 text-amber-200">
                  <UtensilsCrossed className="w-3 h-3 text-amber-300" />
                  <span><strong>Comidas:</strong> 25 min antes (desayuno, almuerzo, cena 22:30)</span>
                </span>

                {bottleneck ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.07] border border-white/10 text-emerald-200">
                    <Backpack className="w-3 h-3 text-emerald-300" />
                    <span><strong>Bolsa llena:</strong> {bottleneck.pokemonName} (~{bottleneck.formattedDuration})</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.07] border border-white/10 text-emerald-200">
                    <Backpack className="w-3 h-3 text-emerald-300" />
                    <span><strong>Bolsa de equipo:</strong> Aviso al llenarse</span>
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.07] border border-white/10 text-sky-200">
                  <Moon className="w-3 h-3 text-sky-300" />
                  <span><strong>Luna Nueva:</strong> Bonos de galletas y lunes</span>
                </span>
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-300 font-semibold bg-rose-950/40 border border-rose-500/30 rounded-xl px-2.5 py-1.5 mt-2">
                  ⚠️ {errorMsg}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
            <button
              type="button"
              disabled={isBusy}
              onClick={handleQuickEnable}
              className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-indigo-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>{isBusy ? 'Vinculando...' : '⚡ Activar en 1 Toque'}</span>
              {!isBusy && <ChevronRight className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <button
              type="button"
              onClick={onOpenPushModal}
              title="Personalizar horas y tipos de alertas"
              className="p-2.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 hover:text-white border border-white/15 transition-all cursor-pointer active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              title="Recordármelo más tarde"
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Home Screen Required Modal */}
      {showIosGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setShowIosGuide(false)}
        >
          <div
            className="cozy-card rounded-3xl max-w-sm w-full p-6 text-white shadow-2xl relative border border-white/15 overflow-hidden space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Paso necesario en iPhone (iOS)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apple requiere que la app esté agregada a tu <strong>Pantalla de Inicio</strong> para poder enviarte notificaciones Push:
            </p>

            <div className="space-y-3 bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </div>
                <div className="text-slate-200">
                  Toca el botón <strong>Compartir</strong> en la barra de Safari (el ícono <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-sky-300" />).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div className="text-slate-200">
                  Desliza hacia abajo y elige <strong className="text-white">"Agregar a inicio"</strong> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-emerald-300" />).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div className="text-slate-200">
                  Abre la app desde tu pantalla de inicio y toca <strong className="text-amber-300">"Activar en 1 Toque"</strong>.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
