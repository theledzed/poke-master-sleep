import React, { useState } from 'react';
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
  isSpecialPokemon
} from '../services/pokeApiService';
import { getPokemonSkillLevel } from '../services/optimizer';
import {
  Lock,
  CheckCircle2,
  Zap,
  Clock,
  Sparkles,
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
  compact?: boolean;
  spriteStyle?: 'artwork' | 'showdown';
  slotIndex?: number;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  pokemon,
  isFavoriteBerry = false,
  onEdit,
  compact = false,
  spriteStyle = 'showdown',
  slotIndex
}) => {
  const [imageError, setImageError] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const berryMeta = BERRIES[pokemon.berry];
  const typeTheme = getTypeTheme(berryMeta?.type || 'Normal');
  const dexId = getPokemonDexId(pokemon.name);

  const isShiny = pokemon.notes?.toLowerCase().includes('shiny') || pokemon.notes?.toLowerCase().includes('variocolor');
  const isSpecial = isSpecialPokemon(pokemon);
  const mainSkill = pokemon.mainSkillName || getPokemonCanonicalSkill(pokemon.name);
  const mainSkillMeta = getMainSkillMeta(mainSkill);
  const skillLevel = getPokemonSkillLevel(pokemon);

  // Specialty badge colors
  const specialtyBadge = {
    'Bayas': { bg: 'bg-rose-500/15', text: 'text-rose-300', border: 'border-rose-500/30' },
    'Ingredientes': { bg: 'bg-emerald-500/15', text: 'text-emerald-300', border: 'border-emerald-500/30' },
    'Habilidades': { bg: 'bg-indigo-500/15', text: 'text-indigo-300', border: 'border-indigo-500/30' },
    'Todo': { bg: 'bg-amber-500/15', text: 'text-amber-300', border: 'border-amber-500/30' }
  }[pokemon.specialty] || { bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

  // Always use animated Showdown GIF first, fallback to artwork on error
  const animatedGifUrl = getPokemonArtworkUrl(pokemon.name, 'showdown', isShiny);
  const staticFallbackUrl = getPokemonArtworkUrl(pokemon.name, 'artwork', isShiny);

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
          className={`h-[142px] max-h-[142px] min-h-[142px] bg-[#0c2444]/90 backdrop-blur-md border rounded-2xl p-2.5 relative overflow-hidden flex items-stretch gap-2.5 transition-all shadow-md shadow-[#040c17]/40 hover:shadow-xl hover:shadow-[#040c17]/60 group select-none ${
            isFavoriteBerry
              ? 'border-sky-400/40 bg-gradient-to-br from-[#0e2a4f]/95 via-[#0c2444]/95 to-[#08182d]/95'
              : 'border-sky-400/20 hover:border-sky-400/40'
          }`}
        >
          {/* Subtle type ambient glow */}
          <div
            className="absolute -top-10 -left-10 w-28 h-28 rounded-full blur-2xl pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity"
            style={{ backgroundColor: typeTheme.glow }}
          />

          {/* Ghosted Slot Number Watermark (Scarlet/Violet style) */}
          {slotIndex !== undefined && (
            <span className="absolute right-3 bottom-0 text-5xl font-black text-sky-400/[0.06] font-mono pointer-events-none select-none z-0">
              #{slotIndex + 1}
            </span>
          )}

          {/* LEFT COLUMN: Identity & Animated Sprite on Pedestal */}
          <div className="w-[126px] sm:w-[134px] flex-shrink-0 flex flex-col justify-between pr-2 border-r border-sky-400/15 relative z-10">
            {/* Top row: Dex / Shiny / Fav indicator */}
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                {slotIndex !== undefined && (
                  <span className="text-[9px] font-mono font-black text-sky-300 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-400/20">
                    #{slotIndex + 1}
                  </span>
                )}
                {isShiny && (
                  <span className="text-[8px] font-black text-amber-300 bg-amber-400/20 px-1 rounded flex items-center gap-0.5">
                    <Sparkles className="w-2 h-2" />
                  </span>
                )}
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border whitespace-nowrap ${specialtyBadge.bg} ${specialtyBadge.text} ${specialtyBadge.border}`}>
                {pokemon.specialty === 'Ingredientes' ? 'Ingr.' : pokemon.specialty === 'Habilidades' ? 'Skill' : pokemon.specialty}
              </span>
            </div>

            {/* Pedestal with EXACT Fixed Dimensions & Centered Animated Showdown Sprite */}
            <div className="w-[66px] h-[66px] min-w-[66px] min-h-[66px] max-w-[66px] max-h-[66px] rounded-xl bg-gradient-to-b from-sky-400/15 to-transparent border border-sky-400/25 flex items-center justify-center p-1 relative mx-auto my-0.5 overflow-hidden group-hover:scale-105 transition-transform shadow-inner flex-shrink-0">
              <div
                className="absolute inset-0 opacity-20 rounded-xl blur-xs"
                style={{ backgroundColor: typeTheme.glow }}
              />
              {!imageError ? (
                <img
                  src={animatedGifUrl}
                  alt={pokemon.name}
                  loading="lazy"
                  onError={() => {
                    // Fallback to static official artwork if showdown GIF fails
                    setImageError(true);
                  }}
                  className="max-w-[54px] max-h-[54px] w-auto h-auto object-contain m-auto block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.55)] relative z-10"
                />
              ) : (
                <img
                  src={staticFallbackUrl}
                  alt={pokemon.name}
                  loading="lazy"
                  className="max-w-[54px] max-h-[54px] w-auto h-auto object-contain m-auto block filter drop-shadow relative z-10"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              )}
            </div>

            {/* Name + Level & PA Badges */}
            <div className="text-center">
              <h4 className="font-black text-white text-xs tracking-tight truncate group-hover:text-sky-300 transition-colors">
                {pokemon.name}
              </h4>
              <div className="flex items-center justify-center gap-1 text-[9px] font-mono mt-0.5">
                <span className="text-emerald-300 font-bold bg-emerald-500/20 px-1 py-0.2 rounded">
                  Nv.{pokemon.level}
                </span>
                <span className="text-sky-300 font-bold bg-sky-500/20 px-1 py-0.2 rounded font-black">
                  PA {pokemon.rp.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The 4 Move/Production Slots (Scarlet/Violet style) */}
          <div className="flex-1 flex flex-col justify-between min-w-0 relative z-10">
            {/* Slot 1: Baya & Producción */}
            <div className={`px-2 py-1 rounded-lg border flex items-center justify-between text-[11px] ${
              isFavoriteBerry
                ? 'bg-amber-400/10 border-amber-400/30 text-amber-200'
                : 'bg-[#08182c]/85 border-sky-400/15 text-slate-200'
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
              <div className="flex items-center gap-1 flex-shrink-0 font-mono">
                <span className="font-black text-[10px] text-amber-400">×{berryMultiplier}</span>
                {isFavoriteBerry && (
                  <span className="text-[8px] bg-amber-400/25 text-amber-300 px-1 py-0.2 rounded font-black">
                    ⭐ Fav
                  </span>
                )}
              </div>
            </div>

            {/* Slot 2: Habilidad Principal */}
            <div className="bg-[#08182c]/85 border border-sky-400/15 px-2 py-1 rounded-lg flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 truncate">
                <span className="text-[10px]">{mainSkillMeta.iconSymbol}</span>
                <span className="truncate font-semibold text-slate-200">{mainSkill}</span>
              </div>
              <span className={`text-[8px] font-black px-1.5 py-0.2 rounded flex-shrink-0 ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                Nv. {skillLevel}
              </span>
            </div>

            {/* Slot 3: Ingredientes Activos */}
            <div className="bg-[#08182c]/85 border border-sky-400/15 px-2 py-0.5 rounded-lg flex items-center justify-between text-[10px]">
              <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
                Ingr
              </span>
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {activeIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-0.5 bg-sky-950/60 px-1.5 py-0.2 rounded border border-sky-400/15 text-[10px] text-slate-200"
                    title={`${ing.name} ×${ing.count}`}
                  >
                    <img
                      src={getIngredientSpriteUrl(ing.name)}
                      alt={ing.name}
                      className="w-3 h-3 object-contain"
                      onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                    />
                    <span className="font-mono font-black text-amber-400 text-[10px]">×{ing.count}</span>
                  </span>
                ))}
                {activeIngredients.length === 0 && (
                  <span className="text-[9px] text-slate-500 italic">Nv.1</span>
                )}
              </div>
            </div>

            {/* Slot 4: Naturaleza & Frecuencia + Ficha Action */}
            <div className="bg-[#08182c]/85 border border-sky-400/15 px-2 py-0.5 rounded-lg flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 truncate text-slate-300">
                <span className="truncate font-medium">{natureName}</span>
                {upStat && <span className="text-emerald-400 text-[8px] font-bold">▲</span>}
                {downStat && <span className="text-rose-400 text-[8px] font-bold">▼</span>}
                <span className="text-slate-500 mx-0.5">•</span>
                <span className="flex items-center gap-0.5 text-slate-400 font-mono text-[9px]">
                  <Clock className="w-2.5 h-2.5 text-sky-400" />
                  <span>{pokemon.frequencyStr}</span>
                </span>
              </div>

              {/* Ficha Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailModal(true);
                }}
                className="flex items-center gap-0.5 text-[9px] font-black text-sky-300 hover:text-white bg-sky-500/20 hover:bg-sky-500/40 px-1.5 py-0.2 rounded border border-sky-400/30 transition-all flex-shrink-0"
                title="Ver Ficha y Subhabilidades"
              >
                <Info className="w-2.5 h-2.5" />
                <span>Ficha</span>
              </button>
            </div>
          </div>
        </div>

        {/* COMPACT DETAIL MODAL: Detailed Ficha without breaking grid height */}
        {showDetailModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          >
            <div
              className="bg-[#0c2444] border border-sky-400/30 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header with animated sprite */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-sky-400/20 to-sky-400/5 border border-sky-400/30 p-1 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <img
                    src={animatedGifUrl}
                    alt={pokemon.name}
                    className="w-full h-full object-contain filter drop-shadow"
                    onError={() => setImageError(true)}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-lg text-white">{pokemon.name}</h3>
                    <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/40">
                      Nv. {pokemon.level}
                    </span>
                    {dexId && (
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.2 rounded-full">
                        #{String(dexId).padStart(3, '0')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <span className="font-mono font-bold text-sky-300">PA {pokemon.rp.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-400" />
                      {pokemon.frequencyStr}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specialty & Berry */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="bg-[#08182c]/90 border border-sky-400/20 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Especialidad</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md inline-block ${specialtyBadge.bg} ${specialtyBadge.text} border ${specialtyBadge.border}`}>
                    {pokemon.specialty}
                  </span>
                </div>
                <div className="bg-[#08182c]/90 border border-sky-400/20 p-2.5 rounded-xl">
                  <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Baya ({berryMultiplier}x)</span>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <img src={getBerrySpriteUrl(pokemon.berry)} alt={pokemon.berry} className="w-4 h-4 object-contain" />
                    <span>{pokemon.berry}</span>
                    {isFavoriteBerry && <span className="text-amber-400 font-black">⭐</span>}
                  </div>
                </div>
              </div>

              {/* Habilidad Principal */}
              <div className="bg-[#08182c]/90 border border-sky-400/20 p-2.5 rounded-xl mb-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1">Habilidad Principal</span>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                    <span>{mainSkillMeta.iconSymbol}</span>
                    <span>{mainSkill}</span>
                  </div>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
                    Skill
                  </span>
                </div>
              </div>

              {/* Subhabilidades */}
              <div className="bg-[#08182c]/90 border border-sky-400/20 p-2.5 rounded-xl mb-3">
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
                        ? 'bg-sky-400/20 text-sky-300 border-sky-400/50 font-black'
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
                        <span className="text-[9px] opacity-75 font-mono">Nv.{sub.unlockLevel}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Ingredientes Timeline */}
              <div className="bg-[#08182c]/90 border border-sky-400/20 p-2.5 rounded-xl mb-3">
                <span className="text-[9px] uppercase font-black text-slate-400 block mb-1.5">
                  Ingredientes por Nivel
                </span>
                <div className="grid grid-cols-1 gap-1">
                  {pokemon.ingredients.map((ing, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs ${
                        ing.enabled
                          ? 'bg-sky-950/70 border border-sky-400/30 text-white'
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
                      <span className={`font-mono font-bold ${ing.enabled ? 'text-amber-400' : 'text-slate-500'}`}>
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
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-sky-400/20">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      onEdit(pokemon);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Pokémon</span>
                  </button>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // -------------------------------------------------------------
  // RENDER: FULL / DETAILED MODE (Used in Pokédex & Detailed View)
  // Updated with Pokémon Sapphire Blue palette and animated Showdown GIF
  // -------------------------------------------------------------
  return (
    <div
      className={`pokeball-watermark bg-[#0c2444]/90 backdrop-blur-md border rounded-3xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-2xl flex flex-col justify-between ${
        isFavoriteBerry
          ? 'border-sky-400/40 bg-gradient-to-b from-[#0e2a4f]/95 via-[#0c2444]/95 to-[#08182d]/95 shadow-lg shadow-sky-950/40'
          : 'border-sky-400/20 hover:border-sky-400/35'
      } p-4`}
    >
      {/* Top ambient type glow */}
      <div
        className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none opacity-25 group-hover:opacity-50 transition-opacity"
        style={{ backgroundColor: typeTheme.glow }}
      />

      {/* Badges top bar */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-1.5 flex-wrap">
          {dexId && (
            <span className="text-[10px] font-mono font-black text-slate-300 bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-400/20">
              #{String(dexId).padStart(3, '0')}
            </span>
          )}
          {isShiny && (
            <span className="text-[9px] font-black text-amber-300 bg-amber-400/20 border border-amber-400/40 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles className="w-2.5 h-2.5" /> Shiny
            </span>
          )}
          {isSpecial && (
            <span className="text-[9px] font-black text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
              <Crown className="w-2.5 h-2.5" /> Especial
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {isFavoriteBerry && (
            <span className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-md border border-sky-300/40 uppercase tracking-wider flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-current" /> ×2 Baya
            </span>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(pokemon)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-sky-950/80 hover:bg-sky-500 text-slate-300 hover:text-white transition-all shadow"
              title="Editar Pokémon"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      <div>
        {/* Pokemon Image & Name presentation */}
        <div className="flex items-center gap-3.5 mb-3 relative z-10">
          {/* Sprite Box with Type Halo Pedestal - EXACT FIXED DIMENSIONS */}
          <div className="w-[76px] h-[76px] min-w-[76px] min-h-[76px] max-w-[76px] max-h-[76px] rounded-2xl bg-gradient-to-b from-sky-400/15 to-transparent border border-sky-400/25 flex items-center justify-center p-1.5 relative flex-shrink-0 group-hover:scale-105 transition-transform shadow-inner overflow-hidden">
            <div
              className="absolute inset-0 opacity-25 rounded-2xl blur-sm"
              style={{ backgroundColor: typeTheme.glow }}
            />
            {!imageError ? (
              <img
                src={animatedGifUrl}
                alt={pokemon.name}
                loading="lazy"
                onError={() => setImageError(true)}
                className="max-w-[60px] max-h-[60px] w-auto h-auto object-contain m-auto block filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)] relative z-10"
              />
            ) : (
              <img
                src={staticFallbackUrl}
                alt={pokemon.name}
                loading="lazy"
                className="max-w-[60px] max-h-[60px] w-auto h-auto object-contain m-auto block filter drop-shadow relative z-10"
              />
            )}
          </div>

          {/* Name & Stats */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-black text-white text-base tracking-tight truncate group-hover:text-sky-300 transition-colors">
                {pokemon.name}
              </h3>
              <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.2 rounded-full border border-emerald-500/40 flex-shrink-0">
                Nv. {pokemon.level}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="flex items-center gap-1 font-bold text-white bg-sky-950/80 px-2 py-0.5 rounded-lg border border-sky-400/20">
                <span className="text-[9px] text-sky-400 font-black">PA</span>
                <span className="font-mono text-sm font-black tracking-tight">{pokemon.rp.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3 text-sky-400" />
                <span>{pokemon.frequencyStr}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Badges: Especialidad, Baya, Naturaleza */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${specialtyBadge.bg} ${specialtyBadge.text} ${specialtyBadge.border}`}>
            {pokemon.specialty}
          </span>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border ${typeTheme.badgeBg} ${typeTheme.badgeText} ${typeTheme.badgeBorder} flex items-center gap-1.5`}>
            <img
              src={getBerrySpriteUrl(pokemon.berry)}
              alt={pokemon.berry}
              className="w-3.5 h-3.5 object-contain flex-shrink-0"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <span>{pokemon.berry}</span>
          </span>

          <span className="text-[10px] px-2 py-0.5 rounded-lg bg-sky-950/80 border border-sky-400/20 text-slate-300 font-medium" title={pokemon.nature}>
            {natureName}
            {upStat && <span className="text-emerald-400 ml-1 font-bold">▲</span>}
            {downStat && <span className="text-rose-400 font-bold">▼</span>}
          </span>
        </div>

        {/* Habilidad Principal */}
        <div className="mb-2.5 flex items-center justify-between bg-sky-950/70 px-3 py-1.5 rounded-2xl border border-sky-400/15">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black">Habilidad</span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-sm ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
              <span>{mainSkillMeta.iconSymbol}</span>
              <span className="truncate max-w-[130px]">{mainSkill}</span>
            </span>
            <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md border ${mainSkillMeta.badgeBg} ${mainSkillMeta.badgeText}`}>
              Nv. {skillLevel}
            </span>
          </div>
        </div>

        {/* Ingredientes Activos */}
        <div className="mb-3 bg-sky-950/70 p-2.5 rounded-2xl border border-sky-400/15">
          <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
            <span>Ingredientes</span>
            <span className="text-[9px] text-slate-500 font-mono">Nv 1 / 30 / 60</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {pokemon.ingredients.map((ing, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl text-[11px] transition-all ${
                  ing.enabled
                    ? 'bg-sky-900/60 text-slate-200 border border-sky-400/25 shadow-sm'
                    : 'bg-slate-950/40 text-slate-500 border border-dashed border-sky-400/10'
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
                <div className="flex items-center gap-1.5 flex-shrink-0 font-mono">
                  <span className={`font-black text-xs ${ing.enabled ? 'text-sky-300' : 'text-slate-500'}`}>
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
        <div className="mb-2">
          <div className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-1.5">
            Subhabilidades
          </div>
          <div className="flex flex-wrap gap-1">
            {pokemon.subskills.map((sub, idx) => {
              const tierStyles = {
                'gold': sub.enabled
                  ? 'bg-amber-500/10 text-amber-100 border-amber-300/30 font-bold shadow-sm'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through',
                'blue': sub.enabled
                  ? 'bg-sky-400/20 text-sky-300 border-sky-400/50 font-black shadow-sm'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through',
                'white': sub.enabled
                  ? 'bg-slate-800 text-slate-200 border-slate-700 font-semibold'
                  : 'bg-slate-900/50 text-slate-500 border-slate-800 line-through'
              }[sub.tier];

              return (
                <span
                  key={idx}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${tierStyles}`}
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
          <div className="mt-2 pt-2 border-t border-sky-400/15 text-[10px] text-slate-300 italic line-clamp-2">
            "{pokemon.notes}"
          </div>
        )}
      </div>
    </div>
  );
};
