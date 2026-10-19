import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Dna,
  ArrowRight,
  Zap,
  TrendingUp,
  Package,
  Star,
  CheckCircle2,
  Wand2
} from 'lucide-react';
import { Pokemon } from '../types/pokemon';
import { MasterSpecies } from '../data/speciesMaster';
import { SpriteStyle, getPokemonArtworkUrl, getMainSkillIconUrl, getBerrySpriteUrl } from '../services/pokeApiService';
import {
  getAvailableEvolutions,
  calculateEvolutionPreview,
  EvolutionPreview
} from '../services/evolutionService';

interface EvolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: Pokemon | null;
  onConfirmEvolution: (evolvedPokemon: Pokemon) => void;
  spriteStyle?: SpriteStyle;
}

export const EvolutionModal: React.FC<EvolutionModalProps> = ({
  isOpen,
  onClose,
  pokemon,
  onConfirmEvolution,
  spriteStyle = 'sleep'
}) => {
  if (!isOpen || !pokemon) return null;

  const availableEvolutions = useMemo(() => {
    return getAvailableEvolutions(pokemon.name);
  }, [pokemon.name]);

  const [selectedTargetIndex, setSelectedTargetIndex] = useState(0);
  const [isEvolvingAnimation, setIsEvolvingAnimation] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  // Fallback to first target if index is out of bounds
  const targetMaster: MasterSpecies | undefined =
    availableEvolutions[selectedTargetIndex] || availableEvolutions[0];

  const preview: EvolutionPreview | null = useMemo(() => {
    if (!targetMaster) return null;
    return calculateEvolutionPreview(pokemon, targetMaster);
  }, [pokemon, targetMaster]);

  // Robust multi-tier image fallback: Sleep portrait -> PokeAPI Official Artwork
  const [currentImgError, setCurrentImgError] = useState(false);
  const [targetImgError, setTargetImgError] = useState(false);

  useEffect(() => {
    setCurrentImgError(false);
    setTargetImgError(false);
  }, [pokemon.name, targetMaster?.name, spriteStyle]);

  if (!targetMaster || !preview) {
    return null;
  }

  const handleEvolve = () => {
    setIsEvolvingAnimation(true);
    setTimeout(() => {
      setShowSuccessBadge(true);
      setTimeout(() => {
        onConfirmEvolution(preview.evolvedPokemon);
        setIsEvolvingAnimation(false);
        setShowSuccessBadge(false);
        onClose();
      }, 1100);
    }, 700);
  };

  const currentArtworkUrl = currentImgError
    ? getPokemonArtworkUrl(pokemon.name, 'artwork', false)
    : getPokemonArtworkUrl(pokemon.name, spriteStyle, false);

  const targetArtworkUrl = targetImgError
    ? getPokemonArtworkUrl(targetMaster.name, 'artwork', false)
    : getPokemonArtworkUrl(targetMaster.name, spriteStyle, false);

  const berryIconUrl = getBerrySpriteUrl(targetMaster.berry);
  const skillIconUrl = getMainSkillIconUrl(targetMaster.mainSkill);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl cozy-card border border-[var(--surface-border)] rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[92vh]">
        {/* Glowing Top Ambient Header */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-purple-500/15 via-transparent to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--surface-border)] flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-400 p-0.5 shadow-lg shadow-purple-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[var(--surface-inner)] rounded-[14px] flex items-center justify-center">
                <Dna className="w-5 h-5 text-purple-200 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Laboratorio de Evolución</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full">
                  What-If
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simula el salto exacto de estadísticas antes de evolucionar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isEvolvingAnimation}
            className="p-1.5 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 relative z-10 custom-scrollbar">
          {/* Branching Evolutions Selector (e.g. Eevee, Kirlia, Slowpoke) */}
          {availableEvolutions.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                <span>Ramas de Evolución Disponibles ({availableEvolutions.length})</span>
                <span className="text-[10px] text-purple-200 font-semibold">Selecciona tu objetivo</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {availableEvolutions.map((target, idx) => {
                  const isSelected = selectedTargetIndex === idx;
                  const thumbUrl = getPokemonArtworkUrl(target.name, 'sleep', false);
                  return (
                    <button
                      key={target.name}
                      type="button"
                      onClick={() => setSelectedTargetIndex(idx)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-bold transition-all text-left ${
                        isSelected
                          ? 'bg-purple-500/25 border-purple-400 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-400'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-white/5 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={thumbUrl}
                        alt={target.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getPokemonArtworkUrl(target.name, 'artwork', false);
                        }}
                        className="w-7 h-7 object-contain rounded-full bg-slate-950/80 p-0.5 flex-shrink-0"
                      />
                      <span className="truncate">{target.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Arena */}
          <div className="grid grid-cols-1 sm:grid-cols-11 gap-3 items-center">
            {/* Left Card: Current Stage */}
            <div className="sm:col-span-5 bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 space-y-2.5 relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 border-b border-slate-800/80 pb-1.5">
                <span>Forma Actual</span>
                <span className="tabular-nums font-bold text-slate-300">Nv. {pokemon.level}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
                  <img
                    src={currentArtworkUrl}
                    alt={pokemon.name}
                    onError={() => setCurrentImgError(true)}
                    className={`w-full h-full object-contain ${
                      spriteStyle === 'sleep' && !currentImgError ? 'rounded-full' : ''
                    }`}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-[var(--text-heading)] truncate">{pokemon.name}</h4>
                  <p className="text-[11px] text-slate-400 truncate">{pokemon.specialty}</p>
                  <p className="text-[11px] tabular-nums text-white font-bold">{preview.frequencyStrBefore}</p>
                </div>
              </div>

              {/* Current Stats List */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex items-center justify-between bg-white/[0.04] px-2 py-1 rounded-lg">
                  <span className="text-slate-400 text-[11px]">Habilidad:</span>
                  <span className="font-bold text-slate-200 truncate max-w-[140px] text-right">
                    {pokemon.mainSkillName || 'Habilidad'} (Nv. {preview.skillLevelBefore})
                  </span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.04] px-2 py-1 rounded-lg">
                  <span className="text-slate-400 text-[11px]">Inventario:</span>
                  <span className="font-bold tabular-nums text-slate-200">{preview.carryLimitBefore} slots</span>
                </div>
                <div className="flex items-center justify-between bg-white/[0.04] px-2 py-1 rounded-lg">
                  <span className="text-slate-400 text-[11px]">Puntos Ayuda (PA):</span>
                  <span className="font-bold tabular-nums text-slate-200">{preview.rpBefore}</span>
                </div>
              </div>
            </div>

            {/* Center Transformation Pillar */}
            <div className="sm:col-span-1 flex sm:flex-col items-center justify-center gap-1.5 py-1 sm:py-0">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center shadow-md shadow-purple-500/10">
                <ArrowRight className="w-4 h-4 text-purple-200 transform sm:rotate-0 rotate-90" />
              </div>
            </div>

            {/* Right Card: Evolved Stage */}
            <div
              className={`sm:col-span-5 bg-gradient-to-br from-purple-500/10 via-[var(--surface-card)] to-[var(--surface-inner)] border border-purple-400/40 rounded-2xl p-3.5 space-y-2.5 relative overflow-hidden shadow-lg shadow-purple-500/10 transition-all ${
                isEvolvingAnimation ? 'ring-4 ring-purple-400 scale-[1.02] duration-300' : ''
              }`}
            >
              {/* Subtle Aura */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-400/15 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center justify-between text-[11px] font-bold text-purple-200 border-b border-purple-400/20 pb-1.5">
                <span className="flex items-center gap-1">
                  <Dna className="w-3.5 h-3.5 text-purple-200" />
                  <span>Tras Evolucionar</span>
                </span>
                <span className="tabular-nums text-emerald-400 font-black">Nv. {pokemon.level}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-purple-400/40 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-md">
                  <img
                    src={targetArtworkUrl}
                    alt={targetMaster.name}
                    onError={() => setTargetImgError(true)}
                    className={`w-full h-full object-contain ${
                      spriteStyle === 'sleep' && !targetImgError ? 'rounded-full' : ''
                    } ${isEvolvingAnimation ? 'scale-110 filter brightness-125 transition-transform' : ''}`}
                  />
                  {showSuccessBadge && (
                    <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-xs flex items-center justify-center animate-in zoom-in-75">
                      <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-sm text-[var(--text-heading)] truncate flex items-center gap-1">
                    <span>{targetMaster.name}</span>
                  </h4>
                  <p className="text-[11px] text-slate-300 truncate">{targetMaster.specialty}</p>
                  <p className="text-[11px] tabular-nums text-emerald-400 font-black flex items-center gap-1">
                    <span>{preview.frequencyStrAfter}</span>
                    <span className="text-[10px] text-emerald-300 font-bold bg-emerald-500/20 px-1 rounded">
                      ⚡ +{preview.speedGainPercent}%
                    </span>
                  </p>
                </div>
              </div>

              {/* Evolved Stats List */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex items-center justify-between bg-[var(--surface-inner)] border border-[var(--surface-border)] px-2 py-1 rounded-lg">
                  <span className="text-slate-300 text-[11px]">Habilidad:</span>
                  <span className="font-bold text-purple-200 truncate max-w-[140px] text-right flex items-center gap-1">
                    <span>Nv. {preview.skillLevelAfter}</span>
                    <span className="text-[9px] bg-purple-400/20 text-purple-200 px-1 rounded font-black">+1</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[var(--surface-inner)] border border-[var(--surface-border)] px-2 py-1 rounded-lg">
                  <span className="text-slate-300 text-[11px]">Inventario:</span>
                  <span className="font-bold tabular-nums text-emerald-300 flex items-center gap-1">
                    <span>{preview.carryLimitAfter} slots</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-black">+5</span>
                  </span>
                </div>
                <div className="flex items-center justify-between bg-[var(--surface-inner)] border border-[var(--surface-border)] px-2 py-1 rounded-lg">
                  <span className="text-slate-300 text-[11px]">Puntos Ayuda (PA):</span>
                  <span className="font-bold tabular-nums text-emerald-300 flex items-center gap-1">
                    <span>~{preview.rpAfter}</span>
                    <span className="text-[9px] text-emerald-400 font-semibold">+{preview.rpGain}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Banner: Estimated Vigor Boost */}
          <div className="bg-[var(--surface-inner)] border border-emerald-500/30 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>Ganancia estimada para Snorlax:</span>
                  <span className="text-emerald-400 font-black tabular-nums">
                    +{preview.dailyVigorGain.toLocaleString()} vigor/día
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Calculado con la nueva velocidad de ayuda y habilidad mejorada.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-slate-300 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700">
                🌱 Conserva 100% sus ingredientes y subskills
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[var(--surface-border)] bg-[var(--surface-inner)] flex items-center justify-between gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            disabled={isEvolvingAnimation}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            Cerrar
          </button>

          <button
            type="button"
            onClick={handleEvolve}
            disabled={isEvolvingAnimation}
            className={`btn-dreamy-pearl flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-xs text-indigo-950 transition-all shadow-xl ${
              isEvolvingAnimation
                ? 'scale-95 ring-2 ring-purple-300 opacity-90'
                : 'hover:scale-[1.02] active:scale-95'
            }`}
          >
            <Dna className={`w-4 h-4 text-indigo-950 ${isEvolvingAnimation ? 'animate-spin' : ''}`} />
            <span>
              {isEvolvingAnimation ? '¡Evolucionando Pokémon...!' : `¡Evolucionar a ${targetMaster.name}!`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
