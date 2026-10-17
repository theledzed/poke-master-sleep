import React, { useState, useMemo } from 'react';
import { Pokemon, SnorlaxConfig } from '../types/pokemon';
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
  ChevronRight,
  Zap,
  Gift,
  HelpCircle,
  ArrowRight,
  Target,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface WeeklyRankProjectionViewProps {
  equipo: Pokemon[];
  config: SnorlaxConfig;
  teamLabel?: string;
  comparisonEquipo?: Pokemon[];
  comparisonLabel?: string;
}

const DIAS_NOMBRES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const WeeklyRankProjectionView: React.FC<WeeklyRankProjectionViewProps> = ({
  equipo,
  config,
  teamLabel = 'Tu Equipo',
  comparisonEquipo,
  comparisonLabel = 'Equipo Recomendado #1'
}) => {
  const [simulationMode, setSimulationMode] = useState<'full_week' | 'mid_week'>('full_week');
  const [currentVigorInput, setCurrentVigorInput] = useState<number>(0);
  const [currentDayIdx, setCurrentDayIdx] = useState<number>(5); // Default to Saturday (idx 5)
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);

  const islaId = useMemo(() => normalizeIslaId(config.island), [config.island]);

  // Full week projection
  const proyeccionSemana = useMemo(() => {
    if (equipo.length === 0) return null;
    return proyectarSemanaEquipo(equipo, config, 0, 0);
  }, [equipo, config]);

  // Mid-week projection
  const proyeccionMidWeek = useMemo(() => {
    if (equipo.length === 0) return null;
    return proyectarSemanaEquipo(equipo, config, currentVigorInput || 0, currentDayIdx);
  }, [equipo, config, currentVigorInput, currentDayIdx]);

  // Optional comparison projection
  const proyeccionComparison = useMemo(() => {
    if (!comparisonEquipo || comparisonEquipo.length === 0) return null;
    return proyectarSemanaEquipo(comparisonEquipo, config, 0, 0);
  }, [comparisonEquipo, config]);

  const activeProyeccion = simulationMode === 'full_week' ? proyeccionSemana : proyeccionMidWeek;

  if (!activeProyeccion || equipo.length === 0) {
    return (
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 text-center text-slate-400 text-sm">
        Asigna al menos 1 compañero Pokémon para proyectar la curva semanal de rangos de Snorlax.
      </div>
    );
  }

  const { estadoRangoFinal, vigorFinalSemana, timelineDias, hitosClave, vigorDiaNormal, vigorDiaDomingo } = activeProyeccion;

  // Rank Theme palette - cozy, authentic Pokemon Sleep tiers (Sapphire palette)
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

  return (
    <div className="poke-card pokeball-watermark p-5 sm:p-6 space-y-6 relative overflow-hidden">
      {/* Top Header & Simulation Mode Selector */}
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
            Simula con exactitud la progresión día a día considerando el puchero normal (Lun–Sáb) y el{' '}
            <strong className="text-sky-300">Súper Domingo</strong> de puchero doble con más probabilidad de ¡Riquísimo!
          </p>
        </div>

        {/* Mode Switcher (Sleek Segmented Control) */}
        <div className="flex items-center gap-1 bg-[#0a1e35]/90 p-1 rounded-xl border border-sky-400/20 self-start md:self-auto text-xs shadow-inner">
          <button
            onClick={() => setSimulationMode('full_week')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
              simulationMode === 'full_week'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Semana Completa (Lun–Dom)
          </button>
          <button
            onClick={() => setSimulationMode('mid_week')}
            className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all ${
              simulationMode === 'mid_week'
                ? 'bg-sky-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Ajustar a Hoy en Juego 🎮
          </button>
        </div>
      </div>

      {/* Mid-Week Input Bar (if active) */}
      {simulationMode === 'mid_week' && (
        <div className="bg-[#0c2444]/90 border border-sky-400/25 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 shadow-inner">
          <div className="flex-1">
            <span className="text-xs font-black text-sky-300 uppercase tracking-wider block mb-1">
              ¿Cuánto Vigor tiene tu Snorlax en este momento?
            </span>
            <p className="text-xs text-slate-200">
              Ingresa los puntos que ves en la pantalla de tu juego para proyectar exactamente hasta qué rango llegarás el domingo por la noche.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Día Actual</label>
              <select
                value={currentDayIdx}
                onChange={(e) => setCurrentDayIdx(parseInt(e.target.value, 10))}
                className="bg-[#080C16] border border-sky-400/25 text-white text-xs font-bold rounded-full px-4 py-2 focus:ring-1 focus:ring-sky-400 focus:outline-none"
              >
                {DIAS_NOMBRES.map((d, idx) => (
                  <option key={idx} value={idx} className="bg-slate-900">
                    {d} {idx === 5 ? '(Hoy Sábado)' : idx === 6 ? '(Domingo)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 font-bold mb-1">Puntos en tu Pantalla</label>
              <input
                type="number"
                value={currentVigorInput || ''}
                onChange={(e) => setCurrentVigorInput(Math.max(0, parseInt(e.target.value, 10) || 0))}
                placeholder="Ej. 185000"
                className="w-36 bg-[#080C16] border border-sky-400/25 text-sky-300 font-mono font-bold text-xs rounded-full px-4 py-2 focus:ring-1 focus:ring-sky-400 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Hero Rank Badge & Sleek Horizontal Progress */}
      <div className="poke-card p-5 sm:p-6 relative overflow-hidden border border-sky-400/25 shadow-xl shadow-[#040c17]/50">
        {/* Soft sapphire blue ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          {/* Top row: Pill & Island */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider bg-sky-500/20 text-sky-200 border border-sky-400/30">
              {simulationMode === 'full_week' ? 'RANGO ESPERADO AL CIERRE SEMANAL' : 'PREDICCIÓN PARA MAÑANA DOMINGO'}
            </span>
            <span className="text-xs text-slate-300 font-mono bg-[#08182c]/80 border border-sky-400/20 px-3 py-0.5 rounded-full font-bold">
              🏝️ Isla: <span className="text-white capitalize font-black">{islaId.replace('_', ' ')}</span>
            </span>
          </div>

          {/* Main Info: Pokeball + Rank Name + Points */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <img
                src={getRankPokeballUrl(estadoRangoFinal.rangoActual)}
                alt={estadoRangoFinal.rangoActual}
                className="w-12 h-12 sm:w-14 sm:h-14 object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.6)] flex-shrink-0"
              />
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>{estadoRangoFinal.rangoActual}</span>
                </h2>
                <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 mt-0.5">
                  <span className="text-sky-300 font-black text-lg">
                    {vigorFinalSemana.toLocaleString()} pts
                  </span>
                  <span className="text-slate-400">acumulados al cerrar el domingo</span>
                </div>
              </div>
            </div>

            {/* Target & Distance badge */}
            <div className="bg-[#08182c]/80 border border-sky-400/20 rounded-xl px-4 py-2 self-start sm:self-auto text-left sm:text-right">
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

          {/* Sleek Horizontal Progress Bar (Fits mobile perfectly, impossible to glitch) */}
          <div className="bg-[#08182c]/90 border border-sky-400/20 rounded-2xl p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300 mb-1.5">
              <span className="text-[11px] text-slate-300">
                Progreso hacia <strong className="text-white">{estadoRangoFinal.siguienteRango || 'Máster 20'}</strong>
              </span>
              <span className="text-sky-300 font-black font-mono">
                {estadoRangoFinal.porcentajeProgresoSiguiente.toFixed(0)}%
              </span>
            </div>

            {/* Glowing bar track */}
            <div className="w-full h-3 rounded-full bg-slate-950/80 border border-sky-400/25 p-0.5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 transition-all duration-700 ease-out shadow-[0_0_8px_rgba(56,189,248,0.6)]"
                style={{ width: `${Math.min(100, Math.max(3, estadoRangoFinal.porcentajeProgresoSiguiente))}%` }}
              />
            </div>

            {/* Sub labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5">
              <span>Base: {estadoRangoFinal.vigorBaseRangoActual.toLocaleString()} pts</span>
              {estadoRangoFinal.siguienteRango && (
                <span>Meta: {(estadoRangoFinal.vigorActual + estadoRangoFinal.vigorFaltanteSiguiente).toLocaleString()} pts</span>
              )}
            </div>
          </div>
        </div>

        {/* Head-to-Head Comparison if comparisonEquipo provided */}
        {proyeccionComparison && (
          <div className="mt-5 pt-4 border-t border-sky-400/15 flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
            <div className="flex items-center gap-3">
              <span className="text-slate-300">Comparativa vs {comparisonLabel}:</span>
              <span className="font-bold text-sky-200 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/30">
                {proyeccionComparison.estadoRangoFinal.rangoActual} ({proyeccionComparison.vigorFinalSemana.toLocaleString()} pts)
              </span>
            </div>

            <div className="text-slate-200 font-bold">
              {vigorFinalSemana >= proyeccionComparison.vigorFinalSemana ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span>🚀</span> ¡Superas la recomendación por {(vigorFinalSemana - proyeccionComparison.vigorFinalSemana).toLocaleString()} pts semanales!
                </span>
              ) : (
                <span className="text-sky-300 flex items-center gap-1.5">
                  <span>💡</span> El recomendado proyecta +{(proyeccionComparison.vigorFinalSemana - vigorFinalSemana).toLocaleString()} pts más
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Daily Timeline (Lunes a Domingo) with Collapsible */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-sky-400" />
            <h4 className="text-sm font-black text-white uppercase tracking-wider">
              Línea Temporal de la Semana (Día a Día)
            </h4>
          </div>
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#08182c]/90 hover:bg-sky-500/20 border border-sky-400/20 text-xs font-bold text-sky-300 hover:text-white transition-all shadow-sm"
          >
            <span>{isTimelineExpanded ? 'Ocultar Días' : 'Ver Días (7)'}</span>
            {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsed summary strip */}
        {!isTimelineExpanded && (
          <div
            onClick={() => setIsTimelineExpanded(true)}
            className="cursor-pointer p-3.5 rounded-2xl bg-[#0c2444]/75 hover:bg-[#0c2444] border border-sky-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs transition-all shadow-sm"
          >
            <div className="flex items-center gap-2 text-slate-300 flex-wrap">
              <span className="font-bold text-white">7 días proyectados:</span>
              <span className="font-mono text-sky-300 font-bold">Lunes a Domingo</span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="text-slate-300">
                Cierre Domingo: <strong className="text-white font-black">{estadoRangoFinal.rangoActual}</strong> (~{vigorFinalSemana.toLocaleString()} pts)
              </span>
            </div>
            <span className="text-sky-300 text-xs font-bold flex items-center gap-1 flex-shrink-0">
              <span>Desplegar día a día</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </span>
          </div>
        )}

        {/* Expanded 7-day grid */}
        {isTimelineExpanded && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {timelineDias.map((dia) => {
              const isToday = simulationMode === 'mid_week' && dia.diaIdx === currentDayIdx;
              const rankTheme = getRankTheme(dia.rangoAlcanzado);

              return (
                <div
                  key={dia.diaIdx}
                  className={`rounded-2xl p-3.5 flex flex-col justify-between border transition-all shadow-md relative overflow-hidden group ${
                    dia.esDomingo
                      ? 'bg-gradient-to-b from-[#14325a] via-[#0c2444] to-[#08182c] border-sky-400/40 shadow-sky-950/40'
                      : isToday
                      ? 'bg-[#0e2a4f] border-sky-400 ring-2 ring-sky-400/30 shadow-lg'
                      : 'bg-[#0c2444]/75 border-sky-400/15 hover:border-sky-400/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-black ${dia.esDomingo ? 'text-sky-200' : isToday ? 'text-sky-300' : 'text-slate-200'}`}>
                        {dia.diaNombre}
                      </span>
                      {dia.esDomingo && (
                        <span className="text-[8px] bg-sky-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shadow-sm">
                          2x Olla
                        </span>
                      )}
                      {isToday && (
                        <span className="text-[8px] bg-sky-400 text-slate-950 px-1.5 py-0.2 rounded font-black uppercase tracking-wider shadow-sm">
                          Hoy
                        </span>
                      )}
                    </div>

                    {/* Vigor Ganado Hoy */}
                    <div className="text-[11px] text-sky-300 font-mono font-black">
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

      {/* Resumen Semanal & Metas Clave */}
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
