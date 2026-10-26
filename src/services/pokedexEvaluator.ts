import { Pokemon, Specialty } from '../types/pokemon';
import { isSpecialPokemon } from './pokeApiService';
import { NATURES } from '../data/gameData';
import { getSpeciesMasterData, MasterSpecies } from '../data/speciesMaster';
import { calculateEvolutionPreview, formatFrequencySeconds, SLEEP_EVOLUTION_MAP } from './evolutionService';

export type PokedexTier = 'S+' | 'S' | 'A' | 'B' | 'C' | 'D';

export type PokedexVerdict =
  | 'TITULAR_ELITE'      // 👑 Pilar activo de tu campamento hoy mismo
  | 'PROMESA_INVERTIR'   // 💎 Nivel bajo/medio pero techo genético brutal, prioridad #1 de caramelos
  | 'TROFEO_CONSERVAR'   // ✨ Shiny / Singular / Legendario (intocable para colección)
  | 'UTIL_TEMPORAL'      // 🛡️ Único proveedor de su baya/ingrediente o puente temporal
  | 'UTIL_NICHO'         // 🛠️ Buen rol secundario o de rotación específica
  | 'CAMBIAR_CARAMELOS'; // 🍬 Duplicado inferior o saboteado, enviar al Profesor por caramelos

export interface EvolutionProjectedStats {
  targetSpeciesName: string;
  targetStage: number;
  frequencyStr: string;
  frequencySeconds: number;
  carryLimit: number;
  speedGainPercent: number; // vs candidate's unevolved base
  speedAdvantageVsIncumbentPercent?: number; // e.g. +12% faster than incumbent Charmeleon
  carryAdvantageVsIncumbent?: number; // e.g. +20 slots
}

export interface InvestmentCostEstimate {
  evolutionCandies: number;
  levelCatchUpCandies: number;
  totalCandies: number;
  estimatedDreamShards: number;
  evolutionItem?: string;
  sleepHoursNeeded?: number;
}

export type RoiVerdict = 'INCUMBENT' | 'HIGH_ROI' | 'MARGINAL_ROI' | 'LOW_ROI';

export interface RoiAnalysisResult {
  verdict: RoiVerdict;
  badgeLabel: string;
  badgeColor: string;
  badgeIcon: string;
  advice: string;
}

export interface SpeciesPeerComparison {
  id: string;
  name: string;
  level: number;
  rp?: number;
  geneticScore: number;
  currentPowerScore: number;
  ceilingScore: number;
  tier: PokedexTier;
  verdict: PokedexVerdict;
  verdictLabel: string;
  isMonoIngredient?: boolean;
  ingredientSummary: string;
  subskillsSummary: string[];
  natureName: string;
  natureEffect: string;
  isCurrent: boolean;
  speciesRank: number;
  isWinner: boolean;
  evolutionStage?: number;
  isIncumbent?: boolean;
  projectedEvolution?: EvolutionProjectedStats;
  investmentCost?: InvestmentCostEstimate;
  roiAnalysis?: RoiAnalysisResult;
}

export interface FamilyComparisonSummary {
  familyId: string;
  familyName: string;
  totalMembers: number;
  bestMemberId: string;
  bestMemberName: string;
  winnerReason: string;
  hasRealIncumbent?: boolean;
  incumbentName?: string;
  incumbentLevel?: number;
  targetStageName?: string;
  peers: SpeciesPeerComparison[];
}

export interface PokemonAuditResult {
  pokemon: Pokemon;
  geneticScore: number;       // Score global ponderado (0 a 100 pts)
  currentPowerScore: number;  // Rendimiento real HOY según nivel, PA y slots desbloqueados (0 a 100)
  ceilingScore: number;       // Proyección a Nv. 50 evolucionado al máximo (0 a 100)
  tier: PokedexTier;
  verdict: PokedexVerdict;
  verdictLabel: string;
  verdictBadgeColor: string;
  pros: string[];
  cons: string[];
  recommendation: string;
  betterDuplicateName?: string;
  isMonoIngredient?: boolean;
  isHybridBerrySpecialist?: boolean;
  mintCandidate?: boolean;
  subskillSeedTarget?: string;
  favoredIslands?: string[];
  recipeSynergyNote?: string;
  speciesRank?: number;       // 1, 2, 3... en su familia
  speciesTotal?: number;      // Total de ejemplares en su familia
  isSpeciesBest?: boolean;    // true si es el #1 de su familia
  familyComparison?: FamilyComparisonSummary;
}

// 1. Familias evolutivas y etapa evolutiva (1 = base, 2 = intermedia, 3 = final / única)
export interface EvolutionMeta {
  family: string;
  stage: 1 | 2 | 3;
  maxStage: 1 | 2 | 3;
  evolvesWithItem?: string;
  sleepHoursRequired?: number;
}

export const SPECIES_META: Record<string, EvolutionMeta> = {
  // Gen 1
  bulbasaur: { family: 'bulbasaur', stage: 1, maxStage: 3 },
  ivysaur: { family: 'bulbasaur', stage: 2, maxStage: 3 },
  venusaur: { family: 'bulbasaur', stage: 3, maxStage: 3 },
  charmander: { family: 'charmander', stage: 1, maxStage: 3 },
  charmeleon: { family: 'charmander', stage: 2, maxStage: 3 },
  charizard: { family: 'charmander', stage: 3, maxStage: 3 },
  squirtle: { family: 'squirtle', stage: 1, maxStage: 3 },
  wartortle: { family: 'squirtle', stage: 2, maxStage: 3 },
  blastoise: { family: 'squirtle', stage: 3, maxStage: 3 },
  caterpie: { family: 'caterpie', stage: 1, maxStage: 3 },
  metapod: { family: 'caterpie', stage: 2, maxStage: 3 },
  butterfree: { family: 'caterpie', stage: 3, maxStage: 3 },
  rattata: { family: 'rattata', stage: 1, maxStage: 2 },
  raticate: { family: 'rattata', stage: 2, maxStage: 2 },
  ekans: { family: 'ekans', stage: 1, maxStage: 2 },
  arbok: { family: 'ekans', stage: 2, maxStage: 2 },
  pichu: { family: 'pikachu', stage: 1, maxStage: 3, sleepHoursRequired: 50 },
  pikachu: { family: 'pikachu', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Trueno' },
  raichu: { family: 'pikachu', stage: 3, maxStage: 3 },
  cleffa: { family: 'clefairy', stage: 1, maxStage: 3, sleepHoursRequired: 50 },
  clefairy: { family: 'clefairy', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Lunar' },
  clefable: { family: 'clefairy', stage: 3, maxStage: 3 },
  vulpix: { family: 'vulpix', stage: 1, maxStage: 2, evolvesWithItem: 'Piedra Fuego' },
  ninetales: { family: 'vulpix', stage: 2, maxStage: 2 },
  igglybuff: { family: 'jigglypuff', stage: 1, maxStage: 3, sleepHoursRequired: 50 },
  jigglypuff: { family: 'jigglypuff', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Lunar' },
  wigglytuff: { family: 'jigglypuff', stage: 3, maxStage: 3 },
  diglett: { family: 'diglett', stage: 1, maxStage: 2 },
  dugtrio: { family: 'diglett', stage: 2, maxStage: 2 },
  meowth: { family: 'meowth', stage: 1, maxStage: 2 },
  persian: { family: 'meowth', stage: 2, maxStage: 2 },
  psyduck: { family: 'psyduck', stage: 1, maxStage: 2 },
  golduck: { family: 'psyduck', stage: 2, maxStage: 2 },
  mankey: { family: 'mankey', stage: 1, maxStage: 2 },
  primeape: { family: 'mankey', stage: 2, maxStage: 2 },
  growlithe: { family: 'growlithe', stage: 1, maxStage: 2, evolvesWithItem: 'Piedra Fuego' },
  arcanine: { family: 'growlithe', stage: 2, maxStage: 2 },
  bellsprout: { family: 'bellsprout', stage: 1, maxStage: 3 },
  weepinbell: { family: 'bellsprout', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Hoja' },
  victreebel: { family: 'bellsprout', stage: 3, maxStage: 3 },
  geodude: { family: 'geodude', stage: 1, maxStage: 3 },
  graveler: { family: 'geodude', stage: 2, maxStage: 3, evolvesWithItem: 'Cordón Unión' },
  golem: { family: 'geodude', stage: 3, maxStage: 3 },
  slowpoke: { family: 'slowpoke', stage: 1, maxStage: 2 },
  slowbro: { family: 'slowpoke', stage: 2, maxStage: 2 },
  slowking: { family: 'slowpoke', stage: 2, maxStage: 2, evolvesWithItem: 'Roca del Rey' },
  magnemite: { family: 'magnemite', stage: 1, maxStage: 3 },
  magneton: { family: 'magnemite', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Trueno' },
  magnezone: { family: 'magnemite', stage: 3, maxStage: 3 },
  farfetchd: { family: 'farfetchd', stage: 3, maxStage: 3 },
  doduo: { family: 'doduo', stage: 1, maxStage: 2 },
  dodrio: { family: 'doduo', stage: 2, maxStage: 2 },
  gastly: { family: 'gastly', stage: 1, maxStage: 3 },
  haunter: { family: 'gastly', stage: 2, maxStage: 3, evolvesWithItem: 'Cordón Unión' },
  gengar: { family: 'gastly', stage: 3, maxStage: 3 },
  onix: { family: 'onix', stage: 1, maxStage: 2, evolvesWithItem: 'Revestimiento Metálico' },
  steelix: { family: 'onix', stage: 2, maxStage: 2 },
  cubone: { family: 'cubone', stage: 1, maxStage: 2 },
  marowak: { family: 'cubone', stage: 2, maxStage: 2 },
  happiny: { family: 'chansey', stage: 1, maxStage: 3, evolvesWithItem: 'Piedra Oval' },
  chansey: { family: 'chansey', stage: 2, maxStage: 3 },
  blissey: { family: 'chansey', stage: 3, maxStage: 3 },
  kangaskhan: { family: 'kangaskhan', stage: 3, maxStage: 3 },
  mimejr: { family: 'mrmime', stage: 1, maxStage: 2, sleepHoursRequired: 50 },
  'mime jr.': { family: 'mrmime', stage: 1, maxStage: 2, sleepHoursRequired: 50 },
  'mr. mime': { family: 'mrmime', stage: 2, maxStage: 2 },
  mrmime: { family: 'mrmime', stage: 2, maxStage: 2 },
  pinsir: { family: 'pinsir', stage: 3, maxStage: 3 },
  ditto: { family: 'ditto', stage: 3, maxStage: 3 },
  eevee: { family: 'eevee', stage: 1, maxStage: 2, sleepHoursRequired: 150 },
  vaporeon: { family: 'eevee', stage: 2, maxStage: 2, evolvesWithItem: 'Piedra Agua' },
  jolteon: { family: 'eevee', stage: 2, maxStage: 2, evolvesWithItem: 'Piedra Trueno' },
  flareon: { family: 'eevee', stage: 2, maxStage: 2, evolvesWithItem: 'Piedra Fuego' },
  espeon: { family: 'eevee', stage: 2, maxStage: 2, sleepHoursRequired: 150 },
  umbreon: { family: 'eevee', stage: 2, maxStage: 2, sleepHoursRequired: 150 },
  leafeon: { family: 'eevee', stage: 2, maxStage: 2, evolvesWithItem: 'Piedra Hoja' },
  glaceon: { family: 'eevee', stage: 2, maxStage: 2, evolvesWithItem: 'Piedra Hielo' },
  sylveon: { family: 'eevee', stage: 2, maxStage: 2, sleepHoursRequired: 150 },
  dratini: { family: 'dratini', stage: 1, maxStage: 3 },
  dragonair: { family: 'dratini', stage: 2, maxStage: 3 },
  dragonite: { family: 'dratini', stage: 3, maxStage: 3 },
  mewtwo: { family: 'mewtwo', stage: 3, maxStage: 3 },
  mew: { family: 'mew', stage: 3, maxStage: 3 },

  // Gen 2
  chikorita: { family: 'chikorita', stage: 1, maxStage: 3 },
  bayleef: { family: 'chikorita', stage: 2, maxStage: 3 },
  meganium: { family: 'chikorita', stage: 3, maxStage: 3 },
  cyndaquil: { family: 'cyndaquil', stage: 1, maxStage: 3 },
  quilava: { family: 'cyndaquil', stage: 2, maxStage: 3 },
  typhlosion: { family: 'cyndaquil', stage: 3, maxStage: 3 },
  totodile: { family: 'totodile', stage: 1, maxStage: 3 },
  croconaw: { family: 'totodile', stage: 2, maxStage: 3 },
  feraligatr: { family: 'totodile', stage: 3, maxStage: 3 },
  togepi: { family: 'togepi', stage: 1, maxStage: 3, sleepHoursRequired: 50 },
  togetic: { family: 'togepi', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Alba' },
  togekiss: { family: 'togepi', stage: 3, maxStage: 3 },
  natu: { family: 'xatu', stage: 1, maxStage: 2 },
  xatu: { family: 'xatu', stage: 2, maxStage: 2 },
  mareep: { family: 'mareep', stage: 1, maxStage: 3 },
  flaaffy: { family: 'mareep', stage: 2, maxStage: 3 },
  ampharos: { family: 'mareep', stage: 3, maxStage: 3 },
  sudowoodo: { family: 'sudowoodo', stage: 2, maxStage: 2 },
  bonsly: { family: 'sudowoodo', stage: 1, maxStage: 2 },
  wooper: { family: 'wooper', stage: 1, maxStage: 2 },
  quagsire: { family: 'wooper', stage: 2, maxStage: 2 },
  clodsire: { family: 'wooper', stage: 2, maxStage: 2 },
  murkrow: { family: 'murkrow', stage: 1, maxStage: 2, evolvesWithItem: 'Piedra Noche' },
  honchkrow: { family: 'murkrow', stage: 2, maxStage: 2 },
  wobbuffet: { family: 'wobbuffet', stage: 2, maxStage: 2 },
  wynaut: { family: 'wobbuffet', stage: 1, maxStage: 2 },
  heracross: { family: 'heracross', stage: 3, maxStage: 3 },
  delibird: { family: 'delibird', stage: 3, maxStage: 3 },
  houndour: { family: 'houndour', stage: 1, maxStage: 2 },
  houndoom: { family: 'houndour', stage: 2, maxStage: 2 },
  larvitar: { family: 'larvitar', stage: 1, maxStage: 3 },
  pupitar: { family: 'larvitar', stage: 2, maxStage: 3 },
  tyranitar: { family: 'larvitar', stage: 3, maxStage: 3 },
  raikou: { family: 'raikou', stage: 3, maxStage: 3 },
  entei: { family: 'entei', stage: 3, maxStage: 3 },
  suicune: { family: 'suicune', stage: 3, maxStage: 3 },

  // Gen 3+
  treecko: { family: 'treecko', stage: 1, maxStage: 3 },
  grovyle: { family: 'treecko', stage: 2, maxStage: 3 },
  sceptile: { family: 'treecko', stage: 3, maxStage: 3 },
  torchic: { family: 'torchic', stage: 1, maxStage: 3 },
  combusken: { family: 'torchic', stage: 2, maxStage: 3 },
  blaziken: { family: 'torchic', stage: 3, maxStage: 3 },
  mudkip: { family: 'mudkip', stage: 1, maxStage: 3 },
  marshtomp: { family: 'mudkip', stage: 2, maxStage: 3 },
  swampert: { family: 'mudkip', stage: 3, maxStage: 3 },
  ralts: { family: 'ralts', stage: 1, maxStage: 3 },
  kirlia: { family: 'ralts', stage: 2, maxStage: 3 },
  gardevoir: { family: 'ralts', stage: 3, maxStage: 3, evolvesWithItem: 'Piedra Alba' },
  gallade: { family: 'ralts', stage: 3, maxStage: 3, evolvesWithItem: 'Piedra Alba' },
  slakoth: { family: 'slakoth', stage: 1, maxStage: 3 },
  vigoroth: { family: 'slakoth', stage: 2, maxStage: 3 },
  slaking: { family: 'slakoth', stage: 3, maxStage: 3 },
  sableye: { family: 'sableye', stage: 3, maxStage: 3 },
  aron: { family: 'aron', stage: 1, maxStage: 3 },
  lairon: { family: 'aron', stage: 2, maxStage: 3 },
  aggron: { family: 'aron', stage: 3, maxStage: 3 },
  trapinch: { family: 'trapinch', stage: 1, maxStage: 3 },
  vibrava: { family: 'trapinch', stage: 2, maxStage: 3 },
  flygon: { family: 'trapinch', stage: 3, maxStage: 3 },
  swablu: { family: 'swablu', stage: 1, maxStage: 2 },
  altaria: { family: 'swablu', stage: 2, maxStage: 2 },
  shuppet: { family: 'shuppet', stage: 1, maxStage: 2 },
  banette: { family: 'shuppet', stage: 2, maxStage: 2 },
  absol: { family: 'absol', stage: 3, maxStage: 3 },
  spheal: { family: 'spheal', stage: 1, maxStage: 3 },
  sealeo: { family: 'spheal', stage: 2, maxStage: 3 },
  walrein: { family: 'spheal', stage: 3, maxStage: 3 },
  bagon: { family: 'bagon', stage: 1, maxStage: 3 },
  shelgon: { family: 'bagon', stage: 2, maxStage: 3 },
  salamence: { family: 'bagon', stage: 3, maxStage: 3 },
  turtwig: { family: 'turtwig', stage: 1, maxStage: 3 },
  grotle: { family: 'turtwig', stage: 2, maxStage: 3 },
  torterra: { family: 'turtwig', stage: 3, maxStage: 3 },
  chimchar: { family: 'chimchar', stage: 1, maxStage: 3 },
  monferno: { family: 'chimchar', stage: 2, maxStage: 3 },
  infernape: { family: 'chimchar', stage: 3, maxStage: 3 },
  piplup: { family: 'piplup', stage: 1, maxStage: 3 },
  prinplup: { family: 'piplup', stage: 2, maxStage: 3 },
  empoleon: { family: 'piplup', stage: 3, maxStage: 3 },
  shinx: { family: 'shinx', stage: 1, maxStage: 3 },
  luxio: { family: 'shinx', stage: 2, maxStage: 3 },
  luxray: { family: 'shinx', stage: 3, maxStage: 3 },
  drifloon: { family: 'drifloon', stage: 1, maxStage: 2 },
  drifblim: { family: 'drifloon', stage: 2, maxStage: 2 },
  riolu: { family: 'riolu', stage: 1, maxStage: 2, sleepHoursRequired: 150 },
  lucario: { family: 'riolu', stage: 2, maxStage: 2 },
  croagunk: { family: 'croagunk', stage: 1, maxStage: 2 },
  toxicroak: { family: 'croagunk', stage: 2, maxStage: 2 },
  snover: { family: 'snover', stage: 1, maxStage: 2 },
  abomasnow: { family: 'snover', stage: 2, maxStage: 2 },
  darkrai: { family: 'darkrai', stage: 3, maxStage: 3 },
  cresselia: { family: 'cresselia', stage: 3, maxStage: 3 },
  munna: { family: 'munna', stage: 1, maxStage: 2, evolvesWithItem: 'Piedra Lunar' },
  musharna: { family: 'munna', stage: 2, maxStage: 2 },
  dwebble: { family: 'dwebble', stage: 1, maxStage: 2 },
  crustle: { family: 'dwebble', stage: 2, maxStage: 2 },
  foongus: { family: 'foongus', stage: 1, maxStage: 2 },
  amoonguss: { family: 'foongus', stage: 2, maxStage: 2 },
  rufflet: { family: 'rufflet', stage: 1, maxStage: 2 },
  braviary: { family: 'rufflet', stage: 2, maxStage: 2 },
  noibat: { family: 'noibat', stage: 1, maxStage: 2 },
  noivern: { family: 'noibat', stage: 2, maxStage: 2 },
  cutiefly: { family: 'cutiefly', stage: 1, maxStage: 2 },
  ribombee: { family: 'cutiefly', stage: 2, maxStage: 2 },
  grubbin: { family: 'grubbin', stage: 1, maxStage: 3 },
  charjabug: { family: 'grubbin', stage: 2, maxStage: 3, evolvesWithItem: 'Piedra Trueno' },
  vikavolt: { family: 'grubbin', stage: 3, maxStage: 3 },
  stufful: { family: 'stufful', stage: 1, maxStage: 2 },
  bewear: { family: 'stufful', stage: 2, maxStage: 2 },
  pumpkaboo: { family: 'pumpkaboo', stage: 1, maxStage: 2, evolvesWithItem: 'Cordón Unión' },
  gourgeist: { family: 'pumpkaboo', stage: 2, maxStage: 2 },
  sprigatito: { family: 'sprigatito', stage: 1, maxStage: 3 },
  floragato: { family: 'sprigatito', stage: 2, maxStage: 3 },
  meowscarada: { family: 'sprigatito', stage: 3, maxStage: 3 },
  fuecoco: { family: 'fuecoco', stage: 1, maxStage: 3 },
  crocalor: { family: 'fuecoco', stage: 2, maxStage: 3 },
  skeledirge: { family: 'fuecoco', stage: 3, maxStage: 3 },
  quaxly: { family: 'quaxly', stage: 1, maxStage: 3 },
  quaxwell: { family: 'quaxly', stage: 2, maxStage: 3 },
  quaquaval: { family: 'quaxly', stage: 3, maxStage: 3 },
  pawmi: { family: 'pawmi', stage: 1, maxStage: 3 },
  pawmo: { family: 'pawmi', stage: 2, maxStage: 3 },
  pawmot: { family: 'pawmi', stage: 3, maxStage: 3 },
  tinkatink: { family: 'tinkatink', stage: 1, maxStage: 3 },
  tinkatuff: { family: 'tinkatink', stage: 2, maxStage: 3 },
  tinkaton: { family: 'tinkatink', stage: 3, maxStage: 3 }
};

export function getSpeciesMeta(name: string): EvolutionMeta {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  return SPECIES_META[clean] || { family: clean, stage: 2, maxStage: 2 };
}

export function getPokemonFamilyKey(name: string): string {
  return getSpeciesMeta(name).family;
}

/**
 * Estimate candies required to level up in Pokémon Sleep from fromLevel to toLevel.
 * Calibrated against official Pokémon Sleep exp curve.
 */
export function estimateLevelUpCandies(fromLevel: number, toLevel: number): number {
  if (!fromLevel || !toLevel || toLevel <= fromLevel) return 0;
  let candies = 0;
  for (let lvl = fromLevel; lvl < toLevel; lvl++) {
    if (lvl < 10) candies += 2;
    else if (lvl < 20) candies += 3;
    else if (lvl < 30) candies += 5;
    else if (lvl < 40) candies += 7;
    else candies += 10;
  }
  return candies;
}

export interface EvolutionCostResult {
  candies: number;
  item?: string;
  sleepHours?: number;
}

/**
 * Estimate evolution candy, item and sleep requirements in Pokémon Sleep
 */
export function estimateEvolutionCost(
  fromSpeciesName: string,
  toSpeciesName: string,
  fromStage: number,
  toStage: number
): EvolutionCostResult {
  if (toStage <= fromStage) {
    return { candies: 0 };
  }

  const fromClean = fromSpeciesName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const toClean = toSpeciesName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  const fromMeta = getSpeciesMeta(fromSpeciesName);
  const toMeta = getSpeciesMeta(toSpeciesName);

  let candies = 0;
  const item: string | undefined = fromMeta.evolvesWithItem || toMeta.evolvesWithItem;
  const sleepHours: number | undefined = fromMeta.sleepHoursRequired;

  // Baby stages
  const isBaby = fromMeta.sleepHoursRequired !== undefined ||
    ['pichu', 'cleffa', 'igglybuff', 'togepi', 'wynaut', 'bonsly', 'mimejr', 'happiny', 'riolu'].includes(fromClean);

  // Pseudo-legendaries
  const isPseudo = ['dratini', 'dragonair', 'dragonite', 'larvitar', 'pupitar', 'tyranitar', 'bagon', 'shelgon', 'salamence'].includes(fromClean);

  // 2-stage expensive evolutions (80 candies like Swablu->Altaria, Noibat->Noivern, Magikarp->Gyarados)
  const isExpensiveTwoStage = ['swablu', 'noibat', 'magikarp', 'onix'].includes(fromClean);

  if (fromStage === 1 && toStage === 2) {
    if (isBaby) {
      candies = 20;
    } else if (isExpensiveTwoStage) {
      candies = 80;
    } else {
      candies = 40;
    }
  } else if (fromStage === 2 && toStage === 3) {
    if (isPseudo) {
      candies = 100;
    } else {
      candies = 80;
    }
  } else if (fromStage === 1 && toStage === 3) {
    const s1To2 = isBaby ? 20 : 40;
    const s2To3 = isPseudo ? 100 : 80;
    candies = s1To2 + s2To3;
  } else {
    candies = 40;
  }

  return { candies, item, sleepHours };
}

/**
 * Find canonical species name in SPECIES_META for a family and stage
 */
export function getSpeciesNameByFamilyAndStage(family: string, stage: number): string | null {
  const famClean = family.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
  for (const [key, meta] of Object.entries(SPECIES_META)) {
    if (meta.family.toLowerCase().replace(/[^a-z0-9]/g, '') === famClean && meta.stage === stage) {
      const master = getSpeciesMasterData(key);
      if (master) return master.name;
      return key.charAt(0).toUpperCase() + key.slice(1);
    }
  }
  return null;
}

/**
 * Calculate evolution preview with multi-stage support (+5 carry limit and +1 skill level per stage)
 */
export function calculateMultiStageEvolutionPreview(
  pokemon: Pokemon,
  targetMaster: MasterSpecies,
  stageDiff: number = 1
) {
  const preview = calculateEvolutionPreview(pokemon, targetMaster);
  if (stageDiff > 1) {
    const extraStages = stageDiff - 1;
    preview.carryLimitAfter += extraStages * 5;
    preview.carryLimitDelta += extraStages * 5;
    preview.skillLevelAfter = Math.min(7, preview.skillLevelAfter + extraStages);
  }
  return preview;
}

// 2. Mapeo Oficial de Bayas a Zonas de Estudio de Pokémon Sleep (WikiDex)
export const BERRY_TO_ISLANDS: Record<string, string[]> = {
  'Baya Aranja': ['Playa Turquesa'],
  'Baya Meloc': ['Playa Turquesa'],
  'Baya Plama': ['Playa Turquesa'],
  'Baya Higog': ['Cueva Pardita'],
  'Baya Zanama': ['Cueva Pardita'],
  'Baya Zidra': ['Cueva Pardita'],
  'Baya Caquic': ['Tundra Nievenveo'],
  'Baya Safre': ['Tundra Nievenveo'],
  'Baya Wiki': ['Tundra Nievenveo'],
  'Baya Rudion': ['Lago Lapis'],
  'Baya Ango': ['Lago Lapis'],
  'Baya Zreza': ['Lago Lapis'],
  'Baya Uvav': ['Antigua Central Eléctrica Dorada'],
  'Baya Oram': ['Antigua Central Eléctrica Dorada'],
  'Baya Andano': ['Antigua Central Eléctrica Dorada'],
  'Baya Atania': ['Isla Verdegal', 'Cueva Pardita'],
  'Baya Ziuela': ['Isla Verdegal'],
  'Baya Rimoya': ['Isla Verdegal'],
  'Baya Drasi': ['Isla Verdegal'],
  'Baya Yache': ['Isla Verdegal']
};

// 3. Clasificación Oficial de Ingredientes por Vigor Base (WikiDex)
export function getIngredientTierInfo(ingName?: string): {
  tier: 'GOURMET' | 'HIGH' | 'STANDARD';
  bonusPts: number;
  vigor: number;
} {
  if (!ingName) return { tier: 'STANDARD', bonusPts: 0, vigor: 100 };
  const n = ingName.toLowerCase();

  // Tier Gourmet (162 a 342 vigor base, raros de desbloquear en Nv. 30)
  if (n.includes('cola')) return { tier: 'GOURMET', bonusPts: 15, vigor: 342 };
  if (n.includes('calabaza')) return { tier: 'GOURMET', bonusPts: 14, vigor: 250 };
  if (n.includes('puerro')) return { tier: 'GOURMET', bonusPts: 13, vigor: 185 };
  if (n.includes('seta')) return { tier: 'GOURMET', bonusPts: 12, vigor: 167 };
  if (n.includes('aguacate')) return { tier: 'GOURMET', bonusPts: 12, vigor: 162 };

  // Tier Alto Valor Culinario (115 a 153 vigor base, pilares de platos gigantes)
  if (n.includes('café') || n.includes('cafe')) return { tier: 'HIGH', bonusPts: 9, vigor: 153 };
  if (n.includes('cacao')) return { tier: 'HIGH', bonusPts: 9, vigor: 151 };
  if (n.includes('maíz') || n.includes('maiz')) return { tier: 'HIGH', bonusPts: 8, vigor: 140 };
  if (n.includes('hierba')) return { tier: 'HIGH', bonusPts: 7, vigor: 130 };
  if (n.includes('patata')) return { tier: 'HIGH', bonusPts: 8, vigor: 124 };
  if (n.includes('huevo')) return { tier: 'HIGH', bonusPts: 7, vigor: 115 };

  return { tier: 'STANDARD', bonusPts: 4, vigor: 105 };
}

// 4. Detector de Sinergia Culinaria Interna (Slot 1 + Slot 2 alimentan juntos recetas top de WikiDex)
export function evaluateInternalRecipeSynergy(ing1?: string, ing2?: string): { pts: number; recipeNote?: string } {
  if (!ing1 || !ing2) return { pts: 0 };
  const a = ing1.toLowerCase();
  const b = ing2.toLowerCase();
  if (a === b) return { pts: 0 }; // Ya se evalúa como Mono-ingrediente

  const has = (kw1: string, kw2: string) =>
    (a.includes(kw1) && b.includes(kw2)) || (a.includes(kw2) && b.includes(kw1));

  if (has('hierba', 'seta')) {
    return { pts: 6, recipeNote: 'Combo directo para "Udon al Curri Bote" (25,539 vigor base)' };
  }
  if (has('cola', 'hierba')) {
    return { pts: 7, recipeNote: 'Combo completo para "Curri de Cola a la Parrilla" (7,483 vigor)' };
  }
  if (has('leche', 'cacao')) {
    return { pts: 6, recipeNote: 'Dúo clave para "Petisú Clodsire" (20,885) y "Curri Comesueños" (9,010)' };
  }
  if (has('miel', 'tomate')) {
    return { pts: 5, recipeNote: 'Base dual para "Tortitas Cara Susto" (24,354 vigor)' };
  }
  if (has('huevo', 'hierba')) {
    return { pts: 4, recipeNote: 'Sinergia para "Curri de Habas Corpulencia" (3,372 vigor)' };
  }
  if (has('aceite', 'puerro')) {
    return { pts: 5, recipeNote: 'Base versátil de Puerros + Aceite para Ensaladas y Curris' };
  }
  if (has('jengibre', 'patata') || has('soja', 'patata')) {
    return { pts: 4, recipeNote: 'Dúo sólido de volumen para platos de puchero grande' };
  }
  return { pts: 0 };
}

// 5. Detector de Potencial con Semilla Habilidad Secundaria (S -> M)
export function detectSubskillSeedPotential(pokemon: Pokemon): { target?: string; bonusPts: number } {
  const subs = (pokemon.subskills || []).slice(0, 3);
  const allNames = new Set((pokemon.subskills || []).map(s => s?.name).filter(Boolean));
  const spec = pokemon.specialty;

  // Solo se puede mejorar de S a M si la versión M NO existe en ningún otro slot del Pokémon
  if ((spec === 'Ingredientes' || spec === 'Todo') && subs.some(s => s?.name === 'Más ingredientes S') && !allNames.has('Más ingredientes M')) {
    return { target: 'Más ingredientes S ➔ M (+18% ingr. extra)', bonusPts: 4 };
  }
  if ((spec === 'Habilidades' || spec === 'Todo') && subs.some(s => s?.name === 'Activación S') && !allNames.has('Activación M')) {
    return { target: 'Activación S ➔ M (+18% activación extra)', bonusPts: 4 };
  }
  if (subs.some(s => s?.name === 'Velocidad ayuda S') && !allNames.has('Velocidad ayuda M')) {
    return { target: 'Velocidad ayuda S ➔ M (-7% tiempo extra)', bonusPts: 3 };
  }
  return { bonusPts: 0 };
}

export function evaluateSinglePokemonGenetics(pokemon: Pokemon): {
  score: number;
  currentPowerScore: number;
  ceilingScore: number;
  pros: string[];
  cons: string[];
  isMonoIngredient: boolean;
  isHybridBerrySpecialist: boolean;
  mintCandidate: boolean;
  subskillSeedTarget?: string;
  recipeSynergyNote?: string;
} {
  let baseGeneticScore = 50;
  let ceilingBonus = 0;
  const pros: string[] = [];
  const cons: string[] = [];
  const spec = pokemon.specialty;
  const nat = pokemon.natureObj;
  const meta = getSpeciesMeta(pokemon.name);

  // Pesos de slots según cercanía al nivel actual del Pokémon
  const slotWeights = [
    pokemon.level >= 10 ? 1.0 : 0.95,
    pokemon.level >= 25 ? 1.0 : 0.85,
    pokemon.level >= 50 ? 1.0 : 0.60
  ];

  const getSubWeight = (subName: string): { weight: number; slot: number; isUnlocked: boolean } => {
    let totalWeight = 0;
    let foundSlot = -1;
    let isUnlocked = false;
    (pokemon.subskills || []).slice(0, 3).forEach((sub, idx) => {
      if (sub && sub.name === subName) {
        totalWeight += slotWeights[idx] ?? 0.5;
        foundSlot = idx === 0 ? 10 : idx === 1 ? 25 : 50;
        if (pokemon.level >= foundSlot || sub.enabled) isUnlocked = true;
      }
    });
    return { weight: totalWeight, slot: foundSlot, isUnlocked };
  };

  // 1. Subhabilidades Doradas Universales
  const bfs = getSubWeight('Busca bayas S');
  let isHybridBerrySpecialist = false;
  if (bfs.weight > 0) {
    const rawPts = spec === 'Bayas' || spec === 'Todo' ? 30 : 22;
    const pts = Math.round(rawPts * bfs.weight);
    baseGeneticScore += pts;
    ceilingBonus += rawPts - pts;
    if (spec !== 'Bayas' && spec !== 'Todo') {
      isHybridBerrySpecialist = true;
      pros.push(`🌟 Arquetipo Híbrido con "Busca bayas S" (Nv. ${bfs.slot}): duplica su producción de ${pokemon.berry} (+${pts} pts)`);
    } else {
      pros.push(`🌟 "Busca bayas S" (Nv. ${bfs.slot}): +1 baya extra en cada recolección (+${pts} pts)`);
    }
  }

  const helpingBonus = getSubWeight('Bonus ayuda');
  if (helpingBonus.weight > 0) {
    const pts = Math.round(22 * helpingBonus.weight);
    baseGeneticScore += pts;
    ceilingBonus += 22 - pts;
    pros.push(`🤝 "Bonus ayuda" (Nv. ${helpingBonus.slot}): acelera un 5% a todo tu equipo (+${pts} pts)`);
  }

  // 2. Velocidad de ayuda
  const hsm = getSubWeight('Velocidad ayuda M');
  if (hsm.weight > 0) {
    const pts = Math.round(15 * hsm.weight);
    baseGeneticScore += pts;
    ceilingBonus += 15 - pts;
    pros.push(`⚡ "Velocidad ayuda M" (Nv. ${hsm.slot}): -14% tiempo entre ayudas (+${pts} pts)`);
  }
  const hss = getSubWeight('Velocidad ayuda S');
  if (hss.weight > 0) {
    const pts = Math.round(8 * hss.weight);
    baseGeneticScore += pts;
    ceilingBonus += 8 - pts;
    pros.push(`⚡ "Velocidad ayuda S" (Nv. ${hss.slot}): -7% tiempo entre ayudas (+${pts} pts)`);
  }

  // 3. Evaluación por Especialidad y Sinergia de Ingredientes
  let isMonoIngredient = false;
  let mintCandidate = false;
  let recipeSynergyNote: string | undefined;

  const ing1 = pokemon.ingredients?.[0]?.name;
  const ing2 = pokemon.ingredients?.[1]?.name;
  if (ing1 && ing2 && ing1.toLowerCase().trim() === ing2.toLowerCase().trim()) {
    isMonoIngredient = true;
  }

  if (spec === 'Bayas') {
    if (nat?.speedMod && nat.speedMod < 1.0) {
      baseGeneticScore += 15;
      pros.push(`🔥 Naturaleza favorable en Rapidez de ayuda (+15 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      baseGeneticScore -= 18;
      cons.push(`❌ Naturaleza desfavorable que reduce Rapidez de ayuda (-18 pts)`);
      if (bfs.weight > 0 || hsm.weight > 0) mintCandidate = true;
    }

    if (nat?.ingMod && nat.ingMod < 1.0) {
      baseGeneticScore += 12;
      pros.push(`🍒 Naturaleza reduce ingredientes, forzando tiradas puras de bayas (+12 pts)`);
    } else if (nat?.ingMod && nat.ingMod > 1.0) {
      baseGeneticScore -= 11;
      cons.push(`⚠️ Naturaleza sube ingredientes, restando tiradas de bayas (-11 pts)`);
    }

    const ingM = getSubWeight('Más ingredientes M');
    if (ingM.weight > 0) {
      baseGeneticScore -= 8;
      cons.push(`⚠️ "Más ingredientes M": desvía tiradas hacia ingredientes (-8 pts)`);
    }

    // Sinergia secundaria de habilidad en Bayas
    const trigM = getSubWeight('Activación M');
    const trigS = getSubWeight('Activación S');
    if (trigM.weight > 0) baseGeneticScore += Math.round(5 * trigM.weight);
    else if (trigS.weight > 0) baseGeneticScore += Math.round(3 * trigS.weight);
  }

  else if (spec === 'Ingredientes') {
    if (nat?.ingMod && nat.ingMod > 1.0) {
      baseGeneticScore += 18;
      pros.push(`🥗 Naturaleza ideal: aumenta búsqueda de ingredientes (+18 pts)`);
    } else if (nat?.ingMod && nat.ingMod < 1.0) {
      baseGeneticScore -= 22;
      cons.push(`❌ Naturaleza sabotea directamente la búsqueda de ingredientes (-22 pts)`);
      if (hsm.weight > 0 || bfs.weight > 0) mintCandidate = true;
    }

    if (nat?.speedMod && nat.speedMod < 1.0) {
      baseGeneticScore += 14;
      pros.push(`⚡ Naturaleza rápida: acelera ciclos de recolección (+14 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      baseGeneticScore -= 11;
      cons.push(`⚠️ Naturaleza reduce velocidad de ayuda (-11 pts)`);
    }

    const ingM = getSubWeight('Más ingredientes M');
    if (ingM.weight > 0) {
      const pts = Math.round(20 * ingM.weight);
      baseGeneticScore += pts;
      ceilingBonus += 20 - pts;
      pros.push(`🍲 "Más ingredientes M" (Nv. ${ingM.slot}): +36% prob. de ingredientes (+${pts} pts)`);
    }
    const ingS = getSubWeight('Más ingredientes S');
    if (ingS.weight > 0) {
      const pts = Math.round(11 * ingS.weight);
      baseGeneticScore += pts;
      ceilingBonus += 11 - pts;
      pros.push(`🍲 "Más ingredientes S" (Nv. ${ingS.slot}): +18% prob. de ingredientes (+${pts} pts)`);
    }

    // Capacidad de Inventario
    const invL = getSubWeight('Inventario L');
    const invM = getSubWeight('Inventario M');
    const invS = getSubWeight('Inventario S');
    if (invL.weight > 0) {
      const pts = Math.round(8 * invL.weight);
      baseGeneticScore += pts;
      pros.push(`🎒 "Inventario L" (Nv. ${invL.slot}): +18 espacios para recolectar de noche (+${pts} pts)`);
    } else if (invM.weight > 0) {
      const pts = Math.round(5 * invM.weight);
      baseGeneticScore += pts;
      pros.push(`🎒 "Inventario M" (Nv. ${invM.slot}): +12 espacios de bolsillo (+${pts} pts)`);
    } else if (invS.weight > 0) {
      const pts = Math.round(3 * invS.weight);
      baseGeneticScore += pts;
      pros.push(`🎒 "Inventario S" (Nv. ${invS.slot}): +6 espacios de bolsillo (+${pts} pts)`);
    }

    // Valor secundario de Habilidad en Especialistas de Ingredientes (Carga Vigor / Imán Ingredientes)
    const trigM = getSubWeight('Activación M');
    const trigS = getSubWeight('Activación S');
    const lvlM = getSubWeight('Nivel habilidad M');
    if (trigM.weight > 0) {
      const pts = Math.round(7 * trigM.weight);
      baseGeneticScore += pts;
      pros.push(`✨ "Activación M" (Nv. ${trigM.slot}): disparos constantes de su habilidad (+${pts} pts)`);
    } else if (trigS.weight > 0) {
      const pts = Math.round(4 * trigS.weight);
      baseGeneticScore += pts;
      pros.push(`✨ "Activación S" (Nv. ${trigS.slot}): +18% activación de su habilidad (+${pts} pts)`);
    }
    if (lvlM.weight > 0) {
      const pts = Math.round(7 * lvlM.weight);
      baseGeneticScore += pts;
      pros.push(`🔼 "Nivel habilidad M" (Nv. ${lvlM.slot}): +2 niveles a su habilidad principal (+${pts} pts)`);
    }

    // EVALUACIÓN AVANZADA DE INGREDIENTES (Mono-Ingrediente vs Desbloqueo Gourmet Nv. 30 + Sinergia de Receta)
    const slot2Info = getIngredientTierInfo(ing2);
    const isSlot2Unlocked = pokemon.level >= 30 || Boolean(pokemon.ingredients?.[1]?.enabled);
    const slot2Count = pokemon.ingredients?.[1]?.count || 2;

    if (isMonoIngredient) {
      const monoPts = slot2Info.tier === 'GOURMET' ? 14 : slot2Info.tier === 'HIGH' ? 11 : 9;
      baseGeneticScore += monoPts;
      pros.push(`🎯 Especialista Mono-ingrediente (${ing1}): suministro 100% predecible (+${monoPts} pts)`);

      // Trifecta de oro: Mono-ingrediente + Velocidad alta + Gran Inventario para recolección nocturna sin desborde
      const hasSpeedUp = (nat?.speedMod && nat.speedMod < 1.0) || getSubWeight('Velocidad ayuda M').weight > 0 || getSubWeight('Velocidad ayuda S').weight > 0;
      const hasHighCarry = invL.weight > 0 || invM.weight > 0 || (pokemon.carryLimit || 0) >= 24;
      if (hasSpeedUp && hasHighCarry) {
        baseGeneticScore += 5;
        pros.push(`⚡ Trifecta de Farmeo: Mono-ingrediente + Velocidad alta + Inventario amplio para no saturarse de noche (+5 pts)`);
      }
    } else if (ing2) {
      if (slot2Info.tier === 'GOURMET') {
        const activeBonus = isSlot2Unlocked ? 3 : 0;
        const pts = slot2Info.bonusPts + activeBonus;
        baseGeneticScore += pts;
        if (!isSlot2Unlocked) ceilingBonus += 3;
        pros.push(
          `🍄 Desbloqueo Gourmet Nv. 30 (${ing2} ×${slot2Count}, ${slot2Info.vigor} vigor base)${
            isSlot2Unlocked ? ' ¡Activo en olla!' : ''
          } (+${pts} pts)`
        );
      } else if (slot2Info.tier === 'HIGH') {
        const activeBonus = isSlot2Unlocked ? 2 : 0;
        const pts = slot2Info.bonusPts + activeBonus;
        baseGeneticScore += pts;
        pros.push(
          `🥘 Ingrediente de Alto Valor en Nv. 30 (${ing2} ×${slot2Count})${
            isSlot2Unlocked ? ' activo' : ''
          } (+${pts} pts)`
        );
      }

      // Evaluar si Slot 1 + Slot 2 hacen combo directo en una receta top de WikiDex
      const synergy = evaluateInternalRecipeSynergy(ing1, ing2);
      if (synergy.pts > 0) {
        baseGeneticScore += synergy.pts;
        recipeSynergyNote = synergy.recipeNote;
        pros.push(`👨‍🍳 Sinergia Culinaria (${ing1} + ${ing2}): ${synergy.recipeNote} (+${synergy.pts} pts)`);
      }
    }
  }

  else if (spec === 'Habilidades' || spec === 'Todo') {
    if (spec === 'Todo') {
      baseGeneticScore += 15;
      pros.push(`🧬 Especialidad Singular "Todo": combina bono de Bayas (×2), Ingredientes y Habilidades (+15 pts)`);
    }

    const trigM = getSubWeight('Activación M');
    const trigS = getSubWeight('Activación S');
    const lvlL = getSubWeight('Nivel habilidad L');
    const lvlM = getSubWeight('Nivel habilidad M');
    const lvlS = getSubWeight('Nivel habilidad S');

    if (nat?.skillMod && nat.skillMod > 1.0) {
      baseGeneticScore += 18;
      pros.push(`✨ Naturaleza ideal: aumenta activación de habilidad principal (+18 pts)`);
    } else if (nat?.skillMod && nat.skillMod < 1.0) {
      if (isHybridBerrySpecialist) {
        baseGeneticScore -= 8;
        cons.push(`⚠️ Naturaleza reduce habilidad, pero compensa operando como Híbrido de Bayas (-8 pts)`);
      } else if (trigM.weight > 0 && (hsm.weight > 0 || lvlM.weight > 0)) {
        baseGeneticScore -= 10;
        mintCandidate = true;
        cons.push(`🌿 Naturaleza frena su habilidad (-10 pts), ¡pero es Candidato #1 a Menta Neutra por sus subhabilidades top!`);
      } else {
        baseGeneticScore -= 18;
        cons.push(`❌ Naturaleza penaliza directamente su activación de habilidad (-18 pts)`);
      }
    }

    if (nat?.speedMod && nat.speedMod < 1.0) {
      baseGeneticScore += 12;
      pros.push(`⚡ Naturaleza rápida: más ciclos de ayuda y activaciones por día (+12 pts)`);
    } else if (nat?.speedMod && nat.speedMod > 1.0) {
      baseGeneticScore -= 9;
      cons.push(`⚠️ Naturaleza lenta (-9 pts)`);
    }

    if (trigM.weight > 0) {
      const pts = Math.round(18 * trigM.weight);
      baseGeneticScore += pts;
      ceilingBonus += 18 - pts;
      pros.push(`🎯 "Activación M" (Nv. ${trigM.slot}): +36% prob. de habilidad (+${pts} pts)`);
    }
    if (trigS.weight > 0) {
      const pts = Math.round(10 * trigS.weight);
      baseGeneticScore += pts;
      ceilingBonus += 10 - pts;
      pros.push(`🎯 "Activación S" (Nv. ${trigS.slot}): +18% prob. de habilidad (+${pts} pts)`);
    }

    if (lvlL.weight > 0) {
      const pts = Math.round(22 * lvlL.weight);
      baseGeneticScore += pts;
      pros.push(`🔼 "Nivel habilidad L" (Nv. ${lvlL.slot}): +3 niveles gratis de habilidad (+${pts} pts)`);
    } else if (lvlM.weight > 0) {
      const pts = Math.round(16 * lvlM.weight);
      baseGeneticScore += pts;
      pros.push(`🔼 "Nivel habilidad M" (Nv. ${lvlM.slot}): +2 niveles gratis de habilidad (+${pts} pts)`);
    } else if (lvlS.weight > 0) {
      const pts = Math.round(9 * lvlS.weight);
      baseGeneticScore += pts;
      pros.push(`🔼 "Nivel habilidad S" (Nv. ${lvlS.slot}): +1 nivel de habilidad (+${pts} pts)`);
    }

    // Valorar desbloqueo de ingredientes Gourmet en Especialistas de Habilidades/Todo (ej. Cola Suave en Slowbro, Hierba en Mew)
    const slot2Info = getIngredientTierInfo(ing2);
    const isSlot2Unlocked = pokemon.level >= 30 || Boolean(pokemon.ingredients?.[1]?.enabled);
    if (slot2Info.tier === 'GOURMET') {
      const pts = isSlot2Unlocked ? 12 : 7;
      baseGeneticScore += pts;
      pros.push(
        `🍄 Ingrediente Gourmet en Nv. 30 (${ing2}, ${slot2Info.vigor} vigor)${
          isSlot2Unlocked ? ' ¡Ya desbloqueado!' : ''
        } (+${pts} pts)`
      );
    } else if (slot2Info.tier === 'HIGH' && isSlot2Unlocked) {
      baseGeneticScore += 5;
      pros.push(`🥘 Slot 2 de ingrediente activo (${ing2}) para apoyar en cocina (+5 pts)`);
    }
  }

  // 4. Bonos pasivos dorados para el campamento
  const expSleep = getSubWeight('Bonus EXP al dormir');
  if (expSleep.weight > 0) {
    baseGeneticScore += 6;
    pros.push(`📈 "Bonus EXP al dormir" (Nv. ${expSleep.slot}): +14% EXP a todo el equipo (+6 pts)`);
  }
  const expStudy = getSubWeight('Bonus EXP de estudio');
  const dreamShards = getSubWeight('Bonus fragmentos sueño');
  const energyRec = getSubWeight('Bonus recupera energía');
  if (expStudy.weight > 0 || dreamShards.weight > 0 || energyRec.weight > 0) {
    baseGeneticScore += 4;
    pros.push(`🌟 Subhabilidad dorada de soporte pasivo para el campamento (+4 pts)`);
  }

  if (nat?.energyMod && nat.energyMod < 1.0) {
    baseGeneticScore -= 4;
    cons.push(`💤 Naturaleza -Recuperar energía (-4 pts)`);
  } else if (nat?.energyMod && nat.energyMod > 1.0) {
    baseGeneticScore += 3;
    pros.push(`🔋 Naturaleza +Recuperar energía: sostiene su velocidad más horas (+3 pts)`);
  }

  // 5. Potencial de mejora con Semilla de Habilidad Secundaria
  const seedInfo = detectSubskillSeedPotential(pokemon);
  if (seedInfo.target) {
    baseGeneticScore += seedInfo.bonusPts;
    ceilingBonus += 5;
    pros.push(`🌱 Potencial de Semilla Subhabilidad: ${seedInfo.target} (+${seedInfo.bonusPts} pts)`);
  }

  // 6. Bono de Madurez Competitiva en Campo (Nivel 30+, Etapa Final, Velocidad <35m)
  let maturityBonus = 0;
  if (pokemon.level >= 30) maturityBonus += 5;
  else if (pokemon.level >= 25) maturityBonus += 3;
  if (meta.stage === meta.maxStage && pokemon.level >= 20) maturityBonus += 3;
  if (pokemon.frequencySeconds > 0 && pokemon.frequencySeconds <= 2100) maturityBonus += 3; // <= 35 min

  const finalGeneticScore = Math.min(100, Math.max(0, Math.round(baseGeneticScore + maturityBonus * 0.5)));

  // Cálculo de Poder Actual en Campo (Current Power Score: pondera nivel actual, PA y evolución)
  const levelFactor = Math.min(1.0, pokemon.level / 32);
  const stageFactor = meta.stage === meta.maxStage ? 1.0 : meta.stage === 2 ? 0.85 : 0.68;
  const rpBonus = Math.min(15, Math.round(((pokemon.rp || 400) / 1800) * 15));
  const currentPowerScore = Math.min(
    100,
    Math.max(15, Math.round(baseGeneticScore * (0.55 + 0.45 * levelFactor * stageFactor) + rpBonus))
  );

  // Cálculo de Techo Genético Nv. 50 (Ceiling Score: incluye slots por desbloquear y potencial de Menta/Semilla)
  const mintPotential = mintCandidate ? 10 : 0;
  const ceilingScore = Math.min(100, Math.max(finalGeneticScore, Math.round(baseGeneticScore + ceilingBonus + mintPotential + 6)));

  return {
    score: finalGeneticScore,
    currentPowerScore,
    ceilingScore,
    pros,
    cons,
    isMonoIngredient,
    isHybridBerrySpecialist,
    mintCandidate,
    subskillSeedTarget: seedInfo.target,
    recipeSynergyNote
  };
}

export function auditPokedexCollection(allPokemons: Pokemon[]): PokemonAuditResult[] {
  const rawEvaluations = allPokemons.map(pokemon => {
    const evalData = evaluateSinglePokemonGenetics(pokemon);
    return { pokemon, ...evalData };
  });

  const auditedList: PokemonAuditResult[] = rawEvaluations.map(item => {
      const {
        pokemon,
        score,
        currentPowerScore,
        ceilingScore,
        pros,
        cons,
        isMonoIngredient,
        isHybridBerrySpecialist,
        mintCandidate,
        subskillSeedTarget,
        recipeSynergyNote
      } = item;

      const meta = getSpeciesMeta(pokemon.name);
      const isShiny = /shiny|variocolor/i.test(pokemon.notes || '');
      const isSpecial = isSpecialPokemon(pokemon);
      const favoredIslands = BERRY_TO_ISLANDS[pokemon.berry] || ['Isla Verdegal'];

      // Un Pokémon consolidado (Nv. >= 26 con PA >= 850, o Nv. >= 28, o PA >= 1100) ya es un activo real en el equipo
      const isEstablishedPowerhouse =
        pokemon.level >= 28 ||
        (pokemon.rp || 0) >= 1100 ||
        (pokemon.level >= 25 && score >= 70);

      // Comparación inteligente entre hermanos de la misma familia evolutiva:
      // Un bebé de nivel bajo NUNCA invalida a un Pokémon ya evolucionado y entrenado de Nv. 25+
      const betterSibling = rawEvaluations.find(other => {
        if (other.pokemon.id === pokemon.id) return false;
        if (getSpeciesMeta(other.pokemon.name).family !== meta.family) return false;
        if (isEstablishedPowerhouse && other.pokemon.level < 20) return false;
        return (
          other.score >= score + 10 ||
          (other.score >= score + 4 && other.pokemon.level >= pokemon.level + 6)
        );
      });

      const sameBerryPeers = rawEvaluations.filter(
        other => other.pokemon.id !== pokemon.id && other.pokemon.berry === pokemon.berry
      );
      const isOnlyBerryProvider = sameBerryPeers.length === 0;

      // Asignación de Tier (S+ a D)
      let tier: PokedexTier = 'C';
      if (score >= 86) tier = 'S+';
      else if (score >= 75) tier = 'S';
      else if (score >= 64) tier = 'A';
      else if (score >= 52) tier = 'B';
      else if (score >= 40) tier = 'C';
      else tier = 'D';

      // Asignación inteligente de Veredicto y Recomendación Accionable
      let verdict: PokedexVerdict = 'UTIL_NICHO';
      let verdictLabel = '🛠️ Rotación Estratégica';
      let verdictBadgeColor = 'bg-sky-500/20 text-sky-200 border-sky-400/30';
      let recommendation = `Buen relevo para ${favoredIslands.join(' o ')} cuando Snorlax pida ${pokemon.berry}.`;

      // 1. Shinies y Singulares tienen máxima prioridad de veredicto
      if (isShiny || isSpecial) {
        verdict = 'TROFEO_CONSERVAR';
        verdictLabel = isShiny
          ? score >= 68
            ? '✨ Joya Shiny Competitiva'
            : '✨ Trofeo Shiny'
          : '🌟 Especial / Singular';
        verdictBadgeColor = 'bg-fuchsia-400/25 text-fuchsia-100 border-fuchsia-300/50';
        recommendation = isShiny
          ? score >= 68
            ? `¡Lotería genética! Es Variocolor y además tiene un Techo Nv. 50 de ${ceilingScore}/100 (Poder Hoy: ${currentPowerScore}/100). Excelente proyecto prioritario.`
            : 'Ejemplar Variocolor único de colección. Consérvalo siempre como trofeo.'
          : 'Pokémon Especial de evento limitado. Intocable en tu colección.';
      } else if (
        (score >= 72 && pokemon.level >= 20) ||
        (isEstablishedPowerhouse && score >= 64 && !betterSibling)
      ) {
        verdict = 'TITULAR_ELITE';
        verdictLabel = '👑 Titular Élite';
        verdictBadgeColor = 'bg-amber-400/25 text-amber-100 border-amber-300/50';
        recommendation = `Pilar indiscutible de tu equipo actual (Poder en Campo: ${currentPowerScore}/100). Ideal para dominar en ${favoredIslands.join(', ')}.`;
        if (mintCandidate) {
          recommendation += ` 🌿 Tip Pro: Si usas una Menta Neutra en él, alcanzará rango S+ (${ceilingScore} pts).`;
        } else if (subskillSeedTarget) {
          recommendation += ` 🌱 Candidato ideal para Semilla Habilidad Secundaria (${subskillSeedTarget}).`;
        }
      } else if (score >= 68 && pokemon.level < 20 && !betterSibling) {
        verdict = 'PROMESA_INVERTIR';
        verdictLabel = '💎 Promesa Top (Invertir)';
        verdictBadgeColor = 'bg-emerald-400/25 text-emerald-100 border-emerald-300/50';
        recommendation = `Prioridad #1 de caramelos (Techo Nv. 50: ${ceilingScore}/100).${
          meta.evolvesWithItem ? ` Requiere ${meta.evolvesWithItem} para evolucionar.` : ''
        }${
          meta.sleepHoursRequired ? ` Necesita ${meta.sleepHoursRequired}h de sueño compartido.` : ''
        }`;
      } else if (score < 46 || (betterSibling && score < 64 && !isEstablishedPowerhouse)) {
        if (isOnlyBerryProvider && pokemon.level >= 12) {
          verdict = 'UTIL_TEMPORAL';
          verdictLabel = '⚠️ Puente Temporal';
          verdictBadgeColor = 'bg-orange-400/20 text-orange-200 border-orange-400/30';
          recommendation = `Genética limitada, pero no lo transfieras aún: es tu único recolector actual de ${pokemon.berry} para ${favoredIslands.join(', ')}.`;
        } else {
          verdict = 'CAMBIAR_CARAMELOS';
          verdictLabel = '🍬 Enviar al Profesor';
          verdictBadgeColor = 'bg-rose-500/20 text-rose-200 border-rose-400/30';
          recommendation = betterSibling
            ? `Superado en tu caja por ${betterSibling.pokemon.name} (Nv. ${betterSibling.pokemon.level}, ${betterSibling.score} pts). Cámbialo por caramelos para impulsar al titular.`
            : 'Su naturaleza o subhabilidades contradicen su especialidad. Cámbialo por caramelos para futuros ejemplares.';
        }
      } else if (isOnlyBerryProvider) {
        verdict = 'UTIL_TEMPORAL';
        verdictLabel = '🛡️ Único de su Baya';
        verdictBadgeColor = 'bg-indigo-400/20 text-indigo-100 border-indigo-300/30';
        recommendation = `Único proveedor actual de ${pokemon.berry} en tu caja. Úsalo en ${favoredIslands.join(', ')} sin gastar semillas.`;
      }

      return {
        pokemon,
        geneticScore: score,
        currentPowerScore,
        ceilingScore,
        tier,
        verdict,
        verdictLabel,
        verdictBadgeColor,
        pros,
        cons,
        recommendation,
        betterDuplicateName: betterSibling?.pokemon.name,
        isMonoIngredient,
        isHybridBerrySpecialist,
        mintCandidate,
        subskillSeedTarget,
        favoredIslands,
        recipeSynergyNote
      };
    });

  // Agrupamiento y comparación directa entre ejemplares de la misma familia evolutiva
  const familyGroups = new Map<string, PokemonAuditResult[]>();
  for (const item of auditedList) {
    const familyKey = getPokemonFamilyKey(item.pokemon.name);
    if (!familyGroups.has(familyKey)) {
      familyGroups.set(familyKey, []);
    }
    familyGroups.get(familyKey)!.push(item);
  }

  for (const [familyKey, group] of familyGroups.entries()) {
    if (group.length > 1) {
      // Ordenamiento inicial dentro de la familia:
      // Prioridad: 1. geneticScore desc, 2. ceilingScore desc, 3. currentPowerScore desc, 4. level desc
      group.sort((a, b) => {
        if (b.geneticScore !== a.geneticScore) return b.geneticScore - a.geneticScore;
        if (b.ceilingScore !== a.ceilingScore) return b.ceilingScore - a.ceilingScore;
        if (b.currentPowerScore !== a.currentPowerScore) return b.currentPowerScore - a.currentPowerScore;
        return (b.pokemon.level || 0) - (a.pokemon.level || 0);
      });

      const best = group[0];
      const secondBest = group[1];
      const winnerReason = generateWinnerReason(best, secondBest);

      // 1. Encontrar el estadio evolutivo más alto presente en la caja para esta familia
      let maxStageInGroup = 1;
      for (const m of group) {
        const meta = getSpeciesMeta(m.pokemon.name);
        if (meta.stage > maxStageInGroup) {
          maxStageInGroup = meta.stage;
        }
      }

      const canAnyEvolve = group.some(m => getSpeciesMeta(m.pokemon.name).maxStage > 1);
      const targetStage = maxStageInGroup > 1 ? maxStageInGroup : (canAnyEvolve ? 2 : 1);

      // 2. Identificar al Titular Activo (Incumbent):
      const membersAtMaxStage = group.filter(m => getSpeciesMeta(m.pokemon.name).stage === maxStageInGroup);
      membersAtMaxStage.sort((a, b) => {
        if ((b.pokemon.level || 0) !== (a.pokemon.level || 0)) {
          return (b.pokemon.level || 0) - (a.pokemon.level || 0);
        }
        return b.geneticScore - a.geneticScore;
      });
      const incumbent = membersAtMaxStage[0];
      const hasRealIncumbent = maxStageInGroup > 1;

      // 3. Determinar especie objetivo para normalizar proyecciones
      let targetSpeciesName = hasRealIncumbent ? incumbent.pokemon.name : '';
      if (!targetSpeciesName) {
        const nameFromMeta = getSpeciesNameByFamilyAndStage(familyKey, targetStage);
        if (nameFromMeta) {
          targetSpeciesName = nameFromMeta;
        } else {
          const firstEvol = SLEEP_EVOLUTION_MAP[group[0].pokemon.name];
          targetSpeciesName = (firstEvol && firstEvol.length > 0) ? firstEvol[0] : group[0].pokemon.name;
        }
      }
      const targetMaster = getSpeciesMasterData(targetSpeciesName);

      // Estadísticas de referencia del titular
      const incumbentMaster = getSpeciesMasterData(incumbent.pokemon.name);
      const incumbentFreqSec = incumbent.pokemon.frequencySeconds || (incumbentMaster ? incumbentMaster.baseFrequency : 3000);
      let incumbentCarry = incumbent.pokemon.carryLimit || (incumbentMaster ? incumbentMaster.carryLimit : 15);
      if (!incumbent.pokemon.carryLimit && incumbent.pokemon.subskills) {
        for (const sub of incumbent.pokemon.subskills) {
          if (!sub.enabled) continue;
          if (sub.name === 'Inventario S') incumbentCarry += 6;
          if (sub.name === 'Inventario M') incumbentCarry += 12;
          if (sub.name === 'Inventario L') incumbentCarry += 18;
        }
      }

      const peers: SpeciesPeerComparison[] = group.map((member, idx) => {
        const nat = NATURES[member.pokemon.nature || ''];
        const natureEffect = nat
          ? (nat.upStat && nat.downStat ? `+${nat.upStat} / -${nat.downStat}` : 'Neutra (sin penalizaciones)')
          : 'Neutra';

        const ingSummary = member.pokemon.ingredients && member.pokemon.ingredients.length > 0
          ? member.pokemon.ingredients.map(i => `${i.name}${i.count ? ` x${i.count}` : ''}`).join(', ')
          : 'Ingredientes no asignados';

        const subskillsSummary = member.pokemon.subskills && member.pokemon.subskills.length > 0
          ? member.pokemon.subskills.map(s => `${s.name}${s.unlockLevel ? ` (Nv.${s.unlockLevel})` : ''}`)
          : [];

        const memberMeta = getSpeciesMeta(member.pokemon.name);
        const memberStage = memberMeta.stage;
        const isThisIncumbent = hasRealIncumbent && member.pokemon.id === incumbent.pokemon.id;

        // Proyección evolutiva si está por debajo del estadio objetivo
        let projectedEvolution: EvolutionProjectedStats | undefined = undefined;
        if (memberStage < targetStage && targetMaster) {
          const stageDiff = targetStage - memberStage;
          try {
            const preview = calculateMultiStageEvolutionPreview(member.pokemon, targetMaster, stageDiff);
            const speedAdvantageVsIncumbentPercent = incumbentFreqSec > 0
              ? Math.round(((incumbentFreqSec - preview.frequencySecondsAfter) / incumbentFreqSec) * 100)
              : 0;
            const carryAdvantageVsIncumbent = preview.carryLimitAfter - incumbentCarry;

            projectedEvolution = {
              targetSpeciesName,
              targetStage,
              frequencyStr: preview.frequencyStrAfter,
              frequencySeconds: preview.frequencySecondsAfter,
              carryLimit: preview.carryLimitAfter,
              speedGainPercent: preview.speedGainPercent,
              speedAdvantageVsIncumbentPercent: hasRealIncumbent ? speedAdvantageVsIncumbentPercent : undefined,
              carryAdvantageVsIncumbent: hasRealIncumbent ? carryAdvantageVsIncumbent : undefined
            };
          } catch (e) {
            console.error('Error calculando proyección evolutiva:', e);
          }
        }

        // Estimación de costo en caramelos y fragmentos
        let investmentCost: InvestmentCostEstimate | undefined = undefined;
        if (isThisIncumbent) {
          investmentCost = {
            evolutionCandies: 0,
            levelCatchUpCandies: 0,
            totalCandies: 0,
            estimatedDreamShards: 0
          };
        } else {
          const evolCost = estimateEvolutionCost(member.pokemon.name, targetSpeciesName, memberStage, targetStage);
          const levelCatchUp = hasRealIncumbent
            ? estimateLevelUpCandies(member.pokemon.level, incumbent.pokemon.level)
            : 0;
          const totalCandies = evolCost.candies + levelCatchUp;
          const dreamShards = Math.round(totalCandies * 45 + ((targetStage - memberStage) * 1500));

          investmentCost = {
            evolutionCandies: evolCost.candies,
            levelCatchUpCandies: levelCatchUp,
            totalCandies,
            estimatedDreamShards: dreamShards,
            evolutionItem: evolCost.item,
            sleepHoursNeeded: evolCost.sleepHours
          };
        }

        // Análisis de Retorno de Inversión (ROI)
        let roiAnalysis: RoiAnalysisResult;

        if (isThisIncumbent) {
          const helpingBonusActive = member.pokemon.subskills?.some(
            s => s.name === 'Bonus ayuda' && ((member.pokemon.level >= (s.unlockLevel || 10)) || s.enabled)
          );
          const bonusStr = helpingBonusActive ? ' con Bono Ayuda activo (+5% vel equipo)' : '';
          roiAnalysis = {
            verdict: 'INCUMBENT',
            badgeLabel: '👑 Titular Activo (En Servicio)',
            badgeColor: 'bg-amber-400/20 text-amber-200 border-amber-300/40',
            badgeIcon: '👑',
            advice: `Consolidado a Nv. ${member.pokemon.level} (${member.pokemon.frequencyStr || formatFrequencySeconds(incumbentFreqSec)}, ${incumbentCarry} slots)${bonusStr}. Inversión ya amortizada (0 caramelos requeridos). Tu referencia activa.`
          };
        } else if (hasRealIncumbent) {
          const speedAdv = projectedEvolution?.speedAdvantageVsIncumbentPercent || 0;
          const carryAdv = projectedEvolution?.carryAdvantageVsIncumbent || 0;
          const totalCandies = investmentCost.totalCandies;

          const isSpeedSignificantlyBetter = speedAdv >= 5;
          const isCarrySignificantlyBetter = carryAdv >= 8;
          const isMonoSuperior = member.isMonoIngredient && !incumbent.isMonoIngredient;
          const hasBfsUpgrade = (member.pokemon.subskills || []).some(s => s.name === 'Busca bayas S') &&
            !(incumbent.pokemon.subskills || []).some(s => s.name === 'Busca bayas S');

          if ((isSpeedSignificantlyBetter || isCarrySignificantlyBetter || isMonoSuperior || hasBfsUpgrade) && member.geneticScore >= 55) {
            const perks: string[] = [];
            if (isSpeedSignificantlyBetter) perks.push(`+${speedAdv}% vel (${projectedEvolution?.frequencyStr})`);
            if (isCarrySignificantlyBetter) perks.push(`+${carryAdv} slots (${projectedEvolution?.carryLimit} total)`);
            if (isMonoSuperior) perks.push('mono-ingrediente puro');
            if (hasBfsUpgrade) perks.push('Busca bayas S');

            roiAnalysis = {
              verdict: 'HIGH_ROI',
              badgeLabel: '🚀 Inversión Muy Rentable (Reemplazo)',
              badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
              badgeIcon: '🚀',
              advice: `Como ${targetSpeciesName} superará al titular (${perks.join(', ')}). Vale totalmente la pena invertir los ~${totalCandies} caramelos como proyecto prioritario.`
            };
          } else if (member.geneticScore < 48 || speedAdv < -6) {
            roiAnalysis = {
              verdict: 'LOW_ROI',
              badgeLabel: '🛑 No Invertir (Descartable)',
              badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
              badgeIcon: '🛑',
              advice: `Rendimiento proyectado notablemente inferior a tu titular en velocidad o genética. Mejor enviarlo al Profesor para obtener caramelos y financiar al titular.`
            };
          } else {
            const diffStr = speedAdv >= 0 ? `+${speedAdv}% velocidad` : `${speedAdv}% velocidad`;
            roiAnalysis = {
              verdict: 'MARGINAL_ROI',
              badgeLabel: '⚖️ Inversión Marginal (No Prioritaria)',
              badgeColor: 'bg-amber-500/20 text-amber-200 border-amber-400/40',
              badgeIcon: '⚖️',
              advice: `La mejora proyectada (${diffStr}${carryAdv !== 0 ? `, ${carryAdv > 0 ? '+' : ''}${carryAdv} slots` : ''}) es modesta y no compensa el gasto de ~${totalCandies} caramelos cuando tu ${incumbent.pokemon.name} ya está activo. Conservar de reserva o enviar por caramelos.`
            };
          }
        } else {
          // No hay titular evolucionado aún en la caja (ej. 3 Charmanders)
          if (idx === 0) {
            roiAnalysis = {
              verdict: 'HIGH_ROI',
              badgeLabel: '💎 Mejor Candidato para Evolucionar',
              badgeColor: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40',
              badgeIcon: '💎',
              advice: `El ejemplar con mayor potencial de la familia. Prioridad #1 para invertir los ~${investmentCost.evolutionCandies} caramelos y evolucionar a ${targetSpeciesName}.`
            };
          } else if (member.geneticScore >= best.geneticScore - 5) {
            roiAnalysis = {
              verdict: 'MARGINAL_ROI',
              badgeLabel: '🥈 Alternativa Secundaria',
              badgeColor: 'bg-slate-400/20 text-slate-200 border-slate-300/40',
              badgeIcon: '🥈',
              advice: `Buen ejemplar de reserva para otra receta, pero prioriza tus caramelos en ${best.pokemon.name} (#1).`
            };
          } else {
            roiAnalysis = {
              verdict: 'LOW_ROI',
              badgeLabel: '🛑 Descartable (Caramelos)',
              badgeColor: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
              badgeIcon: '🛑',
              advice: `Superado por el ejemplar #1. Conviértelo en caramelos para financiar la evolución de tu mejor ${best.pokemon.name}.`
            };
          }
        }

        return {
          id: member.pokemon.id,
          name: member.pokemon.name,
          level: member.pokemon.level,
          rp: member.pokemon.rp,
          geneticScore: member.geneticScore,
          currentPowerScore: member.currentPowerScore,
          ceilingScore: member.ceilingScore,
          tier: member.tier,
          verdict: member.verdict,
          verdictLabel: member.verdictLabel,
          isMonoIngredient: member.isMonoIngredient,
          ingredientSummary: ingSummary,
          subskillsSummary,
          natureName: member.pokemon.nature || 'Neutra',
          natureEffect,
          isCurrent: false,
          speciesRank: idx + 1,
          isWinner: idx === 0,
          evolutionStage: memberStage,
          isIncumbent: isThisIncumbent,
          projectedEvolution,
          investmentCost,
          roiAnalysis
        };
      });

      const familySummary: FamilyComparisonSummary = {
        familyId: familyKey,
        familyName: formatFamilyName(familyKey),
        totalMembers: group.length,
        bestMemberId: best.pokemon.id,
        bestMemberName: best.pokemon.name,
        winnerReason,
        hasRealIncumbent,
        incumbentName: incumbent.pokemon.name,
        incumbentLevel: incumbent.pokemon.level,
        targetStageName: targetSpeciesName,
        peers
      };

      group.forEach((member, idx) => {
        member.speciesRank = idx + 1;
        member.speciesTotal = group.length;
        member.isSpeciesBest = idx === 0;
        member.familyComparison = familySummary;
      });
    } else if (group.length === 1) {
      group[0].speciesRank = 1;
      group[0].speciesTotal = 1;
      group[0].isSpeciesBest = true;
    }
  }

  return auditedList.sort((a, b) => b.geneticScore - a.geneticScore || b.currentPowerScore - a.currentPowerScore);
}

export function formatFamilyName(familyId: string): string {
  if (!familyId) return 'Pokémon';
  return familyId.charAt(0).toUpperCase() + familyId.slice(1);
}

function generateWinnerReason(best: PokemonAuditResult, secondBest?: PokemonAuditResult): string {
  const reasons: string[] = [];
  if (best.isMonoIngredient) {
    reasons.push('distribución Mono-Ingrediente pura');
  }
  const topSubskills = (best.pokemon.subskills || [])
    .filter((s) =>
      ['Ayuda adicional', 'Buscador de bayas S', 'Buscador de ingredientes M', 'Rapidez de ayuda M'].some(
        good => s.name.toLowerCase().includes(good.toLowerCase())
      )
    )
    .map((s) => s.name);
  if (topSubskills.length > 0) {
    reasons.push(`subhabilidades clave (${topSubskills.slice(0, 2).join(', ')})`);
  }
  const nat = NATURES[best.pokemon.nature || ''];
  if (nat?.upStat) {
    reasons.push(`bono de naturaleza (+${nat.upStat.split(' ')[0]})`);
  }
  if (secondBest && best.geneticScore > secondBest.geneticScore) {
    reasons.push(`mayor potencial genético (${best.geneticScore} pts vs ${secondBest.geneticScore} pts)`);
  } else if (best.ceilingScore) {
    reasons.push(`techo proyectado a Nv. 50 de ${best.ceilingScore} pts`);
  }

  if (reasons.length === 0) {
    return `Lidera la familia con mejor balance genético global (${best.geneticScore} pts).`;
  }
  return `Lidera la familia por ${reasons.join(', ')}.`;
}

export function evaluatePokemonWithCollection(
  candidate: Pokemon,
  collection: Pokemon[]
): PokemonAuditResult {
  const collectionWithoutCandidate = collection.filter(p => p.id !== candidate.id);
  const fullList = [...collectionWithoutCandidate, candidate];
  const auditedList = auditPokedexCollection(fullList);
  const found = auditedList.find(r => r.pokemon.id === candidate.id);

  if (found) {
    if (found.familyComparison) {
      found.familyComparison = {
        ...found.familyComparison,
        peers: found.familyComparison.peers.map(p => ({
          ...p,
          isCurrent: p.id === candidate.id
        }))
      };
    }
    return found;
  }

  // Fallback
  const single = evaluateSinglePokemonGenetics(candidate);
  const tier: PokedexTier =
    single.score >= 86 ? 'S+' :
    single.score >= 75 ? 'S' :
    single.score >= 64 ? 'A' :
    single.score >= 52 ? 'B' :
    single.score >= 40 ? 'C' : 'D';

  return {
    pokemon: candidate,
    geneticScore: single.score,
    currentPowerScore: single.currentPowerScore,
    ceilingScore: single.ceilingScore,
    tier,
    verdict: 'UTIL_NICHO',
    verdictLabel: '🛠️ Rotación Estratégica',
    verdictBadgeColor: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
    pros: single.pros,
    cons: single.cons,
    recommendation: 'Evaluación rápida sin contexto de caja.',
    speciesRank: 1,
    speciesTotal: 1,
    isSpeciesBest: true
  };
}
