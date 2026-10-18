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
        bg: 'bg-gradient-to-r from-blue-600 to-sky-600',
        text: 'text-sky-200',
        border: 'border-sky-500/40',
        glow: 'shadow-sky-500/15 shadow-lg',
        badge: 'bg-blue-600 text-white font-bold',
        pillBg: 'bg-sky-500/20 text-sky-200 border-sky-400/30'
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
        bg: 'bg-gradient-to-r from-sky-500 to-blue-600',
        text: 'text-sky-200',
        border: 'border-sky-500/40',
        glow: 'shadow-sky-500/10 shadow-md',
        badge: 'bg-sky-500 text-white font-bold',
        pillBg: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
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
    <div className="poke-card pokeball-watermark p-5 sm:p-6 space-y-6 relative overflow-hidden">
      {/* Top Header & Calibration Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4 text-sky-400" />
            <span>Curva de Crecimiento & Rango Semanal de Snorlax</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-2 tracking-tight">
            <span>Proyección Semanal: {teamLabel}</span>
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Simula la progresión día a día considerando el puchero normal (Lun–Sáb) y el{' '}
            <strong className="text-sky-300">Súper Domingo</strong> de puchero doble con más probabilidad de ¡Riquísimo!
          </p>
        </div>

        {/* Quick Calibration Action Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isCalibrated ? (
            <div className="flex items-center gap-1.5 bg-[#092244] border border-emerald-400/40 p-1.5 pl-3 rounded-2xl shadow-md">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300 text-xs">
                  {config.midWeekProgress?.currentVigor.toLocaleString()} pts
                </span>
                <span className="text-[10px] text-slate-300">
                  ({DIAS_NOMBRES[config.midWeekProgress?.currentDayIdx ?? 5]})
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 text-xs font-bold transition-all border border-emerald-400/30"
                title="Modificar puntos actuales en pantalla"
              >
                <Edit3 className="w-3 h-3" />
                <span>Ajustar</span>
              </button>

              <button
                type="button"
                onClick={handleResetCalibration}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                title="Volver a proyección teórica de toda la semana"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-sky-500/25 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Ajustar a Hoy en Juego 🎮</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Calibration Drawer (Accordion / Collapsible) */}
      {isDrawerOpen && (
        <div className="bg-gradient-to-r from-[#0d2240] via-[#0f2a52] to-[#122849] border border-sky-400/40 rounded-3xl p-5 relative z-10 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-sky-300 uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-sky-400" />
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
                className="bg-[#061122] border border-sky-400/30 text-white text-xs font-bold rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-sky-400 focus:outline-none"
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
                className="w-44 bg-[#061122] border border-sky-400/30 text-sky-200 font-mono font-bold text-sm rounded-xl px-3 py-2 focus:ring-2 focus:ring-sky-400 focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSaveMidWeek(currentVigorInput, currentDayIdx)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-500/30 transition-all cursor-pointer"
            >
              {saveStatus ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{saveStatus || 'Aplicar y Proyectar'}</span>
            </button>

            {isCalibrated && (
              <button
                type="button"
                onClick={handleResetCalibration}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
              >
                Quitar Calibración
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Hero Card: Rango Estimado + Estimación por Rango de tanto a tanto */}
      <div className="poke-card p-5 sm:p-6 relative overflow-hidden border border-sky-400/25 shadow-xl shadow-[#040c17]/50 space-y-5">
        {/* Soft sapphire ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge & Island */}
        <div className="flex items-center justify-between gap-2 flex-wrap relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
              isCalibrated
                ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30 shadow-sm'
                : 'bg-sky-500/20 text-sky-200 border-sky-400/30'
            }`}>
              {isCalibrated
                ? '🟢 PREDICCIÓN CALIBRADA EN VIVO'
                : 'PROYECCIÓN ESTIMADA (SEMANA COMPLETA)'}
            </span>
            <span className="text-xs text-slate-300 font-mono bg-[#08182c]/80 border border-sky-400/20 px-3 py-0.5 rounded-full font-bold">
              🏝️ Isla: <span className="text-white capitalize font-black">{islaId.replace('_', ' ')}</span>
            </span>
          </div>

          {isCalibrated && (
            <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/60 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
              Actualizado: {formatUpdateDate(config.midWeekProgress?.updatedAt)}
            </span>
          )}
        </div>

        {/* Primary Hero Display: Pokeball + Main Expected Rank + Points */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={getRankPokeballUrl(estadoRangoFinal.rangoActual)}
              alt={estadoRangoFinal.rangoActual}
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] flex-shrink-0"
            />
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {estadoRangoFinal.rangoActual}
                </h2>
              </div>
              <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-sky-300 font-black text-lg">
                  ~{vigorFinalSemana.toLocaleString()} pts
                </span>
                <span className="text-slate-400">acumulados al cerrar el domingo</span>
              </div>
            </div>
          </div>

          {/* Distance to next rank badge */}
          <div className="bg-[#08182c]/90 border border-sky-400/20 rounded-2xl px-4 py-2.5 self-start sm:self-auto text-left sm:text-right shadow-inner">
            <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
              {estadoRangoFinal.siguienteRango ? 'Próximo Rango' : 'Techo de la Isla'}
            </span>
            <span className="text-xs sm:text-sm font-black text-sky-200 font-mono">
              {estadoRangoFinal.siguienteRango
                ? `${estadoRangoFinal.siguienteRango} (faltan ${estadoRangoFinal.vigorFaltanteSiguiente.toLocaleString()} pts)`
                : 'Máster 20 completado'}
            </span>
          </div>
        </div>

        {/* ESTiMACIÓN POR RANGO (Tanto a Tanto) - Solicitation from User */}
        <div className="relative z-10 rounded-2xl bg-[#08182d]/90 border border-sky-400/30 p-4 sm:p-5 shadow-inner">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sky-400" />
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Estimación por Rango de Rendimiento
              </h4>
            </div>
            <div className="text-[11px] text-slate-300 font-mono">
              Rango de Vigor:{' '}
              <strong className="text-white font-bold">{vigorMinSemana.toLocaleString()}</strong> ~{' '}
              <strong className="text-white font-bold">{vigorMaxSemana.toLocaleString()} pts</strong>
            </div>
          </div>

          {/* 3 Scenarios Cards: Mínimo / Esperado / Máximo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Scenario 1: Mínimo Seguro */}
            <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-slate-400" />
                    Mínimo Garantizado
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                    Sin Críticos
                  </span>
                </div>
                <div className="text-sm font-black text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <span>{estadoRangoMin.rangoActual}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  {vigorMinSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                Peor escenario: 0 comidas ¡Riquísimo! y baja activación de habilidades.
              </p>
            </div>

            {/* Scenario 2: Esperado / Promedio */}
            <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-400/40 flex flex-col justify-between ring-1 ring-sky-400/20 shadow-md">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-sky-400" />
                    Más Probable (Objetivo)
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-200 font-bold font-mono">
                    Promedio
                  </span>
                </div>
                <div className="text-base font-black text-white flex items-center gap-1.5 mt-0.5">
                  <span>{estadoRangoFinal.rangoActual}</span>
                </div>
                <div className="text-xs text-sky-300 font-mono font-bold mt-0.5">
                  ~{vigorFinalSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-sky-200/80 mt-2 leading-tight">
                Ritmo normal: probabilidad estándar (10% Lun–Sáb y 30% Súper Domingo).
              </p>
            </div>

            {/* Scenario 3: Techo Optimista */}
            <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-400/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                    <Rocket className="w-3 h-3 text-indigo-400" />
                    Techo con Críticos
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-200 font-mono">
                    ¡Riquísimo!
                  </span>
                </div>
                <div className="text-sm font-black text-indigo-100 flex items-center gap-1.5 mt-0.5">
                  <span>{estadoRangoMax.rangoActual}</span>
                </div>
                <div className="text-xs text-indigo-300 font-mono mt-0.5">
                  hasta {vigorMaxSemana.toLocaleString()} pts
                </div>
              </div>
              <p className="text-[10px] text-indigo-300/80 mt-2 leading-tight">
                Mejor escenario: varios ¡Riquísimo! en el puchero y alto RNG de habilidades.
              </p>
            </div>
          </div>

          {/* Dynamic precision note */}
          <div className="mt-3 pt-2.5 border-t border-sky-400/15 flex items-center justify-between text-[11px] text-slate-300">
            {isCalibrated ? (
              <span className="flex items-center gap-1.5 text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>
                  <strong>Margen estrecho de alta precisión:</strong> Ya transcurrieron {pastDaysCount} días en tu partida, por lo que el rango solo varía por la producción restante.
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <span>
                  <strong>Margen de 7 días completos:</strong> Puedes presionar <em>"Ajustar a Hoy en Juego"</em> arriba para fijar tus puntos reales y predecir con exactitud milimétrica.
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Progress bar towards next rank */}
        <div className="bg-[#08182c]/90 border border-sky-400/20 rounded-2xl p-3.5 sm:p-4 shadow-inner relative z-10">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
            <span className="text-[11px] text-slate-300">
              Progreso hacia <strong className="text-white">{estadoRangoFinal.siguienteRango || 'Máster 20'}</strong>
            </span>
            <span className="text-sky-300 font-black font-mono">
              {estadoRangoFinal.porcentajeProgresoSiguiente.toFixed(0)}%
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-950/80 border border-sky-400/25 p-0.5 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(56,189,248,0.6)]"
              style={{ width: `${Math.min(100, Math.max(3, estadoRangoFinal.porcentajeProgresoSiguiente))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
            <span>Base: {estadoRangoFinal.vigorBaseRangoActual.toLocaleString()} pts</span>
            {estadoRangoFinal.siguienteRango && (
              <span>Meta: {(estadoRangoFinal.vigorActual + estadoRangoFinal.vigorFaltanteSiguiente).toLocaleString()} pts</span>
            )}
          </div>
        </div>
      </div>

      {/* Daily Timeline (Lunes a Domingo) */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Línea Temporal de la Semana (Día a Día)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {isCalibrated && pastDaysCount > 0 && (
              <button
                type="button"
                onClick={() => setHidePastDays(!hidePastDays)}
                className="text-xs px-2.5 py-1 rounded-lg bg-[#08182c] border border-sky-400/20 text-slate-300 hover:text-white"
              >
                {hidePastDays ? `Mostrar Días Pasados (${pastDaysCount})` : 'Ocultar Pasados'}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#08182c]/90 hover:bg-sky-500/20 border border-sky-400/20 text-xs font-bold text-sky-300 hover:text-white transition-all shadow-sm"
            >
              <span>{isTimelineExpanded ? 'Ocultar Días' : 'Ver Días'}</span>
              {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Expanded 7-day grid */}
        {isTimelineExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {timelineDias
              .filter(dia => !(hidePastDays && dia.esPasado))
              .map((dia) => {
                const rankTheme = getRankTheme(dia.rangoAlcanzado);

                return (
                  <div
                    key={dia.diaIdx}
                    className={`rounded-2xl p-3.5 flex flex-col justify-between border transition-all shadow-md relative overflow-hidden group ${
                      dia.esDomingo
                        ? 'bg-gradient-to-b from-[#14325a] via-[#0c2444] to-[#08182c] border-sky-400/40 shadow-sky-950/40'
                        : dia.esHoy
                        ? 'bg-[#0e2a4f] border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg'
                        : dia.esPasado
                        ? 'bg-[#081324]/80 border-slate-800 opacity-75'
                        : 'bg-[#0c2444]/75 border-sky-400/15 hover:border-sky-400/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-black ${
                          dia.esDomingo ? 'text-sky-200' : dia.esHoy ? 'text-emerald-300' : dia.esPasado ? 'text-slate-400' : 'text-slate-200'
                        }`}>
                          {dia.diaNombre}
                        </span>
                        {dia.esDomingo && (
                          <span className="text-[8px] bg-sky-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shadow-sm">
                            2x Olla
                          </span>
                        )}
                        {dia.esHoy && (
                          <span className="text-[8px] bg-emerald-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shadow-sm">
                            Hoy
                          </span>
                        )}
                        {dia.esPasado && (
                          <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            Hecho
                          </span>
                        )}
                      </div>

                      {/* Vigor Ganado Hoy */}
                      <div className={`text-[11px] font-mono font-black ${dia.esPasado ? 'text-slate-400' : 'text-sky-300'}`}>
                        +{dia.vigorGanadoDia.toLocaleString()} pts
                      </div>

                      {/* Vigor Acumulado Fin Dia */}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Total: {dia.vigorAcumuladoFinDia.toLocaleString()}
                      </div>
                    </div>

                    {/* Rango al final del día */}
                    <div className="mt-3 pt-2 border-t border-sky-400/15 flex items-center justify-center gap-1.5">
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

      {/* Production rhythm & island objectives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
        {/* Card 1: Ritmo Diario de Producción */}
        <div className="bg-[#0c2444]/80 border border-sky-400/20 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-sky-400" />
            <h5 className="text-xs font-black text-white uppercase tracking-wider">
              Ritmo de Producción del Equipo
            </h5>
          </div>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-sky-400/15">
              <div>
                <span className="font-bold text-white">Lunes a Sábado:</span>
                <span className="block text-[11px] text-slate-400">Puchero estándar ({config.potSize} ingr.)</span>
              </div>
              <span className="font-mono font-black text-sky-300">
                ~{vigorDiaNormal.toLocaleString()} pts/día
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-sky-950/60 border border-sky-400/30">
              <div>
                <span className="font-black text-sky-200">Súper Domingo:</span>
                <span className="block text-[11px] text-sky-300/80">
                  Puchero doble ({config.goodCampTicket ? '118 ingr.' : `${config.potSize * 2} ingr.`}) y más ¡Riquísimo!
                </span>
              </div>
              <span className="font-mono font-black text-cyan-300">
                ~{vigorDiaDomingo.toLocaleString()} pts
              </span>
            </div>

            <div className="text-[11px] text-slate-300 pt-1 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span>
                El domingo suma <strong className="text-sky-300 font-bold">{Math.round((vigorDiaDomingo / (vigorDiaNormal * 6 + vigorDiaDomingo)) * 100)}%</strong> del vigor de toda la semana gracias a la olla doble.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Objetivos de la Isla */}
        <div className="bg-[#0c2444]/80 border border-sky-400/20 rounded-2xl p-4 sm:p-5 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-sky-400" />
              <h5 className="text-xs font-black text-white uppercase tracking-wider">
                Objetivos de la Semana en la Isla
              </h5>
            </div>
          </div>

          <div className="space-y-2">
            {/* Incienso Semanal */}
            {(() => {
              const hitoIncienso = hitosClave.find(h => h.indiceRango === 17); // Máster 3
              return (
                <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-indigo-950/40 border border-indigo-400/30 text-xs">
                  <div className="flex items-center gap-2">
                    {hitoIncienso?.alcanzable ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Clock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-white">Incienso Semanal (Máster 3)</span>
                      <span className="block text-[10px] text-indigo-300/80">Recompensa fija de la isla</span>
                    </div>
                  </div>
                  <span className={`font-mono font-bold text-xs ${hitoIncienso?.alcanzable ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {hitoIncienso?.alcanzable ? `Alcanzado el ${hitoIncienso.diaAlcanzado}` : `Faltan ${hitoIncienso?.vigorFaltante?.toLocaleString()} pts`}
                  </span>
                </div>
              );
            })()}

            {/* Rango Final */}
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-sky-950/40 border border-sky-400/25 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-white">Rango Proyectado</span>
                  <span className="block text-[10px] text-slate-400">Al cerrar el Domingo</span>
                </div>
              </div>
              <span className="font-mono font-black text-sky-300 text-xs">
                {estadoRangoFinal.rangoActual}
              </span>
            </div>

            {/* Siguiente Escalón */}
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <div>
                  <span className="font-bold text-slate-200">
                    {estadoRangoFinal.siguienteRango ? `Hacia ${estadoRangoFinal.siguienteRango}` : 'Techo de la Isla'}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {estadoRangoFinal.siguienteRango ? 'Vigor pendiente' : 'Máximo posible'}
                  </span>
                </div>
              </div>
              <span className="font-mono text-slate-300 text-xs">
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
