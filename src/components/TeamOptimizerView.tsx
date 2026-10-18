import React, { useState, useMemo } from 'react';
import { Pokemon, OptimizedTeamResult, SnorlaxConfig, MidWeekProgress } from '../types/pokemon';
import { getEffectivePotCapacity, evaluateTeam } from '../services/optimizer';
import { PokemonCard } from './PokemonCard';
import { getIngredientSpriteUrl, getDishImageUrl, getRankPokeballUrl } from '../services/pokeApiService';
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
  spriteStyle?: 'artwork' | 'showdown';
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
  spriteStyle = 'artwork'
}) => {
  const [selectedRank, setSelectedRank] = useState<number>(0);
  const [teamViewMode, setTeamViewMode] = useState<'compact' | 'detailed'>('compact');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 bg-[#091f3a] p-1 rounded-xl border border-sky-400/20 overflow-x-auto max-w-full">
          {/* Custom Saved Team Tab (if user has an in-game team distinct from recommendations) */}
          {customSavedTeamResult && (
            <button
              onClick={() => setSelectedRank(-1)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Trophy className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                <span>Equipo #{idx + 1}</span>
                {isThisInGame && (
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/40 px-1.5 py-0.2 rounded font-black flex items-center gap-0.5">
                    <span>⭐</span>
                    <span className="hidden sm:inline">En Juego</span>
                  </span>
                )}
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-sky-950/40 text-sky-100 font-black' : 'bg-white/5 text-slate-400'
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091f3a] hover:bg-sky-500/20 border border-sky-400/25 text-sky-300 hover:text-white text-xs font-bold transition-all shadow-sm self-start sm:self-auto flex-shrink-0"
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Laboratorio (Vs)</span>
          </button>
        )}
      </div>

      {/* Quick Projection & Score Summary Card */}
      <div className="poke-card p-4 sm:p-5 relative overflow-hidden border border-sky-400/25">
        {/* Soft sapphire blue ambient glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Vigor Diario y Rango Semanal Estimado</span>
            </div>
            <div className="flex items-baseline gap-3">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                {currentResult.totalDailyVigor.toLocaleString()}
              </h2>
              <span className="text-slate-400 font-bold text-xs">pts / día</span>
            </div>
          </div>

          {/* Projected Weekly Rank Badge with Master Ball Sprite */}
          {currentWeeklyProj && (
            <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-200 text-xs font-bold shadow-md shadow-sky-950/40 self-start sm:self-auto">
              <img
                src={getRankPokeballUrl(currentWeeklyProj.estadoRangoFinal.rangoActual)}
                alt="Pokeball"
                className="w-9 h-9 object-contain flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-sky-300 block">
                    {isMidWeekCalibrated ? '🟢 Predicción Calibrada en Vivo' : 'Rango Semanal Estimado'}
                  </span>
                  {isMidWeekCalibrated && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-400/30">
                      En Vivo
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-white flex items-center gap-1.5 flex-wrap">
                  <span>{currentWeeklyProj.estadoRangoFinal.rangoActual}</span>
                  <span className="text-xs font-mono font-normal text-sky-300/80">
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
        <div className="mt-3 pt-3 border-t border-sky-400/15 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍒</span> Bayas: <strong className="font-mono text-white font-black">{currentResult.berryVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.berryVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-sky-500/15 border border-sky-400/25 text-sky-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>🍲</span> Cocina: <strong className="font-mono text-white font-black">{currentResult.cookingVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.cookingVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-300 text-[11px] font-bold flex items-center gap-1.5">
              <span>⚡</span> Skill: <strong className="font-mono text-white font-black">{currentResult.skillVigorDaily.toLocaleString()}</strong> ({Math.round((currentResult.skillVigorDaily / currentResult.totalDailyVigor) * 100)}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCurrentSelectionInGame ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold shadow-sm">
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/25 active:scale-95"
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
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <span>🛡️</span>
              <span>Alineación Óptima de 5 Compañeros Pokémon</span>
            </h3>
            <span className="text-xs text-slate-400">
              Formato uniforme horizontal estilo Scarlet & Violet
            </span>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-[#091f3a] p-1 rounded-xl border border-sky-400/20 self-start sm:self-auto shadow-inner">
            <button
              onClick={() => setTeamViewMode('compact')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                teamViewMode === 'compact'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vista Rápida</span>
            </button>
            <button
              onClick={() => setTeamViewMode('detailed')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                teamViewMode === 'detailed'
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Vista Detallada</span>
            </button>
          </div>
        </div>

        {/* Pokemon Cards Display */}
        {teamViewMode === 'compact' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
            {currentResult.team.map((poke, idx) => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                slotIndex={idx}
                isFavoriteBerry={config.favoriteBerries.includes(poke.berry)}
                onEdit={onEditPokemon}
                compact={true}
                spriteStyle="showdown"
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
                spriteStyle="showdown"
              />
            ))}
          </div>
        )}
      </div>

      {/* Detailed Meals & Filler Breakdown */}
      <div className="poke-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-black text-white">
              Plan Culinario y Relleno de Puchero (3 Comidas al Día)
            </h3>
          </div>
          <span className="text-xs bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-slate-200 flex items-center gap-1 font-mono font-bold">
            Capacidad: {getEffectivePotCapacity(config)}
            {config.goodCampTicket && <span className="text-amber-400 font-bold ml-1">🏕️ (+50%)</span>}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentResult.meals.map((meal) => (
            <div
              key={meal.mealIndex}
              className="bg-[#0c2444]/80 border border-sky-400/20 rounded-2xl p-4 flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    {meal.mealName}
                  </span>
                  <span className="text-xs font-mono font-black text-sky-300">
                    +{meal.totalMealVigor.toLocaleString()} pts
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-sky-950/60 border border-sky-400/25 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
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
                    <h4 className="font-black text-white text-sm truncate">
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
                        className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#08182c]/90 text-slate-200 border border-sky-400/20 flex items-center gap-1 font-mono font-bold"
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

              <div className="mt-3 pt-2.5 border-t border-sky-400/15 text-[10px] text-slate-400 flex items-center justify-between font-mono">
                <span>Base: {meal.recipeVigor.toLocaleString()}</span>
                <span>Relleno: {meal.fillerVigor.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daily Ingredients Production Strip */}
        <div className="mt-5 pt-4 border-t border-sky-400/15">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Producción Diaria Total de Ingredientes del Equipo
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(currentResult.dailyIngredientProduction)
              .sort((a, b) => b[1] - a[1])
              .map(([ing, count]) => (
                <div
                  key={ing}
                  className="px-2.5 py-1.5 rounded-xl bg-[#08182c]/90 border border-sky-400/20 text-xs flex items-center gap-1.5"
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
