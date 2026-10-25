import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Bell,
  BellRing,
  BellOff,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Moon,
  Clock,
  RefreshCw,
  Send,
  Smartphone,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Backpack,
  Compass,
  UtensilsCrossed
} from 'lucide-react';
import { Pokemon, PushNotificationConfig, SnorlaxConfig } from '../types/pokemon';
import { ProfileId, PROFILES } from '../services/supabase';
import { getPokemonAvatarUrl } from '../services/pokeApiService';
import {
  mergeWithDefaultPushConfig,
  computeFastestTeamBagFill,
  getLunarEventStatus,
  detectPushPlatformSupport,
  getActiveBrowserPushEndpoint,
  subscribeDeviceToWebPush,
  unsubscribeDeviceFromWebPush,
  triggerTestPushNotification,
  sendPartnerQuickNudge
} from '../services/pushNotificationService';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProfile: ProfileId;
  pokemons: Pokemon[];
  config: SnorlaxConfig;
  onUpdatePushConfig: (nextPushConfig: PushNotificationConfig) => void;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  activeProfile,
  pokemons,
  config,
  onUpdatePushConfig
}) => {
  const pushConfig = useMemo(
    () => mergeWithDefaultPushConfig(config.pushConfig),
    [config.pushConfig]
  );

  const [deviceEndpoint, setDeviceEndpoint] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [showCronHelp, setShowCronHelp] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const platformSupport = useMemo(() => detectPushPlatformSupport(), [isOpen]);
  const lunarStatus = useMemo(() => getLunarEventStatus(), [isOpen]);
  const { bottleneck, allBerriesTeam } = useMemo(
    () => computeFastestTeamBagFill(pokemons, config),
    [pokemons, config]
  );

  const partnerProfile: ProfileId = activeProfile === 'cris' ? 'ady' : 'cris';
  const partnerMeta = PROFILES[partnerProfile];

  useEffect(() => {
    if (!isOpen) return;
    setFeedback(null);
    getActiveBrowserPushEndpoint().then(setDeviceEndpoint);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  const isCurrentDeviceSubscribed = useMemo(() => {
    if (!deviceEndpoint) return false;
    return pushConfig.subscriptions.some((s) => s.endpoint === deviceEndpoint) && pushConfig.enabled;
  }, [deviceEndpoint, pushConfig]);

  const updateField = <K extends keyof PushNotificationConfig>(
    key: K,
    value: PushNotificationConfig[K]
  ) => {
    onUpdatePushConfig({
      ...pushConfig,
      [key]: value
    });
  };

  const handleToggleDevicePush = async () => {
    setIsBusy(true);
    setFeedback(null);
    try {
      if (isCurrentDeviceSubscribed) {
        const next = await unsubscribeDeviceFromWebPush(pushConfig);
        onUpdatePushConfig(next);
        setDeviceEndpoint(null);
        setFeedback({ type: 'ok', text: 'Notificaciones desactivadas en este dispositivo.' });
      } else {
        const { updatedConfig, subscription } = await subscribeDeviceToWebPush(pushConfig);
        onUpdatePushConfig(updatedConfig);
        setDeviceEndpoint(subscription.endpoint);
        setFeedback({
          type: 'ok',
          text: `¡Listo! Este dispositivo quedó vinculado al perfil de ${PROFILES[activeProfile].name}.`
        });
      }
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'No se pudo cambiar la suscripción Push.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendTest = async () => {
    setIsBusy(true);
    setFeedback(null);
    try {
      const res = await triggerTestPushNotification({
        profileId: activeProfile,
        pushConfig,
        bottleneck
      });
      setFeedback({
        type: 'ok',
        text: res.viaServer
          ? '¡Notificación Push real enviada! Revisa la barra superior de tu celular.'
          : '¡Notificación local enviada desde el Service Worker!'
      });
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'Error al enviar notificación de prueba.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleManualBagReset = () => {
    const nowIso = new Date().toISOString();
    const copy = { ...pushConfig, lastBagCollectedAt: nowIso };
    delete copy.snoozedUntil;
    onUpdatePushConfig(copy);
    setFeedback({
      type: 'ok',
      text: bottleneck
        ? `✅ Reloj reiniciado. Te avisaremos en ~${bottleneck.formattedDuration} cuando ${bottleneck.pokemonName} llene su bolsa.`
        : '✅ Reloj de bolsa reiniciado.'
    });
  };

  const handlePartnerNudge = async (kind: 'meal' | 'sleep') => {
    setIsBusy(true);
    setFeedback(null);
    try {
      await sendPartnerQuickNudge(activeProfile, kind);
      setFeedback({
        type: 'ok',
        text: `¡Recordatorio enviado al celular de ${partnerMeta.name}! ${partnerMeta.avatar}`
      });
    } catch (err: any) {
      setFeedback({ type: 'err', text: err?.message || 'No se pudo enviar el recordatorio.' });
    } finally {
      setIsBusy(false);
    }
  };

  const supabaseCronSql = useMemo(() => {
    const origin =
      typeof window !== 'undefined' ? window.location.origin : 'https://poke-master-sleep.vercel.app';
    return `-- Ejecuta esto 1 sola vez en Supabase SQL Editor para precisión cada 5 min:
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'pokesleep-push-dispatch',
  '*/5 * * * *',
  $$ select net.http_get(url := '${origin}/api/push') $$
);`;
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(supabaseCronSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2200);
  };

  if (!isOpen) return null;

  const lastResetFormatted = pushConfig.lastBagCollectedAt
    ? new Date(pushConfig.lastBagCollectedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="cozy-card rounded-3xl max-w-lg w-full p-5 sm:p-6 text-white shadow-2xl relative border border-white/15 overflow-hidden flex flex-col max-h-[92vh] my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-indigo-500/20" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full blur-3xl pointer-events-none bg-purple-500/20" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 relative z-10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/25 to-purple-500/30 border border-white/20 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-white flex items-center gap-2">
                <span>Alertas Push Inteligentes</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {PROFILES[activeProfile].avatar} {PROFILES[activeProfile].name}
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Comidas, bolsa llena de tu equipo, fases lunares y reset semanal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="py-4 space-y-4 overflow-y-auto overscroll-contain flex-1 relative z-10 pr-0.5 custom-scrollbar">
          {/* 1. Device Subscription Hero Card */}
          <div
            className={`rounded-2xl p-4 border transition-all ${
              isCurrentDeviceSubscribed
                ? 'bg-emerald-950/35 border-emerald-400/35'
                : 'bg-indigo-950/45 border-indigo-400/30'
            }`}
          >
            {platformSupport.needsIosHomeScreenInstall ? (
              <div className="space-y-2 text-xs text-amber-200">
                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Smartphone className="w-4 h-4" />
                  <span>Instala la app en tu Pantalla de Inicio (iPhone / iOS)</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  En iOS, Apple requiere que toques el botón <strong>Compartir</strong> de Safari y elijas{' '}
                  <strong>"Agregar a inicio"</strong>. Al abrirla desde tu inicio podrás activar las notificaciones Push.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-black flex items-center gap-1.5">
                      {isCurrentDeviceSubscribed ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-300">Push activo en este celular</span>
                        </>
                      ) : (
                        <>
                          <BellOff className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-white">Vincular este celular a {PROFILES[activeProfile].name}</span>
                        </>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                      {platformSupport.supportsActionButtons ? (
                        <span>
                          ✨ <strong>Android / Chrome detectado:</strong> Verás el botón rápido{' '}
                          <code className="text-emerald-300 bg-black/40 px-1 rounded">✅ Ya recogí</code> directo en la
                          notificación sin siquiera abrir la app.
                        </span>
                      ) : (
                        <span>
                          ✨ <strong>iOS PWA detectado:</strong> Al tocar la notificación se reinicia el reloj en 1 toque
                          y las anclas de comida evitan spam.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={handleToggleDevicePush}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50 ${
                      isCurrentDeviceSubscribed
                        ? 'bg-white/10 hover:bg-rose-500/25 text-slate-200 hover:text-rose-200 border border-white/15'
                        : 'btn-dreamy-pearl text-indigo-950'
                    }`}
                  >
                    <Bell className="w-4 h-4" />
                    <span>
                      {isCurrentDeviceSubscribed
                        ? 'Desactivar en este celular'
                        : 'Activar Notificaciones Push 🔔'}
                    </span>
                  </button>

                  {isCurrentDeviceSubscribed && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={handleSendTest}
                      className="py-2.5 px-3.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/40 border border-purple-400/40 text-purple-100 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Probar Push</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`p-3 rounded-2xl border text-xs flex items-start gap-2 animate-fade-in ${
                feedback.type === 'ok'
                  ? 'bg-emerald-500/15 border-emerald-400/35 text-emerald-200'
                  : 'bg-rose-500/15 border-rose-400/35 text-rose-200'
              }`}
            >
              {feedback.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* 2. Smart Bag-Fill Watcher Card */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/12 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Backpack className="w-4 h-4 text-cyan-300" />
                <span className="text-xs font-black text-white">
                  2. Bolsa Llena Inteligente (Tu Equipo)
                </span>
              </div>
              <input
                type="checkbox"
                checked={pushConfig.smartBagAlert}
                onChange={(e) => updateField('smartBagAlert', e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            {allBerriesTeam ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/25 text-[11px] text-amber-200">
                🍓 Tu equipo actual es <strong>100% Especialistas en Bayas</strong>. Les conviene tener la bolsa llena
                (<em>Sneaky Snacking</em>), así que esta alerta se silencia sola para no molestarte.
              </div>
            ) : bottleneck ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/35 border border-white/10">
                <img
                  src={getPokemonAvatarUrl(bottleneck.pokemonName)}
                  alt={bottleneck.pokemonName}
                  className="w-12 h-12 object-contain flex-shrink-0 drop-shadow"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-black text-cyan-300 truncate">
                      {bottleneck.pokemonName}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-slate-300 font-bold">
                      {bottleneck.specialty}
                    </span>
                    {bottleneck.isUsingFallbackTeam && (
                      <span className="text-[9px] text-amber-300">(Top PR)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                    Llena su bolsa (<strong>{bottleneck.carryLimit}/{bottleneck.carryLimit}</strong>) en{' '}
                    <strong className="text-white">~{bottleneck.formattedDuration}</strong> · Cuida{' '}
                    <em>{bottleneck.primaryOutputLabel}</em>.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400">
                Agrega Pokémon de Ingredientes o Habilidades a tu equipo actual para calcular el tiempo exacto.
              </p>
            )}

            <div className="flex items-center justify-between gap-2 pt-1 flex-wrap text-[11px]">
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300">Hora de despertar:</span>
                <input
                  type="time"
                  value={pushConfig.wakeUpTime}
                  onChange={(e) => updateField('wakeUpTime', e.target.value)}
                  className="bg-black/45 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <button
                type="button"
                onClick={handleManualBagReset}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-200 font-bold flex items-center gap-1 transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Ya recogí {lastResetFormatted ? `(${lastResetFormatted})` : ''}</span>
              </button>
            </div>
          </div>

          {/* 3. Meal & Pre-Sleep Schedule Card */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/12 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-black text-white">
              <UtensilsCrossed className="w-4 h-4 text-amber-300" />
              <span>1 & 3. Comidas de Snorlax + Cena / Dormir</span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-1">
              Los Domingos se activa automáticamente el recordatorio de <strong>Súper Olla (2×)</strong>.
            </p>

            <div className="space-y-2.5 text-xs">
              {/* Breakfast */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.breakfastReminder}
                    onChange={(e) => updateField('breakfastReminder', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">🥐 Desayuno (25 min antes)</span>
                    <span className="text-[10px] text-slate-400">Cierra a las 12:00 PM</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={pushConfig.breakfastTime}
                  onChange={(e) => updateField('breakfastTime', e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              {/* Lunch */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.lunchReminder}
                    onChange={(e) => updateField('lunchReminder', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">🍲 Comida (25 min antes)</span>
                    <span className="text-[10px] text-slate-400">Cierra a las 6:00 PM</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={pushConfig.lunchTime}
                  onChange={(e) => updateField('lunchTime', e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              {/* Dinner + Bedtime */}
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushConfig.dinnerSleepReminder}
                    onChange={(e) => updateField('dinnerSleepReminder', e.target.checked)}
                    className="w-4 h-4 accent-purple-500 rounded"
                  />
                  <div>
                    <span className="font-bold text-white block">🌙 Cena + Preparar Sueño</span>
                    <span className="text-[10px] text-slate-400">30 min antes de dormir (11:00 PM)</span>
                  </div>
                </label>
                <input
                  type="time"
                  value={pushConfig.dinnerSleepTime}
                  onChange={(e) => updateField('dinnerSleepTime', e.target.value)}
                  className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* 4. Astronomical Lunar Radar + Monday Reset */}
          <div className="rounded-2xl bg-white/[0.04] border border-white/12 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-black text-white">
                <Moon className="w-4 h-4 text-indigo-300" />
                <span>Eventos Lunares (Luna Nueva 🌑 y Llena 🌕)</span>
              </div>
              <input
                type="checkbox"
                checked={pushConfig.lunarEventsAlert}
                onChange={(e) => updateField('lunarEventsAlert', e.target.checked)}
                className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
              />
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-950/50 border border-indigo-400/25 text-[11px] flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-indigo-200">
                  {lunarStatus.emoji} Hoy: {lunarStatus.label} ({lunarStatus.illuminationPct}% luz)
                </div>
                <div className="text-slate-400 mt-0.5">
                  {lunarStatus.bonusSummary
                    ? lunarStatus.bonusSummary
                    : `🌑 Luna Nueva en ~${lunarStatus.daysUntilNewMoon}d · 🌕 Luna Llena en ~${lunarStatus.daysUntilFullMoon}d`}
                </div>
              </div>
            </div>

            {/* Monday Ritual */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pushConfig.mondayResetAlert}
                  onChange={(e) => updateField('mondayResetAlert', e.target.checked)}
                  className="w-4 h-4 accent-purple-500 rounded"
                />
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-300" />
                  <span>🏝️ Ritual del Lunes (Nueva Isla y Bayas)</span>
                </span>
              </label>
              <input
                type="time"
                value={pushConfig.mondayResetTime}
                onChange={(e) => updateField('mondayResetTime', e.target.value)}
                className="bg-black/50 border border-white/15 rounded-lg px-2 py-1 text-xs text-white font-mono"
              />
            </div>
          </div>

          {/* 5. Partner Quick Nudge (Cris <-> Ady) */}
          <div className="rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 border border-white/12 p-3.5 space-y-2.5">
            <div className="text-xs font-black text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-300" />
              <span>
                Toque rápido para {partnerMeta.avatar} {partnerMeta.name}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handlePartnerNudge('meal')}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-white transition-all disabled:opacity-50"
              >
                🍽️ "¡Dale de comer!"
              </button>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => handlePartnerNudge('sleep')}
                className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-[11px] font-bold text-white transition-all disabled:opacity-50"
              >
                🌙 "¡A dormir a Snorlax!"
              </button>
            </div>
          </div>

          {/* 6. Optional Supabase pg_cron 5-min precision helper */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3">
            <button
              type="button"
              onClick={() => setShowCronHelp((v) => !v)}
              className="w-full flex items-center justify-between text-[11px] text-slate-300 hover:text-white font-bold"
            >
              <span>⚡ Precisión reloj 24/7 (GitHub Cron incluido + SQL Supabase opcional)</span>
              {showCronHelp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showCronHelp && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2 text-[11px] text-slate-300">
                <p>
                  El proyecto ya incluye despacho automático por GitHub Actions. Si deseas precisión exacta cada 5
                  minutos desde Supabase gratis, pega este SQL una sola vez en tu SQL Editor:
                </p>
                <pre className="p-2.5 rounded-xl bg-black/60 border border-white/10 text-[10px] text-cyan-200 overflow-x-auto font-mono">
                  {supabaseCronSql}
                </pre>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 text-[11px]"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? '¡SQL copiado!' : 'Copiar SQL de Supabase'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 relative z-10 flex-shrink-0">
          <span>Zona horaria: {pushConfig.timezone}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold transition-all"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
