import React, { useState, useMemo, useEffect } from 'react';
import { Pokemon, SnorlaxConfig, OptimizedTeamResult, Specialty, MidWeekProgress } from '../types/pokemon';
import { evaluateTeam, getEffectivePotCapacity } from '../services/optimizer';
import { PokemonCard } from './PokemonCard';
import {
  getPokemonArtworkUrl,
  getBerrySpriteUrl,
  getIngredientSpriteUrl,
  getDishImageUrl,
  getMainSkillMeta,
  getPokemonCanonicalSkill,
  getTypeTheme,
  isSpecialPokemon,
  SpriteStyle
} from '../services/pokeApiService';
import { BERRIES, INGREDIENTS, DISH_LEVEL_BONUS } from '../data/gameData';
import {
  Swords,
  Trophy,
  Utensils,
  Zap,
  Sparkles,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Filter,
  X,
  Scale,
  HeartHandshake,
  TrendingUp,
  TrendingDown,
  Info,
  Star,
  Download,
  Check
} from 'lucide-react';
import { WeeklyRankProjectionView } from './WeeklyRankProjectionView';
import { proyectarSemanaEquipo } from '../services/weeklyProjector';

interface TeamSimulatorViewProps {
  pokemons: Pokemon[];
  config: SnorlaxConfig;
  recommendedResult?: OptimizedTeamResult;
  spriteStyle?: SpriteStyle;
  onEditPokemon?: (pokemon: Pokemon) => void;
  onUpdateRecipeLevel?: (recipeName: string, level: number) => void;
  onUpdateAreaBonus?: (bonus: number) => void;
  onToggleGoodCampTicket?: () => void;
  onSetCurrentTeam?: (pokemonIds: string[], teamName?: string) => void;
  onUpdateMidWeekProgress?: (progress: MidWeekProgress) => void;
  onResetMidWeekProgress?: () => void;
}

const STORAGE_KEY_CUSTOM_TEAMS = 'sleep_master_custom_teams_v1';

export const TeamSimulatorView: React.FC<TeamSimulatorViewProps> = ({
  pokemons,
  config,
  recommendedResult,
  spriteStyle = 'showdown',
  onEditPokemon,
  onUpdateRecipeLevel,
  onUpdateAreaBonus,
  onToggleGoodCampTicket,
  onSetCurrentTeam,
  onUpdateMidWeekProgress,
  onResetMidWeekProgress
}) => {
  // Store team slot IDs (up to 5 each)
  const [activeCustomTeamIndex, setActiveCustomTeamIndex] = useState<0 | 1>(0);
  const [team1Ids, setTeam1Ids] = useState<(string | null)[]>([null, null, null, null, null]);
  const [team2Ids, setTeam2Ids] = useState<(string | null)[]>([null, null, null, null, null]);

  // Picker modal state
  const [pickerSlotIndex, setPickerSlotIndex] = useState<number | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerSpecialty, setPickerSpecialty] = useState<string>('all');
  const [pickerOnlyFavorites, setPickerOnlyFavorites] = useState(false);
  const [pickerSort, setPickerSort] = useState<'level' | 'rp' | 'speed' | 'name'>('level');

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_TEAMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.team1)) setTeam1Ids(parsed.team1);
        if (Array.isArray(parsed.team2)) setTeam2Ids(parsed.team2);
      }
    } catch (e) {
      console.error('Error loading custom teams', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_CUSTOM_TEAMS,
        JSON.stringify({ team1: team1Ids, team2: team2Ids })
      );
    } catch (e) {
      console.error('Error saving custom teams', e);
    }
  }, [team1Ids, team2Ids]);

  const currentTeamIds = activeCustomTeamIndex === 0 ? team1Ids : team2Ids;
  const setCurrentTeamIds = activeCustomTeamIndex === 0 ? setTeam1Ids : setTeam2Ids;

  // Resolve Pokemon objects from IDs
  const pokemonMap = useMemo(() => {
    const map = new Map<string, Pokemon>();
    for (const p of pokemons) {
      map.set(p.id, p);
    }
    return map;
  }, [pokemons]);

  const currentTeamPokemons = useMemo(() => {
    return currentTeamIds
      .map(id => (id ? pokemonMap.get(id) || null : null))
      .filter((p): p is Pokemon => p !== null);
  }, [currentTeamIds, pokemonMap]);

  // Evaluate Custom Team
  const customEvaluation = useMemo(() => {
    if (currentTeamPokemons.length === 0) return null;
    return evaluateTeam(currentTeamPokemons, config);
  }, [currentTeamPokemons, config]);

  const isMidWeekCalibrated = Boolean(config.midWeekProgress?.isCalibrated && (config.midWeekProgress?.currentVigor ?? 0) > 0);
  const effectiveVigor = isMidWeekCalibrated ? (config.midWeekProgress?.currentVigor || 0) : 0;
  const effectiveDay = isMidWeekCalibrated ? (config.midWeekProgress?.currentDayIdx ?? 0) : 0;

  // Weekly projections (including Sunday x2 pot and 30% x3 extra tasty)
  const customWeeklyProj = useMemo(() => {
    if (currentTeamPokemons.length === 0) return null;
    return proyectarSemanaEquipo(currentTeamPokemons, config, effectiveVigor, effectiveDay);
  }, [currentTeamPokemons, config, effectiveVigor, effectiveDay]);

  const recommendedWeeklyProj = useMemo(() => {
    if (!recommendedResult || !recommendedResult.team || recommendedResult.team.length === 0) return null;
    return proyectarSemanaEquipo(recommendedResult.team, config, effectiveVigor, effectiveDay);
  }, [recommendedResult, config, effectiveVigor, effectiveDay]);

  // Handle slot assignment
  const handleSelectPokemonForSlot = (pokemonId: string) => {
    if (pickerSlotIndex === null) return;
    const newIds = [...currentTeamIds];
    newIds[pickerSlotIndex] = pokemonId;
    setCurrentTeamIds(newIds);
    setPickerSlotIndex(null);
  };

  const handleRemoveFromSlot = (index: number) => {
    const newIds = [...currentTeamIds];
    newIds[index] = null;
    setCurrentTeamIds(newIds);
  };

  const handleClearTeam = () => {
    setCurrentTeamIds([null, null, null, null, null]);
  };

  // Copy recommended team into current custom team slot
  const handleCopyRecommended = () => {
    if (!recommendedResult || !recommendedResult.team) return;
    const recIds = recommendedResult.team.map(p => p.id);
    const padded = [
      recIds[0] || null,
      recIds[1] || null,
      recIds[2] || null,
      recIds[3] || null,
      recIds[4] || null
    ];
    setCurrentTeamIds(padded);
  };

  const [saveTeamStatus, setSaveTeamStatus] = useState<string | null>(null);

  const isSameTeam = (ids1: string[], ids2: string[]) => {
    if (ids1.length !== ids2.length || ids1.length === 0) return false;
    const set1 = new Set(ids1);
    return ids2.every(id => set1.has(id));
  };

  const isCurrentCustomTeamInGame = useMemo(() => {
    if (!config.currentTeam?.pokemonIds || currentTeamPokemons.length !== 5) return false;
    return isSameTeam(currentTeamPokemons.map(p => p.id), config.currentTeam.pokemonIds);
  }, [config.currentTeam, currentTeamPokemons]);

  const handleLoadCurrentTeam = () => {
    if (!config.currentTeam?.pokemonIds) return;
    const ids = config.currentTeam.pokemonIds;
    const padded = [
      ids[0] || null,
      ids[1] || null,
      ids[2] || null,
      ids[3] || null,
      ids[4] || null
    ];
    setCurrentTeamIds(padded);
  };

  const handleSaveAsCurrentTeam = () => {
    if (!onSetCurrentTeam || currentTeamPokemons.length === 0) return;
    onSetCurrentTeam(
      currentTeamPokemons.map(p => p.id),
      activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'
    );
    setSaveTeamStatus('¡Asignado en Juego!');
    setTimeout(() => setSaveTeamStatus(null), 2500);
  };

  // Filtered list for Pokemon Picker
  const pickerList = useMemo(() => {
    return pokemons
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(pickerSearch.toLowerCase());
        const matchesSpec = pickerSpecialty === 'all' || p.specialty === pickerSpecialty;
        const matchesFav = !pickerOnlyFavorites || config.favoriteBerries.includes(p.berry);
        return matchesSearch && matchesSpec && matchesFav;
      })
      .sort((a, b) => {
        if (pickerSort === 'level') return b.level - a.level;
        if (pickerSort === 'rp') return b.rp - a.rp;
        if (pickerSort === 'speed') return a.frequencySeconds - b.frequencySeconds;
        return a.name.localeCompare(b.name);
      });
  }, [pokemons, pickerSearch, pickerSpecialty, pickerOnlyFavorites, pickerSort, config.favoriteBerries]);

  // Smart Comparison Diagnostics
  const comparisonDiff = useMemo(() => {
    if (!recommendedResult || !customEvaluation) return null;
    const diffTotal = customEvaluation.totalDailyVigor - recommendedResult.totalDailyVigor;
    const percentDiff = recommendedResult.totalDailyVigor > 0
      ? (diffTotal / recommendedResult.totalDailyVigor) * 100
      : 0;

    const diffBerry = customEvaluation.berryVigorDaily - recommendedResult.berryVigorDaily;
    const diffCooking = customEvaluation.cookingVigorDaily - recommendedResult.cookingVigorDaily;
    const diffSkills = customEvaluation.skillVigorDaily - recommendedResult.skillVigorDaily;

    // Smart explanations
    const reasons: string[] = [];

    // Check Official Special/Legendary Rule
    const customSpecials = currentTeamPokemons.filter(p => isSpecialPokemon(p));
    if (customSpecials.length > 1) {
      reasons.push(`⚠️ Infracción de Regla Oficial: Tienes ${customSpecials.length} Pokémon Especiales (${customSpecials.map(p => p.name).join(', ')}). En Pokémon Sleep solo se permite 1 por equipo.`);
    }

    if (diffTotal >= 0) {
      reasons.push('¡Tu equipo personalizado supera o iguala la proyección del algoritmo!');
      if (diffBerry > 0) reasons.push(`+${diffBerry.toLocaleString()} pts por mayor producción en bayas.`);
      if (diffCooking > 0) reasons.push(`+${diffCooking.toLocaleString()} pts gracias a mejores recetas o mayor relleno.`);
    } else {
      if (currentTeamPokemons.length < 5) {
        reasons.push(`Faltan ${5 - currentTeamPokemons.length} Pokémon por asignar en tu equipo.`);
      } else {
        if (diffCooking < -5000) {
          reasons.push(`Pérdida en Cocina (${diffCooking.toLocaleString()} pts): El equipo recomendado completa recetas de mayor vigor o genera más relleno.`);
        }
        if (diffBerry < -5000) {
          reasons.push(`Pérdida en Bayas (${diffBerry.toLocaleString()} pts): El recomendado aprovecha mejor las 3 bayas favoritas de la semana (×2).`);
        }
        const recHealerHighlight = recommendedResult.highlights.find(h => h.includes('Sanador activo'));
        const customHealerHighlight = customEvaluation.highlights.find(h => h.includes('Sanador activo'));
        if (recHealerHighlight && !customHealerHighlight) {
          reasons.push('Diferencia de Energía: El recomendado tiene un Sanador consolidado que eleva la velocidad general del equipo.');
        }
      }
    }

    return {
      diffTotal,
      percentDiff,
      diffBerry,
      diffCooking,
      diffSkills,
      reasons
    };
  }, [recommendedResult, customEvaluation, currentTeamPokemons.length]);

  return (
    <div className="space-y-6 my-6">
      {/* Top Header */}
      <div className="glass-dreamy pokeball-watermark p-5 sm:p-6 rounded-[28px] relative overflow-hidden border border-white/10 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-200 text-xs font-black uppercase tracking-wider mb-1">
              <Swords className="w-4 h-4 text-purple-300" />
              <span>Laboratorio de Campamento</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-heading)] tracking-tight flex items-center gap-2">
              <span>Simulador de Equipos</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Elige 5 Pokémon de tu caja para simular su vigor diario, evaluar sus 3 comidas y compararlo frente al equipo óptimo de Snorlax.
            </p>
          </div>

          {/* Snorlax Context Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-white/[0.06] p-2 rounded-full border border-white/10 self-start md:self-auto text-xs shadow-inner">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span>{config.dishType === 'curry' ? '🍲' : config.dishType === 'salad' ? '🥗' : '☕'}</span>
              <span className="capitalize">{config.dishType === 'curry' ? 'Curris' : config.dishType === 'salad' ? 'Ensaladas' : 'Postres'}</span>
            </span>

            <span className="text-slate-200 tabular-nums font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
              <span>Puchero: {getEffectivePotCapacity(config)}</span>
              {config.goodCampTicket && <span className="text-purple-200 text-[10px]">🏕️ (+50%)</span>}
            </span>

            {onToggleGoodCampTicket && (
              <button
                onClick={onToggleGoodCampTicket}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                  config.goodCampTicket
                    ? 'bg-white/15 text-white border-white/25 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                }`}
                title="Pase de Acampada (+50% Olla, +20% velocidad)"
              >
                <span>🏕️ Pase</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${config.goodCampTicket ? 'bg-white text-indigo-950 font-black' : 'bg-slate-800 text-slate-400'}`}>
                  {config.goodCampTicket ? 'ACTIVO' : 'OFF'}
                </span>
              </button>
            )}

            {onUpdateAreaBonus && (
              <label className="flex items-center gap-1.5 text-slate-200 font-bold cursor-pointer bg-white/5 px-3 py-1 rounded-full border border-white/10 transition-all">
                <span className="text-[11px] text-slate-400">🏝️ Zona:</span>
                <select
                  value={config.areaBonus || 0}
                  onChange={(e) => onUpdateAreaBonus(Number(e.target.value))}
                  className="bg-transparent text-white tabular-nums font-bold focus:outline-none cursor-pointer text-xs"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75].map(b => (
                    <option key={b} value={b} className="bg-slate-900 text-slate-200">
                      +{b}%
                    </option>
                  ))}
                </select>
              </label>
            )}

            <div className="flex items-center gap-1.5 pl-1">
              {config.favoriteBerries.map(b => (
                <img
                  key={b}
                  src={getBerrySpriteUrl(b)}
                  alt={b}
                  title={`${b} (×2)`}
                  className="w-4 h-4 object-contain filter drop-shadow"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Team Tabs & Action Buttons */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="relative flex items-center bg-white/[0.08] backdrop-blur-2xl p-1 rounded-full border border-white/10 shadow-inner">
            {/* Sliding Pill Indicator */}
            <div
              className="absolute top-1 bottom-1 rounded-full btn-dreamy-pearl shadow-md pointer-events-none sliding-pill-spring"
              style={{
                width: 'calc(50% - 4px)',
                left: activeCustomTeamIndex === 0 ? '4px' : 'calc(50%)',
              }}
            />
            <button
              onClick={() => setActiveCustomTeamIndex(0)}
              className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center gap-2 select-none ${
                activeCustomTeamIndex === 0
                  ? 'text-indigo-950 font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>⭐ Mi Equipo 1</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-bold transition-colors duration-200 ${
                activeCustomTeamIndex === 0 ? 'bg-indigo-950/15 text-indigo-950 font-black' : 'bg-white/10 text-slate-300'
              }`}>
                {team1Ids.filter(Boolean).length}/5
              </span>
            </button>
            <button
              onClick={() => setActiveCustomTeamIndex(1)}
              className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-bold transition-colors duration-200 flex items-center gap-2 select-none ${
                activeCustomTeamIndex === 1
                  ? 'text-indigo-950 font-black'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>🌟 Mi Equipo 2</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full tabular-nums font-bold transition-colors duration-200 ${
                activeCustomTeamIndex === 1 ? 'bg-indigo-950/15 text-indigo-950 font-black' : 'bg-white/10 text-slate-300'
              }`}>
                {team2Ids.filter(Boolean).length}/5
              </span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Load in-game team button if saved in config */}
            {config.currentTeam?.pokemonIds && config.currentTeam.pokemonIds.length > 0 && (
              <button
                onClick={handleLoadCurrentTeam}
                className="btn-dreamy-ghost px-3.5 py-2 text-xs text-white border-white/20 flex items-center gap-1.5"
                title="Cargar los Pokémon que tienes marcados como tu Equipo Actual en Juego"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cargar en Juego</span>
              </button>
            )}

            {/* Set as in-game team button or badge */}
            {currentTeamPokemons.length === 5 && (
              isCurrentCustomTeamInGame ? (
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-100 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>En Juego ⭐</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveAsCurrentTeam}
                  className="btn-dreamy-ghost px-3.5 py-2 text-xs text-white border-white/20 flex items-center gap-1.5"
                  title="Establecer esta alineación de 5 Pokémon como tu Equipo Actual en Juego"
                >
                  {saveTeamStatus ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5 fill-current text-purple-300" />}
                  <span>{saveTeamStatus || 'Guardar en Juego ⭐'}</span>
                </button>
              )
            )}

            {recommendedResult && (
              <button
                onClick={handleCopyRecommended}
                className="btn-cozy-primary px-4 py-2 text-xs flex items-center gap-1.5"
                title="Copiar los 5 Pokémon recomendados por el algoritmo a este equipo"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Recomendado</span>
              </button>
            )}
            <button
              onClick={handleClearTeam}
              className="btn-cozy-secondary px-3 py-2 text-xs text-rose-300 border-rose-500/25 flex items-center gap-1.5"
              title="Vaciar los 5 espacios"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparative Banner */}
      {recommendedResult && customEvaluation && currentTeamPokemons.length === 5 && comparisonDiff && (
        <div className="cozy-card p-5 sm:p-6 rounded-3xl relative overflow-hidden border border-[var(--surface-border)] shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-display font-bold uppercase tracking-wider text-[var(--text-heading)] mb-3">
                <Scale className="w-4 h-4 text-purple-300" />
                <span>Comparativa de Rendimiento del Campamento</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 items-center">
                {/* Recommended Score */}
                <div className="bg-white/[0.03] p-4 rounded-2xl transition-colors">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] text-purple-200 font-bold flex items-center gap-1 uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5" /> Recomendado
                    </span>
                    {recommendedWeeklyProj && (
                      <span className="text-[9px] bg-white/10 text-white font-bold px-2 py-0.5 rounded-full border border-white/15 truncate">
                        🏅 {recommendedWeeklyProj.estadoRangoFinal.rangoActual}
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tabular-nums mt-0.5">
                    {recommendedResult.totalDailyVigor.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] tabular-nums mt-0.5">
                    <span>pts / día</span>
                    {recommendedWeeklyProj && (
                      <span className="text-purple-200 font-bold">
                        ~{recommendedWeeklyProj.vigorFinalSemana.toLocaleString()} /sem
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Team Score */}
                <div className="bg-white/[0.03] p-4 rounded-2xl transition-colors">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] text-slate-200 font-bold flex items-center gap-1 uppercase tracking-wider">
                      <span>⭐</span> Tu Equipo
                    </span>
                    {customWeeklyProj && (
                      <span className="text-[9px] bg-white/10 text-slate-200 font-bold px-2 py-0.5 rounded-full border border-white/10 truncate">
                        🏅 {customWeeklyProj.estadoRangoFinal.rangoActual}
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tabular-nums mt-0.5">
                    {customEvaluation.totalDailyVigor.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] tabular-nums mt-0.5">
                    <span>pts / día</span>
                    {customWeeklyProj && (
                      <span className="text-slate-300 font-bold">
                        ~{customWeeklyProj.vigorFinalSemana.toLocaleString()} /sem
                      </span>
                    )}
                  </div>
                </div>

                {/* Difference Badge */}
                <div className={`p-4 rounded-2xl col-span-2 sm:col-span-1 flex flex-col justify-center shadow-inner ${
                  comparisonDiff.diffTotal >= 0
                    ? 'bg-emerald-500/15 ring-1 ring-emerald-400/30 text-emerald-300'
                    : 'bg-rose-500/15 ring-1 ring-rose-400/30 text-rose-300'
                }`}>
                  <span className="text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                    {comparisonDiff.diffTotal >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    Diferencia
                  </span>
                  <div className="text-lg sm:text-xl font-black tabular-nums mt-0.5">
                    {comparisonDiff.diffTotal >= 0 ? '+' : ''}{comparisonDiff.diffTotal.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold tabular-nums">
                    ({comparisonDiff.percentDiff >= 0 ? '+' : ''}{comparisonDiff.percentDiff.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Diagnostic Bullets */}
              <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                {comparisonDiff.reasons.map((r, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-purple-300 text-xs">💡</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 3-Metric Bars */}
            <div className="grid grid-cols-3 gap-2.5 lg:w-80">
              <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-rose-300 text-[10px] font-black uppercase tracking-wider block mb-1">🍒 Bayas</span>
                <div className="tabular-nums text-white text-xs font-black">
                  {customEvaluation.berryVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] block tabular-nums mt-0.5 font-medium">
                  vs {recommendedResult.berryVigorDaily.toLocaleString()}
                </span>
              </div>

              <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-emerald-300 text-[10px] font-black uppercase tracking-wider block mb-1">🍲 Cocina</span>
                <div className="tabular-nums text-white text-xs font-black">
                  {customEvaluation.cookingVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] block tabular-nums mt-0.5 font-medium">
                  vs {recommendedResult.cookingVigorDaily.toLocaleString()}
                </span>
              </div>

              <div className="bg-white/[0.04] p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-purple-300 text-[10px] font-black uppercase tracking-wider block mb-1">⚡ Skill</span>
                <div className="tabular-nums text-white text-xs font-black">
                  {customEvaluation.skillVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-[var(--text-muted)] block tabular-nums mt-0.5 font-medium">
                  vs {recommendedResult.skillVigorDaily.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5-Slot Interactive Pokemon Builder */}
      <div className="poke-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-white text-base flex items-center gap-2">
              <span>{activeCustomTeamIndex === 0 ? '🔵' : '🟣'}</span>
              <span>Alineación de {activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'}</span>
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white tabular-nums font-black border border-white/15">
                {currentTeamPokemons.length} / 5 Compañeros
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Haz clic en cualquier espacio para elegir o cambiar de Pokémon de tu colección
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {[0, 1, 2, 3, 4].map((slotIdx) => {
            const pokeId = currentTeamIds[slotIdx];
            const poke = pokeId ? pokemonMap.get(pokeId) : null;

            if (!poke) {
              return (
                <button
                  key={slotIdx}
                  onClick={() => setPickerSlotIndex(slotIdx)}
                  className="h-[142px] max-h-[142px] min-h-[142px] rounded-2xl border-2 border-dashed border-white/15 hover:border-white/30 bg-white/[0.03] hover:bg-white/[0.07] p-3 flex items-center justify-center gap-3 transition-all group shadow-sm relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 group-hover:bg-white/15 border border-white/20 flex items-center justify-center transition-all shadow-inner flex-shrink-0">
                    <Plus className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] tabular-nums font-black text-purple-200 block">
                      Espacio #{slotIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-purple-100 transition-colors">
                      + Elegir Pokémon
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <div key={slotIdx} className="relative group">
                <PokemonCard
                  pokemon={poke}
                  slotIndex={slotIdx}
                  isFavoriteBerry={config.favoriteBerries.includes(poke.berry)}
                  onEdit={onEditPokemon}
                  compact={true}
                  spriteStyle={spriteStyle}
                />
                {/* Overlay Action Buttons: Swap & Remove */}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPickerSlotIndex(slotIdx);
                    }}
                    className="p-1 rounded-lg bg-[var(--surface-card)] hover:bg-[var(--accent-primary)] text-slate-200 hover:text-slate-950 border border-[var(--surface-border)] transition-all shadow-md"
                    title="Cambiar este Pokémon (Swap)"
                  >
                    <ArrowRightLeft className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromSlot(slotIdx);
                    }}
                    className="p-1 rounded-lg bg-[var(--surface-card)] hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all shadow-md"
                    title="Quitar del equipo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weekly Rank Projection System & Island Curve */}
      {currentTeamPokemons.length > 0 && (
        <WeeklyRankProjectionView
          equipo={currentTeamPokemons}
          config={config}
          teamLabel={
            isCurrentCustomTeamInGame
              ? `${activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'} (En Juego ⭐)`
              : activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'
          }
          comparisonEquipo={recommendedResult?.team}
          comparisonLabel="Equipo Recomendado #1"
          onUpdateMidWeekProgress={onUpdateMidWeekProgress}
          onResetMidWeekProgress={onResetMidWeekProgress}
        />
      )}

      {/* Custom Team Meals & Production Breakdown */}
      {customEvaluation && (
        <div className="glass-dreamy p-5 sm:p-6 rounded-[32px] border border-white/10 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-purple-300" />
              <h3 className="font-bold text-white text-base">
                Plan Culinario y Relleno de {activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'}
              </h3>
            </div>
            <span className="text-xs bg-white/10 border border-white/10 px-3 py-1 rounded-full text-white tabular-nums">
              Vigor Cocina: <strong className="text-white font-black tabular-nums">{customEvaluation.cookingVigorDaily.toLocaleString()}</strong> pts/día
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customEvaluation.meals.map((meal) => (
              <div
                key={meal.mealIndex}
                className="bg-white/[0.03] hover:bg-white/[0.06] rounded-2xl p-4 flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-purple-200">
                      {meal.mealName}
                    </span>
                    <div className="text-right">
                      <span className="text-xs tabular-nums font-black text-white">
                        +{meal.totalMealVigor.toLocaleString()} pts
                      </span>
                      <span className="block text-[9px] text-[var(--text-muted)] font-sans">
                        promedio diario
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
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
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="font-bold text-white text-sm truncate">
                          {meal.recipe.name}
                        </h4>
                        {meal.recipe.baseVigor > 0 && onUpdateRecipeLevel && (
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-[10px] text-[var(--text-muted)] font-medium">Nv.</span>
                            <select
                              value={meal.recipeLevel || 1}
                              onChange={(e) => onUpdateRecipeLevel(meal.recipe.name, parseInt(e.target.value, 10))}
                              className="bg-white/10 text-white font-bold text-xs rounded-lg px-2 py-0.5 focus:ring-1 focus:ring-white/40 focus:outline-none tabular-nums border-none shadow-inner"
                              title="Ajustar el nivel real de esta receta en tu juego"
                            >
                              {Array.from({ length: 65 }, (_, idx) => idx + 1).map(lvl => (
                                <option key={lvl} value={lvl}>
                                  {lvl} (+{DISH_LEVEL_BONUS[lvl] || 0}%)
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] line-clamp-1">
                        {meal.recipe.description}
                      </p>
                    </div>
                  </div>

                  {/* Recipe Ingredients (Icon Sprites with Floating Quantity Badges) */}
                  <div className="mb-3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Ingredientes Receta</span>
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
                      {Object.keys(meal.recipe.ingredients).length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">Sin receta completada (Plato Mixto)</span>
                      )}
                    </div>
                  </div>

                  {/* Filler */}
                  {meal.fillerIngredients.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                        <span>Relleno Adicional</span>
                        <span className="text-[10px] text-purple-200 font-bold tabular-nums">
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

                <div className="mt-3 pt-2.5 border-t border-white/5 text-[10px] text-[var(--text-muted)] flex flex-col gap-1.5 tabular-nums">
                  <div className="flex items-center justify-between text-[var(--text-muted)]">
                    <span>Receta (Nv.{meal.recipeLevel || 1}): {meal.recipeVigor.toLocaleString()}</span>
                    <span>Relleno: {meal.fillerVigor.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[var(--text-muted)]">Total en olla:</span>
                    <span className="text-white font-semibold">{(meal.recipeVigor + meal.fillerVigor).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-purple-200 font-bold">
                    <span>Plato Normal {(config.areaBonus || 0) > 0 ? `(+${config.areaBonus}% Zona)` : ''}:</span>
                    <span>{Math.round((meal.recipeVigor + meal.fillerVigor) * (1 + (config.areaBonus || 0) / 100)).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-white font-bold">
                    <span>Si sale ¡Riquísimo! ({config.isSunday ? '×3' : '×2'}):</span>
                    <span>{Math.round((meal.recipeVigor + meal.fillerVigor) * (1 + (config.areaBonus || 0) / 100) * (config.isSunday ? 3 : 2)).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Ingredient Output */}
          <div className="mt-5 pt-4 border-t border-[var(--surface-border)]">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider block mb-2">
              Producción Diaria Total de Ingredientes
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(customEvaluation.dailyIngredientProduction)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <span
                    key={name}
                    className="text-xs px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-slate-200 flex items-center gap-1.5"
                  >
                    <img
                      src={getIngredientSpriteUrl(name)}
                      alt={name}
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>{name}</span>
                    <span className="font-black text-white tabular-nums">+{count}</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Pokemon Selection Modal / Drawer */}
      {pickerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="cozy-card pokeball-watermark rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative my-auto overflow-hidden border border-[var(--surface-border)]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)] bg-[var(--surface-inner)] relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
                  <span>🐾</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <span>Elegir Pokémon para Espacio #{pickerSlotIndex + 1}</span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Selecciona entre tus {pokemons.length} Pokémon registrados en tu caja
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPickerSlotIndex(null)}
                className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-[var(--surface-inner)] border-b border-[var(--surface-border)] grid grid-cols-1 sm:grid-cols-4 gap-2.5 relative z-10">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                />
              </div>

              <div>
                <select
                  value={pickerSpecialty}
                  onChange={(e) => setPickerSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  <option value="all">Todas las especialidades</option>
                  <option value="Bayas">Bayas</option>
                  <option value="Ingredientes">Ingredientes</option>
                  <option value="Habilidades">Habilidades</option>
                  <option value="Todo">Todo (Mew)</option>
                </select>
              </div>

              <div>
                <select
                  value={pickerSort}
                  onChange={(e) => setPickerSort(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]"
                >
                  <option value="level">Mayor Nivel</option>
                  <option value="rp">Mayor Poder (PA)</option>
                  <option value="speed">Mayor Rapidez</option>
                  <option value="name">Alfabético</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Pill */}
            <div className="px-5 py-2.5 bg-[var(--surface-inner)]/60 border-b border-[var(--surface-border)] flex items-center justify-between text-xs relative z-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickerOnlyFavorites}
                  onChange={(e) => setPickerOnlyFavorites(e.target.checked)}
                  className="rounded bg-slate-900 border-[var(--surface-border)] text-purple-400 focus:ring-purple-400 h-4 w-4"
                />
                <span className="text-slate-200 flex items-center gap-1.5 font-bold">
                  <span>🍒</span> Solo con Baya Favorita de la semana (×2)
                </span>
              </label>
              <span className="text-white text-[11px] tabular-nums font-bold">
                {pickerList.length} disponibles
              </span>
            </div>

            {/* Modal Body: Pokemon Grid */}
            <div className="p-4 overflow-y-auto flex-1 min-h-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
              {pickerList.map((p) => {
                const isAlreadyInTeam = currentTeamIds.includes(p.id);
                const isSpecial = isSpecialPokemon(p);
                const otherSlotHasSpecial = currentTeamPokemons.some((tp, idx) => idx !== pickerSlotIndex && isSpecialPokemon(tp));
                const wouldConflictSpecial = isSpecial && otherSlotHasSpecial;
                const isFavorite = config.favoriteBerries.includes(p.berry);
                const isShiny = p.notes?.toLowerCase().includes('shiny') || p.notes?.toLowerCase().includes('variocolor');
                const mainSkill = p.mainSkillName || getPokemonCanonicalSkill(p.name);
                const mainSkillMeta = getMainSkillMeta(mainSkill);
                const berryMeta = BERRIES[p.berry];
                const typeTheme = getTypeTheme(berryMeta?.type || 'Normal');

                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPokemonForSlot(p.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all relative overflow-hidden group flex-shrink-0 min-h-[76px] ${
                      isAlreadyInTeam
                        ? 'bg-[var(--surface-inner)]/30 border-white/5 opacity-40'
                        : wouldConflictSpecial
                        ? 'bg-rose-950/25 border-rose-500/30 hover:border-rose-400'
                        : isFavorite
                        ? 'cozy-card border-purple-400/40 hover:border-purple-400'
                        : 'cozy-card border-[var(--surface-border)] hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    {/* Centered Pedestal with Showdown Sprite */}
                    <div className="w-[52px] h-[52px] min-w-[52px] min-h-[52px] max-w-[52px] max-h-[52px] rounded-xl bg-[var(--surface-inner)] border border-[var(--surface-border)] flex items-center justify-center p-0.5 relative shadow-inner overflow-hidden flex-shrink-0">
                      <div
                        className="absolute inset-0 opacity-20 rounded-xl blur-xs"
                        style={{ backgroundColor: typeTheme.glow }}
                      />
                      <img
                        src={getPokemonArtworkUrl(p.name, spriteStyle, isShiny)}
                        alt={p.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPokemonArtworkUrl(p.name, 'artwork', isShiny);
                        }}
                        className={`max-w-[44px] max-h-[44px] w-auto h-auto object-contain m-auto block filter drop-shadow relative z-10 ${
                          spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                        }`}
                      />
                      {isShiny && (
                        <span className="absolute -top-1 -right-1 text-[8px] bg-purple-300 text-indigo-950 px-1 rounded-full font-bold z-20">
                          ★
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-black text-white text-xs truncate">{p.name}</span>
                          {isSpecial && (
                            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full flex items-center gap-0.5 ${
                              wouldConflictSpecial
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            }`} title={wouldConflictSpecial ? 'Ya tienes otro Legendario en el equipo' : 'Pokémon Legendario / Especial'}>
                              👑 {wouldConflictSpecial ? 'Máx 1' : 'Especial'}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-purple-200 bg-purple-500/20 border border-purple-500/30 px-1.5 py-0.2 rounded-full tabular-nums">
                          Nv.{p.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5 font-bold">
                        <span className="tabular-nums text-white flex items-center gap-0.5 font-bold">
                          <Zap className="w-2.5 h-2.5 fill-purple-300 text-purple-300" /> PA {p.rp}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <img
                            src={getBerrySpriteUrl(p.berry)}
                            alt={p.berry}
                            className="w-3.5 h-3.5 object-contain"
                          />
                          <span className={isFavorite ? 'text-purple-300 font-black' : ''}>
                            {p.berry} {isFavorite && '×2'}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-[8px] px-2 py-0.2 rounded-full border truncate font-bold flex items-center gap-1 ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                          {mainSkillMeta.iconUrl && (
                            <img
                              src={mainSkillMeta.iconUrl}
                              alt=""
                              className="w-3 h-3 object-contain flex-shrink-0"
                              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                            />
                          )}
                          <span>{mainSkill}</span>
                        </span>
                        {isAlreadyInTeam && (
                          <span className="text-[9px] text-purple-200 font-bold">
                            (En equipo)
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {pickerList.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-xs">
                  No se encontraron Pokémon con los filtros especificados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
