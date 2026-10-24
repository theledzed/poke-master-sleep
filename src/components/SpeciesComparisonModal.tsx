import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Crown,
  Trophy,
  Award,
  Trash2,
  Edit2,
  Check,
  Zap,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2
} from 'lucide-react';
import {
  FamilyComparisonSummary,
  SpeciesPeerComparison,
  PokedexTier
} from '../services/pokedexEvaluator';
import {
  getPokemonArtworkUrl,
  getIngredientSpriteUrl,
  SpriteStyle
} from '../services/pokeApiService';

interface SpeciesComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: FamilyComparisonSummary | null;
  onSelectEdit?: (pokemonId: string) => void;
  onTransferPokemon?: (pokemonId: string) => void;
  spriteStyle?: SpriteStyle;
}

export const SpeciesComparisonModal: React.FC<SpeciesComparisonModalProps> = ({
  isOpen,
  onClose,
  summary,
  onSelectEdit,
  onTransferPokemon,
  spriteStyle = 'showdown'
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen || !summary) return null;

  const getTierBadge = (tier: PokedexTier) => {
    switch (tier) {
      case 'S+':
        return 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black shadow-violet-500/30 shadow';
      case 'S':
        return 'bg-sky-500 text-white font-bold shadow-sky-500/30 shadow';
      case 'A':
        return 'bg-emerald-500 text-white font-bold shadow-emerald-500/25 shadow';
      case 'B':
        return 'bg-indigo-500 text-white font-bold';
      case 'C':
        return 'bg-slate-700 text-slate-200 font-semibold';
      default:
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold';
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return {
        icon: <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />,
        label: '🥇 #1 Mejor Ejemplar (Prioridad)',
        badge: 'bg-amber-400/20 text-amber-200 border-amber-300/40'
      };
    }
    if (rank === 2) {
      return {
        icon: <Award className="w-4 h-4 text-slate-300 fill-slate-300" />,
        label: '🥈 #2 Alternativa / Relevo',
        badge: 'bg-slate-400/20 text-slate-200 border-slate-300/40'
      };
    }
    return {
      icon: <Award className="w-4 h-4 text-amber-600" />,
      label: `🥉 #${rank} Inferior / Descartable`,
      badge: 'bg-rose-500/15 text-rose-200 border-rose-400/30'
    };
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="cozy-card max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-purple-500/30 shadow-2xl relative bg-[#0b101e]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center text-xl shadow-inner">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Comparador de Familia: {summary.familyName}
                </h3>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 tabular-nums">
                  {summary.totalMembers} ejemplares en caja
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Análisis genético comparativo frente a frente para saber en cuál invertir caramelos y cuáles enviar al Profesor.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Winner Spotlight Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-purple-950/30 border border-amber-400/40 shadow-lg relative overflow-hidden">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/30 flex-shrink-0">
                <Crown className="w-6 h-6 fill-amber-300" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                    Ganador Genético de la Familia
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-400 text-indigo-950">
                    {summary.bestMemberName}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                  {summary.winnerReason}
                </p>
                <p className="text-[11px] text-amber-200/90 font-medium">
                  💡 <strong className="text-white">Consejo del Profesor:</strong> Invierte tus caramelos y fragmentos exclusivamente en el ejemplar #1. Los ejemplares de menor rango (#2 o #3) que tengan un rol inferior te darán valiosos caramelos si los envías al Profesor.
                </p>
              </div>
            </div>
          </div>

          {/* Comparative Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.peers.map((peer) => {
              const rankInfo = getRankBadge(peer.speciesRank);
              const spriteUrl = getPokemonArtworkUrl(peer.name, spriteStyle, false);

              return (
                <div
                  key={peer.id}
                  className={`rounded-2xl p-4 flex flex-col justify-between border transition-all relative overflow-hidden ${
                    peer.isWinner
                      ? 'bg-gradient-to-b from-amber-950/30 via-slate-900/80 to-slate-950 border-amber-400/50 shadow-xl shadow-amber-500/10'
                      : peer.verdict === 'CAMBIAR_CARAMELOS'
                      ? 'bg-slate-900/60 border-rose-500/30 hover:border-rose-500/50'
                      : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Rank Badge Header */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full border ${rankInfo.badge}`}>
                        {rankInfo.icon}
                        <span>{rankInfo.label}</span>
                      </span>

                      <div className={`px-2 py-0.5 rounded-lg text-center text-xs font-black ${getTierBadge(peer.tier)}`}>
                        {peer.tier} • {peer.geneticScore} pts
                      </div>
                    </div>

                    {/* Sprite + Name + Level */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0">
                        <img
                          src={spriteUrl}
                          alt={peer.name}
                          className="w-12 h-12 object-contain drop-shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPokemonArtworkUrl(peer.name, 'artwork', false);
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-white text-base truncate">{peer.name}</h4>
                          <span className="text-[10px] font-black text-purple-200 bg-purple-500/20 px-2 py-0.2 rounded-full border border-purple-400/30 tabular-nums">
                            Nv. {peer.level}
                          </span>
                        </div>
                        {peer.rp ? (
                          <span className="text-[11px] text-slate-400 font-bold tabular-nums">
                            {peer.rp} PA
                          </span>
                        ) : null}

                        {peer.isMonoIngredient && (
                          <div className="mt-1">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 inline-flex items-center gap-1">
                              🥣 Mono-Ingrediente Puro
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Veredicto Pill */}
                    <div className="mb-3">
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 block text-center">
                        {peer.verdictLabel}
                      </span>
                    </div>

                    {/* Dual Meters: Poder Hoy vs Techo Nv. 50 */}
                    <div className="grid grid-cols-2 gap-2 mb-3 p-2 rounded-xl bg-black/30 border border-white/5 text-[10px]">
                      <div>
                        <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-amber-400" /> Hoy
                          </span>
                          <span className="text-amber-300 font-black">{peer.currentPowerScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, peer.currentPowerScore))}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-slate-300 font-bold mb-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3 text-purple-400" /> Techo
                          </span>
                          <span className="text-purple-300 font-black">{peer.ceilingScore}</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, peer.ceilingScore))}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Naturaleza */}
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs mb-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                        Naturaleza
                      </div>
                      <div className="font-bold text-white flex items-center justify-between">
                        <span>{peer.natureName}</span>
                        <span className="text-[10px] font-semibold text-sky-300">
                          {peer.natureEffect}
                        </span>
                      </div>
                    </div>

                    {/* Ingredientes */}
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs mb-2">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                        Ingredientes
                      </div>
                      <div className="text-[11px] text-slate-200 font-medium">
                        {peer.ingredientSummary}
                      </div>
                    </div>

                    {/* Subhabilidades */}
                    <div className="p-2 rounded-xl bg-white/[0.03] border border-white/5 text-xs mb-3">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">
                        Subhabilidades (Nv. 10/25/50)
                      </div>
                      {peer.subskillsSummary.length > 0 ? (
                        <div className="space-y-1">
                          {peer.subskillsSummary.slice(0, 3).map((sub, sIdx) => (
                            <div key={sIdx} className="text-[10px] text-slate-300 flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                              <span className="truncate">{sub}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">Sin subhabilidades</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for this peer */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 mt-auto">
                    {onSelectEdit && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectEdit(peer.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-bold transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-sky-400" />
                        <span>Ver Ficha</span>
                      </button>
                    )}

                    {onTransferPokemon && (
                      confirmDeleteId === peer.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              onTransferPokemon(peer.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black transition-all shadow"
                          >
                            ¿Confirmar?
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-[11px]"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(peer.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center gap-1"
                          title="Enviar al Profesor por caramelos"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          <span>🍬 Enviar</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all"
          >
            Cerrar Comparación
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};