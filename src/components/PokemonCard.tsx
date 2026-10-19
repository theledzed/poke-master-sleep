import React, { useState, useMemo, useEffect } from 'react';
import { Pokemon } from '../types/pokemon';
import { BERRIES } from '../data/gameData';
import {
  getPokemonArtworkUrl,
  getPokemonDexId,
  getTypeTheme,
  getBerrySpriteUrl,
  getIngredientSpriteUrl,
  getPokemonCanonicalSkill,
  getMainSkillMeta,
  isSpecialPokemon,
  SpriteStyle
} from '../services/pokeApiService';
import { getPokemonSkillLevel } from '../services/optimizer';
import { evaluateSinglePokemonGenetics } from '../services/pokedexEvaluator';
import { canPokemonEvolve } from '../services/evolutionService';
import { EvolutionModal } from './EvolutionModal';
import {
  Lock,
  CheckCircle2,
  Zap,
  Clock,
  Sparkles,
  Dna,
  Edit2,
  Star,
  Crown,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export interface PokemonCardProps {
  pokemon: Pokemon;
  isFavoriteBerry?: boolean;
  onEdit?: (pokemon: Pokemon) => void;
  onEvolve?: (pokemon: Pokemon) => void;
  compact?: boolean;
  spriteStyle?: SpriteStyle;
  slotIndex?: number;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isFavoriteBerry = false,
  onEdit,
  onEvolve,
  compact = false,
  spriteStyle = 'showdown',
  slotIndex
}) => {
  const [imageError, setImageError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  // Reset image error state whenever pokemon or spriteStyle changes
  useEffect(() => {
    setImageError(false);
  }, [pokemon.name, spriteStyle]);

  const berryMeta = BERRIES[pokemon.berry];
  const typeTheme = getTypeTheme(berryMeta?.type || 'Normal');
  const dexId = getPokemonDexId(pokemon.name);

  const isShiny = pokemon.notes?.toLowerCase().includes('shiny') || pokemon.notes?.toLowerCase().includes('variocolor');
  const isSpecial = isSpecialPokemon(pokemon);
  const canonicalSkill = getPokemonCanonicalSkill(pokemon.name);
  let mainSkill = pokemon.mainSkillName || canonicalSkill;
  const isLegendaryBeast = ['raikou', 'entei', 'suicune'].some(b => pokemon.name.toLowerCase().includes(b));
  if (pokemon.name.toLowerCase().trim() === 'eevee' && mainSkill !== 'Imán ingredientes S') {
    mainSkill = 'Imán ingredientes S';
  } else if (mainSkill.includes('Impulso de ayuda') && !isLegendaryBeast) {
    mainSkill = canonicalSkill;
  }
  const mainSkillMeta = getMainSkillMeta(mainSkill);
  const skillLevel = getPokemonSkillLevel(pokemon);

  // Intrinsic genetic evaluation for quick grade display
  const genetic = useMemo(() => evaluateSinglePokemonGenetics(pokemon), [pokemon]);

  // Specialty badge colors
  const specialtyBadge = {
    'Bayas': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    'Ingredientes': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    'Habilidades': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    'Todo': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' }
  }[pokemon.specialty] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

  // Primary sprite URL according to user preference (showdown, sleep, artwork)
  const primarySpriteUrl = useMemo(() => {
    return getPokemonArtworkUrl(pokemon.name, spriteStyle, isShiny);
  }, [pokemon.name, spriteStyle, isShiny]);
  const fallbackSpriteUrl = getPokemonArtworkUrl(pokemon.name, 'artwork', isShiny);

  // Berry calculation (Base + Recuentobayas / Berry Finding S if present)
  // WikiDex: Los Pokémon con la especialidad "Todo" tienen los efectos de bayas (1 baya adicional = 2 base)
  const baseBerryCount = (pokemon.specialty === 'Bayas' || pokemon.specialty === 'Todo') ? 2 : 1;
  const hasBfs = pokemon.subskills?.some(
    s => (s.name?.toLowerCase().includes('recuentobayas') || s.name?.toLowerCase().includes('berry finding')) && s.enabled
  );
  const berryMultiplier = baseBerryCount + (hasBfs ? 1 : 0);

  // Active ingredients
  const activeIngredients = pokemon.ingredients.filter(i => i.enabled);

  // Nature stats
  const natureName = pokemon.natureObj?.name || pokemon.nature || 'Neutra';
  const upStat = pokemon.natureObj?.upStat;
  const downStat = pokemon.natureObj?.downStat;

  // -------------------------------------------------------------
  // RENDER: COMPACT MODE (Scarlet & Violet Rental Team / VGC Style)
  // Uniform fixed height h-[142px], 4 clean move-like slots
  // -------------------------------------------------------------
  if (compact) {
    return (
      <>
        <div
          onClick={() => {
            if (onEdit) onEdit(pokemon);
            else setShowDetailModal(true);
          }}
          className={`h-[144px] max-h-[144px] min-h-[144px] glass-dreamy rounded-[26px] border border-white/10 p-2.5 relative overflow-hidden flex items-stretch gap-2.5 transition-all cursor-pointer group select-none active:scale-[0.99] hover:border-white/20 hover:shadow-xl ${
            isFavoriteBerry ? 'ring-2 ring-amber-300/40' : ''
          }`}
          title="Toca para editar o ver detalles completos"
        >
          {/* Subtle type ambient glow */}
          <div
            className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
            style={{ backgroundColor: typeTheme.glow }}
          />

          {/* Ghosted Slot Number Watermark */}
          {slotIndex !== undefined && (
            <span className="absolute right-3 bottom-0 text-5xl font-black text-white/[0.04] tabular-nums pointer-events-none select-none z-0">
              #{slotIndex + 1}
            </span>
          )}

          {/* LEFT COLUMN: Identity & Animated Sprite on Soft Halo */}
          <div className="w-[126px] sm:w-[134px] flex-shrink-0 flex flex-col justify-between pr-2 relative z-10">
            {/* Top row: Slot / Shiny / Specialty */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {slotIndex !== undefined && (
                  <span className="text-[9px] tabular-nums font-black text-purple-200 bg-white/10 px-1.5 py-0.2 rounded-full">
                    #{slotIndex + 1}
                  </span>
                )}
                {isShiny && (
                  <span className="text-[8px] font-black text-amber-200 bg-amber-400/20 px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" />
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-display font-bold px-2 py-0.2 rounded-full whitespace-nowrap ${specialtyBadge.bg} ${specialtyBadge.text}`}>
                {pokemon.specialty === 'Ingredientes' ? 'Ingr.' : pokemon.specialty === 'Habilidades' ? 'Skill' : pokemon.specialty}
              </span>
            </div>

            {/* Soft Circular Halo with Centered Animated Sprite & Floating Tier Gem */}
            <div className="relative mx-auto my-0.5 flex-shrink-0">
              <div className="w-[66px] h-[66px] rounded-full bg-gradient-to-b from-white/15 to-white/[0.03] p-1.5 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform shadow-inner">
                <div
                  className="absolute inset-0 opacity-25 rounded-full blur-xs"
                  style={{ backgroundColor: typeTheme.glow }}
                />
                {!imageError ? (
                  <img
                    src={primarySpriteUrl}
                    alt={pokemon.name}
                    loading="lazy"
                    onError={() => {
                      setImageError(true);
                    }}
                    className={`max-w-[52px] max-h-[52px] w-auto h-auto object-contain m-auto block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)] relative z-10 ${
                      spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                    }`}
                  />
                ) : (
                  <img
                    src={fallbackSpriteUrl}
                    alt={pokemon.name}
                    loading="lazy"
                    className="max-w-[52px] max-h-[52px] w-auto h-auto object-contain m-auto block filter drop-shadow relative z-10"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                )}
              </div>

              {/* Floating Tier Gem Badge on upper corner (Celestial Dreamy Palette) */}
              <span
                className={`absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full font-display font-black text-[9px] shadow-md border border-white/20 select-none z-20 ${
                  genetic.score >= 88 ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-purple-500/30' :
                  genetic.score >= 76 ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30' :
                  genetic.score >= 64 ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950' :
                  genetic.score >= 50 ? 'bg-gradient-to-r from-slate-500 to-indigo-900/60 text-slate-200' :
                  'bg-slate-800 text-slate-400'
                }`}
                title={`Genética: ${genetic.score} pts`}
              >
                {genetic.score >= 88 ? 'S+' : genetic.score >= 76 ? 'S' : genetic.score >= 64 ? 'A' : genetic.score >= 50 ? 'B' : 'C'}
              </span>
            </div>

            {/* Clean Name + Level & PA text */}
            <div className="text-center">
              <h4 className="font-display font-bold text-white text-xs tracking-tight truncate group-hover:text-purple-200 transition-colors">
                {pokemon.name}
              </h4>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300 font-semibold tabular-nums mt-0.5">
                <span className="text-purple-200 font-bold">Nv.{pokemon.level}</span>
                <span className="text-slate-500">•</span>
                <span className="text-white font-bold">PA {pokemon.rp.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Soft Illuminated, Wire-free Production Rows */}
          <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10 p-1 rounded-xl gap-1">
            {/* Slot 1: Baya & Producción */}
            <div className={`px-2 py-1 rounded-lg flex items-center justify-between text-[11px] ${
              isFavoriteBerry
                ? 'bg-amber-400/15 text-amber-100'
                : 'bg-white/[0.06] text-slate-100'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <img
                  src={getBerrySpriteUrl(pokemon.berry)}
                  alt={pokemon.berry}
                  className="w-3.5 h-3.5 object-contain flex-shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
                <span className="truncate font-semibold text-[10px]">{pokemon.berry}</span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0 tabular-nums">
                <span className="font-black text-[10px] text-amber-300">×{berryMultiplier}</span>
                {isFavoriteBerry && (
                  <span className="text-[8px] bg-amber-400/30 text-amber-300 px-1.5 py-0.2 rounded-full font-black">
                    ⭐ Fav
                  </span>
                )}
              </div>
            </div>

            {/* Slot 2: Habilidad Principal */}
            <div className="bg-white/[0.06] px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1.5 truncate">
                {mainSkillMeta.iconUrl ? (
                  <img
                    src={mainSkillMeta.iconUrl}
                    alt=""
                    className="w-3.5 h-3.5 object-contain flex-shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-[10px]">{mainSkillMeta.iconSymbol}</span>
                )}
                <span className="truncate font-semibold text-slate-100">{mainSkill}</span>
              </div>
              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full flex-shrink-0 ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                Nv. {skillLevel}
              </span>
            </div>

            {/* Slot 3: Ingredientes Activos (Unified Cream Pastel Pills, No Nested Boxes) */}
            <div className="bg-white/[0.06] px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
                Ingr
              </span>
              <div className="flex items-center gap-1 flex-wrap justify-end">
                {activeIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1 bg-amber-500/15 text-amber-100 px-2 py-0.5 rounded-full text-[10px] tabular-nums"
                    title={`${ing.name} ×${ing.count}`}
                  >
                    <img
                      src={getIngredientSpriteUrl(ing.name)}
                      alt={ing.name}
                      className="w-3 h-3 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="font-extrabold text-[10px]">×{ing.count}</span>
                  </span>
                ))}
                {activeIngredients.length === 0 && (
                  <span className="text-[9px] text-slate-400 italic">Nv.1</span>
                )}
              </div>
            </div>

            {/* Slot 4: Naturaleza & Frecuencia + Optional Quick Evo */}
            <div className="bg-white/[0.06] px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 truncate text-slate-200">
                <span className="truncate font-medium">{natureName}</span>
                {upStat && <span className="text-emerald-400 text-[8px] font-bold">▲</span>}
                {downStat && <span className="text-rose-400 text-[8px] font-bold">▼</span>}
                <span className="text-slate-500 mx-0.5">•</span>
                <span className="flex items-center gap-0.5 text-slate-300 tabular-nums text-[9px] font-semibold">
                  <Clock className="w-2.5 h-2.5 text-[var(--accent-primary)]" />
                  <span>{pokemon.frequencyStr}</span>
                </span>
              </div>

              {canPokemonEvolve(pokemon.name) && onEvolve && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEvolutionModal(true);
                  }}
                  className="flex items-center gap-0.5 text-[8px] font-display font-bold text-amber-200 bg-amber-500/25 hover:bg-amber-500 hover:text-slate-950 px-2 py-0.5 rounded-full transition-all"
                  title="Evolucionar Pokémon"
                >
                  <Dna className="w-2.5 h-2.5" />
                  <span>Evo</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* COMPACT DETAIL MODAL: Detailed Ficha without breaking grid height */}
        {showDetailModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="cozy-card rounded-3xl max-w-md w-full p-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with animated sprite */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-b from-white/15 to-white/[0.03] p-1.5 flex items-center justify-center flex-shrink-0 shadow-inner ring-1 ring-white/10 overflow-hidden">
                  <img
                    src={!imageError ? primarySpriteUrl : fallbackSpriteUrl}
                    alt={pokemon.name}
                    className={`w-full h-full object-contain filter drop-shadow ${
                      spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                    }`}
                    onError={() => setImageError(true)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-display font-bold text-lg text-white">{pokemon.name}</h3>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/40">
                      Nv. {pokemon.level}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.2 rounded-full border ${
                      genetic.score >= 88 ? 'bg-violet-500/20 text-violet-200 border-violet-400/40' :
                      genetic.score >= 76 ? 'bg-amber-400/20 text-amber-200 border-amber-400/40' :
                      genetic.score >= 64 ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' :
                      genetic.score >= 50 ? 'bg-blue-400/20 text-blue-200 border-blue-400/40' :
                      'bg-slate-700 text-slate-300 border-slate-600'
                    }`} title={`Genética: ${genetic.score} pts`}>
                      {genetic.score >= 88 ? 'Grado S+' : genetic.score >= 76 ? 'Grado S' : genetic.score >= 64 ? 'Grado A' : genetic.score >= 50 ? 'Grado B' : 'Grado C'} ({genetic.score} pts)
                    </span>
                    {dexId && (
                      <span className="text-[10px] tabular-nums font-bold text-slate-400 bg-white/5 px-2 py-0.2 rounded-full">
                        #{String(dexId).padStart(3, '0')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="tabular-nums font-bold text-amber-300">PA {pokemon.rp.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-slate-400 tabular-nums font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
                      {pokemon.frequencyStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialty & Berry */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Especialidad</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${specialtyBadge.bg} ${specialtyBadge.text} border ${specialtyBadge.border}`}>
                    {pokemon.specialty}
                  </span>
                </div>
                <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Baya ({berryMultiplier}x)</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <img src={getBerrySpriteUrl(pokemon.berry)} alt={pokemon.berry} className="w-4 h-4 object-contain" />
                    <span>{pokemon.berry}</span>
                    {isFavoriteBerry && <span className="text-amber-400 font-black">⭐</span>}
                  </div>
                </div>
              </div>

              {/* Habilidad Principal */}
              <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] p-2.5 rounded-xl mb-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Habilidad Principal</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    {mainSkillMeta.iconUrl ? (
                      <img
                        src={mainSkillMeta.iconUrl}
                        alt=""
                        className="w-4 h-4 object-contain flex-shrink-0"
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <span>{mainSkillMeta.iconSymbol}</span>
                    )}
                    <span>{mainSkill}</span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                    Skill
                  </span>
                </div>
              </div>

              {/* Subhabilidades */}
              <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] p-2.5 rounded-xl mb-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1.5">
                  Subhabilidades (Nv 10 / 25 / 50 / 75 / 100)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pokemon.subskills.map((sub, idx) => {
                    const tierStyles = {
                      'gold': sub.enabled
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 font-black'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through',
                      'blue': sub.enabled
                        ? 'bg-indigo-500/20 text-indigo-200 border-indigo-400/50 font-bold'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through',
                      'white': sub.enabled
                        ? 'bg-slate-800 text-slate-200 border-slate-700 font-semibold'
                        : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through'
                    }[sub.tier];

                    return (
                      <span
                        key={idx}
                        className={`text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${tierStyles}`}
                        title={`${sub.description} (${sub.enabled ? 'Activa' : `Desbloquea a Nv. ${sub.unlockLevel}`})`}
                      >
                        {!sub.enabled && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                        <span>{sub.name}</span>
                        <span className="text-[9px] opacity-75 tabular-nums font-bold">Nv.{sub.unlockLevel}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Ingredientes Timeline */}
              <div className="bg-[var(--surface-inner)] border border-[var(--surface-border)] p-2.5 rounded-xl mb-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1.5">
                  Ingredientes por Nivel
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {pokemon.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                        ing.enabled
                          ? 'bg-white/[0.05] border border-[var(--surface-border)] text-white'
                          : 'bg-slate-900/40 border border-dashed border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {ing.enabled ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <img src={getIngredientSpriteUrl(ing.name)} alt={ing.name} className="w-4 h-4 object-contain" />
                        <span>{ing.name}</span>
                      </div>
                      <span className={`tabular-nums font-bold ${ing.enabled ? 'text-amber-400' : 'text-slate-500'}`}>
                        ×{ing.count} (Nv.{ing.unlockLevel})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes if present */}
              {pokemon.notes && (
                <div className="bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 italic mb-4">
                  "{pokemon.notes}"
                </div>
              )}

              {/* Actions footer */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--surface-border)]">
                {canPokemonEvolve(pokemon.name) && onEvolve && (
                  <button
                    onClick={() => {
                      setShowEvolutionModal(true);
                    }}
                    className="btn-cozy-secondary px-3.5 py-2 text-xs flex items-center gap-1.5 text-amber-300 border-amber-400/30"
                    title={`Evolucionar a ${pokemon.name}`}
                  >
                    <Dna className="w-3.5 h-3.5 text-amber-300" />
                    <span>Evolucionar</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        onEdit(pokemon);
                      }}
                      className="btn-cozy-primary px-4 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Pokémon</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="btn-cozy-secondary px-4 py-2 text-xs"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Evolution Modal */}
        {showEvolutionModal && (
          <EvolutionModal
            isOpen={showEvolutionModal}
            onClose={() => setShowEvolutionModal(false)}
            pokemon={pokemon}
            onConfirmEvolution={(evolved) => {
              onEvolve?.(evolved);
              setShowDetailModal(false);
            }}
            spriteStyle={spriteStyle}
          />
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER: FULL / DETAILED MODE (Used in Pokédex & Detailed View)
  // Cozy Campfire & Field Journal Aesthetic
  // -------------------------------------------------------------
  return (
    <>
      <div
        onClick={() => {
          if (onEdit) onEdit(pokemon);
          else setShowDetailModal(true);
        }}
        className={`pokeball-watermark glass-dreamy rounded-[28px] border border-white/10 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:border-white/20 hover:shadow-2xl flex flex-col justify-between cursor-pointer active:scale-[0.995] ${
          isFavoriteBerry ? 'ring-2 ring-amber-300/40' : ''
        } p-4 sm:p-5`}
        title="Toca para editar Pokémon"
      >
        {/* Top ambient type glow */}
        <div
          className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ backgroundColor: typeTheme.glow }}
        />

        {/* Badges top bar */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <div className="flex items-center gap-1.5 flex-wrap">
            {dexId && (
              <span className="text-[10px] tabular-nums font-black text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                #{String(dexId).padStart(3, '0')}
              </span>
            )}
            {isShiny && (
              <span className="text-[9px] font-black text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-2.5 h-2.5" /> Shiny
              </span>
            )}
            {isSpecial && (
              <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                <Crown className="w-2.5 h-2.5" /> Especial
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {isFavoriteBerry && (
              <span className="bg-amber-400/20 text-amber-300 font-display font-bold text-[9px] px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-2.5 h-2.5 fill-current" /> ×2 Baya
              </span>
            )}

            {canPokemonEvolve(pokemon.name) && onEvolve && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEvolutionModal(true);
                }}
                className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-all shadow"
                title={`Evolucionar ${pokemon.name}`}
              >
                <Dna className="w-3.5 h-3.5" />
              </button>
            )}

            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(pokemon);
                }}
                className="p-2 rounded-xl bg-white/10 hover:bg-[var(--accent-primary)] hover:text-slate-950 text-slate-300 transition-all shadow"
                title="Editar Pokémon"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div>
          {/* Pokemon Image & Name presentation */}
          <div className="flex items-center gap-3.5 mb-3 relative z-10">
            {/* Sprite with Soft Circular Halo & Floating Tier Gem */}
            <div className="relative flex-shrink-0">
              <div className="w-[74px] h-[74px] rounded-full bg-gradient-to-b from-white/15 to-white/[0.03] p-1.5 flex items-center justify-center relative flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner overflow-hidden">
                <div
                  className="absolute inset-0 opacity-25 rounded-full blur-sm"
                  style={{ backgroundColor: typeTheme.glow }}
                />
                {!imageError ? (
                  <img
                    src={primarySpriteUrl}
                    alt={pokemon.name}
                    loading="lazy"
                    onError={() => setImageError(true)}
                    className={`max-w-[58px] max-h-[58px] w-auto h-auto object-contain m-auto block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] relative z-10 ${
                      spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                    }`}
                  />
                ) : (
                  <img
                    src={fallbackSpriteUrl}
                    alt={pokemon.name}
                    loading="lazy"
                    className="max-w-[58px] max-h-[58px] w-auto h-auto object-contain m-auto block filter drop-shadow relative z-10"
                  />
                )}
              </div>

              {/* Floating Tier Gem Badge (Celestial Dreamy Palette) */}
              <span
                className={`absolute -top-1 -right-1 px-2 py-0.5 rounded-full font-display font-black text-[9px] shadow-md border border-white/20 select-none z-20 ${
                  genetic.score >= 88 ? 'bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white shadow-purple-500/30' :
                  genetic.score >= 76 ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30' :
                  genetic.score >= 64 ? 'bg-gradient-to-r from-teal-400 to-cyan-500 text-slate-950 font-black' :
                  genetic.score >= 50 ? 'bg-gradient-to-r from-slate-500 to-indigo-900/60 text-slate-200' :
                  'bg-slate-800 text-slate-400'
                }`}
                title={`Genética: ${genetic.score} pts`}
              >
                {genetic.score >= 88 ? 'S+' : genetic.score >= 76 ? 'S' : genetic.score >= 64 ? 'A' : genetic.score >= 50 ? 'B' : 'C'}
              </span>
            </div>

            {/* Name & Stats */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-display font-bold text-white text-base tracking-tight truncate group-hover:text-purple-200 transition-colors">
                  {pokemon.name}
                </h3>
                <span className="text-[10px] font-bold text-purple-200 bg-purple-500/20 px-2 py-0.2 rounded-full flex-shrink-0">
                  Nv. {pokemon.level}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="flex items-center gap-1 font-bold text-white bg-white/10 px-2.5 py-0.5 rounded-full tabular-nums">
                  <span className="text-[9px] text-[var(--accent-primary)] font-black">PA</span>
                  <span className="text-sm font-black tracking-tight">{pokemon.rp.toLocaleString()}</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-300 tabular-nums font-semibold">
                  <Clock className="w-3 h-3 text-[var(--accent-primary)]" />
                  <span>{pokemon.frequencyStr}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Badges: Especialidad, Baya, Naturaleza */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            <span className={`text-[10px] font-display font-bold px-2.5 py-0.5 rounded-full ${specialtyBadge.bg} ${specialtyBadge.text}`}>
              {pokemon.specialty}
            </span>

            <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${typeTheme.badgeBg} ${typeTheme.badgeText} flex items-center gap-1.5`}>
              <img
                src={getBerrySpriteUrl(pokemon.berry)}
                alt={pokemon.berry}
                className="w-3.5 h-3.5 object-contain flex-shrink-0"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span>{pokemon.berry}</span>
            </span>

            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-slate-200 font-medium" title={pokemon.nature}>
              {natureName}
              {upStat && <span className="text-emerald-400 ml-1 font-bold">▲</span>}
              {downStat && <span className="text-rose-400 font-bold">▼</span>}
            </span>
          </div>

          {/* Habilidad Principal */}
          <div className="mb-2.5 flex items-center justify-between bg-white/[0.04] backdrop-blur-md border border-white/5 px-3 py-1.5 rounded-full">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-display">Habilidad</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-sm ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                {mainSkillMeta.iconUrl ? (
                  <img
                    src={mainSkillMeta.iconUrl}
                    alt=""
                    className="w-3.5 h-3.5 object-contain flex-shrink-0"
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                  />
                ) : (
                  <span>{mainSkillMeta.iconSymbol}</span>
                )}
                <span className="truncate max-w-[130px]">{mainSkill}</span>
              </span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                Nv. {skillLevel}
              </span>
            </div>
          </div>

          {/* Ingredientes Activos */}
          <div className="mb-3 bg-white/[0.04] backdrop-blur-md border border-white/5 p-2.5 rounded-2xl">
            <div className="text-[9px] uppercase font-bold font-display text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Ingredientes</span>
              <span className="text-[9px] text-slate-400 font-semibold tabular-nums">Nv 1 / 30 / 60</span>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs">
              {pokemon.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                    ing.enabled
                      ? 'bg-white/[0.06] text-slate-100 shadow-sm'
                      : 'bg-white/[0.02] text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {ing.enabled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                    )}
                    <img
                      src={getIngredientSpriteUrl(ing.name)}
                      alt={ing.name}
                      className="w-4 h-4 object-contain flex-shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="truncate font-semibold">{ing.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0 tabular-nums">
                    <span className={`font-black text-xs ${ing.enabled ? 'text-[var(--accent-primary)]' : 'text-slate-500'}`}>
                      ×{ing.count}
                    </span>
                    {!ing.enabled && (
                      <span className="text-[9px] text-slate-400">(Nv.{ing.unlockLevel})</span>
                    )}
                  </div>
                </div>
              ))}
              {pokemon.ingredients.length === 0 && (
                <span className="text-xs text-slate-500 italic">Sin ingredientes registrados</span>
              )}
            </div>
          </div>

          {/* Subhabilidades */}
          <div className="mb-2 bg-white/[0.04] backdrop-blur-md border border-white/5 p-2.5 rounded-2xl">
            <div className="text-[9px] uppercase font-bold font-display text-slate-400 tracking-wider mb-1.5">
              Subhabilidades
            </div>
            <div className="flex flex-wrap gap-1">
              {pokemon.subskills.map((sub, idx) => {
                const tierStyles = {
                  'gold': sub.enabled
                    ? 'bg-amber-500/20 text-amber-100 border border-amber-300/30 font-bold shadow-sm'
                    : 'bg-white/[0.03] text-slate-500 line-through',
                  'blue': sub.enabled
                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 font-bold shadow-sm'
                    : 'bg-white/[0.03] text-slate-500 line-through',
                  'white': sub.enabled
                    ? 'bg-white/10 text-slate-200 font-semibold'
                    : 'bg-white/[0.03] text-slate-500 line-through'
                }[sub.tier];

                return (
                  <span
                    key={idx}
                    className={`text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1 ${tierStyles}`}
                    title={`${sub.description} (${sub.enabled ? 'Activa' : `Se desbloquea a Nv. ${sub.unlockLevel}`})`}
                  >
                    {!sub.enabled && <Lock className="w-2.5 h-2.5 text-slate-500" />}
                    <span>{sub.name}</span>
                  </span>
                );
              })}
              {pokemon.subskills.length === 0 && (
                <span className="text-xs text-slate-500 italic">Sin subhabilidades registradas</span>
              )}
            </div>
          </div>

          {/* Sinergia / Estrategia footer note if present */}
          {pokemon.notes && (
            <div className="mt-2 pt-2 border-t border-[var(--surface-border)] text-[10px] text-slate-300 italic line-clamp-2">
              "{pokemon.notes}"
            </div>
          )}
        </div>
      </div>

    {/* Evolution Modal */}
    {showEvolutionModal && (
      <EvolutionModal
        isOpen={showEvolutionModal}
        onClose={() => setShowEvolutionModal(false)}
        pokemon={pokemon}
        onConfirmEvolution={(evolved) => {
          onEvolve?.(evolved);
        }}
        spriteStyle={spriteStyle}
      />
    )}
  </>
  );
};
