import React, { useState, useMemo } from 'react';
import { Pokemon, OptimizedTeamResult, SnorlaxConfig, MidWeekProgress } from '../types/pokemon';
import { getEffectivePotCapacity, evaluateTeam } from '../services/optimizer';
import { PokemonCard } from './PokemonCard';
import { getIngredientSpriteUrl, getDishImageUrl, getRankPokeballUrl, SpriteStyle } from '../services/pokeApiService';
import { Zap, Trophy, Utensils, Sparkles, Flame, ShieldAlert, ArrowRight, CheckCircle2, Swords, Star, LayoutGrid, Smartphone, Check } from 'lucide-react';
import { WeeklyRankProjectionView } from './WeeklyRankProjectionView';
import { proyectarSemanaEquipo } from '../services/weeklyProjector';

interface TeamOptimizerViewProps {
  results: OptimizedTeamResult[];
  config: SnorlaxConfig;
  allPokemons?: Pokemon[];
  onSetCurrentTeam?: (pokemonIds: string[], teamName?: string) => void;
  onUpdateMidWeekProgress?: (progress: MidWeekProgress) => void;
  onResetMidWeekProgress?: () => void;
  onEditPokemon?: (pokemon: any) => void;
  onOpenSimulator?: () => void;
  spriteStyle?: SpriteStyle;
  cardViewMode?: 'compact' | 'detailed';
  onCardViewModeChange?: (mode: 'compact' | 'detailed') => void;
}

export const TeamOptimizerView: React.FC<TeamOptimizerViewProps> = ({
  results,
  config,
  allPokemons = [],
  onSetCurrentTeam,
  onUpdateMidWeekProgress,
  onResetMidWeekProgress,
  onEditPokemon,
  onOpenSimulator,
  spriteStyle = 'sleep',
  cardViewMode,
  onCardViewModeChange
}) => {
  const [selectedRank, setSelectedRank] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('psm_selected_team_rank');
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed)) return parsed;
      }
    } catch {}
    return config.currentTeam?.pokemonIds && config.currentTeam.pokemonIds.length === 5 ? -1 : 0;
  });

  const handleSelectRank = (rank: number) => {
    setSelectedRank(rank);
    try {
      localStorage.setItem('psm_selected_team_rank', rank.toString());
    } catch {}
  };

  const [teamViewMode, setTeamViewMode] = useState<'compact' | 'detailed'>('compact');
  const effectiveViewMode = cardViewMode || teamViewMode;
  const [saveTeamStatus, setSaveTeamStatus] = useState<string | null>(null);

  // Helper to check if two teams have identical pokemon IDs
  const isSameTeam = (ids1: string[], ids2: string[]) => {
    if (ids1.length !== ids2.length || ids1.length === 0) return false;
    const set1 = new Set(ids1);
    return ids2.every(id => set1.has(id));
  };

  const currentTeamSavedIds = useMemo(() => {
    return config.currentTeam?.pokemonIds || [];
  }, [config.currentTeam]);

  // If the user has a saved currentTeam with 5 pokemon in their collection, resolve their Pokemon objects
  const savedInGameTeamPokemons = useMemo(() => {
    if (!config.currentTeam?.pokemonIds || allPokemons.length === 0) return [];
    return config.currentTeam.pokemonIds
      .map(id => allPokemons.find(p => p.id === id))
      .filter((p): p is Pokemon => p !== undefined);
  }, [config.currentTeam, allPokemons]);

  // Is this saved in-game team already one of the optimizer's recommendations?
  const inGameTeamMatchRank = useMemo(() => {
    if (currentTeamSavedIds.length === 0) return -1;
    return results.findIndex(res => isSameTeam(res.team.map(p => p.id), currentTeamSavedIds));
  }, [results, currentTeamSavedIds]);

  // Evaluate the saved in-game team if it's not already in results
  const customSavedTeamResult = useMemo(() => {
    if (savedInGameTeamPokemons.length < 5 || inGameTeamMatchRank !== -1) return null;
    return evaluateTeam(savedInGameTeamPokemons, config);
  }, [savedInGameTeamPokemons, inGameTeamMatchRank, config]);

  const isMidWeekCalibrated = Boolean(config.midWeekProgress?.isCalibrated && (config.midWeekProgress?.currentVigor ?? 0) > 0);
  const effectiveVigor = isMidWeekCalibrated ? (config.midWeekProgress?.currentVigor || 0) : 0;
  const effectiveDay = isMidWeekCalibrated ? (config.midWeekProgress?.currentDayIdx ?? 0) : 0;

  const customSavedTeamWeeklyProj = useMemo(() => {
    if (!customSavedTeamResult) return null;
    return proyectarSemanaEquipo(customSavedTeamResult.team, config, effectiveVigor, effectiveDay);
  }, [customSavedTeamResult, config, effectiveVigor, effectiveDay]);

  const weeklyProjections = useMemo(() => {
    return results.map(res => proyectarSemanaEquipo(res.team, config, effectiveVigor, effectiveDay));
  }, [results, config, effectiveVigor, effectiveDay]);

  if (!results || results.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-10 text-center my-6">
        <div className="text-5xl mb-3">😴</div>
        <h3 className="text-xl font-bold text-white mb-2">No se encontraron combinaciones</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Asegúrate de tener al menos 5 Pokémon en tu colección o ajusta los filtros para generar equipos óptimos.
        </p>
      </div>
    );
  }

  const currentResult: OptimizedTeamResult =
    selectedRank === -1 && customSavedTeamResult
      ? customSavedTeamResult
      : results[selectedRank] || results[0];

  const currentWeeklyProj =
    selectedRank === -1 && customSavedTeamWeeklyProj
      ? customSavedTeamWeeklyProj
      : weeklyProjections[selectedRank] || weeklyProjections[0];

  const isCurrentSelectionInGame =
    currentTeamSavedIds.length > 0 &&
    isSameTeam(currentResult.team.map(p => p.id), currentTeamSavedIds);

  const handleAssignCurrentTeam = () => {
    if (onSetCurrentTeam && currentResult) {
      const name = selectedRank === -1 ? 'Mi Equipo Actual' : `Equipo #${selectedRank + 1}`;
      onSetCurrentTeam(currentResult.team.map(p => p.id), name);
      setSaveTeamStatus('¡Asignado!');
      setTimeout(() => setSaveTeamStatus(null), 2500);
    }
  };

  return (
    <div className="space-y-6 my-6">
      {/* Team Rank Selector & Simulator Shortcut (Dreamy Frosted Segmented Pill Control) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-2xl p-1 rounded-full border border-white/10 overflow-x-auto max-w-full shadow-lg no-scrollbar">
          {/* Custom Saved Team Tab (if user has an in-game team distinct from recommendations) */}
          {customSavedTeamResult && (
            <button
              onClick={() => handleSelectRank(-1)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                selectedRank === -1
                  ? 'btn-dreamy-pearl shadow-[0_0_20px_rgba(255,255,255,0.4)] text-indigo-950'
                  : 'text-slate-200 hover:text-white hover:bg-white/10'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${selectedRank === -1 ? 'fill-current text-amber-500' : 'text-amber-300'}`} />
              <span>🎮 Mi Equipo Actual</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums ${
                selectedRank === -1 ? 'bg-indigo-950/15 text-indigo-950 font-black' : 'bg-white/10 text-purple-200'
              }`}>
                {customSavedTeamResult.totalDailyVigor.toLocaleString()}
                {customSavedTeamWeeklyProj && (
                  <span className="ml-1 opacity-90 hidden xs:inline">• {customSavedTeamWeeklyProj.estadoRangoFinal.rangoActual}</span>
                )}
              </span>
            </button>
          )}

          {/* AI Recommended Teams */}
          {results.map((res, idx) => {
            const wProj = weeklyProjections[idx];
            const isSelected = selectedRank === idx;
            const isThisInGame = currentTeamSavedIds.length > 0 && isSameTeam(res.team.map(p => p.id), currentTeamSavedIds);
            return (
              <button
                key={idx}
                onClick={() => handleSelectRank(idx)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'btn-dreamy-pearl shadow-[0_0_20px_rgba(255,255,255,0.4)] text-indigo-950'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-950' : 'text-purple-300'}`} />
                <span>Equipo #{idx + 1}</span>
                {isThisInGame && (
                  <span className="text-[9px] bg-amber-400/20 text-amber-200 border border-amber-300/30 px-1.5 py-0.2 rounded-full font-black flex items-center gap-0.5">
                    <span>⭐</span>
                    <span className="hidden sm:inline">En Juego</span>
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums ${
                  isSelected ? 'bg-indigo-950/15 text-indigo-950 font-black' : 'bg-white/10 text-purple-200'
                }`}>
                  {res.totalDailyVigor.toLocaleString()}
                  {wProj && (
                    <span className="ml-1 opacity-90 hidden xs:inline">• {wProj.estadoRangoFinal.rangoActual}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="btn-dreamy-ghost px-4 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0 shadow-sm"
          >
            <Swords className="w-3.5 h-3.5 text-purple-300" />
            <span>Laboratorio (Vs)</span>
          </button>
        )}
      </div>

      {/* Quick Projection & Score Summary Card (Dreamy Ethereal Glass Hero) */}
      <div className="glass-dreamy pokeball-watermark p-5 sm:p-6 rounded-[28px] relative overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(8,10,30,0.45)]">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none opacity-40" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Vigor Diario y Rango Semanal Estimado</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-display font-black text-[var(--text-heading)] tracking-tight">
                {currentResult.totalDailyVigor.toLocaleString()}
              </h2>
              <span className="text-[var(--text-creamy)] font-bold text-xs">pts / día</span>
            </div>

            {/* Luminous Sleep Wave Curve (Dreamy Ambient Sine Wave Graph) */}
            <div className="w-full max-w-md h-10 my-1 relative overflow-hidden">
              <svg viewBox="0 0 450 45" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                  <linearGradient id="dreamy-wave-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C4B5FD" stopOpacity="0.4" />
                    <stop offset="65%" stopColor="#818CF8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0" />
                  </linearGradient>
                  <filter id="wave-glow" x="-10%" y="-10%" width="120%" height="120%">
                    <feGaussianBlur stdDeviation="2.5" result="glow" />
                    <feComposite in="SourceGraphic" in2="glow" operator="over" />
                  </filter>
                </defs>
                {/* Wave Gradient Area Fill */}
                <path
                  d="M 0 30 Q 60 8 120 25 T 240 18 T 360 25 T 450 14 L 450 45 L 0 45 Z"
                  fill="url(#dreamy-wave-grad)"
                />
                {/* Glowing Sinusoidal Stroke */}
                <path
                  d="M 0 30 Q 60 8 120 25 T 240 18 T 360 25 T 450 14"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  filter="url(#wave-glow)"
                  opacity="0.95"
                />
              </svg>
            </div>
          </div>

          {/* Projected Weekly Rank Badge with Master Ball Sprite */}
          {currentWeeklyProj && (
            <div className="inline-flex items-center gap-3.5 px-4 py-2.5 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 text-slate-100 text-xs font-bold shadow-lg self-start sm:self-auto">
              <img
                src={getRankPokeballUrl(currentWeeklyProj.estadoRangoFinal.rangoActual)}
                alt="Pokeball"
                className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-purple-200 block">
                    {isMidWeekCalibrated ? 'Predicción Calibrada en Vivo' : 'Rango Semanal Estimado'}
                  </span>
                  {isMidWeekCalibrated && (
                    <span className="whitespace-nowrap inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-200 font-bold border border-purple-400/30 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
                      <span>En Vivo</span>
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                  <span>{currentWeeklyProj.estadoRangoFinal.rangoActual}</span>
                  <span className="text-xs tabular-nums font-normal text-purple-200">
                    (~{currentWeeklyProj.vigorFinalSemana.toLocaleString()} pts)
                  </span>
                </div>
                <div className="text-[10px] text-purple-200/80 tabular-nums mt-0.5">
                  Rango: <span className="text-white font-semibold">{currentWeeklyProj.vigorMinSemana.toLocaleString()}</span> ~ <span className="text-white font-semibold">{currentWeeklyProj.vigorMaxSemana.toLocaleString()}</span> pts
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Breakdown Pills & In-Game Team Assignment Button */}
        <div className="mt-3 pt-3.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3.5 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-rose-200 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍒</span> Bayas: <strong className="tabular-nums text-white font-black">{currentResult.berryVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.berryVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-amber-200 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍲</span> Cocina: <strong className="tabular-nums text-white font-black">{currentResult.cookingVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.cookingVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-purple-200 text-[11px] font-bold flex items-center gap-1.5">
              <span>⚡</span> Skill: <strong className="tabular-nums text-white font-black">{currentResult.skillVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.skillVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCurrentSelectionInGame ? (
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-bold shadow-sm backdrop-blur-md">
                <CheckCircle2 className="w-4 h-4 text-indigo-300" />
                <span>✓ Tu Equipo Actual en Juego</span>
                {config.currentTeam?.updatedAt && (
                  <span className="text-[10px] text-indigo-200/80 tabular-nums hidden md:inline">
                    (Asignado {new Date(config.currentTeam.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={handleAssignCurrentTeam}
                className="btn-dreamy-ghost px-4 py-2 text-xs flex items-center gap-1.5 text-purple-200 hover:text-white border-white/15 hover:border-white/30"
                title="Establecer este equipo como el que tienes activo en tu partida de Pokémon Sleep"
              >
                {saveTeamStatus ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5 fill-current text-amber-300" />}
                <span>{saveTeamStatus || 'Establecer como mi Equipo en Juego ⭐'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* The 5 Chosen Pokemon (DIRECTLY UNDER THE PROJECTION - NO SCROLL NEEDED!) */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
              <span>🛡️</span>
              <span>Alineación Óptima de 5 Compañeros Pokémon</span>
            </h3>
            <span className="text-xs text-purple-200/70">
              Formato uniforme horizontal estilo Scarlet & Violet
            </span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-white/[0.08] backdrop-blur-xl p-1 rounded-full border border-white/10 self-start sm:self-auto shadow-sm">
            <button
              onClick={() => {
                setTeamViewMode('compact');
                onCardViewModeChange?.('compact');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                effectiveViewMode === 'compact'
                  ? 'btn-dreamy-pearl shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vista Rápida</span>
            </button>
            <button
              onClick={() => {
                setTeamViewMode('detailed');
                onCardViewModeChange?.('detailed');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                effectiveViewMode === 'detailed'
                  ? 'btn-dreamy-pearl shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista Detallada</span>
            </button>
          </div>
        </div>

        {/* Pokemon Cards Display */}
        {effectiveViewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {currentResult.team.map((poke, idx) => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                slotIndex={idx}
                isFavoriteBerry={config.favoriteBerries.includes(poke.berry)}
                onEdit={onEditPokemon}
                compact={true}
                spriteStyle={spriteStyle}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {currentResult.team.map((poke, idx) => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                slotIndex={idx}
                isFavoriteBerry={config.favoriteBerries.includes(poke.berry)}
                onEdit={onEditPokemon}
                compact={false}
                spriteStyle={spriteStyle}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detailed Meals & Filler Breakdown (Dreamy Kitchen & Ambient Cooking) */}
      <div className="glass-dreamy p-5 sm:p-6 rounded-[28px] border border-white/10 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-purple-300" />
            <h3 className="text-base font-display font-bold text-[var(--text-heading)]">
              Plan Culinario y Relleno de Puchero (3 Comidas al Día)
            </h3>
          </div>
          <span className="text-xs bg-white/[0.06] border border-white/10 px-3.5 py-1.5 rounded-full text-slate-200 flex items-center gap-1 tabular-nums font-bold">
            Capacidad: {getEffectivePotCapacity(config)}
            {config.goodCampTicket && <span className="text-amber-200 font-bold ml-1">🏕️ (+50%)</span>}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentResult.meals.map((meal) => (
            <div
              key={meal.mealIndex}
              className="glass-dreamy border border-white/10 rounded-[24px] p-4 flex flex-col justify-between shadow-lg hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                    {meal.mealName}
                  </span>
                  <span className="text-xs tabular-nums font-black text-amber-200/90">
                    +{meal.totalMealVigor.toLocaleString()} pts
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
                    <img
                      src={getDishImageUrl(meal.recipe.name)}
                      alt={meal.recipe.name}
                      loading="lazy"
                      className="w-full h-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fb = (e.target as HTMLElement).parentElement?.querySelector('.fallback-emoji');
                        if (fb) fb.classList.remove('hidden');
                      }}
                    />
                    <span className="fallback-emoji hidden text-xl">
                      {meal.recipe.type === 'curry' ? '🍲' : meal.recipe.type === 'salad' ? '🥗' : '☕'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">
                      {meal.recipe.name}
                    </h4>
                    <span className="text-[10px] text-purple-200 tabular-nums font-bold bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                      Nv. {meal.recipeLevel || 1}
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">
                      {meal.recipe.description}
                    </p>
                  </div>
                </div>

                {/* Recipe Ingredients (Icon Sprites with Floating Quantity Badges) */}
                <div className="mb-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Ingredientes Base</span>
                    <span className="text-[10px] text-purple-200/80 font-bold tabular-nums">
                      Total: {Object.values(meal.recipe.ingredients).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(meal.recipe.ingredients).map(([ing, count]) => (
                      <div
                        key={ing}
                        className="relative group/ing inline-flex items-center justify-center cursor-help"
                        title={`${ing} ×${count}`}
                      >
                        <div className="w-9 h-9 rounded-xl bg-white/[0.08] backdrop-blur-md p-1.5 flex items-center justify-center transition-transform hover:scale-110 shadow-sm">
                          <img
                            src={getIngredientSpriteUrl(ing)}
                            alt={ing}
                            className="w-full h-full object-contain filter drop-shadow-sm"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        </div>
                        <span className="absolute -top-1.5 -right-1.5 bg-indigo-950/90 text-white font-black text-[9px] px-1.5 py-0.2 rounded-full border border-white/20 shadow-md tabular-nums select-none">
                          ×{count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filler Ingredients (Icon Sprites with Floating Quantity Badges) */}
                {meal.fillerIngredients.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Relleno Adicional</span>
                      <span className="text-[10px] text-amber-200/90 font-bold tabular-nums">
                        +{meal.fillerVigor.toLocaleString()} pts
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {meal.fillerIngredients.map((fill) => (
                        <div
                          key={fill.name}
                          className="relative group/ing inline-flex items-center justify-center cursor-help"
                          title={`Relleno: ${fill.name} (+${fill.count})`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-purple-500/10 backdrop-blur-md p-1.5 flex items-center justify-center transition-transform hover:scale-110 shadow-sm">
                            <img
                              src={getIngredientSpriteUrl(fill.name)}
                              alt={fill.name}
                              className="w-full h-full object-contain filter drop-shadow-sm"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 bg-purple-900/90 text-purple-200 font-black text-[9px] px-1.5 py-0.2 rounded-full border border-purple-400/30 shadow-md tabular-nums select-none">
                            +{fill.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-[var(--text-muted)] flex items-center justify-between tabular-nums font-medium">
                <span>Base: {meal.recipeVigor.toLocaleString()}</span>
                <span>Relleno: {meal.fillerVigor.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Ingredients Production Strip (Icon Sprites with Floating Badges) */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">
            Producción Diaria Total de Ingredientes del Equipo
          </div>
          <div className="flex flex-wrap gap-2.5">
            {Object.entries(currentResult.dailyIngredientProduction)
              .sort((a, b) => b[1] - a[1])
              .map(([ing, count]) => (
                <div
                  key={ing}
                  className="relative group/ing inline-flex items-center justify-center cursor-help"
                  title={`${ing}: +${count}/día`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] backdrop-blur-md p-1.5 flex items-center justify-center hover:scale-110 transition-transform shadow-sm">
                    <img
                      src={getIngredientSpriteUrl(ing)}
                      alt={ing}
                      className="w-full h-full object-contain filter drop-shadow-sm"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 bg-indigo-950/90 text-white font-black text-[10px] px-1.5 py-0.2 rounded-full border border-white/20 shadow-md tabular-nums select-none">
                    +{count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Weekly Rank Projection & Timeline */}
      {currentResult && currentResult.team.length > 0 && (
        <WeeklyRankProjectionView
          equipo={currentResult.team}
          config={config}
          teamLabel={
            selectedRank === -1
              ? 'Mi Equipo Actual 🎮'
              : isCurrentSelectionInGame
              ? `Equipo #${selectedRank + 1} (En Juego ⭐)`
              : `Opción #${selectedRank + 1}`
          }
          onUpdateMidWeekProgress={onUpdateMidWeekProgress}
          onResetMidWeekProgress={onResetMidWeekProgress}
        />
      )}
    </div>
  );
};
