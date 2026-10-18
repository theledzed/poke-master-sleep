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
  const [selectedRank, setSelectedRank] = useState<number>(0);
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
      {/* Team Rank Selector & Simulator Shortcut (Pokemon GO Pill Style) */}
      {/* Team Rank Selector & Simulator Shortcut */}
      {/* Team Rank Selector & Simulator Shortcut */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 bg-[var(--surface-inner)] p-1.5 rounded-2xl border border-[var(--surface-border)] overflow-x-auto max-w-full shadow-inner">
          {/* Custom Saved Team Tab (if user has an in-game team distinct from recommendations) */}
          {customSavedTeamResult && (
            <button
              onClick={() => setSelectedRank(-1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedRank === -1
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'text-emerald-300 hover:text-white hover:bg-white/5 border border-emerald-500/30'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current text-amber-300" />
              <span>🎮 Mi Equipo Actual</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                selectedRank === -1 ? 'bg-emerald-950/40 text-emerald-100 font-black' : 'bg-white/5 text-emerald-300'
              }`}>
                {customSavedTeamResult.totalDailyVigor.toLocaleString()}
                {customSavedTeamWeeklyProj && (
                  <span className="ml-1 opacity-90">• {customSavedTeamWeeklyProj.estadoRangoFinal.rangoActual}</span>
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
                onClick={() => setSelectedRank(idx)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-[var(--accent-primary)] text-slate-950 font-black shadow-md shadow-[var(--accent-glow)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                <span>Equipo #{idx + 1}</span>
                {isThisInGame && (
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                    <span>⭐</span>
                    <span className="hidden sm:inline">En Juego</span>
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-mono ${
                  isSelected ? 'bg-black/20 text-slate-900 font-black' : 'bg-white/5 text-slate-400'
                }`}>
                  {res.totalDailyVigor.toLocaleString()}
                  {wProj && (
                    <span className="ml-1 opacity-90">• {wProj.estadoRangoFinal.rangoActual}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {onOpenSimulator && (
          <button
            onClick={onOpenSimulator}
            className="btn-cozy-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto flex-shrink-0"
          >
            <Swords className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Laboratorio (Vs)</span>
          </button>
        )}
      </div>

      {/* Quick Projection & Score Summary Card (Cozy Field Journal Header) */}
      <div className="cozy-card pokeball-watermark p-5 sm:p-6 rounded-3xl relative overflow-hidden border border-[var(--surface-border)]">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-glow)] rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Vigor Diario y Rango Semanal Estimado</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-display font-black text-[var(--text-heading)] tracking-tight">
                {currentResult.totalDailyVigor.toLocaleString()}
              </h2>
              <span className="text-slate-300 font-bold text-xs">pts / día</span>
            </div>
          </div>

          {/* Projected Weekly Rank Badge with Master Ball Sprite */}
          {currentWeeklyProj && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[var(--surface-inner)] border border-[var(--surface-border)] text-slate-100 text-xs font-bold shadow-md self-start sm:self-auto">
              <img
                src={getRankPokeballUrl(currentWeeklyProj.estadoRangoFinal.rangoActual)}
                alt="Pokeball"
                className="w-10 h-10 object-contain flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[var(--accent-primary)] block">
                    {isMidWeekCalibrated ? 'Predicción Calibrada en Vivo' : 'Rango Semanal Estimado'}
                  </span>
                  {isMidWeekCalibrated && (
                    <span className="whitespace-nowrap inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>En Vivo</span>
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                  <span>{currentWeeklyProj.estadoRangoFinal.rangoActual}</span>
                  <span className="text-xs font-mono font-normal text-slate-300">
                    (~{currentWeeklyProj.vigorFinalSemana.toLocaleString()} pts)
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 font-mono mt-0.5">
                  Rango: <span className="text-white font-semibold">{currentWeeklyProj.vigorMinSemana.toLocaleString()}</span> ~ <span className="text-white font-semibold">{currentWeeklyProj.vigorMaxSemana.toLocaleString()}</span> pts
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Breakdown Pills & In-Game Team Assignment Button */}
        <div className="mt-4 pt-3.5 border-t border-[var(--surface-border)] flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[var(--surface-inner)] border border-[var(--surface-border)] text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍒</span> Bayas: <strong className="font-mono text-white font-black">{currentResult.berryVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.berryVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--surface-inner)] border border-[var(--surface-border)] text-sky-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍲</span> Cocina: <strong className="font-mono text-white font-black">{currentResult.cookingVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.cookingVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--surface-inner)] border border-[var(--surface-border)] text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>⚡</span> Skill: <strong className="font-mono text-white font-black">{currentResult.skillVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.skillVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCurrentSelectionInGame ? (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>✓ Tu Equipo Actual en Juego</span>
                {config.currentTeam?.updatedAt && (
                  <span className="text-[10px] text-emerald-300/80 font-mono hidden md:inline">
                    (Asignado {new Date(config.currentTeam.updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })})
                  </span>
                )}
              </div>
            ) : (
              <button
                onClick={handleAssignCurrentTeam}
                className="btn-cozy-secondary px-4 py-2 text-xs flex items-center gap-1.5 text-amber-300 border-amber-400/30 hover:border-amber-400/60"
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
            <span className="text-xs text-slate-400">
              Formato uniforme horizontal estilo Scarlet & Violet
            </span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[var(--surface-inner)] p-1 rounded-2xl border border-[var(--surface-border)] self-start sm:self-auto shadow-inner">
            <button
              onClick={() => {
                setTeamViewMode('compact');
                onCardViewModeChange?.('compact');
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                effectiveViewMode === 'compact'
                  ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-md shadow-[var(--accent-glow)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
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
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                effectiveViewMode === 'detailed'
                  ? 'bg-[var(--accent-primary)] text-slate-950 font-bold shadow-md shadow-[var(--accent-glow)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
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

      {/* Detailed Meals & Filler Breakdown (Cozy Field Kitchen Journal) */}
      <div className="cozy-card p-5 sm:p-6 rounded-3xl border border-[var(--surface-border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-display font-bold text-[var(--text-heading)]">
              Plan Culinario y Relleno de Puchero (3 Comidas al Día)
            </h3>
          </div>
          <span className="text-xs bg-[var(--surface-inner)] border border-[var(--surface-border)] px-3.5 py-1.5 rounded-full text-slate-200 flex items-center gap-1 font-mono font-bold">
            Capacidad: {getEffectivePotCapacity(config)}
            {config.goodCampTicket && <span className="text-amber-400 font-bold ml-1">🏕️ (+50%)</span>}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentResult.meals.map((meal) => (
            <div
              key={meal.mealIndex}
              className="bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-2xl p-4 flex flex-col justify-between shadow-md hover:border-white/20 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                    {meal.mealName}
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--accent-primary)]">
                    +{meal.totalMealVigor.toLocaleString()} pts
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-black/30 border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
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
                    <span className="text-[10px] text-amber-300 font-mono font-black bg-amber-400/15 border border-amber-400/30 px-2 py-0.5 rounded-full inline-block mt-0.5">
                      Nv. {meal.recipeLevel || 1}
                    </span>
                    <p className="text-[11px] text-slate-300 line-clamp-1 mt-1">
                      {meal.recipe.description}
                    </p>
                  </div>
                </div>

                {/* Recipe Ingredients */}
                <div className="mb-2">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                    Ingredientes Base ({Object.values(meal.recipe.ingredients).reduce((a, b) => a + b, 0)})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(meal.recipe.ingredients).map(([ing, count]) => (
                      <span
                        key={ing}
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-black/25 text-slate-200 border border-white/10 flex items-center gap-1 font-mono font-bold"
                      >
                        <img
                          src={getIngredientSpriteUrl(ing)}
                          alt={ing}
                          className="w-3.5 h-3.5 object-contain"
                        />
                        <span>{ing} ×{count}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Filler */}
                {meal.fillerIngredients.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                      Relleno Adicional (+{meal.fillerVigor.toLocaleString()} pts)
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {meal.fillerIngredients.map((fill) => (
                        <span
                          key={fill.name}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center gap-1 font-medium"
                        >
                          <img
                            src={getIngredientSpriteUrl(fill.name)}
                            alt={fill.name}
                            className="w-3.5 h-3.5 object-contain"
                          />
                          <span>+{fill.name} ×{fill.count}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>Base: {meal.recipeVigor.toLocaleString()}</span>
                <span>Relleno: {meal.fillerVigor.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Ingredients Production Strip */}
        <div className="mt-5 pt-4 border-t border-[var(--surface-border)]">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Producción Diaria Total de Ingredientes del Equipo
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentResult.dailyIngredientProduction)
              .sort((a, b) => b[1] - a[1])
              .map(([ing, count]) => (
                <div
                  key={ing}
                  className="px-2.5 py-1.5 rounded-xl bg-[var(--surface-inner)] border border-[var(--surface-border)] text-xs flex items-center gap-1.5"
                >
                  <img
                    src={getIngredientSpriteUrl(ing)}
                    alt={ing}
                    className="w-4 h-4 object-contain"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                  <span className="text-slate-300">{ing}:</span>
                  <span className="font-bold text-amber-400 font-mono">+{count}</span>
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
