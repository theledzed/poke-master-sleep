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
      <div className="poke-card pokeball-watermark p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-1">
              <Swords className="w-4 h-4 text-amber-400" />
              <span>Laboratorio de Equipos & Banco de Pruebas</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Simulador de Equipos Personalizados</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Elige 5 Pokémon de tu caja para simular su vigor diario, evaluar sus 3 comidas y compararlo frente al equipo óptimo de Snorlax.
            </p>
          </div>

          {/* Snorlax Context Pills */}
          <div className="flex flex-wrap items-center gap-2 bg-[#080C16]/80 p-3 rounded-2xl border border-white/10 self-start md:self-auto text-xs backdrop-blur-md">
            <span className="flex items-center gap-1.5 text-slate-200 font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
              <span>{config.dishType === 'curry' ? '🍲' : config.dishType === 'salad' ? '🥗' : '☕'}</span>
              <span className="capitalize">{config.dishType === 'curry' ? 'Curris' : config.dishType === 'salad' ? 'Ensaladas' : 'Postres'}</span>
            </span>

            <span className="text-slate-200 font-mono font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1">
              <span>Puchero: {getEffectivePotCapacity(config)}</span>
              {config.goodCampTicket && <span className="text-amber-400 text-[10px]">🏕️ (+50%)</span>}
            </span>

            {onToggleGoodCampTicket && (
              <button
                onClick={onToggleGoodCampTicket}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                  config.goodCampTicket
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:text-slate-200'
                }`}
                title="Pase de Acampada (+50% Olla, +20% velocidad)"
              >
                <span>🏕️ Pase</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${config.goodCampTicket ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  {config.goodCampTicket ? 'ACTIVO' : 'OFF'}
                </span>
              </button>
            )}

            {onUpdateAreaBonus && (
              <label className="flex items-center gap-1.5 text-amber-300 font-bold cursor-pointer bg-white/5 px-3 py-1 rounded-full border border-white/10 transition-all">
                <span className="text-[11px] text-slate-400">🏝️ Zona:</span>
                <select
                  value={config.areaBonus || 0}
                  onChange={(e) => onUpdateAreaBonus(Number(e.target.value))}
                  className="bg-transparent text-amber-300 font-mono font-bold focus:outline-none cursor-pointer text-xs"
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
        <div className="mt-5 pt-4 border-t border-sky-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-1 bg-[#091f3a] p-1 rounded-xl border border-sky-400/20">
            <button
              onClick={() => setActiveCustomTeamIndex(0)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeCustomTeamIndex === 0
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🔵 Mi Equipo 1</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeCustomTeamIndex === 0 ? 'bg-sky-950/40 text-sky-100' : 'bg-white/10 text-slate-400'
              }`}>
                {team1Ids.filter(Boolean).length}/5
              </span>
            </button>
            <button
              onClick={() => setActiveCustomTeamIndex(1)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                activeCustomTeamIndex === 1
                  ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>🟣 Mi Equipo 2</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                activeCustomTeamIndex === 1 ? 'bg-sky-950/40 text-sky-100' : 'bg-white/10 text-slate-400'
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091f3a] hover:bg-emerald-500/20 border border-sky-400/20 hover:border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm"
                title="Cargar los Pokémon que tienes marcados como tu Equipo Actual en Juego"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cargar en Juego</span>
              </button>
            )}

            {/* Set as in-game team button or badge */}
            {currentTeamPokemons.length === 5 && (
              isCurrentCustomTeamInGame ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs font-bold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>En Juego ⭐</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveAsCurrentTeam}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/25 active:scale-95"
                  title="Establecer esta alineación de 5 Pokémon como tu Equipo Actual en Juego"
                >
                  {saveTeamStatus ? <Check className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5 fill-current text-amber-300" />}
                  <span>{saveTeamStatus || 'Guardar en Juego ⭐'}</span>
                </button>
              )
            )}

            {recommendedResult && (
              <button
                onClick={handleCopyRecommended}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                title="Copiar los 5 Pokémon recomendados por el algoritmo a este equipo"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Recomendado</span>
              </button>
            )}
            <button
              onClick={handleClearTeam}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#091f3a] hover:bg-rose-950/40 border border-sky-400/20 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all shadow-sm"
              title="Vaciar los 5 espacios"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Head-to-Head Comparative Banner (Pokemon Stadium / GO Battle League style) */}
      {recommendedResult && customEvaluation && currentTeamPokemons.length === 5 && comparisonDiff && (
        <div className="poke-card p-5 sm:p-6 relative overflow-hidden border border-sky-400/25 shadow-xl">
          {/* Ambient battle glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-400 mb-3">
                <Scale className="w-4 h-4 text-sky-400" />
                <span>Duelo de Rendimiento de Campamento</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 items-center">
                {/* Recommended Score */}
                <div className="bg-[#08182c]/85 p-4 rounded-2xl border border-sky-400/20 shadow-inner">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] text-amber-300 font-black flex items-center gap-1 uppercase tracking-wider">
                      <Trophy className="w-3.5 h-3.5" /> Recomendado
                    </span>
                    {recommendedWeeklyProj && (
                      <span className="text-[9px] bg-amber-400/20 text-amber-300 font-black px-2 py-0.5 rounded-full border border-amber-400/30 truncate">
                        🏅 {recommendedWeeklyProj.estadoRangoFinal.rangoActual}
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                    {recommendedResult.totalDailyVigor.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>pts / día</span>
                    {recommendedWeeklyProj && (
                      <span className="text-sky-300 font-bold">
                        ~{recommendedWeeklyProj.vigorFinalSemana.toLocaleString()} /sem
                      </span>
                    )}
                  </div>
                </div>

                {/* Custom Team Score */}
                <div className="bg-[#08182c]/85 p-4 rounded-2xl border border-sky-400/20 shadow-inner">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[11px] text-slate-200 font-black flex items-center gap-1 uppercase tracking-wider">
                      <span>{activeCustomTeamIndex === 0 ? '🔵' : '🟣'}</span> Tu Equipo
                    </span>
                    {customWeeklyProj && (
                      <span className="text-[9px] bg-sky-500/20 text-sky-200 font-black px-2 py-0.5 rounded-full border border-sky-400/30 truncate">
                        🏅 {customWeeklyProj.estadoRangoFinal.rangoActual}
                      </span>
                    )}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
                    {customEvaluation.totalDailyVigor.toLocaleString()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>pts / día</span>
                    {customWeeklyProj && (
                      <span className="text-sky-300 font-bold">
                        ~{customWeeklyProj.vigorFinalSemana.toLocaleString()} /sem
                      </span>
                    )}
                  </div>
                </div>

                {/* Difference Badge */}
                <div className={`p-4 rounded-2xl border col-span-2 sm:col-span-1 flex flex-col justify-center shadow-inner ${
                  comparisonDiff.diffTotal >= 0
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                }`}>
                  <span className="text-[10px] uppercase font-black tracking-wider flex items-center gap-1">
                    {comparisonDiff.diffTotal >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    Diferencia
                  </span>
                  <div className="text-lg sm:text-xl font-black font-mono mt-0.5">
                    {comparisonDiff.diffTotal >= 0 ? '+' : ''}{comparisonDiff.diffTotal.toLocaleString()}
                  </div>
                  <span className="text-[10px] font-bold">
                    ({comparisonDiff.percentDiff >= 0 ? '+' : ''}{comparisonDiff.percentDiff.toFixed(1)}%)
                  </span>
                </div>
              </div>

              {/* Diagnostic Bullets */}
              <div className="mt-3.5 pt-3 border-t border-white/10 space-y-1.5">
                {comparisonDiff.reasons.map((r, idx) => (
                  <div key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-amber-400 text-xs">💡</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick 3-Metric Bars */}
            <div className="grid grid-cols-3 gap-2.5 lg:w-80">
              <div className="bg-[#080C16]/90 p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-rose-300 text-[10px] font-black uppercase tracking-wider block mb-1">🍒 Bayas</span>
                <div className="font-mono text-white text-xs font-black">
                  {customEvaluation.berryVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                  vs {recommendedResult.berryVigorDaily.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#080C16]/90 p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-emerald-300 text-[10px] font-black uppercase tracking-wider block mb-1">🍲 Cocina</span>
                <div className="font-mono text-white text-xs font-black">
                  {customEvaluation.cookingVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
                  vs {recommendedResult.cookingVigorDaily.toLocaleString()}
                </span>
              </div>

              <div className="bg-[#080C16]/90 p-3.5 rounded-2xl border border-white/10 text-center text-xs shadow-inner">
                <span className="text-amber-300 text-[10px] font-black uppercase tracking-wider block mb-1">⚡ Skill</span>
                <div className="font-mono text-white text-xs font-black">
                  {customEvaluation.skillVigorDaily.toLocaleString()}
                </div>
                <span className="text-[9px] text-slate-500 block font-mono mt-0.5">
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
              <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-amber-300 font-mono font-black border border-white/10">
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
                  className="h-[142px] max-h-[142px] min-h-[142px] rounded-2xl border-2 border-dashed border-sky-400/25 hover:border-sky-400/50 bg-[#0c2444]/40 hover:bg-[#0c2444]/70 p-3 flex items-center justify-center gap-3 transition-all group shadow-sm relative overflow-hidden"
                >
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 group-hover:bg-sky-500/20 border border-sky-400/20 group-hover:border-sky-400/40 flex items-center justify-center transition-all shadow-inner flex-shrink-0">
                    <Plus className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-mono font-black text-sky-300 block">
                      Espacio #{slotIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-white group-hover:text-sky-200 transition-colors">
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
                    className="p-1 rounded-lg bg-[#08182c]/90 hover:bg-sky-500 text-sky-300 hover:text-white border border-sky-400/30 transition-all shadow-md"
                    title="Cambiar este Pokémon (Swap)"
                  >
                    <ArrowRightLeft className="w-3 h-3 stroke-[2.5]" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromSlot(slotIdx);
                    }}
                    className="p-1 rounded-lg bg-[#08182c]/90 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all shadow-md"
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
        <div className="poke-card p-5 sm:p-6 border border-sky-400/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-300" />
              <h3 className="font-bold text-white text-base">
                Plan Culinario y Relleno de {activeCustomTeamIndex === 0 ? 'Mi Equipo 1' : 'Mi Equipo 2'}
              </h3>
            </div>
            <span className="text-xs bg-[#08182c]/80 border border-sky-400/20 px-3 py-1 rounded-full text-slate-200 font-mono">
              Vigor Cocina: <strong className="text-sky-300 font-black">{customEvaluation.cookingVigorDaily.toLocaleString()}</strong> pts/día
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {customEvaluation.meals.map((meal) => (
              <div
                key={meal.mealIndex}
                className="bg-[#0c2444]/80 border border-sky-400/20 rounded-2xl p-4 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      {meal.mealName}
                    </span>
                    <div className="text-right">
                      <span className="text-xs font-mono font-black text-sky-300">
                        +{meal.totalMealVigor.toLocaleString()} pts
                      </span>
                      <span className="block text-[9px] text-slate-400 font-sans">
                        promedio diario
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-400/25 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
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
                            <span className="text-[10px] text-slate-400 font-mono">Nv.</span>
                            <select
                              value={meal.recipeLevel || 1}
                              onChange={(e) => onUpdateRecipeLevel(meal.recipe.name, parseInt(e.target.value, 10))}
                              className="bg-slate-900 border border-slate-700 text-amber-400 font-bold text-xs rounded px-1.5 py-0.5 focus:ring-1 focus:ring-amber-500 focus:outline-none"
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
                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        {meal.recipe.description}
                      </p>
                    </div>
                  </div>

                  {/* Recipe Ingredients */}
                  <div className="mb-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Ingredientes Receta ({Object.values(meal.recipe.ingredients).reduce((a, b) => a + b, 0)})
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(meal.recipe.ingredients).map(([ing, count]) => (
                        <span
                          key={ing}
                          className="text-[10px] px-2 py-0.5 rounded bg-[#08182c]/90 text-slate-200 border border-sky-400/20 flex items-center gap-1 font-mono font-bold"
                        >
                          <img
                            src={getIngredientSpriteUrl(ing)}
                            alt={ing}
                            className="w-3.5 h-3.5 object-contain"
                          />
                          <span>{ing} ×{count}</span>
                        </span>
                      ))}
                      {Object.keys(meal.recipe.ingredients).length === 0 && (
                        <span className="text-[10px] text-slate-500 italic">Sin receta completada (Plato Mixto)</span>
                      )}
                    </div>
                  </div>

                  {/* Filler */}
                  {meal.fillerIngredients.length > 0 && (
                    <div>
                      <div className="text-[10px] font-bold text-amber-300 uppercase tracking-wider mb-1">
                        Relleno (+{meal.fillerVigor.toLocaleString()} pts)
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.fillerIngredients.map((fill) => (
                          <span
                            key={fill.name}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center gap-1 font-medium"
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

                <div className="mt-3 pt-2 border-t border-sky-400/15 text-[10px] text-slate-400 flex flex-col gap-1 font-mono">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Receta (Nv.{meal.recipeLevel || 1}): {meal.recipeVigor.toLocaleString()}</span>
                    <span>Relleno: {meal.fillerVigor.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-sky-400/10">
                    <span className="text-slate-400">Total en olla:</span>
                    <span className="text-white font-semibold">{(meal.recipeVigor + meal.fillerVigor).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-sky-300 font-semibold">
                    <span>Plato Normal {(config.areaBonus || 0) > 0 ? `(+${config.areaBonus}% Zona)` : ''}:</span>
                    <span>{Math.round((meal.recipeVigor + meal.fillerVigor) * (1 + (config.areaBonus || 0) / 100)).toLocaleString()} pts</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-300 font-medium">
                    <span>Si sale ¡Riquísimo! ({config.isSunday ? '×3' : '×2'}):</span>
                    <span>{Math.round((meal.recipeVigor + meal.fillerVigor) * (1 + (config.areaBonus || 0) / 100) * (config.isSunday ? 3 : 2)).toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Ingredient Output */}
          <div className="mt-5 pt-4 border-t border-sky-400/15">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Producción Diaria Total de Ingredientes
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(customEvaluation.dailyIngredientProduction)
                .sort((a, b) => b[1] - a[1])
                .map(([name, count]) => (
                  <span
                    key={name}
                    className="text-xs px-2.5 py-1 rounded-xl bg-[#08182c]/90 border border-sky-400/20 text-slate-200 flex items-center gap-1.5"
                  >
                    <img
                      src={getIngredientSpriteUrl(name)}
                      alt={name}
                      className="w-3.5 h-3.5 object-contain"
                    />
                    <span>{name}</span>
                    <span className="font-bold text-amber-400 font-mono">+{count}</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Pokemon Selection Modal / Drawer */}
      {pickerSlotIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0c2444] pokeball-watermark rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl relative my-auto overflow-hidden border border-sky-400/25">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-sky-400/20 bg-[#08182c]/90 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
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
            <div className="p-4 bg-[#08182c]/80 border-b border-sky-400/20 grid grid-cols-1 sm:grid-cols-4 gap-2.5 relative z-10">
              <div className="relative sm:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por nombre..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-sky-950/60 border border-sky-400/20 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
                />
              </div>

              <div>
                <select
                  value={pickerSpecialty}
                  onChange={(e) => setPickerSpecialty(e.target.value)}
                  className="w-full px-3 py-2 bg-sky-950/60 border border-sky-400/20 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="all" className="bg-[#0c2444]">Todas las especialidades</option>
                  <option value="Bayas" className="bg-[#0c2444]">Bayas</option>
                  <option value="Ingredientes" className="bg-[#0c2444]">Ingredientes</option>
                  <option value="Habilidades" className="bg-[#0c2444]">Habilidades</option>
                  <option value="Todo" className="bg-[#0c2444]">Todo (Mew)</option>
                </select>
              </div>

              <div>
                <select
                  value={pickerSort}
                  onChange={(e) => setPickerSort(e.target.value as any)}
                  className="w-full px-3 py-2 bg-sky-950/60 border border-sky-400/20 rounded-xl text-xs text-slate-200 font-bold focus:outline-none focus:ring-1 focus:ring-sky-400"
                >
                  <option value="level" className="bg-[#0c2444]">Mayor Nivel</option>
                  <option value="rp" className="bg-[#0c2444]">Mayor Poder (PA)</option>
                  <option value="speed" className="bg-[#0c2444]">Mayor Rapidez</option>
                  <option value="name" className="bg-[#0c2444]">Alfabético</option>
                </select>
              </div>
            </div>

            {/* Quick Filter Pill */}
            <div className="px-5 py-2.5 bg-[#08182c]/60 border-b border-sky-400/15 flex items-center justify-between text-xs relative z-10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pickerOnlyFavorites}
                  onChange={(e) => setPickerOnlyFavorites(e.target.checked)}
                  className="rounded bg-sky-950 border-sky-400/30 text-sky-500 focus:ring-sky-500 h-4 w-4"
                />
                <span className="text-slate-200 flex items-center gap-1.5 font-bold">
                  <span>🍒</span> Solo con Baya Favorita de la semana (×2)
                </span>
              </label>
              <span className="text-sky-300 text-[11px] font-mono font-bold">
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
                        ? 'bg-sky-950/20 border-sky-400/10 opacity-50'
                        : wouldConflictSpecial
                        ? 'bg-amber-950/25 border-amber-500/30 hover:border-amber-400'
                        : isFavorite
                        ? 'bg-gradient-to-b from-sky-900/30 via-[#0c2444] to-[#0c2444] border-amber-400/35 hover:border-amber-400'
                        : 'bg-[#0c2444]/80 border-sky-400/20 hover:border-sky-400/40 hover:bg-[#10325c]'
                    }`}
                  >
                    {/* Centered Pedestal with Showdown Sprite */}
                    <div className="w-[52px] h-[52px] min-w-[52px] min-h-[52px] max-w-[52px] max-h-[52px] rounded-xl bg-gradient-to-b from-sky-400/15 to-transparent border border-sky-400/25 flex items-center justify-center p-0.5 relative shadow-inner overflow-hidden flex-shrink-0">
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
                        <span className="absolute -top-1 -right-1 text-[8px] bg-amber-400 text-slate-950 px-1 rounded-full font-bold z-20">
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
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            }`} title={wouldConflictSpecial ? 'Ya tienes otro Legendario en el equipo' : 'Pokémon Legendario / Especial'}>
                              👑 {wouldConflictSpecial ? 'Máx 1' : 'Especial'}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-mono">
                          Nv.{p.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5 font-bold">
                        <span className="font-mono text-sky-300 flex items-center gap-0.5">
                          <Zap className="w-2.5 h-2.5 fill-sky-300" /> PA {p.rp}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 truncate">
                          <img
                            src={getBerrySpriteUrl(p.berry)}
                            alt={p.berry}
                            className="w-3.5 h-3.5 object-contain"
                          />
                          <span className={isFavorite ? 'text-amber-400 font-black' : ''}>
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
                          <span className="text-[9px] text-sky-400 font-bold">
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
