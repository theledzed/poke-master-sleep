import React, { useState, useMemo } from 'react';
import { Pokemon } from '../types/pokemon';
import {
  auditPokedexCollection,
  PokemonAuditResult,
  PokedexVerdict,
  FamilyComparisonSummary
} from '../services/pokedexEvaluator';
import { SpeciesComparisonModal } from './SpeciesComparisonModal';
import {
  getPokemonArtworkUrl,
  getBerrySpriteUrl,
  getIngredientSpriteUrl,
  getTypeTheme,
  isSpecialPokemon,
  SpriteStyle
} from '../services/pokeApiService';
import { BERRIES } from '../data/gameData';
import {
  Sparkles,
  Trophy,
  Award,
  Crown,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Star,
  Info,
  Clock,
  Zap,
  Edit2,
  Check
} from 'lucide-react';

interface PokedexAuditViewProps {
  pokemons: Pokemon[];
  onEditPokemon?: (pokemon: Pokemon) => void;
  onDeletePokemon?: (pokemonId: string) => void;
  spriteStyle?: SpriteStyle;
}

type FilterCategory = 'ALL' | PokedexVerdict;

export const PokedexAuditView: React.FC<PokedexAuditViewProps> = ({
  pokemons,
  onEditPokemon,
  onDeletePokemon,
  spriteStyle = 'showdown'
}) => {
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<PokemonAuditResult | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedFamilySummary, setSelectedFamilySummary] = useState<FamilyComparisonSummary | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Evaluate the entire collection
  const auditResults = useMemo(() => {
    return auditPokedexCollection(pokemons);
  }, [pokemons]);

  // Counts by verdict category
  const counts = useMemo(() => {
    const map: Record<string, number> = {
      ALL: auditResults.length,
      TITULAR_ELITE: 0,
      PROMESA_INVERTIR: 0,
      TROFEO_CONSERVAR: 0,
      UTIL_NICHO: 0,
      UTIL_TEMPORAL: 0,
      CAMBIAR_CARAMELOS: 0
    };
    auditResults.forEach(r => {
      map[r.verdict] = (map[r.verdict] || 0) + 1;
    });
    return map;
  }, [auditResults]);

  // Filtered list
  const filteredResults = useMemo(() => {
    return auditResults.filter(r => {
      const matchesCategory = filterCategory === 'ALL' || r.verdict === filterCategory;
      const matchesSearch =
        searchQuery === '' ||
        r.pokemon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.pokemon.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.pokemon.notes && r.pokemon.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [auditResults, filterCategory, searchQuery]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'S+':
        return {
          badge: 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-black shadow-violet-500/20 shadow-md',
          glow: 'border-violet-400/50',
          text: 'text-violet-300'
        };
      case 'S':
        return {
          badge: 'bg-sky-500 text-white font-bold shadow-sky-500/20 shadow-md',
          glow: 'border-sky-400/50',
          text: 'text-sky-300'
        };
      case 'A':
        return {
          badge: 'bg-emerald-500 text-white font-bold shadow-emerald-500/20 shadow-md',
          glow: 'border-emerald-400/40',
          text: 'text-emerald-300'
        };
      case 'B':
        return {
          badge: 'bg-indigo-500 text-white font-bold',
          glow: 'border-indigo-400/40',
          text: 'text-indigo-300'
        };
      case 'C':
        return {
          badge: 'bg-slate-700 text-slate-200 font-semibold',
          glow: 'border-slate-700',
          text: 'text-slate-300'
        };
      default:
        return {
          badge: 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold',
          glow: 'border-rose-500/30',
          text: 'text-rose-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Explanation */}
      <div className="cozy-card p-5 sm:p-6 relative overflow-hidden border border-[var(--surface-border)] shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent-primary)] text-xs font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>Auditor Genético & Laboratorio del Profesor</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Diagnóstico de Colección y Consejos de Inversión</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Evalúa la calidad genética de cada Pokémon contrastando su <strong className="text-white">Naturaleza</strong>, <strong className="text-white">Subhabilidades ponderadas</strong> y <strong className="text-white">distribución de ingredientes</strong> contra su especialidad oficial. Te indica con exactitud por qué sí vale la pena invertir o por qué te conviene enviarlo al Profesor.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[var(--surface-inner)] border border-[var(--surface-border)] p-3 rounded-2xl self-start md:self-auto text-xs tabular-nums">
            <div className="text-center px-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Colección</span>
              <span className="text-lg font-black text-white tabular-nums">{pokemons.length}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Élite</span>
              <span className="text-lg font-black text-emerald-300 tabular-nums">{counts.TITULAR_ELITE}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-purple-300 uppercase font-bold block">Promesas</span>
              <span className="text-lg font-black text-white tabular-nums">{counts.PROMESA_INVERTIR}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-sky-300 uppercase font-bold block">Nicho</span>
              <span className="text-lg font-black text-sky-200 tabular-nums">{counts.UTIL_NICHO}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-indigo-300 uppercase font-bold block">Útiles</span>
              <span className="text-lg font-black text-indigo-200 tabular-nums">{counts.UTIL_TEMPORAL}</span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center px-2">
              <span className="text-[10px] text-rose-400 uppercase font-bold block">Caramelos</span>
              <span className="text-lg font-black text-rose-300 tabular-nums">{counts.CAMBIAR_CARAMELOS}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs by Verdict Category */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[var(--surface-inner)] p-1.5 rounded-2xl border border-[var(--surface-border)] overflow-x-auto max-w-full">
          <button
            onClick={() => setFilterCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'ALL'
                ? 'btn-cozy-primary text-xs shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>Todos</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-white/10">{counts.ALL}</span>
          </button>

          <button
            onClick={() => setFilterCategory('TITULAR_ELITE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'TITULAR_ELITE'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/25'
                : 'text-emerald-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>👑 Élite</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-200 border border-emerald-500/30 font-black">
              {counts.TITULAR_ELITE}
            </span>
          </button>

          <button
            onClick={() => setFilterCategory('PROMESA_INVERTIR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'PROMESA_INVERTIR'
                ? 'bg-teal-500 text-slate-950 font-black shadow-sm shadow-teal-500/25'
                : 'text-teal-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>💎 Promesas</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-teal-950/60 text-teal-200 border border-teal-500/30 font-black">
              {counts.PROMESA_INVERTIR}
            </span>
          </button>

          <button
            onClick={() => setFilterCategory('UTIL_NICHO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'UTIL_NICHO'
                ? 'bg-sky-500 text-slate-950 font-black shadow-sm shadow-sky-500/25'
                : 'text-sky-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🛠️ Nicho / Rotación</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-sky-950/60 text-sky-200 border border-sky-500/30 font-black">
              {counts.UTIL_NICHO}
            </span>
          </button>

          <button
            onClick={() => setFilterCategory('UTIL_TEMPORAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'UTIL_TEMPORAL'
                ? 'bg-indigo-500 text-white font-black shadow-sm shadow-indigo-500/25'
                : 'text-indigo-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🛡️ Útiles Temporales</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-indigo-950/60 text-indigo-200 border border-indigo-500/30 font-black">
              {counts.UTIL_TEMPORAL}
            </span>
          </button>

          <button
            onClick={() => setFilterCategory('TROFEO_CONSERVAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'TROFEO_CONSERVAR'
                ? 'bg-purple-500 text-white font-black shadow-sm shadow-purple-500/25'
                : 'text-purple-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>✨ Trofeos</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-purple-950/60 text-purple-200 border border-purple-500/30 font-black">
              {counts.TROFEO_CONSERVAR}
            </span>
          </button>

          <button
            onClick={() => setFilterCategory('CAMBIAR_CARAMELOS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              filterCategory === 'CAMBIAR_CARAMELOS'
                ? 'bg-rose-500 text-white shadow-sm shadow-rose-500/25'
                : 'text-rose-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>🍬 Enviar al Profesor</span>
            <span className="text-[10px] tabular-nums px-1.5 py-0.2 rounded-full bg-rose-950/60 text-rose-200 border border-rose-500/30 font-black">
              {counts.CAMBIAR_CARAMELOS}
            </span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre o nota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[var(--surface-inner)] border border-[var(--surface-border)] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-400 font-medium"
          />
        </div>
      </div>

      {/* Grid of Diagnosed Pokemon Cards */}
      {filteredResults.length === 0 ? (
        <div className="cozy-card p-10 text-center text-slate-400 text-sm">
          No hay Pokémon que coincidan con el filtro seleccionado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredResults.map((audit) => {
            const {
              pokemon,
              geneticScore,
              currentPowerScore,
              ceilingScore,
              tier,
              verdict,
              verdictLabel,
              verdictBadgeColor,
              pros,
              cons,
              recommendation,
              mintCandidate,
              subskillSeedTarget,
              favoredIslands,
              recipeSynergyNote,
              isHybridBerrySpecialist,
              isMonoIngredient
            } = audit;
            const tierStyle = getTierColor(tier);
            const isShiny = pokemon.notes?.toLowerCase().includes('shiny') || pokemon.notes?.toLowerCase().includes('variocolor');
            const spriteUrl = getPokemonArtworkUrl(pokemon.name, spriteStyle, isShiny);
            const berryMeta = BERRIES[pokemon.berry];

            return (
              <div
                key={pokemon.id}
                className={`cozy-card p-4 sm:p-5 flex flex-col justify-between border transition-all relative overflow-hidden group shadow-md hover:shadow-xl ${
                  verdict === 'CAMBIAR_CARAMELOS'
                    ? 'border-rose-500/30 hover:border-rose-500/60'
                    : verdict === 'TITULAR_ELITE'
                    ? 'border-emerald-500/35 hover:border-emerald-400/60'
                    : verdict === 'PROMESA_INVERTIR'
                    ? 'border-purple-400/35 hover:border-purple-400/60'
                    : 'border-[var(--surface-border)] hover:border-slate-500'
                }`}
              >
                <div>
                  {/* Top Header: Sprite + Name + Tier Badge */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 p-1 flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner">
                        <img
                          src={spriteUrl}
                          alt={pokemon.name}
                          className={`w-12 h-12 object-contain drop-shadow ${
                            spriteStyle === 'sleep' ? 'rounded-full scale-95' : ''
                          }`}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getPokemonArtworkUrl(pokemon.name, 'artwork', isShiny);
                          }}
                        />
                        {isShiny && (
                          <span className="absolute top-0.5 right-0.5 text-[10px]">✨</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-black text-white text-base leading-tight">{pokemon.name}</h4>
                          <span className="text-[10px] font-black text-purple-200 bg-purple-500/20 px-2 py-0.2 rounded-full border border-purple-400/30 tabular-nums">
                            Nv. {pokemon.level}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                          <span className="text-[11px] font-bold text-slate-300">{pokemon.specialty}</span>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400 tabular-nums font-bold flex items-center gap-1">
                            <img src={getBerrySpriteUrl(pokemon.berry)} alt={pokemon.berry} className="w-3.5 h-3.5 object-contain" />
                            <span>{pokemon.berry}</span>
                          </span>
                        </div>

                        {audit.speciesTotal && audit.speciesTotal > 1 && (
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                audit.isSpeciesBest
                                  ? 'bg-amber-400/20 text-amber-200 border-amber-300/40 shadow-sm shadow-amber-500/20'
                                  : audit.speciesRank === 2
                                  ? 'bg-slate-400/20 text-slate-200 border-slate-300/40'
                                  : 'bg-rose-500/15 text-rose-200 border-rose-400/30'
                              }`}
                            >
                              <span>{audit.isSpeciesBest ? '👑 #1' : audit.speciesRank === 2 ? '🥈 #2' : `🥉 #${audit.speciesRank}`}</span>
                              <span>de {audit.speciesTotal} en Familia</span>
                            </span>

                            {audit.familyComparison && (
                              <button
                                onClick={() => {
                                  setSelectedFamilySummary(audit.familyComparison!);
                                  setIsComparisonModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 border border-purple-400/30 transition-all active:scale-95 shadow-sm"
                                title={`Comparar frente a frente los ${audit.speciesTotal} ejemplares de la familia ${audit.familyComparison.familyName}`}
                              >
                                <span>⚔️ Comparar ({audit.speciesTotal})</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Ingredientes Activos / Desbloqueables */}
                        {pokemon.ingredients && pokemon.ingredients.length > 0 && (
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            {pokemon.ingredients.map((ing, idx) => {
                              const isUnlocked = pokemon.level >= (ing.unlockLevel || (idx === 0 ? 1 : idx === 1 ? 30 : 60));
                              return (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-lg border tabular-nums ${
                                    isUnlocked
                                      ? 'bg-amber-500/15 border-amber-400/35 text-amber-200 font-bold'
                                      : 'bg-white/[0.03] border-white/10 text-slate-500 opacity-60'
                                  }`}
                                  title={`${ing.name} x${ing.count} (Nv. ${ing.unlockLevel || (idx === 0 ? 1 : idx === 1 ? 30 : 60)})${isUnlocked ? ' - Activo' : ' - Bloqueado'}`}
                                >
                                  <img
                                    src={getIngredientSpriteUrl(ing.name)}
                                    alt={ing.name}
                                    className={`w-3 h-3 object-contain ${!isUnlocked ? 'grayscale' : ''}`}
                                  />
                                  <span>{ing.count}</span>
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Genetic Tier & Score Badge */}
                    <div className="text-right flex-shrink-0">
                      <div className={`px-2.5 py-1 rounded-xl text-center border ${tierStyle.badge}`}>
                        <span className="text-xs font-black block leading-none">Grado {tier}</span>
                        <span className="text-[10px] tabular-nums font-black opacity-90">{geneticScore} pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict Status Pill & Pro Action Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                    <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 border shadow-sm ${verdictBadgeColor}`}>
                      <span>{verdictLabel}</span>
                    </span>

                    {isHybridBerrySpecialist && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 inline-flex items-center gap-1">
                        ⚡ Híbrido Bayas
                      </span>
                    )}

                    {isMonoIngredient && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/40 inline-flex items-center gap-1">
                        🥣 Mono-Ingrediente
                      </span>
                    )}

                    {mintCandidate && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 inline-flex items-center gap-1" title="Menta Neutra recomendada para neutralizar la penalización de su naturaleza">
                        🌿 Menta Neutra
                      </span>
                    )}

                    {subskillSeedTarget && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/40 inline-flex items-center gap-1" title={`Candidato para Semilla de Habilidad Secundaria: ${subskillSeedTarget}`}>
                        🌱 Semilla ({subskillSeedTarget})
                      </span>
                    )}
                  </div>

                  {/* Dual-axis power meters */}
                  <div className="grid grid-cols-2 gap-2 mb-3 p-2 rounded-xl bg-black/25 border border-white/5">
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          <Zap className="w-3 h-3 text-amber-400" /> Poder Hoy
                        </span>
                        <span className="font-black text-amber-300 tabular-nums">
                          {currentPowerScore}<span className="text-[9px] text-slate-500 font-normal">/100</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, currentPowerScore))}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-purple-400" /> Techo Nv. 50
                        </span>
                        <span className="font-black text-purple-300 tabular-nums">
                          {ceilingScore}<span className="text-[9px] text-slate-500 font-normal">/100</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(5, ceilingScore))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sinergia Culinaria Detectada */}
                  {recipeSynergyNote && (
                    <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-400/25 flex items-center gap-2 text-xs text-amber-200">
                      <span className="text-sm">👨‍🍳</span>
                      <span className="text-[11px] font-semibold">{recipeSynergyNote}</span>
                    </div>
                  )}

                  {/* Recommendation Callout Box */}
                  <div className={`p-3 rounded-2xl mb-3 text-xs leading-relaxed border ${
                    verdict === 'CAMBIAR_CARAMELOS'
                      ? 'bg-rose-950/30 border-rose-500/25 text-rose-200'
                      : verdict === 'TITULAR_ELITE'
                      ? 'bg-emerald-950/30 border-emerald-500/25 text-emerald-200'
                      : verdict === 'PROMESA_INVERTIR'
                      ? 'bg-sky-950/30 border-sky-400/25 text-sky-200'
                      : 'bg-white/5 border-white/10 text-slate-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-sm flex-shrink-0 mt-0.5">
                        {verdict === 'CAMBIAR_CARAMELOS' ? '🍬' : verdict === 'TITULAR_ELITE' ? '👑' : verdict === 'PROMESA_INVERTIR' ? '💎' : '📌'}
                      </span>
                      <p className="text-[11px] font-medium leading-relaxed">
                        {recommendation}
                      </p>
                    </div>
                  </div>

                  {/* Detailed Pros and Cons */}
                  <div className="space-y-2 mb-3 text-xs">
                    {/* Pros (Por qué SÍ es viable) */}
                    {pros.length > 0 && (
                      <div className="bg-[#08182c]/85 border border-emerald-500/20 rounded-xl p-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1 mb-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Puntos Fuertes / Por qué SÍ es viable:</span>
                        </span>
                        <ul className="space-y-1">
                          {pros.map((p, idx) => (
                            <li key={idx} className="text-[11px] text-slate-200 flex items-start gap-1.5 leading-snug">
                              <span className="text-emerald-400 font-bold leading-none mt-0.5">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Cons (Por qué NO vale la pena / Puntos Débiles) */}
                    {cons.length > 0 && (
                      <div className="bg-[#08182c]/85 border border-rose-500/20 rounded-xl p-2.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1.5">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          <span>Puntos Débiles / Desventajas:</span>
                        </span>
                        <ul className="space-y-1">
                          {cons.map((c, idx) => (
                            <li key={idx} className="text-[11px] text-rose-200 flex items-start gap-1.5 leading-snug">
                              <span className="text-rose-400 font-bold leading-none mt-0.5">•</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Quick Nature & Subskills Strip */}
                  <div className="bg-white/[0.04] border border-white/10 rounded-xl p-2.5 text-[10px] space-y-1 tabular-nums text-slate-400 font-medium">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Naturaleza:</span>
                      <span className="font-bold text-white">
                        {pokemon.natureObj?.name || pokemon.nature || 'Neutra'}
                        {pokemon.natureObj?.upStat && (
                          <span className="text-sky-300 ml-1">
                            (+{pokemon.natureObj.upStat.split(' ')[0]})
                          </span>
                        )}
                        {pokemon.natureObj?.downStat && (
                          <span className="text-rose-300 ml-1">
                            (-{pokemon.natureObj.downStat.split(' ')[0]})
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-sans">Subskills (Nv. 10/25/50):</span>
                      <span className="text-slate-300 truncate max-w-[200px]" title={pokemon.subskills.map(s => s.name).join(', ')}>
                        {pokemon.subskills.slice(0, 3).map(s => s.name).join(' • ') || 'Sin subskills'}
                      </span>
                    </div>

                    {favoredIslands && favoredIslands.length > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-sans">Islas clave:</span>
                        <span className="text-indigo-200 font-bold truncate max-w-[200px]" title={favoredIslands.join(', ')}>
                          🏝️ {favoredIslands.slice(0, 2).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  {onEditPokemon && (
                    <button
                      onClick={() => onEditPokemon(pokemon)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all"
                    >
                      <Edit2 className="w-3 h-3 text-sky-400" />
                      <span>Ficha Completa</span>
                    </button>
                  )}

                  {verdict === 'CAMBIAR_CARAMELOS' && onDeletePokemon && (
                    confirmDeleteId === pokemon.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeletePokemon(pokemon.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black transition-all shadow-md"
                        >
                          ¿Confirmar envío?
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded-xl bg-slate-800 text-slate-300 text-[11px]"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(pokemon.id)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                        title="Enviar este Pokémon al Profesor para recibir caramelos"
                      >
                        <Trash2 className="w-3 h-3 text-rose-400" />
                        <span>Enviar al Profesor 🍬</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evolutionary Family Side-by-Side Comparison Modal */}
      {isComparisonModalOpen && selectedFamilySummary && (
        <SpeciesComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => {
            setIsComparisonModalOpen(false);
            setSelectedFamilySummary(null);
          }}
          summary={selectedFamilySummary}
          onSelectEdit={(pokemonId) => {
            const target = pokemons.find(p => p.id === pokemonId);
            if (target && onEditPokemon) {
              onEditPokemon(target);
            }
          }}
          onTransferPokemon={onDeletePokemon}
          spriteStyle={spriteStyle}
        />
      )}
    </div>
  );
};
