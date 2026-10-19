import React, { useState, useMemo, useEffect } from 'react';
import { Pokemon, SnorlaxConfig, MidWeekProgress } from '../types/pokemon';
import {
  proyectarSemanaEquipo,
  ProyeccionSemanalCompleta,
  ProyeccionDia,
  HitoClave
} from '../services/weeklyProjector';
import {
  IslaId,
  normalizeIslaId,
  calcularRangoSnorlax,
  NombreRango
} from '../data/islandRanks';
import { getRankPokeballUrl } from '../services/pokeApiService';
import {
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  Flame,
  Award,
  Zap,
  Target,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Check,
  Edit3,
  X,
  Sliders,
  Shield,
  Rocket
} from 'lucide-react';

interface WeeklyRankProjectionViewProps {
  equipo: Pokemon[];
  config: SnorlaxConfig;
  teamLabel?: string;
  comparisonEquipo?: Pokemon[];
  comparisonLabel?: string;
  onUpdateMidWeekProgress?: (progress: MidWeekProgress) => void;
  onResetMidWeekProgress?: () => void;
}

const DIAS_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const WeeklyRankProjectionView: React.FC<WeeklyRankProjectionViewProps> = ({
  equipo,
  config,
  teamLabel = 'Tu Equipo',
  comparisonEquipo,
  comparisonLabel = 'Equipo Recomendado #1',
  onUpdateMidWeekProgress,
  onResetMidWeekProgress
}) => {
  const isCalibrated = Boolean(
    config.midWeekProgress?.isCalibrated &&
    (config.midWeekProgress?.currentVigor ?? 0) > 0
  );

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [currentVigorInput, setCurrentVigorInput] = useState<number>(() => {
    return config.midWeekProgress?.currentVigor || 0;
  });
  const [currentDayIdx, setCurrentDayIdx] = useState<number>(() => {
    return typeof config.midWeekProgress?.currentDayIdx === 'number'
      ? config.midWeekProgress.currentDayIdx
      : 5; // Default Saturday (idx 5)
  });
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);
  const [hidePastDays, setHidePastDays] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Sync state if config.midWeekProgress updates from outside (e.g. cloud sync)
  useEffect(() => {
    if (config.midWeekProgress?.isCalibrated && config.midWeekProgress.currentVigor > 0) {
      setCurrentVigorInput(config.midWeekProgress.currentVigor);
      if (typeof config.midWeekProgress.currentDayIdx === 'number') {
        setCurrentDayIdx(config.midWeekProgress.currentDayIdx);
      }
    }
  }, [config.midWeekProgress]);

  const handleSaveMidWeek = (vigor: number, dayIdx: number) => {
    if (onUpdateMidWeekProgress) {
      onUpdateMidWeekProgress({
        currentVigor: vigor,
        currentDayIdx: dayIdx,
        isCalibrated: vigor > 0,
        updatedAt: new Date().toISOString()
      });
      setSaveStatus('¡Ajuste aplicado!');
      setTimeout(() => {
        setSaveStatus(null);
        setIsDrawerOpen(false);
      }, 1500);
    }
  };

  const handleResetCalibration = () => {
    setCurrentVigorInput(0);
    setIsDrawerOpen(false);
    if (onResetMidWeekProgress) {
      onResetMidWeekProgress();
    }
  };

  const formatUpdateDate = (dateStr?: string) => {
    if (!dateStr) return 'Recientemente';
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const timeStr = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Hoy a las ${timeStr}`;
      }
      const dateFormatted = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      return `${dateFormatted}, ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  const islaId = useMemo(() => normalizeIslaId(config.island), [config.island]);

  // SINGLE UNIFIED PROJECTION:
  // If calibrated, automatically uses in-game points + current day; otherwise theoretical full week
  const proyeccion = useMemo(() => {
    if (equipo.length === 0) return null;
    const vigorInit = isCalibrated ? (config.midWeekProgress?.currentVigor || 0) : 0;
    const dayInit = isCalibrated ? (config.midWeekProgress?.currentDayIdx ?? 5) : 0;
    return proyectarSemanaEquipo(equipo, config, vigorInit, dayInit);
  }, [equipo, config, isCalibrated]);

  // Optional comparison projection
  const proyeccionComparison = useMemo(() => {
    if (!comparisonEquipo || comparisonEquipo.length === 0) return null;
    const vigorInit = isCalibrated ? (config.midWeekProgress?.currentVigor || 0) : 0;
    const dayInit = isCalibrated ? (config.midWeekProgress?.currentDayIdx ?? 5) : 0;
    return proyectarSemanaEquipo(comparisonEquipo, config, vigorInit, dayInit);
  }, [comparisonEquipo, config, isCalibrated]);

  if (!proyeccion || equipo.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 text-sm">
        Asigna al menos 1 compañero Pokémon para proyectar la curva semanal de rangos de Snorlax.
      </div>
    );
  }

  const {
    estadoRangoFinal,
    estadoRangoMin,
    estadoRangoMax,
    vigorFinalSemana,
    vigorMinSemana,
    vigorMaxSemana,
    timelineDias,
    hitosClave,
    vigorDiaNormal,
    vigorDiaDomingo
  } = proyeccion;

  // Rank Theme palette - authentic Pokemon Sleep tiers (Sapphire palette)
  const getRankTheme = (rango: NombreRango) => {
    if (rango.startsWith('Máster')) {
      const num = parseInt(rango.replace('Máster', '').trim(), 10) || 1;
      if (num >= 15) {
        return {
          bg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
          text: 'text-violet-200',
          border: 'border-violet-400/50',
          glow: 'shadow-violet-500/15 shadow-xl',
          badge: 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black',
          pillBg: 'bg-violet-500/20 text-violet-200 border-violet-400/30'
        };
      }
      return {
        bg: 'bg-gradient-to-r from-purple-600 to-indigo-600',
        text: 'text-purple-200',
        border: 'border-purple-400/40',
        glow: 'shadow-purple-500/15 shadow-lg',
        badge: 'bg-purple-400 text-slate-950 font-black',
        pillBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30'
      };
    }
    if (rango.startsWith('Ultra')) {
      return {
        bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
        text: 'text-emerald-200',
        border: 'border-emerald-500/40',
        glow: 'shadow-emerald-500/10 shadow-md',
        badge: 'bg-emerald-500 text-white font-bold',
        pillBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30'
      };
    }
    if (rango.startsWith('Súper')) {
      return {
        bg: 'bg-gradient-to-r from-indigo-500 to-blue-600',
        text: 'text-indigo-200',
        border: 'border-indigo-500/40',
        glow: 'shadow-indigo-500/10 shadow-md',
        badge: 'bg-indigo-500 text-white font-bold',
        pillBg: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30'
      };
    }
    return {
      bg: 'bg-gradient-to-r from-slate-600 to-slate-700',
      text: 'text-slate-200',
      border: 'border-slate-700',
      glow: '',
      badge: 'bg-slate-700 text-white font-semibold',
      pillBg: 'bg-slate-800 text-slate-300 border-slate-700'
    };
  };

  const finalTheme = getRankTheme(estadoRangoFinal.rangoActual);
  const pastDaysCount = timelineDias.filter(d => d.esPasado).length;

  return (
    <div className="glass-dreamy pokeball-watermark p-5 sm:p-6 rounded-[28px] space-y-6 relative overflow-hidden border border-white/10 shadow-xl">
      {/* Top Header & Calibration Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-[var(--accent-primary)]" />
            <span>Curva de Crecimiento & Rango Semanal de Snorlax</span>
          </div>
          <h3 className="text-xl font-display font-bold text-[var(--text-heading)] flex items-center gap-2 tracking-tight">
            <span>Proyección Semanal: {teamLabel}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simula la progresión día a día considerando el puchero normal (Lun–Sáb) y el{' '}
            <strong className="text-[var(--accent-primary)]">Súper Domingo</strong> de puchero doble con más probabilidad de ¡Riquísimo!
          </p>
        </div>

        {/* Quick Calibration Action Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isCalibrated ? (
            <div className="flex items-center gap-1.5 bg-white/[0.06] backdrop-blur-md border border-purple-400/40 p-1.5 pl-3 rounded-full shadow-md">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-bold text-purple-200 text-xs">
                  {config.midWeekProgress?.currentVigor.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-slate-300">
                  ({DIAS_NOMBRES[config.midWeekProgress?.currentDayIdx ?? 5]})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 text-xs font-bold transition-all border border-purple-400/30"
                title="Modificar puntos actuales en pantalla"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ajustar</span>
              </button>

              <button
                type="button"
                onClick={handleResetCalibration}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="Volver a proyección teórica de toda la semana"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="btn-dreamy-pearl px-5 py-2.5 text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Zap className="w-3.5 h-3.5 text-purple-400" />
              <span>Ajustar a Hoy en Juego 🎮</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Calibration Drawer (Accordion / Collapsible) */}
      {isDrawerOpen && (
        <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-3xl p-5 relative z-10 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-[var(--accent-primary)] uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Calibra con los Puntos Actuales de tu Snorlax</span>
              </div>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl leading-relaxed">
                Ingresa los puntos que ves hoy en tu juego. El algoritmo fijará tu progreso real como base y calculará la producción restante hasta el domingo, estrechando el margen de error.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3 pt-2">
            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">Día de la Semana</label>
              <select
                value={currentDayIdx}
                onChange={(e) => setCurrentDayIdx(parseInt(e.target.value, 10))}
                className="bg-black/30 border border-white/15 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none"
              >
                {DIAS_NOMBRES.map((d, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900">
                    {d} {idx === 5 ? '(Hoy Sábado)' : idx === 6 ? '(Domingo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 font-bold mb-1">Puntos en tu Pantalla</label>
              <input
                type="number"
                value={currentVigorInput || ''}
                onChange={(e) => {
                  const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                  setCurrentVigorInput(val);
                }}
                placeholder="Ej. 521439"
                className="w-44 bg-[var(--surface-inner)] border border-[var(--surface-border)] text-white tabular-nums font-black text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSaveMidWeek(currentVigorInput, currentDayIdx)}
              className="btn-cozy-primary px-4 py-2 text-xs flex items-center gap-1.5 active:scale-95 transition-all"
            >
              {saveStatus ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveStatus || 'Aplicar y Proyectar'}</span>
            </button>

            {isCalibrated && (
              <button
                type="button"
                onClick={handleResetCalibration}
                className="btn-cozy-secondary text-xs px-3 py-2"
              >
                Quitar Calibración
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Hero Card: Rango Estimado + Previsión para el Domingo */}
      <div className="glass-dreamy pokeball-watermark p-5 sm:p-6 rounded-[28px] relative overflow-hidden border border-white/10 shadow-2xl space-y-5">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge & Island */}
        <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
              isCalibrated
                ? 'bg-purple-500/20 text-purple-200 border-purple-400/30 shadow-sm'
                : 'bg-white/[0.06] text-purple-200 border-white/10'
            }`}>
              {isCalibrated
                ? '🟣 PREDICCIÓN CALIBRADA EN VIVO'
                : 'PROYECCIÓN ESTIMADA DE LA SEMANA'}
            </span>
            <span className="text-xs text-[var(--text-creamy)] tabular-nums bg-white/[0.06] border border-white/10 px-3 py-0.5 rounded-full font-bold">
              🏝️ Isla: <span className="text-white capitalize font-black">{islaId.replace('_', ' ')}</span>
            </span>
          </div>

          {isCalibrated && (
            <span className="text-[11px] text-purple-200 tabular-nums bg-purple-950/60 border border-purple-400/30 px-3 py-0.5 rounded-full font-medium">
              Actualizado: {formatUpdateDate(config.midWeekProgress?.updatedAt)}
            </span>
          )}
        </div>

        {/* Primary Hero Display: Pokeball + Main Expected Rank + Points */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Luminous Glowing Dot Ring Arc & Sacred Altar Halo */}
            <div className="relative flex items-center justify-center flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
              {/* Pulsing ambient glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-400/20 via-purple-500/20 to-sky-400/20 blur-md animate-pulse" />
              {/* Dotted Celestial SVG Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.12)"
                  strokeWidth="2"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  fill="none"
                  stroke="url(#celestial-gold-grad)"
                  strokeWidth="3"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  className="animate-[spin_45s_linear_infinite]"
                />
                <defs>
                  <linearGradient id="celestial-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C084FC" />
                    <stop offset="50%" stopColor="#E0E7FF" />
                    <stop offset="100%" stopColor="#38BDF8" />
                  </linearGradient>
                </defs>
              </svg>
              <img
                src={getRankPokeballUrl(estadoRangoFinal.rangoActual)}
                alt={estadoRangoFinal.rangoActual}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] relative z-10"
              />
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-display font-black text-[var(--text-heading)] tracking-tight">
                  {estadoRangoFinal.rangoActual}
                </h2>
              </div>
              <div className="text-xs text-[var(--text-creamy)] tabular-nums flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-white font-black text-lg">
                  ~{vigorFinalSemana.toLocaleString()} pts
                </span>
                <span className="text-[var(--text-muted)]">acumulados al cerrar el domingo</span>
              </div>
            </div>
          </div>

          {/* Distance to next rank badge */}
          <div className="bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2.5 self-start sm:self-auto text-left sm:text-right shadow-inner">
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-wider block">
              {estadoRangoFinal.siguienteRango ? 'Próximo Rango' : 'Techo de la Isla'}
            </span>
            <span className="text-xs sm:text-sm font-black text-white tabular-nums">
              {estadoRangoFinal.siguienteRango
                ? `${estadoRangoFinal.siguienteRango} (faltan ${estadoRangoFinal.vigorFaltanteSiguiente.toLocaleString()} pts)`
                : 'Máster 20 completado'}
            </span>
          </div>
        </div>

        {/* PREVISIÓN DE SNORLAX (Cozy 3-Scenario Cards) */}
        <div className="relative z-10 rounded-[24px] bg-white/[0.04] backdrop-blur-md border border-white/10 p-4 sm:p-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <h4 className="text-xs sm:text-sm font-display font-bold text-[var(--text-heading)]">
                Previsión de Snorlax para el Domingo
              </h4>
            </div>
            <div className="text-[11px] text-[var(--text-creamy)] tabular-nums">
              Vigor Estimado:{' '}
              <strong className="text-white font-bold">{vigorMinSemana.toLocaleString()}</strong> ~{' '}
              <strong className="text-white font-bold">{vigorMaxSemana.toLocaleString()} pts</strong>
            </div>
          </div>

          {/* 3 Scenarios Cards: Mínimo / Esperado / Máximo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Scenario 1: Tranquilo */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                    <span>💤</span>
                    <span>Ritmo Tranquilo</span>
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/5 text-[var(--text-muted)] font-medium">
                    Sin Críticos
                  </span>
                </div>
                <div className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <span>{estadoRangoMin.rangoActual}</span>
                </div>
                <div className="text-xs text-[var(--text-muted)] tabular-nums mt-0.5">
                  {vigorMinSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
                Sin comidas ¡Riquísimo! y ritmo relajado de habilidades.
              </p>
            </div>

            {/* Scenario 2: Esperado / Promedio (Hero Card) */}
            <div className="p-4 rounded-3xl bg-gradient-to-b from-purple-500/25 via-[var(--surface-card)] to-[var(--surface-inner)] border-2 border-purple-400/60 flex flex-col justify-between shadow-xl shadow-purple-500/15 sm:-translate-y-1 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-400/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-200 flex items-center gap-1.5">
                    <span>⭐</span>
                    <span>Ritmo Esperado</span>
                  </span>
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full bg-white text-indigo-950 font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span>🎯</span>
                    <span>Objetivo</span>
                  </span>
                </div>
                <div className="text-base font-black text-white flex items-center gap-2 mt-0.5">
                  <img
                    src={getRankPokeballUrl(estadoRangoFinal.rangoActual)}
                    alt=""
                    className="w-5 h-5 object-contain"
                  />
                  <span>{estadoRangoFinal.rangoActual}</span>
                </div>
                <div className="text-sm text-white tabular-nums font-black mt-0.5">
                  ~{vigorFinalSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-purple-100/80 mt-2 leading-relaxed relative z-10">
                Ritmo normal: probabilidad estándar (10% Lun–Sáb y 30% Súper Domingo).
              </p>
            </div>

            {/* Scenario 3: Con Riquísimo */}
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/30 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
                    <span>🌟</span>
                    <span>¡Con Riquísimo!</span>
                  </span>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-200 tabular-nums font-bold">
                    Críticos
                  </span>
                </div>
                <div className="text-sm font-bold text-purple-100 flex items-center gap-1.5 mt-0.5">
                  <span>{estadoRangoMax.rangoActual}</span>
                </div>
                <div className="text-xs text-purple-300 tabular-nums mt-0.5">
                  hasta {vigorMaxSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-purple-200/80 mt-2 leading-relaxed">
                Varios ¡Riquísimo! en el puchero y buena activación de habilidades.
              </p>
            </div>
          </div>

          {/* Dynamic precision note */}
          <div className="mt-3 pt-2.5 border-t border-[var(--surface-border)] flex items-center justify-between text-[11px] text-slate-300">
            {isCalibrated ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Calibrado con tus {pastDaysCount} días jugados:</strong> El margen de cálculo es mínimo y de altísima precisión.
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
                <span>
                  <strong>Proyección teórica de 7 días:</strong> Puedes presionar <em>"Ajustar a Hoy en Juego"</em> arriba para fijar tus puntos reales.
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Progress bar towards next rank (Warm Honey Glow) */}
        <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-2xl p-3.5 sm:p-4 shadow-inner relative z-10">
          <div className="flex items-center justify-between text-xs tabular-nums font-bold text-[var(--text-creamy)] mb-1.5">
            <span className="text-[11px] text-[var(--text-muted)]">
              Progreso hacia <strong className="text-white">{estadoRangoFinal.siguienteRango || 'Máster 20'}</strong>
            </span>
            <span className="text-white font-black tabular-nums">
              {estadoRangoFinal.porcentajeProgresoSiguiente.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-white/[0.06] border border-white/10 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-400 to-pink-300 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(168,85,247,0.45)]"
              style={{ width: `${Math.min(100, Math.max(3, estadoRangoFinal.porcentajeProgresoSiguiente))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] tabular-nums text-[var(--text-muted)] mt-1.5 font-medium">
            <span>Base: {estadoRangoFinal.vigorBaseRangoActual.toLocaleString()} pts</span>
            {estadoRangoFinal.siguienteRango && (
              <span>Meta: {(estadoRangoFinal.vigorActual + estadoRangoFinal.vigorFaltanteSiguiente).toLocaleString()} pts</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Timeline (Lunes a Domingo - Sellos de Diario de Sueño) */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-300" />
            <h4 className="text-sm font-display font-bold text-[var(--text-heading)]">
              Progresión de la Semana (Diario de Campo)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {isCalibrated && pastDaysCount > 0 && (
              <button
                type="button"
                onClick={() => setHidePastDays(!hidePastDays)}
                className="btn-cozy-secondary text-xs px-2.5 py-1"
              >
                {hidePastDays ? `Mostrar Días Pasados (${pastDaysCount})` : 'Ocultar Pasados'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
              className="btn-cozy-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold"
            >
              <span>{isTimelineExpanded ? 'Ocultar Días' : 'Ver Días'}</span>
              {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded 7-day grid */}
        {isTimelineExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
            {timelineDias
              .filter(dia => !(hidePastDays && dia.esPasado))
              .map((dia) => {
                const rankTheme = getRankTheme(dia.rangoAlcanzado);

                return (
                  <div
                    key={dia.diaIdx}
                    className={`rounded-2xl p-3.5 flex flex-col justify-between border transition-all shadow-md relative overflow-hidden group ${
                      dia.esDomingo
                        ? 'bg-gradient-to-b from-purple-500/20 via-[var(--surface-inner)] to-[var(--surface-inner)] border-2 border-purple-400/70 shadow-md shadow-purple-500/10'
                        : dia.esHoy
                        ? 'bg-gradient-to-b from-emerald-500/15 via-[var(--surface-inner)] to-[var(--surface-inner)] border-2 border-emerald-400/80 ring-2 ring-emerald-400/20 shadow-lg shadow-emerald-500/20'
                        : dia.esPasado
                        ? 'bg-white/[0.03] border-white/10 opacity-75'
                        : 'bg-[var(--surface-inner)] border-[var(--surface-border)] hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold ${
                          dia.esDomingo ? 'text-purple-200' : dia.esHoy ? 'text-emerald-300 font-black' : dia.esPasado ? 'text-[var(--text-muted)]' : 'text-slate-200'
                        }`}>
                          {dia.diaNombre}
                        </span>
                        {dia.esDomingo && (
                          <span className="text-[9px] bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                            2x Olla
                          </span>
                        )}
                        {dia.esHoy && (
                          <span className="text-[9px] bg-emerald-400 text-emerald-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                            Hoy
                          </span>
                        )}
                        {dia.esPasado && (
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-200 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-sm">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Hecho</span>
                          </span>
                        )}
                      </div>

                      {/* Vigor Ganado Hoy */}
                      <div className={`text-[11px] tabular-nums font-black ${dia.esPasado ? 'text-[var(--text-muted)]' : 'text-white'}`}>
                        +{dia.vigorGanadoDia.toLocaleString()} pts
                      </div>

                      {/* Vigor Acumulado Fin Dia */}
                      <div className="text-[10px] text-[var(--text-muted)] tabular-nums mt-0.5 font-medium">
                        Total: {dia.vigorAcumuladoFinDia.toLocaleString()}
                      </div>
                    </div>

                    {/* Rango al final del día */}
                    <div className="mt-3 pt-2 border-t border-[var(--surface-border)] flex items-center justify-center gap-1.5">
                      <img
                        src={getRankPokeballUrl(dia.rangoAlcanzado)}
                        alt={dia.rangoAlcanzado}
                        className="w-4 h-4 object-contain flex-shrink-0"
                      />
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border truncate uppercase tracking-wider ${rankTheme.pillBg}`}>
                        {dia.rangoAlcanzado}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Production rhythm & island objectives (Cozy Field Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Card 1: Energía del Campamento (Cocina & Olla) */}
        <div className="cozy-card p-4 sm:p-5 rounded-2xl border border-[var(--surface-border)]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-300" />
            <h5 className="text-xs font-display font-bold text-[var(--text-heading)] uppercase tracking-wider">
              Energía del Campamento (Cocina & Olla)
            </h5>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)]">
              <div>
                <span className="font-bold text-white">Lunes a Sábado:</span>
                <span className="block text-[11px] text-slate-400">Puchero estándar ({config.potSize} ingr.)</span>
              </div>
              <span className="tabular-nums font-bold text-white">
                ~{vigorDiaNormal.toLocaleString()} pts/día
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-500/10 border border-purple-400/30">
              <div>
                <span className="font-black text-purple-200">Súper Domingo:</span>
                <span className="block text-[11px] text-purple-200/80">
                  Puchero doble ({config.goodCampTicket ? '118 ingr.' : `${config.potSize * 2} ingr.`}) y más ¡Riquísimo!
                </span>
              </div>
              <span className="tabular-nums font-black text-white">
                ~{vigorDiaDomingo.toLocaleString()} pts
              </span>
            </div>

            <div className="text-[11px] text-[var(--text-creamy)] pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />
              <span>
                El domingo aporta <strong className="text-purple-200 font-bold">{Math.round((vigorDiaDomingo / (vigorDiaNormal * 6 + vigorDiaDomingo)) * 100)}%</strong> del vigor total de la semana gracias al puchero doble.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Recompensas Semanales de la Isla */}
        <div className="cozy-card p-4 sm:p-5 rounded-2xl border border-[var(--surface-border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-300" />
              <h5 className="text-xs font-display font-bold text-[var(--text-heading)] uppercase tracking-wider">
                Recompensas Semanales de la Isla
              </h5>
            </div>
          </div>

          <div className="space-y-2">
            {/* Incienso Semanal */}
            {(() => {
              const hitoIncienso = hitosClave.find(h => h.indiceRango === 17); // Máster 3
              return (
                <div className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] text-xs">
                  <div className="flex items-center gap-2">
                    {hitoIncienso?.alcanzable ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-white">Incienso Semanal (Máster 3)</span>
                      <span className="block text-[10px] text-[var(--text-muted)]">Recompensa fija de la isla</span>
                    </div>
                  </div>
                  <span className={`tabular-nums font-bold text-xs ${hitoIncienso?.alcanzable ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hitoIncienso?.alcanzable ? `Alcanzado el ${hitoIncienso.diaAlcanzado}` : `Faltan ${hitoIncienso?.vigorFaltante?.toLocaleString()} pts`}
                  </span>
                </div>
              );
            })()}

            {/* Rango Final */}
            <div className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-purple-300 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Rango Proyectado</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">Al cerrar el Domingo</span>
                </div>
              </div>
              <span className="tabular-nums font-black text-white text-xs">
                {estadoRangoFinal.rangoActual}
              </span>
            </div>

            {/* Siguiente Escalón */}
            <div className="flex items-center justify-between p-2.5 px-3 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-200">
                    {estadoRangoFinal.siguienteRango ? `Hacia ${estadoRangoFinal.siguienteRango}` : 'Techo de la Isla'}
                  </span>
                  <span className="block text-[10px] text-[var(--text-muted)]">
                    {estadoRangoFinal.siguienteRango ? 'Vigor pendiente' : 'Máximo posible'}
                  </span>
                </div>
              </div>
              <span className="tabular-nums font-bold text-slate-300 text-xs">
                {estadoRangoFinal.siguienteRango
                  ? `Faltan ${estadoRangoFinal.vigorFaltanteSiguiente.toLocaleString()} pts`
                  : 'Completado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
